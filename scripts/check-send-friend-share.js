/**
 * M-P5 赠送分享（公共 share-modal + 礼单三档口径）—— 不构建、不开浏览器
 *
 * 2026-10-20 用户点名三件事，这一脚本把它们钉成机器可复跑的判据：
 *  ① 分享弹窗必须用**全站公共那只** `components/modal/share-modal.vue`
 *     （「你这个分享弹窗本身并不是公共的分享弹窗，你要使用公共的分享弹窗呀」）；
 *     自建 `send-friend-share-sheet.vue` 已删除，任何引用回潮都判红。
 *  ② 海报上必须画**当前分享人的头像与昵称**：公共弹窗读 `$tools.cachedUser()`
 *     （`user_info` 存的是 JSON 字符串，自建面板直接当对象读 `info.nickname` 永远是空）。
 *  ③ 打开分享面板只记 `shared_at`，**不推进礼单状态**：状态只剩
 *     `0 待赠送 / 2 已领取 / 3 已失效`（用户原话：「千万不要有待领取这个了」）。
 *  ④ **2026-10-28 起弹窗挂在送礼页**（M-P9）：赠送记录行内【赠送】先跳
 *     `/pages/app/send_friend/send/send?code=<gift_no>`，送礼页的「去分享送礼」才开弹窗；
 *     列表页不许再挂第二只 share-modal（同一件事两条入口各写一份 = 分叉）。
 *
 * 读的是真源码（端上页面 + 公共弹窗 + 后端常量/服务），不是自己造的 fixture；
 * `--selftest` 用坏样件逐条证明每道判据都能红。
 *
 * 用法：node tuzi-mobile/scripts/check-send-friend-share.js            # 验真件
 *       node tuzi-mobile/scripts/check-send-friend-share.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const GIFT_DIR = path.join(ROOT, 'src/pages/app/send_friend/gift');
const GIFT_VUE = path.join(GIFT_DIR, 'gift.vue');
const GIFT_JS = path.join(GIFT_DIR, 'js.vue');
// 2026-10-28 起分享弹窗挂在**送礼页**（M-P9）：赠送记录行内【赠送】先跳这一页，
// 「去分享送礼」才开公共弹窗 —— 本门禁的页面侧接线改读送礼页三件套
const SEND_DIR = path.join(ROOT, 'src/pages/app/send_friend/send');
const SEND_VUE = path.join(SEND_DIR, 'send.vue');
const SEND_JS = path.join(SEND_DIR, 'js.vue');
const SHARE_MODAL = path.join(ROOT, 'src/components/modal/share-modal.vue');
const OLD_SHEET = path.join(ROOT, 'src/components/send-friend-share-sheet.vue');
const STATUS = path.join(BACKEND, 'application/common/constant/send_friend/Status.php');
const SERVICE = path.join(BACKEND, 'application/common/library/app/send_friend/GiftService.php');
const READ = path.join(BACKEND, 'application/common/library/app/send_friend/GiftRead.php');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}
const read = (f) => fs.readFileSync(f, 'utf8');
const scriptOf = (f) => (read(f).match(/<script[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';
const templateOf = (f) => {
  const src = read(f);
  const m = src.match(/<template[^>]*>/);
  const at = m ? src.indexOf(m[0]) : -1;
  const end = src.lastIndexOf('</template>');
  return at < 0 || end <= at ? '' : src.slice(at + m[0].length, end);
};
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');

function bodyOf(code, signature) {
  const at = code.search(signature);
  if (at < 0) return '';
  const open = code.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (!depth) return code.slice(open + 1, i); }
  }
  return '';
}

/** ① 三档：常量里没有 SENT，文案没有「待领取」 */
function checkThreeStates(src) {
  const flat = stripComments(src);
  const labels = (flat.match(/function labels\(\)[\s\S]*?\n    \}/) || [''])[0];
  const labelTexts = labels.match(/'[^']+'/g) || [];
  const ok = !/const\s+SENT\b/.test(flat)
    && /const\s+PENDING\s*=\s*0/.test(flat)
    && /const\s+CLAIMED\s*=\s*2/.test(flat)
    && /const\s+VOID\s*=\s*3/.test(flat)
    && labelTexts.indexOf("'待赠送'") >= 0
    && labelTexts.indexOf("'已领取'") >= 0
    && labelTexts.indexOf("'已失效'") >= 0
    && labelTexts.indexOf("'待领取'") < 0;
  return { ok, got: 'SENT=' + /const\s+SENT\b/.test(flat) + ' 文案=' + JSON.stringify(labelTexts) };
}

/** ③ 分享只记 shared_at：markShared 里不许出现 advance()/SENT */
function checkMarkSharedNeutral(src) {
  const body = bodyOf(stripComments(src), /public static function markShared\s*\(/);
  if (!body) return { ok: false, got: 'markShared 方法没找到' };
  const ok = !/advance\s*\(/.test(body) && !/Status::SENT/.test(body) && /shared_at/.test(body);
  return { ok, got: '调了 advance=' + /advance\s*\(/.test(body) + ' 残留 SENT=' + /Status::SENT/.test(body) + ' 写入 shared_at=' + /shared_at/.test(body) };
}

/** ③ 领取从 0 直接到 2 */
function checkReceiveFromPending(src) {
  const body = bodyOf(stripComments(src), /public static function receive\s*\(/);
  if (!body) return { ok: false, got: 'receive 方法没找到' };
  const ok = /Status::PENDING\s*,\s*Status::CLAIMED/.test(body) && !/Status::SENT/.test(body);
  return { ok, got: 'PENDING→CLAIMED=' + /Status::PENDING\s*,\s*Status::CLAIMED/.test(body) + ' 残留 SENT=' + /Status::SENT/.test(body) };
}

/** ③ 领取链接只给「待赠送」 */
function checkReceiveUrlPending(src) {
  const flat = stripComments(src);
  const line = (flat.match(/receive_url[^\n]*/) || [''])[0];
  const ok = /Status::PENDING/.test(line) && !/Status::SENT/.test(line);
  return { ok, got: line.trim().slice(0, 120) };
}

/** ① 自建分享面板文件必须不存在，源码里也不许再引用 */
function checkOldSheetGone() {
  const refs = [];
  const walk = (dir) => {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) { walk(p); return; }
      if (!/\.(vue|js)$/.test(d.name)) { return; }
      if (read(p).indexOf('send-friend-share-sheet') >= 0) { refs.push(path.relative(ROOT, p)); }
    });
  };
  walk(path.join(ROOT, 'src'));
  const exists = fs.existsSync(OLD_SHEET);
  return { ok: !exists && refs.length === 0, got: '旧组件文件=' + (exists ? '还在' : '已删除') + ' 引用=' + (refs.length ? refs.join('、') : '零命中') };
}

/** ② 公共弹窗：头像/昵称读 cachedUser，海报字段真的往下传 */
function checkShareModalUser(src) {
  const flat = stripComments(src);
  const ok = /cachedUser\s*\(/.test(flat)
    && /nickname:\s*this\.sharer\.nickname/.test(flat)
    && /avatar:\s*this\.sharer\.avatar/.test(flat);
  return { ok, got: 'cachedUser=' + /cachedUser\s*\(/.test(flat) + ' 昵称=' + /nickname:\s*this\.sharer\.nickname/.test(flat) + ' 头像=' + /avatar:\s*this\.sharer\.avatar/.test(flat) };
}

/** ① 送礼页把落点交给公共弹窗（type=send_friend，val=礼单凭据 code），且记录列表那一跳负责送人过去：
 *  · 弹窗实例只有送礼页一份（旧列表页那份已撤，避免同一件事两条入口各写一份）；
 *  · 打开弹窗那一刻发 `gift/share`，只记 `shared_at`、不改状态；
 *  · 赠送记录行内【赠送】→ `/pages/app/send_friend/send/send?code=`。 */
function checkSendPageWiring(tpl, js, listTpl, listJs) {
  const flatTpl = stripComments(tpl);
  const flatJs = stripComments(js);
  const flatListTpl = stripComments(listTpl);
  const flatListJs = stripComments(listJs);
  const modal = /<share-modal\b/.test(flatTpl)
    && /type="send_friend"/.test(flatTpl)
    && /:val="code"/.test(flatTpl)
    && /:title="goodsName"/.test(flatTpl)
    && /:cover="cover"/.test(flatTpl);
  const imports = /import\s+shareModal\s+from\s+['"]@\/components\/modal\/share-modal\.vue['"]/.test(flatJs);
  const opens = /openShare\s*\([^)]*\)\s*\{[\s\S]*?shareVisible\s*=\s*true/.test(flatJs)
    && /markShared\s*\(\s*\)/.test(flatJs);
  const marks = /send_friend\.gift\.share/.test(flatJs)
    && /send_friend\.gift\.share['"]?\s*,\s*\{\s*code:\s*this\.code/.test(flatJs.replace(/\r/g, ''));
  const neutral = !/status\s*:\s*1\b/.test(flatJs) && !/\bonSent\b/.test(flatJs);
  const listGoes = /goSend\s*\([^)]*\)\s*\{[\s\S]*?send_friend\/send\/send\?code=/.test(flatListJs)
    && /openShare\s*\(/.test(flatListTpl) === false
    && /<share-modal\b/.test(flatListTpl) === false;
  const ok = modal && imports && opens && marks && neutral && listGoes;
  return {
    ok,
    got: '送礼页弹窗/落点=' + (modal && imports) + ' 打开即记送出=' + (opens && marks)
      + ' 不改状态=' + neutral + ' 列表跳送礼页=' + listGoes,
  };
}

function checkAll(opt) {
  const o = opt || {};
  const status = o.status === undefined ? read(STATUS) : o.status;
  const service = o.service === undefined ? read(SERVICE) : o.service;
  const readSrc = o.read === undefined ? read(READ) : o.read;
  const tpl = o.tpl === undefined ? templateOf(SEND_VUE) : o.tpl;
  const js = o.js === undefined ? scriptOf(SEND_JS) : o.js;
  const listTpl = o.listTpl === undefined ? templateOf(GIFT_VUE) : o.listTpl;
  const listJs = o.listJs === undefined ? scriptOf(GIFT_JS) : o.listJs;
  const modal = o.modal === undefined ? read(SHARE_MODAL) : o.modal;
  return {
    three: checkThreeStates(status),
    mark: checkMarkSharedNeutral(service),
    receive: checkReceiveFromPending(service),
    url: checkReceiveUrlPending(readSrc),
    old: checkOldSheetGone(),
    modal: checkShareModalUser(modal),
    page: checkSendPageWiring(tpl, js, listTpl, listJs),
  };
}

if (process.argv.indexOf('--selftest') >= 0) {
  console.log('=== --selftest：每一道判据都必须能红 ===');
  const real = checkAll();
  const fired = [];
  const expectFire = (name, res) => {
    if (!res.ok) { fired.push(name); pass++; console.log('[SELFTEST-FIRE] ' + name + ' -> ' + res.got); }
    else { fail++; console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到 -> ' + res.got); }
  };
  expectFire('四档常量（SENT + 待领取）仍在',
    checkThreeStates("class Status {\n    const PENDING = 0;\n    const SENT = 1;\n    const CLAIMED = 2;\n    const VOID = 3;\n    public static function labels()\n    {\n        return [0 => '待赠送', 1 => '待领取', 2 => '已领取', 3 => '已失效'];\n    }\n}"));
  expectFire('markShared 仍在推进状态',
    checkMarkSharedNeutral("public static function markShared(array $gift)\n    {\n        $won = self::advance($gift['id'], Status::PENDING, Status::SENT, ['shared_at' => time()]);\n        return ['status' => Status::SENT];\n    }"));
  expectFire('领取仍从 1 起步',
    checkReceiveFromPending('public static function receive(array $gift, $userId)\n    {\n        $won = self::advance($id, Status::SENT, Status::CLAIMED);\n    }'));
  expectFire('领取链接仍只给待领取',
    checkReceiveUrlPending("$row['receive_url'] = $status === Status::SENT ? Link::receiveUrl($row['gift_no']) : '';"));
  expectFire('海报还没读 cachedUser',
    checkShareModalUser('sharer() { const user = uni.getStorageSync("user_info") || {}; return { nickname: user.nickname, avatar: user.avatar }; }\nposter() { return { nickname: this.sharer.nickname, avatar: this.sharer.avatar }; }'));
  expectFire('送礼页还在用自建面板 / 点赠送改状态',
    checkSendPageWiring('<template><send-friend-share-sheet ref="sheet" @sent="onSent"></send-friend-share-sheet></template>',
      'import sheet from "@/components/send-friend-share-sheet.vue";\nopenShare(row) { this.shareVisible = true; this.rows = [{ status: 1 }]; }',
      '<template><view></view></template>', 'openShare(row) { this.shareVisible = true; }'));
  expectFire('赠送记录行仍直接开弹窗、不跳送礼页',
    checkSendPageWiring(templateOf(SEND_VUE), scriptOf(SEND_JS),
      '<template><share-modal :visible="shareVisible" /></template>', 'openShare(row) { this.shareVisible = true; }'));

  // 好样件不许误报
  const goodBad = ['three', 'mark', 'receive', 'url', 'modal', 'page'].filter((k) => !real[k].ok);
  if (goodBad.length === 0) { pass++; console.log('[SELFTEST-OK] 真件全部判绿，坏样件 ' + fired.length + ' 条均被抓红'); }
  else { fail++; console.log('[SELFTEST-FAIL] 真件自己就红：' + goodBad.join(',') + ' -> ' + JSON.stringify(real)); }
  console.log('\n[SELFTEST] 坏样件 ' + fired.length + ' 条被抓红（要求 ≥7）；总通过 ' + pass + ' / 失败 ' + fail);
  process.exitCode = fail === 0 && fired.length >= 7 ? 0 : 1;
} else {
  console.log('=== check-send-friend-share（公共分享弹窗 + 三档礼单）===');
  const r = checkAll();
  assert('① 礼单只剩三档：0 待赠送 / 2 已领取 / 3 已失效，SENT 与「待领取」零残留', r.three.ok, r.three.got);
  assert('② 分享只记 shared_at，markShared 不再推进状态', r.mark.ok, r.mark.got);
  assert('③ 领取 0 → 2 直接推进', r.receive.ok, r.receive.got);
  assert('④ 领取链接只给待赠送那一档', r.url.ok, r.url.got);
  assert('⑤ 自建 send-friend-share-sheet 已删除，源码零引用', r.old.ok, r.old.got);
  assert('⑥ 公共弹窗读 $tools.cachedUser()，海报画头像与昵称', r.modal.ok, r.modal.got);
  assert('⑦ 送礼页交给公共弹窗（type=send_friend、val=code），打开即记送出、不改状态；赠送记录行跳送礼页', r.page.ok, r.page.got);
  console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
    : '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
  process.exitCode = fail === 0 ? 0 : 1;
}
