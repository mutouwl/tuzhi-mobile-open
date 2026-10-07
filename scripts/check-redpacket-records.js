/**
 * 直播间「红包记录」这一族跨组件接线的机器验法（硬约束 27③：静态门禁看不见跨组件边界的接线）。
 * 跑法：node tuzi-mobile/scripts/check-redpacket-records.js
 * 钉的是「右侧入口 → 记录弹层 → 点某一只 → 信封」这条链每一跳都接得上，
 * 以及 M6/M16/M22/M28 在本族的几条硬口径。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const liveVue = read('src/pages/course/live/live.vue');
const liveJs = read('src/pages/course/live/js.vue');
const records = read('src/pages/course/live/redpacket/records-modal.vue');
const modalJs = read('src/pages/course/live/redpacket/js.vue');
const apiList = read('src/common/request/api_list.js');

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });
// 去掉 HTML 注释的模板段：凡是「渲染出来不许出现」的检查（加载中文案、裸露的类名等）都只看这一段 ——
// 注释里讨论这些字眼是允许的，.vue 的注释不参与渲染
const tplOf = (src) => (src.match(/<template>[\s\S]*<\/template>/) || [''])[0].replace(/<!--[\s\S]*?-->/g, '');

// 1. 右侧那枚红包入口点的是「记录」，不再是直达信封
const entryBlock = liveVue.match(/<tz-live-side-entry[\s\S]*?\/>/g) || [];
const rpEntry = entryBlock.find((b) => b.includes('red_packet.png'));
ok('红包入口存在', !!rpEntry);
ok('红包入口 @open 指向 openRedpacketRecords', rpEntry && /@open="openRedpacketRecords"/.test(rpEntry));
ok('红包入口不再直达信封', rpEntry && !/openRedpacket\(redpacketData\)/.test(rpEntry));
// 1b. 入口显隐判据（2026-09-30 用户点名「点击红包入口没有弹出红包记录弹窗」= 自锁修掉）
ok('红包入口 v-if 只看 redpacketEntryOn', rpEntry && /v-if="redpacketEntryOn"/.test(rpEntry));
ok('判据不再依赖「此刻有进行中红包」', rpEntry && !/redpacketData\.id/.test(rpEntry));
// 1b-2. 入口显隐判据（2026-10-04 用户点名「如果本场直播还没有发过红包，那么右侧按钮就不要显示红包按钮」）：
//      「开没开 AND 发没发过」两枚判据由后端算成**一枚** redpacket_entry 一起下发（M22 前端不重判），
//      config.redpacket 只在老包/老后端对不上时兜底（没有 redpacket_entry 才回落）
const entryOnSrc = liveJs.split('redpacketEntryOn()')[1].slice(0, 700);
ok('判据吃后端下发的那一枚 redpacket_entry', /room\.redpacket_entry/.test(entryOnSrc));
ok('判据只认 1（开关关或没发过红包都收）', /Number\(entry\) === 1/.test(entryOnSrc));
ok('redpacket_entry 优先，config.redpacket 只作兜底',
  /redpacket_entry\s*!==\s*undefined[\s\S]{0,90}room\.config/.test(entryOnSrc));
ok('前端不再自己查「本场发没发过红包」', !/live\.redpacket\.(list|getList|hasRecord)/.test(liveJs));
ok('redpacketEntryOn 也收页面级闸门', /sideEntryVisible\s*\)/.test(liveJs.split('redpacketEntryOn()')[1].slice(0, 300)));
ok('层号与入口同一份判据', /key: 'redpacket',[\s\S]{0,60}on: this\.redpacketEntryOn/.test(liveJs));
ok('进页不再补拉进行中红包（无读者已下线）', !/getActiveRedpacket/.test(liveJs));

// 2. 页面侧的两个 handler + 状态位 + 组件注册
ok('js.vue 有 openRedpacketRecords', /openRedpacketRecords\(\)\s*\{/.test(liveJs));
ok('js.vue 有 openRedpacketFromRecord', /openRedpacketFromRecord\(row\)\s*\{/.test(liveJs));
ok('data 里有 showRedpacketRecords', /showRedpacketRecords:\s*false/.test(liveJs));
ok('sideEntryVisible 收了记录弹层', /this\.showRedpacketRecords/.test(liveJs.split('sideEntryVisible()')[1].slice(0, 400)));
ok('records 组件已 import 并注册', /import redpacketRecords from "@\/pages\/course\/live\/redpacket\/records-modal.vue"/.test(liveJs) && /\n\s*redpacketRecords,/.test(liveJs));

// 3. 挂点：记录在信封之前（同 10210 时按 DOM 序排），且都按插件判据挂载
const recMount = liveVue.indexOf('<redpacket-records');
const modalMount = liveVue.indexOf('<redpacket-modal');
// 页面根的子节点在模板里固定 4 空格缩进；ui-layer 之内那批是 6+ 空格（对照同处已确认在根的 redpacket-modal）
ok('记录弹层挂在页面根（4 空格缩进，与信封同层）', /^ {4}<redpacket-records/m.test(liveVue) && /^ {4}<redpacket-modal/m.test(liveVue));
ok('记录挂在信封之前', recMount > -1 && modalMount > -1 && recMount < modalMount);
ok('记录挂载带插件判据', /<redpacket-records[\s\S]{0,200}systemConfig\('app_isinstall_live_redpacket'\)/.test(liveVue));

// 4. 事件两侧对得上（M28：组件对外事件不得用原生名）
ok('组件 emits 只用非原生名', /emits:\s*\['close',\s*'pick'\]/.test(records));
ok('调用点接了 @close 与 @pick', /@close="showRedpacketRecords = false"/.test(liveVue) && /@pick="openRedpacketFromRecord"/.test(liveVue));
ok('行整行可点且绑在行根节点', /class="rp-rec-row"[\s\S]{0,160}@tap="pick\(item\)"/.test(records));

// 5. 接口：用已注册的 getList，参数带 course_id / page / limit
ok('调的是 live.redpacket.getList', /live\.redpacket\.getList/.test(records));
ok('api_list 里确有 getList', /getList:\s*\{\s*url:\s*'live\/red_packet\/getList'/.test(apiList));
ok('带 course_id 参数', /course_id:\s*this\.courseId/.test(records));

// 6. M6：列表区确定高度（本屏按 70vh 那一档），不许 min/max-height
ok('tz-popup-list 给了确定 height', /<tz-popup-list[^>]*height="70vh"/.test(records));
ok('没有 min/max-height', !/min-height|max-height/.test(records));
// 6b. 2026-09-30 用户点名「行加浅浅的粉底色、去掉行间边框、行间要有垂直间距」：
//     底色取自信封红（#f0435c 8% 叠白底）、行不再有 border-bottom、间距由容器 gap 给（不是行 margin）
// 只在 <style> 段里找（模板与注释里也出现过这些类名，正则会一路吃到下一处花括号）
const styleText = (records.match(/<style[\s\S]*?<\/style>/) || [''])[0];
// (?![\w-]) 是必需的：`.rp-rec-name-row` / `.rp-rec-sk-line--title` 这类同前缀的兄弟类
// 同样匹配「`.rp-rec-name` + 边界」，不挡掉就会去读隔壁那条规则（- 是非单词字符，\b 挡不住）
const rowStyle = (cls) => ((styleText.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0]);
ok('真实行有浅粉底色（取自信封红那档）', /background:\s*rgba\(240,\s*67,\s*92,\s*0\.08\)/.test(rowStyle('rp-rec-row')));
ok('骨架行与真实行同一底色、加载完不跳版', /background:\s*rgba\(240,\s*67,\s*92,\s*0\.08\)/.test(rowStyle('rp-rec-sk-row')));
ok('行不再有发丝线', !/border-bottom/.test(rowStyle('rp-rec-row')) && !/border-bottom/.test(rowStyle('rp-rec-sk-row')));
ok('末行收口那套已随之下线（没有留死类）', !/rp-rec-row--last/.test(records) && !/rows\.length - 1/.test(records));
ok('行间距由列表容器 gap 给', /gap:\s*10px/.test(rowStyle('rp-rec-list')) && /gap:\s*10px/.test(rowStyle('rp-rec-sk')));
ok('行自身不带 margin（间距不靠行 margin 叠加）', !/margin-bottom/.test(rowStyle('rp-rec-row')));
ok('骨架行数仍铺满 70vh 画布', /v-for="i in 7"/.test(records));

// 7. M16：加载态是逐块骨架（左两行 + 右两块），不是转圈 + 加载中文字
ok('骨架含右侧状态与时间块', /rp-rec-sk-tag/.test(records) && /rp-rec-sk-time/.test(records));
ok('没有「加载中」文字块与 u-loading-icon', !/加载中/.test(tplOf(records)) && !/u-loading-icon/.test(records));
ok('骨架判据是 loading && !rows.length', /v-if="loading && !rows\.length"/.test(records));

// 8. M22/M13：状态与类型吃后端字段、前端不自己比时间戳；失败有出口
ok('行状态直接用后端字段', /statusTextOf\(item\.status\)/.test(records) && !/item\.expire_time\s*[<>]/.test(records));
ok('失败写进 error 并喂空态', /this\.error = \(ret && ret\.msg\)/.test(records) && /:text="error \|\|/.test(records));

// 9. M26：晚到回音有已销毁闸门；M23：不留模块级 that
ok('回调有 gone() 闸门', /gone\(\)\s*\{/.test(records) && /if \(this\.gone\(\)\)/.test(records) && /this\._isDestroyed === true/.test(records));
ok('记录组件不用模块级 that', !/^var that;/.test(records));

// 10. 信封与记录共用一份枚举翻译（一个枚举只在一处翻译）
ok('信封改用共享 typeText/statusText', /from '\.\/redpacket-text\.js'/.test(modalJs) && /statusText\(this\.status\)/.test(modalJs));
ok('信封模板不再自写「红包已抢完」', !/红包已抢完|红包已过期/.test(read('src/pages/course/live/redpacket/redpacket-modal.vue')));

// 11. 用户点名的三件（2026-09-30 第二轮）：金额恒显示 / 不写「管理员」/ 顶行给红包类型
const modalVue = read('src/pages/course/live/redpacket/redpacket-modal.vue');
ok('结果卡的金额块不再按状态收起', /class="rp-card-amount">/.test(modalVue) && !/class="rp-card-amount" v-if/.test(modalVue));
ok('cardAmount：抢到吃 myAmount、其余吃总额', /cardAmount\(\)/.test(modalJs) && /status == 'grabbed' \? this\.myAmount : this\.totalAmountText/.test(modalJs));
ok('未抢到那一档说明这个数字是总额', /rp-card-caption/.test(modalVue) && /红包总金额/.test(modalVue));
ok('白卡顶行是红包类型、不再是发放人', /class="rp-card-sender">\{\{ typeLabel \}\}/.test(modalVue) && !/rp-card-sender">\{\{ redpacketData\.nickname/.test(modalVue));
ok('渲染出来的两处都不含「管理员」「主播」', !/管理员|主播/.test(tplOf(modalVue)) && !/管理员|主播/.test(tplOf(records)));
ok('记录行尾有金额列', /class="rp-rec-amount">\{\{ amountTextOf\(item\.total_amount\) \}\}/.test(records));
ok('记录行不再拼发放人账号名', !/admin_name/.test(records));

// 12. 2026-09-30 用户点名「字体颜色和 Tag 颜色跟背景的粉红色不搭，文字 Tag 的提示可以从这个红包弹窗中参考」：
//     行底是有色块（信封红 8% 叠白 ≈ #fef0f2），压在上面的文字不能照搬白底那套冷灰/价格档红——
//     冷灰 #86909c 在这一档只有 2.9:1、近黑 #1d2129 与粉底分属两个色系，标签灰底与主色蓝更是外来的。
//     行内四档统一从信封红 #f0435c 派生的暖红系里取，标签两档照抄信封那一份（白底红字 / 红底白字）
const rpCss = read('src/pages/course/live/redpacket/css.css');
const rowTextStyles = ['rp-rec-name', 'rp-rec-meta', 'rp-rec-amount', 'rp-rec-time', 'rp-rec-tag', 'rp-rec-tag--pending']
  .map((cls) => rowStyle(cls)).join('\n');
ok('行内文字走暖红系（名称深红 #8f2233）', /color:\s*#8f2233/.test(rowStyle('rp-rec-name')));
ok('行内文字不再用近黑 #1d2129（与粉底不同色系）', !/#1d2129/.test(rowTextStyles));
ok('元信息与时间同吃一档暖灰红 #87545e', /color:\s*#87545e/.test(rowStyle('rp-rec-meta')) && /color:\s*#87545e/.test(rowStyle('rp-rec-time')));
ok('行内文字不再用冷灰 #86909c（粉底上只有 2.9:1）', !/#86909c/.test(rowTextStyles));
ok('金额吃信封红下压一档 #c2273d（不再照搬 §1 价格档）', /color:\s*#c2273d/.test(rowStyle('rp-rec-amount')));
ok('行内文字不再用价格档 #f53f3f（同样只有 3.4:1）', !/#f53f3f/.test(rowTextStyles));
ok('结束态标签＝白底红字（对应信封「手气最佳」那枚）', /background:\s*#fff/.test(rowStyle('rp-rec-tag')) && /color:\s*#c2273d/.test(rowStyle('rp-rec-tag')));
ok('标签不再用灰底 #f2f3f5 / 主色蓝 #0968f6（外来色系）', !/#f2f3f5/.test(rowTextStyles) && !/#0968f6/.test(rowTextStyles));
ok('待领取标签＝红底白字（对应信封红身 + 白字那一档）', /background:\s*#d3314b/.test(rowStyle('rp-rec-tag--pending')) && /color:\s*#fff/.test(rowStyle('rp-rec-tag--pending')));
ok('信封那份红仍是这一族的锚点（别把锚点一起换掉）', /#f0435c/.test(rpCss) && /color:\s*#f0435c/.test(rpCss));
ok('弹窗头部仍在白底上：标题 #1d2129 保持原档', /color:\s*#1d2129/.test(rowStyle('rp-rec-title')));

// 12b. 2026-10-04 用户点名「红包记录弹窗中，共多少个，这个做成 Tag 放在红包记录标题的右侧」：
//      形态从「推到最右的灰字」改成「紧贴标题右侧的一枚状态 Tag」，档位照同屏邀请达人榜标题行那枚
//      .irb-state-tag（参照页仲裁，M6）；但它压在白色面板上、不在行的粉底块里，所以不跟行内那族暖红走
//      （29④「白底上的照旧」＋换色不外溢），也不许再退成 #86909c 那行灰字
const totalStyle = rowStyle('rp-rec-total');
const headStyle = rowStyle('rp-rec-head');
const irbVue = read('src/pages/course/live/invite-rank/board-list.vue');
const irbTag = (irbVue.match(/\.irb-state-tag(?![\w-])\s*\{[\s\S]*?\}/) || [''])[0];
const propOf = (rule, prop) => ((rule.match(new RegExp(prop + ':\\s*([^;]+)')) || [])[1] || '').replace(/\s+/g, ' ').trim();
const tagProps = ['font-size', 'line-height', 'padding', 'border-radius', 'background', 'color'];
ok('「共 N 个」是 Tag（浅灰底 + 内衬 + 圆角，不再是裸灰字）',
  /background:\s*#f2f3f5/.test(totalStyle) && /padding:\s*1px 6px/.test(totalStyle) && /border-radius:\s*4px/.test(totalStyle));
ok('「共 N 个」不再用裸灰字档 #86909c', !/#86909c/.test(totalStyle));
ok('白底不外溢：头部那一枚不吃行内那族暖红（#c2273d / #87545e / #8f2233）',
  !/#c2273d|#87545e|#8f2233/.test(totalStyle));
ok('与同屏达人榜标题行那枚状态 Tag 逐值同档',
  !!irbTag && tagProps.every((p) => propOf(totalStyle, p) === propOf(irbTag, p)),
  tagProps.map((p) => `${p}:${propOf(totalStyle, p)}|${propOf(irbTag, p)}`).join(' '));
ok('Tag 紧贴标题右侧（头部不再 space-between，间距只由容器 gap 给）',
  !/justify-content/.test(headStyle) && /gap:\s*8px/.test(headStyle));
const tplText = tplOf(records);
const iHead = tplText.indexOf('rp-rec-head');
const iTitle = tplText.indexOf('rp-rec-title');
const iTotal = tplText.indexOf('rp-rec-total');
const iList = tplText.indexOf('tz-popup-list');
ok('模板里计数 Tag 紧跟标题、仍在头部那一行内（顺序：head→标题→Tag→列表区）',
  iHead > -1 && iHead < iTitle && iTitle < iTotal && iTotal < iList);
// 注：骨架块的色值合同在组 19（原来这条「骨架块仍取灰」是 2026-09-30 那轮钉的，2026-10-02 被用户点名作废）

// 13. 2026-10-01 用户点名「这个红包的加载状态，骨架屏和最终展示的内容不匹配（位置、大小都对不上），
//     可以取消骨架屏，直接一个遮罩、中间展示加载中这个动画」。
//     信封这一屏在三态下是三套几何（待开一面红 / 白卡结果卡 / 领取记录），没有任何一块能先摆真版式再盖灰
//     ⇒ 走整面遮罩 + 中间转圈那一档（M16「弹层多态面板」那一条），高度取加载完成后那一版
const rpRowStyle = (cls) => ((rpCss.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0]);
const loadingBlock = (modalVue.match(/<div class="redpacket-loading"[\s\S]*?<\/div>/) || [''])[0];
ok('加载态是整面那一档：铺满、中间一枚转圈', /class="redpacket-loading" v-if="detailLoading"/.test(modalVue) && /<u-loading-icon[^>]*mode="circle"/.test(loadingBlock));
ok('加载层不再压半透明黑 rgba(0, 0, 0, 0.35)', !/rgba\(0,\s*0,\s*0,\s*0\.35\)/.test(rpRowStyle('redpacket-loading')));
ok('待开态那一层不带底色（红身由 .redpacket-modal 自己给，加载中仍是红的）', !/background/.test(rpRowStyle('redpacket-loading')));
const isCardLoadingRule = (rpCss.match(/\.redpacket-modal\.is-card \.redpacket-loading\s*\{[^}]*\}/) || [''])[0];
ok('白卡态那一层吃白卡那份 #fff8f4（不再被压成黑色）', /background-color:\s*#fff8f4/.test(isCardLoadingRule), isCardLoadingRule.replace(/\s+/g, ' ').slice(0, 90));
ok('加载层高度按加载完成后那一版分档（待开 318 / 白卡 354）', /min-height:\s*318px/.test(rpRowStyle('redpacket-loading')) && /\.redpacket-modal\.is-card \.redpacket-loading\s*\{[\s\S]*?min-height:\s*354px/.test(rpCss));
ok('转圈两档颜色跟着底走（白底吃红 #c2273d / 红底吃白），成对给在 computed 里', /loadingColor\(\)[\s\S]{0,300}cardMode \? '#c2273d' : '#ffffff'/.test(modalJs) && /loadingInactiveColor\(\)[\s\S]{0,300}rgba\(194,\s*39,\s*61,\s*0\.28\)/.test(modalJs));
ok('转圈不再写死白色（白底上一枚白转圈看不见）', /:color="loadingColor"/.test(loadingBlock) && /:inactive-color="loadingInactiveColor"/.test(loadingBlock) && !/color="#ffffff"/.test(loadingBlock));
ok('白卡态那一档也铺满红身（z-index 压过 .rp-shell，z-index 为 auto）', /position:\s*relative/.test(rpRowStyle('redpacket-loading')) && /z-index:\s*5/.test(rpRowStyle('redpacket-loading')));
ok('加载中仍关得掉：关闭按钮 z-index 10 压在遮罩 5 之上', /z-index:\s*10/.test(rpRowStyle('modal-close')));
ok('遮罩不进 loading-not-skeleton（不拿直角遮罩盖 u-popup 的圆角）', !/tz-loading-page|u-loading-page/.test(modalVue));
ok('遮罩不配「加载中」文字（否则进 loading-spinner-text-block 清单）', !/加载中/.test(loadingBlock) && !/text="/.test(loadingBlock));
ok('旧灰块树已删净（rp-sk-* / rp-sk-blink 不许留死类）', !/rp-sk-/.test(rpCss) && !/rp-sk-/.test(modalVue) && !/rp-sk-blink/.test(rpCss));
ok('白卡态加载中仍出红身（.rp-shell 不再被 detailLoading 收掉）', /class="rp-shell" v-if="cardMode"/.test(modalVue));

// 14. 2026-10-01 用户点名「这个红包即使已经过期或者没人领取，也应该显示查看大家的手气」
//     （M28② 那一族：入口显隐不许依赖只有该入口自己能产生的数据；「有没有人领」交给记录屏的空态说）
ok('「查看大家的手气」无条件渲染，不再挂 grabList.length', /<div class="rp-card-link" @click="showRecords = true">查看大家的手气 ›<\/div>/.test(tplOf(modalVue)));
ok('记录屏有「一只都没人领」那一档', /class="rp-records-empty" v-if="!grabList\.length"/.test(tplOf(modalVue)) && /还没有人领取这只红包/.test(modalVue));
ok('空态有样式（不留 212px 空白）', /padding:\s*84px 0/.test(rpRowStyle('rp-records-empty')));

// 15. 2026-10-01 用户点名「红包记录弹窗中可以下拉刷新、上拉加载。红包记录记得使用分页的形式显示，
//     避免数据过多导致加载缓慢」——参照页 pages/app/school/student/list/（M3 的参照页就是它）
const refListJs = read('src/pages/app/school/student/list/js.vue');
// then / catch 两段：取数回音的两条退出口，M4 的收口与竞态闸门都在这里
const thenBlock = (records.split('}).then((ret) => {')[1] || '').split('}).catch')[0];
const catchBlock = (records.split('}).catch(() => {')[1] || '').split('});')[0];
// 15a. 接线：tz-popup-list 的 refresher / scrolltolower 两跳（M28 逐跳核，静态门禁只看源码对称）
ok('tz-popup-list 接上 :refreshing', /<tz-popup-list[^>]*:refreshing="refreshing"/.test(records));
ok('下拉刷新事件接到 refresh()', /<tz-popup-list[^>]*@refresh="refresh"/.test(records));
ok('上拉加载事件接到 loadMore()', /<tz-popup-list[^>]*@lower="loadMore"/.test(records));
ok('refresh() 与 loadMore() 两个 handler 都在', /refresh\(\)\s*\{/.test(records) && /loadMore\(\)\s*\{/.test(records));
ok('refresh() 先拉起 refresher-triggered 再取第 1 页', /refresh\(\)\s*\{\s*this\.refreshing = true;\s*this\.load\(1\)/.test(records));
ok('loadMore() 收在 hasMore/loading 判据后并取第 N+1 页', /loadMore\(\)\s*\{\s*if \(!this\.hasMore \|\| this\.loading\) \{ return; \}\s*this\.load\(this\.page \+ 1\)/.test(records));
// 15b. 分页状态位（与参照页同一套命名）
ok('data 里有 page/limit/hasMore/refreshing 四个状态位', /page:\s*1,/.test(records) && /limit:\s*20/.test(records) && /hasMore:\s*false/.test(records) && /refreshing:\s*false/.test(records));
ok('请求带上 page 与 limit', /page:\s*target,/.test(records) && /limit:\s*this\.limit/.test(records));
ok('第 1 页整段替换、后续页拼接（刷新要清空，续页只往后接）', /this\.rows = target === 1 \? list : this\.rows\.concat\(list\)/.test(records));
ok('收口吃后端下发的 has_more，并把「空页」当末页', /this\.hasMore = !!data\.has_more && list\.length > 0/.test(records));
ok('loadStatus 三档（loading / loadmore / nomore）', /loadStatus\(\)\s*\{[\s\S]{0,200}this\.hasMore \? 'loadmore' : 'nomore'/.test(records));
ok('u-loadmore 照 M3 的形态收在列表尾部', /<u-loadmore :status="loadStatus" v-if="rows\.length && loadStatus !== 'nomore'">/.test(records));
ok('行 key 用 item.id 而不是 index（分页拼接时 index key 会整段重挂）', /v-for="item in rows" :key="item\.id"/.test(records) && !/:key="index"/.test(records));
ok('状态位命名与参照页同一套（page/hasMore/loading/loadStatus）', /page:\s*1/.test(refListJs) && /hasMore:\s*false/.test(refListJs) && /loadStatus:\s*'loadmore'/.test(refListJs));
// 15c. M4：下拉刷新必须等请求结束才停。参照页在 onPullDownRefresh 里立刻 stopPullDownRefresh()（违规），
//      那一段只许列表页自己留着，弹层不许照抄
ok('弹层不照抄参照页那条「进页面先停刷新」', !/stopPullDownRefresh/.test(records));
ok('M4 收口：缺 course_id 那一支也把 refreshing/loading 收了', /if \(!this\.courseId\) \{[\s\S]{0,300}this\.refreshing = false;\s*this\.loading = false;/.test(records));
ok('M4 收口：成功与失败两支都复 refreshing', /this\.refreshing = false;/.test(thenBlock) && /this\.refreshing = false;/.test(catchBlock));
// 15d. 竞态：下拉刷新与上拉加载可能同时在飞，只认最新那一次的回音
ok('取数序号自增一次分一次', /const seq = \+\+this\.reqSeq;/.test(records) && /reqSeq:\s*0/.test(records));
ok('竞态闸门在 then/catch 两头都判（过期回音直接丢）', (records.match(/seq !== this\.reqSeq/g) || []).length === 2);
ok('竞态闸门写在最前，早于写 data 之前', /if \(seq !== this\.reqSeq\) \{ return; \}\s*this\.loading = false;/.test(thenBlock) && /if \(seq !== this\.reqSeq\) \{ return; \}\s*this\.loading = false;/.test(catchBlock));
// 15e. 取的是分页后的三件套字段
ok('前端读的是 rows / total / has_more 三个字段', /const list = data\.rows \|\| \[\]/.test(records) && /Number\(data\.total\)/.test(records) && /!!data\.has_more/.test(records));

// 16. 后端口径（application/api/controller/live/RedPacket.php 的 getList）
const rpBackend = fs.readFileSync(path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend/application/api/controller/live/RedPacket.php'), 'utf8');
const getListBody = (rpBackend.split('public function getList()')[1] || '').split('    public function ')[0];
const myListBody = (rpBackend.split('public function getMyList()')[1] || '').split('    public function ')[0];
ok('后端控制器 ≤300 行（硬约束 17 落地即检）', rpBackend.split('\n').length <= 300, rpBackend.split('\n').length + ' 行');
ok('getList 走 Api::pageParams 取 page/limit（上限 100、默认 20）', /list\(\$page, \$limit\) = \$this->pageParams\(\)/.test(getListBody));
ok('列表查询用 page($page, $limit)', /->page\(\$page, \$limit\)->select\(\)/.test(getListBody));
ok('没有 limit(N) 硬截断（M3：截断＝前端看着到底了其实还有）', !/->limit\(/.test(getListBody));
ok('total 与 select 独立查询（TP5.0 count 会消费查询选项）', /\(clone \$query\)->count\(\)/.test(getListBody));
ok('过滤下推 SQL：where 只带 course_id，不在 PHP 里筛', /RedPacketModel::where\(\['course_id' => \$courseId\]\)/.test(getListBody));
ok('排序补唯一键兜底：createtime desc 之后按 id desc', /order\('createtime', 'desc'\)->order\('id', 'desc'\)/.test(getListBody));
ok('has_more 照 app/school/Package 那一档：$page * $limit < $total', /'has_more'\s*=>\s*\$page \* \$limit < \$total/.test(getListBody));
ok('出参三件套 total / rows / has_more', /'total'\s*=>\s*\$total/.test(getListBody) && /'rows'\s*=>\s*\$items/.test(getListBody));
ok('已领个数一次分组取回，不再逐行 count（一页 20 行 = 20 条 count）', /where\('redpacket_id', 'in', \$ids\)[\s\S]{0,140}group\('redpacket_id'\)/.test(getListBody) && !/RedPacketGrabModel::where\('redpacket_id', \$item/.test(getListBody));
ok('缺 course_id 仍走报错分支', /if \(!\$courseId\) \{\s*\$this->error\('参数错误'\)/.test(getListBody));
ok('getMyList 未动（「我的红包记录」是独立页面，自带分页，不在本轮范围）', myListBody.length > 0 && !/'has_more'/.test(myListBody) && /paginate\(\$limit, false/.test(myListBody));

// 17. 2026-10-01 用户点名「如果数据为空的话，还要显示空状态」
//     ——分页落地后这一族多出三种「空」：整表没数据 / 这一页没取到 / 这一页取到但是空的。
//     三种各走各的出口，钉死它们不许互相顶替（尤其不许拿「失败」去顶替「空」）
const refListTpl = read('src/pages/app/school/student/list/list.vue');
const myLogVue = read('src/pages/user/redpacket/log.vue');
// 17a. 整表为空 → u-empty（与参照页同一款组件同一句式）
ok('空态是 u-empty，判据是整表为空而不是当页', /<u-empty\s+v-if="!rows\.length"/.test(records));
ok('空态判据不许只看当页 list（续页空页会把整表说成空）', !/v-if="!list\.length"/.test(records) && !/:text="[^"]*\bpage\b/.test(records));
ok('空态文案吃 error（取不到 ≠ 什么都没发过，M13）', /:text="error \|\| '这场直播还没有发过红包'"/.test(records));
ok('空态与 u-loadmore 互斥（loadmore 带 rows.length 前置）', /<u-loadmore :status="loadStatus" v-if="rows\.length && loadStatus !== 'nomore'">/.test(records));
ok('本屏空态与参照页同一判据（骨架 v-if + list v-else 合起来正好排掉 loading）', /<div class="rp-rec-list" v-else>/.test(records) && /v-if="loading && !rows\.length"/.test(records) && /!students\.length && !loading/.test(refListTpl));
// 17b. 这一页没取到、前面还有行 → 只说一句，不把已摆着的行抹掉（抹掉就是「记录凭空消失」）
ok('有行且出错时有一句实话（.rp-rec-error）', /<div class="rp-rec-error" v-if="rows\.length && error">\{\{ error \}\}<\/div>/.test(records));
/* 两档的 v-if 判据必须真的互为反面（空态是「整表为空」，错误行是「有行且取失败」）。
   原来那一句用「!rows.length 与 rows.length && error 相距 200 字以内」当判据——
   那是把「挨着」当「互斥」的代理：空态与错误行之间隔着整段列表与骨架后（实测相距 2473 字），
   断言自己先红着。判据改成直接取两处 v-if 的字面量比对，谁把另一处写反了立刻红。 */
const emptyGuard = (records.match(/<u-empty[\s\S]{0,200}?v-if="([^"]*)"/) || ['', ''])[1];
const errorGuard = (records.match(/class="rp-rec-error" v-if="([^"]*)"/) || ['', ''])[1];
ok('错误行与空态判据互为反面（同一屏不同时出）',
  /rows\.length/.test(errorGuard) && /!rows\.length/.test(emptyGuard) && !/\bloading\b/.test(emptyGuard),
  `空态 v-if="${emptyGuard}" / 错误行 v-if="${errorGuard}"`);
ok('错误行有样式（12px 暖红居中；压在白面板上，不在粉底行里）', /font-size:\s*12px/.test(rowStyle('rp-rec-error')) && /color:\s*#c2273d/.test(rowStyle('rp-rec-error')) && /text-align:\s*center/.test(rowStyle('rp-rec-error')));
ok('then/catch 两支都只在「本来就是空表」时清成空态', /if \(target === 1 && !this\.rows\.length\) \{/.test(thenBlock) && /if \(target === 1 && !this\.rows\.length\) \{/.test(catchBlock));
ok('失败那两支不关 hasMore（关了就收成 nomore，用户连重试的点都没了）', !/this\.hasMore = false/.test(thenBlock) && !/this\.hasMore = false/.test(catchBlock));
// 17c. 同族另两处的空态仍在（回归：这一族三处都要有）
ok('信封弹窗领取记录仍留「一只都没人领」那一档', /class="rp-records-empty" v-if="!grabList\.length"/.test(tplOf(modalVue)));
ok('我的红包记录页空态仍在（u-empty + !loading）', /<u-empty[^>]*v-else-if="!loading"[^>]*text="暂无红包记录"/.test(myLogVue));

// 18. 2026-10-01 用户点名「红包记录中，点击弹出领取红包弹窗，不要关闭这个红包记录弹窗」
//     ——两只弹层由「先后开、记先行退」改成「同时在场」：记录这一屏不收，信封叠在上面。
//     接线这一族静态门禁本来看不见（上一版是页面 handler 里一行 this.showRedpacketRecords = false，
//     门禁没钉 ⇒ 这类「弹层叠放」必须钉在这份脚本里当契约）。
const pickFn = (liveJs.split('openRedpacketFromRecord(row)')[1] || '').split('\n    },')[0];
// 18a. 点行那一跳不再收记录弹层（收了就等于「关掉这一屏」，正是用户点名要去掉的动作）
ok('点行不关记录弹层（函数体内不再有 showRedpacketRecords = false）', pickFn.length > 0 && !/showRedpacketRecords/.test(pickFn));
ok('点行仍开信封（showRedpacketModal = true 留着）', /this\.showRedpacketModal = true;/.test(pickFn));
ok('缺 id 那一支仍先说话再 return（点了没反应要有话说，不是去关这一屏）', /if \(!row \|\| !row\.id\) \{[\s\S]{0,200}?uni\.showToast[\s\S]{0,120}?return;/.test(pickFn));
// 18b. 两只同时在场：这一屏仍挂在页面上并仍吃 @pick（收掉挂点等于改回「只开信封」）
ok('记录弹层挂点仍在且仍接 @pick', /<redpacket-records[\s\S]{0,200}@pick="openRedpacketFromRecord"/.test(liveVue));
ok('记录弹层显隐仍绑 showRedpacketRecords', /<redpacket-records[\s\S]{0,200}:visible="showRedpacketRecords"/.test(liveVue));
// 18c. 叠放分层靠 z-index，不靠「谁写在模板后面谁在上」那一档隐式排法（u-popu 的 zIndex/遮罩都是 props）
const zOf = (src) => Number(((tplOf(src).match(/:zIndex="(\d+)"/) || [])[1] || 0));
const ovOf = (src) => Number(((tplOf(src).match(/:overlayStyle="\{ zIndex: (\d+) \}"/) || [])[1] || 0));
ok('信封那一层的 zIndex 高于记录那一层', zOf(modalVue) > zOf(records), zOf(modalVue) + ' > ' + zOf(records));
ok('信封遮罩也高一层（遮罩压不住内容就会看到底下一屏「没关」的记录而不是信封）', ovOf(modalVue) > ovOf(records), ovOf(modalVue) + ' > ' + ovOf(records));
ok('两层仍在同一档 102xx 之上（uview 弹层默认 10075，本页 gift/连麦那批走默认）', zOf(modalVue) >= 10200 && ovOf(modalVue) >= 10200, zOf(modalVue) + '/' + ovOf(modalVue));

// 19. 2026-10-02 用户点名「红包记录弹窗用列表是横幅粉红色的，那么加载状态是灰色的，
//     这样导致不协调，可以把这个骨架屏搞成红色的，或者是粉红色的，协调一点」
//     ——行底是信封红 8% 的粉，骨架行也跟到同一档（不跳版），但压在行底上那四块占位块
//     还留着全站那一档中性灰 #e5e6eb：两个色系压在一处，10px 那两小块读起来像「一片脏东西」。
//     判据：**有色底 + 逐块骨架**的行，占位块颜色跟那块底同族（从同一支红派生、只改浓度）；
//     白底上的骨架照旧灰。纯颜色值，正则判不出「哪一块压在有色底上」，故落在页面脚本里。
const styleNoComment = styleText.replace(/\/\*[\s\S]*?\*\//g, '');
// 骨架段：从容器那一条到 style 结束（前面还有真实行与标签那一族，不能拿整段一起判「还有没有灰」）
const skSection = styleNoComment.slice(styleNoComment.indexOf('.rp-rec-sk {'));
// 四块共用一条声明（颜色与圆角都只写一次）——分成四条各写一遍色值就是「只改一块」的复发入口
const sharedSkBlock = (skSection.match(/\.rp-rec-sk-line,\s*\.rp-rec-sk-tag,\s*\.rp-rec-sk-amount,\s*\.rp-rec-sk-time\s*\{[\s\S]*?\}/) || [''])[0];
ok('四块骨架占位块共用同一条声明（形状与颜色只写一处）', !!sharedSkBlock);
ok('占位块底色与行底同族：信封红 rgba(240,67,92,0.28)（行底 0.08 更浓一档，观感 ≈ #fab7c4）',
  /border-radius:\s*4px/.test(sharedSkBlock) && /background:\s*rgba\(240,\s*67,\s*92,\s*0\.28\)/.test(sharedSkBlock));
ok('骨架里不再有全站那一档中性灰 #e5e6eb（灰块压粉底＝两个色系）', !/#e5e6eb/.test(skSection));
// 各块那条只留几何：底色与圆角都归共用那条。逐条查是为了「只改其中一块」这个复发入口（用例里做过负控）
const skAfterShared = sharedSkBlock ? skSection.slice(skSection.indexOf(sharedSkBlock) + sharedSkBlock.length) : '';
const ownSkRule = (cls) => ((skAfterShared.match(new RegExp('\\n\\.' + cls + ' \\{[^}]*\\}')) || [''])[0]);
ok('各块自身那条不带底色（颜色与圆角只由共用那条给）',
  ['rp-rec-sk-name-row', 'rp-rec-sk-line--title', 'rp-rec-sk-line--meta', 'rp-rec-sk-tag', 'rp-rec-sk-side', 'rp-rec-sk-amount', 'rp-rec-sk-time']
    .every((c) => ownSkRule(c).length > 0 && !/background|border-radius/.test(ownSkRule(c))));
ok('换色不外溢：白底那三只弹窗的骨架仍是灰块',
  [read('src/pages/course/live/gift/gift-modal.vue'), read('src/pages/course/live/goods/goods-modal.vue'), read('src/pages/course/live/link/css.css')]
    .every((s) => /#e5e6eb/.test(s) && !/rgba\(240,\s*67,\s*92,\s*0\.28\)/.test(s)));

// 20. 2026-10-05 用户点名「我的红包弹窗是通过红色背景加淡粉色块组成的，但是红色背景上半部分
//     还是会显示一个灰色的磨砂透明背景，这个磨砂透明背景要去掉」。
//     两个来源叠在同一处：① 红身写 rgba(...,0.94) + backdrop-filter: blur(10px)，
//     底下是 u-popup 的 rgba(0,0,0,.5) 遮罩与直播间画面，blur 把它糊成一层灰雾；
//     ② .rp-shell 原先 top:44px，头顶那一段没人铺色（白卡是 margin:0 14px 起的那块，
//     顶上只露左右各 14px 空档），透出来的同样是遮罩下的画面。
//     判据：**弹层壳体本身要实色**——有色底不许带 backdrop-filter，也不许留 <1 的 alpha；
//     壳体那一层要铺满整块面板，不留任何一段没人着色的空档。
//     这一族是「壳体自己的底色」，与组 19 的「行内骨架块」不同层，故单列一组。
const rpCssNoComment = rpCss.replace(/\/\*[\s\S]*?\*\//g, '');
const shellRule = (cls) => ((rpCssNoComment.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0]);
const shellBody = (cls) => ((rpCssNoComment.match(new RegExp('\\.' + cls + '\\s*\\{[^}]*\\}')) || [''])[0]);
ok('红身不带 backdrop-filter（磨砂＝把遮罩下的直播间画面糊成灰雾）', !/backdrop-filter/.test(shellBody('redpacket-modal')) && !/backdrop-filter/.test(shellBody('rp-shell')));
ok('红身两处都是不透明实色（#fa4a60 → #ec324e），不再有 alpha < 1 的 rgba 底',
  /#fa4a60/.test(shellBody('redpacket-modal')) && /#fa4a60/.test(shellBody('rp-shell')) && !/background[^;]*rgba\(/.test(shellBody('redpacket-modal')) && !/background[^;]*rgba\(/.test(shellBody('rp-shell')));
ok('红身从面板顶就铺满（.rp-shell 不再 top:44px 留一段没人着色）',
  /position:\s*absolute/.test(shellRule('rp-shell')) && /top:\s*0/.test(shellRule('rp-shell')) && /bottom:\s*0/.test(shellRule('rp-shell')));
ok('白卡态把面板自己的底色让给 .rp-shell（is-card 收成 transparent，红身不两处各铺一份）',
  /\.redpacket-modal\.is-card\s*\{[^}]*background:\s*transparent/.test(rpCssNoComment));
ok('半透明红那一档在整份信封样式里已清干净（不留 rgba(250,74,96,.94) / rgba(236,50,78,.94) 残写法）',
  !/rgba\(250,\s*74,\s*96/.test(rpCssNoComment) && !/rgba\(236,\s*50,\s*78/.test(rpCssNoComment));

let fail = 0;

results.forEach((r) => {
  if (!r.pass) fail++;
  console.log(`${r.pass ? '[PASS]' : '[FAIL]'} ${r.name}${r.note ? ' — ' + r.note : ''}`);
});
console.log(`\n共 ${results.length} 条，失败 ${fail} 条`);
process.exit(fail ? 1 : 0);
