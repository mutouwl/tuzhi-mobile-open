/**
 * 直播间「我的邀请」弹层这一份版式的机器验法（硬约束 26：一类界面偏离被点名时先补机器化验法，
 * 通用正则判不出的落在页面脚本里，同 check-redpacket-records.js / check-invite-rank-board.js 的做法）。
 *
 * 跑法：node tuzi-mobile/scripts/check-invite-rank-my-invite.js
 *
 * 钉的是 2026-10-01 用户点名的三件事 + 两族连带口径：
 *   ① 「接受邀请时间」靠右对齐——表头、行、上面那组骨架共用同一列宽，三处右缘才是同一条竖线；
 *   ② 「已邀请人数」并到头像昵称的右侧、与它们同一基线垂直对齐（原先是身份行下面单独一整条灰卡）；
 *   ③ 那一格内数值在上、label 在下，label 与数值同一轴水平居中；
 *   ④ 行内项与项的间距只由容器 gap 给（硬约束 20 / W41③：给某一项写 margin-left，
 *      它一 v-if 收起就成了下一项的左偏移）；
 *   ⑤ M22 名次/人数/身份全后端算好下发：时间文本吃接口字段，身份吃 props，不在前端格式化；
 *   ⑥ 骨架屏 / 分页 / 下拉刷新 / 上拉加载 / 空态这五条链**两端都得接上**——弹层这一半在
 *      my-invite.vue，页面那一半在 invite-rank-entry.vue，中间靠 $emit ↔ @事件 三个字串起来。
 *      这类「跨组件边界的接线」sfc-check 与 ui-audit 都看不见（硬约束 27③），故逐跳钉死。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const myInvite = read('src/pages/course/live/invite-rank/my-invite.vue');
const page = read('src/pages/course/live/invite-rank/invite-rank-entry.vue');
const popupList = read('src/components/tz/popup-list.vue');

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

/* ---------- 工具 ---------- */
/** 注释先剥掉：这一份里大量档位注释会点名别的类名，不剥会把注释里那一处当成类块取出来 */
const tplOf = (src) => src.slice(0, src.indexOf('<script')).replace(/<!--[\s\S]*?-->/g, '');
const styleOf = myInvite.slice(myInvite.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const blockOf = (cls) => (styleOf.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0];
const decl = (block, prop) => {
  const m = new RegExp('(?:^|[;{\\s])' + prop + '\\s*:\\s*([^;{}]+)').exec(block);
  return m ? m[1].replace(/\s*!important$/, '').trim() : '';
};
const tpl = tplOf(myInvite);
/** JS 段注释先剥（同上，脱敏那一节判的是实现而不是注释里的示例） */
const myJs = myInvite.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
/** 从模板里取某个 class 所在的整个元素块（配对数括号，遇到自闭合标签就收口） */
const elOf = (cls) => {
  const i = tpl.indexOf('class="' + cls + '"');
  if (i < 0) return '';
  const open = tpl.lastIndexOf('<', i);
  const selfClose = /\/>$/.test(tpl.slice(open, tpl.indexOf('>', i)));
  if (selfClose) return tpl.slice(open, tpl.indexOf('>', i) + 1);
  let depth = 0, end = open;
  for (let p = open; p < tpl.length; p++) {
    if (tpl[p] === '>' && tpl[p - 1] === '/') continue;
    if (tpl[p] === '<' && tpl[p + 1] === '/') { depth--; if (!depth) { end = tpl.indexOf('>', p) + 1; break; } }
    else if (tpl[p] === '<') depth++;
  }
  return tpl.slice(open, end);
};

/* ================= ① 「接受邀请时间」靠右 ================= */
const colTime = decl(blockOf('irm-col-time'), 'text-align');
const rowTime = decl(blockOf('irm-row-time'), 'text-align');
const skTime = decl(blockOf('irm-sk-time'), 'text-align');
ok('表头「接受邀请时间」右对齐', colTime === 'right', `实取 ${colTime || '（没写）'}`);
ok('明细行的时间右对齐', rowTime === 'right', `实取 ${rowTime || '（没写）'}`);
ok('时间列三处都是定宽不摊开（摊成 flex:1 就没有同一条右缘可对齐）', decl(blockOf('irm-col-time'), 'flex') === 'none' && decl(blockOf('irm-row-time'), 'flex') === 'none');
ok('骨架那条时间灰块也是定宽那一档（跟着真实列改，别留半行宽）', decl(blockOf('irm-sk-time'), 'flex') === 'none' && !!decl(blockOf('irm-sk-time'), 'width'));
const cw = decl(blockOf('irm-col-time'), 'width');
const rw = decl(blockOf('irm-row-time'), 'width');
const kw = decl(blockOf('irm-sk-time'), 'width');
ok('表头与明细行的时间列同宽 ⇒ 右缘是同一条竖线', cw === rw && !!cw, `表头 ${cw} / 行 ${rw}`);
ok('骨架时间条与真实那一列同宽', kw === rw, `骨架 ${kw} / 行 ${rw}`);
/** 后端下发的是 date('Y-m-d H:i')（application/api/controller/app/invite_rank/Rank.php:123），16 个字符 */
ok('时间列宽够放下后端那个 16 字符的 Y-m-d H:i（按 12px 最宽字形估）', parseInt(rw, 10) >= 88, `实取 ${rw}`);
ok('时间不折行', decl(blockOf('irm-col-time'), 'white-space') === 'nowrap' && decl(blockOf('irm-row-time'), 'white-space') === 'nowrap');
ok('受邀人那一列仍吃余量（超长昵称走省略号，不被时间列顶走）', decl(blockOf('irm-col-name'), 'flex') === '1' && decl(blockOf('irm-row-who'), 'flex') === '1' && decl(blockOf('irm-row-name'), 'text-overflow') === 'ellipsis');
ok('时间文本吃接口下发的字段，不在前端自己格式化时间（M22）', /\{\{\s*item\.count_time_text\s*\}\}/.test(tpl) && !/formatTime|\$moment|new Date\(item/.test(myInvite));

/* ================= ② 已邀请人数并到头像昵称那一行 ================= */
const userTpl = elOf('irm-user');
ok('身份行里有头像、昵称、已邀请人数三块', /class="irm-avatar"/.test(userTpl) && /class="irm-name"/.test(userTpl) && /class="irm-stat"/.test(userTpl));
ok('已邀请人数那一格是身份行的直接子节点（不再是身份行下面单列一条）', /class="irm-stat"/.test(userTpl) && tpl.indexOf('class="irm-stat"') < tpl.indexOf('</view>', tpl.indexOf('class="irm-name"')));
ok('原先那条独立统计卡容器（irm-stats）已从模板与样式里退场', !/irm-stats/.test(tpl) && !/irm-stats/.test(styleOf));
ok('身份行是同一基线（与 44px 头像垂直对齐）', decl(blockOf('irm-user'), 'align-items') === 'center');
ok('那一格吃右缘（flex:none：昵称再长也顶不走它）', decl(blockOf('irm-stat'), 'flex') === 'none');
ok('昵称夹在头像与统计之间并吃余量', decl(blockOf('irm-name'), 'flex') === '1' && decl(blockOf('irm-name'), 'min-width') === '0' && decl(blockOf('irm-name'), 'text-overflow') === 'ellipsis');

/* ================= ③ 格内：数值在上、label 在下且同轴居中 ================= */
const statTpl = elOf('irm-stat');
ok('那一格里数值排在 label 上方', statTpl.indexOf('irm-stat-num') > 0 && statTpl.indexOf('irm-stat-num') < statTpl.indexOf('irm-stat-label'));
ok('纵向排 + 横向居中（label 与数值落在同一轴上）', decl(blockOf('irm-stat'), 'flex-direction') === 'column' && decl(blockOf('irm-stat'), 'align-items') === 'center');
ok('label 文案是「已邀请人数」', />已邀请人数</.test(statTpl));
ok('数值恒渲染（0 就写 0，不加 v-if 也不写三元兜底——加了就把 0 那一档藏掉了）', /\{\{\s*inviteNum\s*\}\}/.test(statTpl) && !/v-if="[^"]*inviteNum/.test(statTpl) && !/inviteNum\s*\?/.test(myInvite));

/* ================= ④ 间距只由容器 gap 给（硬约束 20 / W41③） ================= */
['irm-user', 'irm-row-who', 'irm-sk-who'].forEach((c) => {
  ok(`.${c} 的项间距由容器 gap 给`, decl(blockOf(c), 'gap') === '10px');
});
['irm-name', 'irm-row-name', 'irm-sk-name'].forEach((c) => {
  ok(`.${c} 不再自带 margin-left（那一项一 v-if 收起就成了下一项的左偏移）`, decl(blockOf(c), 'margin-left') === '');
});
ok('昵称那一项与头像之间没叠出双份间距（头像也不自带 margin）', decl(blockOf('irm-avatar'), 'margin-right') === '' && decl(blockOf('irm-row-avatar'), 'margin-right') === '');

/* ================= ⑤ 身份与时间一律吃后端/上游（M22 + M27） ================= */
ok('身份吃 props（头像/昵称都是传进来的），不从本地用户缓存里读', !/cachedUser/.test(myInvite) && /avatar:\s*\{\s*type: String/.test(myInvite) && /nickname:\s*\{\s*type: String/.test(myInvite));
ok('自己那一行的头像 @error 只落组件标记，不回写 props（M27）', /myAvatarFailed:\s*false/.test(myInvite) && /onMyAvatarError\(\)\s*\{\s*this\.myAvatarFailed = true;/.test(myInvite) && !/this\.\$emit\([^)]*avatar/.test(myInvite));
ok('prop 读点过 computed，调用点给 null 也不炸（M26）', /myAvatar\(\)\s*\{[\s\S]{0,160}this\.avatar/.test(myInvite) && /\$emit\('refresh'\)/.test(myInvite));
ok('组件对外事件全是非原生名（M28①）', /emits:\s*\['close',\s*'refresh',\s*'load-more'\]/.test(myInvite) && !/emits:[^\]]*'tap'/.test(myInvite));
ok('空态与失败文案那一支交出去（列表空了由 u-empty 说，不是留白）', /u-empty/.test(tpl) && /还没有好友接受你的邀请/.test(tpl));

/* ================= ⑥ 骨架屏 / 分页 / 下拉刷新 / 上拉加载 / 空态：五条链逐跳接死 =================
 * 弹层这一半在 my-invite.vue，页面那一半在 invite-rank-entry.vue，中间靠三个字串起来：
 *   tz-popup-list --@refresherrefresh/@scrolltolower--> my-invite --@refresh/@load-more--> 页面 handler --> 接口。
 * 这三跳里任何一跳断了，sfc-check（只编译模板）与 ui-audit（只查版式）都照样全绿。 */
const pageTpl = tplOf(page);
const pageJs = page.slice(page.indexOf('<script')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
/** 取某个组件标签的整段开标签（含跨行的属性）：在调用方那份模板里找，别在自己的模板里找 */
const tagOf = (name, src) => ((src || tpl).match(new RegExp('<' + name + '\\b[^>]*>')) || [''])[0];

/* —— ⑥-1 骨架屏 —— */
ok('列表区的加载态是骨架屏，不是转圈、也不是「>加载中<」文字块（硬约束 12）',
  /class="irm-sk"/.test(tpl) && !/u-loading-icon|u-loading-page|u-loadmore[^>]*status="loading"|加载中/.test(tpl));
ok('骨架判据是「取数中且一行都没出」（写成 loading 会让下拉刷新把已出的行整体换成骨架）',
  /v-if="loading && !rows\.length"/.test(tpl));
const skTpl = elOf('irm-sk');
ok('骨架按真实行的三块逐块铺：头像 32 圆块 + 昵称条 + 时间条（不是一条整行灰条）',
  /class="irm-sk-avatar"/.test(skTpl) && /class="irm-sk-name"/.test(skTpl) && /class="irm-sk-time"/.test(skTpl) && /v-for="i in 5"/.test(skTpl));
ok('骨架灰块取站内那一档 #e5e6eb', ['irm-sk-avatar', 'irm-sk-name', 'irm-sk-time']
  .every((c) => decl(blockOf(c), 'background') === '#e5e6eb'));
ok('页面把取数中状态传给弹层（:loading 两端对上）', /:loading="myLoading"/.test(pageTpl) && /loading:\s*\{\s*type: Boolean/.test(myInvite));
ok('进请求前就置上取数中（不等 then，首帧就有骨架）',
  /this\.myLoading = true;[\s\S]{0,200}?\$api\('invite_rank\.rank\.my'/.test(pageJs));

/* —— ⑥-2 分页 —— */
const myCall = (pageJs.match(/\$api\('invite_rank\.rank\.my',\s*\{([^}]*)\}/) || ['', ''])[1];
ok('请求带页码（分页由后端按 page 切片）', /page: target/.test(myCall), `实发 ${myCall.trim() || '（没取到）'}`);
ok('页大小不写死在前端（后端 PAGE_SIZE_APP 那一档，硬约束 9 / M22）', !!myCall && !/limit/.test(myCall));
ok('「还有没有下一页」只认接口下发的 has_more，不自己拿 rows.length 比',
  /this\.myHasMore = !!data\.has_more;/.test(pageJs) && !/rows\.length\s*[<>=]/.test(pageJs));
ok('第一页覆盖、往后追加（不覆盖会把第 1 页顶掉，不追加会重复）',
  /this\.myRows = target === 1 \? \(data\.rows \|\| \[\]\) : this\.myRows\.concat\(data\.rows \|\| \[\]\);/.test(pageJs));
ok('页码跟着请求落（上拉时才知道该要第几页）', /this\.myPage = target;/.test(pageJs));
ok('上拉加载：没有更多或还在取数就早退，要的是 myPage + 1（硬约束 22：在途不加转圈）',
  /loadMyMore\(\)\s*\{\s*if \(!this\.myHasMore \|\| this\.myLoading\) \{ return; \}\s*this\.loadMy\(this\.myPage \+ 1\);/.test(pageJs));
ok('分页三态交出去给底部那条 loadmore', /myLoadStatus\(\)/.test(pageJs)
  && /:load-status="myLoadStatus"/.test(pageTpl)
  && /loadStatus:\s*\{\s*type: String/.test(myInvite)
  && /u-loadmore[\s\S]{0,140}?loadStatus/.test(tpl));
ok('没有下一页那一档不画底部条', /v-if="rows\.length && loadStatus !== 'nomore'"/.test(tpl));

/* —— ⑥-3 下拉刷新 —— */
ok('列表区开着的下拉刷新没被关掉（tz-popup-list 的 refreshable 默认 true，标签上不写 false）',
  /refreshable[\s\S]{0,80}?default: true/.test(popupList) && !/:refreshable="false"/.test(tpl));
ok('列表区把原生刷新事件抛出去', /@refresherrefresh="\$emit\('refresh'\)"/.test(popupList));
ok('弹层把刷新状态交给列表区（原生刷新圈受控，不由它自转）', /:refreshing="refreshing"/.test(tagOf('tz-popup-list')));
ok('弹层把刷新事件再抛给页面（$emit ↔ 调用点 @名 两侧逐字对上）', /@refresh="\$emit\('refresh'\)"/.test(tagOf('tz-popup-list')) && /emits:\s*\[[^\]]*'refresh'/.test(myInvite));
ok('页面绑上刷新事件并重取第一页', /@refresh="refreshMy"/.test(tagOf('my-invite', pageTpl))
  && /refreshMy\(\)\s*\{\s*this\.myRefreshing = true;\s*this\.loadMy\(1\);/.test(pageJs));
ok('每一条出口都把刷新状态复位（成功/失败/异常/未登录，漏一条原生刷新圈就卡住不消 —— 硬约束 22）',
  (pageJs.match(/this\.myRefreshing = false;/g) || []).length >= 3);

/* —— ⑥-4 上拉加载更多 —— */
ok('列表区滚动到底抛出去', /@scrolltolower="\$emit\('lower'\)"/.test(popupList));
ok('弹层把上拉加载再抛给页面（emit 名 load-more 避开原生名，M28①）', /@lower="\$emit\('load-more'\)"/.test(tagOf('tz-popup-list'))
  && /emits:\s*\[[^\]]*'load-more'/.test(myInvite) && !/emits:[^\]]*'scroll'/.test(myInvite));
ok('页面绑上上拉加载', /@load-more="loadMyMore"/.test(tagOf('my-invite', pageTpl)) && /loadMyMore\(\)\s*\{/.test(pageJs));

/* —— ⑥-5 空状态 —— */
ok('空态判据是一行都没出', /<u-empty[\s\S]{0,200}?v-if="!rows\.length"/.test(tpl));
ok('空态排在取数那一支之后（取数中是骨架，不是空态）',
  tpl.indexOf('v-if="loading && !rows.length"') < tpl.indexOf('<u-empty'));
ok('空态文案吃上游 error（失败原因由接口说，不在前端写死一套）', /:text="error \|\| '还没有好友接受你的邀请'"/.test(tpl));
ok('「没登录」与「请求失败」是两种成因，空态分开说（M13：下拉刷新等不来结果的那种别写成服务坏了）',
  /登录后可查看你邀请的好友明细/.test(pageJs) && /邀请明细获取失败/.test(pageJs));
ok('失败文案优先用接口那句 ret.msg，不自己编', /\(ret && ret\.msg\) \|\| '邀请明细获取失败，请下拉刷新重试'/.test(pageJs));
ok('异步回来先过「页面已出栈」闸门，硬约束 23（漏了会把 setData 通道拖死）',
  (pageJs.match(/if \(this\.gone\(\)\) \{ return; \}/g) || []).length >= 2);

/* ================= ⑦ 昵称脱敏（2026-10-03 用户点名，与达人榜同一档） ================= */
ok('两处昵称都过脱敏，模板里没有裸插值',
	/class="irm-name">\{\{ maskName\(nickname\) \}\}/.test(myInvite) &&
	/class="irm-row-name">\{\{ maskName\(item\.nickname\) \}\}/.test(myInvite) &&
	!tpl.match(/\{\{\s*(item\.)?nickname\s*\}\}/));
ok('顶部自己的昵称与明细行走同一个转发口（不分档：分档要靠 user_id 比对，那是前端算身份，撞 M22）',
	(tpl.match(/\{\{ maskName\((?:item\.)?nickname\) \}\}/g) || []).length === 2);
ok('实现取自主包那一份共用工具（不在本组件里另写，全站单一真源见 check-nickname-mask.js）',
	/import \{ maskNickname \} from '@\/common\/utils\/privacy'/.test(myJs) && !/slice\(0,\s*1\)/.test(myJs));
ok('两处昵称格仍保留单行截断（脱敏后长度上界只有 4 字符，但不许因此把规则删掉）',
	['irm-name', 'irm-row-name'].every((c) => /white-space:\s*nowrap/.test(blockOf(c)) && /text-overflow:\s*ellipsis/.test(blockOf(c))));
ok('骨架屏那一格仍是灰块，脱敏是显示态不许顺手动到它（M16/M18）', /class="irm-sk-name"><\/view>/.test(myInvite) && !/irm-sk-name[^>]*>\{\{/.test(myInvite));

/* ================= ⑧ 2026-10-05 点名：去掉「邀请明细」小节标题 ================= */
/* 用户点名「我的邀请弹窗中不要显示邀请明细 title」。那一行标题原本兼着两件事：文案 + 身份行到表头
   之间的间距。删掉节点必须把间距搬到 .irm-user 自己身上——只删节点不补间距，那一档会塌成身份行
   贴着表头，正是当初点名「邀请明细上面边距大一点」要修的那个病（反向复发）。
   判据要分清两行字：表头「受邀人 / 接受邀请时间」是**列名**，留着；删的只是段落名那一行。 */
ok('「邀请明细」小节标题整行删干净（模板里没有那个节点，也没有任何一处替代它）',
  !/irm-sub/.test(tpl) && !/邀请明细/.test(tpl));
ok('那一行标题的样式块也一并删掉（搬走了就不留第二处，别留一个没人认领的类）',
  !blockOf('irm-sub') && !/\.irm-sub\b/.test(styleOf));
ok('身份行到下面那档表头的间距搬到了 .irm-user 自己身上（删了标题不能把间距一起删没）',
  !!decl(blockOf('irm-user'), 'margin-bottom'),
  `实取 margin-bottom ${decl(blockOf('irm-user'), 'margin-bottom') || '（没写）'}`);
ok('间距仍取当初点名定下的那一档 24px（相邻档 16 / 32 报给用户定，不擅自挪）',
  decl(blockOf('irm-user'), 'margin-bottom') === '24px',
  `实取 ${decl(blockOf('irm-user'), 'margin-bottom') || '（没写）'}`);
ok('表头两列仍在（那是列名不是段落名，不许连它一起删）',
  /class="irm-cols"/.test(tpl) && /受邀人/.test(tpl) && /接受邀请时间/.test(tpl));
ok('身份行仍在（那一格是「这是谁的名单」，删了标题之后全靠它分出两截）',
  /class="irm-user"/.test(tpl) && /已邀请人数/.test(tpl));
ok('列表区仍紧跟在身份行之后（标题删了，中间不夹任何别的东西）',
  tpl.indexOf('class="irm-user"') > -1 && tpl.indexOf('class="irm-user"') < tpl.indexOf('<tz-popup-list'));

let fail = 0;
results.forEach((r) => {
  if (!r.pass) fail++;
  console.log(`${r.pass ? '[PASS]' : '[FAIL]'} ${r.name}${r.note ? ' — ' + r.note : ''}`);
});
console.log(`\n共 ${results.length} 条，失败 ${fail} 条`);
process.exit(fail ? 1 : 0);
