// 日签图弹层「保存 / 分享」两个按钮的落地校验（不构建、不开浏览器）：
// 2026-09-25 用户实机反馈「日签图点击保存和分享按钮都没有反应」（H5：#/pages/app/checkin/diary/diary）。
// 两条成因都在这里钉住，禁止再退回静默分支：
//   ① H5 端没有 uni.saveImageToPhotosAlbum —— uni-h5 把它列在 platforms/h5/helpers/todo-api.js，
//      core/runtime/index.js 据此把同名 protocol 置 false，wrapper.js 走到「暂不支持的 api」分支，
//      调用只剩一句 console.error，既不回 success 也不回 fail ⇒ 点了没反应。
//      现在 H5 一律先把日签图放大预览（长按是这一端每个内核都给的保存入口，2026-09-26 用户口径），
//      能下载的内核（非微信、非 iOS）在下发预览之后再多下一次，两条路各有结果提示。
//      2026-09-27 用户第二次点名（先是证书弹层、再是这里）：**点「保存」不许往服务器上传**——
//      原先「微信内/iOS 先把 base64 走 common/upload 落成 http 图再预览」那一段已从 poster-save 删净，
//      下面钉的是「任何内核都不发上传请求」，代价（那两端长按 data: 图可能不弹「保存图片」）记在 util 文件头。
//   ② 「分享」原先等 shareInfo 接口回来才写剪贴板 —— H5 的 setClipboardData 是 document.execCommand('copy')，
//      脱离用户手势后 iOS / 微信里返回 false，success 不回调、又没有 fail ⇒ 同样没反应。
//      现在链接在打开弹层时就预取缓存，点击时同步复制；缓存为空要说清为什么（M13）。
//   ③ 分享按端分路（2026-09-25 用户定口径：小程序触发分享 API，H5 提示右上角分享）：小程序调
//      wx.showShareImageMenu 分享这张日签图本体，微信内浏览器提示点右上角「···」，
//      复制链接只留给看不到右上角的端（H5 普通浏览器 / App），见下面「组件：分享」一节。
//   ④ 2026-09-26 用户改弹层版式（居中悬浮卡片 → 底部 Popup：海报在上、选样式与保存/分享在下），
//      并要求海报右下角带上这一页的码（H5 二维码 / 小程序端小程序码）、头像昵称收小、下面放打卡名称。
//      这一版钉的是：预览与画布两份镜像的几何（用户区 84 高、码 64、头像 26）、码按端取值与
//      取失败要有出口（M13，不留一张少了码却不说明的海报）、底图（后台 share_bgs）与自带渐变的回落、
//      以及外域图把出图路卡住时的降级顺序（先丢头像、再丢底图）。
// 用法：node tuzi-mobile/scripts/check-daily-save-share.js   （exit 0 = 全部符合预期）
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../src');
// 2026-09-26 全局分享弹窗改成与日签图同一套架构后，原来那一只 checkin-daily-card.vue 拆成三层：
//   SHELL 弹层壳（底部 Popup + 样式条 + 保存/分享 + 取码 + 各端出图落法）
//   BODY  海报本体（预览排版 + 屏幕外画布，daily / content 两档版式）
//   CARD  打卡适配层（只管金句库轮播与码的落点，对外 props/emits 一字未改）
// 样式数值再往下沉一层：THEME = common/utils/poster-theme（两档海报共用一份弥散渐变表）
const SHELL = path.join(SRC, 'components/tz/share-poster.vue');
const BODY = path.join(SRC, 'components/tz/share-poster-body.vue');
const CARD = path.join(SRC, 'components/tz/checkin-daily-card.vue');
const RECOMMEND = path.join(SRC, 'components/tz/recommend-modal.vue');
const DIARY = path.join(SRC, 'pages/app/checkin/diary/js.vue');

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + ' -> ' + got);
};

/**
 * 模拟 uni 的条件编译：只认 // #ifdef / #ifndef + 紧跟的 #endif（本模块没有嵌套）
 * @param {String} code 源码
 * @param {Boolean} isH5 当前编译目标是 H5
 */
function conditional(code, isH5) {
  const out = [];
  let skip = false;
  code.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*\/\/\s*#(ifdef|ifndef)\s+(\w+)/);
    if (m && !skip) {
      const wantH5 = m[2] === 'H5';
      const keep = m[1] === 'ifdef' ? isH5 === wantH5 : isH5 !== wantH5;
      skip = !keep;
      return;
    }
    if (/^\s*\/\/\s*#endif/.test(line)) {
      skip = false;
      return;
    }
    if (!skip) out.push(line);
  });
  return out.join('\n');
}

/**
 * 读进一只 src/common/utils/*.js：端判断与提示文案都收在 util 里，把它 stub 成空函数等于没测
 * （longPressOnly 被 stub 后返回 {} → 「能不能直接下载」这条分路永远为真，断言就白写了）。
 * 与 SFC 同一手法：按平台条件编译后剥掉 export，包成 CommonJS。
 */
function loadUtil(rel, isH5, globals) {
  const file = /\.js$/.test(rel) ? rel : rel + '.js';
  let s = fs.readFileSync(path.join(SRC, file), 'utf8');
  s = conditional(s, isH5);
  const names = [];
  // class 也认（poster-render.js 的 `export class PosterCanvas`）——漏了这一支，整份 util 载不进来：
  // 剥掉 export 之后的 `class PosterCanvas {...}` 本来就是合法声明，缺的只是把名字登记上去
  s = s.replace(/^export\s+(function|const|class)\s+([A-Za-z0-9_$]+)/gm, (m0, kw, nm) => { names.push(nm); return kw + ' ' + nm; });
  // 也认「export { a, b };」这种文件末尾集中导出的写法（checkin-share.js 就是这一份）
  s = s.replace(/^export\s*\{([^}]*)\}\s*;?\s*$/gm, (m0, list) => {
    list.split(',').forEach((nm) => { const t = nm.trim(); if (t) names.push(t); });
    return '';
  });
  // 文件末尾再挂一份 default 导出（对象字面量），对断言没用，整行丢掉
  s = s.replace(/^export\s+default\s+[^\n]*$/gm, '');
  // util 自己再 import 的东西（tools 那类）这里不递归展开：断言不经过那条路，stub 成空对象即可
  s = s.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m0, list) =>
    'const ' + list.split(',').map((x) => x.trim()).filter(Boolean).map((x) => x + ' = () => ({})').join(', ') + ';');
  s = s.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = {};');
  s += '\nreturn { ' + names.join(', ') + ' };';
  const keys = Object.keys(globals);
  // eslint-disable-next-line no-new-func
  return new Function(keys.concat(['module', 'exports']), s)
    .apply(null, keys.map((k) => globals[k]).concat([{ exports: {} }, {}]));
}

// 把 SFC 的 <script> 抽出来当 CommonJS 模块跑（与 check-daily-close-back.js 同一手法），
// globals = 这段代码会摸到的宿主环境（uni / document / atob / URL ...），按平台条件编译后再喂
function loadScript(file, isH5, globals) {
  let src = fs.readFileSync(file, 'utf8');
  src = src.replace(/^[\s\S]*?<script>/, '').replace(/<\/script>[\s\S]*$/, '');
  src = conditional(src, isH5);
  // @/ 开头的当真实模块读进来（poster-save / poster-theme 那类 util 里有端判断与样式表，stub 掉就测不到分路）
  let modSeq = 0;
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["']@\/([^"']+)["'];?\s*$/gm, (mm, names, rel) => {
    const key = '__util' + modSeq;
    globals[key] = loadUtil(rel, isH5, globals);
    modSeq++;
    // 「import { a as b }」在解构里要写成「{ a: b }」
    return 'const {' + names.replace(/([A-Za-z0-9_$]+)\s+as\s+([A-Za-z0-9_$]+)/g, '$1: $2') + '} = ' + key + ';';
  });
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (mm, names) =>
    'const ' + names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n + ' = () => ({})').join(', ') + ';');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = () => ({});');
  src = src.replace('export default', 'module.exports =');
  const keys = Object.keys(globals);
  const m = { exports: {} };
  // eslint-disable-next-line no-new-func
  new Function(keys.concat(['module', 'exports']), src)
    .apply(null, keys.map((k) => globals[k]).concat([m, m.exports]));
  return m.exports;
}

// 挂上 data / computed / methods 的假组件实例
function makeVm(opts, seed) {
  const vm = Object.assign({}, typeof opts.data === 'function' ? opts.data() : {}, seed || {});
  Object.keys(opts.methods || {}).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  Object.keys(opts.computed || {}).forEach((k) => {
    Object.defineProperty(vm, k, { get: opts.computed[k].bind(vm), configurable: true });
  });
  return vm;
}

// canvasToTempFilePath 在 H5 回的就是 base64（platforms/h5/helpers/save-image.js 直接回 base64）
const POSTER = 'data:image/png;base64,iVBORw0KGgo=';
// 交给浏览器的那一份：同一段字节包成 Blob 换出来的地址（poster-save.toSavableSrc，URL.createObjectURL 桩）
// ——长按 data: 图微信内 / iOS Safari 不弹「保存图片」，这是用户 2026-09-28 点名的那个症状
const SAVABLE = 'blob:poster-1';

/** 系统 logo（站点配置里那一张）：海报封面取不到时的兜底，与 router.share / wechat sdk 同一份口径 */
const SITE_LOGO = 'https://cdn.test/site-logo.png';
// 尺寸表/失败表的键一律过 mpKey（组件里那一份，本体与断言必须用同一把钥匙，见 common/utils/mp-data-key）
const MPKEY = loadUtil('common/utils/mp-data-key.js', true, {}).mpKey;
/**
 * 封面尺寸表的 seed：本体按 mpKey(地址) 存（见 share-poster-body 的 coverSizes），
 * 这里必须用同一把钥匙转一次，否则断言读到的是一张空表、assetsReady 恒为 false。
 * @param {String} url 封面地址
 * @param {Number} w 原图宽
 * @param {Number} h 原图高
 */
const coverSizesOf = (url, w, h) => ({ [MPKEY(url)]: { w: w, h: h } });
/**
 * $tools.systemConfig 的桩：'logo' 回站点 logo（内容封面退回那一档要读它），其余键仍回真值
 * @param {String} key 配置键
 */
const configStub = (key) => (key === 'logo' ? SITE_LOGO : true);

/**
 * $tools.uploadImage 的桩：只记账、永远「不答应」。
 * 保存那一条路已经不再使上传（2026-09-27 用户口径），这里留着是为了让断言能读出
 * 「点一次保存，$tools.uploadImage 被调了几次」——必须是 0 次。
 * @param {Array} log 记账数组
 */
function uploadStub(log) {
  return {
    systemConfig: configStub,
    uploadImage: (api, path, opts) => {
      log.push('upload:' + api + ':' + (opts && opts.directUpload === false ? 'server' : 'auto') + ':' + String(path).slice(0, 22));
      return Promise.reject(new Error('保存不该发上传'));
    },
  };
}

/**
 * 组件运行环境：canvas 只留 draw 的回调，下载/预览/相册各接口都记进 log
 * @param {Object} o { log, isH5, tempFilePath }（tempFilePath 传 '' 模拟出图失败）
 */
function cardEnv(o) {
  const log = o.log;
  const env = {
    uni: {
      createCanvasContext: () => {
        const ctx = {
          createLinearGradient: () => ({ addColorStop: () => {} }),
          // 弥散渐变那几团高光按「圆心 + 半径」记账：画布这一份必须与预览 CSS 从同一张表算出来。
          // 这里如实按 **H5 那一端** 给：uni-h5 的画布上下文只有 createCircularGradient
          // （@dcloudio/uni-h5/src/core/service/api/context/canvas.js:311-316），没有小程序那套
          // createRadialGradient —— 用它写就复现用户报的「ctx.createRadialGradient is not a function」
          createCircularGradient: (x, y, r) => {
            log.push('radial:' + x + ',' + y + ',' + r);
            return { addColorStop: () => {} };
          },
          draw: (reserve, cb) => { log.push('draw'); if (typeof cb === 'function') cb(); },
        };
        // 头像/封面那一块要用的路径方法（save/beginPath/arc/rect/clip/restore/drawImage）逐个记账，
        // 少了哪一个画布上就没有那张图（画布与预览的镜像见组件里 drawPoster 的注释）；
        // stroke 那一组是划线原价的那一横线（预览用 text-decoration，画布要自己画）
        ['setFillStyle', 'setStrokeStyle', 'setLineWidth', 'fillRect', 'fillText', 'save', 'restore',
          'beginPath', 'moveTo', 'lineTo', 'stroke', 'closePath', 'fill', 'clip']
          .forEach((k) => { ctx[k] = () => { log.push(k); }; });
        // fillText 把文字本身也记下来：右下角的码只有 64px 宽，昵称/活动名一长就要跟着截断（fitText）
        // 坐标另记一条 'xy:'（日期角标那三行的水平居中要能量出来）：前缀不同，按 'fillText:' 计数的断言不受影响
        ctx.fillText = (t, x, y) => {
            log.push('fillText:' + t);
            log.push('xy:' + t + ',' + (Math.round(x * 10) / 10) + ',' + (Math.round(y * 10) / 10));
        };
        ctx.fillRect = (x, y, w, h) => {
            log.push('fillRect');
            log.push('rect:' + x + ',' + y + ',' + w + 'x' + h);
        };
        // measureText 按当前字号给一个「每字等宽」的近似值，够 fitText 判截断
        let fontSize = 12;
        ctx.setFontSize = (n) => { fontSize = n; log.push('setFontSize'); };
        ctx.measureText = (s) => ({ width: String(s).length * fontSize });
        ctx.arc = (x, y, r) => log.push('arc:' + x + ',' + y + ',' + r);
        // content 档那张封面要按 aspectFill 裁切：先 rect 圈出画框再 clip（少了 rect 就没有裁切这一刀）
        ctx.rect = (x, y, w, h) => log.push('rect:' + x + ',' + y + ',' + w + 'x' + h);
        ctx.drawImage = (src, x, y, w, h) => log.push('drawImage:' + src + ',' + x + ',' + y + ',' + w + 'x' + h);
        // 字号 + 字重一起记：预览 CSS 写了 font-weight 的每一行，画布都要走同一档，否则「盖在排版之上
        // 那张画布图」与底下那一版排版的字重不同（2026-09-27 用户点名「切换预览那一档时昵称先变粗再变细」）
        let fontStr = '';
        Object.defineProperty(ctx, 'font', {
          set: (v) => { fontStr = v; log.push('font:' + v); },
          get: () => fontStr,
        });
        return ctx;
      },
      canvasToTempFilePath: (opts) => {
        log.push('canvasToTempFilePath');
        if (opts.fail && (o.tempFilePath === '' || o.tempFilePath === 'fail')) return opts.fail({ errMsg: 'x' });
        opts.success({ tempFilePath: o.tempFilePath === undefined ? POSTER : o.tempFilePath });
      },
      // H5 上真机是「只 console.error 的占位」，不回任何回调；这里如实记一笔，用来断言没被当保存用
      saveImageToPhotosAlbum: (opts) => {
        log.push('saveImageToPhotosAlbum:filePath=' + opts.filePath);
        if (!o.isH5) opts.success();
      },
      showToast: (opts) => log.push('toast:' + opts.title),
      previewImage: (opts) => log.push('previewImage:' + ((opts.urls || [])[0] || '')),
      setClipboardData: () => log.push('setClipboardData'),
    },
    // 只有小程序编译产物里留着 wx.* 的调用（H5 那段被条件编译吃掉），这里一并给上：
    // canIUse 决定有没有图片分享面板，showShareImageMenu 记一次调用与失败分支；
    // env / getFileSystemManager 给 setCode 用（小程序画布只认本地路径，base64 要先落一张临时图）
    wx: {
      canIUse: (name) => {
        log.push('canIUse:' + name);
        return o.canIUse === undefined ? true : !!o.canIUse;
      },
      showShareImageMenu: (opts) => {
        log.push('showShareImageMenu:path=' + opts.path);
        if (o.shareMenuFail) opts.fail({ errMsg: o.shareMenuFail });
      },
      env: { USER_DATA_PATH: 'wxfile://usr' },
      getFileSystemManager: () => ({
        writeFile: (opts) => {
          log.push('writeFile:' + opts.filePath + ':' + opts.encoding + ':' + opts.data);
          if (o.codeWriteFail) opts.fail({ errMsg: 'writeFile:fail' });
          else opts.success();
        },
      }),
    },
    document: (() => {
      const doc = {
        createElement: () => ({
          click: () => log.push('linkClick:href=' + doc.link.href + ':download=' + doc.link.download),
        }),
      };
      doc.body = {
        appendChild: (el) => { doc.link = el; },
        removeChild: () => {},
      };
      return doc;
    })(),
    atob: (b64) => Buffer.from(b64, 'base64').toString('binary'),
    Blob: function Blob(parts, opt) { this.type = opt && opt.type; },
    URL: { createObjectURL: () => 'blob:poster-1' },
    navigator: { userAgent: o.ua || 'Mozilla/5.0 (Linux; Android 13) Chrome/120' },
  };
  // 断言要直接驱动「两端共用的那一份场景绘制」paintPoster（出图/导出那一段按端分岔，
  // 微信端已改走 2d 画布），所以把这份记账上下文也交出去
  env.makeCtx = () => env.uni.createCanvasContext();
  return env;
}

/**
 * 弹层实例：把「壳 / 本体 / 打卡适配层」三只组件按真组件的 props 绑定接起来，对外给一个门面
 *
 * 为什么不是三只分别断言：海报上任何一块要画什么，都是「适配层算 poster → 弹层壳选样式 → 本体画预览与画布」
 * 一条链，拆开测就测不到「换了样式档画布跟着换」「码没到手海报上那格就不出」这类跨层行为。
 * 门面按 壳 → 本体 → 适配层 的顺序找成员，seed 里的键按各层自己的 prop 名归位（checkinId 那类老 seed
 * 键同时映射成壳的 codeId，日签图这一档的码落点就是活动 ID）。
 */
const AVATAR = 'https://cdn.test/a.png';
const DEFAULT_QUOTES = [{ text: '千里之行，始于足下。', from: '老子《道德经》' }, { text: '锲而不舍，金石可镂。', from: '荀子《劝学》' }];
const SHELL_SEED = ['shareBgs', 'bgErrors', 'bgSizes', 'codeSrc', 'codeFailed', 'codeKey', 'viewportH',
  'themeIndex', 'codeType', 'codeId', 'subject', 'layout', 'showRecommend', 'show', 'renderedSrc'];
const BODY_SEED = ['avatarLoaded', 'avatarSizes', 'avatarErrors', 'coverErrors', 'coverSizes', 'scale'];
const CARD_SEED = ['quotes', 'quoteIndex', 'nickname', 'avatar', 'checkinTitle', 'totalDays', 'checkinId'];
// 本体那几个 prop 由上游下发，测试实例上用 getter 接上（值随上游变，不留一份快照）
// codeLoading 接的是 shell.codePending —— 模板上绑的就是这一个（码在取、还没到手、也没失败）
// 出图那一组也接上壳（模板上就是 :render-loading="renderPending" / :render-failed / :rendered-src）：
// 断言里就能直接读 body 的 shadeLoading，而不是各存一份快照
const BODY_LINK = { poster: 'card', styleOptions: 'shell', themeIndex: 'shell', codeSrc: 'shell', codeLoading: 'shellPending', codeCaption: 'shell', bgSizes: 'shell', layout: 'shell', scale: 'shellScale', renderLoading: 'shellRenderPending', renderFailed: 'shell', renderedSrc: 'shell' };

function cardVm(isH5, globals, inWechat, seed) {
  const s = Object.assign({}, seed || {});
  if (s.checkinId !== undefined && s.codeId === undefined) s.codeId = s.checkinId;
  const common = {
    $wxsdk: isH5 ? { isWechat: () => inWechat } : {},
    // Vue2 的 this.$set（地址作 key 记失败/尺寸），测试实例上就是一个赋值
    $set: (obj, key, val) => { obj[key] = val; },
    $api: () => Promise.resolve({ code: 0 }),
    // 默认不给 uploadImage：保存这一条路一旦想上传就是 TypeError，测试当场红
    $tools: { systemConfig: configStub },
    $emit: () => {},
  };
  // seed 里以 $ 开头的都是宿主注入（$tools/$api/$emit...），三层都要拿到同一份
  Object.keys(s).forEach((k) => { if (k.charAt(0) === '$') common[k] = s[k]; });
  const cardOpts = loadScript(CARD, isH5, globals);
  const shellOpts = loadScript(SHELL, isH5, globals);
  const bodyOpts = loadScript(BODY, isH5, globals);
  const pick = (keys) => {
    const o = {};
    keys.forEach((k) => { if (s[k] !== undefined) o[k] = s[k]; });
    return o;
  };
  // 金句库由后端随日记详情下发（common/constant/checkin/Quote）；这里给两条，「换一句」才轮得动
  const card = makeVm(cardOpts, Object.assign({}, common, { quoteIndex: 0, quotes: DEFAULT_QUOTES, nickname: '凸知', checkinTitle: '自律行动营', totalDays: 3, avatar: AVATAR }, pick(CARD_SEED)));
  const shell = makeVm(shellOpts, Object.assign({}, common, { themeIndex: 0, layout: 'daily', subject: '日签图', codeType: 'checkin', codeId: 628, viewportH: 0, shareBgs: [] }, pick(SHELL_SEED)));
  const body = makeVm(bodyOpts, Object.assign({}, common, { scale: 1, avatarLoaded: AVATAR }, pick(BODY_SEED),
    // 断言直接给一张内容海报的数据时，就不再接适配层那一份 poster
    s.poster ? { poster: s.poster } : {}));
  Object.keys(BODY_LINK).forEach((k) => {
    if (k === 'poster' && s.poster) return;
    const from = BODY_LINK[k];
    Object.defineProperty(body, k, {
      configurable: true,
      get: () => (from === 'card' ? card.poster : from === 'shellScale' ? shell.posterScale
        : from === 'shellPending' ? shell.codePending
        : from === 'shellRenderPending' ? shell.renderPending : shell[k]),
    });
  });
  shell.$refs = { body };
  const parts = [shell, body, card];
  return new Proxy({}, {
    get: (t, k) => {
      for (let i = 0; i < parts.length; i++) { if (k in parts[i]) return parts[i][k]; }
      return t[k];
    },
    set: (t, k, v) => {
      parts.forEach((p) => { try { p[k] = v; } catch (e) { /* 只读的 computed 跳过 */ } });
      t[k] = v;
      return true;
    },
    has: (t, k) => parts.some((p) => k in p),
  });
}

/**
 * 出图那条链在 H5 上多了一次异步：先把要画的那几张图换成本机可绘地址，再开画布（见 share-poster-body
 * 的 drawPoster 与 poster-render 的 resolvePosterImages）。组件的 save() 于是不再是同步收口的，
 * 而下面这几组断言都是「点完保存立刻读日志」的写法 —— 用一只 flushPaint 把微任务与 setImmediate
 * 放完再读，省得读到半途那一份。
 */
const flushPaint = () => new Promise((resolve) => setImmediate(resolve));
/** 异步段自己抛错（不是被断言的那条失败）不能悄悄算过，要照样记成红 */
const tailFail = (e) => assert('门禁脚本自身抛错：' + ((e && e.message) || e), false, (e && e.stack) || String(e));

// ————————————————————————————————————————————— 组件：保存 —————————————————————————————————————————————
// 断言失败时只想看「对外动作」那几条（toast / 预览 / 下载 / 相册），画布上的绘制记账太长
const OUTCOME = /^(toast|previewImage|linkClick|saveImage|setClipboardData|canIUse|showShareImageMenu)/;
const outcome = (log) => JSON.stringify(log.filter((l) => OUTCOME.test(l)));

(async () => {
  const browserLog = [];
  cardVm(true, cardEnv({ log: browserLog, isH5: true }), false).save();
  await flushPaint();
  assert('H5 普通浏览器：不拿 H5 上不存在的 saveImageToPhotosAlbum 当保存用',
    !browserLog.some((l) => l.indexOf('saveImageToPhotosAlbum') === 0), outcome(browserLog));
  assert('H5 普通浏览器：canvas 出图转 blob 后走 a[download] 下载',
    browserLog.indexOf('linkClick:href=blob:poster-1:download=日签图.png') !== -1,
    JSON.stringify(browserLog.filter((l) => l.indexOf('linkClick') === 0)));
  assert('H5 普通浏览器：下载后有一句结果提示（不留「点了没反应」）',
    browserLog.indexOf('toast:日签图已保存') !== -1, outcome(browserLog));
  assert('H5 每一端都先把图放大（2026-09-26 用户口径：点保存后要能弹出图片长按保存）',
    browserLog.indexOf('previewImage:' + SAVABLE) !== -1, JSON.stringify(browserLog.filter((l) => l.indexOf('previewImage') === 0)));

  // 2026-09-27 用户点名「点击保存为什么还是上传图片，不要上传」：靠长按的两端（微信内 / iOS Safari）
  // 也不中转成 http 图——放大的是画布那张图就地换好的 blob 地址，一次请求都不发
  const wechatLog = [];
  cardVm(true, cardEnv({ log: wechatLog, isH5: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1) MicroMessenger/8.0' }), true,
    { $tools: uploadStub(wechatLog) }).save();
  await flushPaint();
  assert('H5 微信内：一次上传都不发，放大换好地址的那张图 + 弹一句长按提示（那条会被忽略的下载也不跑）',
    !wechatLog.some((l) => l.indexOf('upload:') === 0)
    && wechatLog.indexOf('previewImage:' + SAVABLE) !== -1
    && wechatLog.indexOf('toast:长按图片可保存至相册') !== -1
    && !wechatLog.some((l) => l.indexOf('linkClick') === 0) && !wechatLog.some((l) => l.indexOf('saveImage') === 0),
    outcome(wechatLog));
  const iosLog = [];
  cardVm(true, cardEnv({ log: iosLog, isH5: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1) Safari/604.1' }), false,
    { $tools: uploadStub(iosLog) }).save();
  await flushPaint();
  assert('H5 iOS Safari：同样不上传（blob 在 iOS 只会另开预览页），只放大 + 长按提示、不下一次 a[download]',
    !iosLog.some((l) => l.indexOf('upload:') === 0 || l.indexOf('linkClick') === 0)
    && iosLog.indexOf('previewImage:' + SAVABLE) !== -1 && iosLog.indexOf('toast:长按图片可保存至相册') !== -1,
    outcome(iosLog));
  assert('H5 能直接下载的内核（Android 普通浏览器）也不上传：预览 + a[download] 两条照旧',
    browserLog.every((l) => l.indexOf('upload:') !== 0) && browserLog.indexOf('previewImage:' + SAVABLE) !== -1,
    JSON.stringify(browserLog.filter((l) => l.indexOf('upload') === 0 || l.indexOf('previewImage') === 0)));
  // 2026-09-28 用户点名「不能长按图片保存」：画布出的是 data:，那是一段文档内容而不是一张图片资源，
  // 微信内 / iOS Safari 长按它不弹「保存图片」。放大与下载这两条对外动作都不许再拿到那个原地址，
  // 也不许为了换个地址去请求一次后端（换的是同一份字节的 blob，一次网络请求都不发）
  assert('放大与下载都不再拿画布那张 data: 原地址（长按它存不下来，必须换成 blob 地址）',
    [browserLog, wechatLog, iosLog].every((log) => !log.some((l) => l.indexOf('data:image') !== -1))
    && [browserLog, wechatLog, iosLog].every((log) => log.some((l) => l.indexOf('previewImage:blob:') === 0 || l.indexOf('linkClick:href=blob:') === 0)),
    JSON.stringify([browserLog, wechatLog, iosLog].map((l) => l.filter((x) => x.indexOf('data:image') !== -1
      || x.indexOf('previewImage') === 0 || x.indexOf('linkClick') === 0))));
  assert('能不能直接下载仍按 saveByLongPress 分（微信内/iOS 不下载，其余下载 + 预览两条都给）',
    cardVm(true, cardEnv({ log: [], isH5: true, ua: 'Mozilla/5.0 (iPhone) Safari' }), false).saveByLongPress === true
    && cardVm(true, cardEnv({ log: [], isH5: true }), false).saveByLongPress === false, 'iPhone=真 / Android=假');
})().catch(tailFail);

/**
 * 断言里沿用的是改造前那一份类名（ck-daily-*），读的是拆分后的三份源码：
 * 弹层壳那半（stage/sheet/close/themes/btns/tip）与海报本体那半（poster/datebox/quote/foot/code…）
 * 各归各的前缀（sh- / sp-），这里按角色映射回同一个名字，几何与版式那批断言才不必抄两份。
 */
const legacy = (s) => s.replace(/\bsh-(stage|sheet|close|themes-row|themes|theme|btns|btn|tip|recommend|poster|wrap)/g, 'ck-daily-$1')
  .replace(/\bsp-/g, 'ck-daily-');
// 模板段要取到「最后一个 </template>」：本体那一份里有 <template v-if> 包着两档版式，
// 从左往右找到的第一个闭合标签是内层的，会把 content 档那一截切掉
const readTpl = (file) => {
  const s = fs.readFileSync(file, 'utf8');
  const a = s.indexOf('<template>');
  const b = s.lastIndexOf('</template>');
  return s.slice(a + 10, b > a ? b : s.length);
};
const shellSrc = fs.readFileSync(SHELL, 'utf8');
const bodySrc = fs.readFileSync(BODY, 'utf8');
const adapterSrc = fs.readFileSync(CARD, 'utf8');
const themeSrc = fs.readFileSync(path.join(SRC, 'common/utils/poster-theme.js'), 'utf8');
// 一份「改造前的弹层源码」视角：样式与画布那批断言钉的是同一个角色的块，读拆分后的两份
const cardSrc = legacy(shellSrc) + legacy(bodySrc) + adapterSrc;
const sheetTpl = legacy(readTpl(SHELL));
// 弹层档与 inline 档分开钉：拿不到码时弹层档关弹层、inline 档才留那句灰字说明（按原始类名切）
const shellTplRaw = readTpl(SHELL);
const INLINE_MARK = shellTplRaw.indexOf('sh-stage--inline');
const popupTpl = shellTplRaw.slice(0, INLINE_MARK);
const inlineTpl = shellTplRaw.slice(INLINE_MARK);
const bodyTpl = legacy(readTpl(BODY));
// content 档是这一轮新加的版式，断言按它自己的类名（sp-*）写，不走上面那层旧名映射
const bodyTplRaw = readTpl(BODY);
const tpl = sheetTpl + bodyTpl;
// 2026-09-26 用户改口径：提示不再常驻在保存按钮下面，改在点「保存」放大图片的那一刻一起弹
assert('H5：按钮下面那句常驻长按说明已删（弹层里不再有 #ifdef H5 的常驻提示块）',
  tpl.indexOf('点击图片后长按可保存至相册') === -1 && tpl.indexOf('#ifdef H5') === -1, '常驻那一句已收掉');
// 提示与放大同一拍发出去（不再等一次上传回来），这一份 log 给下面那条「同一刻」的顺序断言用
(async () => {
  const h5HintLog = [];
  cardVm(true, cardEnv({ log: h5HintLog, isH5: true, ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1) MicroMessenger/8.0' }), true,
    { $tools: uploadStub(h5HintLog) }).save();
  await flushPaint();
  const hintAt = h5HintLog.indexOf('previewImage:' + SAVABLE);
  assert('H5 微信内：放大与那句「长按图片可保存至相册」同一拍发出去（不排在一次上传回来之后）',
    hintAt !== -1 && h5HintLog.indexOf('toast:长按图片可保存至相册') === hintAt + 1,
    JSON.stringify(h5HintLog.filter((l) => l.indexOf('previewImage') === 0 || l.indexOf('toast') === 0)));
})().catch(tailFail);
// 这一句提示看不看得见，取决于 App.vue 把 uni-toast 抬到系统预览层之上：
// uni-app 的 H5 外壳里 <toast> 排在 <preview-image> 前面，同 z-index 时预览会盖住提示（源码 app/index.vue + popup 样式）
const appCss = fs.readFileSync(path.join(SRC, 'App.vue'), 'utf8');
const toastZ = Number(((appCss.match(/uni-toast \{[\s\S]*?z-index:\s*(\d+)/) || [])[1] || 0));
const previewZ = Number(((appCss.match(/\.uni-system-preview-image \{[\s\S]*?z-index:\s*(\d+)/) || [])[1] || 0));
assert('提示层压在图片放大层之上（uni-toast > .uni-system-preview-image），否则那句长按提示会被预览盖成看不见',
  toastZ > 0 && previewZ > 0 && toastZ > previewZ, 'uni-toast=' + toastZ + ' preview=' + previewZ);

const mpLog = [];
cardVm(false, cardEnv({ log: mpLog, isH5: false }), false).exportPoster(POSTER);
assert('小程序/App：仍走相册接口，且 success 有提示',
  mpLog.indexOf('saveImageToPhotosAlbum:filePath=' + POSTER) !== -1
  && mpLog.indexOf('toast:日签图已保存') !== -1 && mpLog.indexOf('linkClick:href=blob:poster-1:download=日签图.png') === -1,
  outcome(mpLog));

(async () => {
  const genFail = [];
  cardVm(true, cardEnv({ log: genFail, isH5: true, tempFilePath: 'fail' }), false).save();
  await flushPaint();
  assert('出图接口失败：说「日签图生成失败，请重试」，不静默',
    genFail.indexOf('toast:日签图生成失败，请重试') !== -1, outcome(genFail));
  assert('出图接口失败：先重画一次「不带头像」的版本（头像那张图是画布污染/等不到回音的唯一新变量）',
    genFail.filter((l) => l === 'draw').length === 2
    && genFail.filter((l) => l.indexOf('drawImage:') === 0).length === 1, outcome(genFail));
})().catch(tailFail);

const emptyLog = [];
cardVm(true, cardEnv({ log: emptyLog, isH5: true }), false).exportPoster('');
assert('出图成功但地址为空：同样说一句，不开一次空白下载',
  emptyLog.length === 1 && emptyLog[0] === 'toast:日签图生成失败，请重试', JSON.stringify(emptyLog));

// H5 的编译产物里必须还留着相册接口以外的两条路（条件编译没把 H5 分支吃掉）——出图那两条在弹层壳里
assert('条件编译：H5 产物含 previewImage 与 a[download] 两条路，小程序产物只含相册接口',
  conditional(shellSrc, true).indexOf('downloadPoster') !== -1
  && conditional(shellSrc, false).indexOf('document.createElement') === -1, '两条 H5 分支都在');

// ————————————————————————————————————————— 组件：画布与预览的镜像 —————————————————————————————————————————
// 2026-09-26 用户点名「左右两侧的间距以左侧为基准，可以再放大 1/2」⇒ daily 档的左右内衬由 18 收到 27
// （原先预览 18、画布那一份 24，两边不等就是「右侧比左侧小」的成因），头像/码跟着这一档一起动
const DAILY_X = 27;
const canvasLog = [];
const canvasEnv = cardEnv({ log: canvasLog, isH5: false });
const canvasVm = cardVm(false, canvasEnv, false);
canvasVm.paintPoster(canvasEnv.makeCtx(), () => true);
assert('头像画进画布：预览里 load 成功过的那张地址才画，且落在左内衬 27 那一档（此前存下来的图里没有头像）',
  canvasLog.indexOf('drawImage:https://cdn.test/a.png,' + DAILY_X + ',336,26x26') !== -1
  && canvasLog.indexOf('arc:' + (DAILY_X + 13) + ',349,13') !== -1 && canvasLog.indexOf('clip') !== -1,
  JSON.stringify(canvasLog.filter((l) => l.indexOf('drawImage') === 0 || l === 'clip' || l.indexOf('arc') === 0)));
const noAvatarLog = [];
const noAvatarEnv = cardEnv({ log: noAvatarLog, isH5: false });
cardVm(false, noAvatarEnv, false, { avatarLoaded: '' }).paintPoster(noAvatarEnv.makeCtx(), () => true);
assert('头像还没 load 成功时不交给画布去等（uni-h5 的 canvas 图片队列只挂 onload，等不到就没有回音）',
  !noAvatarLog.some((l) => l.indexOf('drawImage:') === 0), JSON.stringify(noAvatarLog.filter((l) => l.indexOf('drawImage') === 0)));

// 用户区三行的坐标是 CSS 那一份的镜像：码到手时左列 64 高（顶 328）、没码时 48 高（顶 336，垂直居中）
// 2026-09-26 起 daily 档这一块的高度与左右内衬都不再写在 CSS 里（预览 :style 绑 daily.foot、画布读同一份），
// 左右内衬由 18 放大到 27 ⇒ 左列定宽只剩 176（300 − 27×2 − 码 64 − 间隙 6）
const cssFoot = Number(((bodySrc.match(/const FOOT = (\d+);/) || [])[1] || 0));
const cssAvatar = Number(((cardSrc.match(/\.ck-daily-avatar \{\s*width:\s*(\d+)px/) || [])[1] || 0));
const cssCode = Number(((cardSrc.match(/\.ck-daily-code \{\s*width:\s*(\d+)px/) || [])[1] || 0));
const dailyBox = cardVm(false, cardEnv({ log: [], isH5: false }), false, {}).daily;
/** daily 那一份绑出来的都是 CSS 串（'130px'），要跟数值比就得先剥掉 px（Number('130px') 是 NaN） */
const pxOf = (v) => Number(String(v).replace('px', ''));
assert('镜像：用户区 80 高、头像 26、码 64、左列 176；左右内衬两处同一档 27（= 左侧那一档 18 放大 1/2），CSS 里不再写第二份高度',
  cssFoot === 80 && cssAvatar === 26 && cssCode === 64
  && dailyBox.foot.height === '80px' && dailyBox.foot.paddingLeft === DAILY_X + 'px'
  && dailyBox.foot.paddingRight === DAILY_X + 'px' && dailyBox.x === DAILY_X && dailyBox.userW === 176
  && !/\.sp-foot \{[^}]*height:/.test(bodySrc),
  'foot=' + cssFoot + ' avatar=' + cssAvatar + ' code=' + cssCode + ' 内衬=' + dailyBox.x + ' 左列=' + dailyBox.userW);
const codeCanvasLog = [];
const codeEnv = cardEnv({ log: codeCanvasLog, isH5: false });
const codeVm = cardVm(false, codeEnv, false, { codeSrc: 'wxfile://usr/ck-daily-code.png' });
codeVm.paintPoster(codeEnv.makeCtx(), () => true);
assert('右下角的码画进画布：与预览同一坐标（右内衬 27、80 高用户区里垂直居中的 64×64 → 顶 328）',
  codeCanvasLog.indexOf('drawImage:wxfile://usr/ck-daily-code.png,' + (300 - DAILY_X - 64) + ',328,64x64') !== -1,
  JSON.stringify(codeCanvasLog.filter((l) => l.indexOf('drawImage') === 0)));
assert('码到手时左列按三行排（头像行顶到 328），没码时两行垂直居中（顶到 336）——两份镜像都跟得上',
  codeCanvasLog.indexOf('arc:' + (DAILY_X + 13) + ',341,13') !== -1 && canvasLog.indexOf('arc:' + (DAILY_X + 13) + ',349,13') !== -1,
  '有码 arc=' + (DAILY_X + 13) + ',341,13 / 无码 arc=' + (DAILY_X + 13) + ',349,13');
assert('码到手才在海报上写「长按识别XX」，没码时那句说明与画布上的字都不出（不留没人认领的方块）',
  codeCanvasLog.filter((l) => l === 'fillText:长按识别小程序码').length === 1
  && canvasLog.filter((l) => l.indexOf('fillText:') === 0 && l.indexOf('识别') !== -1).length === 0,
  JSON.stringify(codeCanvasLog.filter((l) => l.indexOf('fillText') === 0)));
const longLog = [];
const longEnv = cardEnv({ log: longLog, isH5: false });
cardVm(false, longEnv, false,
  { nickname: '这是一个很长很长的打卡昵称名字', checkinTitle: '自律行动营自律行动营自律行动营自律行动营' })
  .paintPoster(longEnv.makeCtx(), () => true);
const longTexts = longLog.filter((l) => l.indexOf('fillText:') === 0);
assert('昵称与活动名在画布上按可用宽截断（预览那侧是 CSS ellipsis，画布不自己截就会压到右下角的码上）',
  longTexts.filter((l) => /…$/.test(l)).length === 2, JSON.stringify(longTexts));

// ————————————————————————————————————————— 组件：字重是镜像项（M18③）—————————————————————————————————————————
// 2026-09-27 用户点名：分享海报里切换底部那一排预览选项，用户信息（昵称等）的字「先变粗又变细」。
// 成因不在切换本身：弹层一开显示的是本组件那一版 DOM 排版（.sp-nickname 写了 font-weight:bold），
// 画布出的那一张图随后盖上去，而画布那一份只给了字号（setFontSize）、从没给过字重 ⇒ 两份字重不同，
// 每换一次样式档（renderedSrc 先清空、新图回来再盖上）就看一次跳变。
// 这里钉的是：预览 CSS 里每一处 font-weight:bold，画布在同一档字号上必须也给 bold，其余给 normal。
/** 某条 fillText 那一刻生效的字体串（字重跟着 font 走，往回找最后一条才算得到） */
const fontBefore = (log, text) => {
  const at = log.indexOf('fillText:' + text);
  if (at === -1) return '没画这句话';
  for (let k = at - 1; k >= 0; k--) { if (log[k].indexOf('font:') === 0) return log[k].slice(5); }
  return '没设过字体';
};
assert('画布设字体只有 setFont(字号 + 字重) 一条路：先 setFontSize 兜底（两端都认），串再按 CSS 简写顺序写全 style+weight+size+family'
  + '（微信小程序真机只认按序书写的完整简写；uni-h5 的 font setter 在只有一个 token 时自己补一条 setFontWeight normal，'
  + '拼给浏览器就成了「bold normal 13px sans-serif」那一串）',
  /function setFont\(ctx, size, bold\)/.test(themeSrc)
  && /ctx\.setFontSize\(size\);\s*\n\s*ctx\.font = 'normal ' \+ \(bold \? 'bold' : 'normal'\) \+ ' ' \+ size \+ 'px ' \+ POSTER_FONT_FAMILY;/.test(themeSrc)
  && /setFont,/.test(themeSrc), 'setFont 在 poster-theme 里、先字号后字重串');
assert('daily 画布逐行与预览同一档字重：昵称 13 bold、日期 22 bold、累计天数 34 bold，金句 16 / 活动名 12 / 打卡次数 13 都 normal；'
  + '组件里不再直接 setFontSize（那条 API 只给字号，字重会静默丢掉，正是这次跳粗跳细的成因）',
  fontBefore(canvasLog, '凸知') === 'normal bold 13px sans-serif'
  && fontBefore(canvasLog, '3') === 'normal bold 34px sans-serif'
  && fontBefore(canvasLog, '千里之行，始于足下。') === 'normal normal 16px sans-serif'
  && fontBefore(canvasLog, '自律行动营') === 'normal normal 12px sans-serif'
  && fontBefore(canvasLog, '累计打卡') === 'normal normal 13px sans-serif'
  && bodySrc.indexOf('ctx.setFontSize') === -1,
  '昵称=' + fontBefore(canvasLog, '凸知') + ' 天数=' + fontBefore(canvasLog, '3')
  + ' 金句=' + fontBefore(canvasLog, '千里之行，始于足下。'));
assert('角标三行的字重收在 DATE_LINES 那一份表里（时刻/星期 normal、日期 bold），预览与画布读同一批三元组',
  /const DATE_LINES = \[\[12, 16, false\], \[22, 28, true\], \[11, 15, false\]\];/.test(bodySrc)
  && /setFont\(ctx, fs, DATE_LINES\[i\]\[2\]\)/.test(bodySrc)
  && /\.sp-date \{[^}]*font-weight: bold/.test(bodySrc)
  && !/\.sp-time \{[^}]*font-weight/.test(bodySrc) && !/\.sp-week \{[^}]*font-weight/.test(bodySrc),
  'DATE_LINES=' + (bodySrc.match(/const DATE_LINES = [^\n]*/) || [''])[0]);

// 预览的 :style 与画布读的是同一个 computed（daily），这里钉的就是那一份的数值：
// 2026-09-26 用户点名的「右侧间距比左侧小」「预览两行、存下来三行」都出在两份各写一遍
// （改前预览走 .sp-layer 内衬 18 + -webkit-line-clamp，画布自己写 x=24 / 22 一套数）
const quoteCss = (cardSrc.match(/\.ck-daily-quote \{[\s\S]*?\}/) || [''])[0];
const quoteLineCss = (cardSrc.match(/\.ck-daily-quote-line \{[\s\S]*?\}/) || [''])[0];
// 内衬在内容层那一份上（海报本体只给圆角与裁切，底图要铺满整张不能有内衬）
const posterPad = Number(((cardSrc.match(/\.ck-daily-layer \{[\s\S]*?padding:\s*(\d+)px/) || [])[1] || 0));
const quoteTopConst = Number(((bodySrc.match(/const QUOTE_TOP = (\d+);/) || [])[1] || 0));
const quoteSizeConst = Number(((bodySrc.match(/const QUOTE_SIZE = (\d+);/) || [])[1] || 0));
const quoteLineConst = Number(((bodySrc.match(/const QUOTE_LINE = (\d+);/) || [])[1] || 0));
const quoteXy = canvasLog.filter((l) => l.indexOf('xy:千里之行') === 0);
assert('镜像：预览金句那一块的顶边/行高/字号与画布读同一份 daily（顶边 130、行高 26、字号 16、可用宽 246=300−27×2），画布基线 = 行顶 + 行高/2 + 字号×0.36',
  posterPad === 18 && quoteTopConst === 130 && quoteSizeConst === 16 && quoteLineConst === 26
  && dailyBox.quote.left === DAILY_X + 'px' && dailyBox.quote.top === '130px'
  && dailyBox.quote.width === '246px' && dailyBox.quote.fontSize === '16px' && dailyBox.quote.lineHeight === '26px'
  && /ctx\.fillText\(l, x, QUOTE_TOP \+ idx \* QUOTE_LINE \+ QUOTE_LINE \/ 2 \+ QUOTE_SIZE \* 0\.36\)/.test(bodySrc)
  && quoteXy[0] === 'xy:' + dailyBox.lines[0] + ',' + DAILY_X + ',148.8',
  'daily.quote=' + JSON.stringify(dailyBox.quote) + ' 画布首行=' + JSON.stringify(quoteXy));
assert('daily 档只有一份数值：预览七个块一律 :style 绑 daily.xxx，CSS 里不再留 top / height（2026-09-26 用户点名的「右侧间距比左侧小」「引号压在文字上」「日期背景是方的」三条都出在预览与画布各写一遍，M18③）',
  ['sp-datebox:badge', 'sp-quote-mark:mark', 'sp-quote:quote', 'sp-quote-from:from', 'sp-acts:acts', 'sp-count:count', 'sp-foot:foot']
    .every((pair) => {
      const sel = pair.split(':')[0];
      const key = pair.split(':')[1];
      return new RegExp('class="' + sel + '"[^>]*:style="dailyText\\.' + key + '"').test(bodyTplRaw.replace(/\s+/g, ' '))
        && !new RegExp('\\.' + sel + ' \\{[^}]*[^-]top:').test(bodySrc);
    }),
  '七块都绑 daily，且 CSS 里没有第二份 top');
assert('折行只算一次：金句行数由 wrapText 给（预览一行一个 <text>、画布画同一个数组），-webkit-line-clamp 整根下线',
  quoteCss.indexOf('-webkit-line-clamp') === -1 && quoteLineCss.indexOf('white-space: nowrap') !== -1
  && /v-for="\(line, i\) in daily\.lines"/.test(bodyTplRaw)
  && /wrapText\(this\.quote, QUOTE_SIZE, w, QUOTE_MAX_LINES\)/.test(bodySrc)
  && bodySrc.indexOf('QUOTE_CHARS_PER_LINE') === -1 && dailyBox.lines.length === 1,
  'lines=' + JSON.stringify(dailyBox.lines) + ' 上限=' + (bodySrc.match(/const QUOTE_MAX_LINES = (\d+);/) || [])[1]);
assert('引号落在金句首字的左上角（x=13 比正文左内衬 27 再往左一档、顶边 100 在首行 130 之上；字号 46、画布基线 150），不再与首字同一头对齐成「压在文字上」（2026-09-26 用户点名）',
  /const MARK_X = DAILY_X - 14;/.test(bodySrc) && /const MARK_TOP = QUOTE_TOP - 30;/.test(bodySrc)
  && /const MARK_SIZE = 46;/.test(bodySrc) && /const MARK_BASELINE = 50;/.test(bodySrc)
  && dailyBox.mark.left === '13px' && dailyBox.mark.top === '100px' && dailyBox.mark.fontSize === '46px'
  && canvasLog.indexOf('xy:“,13,150') !== -1
  && Number(dailyBox.mark.left.replace('px', '')) < DAILY_X,
  'mark=' + JSON.stringify(dailyBox.mark) + ' 画布=' + (canvasLog.filter((l) => l.indexOf('xy:“') === 0)[0] || '没画'));
const dateBoxCss = (cardSrc.match(/\.ck-daily-datebox \{[\s\S]*?\}/) || [''])[0];
const dateBoxPad = Number((dateBoxCss.match(/padding:\s*(\d+)px 0/) || [])[1] || 0);
// 三行的行高必须写死（16/28/15）：靠默认行高时盒子高度只有浏览器知道，画布那一份只能猜，
// 猜出来的下沿与预览差几像素就是「底部边距与上方不同」
const dateRowH = ['time', 'date', 'week'].map((n) => Number(((cardSrc.match(new RegExp('\\.ck-daily-' + n + ' \\{[\\s\\S]*?line-height: (\\d+)px')) || [])[1] || 0)));
const dateBoxH = dateBoxPad * 2 + dateRowH.reduce((a, b) => a + b, 0);
assert('金句要落在日期角标下沿之外：角标 top 18 + 高（上下内衬各 8 + 三行行高 16/28/15）= 93 < 金句首行顶边 130（M18④）',
  pxOf(dailyBox.badge.top) === 18 && dateBoxPad === 8 && dateRowH.join() === '16,28,15'
  && dailyBox.badgeH === dateBoxH && pxOf(dailyBox.quote.top) > 18 + dateBoxH,
  '金句顶边=' + dailyBox.quote.top + ' 角标下沿=' + (18 + dateBoxH));
assert('两枚金句按钮同一行、同一档尺寸（.ck-daily-acts 一个容器、两枚共用 .ck-daily-act），标签写的是「换一条」',
  /class="ck-daily-acts"/.test(tpl) && (tpl.match(/class="ck-daily-act"/g) || []).length === 2
  && /\.ck-daily-acts \{[\s\S]*?display: flex/.test(cardSrc)
  && cardSrc.indexOf('.ck-daily-copy') === -1
  && (bodyTplRaw.match(/<view class="sp-act" v-if="quote"/g) || []).length === 2
  && bodyTplRaw.indexOf('换一条') !== -1 && cardSrc.indexOf('换一句') === -1,
  '一行两枚、有金句就成对出（2026-09-26 用户点名「只有一条也要显示」）');
// 纵向排布：金句（上限两行）→ 出处 → 两枚动作 → 累计打卡，谁也不压谁（2026-09-26 这一档顶边全收进 daily 那一份）
const actsTop = pxOf(dailyBox.acts.top);
const countTop = pxOf(dailyBox.count.top);
const fromLineH = pxOf(dailyBox.from.lineHeight);
const fromGap = Number(((bodySrc.match(/const QUOTE_FROM_GAP = (\d+);/) || [])[1] || 0));
const maxQuoteLines = Number(((bodySrc.match(/const QUOTE_MAX_LINES = (\d+);/) || [])[1] || 0));
const fromBottom = pxOf(dailyBox.quote.top) + maxQuoteLines * pxOf(dailyBox.quote.lineHeight) + fromGap + fromLineH;
assert('两枚动作落在出处之下、累计打卡之上（金句按上限两行算，出处顶边跟着实际行数走，按钮按 22px 高一档算）',
  actsTop === 214 && countTop === 246 && fromBottom === 214 && dailyBox.acts.right === DAILY_X + 'px'
  && pxOf(dailyBox.from.top) === pxOf(dailyBox.quote.top) + dailyBox.lines.length * pxOf(dailyBox.quote.lineHeight) + fromGap
  && actsTop >= fromBottom && actsTop + 22 <= countTop,
  'acts top=' + actsTop + ' 出处下沿=' + fromBottom + ' 统计块 top=' + countTop + ' 出处顶边=' + dailyBox.from.top);
assert('复制金句复制的是当前这一句，「换一条」在库里的下一句（不等接口）',
  /setClipboardData\(\{\s*data: this\.activeQuote\.text \+ '——' \+ \(this\.activeQuote\.from \|\| ''\)/.test(adapterSrc)
  && /nextQuote\(\)[\s\S]*?\(this\.quoteIndex \+ 1\) % n/.test(adapterSrc), '读当前句 + 本地轮播');
const rotVm = cardVm(false, cardEnv({ log: [], isH5: false }), false);
const first = rotVm.quote;
rotVm.nextQuote();
const second = rotVm.quote;
rotVm.nextQuote();
assert('换一条：金句与出处一起换，走到库尾回到第一句',
  first === '千里之行，始于足下。' && second === '锲而不舍，金石可镂。' && rotVm.quote === first
  && rotVm.quoteFrom === '老子《道德经》', first + ' → ' + second + ' → ' + rotVm.quote);
const oneLog = [];
const oneVm = cardVm(false, cardEnv({ log: oneLog, isH5: false }), false, { quotes: [{ text: '只有一句', from: '出处' }], quoteIndex: 0 });
oneVm.nextQuote();
assert('库里只有一句时「换一条」切不动但那枚照摆，点下去要把原因说出口（判据改成「有金句就成对出」，quoteActionable 整根下线）',
  oneVm.quote === '只有一句' && (oneVm.quotes || []).length === 1
  && oneLog.indexOf('toast:当前只有1条金句，暂无更多可换') !== -1
  && oneVm.poster.quoteActionable === undefined
  && bodySrc.indexOf('quoteActionable') === -1 && adapterSrc.indexOf('quoteActionable') === -1
  && shellSrc.indexOf('quoteActionable') === -1,
  'quotes=' + JSON.stringify(oneVm.quotes) + ' 动作=' + JSON.stringify(oneLog));
assert('金句库不写死在弹层里（props 只收后端下发的 quotes，三层组件内都不留一份语录）',
  cardSrc.indexOf('迷失的时候') === -1 && /quotes: \{ type: Array/.test(adapterSrc), '语录单一来源＝后端');

// ————————————————————————————————————————— 弹层版式：底部 Popup（2026-09-26 用户改口径） —————————————————————————————————————————
const popupTag = (tpl.match(/<u-popup[^>]*>/) || [''])[0].replace(/\s+/g, ' ');
assert('弹层是底部 Popup：mode=bottom + 透明底 + 安全区交给组件自己收（u-popup 自带的全量安全区会与面板内衬叠加）',
  /mode="bottom"/.test(popupTag) && /bgColor="transparent"/.test(popupTag)
  && /:safeAreaInsetBottom="false"/.test(popupTag), popupTag);
assert('版式顺序：海报在上、白色面板在下（选择样式与保存/分享都在面板里），不再是居中悬浮卡片',
  tpl.indexOf('ck-daily-stage') !== -1 && tpl.indexOf('ck-daily-stage') < tpl.indexOf('ck-daily-sheet')
  && tpl.indexOf('ck-daily-themes') > tpl.indexOf('ck-daily-sheet')
  && tpl.indexOf('ck-daily-btns') > tpl.indexOf('ck-daily-sheet'), 'stage < sheet < 色板/按钮');
assert('关闭落在面板右上角（旧版压在图内，是因为那时整块是居中卡片、图就是弹层本体）',
  tpl.indexOf('ck-daily-close') > tpl.indexOf('ck-daily-sheet')
  && /class="ck-daily-close"/.test(tpl) && !/ck-daily-poster[\s\S]*ck-daily-close/.test(tpl.slice(0, tpl.indexOf('ck-daily-sheet'))),
  'close 在 sheet 之后');
// 面板是白底 + 顶部圆角 12 + 自带一份安全区内衬（组件 isolated，全局 .school-popup 档进不来）
const sheetCss = (cardSrc.match(/\.ck-daily-sheet \{[\s\S]*?\n\}/) || [''])[0];
assert('底部面板白底、顶部圆角 12、自带安全区内衬（与 tz-nickname-modal 同一档写法）',
  /background: #fff/.test(sheetCss) && /border-radius: 12px 12px 0 0/.test(sheetCss)
  && /env\(safe-area-inset-bottom\)/.test(sheetCss), sheetCss.replace(/\s+/g, ' ').slice(0, 120));
assert('海报本体不再带「图内右上角关闭」留下的那 22px：日期角标回到与内衬同一条线（top 18），补上画布漏掉的 4px 圆角；宽不再写死 68 而是「最宽一行 + 左右内衬 13」现算（2026-09-26 用户点名「日期背景是方形的没有圆角」「底部边距与上方不同」）',
  dailyBox.badge.top === '18px' && dailyBox.badgeH === 75 && dailyBox.badgeW === 81
  && /const DATE_PAD_Y = 8;/.test(bodySrc) && /const DATE_PAD_X = 13;/.test(bodySrc)
  && /const DATE_R = 4;/.test(bodySrc)
  && /\.sp-datebox \{[^}]*border-radius: 4px/.test(bodySrc) && /\.sp-datebox \{[^}]*padding: 8px 0/.test(bodySrc)
  && !/\.sp-datebox \{[^}]*top:/.test(bodySrc)
  && /roundRect\(ctx, w - x - d\.badgeW, PAD, d\.badgeW, d\.badgeH, DATE_R\);[\s\S]{0,40}ctx\.fill\(\);/.test(bodySrc)
  && bodySrc.indexOf('ctx.fillRect(dateBoxX, PAD, DATE_W, dateBoxH)') === -1 && bodySrc.indexOf('DATE_W = 68') === -1,
  'badge=' + JSON.stringify(dailyBox.badge) + ' 高=' + dailyBox.badgeH);

// 样式表 2026-09-26 沉到 common/utils/poster-theme（日签图与内容分享两档海报共用一份），
// 弹层上不再挂 themes 数据 —— 下面几组断言都直接读那一只 util
const THEME = loadUtil('common/utils/poster-theme.js', true, {});
const { mpKey } = loadUtil('common/utils/mp-data-key.js', false, {});
// ————————————————————————————————————————————— 组件：日期角标的三行居中 —————————————————————————————————————————————
// 2026-09-26 用户点名「右上角的日期文本没有居中，并且日期的背景块底部边距与上方不同」：
// 画布那一份原先写死三个估算 x（日期行偏右 5.5px、星期行偏右 9px）与三条基线（下留边只有上留边的一档），
// 现在与预览同一刀——水平按 textWidth 取中，纵向按「内衬 8 + 行高」排，盒子高由同一批常量算出来
const dateLog = [];
const dateEnv = cardEnv({ log: dateLog, isH5: false });
cardVm(false, dateEnv, false, {}).paintPoster(dateEnv.makeCtx(), () => true);
// 角标盒子：右内衬 27 + 现算宽 81 → 左边 x=192，顶 18，高 75，圆角 4（画布没有 drawRoundedRect，圆角靠四段 arc）
const DATE_X0 = 300 - DAILY_X - 81;
assert('画布上的日期角标盒子与预览同一格（x=192 / y=18 / 宽 81 / 高 75）且走的是圆角路径 + fill（那块方底的 fillRect 已经换掉）',
  dateLog.indexOf('arc:' + (DATE_X0 + 81 - 4) + ',' + (18 + 4) + ',4') !== -1
  && dateLog.indexOf('arc:' + (DATE_X0 + 81 - 4) + ',' + (18 + 75 - 4) + ',4') !== -1
  && dateLog.indexOf('arc:' + (DATE_X0 + 4) + ',' + (18 + 75 - 4) + ',4') !== -1
  && dateLog.indexOf('arc:' + (DATE_X0 + 4) + ',' + (18 + 4) + ',4') !== -1
  && dateLog.indexOf('closePath') !== -1
  && !dateLog.some((l) => /^rect:192,18,81x75$/.test(l)),
  '角标高=' + dailyBox.badgeH + ' 画布四角=' + dateLog.filter((l) => l.indexOf('arc:') === 0 && /,4$/.test(l)).join(' | '));
const dateVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, {});
const dateBad = [];
let dateTop = 18 + 8;
[[dateVm.nowTime, 12, 16], [dateVm.nowMD, 22, 28], [dateVm.nowW, 11, 15]].forEach((l) => {
  const expX = Math.round((DATE_X0 + (81 - THEME.textWidth(l[0], l[1])) / 2) * 10) / 10;
  const expY = Math.round((dateTop + l[2] / 2 + l[1] * 0.36) * 10) / 10;
  if (dateLog.indexOf('xy:' + l[0] + ',' + expX + ',' + expY) === -1) {
    dateBad.push(l[0] + ' 应在 ' + expX + ',' + expY + '，实为 ' + (dateLog.filter((x) => x.indexOf('xy:' + l[0] + ',') === 0)[0] || '没画'));
  }
  dateTop += l[2];
});
assert('时刻/日期/星期三行各自按 textWidth 取中，基线 = 行顶 + 行高/2 + 字号×0.36（上下留边都是 8，与角标高 75 同一批常量）',
  dateBad.length === 0, JSON.stringify(dateBad));

// ————————————————————————————————————————————— 组件：底图（后台 share_bgs） —————————————————————————————————————————————
const GRAD = { kind: 'gradient' };
const bgVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { shareBgs: ['https://cdn.test/bg1.png', 'https://cdn.test/bg2.png'] });
assert('后台配了分享背景图：样式条整排换成这些图（不再混着自带渐变），第一张为默认档',
  bgVm.styleOptions.length === 2 && bgVm.styleOptions[0].kind === 'image' && bgVm.activeImage === 'https://cdn.test/bg1.png',
  JSON.stringify(bgVm.styleOptions));
const noBgVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { shareBgs: [] });
assert('一条背景图都没配：整排回落自带的弥散渐变档（2026-09-27 扩到 12 档、按色相排成一 ramp），日签图不会开出来是空的',
  noBgVm.styleOptions.length === 12 && noBgVm.styleOptions[0].kind === 'gradient' && noBgVm.activeImage === '',
  'styleOptions=' + noBgVm.styleOptions.length + ' 档');
assert('自带 12 档互不重复：底色两两不同，且都带 1~2 团高光（同一色相出现两次就没有扩档的意义）',
  new Set(THEME.POSTER_THEMES.map((t) => t.base)).size === 12
  && THEME.POSTER_THEMES.every((t) => t.blobs.length >= 1 && t.blobs.length <= 2),
  THEME.POSTER_THEMES.map((t) => t.base).join(' '));
assert('后台有底图就不出默认颜色：样式条里只剩底图，一档渐变都不掺（2026-09-26 用户定）',
  // 组件与断言各自 loadUtil 一次，拿到的是同一份表但不是同一个对象，按值比
  bgVm.styleOptions.every((o) => o.kind === 'image') && bgVm.activeTheme.base === THEME.POSTER_THEMES[0].base
  && bgVm.activeTheme.blobs.length === THEME.POSTER_THEMES[0].blobs.length,
  JSON.stringify(bgVm.styleOptions.map((o) => o.kind)));
// 预览 CSS、色板缩略图、画布三处都由 util 那张表算出来：半径按档宽等比缩，叠法同序
const th0 = THEME.POSTER_THEMES[0];
const posterCss = THEME.themeCss(th0, 300);
const thumbCss = noBgVm.thumbStyle({ kind: 'gradient', theme: th0 }).background;
const radial = canvasLog.filter((l) => l.indexOf('radial:') === 0);
assert('弥散渐变三份同源：海报 CSS 用 300 档半径、色板用 40 档、画布按同一比例铺几团高光（叠法与 CSS 反序对齐）',
  posterCss.indexOf('circle ' + Math.round(th0.blobs[0][2] * 300) + 'px at ' + (th0.blobs[0][0] * 100) + '%') !== -1
  && thumbCss.indexOf('circle ' + Math.round(th0.blobs[0][2] * 40) + 'px') !== -1
  && radial.length === th0.blobs.length
  && radial[radial.length - 1] === 'radial:' + (th0.blobs[0][0] * 300) + ',' + (th0.blobs[0][1] * 400) + ',' + (th0.blobs[0][2] * 300),
  '海报=' + posterCss.slice(0, 52) + ' / 色板=' + thumbCss.slice(0, 34) + ' / 画布=' + JSON.stringify(radial));
// 自带档是「一个底色 + 几团高光」，叠出来的最亮处仍要保证白字读得清：
// 按与 CSS/canvas 同一套叠色逐点算 WCAG 对比度（日期角标那一块要再叠 16% 白底），三块文字区最低值 ≥ 4.5
const mixOver = (dst, src, a) => dst.map((v, i) => v * (1 - a) + src[i] * a);
const relLum = (c) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
};
const vsWhite = (c) => 1.05 / (relLum(c) + 0.05);
const blobInk = (b, x, y) => {
  const r = b[2] * 300;
  const d = Math.hypot(x - b[0] * 300, y - b[1] * 400);
  if (d >= r) return null;
  const t = d / r;
  return { c: b[3].split(',').map(Number), a: b[4] * (1 - t) * (1 - t) };
};
const zoneContrast = (theme, box, plate) => {
  let worst = 99;
  for (let x = box[0]; x <= box[2]; x += 3) {
    for (let y = box[1]; y <= box[3]; y += 3) {
      let c = [1, 3, 5].map((i) => parseInt(theme.base.slice(i, i + 2), 16));
      (theme.blobs || []).forEach((bl) => { const g = blobInk(bl, x, y); if (g) c = mixOver(c, g.c, g.a); });
      if (plate) c = mixOver(c, [255, 255, 255], plate);
      worst = Math.min(worst, vsWhite(c));
    }
  }
  return worst;
};
// 白字落点两档都要扫：daily 三块按 2026-09-26 那一版几何取（角标 192..273 × 18..93 要再叠 16% 白底、
// 金句 + 出处 27..273 × 130..215、累计打卡 27..209 × 246..292）；content 三块是邀请头昵称 / 邀请语
// （左上，头像让位到 x 68）与码下面那句说明（底部居中），卡里那一行标题是深色压在磨砂白上，不在这块门禁里
const TEXT_ZONES = [
  ['角标', [192, 18, 273, 93], 0.16], ['金句', [27, 130, 273, 215], 0], ['数字', [27, 246, 209, 292], 0],
  ['昵称', [68, 18, 250, 40], 0], ['邀请语', [68, 40, 240, 58], 0], ['说明', [60, 366, 240, 382], 0],
];
const contrastRows = THEME.POSTER_THEMES.map((t) => TEXT_ZONES.map((z) => zoneContrast(t, z[1], z[2])));
const worstInk = Math.min.apply(null, contrastRows.map((r) => Math.min.apply(null, r)));
assert('自带弥散档每档的白字都读得清：两档海报共六块文字区 WCAG 对比度最低 ≥4.5（高光不许把字吃掉，改配色/扩档要过这一条）',
  worstInk >= 4.5,
  contrastRows.map((r, i) => THEME.POSTER_THEMES[i].base + ' ' + r.map((v) => v.toFixed(1)).join('/')).join('  ') + '  最低 ' + worstInk.toFixed(2));
const errBgVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { shareBgs: ['https://cdn.test/bg1.png', 'https://cdn.test/bad.png'] });
errBgVm.onBgError('https://cdn.test/bad.png');
assert('某一张底图取不到：从样式条里摘掉这一张，其余照旧（不留一个点上去是白的的色板）',
  errBgVm.styleOptions.length === 1 && errBgVm.activeImage === 'https://cdn.test/bg1.png',
  JSON.stringify(errBgVm.styleOptions.map((o) => o.url || o.bg)));
const errAllBgVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { shareBgs: ['https://cdn.test/bad.png'] });
errAllBgVm.onBgError('https://cdn.test/bad.png');
assert('唯一的底图也取不到：整排退回渐变档（海报永远有一张脸）',
  errAllBgVm.activeImage === '' && errAllBgVm.styleOptions[0].kind === 'gradient', JSON.stringify(errAllBgVm.styleOptions[0]));
const cropLog = [];
const cropEnv = cardEnv({ log: cropLog, isH5: false });
cardVm(false, cropEnv, false,
  { shareBgs: ['https://cdn.test/bg.png'], bgSizes: { [mpKey('https://cdn.test/bg.png')]: { w: 600, h: 600 } } })
  .paintPoster(cropEnv.makeCtx(), () => true);
assert('底图画进画布且按 aspectFill 居中裁切（600×600 铺 300×400 → 等比放大到 400×400、左右各切 50）',
  cropLog.indexOf('drawImage:https://cdn.test/bg.png,-50,0,400x400') !== -1,
  JSON.stringify(cropLog.filter((l) => l.indexOf('drawImage') === 0)));
const stretchLog = [];
const stretchEnv = cardEnv({ log: stretchLog, isH5: false });
cardVm(false, stretchEnv, false, { shareBgs: ['https://cdn.test/bg.png'] })
  .paintPoster(stretchEnv.makeCtx(), () => true);
assert('底图原始宽高还没到手（图没 load 完就点保存）：整张铺满出图，不因为算不出裁切就不画',
  stretchLog.indexOf('drawImage:https://cdn.test/bg.png,0,0,300x400') !== -1,
  JSON.stringify(stretchLog.filter((l) => l.indexOf('drawImage') === 0)));

// 外域图把出图路卡住时的降级顺序：先丢头像、再丢底图（每一档都要真少画一样东西，否则白画一遍）。
// 2026-09-28 微信端出图改成异步的 2d 画布之后，这一族按档直接驱动两端共用的 paintPoster：
// 钉的是「每一档到底画了什么」，与导出那条链谁在等谁无关
const ladderEnv = cardEnv({ log: [], isH5: false });
const ladderVm = cardVm(false, ladderEnv, false, { shareBgs: ['https://cdn.test/bg.png'] });
const ladderLevels = [0, 1, 2].map((lv) => {
  const log = [];
  ladderVm.paintPoster(cardEnv({ log: log, isH5: false }).makeCtx(), (name) => ladderVm.keepLayer(lv, name));
  return log.filter((l) => l.indexOf('drawImage:') === 0);
});
assert('带头像与底图连退两档：全画（头像 + 底图）→ 不画头像（只剩底图）→ 两层都不画，每一档确实少一样',
  ladderLevels[0].length === 2 && ladderLevels[1].length === 1 && ladderLevels[2].length === 0
  && ladderLevels[0].some((l) => l.indexOf(AVATAR) !== -1) && !ladderLevels[1].some((l) => l.indexOf(AVATAR) !== -1),
  JSON.stringify(ladderLevels));
assert('退档只丢头像那一次仍保留底图（头像最小、丢了海报还成立；底图是最后才丢的那一层）',
  ladderLevels[1].length === 1 && ladderLevels[1][0] === 'drawImage:https://cdn.test/bg.png,0,0,300x400',
  JSON.stringify(ladderLevels[1]));
const noBgLadderVm = cardVm(false, cardEnv({ log: [], isH5: false, tempFilePath: 'fail' }), false);
assert('没有底图可丢时到此为止：只重画一次「不带头像」的版本，不再白画第三遍',
  noBgLadderVm.degradeLevel(0) === 1 && noBgLadderVm.degradeLevel(1) === 1,
  'degradeLevel(0)=' + noBgLadderVm.degradeLevel(0) + ' degradeLevel(1)=' + noBgLadderVm.degradeLevel(1));
const giveUpLog = [];
cardVm(false, cardEnv({ log: giveUpLog, isH5: false }), false).exportPoster('');
assert('最后一档仍拿不到图才报生成失败（不留「点了没反应」，M13）',
  giveUpLog.indexOf('toast:日签图生成失败，请重试') !== -1, outcome(giveUpLog));

// 短屏收档：海报 400 + 面板 ~195，矮视口下不缩放会把右上角的日期角标顶出屏幕
const shortVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { viewportH: 560 });
const tallVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { viewportH: 900 });
const noInfoVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { viewportH: 0 });
assert('短屏按可用高缩放、高屏不缩（画布那份恒为 300×400，存下来的图不跟着分档）',
  shortVm.posterScale < 1 && shortVm.posterScale > 0.7 && tallVm.posterScale === 1
  && noInfoVm.posterScale === 1 && shortVm.stageHeight === Math.round(400 * shortVm.posterScale + 24),
  '560→' + shortVm.posterScale.toFixed(2) + ' 900→' + tallVm.posterScale + ' 拿不到视高→不缩');

// ——————————————————————— 共用 util（poster-save）与活动海报那一处 ———————————————————————
const SHARE = path.join(SRC, 'components/modal/share-modal.vue');
const shareSrc = fs.readFileSync(SHARE, 'utf8');
const posterSrc = fs.readFileSync(path.join(SRC, 'common/utils/poster-save.js'), 'utf8');
const envAndroid = { uni: {}, navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/120' } };
const envIphone = { uni: {}, navigator: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1) Safari/604.1' } };
const psAndroid = loadUtil('common/utils/poster-save.js', true, envAndroid);
const psIphone = loadUtil('common/utils/poster-save.js', true, envIphone);
const psMp = loadUtil('common/utils/poster-save.js', false, envAndroid);
assert('端判断只存 util 一处：微信内 / iOS 只能靠长按，Android 普通浏览器不算（它还有 a[download]）',
  psAndroid.longPressOnly(true) === true && psAndroid.longPressOnly(false) === false
  && psIphone.longPressOnly(false) === true, 'inWechat / UA 两档都按预期');
assert('小程序产物里这一档恒为 false（相册接口才是那两端的保存路，条件编译把 H5 那段整块吃掉）',
  psMp.longPressOnly(true) === false && psMp.longPressOnly(false) === false, 'MP 恒 false');
// 2026-09-28 用户点名「不能长按图片保存」：H5 画布出的是 data:，那是一段文档内容而不是图片资源，
// 微信内 / iOS Safari 长按它不弹「保存图片」。换地址只在本机做（atob → Blob → createObjectURL），
// 同一段字节不发一次请求——2026-09-27 那条「保存不许上传到商家后端」不许以任何形式长回来。
const envWeb = {
  uni: {},
  document: {},
  navigator: { userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/120' },
  atob: (b64) => Buffer.from(b64, 'base64').toString('binary'),
  Blob: function Blob(parts, opt) { this.type = opt && opt.type; this.size = parts[0] && parts[0].length; },
  URL: { createObjectURL: () => 'blob:poster-1' },
};
const psWeb = loadUtil('common/utils/poster-save.js', true, envWeb);
assert('data: 出图地址换成本机可长按的那一份；不是 data: 的（小程序临时路径等）原样给出去',
  psWeb.toSavableSrc(POSTER) === SAVABLE && psWeb.toSavableSrc('https://cdn.test/a.png') === 'https://cdn.test/a.png'
  && psWeb.toSavableSrc('') === '' && psWeb.toSavableSrc(null) === null, '换 / 不换两档都对');
assert('没有浏览器那几样时原样给出去（小程序与 App 那两端一个字都不受影响，不许硬换后炸掉）',
  psMp.toSavableSrc(POSTER) === POSTER && psAndroid.toSavableSrc(POSTER) === POSTER, '原样透传');
assert('换地址这一段不带任何一次网络调用：这一族的后端出图那条路 2026-09-27 已删，不许以任何形式长回来',
  !/\$api|uni\.request|uploadImage|XMLHttpRequest|fetch\(/.test(posterSrc), 'poster-save 里零网络调用');
// 只禁「自己抄一份要弹的文案」（组件里注释提到这句没关系，那是指路）
assert('提示文案只存 util 一份：弹层壳不再自己写一句「长按…」的 toast；util 里也没有 uploadImage 这回事',
  posterSrc.indexOf("savable: '长按图片可保存至相册'") !== -1 && posterSrc.indexOf('uploadImage') === -1
  && posterSrc.indexOf('$tools') === -1
  && !/title:\s*'长按图片可保存至相册'/.test(shellSrc) && !/title:\s*'长按图片可保存至相册'/.test(shareSrc),
  'shell 自带文案=' + /title:\s*'长按图片可保存至相册'/.test(shellSrc) + ' share 自带文案=' + /title:\s*'长按图片可保存至相册'/.test(shareSrc));
assert('两档海报共用同一只弹层壳：日签图与活动海报都渲染 tz-share-poster，出图那四条端路只存一处',
  shellSrc.indexOf('previewSavablePoster(src,') !== -1
  && /<tz-share-poster[^>]*layout="daily"/.test(adapterSrc)
  && /<tz-share-poster[^>]*layout="content"/.test(shareSrc)
  && shareSrc.indexOf('share.getPoster') === -1 && shareSrc.indexOf('posterThemes') === -1,
  '海报改前端画布，后端 getPoster 不再被这一处调用');

// ——————————————————————— 内容分享那一档（content 版式）与推荐语入口 ———————————————————————
// 2026-09-26 用户口径：全局分享弹窗照日签图那套改，海报上要画这一条内容自己的封面（参照竞品图），
// 图文文案收成底部样式条右侧的「推荐语」入口（只取文案，图片不进推荐语）
const CONTENT_POSTER = {
  nickname: '冯浩森', avatar: AVATAR, inviteText: '邀请你一起学习',
  name: '【最多人学】《贫穷的本质》视频全集', cover: 'https://cdn.test/cover.png',
  price: '360.00', priceMarking: '599.00', tag: '视频', subtitle: '吴晓波频道',
};
const contentVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: CONTENT_POSTER, codeSrc: 'wxfile://usr/code.png' });
assert('内容档海报：邀请头（头像+昵称+邀请语）、内容卡（只有封面 + 标题）、码与说明都出得来',
  contentVm.hasCard === true && contentVm.coverSrc === 'https://cdn.test/cover.png'
  && contentVm.name === CONTENT_POSTER.name
  && /class="sp-head"/.test(bodyTplRaw) && /class="sp-card"/.test(bodyTplRaw) && /class="sp-cover"/.test(bodyTplRaw)
  && /class="sp-name"/.test(bodyTplRaw) && /class="sp-codebox"/.test(bodyTplRaw) && /\{\{ codeCaption \}\}/.test(bodyTplRaw),
  'content 版式四块都在');
assert('内容卡已按要求简化：卡里不再有类型标签 / 现价 / 划线原价 / 店铺名（组件与调用点都不留这一份接口）',
  bodyTplRaw.indexOf('sp-tag') === -1 && bodyTplRaw.indexOf('sp-price') === -1 && bodyTplRaw.indexOf('sp-subtitle') === -1
  && bodySrc.indexOf('priceMarking') === -1 && bodySrc.indexOf('this.poster.tag') === -1
  && shareSrc.indexOf('payType') === -1 && shareSrc.indexOf('posterPrice') === -1
  && fs.readFileSync(path.join(SRC, 'pages/course/detail/detail.vue'), 'utf8').indexOf(':pay-type') === -1,
  '海报只承担「扫进去看这一条」，价格留在详情页说');
// 版式几何：内容卡的顶边 / 高度与码的位置全由 contentColumn 现算，POSTER_H 用共用那一份（不在脚本里再抄一个 400）
const POSTER_H = THEME.POSTER_H;
/** 取源码里某一个 CSS 选择器那一段（用来钉「这一块不许再写死高度/顶边」） */
const cssBlock = (src, sel) => (src.match(new RegExp('\\.' + sel + ' \\{[^}]*\\}')) || [''])[0];
/** 这一段 CSS 里有没有写死某一条几何（行高 line-height 不算 height:，别被它骗了） */
const cssHas = (block, prop) => new RegExp('[\\s;]' + prop + ':').test(block);
assert('内容卡：圆角 8 + 半透明白磨砂，竖排（封面 240×124 在上、标题紧跟其下），四边只 GAP 一档 12',
  /\.sp-card \{[\s\S]*?background: rgba\(255, 255, 255, 0\.86\);[\s\S]*?border-radius: 8px;[\s\S]*?padding: 12px/.test(bodySrc)
  && /\.sp-cover \{[\s\S]*?width: 240px;[\s\S]*?height: 124px;[\s\S]*?border-radius: 6px/.test(bodySrc)
  && /\.sp-name--under \{[\s\S]*?margin-top: 12px/.test(bodySrc)
  && bodySrc.indexOf("background: rgba(255, 255, 255, 0.86)") !== -1
  // 顶边与高度都不再写在 CSS 里（写了就有第二份真源，画布那份就会对不上）
  && !cssHas(cssBlock(bodySrc, 'sp-card'), 'height') && !cssHas(cssBlock(bodySrc, 'sp-card'), 'top')
  && !cssHas(cssBlock(bodySrc, 'sp-name'), 'height')
  && bodySrc.slice(bodySrc.indexOf('<style')).indexOf('backdrop-filter') === -1,
  '卡高与顶边只存 contentColumn 一处；磨砂靠透明度不靠 backdrop-filter（小程序不认）');
// 第六轮（2026-09-26 用户点名「内容区域上下间距不一致」）：上一版把两行标题的位置预留死了，
// 打卡活动 12638 那种四字名称只有一行，标题下面因此白摊着 19px —— 卡高与整列的顶边全交给算式
// 2026-09-27 用户口径：标题只占一行，放不下的那一档截掉补省略号（截断只存 nameLines 一处，两份读同一串）
const ONE_LINE_NAME = '闯关打卡';
const OVERLONG_NAME = '最多人学贫穷的本质视频全集最多人学贫穷的本质视频全集最多人学贫穷';
const TITLE_W = 240;   // 一行的可用宽（封面 240，标题与它同宽）
const TITLE_SIZE = 13;
const contentSeed = (name) => ({ layout: 'content', poster: { nickname: '甲', avatar: AVATAR, name: name, cover: 'https://cdn.test/cover.png' }, codeSrc: 'wxfile://usr/code.png' });
const oneLineVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, contentSeed(ONE_LINE_NAME));
const overlongVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, contentSeed(OVERLONG_NAME));
// 同一条内容，码还没回来的那一份（壳里 codePending 为真 → 本体按「码会在那一格」排版并盖遮罩）
const loadingVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: { nickname: '甲', avatar: AVATAR, name: ONE_LINE_NAME, cover: 'https://cdn.test/cover.png' } });
// 拿不到码的那一台（落点没给 / 取失败）：中间那一段要一直让到海报底，卡跟着这一段的中心走
const noCodeVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: { nickname: '甲', avatar: AVATAR, name: ONE_LINE_NAME, cover: 'https://cdn.test/cover.png' }, codeFailed: true });
// 日签图那一档（默认 layout=daily + codeId 628）同样有在取的这一刻
const dailyLoadVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, {});
assert('标题只占一行：四字名称与超长名称都只出一行，卡高恒 179（= 12 + 封面 124 + 12 + 行×19 + 12），不留某一头的空档',
  oneLineVm.nameLines.length === 1 && overlongVm.nameLines.length === 1
  && oneLineVm.contentColumn.cardH === 179 && overlongVm.contentColumn.cardH === 179,
  'one=' + oneLineVm.contentColumn.cardH + ' overlong=' + overlongVm.contentColumn.cardH);
const overTitle = overlongVm.nameLines[0];
assert('超长标题那一行截到放得下为止、末尾补省略号，且再多留一个字就放不下（截断与预览/画布同一份）',
  overTitle.slice(-1) === '…' && overTitle.length < OVERLONG_NAME.length
  && overTitle.slice(0, -1) === OVERLONG_NAME.slice(0, overTitle.length - 1)
  && THEME.textWidth(overTitle, TITLE_SIZE) <= TITLE_W
  && THEME.textWidth(OVERLONG_NAME.slice(0, overTitle.length) + '…', TITLE_SIZE) > TITLE_W,
  '画的这一行=' + overTitle + '（' + Math.round(THEME.textWidth(overTitle, TITLE_SIZE)) + ' ≤ ' + TITLE_W + '）');
assert('邀请头钉在海报顶（headTop 18）、那张码钉在底（qrTop 274 / 说明 366）：两个锚点到海报边缘的距离恒定，不跟着内容长短走；卡在那一段里居中且不与两头相压（2026-09-26 用户点名「二维码的位置应该固定在底部，不要跟随内容的高度变化而改变；个人信息的位置也是固定的」）',
  [oneLineVm, overlongVm].every((vm) => {
    const c = vm.contentColumn;
    return POSTER_H === 400 && c.headTop === 18 && c.qrTop === 274 && c.tipTop === 366
      && c.tipTop - (c.qrTop + 84) === 8
      && c.nameTop - (c.coverTop + 124) === 12
      && c.cardTop >= c.headTop + 44 + 12 && c.cardTop + c.cardH <= c.qrTop;
  })
  && oneLineVm.contentColumn.cardTop === 79 && overlongVm.contentColumn.cardTop === 79,
  '标题只占一行 ⇒ 长短名称同一档卡高，两段都在段头 74 之下居中到 79');
assert('没有码（落点没给或取失败）时中间那一段让到海报底（段底 370），卡跟着这一段的中心走，不会因为少了一块就整列往上贴',
  noCodeVm.codePlanned === false && noCodeVm.contentColumn.headTop === 18
  && noCodeVm.contentColumn.cardTop === 133 && noCodeVm.contentColumn.cardTop > oneLineVm.contentColumn.cardTop,
  'noCode cardTop=' + noCodeVm.contentColumn.cardTop + '（有码 79）');
const contentLog = [];
const contentEnv = cardEnv({ log: contentLog, isH5: false });
const contentDrawVm = cardVm(false, contentEnv, false,
  { layout: 'content', poster: CONTENT_POSTER, coverSizes: coverSizesOf(CONTENT_POSTER.cover, 200, 200), codeSrc: 'wxfile://usr/code.png' });
contentDrawVm.paintPoster(contentEnv.makeCtx(), () => true);
assert('内容封面画进画布：先按圆角 6 拼路径裁一遍，再按 aspectFill 居中裁切（200×200 铺 240×124 → 240×240、上下各切 58）',
  contentLog.indexOf('drawImage:https://cdn.test/cover.png,30,33,240x240') !== -1
  && contentLog.filter((l) => l === 'clip').length >= 2 && contentLog.indexOf('closePath') !== -1
  && bodySrc.indexOf('roundRect(ctx, cx, cy, COVER_W, COVER_H, COVER_R)') !== -1,
  JSON.stringify(contentLog.filter((l) => l.indexOf('drawImage') === 0 || l === 'clip' || l === 'closePath')));
assert('画布那一份的顶边读的就是 contentColumn（与预览 :style 同一个对象），一行标题就只画一行：卡顶 79 → 标题基线 241，码钉在 274、说明基线 378',
  bodySrc.indexOf('const col = this.contentColumn;') !== -1
  && contentLog.filter((l) => l.indexOf('fillText:') === 0).length === 4
  && contentLog.indexOf('fillText:冯浩森') !== -1 && contentLog.indexOf('fillText:邀请你一起学习') !== -1
  && contentLog.indexOf('fillText:【最多人学】《贫穷的本质》视频全集') !== -1
  && contentLog.indexOf('fillText:长按识别小程序码') !== -1
  && contentLog.indexOf('xy:【最多人学】《贫穷的本质》视频全集,30,241') !== -1
  && contentLog.indexOf('xy:长按识别小程序码,102,378') !== -1
  && contentLog.indexOf('drawImage:wxfile://usr/code.png,108,274,84x84') !== -1,
  JSON.stringify(contentLog.filter((l) => l.indexOf('fillText') === 0 || l.indexOf('drawImage') === 0 || l.indexOf('xy:【') === 0)));
assert('content 画布逐行与预览同一档字重：邀请头昵称 15 bold、卡里标题 13 bold，邀请语与码那句说明 12 normal',
  fontBefore(contentLog, '冯浩森') === 'normal bold 15px sans-serif'
  && fontBefore(contentLog, '【最多人学】《贫穷的本质》视频全集') === 'normal bold 13px sans-serif'
  && fontBefore(contentLog, '邀请你一起学习') === 'normal normal 12px sans-serif'
  && fontBefore(contentLog, '长按识别小程序码') === 'normal normal 12px sans-serif'
  && /\.sp-head-name \{[^}]*font-weight: bold/.test(bodySrc) && /\.sp-name \{[\s\S]*?font-weight: bold/.test(bodySrc)
  && !/\.sp-head-invite \{[^}]*font-weight/.test(bodySrc),
  '昵称=' + fontBefore(contentLog, '冯浩森') + ' 标题=' + fontBefore(contentLog, '【最多人学】《贫穷的本质》视频全集'));
const overlongLog = [];
const overlongEnv = cardEnv({ log: overlongLog, isH5: false });
const overlongDrawVm = cardVm(false, overlongEnv, false,
  { layout: 'content', poster: Object.assign({}, CONTENT_POSTER, { name: OVERLONG_NAME }), codeSrc: 'wxfile://usr/code.png' });
overlongDrawVm.paintPoster(overlongEnv.makeCtx(), () => true);
assert('超长标题画布也只画一行、画的就是预览那一串带省略号的（昵称/邀请语/标题/说明共四次 fillText），卡高 179、两个锚点一步不动',
  overlongLog.filter((l) => l.indexOf('fillText:') === 0).length === 4
  && overlongLog.indexOf('fillText:' + overTitle) !== -1
  && overlongLog.indexOf('xy:' + overTitle + ',30,241') !== -1
  && overlongDrawVm.contentColumn.cardH === 179 && overlongDrawVm.contentColumn.cardTop === 79
  && overlongDrawVm.contentColumn.qrTop === 274 && overlongDrawVm.contentColumn.headTop === 18,
  JSON.stringify(overlongLog.filter((l) => l.indexOf('fillText') === 0)) + ' qr=' + overlongDrawVm.contentColumn.qrTop);
// 2026-10-05 用户口径（直播间分享弹窗）：「如果图片加载失败或没有，可以使用系统logo 填充」。
// 三态分别验，且顺序不能反：内容封面 → 系统 logo → 两枚都取不到才不画封面那一格。
const noCoverVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: { nickname: '甲', name: '只有名字' }, codeSrc: 'x.png' });
assert('内容没下发封面：那一格填系统 logo（不是留一块白），卡高仍是 179、标题照样紧跟封面之下',
  noCoverVm.coverSrc === SITE_LOGO && noCoverVm.hasCard === true
  && noCoverVm.contentColumn.cardH === 179
  && noCoverVm.contentColumn.nameTop === noCoverVm.contentColumn.coverTop + 124 + 12
  && /:class="coverSrc \? 'sp-name--under' : ''"/.test(bodyTplRaw),
  'coverSrc=' + noCoverVm.coverSrc + ' cardH=' + noCoverVm.contentColumn.cardH
  + ' nameTop=' + noCoverVm.contentColumn.nameTop + ' coverTop=' + noCoverVm.contentColumn.coverTop);
const brokenCoverVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: { nickname: '甲', name: '只有名字', cover: CONTENT_POSTER.cover }, codeSrc: 'x.png' });
brokenCoverVm.onCoverError();
assert('内容封面加载失败：换成系统 logo 那一枚（失败按 mpKey(地址) 记，不是一只好不了的全局开关）',
  brokenCoverVm.coverSrc === SITE_LOGO && brokenCoverVm.coverErrors[MPKEY(CONTENT_POSTER.cover)] === true,
  'coverSrc=' + brokenCoverVm.coverSrc);
// 预览换了还不够：画布那一份必须画同一枚（存下来/分享出去的那张图上不能是空的一块），
// 且按 logo 自己的宽高裁（400×200 铺 240×124 → 248×124、左右各切 4），不拿内容封面的尺寸裁它
const logoLog = [];
const logoEnv = cardEnv({ log: logoLog, isH5: false });
const brokenCoverDrawVm = cardVm(false, logoEnv, false,
  { layout: 'content', poster: { nickname: '甲', avatar: AVATAR, name: '只有名字', cover: CONTENT_POSTER.cover },
    coverSizes: coverSizesOf(SITE_LOGO, 400, 200), codeSrc: 'x.png' });
brokenCoverDrawVm.onCoverError();
brokenCoverDrawVm.paintPoster(logoEnv.makeCtx(), () => true);
assert('退回系统 logo 后画布画的是 logo 那一枚、并按 logo 自己的宽高居中裁切（尺寸按此刻摆着的那一枚取，不按内容封面）',
  brokenCoverDrawVm.coverSrc === SITE_LOGO
  && logoLog.indexOf('drawImage:' + SITE_LOGO + ',26,91,248x124') !== -1
  && logoLog.filter((l) => l.indexOf('drawImage:' + CONTENT_POSTER.cover) === 0).length === 0,
  JSON.stringify(logoLog.filter((l) => l.indexOf('drawImage') === 0)));
const brokenLogoVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: { nickname: '甲', avatar: AVATAR, name: '只有名字' }, codeSrc: 'x.png' });
brokenLogoVm.onCoverError();
assert('系统 logo 自己也加载失败：不再摆它（assetsReady 只等真摆出来的那一格，否则整张永久盖在「加载中」），退回没有封面的 43 高那一档',
  brokenLogoVm.coverSrc === '' && brokenLogoVm.assetsReady === true
  && brokenLogoVm.contentColumn.cardH === 43 && brokenLogoVm.contentColumn.nameTop === brokenLogoVm.contentColumn.coverTop,
  'coverSrc=' + brokenLogoVm.coverSrc + ' cardH=' + brokenLogoVm.contentColumn.cardH
  + ' assetsReady=' + brokenLogoVm.assetsReady);
const noLogoVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { $tools: { systemConfig: (k) => (k === 'logo' ? '' : true) } , layout: 'content',
    poster: { nickname: '甲', name: '只有名字' }, codeSrc: 'x.png' });
assert('站点没配 logo（或组件不在 Vue 原型上）：退回改造前那一档，不因兜底本身出问题而让海报画不出来',
  noLogoVm.coverSrc === '' && noLogoVm.hasCard === true && noLogoVm.contentColumn.cardH === 43,
  'coverSrc=' + noLogoVm.coverSrc + ' cardH=' + noLogoVm.contentColumn.cardH);
assert('封面尺寸表按 mpKey(地址) 存（这一格会在内容封面与 logo 之间换一枚，共用一份尺寸会把 logo 按上一张的比例裁掉）',
  /if \(w && h\) this\.\$set\(this\.coverSizes, mpKey\(this\.coverSrc\)/.test(bodySrc)
  && /this\.coverSizes\[mpKey\(this\.coverSrc\)\]/.test(bodySrc)
  && bodySrc.indexOf('this.coverSize;') === -1 && bodySrc.indexOf('coverFailed = true') === -1,
  'coverSizes 读写两处都过 mpKey(coverSrc)');
assert('logo 兜底读的是站点配置那一张（与 $nav.share / 微信卡片同一份口径，不在前端写死一张图）',
  /this\.\$tools\.systemConfig\('logo'\)/.test(bodySrc)
  // 本组件只许写死头像兜底那一张（DEFAULT_AVATAR，与全站用户卡同一份）；封面这一格不许再写死任何静态图
  && (bodySrc.match(/'\/static\/[^']*'/g) || []).every((u) => u === "'/static/image/default-avatar.png'"),
  '走 $tools.systemConfig(\'logo\')；写死的静态图只剩头像兜底那一张');
const emptyVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: { nickname: '甲' }, codeSrc: 'x.png' });
assert('连名称都没有：整块内容卡不出（logo 是所有内容共用的一枚兜底，不拿它当「这一条有内容」的证据），两个锚点照样在原地（headTop 18 / qrTop 274 / 说明 366，海报不会出现半张空卡，码也不会跟着往上跑）',
  emptyVm.hasCard === false && emptyVm.contentColumn.cardH === 0 && emptyVm.contentColumn.cardTop === 0
  && emptyVm.contentColumn.headTop === 18 && emptyVm.contentColumn.qrTop === 274
  && emptyVm.contentColumn.tipTop === POSTER_H - 18 - 16
  && emptyVm.contentColumn.qrTop === oneLineVm.contentColumn.qrTop
  && emptyVm.contentColumn.headTop === oneLineVm.contentColumn.headTop,
  'head=' + emptyVm.contentColumn.headTop + ' qr=' + emptyVm.contentColumn.qrTop + ' tip=' + emptyVm.contentColumn.tipTop);
// ———— 第六轮之「加载中要有样子」＋ 同日第七轮（用户点名：零散骨架块太丑，换成盖满整张海报的一块遮罩）————
assert('码还在取：那一格仍先按到手那一档占好位置（codePlanned，版式不跳）',
  oneLineVm.codePlanned === true
  && loadingVm.contentColumn.qrTop === oneLineVm.contentColumn.qrTop,
  'qrTop=' + loadingVm.contentColumn.qrTop);
assert('素材（头像/底图/封面）或码还有没到手的 → 整张海报盖加载遮罩；全部到手就撤',
  loadingVm.shadeLoading === true && dailyLoadVm.shadeLoading === true
  && contentDrawVm.shadeLoading === false
  && cardVm(false, cardEnv({ log: [], isH5: false }), false,
    { layout: 'content', poster: CONTENT_POSTER, coverSizes: coverSizesOf(CONTENT_POSTER.cover, 200, 200) }).shadeLoading === true,
  '素材没齐 / 码在取 / 重画在路上 都盖着，齐了就撤：content=' + contentDrawVm.shadeLoading
  + '（assetsReady=' + contentDrawVm.assetsReady + ' codeLoading=' + contentDrawVm.codeLoading
  + ' renderLoading=' + contentDrawVm.renderLoading + '）');
// 2026-09-28 用户点名（H5 课程详情 → 分享）：「加载中先关掉、二维码还没出来，过一会儿又变加载中，
// 码好了才关」——遮罩中间断了这一次。旧顺序里「已经出过一张」压过「码还在取」，
// 素材先齐、码后到就会先出一张没有码的海报并撤遮罩，码到手重画时又盖上。
const halfDrawnVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { layout: 'content', poster: CONTENT_POSTER, coverSizes: coverSizesOf(CONTENT_POSTER.cover, 200, 200), renderedSrc: 'data:image/png;base64=没有码的那一张' });
assert('素材先齐、码还在取：先出的那一张没有码也**不许撤遮罩**，一直盖到码到手重画完（或码失败/超时收口）才撤',
  halfDrawnVm.codeLoading === true && !!halfDrawnVm.renderedSrc && halfDrawnVm.shadeLoading === true
  && cardVm(false, cardEnv({ log: [], isH5: false }), false,
    { layout: 'content', poster: CONTENT_POSTER, coverSizes: coverSizesOf(CONTENT_POSTER.cover, 200, 200), codeSrc: 'wxfile://usr/code.png', renderedSrc: 'x' }).shadeLoading === false
  && cardVm(false, cardEnv({ log: [], isH5: false }), false,
    { layout: 'content', poster: CONTENT_POSTER, coverSizes: coverSizesOf(CONTENT_POSTER.cover, 200, 200), codeFailed: true, renderedSrc: 'x' }).shadeLoading === false,
  '整条链（素材 + 码 + 出图）收尾之前不撤：已出图 + 码在取 = 仍盖着；码到手 / 码失败（含超时）= 撤，中间不留那一拍空窗');

assert('遮罩挂在海报根节点最上层（排在渲染图与那两枚动作之后），盖满海报、圆角与海报同档 8px、黑底浅透明带「加载中」',
  /class="sp-shade" v-if="shadeLoading"/.test(bodyTplRaw)
  && bodyTplRaw.indexOf('class="sp-rendered"') < bodyTplRaw.indexOf('class="sp-shade"')
  && bodyTplRaw.indexOf('class="sp-acts"') < bodyTplRaw.indexOf('class="sp-shade"')
  && /\.sp-shade \{[\s\S]*?border-radius: 8px;[\s\S]*?background: rgba\(0, 0, 0, 0\.55\)/.test(bodySrc)
  && bodyTplRaw.indexOf('加载中') !== -1,
  '层级：排版 → 渲染图 → 动作 → 遮罩；磨砂只能靠透明度（backdrop-filter 小程序不认）');
const drawCode = bodySrc.slice(bodySrc.indexOf('drawPoster(done, level) {'), bodySrc.indexOf('</script>'));
assert('画布那一份完全不读加载态（保存与分享出去的那张图上不会带上这层遮罩），只有 codeSrc 到手才 drawImage',
  drawCode !== '' && drawCode.indexOf('codeLoading') === -1 && drawCode.indexOf('shadeLoading') === -1
  && drawCode.indexOf('sp-shade') === -1 && /if \(this\.codeSrc\) \{/.test(drawCode),
  '出图那一段里判的就只有 codeSrc');
assert('「在取」只有真的发过请求才算：没有落点不请求也不盖灰，取失败另有面板里那句说明（不两块都盖）',
  cardVm(false, cardEnv({ log: [], isH5: false }), false, { codeSrc: 'x.png' }).codePending === false
  && cardVm(false, cardEnv({ log: [], isH5: false }), false, { codeFailed: true }).codePending === false
  && cardVm(false, cardEnv({ log: [], isH5: false }), false, { codeId: 0 }).codePending === false
  && cardVm(false, cardEnv({ log: [], isH5: false }), false).codePending === true,
  '默认 628 在取 / 到手·失败·无落点 都不取');
assert('推荐语入口：文案在取时整格换成骨架块（区域遮罩那档），点它说「正在获取」，不静默也不收起',
  /<u-skeleton v-if="recommendLoading"/.test(sheetTpl) && /v-else>[\s\S]*?edit-pen/.test(sheetTpl)
  && /class="sh-recommend" v-if="showRecommend" @tap="onRecommend"/.test(shellSrc)
  && /onRecommend\(\) \{[\s\S]*?this\.recommendLoading[\s\S]*?推荐语正在获取，请稍候[\s\S]*?\$emit\('recommend'\)/.test(shellSrc),
  '入口在取的时候就在，只是还点不开（M13/M16）');
assert('推荐语入口的判据收在调用点：有文案或正在取才出，首次就失败整枚不出',
  /:show-recommend="!!article\.text \|\| articleLoading"/.test(shareSrc)
  && /:recommend-loading="articleLoading"/.test(shareSrc), '弹窗自己不再判一次');
// 内容档多出来的那一层（封面）也要能丢：外域封面没给 CORS 头会把整条出图路卡住
const contentFailLog = [];
const contentFailEnv = cardEnv({ log: contentFailLog, isH5: false, tempFilePath: 'fail' });
const contentFailVm = cardVm(false, contentFailEnv, false, { layout: 'content', poster: CONTENT_POSTER });
contentFailVm.paintPoster(contentFailEnv.makeCtx(), () => true);
assert('内容封面出图失败：按「头像 → 封面 → 底图」逐层退，每一档都真少画一样东西（M13 不能出不来图）',
  JSON.stringify(contentFailVm.degradeChain) === '["avatar","cover","bg"]'
  && contentFailVm.degradeLevel(0) === 1 && contentFailVm.degradeLevel(1) === 2
  && contentFailVm.degradeLevel(2) === 2,
  'chain=' + JSON.stringify(contentFailVm.degradeChain));
// 推荐语入口：样式条右侧固定一枚，点了才弹；没有文案就不出这枚（不留点了没反应的按钮）
const recSrc = fs.readFileSync(RECOMMEND, 'utf8');
const recTpl = readTpl(RECOMMEND);
assert('骨架的 rows-width 一律绑成数组：写成静态属性就是一条字符串，u-skeleton 认不出，最后一行收档那一档白写',
  !/[^:]rows-width="/.test(bodySrc + shellSrc + recSrc)
  && /:rows-width="\['100%', '92%', '56%'\]"/.test(recSrc), '（海报本体的骨架已换成整张遮罩，剩弹层壳 / 推荐语弹窗两处）都用冒号绑定');
assert('推荐语入口在底部样式条右侧（scroll-view 之外，跟着样式一起滑就会被滑走）',
  /class="ck-daily-themes-row"/.test(sheetTpl) && sheetTpl.indexOf('ck-daily-themes-row') < sheetTpl.indexOf('scroll-view')
  && /class="ck-daily-recommend" v-if="showRecommend"/.test(sheetTpl)
  && sheetTpl.indexOf('ck-daily-recommend') > sheetTpl.indexOf('ck-daily-themes'),
  '一行：左滑样式 + 右固定推荐语');
assert('推荐语弹窗只吃文案、忽略图片，且带「换一条」与「复制文案」（参照竞品图二）',
  recSrc.indexOf('article.poster') === -1 && /text: \{ type: String/.test(recSrc)
  && /\$emit\('change'\)/.test(recSrc) && /text="复制文案"/.test(recTpl) && /tz-button/.test(recTpl),
  '文案单一入参 + 换一条 + 复制');
assert('推荐语取的是分享图文接口，复制在点击的同步栈里读缓存（H5 的 execCommand 脱离手势就失效）',
  shareSrc.indexOf("share.getArticle") !== -1 && /copyArticle\(\)[\s\S]*?setClipboardData\(\{\s*data: that\.article\.text/.test(shareSrc)
  && /if \(!that\.article\.text\)/.test(shareSrc), '缓存为空要说原因（M13）');
// 画布渐变构造器两端不同名：H5 只有 createCircularGradient，小程序两个名字都有。
// 只按小程序那套写，H5 就会抛「ctx.createRadialGradient is not a function」——整张海报出不来图
const gradLog = [];
const h5Ctx = { setFillStyle: (v) => gradLog.push('fillStyle:' + (typeof v === 'string' ? v : 'gradient')), fillRect: () => gradLog.push('fillRect'), createCircularGradient: (x, y, r) => { gradLog.push('circular:' + x + ',' + y + ',' + r); return { addColorStop: () => {} }; } };
const mpCtx = { setFillStyle: () => {}, fillRect: () => {}, createRadialGradient: (x0, y0, r0, x1, y1, r1) => { gradLog.push('radial2'); return { addColorStop: () => {} }; } };
const bareCtx = { setFillStyle: () => {}, fillRect: () => gradLog.push('bareFill') };
THEME.drawTheme(h5Ctx, THEME.POSTER_THEMES[0], 300, 400);
THEME.drawTheme(mpCtx, THEME.POSTER_THEMES[0], 300, 400);
let bareThrew = false;
try { THEME.drawTheme(bareCtx, THEME.POSTER_THEMES[0], 300, 400); } catch (e) { bareThrew = true; }
assert('画布那团高光按这一端有的名字取：优先两端都有的 createCircularGradient，H5 不再碰 createRadialGradient',
  gradLog.filter((l) => l.indexOf('circular:') === 0).length === THEME.POSTER_THEMES[0].blobs.length
  && gradLog.indexOf('radial2') !== -1 && !bareThrew && gradLog.indexOf('bareFill') !== -1,
  JSON.stringify(gradLog.filter((l) => l.indexOf('circular') === 0 || l === 'radial2' || l === 'bareFill')));
assert('这一端两个构造器都没有时只铺底色（宁可平一点，也不能让保存/分享抛错出不来图，M13）',
  /typeof ctx\.createCircularGradient === 'function'/.test(themeSrc)
  && /typeof ctx\.createRadialGradient === 'function'/.test(themeSrc)
  && /catch \(e\) \{/.test(themeSrc) && /if \(!g\) continue;/.test(bodySrc + themeSrc),
  '判名字 + try 兜底 + 拿不到就跳过那一团');

// ————————————————— 用户点名的四条（2026-09-26 第二轮）—————————————————
// ① 推荐语弹窗要整篇可见、标题与关闭走参照弹窗那一档；② 海报要在弹层显示时就渲染成图片（长按存得下）；
// ③ 舞台在「面板顶到页面顶」之间垂直居中且点空白可关；④ 推荐语入口要有边框阴影。
const BANPC = path.join(SRC, 'pages/public/banpc/js.vue');
const banpcSrc = fs.readFileSync(BANPC, 'utf8') + readTpl(path.join(SRC, 'pages/public/banpc/banpc.vue'));
assert('推荐语弹窗整篇可见：不套滚动区，且文案块有 220px 起的高度（第二轮用户仍嫌矮，在原 96 那一档上加 100px）',
  recSrc.indexOf('scroll-view') === -1 && recSrc.indexOf('rc-scroll') === -1
  && Number(((recSrc.match(/\.rc-box \{[^}]*?min-height:\s*(\d+)px/) || [])[1] || 0)) >= 200,
  'min-height=' + ((recSrc.match(/\.rc-box \{[^}]*?min-height:\s*(\d+)px/) || [])[1] || 0));
assert('取文案中：加载态只在文案块里，两枚按钮常驻置灰禁用（收掉会让弹层高度跳、也读不出为什么没响应）',
  recTpl.indexOf('v-if="!loading"') === -1 && /:class="loading \? 'rc-change--disabled'/.test(recTpl)
  && /:disabled="loading"/.test(recTpl) && /v-if="loading \|\| text"/.test(recTpl)
  && /onChange\(\)\s*\{[\s\S]*?loading[\s\S]*?推荐语正在获取/.test(recSrc)
  && /\.rc-change--disabled \{[\s\S]*?opacity: 0\.45/.test(recSrc),
  '禁用态有样式也有出口（M13 不静默）');
assert('推荐语弹窗的标题与关闭走 tz-nickname-modal 同一档（u-popup closeable + 16px/600 左对齐 + 面板内衬 0 16 20）',
  /:closeable="true"/.test(recTpl) && recSrc.indexOf('rc-close') === -1
  && /\.rc-title \{[\s\S]*?padding: 15px 0 12px;[\s\S]*?font-size: 16px;[\s\S]*?font-weight: 600;[\s\S]*?text-align: left/.test(recSrc)
  && /\.rc \{[\s\S]*?padding: 0 16px 20px/.test(recSrc), '关闭交给 u-popup，标题档逐值一致');
assert('弹层一显示就把海报渲染成图片：先等素材 load 到手，再出图盖在排版之上（长按存的就是这一张）',
  /assetsReady\(\)/.test(bodySrc) && /if \(this\.avatarSrc && this\.avatarLoaded !== this\.avatarSrc\) return false/.test(bodySrc)
  && /renderNow\(attempt\)/.test(shellSrc) && /body\.assetsReady && attempt < RENDER_RETRY/.test(shellSrc)
  && /class="sp-rendered" v-if="renderedSrc"/.test(bodyTplRaw)
  && /active: \{[\s\S]*?this\.loadCode\(\);[\s\S]*?this\.scheduleRender\(\)/.test(shellSrc),
  'assetsReady + 重试 + 渲染图覆盖 + 一在场就出图');
const renderBody = ((shellSrc.match(/renderNow\(attempt\) \{[\s\S]*?\n\t\t\},/) || [''])[0]);
assert('保存与渲染都不发上传请求（2026-09-26「弹层一开就打 api/common/upload」＋2026-09-27「点保存也不要上传」）——只用画布自己出的地址',
  renderBody !== '' && renderBody.indexOf('uploadImage') === -1 && /this\.cache\(\)\[key\]/.test(shellSrc)
  && shellSrc.indexOf('uploadImage') === -1
  && (shellSrc.match(/previewSavablePoster\(/g) || []).length === 1
  && /previewPosterH5\(src\) \{[\s\S]*?previewSavablePoster\(src,/.test(shellSrc),
  '整只组件不出现 uploadImage，调用 poster-save 只一处（poster-save 自己那份已不含上传）');

// ————————————————————— 组件：换样式档时不许两帧交替（2026-09-27 用户点名「头像、昵称还是会上下跳动」）—————————————————————
// 弹层里有两套渲染器：底下那一版 DOM 排版 + 盖在它上面的画布图。旧代码每次换档先把 renderedSrc 清空，
// 于是「排版那一帧（按浏览器字体度量排）→ 画布那一帧（按 setFont/基线模型画）」交替出现一次，
// 两份即便数值同源，字体度量与图片裁切也不可能逐像素相等 ⇒ 每点一次就跳一次。
// 现在：新图没回来就留着上一张并盖海报遮罩；看过的档直接从缓存换上（连遮罩都不闪）。
const swVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { themeIndex: 0 });
swVm.renderedSrc = 'data:old-poster';
swVm.scheduleRender();
assert('换档重画期间不清空 renderedSrc：留着上一张海报 + 盖加载遮罩，绝不退回底下那一版 DOM 排版',
  swVm.renderedSrc === 'data:old-poster' && swVm.renderPending === true
  && !/renderKey\(\) \{[\s\S]{0,80}this\.renderedSrc = ''/.test(shellSrc)
  && (shellSrc.match(/:render-loading="renderPending"/g) || []).length === 2
  && /if \(this\.renderLoading === true\) return true;[\s\S]*?if \(this\.codeLoading\) return true;[\s\S]*?if \(this\.renderedSrc \|\| this\.renderFailed\) return false;[\s\S]*?return !this\.assetsReady;/.test(bodySrc),
  'renderedSrc=' + swVm.renderedSrc + ' pending=' + swVm.renderPending
  + ' 弹层与 inline 两处都传=' + (shellSrc.match(/:render-loading="renderPending"/g) || []).length);
const swKey = swVm.renderKey;
swVm.setRendered(swKey, 'data:new-poster');
assert('新图回来就整张一次换掉并撤遮罩（两帧不再同屏交替，头像/昵称没有可跳的那一步）',
  swVm.renderedSrc === 'data:new-poster' && swVm.renderPending === false,
  'renderedSrc=' + swVm.renderedSrc + ' pending=' + swVm.renderPending);
swVm.themeIndex = 1;
const swKey2 = swVm.renderKey;
swVm.scheduleRender();
swVm.setRendered(swKey2, 'data:cached');
swVm.scheduleRender();
assert('看过的样式档直接从缓存换上：不重画也不闪一下遮罩（连点同一排选项时只剩整张干净地换掉）',
  swVm.renderedSrc === 'data:cached' && swVm.renderPending === false,
  '二次 scheduleRender → renderedSrc=' + swVm.renderedSrc + ' pending=' + swVm.renderPending);
const failVm = cardVm(false, cardEnv({ log: [], isH5: false, tempFilePath: '' }), false, { show: true, themeIndex: 3 });
failVm.renderedSrc = 'data:old-poster';
// 出图那一步换成同步的失败回调（微信端 2d 那条链是异步的，这里要钉的是失败收尾那一支）
failVm.drawPoster = (cb) => cb('');
failVm.renderNow(0);
assert('出图失败仍然退回排版那一帧并撤遮罩（宁可露排版，也不能把上一档样式的旧图一直挂在选中的这一档上）',
  failVm.renderPending === false && failVm.renderedSrc === '',
  'pending=' + failVm.renderPending + ' renderedSrc=' + (failVm.renderedSrc || '空（退回排版）'));
// 2026-09-28 用户点名「内容分享海报一直显示加载中」：出图最多等 RENDER_RETRY 那几拍，等不到就按
// 到手那一档先画一张（宁可少画一层也不卡住），可遮罩此前仍按「素材到手」判 —— 一枚永远取不到的图
// 就把整张海报永久盖在「加载中」，看着像保存与分享都坏了。遮罩只许跟「还在等的那一段」
// 码那一腿这里给成已收尾（到手），这三条测的是「出图那一腿」的出口；码在取时遮罩归谁管见下面那两条
const shadeVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { avatarLoaded: '', codeSrc: 'wxfile://usr/code.png' });
shadeVm.renderedSrc = 'data:done';
assert('素材没齐但图已经出好：遮罩撤掉（长按存的就是这一张，不能再盖着）',
  shadeVm.assetsReady === false && shadeVm.shadeLoading === false,
  'assetsReady=' + shadeVm.assetsReady + ' shade=' + shadeVm.shadeLoading);
shadeVm.renderedSrc = '';
shadeVm.renderFailed = true;
assert('出图失败（连退档都没画出来）：遮罩同样撤，露出底下那一版排版',
  shadeVm.shadeLoading === false, 'renderFailed=' + shadeVm.renderFailed + ' shade=' + shadeVm.shadeLoading);
shadeVm.renderFailed = false;
assert('首帧还没出、素材仍缺：遮罩照旧盖着（不许退回「什么都不盖」那一段）',
  shadeVm.shadeLoading === true, 'shade=' + shadeVm.shadeLoading);
// 头像那枚兜底图自己取不到时，报错要记「此刻摆在海报上的那一张」：账号没头像时 this.avatar 是空串，
// 只记它等于什么都没记，assetsReady 会一直等一张永远不会回音的图
const fbVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { avatar: '' });
assert('账号没头像：摆兜底图', fbVm.avatarSrc === '/static/image/default-avatar.png', fbVm.avatarSrc);
fbVm.onAvatarError();
assert('兜底图也取不到：不再摆它，assetsReady 不为一枚不回音的图卡住整张海报',
  fbVm.avatarSrc === '' && fbVm.assetsReady === true,
  'avatarSrc=' + JSON.stringify(fbVm.avatarSrc) + ' assetsReady=' + fbVm.assetsReady);

// ————————————————————— 组件：头像那一格的裁切与落位也是镜像项 —————————————————————
// 预览是 <image mode="aspectFill">（等比放大到盖满方框、多出来的两边均分切掉），画布此前直接
// drawImage 进 26×26 = 把整张图压进框里；竖图头像在两帧之间就是「人像被压扁 / 上下移」
const avaLog = [];
const avaEnv = cardEnv({ log: avaLog, isH5: false });
cardVm(false, avaEnv, false, { avatarSizes: { [mpKey(AVATAR)]: { w: 26, h: 52 } } })
  .paintPoster(avaEnv.makeCtx(), () => true);
assert('头像画进画布走与预览同一刀 aspectFill（200×400 铺 26×26 → 26×52、上下各切 13），不再把整张图压进方框',
  avaLog.indexOf('drawImage:' + AVATAR + ',' + DAILY_X + ',323,26x52') !== -1
  && avaLog.indexOf('drawImage:' + AVATAR + ',' + DAILY_X + ',336,26x26') === -1,
  JSON.stringify(avaLog.filter((l) => l.indexOf('drawImage:') === 0)));
assert('原图宽高没到手时退回整框（与改造前逐字一致，不因取不到尺寸就少画一层）',
  canvasLog.indexOf('drawImage:' + AVATAR + ',' + DAILY_X + ',336,26x26') !== -1,
  JSON.stringify(canvasLog.filter((l) => l.indexOf('drawImage:') === 0)));
assert('content 档的头像在那一行里垂直居中（行高 44 装 40 的圆 → 顶边比行顶低 2，此前钉在行顶差 2px）',
  contentLog.indexOf('arc:38,40,20') !== -1
  && contentLog.indexOf('drawImage:' + AVATAR + ',18,20,40x40') !== -1,
  JSON.stringify(contentLog.filter((l) => l.indexOf('arc:') === 0 || l.indexOf('drawImage:') === 0)));
assert('aspectFill 那一刀收在 poster-theme 一处（底图/封面/头像三份共用同一个算式，不在组件里各写一遍）',
  /function aspectFill\(size, boxW, boxH\)/.test(themeSrc)
  && /const k = Math\.max\(boxW \/ size\.w, h \/ size\.h\);/.test(themeSrc)
  && /aspectFill\(this\.avatarSizes\[mpKey\(this\.avatarSrc\)\], AVA\)/.test(bodySrc)
  && /aspectFill\(this\.avatarSizes\[mpKey\(this\.avatarSrc\)\], HEAD_AVATAR\)/.test(bodySrc),
  '头像两处都走同一枚 helper');
assert('两枚金句动作挂在渲染图之上（图盖住排版之后，底下那两枚就点不到了）',
  bodyTplRaw.indexOf('class="sp-acts" v-if="layout === \'daily\'"') !== -1
  && bodyTplRaw.indexOf('sp-rendered') < bodyTplRaw.indexOf('class="sp-acts"')
  && bodyTplRaw.indexOf('class="sp-layer"') < bodyTplRaw.indexOf('sp-rendered'),
  '层级：排版 → 渲染图 → 两枚动作');
assert('海报舞台垂直居中在「面板顶到页面顶」那一段（视口比海报高就把整段用上）',
  /\.sh-stage \{[\s\S]*?align-items: center/.test(shellSrc)
  && /const avail = this\.viewportH - SHEET_H;[\s\S]*?return avail > need \? avail : need/.test(shellSrc),
  'stageHeight = max(海报所需, 视口 − 面板)');
const centerVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { viewportH: 900 });
const tightVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { viewportH: 520 });
assert('高屏舞台用满那一段、矮屏退化成海报本身那一档（不留一段假空，也不把面板顶出屏）',
  centerVm.stageHeight === 900 - 196 && centerVm.posterScale === 1
  && tightVm.stageHeight === Math.round(400 * tightVm.posterScale + 24) && tightVm.posterScale < 1,
  '900→' + centerVm.stageHeight + ' / 520→' + tightVm.stageHeight + ' scale=' + tightVm.posterScale.toFixed(2));
assert('点海报上方那段空白能关弹层（u-popup 内容节点自带 @tap.stop，遮罩收不到这一下，只能这一段自己接）',
  /class="ck-daily-stage"[^>]*@tap="close"/.test(sheetTpl) && /class="ck-daily-poster" @tap\.stop/.test(sheetTpl),
  '空白关、点图不关');
const recBox = cssBlock(shellSrc, 'sh-recommend');
assert('推荐语入口描边 + 阴影第四轮再调：圆角 5→15、投影范围放到当前一倍（0 2px 8px）、颜色再浅一档（4% 黑）',
  /border: 1px solid #e5e6eb;/.test(recBox) && /box-shadow: 0 2px 8px rgba\(29, 33, 41, 0\.04\);/.test(recBox)
  && /border-radius: 15px;/.test(recBox), '圆角 15 + 0 2px 8px / 4% 黑（用户点名，M21 的例外已登记基线）');
assert('推荐语入口与左侧样式条垂直居中：那 8px 下方留边挂在「行」上而不是 scroll-view 上，色板那一段也不再被行盒撑高',
  /\.sh-themes-row \{[^}]*align-items: center;[^}]*padding-bottom: 8px/.test(shellSrc)
  && cssBlock(shellSrc, 'sh-themes').indexOf('padding-bottom') === -1
  && cssBlock(shellSrc, 'sh-themes').indexOf('line-height: 0') !== -1
  && cssBlock(shellSrc, 'sh-theme').indexOf('vertical-align: top') !== -1,
  'scroll-view 自己吃 8px 时它比色板高 8，居中线就不是一条（用户点名的「与左侧样式选项垂直居中对齐」）');
assert('PC 限制提示页那张海报也改前端画（不再让后端合图，全站海报一律用户端生成）',
  banpcSrc.indexOf('share.getPoster') === -1 && /<tz-share-poster inline/.test(banpcSrc)
  && /previewSavablePoster\(that\.rendered/.test(banpcSrc)
  && banpcSrc.indexOf('share-poster-img') === -1, 'banpc 走 inline 档 + 出图回调');

// ————————————————————————————————————————————— 组件：分享 —————————————————————————————————————————————
// ——————————————————————— 小程序端兼容复核（2026-09-26 review）———————————————————————
// 打卡日记页同时挂着「全局分享弹窗」与「日签图弹层」两只 tz-share-poster-body，而 uni-h5 的
// createCanvasContext(id, this) 只按页面 id 找节点（canvas.js:788-791 用的是 context.$page.id），
// 同页两个同名 canvas-id 会让第二只画到第一张上、导出的也是错的那一张
assert('画布 id 每只实例唯一（同页两只弹层不串图）：模板绑 :canvas-id，出图与导出都读 this.canvasId',
  /:canvas-id="canvasId" :id="canvasId"/.test(bodyTplRaw)
  && bodySrc.indexOf("canvasId: 'spPosterCanvas-' + (++uidSeq)") !== -1
  && bodySrc.indexOf('uni.createCanvasContext(this.canvasId, this)') !== -1
  && bodySrc.indexOf('canvasId: self.canvasId,') !== -1
  && bodySrc.indexOf('get2dCanvas(this, this.canvasId, POSTER_W, POSTER_H)') !== -1,
  '唯一号 + 出图与导出（两端各一条）都按实例取');
assert('样式条的滚动条两端都收：微信要 enhanced + show-scrollbar 成对给，H5 靠 ::-webkit-scrollbar',
  /:enhanced="true" :show-scrollbar="false"/.test(sheetTpl)
  && shellSrc.indexOf('.sh-themes ::-webkit-scrollbar') !== -1
  && shellSrc.indexOf('ifdef  H5') !== -1, '小程序认 enhanced，uni 的 H5 运行时不认 show-scrollbar');
assert('原生 wx.* 全部关在 #ifdef MP-WEIXIN 里（H5 产物干净；抖音端走 emit 交回页面复制链接）',
  conditional(shellSrc, true).indexOf('wx.showShareImageMenu') === -1
  && conditional(shellSrc, false).indexOf('wx.showShareImageMenu') !== -1
  && conditional(shellSrc, true).indexOf('wx.env') === -1, 'H5 产物里没有 wx.*');
assert('两端都有的画布 API 才用：圆角自拼（不调 drawRoundedRect）、渐变按端取名（不调 createRadialGradient）',
  !/ctx\.drawRoundedRect\s*\(/.test(bodySrc + themeSrc)
  && themeSrc.indexOf('ctx.createCircularGradient') !== -1
  && (bodySrc.match(/roundRect\(ctx/g) || []).length >= 2, 'roundRect + circular 两处都收在 util');

// 2026-09-25 用户定口径：分享 = 小程序触发分享 API，H5 提示右上角分享（复制链接只留给看不到右上角的端）
const TOP_RIGHT = 'toast:点击右上角「···」选择「发送给朋友」';

// 按钮已换成登记组件 tz-button（M17），事件按组件的 @click 走；断言只看「绑的是 share 方法」，不锁事件名
assert('模板：分享按钮绑的是 share（不再无条件 emit 给页面复制链接）',
  /@(?:tap|click)="share"/.test(tpl) && tpl.indexOf("@tap=\"$emit('share')\"") === -1, '@click="share"');

const mpShareLog = [];
const mpShareVm = cardVm(false, cardEnv({ log: mpShareLog, isH5: false }), false);
mpShareVm.$emit = (n) => mpShareLog.push('emit:' + n);
mpShareVm.drawPoster = (cb) => cb(POSTER);
mpShareVm.share();
assert('小程序：出图后调微信的图片分享面板，分享的就是这张日签图，且不再走复制链接',
  mpShareLog.indexOf('showShareImageMenu:path=' + POSTER) !== -1
  && mpShareLog.indexOf('emit:share') === -1 && mpShareLog.indexOf('setClipboardData') === -1,
  outcome(mpShareLog));

const noPanelLog = [];
cardVm(false, cardEnv({ log: noPanelLog, isH5: false, canIUse: false }), false).share();
assert('小程序基础库没有该面板（< 2.14.0）：只提示右上角，不白跑一次出图',
  noPanelLog.length === 2 && noPanelLog[0] === 'canIUse:showShareImageMenu' && noPanelLog[1] === TOP_RIGHT,
  JSON.stringify(noPanelLog));

const panelFailLog = [];
const panelFailVm = cardVm(false, cardEnv({ log: panelFailLog, isH5: false, shareMenuFail: 'showShareImageMenu:fail invalid' }), false);
panelFailVm.drawPoster = (cb) => cb(POSTER);
panelFailVm.share();
assert('小程序面板调起失败：给一句右上角提示兜底（M13 不留静默分支）',
  panelFailLog.indexOf(TOP_RIGHT) !== -1, outcome(panelFailLog));
const cancelLog = [];
const cancelVm = cardVm(false, cardEnv({ log: cancelLog, isH5: false, shareMenuFail: 'showShareImageMenu:fail cancel' }), false);
cancelVm.drawPoster = (cb) => cb(POSTER);
cancelVm.share();
assert('小程序面板被用户取消：不补提示（那不是失败）',
  cancelLog.indexOf(TOP_RIGHT) === -1 && cancelLog.indexOf('showShareImageMenu:path=' + POSTER) !== -1,
  outcome(cancelLog));

const mpEmptyLog = [];
cardVm(false, cardEnv({ log: mpEmptyLog, isH5: false }), false).sharePoster('');
assert('小程序出图地址为空：说「日签图生成失败，请重试」，不开一次空面板',
  mpEmptyLog.length === 1 && mpEmptyLog[0] === 'toast:日签图生成失败，请重试', JSON.stringify(mpEmptyLog));

const wxShareLog = [];
const wxShareVm = cardVm(true, cardEnv({ log: wxShareLog, isH5: true, ua: 'Mozilla/5.0 (iPhone) MicroMessenger/8.0' }), true);
wxShareVm.$emit = (n) => wxShareLog.push('emit:' + n);
wxShareVm.share();
assert('H5 微信内：提示点右上角（JSSDK 弹不出分享面板，只配得了卡片标题封面），不出图也不 emit',
  wxShareLog.length === 1 && wxShareLog[0] === TOP_RIGHT, outcome(wxShareLog));

const browserShareLog = [];
const browserShareVm = cardVm(true, cardEnv({ log: browserShareLog, isH5: true }), false);
browserShareVm.$emit = (n) => browserShareLog.push('emit:' + n);
browserShareVm.share();
assert('H5 普通浏览器：没有右上角可指，交回页面复制链接（emit share，不提示右上角）',
  browserShareLog.length === 1 && browserShareLog[0] === 'emit:share', outcome(browserShareLog));

// ——————————————————————— 日签图「分享」的复制链接这一条链 ———————————————————————
// 2026-09-26 用户点名：日记详情页与打卡记录卡开的是同一只日签图弹层，「预取时机 + 同步复制 + 两句提示文案」
// 写在日记页里就要写两份（两份必然分叉），故整条链从 src/pages/app/checkin/diary/js.vue 上收进
// 打卡适配层 tz-checkin-daily-card：watch.show 里预取、@share 直接接 copyLink、页面只管 openDaily 弹不弹。
// 下面这批判据读的就是新落点，一条没少（页面那侧再钉一次「不再自己留一份」）。
// shareInfo 回的 h5_link 由后端 Links 给（活动级落介绍页，免登录可浏览）；这里只是桩值，断言只看缓存与手势
const DIARY_LINK = 'https://site.test/#/pages/app/checkin/intro/intro?id=628';

function diaryGlobals(log, apiImpl) {
  return {
    uni: {
      showToast: (o) => log.push('toast:' + o.title),
      navigateBack: () => log.push('navigateBack'),
      setClipboardData: (o) => { log.push('setClipboardData:data=' + o.data); o.success && o.success(); },
      showModal: () => log.push('showModal'),
      getSystemInfoSync: () => ({ platform: 'ios' }),
    },
    getCurrentPages: () => [{ route: 'pages/app/checkin/diary/diary' }],
    api: apiImpl,
  };
}

function diaryVm(g) {
  const opts = loadScript(DIARY, true, g);
  const vm = makeVm(opts, {
    id: 9001,
    checkinId: 628,
    loading: false,
    detail: { id: 9001, is_mine: 1 },
    $tools: { systemConfig: () => true },
    $nav: { share: () => {} },
    $api: g.api,
  });
  // 本页所有方法都通过 onLoad 里记下的 that 访问实例，不进一次 onLoad 就没有 that
  opts.onLoad.call(vm, { id: '9001', checkin_id: '628' });
  return vm;
}

/**
 * 打卡适配层那只弹层的运行环境（只关心复制链接与金句轮询，不需要画布）
 * @param {Array} log 记账数组（toast / 剪贴板）
 */
function linkEnv(log) {
  return {
    uni: {
      showToast: (o) => log.push('toast:' + o.title),
      setClipboardData: (o) => { log.push('setClipboardData:data=' + o.data); o.success && o.success(); },
    },
  };
}

/**
 * 驱动适配层：makeVm 不接 watch，这里按调用点的真实时机手工跳一次 show（先挂、下一拍再 true）
 * @param {Boolean} isH5 编译目标（预取那一行只在 H5/App 产物里留着）
 */
function linkVm(isH5, log, apiImpl) {
  const opts = loadScript(CARD, isH5, linkEnv(log));
  const vm = makeVm(opts, { checkinId: 628, quotes: DEFAULT_QUOTES, quoteIndex: 0, $api: apiImpl, $emit: () => {} });
  vm.setShow = (v) => opts.watch.show.call(vm, v);
  return vm;
}

const shareLog = [];
let shareCalls = 0;
const shareApiNames = [];
const shareGlobals = diaryGlobals(shareLog, (name) => {
  shareApiNames.push(name);
  if (name === 'checkin.checkin.shareInfo') {
    shareCalls++;
    return Promise.resolve({ code: 1, data: { h5_link: DIARY_LINK } });
  }
  return Promise.resolve({ code: 1, data: { rows: [] } });
});
const shareVm = diaryVm(shareGlobals);
const linkLog = [];
let linkRetCalls = 0;
const linkVmH5 = linkVm(true, linkLog, (name) => {
  if (name === 'checkin.checkin.shareInfo') {
    linkRetCalls++;
    return Promise.resolve({ code: 1, data: { h5_link: DIARY_LINK } });
  }
  return Promise.resolve({ code: 1, data: { rows: [] } });
});
linkVmH5.setShow(true);
assert('打开日签图就预取活动链接（点「分享」时不必等接口）——预取在弹层自己的 watch.show 里，顺手随机起一句金句',
  linkRetCalls === 1 && linkVmH5.shareLink === ''
  && (linkVmH5.quoteIndex === 0 || linkVmH5.quoteIndex === 1),
  'shareInfo 调用=' + linkRetCalls + ' quoteIndex=' + linkVmH5.quoteIndex);
shareVm.openDaily();
assert('页面这一头只管弹不弹：openDaily 里不再自己打这一次 shareInfo（同一份链两处各要一次就是分叉）',
  shareVm.dailyShow === true && shareCalls === 0
  && shareApiNames.indexOf('checkin.checkin.diaryDetail') !== -1,
  'dailyShow=' + shareVm.dailyShow + ' 页面 shareInfo 调用=' + shareCalls + ' 页面已打过的接口=' + JSON.stringify(shareApiNames));

setTimeout(() => {
  linkVmH5.setShow(false);
  linkVmH5.setShow(true);
  assert('链接取回后落进缓存，再开弹层不重复请求（缓存与「已有就不问」的判据都只这一份）',
    linkVmH5.shareLink === DIARY_LINK && linkRetCalls === 1, 'shareLink=' + linkVmH5.shareLink + ' 调用=' + linkRetCalls);

  linkLog.length = 0;
  const clipboardBefore = linkLog.length;
  linkVmH5.copyLink();
  assert('点「分享」：复制发生在点击的同步栈里（H5 的 execCommand 只在用户手势内有效），且这一跳由弹层自己接（模板上 @share="copyLink"）',
    linkLog[clipboardBefore] && linkLog[clipboardBefore].indexOf('setClipboardData:data=' + DIARY_LINK) === 0
    && /@share="copyLink"/.test(adapterSrc),
    JSON.stringify(linkLog));
  assert('点「分享」：复制成功有一句「链接已复制」',
    linkLog.indexOf('toast:链接已复制') !== -1, JSON.stringify(linkLog));

  // 链接没取到（接口失败）：要说原因，也不能复制空串
  const missLog = [];
  let missCalls = 0;
  const missVm = linkVm(true, missLog, () => {
    missCalls++;
    return Promise.resolve({ code: 0, msg: '打卡活动未上架，暂时无法访问' });
  });
  missLog.length = 0;
  missVm.copyLink();
  assert('链接为空时点「分享」：说清原因并重取，不静默、不复制空串',
    missLog.length === 1 && missLog[0] === 'toast:分享链接获取失败，请重新打开日签图再试'
    && !missLog.some((l) => l.indexOf('setClipboardData') === 0) && missCalls === 1, JSON.stringify(missLog));

  const diarySrc = fs.readFileSync(DIARY, 'utf8');
  const copyBody = (adapterSrc.match(/\n\t+copyLink\(\)\s*\{[\s\S]*?\n\t+\},/) || [''])[0];
  assert('copyLink 内不再出现 $api（接口回来才复制＝脱离手势，正是本次故障），且整条链只此一份（页面里那份 copyLink/getShareLink/shareLink 声明已删净）',
    copyBody !== '' && copyBody.indexOf('$api') === -1 && copyBody.indexOf('setClipboardData') !== -1
    && !/copyLink\s*\(\)\s*\{/.test(diarySrc) && !/getShareLink\s*\(\)\s*\{/.test(diarySrc)
    && !/shareLink\s*:/.test(diarySrc),
    '页面残留=' + JSON.stringify(['copyLink', 'getShareLink', 'shareLink'].filter((k) => new RegExp(k + '\\s*[=:(]').test(diarySrc))));
  assert('预取失败也不能静默到底：getShareLink 判了 code，copyLink 给出出口',
    /getShareLink\(\)\s*\{[\s\S]*?ret\.code !== 1[\s\S]*?\}/.test(adapterSrc)
    && copyBody.indexOf('分享链接获取失败') !== -1, '两处分支都有落点');
  assert('弹层入口只有一个（自动弹与「更多→日签图」都走 openDaily），且 openDaily 里只剩「弹不弹」这一句',
    (diarySrc.match(/that\.openDaily\(\)/g) || []).length === 2
    && (diarySrc.match(/dailyShow = true/g) || []).length === 1
    && ((diarySrc.match(/\n {4}openDaily\(\)\s*\{[\s\S]*?\n {4}\},/) || [''])[0].match(/;/g) || []).length === 1,
    'openDaily=2 处，dailyShow 赋值=1 处，函数体一句');

  // 链接预取只留给用得上它的端：小程序点「分享」调的是原生图片面板，shareInfo 在那一端没有消费方
  const mpLinkLog = [];
  let mpLinkCalls = 0;
  const mpLinkVm = linkVm(false, mpLinkLog, () => { mpLinkCalls++; return Promise.resolve({ code: 1, data: { h5_link: DIARY_LINK } }); });
  mpLinkVm.setShow(true);
  // 只看 watch.show 那一段：copyLink 里的 this.getShareLink() 是「缓存空了顺手再要一次」，那一行两端都要留
  const watchOf = (src) => ((src.match(/\n\t+show\(v\) \{[\s\S]*?\n\t+\},/) || [''])[0]);
  const h5Watch = watchOf(conditional(adapterSrc, true));
  const mpWatch = watchOf(conditional(adapterSrc, false));
  assert('预取按端收口：H5/App 产物里 watch.show 预取链接，小程序产物里那一行被条件编译吃掉（这一端点「分享」调的是原生图片面板，链接没有消费方）',
    h5Watch !== '' && mpWatch !== ''
    && mpLinkCalls === 0 && mpLinkVm.shareLink === ''
    && h5Watch.indexOf('this.getShareLink();') !== -1
    && mpWatch.indexOf('this.getShareLink();') === -1
    && mpWatch.indexOf('this.quoteIndex =') !== -1,
    'H5 预取 / 小程序不预取（小程序开弹层 shareInfo 调用=' + mpLinkCalls + '）');
}, 20);

// ————————————————————————————————————————————— 组件：右下角那张码 —————————————————————————————————————————————
// 2026-09-26 用户口径：海报右下角带这一页的码——H5 出二维码、小程序出小程序码（后端 share/getQrcode 按
// platform 分这两条路）。码是打开弹层时取的（点保存/分享时不等接口），取不到不能把海报卡住。
const CODE_DATA = 'data:image/png;base64,QUJD';
const codeCalls = [];
const okApi = (name, params) => {
  codeCalls.push(name + ':' + JSON.stringify(params));
  return Promise.resolve({ code: 1, data: CODE_DATA });
};
const failApi = (name, params) => {
  codeCalls.push(name + ':' + JSON.stringify(params));
  return Promise.resolve({ code: 0, msg: '生成二维码失败，请刷新重试' });
};
const rejectApi = (name, params) => {
  codeCalls.push(name + ':' + JSON.stringify(params));
  return Promise.reject(new Error('network'));
};
const h5CodeVm = cardVm(true, cardEnv({ log: [], isH5: true }), false, { checkinId: 628, $api: okApi });
const mpCodeVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { checkinId: 628, $api: okApi });
const mpWriteFailVm = cardVm(false, cardEnv({ log: [], isH5: false, codeWriteFail: true }), false, { checkinId: 628, $api: okApi });
const retFailVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { checkinId: 628, $api: failApi });
const netFailVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { checkinId: 628, $api: rejectApi });
const noIdVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { checkinId: 0, $api: okApi });
// 那两句 toast 要「一次取码、一次失败」的实例：上面 retFailVm 在 60ms 那一组里还被再 loadCode 一次
// （重开重试那条断言），第二次的 seq 一推进，第一次的 .then 就按「旧响应」丢弃了，收不到出口。
// 两份桩各自记自己的账，不进 codeCalls（那一条数的是「重开要不要再取一次」）
const retToastLog = [];
const retToastEmit = [];
const retToastVm = cardVm(false, cardEnv({ log: retToastLog, isH5: false }), false, {
  checkinId: 628, $emit: (n) => retToastEmit.push(n),
  $api: () => Promise.resolve({ code: 0, msg: '生成二维码失败，请刷新重试' }),
});
const netToastLog = [];
const netToastVm = cardVm(false, cardEnv({ log: netToastLog, isH5: false }), false, {
  checkinId: 628, $api: () => Promise.reject(new Error('network')),
});
retToastVm.loadCode();
netToastVm.loadCode();
h5CodeVm.loadCode();
mpCodeVm.loadCode();
mpWriteFailVm.loadCode();
retFailVm.loadCode();
netFailVm.loadCode();
noIdVm.loadCode();
// 同一次打开里重复调用不再要接口；取失败后重开要再试一次（小程序码要该页发布过才出得来）
mpCodeVm.loadCode();
retFailVm.loadCode();

// ——————————————————————————— 组件：取码超时（2026-09-27 用户口径 5~10s） ———————————————————————————
// 现象：微信小程序里那张小程序码一直没下来（后端取码卡住 / 该页没随版本发布 / 这一端根本没有响应），
// 弹层就一直停在「加载中」——request 层不会自己回，codePending 于是永远为真。用户要求两条：
// ① 加超时（5~10s）；② 加载过程中也能关弹层。下面钉三件事：超时窗口落在 5~10s；到点按「没有码」
// 收口（遮罩撤、码格让开、面板里说「获取超时」）；关弹层不读取码状态、晚到的旧响应不许写新一轮。
const TIME_CODE = Number((shellSrc.match(/const CODE_TIMEOUT = (\d+);/) || [])[1] || 0);
assert('取码超时定在 5~10s 之间（用户口径），且是一只按次开的表（到点调 onCodeTimeout）',
  TIME_CODE >= 5000 && TIME_CODE <= 10000
  && /this\.codeTimer = setTimeout\(\(\) => this\.onCodeTimeout\(seq\), CODE_TIMEOUT\);/.test(shellSrc)
  && /clearTimeout\(this\.codeTimer\);[\s\S]{0,140}this\.codeTimer = setTimeout/.test(shellSrc),
  'CODE_TIMEOUT=' + TIME_CODE);

// 永不回应的桩：超时这一档要的就是「接口一直不回来」；记账走自己一份，不去搅上面 codeCalls 的计数
const hangCalls = [];
const hangApi = () => { hangCalls.push(1); return new Promise(() => {}); };
const hangLog = [];
const hangEmit = [];
const hangVm = cardVm(false, cardEnv({ log: hangLog, isH5: false }), false, { checkinId: 628, $api: hangApi, $emit: (n) => hangEmit.push(n) });
hangVm.loadCode();
const hangSeq = hangVm.codeSeq;
assert('超时之前：这一次仍按「码还在取」算（码格先占好位置、海报上盖遮罩），不是失败',
  hangVm.codePending === true && hangVm.codeFailed === false && hangVm.codeTimeout === false && hangSeq === 1,
  JSON.stringify({ pending: hangVm.codePending, seq: hangSeq }));
hangVm.onCodeTimeout(hangSeq);
assert('超时到点：codeTimeout/codeFailed 一起置起、codePending 转 false ⇒ 遮罩撤掉、码格让开，弹层不再停在加载中',
  hangVm.codeFailed === true && hangVm.codeTimeout === true && hangVm.codePending === false,
  JSON.stringify({ failed: hangVm.codeFailed, timeout: hangVm.codeTimeout, pending: hangVm.codePending }));
assert('拿不到码就收口：弹一句原因并关掉弹层（2026-09-28 用户口径「生成二维码失败就直接弹错误提示并关闭生成弹窗」——一张没有码的海报存出去扫不进任何页面）',
  hangLog.indexOf('toast:小程序码获取超时，请刷新重试') !== -1 && hangEmit.indexOf('close') !== -1,
  JSON.stringify({ log: hangLog, emit: hangEmit }));
assert('inline 档没有弹层可关：只按「没有码」收口，页面里那一句改说刷新页面（failCode 里 inline 先 return）',
  /failCode\(msg\) \{[\s\S]{0,120}if \(this\.inline\) return;[\s\S]{0,120}this\.close\(\);/.test(shellSrc)
  && shellSrc.indexOf("'，刷新页面可重试'") !== -1, '三条失败分支同一个出口，只有 inline 不关');

// 关掉重开 = 新的 seq：旧那一次到点不许再改这一轮的状态
const staleVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { checkinId: 628, $api: hangApi });
staleVm.loadCode();
const staleSeq = staleVm.codeSeq;
staleVm.loadCode();
staleVm.onCodeTimeout(staleSeq);
assert('旧那一次超时到点不许改新一轮的状态（关掉重开时那一刻还在等的那一次已经作废）',
  staleVm.codeSeq === staleSeq + 1 && staleVm.codeTimeout === false && staleVm.codeFailed === false,
  JSON.stringify({ seq: staleVm.codeSeq, timeout: staleVm.codeTimeout }));

// 加载中也能关：close 不读取码/出图那几枚状态，点关闭就上抛（面板关闭钮与海报上方空白段同一句）
const closeLog = [];
const closeVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { checkinId: 628, $api: hangApi, $emit: (n) => closeLog.push(n) });
closeVm.loadCode();
closeVm.close();
assert('加载中也能关弹层：close() 只有一句上抛，不判「码/素材还在取」',
  closeLog.indexOf('close') !== -1 && /close\(\) \{\s*this\.\$emit\('close'\);/.test(shellSrc)
  && /class="ck-daily-stage"[^>]*@tap="close"/.test(sheetTpl) && /class="ck-daily-close" @tap="close"/.test(sheetTpl),
  '关闭钮 + 海报上方空白段都不读取码状态；closeLog=' + JSON.stringify(closeLog));

// 超时之后码才回来：照样收下并把那句说明收掉（不因为先判过超时就把它扔掉）
let resolveLate = null;
const lateVm = cardVm(false, cardEnv({ log: [], isH5: false }), false,
  { checkinId: 628, $api: () => new Promise((res) => { resolveLate = res; }) });
lateVm.loadCode();
lateVm.onCodeTimeout(lateVm.codeSeq);
assert('超时那一刻先判失败（面板里那句已经出得来），码回来再收回这一句',
  lateVm.codeFailed === true && lateVm.codeTimeout === true, JSON.stringify({ timeout: lateVm.codeTimeout }));
resolveLate({ code: 1, data: CODE_DATA });

// 码让开那一档也要重出一张：不重画的话「盖着的那张图」还留着码位，点保存时现画的那张已经让开了
const keyVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { checkinId: 628, $api: hangApi });
keyVm.loadCode();
const keyPending = keyVm.renderKey;
keyVm.onCodeTimeout(keyVm.codeSeq);
assert('码从「在取」翻成「没有」时 renderKey 跟着变（按让开那一档重出一张，预览与存下来那张是同一版）',
  keyPending.split('|')[3] === 'false' && keyVm.renderKey.split('|')[3] === 'true'
  && keyVm.renderKey !== keyPending, keyPending + ' → ' + keyVm.renderKey);

// 这几只的接口永不回，超时表还挂着：用例自己收掉，否则 Node 要等满这 8 秒才退出
[hangVm, staleVm, closeVm, keyVm].forEach((vm) => clearTimeout(vm.codeTimer));

// ——————————————— 组件：出图那条链也要有硬上限（2026-09-27 用户第二次点名） ———————————————
// 「即便微信小程序中的小程序码已经加载出来了，这个分享弹窗还是一直显示加载状态」：body 的遮罩第一判据
// 是壳里的 renderPending（下发成 render-loading），而它只在出图**收尾**时才撤——画布那条链没回音、
// 或本体在出图途中被卸载（body 的 finish/retryOrTell 会因 gone() 直接吞掉 done()，M26 那道闸门）时，
// 这一只就永远是 true：底下那份海报（连码）其实已经画好了，用户看到的却一直是「加载中」。
// 故出图也排一只硬上限表，到点按「这一次没画出图」收口（与 renderNow 的失败分支同一个落点）。
const TIME_RENDER = Number((shellSrc.match(/const RENDER_TIMEOUT = (\d+);/) || [])[1] || 0);
assert('出图这一条链也有硬上限，且不超过 10s（2026-09-28 收到 2.5s：小程序端画布永远不回音，8s 就是每次打开先数八秒「加载中」），一轮收尾就把它收掉',
  TIME_RENDER >= 2000 && TIME_RENDER <= 10000
  && /this\.renderPending = true;\s*this\.renderFailed = false;\s*this\.renderGuard = setTimeout\(\(\) => this\.onRenderTimeout\(\), RENDER_TIMEOUT\);/.test(shellSrc)
  && /onRenderTimeout\(\) \{\s*if \(this\.gone\(\)\) return;\s*clearTimeout\(this\.renderGuard\);\s*if \(!this\.renderPending\) return;/.test(shellSrc)
  && /setRendered\(key, src\) \{\s*clearTimeout\(this\.renderGuard\);/.test(shellSrc),
  'RENDER_TIMEOUT=' + TIME_RENDER);

// 码那一腿给成已到手：这一条测的是「出图那条链永远不回音」时到点收口能不能把遮罩撤掉
const stuckVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { show: true, codeId: 628, codeSrc: 'wxfile://usr/code.png' });
// 出图那条链永远不回音（真机上两种：画布回调不回；或本体在出图途中被卸载，body 因 gone() 吞掉 done()）
stuckVm.drawPoster = () => {};
stuckVm.scheduleRender();
clearTimeout(stuckVm.renderTimer);   // 120ms 后那一次不必真跑：这一条测的是「到点还没回音」
stuckVm.renderNow(10);               // 直接跑到画布那一步（attempt 给满，绕开素材重试那一档）
assert('出图那条链不回音时，遮罩先按「还在画」盖着（这一段是正常等待，不该误撤）',
  stuckVm.renderPending === true && stuckVm.shadeLoading === true,
  JSON.stringify({ pending: stuckVm.renderPending, shade: stuckVm.shadeLoading }));
// 到点收口那一句会往 Console 留一条开发侧痕迹（真机上就靠它分辨是不是出图链卡住），断言时静音
const warnRestore = console.warn;
console.warn = () => {};
stuckVm.onRenderTimeout();
console.warn = warnRestore;
assert('到点收口：renderPending 转 false + renderFailed 置起 ⇒ 遮罩撤掉、露出底下那一版海报，弹层不再停在加载中',
  stuckVm.renderPending === false && stuckVm.renderFailed === true && stuckVm.renderedSrc === ''
  && stuckVm.shadeLoading === false,
  JSON.stringify({ pending: stuckVm.renderPending, failed: stuckVm.renderFailed, rendered: stuckVm.renderedSrc, shade: stuckVm.shadeLoading }));
const doneVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { themeIndex: 2 });
doneVm.setRendered('k', 'data:done');
doneVm.onRenderTimeout();
// 出图那一腿到点收口，但码还在取：遮罩不撤，改由码那一腿接管（上限仍是 CODE_TIMEOUT，不会永久盖着）。
// 这一条是 2026-09-28「加载中中间断了一次」那一条的另一半：两条腿各自有出口，遮罩却只能有一次收口。
const legVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { themeIndex: 2 });
legVm.drawPoster = () => {};
legVm.scheduleRender();
clearTimeout(legVm.renderTimer);
legVm.renderNow(10);
const warnRestore2 = console.warn;
console.warn = () => {};
legVm.onRenderTimeout();
console.warn = warnRestore2;
assert('出图那一腿到点收口、码却还在取：遮罩照旧盖着（撤了就是「二维码还没出来却不再转」）',
  legVm.renderPending === false && legVm.codeLoading === true && legVm.shadeLoading === true,
  JSON.stringify({ pending: legVm.renderPending, failed: legVm.renderFailed, codeLoading: legVm.codeLoading, shade: legVm.shadeLoading }));
legVm.codeFailed = true;
assert('码那一腿随后收口（失败或超时都算）：遮罩立刻撤，露出底下没有码的那一版，不许停在加载中',
  legVm.codePending === false && legVm.shadeLoading === false,
  JSON.stringify({ codePending: legVm.codePending, shade: legVm.shadeLoading }));

assert('已经出好图之后那只兜底表不再改任何东西（迟到的那一次只是空跑）',
  doneVm.renderedSrc === 'data:done' && doneVm.renderFailed === false && doneVm.renderPending === false,
  JSON.stringify({ rendered: doneVm.renderedSrc, failed: doneVm.renderFailed }));

setTimeout(() => {
  assert('H5：取的是二维码，落点是这条日记所属的打卡活动（type=checkin + platform=h5，与本页分享/复制链接同一个去处）',
    codeCalls.indexOf('share.getQrcode:{"type":"checkin","id":628,"platform":"h5"}') !== -1
    && h5CodeVm.codeSrc === CODE_DATA && h5CodeVm.codeFailed === false,
    JSON.stringify(codeCalls.filter((c) => c.indexOf('h5') !== -1)));
  assert('小程序：取的是小程序码，base64 先落成一张临时图（画布只认本地路径），预览与画布用同一个值',
    codeCalls.indexOf('share.getQrcode:{"type":"checkin","id":628,"platform":"miniprogram"}') !== -1
    && mpCodeVm.codeSrc === 'wxfile://usr/share-poster-code.png', mpCodeVm.codeSrc);
  assert('小程序写盘失败：退回 base64 地址，不因为一张码把海报卡住（M13）',
    mpWriteFailVm.codeSrc === CODE_DATA && mpWriteFailVm.codeFailed === false, mpWriteFailVm.codeSrc);
  // 2026-09-28 用户点名「后端已经生成好了、海报里却不显示」：写盘成功时 base64 不许丢，
  // 它要作为备选留着（本地路径与 data 地址在 <image> / 画布图片对象两处的可加载性不等价）
  assert('小程序写盘成功：base64 留成备选（codeAltSrc），不是用完就扔',
    mpCodeVm.codeAltSrc === CODE_DATA, JSON.stringify({ src: mpCodeVm.codeSrc, alt: mpCodeVm.codeAltSrc }));
  assert('预览里那张码没加载出来（@error）：换成备选地址再试一次，且只换这一次（换完备选清空，两枚不互相踢）',
    (() => {
      mpCodeVm.onCodeImgError();
      const swapped = mpCodeVm.codeSrc === CODE_DATA && mpCodeVm.codeAltSrc === '';
      mpCodeVm.onCodeImgError();
      return swapped && mpCodeVm.codeSrc === CODE_DATA && mpCodeVm.codeAltSrc === '';
    })(), JSON.stringify({ src: mpCodeVm.codeSrc, alt: mpCodeVm.codeAltSrc }));
  // 换过地址之后别再往下断言（上面那两枚已把 mpCodeVm 从「写盘路径」挪到「base64」那一档）
  assert('H5 那一档没有备选可换（本来就是 data 地址）：onCodeImgError 是空转，不改任何状态',
    (() => {
      const before = h5CodeVm.codeSrc;
      h5CodeVm.onCodeImgError();
      return h5CodeVm.codeSrc === before && h5CodeVm.codeAltSrc === '';
    })(), h5CodeVm.codeSrc);
  assert('接口回失败（未发布该页 / 未登录）：codeFailed 置起来、海报不带码',
    retFailVm.codeSrc === '' && retFailVm.codeFailed === true, JSON.stringify({ src: retFailVm.codeSrc, failed: retFailVm.codeFailed }));
  assert('网络异常也归到同一档：catch 里把 codeFailed 落下，面板里那句说明才出得来',
    netFailVm.codeSrc === '' && netFailVm.codeFailed === true, JSON.stringify({ failed: netFailVm.codeFailed }));
  assert('调用点没给活动 ID：这一次不发请求（海报不带码，也不报「获取失败」——没什么可失败的）',
    noIdVm.codeSrc === '' && noIdVm.codeFailed === false
    && codeCalls.filter((c) => c.indexOf('"id":0') !== -1).length === 0, JSON.stringify(codeCalls.filter((c) => c.indexOf('"id":0') !== -1)));
  // 重开弹层（码已到手 / 上一次失败）才是这一次要判的时机：同帧连点不是这一档弹层的入口路径
  const mpCallsBefore = codeCalls.filter((c) => c.indexOf('"platform":"miniprogram"') !== -1).length;
  mpCodeVm.loadCode();
  retFailVm.loadCode();
  const mpCallsAfter = codeCalls.filter((c) => c.indexOf('"platform":"miniprogram"') !== -1).length;
  assert('重开弹层：码已经到手的不再要一次接口；上一次失败的那台会再试一次（小程序码要该页发布过才出得来）',
    mpCallsBefore === 6 && mpCallsAfter === mpCallsBefore + 1,
    'before=' + mpCallsBefore + ' after=' + mpCallsAfter);
  assert('接口回失败：弹的是后端那句 msg（M13 文案取 ret.msg）并关掉弹层',
    retToastLog.indexOf('toast:生成二维码失败，请刷新重试') !== -1 && retToastEmit.indexOf('close') !== -1
    && retToastVm.codeFailed === true, JSON.stringify({ log: retToastLog, emit: retToastEmit }));
  assert('网络异常（promise 被 reject）也有出口：一句「请检查网络后重试」，不再留一张静默缺码的海报',
    netToastLog.indexOf('toast:小程序码获取失败，请检查网络后重试') !== -1 && netToastVm.codeFailed === true,
    JSON.stringify(netToastLog));
  assert('海报上那句「长按识别XX」只在码到手时出（按端叫名）；面板里那句灰字说明收进 inline 档（弹层档拿不到码就关，不必再解释一张不存在的海报）',
    /v-if="codeFailed"/.test(inlineTpl) && /v-if="codeSrc"/.test(bodyTpl)
    && /\{\{ codeFailTip \}\}/.test(inlineTpl)
    && !/class="sh-tip" v-if="codeFailed"/.test(popupTpl)
    && shellSrc.indexOf("this.codeTimeout ? '获取超时' : '获取失败'") !== -1
    && shellSrc.indexOf("'，刷新页面可重试'") !== -1
    && /subject="日签图"/.test(adapterSrc) && /\{\{ codeCaption \}\}<\/text>/.test(bodyTpl)
    && /return '长按识别' \+ this\.codeName/.test(shellSrc), '弹层档已无那句说明，inline 档保留');
  // ———— 2026-09-28 微信小程序实测的两处静默失效（开发者工具连进跑着的小程序量到的） ————
  // ① :style 绑一个 computed 对象 ⇒ wxml 把 style 属性 toString 成 "[object Object]"，
  //    弥散渐变背景与 daily 档全部绝对定位整批丢掉（H5 正常，所以构建期与代码审查都看不出）。
  // ② 屏外（left:-9999px）的原生 canvas 不会被渲染 ⇒ ctx.draw 的回调永远不触发，
  //    canvasToTempFilePath 一次都调不到，海报永远停在「加载中」直到 8s 出图超时兜底。
  assert('海报的 :style 一律给字符串（posterStyleText / dailyText.xxx），不再把 computed 对象直接绑上去',
    !/:style="posterStyle"/.test(bodyTplRaw) && !/:style="daily\./.test(bodyTplRaw)
    && /:style="posterStyleText"/.test(bodyTplRaw)
    && (bodyTplRaw.match(/:style="dailyText\./g) || []).length === 7
    && /function styleText\(style\)/.test(themeSrc) && /export \{[\s\S]*styleText,/.test(themeSrc),
    '七块定位 + 背景那一格都走字符串档');
  // 实跑一遍：样式串要合法（键名已转 kebab、没有 [object Object]、也没有漏掉的驼峰键）
  const styleVm = cardVm(false, cardEnv({ log: [], isH5: false }), false, { checkinId: 628 });
  const pText = String(styleVm.posterStyleText || '');
  const dText = styleVm.dailyText || {};
  assert('实跑：posterStyleText / dailyText 给出合法样式串（渐变背景 + scale 在，键名全 kebab，无 [object Object]）',
    pText.indexOf('[object') === -1 && /^background:radial-gradient\(circle 189px at 18% 12%,/.test(pText)
    && /;transform:scale\(1\)$/.test(pText)
    && /^left:\d+px;top:18px;width:\d+px$/.test(String(dText.badge))
    && /font-size:16px;line-height:26px/.test(String(dText.quote))
    && /padding-left:27px;padding-right:27px/.test(String(dText.foot)),
    pText.slice(0, 52) + ' || badge=' + dText.badge + ' || foot=' + dText.foot);
  const util2d = fs.readFileSync(path.join(SRC, 'common/utils/canvas-2d.js'), 'utf8');
  assert('微信端出图走 type="2d"：模板那一格带 type="2d"，旧版 canvas-id 那一格只给非微信端',
    /#ifdef MP-WEIXIN[\s\S]{0,400}<canvas type="2d" :id="canvasId"/.test(bodyTplRaw)
    && /#ifndef MP-WEIXIN[\s\S]{0,400}<canvas :canvas-id="canvasId"/.test(bodyTplRaw),
    '两端各一格，条件编译分开');
  assert('两端共用同一份场景绘制 paintPoster（不许出现第二份排版），微信端那条链按 2d 三步走',
    /paintPoster\(ctx, keep\) \{/.test(bodySrc) && bodySrc.indexOf('this.paintPoster(ctx, keep)') !== -1
    && bodySrc.indexOf('self.paintPoster(wrap2d(') !== -1
    && /get2dCanvas\(this, this\.canvasId, POSTER_W, POSTER_H\)/.test(bodySrc)
    && bodySrc.indexOf('export2d(r.c.canvas, self)') !== -1, '取节点 → 载图 → 画 → 导出，画的是同一份');
  assert('2d 适配层抹平三处差别：旧接口方法名、drawImage 只吃 createImage 的对象、画布像素按 dpr 放大',
    /setFillStyle\(v\) \{ ctx\.fillStyle = v; \}/.test(util2d)
    && /createCircularGradient\(x, y, r\) \{ return ctx\.createRadialGradient\(x, y, 0, x, y, r\); \}/.test(util2d)
    && /draw\(reserve, cb\)/.test(util2d) && util2d.indexOf('canvas.createImage()') !== -1
    && /node\.width = Math\.round\(w \* dpr\)/.test(util2d) && /ctx\.scale\(dpr, dpr\)/.test(util2d)
    && /node\.getContext\('2d'\)/.test(util2d), '名字 / 图片对象 / dpr 三处');
  assert('2d 的 drawImage 只认已加载的图片对象：没到手的那一层整层跳过（旧接口那边对应退档）',
    /if \(!img\) \{[\s\S]{0,160}miss\.push\(String\(src\)\);[\s\S]{0,40}return undefined;/.test(util2d),
    '缺的那一层不画，其余照画');
  assert('载图这一层兜住两件事：单张超时（回调不回也不能把整条链挂住）+ 备选地址（主地址造不出图片对象时换它）',
    /const IMG_TIMEOUT = \d+;/.test(util2d)
    && /timer = setTimeout\(\(\) => settle\(null\), IMG_TIMEOUT\);/.test(util2d)
    && /const cands = \[src\]\.concat\(altMap\[src\] \|\| \[\]\);/.test(util2d)
    && /if \(missing\.length\) console\.warn\('\[canvas-2d\]/.test(util2d), '超时 / 备选 / 缺失必须出声');
  assert('取不到节点 / 导出失败都退回同一份 retryOrTell（按 degradeChain 降档，最后回空让壳撤遮罩）',
    /retryOrTell\(\);/.test(bodySrc) && /\.catch\(\(e\) => \{[\s\S]{0,220}retryOrTell\(\);\s*\}\);/.test(bodySrc)
    && util2d.indexOf("reject(new Error('canvas-2d-node-missing'))") !== -1, '异步那条链也要有确定出口');
  assert('码该画而没到手时不许导出这一张（缺码的图会盖住底下有码的排版：2026-09-28 用户点名的「后端生成好了、海报里不显示」）',
    /if \(this\.codeSrc && !this\.drawSrc\(this\.codeSrc\)\) throw new Error\('poster-code-image-missing/.test(bodySrc)
    && /alts\[self\.codeSrc\] = \[self\.codeAltSrc\];/.test(bodySrc), '码缺了按失败收口，另带备选地址');
  // 2026-09-28 用户点名「点击保存报错：分享海报生成失败，请重试」。旧接口那条链里，外域图两处会把出图
  // 卡死到超时（画布被污染 ⇒ toDataURL 抛错；预加载只挂 onload ⇒ ctx.draw 的回调永远不来），
  // 两处都发生在「已经开画布之后」，所以修法只能是开画布之前先把地址换成本机那份。
  // 下面两条要读源码里的局部形状，切片在同一个文件里取（不另开工具函数）
  const dpAt = bodySrc.indexOf('drawPoster(done, level) {');
  const drawPosterSlice = bodySrc.slice(dpAt, bodySrc.indexOf('微信端那一版出图', dpAt));
  const bodyDataBlock = (bodySrc.match(/\n\s*data\(\) \{[\s\S]*?\n\s*\},/) || [''])[0];
  assert('旧画布那条链在开画布之前先把要画的图换成本机地址（先开画布 = 污染已经发生，之后再换也换不回来）',
    dpAt !== -1 && drawPosterSlice.indexOf('const paint = () => {') !== -1
    && drawPosterSlice.indexOf('uni.createCanvasContext(this.canvasId, this)') > drawPosterSlice.indexOf('const paint = () => {')
    && drawPosterSlice.indexOf('const todo = this.pendingDrawSrc(keep);') < drawPosterSlice.indexOf('resolvePosterImages(')
    && drawPosterSlice.indexOf('resolvePosterImages(') < drawPosterSlice.indexOf('.then((ok) => {')
    && /if \(!todo\.length\) \{\s*paint\(\);\s*return;\s*\}/.test(drawPosterSlice)
    && /if \(ok\) paint\(\);/.test(drawPosterSlice)
    && (bodySrc.match(/uni\.createCanvasContext\(this\.canvasId, this\)/g) || []).length === 1,
    '画布只在 paint 里开；换地址 → 才 paint；无待换图时同步直画');
  assert('待换地址的清单与实际画的那几张同一份判据（头像要 load 成功过；码排第一；换过的不重换）',
    /pendingDrawSrc\(keep\) \{[\s\S]{0,700}this\.avatarLoaded === this\.avatarSrc\) srcs\.push\(this\.avatarSrc\);[\s\S]{0,400}srcs\.push\(this\.codeSrc\);/.test(bodySrc)
    && /return srcs\.filter\(\(s\) => !map \|\| map\[s\] === undefined\);/.test(bodySrc),
    '头像 / 底图 / 封面 / 码四层都在');
  assert('换地址是按层降级的：底图 / 封面 / 头像换不到就少画那一层（留底色不留洞），整张照样导出成功',
    (bodySrc.match(/= this\.drawSrc\(/g) || []).length === 6
    && /if \(!bgSrc\) \{[\s\S]{0,200}这一层不画[\s\S]{0,120}\} else if/.test(bodySrc)
    && (bodySrc.match(/if \(avaSrc\) ctx\.drawImage\(/g) || []).length === 2
    && (bodySrc.match(/if \(coverSrc\) \{/g) || []).length === 1
    && (bodySrc.match(/if \(codeImg\) \{/g) || []).length === 1
    && (bodySrc.match(/if \(codeImg\) ctx\.drawImage\(/g) || []).length === 1,
    '少画一层照样导出（M13）；只有码那一层是硬要求');
  assert('换好的地址记在普通实例字段 imgDraw 上（不进 data：key 是地址，见 M27 mpKey 那一族的由来）',
    /if \(!this\.imgDraw\) this\.imgDraw = \{\};/.test(bodySrc) && bodyDataBlock.indexOf('imgDraw') === -1,
    '只出现在实例上，不落 data');
  // 2026-09-28 用户点名「不能长按图片保存」：H5 画布出的是 data:，长按它微信内 / iOS Safari 不弹「保存图片」。
  // 换地址那一段上面已实跑验过（psWeb.toSavableSrc），这里钉的是「弹层那一侧每一处对外动作都拿换好的地址」。
  assert('弹层里那一张预览图、放大、下载拿的都是换好的地址（同一个地址，三处一致）',
    /import \{ longPressOnly, previewSavablePoster, toSavableSrc \} from '@\/common\/utils\/poster-save';/.test(shellSrc)
    && /setRendered\(key, src\) \{[\s\S]{0,600}const savable = toSavableSrc\(src\);[\s\S]{0,200}this\.\$emit\('rendered', savable\);/.test(shellSrc)
    && /this\.previewPosterH5\(toSavableSrc\(src\)\);/.test(shellSrc)
    && /downloadPoster\(src\) \{[\s\S]{0,400}const href = toSavableSrc\(src\);/.test(shellSrc)
    && /const href = toSavableSrc\(src\);[\s\S]{0,400}link\.href = href;/.test(shellSrc),
    '.sp-rendered / 放大 / 下载三处同一个地址');
  assert('换地址那一族不带任何一次网络调用：这一族的后端出图那条路 2026-09-27 已删，不许以任何形式长回来',
    !/\$api|uni\.request|uploadImage|XMLHttpRequest|fetch\(/.test(posterSrc), 'poster-save 里零网络调用');
  assert('壳把码的两枚地址都留着（写盘成功也留 base64 当备选），预览那张加载不出来就换另一枚，且只换一次',
    /success: \(\) => apply\(filePath, src\)/.test(shellSrc)
    && /onCodeImgError\(\) \{[\s\S]{0,240}this\.codeSrc = alt;/.test(shellSrc)
    && /this\.codeAltSrc = alt && alt !== val \? alt : '';/.test(shellSrc), 'codeAltSrc 登记 + 只换一次');
  assert('码的两处 <image> 都接了 @error（预览里加载不出来才有机会换备选）',
    (bodyTplRaw.match(/@error="onCodeError"/g) || []).length === 2, '日签图那张与内容档那张');
  assert('打卡适配层把码的落点交给弹层壳（type=checkin + 这条日记所属的活动 ID，与本页分享/复制链接同一个去处）',
    /code-type="checkin"/.test(adapterSrc) && /:code-id="checkinId"/.test(adapterSrc), 'code-type + code-id 都在');
  assert('日记页把活动 ID 与背景图清单一起交给弹层（码的落点、样式条的底图都由调用点下发）',
    /:checkin-id="checkinId"/.test(fs.readFileSync(path.join(SRC, 'pages/app/checkin/diary/diary.vue'), 'utf8'))
    && /:share-bgs="detail\.share_bgs"/.test(fs.readFileSync(path.join(SRC, 'pages/app/checkin/diary/diary.vue'), 'utf8')),
    'checkin-id + share-bgs 都在');
  assert('超时之后码才回来：照样收下（codeSrc 到手）并把「超时」那一句收掉，不因为先判过超时就扔掉这一张',
    lateVm.codeSrc === 'wxfile://usr/share-poster-code.png' && lateVm.codeFailed === false && lateVm.codeTimeout === false,
    JSON.stringify({ src: lateVm.codeSrc, failed: lateVm.codeFailed, timeout: lateVm.codeTimeout }));

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
}, 60);
