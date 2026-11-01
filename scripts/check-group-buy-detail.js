/**
 * 拼团「我的拼团」两页 + 入口链路的机器验法（PRD §9.4 要求的第二只新建脚本）
 * （硬约束 26：没有 pattern 的类别对 `ui-audit --all` 等于不存在）
 *
 * 跑法：node tuzi-mobile/scripts/check-group-buy-detail.js
 *      node tuzi-mobile/scripts/check-group-buy-detail.js --can-be-red
 *
 * 这一只钉的是 `sfc-check`（只编译模板）、`ui-audit`（只按正则查版式）、后端 curl（只验接口出口）
 * **三条门禁都看不见**的那一半：跨文件接线、入口判据、登记表键是否真存在、两页是否各自造了一套形态。
 * 2026-10-16 补 ⑨ 组：拼团商品已由「课程 + 实物」扩到后端 `ActivityForm::GOODS_TYPES` 那**六大类**，
 * 每一类都得在**自己那件商品的详情页**挂上拼团区并接上兑账那一环 —— 白名单放开而端上没挂，
 * 接口一路 200、商家建的活动照样卖不出去（硬约束 39⑦，PRD §十二 H9 记的那笔欠账）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
// 行尾统一按 LF 读（Windows 下 `core.autocrlf=true` 的工作副本是 CRLF，而判据里大量
// `\n\s*键:` 这种跨行钉法是按 LF 写的 ⇒ 同一份代码在 CRLF 副本上会假红）
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replace(/\r\n/g, '\n');
// 后端只读件（2026-10-27：预热/弹幕/模拟人数的判据在 library 侧，端上门禁也要核那一半）
const BE = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend', 'application');
const be = (rel) => { try { return fs.readFileSync(path.join(BE, rel), 'utf8').replace(/\r\n/g, '\n'); } catch (e) { return ''; } };

const IDX = 'src/pages/app/group_buy/index/index.vue';
const DET = 'src/pages/app/group_buy/detail/detail.vue';
const AREA = 'src/components/tz/group-buy-area.vue';
// 2026-10-27：拼团价横幅抽成独立组件（课程详情页把它挂进价格格），横幅那一半的判据改读这一份
const BANNER = 'src/components/tz/group-buy-banner.vue';
// 2026-10-29：购买弹幕抽成独立组件（课程详情页把它挂到封面左上角），模板/轮播/清理改读这一份
const DANMU = 'src/components/tz/group-buy-danmu.vue';
const COURSE_VUE = 'src/pages/course/detail/detail.vue';
const COURSE_CSS = 'src/pages/course/detail/css.css';
const USER = 'src/pages/user/index/js.vue';
const COURSE = 'src/pages/course/detail/js.vue';
const PHYS = 'src/pages/app/physical/detail/detail.vue';
const PHYSJS = 'src/pages/app/physical/detail/js.vue';
const LANG = 'src/components/language/zh-CN.js';
const APIS = 'src/common/request/api_list.js';
const PAGES = 'src/pages.json';
const POSTER = 'src/components/tz/share-poster.vue';

const idx = read(IDX), det = read(DET), area = read(AREA), user = read(USER), banner = read(BANNER);
const danmuCmp = read(DANMU), cdVue = read(COURSE_VUE), cdCss = read(COURSE_CSS);
const course = read(COURSE), phys = read(PHYS), lang = read(LANG);
const apis = read(APIS), pages = read(PAGES), poster = read(POSTER);

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });
const countOf = (hay, needle) => hay.split(needle).length - 1;

/* ---------- ① 页签与列表形态 ---------- */
ok('1.1 我的拼团列表用共用页签 tz-tabs，不重造 u-tabs（M2/登记在册组件禁止重造）',
  /<tz-tabs\b/.test(idx) && !/<u-tabs\b/.test(idx));
ok('1.2 两页都没有 v-for 与 v-if 写在同一个元素上（列表按状态过滤走 computed）',
  !/<[a-z-]+[^>]*\bv-for=[^>]*\bv-if=/.test(idx.replace(/<!--[\s\S]*?-->/g, ''))
    && !/<[a-z-]+[^>]*\bv-for=[^>]*\bv-if=/.test(det.replace(/<!--[\s\S]*?-->/g, '')));
ok('1.3 加载态是骨架灰块，不是转圈 + 「加载中」文字块（硬约束 12）',
  !/u-loading-icon|u-loading-page/.test(idx + det) && !/>[^<]{0,3}加载中[^<]{0,4}</.test(idx + det));

/* ---------- ② 取数一律走 api_list 登记过的键 ---------- */
// 注释先剥掉：这三份文件的头部注释里**故意**写着 `$api.post(...)` 那一句反例来说明为什么不能用，
// 不剥就是把文档当代码报（precedent：check-live-popup-height.js 同一手法）
//
// **先剥 `//` 整行注释、再剥块注释**（2026-10-31 实测）：反过来的话，`//` 注释里写一个 glob
// （如 `` `pages/app/**` `` 里的 `/` + `*`）就被当成块注释的开头，一路吞到下一处 `*/`，
// 把后面真正的 import 一起吃掉 ⇒ ㉞6 这类「import 必须在」的判据假红，与代码无关。
const codeOf = (src) => src.replace(/<!--[\s\S]*?-->/g, '')
  .replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
ok('2.1 拼团三个文件的**代码**里不许出现 `$api.post(`（$api 是函数没有 .post，一调就抛 is not a function、页面永停在骨架）',
  !/\$api\.post\(/.test(codeOf(idx) + codeOf(det) + codeOf(area)));
const API_KEYS = {
  'group_buy.activity.detail': 'app/group_buy/activity/detail',
  'group_buy.activity.teams': 'app/group_buy/activity/teams',
  'group_buy.team.detail': 'app/group_buy/team/detail',
  'group_buy.team.myList': 'app/group_buy/team/myList',
  'group_buy.team.open': 'app/group_buy/team/open',
  'group_buy.team.join': 'app/group_buy/team/join',
};
Object.keys(API_KEYS).forEach((key) => {
  const url = API_KEYS[key];
  ok('2.2 接口键 ' + key + ' 在 api_list 里登记且全表只此一处（两处各登一份就是会分叉的接口表）',
    countOf(apis, "url: '" + url + "'") === 1, 'url 出现 ' + countOf(apis, "url: '" + url + "'") + ' 次');
});

/* ---------- ③ 未装态闸门与入口 ---------- */
ok('3.1 两页都在 onLoad 头里判插件安装态（三态 pluginState；init 未回包先等、未装才 toast + navigateBack）',
  countOf(idx, "pluginState('group_buy')") >= 1 && countOf(det, "pluginState('group_buy')") >= 1
    && /plugin-guard/.test(idx) && /plugin-guard/.test(det)
    && /navigateBack/.test(idx) && /navigateBack/.test(det));
ok('3.2 个人中心有「我的拼团」入口，且只吃「装没装」这一枚轴（不吃「有没有记录」——那是自锁）',
  /我的拼团/.test(user) && /app_isinstall_group_buy/.test(user)
    && /pages\/app\/group_buy\/index\/index/.test(user));
ok('3.3 课程页与实物页两处商详都挂上了拼团区（组件零调用方 = 学员端整条功能不可见；六档完整名单在 ⑨ 组那张表）',
  /<tz-group-buy-area/.test(read('src/pages/course/detail/detail.vue')) && /<tz-group-buy-area/.test(phys));
ok('3.4 课程详情页在既有 orderPaid 广播里顺带重取拼团区，不新增 onShow 整页取数（硬约束 16 例外二）',
  /gbArea/.test(course) && /reload\(\)/.test(course));

/* ---------- ④ 词条（W69 / 硬约束 35） ---------- */
ok('4.1 学员端 locale 两档都登记：根级 group_buy 与 source.group_buy（缺哪档坏哪个页面）',
  /"group_buy":\s*"拼团"/.test(lang) && /"source\.group_buy":\s*"拼团"/.test(lang));

/* ---------- ⑤ 分包注册与下拉刷新 ---------- */
ok('5.1 两页都注册在 pages/app 分包下，列表页开 enablePullDownRefresh（个人中心那一档的取舍：下拉是唯一强制重载出口）',
  /group_buy\/index\/index/.test(pages) && /group_buy\/detail\/detail/.test(pages));

/* ---------- ⑥ 分享与海报（M-P6 / 硬约束 21） ---------- */
// 2026-10-27 用户点名「生成分享海报按钮，不用单独显示了，点击邀请好友参团就自动弹出分享弹窗就好了」，
// 2026-10-28 又点了一次「不要再显示生成分享海报按钮了」⇒ 本页**撤掉那条文字链**、海报弹层的唯一入口
// 收成「邀请好友参团」一枚。这一组按新口径钉三件：弹层还在（带 pending）、入口是邀请键、页面没有第二枚。
const shareModalSrc = read('src/components/modal/share-modal.vue');
// 公共弹窗底部那枚入口在 2026-10-30 前后改过名（「推荐语」⇄「分享链接」），两种都算公共组件那一份；
// 本条只核「拼团页用的是公共弹窗、公共弹窗确实带这个入口」，不把入口叫法钉死（那会随公共组件改版虚红）
const shareModalEntry = /:show-recommend=/.test(shareModalSrc) || /:show-link=/.test(shareModalSrc);
const shareModalEvent = /@recommend=/.test(shareModalSrc) || /@share-link=/.test(shareModalSrc);
ok('6.1 拼团详情页改用**全站公共分享弹窗** `share-modal`（2026-10-30 用户点名「分享邀请好友参团的公共弹窗，'
  + '为什么没有这个获取推荐语了？」）：`type="team"` + `:val="teamId"`，公共弹窗底部那枚入口（推荐语 / 分享链接）'
  + '与 `share.getArticle` 的地址随公共组件走；页面仍没有第二枚进弹层的入口',
  /<share-modal\b/.test(codeOf(det)) && /type="team"/.test(codeOf(det)) && /:val="teamId"/.test(codeOf(det))
    && /import shareModal from '@\/components\/modal\/share-modal\.vue'/.test(codeOf(det))
    && shareModalEntry && shareModalEvent
    && !/<tz-share-poster/.test(codeOf(det))
    && !/gbd-poster-link/.test(codeOf(det)) && !/生成分享海报/.test(codeOf(det)));
ok('6.2 「邀请好友参团」就是海报弹层的唯一入口（点击即 `posterShow = true`，2026-10-27 用户原话）；'
  + '页面不许再有 `@click="openPoster"` 那一枚按钮',
  /@click="inviteFriend"/.test(codeOf(det)) && /inviteFriend\(\)/.test(codeOf(det))
    && /inviteFriend\(\)[\s\S]{0,400}this\.posterShow = true;/.test(codeOf(det))
    && !/@click="openPoster"/.test(codeOf(det)) && !/openPoster\(\)/.test(codeOf(det)));
ok('6.2b 分享弹窗的码与文案直进团详情（`type="team"` + `:val="teamId"`；后端 Links 类型表已有 team 档，'
  + '扫进去一屏就能「立即加入」；2026-10-30 起码类型由公共弹窗按 `type` 透传，页面不再自己写 codeType/codeId）',
  /type="team"/.test(codeOf(det)) && /:val="teamId"/.test(codeOf(det))
    && /:code-type="type" :code-id="shareSrc"/.test(read('src/components/modal/share-modal.vue')));

ok('6.2c 团详情倒计时是**秒级 HH:MM:SS**（超一天加 N天 前缀）且 1 秒一跳（小鹅通 01-08 / 03-05 图；分钟粒度 + 30 秒一跳读出来是「倒计时不动」）',
  /pad2\(Math\.floor\(\(total % 86400\) \/ 3600\)\)/.test(det)
    && /pad2\(total % 60\)/.test(det) && /setTimeout\(tick, 1000\)/.test(det));

/* ---------- ⑥b 「立即加入」那一档与详情页结构（2026-10-16 对照竞品 08 图重排） ---------- */
// 这一页同时是分享落地页：受邀人点开团链接时**不是成员**，底栏不能给他「邀请好友」
// （那是成员才用得上的按钮）——竞品这一档是「立即加入」。两档判据都吃后端逐行下发的 is_me。
ok('6.3 拼团中两档各给对的角色：成员（含团长）给「邀请好友+分享海报」、非成员（受邀点开分享链接那一位）给「立即加入」',
  /detail\.status === 0 && isMember/.test(det) && /v-else-if="detail\.status === 0"/.test(det)
    && /@click="joinNow"/.test(det) && /isMember\(\)/.test(det),
  'isMember 判据=' + /some\(\(m\) => m\.is_me === 1\)/.test(det));
ok('6.4 「立即加入」**先去商品自己的详情页**（2026-10-30 用户口径：多规格要先看到规格、线下活动/教务套餐在那一层补报名信息与校区学生）：'
  + '经 `$nav.groupBuyGoodsPath()` 落九类商品页、带 `gb_team/gb_activity/gb_spec/gb_ladder/gb_price` 一组扁平参数；'
  + '未知大类才回落提交订单页（goodsList 发明文空数组）；未登录先弹登录、本页不持有支付面板与建单口',
  /groupBuyGoodsPath\(/.test(codeOf(det)) && /appendQuery\(base, \{/.test(codeOf(det))
    && /gb_team: Number\(this\.teamId\)/.test(codeOf(det)) && /gb_activity: Number\(g\.id \|\| 0\)/.test(codeOf(det))
    && /gb_spec: Number\(this\.detail\.spec_id\) \|\| 0/.test(codeOf(det))
    && /gb_ladder: Number\(this\.detail\.ladder_id\) \|\| 0/.test(codeOf(det))
    && /gb_price: Number\(this\.detail\.price\) \|\| 0/.test(codeOf(det))
    && /\/pages\/order\/submit\/submit\?/.test(codeOf(det)) && /goodsList=\[\]/.test(codeOf(det))
    && /user_token/.test(codeOf(det)) && !/<tz-pay\b/.test(codeOf(det)) && !/group_buy\.team\.(open|join)/.test(codeOf(det)));
// 2026-10-29 改写：这一句按 M35 拆成「静态标签 / 数值 / 后缀」三枚 `<text>`（标签与数值不许拼成一句），
// 旧判据钉的是一整句插值 —— 形态是对的、判据是旧的（改版后一直红）。判据改钉三枚节点 + 同一口径。
ok('6.5 头区有「还差 N 人，即可拼团成功」一行（三枚 `<text>`：标签 / 数值 / 后缀，M35 不许拼成一句），'
  + 'needNum 与后端 need_num 同口径（target_num − used_num，含未支付占位）',
  /<text class="gbd-gap-text">还差<\/text>/.test(det)
    && /<text class="gbd-gap-num">\{\{ needNum \}\}<\/text>/.test(det)
    && /<text class="gbd-gap-text">人，即可拼团成功<\/text>/.test(det)
    && /Number\(this\.detail\.target_num \|\| 0\) - Number\(this\.detail\.used_num \|\| 0\)/.test(det));
// 2026-10-29 改写：`gbd-head` 那一层在 2026-10-27 重排时已并入 `.gbd-hero`（旧判据一直红），
// 「商品卡在状态区之前」的基准改用 `.gbd-main`（状态区那一块的真实容器）。
ok('6.6 商品信息置顶（对照竞品 08 图第一屏顺序：商品卡 → 状态/倒计时 → 头像 → 底栏），首帧先摆骨架卡不跳位',
  det.indexOf('gbd-goods') > -1 && det.indexOf('gbd-goods') < det.indexOf('gbd-main')
    // 2026-10-29 同日第二次点名：首帧判据收成 `firstFrame`（原来那枚 `loading && !detail.activity`
    // 在插件闸门等待期会撤掉骨架卡，首帧先亮一屏空壳）
    && /v-if="firstFrame"[^>]*:skeleton="true"/.test(det.replace(/\n/g, ' ')));
ok('6.7 倒计时时间单位对齐：`expire_time` 是秒级、`this.now` 是毫秒，必须 ×1000（2026-10-16 用户拿团 1967 点名「上面拼团中、下面已结束」——直减恒负、永远「已结束」）',
  /Number\(this\.detail\.expire_time\) \* 1000 - this\.now/.test(det));
// 判据扫代码不扫注释（模板注释里就写着「不再有虚位」这句说明本身）
const detCode = det.replace(/<!--[\s\S]*?-->/g, '');
// 2026-10-29 改写：2026-10-27 对照小鹅通重排后成员区已是「44px 头像网格 + 团长小标」（横向列表那一版已撤），
// 旧判据钉的是 2026-10-16 的纵向昵称列表 —— 设计换了、判据没跟（改版后一直红）。现在钉**当前**这一档：
// 固定 44 圆、间距由容器 gap 给、团长小标、模拟成团补位；纵向列表那一档的类与副行函数必须零残留（防两套并存）。
ok('6.8 成员区是**44px 头像网格**（2026-10-27 对照小鹅通图 1/2/4 那一版）：圆 44、间距只由 `.gbd-members` 的 gap 给、'
  + '团长那一枚挂 `团长` 小标、模拟成团按 `virtual_count` 补位；2026-10-16 那版纵向昵称列表（28 圆 + 副行 + 行底线）已撤净',
  /class="gbd-member"/.test(detCode) && /class="gbd-leader-tag"/.test(detCode)
    && /\.gbd-member-avatar\s*\{[\s\S]{0,160}width:\s*44px/.test(detCode)
    && /\.gbd-members\s*\{[\s\S]{0,200}gap:\s*16px 14px/.test(detCode)
    && !/memberSub\(|\.gbd-avatar\s*\{|gbd-avatar--virtual/.test(detCode));

ok('6.9 状态与时限同源：`showCountdown` 只认后端下发的 `detail.status === 0`，端上不再自己比 `expire_time <= now` 判状态（2026-10-18 第二次点名「显示拼团中、时间写已结束」——上一轮只修了秒/毫秒，两头各读一份事实的矛盾还在；派生收口在后端 `Team::displayStatus`，用例 `/test/GroupBuyTeamTest/testExpiredTeamShowsFailed`）',
  /showCountdown\(\) \{ return this\.detail\.status === 0 && Number\(this\.detail\.expire_time\) > 0; \}/.test(detCode)
    && !/status:\s*Date\.now\(\)|expire_time\s*<=\s*Date\.now|expire_time\)\s*<=\s*this\.now/.test(detCode));

/* ---------- ⑦ 商品卡复用形状（2026-10-18 用户点名：涉及课程卡的引用统一到紧凑档 `tz-course-mini` 并开启圆角） ---------- */
// 三件各钉一种「接口一路 200、界面却是错的」形态：① 卡片 props 对不上（整块不渲染）；
// ② 圆角/间距只给真卡那一枚、漏掉骨架那一枚（切档跳位，M16）；③ 紧凑档没有无封面占位（空封面成一块纯白）。
const miniComp = read('src/components/tz/course-mini.vue');
const cardTags = (src) => (src.replace(/\s+/g, ' ').match(/<tz-course-mini\b[^>]*>/g) || []);
ok('7.1 拼团两页的商品卡走紧凑档 `tz-course-mini`（props 里是 list，按 :list 传；传 :id 会整块不渲染而接口一路 200），大档 `tz-course` 零残留',
  /\blist\b/.test(miniComp.slice(miniComp.indexOf('props'), miniComp.indexOf('props') + 900))
    && /<tz-course-mini[^>]*:list=/.test(cardTags(idx).join(' ')) && /<tz-course-mini[^>]*:list=/.test(cardTags(det).join(' '))
    && !/<tz-course[\s/>]/.test(idx + det)
    && !/<tz-course-mini[^>]*:id=/.test(cardTags(idx).join(' ') + cardTags(det).join(' ')));
ok('7.2 每一枚商品卡都开启组件自带的圆角档（`:round="true"`，10px 由 `course-item-box-round` 给，页面不写 border-radius；骨架那一枚与真卡那一枚同批，M24）',
  cardTags(det).length >= 2 && cardTags(det).every((t) => /:round="true"/.test(t))
    && cardTags(idx).length >= 2 && cardTags(idx).every((t) => /:round="true"/.test(t)));
ok('7.3 骨架那一枚与真卡同一只组件、同 `:margin="0"`（M16 切档不跳位；行内卡不再自带下间距，卡与状态行的缝只由 `.gbl-foot` 的 padding-top 给 —— 原先真卡吃默认 margin 10、骨架给 0，两档差 10px）',
  cardTags(det).every((t) => /:margin="0"/.test(t)) && cardTags(idx).every((t) => /:margin="0"/.test(t))
    && /<tz-course-mini[^>]*:skeleton="true"/.test(cardTags(det).join(' ') + ' ' + cardTags(idx).join(' ')));
ok('7.4 紧凑档封面三态（PRD §四-21）：地址为空走自带浅灰占位（`.cover .placeholder`：`#F2F3F5` + picture 图标，与 `tz-course` 那一份选择器与色值逐字相同）；地址有效走 `<image>`（背景图没有失败回音，2026-10-29 M65）；取不到时换全站默认商品图（与地址为空那一档分开，不画成同一张假封面）',
  /class="placeholder" v-else/.test(miniComp)
    && /\.cover \.placeholder\s*\{[\s\S]{0,300}background:\s*#F2F3F5/.test(miniComp)
    && /<image[^>]*class="mini-cover"[^>]*@error="onCoverError\(item\)"/.test(miniComp)
    && /:src="defaultCover"/.test(miniComp));

/* 7.5（2026-10-29）：用户两次点名同一件事，第二次把上一版留的那个例外也否了。
 * 第一次拿团 5953「course-item 应该替换为 course-item-mini」—— 那一团 `goods_type=circle`，
 * 旧判据只认 `=== 'course'`，七档虚拟货全掉到实物卡：124 高 / 封面 170（与 `tz-course` 同一档，
 * 读出来就是「还是大卡」），而且实物卡的方向写死 `getPagePath(id, 'physical')`、点卡片落错页。
 * 上一版据此写成「非实物走紧凑档，只有 `physical` 走实物卡」；第二次用户拿团 6536
 * （`goods_type=physical`，「人工智能学习实体资料」）仍旧读出「现在还是其他组件」——
 * 同一屏里两种卡差一倍高度，实物与虚拟读成两套版式，而这一屏要摆的只有「封面 + 名称 +
 * 类型标 + 价格」四件事 ⇒ **九个大类一律紧凑档**，不许再按商品大类分叉。 */
ok('7.5 商品卡取档：九个大类一律紧凑档 `tz-course-mini`，实物 `physical` 也不再走 `tz-physical-goods`（2026-10-29 团 6536 = 实物那一团；上一次是团 5953 = 圈子）',
  /<tz-course-mini v-else-if="detail\.activity" :list="goodsCard"/.test(det.replace(/\s+/g, ' '))
    && /<tz-course-mini :list="courseCard\(row\)"/.test(idx.replace(/\s+/g, ' '))
    && !/<tz-physical-goods[\s/>]/.test(det.replace(/\s+/g, ' ') + idx.replace(/\s+/g, ' '))
    && !/isPhysical\(\)/.test(detCode.replace(/\/\*[\s\S]*?\*\//g, ''))
    && !/(?:row\.)?goods_type === 'course'/.test(detCode.replace(/\/\*[\s\S]*?\*\//g, '')));

/* ---------- ⑧ M-P7 订单那一枚拼团状态标（跨端接线，接口 200 看不出少挂了一档） ----------
 * 2026-10-29 用户点名「列表中新增了拼团的tag 导致订单号和订单状态被挤压发生换行，不要显示拼团tag」
 * ⇒ 口径改成**列表卡不挂**、详情页那一块照旧（8.3）。这三条是「减法」合同：
 *   8.1 列表卡里那枚标与它的 prop / 跳转 / 样式全撤净（留一条就会有人接回来）；
 *   8.2 列表不再把 `group_buy` 喂给卡片（喂了没渲染 = 下一轮又长回来的入口）；
 *   8.3 详情页照旧。配一颗样件：把标塞回状态那一行 ⇒ 8.1 红。
 * 头行的换行判据同一处：`.order-header` 单行 + 状态词不收缩 —— 不然下次换个标签挤进来，
 * 用户看到的还是同一句话「订单号和订单状态被挤压发生换行」。
 */
const oList = read('src/pages/order/list/list.vue'), oCard = read('src/components/order/order.vue');
const oDet = read('src/pages/order/detail/detail.vue'), oDetJs = read('src/pages/order/detail/js.vue');
const oCardBare = oCard
  .replace(/<!--[\s\S]*?-->/g, ' ')
  .replace(/\/\*[\s\S]*?\*\//g, ' ');
ok('8.1 列表订单卡不再有拼团状态标（标本体 / `groupBuy` prop / `toTeam` 跳转 / `.order-gb-tag` 样式四样全撤净；2026-10-29 用户点名「不要显示拼团tag」）',
  !/order-gb-tag/.test(oCardBare) && !/groupBuy/.test(oCardBare)
    && !/toTeam\s*\(/.test(oCardBare) && !/group-buy/.test(oCardBare));
ok('8.2 订单列表头行只喂「订单号 + 状态词」两样：不再传 `group-buy`，`status_text` 照旧传；头行单行不换行（`.order-header` nowrap + 状态词 `flex: none`）',
  !/:group-buy=/.test(oList.replace(/<!--[\s\S]*?-->/g, ' '))
    && /:status-text="item\.status_text \|\| ''"/.test(oList)
    && /\.order-header\s*\{[^}]*flex-wrap:\s*nowrap/.test(oCardBare)
    && /\.order-header\s*\{[^}]*white-space:\s*nowrap/.test(oCardBare)
    && /\.order-status\s*\{[^}]*flex:\s*none/.test(oCardBare));
ok('8.3 订单详情：拼团标是**单独一块**（独立 tz-box、`:marginTop="10"` 上下各留边距）压在订单信息列表正上方 —— 2026-10-16 用户四版定稿最后一句「拼团 cell 单独一个行，也就是说上下要有边距」；行内 title「拼团状态」+ isLink + toGroupBuyTeam，team_id 缺失时不跳（不摆点了没反应的行）',
  /<tz-box v-if="data\.group_buy && data\.group_buy\.label" :marginTop="10"/.test(oDet)
    && /title="拼团状态"/.test(oDet) && /:isLink="true"/.test(oDet)
    && /toGroupBuyTeam/.test(oDet) && !/order-gb-cell/.test(oDet)
    && /toGroupBuyTeam\(\)/.test(oDetJs) && /if \(!id\) \{ return; \}/.test(oDetJs));

/* ---------- ⑨ 拼团商品六大类的落地页（2026-10-16 用户点名把范围从「课程 + 实物」扩到六大类） ---------- */
// 商家给哪一档建了活动，学员就得在**那一档商品自己的详情页**看得见拼团区：
// 后端白名单放开而端上没挂 = 接口一路 200、这一档照样卖不出去（硬约束 39⑦「接口没报错不等于那一项做成了」；
// PRD §十二 H9 当年正是把「拼团区只挂在两个商详页」记成欠账的那一句）。
// **这一张表是「哪一档挂在哪一页」的唯一一份期望表**（硬约束 11），check-group-buy-popup.js 那边只按
// 扫到的调用点逐处核接线形状，不再另写一份名单。三个方向都必须能红：
//   ① 页面那一行被摘掉/改名 → 9.1 红；② 页面 goods-type 与本表不符 → 9.1 红；
//   ③ 本表与后端 `ActivityForm::GOODS_TYPES` 不符 → 9.6 红（后端删一档、端上留着 = 挂了一枚永远查不到活动的入口）
const GB_FORM = '../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/ActivityForm.php';
const LANDING = [
  { type: 'course', id: 'data.id', via: 'payEvent',
    vue: 'src/pages/course/detail/detail.vue', js: 'src/pages/course/detail/js.vue' },
  { type: 'physical', id: 'goodsId', via: 'onShow',
    vue: 'src/pages/app/physical/detail/detail.vue', js: 'src/pages/app/physical/detail/js.vue' },
  { type: 'composite', id: 'goodsId', via: 'onShow',
    vue: 'src/pages/app/composite/detail/detail.vue', js: 'src/pages/app/composite/detail/js.vue' },
  { type: 'circle', id: 'id', via: 'onShow',
    vue: 'src/pages/app/circle/presale/presale.vue', js: 'src/pages/app/circle/presale/js.vue' },
  { type: 'checkin', id: 'id', via: 'onShow',
    vue: 'src/pages/app/checkin/intro/intro.vue', js: 'src/pages/app/checkin/intro/js.vue' },
  { type: 'exercises', id: 'data.id', via: 'onShow',
    vue: 'src/pages/app/exam/detail/detail.vue', js: 'src/pages/app/exam/detail/js.vue' },
  // 2026-10-28 追加三档（多规格那一轮用户点名「包括实物、会员卡、线下活动、组合商品、教务套餐、圈子」）：
  // 商家能建活动 ≠ 学员能看见 —— 这三页不挂拼团区，那三档的活动就是死配置
  { type: 'vipcard', id: 'detail[checkCardIndex].id', via: 'onShow',
    vue: 'src/pages/app/vip/center/center.vue', js: 'src/pages/app/vip/center/js.vue' },
  { type: 'activity', id: 'data.id', via: 'onShow',
    vue: 'src/pages/app/activity/detail/detail.vue', js: 'src/pages/app/activity/detail/js.vue' },
  { type: 'school_package', id: 'form.id', via: 'onShow',
    vue: 'src/pages/app/school/package/detail/detail.vue', js: 'src/pages/app/school/package/detail/js.vue' },
];
/** 取 `<tz-group-buy-area ... />` 那几枚标签（含换行的属性也一起拿到） */
const gbTags = (src) => (src.match(/<tz-group-buy-area\b[\s\S]*?\/>/g) || []);
/** 取某个生命周期/方法的函数体（从函数名那一个 `{` 起做花括号配平） */
const fnBody = (src, name) => {
  const m = new RegExp('(?:\\n[ \\t]*)' + name + '\\s*\\([^)]*\\)\\s*\\{').exec(src);
  if (!m) return '';
  const i = src.indexOf('{', m.index + m[0].length - 1);
  let depth = 0;
  for (let p = i; p < src.length; p++) {
    if (src[p] === '{') depth++;
    else if (src[p] === '}') { depth--; if (!depth) return src.slice(i, p + 1); }
  }
  return '';
};
/** 从某个锚点串往后取「第一个 { 起花括号配平的那一段」，用来抓匿名 handler 的函数体 */
const blockAfter = (src, anchor) => {
  const i = src.indexOf(anchor);
  if (i < 0) return '';
  const b = src.indexOf('{', i);
  if (b < 0) return '';
  let depth = 0;
  for (let p = b; p < src.length; p++) {
    if (src[p] === '{') depth++;
    else if (src[p] === '}') { depth--; if (!depth) return src.slice(b, p + 1); }
  }
  return '';
};
let formSrc = '';
try { formSrc = fs.readFileSync(path.resolve(ROOT, GB_FORM), 'utf8'); } catch (e) { formSrc = ''; }
const formMatch = formSrc.match(/const GOODS_TYPES\s*=\s*\[([^\]]*)\]/);
const backendTypes = (formMatch ? formMatch[1] : '')
  .split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);

LANDING.forEach((p) => {
  const vue = read(p.vue), js = read(p.js);
  const tag = gbTags(vue).find((t) => new RegExp('goods-type="' + p.type + '"').test(t)) || '';
  ok('9.1 ' + p.vue + ' 挂了 <tz-group-buy-area> 且 goods-type="' + p.type + '"（与后端 GOODS_TYPES 那一档逐字相同）',
    gbTags(vue).length > 0 && /goods-type="[^"]+"/.test(vue) && /goods-type="/.test(tag), tag || '整枚标签没找到');
  ok('9.2 ' + p.type + ' 那一处的 ref 是 gbArea、:goods-id 与 v-if 都吃该页真实的商品 id「' + p.id + '」',
    /ref="gbArea"/.test(tag) && tag.indexOf(':goods-id="' + p.id + '"') > -1 && tag.indexOf(p.id) > -1,
    '标签里读到 ' + (tag.replace(/\s+/g, ' ').slice(0, 120) || '空'));
  ok('9.3 ' + p.type + ' 那一处接了 @go-pay，宿主 js 里的 handler 真存在且把账置真（置谁由那一页的判据自己定）',
    /@go-pay="gbGoPay"/.test(vue) && /=\s*true\s*;/.test(fnBody(js, 'gbGoPay')),
    /@go-pay="[^"]*"/.exec(vue) ? '' : '调用点没接 @go-pay');
  // 「从下单/支付那几跳退回来重取本区」那一环长在哪：五页必须在 onShow 里（硬约束 16 正半句）；
  // 课程详情页是**已登记的例外二**（onShow 那三档判据是保住播流地址与播放进度的前提，不许为拼团区加一条取数），
  // 它的兑账支挂在既有的 orderPaid 广播 handler 上 —— 那一支没订阅等于没写，所以两半都判
  const viaName = p.via === 'onShow' ? 'onShow' : '既有的 orderPaid 广播 handler';
  const back = p.via === 'onShow'
    ? fnBody(js, 'onShow')
    : blockAfter(js, '_onPaySuccess = function') + (/\$on\(\s*PAY_EVENT\s*,\s*vm\._onPaySuccess\s*\)/.test(js) ? ' uni.$on(PAY_EVENT,vm._onPaySuccess)' : '');
  ok('9.4 ' + p.type + ' 的「' + viaName + '」里确实有 gbArea.reload() 那一环（缺这一条 = 挂上组件但走不通链）',
    /gbArea/.test(back) && /reload\(\)/.test(back), back.replace(/\s+/g, ' ').slice(0, 90) || '读不到那一段');
  if (p.via === 'onShow') {
    const onShow = fnBody(js, 'onShow');
    // M23 只对「用了模块级 that 的页面」成立：没声明 var that 的页面（教务套餐详情）用 this，
    // 那就没有「收回当前实例」这件事可做 —— 判据按有无 var that 分岔，不逼它为了过门禁写一个假变量
    const usesModuleThat = /(?:^|\n)\s*var that;/.test(js);
    const headOk = usesModuleThat
      ? /^(?:\s*\/\/[^\n]*\n\s*)*\s*that = this;/.test(onShow.replace(/^\{/, ''))
      : true;
    ok('9.5 ' + p.type + ' 的 onShow 还带着那本账（gbPending 判据 + 复位）'
      + (usesModuleThat ? '，且第一条语句把模块级 that 收回当前实例' : '（本页不用模块级 that）'),
      /gbPending/.test(onShow) && headOk,
      onShow.replace(/\s+/g, ' ').slice(0, 90));
  }
  // 下拉刷新是这一块的唯一强制重载出口（活动停止/结束后整段要收掉就靠它）
  const drop = fnBody(js, 'onPullDownRefresh') + fnBody(js, 'refresh');
  ok('9.6 ' + p.type + ' 的下拉刷新那一条链里也带上了 gbArea.reload()',
    /gbArea/.test(drop) && /reload\(\)/.test(drop), drop.replace(/\s+/g, ' ').slice(0, 90));
});
ok('9.7 期望表与后端 ActivityForm::GOODS_TYPES 双向差集为空（少一档 = 商家建了活动学员看不见，多一档 = 白名单挂了个死入口）',
  backendTypes.length > 0
    && LANDING.every((p) => backendTypes.indexOf(p.type) > -1)
    && backendTypes.every((t) => LANDING.some((p) => p.type === t)),
  '后端 ' + JSON.stringify(backendTypes) + ' / 端上 ' + JSON.stringify(LANDING.map((p) => p.type)));
ok('9.8 实物页不再出现 order-goods-id 那枚死属性（组件只收商品定位与横幅落位开关，没有第二份「下单用商品 id」，多规格实物已支持（2026-10-28），页面不再持有第二份下单用商品 id）',
  !/order-goods-id|orderGoodsId/.test(read(PHYS)) && !/orderGoodsId/.test(area),
  '组件 props：' + (area.slice(area.indexOf('props'), area.indexOf('props') + 200).replace(/\s+/g, ' ') || ''));

/* ---------- 9.9 团详情那句「钱怎么走」只有一处（2026-10-18 先接通 auto_refund 判据，同日收进后端派生） ---------- */
// 商家关掉「超时自动退款」时钱没回来，写「已原路退回」= 假承诺；反过来，**到时限而结算任务还没跑**
// 的那一档钱将由定时任务自动退，端上按 `refund_pending>0` 一律说「由商家处理」又是一句假承诺。
// 一句话只该有一处判据：句子落在 `RefundDecision::failText`（三档：待退×自动退 / 待退×商家处理 / 已退回），
// 随团详情下发 `fail_text`，端上只渲染 —— 前端不数 pending、不拼句子（M22，硬约束 11 的文案版）。
// 判的是代码本体：注释里引用这些词（正是为了说明为什么）不算 —— 先剥 HTML 注释与 //、/* */ 再搜。
const codeOnly = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
const detBare = codeOnly(detCode);
ok('9.9 失败态说明句端上零拼装：模板只渲染后端下发的 detail.fail_text，页面不再出现句子本体与 pending 判据',
  /\{\{\s*detail\.fail_text\s*\}\}/.test(detBare)
    && !/本团未成团|已原路退回|权益已发放|refund_pending|auto_refund/.test(detBare),
  '吃 fail_text=' + /\{\{\s*detail\.fail_text\s*\}\}/.test(detBare)
    + ' 端上残留句子=' + /本团未成团|已原路退回|权益已发放/.test(detBare));

/* ---------- 9.10~9.13 2026-10-27：活动预热 / 购买弹幕 / 模拟成团人数阈值（后端取数 + 端上两态） ---------- */
ok('9.10 活动预热：商详拼团区认后端 `state=not_start`，右侧换成「距活动开始」并倒数到 start_time；'
  + '归零那一拍只重取一次（切成进行中），不是把整区收掉',
  /isPreheat\(\)\s*\{[\s\S]{0,120}state === 'not_start'/.test(area)
    && /isPreheat\(\)\s*\{[\s\S]{0,120}state === 'not_start'/.test(banner)
    && /class="gba-after">\{\{ isPreheat \? '后开始' : '后结束' \}\}/.test(banner)
    && /isPreheat \? '活动已开始' : '活动已结束'/.test(banner)
    && /const at = this\.isPreheat[\s\S]{0,160}start_time[\s\S]{0,160}end_time/.test(area)
    && /if \(that\.isPreheat\) \{[\s\S]{0,220}that\.reload\(\)/.test(area)
    && /preheatArrived/.test(area),
  '预热态判据/标签/重取三件没齐');
ok('9.11 预热态底栏按钮写「即将开团」，点开时说一句原因（活动尚未开始）—— 不把人送进必然失败的下单链',
  /if \(this\.isPreheat\) \{ return '即将开团'; \}/.test(area)
    && /if \(this\.isPreheat\) \{[\s\S]{0,220}活动尚未开始/.test(area),
  '底栏文案或 openPopup 的预热守卫没写');
ok('9.12 购买弹幕：渲染抽成 tz-group-buy-danmu（头像 + 脱敏昵称 + 购买了本商品），3 秒轮播一条、'
  + '只有一条时不转，销毁都清定时器；素材读后端 buyers，前端不造昵称',
  /class="gba-danmu"/.test(danmuCmp)
    && /\{\{ buyer\.nickname \}\}购买了本商品/.test(danmuCmp)
    && /buyer\(\)[\s\S]{0,200}this\.rows/.test(danmuCmp)
    && /ROTATE_MS = 3000/.test(danmuCmp)
    && /clearTimer\(\)/.test(danmuCmp)
    && (danmuCmp.match(/clearTimer\(\);/g) || []).length >= 3,
  '弹幕模板/轮播/清理三件没齐');
ok('9.15 购买弹幕的落点：九类商详页都压在封面/头图左上角（`gbd-anchor` + `tz-group-buy-danmu overlay`），'
  + '拼团区 `hide-danmu` 收掉原位那份；素材只认 `@ready` 上抛的活动本体（data 承载，不回落预取快照）',
  LANDING.every((p) => {
    const v = p.type === 'course' ? cdVue : read(p.vue);
    const j = p.type === 'course' ? course : read(p.js);
    return /gbd-anchor/.test(v)
      // 弹幕那一枚的显隐判据可多一枚前置（练习页 2026-10-30 起是 `gbVisible && gbBuyers.length`：
      // 已拥有的人不收），但素材/落点/开关三件必须一字不差地在
      && /<tz-group-buy-danmu v-if="(?:gbVisible && )?gbBuyers\.length" :buyers="gbBuyers" overlay \/>/.test(v)
      && /hide-danmu/.test(v)
      && /gbBuyers: \[\]/.test(j)
      && /this\.gbBuyers = \(entry && entry\.activity && entry\.activity\.buyers\) \|\| \[\]/.test(j);
  }),
  '封面落点/开关/素材来源没接线');
ok('9.13 预热/弹幕的后端取数与脱敏在 `GoodsArea`：预热态 show_teams/join_count 压 0（无团可凑、无成交），'
  + '买家只出 nickname/avatar、不含 user_id；TeamPage 只保留同名委托',
  /upcomingPreheatOf/.test(be('common/library/app/group_buy/GoodsArea.php'))
    && /'show_teams'\s*=> \$preheat \? 0 :/.test(be('common/library/app/group_buy/GoodsArea.php'))
    && /'join_count'\s*=> \$preheat \? 0 :/.test(be('common/library/app/group_buy/GoodsArea.php'))
    && /TeamPage::mask/.test(be('common/library/app/group_buy/GoodsArea.php'))
    && !/'user_id'\s*=>/.test(be('common/library/app/group_buy/GoodsArea.php'))
    && /return GoodsArea::of\(\$goodsType, \$goodsId(?:, \$userId)?\);/.test(be('common/library/app/group_buy/TeamPage.php')),
  '后端 GoodsArea 取数/脱敏或 TeamPage 委托没齐');

/* ---------- 9.14 2026-10-29：拼团价横幅右上角写「活动类型」，不恒写「多人拼团」 ---------- */
// 用户原话（实物商详 `/pages/app/physical/detail/detail?id=2`）：「拼团的价格卡都是显示这个多人拼团，
// 并不显示这个阶梯和邀新的类型」。横幅那一格原先是**模板里写死的四个字**，三种活动类型读出来一样，
// 学员从价格卡上看不出这一场是阶梯档还是仅限新人。判据三件：① 模板读 computed（不是字面量）；
// ② computed 三档齐（ladder / invite / 其余）；③ 字面量那四个字不许再以裸文本节点出现在模板里。
// 这一族 `ui-audit` 看不见（它只按版式正则查，不判「文案是否随数据变」），必须落在本脚本。
const bannerBare = banner.replace(/<!--[\s\S]*?-->/g, '');
ok('9.14 拼团价横幅右上角写的是**活动类型**（阶梯拼团 / 邀新拼团 / 普通型仍「多人拼团」），'
  + '不是模板里写死的「多人拼团」—— 两个宿主（拼团区原位 / 课程详情价格格）同读这一枚 computed',
  /\{\{\s*typeTitle\s*\}\}/.test(bannerBare)
    && /typeTitle\(\)[\s\S]{0,300}=== 'ladder'[\s\S]{0,120}=== 'invite'/.test(banner)
    && !/<text class="gba-side-title">\s*[^<{]*<\/text>/.test(bannerBare),
  '标题节点=' + ((/<text class="gba-side-title">[^<]*<\/text>/.exec(bannerBare) || [''])[0] || '没找到'));

/* ---------- ⑩ 页尾两枚常驻组件 + 下拉刷新（2026-10-19 用户点名「拼团两页底部没有 TZ Tabbar 和 TZ Footer」） ---------- */
// 判的是**挂上去的那枚标签**，注释里引用组件名不算（先剥注释再搜，precedent：9.9 与 6.8 同一手法）。
// 这一族 sfc-check / ui-audit / 后端 curl 三条门禁全看不见：少挂一整枚组件既不违反版式正则，也不影响编译。
const idxBare = idx.replace(/<!--[\s\S]*?-->/g, '');
ok('10.1 两页页尾都挂 <tz-tab-bar /> + <tz-footer />（打卡族 / 优惠券族同一档；吸底那一枚的 class 叫 school-footer，不是页脚组件）',
  /<tz-tab-bar\b/.test(idxBare) && /<tz-footer\b/.test(idxBare)
    && /<tz-tab-bar\b/.test(detBare) && /<tz-footer\b/.test(detBare),
  '列表=' + (/<tz-tab-bar\b/.test(idxBare) && /<tz-footer\b/.test(idxBare))
    + ' 详情=' + (/<tz-tab-bar\b/.test(detBare) && /<tz-footer\b/.test(detBare)));
ok('10.2 团详情也开 enablePullDownRefresh：页面停留期间「别人加入成团」与「到时限」两件事都没有事件源，下拉是唯一的强制重载出口（onShow 只管离开再回来那一趟）',
  /"group_buy\/detail\/detail"[\s\S]{0,300}"enablePullDownRefresh": true/.test(pages));
// 2026-10-29 同日第二次点名后改写：有内容那一档仍静默（不闪骨架，硬约束 16），
// 还没有内容（上一轮失败 / 刚放行）那一档重新铺骨架；闸门未放行时**重判一次再收条**（旧写法只收条不重判，
// init 曾失败一次的页面下拉也没有出路）。
ok('10.3 团详情下拉：已有内容走静默那一档（不闪骨架，硬约束 16），还没有内容时重新铺骨架；'
  + '闸门未放行（teamId 还没立起来）时重跑一次 `start()` 并立刻收条，不许把收条挂死在转圈上',
  /onPullDownRefresh\(\)[\s\S]{0,700}this\.getData\(this\.detail\.status === undefined\)/.test(det)
    && /onPullDownRefresh\(\)[\s\S]{0,400}this\.start\(\)/.test(det)
    && /onPullDownRefresh\(\)[\s\S]{0,500}uni\.stopPullDownRefresh\(\)/.test(det));
ok('10.4 收条挂在取数链末端（成功 / 失败两支都过这一末端，硬约束 22「退出分支一次写全」；写在成功那一支里就是失败之后再下拉永远转圈）',
  /\.catch\([\s\S]{0,420}\.then\(\(\) => \{[\s\S]{0,200}uni\.stopPullDownRefresh\(\)/.test(det));
ok('10.5 我的拼团列表四件齐：发 page + limit、读后端 total 收口、onReachBottom 翻页、尾部 u-loadmore 那一行（只发 limit = 静默截断，硬约束 32）',
  /page:\s*(?:that\.page|page),\s*limit:\s*that\.limit/.test(idx) && /Number\(data\.total\)/.test(idx)
    && /onReachBottom\(\)/.test(idx) && /<u-loadmore :status="loadStatus"/.test(idx));

/* ---------- ⑪ 我的拼团列表卡片（2026-10-25 用户点名「太单调、太丑」后按团卡片层级重排） ---------- */
// 这一族同样三条静态门禁各看不见一半：状态词/成员头像/原价划线是跨接口字段，
// 倒计时是拼出来的 CSS/JS 值，骨架三行是版式；所以逐项钉在代码本体上。
ok('11.1 列表行状态标吃后端 team_label、色档由 team_status 映射，不再内联写死颜色',
  /\{\{\s*teamLabel\(row\)\s*\}\}/.test(idx)
    && /:class="\[?tagClass\(row\.team_status\)\]?"/.test(idx)
    && !/statusColor\(row\.team_status\)/.test(idx));
ok('11.2 列表行有成员头像与已拼人数：头像读后端 member_avatars，人数读 joined_num（含已退款）/target_num',
  /memberAvatars\(row\)/.test(idx) && /member_avatars/.test(idx)
    && /已拼\s*\{\{\s*joinedCount\(row\)/.test(idx) && /joined_num/.test(idx) && /target_num/.test(idx));
ok('11.3 拼团中倒计时秒级对齐（expire_time ×1000）、页面隐藏/卸载清表、回调过已销毁闸门',
  /const end = Number\(\(row \|\| \{\}\)\.expire_time\) \|\| 0;/.test(idx)
    && /end \* 1000 - this\.now/.test(idx)
    && /onHide\(\)[\s\S]{0,80}clearTimer\(\)/.test(idx)
    && /onUnload\(\)[\s\S]{0,80}clearTimer\(\)/.test(idx)
    && /if \(that\.gone\(\)\) \{ return; \}/.test(idx));
ok('11.4 商品卡带原价划线：后端 origin_price 只在高于实付时传给 price_marking',
  /origin_price/.test(idx) && /price_marking:\s*Number\(row\.origin_price\) > Number\(row\.price\)/.test(idx));
ok('11.5 骨架三行与真实行同形：状态标 / 成员头像 / 订单状态 / 按钮各有占位块',
  /gbl-sk-tag/.test(idx) && /gbl-avatar--sk/.test(idx) && /gbl-sk-order/.test(idx) && /gbl-sk-btn/.test(idx));

/* ---------- ⑫ 列表先后与订单状态标（2026-10-26 用户点名） ---------- */
// 用户原话：「这个列表样式调整之后还是蛮不错的，但是前后顺序有点关系……把这个课程卡片放在这个拼团进度下面。
// 然后把我的订单去掉，直接就显示这个状态，用一个Tag标签展示。」
// 这一族正则只能钉「谁在谁前面」「有没有那半句」；卡片本身的视觉仍靠人工比对。
const realRow = idx.slice(idx.indexOf('v-for="row in rows"'), idx.indexOf('class="gbl-empty"'));
ok('12.1 列表行先后：拼团进度（.gbl-info）在商品卡（.gbl-goods）之前，订单状态标 + 按钮（.gbl-foot）在后',
  realRow.indexOf('class="gbl-info"') > -1
    && realRow.indexOf('class="gbl-goods"') > realRow.indexOf('class="gbl-info"')
    && realRow.indexOf('class="gbl-foot"') > realRow.indexOf('class="gbl-goods"'));
ok('12.2 「我的订单：」那半句已删；订单状态本身改用 Tag 展示（词条吃 status_label、色档吃 status），与团状态同字时不再出第二枚',
  !/我的订单/.test(idx.slice(0, idx.indexOf('<script>')).replace(/<!--[\s\S]*?-->/g, ''))
    && /class="gbl-order-tag"/.test(idx) && /v-if="showOrderTag\(row\)"/.test(idx)
    && /orderTagClass\(row\.status\)/.test(idx)
    && /showOrderTag\(row\) \{[\s\S]{0,220}label !== String\(\(row \|\| \{\}\)\.team_label/.test(idx)
    && !/class="gbl-order"/.test(idx));
ok('12.3 骨架与真实行同序：进度 → 商品卡 → 状态标 + 按钮（改真实行时漏改骨架 = 加载完整体换版，M16）',
  (() => {
    const sk = idx.slice(idx.indexOf('gbl-item gbl-item--sk'), idx.indexOf('v-for="row in rows"')).replace(/\s+/g, ' ');
    return sk.indexOf('class="gbl-info"') > -1
      && sk.indexOf('class="gbl-goods"') > sk.indexOf('class="gbl-info"')
      && sk.indexOf('class="gbl-foot"') > sk.indexOf('class="gbl-goods"');
  })());

/* ---------- ⑬ 团详情结果态与进度（2026-10-26 用户点名） ---------- */
// 原话：「成功或失败不要只显示文字……要空状态类型的样式，有图标和文字说明。当然也要有大的字体显示状态信息。
// 另外也可以参考拼团列表页面显示拼团的人数和进度呀，不然的话，他怎么知道拼了多少，差几个人失败呢？」
// ① 三档结果态（已成团/已失败/已停止）走图标 + 大字状态 + 后端 fail_text；
// ② 进度与列表同一份字段（member_avatars / joined_num / target_num），补进度条与「差 N 人成团」。
ok('13.1 结果态不是一行文字：图标 + 大字状态 + 后端 fail_text（22px 标题，形态照同族结果页）',
  /class="gbd-result-icon"/.test(det) && /:src="resultIcon"/.test(det)
    && /class="gbd-result-title"/.test(det) && /\{\{\s*detail\.fail_text\s*\}\}/.test(det)
    && /if \(s === 1\) \{ return '\/static\/order\/status\/success\.png'; \}/.test(det)
    && /\.gbd-result-title\s*\{[\s\S]{0,180}font-size:\s*22px/.test(det),
  '图标=' + /class="gbd-result-icon"/.test(det) + ' 状态字=' + /class="gbd-result-title"/.test(det));
// 2026-10-29 改写：2026-10-27 重排把「头像 + 已拼 N/M + 进度条」换成了「头像网格 + 还差 N 人整句」，
// 旧判据钉的是进度条那一版（`progressPercent` / `teamAvatars` 都已删，一直红）。现在钉当前这一档：
// 成员头像来自成员行、拼团中与失败两档的缺口句分开、人数走 joined_num（含已退款），端上不另数一份成员表。
ok('13.2 详情进度：成员头像网格 + 两档缺口句（拼团中「还差 N 人，即可拼团成功」/ 失败「差 N 人成团」）；'
  + '人数读后端 joined_num（老后端回落 used_num），结果态缺口由 target_num − joined_num 现算，端上不另查成员表',
  /memberList\(\)\s*\{[\s\S]{0,400}Number\(m\.status\)/.test(detCode)
    && /joined_num/.test(detCode) && /used_num/.test(detCode)
    && /detail\.status === 0 && needNum > 0/.test(detCode)
    && /detail\.status === 2 && gapNum > 0/.test(detCode)
    && /差<\/text>/.test(detCode) && /人成团<\/text>/.test(detCode)
    && !/u-line-progress|progressPercent/.test(detCode),
  '两档缺口句=' + (/detail\.status === 0 && needNum > 0/.test(detCode) && /detail\.status === 2 && gapNum > 0/.test(detCode))
    + ' 进度条残留=' + /u-line-progress|progressPercent/.test(detCode));
ok('13.3 进度口径只存一处：列表批量取、详情复用同一次成员查询，两处都读 TeamProgress（各写一份 = 两屏人数分叉）',
  /TeamProgress::members\(/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/MyTeamPage.php'))
    && /TeamProgress::avatars\(/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/MyTeamPage.php'))
    && /TeamProgress::joinedOnly\(/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/TeamPage.php'))
    && /TeamProgress::avatars\(/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/TeamPage.php')));
ok('13.4 模拟成团补的那几个人要补进头像区（2026-10-28 用户点名团 4933「只显示一个人的头像，没有填充模拟用户」）：'
  + '成团态按团上 `virtual_count` 补 N 枚默认头像，与真人那一排同尺寸；后端**不造假的成员行**'
  + '（`TeamForce::simulate` / `SuccessService::settle` 只写 virtual_count，成员表仍只有真人）',
  /virtualSlots\(\)\s*\{[\s\S]{0,200}Number\(this\.detail\.status\) !== 1[\s\S]{0,240}Number\(this\.detail\.virtual_count\)/.test(codeOf(det))
    && /v-for="n in virtualSlots"[^>]*:key="'virtual' \+ n"/.test(det.replace(/\n/g, ' '))
    && /src="\/static\/image\/default-avatar\.png"/.test(det)
    && /'virtual_count'\s*=>\s*\$virtual/.test(be('common/library/app/group_buy/TeamForce.php'))
    && /'virtual_count'=>\s*intval\(\$team\['virtual_count'\]\)/.test(be('common/library/app/group_buy/TeamPage.php')),
  '虚拟位模板=' + /v-for="n in virtualSlots"/.test(det)
    + ' 判据读 virtual_count=' + /Number\(this\.detail\.virtual_count\)/.test(det));

/* ---------- ⑮ 拼团商品区通用结构（2026-10-28：用户给线下活动/付费会员卡/实物三张参照图；
   2026-10-29 用户改口径：规格选择只留「立即开团」那只弹窗里的一份） ---------- */
// 三张图共同点：一档规格一个价、底栏「立即开团」下面跟拼团价。
// 2026-10-29 用户点名 `#/pages/app/vip/center/center`：「如果拼团选择规格弹窗里面包含了规格选项，
// 那么就不要再显示 gba-pick 了，其他的多规格商品也是这个逻辑」⇒ 页面上的规格卡片整块下线，
// 规格只在 `group-buy-config-popup` 的 chips 里选一次；页面上只剩「阶梯型 + 不吃规格」那一档的档位块。
const POPUP = 'src/components/tz/group-buy-popup.vue';
const GBBTN = 'src/components/tz/group-buy-btn.vue';
const popupSrc = read(POPUP), gbbtnSrc = read(GBBTN);
ok('15.1 商详区那块 `gba-pick` 只剩两档：① 阶梯型 + 不吃规格（课程/练习/打卡，弹窗里没有规格可选）；'
  + '② 阶梯型 + `specInline`（会员卡：规格卡就在页面上，人数档也摆同一片页面）。'
  + '其余 `has_spec=1` 的宿主有规格弹窗 ⇒ 人数档挂在弹窗里（`gb-ladder-picker`），页面上整块不出',
  /class="gba-pick" v-if="showPicker"/.test(area)
    && /showPicker\(\)\s*\{[\s\S]{0,220}return this\.isLadder && \(!this\.hasSpec \|\| this\.specInline\);/.test(area));
ok('15.2 规格选择只存「立即开团」弹窗一处：页面里不许再摆 `gba-spec-card` 那排规格卡（同一件事两处可选 '
  + '＝改一处必漏另一处），规格 chips 与它的显隐判据仍在 `group-buy-config-popup` 里',
  !/gba-spec-card/.test(area) && !/gba-spec-scroll/.test(area) && !/pickSpec\(/.test(area)
    && /class="gbc-chip" v-for="row in specs"/.test(read('src/components/tz/group-buy-config-popup.vue'))
    && /v-else-if="!hideSpec && hasSpec"/.test(read('src/components/tz/group-buy-config-popup.vue'))
    && /\{\{ row\.spec_text \|\| '默认' \}\}/.test(read('src/components/tz/group-buy-config-popup.vue')));
ok('15.3 阶梯型摆档位块（图 3）：N人团 + ¥x/人，多规格时按选中规格过滤，选中态红描边',
  /class="gba-tier"/.test(area) && /v-for="row in tiers"/.test(area)
    && /\{\{ row\.invite_num \}\}人团/.test(area) && /¥\{\{ money\(row\.price\) \}\}\/人/.test(area)
    && /gba-tier--on/.test(area)
    && /rows\.filter\(\(r\) => Number\(r\.spec_id\) === specId\)/.test(area));
ok('15.4 选中项驱动底栏「立即开团」第二行的价格：阶梯取选中档、多规格取选中档、其余取活动价；到期/无活动给空串（不留一个假价）',
  /entryPrice\(\)\s*\{[\s\S]{0,420}this\.pickedTier[\s\S]{0,260}this\.pickedSpec[\s\S]{0,200}this\.activity\.price/.test(area)
    && /!this\.activity \|\| this\.expired/.test(area));
ok('15.5 拼团区把这份价格随 `@ready` 上抛（`price_text`），宿主只转发、不自己算价',
  /price_text: this\.entryPrice/.test(area) && /live[\s\S]{0,180}: null/.test(area));
ok('15.6 九类商详页的拼团入口全部走同一枚 `tz-group-buy-btn`（两行：动作 + 价格），页面里不再自带 `gb-btn` 色块',
  LANDING.every((p) => {
    const src = read(p.vue);
    return /<tz-group-buy-btn\b/.test(src)
      // 两种写法都认：`v-if="gbEntry"` 之后直接取字段（2026-10-29 简写）与旧的三元写法
      && /:text="gbEntry(?:\.text|\s*\?\s*gbEntry\.text\s*:\s*'')"/.test(src)
      && /:price="gbEntry(?:\.price_text|\s*\?\s*gbEntry\.price_text\s*:\s*'')"/.test(src)
      && /@open="openGb"/.test(src)
      && !/gb-btn/.test(src);
  }),
  LANDING.filter((p) => !/<\/?tz-group-buy-btn/.test(read(p.vue)) || /gb-btn/.test(read(p.vue)))
    .map((p) => p.type).join('/') || '九类全接');
ok('15.7 按钮第二行与红橙渐变只存 `group-buy-btn` 一处（页面里不许再写 #f53f3f / 渐变串）',
  /class="gbb-price"/.test(gbbtnSrc) && /price: \{ type: String, default: '' \}/.test(gbbtnSrc)
    && LANDING.every((p) => !/#f53f3f|linear-gradient\(90deg, #ff4b2b/.test(read(p.vue))));
ok('15.8 页面上选的规格/档位与凑团弹层是同一份状态（props 下发 + `pick` 上抛；弹层不自己另存一个默认值）',
  /:spec-id="pickedSpecId" :ladder-id="pickedLadderId"/.test(area)
    && /@pick="onPopupPick"/.test(area)
    && /specId: \{ type: \[Number, String\], default: 0 \}/.test(popupSrc)
    && /Number\(r\.spec_id\) === Number\(this\.specId\)/.test(popupSrc)
    && /\$emit\('pick', \{ specId: this\.chosenSpecId, ladderId: this\.chosenLadderId \}\)/.test(popupSrc));
// 15.9 / 15.10（2026-10-29 三轮）：在线凑团段的显隐最终是**三枚轴、两枚 computed**。
// ① 开关这一轴（`#/pages/app/vip/center/center`「付费会员卡的拼团不会显示他们正在拼团，每个类型的
//    拼团商品都要显示」）：判据里不许 ∧ 只有该入口自己会产生的数据（那一轮做的是「段照出 + 空态」）。
// ② `myTeam` 这一轴（`pages/app/circle/presale/presale?id=3168`「如果我现在已经参与了这个商品的拼团，
//    那么就不要再显示这个东西了…其他的商品也是这个逻辑」）：我已在团里 ⇒ 整段不出。
// ③ **没有可参与的团（含「还没有人开团」）也不摆**（同日同路由「如果当前没有可参与的拼团，有时候
//    还没有人开团，也不要显示这个东西」）：① 那一版的空态与失败句随整段撤掉。这不是 27② 的
//    入口自锁——开团入口在底栏那枚 `tz-group-buy-btn`（宿主 `openGb()` → `openPopup()`），
//    这一段只是「别人正在拼团」的列表。
// 拆成两枚 computed 的原因：`teamsEnabled`（show_teams ∧ !myTeam）管「要不要取数」，
// `showTeams` 再加 `teams.length > 0` 管「要不要占位」——取数闸门若读后者就是
// 「取数前 teams 恒空 ⇒ 永远取不到」的自锁。
ok('15.9 在线凑团段的显隐 = 商家开关 `show_teams` ∧ 我不在这一场有进行中的团（`!myTeam`）'
  + '∧ 真有可参与的团（`teams.length > 0`）∧ 这一场还能报名（`!closed`，2026-10-31 报名已截止那一档）：'
  + '四枚轴压在两枚 computed（取数 `teamsEnabled` / 占位 `showTeams`），不许把「取数」与「取回几行」写成互为前提',
  /<view class="gba-teams" v-if="showTeams">/.test(area)
    && /teamsEnabled\(\)\s*\{[\s\S]{0,400}?if \(this\.joinMode\) \{ return false; \}[\s\S]{0,160}?Number\(this\.activity\.show_teams\) === 1 && !this\.myTeam/.test(area)
    && /showTeams\(\)\s*\{[\s\S]{0,220}?return (?:!this\.closed && )?this\.teamsEnabled && this\.teams\.length > 0;/.test(area)
    && !/class="gba-teams"\s+v-if="[^"]*activity\.show_teams/.test(area)
    && countOf(area, 'if (this.teamsEnabled) {') === 2);
ok('15.10 「没有可参与的团」整段不出：空态那句与失败那句已删净（页面上不许出现「还没有人开团」'
  + '这类说给用户听的空话），开团入口仍只由底栏那枚承担（`openPopup()` 方法在、九页宿主都调它）',
  !/class="gba-teams-empty"/.test(codeOf(area))
    && !/还没有人开团，你来开第一团/.test(codeOf(area))
    && !/拼团列表加载失败/.test(codeOf(area))
    && !/teamsFailed/.test(codeOf(area))
    && /openPopup\(\)\s*\{/.test(area)
    && LANDING.every((p) => /\.openPopup\(\)/.test(codeOf(read(p.js)) || '')));

/* ---------- ⑯ 拼团规格 / 档位选择弹窗（2026-10-28 两张参照图：实物多规格、线下活动票种） ---------- */
// 两张图同一个结构：封面 + 拼团标 + 价格（划线原价）+ 剩余件数 + 已选 / 拼团类型 chips /
// 规格 chips（标题词吃后端）/ 购买数量 / 确定。这只弹窗是「立即开团」的入口，凑团列表另有入口。
const CONFIG = 'src/components/tz/group-buy-config-popup.vue';
const configSrc = read(CONFIG);
/* 四只规格弹层共用的外壳（2026-10-30 用户点名「样式要统一，最好能够做到复用」）：
 * 头区 / 拼团专享标 / 拼团标 / 划线原价 / N人团 / 底部按钮只在壳里一份，下面的 16.2 与 ㉕ 组都核它。 */
const SHELL = 'src/components/tz/spec-popup-shell.vue';
const shellSrc = read(SHELL);
const backendForm = read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/ActivityForm.php');
const backendArea = read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/GoodsArea.php');
const bridgeSrc = read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/OrderBridge.php');
const teamSrc = read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/TeamService.php');
const quantitySrc = read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/Quantity.php');
const orderSrc = read('../tuzhi-selfbuilt-backend/application/common/library/order/OrderCreate.php');
ok('16.1 底栏「立即开团」先开规格弹窗（`ref="config"`），弹窗确定后由拼团区带去提交订单页（弹窗自己不导航）；'
  + '2026-10-30 join 态把团 id 一起带上（`gbCtx({ team_id })`），正常开团档不传、逐字不变',
  /<tz-group-buy-config-popup ref="config"/.test(area)
    && /onConfigConfirm\(payload\) \{[\s\S]{0,1400}?this\.goBuy\(this\.gbCtx\(this\.joinMode \? \{ team_id: this\.joinTeam \} : null\)\);/.test(area)
    && !/\$nav\.to/.test(configSrc));
ok('16.2 弹窗头区四件：封面 + 「拼团」标 + 拼团价/划线原价 + 剩余件数/已选（库存 -1 不摆「剩余」；'
  + '限购用尽那一档改说原因，别让用户读到「剩余 5 件」却点不动）。2026-10-30 起头区改由共用外壳画，'
  + '本弹窗只把 `cover` / `gb-price` / `origin-price` 与 `sub` 插槽（剩余件数 + 已选）递进去',
  /:cover="activity\.goods_cover"/.test(configSrc) && /:gb-price="priceText"/.test(configSrc)
    && /:origin-price="showOrigin \? originText : ''"/.test(configSrc)
    && /<view slot="sub">/.test(configSrc) && /class="gbc-picked"/.test(configSrc)
    && /class="gb-badge" v-if="gbMode"/.test(shellSrc) && /class="gb-tag" v-if="tagText"/.test(shellSrc)
    && /return this\.stock > 0 \? '剩余 ' \+ this\.stock \+ ' 件' : '';/.test(configSrc)
    && /if \(this\.countMax === 0\) \{ return this\.countNote \|\| '已达限购数量'; \}/.test(configSrc));
ok('16.3 「拼团类型」chips 写「¥x/N人团」，多规格时该档价不同才带「起」（单规格不写起）：'
  + '2026-10-30 起档位 chips 复用 `tz-gb-ladder-picker`（与四只规格弹窗里那节同一只组件），'
  + '「起」的判据收进 `common/utils/group-buy-spec.js` 的 `gbTierPriceText()` 一处',
  /<tz-gb-ladder-picker v-if="isLadder && !hideLadder" title="拼团类型" range/.test(configSrc)
    && /¥\{\{ priceTextOf\(row\) \}\}\/\{\{ row\.invite_num \}\}人团/.test(read('src/components/tz/gb-ladder-picker.vue'))
    && /export function gbTierPriceText/.test(read('src/common/utils/group-buy-spec.js'))
    && /min === max \? '' : '起'/.test(read('src/common/utils/group-buy-spec.js')));
ok('16.4 规格 chips 的标题词吃后端 `spec_label`（票种/时长/套餐规格/规格只存 `ActivityForm::SPEC_LABELS` 一处），'
  + '整节的显隐由 `hasSpec` 一处判（多档 ∨ 单档有名字）',
  /v-else-if="!hideSpec && hasSpec"/.test(configSrc)
    && /\{\{ specLabel \}\}/.test(configSrc)
    && /activity\.spec_label/.test(configSrc)
    && /const SPEC_LABELS = \[/.test(backendForm)
    && /'spec_label'\s*=>\s*ActivityForm::specLabelOf/.test(backendArea));
ok('16.9 单档但**带名字**的规格也摆出来（圈子的有效期「1个月」/ 会员卡「200天」/ 组合商品「标准版」）：'
  + '`hasSpec` = 多档 ∨（单档且文案非空）；课程/练习/打卡那种合成行（`spec_id=0` + 空文案）仍不摆（硬约束 9）',
  /hasSpec\(\) \{[\s\S]{0,200}if \(rows\.length > 1\) \{ return true; \}/.test(configSrc)
    && /return rows\.length === 1 && specTextOf\(rows\[0\]\) !== '';/.test(configSrc));
ok('16.5 购买数量的**显隐与上限全吃后端** `count_max`（`0` 不可买 / `1` 只能一份 ⇒ 不摆步进器 / `>=2` 才是上限）：'
  + '前端不许再拿 `stock` 自己算上限（那样看得见库存、看不见限购），售罄或限购用尽时「确定」禁用'
  + '（可买判据 2026-10-29 起收进 `utils/spec-stock.js` 一处：`canBuy` 只读 `specBuyable(chosenSpec)`）',
  /v-if="countEnabled && !hideCount"/.test(configSrc)
    && /countEnabled\(\) \{ return this\.countMax >= 2; \}/.test(configSrc)
    && /countMax\(\)[\s\S]{0,520}Math\.min\(99, n\)/.test(configSrc)
    && /canBuy\(\) \{[\s\S]{0,160}?return this\.chosenSpec \? specBuyable\(this\.chosenSpec\) : true;\s*\}/.test(configSrc)
    && /import \{ specBlockText, specBuyable, pickSpecRow, specParts, specGroupsOf \} from '@\/common\/utils\/spec-stock\.js'/.test(configSrc)
    && /:confirm-disabled="!canBuy"/.test(configSrc)
    && !/Math\.min\(99, this\.stock\)/.test(configSrc));
ok('16.12 售罄 / 限购用尽的那一档**就地置灰并标出来**，点了不选中，打开弹窗时默认选中要跳过它'
  + '（2026-10-29 用户点名「为什么提交订单才提示库存不足，库存不足是在规格选择中直接禁用啊」）：'
  + '判据只存 `common/utils/spec-stock.js` 一处，拼团弹窗 / 拼团区 / 组合商品商详规格弹窗三处同读；'
  + '数据是后端 `stock`（组合商品由 `Composite::specStockMap()` 现算）与 `count_max`，前端不自己算库存',
  /'gbc-chip--off': !!specBlockText\(row\)/.test(configSrc)
    && /<text class="gbc-chip-off" v-if="specBlockText\(row\)">\{\{ specBlockText\(row\) \}\}<\/text>/.test(configSrc)
    && /pickSpec\(row\) \{[\s\S]{0,200}if \(!specBuyable\(row\)\) \{ return; \}/.test(configSrc)
    && /chosenSpec\(\) \{[\s\S]{0,160}pickSpecRow\(this\.specs, this\.chosenSpecId\)/.test(configSrc)
    && /open\(payload\) \{[\s\S]{0,1000}pickSpecRow\(rows, wantSpec\)/.test(configSrc)
    && /export function specBlockText/.test(read('src/common/utils/spec-stock.js'))
    && /export function specBuyable/.test(read('src/common/utils/spec-stock.js'))
    && /export function pickSpecRow/.test(read('src/common/utils/spec-stock.js'))
    && /from '@\/common\/utils\/spec-stock\.js'/.test(area)
    && /pickSpecRow\(rows, this\.pickedSpecId\)/.test(area)
    && /from '@\/common\/utils\/spec-stock\.js'/.test(read('src/pages/app/composite/components/spec-select-modal.vue')));
ok('16.6 确定后交三枚参数（规格/档位/份数）；份数按后端上限收口、>1 才进 URL，1 份不带（老链路逐字不变）',
  /specId: this\.chosenSpec \? Number\(this\.chosenSpec\.spec_id\) : 0/.test(configSrc)
    && /ladderId: this\.isLadder\s*\n?\s*\? \(Number\(this\.fixedLadderId\) \|\| this\.chosenLadderId\)/.test(configSrc)
    && /count: Math\.max\(1, Math\.min\(this\.countMax \|\| 1, Number\(this\.count\) \|\| 1\)\)/.test(configSrc)
    && /if \(ctx\.count && Number\(ctx\.count\) > 1\)/.test(area));
ok('16.7 份数全链打通：控制器读 count → TeamService 先过份数闸门（建团之前）→ OrderBridge 落到 goods_list → OrderCreate 乘回单价',
  /intval\(\$this->request->param\('count', 1\)\)/.test(read('../tuzhi-selfbuilt-backend/application/api/controller/app/group_buy/Team.php'))
    && /Quantity::assert\(\$activity, \$spec, \$count, \$userId\)/.test(teamSrc)
    // 对齐用的多个空格也要容得下：2026-10-29 同仓另一支把这几行 `=>` 对齐了，写死单空格的门禁当场虚红
    // 2026-10-29 用券：订单上下文从 `TeamService` 拆到 `OrderContext::of()`（四条链共用一份形状）
    && /'count'\s+=>\s+max\(1, intval\(\$count\)\)/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/OrderContext.php'))
    && /max\(1, min\(99, intval\(isset\(\$ctx\['count'\]\)/.test(bridgeSrc)
    && /bcmul\(strval\(\$gbPrice\), strval\(\$buyinfo\['count'\]\), 2\)/.test(orderSrc));
ok('16.10 「能不能买多份」只存后端一处（`Quantity::MULTI_TYPES` = 实物 + 线下活动）：组合商品 / 圈子 / 会员卡 / '
  + '教务套餐 / 课程不摆数量、带 count>1 进来直接拒；能买多份那两类的上限 = min(99, 库存, 限购剩余)，'
  + '限购说明随 `count_note` 下发（端上不再自己拼一句）',
  /const MULTI_TYPES = \['physical', 'activity'\];/.test(quantitySrc)
    && /不支持一次购买多份/.test(quantitySrc)
    && /'count_max'\] = intval\(\$hit\['max'\]\)/.test(backendArea)
    && /'count_note'\] = strval\(\$hit\['note'\]\)/.test(backendArea)
    && /single_limit/.test(quantitySrc) && /lifetime_limit/.test(quantitySrc)
    && /limit_buy/.test(quantitySrc)
    && /Item::boughtCount/.test(quantitySrc));
ok('16.11 规格弹窗有 450px 最低高度（尺寸史：2026-10-29 用户第一轮「拼团规格选择弹窗应该有一个最低高度，'
  + '比如 250px，不然太低了，不协调」⇒ 250；同日第二轮「最低高度太小了，再高 100px」⇒ 250 + 100 = 350；'
  + '同日第三轮「现在这个拼团规格选择弹窗，它最低高度还是太小了，再高一些」⇒ 350 + 100 = 450，'
  + '增量不是总量）：面板 flex 纵排 + `min-height`，剩余高度由收口占位块吸收把「确定」压到底、'
  + '内容撑满时仍保底 20px；**不写死 `height`**（硬约束 18：块高由内容算，下限只是下限）',
  /min-height="450px"/.test(configSrc) && /\bfill\b/.test(configSrc)
    && /<view class="sps-gap" v-if="fill"><\/view>/.test(shellSrc)
    && /\.sps-gap \{[^}]*flex: 1 0 20px;/.test(shellSrc)
    && /\.sps--flex \{[^}]*display: flex;[^}]*flex-direction: column;/.test(shellSrc)
    && !/[;\s]height:\s*450px/.test(configSrc));

ok('16.13 「购买数量」的标题与步进器**同一行**（标题在左、步进器贴右）：2026-10-29 用户点名'
  + '「拼团规格选择弹窗中的购买数量，应该放在 label 右侧，而不是下面」——行容器走 `space-between`、'
  + '标题用 `--row` 档收掉 `.gbc-title` 自带的 `margin-bottom`（不收就会被顶下去，看着还是两行），'
  + '与同屏参照页实物商详 `sku-select-modal` 的 `.sku-section-row` 同一档',
  /<view class="gbc-count-row">/.test(configSrc)
    && /<text class="gbc-title gbc-title--row">购买数量<\/text>/.test(configSrc)
    && /\.gbc-count-row \{[^}]*display: flex;[^}]*align-items: center;[^}]*justify-content: space-between;/.test(configSrc)
    && /\.gbc-title--row \{[^}]*margin-bottom: 0;[^}]*flex-shrink: 0;/.test(configSrc)
    && /\.sku-section-row \{[^}]*justify-content: space-between;/.test(read('src/pages/app/physical/components/sku-select-modal.vue')));

/* 分维判据当纯函数**实跑**（照 ⑭ 组 SHARE 那一手法）：静态正则只看得见「读了 `specGroupsOf`」，
   看不见「拆出来的两维对不对」——把组合清单喂进去逐档断结果，才钉得住
   「规格1 = 颜色那一节、规格2 = 尺码那一节」。 */
const SPEC_MOD = 'src/common/utils/spec-stock.js';
const specBody = read(SPEC_MOD)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/export\s+function/g, 'function');
const SPEC = new Function(specBody + '\nreturn { specParts: specParts, specGroupsOf: specGroupsOf };')();
const gbTwoDim = SPEC.specGroupsOf([
  { spec_text: '红色,大' }, { spec_text: '红色,小' }, { spec_text: '蓝色,大' },
]);
const gbOneDim = SPEC.specGroupsOf([{ spec_text: '标准版' }, { spec_text: '进阶版' }]);
const gbBadDim = SPEC.specGroupsOf([{ spec_text: '红色,大' }, { spec_text: '红色,大,加厚' }]);
const gbDimText = gbTwoDim.map((g) => g.name + ':' + g.children.map((c) => c.name).join('/')).join(' ');
ok('16.14 实物多属性（SKU 的「颜色 × 尺寸」那一形）**按维分节**：规格1 一节、规格2 一节，'
  + '不把组合文案平铺成一排（2026-10-29 用户点名 `#/pages/app/physical/detail/detail?id=2`'
  + '「如果是实物商品拼团的话，那么拼团的规格选弹窗应该跟这个实物商品中的各个选项一样。'
  + '比方说，规格一子选项、规格二子选项，这样分开，而不是放在一起」）：分维判据只存 '
  + '`common/utils/spec-stock.js` 一处（`specParts` / `specGroupsOf`），实物商详 `buildSkuTree()` '
  + '与拼团弹窗同读；点某一维的值 = 把当前组合换掉这一维再映射回那一档规格，'
  + '组合不存在 / 售罄 / 限购用尽 ⇒ 置灰且点了不选中；一维（票种 / 时长 / 套餐规格 / 圈子有效期）不拆',
  /v-if="!hideSpec && isGrouped"/.test(configSrc)
    && /specGroups\(\) \{[\s\S]{0,260}specGroupsOf\(this\.specs, specTextOf\)/.test(configSrc)
    && /viewGroups\(\) \{[\s\S]{0,760}rowOfNames\(this\.namesWith\(gi, child\.name\)\)/.test(configSrc)
    && /pickOption\(gi, name\) \{[\s\S]{0,200}this\.rowOfNames\(this\.namesWith\(gi, name\)\)/.test(configSrc)
    && /specGroupsOf\(skuPrices, \(row\) => row && row\.goods_sku_text\)/.test(read(PHYSJS))
    && /export function specGroupsOf/.test(read(SPEC_MOD))
    && /export function specParts/.test(read(SPEC_MOD))
    && gbTwoDim.length === 2
    && gbTwoDim[0].name === '规格1' && gbTwoDim[1].name === '规格2'
    && gbTwoDim[0].children.map((c) => c.name).join('/') === '红色/蓝色'
    && gbTwoDim[1].children.map((c) => c.name).join('/') === '大/小'
    && gbOneDim.length === 0 && gbBadDim.length === 0,
  '两维=' + gbTwoDim.length + ' [' + gbDimText + '] 一维=' + gbOneDim.length + ' 维数不齐=' + gbBadDim.length);

ok('16.8 不吃规格的商品（课程/练习/打卡）不开「规格/档位/份数」弹窗，直接去提交订单页',
  // 后端：商品区下发 `has_spec`（判据只存 `GoodsSpecs::hasSpec()` 一处）
  /'has_spec'\s*=>\s*GoodsSpecs::hasSpec/.test(backendArea)
  // 前端：`needsConfig = 阶梯 ∨ 多档 ∨ 吃规格`，不吃规格又不阶梯就在 openPopup 里直接 goBuy
    && /hasSpec\(\)\s*\{\s*return Number\(this\.activity && this\.activity\.has_spec\) === 1;/.test(area)
    && /needsConfig\(\)\s*\{\s*return this\.isLadder \|\| this\.specRows\.length > 1 \|\| this\.hasSpec;/.test(area)
    && /if \(!this\.needsConfig\)[\s\S]{0,200}this\.goBuy\(\{ activity_id: this\.activity \? this\.activity\.activity_id : 0 \}\)[\s\S]{0,80}return;/.test(area));

/* ---------- ⑭ 分享卡片文案（2026-10-28：H5 标题 + 描述 / 小程序无描述行走短版） ---------- */
// 设计稿是一张微信「发送给朋友」链接卡片：标题「还差 xx 人成团！拼团课程“XXX”」+ 描述
// 「好课别错过，原价 x 元，x 元拼到手~」。两端的差别只有描述行：小程序转发/朋友圈卡片微信只给
// 标题 + 图，**没有描述行** ⇒ 价格句折进标题，取短版「还差 N 人成团！x 元拼“课程名”」（用户选定）。
// 这一族是「模板里看不出来」的文案：标题由模块按团状态拼，静态正则只看得见调用点、看不见结果，
// 所以把模块当纯函数**实跑**（无 import，剥注释与 export 后交给 new Function），逐档断结果。
const SHARE_MOD = 'src/common/utils/group-buy-share.js';
const shareSrc = read(SHARE_MOD);
const shareBody = shareSrc
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '')
  .replace(/export default[\s\S]*$/m, '')
  .replace(/export\s*\{[\s\S]*?\};/g, '');
const SHARE = new Function(shareBody + '\nreturn { title, desc, mpTitle, cover, needNum };')();

const openTeam = {
  status: 0,
  target_num: 4,
  used_num: 2,
  price: 99,
  activity: { goods_type: 'course', goods_name: '零基础写作', origin_price: 199, goods_cover: 'https://x/a.png' },
};
const openT = SHARE.title(openTeam);
const openD = SHARE.desc(openTeam);
const openM = SHARE.mpTitle(openTeam);
ok('14.1 H5「发送给朋友」卡片照设计稿：标题 `还差 2 人成团！拼团课程“零基础写作”`、描述 `好课别错过，原价 199 元，99 元拼到手~`（标题与描述各一句、价格只落在描述里）',
  openT === '还差2人成团！拼团课程“零基础写作”'
    && openD === '好课别错过，原价199元，99元拼到手~',
  'title=' + openT + ' / desc=' + openD);
ok('14.2 小程序卡片（无描述行）走短版标题：`还差 2 人成团！99 元拼“零基础写作”` —— 不把描述整句接在标题后（两行标题放不下，末尾价格先被截掉）',
  openM === '还差2人成团！99元拼“零基础写作”' && !/好课|，原价/.test(openM),
  'mpTitle=' + openM);
ok('14.3 状态矩阵：已成团说「拼团成功！」、失败/停止/满员不出现「还差 0 人成团」，小程序短版同吃状态句；失败态只留商品名（不承诺拼团价）',
  SHARE.title(Object.assign({}, openTeam, { status: 1 })) === '拼团成功！拼团课程“零基础写作”'
    && SHARE.mpTitle(Object.assign({}, openTeam, { status: 1 })) === '拼团成功！99元拼“零基础写作”'
    && !/还差/.test(SHARE.title(Object.assign({}, openTeam, { status: 2 })))
    && !/还差/.test(SHARE.title(Object.assign({}, openTeam, { status: 3 })))
    && !/还差/.test(SHARE.title(Object.assign({}, openTeam, { used_num: 4 })))
    && !/还差 0 人|还差0人/.test(SHARE.title(openTeam) + SHARE.desc(openTeam) + openM)
    && SHARE.title(Object.assign({}, openTeam, { status: 2 })) === '拼团课程“零基础写作”'
    && SHARE.mpTitle(Object.assign({}, openTeam, { status: 2 })) === '拼团课程“零基础写作”');
ok('14.4 文案降级：原价不高于拼团价时不说「原价」（不出现两个同价数字）、价格未到手时不编数字、实物/组合说「拼团商品」+「好物别错过」、没商品名时给非空兜底且不拼半截',
  !/原价/.test(SHARE.desc(Object.assign({}, openTeam, { price: 199 })))
    && !/原价/.test(SHARE.desc(Object.assign({}, openTeam, { activity: { goods_type: 'course', goods_name: '零基础写作', origin_price: 0 } })))
    && !/0元/.test(SHARE.desc(Object.assign({}, openTeam, { price: 0 })))
    && /拼团商品/.test(SHARE.title(Object.assign({}, openTeam, { activity: Object.assign({}, openTeam.activity, { goods_type: 'physical' }) })))
    && /好物别错过/.test(SHARE.desc(Object.assign({}, openTeam, { activity: Object.assign({}, openTeam.activity, { goods_type: 'physical' }) })))
    && SHARE.title({}) === '一起来拼团' && SHARE.desc({}) === '好价别错过，一起来拼团~'
    && SHARE.mpTitle({}) === '一起来拼团',
  '降价档 desc=' + SHARE.desc(Object.assign({}, openTeam, { price: 199 })));
ok('14.5 分享封面取本团商品快照（`activity.goods_cover`）；没封面回空串，由分享层回退站点 logo / 小程序截图，端上不补假图',
  SHARE.cover(openTeam) === 'https://x/a.png'
    && SHARE.cover(Object.assign({}, openTeam, { activity: { goods_type: 'course', goods_name: '零基础写作' } })) === '');
ok('14.6 团详情两端接线：H5 那一发传 `title + desc + cover` 三个参（描述不再写空串）、小程序两档走 `shareMpTitle` 短版而不是 H5 长标题，文案只在 `group-buy-share.js` 一处',
  /import gbShare from '@\/common\/utils\/group-buy-share\.js';/.test(det)
    && /shareTitle\(\)\s*\{\s*return gbShare\.title\(this\.detail\);\s*\}/.test(det)
    && /shareDesc\(\)\s*\{\s*return gbShare\.desc\(this\.detail\);\s*\}/.test(det)
    && /shareMpTitle\(\)\s*\{\s*return gbShare\.mpTitle\(this\.detail\);\s*\}/.test(det)
    && /this\.\$nav\.share\(this\.shareTitle, this\.shareDesc, this\.shareCover\);/.test(det)
    && /this\.\$nav\.share\(this\.shareMpTitle, '', this\.shareCover, timeLine \? 'time_line' : 'app_message'\)/.test(det)
    && !/邀请你一起拼团 ·/.test(detBare)
    && !/还差[^\n]{0,12}人成团！/.test(detBare));

/* ---------- ⑰ 拼团区预取：课程详情一次带回摘要，首屏不再等「详情 → 活动」第二跳 ----------
 * 2026-10-29 用户点名「详情页显示拼团信息有延迟」：原链路是
 *   课程详情回包 → `v-if="data.id"` 才挂组件 → 组件再发 `app/group_buy/activity/detail`。
 * 三件必须同时在位，缺一件延迟就回来：① 后端把摘要塞进同一次响应；② 页面把摘要传给组件；
 * ③ 组件吃预取时**不再发活动请求**（否则只是多发了一发，没省那一跳）。 */
const courseVue = read('src/pages/course/detail/detail.vue');
const beCourse = be('api/controller/course/Course.php');
const bePreload = be('common/library/app/course/DetailGroupBuy.php');
ok('17.1 课程详情接口把拼团摘要随本次响应一次带回（在 `courseDataLimit` 之后追加，才不会被字段白名单裁掉），且「异常/未装」与「确认无活动」两种回值分开',
  beCourse.indexOf('DetailGroupBuy::of(') > beCourse.indexOf('$this->courseDataLimit($row)')
    && beCourse.indexOf('DetailGroupBuy::of(') > -1
    && /\$groupBuy = \\app\\common\\library\\app\\course\\DetailGroupBuy::of\(/.test(beCourse)
    && /if \(\$groupBuy !== false\) \{\s*\$row\['group_buy'\] = \$groupBuy;\s*\}/.test(beCourse));
ok('17.2 预取类只做接线：已订阅短路 / 插件不在位与取数异常返回 false（不下发键，前端仍走旧逻辑）/ 判据仍全在插件 `GoodsArea` 一处',
  /if \(\$subscribed\) \{\s*return null;/.test(bePreload)
    && /if \(!GroupBuy::ready\(\)\) \{\s*return false;/.test(bePreload)
    && /class_exists\(\$area\)/.test(bePreload)
    && /return \$area::of\(self::GOODS_TYPE, \$courseId, intval\(\$userId\)\);/.test(bePreload)
    && /catch \(\\Throwable \$e\)/.test(bePreload));
ok('17.3 课程详情页把预取摘要传给拼团区（`:preload="data.group_buy"`；缺键 = 旧后端，组件按原逻辑自己取）',
  /:preload="data\.group_buy"/.test(courseVue));
const applyBody = (area.match(/applyPreload\(area\) \{([\s\S]*?)\n        \},/) || [''])[0];
ok('17.4 拼团区三档判据：对象挂载即渲染（init 未回包也不挡）/ `null` 连首屏请求都不发 / 缺省空对象走旧逻辑；**缺省值不许写 `undefined`**（mp-weixin 把「宿主没传的 Object prop」落成 `null`，会误判成「后端说没有活动」⇒ 练习等八个宿主整段不出，2026-10-31 实测）；`applyPreload` 本身一条 activity 请求都不发',
  /preload: \{ type: Object, default: \(\) => \(\{\}\) \}/.test(area)
    && !/preload: \{ type: Object, default: undefined \}/.test(area)
    && /const pre = this\.preload && this\.preload\.activity_id \? this\.preload : null;/.test(area)
    && /this\.installed = FEATURE_GROUP_BUY && \(state === true \|\| !!pre\);/.test(area)
    && /if \(this\.preload === null\) \{[\s\S]{0,160}?this\.emitReady\(\);[\s\S]{0,80}?return;\s*\}/.test(area)
    && /this\._fromPreload = true;/.test(applyBody)
    && !!applyBody
    && !/group_buy\.activity\.detail/.test(applyBody));
ok('17.5 预取那一档剩下的两条腿（访客埋点 + 在线凑团）等 init 回包才发：`loadInitLegsOnce` 判 `state === true`，不绕过请求层的插件闸门；下拉刷新遇到闸门时保留已渲染内容',
  /loadInitLegsOnce\(state\) \{\s*if \(state !== true \|\| this\._initLegsDone\) \{ return; \}/.test(area)
    && /this\._initLegsDone = true;\s*this\.reportVisit\(\);/.test(area)
    && /if \(this\._fromPreload && err && err\.plugin\) \{/.test(area));

/* ---------- ⑱ 拼团商品的「成员态」底栏（2026-10-29 用户点名 `presale?id=3168`） ----------
 * 「已经是拼团商品了，为什么没有下单按钮」——现场账号（uid 38）在圈子 3168 里**是成员**，
 * 底栏命中 `joinStatus == 'joined'` 那一支（续费 / 进入圈子），而 `<tz-group-buy-btn>` 只挂在
 * 最后「未加入」那一支 ⇒ 拼团区照样渲染、横幅上写着「¥100 2人拼团价」，底栏却没有一枚能下单的入口。
 * 这一族 `sfc-check`（只编译模板）、`ui-audit`（只查版式）都看不见：模板合法、版式也合法，
 * 错的是**同一枚入口漏进了状态分支**（硬约束 39⑦：挂上组件 ≠ 每种状态都走得通）。
 * 判的是两件事：① 三支（已加入 / 已过期 / 未加入）**各自的**容器里都有一枚拼团入口；
 * ② `inTeam` 收起判据三支共用同一枚 `gbInTeam`（PRD 2026-10-27：一场团在飞还能再买一次）。 */
const circleVue = read('src/pages/app/circle/presale/presale.vue');
const circleJs = read('src/pages/app/circle/presale/js.vue');
// 判据读**代码本体**：这两份文件的注释里正写着「页面不另判 `my_team`」，不剥注释就是拿文档当代码报
const circleVueCode = codeOf(circleVue);
const circleJsCode = codeOf(circleJs);
/** 从 `from` 起切到下一个 `to`（切不到就切到末尾）—— 用来把底栏那几支各切一段 */
const sliceBetween = (src, from, to) => {
  const i = src.indexOf(from);
  if (i < 0) { return ''; }
  const j = src.indexOf(to, i);
  return src.slice(i, j < 0 ? undefined : j);
};
const footerSeg = sliceBetween(circleVueCode, 'class="footer-main"', '<!-- 规格弹层');
const joinedSeg = sliceBetween(footerSeg, 'v-if="joinStatus == \'joined\'"', 'v-else-if="isBanned"');
const expiredSeg = sliceBetween(footerSeg, 'v-else-if="joinStatus == \'expired\'', 'v-else-if="isFull"');
const buySeg = footerSeg.slice(footerSeg.lastIndexOf('<view class="footer-btn-group" v-else>'));
ok('18.1 圈子售前页底栏：**已加入 / 已过期 / 未加入** 三支各自的按钮组里都有 `<tz-group-buy-btn>`（只在最末那支挂 = 成员态看得到拼团横幅却没有下单入口）',
  joinedSeg.indexOf('<tz-group-buy-btn') > -1
    && expiredSeg.indexOf('<tz-group-buy-btn') > -1
    && buySeg.indexOf('<tz-group-buy-btn') > -1
    && countOf(footerSeg, '<tz-group-buy-btn') === 3,
  '已加入=' + (joinedSeg.indexOf('<tz-group-buy-btn') > -1) + ' 已过期=' + (expiredSeg.indexOf('<tz-group-buy-btn') > -1)
    + ' 未加入=' + (buySeg.indexOf('<tz-group-buy-btn') > -1) + ' 全页枚数=' + countOf(footerSeg, '<tz-group-buy-btn'));
ok('18.2 底栏三支的购买按钮（续费 / 立即续费 / 立即购买）共用同一枚 `!gbInTeam`（2026-10-30 起再 ∧ 上 join 态 '
  + '`!gbJoinMode`：受邀参团只留「加入拼团」，不给另一条原价购买口）：`inTeam` 只由拼团区 `@ready` 写进 `gbInTeam`，'
  + '页面不读 `my_team` 自己拼',
  /v-if="info\.sell_type == 2 && !gbInTeam && !gbJoinMode"/.test(joinedSeg)
    && /v-if="!gbInTeam && !gbJoinMode"/.test(expiredSeg)
    && /v-if="!gbInTeam && !gbJoinMode"/.test(buySeg)
    && /gbInTeam: false/.test(circleJsCode)
    && /this\.gbInTeam = !!\(entry && entry\.inTeam\)/.test(circleJsCode)
    && !/my_team/.test(circleVueCode) && !/my_team/.test(circleJsCode));


/* ---------- ⑲ 首帧骨架与真实帧逐块同形（2026-10-29 用户点名「拼团详情的骨架屏可以再适配下」） ---------- */
// 这一族三条静态门禁都看不见：`sfc-check` 只编译模板、`ui-audit` 只按正则查版式、
// 后端 curl 只验接口出口 —— 「骨架摆了几块、每块多高、用的是谁的容器」全在代码里，只能逐条钉。
// 用户看到的那一帧就一个症状：首屏只摆了一条 24px 灰条，数据一到整块状态区（倒计时 + 头像 +
// 还差 + 两枚按钮）一起长出来，读出来是「骨架屏只铺了上半截、加载完整体换版」（M16）。
// 判据口径：① 判据只存一处；② 外壳复用真实容器类；③ 灰块尺寸从真实样式**反查**（不是另抄一份数）；
// ④ 骨架自己不许给那几段再加 margin（双倍缝）；⑤ 骨架里不许出现会猜错的真实文案。
const detTpl = det.slice(0, det.indexOf('<script>')).replace(/<!--[\s\S]*?-->/g, '');
const detCss = det.slice(det.indexOf('<style scoped>'));

ok('⑲1 首帧骨架的判据只存一处 computed（`firstFrame` = `frameDone` 还没置真），商品卡 / 玩法整句 / 状态区整帧三处都读它；'
  + '判据**不读 `loading`**（插件闸门那档会把 `loading` 收成 false，读了就会先亮一屏真实帧 —— 2026-10-29 用户原话'
  + '「会先显示『拼团』两个大字，然后再是骨架屏」），且三条退出分支（成功回包 / 网络异常 / 闸门判未装）都要置 `frameDone`；'
  + '那条单灰条 `.gbd-sk-state` 已撤净',
  /firstFrame\(\)\s*\{\s*return this\.frameDone !== true;\s*\}/.test(det)
    && countOf(detTpl, 'firstFrame') >= 3
    && !/firstFrame\(\)\s*\{[^}]*this\.loading/.test(det)
    && countOf(det, 'frameDone = true') >= 3
    && !/gbd-sk-state/.test(det),
  '模板读点=' + countOf(detTpl, 'firstFrame') + ' frameDone 出口=' + countOf(det, 'frameDone = true'));

ok('⑲2 骨架四段用的是**真实那一档的容器类**（倒计时块 / 标题行 / 数字行 / 头像行 / 动作区各出现两次，'
  + '还差行三次＝真实两档 + 骨架一处），不另造一棵骨架外壳树（M16：外壳走真实元素那一档的类）',
  countOf(detTpl, 'class="gbd-count-block"') === 2 && countOf(detTpl, 'class="gbd-count-title"') === 2
    && countOf(detTpl, 'class="gbd-count-row"') === 2 && countOf(detTpl, 'class="gbd-members"') === 2
    && countOf(detTpl, 'class="gbd-actions"') === 2 && countOf(detTpl, 'class="gbd-gap"') === 3,
  '倒计时块=' + countOf(detTpl, 'class="gbd-count-block"') + ' 数行=' + countOf(detTpl, 'class="gbd-count-row"')
    + ' 头像行=' + countOf(detTpl, 'class="gbd-members"') + ' 还差行=' + countOf(detTpl, 'class="gbd-gap"')
    + ' 动作区=' + countOf(detTpl, 'class="gbd-actions"'));

// 从页面真实 CSS 里反查一个声明值（px）：灰块那一档不许另抄一份数字，必须与真实元素同值。
const cssRule = (sel) => {
  const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp('(?:^|\\n)' + esc + '\\s*\\{([^}]*)\\}').exec(detCss);
  return m ? m[1] : '';
};
const px = (sel, prop) => {
  const m = new RegExp('(?:^|;|\\s)' + prop + '\\s*:\\s*([\\d.]+)px').exec(cssRule(sel) || '');
  return m ? Number(m[1]) : null;
};
ok('⑲3 灰块尺寸**从真实样式反查**、逐块同值：按钮 40（`size=normal` 内衬 20 + 14px 行盒 20）、'
  + '头像圆 = 真实 44、倒计时方块 = 真实 26、天 / 标题 / 还差 / 整句各按真实字号给内容高，'
  + '行盒包装 = 真实 line-height（灰块高 + 上下外衬 = 真实行盒，换真文字不跳）',
  px('.gbd-sk-btn', 'height') === 40
    && px('.gbd-sk-avatar', 'height') === px('.gbd-member-avatar', 'width')
    && px('.gbd-sk-avatar', 'width') === px('.gbd-member-avatar', 'width')
    && px('.gbd-sk-count-box', 'height') === px('.gbd-count-box', 'height')
    && px('.gbd-sk-count-box', 'width') === px('.gbd-count-box', 'min-width')
    && px('.gbd-sk-count-label', 'height') === px('.gbd-count-label', 'font-size')
    && px('.gbd-sk-line--title', 'height') === px('.gbd-count-label', 'line-height')
    && px('.gbd-sk-count-days', 'height') === px('.gbd-count-days', 'font-size')
    && px('.gbd-sk-line--days', 'height') === px('.gbd-count-days', 'line-height')
    && px('.gbd-sk-dash', 'width') === px('.gbd-count-dash', 'width')
    && px('.gbd-sk-gap', 'height') === px('.gbd-gap-text', 'font-size')
    && px('.gbd-sk-line--gap', 'height') === px('.gbd-gap', 'line-height')
    && px('.gbd-sk-rule-label', 'height') === px('.gbd-rule-label', 'font-size')
    && px('.gbd-sk-line--rule-head', 'height') === px('.gbd-rule-label', 'line-height')
    && px('.gbd-sk-rule-line', 'height') === px('.gbd-rule-full', 'font-size')
    && px('.gbd-sk-line--rule', 'height') === px('.gbd-rule-full', 'line-height'),
  '按钮=' + px('.gbd-sk-btn', 'height') + ' 头像=' + px('.gbd-sk-avatar', 'height')
    + ' 方块=' + px('.gbd-sk-count-box', 'height') + 'x' + px('.gbd-sk-count-box', 'width')
    + ' 天行盒=' + px('.gbd-sk-line--days', 'height') + ' 还差行盒=' + px('.gbd-sk-line--gap', 'height')
    + ' 整句行盒=' + px('.gbd-sk-line--rule', 'height'));

// 骨架自己那几段只放灰块：段间距（`.gbd-members` 22 / `.gbd-gap` 20 / `.gbd-actions` 26 / `.gbd-count-block` 2）
// 全部由真实容器给 —— 骨架类里再补 margin 就是双倍缝（M16 同款：改一处必漏一处）。
const skRules = detCss.match(/\.gbd-sk[\w-]*\s*\{[^}]*\}/g) || [];
ok('⑲4 骨架自己的类一律不带 margin（段间距由真实容器 `.gbd-members` / `.gbd-gap` / `.gbd-actions` 那一份给，'
  + '各写一份就是双倍缝）', skRules.length > 0 && !skRules.some((r) => /\bmargin/.test(r)),
  '带 margin 的骨架类=' + skRules.filter((r) => /\bmargin/.test(r)).map((r) => r.split('{')[0].trim()).join(',') || '0');

const skFrame = detTpl.slice(detTpl.indexOf('<block v-if="firstFrame"'), detTpl.indexOf('<block v-else>'));
ok('⑲5 骨架帧里不许出现真实文案（首帧还不知道状态，把「拼团剩余时间」「还差 N 人」「邀请好友参团」写死＝'
  + '先替后端说一句可能不准的话，数据一到还要改口）',
  skFrame.length > 200 && !/拼团剩余时间|还差|邀请好友参团|查看订单详情|查看课程|立即加入/.test(skFrame),
  '骨架帧长度=' + skFrame.length);

const REAL_BOX = /^(gbd|gbd-count-block|gbd-count-title|gbd-count-row|gbd-members|gbd-member|gbd-gap|gbd-actions|gbd-action-gap)$/;
const skClasses = [];
(skFrame.match(/class="([^"]+)"/g) || []).forEach((c) => {
  const v = c.replace(/class="([^"]+)"/, '$1');
  v.split(/\s+/).forEach((k) => { if (k) { skClasses.push(k); } });
});
const ownSk = skClasses.filter((k) => !REAL_BOX.test(k));
ok('⑲6 骨架自己的类一律 `gbd-sk` 前缀、且都在样式里有定义（M11 不留死类、类名带页面前缀防外溢），'
  + '灰块色取全站那一档 #e5e6eb（不是另挑一个灰）',
  ownSk.length > 0 && ownSk.every((k) => /^gbd-sk(-|$)/.test(k) && new RegExp('\\.' + k + '\\s*\\{').test(detCss))
    && /\.gbd-sk\s*\{[\s\S]{0,160}background:\s*#e5e6eb/.test(detCss),
  '骨架自有类=' + JSON.stringify(ownSk));

const skRuleSeg = detTpl.slice(detTpl.indexOf('v-else-if="firstFrame"'), detTpl.indexOf('<view class="gbd-main"'));
// 整句摆几行由「后端拼出来的那一句多长」定：默认配置（普通团 + 自动退款）在 375 宽实渲染 344 / 可用 345 ⇒ 一行；
// 阶梯 / 邀新 / 关闭自动退款才是两行。骨架按**一行**摆（最常见那一档，也是 2026-10-29 用户那团的那一档），
// 两行文案那一档真块比骨架高 22px —— 文案生成规则改了（`RuleText::of`）要回来复核这一条。
ok('⑲7 玩法骨架与真块同版式：标签条在标题行、整句另起一段（行盒 22、一条），不再把两块并排塞进标题行 —— '
  + '改版前那版只有 18 高、真实是 74（标签 20 + 8 + 整句 22 + 上下内衬 24），差 56px',
  /gbd-sk-rule-label/.test(skRuleSeg) && countOf(skRuleSeg, 'class="gbd-sk-line gbd-sk-line--rule"') === 1
    && skRuleSeg.indexOf('gbd-sk-rule-label') > -1
    && skRuleSeg.indexOf('gbd-sk-rule-label') < skRuleSeg.indexOf('gbd-sk-rule-line')
    && !/gbd-sk-rule-text/.test(det),
  '整句行数=' + countOf(skRuleSeg, 'class="gbd-sk-line gbd-sk-line--rule"'));

ok('⑲8 骨架四段与真实四段**同序**：倒计时 → 头像 → 还差 → 按钮（改真实行时漏改骨架 = 加载完整体换版，M16）',
  (() => {
    const a = skFrame.indexOf('gbd-sk-line--title');
    const b = skFrame.indexOf('class="gbd-members"');
    const c = skFrame.indexOf('gbd-sk-line--gap');
    const d = skFrame.indexOf('class="gbd-actions"');
    return a > -1 && a < b && b < c && c < d;
  })() && (() => {
    const realSeg = detTpl.slice(detTpl.indexOf('<block v-else>'));
    const a = realSeg.indexOf('class="gbd-count-block"');
    const b = realSeg.indexOf('class="gbd-members"');
    const c = realSeg.indexOf('class="gbd-gap"');
    const d = realSeg.indexOf('class="gbd-actions"');
    return a > -1 && a < b && b < c && c < d;
  })());

ok('⑲9 首帧不许先亮一屏**真实帧的文案**：状态字只在后端下发 `status_label` 时才出（不再回落成「拼团」两个字——'
  + '那正是 2026-10-29 用户看到的第一帧），结果态标题同档；三块（商品卡 / 玩法 / 状态区）读同一枚 `firstFrame`',
  /v-else-if="detail\.status_label"/.test(detTpl)
    && /\{\{ detail\.status_label \}\}/.test(detTpl)
    && !/\|\| '拼团'/.test(detTpl),
  '状态字兜底残留=' + /\|\| '拼团'/.test(detTpl));

// 同族：**列表页**一模一样的首帧问题（`loading` 初值 false + 闸门 null 分支把它清掉 ⇒ 首帧先亮
// 「还没有拼团记录」，init 回包后再换骨架）。用户 2026-10-29 点名的是详情页那条「三帧」，
// 这一条钉列表页同一根因，免得下一轮又在同一族上被点一次（M16 同族落点同批改）。
ok('⑲10 我的拼团列表同族：`loading` 初值 true（首帧就摆骨架）、插件闸门回 `null` 那一档**不许把 `loading` 收掉**、'
  + '空态排除「已判未装」（否则先亮一句「还没有拼团记录」是说假话）、下拉在闸门未放行时重跑 `start()` 再收条',
  /\n\s*loading: true,\n\s*refreshing: false,/.test(idx)
    && !/if \(state === null\) \{[\s\S]{0,300}this\.loading = false;/.test(idx)
    && /v-if="!loading && !rows\.length && !blocked"/.test(idx)
    && /onPullDownRefresh\(\)[\s\S]{0,500}if \(!this\.entered\) \{[\s\S]{0,200}this\.start\(\);/.test(idx),
  '初值=' + /\n\s*loading: true,\n\s*refreshing: false,/.test(idx)
    + ' 闸门清骨架=' + /if \(state === null\) \{[\s\S]{0,300}this\.loading = false;/.test(idx)
    + ' 空态排除未装=' + /v-if="!loading && !rows\.length && !blocked"/.test(idx));

/* ---------- ⑳ 九类商详页的「成员态」单买收起（2026-10-29 用户点名 `composite/detail?id=27`） ----------
 * 现场（库里查得到）：组合商品 27 挂着一场进行中的拼团（活动 10819），账号 38 已经在团 6235 里
 * （`my_team` 非空、团还在拼团中），可组合商品详情的底栏照样摆着「立即购买」——课程详情页同一状态
 * 早就收起了（`tz-bottom-btn` 的 `hide-main`）。
 * 根因：`inTeam` 这枚标记 `tz-group-buy-area` 对**九类商品一律上抛**，但只有课程（`hide-main`）与
 * 圈子售前页（`gbInTeam`）两页消费了它；实物 / 组合 / 打卡 / 练习 / 线下活动 / 会员卡 / 教务套餐
 * 七页压根没读 ⇒ 一场团在飞还能再买一次原价单（PRD 2026-10-27 原话：「如果我当前正在拼团，
 * 那么是不能再购买的。也就是说，详情页不要再显示单独购买按钮了」）。
 * 这三件 SFC 模板全合法、版式也合法，`sfc-check` 与 `ui-audit` 都看不见，只能在这里逐页钉：
 * ① `gbInTeam` 有初值；② 只由 `gbReady` 从 `entry.inTeam` 写（不读 `my_team` 自己拼）；
 * ③ 主购买按钮带同一枚判据（直挂按钮的用 `v-if="!gbInTeam"`，走 `tz-bottom-btn` 的用 `hide-main`）。 */
const IN_TEAM_PAGES = [
  { label: '实物', vue: 'src/pages/app/physical/detail/detail.vue', js: 'src/pages/app/physical/detail/js.vue',
    gate: /v-if="!gbInTeam && !gbJoinMode && Number\(selectedSkuPrice\.stock\) > 0"/,
    extra: /v-else-if="!gbInTeam && !gbJoinMode">已售罄/ },
  { label: '组合', vue: 'src/pages/app/composite/detail/detail.vue', js: 'src/pages/app/composite/detail/js.vue',
    gate: /<button class="buy-btn" @tap="handleBuy" v-if="!gbInTeam && !gbJoinMode">/ },
  { label: '打卡', vue: 'src/pages/app/checkin/intro/intro.vue', js: 'src/pages/app/checkin/intro/js.vue',
    gate: /text="立即购买" @click="goBuy" v-if="!gbInTeam && !gbJoinMode"/ },
  { label: '练习', vue: 'src/pages/app/exam/detail/detail.vue', js: 'src/pages/app/exam/detail/js.vue',
    gate: /v-if="data\.sales_type == 2" :hide-main="gbInTeam \|\| gbJoinMode"/ },
  { label: '线下活动', vue: 'src/pages/app/activity/detail/detail.vue', js: 'src/pages/app/activity/detail/js.vue',
    gate: /:hide-main="gbInTeam \|\| gbJoinMode"/ },
  { label: '会员卡', vue: 'src/pages/app/vip/center/center.vue', js: 'src/pages/app/vip/center/js.vue',
    gate: /btnTitle="立即开通" @handle="buy" :hide-main="gbInTeam \|\| gbJoinMode"/ },
  { label: '教务套餐', vue: 'src/pages/app/school/package/detail/detail.vue', js: 'src/pages/app/school/package/detail/js.vue',
    gate: /text="立即报名" @click="buy" v-if="!gbInTeam && !gbJoinMode"/ },
];
IN_TEAM_PAGES.forEach((p) => {
  const vueCode = codeOf(read(p.vue));
  const jsCode = codeOf(read(p.js));
  const dataOk = /gbInTeam: false/.test(jsCode);
  const syncOk = /this\.gbInTeam = !!\(entry && entry\.inTeam\)/.test(jsCode);
  const gateOk = p.gate.test(vueCode) && (!p.extra || p.extra.test(vueCode));
  ok('⑳ ' + p.label + '商详：`gbInTeam` 有初值、只由拼团区 @ready 的 inTeam 写，主购买按钮带同一枚收起判据'
    + '（我正在这一场拼团中 ⇒ 底栏只剩「查看拼团详情」，不留一枚点了会被后端拒的原价单）',
    dataOk && syncOk && gateOk,
    '初值=' + dataOk + ' 同步=' + syncOk + ' 按钮=' + gateOk);
});

/* ---------- ㉖ 参团中的「第二条购买入口」：规格弹窗（2026-10-30 用户点名 `composite/detail?id=27`） ----------
 * ⑳ 只收了底栏那枚原价按钮，用户实际是这样绕过去的：点页面上「选择 / 选择套餐 / 圈子有效期」
 * 那一行 → 弹出**单独购买**的规格弹窗 → 弹窗里那枚「立即购买 / 确认报名」照样能下原价单。
 * 用户原话：「下面这个立即购买…按钮没有了。但是我点击这个规格选择，它会弹出来单独购买的规格选择
 * 弹窗，并且规格弹窗里面也是可以点击立即购买按钮进行单独购买的。啊，这应该是一个逻辑漏洞，给补上」。
 * 口径：**一个入口收起了不等于那条路关了** —— 同一件事的每一个入口都要同一枚判据（硬约束 31② 那一族：
 * 只盯一枚入口会以为规则生效了，实际另一枚照样通）。四类吃规格的商品各自有一只规格弹窗：
 *   实物 `sku-select-modal` / 组合 `spec-select-modal` / 圈子 `tz-circle-spec-popup` / 教务套餐
 *   `package-sku-select-modal`（会员卡没有弹窗、规格是页面上那排时长卡，底栏主按钮已是唯一购买入口；
 *   线下活动 / 课程 / 练习 / 打卡不吃规格，票种/档位在提交订单页，也不在页面里摆规格弹窗）。
 * 收法：弹窗本身**不收**（内含商品 / 套餐权益只有它里面看得见），只把确认按钮换成禁用态 + 写原因；
 * 文案只存 `common/utils/group-buy-spec.js` 的 `IN_TEAM_BLOCK_TEXT` 一处，四只弹窗同读，
 * 宿主只传布尔 `in-team`（判据仍是页面那一枚 `gbInTeam`，只由拼团区 `@ready` 的 `inTeam` 写）。 */
const IN_TEAM_SPEC_MODALS = [
  { label: '实物', host: 'src/pages/app/physical/detail/detail.vue', bind: /:in-team="gbInTeam"/,
    modal: 'src/pages/app/physical/components/sku-select-modal.vue', shell: true,
    off: [/:confirm-disabled="confirmDisabled"/, /confirmDisabled\(\)\s*\{\s*return\s+[^;]{0,80}inTeamBlocked;/] },
  { label: '组合', host: 'src/pages/app/composite/detail/detail.vue', bind: /:in-team="gbInTeam"/,
    modal: 'src/pages/app/composite/components/spec-select-modal.vue', shell: true,
    off: [/:confirm-disabled="confirmDisabled"/, /confirmDisabled\(\)\s*\{\s*return\s+[^;]{0,80}inTeamBlocked;/] },
  { label: '圈子售前', host: 'src/pages/app/circle/presale/presale.vue', bind: /:in-team="gbInTeam && !giftMode"/,
    modal: 'src/components/tz/circle-spec-popup.vue', shell: true,
    off: [/:confirm-disabled="inTeamBlocked"/] },
  { label: '教务套餐', host: 'src/pages/app/school/package/detail/detail.vue', bind: /:in-team="gbInTeam"/,
    modal: 'src/pages/app/school/package/components/package-sku-select-modal.vue', shell: false,
    off: [/'pkg-confirm-disabled': !canConfirm \|\| inTeamBlocked/] },
];
const specUtilCode = read('src/common/utils/group-buy-spec.js');
ok('㉖ 参团中的禁用文案只存 `common/utils/group-buy-spec.js` 的 `IN_TEAM_BLOCK_TEXT` 一处（四只规格弹窗同读，'
  + '弹窗里不许各写一句——两处文案就会分叉成两种说法）',
  /export const IN_TEAM_BLOCK_TEXT = '[^']+'/.test(specUtilCode)
    && countOf(specUtilCode, '参团中不可单独购买') === 1
    && IN_TEAM_SPEC_MODALS.every((p) => !/参团中不可单独购买/.test(codeOf(read(p.modal)))),
  '常量=' + /export const IN_TEAM_BLOCK_TEXT = '[^']+'/.test(specUtilCode)
    + ' 唯一一句=' + (countOf(specUtilCode, '参团中不可单独购买') === 1));
IN_TEAM_SPEC_MODALS.forEach((p) => {
  const hostCode = codeOf(read(p.host));
  const modalCode = codeOf(read(p.modal));
  const bindOk = p.bind.test(hostCode);
  const importOk = /import \{[^}]*IN_TEAM_BLOCK_TEXT[^}]*\} from '@\/common\/utils\/group-buy-spec\.js'/.test(modalCode);
  const propOk = /inTeam:\s*\{\s*type:\s*Boolean,\s*default:\s*false\s*\}/.test(modalCode);
  const blockOk = /inTeamBlocked\(\)\s*\{\s*return\s+!!this\.inTeam;\s*\}/.test(modalCode);
  // 2026-10-30 起实物 / 组合 / 圈子三只的按钮由共用外壳画（`:confirm-text` / `:confirm-disabled`
  // 递进壳、壳里 `{{ confirmText }}` + `.sps-confirm--off` 一处判），教务套餐仍自带
  const textOk = /confirmText\(\)\s*\{[\s\S]{0,200}IN_TEAM_BLOCK_TEXT/.test(modalCode)
    && (p.shell
      ? /:confirm-text="confirmText"/.test(modalCode)
        && /\{\{ confirmText \}\}/.test(shellSrc)
        && /'sps-confirm--off': confirmDisabled/.test(shellSrc)
      : /\{\{ confirmText \}\}/.test(modalCode));
  const guardOk = /onConfirm\(\)\s*\{[\s\S]{0,260}if \(this\.inTeamBlocked\)/.test(modalCode);
  const offOk = p.off.every((re) => re.test(modalCode));
  ok('㉖ ' + p.label + '：规格弹窗是参团中的**第二条购买入口** —— 宿主把 `gbInTeam` 传成 `in-team`、弹窗接住它、'
    + '确认按钮在参团中换成禁用态并写原因（弹窗照开：内含商品 / 套餐权益只在它里面看得见），点了也兜一层',
    bindOk && importOk && propOk && blockOk && textOk && guardOk && offOk,
    '传参=' + bindOk + ' 引入=' + importOk + ' prop=' + propOk + ' 判据=' + blockOk
      + ' 文案=' + textOk + ' 兜底=' + guardOk + ' 禁用态=' + offOk);
});

/* ---------- ㉖b 参团中那一趟的规格弹窗按**拼团态**画（2026-10-30 用户点名 `composite/detail?id=27`） ----------
 * ⑳/㉖ 收掉了底栏原价按钮、弹窗按钮也换成了禁用态，用户仍读成「单独购买的弹窗」：底栏已经没有
 * 「立即购买」，弹窗里却还按原价 + 蓝按钮画，拼团价 / 「拼团专享」/ N人团全不见。用户原话：
 * 「多规格商品，如果当前正在拼团中，不会显示单独购买按钮，那么点击规格菜单会弹出规格弹窗，
 * 这个规格弹窗应该是拼团类型的，而不是单独购买的」。
 * 根因：`:gb` 只在 `gbPicking`（点底栏「立即开团」那一趟）时传到规格弹窗；点「选择」那一行时
 * `gbPicking` 是 false ⇒ 参团中那一趟拿到的是原价弹窗（`in-team` 只换了按钮文案，没换价格口径）。
 * 口径：**参团中底栏没有原价入口，规格弹窗就是这一页唯一的价签** ⇒ 这一趟也必须吃 `gb`
 * （拼团价 / 划线原价 / 「拼团专享」/ 阶梯人数档），确认按钮仍是禁用 + `IN_TEAM_BLOCK_TEXT`，
 * 且这一句**排在「立即开团」之前**（拼团态画价不等于这一枚能开团）。
 * 圈子售前页的送好友那一趟（`giftMode`）不吃这一枚 —— 送礼不是本人买，与 `:in-team` 同一枚判据。 */
const GB_IN_TEAM_SPEC = [
  { label: '实物', host: 'src/pages/app/physical/detail/detail.vue',
    modal: 'src/pages/app/physical/components/sku-select-modal.vue' },
  { label: '组合', host: 'src/pages/app/composite/detail/detail.vue',
    modal: 'src/pages/app/composite/components/spec-select-modal.vue' },
  { label: '圈子售前', host: 'src/pages/app/circle/presale/presale.vue',
    modal: 'src/components/tz/circle-spec-popup.vue' },
  { label: '教务套餐', host: 'src/pages/app/school/package/detail/detail.vue',
    modal: 'src/pages/app/school/package/components/package-sku-select-modal.vue' },
];
GB_IN_TEAM_SPEC.forEach((p) => {
  const hostCode = codeOf(read(p.host));
  const modalCode = codeOf(read(p.modal));
  // ① 参团中这一趟由 `gbInTeam`（不是 `gbPicking`）把活动带下去（圈子那一页还要 ∧ `!giftMode`）
  const wireOk = /:gb="[^"]*gbInTeam[^"]*gbActivity : null"/.test(hostCode);
  // ② 文案顺序：只在 `confirmText()` 里比（文件顶部那行 import 也含这枚常量，全文 indexOf 会把它算进去）
  const textFn = (modalCode.match(/confirmText\(\)\s*\{([\s\S]{0,400}?)\n\s*\},/) || [])[1] || '';
  const teamIdx = textFn.indexOf('IN_TEAM_BLOCK_TEXT');
  const openIdx = textFn.indexOf('立即开团');
  const orderOk = teamIdx > -1 && openIdx > -1 && teamIdx < openIdx;
  ok('㉖b ' + p.label + '：参团中那一趟的规格弹窗按**拼团态**画（宿主把活动一起传下去 ⇒ 拼团价 / 拼团专享 / '
    + 'N人团 / 人数档），确认按钮仍是禁用 + 原因，且这一句排在「立即开团」之前',
    wireOk && orderOk,
    '传活动=' + wireOk + ' 文案顺序=' + orderOk);
});

/* ---------- ㉑ 「拼团入口 + 主按钮」并排的吸底栏：容器 gap + 两枚等分（2026-10-29 教务套餐详情） ----------
 * 用户原话：「校务下发的两个按钮，一个拼团按钮，一个立即报名按钮。中间没有间隔，也不是等宽的」。
 * 两个症状两个根因，**都不在组件里**（`tz-group-buy-btn` 与 `u-button` 各自单看都合法）：
 *   ① 容器没有 `gap` ⇒ 两枚贴死（教务详情沿用的是全局 `.school-footer`，它本来只服务单按钮页）；
 *   ② 不等宽：H5 是 `u-button` 自带左右各 12px 内衬 ⇒ flex-basis 差 24px
 *      （Chrome 375 实测 159.5 / 183.5）；小程序端是**宿主节点**拿不到子组件根上的 `flex:1`
 *      （M73，同一对实测 85.2 / 247.8 —— `tz-group-buy-btn` 按内容收缩、主按钮吃掉剩余）。
 * 口径与实物 / 组合 / 圈子三页收齐：容器 `gap: 10px` + 两枚 `flex:1` + 入口宿主 class；
 * `v-if="gbEntry"` 也挂在宿主标签上 —— 没有进行中的活动时，那枚空宿主仍会占掉 `flex:1` 的半条栏宽。
 * 这一族模板合法、版式也合法，`sfc-check` 与 `ui-audit` 都看不见，只能逐页核这四件。 */
const FOOTER_PAIRS = [
  { label: '实物商详', vue: 'src/pages/app/physical/detail/detail.vue', css: 'src/pages/app/physical/detail/css.css',
    host: 'goods-gb-slot', tags: 2,
    gap: /\.detail-tabbar\s*\{[^}]*\bgap:\s*10px/, main: /\.buy-btn\s*\{[^}]*flex:\s*1/,
    mainPad: /\.buy-btn\s*\{[^}]*padding:\s*0\s*;/ },
  { label: '组合商详', vue: 'src/pages/app/composite/detail/detail.vue', css: 'src/pages/app/composite/detail/css.css',
    host: 'cmp-gb-slot', tags: 1,
    gap: /\.tabbar-right\s*\{[^}]*\bgap:\s*10px/, main: /\.buy-btn\s*\{[^}]*flex:\s*1/,
    mainPad: /\.buy-btn\s*\{[^}]*padding:\s*0\s*;/ },
  { label: '圈子售前', vue: 'src/pages/app/circle/presale/presale.vue', css: 'src/pages/app/circle/presale/css.css',
    host: 'presale-gb-slot', tags: 3,
    gap: /\.footer-btn-group\s*\{[^}]*\bgap:\s*10px/, main: /\.footer-btn\s*\{[^}]*flex:\s*1/ },
  { label: '教务套餐商详', vue: 'src/pages/app/school/package/detail/detail.vue', css: 'src/pages/app/school/package/detail/css.css',
    host: 'pd-gb-slot', tags: 1,
    gap: /\.school-footer\.pd-footer\s*\{[^}]*\bgap:\s*10px/, main: /\.pd-buy-btn[^{}]*\{[^}]*flex:\s*1/,
    mainPad: /\.pd-buy-btn\s*\{[^}]*padding:\s*0\s*;/ },
];
FOOTER_PAIRS.forEach((p) => {
  const tpl = codeOf(read(p.vue));
  const css = codeOf(read(p.css));
  const tags = tpl.match(/<tz-group-buy-btn\b[^>]*>/g) || [];
  const hostClassRe = new RegExp('class="[^"]*\\b' + p.host + '\\b');
  const tagOk = tags.length === p.tags && tags.every((t) => hostClassRe.test(t) && /v-if="gbEntry"/.test(t));
  const flexOk = new RegExp('\\.' + p.host + '[^{}]*\\{[^}]*flex:\\s*1').test(css)
    && new RegExp('\\.' + p.host + '[^{}]*\\{[^}]*min-width:\\s*0').test(css);
  const gapOk = p.gap.test(css);
  const mainOk = p.main.test(css) && (!p.mainPad || p.mainPad.test(css));
  ok('㉑ ' + p.label + '底栏：拼团入口与主按钮同栏时，入口宿主带 class（小程序端 flex 只认宿主，M73）、'
    + '宿主与主按钮都 `flex:1 + min-width:0`、间距只由容器 `gap:10px` 给（硬约束 20）、'
    + 'u-button 那一档内衬归零（H5 上它比旁边那枚宽 24px）',
    tagOk && flexOk && gapOk && mainOk,
    '宿主标签=' + tagOk + '(' + tags.length + '/' + p.tags + ') 宿主flex=' + flexOk
      + ' 容器gap=' + gapOk + ' 主按钮=' + mainOk);
});

/* ---------- ㉒ 拼团区在商详页里的**落点**：压在价格卡正下方，不许排到介绍/教师/校区之后（2026-10-29） ----------
 * 用户原话（教务套餐详情 `/pages/app/school/package/detail/detail?id=834`）：「你这个拼团的消息卡
 * 怎么放在教师下面了？你应该放在这个价格下面呀，或者直接把这个价格给覆盖掉呀」。
 * 现场：2026-10-28 接入教务套餐拼团时，`<tz-group-buy-area>` 被追加在「教师」与「校区」之间
 * —— 组件本身、取数、横幅全对，只有位置排到了详情内容里，拼团价与上面那行售卖价隔着一屏卡片，
 * 读出来是「详情里多了一块」而不是「这个商品在拼团」。其它八类商详页从接入起都是压在自己的
 * 价格卡正下方（课程 `course-info` / 实物·组合 `title-card` / 练习价格卡 / 打卡·会员卡·活动信息卡 / 圈子封面卡）。
 * 两条判据：① **九页通用**——拼团区必须出现在页面第一块正文标题之前（`<tz-title` / `<tz-parse`，
 * 两者取更早的一枚），排在介绍/教师/目录/详情之后即红；② **本页**——还必须落在价格卡
 * `.school-head` 之后（只判「在上面」不判「在价格下面」，把整块提到封面之上也算错）。
 * `sfc-check` 与 `ui-audit` 都看不见「模板里两块谁在前」，只能落在这里。 */
const AREA_PAGES = [
  { label: '课程', vue: 'src/pages/course/detail/detail.vue' },
  { label: '练习', vue: 'src/pages/app/exam/detail/detail.vue' },
  { label: '打卡', vue: 'src/pages/app/checkin/intro/intro.vue' },
  { label: '实物', vue: 'src/pages/app/physical/detail/detail.vue' },
  { label: '会员卡', vue: 'src/pages/app/vip/center/center.vue' },
  { label: '线下活动', vue: 'src/pages/app/activity/detail/detail.vue' },
  { label: '组合', vue: 'src/pages/app/composite/detail/detail.vue' },
  { label: '教务套餐', vue: 'src/pages/app/school/package/detail/detail.vue' },
  { label: '圈子售前', vue: 'src/pages/app/circle/presale/presale.vue' },
];
const inOrder = (hay, a, b) => hay.indexOf(a) >= 0 && hay.indexOf(b) >= 0 && hay.indexOf(a) < hay.indexOf(b);
AREA_PAGES.forEach((p) => {
  // 注释里写着 `<tz-group-buy-area>` 的说明不算落点：先剥注释再找标签
  const tpl = codeOf(read(p.vue));
  const area = tpl.indexOf('<tz-group-buy-area');
  const title = tpl.indexOf('<tz-title');
  const parse = tpl.indexOf('<tz-parse');
  const contents = [title, parse].filter((i) => i >= 0);
  const firstContent = contents.length ? Math.min.apply(null, contents) : -1;
  const beforeContent = area >= 0 && firstContent >= 0 && area < firstContent;
  ok('㉒ ' + p.label + '商详：拼团区压在价格卡正下方、排在正文之前（不许落到介绍/教师/校区之后——'
    + '排下去的读法是「详情里的另一块」，拼团价与上面的售卖价也不在同一屏）',
    beforeContent,
    '拼团区=' + area + ' 第一块正文=' + firstContent + '（' + (title >= 0 && title === firstContent ? 'tz-title' : 'tz-parse') + '）');
});
// 本页再补一条「不许提到价格卡上面」：只判 before-content 的话，把它挪到封面之上也算过
const schoolTpl = codeOf(read('src/pages/app/school/package/detail/detail.vue'));
ok('㉒b 教务套餐商详：拼团区在价格卡 `.school-head` **之后**（挪到封面/标题之上同样不对——'
  + '它要压在价格下面，不是压在价格上面）',
  inOrder(schoolTpl, '<view class="school-head">', '<tz-group-buy-area')
    && inOrder(schoolTpl, '<tz-group-buy-area', 'class="school-cell-card"'),
  '价格卡先于拼团区=' + inOrder(schoolTpl, '<view class="school-head">', '<tz-group-buy-area')
    + ' 拼团区先于选择套餐=' + inOrder(schoolTpl, '<tz-group-buy-area', 'class="school-cell-card"'));


/* ---------- ㉓ 拼团规格：复用商品自己的规格组件 + 付费插件未装适配（2026-10-29 第二轮） ----------
 * 用户原话：「这里这个拼团的规格选择卡呀，最好能够复用对应的商品规格组件。另外的话，也要考虑不同插件
 * 它可能会存在这个未安装的情况。因为付费插件它需要安装才有对应的后端代码，所以你要做对应的适配。」
 * 上一版是在拼团弹窗里再画一套「校区 / 套餐内容」——与商品自己的规格组件重复（硬约束 11），本轮改回复用。
 *
 * 口径：
 *   ① **有商品规格组件的五类**（实物 / 组合 / 圈子售前 / 教务套餐 / 会员卡）挂 `host-spec`：
 *      点「立即开团」拼团区不弹自己的规格卡，`$emit('pick-spec')` 让宿主打开它本来那只
 *      （实物 `sku-select-modal` / 组合 `spec-select-modal` / 圈子 `tz-circle-spec-popup` /
 *      教务 `package-sku-select-modal` / 会员卡页内那张「N天」卡），选完调 `afterSpec()` 回来；
 *      商品规格组件里没有、只有拼团这一层才有的「阶梯档」由拼团弹窗第二步问
 *      （规格/份数两节由 `hide-spec` / `hide-count` 收起）。
 *   ② **线下活动**没有商品规格组件（票种只能在这一只弹窗里选）⇒ 仍按老形态摆全；课程/练习/打卡同理。
 *   ③ **付费插件未装**：复用只发生在插件自己的页面里（共用组件不 import 任何 `pages/app/*` 代码），
 *      页面 onLoad 按 `app_isinstall_*` 判、未装整页不进；组合商品这一页 2026-10-29 补上（与教务/圈子同档）。
 * 这一族模板合法、版式合法，`sfc-check` 与 `ui-audit` 都看不见「规格卡又画了一套」「插件页没判安装态」。 */
const GB_CONFIG_SRC = codeOf(read(CONFIG));
// 拼团区本体与提交订单页本体（㉓ 组要核 host-spec 分支 / gb_campus 那两段）
const areaSrc = codeOf(read(AREA));
const submitSrc = codeOf(read('src/components/order/submit-order.vue'));
ok('㉓1 拼团弹窗有**第二步模式**：`hide-spec` 收掉规格/分维两节、`hide-count` 收掉份数，'
  + '「已选 X」在只有一档时仍写规格名（宿主那只组件选过的那一档要看得见）',
  /hideSpec: \{ type: Boolean, default: false \}/.test(GB_CONFIG_SRC)
    && /hideCount: \{ type: Boolean, default: false \}/.test(GB_CONFIG_SRC)
    && /v-if="!hideSpec && isGrouped"/.test(GB_CONFIG_SRC)
    && /v-else-if="!hideSpec && hasSpec"/.test(GB_CONFIG_SRC)
    && /v-if="countEnabled && !hideCount"/.test(GB_CONFIG_SRC)
    && /const showSpec = !!row && \(this\.hideSpec \|\|/.test(GB_CONFIG_SRC));
ok('㉓2 拼团区有 `host-spec` 模式：点「立即开团」只上抛 `pick-spec`、不自开规格弹窗；宿主选完调 '
  + '`afterSpec({specId,count,campusId})` 回来，记回规格/份数/校区后**只有阶梯型**才开第二步，'
  + '其余直接进提交订单页（`gbCtx()` 一份拼参数，校区仍随 `gb_campus` 带下去）',
  /hostSpec: \{ type: Boolean, default: false \}/.test(areaSrc)
    && /if \(this\.hostSpec\) \{\s*\n\s*this\.\$emit\('pick-spec'/.test(areaSrc)
    && /afterSpec\(payload\) \{[\s\S]{0,1400}if \(this\.isLadder && !ladderChosen\)/.test(areaSrc)
    && /currentPick\(\) \{[\s\S]{0,200}ladderId: this\.pickedLadderId/.test(areaSrc)
    && /pendingCount: 0,/.test(areaSrc) && /pendingCampusId: 0,/.test(areaSrc)
    && /gbCtx\(extra\) \{[\s\S]{0,500}ctx\.campus_id = this\.pendingCampusId/.test(areaSrc)
    && /if \(ctx\.campus_id\) \{ q\.push\('gb_campus='/.test(areaSrc));

const HOST_SPEC_PAGES = [
  { label: '实物', vue: 'src/pages/app/physical/detail/detail.vue', js: 'src/pages/app/physical/detail/js.vue',
    after: /afterSpec\(\{ specId: spec\.id, count: [^}]*ladderId:/ },
  { label: '组合', vue: 'src/pages/app/composite/detail/detail.vue', js: 'src/pages/app/composite/detail/js.vue',
    after: /afterSpec\(\{ specId: spec && spec\.id, ladderId:/ },
  { label: '圈子售前', vue: 'src/pages/app/circle/presale/presale.vue', js: 'src/pages/app/circle/presale/js.vue',
    after: /afterSpec\(\{ specId: that\.currentSpec\.id, ladderId:/ },
  { label: '教务套餐', vue: 'src/pages/app/school/package/detail/detail.vue', js: 'src/pages/app/school/package/detail/js.vue',
    after: /afterSpec\(\{ specId: sku\.id, campusId: this\.activeCampus, ladderId:/ },
  { label: '会员卡', vue: 'src/pages/app/vip/center/center.vue', js: 'src/pages/app/vip/center/js.vue',
    after: /afterSpec\(\{ specId: this\.skuIndex, ladderId: this\.\$refs\.gbArea\.currentPick\(\)\.ladderId \}\)/ },
];
HOST_SPEC_PAGES.forEach((p) => {
  const vue = codeOf(read(p.vue));
  const js = codeOf(read(p.js));
  const wired = /<tz-group-buy-area[\s\S]{0,400}?host-spec/.test(vue)
    && /@pick-spec="openGbSpec"/.test(vue);
  const handler = /openGbSpec\(\)\s*\{/.test(js) && p.after.test(js);
  ok('㉓3 ' + p.label + '：拼团区挂 `host-spec`、`@pick-spec` 打开本页自己的规格组件，'
    + '确认后把选中的规格（教务另带校区）交回 `afterSpec` —— 拼团不再自己画第二套规格卡',
    wired && handler, '接线=' + wired + ' 回调=' + handler);
});
ok('㉓4 共用组件不 import 任何插件页面代码（复用只发生在插件自己的页面里，'
  + '标准版 / 未装态不可能因为共用件引用插件而炸；`ui-audit` 与 `sfc-check` 看不见这一档）',
  !/from\s+['"]@\/pages\//.test(areaSrc) && !/from\s+['"]@\/pages\//.test(GB_CONFIG_SRC));
ok('㉓5 线下活动**不挂** `host-spec`（它没有商品规格组件，票种只能在那只拼团弹窗里选；课程/练习/打卡同理），'
  + '拼团弹窗按老形态摆全',
  /<tz-group-buy-area/.test(codeOf(read('src/pages/app/activity/detail/detail.vue')))
    && !/host-spec/.test(codeOf(read('src/pages/app/activity/detail/detail.vue'))));
ok('㉓6 付费插件未装时整页不进：教务 / 圈子 / 组合三页 onLoad 都按 `app_isinstall_*` 判，'
  + '未装说一句并退回（组合商品这一页 2026-10-29 补上，与另外两页同档）',
  [['src/pages/app/school/package/detail/js.vue', 'app_isinstall_school'],
    ['src/pages/app/circle/presale/js.vue', 'app_isinstall_circle'],
    ['src/pages/app/composite/detail/js.vue', 'app_isinstall_composite']]
    .every((row) => {
      const src = codeOf(read(row[0]));
      // 引号两种写法都有（教务/组合用单引号、圈子用双引号）：只认 key + 那两句行为
      return src.indexOf(row[1]) > -1 && /systemConfig\(['"]/.test(src)
        // 文案两档都认：教务/组合写「该功能未开通」，圈子这一族写「XX功能未安装」
        && /(该功能未开通|功能未安装)/.test(src) && /uni\.navigateBack|uni\.reaLaunch/.test(src);
    }));
ok('㉓7 提交订单页读 `gb_campus` 并按套餐校区名单校验（**列表里没有这一处就清掉**、再落到'
  + '「单校区自动选」那一档），但**不再回显名称**（2026-10-31 用户点名「拼团下单的提交订单应该与'
  + '单独购买一样，不要显示这个校区和学生了」）—— 不留一枚指向已下线校区的值（取价口会以「校区不适用」拒单）',
  /const preCampus = Number\(\(this\.pageParams \|\| \{\}\)\.gb_campus\) \|\| 0;\s*\n\s*if \(preCampus\) \{ this\.gbExtra\.campusId = preCampus; \}/.test(submitSrc)
    && /const hit = want \? that\.gbExtra\.campusList\.filter\(\(c\) => c\.id === want\)\[0\] : null;/.test(submitSrc)
    && /if \(!hit && want\) \{\s*that\.gbExtra\.campusId = 0;/.test(submitSrc)
    && !/campusName/.test(submitSrc));


/* ---------- ㉔ 拼团一整块连着放 + 拼团价顶掉原价（2026-10-30 第四/五轮） ----------
 * 第四轮用户原话：「gba-rule 拼团玩法都应该放在 gba-banner 下面…让拼团连成一个整体」→「上下挨在一起，不要拆分放」；
 * 第五轮（同日、教务套餐页 834）：「为什么这个拼团的价格不会复制覆盖原来的价格？我们已经调整过了呀」——
 * 第四轮把原价行恢复常驻，结果一屏又是两个价（￥1 + 拼团 ￥0.6）。两条要求合成一条口径：
 *   ① 横幅只由 `group-buy-area.vue` 在自己那张卡的**第一行**渲染（紧跟玩法/凑团），
 *      宿主不许再挂 `<tz-group-buy-banner>`、不许再传 `hide-banner`；
 *   ② **拼团进行中宿主价格行收起**（`gbPriceShown` = `!(gbEntry.activity)`）⇒ 一屏只有横幅那一个价；
 *      没有活动 / 活动结束 `@ready` 抛 null ⇒ 价格行自己回来；
 *   ③ **练习页例外**：属性卡里那一格保留（2026-10-30 用户点名「价格应该是原价」，当轮确认「保留原价这一格」），
 *      它写的是商品自己的售卖价、拼团态把标题改成「原价」（㉛ 组钉）；
 *   ④ 会员卡没有单一价格行（那排时长卡就是规格组件）⇒ 卡面切该档拼团价 + 原价划线。
 * `sfc-check` 只编译模板、`ui-audit` 只按正则查版式，都看不见「一屏两个价 / 拼团被拆成两截」，只能逐页钉。 */
const GB_PLACEMENT_PAGES = [
  { label: '课程', vue: 'src/pages/course/detail/detail.vue', js: 'src/pages/course/detail/js.vue',
    price: /class="price" v-else-if="gbPriceShown"/ },
  { label: '教务套餐', vue: 'src/pages/app/school/package/detail/detail.vue', js: 'src/pages/app/school/package/detail/js.vue',
    price: /class="price" v-if="gbPriceShown"/ },
  { label: '实物', vue: 'src/pages/app/physical/detail/detail.vue', js: 'src/pages/app/physical/detail/js.vue',
    price: /class="price-box" v-if="gbPriceShown"/ },
  { label: '组合', vue: 'src/pages/app/composite/detail/detail.vue', js: 'src/pages/app/composite/detail/js.vue',
    price: /class="price-box" v-if="gbPriceShown"/ },
  { label: '练习', vue: 'src/pages/app/exam/detail/detail.vue', js: 'src/pages/app/exam/detail/js.vue',
    price: /class="exam-property-item price" v-if="data\.sales_type == 2 && data\.is_auth == false"/, noGate: true },
  { label: '线下活动', vue: 'src/pages/app/activity/detail/detail.vue', js: 'src/pages/app/activity/detail/js.vue',
    price: /class="activity-price" v-if="gbPriceShown && hasPrice\(data\.price\)"/ },
  { label: '圈子售前', vue: 'src/pages/app/circle/presale/presale.vue', js: 'src/pages/app/circle/presale/js.vue',
    price: /class="price-row" v-if="gbPriceShown && info\.sell_type == 2"/,
    extra: /class="price-row free-row" v-else-if="gbPriceShown"/ },
  { label: '打卡', vue: 'src/pages/app/checkin/intro/intro.vue', js: 'src/pages/app/checkin/intro/js.vue',
    price: /class="cdi-price" v-if="gbPriceShown && isPay"/ },
];
GB_PLACEMENT_PAGES.forEach((p) => {
  const vue = codeOf(read(p.vue));
  const js = codeOf(read(p.js));
  const hostBanner = /<tz-group-buy-banner\b/.test(vue);
  const hideAttr = /<tz-group-buy-area[\s\S]{0,400}?hide-banner/.test(vue);
  const gate = p.noGate ? true : /gbPriceShown\(\)\s*\{[\s\S]{0,200}?gbEntry[\s\S]{0,120}?\.activity/.test(js);
  ok('㉔ ' + p.label + '：拼团横幅只在拼团区那张卡里（与玩法/凑团连着），宿主不挂横幅、不传 `hide-banner`；'
    + (p.noGate ? '练习页例外：属性卡保留「原价」那一格（㉛）'
      : '拼团进行中宿主价格行收起（`gbPriceShown`），一屏只有一个价，没有活动时它自己回来')
    + '（2026-10-30 用户点名「上下挨在一起」+「拼团的价格要覆盖原来的价格」）',
    !hostBanner && !hideAttr && p.price.test(vue) && (!p.extra || p.extra.test(vue)) && gate,
    '宿主横幅=' + hostBanner + ' hide-banner=' + hideAttr + ' 价格行=' + p.price.test(vue)
      + ' 判据=' + gate + ' 免费行=' + (!p.extra || p.extra.test(vue)));
});
{
  // 组件那一半：横幅在卡里排第一，攻略与凑团列表紧随其后（顺序本身就是用户那句「放在 gba-banner 下面」）
  const areaCode = codeOf(area);
  const iBanner = areaCode.indexOf('<tz-group-buy-banner');
  const iRule = areaCode.indexOf('class="gba-rule"');
  const iTeams = areaCode.indexOf('class="gba-teams"');
  ok('㉔ 拼团区内部次序：横幅 → 邀新提示 / 档位 → 拼团玩法 → 正在拼团，'
    + '中间不夹任何宿主内容（同一张 `tz-box` 里上下挨着）',
    iBanner > -1 && iRule > iBanner && iTeams > iRule
      && /<tz-group-buy-banner :activity="activity" \/>/.test(areaCode)
      && !/hideBanner:/i.test(areaCode),
    '横幅=' + iBanner + ' 玩法=' + iRule + ' 凑团=' + iTeams);
}
// 会员卡：没有单一价格行，价卡那一排自己就是规格组件 ⇒ 卡面切拼团价 + 原价划线，不另摆价格带
const VIP_VUE = codeOf(read('src/pages/app/vip/center/center.vue'));
const VIP_JS = codeOf(read('src/pages/app/vip/center/js.vue'));
ok('㉔ 会员卡：价卡那一排（本页自己的规格组件）切到**该档拼团价** + 原价划线，不再出现「原价一排 + 横幅一行」；'
  + '横幅同样只在拼团区那张卡里',
  /gbSkuPrice\(index\)/.test(VIP_VUE) && /gbSkuPrice\(index\)[\s\S]{0,120}cell-price-origin/.test(VIP_VUE)
    && /gbSkuPrice\(index\) \{/.test(VIP_JS)
    && !/<tz-group-buy-banner\b/.test(VIP_VUE)
    && /gbActivity = \(entry && entry\.activity\) \|\| null/.test(VIP_JS));


/* ---------- ㉕ 复用商品规格组件时**必须带拼团语义**：拼团价 / 拼团标 / 立即开团（2026-10-29） ----------
 * 用户原话（实物商品）：「你现在多规格的这个现在彻底搞乱了，比如说这个实物商品，你点击开团之后它显示的是
 * 单独购买的这个规格。你导致了第一个拼团价格没有显示，第二个你这个拼团的特殊性完全没有体现出来呀。」
 * 上一轮只做了「打开商品自己的规格组件」，那几只组件原本只认原价 ⇒ 点开团看到的是单独购买的价与按钮，
 * 拼团与单买在弹层里长得一模一样。口径：四只规格组件加**加性** `gb`（活动本体，缺省 null）：
 *   · 有 `gb` ⇒ 头部价格切到**这一档的拼团价** + 原价划线 + 「拼团」标（+ N人团）、按钮写「立即开团」；
 *   · 没有 `gb`（立即购买 / 送好友）⇒ 与改造前逐字相同（原价那一支必须还在，不许被 `gb` 分支吃掉）。
 * 页面只在**拼团那一趟**与**参团中那一趟**传活动（普通购买 / 送好友不许带上，见 ㉖b），
 * 映射口径只存 `common/utils/group-buy-spec.js` 一处（`spec_id` 各商品自己映射）。
 * 这一族模板合法，`sfc-check` 与「拼团价有没有显示」这件事无关，只能在这里钉。 */
/* 2026-10-30：实物 / 组合 / 圈子三只改用共用外壳 `components/tz/spec-popup-shell.vue`
 * （用户点名「专栏走阶梯拼团弹出的那只多规格弹窗，与多规格商品的规格弹窗样式不一样……
 * 样式要统一一下，最好能够做到复用」）⇒ 头区 / 拼团标 / 拼团专享标 / 划线原价 / N人团 / 按钮
 * 的模板与样式**只在壳里一份**，各宿主只负责把这一档的值算好递进去。教务套餐仍是自己的定高弹层
 * （M76 的配色口径不变），故它的 `header` 仍是 `pkg-header`、仍逐条核自己的 SFC。 */
const GB_MODALS = [
  { label: '实物', file: 'src/pages/app/physical/components/sku-select-modal.vue',
    page: 'src/pages/app/physical/detail/detail.vue', priceKey: 'gbPrice', origin: /sps-origin/,
    header: 'sps-head', shell: true,
    wire: /:gb="\(gbPicking \|\| gbInTeam\) \? gbActivity : null"/ },
  { label: '组合', file: 'src/pages/app/composite/components/spec-select-modal.vue',
    page: 'src/pages/app/composite/detail/detail.vue', priceKey: 'gbPrice', origin: /sps-origin/,
    header: 'sps-head', shell: true,
    wire: /:gb="\(gbPicking \|\| gbInTeam\) \? gbActivity : null"/ },
  { label: '圈子', file: 'src/components/tz/circle-spec-popup.vue',
    page: 'src/pages/app/circle/presale/presale.vue', priceKey: 'gbPrice', origin: /sps-origin/,
    header: 'sps-head', shell: true,
    // 送好友那一趟（`giftMode`）不是本人买，与 `:in-team` 同一枚判据：不算参团中的原价单
    wire: /:gb="\(gbPicking \|\| \(gbInTeam && !giftMode\)\) \? gbActivity : null"/ },
  { label: '教务套餐', file: 'src/pages/app/school/package/components/package-sku-select-modal.vue',
    page: 'src/pages/app/school/package/detail/detail.vue', priceKey: 'gbPrice', origin: /price-origin/,
    header: 'pkg-header', shell: false,
    wire: /:gb="\(gbPicking \|\| gbInTeam\) \? gbActivity : null"/ },
];
GB_MODALS.forEach((m) => {
  const src = codeOf(read(m.file));
  const page = codeOf(read(m.page));
  // 两种写法都认：单行 `gb: { type: Object, default: null }` 与多行展开
  const propOk = /gb:\s*\{\s*type: Object,\s*default: null,?\s*\}/.test(src);
  // 取价口径只存 `common/utils/group-buy-spec.js`（2026-10-29 第二轮起阶梯型按「规格 + 档位」两轴取，
  // 四只组件统一读 `gbPriceTextOf` / `gbTierId`，不再各自拿 `gbSpecOf().price` 算）
  // 阶梯型要有两轴取价（`gbTierId`），规格价那一轴按各组件自己的写法（`gbSpecOf` 或直接 `gbPriceTextOf`）
  const useOk = /gbTierId\(this\.gb,/.test(src)
    && (/gbSpecOf\(this\.gb,/.test(src) || /gbPriceTextOf\(this\.gb,/.test(src));
  // 拼团标 / 拼团价 / 划线原价 / 原价支（`v-else`）2026-10-30 起在共用外壳里：
  // 各宿主改为「把 `gbMode` / `gbPrice` / `price` 递进壳」，壳里一处画（三只接壳，教务套餐仍自带）
  const tagOk = m.shell
    ? /class="gb-tag" v-if="tagText"/.test(shellSrc)
    : /class="gb-tag">拼团</.test(src);
  const priceOk = m.shell
    ? new RegExp(':gb-price="' + m.priceKey + '"').test(src) && /\{\{ gbPrice \}\}/.test(shellSrc)
    : new RegExp('\\{\\{ ' + m.priceKey + ' \\}\\}').test(src)
      || new RegExp('gbPriceText\\(' + m.priceKey + '\\)').test(src);
  const btnOk = /立即开团/.test(src);
  const keepOrigin = m.shell
    ? /v-else/.test(shellSrc) && /sps-num/.test(shellSrc) && /:gb-mode="/.test(src)
    : /v-else/.test(src) && /price-num/.test(src);
  const wireOk = m.wire.test(page);
  ok('㉕ ' + m.label + '的规格组件：拼团那一趟显示**这一档的拼团价** + 原价划线 + 「拼团」标，按钮写「立即开团」；'
    + '普通购买（`gb` 缺省）仍走原价那一支；页面在 `gbPicking` ∨ 参团中时传活动',
    propOk && useOk && tagOk && priceOk && btnOk && keepOrigin && wireOk,
    'prop=' + propOk + ' 取价=' + useOk + ' 拼团标=' + tagOk + ' 拼团价=' + priceOk
      + ' 按钮=' + btnOk + ' 原价支还在=' + keepOrigin + ' 页面接线=' + wireOk);
});
ok('㉕b 拼团规格的映射只存 `common/utils/group-buy-spec.js` 一处（`gbSpecOf` / `gbPriceText` / `gbTeamText` '
  + '＋ 阶梯型的 `gbTiersOf` / `gbTierId` / `gbPriceTextOf`）：四只组件谁都不许自己按大类拼 `spec_id`，'
  + '也不许自己拿 `ladder[].price` 再算一遍',
  ['gbSpecOf', 'gbPriceText', 'gbTeamText', 'gbTiersOf', 'gbTierId', 'gbPriceTextOf']
    .every((fn) => new RegExp('export function ' + fn + '\\(').test(read('src/common/utils/group-buy-spec.js'))));
// ㉕c（2026-10-29 实测）：Vue2 模板只能读实例上的 data/computed/methods，`<script>` 里 import 的
// `gbPriceText` 直接写进模板会报 `_vm.gbPriceText is not a function`，整个规格弹窗渲染不出来
// （实物商详点「开团」时踩到；组合 / 教务套餐同款写法一并修）。
// 2026-10-29 第二轮起取价口径换成 `gbPriceTextOf` / `gbTierId`（阶梯型按「规格 + 档位」两轴），
// 判据跟着换：**模板里一律不许出现工具函数的直接调用**，四只组件都走实例上的 `gbPrice` computed。
ok('㉕c 四只规格组件的模板不许直接调 `common/utils/group-buy-spec.js` 里 import 的函数'
  + '（Vue2 模板读不到 import；取价一律走实例上的 `gbPrice` computed / 转手方法）',
  GB_MODALS.every((m) => {
    const tpl = (read(m.file).match(/<template>([\s\S]*?)<\/template>/) || [])[1] || '';
    return !/gbPriceTextOf\(|gbTierId\(|gbTeamText\(|gbSpecOf\(/.test(tpl);
  }));
// ㉕d（2026-10-29 用户点名教育培训套餐弹窗「拼团黑色字体，价格红色字体，然后又是黑色字体显示的原价，
// 特别特别丑」）：模板摆了 `.gb-tag` / `.price-origin` / `.gb-team` 三件，SFC 里就必须有同名规则——
// 教务套餐那只当时三条全缺，只有价格吃 `.price-num` 的红，其余两件全吃浏览器默认黑字。
// 这里只钉「有没有 + 原价有没有划线」，具体色值仍归各组件自己的样式表。
ok('㉕d 拼团价附属类（`.gb-tag` / 划线原价 / `.gb-team`）必须在**用到它的那只 SFC** 有样式规则、原价必须划线'
  + '（2026-10-30 起三只规格弹层与拼团档位弹窗共用 `tz-spec-popup-shell` ⇒ 这三条落在壳里一份；'
  + '教务套餐仍自带）',
  /\.gb-tag\s*\{/.test(shellSrc) && /\.gb-team\s*\{/.test(shellSrc)
    && /\.sps-origin,[\s\S]{0,40}\{[^}]*text-decoration:\s*line-through/.test(shellSrc)
    && /\.gb-tag\s*\{/.test(read('src/pages/app/school/package/components/package-sku-select-modal.vue'))
    && /\.price-origin\s*\{[^}]*text-decoration:\s*line-through/.test(read('src/pages/app/school/package/components/package-sku-select-modal.vue')));
// ㉕e（2026-10-29 用户第二轮）：「或者说拼团的话，给这个规格弹窗增加一个特殊的背景色不好吗？或者说增加一些特殊的 Tag」
// 光把价格文字换色不够，整只弹层要能一眼看出是拼团那一趟。四只组件统一三件：
//   ① 标题区 `--gb` 底色（浅暖红渐隐到白）；② 「拼团专享」渐变标；③ 确认按钮切商详同一条红橙渐变。
// 色值只认 group-buy-btn / group-buy-banner 那一份渐变，不许各弹层自己另调一条。
ok('㉕e 拼团态的整块视觉（标题区 `--gb` 底色 + 「拼团专享」标 + 红橙渐变按钮）必须在**用到它的那只 SFC** 齐三件'
  + '（2026-10-30 起三只规格弹层与拼团档位弹窗共用外壳 ⇒ 壳里一份；教务套餐仍自带）',
  /class="gb-badge" v-if="gbMode"/.test(shellSrc) && /\.gb-badge\s*\{/.test(shellSrc)
    && /\.sps-head--gb\s*\{/.test(shellSrc)
    && (shellSrc.match(/linear-gradient\(90deg, #ff4b2b 0%, #ff8f2b 100%\)/g) || []).length >= 2
    && (shellSrc.match(/--gb'/g) || []).length >= 2
    && GB_MODALS.filter((m) => m.shell).every((m) => /:gb-mode="/.test(read(m.file))));
// ㉕f（2026-10-30 用户点名「拼团的规格选择弹窗要有上圆角，也就是左上角和右上角」）：
// 病根不是「漏写圆角」——`.sku-modal-content` / u-popup 的 `round` 一直都在。CSS 里 `border-radius`
// **只裁剪元素自己的背景，不裁剪子节点的背景**：拼团态给标题区上了 `linear-gradient(180deg, #fff3ee, #fff)`
// 之后，那层浅暖红是第一个子节点、把父级已圆掉的两个上角重新涂成直角，弹层轮廓读出来就是方角
// （非拼团态标题区没有底色，所以只在「立即开团」那一趟看得出问题）。口径：**顶格自己带 `12px 12px 0 0`**，
// 与弹层 `round`（12）和内容容器（12）三处同值；不用给容器加 `overflow: hidden` —— 那会把超出
// `max-height` 的底部按钮一起裁掉（组合/实物这两只是 max-height 70vh 的自适应高，不是教务那种定高）。
ok('㉕f 顶格（标题区）自己带 12px 上圆角、弹层 `round` 同为 12：'
  + 'u-popup 的圆角只画在 `.u-popup__content` 自己的底上、不裁剪子节点背景，拼团态那层浅暖红'
  + '会把左上/右上两角盖成直角（2026-10-30 起三只规格弹层与拼团档位弹窗共用外壳 ⇒ 壳里一处；教务套餐仍自带）',
  /\.sps-head\s*\{[^}]*border-radius:\s*12px 12px 0 0/.test(shellSrc)
    && /:round="12"/.test(shellSrc)
    && /\.pkg-header\s*\{[^}]*border-radius:\s*12px 12px 0 0/.test(read('src/pages/app/school/package/components/package-sku-select-modal.vue'))
    && /:?round="12"/.test(read('src/pages/app/school/package/components/package-sku-select-modal.vue')));


/* ---------- ㉗ 拼团模块的「主题色」是业务红橙，不是平台主色蓝（2026-10-30 用户点名） ----------
 * 用户原话：「pages/app/group_buy/detail/detail?team_id=6545 然后这个页面中的主题色是蓝色的，
 * 那最好可以同步一下平台的主题色，可以考虑这个拼团多规格商品选择弹窗中的背景色、按钮颜色。」
 * 纠正后的一句：「把主题色改成拼团的颜色，也就是说把蓝色变成红橙业务色。」
 * 口径：拼团模块自己有一套主题色（`group-buy-btn` / `group-buy-banner` / 规格弹窗同一份），
 * 详情页的强调位一律吃它，**不许再回到 `#0968f6`**——同一屏「倒计时红橙 + 按钮蓝」两套主色，
 * 用户读出来就是「这不是拼团那一套」。三档色只认两处（硬约束 29：色只从业务主色派生）：
 *   渐变 `linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)`（主按钮 / 徽标）
 *   深一档 `#cf350e`（白底 5.04:1、压本色浅底 4.55:1 ⇒ 小字与实底块）
 *   本体 `#ff4b2b`（装饰线、9px 小标压白字 3.34:1；不往渐变浅端 2.28 走）
 * 边界：状态标（`group_buy/index` 的 `.gbl-tag--joining` 蓝＝进行中 / `--failed` 红＝失败）
 * 与价格红 `#f53f3f` 是**语义分档**、不是这一条管的面子色，别一起改。 */
const GB_GRADIENT = 'linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)';
const gbBtnSrc = read('src/components/tz/group-buy-btn.vue');
const btnCompSrc = read('src/components/tz/button.vue');
const detSrc = read(DET);
// 判「色值有没有落到声明上」要把注释剥掉：色板说明里**可以**写出被禁的色名（本页头注释就写着
// 「不取平台主色蓝」与那条渐变），把说明文字判成违规等于逼人删文档。
const detNoComment = detSrc.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
ok('㉗1 拼团详情页的强调位不许再用平台主色蓝 `#0968f6`（倒计时 / 团长标 / 还差 N 人 / 动作区），'
  + '样式声明里零命中', !/0968f6/i.test(detNoComment),
  '蓝残留=' + (detNoComment.match(/0968f6/gi) || []).length);
ok('㉗2 倒计时逐块落业务色：标题 / 天数 / 冒号与方块取深一档 `#cf350e`（白字同一对数 5.04:1），'
  + '装饰线取 `#ff4b2b`',
  /\.gbd-count-label\s*\{[^}]*color:\s*#cf350e/.test(detSrc)
    && /\.gbd-count-days\s*\{[^}]*color:\s*#cf350e/.test(detSrc)
    && /\.gbd-count-colon\s*\{[^}]*color:\s*#cf350e/.test(detSrc)
    && /\.gbd-count-box\s*\{[^}]*background:\s*#cf350e/.test(detSrc)
    && /\.gbd-count-dash\s*\{[^}]*background:\s*#ff4b2b/.test(detSrc));
ok('㉗3 「团长」小标与「还差 N 人」的数字同吃业务色（`#ff4b2b` 实底 / `#cf350e` 字），'
  + '小标不整条渐变（26×14 上渐变浅端白字只有 2.28:1）',
  /\.gbd-leader-tag\s*\{[^}]*background:\s*#ff4b2b/.test(detSrc)
    && /\.gbd-gap-num\s*\{[^}]*color:\s*#cf350e/.test(detSrc));
ok('㉗4 动作区四枚主按钮走 `tz-button` 的 `theme="group-buy"`，页面里不写死渐变串'
  + '（色值只存 `button.vue` 一处，与商详「立即开团」同值）',
  (detSrc.match(/theme="group-buy"/g) || []).length === 4
    && !new RegExp(GB_GRADIENT.replace(/[()]/g, '\\$&')).test(detNoComment)
    && /\.tuzi-btn\.primary\.theme-group-buy\s*\{[^}]*background:\s*linear-gradient\(90deg, #ff4b2b 0%, #ff8f2b 100%\)/.test(btnCompSrc)
    && /'theme-group-buy':\s*theme == 'group-buy'/.test(btnCompSrc)
    && gbBtnSrc.indexOf(GB_GRADIENT) > -1,
  '按钮主题档=' + (btnCompSrc.indexOf(GB_GRADIENT) > -1) + ' 与 gb-btn 同值=' + (gbBtnSrc.indexOf(GB_GRADIENT) > -1));

/* ---------- ㉘ 受邀参团（2026-10-30 用户口径） ----------
 * 现场：好友点开团详情（`team_id=6582`）→「立即加入」直接落提交订单页，多规格看不到规格、
 * 线下活动/教务套餐也跳过商品页那一层；用户要求改成：带团上下文去商品自己的详情页，底栏只留
 * 「加入拼团」，多规格先弹规格（**团绑定商品、不绑定规格：参团可换规格**，阶梯档固定团上那一档），
 * 单规格直接去确认页；
 * 从别的入口重新进商品页 = 正常自己开团（join 上下文只活在这一页实例上）。
 * 这一族横跨 router、util、拼团区、规格弹窗与九个宿主页，`sfc-check` / `ui-audit` 都看不见，
 * 所以逐跳钉：参数从哪来 → 谁读 → 按钮变成什么 → 第二条购买入口怎么收 → 提交页怎么显示规格。 */
const JOIN_UTIL = 'src/common/utils/group-buy-join.js';
const joinSrc = read(JOIN_UTIL);
const configVue = read(CONFIG);
const submitVue = read('src/components/order/submit-order.vue');
const routerSrc = read('src/common/utils/router.js');
const JOIN_PROPS = [':join-team', ':join-activity', ':join-goods-id', ':join-spec', ':join-ladder', ':join-price'];
const joinHostBad = [];
LANDING.forEach((p) => {
    const vue = read(p.vue);
    const js = read(p.js);
    const tag = (vue.match(/<tz-group-buy-area\b[\s\S]*?\/>/g) || []).find((t) => new RegExp('goods-type="' + p.type + '"').test(t)) || '';
    JOIN_PROPS.forEach((prop) => {
        if (tag.indexOf(prop + '=') < 0) { joinHostBad.push(p.type + ' 缺 ' + prop); }
    });
    if (!/readGroupBuyJoin/.test(js)) { joinHostBad.push(p.type + ' 未读 join 上下文'); }
    if (!/gbJoinMode = !!\(entry && entry\.join\)/.test(js)) { joinHostBad.push(p.type + ' 未用 @ready.join 校准'); }
});
ok('㉘1 九个商品页都接住了 join 上下文：拼团区标签传六枚 `join-*`、页面 onLoad 用 `readGroupBuyJoin()` 读、'
  + '`@ready.join` 回写 `gbJoinMode`（缺哪一页 = 那一类商品从团详情「立即加入」进来还会漏单独购买按钮）',
  joinHostBad.length === 0, joinHostBad.join('；') || '九页齐');
ok('㉘2 拼团区 join 态：底栏文案「加入拼团」、不显示价格/档位块/凑团段；点按钮先走 `openJoin()`（不是凑团弹层）；'
  + '**团绑定商品、不绑定规格**：参团可换规格（阶梯档固定团上那一档），单规格直接去确认页',
  /joinTeam: \{ type: Number, default: 0 \}/.test(area)
    && /joinSpec: \{ type: \[Number, String\], default: 0 \}/.test(area)
    && /joinMode\(\) \{[\s\S]{0,600}?Number\(this\.activity\.goods_id\) !== Number\(this\.joinGoodsId\)/.test(area)
    && /if \(this\.joinMode\) \{ return '加入拼团'; \}/.test(area)
    && /if \(this\.joinMode && !this\.myTeam\) \{ return ''; \}/.test(area)
    && /if \(this\.joinMode\) \{ return false; \}/.test(codeOf(area).slice(codeOf(area).indexOf('teamsEnabled()'), codeOf(area).indexOf('showTeams()')))
    && /if \(this\.joinMode\) \{ return false; \}/.test(codeOf(area).slice(codeOf(area).indexOf('showPicker()'), codeOf(area).indexOf('entryPrice()')))
    && /if \(this\.joinMode\) \{\s*this\.openJoin\(\);/.test(area)
    && /joinableSpecs\(\) \{[\s\S]{0,700}?ok\[Number\(row\.spec_id\)\][\s\S]{0,300}?filtered\.length \? filtered : rows/.test(area)
    && /joinSpecSupported\(\) \{[\s\S]{0,500}?Number\(row\.id\) === Number\(this\.joinLadder\)/.test(area)
    && /if \(this\.joinMode\) \{[\s\S]{0,500}?const joinRows = this\.joinableSpecs/.test(area)
    && /pickSpecId\(specId\) \{[\s\S]{0,500}?if \(this\.joinMode\) \{[\s\S]{0,260}?Number\(this\.joinLadder\)/.test(area)
    && /openJoin\(\) \{[\s\S]{0,2400}?this\.goBuy\(this\.gbCtx\(\{ team_id: this\.joinTeam \}\)\);/.test(area)
    && /this\.\$refs\.config\.open\(\{ specId: joinSpec, ladderId: Number\(this\.joinLadder\) \|\| 0 \}\)/.test(area)
    && /:fixed-ladder-id="joinMode \? joinLadder : 0"/.test(area)
    && /:team-spec-id="joinMode \? joinTeamSpecId : 0"/.test(area)
    && /:team-price="joinMode \? joinPrice : 0"/.test(area)
    && /:hide-ladder="joinMode"/.test(area)
    && /:hide-spec="\(hostSpec \|\| hostTicket\) && !joinMode" :hide-count="\(hostSpec \|\| hostTicket\) && !joinMode"/.test(area)
    && /:confirm-text="joinMode \? '加入拼团' : '确定'"/.test(area)
    && !/:lock-spec="|:lock-price="/.test(area)
    && /q\.push\('gb_spec_set=1'\)/.test(area));
ok('㉘3 规格弹窗在参团时可**换规格**、阶梯人数档固定为团上那一档：可选 chips 都点得中；'
  + '选团长那一档仍显示团快照价，换到别的规格按该档现价（与后端 `Gate::joinUnit()` 同源）',
  /fixedLadderId: \{ type: \[Number, String\], default: 0 \}/.test(configVue)
    && /teamSpecId: \{ type: \[Number, String\], default: 0 \}/.test(configVue)
    && /teamPrice: \{ type: \[Number, String\], default: 0 \}/.test(configVue)
    && /hideLadder: \{ type: Boolean, default: false \}/.test(configVue)
    && /confirmText: \{ type: String, default: '确定' \}/.test(configVue)
    && /specs\(\) \{[\s\S]{0,700}?fixedLadderId[\s\S]{0,500}?filtered\.length \? filtered : list/.test(configVue)
    && /open\(payload\) \{[\s\S]{0,1000}?const fixed = Number\(this\.fixedLadderId\) \|\| 0/.test(configVue)
    && /applySpec\(row\) \{[\s\S]{0,500}?const fixed = Number\(this\.fixedLadderId\) \|\| 0/.test(configVue)
    && /priceText\(\) \{[\s\S]{0,420}?Number\(this\.chosenSpecId\) === Number\(this\.teamSpecId\)/.test(configVue)
    && /canBuy\(\) \{\s*return this\.chosenSpec \? specBuyable\(this\.chosenSpec\) : true;/.test(configVue)
    && /ladderId: this\.isLadder\s*\n?\s*\? \(Number\(this\.fixedLadderId\) \|\| this\.chosenLadderId\)/.test(configVue)
    && !/lockSpec|lockPrice|specPickable|lockedSpecText|gbc-lock-tip/.test(configVue));
ok('㉘4 同一屏的第二条原价购买口在 join 态也收掉：实物/组合/教务套餐的「选择」行改开拼团规格弹窗；'
  + '会员卡可换时长（目标卡仍锁）、页面上先落到团长那一档；提交订单页按参团人选的那一档报价与显示规格',
  /@tap="openSkuPicker"/.test(read('src/pages/app/physical/detail/detail.vue'))
    && /openSkuPicker\(\) \{[\s\S]{0,220}?if \(that\.gbJoinMode\) \{[\s\S]{0,120}?that\.openGb\(\);/.test(read('src/pages/app/physical/detail/js.vue'))
    && /@tap="openSpecPicker"/.test(read('src/pages/app/composite/detail/detail.vue'))
    && /openSpecPicker\(\) \{[\s\S]{0,220}?if \(that\.gbJoinMode\)/.test(read('src/pages/app/composite/detail/js.vue'))
    && /@click="openSkuPicker"/.test(read('src/pages/app/school/package/detail/detail.vue'))
    && /openSkuPicker\(\) \{[\s\S]{0,260}?if \(this\.gbJoinMode\)/.test(read('src/pages/app/school/package/detail/js.vue'))
    // 会员卡：换时长不再被拦，且卡面价对团长那一档用团快照价
    && /changeSku\(index\) \{[\s\S]{0,260}?this\.skuIndex = index;[\s\S]{0,200}?pickSpecId\(index\)/.test(read('src/pages/app/vip/center/js.vue'))
    && /gbSkuPrice\(index\) \{[\s\S]{0,500}?Number\(this\.gbJoinCtx\.specId\) === Number\(index\)/.test(read('src/pages/app/vip/center/js.vue'))
    && /if \(current !== Number\(that\.gbJoinCardIndex\)\)/.test(read('src/pages/app/vip/center/js.vue'))
    && /Number\(c\.id\) === Number\(that\.gbJoinCtx\.goodsId\)/.test(read('src/pages/app/vip/center/js.vue'))
    && /sku_prices\.find\(sku => Number\(sku\.id\) === Number\(that\.gbJoinCtx\.specId\)\)/.test(read('src/pages/app/physical/detail/js.vue'))
    && /data\.specs\.find\(\(s\) => Number\(s\.id\) === Number\(that\.gbJoinCtx\.specId\)\)/.test(read('src/pages/app/composite/detail/js.vue'))
    && /ret\.data\.skus\.findIndex\(\(s\) => Number\(s\.id\) === Number\(this\.gbJoinCtx\.specId\)\)/.test(read('src/pages/app/school/package/detail/js.vue'))
    && /that\.info\.specs\.find\(\(s\) => Number\(s\.id\) === Number\(that\.gbJoinCtx\.specId\)\)/.test(read('src/pages/app/circle/presale/js.vue'))
    && /const teamSpecText = isJoin \? String\(d\.spec_text \|\| ''\) : '';/.test(submitVue)
    && /specHit && specHit\.spec_text \? specHit\.spec_text : teamSpecText/.test(submitVue)
    && /spec_set: gb\.spec_set \|\| 0,\s*\n\s*count: gb\.count \|\| 1,/.test(submitVue)
    && (submitVue.match(/spec_set: gb\.spec_set \|\| 0,/g) || []).length >= 3);
ok('㉘5 后端参团链同口径：`team.join` 收 spec_id/spec_set，`joinUnit()` 对团长那一档吃团快照价、'
  + '换规格按该档现价（阶梯取团上那一档在该规格下的价）；`team.detail` 可按参团人选的那一档报价',
  /intval\(\$this->request->param\('spec_set', 0\)\) === 1/.test(read('../tuzhi-selfbuilt-backend/application/api/controller/app/group_buy/Team.php'))
    && /TeamService::joinTeam\(\$this->userId\(\), \$teamId, \$remark, \$extra, \$count, \$addressId, \$specId, \$specSet\)/.test(read('../tuzhi-selfbuilt-backend/application/api/controller/app/group_buy/Team.php'))
    && /public static function joinTeam\([^)]*\$specId = 0, \$specSet = false\)/.test(teamSrc)
    && /function unit\(array \$activity, array \$team, \$specId = 0, \$exact = false\)/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/JoinQuote.php'))
    && /if \(\$specId === \$leaderId && floatval\(\$team\['price'\]\) > 0\)/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/JoinQuote.php'))
    && /SpecLadder::row\(\$activity, \$specId, \$ladderId, \$exact\)/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/JoinQuote.php'))
    && /public static function findExact\(array \$activity, \$specId\)/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/ActivitySpec.php'))
    && /OrderContext::join\([^)]*\$specId, \$specSet\)/.test(read('../tuzhi-selfbuilt-backend/application/api/controller/app/group_buy/Team.php'))
    && /JoinQuote::unit\(\$activity, \$team, \$quoteSpecId, \$specSet\)/.test(read('../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/TeamPage.php')));
ok('㉘6 落点与作用域：九类商品页映射只存 `router.groupBuyGoodsPath()`（打卡落 `checkin/intro`，不是主页 `checkin/detail`）、'
  + 'join 上下文只从 URL 读不写 storage（退出后重新进商品页 = 正常自己开团）',
  /groupBuyGoodsPath\(goodsId, goodsType\) \{[\s\S]{0,260}?if \(type === 'checkin'\) \{[\s\S]{0,120}?\/pages\/app\/checkin\/intro\/intro\?id=/.test(routerSrc)
    && /url = this\.groupBuyGoodsPath\(goodsId, goodsType\);/.test(routerSrc)
    && /readGroupBuyJoin/.test(joinSrc) && /gb_team/.test(joinSrc)
    && !/setStorageSync/.test(joinSrc) && !/setStorageSync\(['"]gb_(team|join)/.test(area)
    && /this\.\$nav\.groupBuyGoodsPath\(g\.goods_id, g\.goods_type \|\| 'course'\)/.test(codeOf(det))
    && /appendQuery\(base, \{/.test(codeOf(det)));
ok('㉘7 提交订单页的「规格没选」判据认 `spec_set`：会员卡的 spec_id 是 sku 下标、**0 就是第 0 档**'
  + '（`VipcardSpec` 按下标取档），只看 spec_id 真值会把会员中心默认选中的第一档读成没选、'
  + '弹「请先选择拼团商品的规格」再退回（2026-10-30 用户点名 `/pages/app/vip/center/center` 立即开团）',
  /const specPicked = wantSpec > 0 \|\| Number\(gb\.spec_set\) === 1;/.test(submitVue)
    && /if \(specRows\.length > 1 && !specPicked\) \{\s*\n\s*specMsg = '请先选择拼团商品的规格';/.test(submitVue)
    && /else if \(specPicked && !specHit\)/.test(submitVue));

/* ---------- ㉙ 已有使用权限 ⇒ 不收拼团区（2026-10-30 用户点名练习详情） ----------
 * 现场：`/pages/app/exam/detail/detail?id=5` 用户已经能做题（`is_auth` 真），页面上照样摆着
 * 拼团横幅 + 拼团区两块价签，读出来是「还要再买一次」。课程商详从接入起就是
 * `v-if="!data.subscription && data.id"` 一档（已订阅不挂拼团区），练习页漏了同一枚判据
 * ⇒ 两页口径分叉，而 `sfc-check`（只编译）、`ui-audit`（只查版式）、curl（只验接口）
 * 三道门禁都看不见「这一页在已拥有态还摆着价签」。
 * 口径：拼团区与购买弹幕吃**同一枚** `gbVisible`（横幅 2026-10-30 起只由拼团区自己渲染，
 * 跟着拼团区一起不出，宿主不再有第二处），页面里再写第二份判据即红；
 * 那枚 computed 的原料只能是 `data.id` 与 `data.is_auth`（不自己拼购买态：`checkAuth` 已把
 * 已购 / 绑定课程可学 / 免费三类压成一个布尔）。 */
const EXAM_VUE = 'src/pages/app/exam/detail/detail.vue';
const EXAM_JS = 'src/pages/app/exam/detail/js.vue';
{
  const vue = codeOf(read(EXAM_VUE));
  const js = codeOf(read(EXAM_JS));
  const areaTags = (vue.match(/<tz-group-buy-area\b[\s\S]*?\/>/g) || []);
  const areaGate = areaTags.length === 1 && /v-if="gbVisible"/.test(areaTags[0]);
  const noHostBanner = !/<tz-group-buy-banner\b/.test(vue);
  const danmuGate = /<tz-group-buy-danmu v-if="gbVisible && gbBuyers\.length"/.test(vue);
  const derive = /gbVisible\(\) \{\s*return !!this\.data\.id && !this\.data\.is_auth;/.test(js);
  ok('㉙ 练习详情：已有使用权限（`is_auth`）⇒ 拼团区（连它自己那份横幅）与购买弹幕整段不出，'
    + '两处吃同一枚 `gbVisible`（原料只有 `data.id` 与 `data.is_auth`；课程商详 `!data.subscription` 同口径）',
    areaGate && noHostBanner && danmuGate && derive,
    '拼团区=' + areaGate + '(' + areaTags.length + ') 宿主横幅=' + noHostBanner
      + ' 弹幕=' + danmuGate + ' 判据=' + derive);
}

/* ---------- ㉚ 已经加入过练习 ⇒ 优惠券领取条不出（2026-10-30 用户点名） ----------
 * 现场：`/pages/app/exam/detail/detail?id=14` 用户已经加入过这件练习（`is_subscribe` 真，
 * 付费练习付款时 `Payed` 也会落一行 `type=pay` 的订阅），页面上照样摆着「领券」条 ——
 * 这一条促销与「已经能做题」的人无关。原先那枚判据只有「虚拟支付那档不出」，
 * 三道静态门禁都看不见「这一页在已加入态还摆着领券入口」。
 * 口径：优惠券条与底栏那枚「加入练习」吃同一枚状态（`is_subscribe`），判据只存
 * `couponVisible` 一处；虚拟支付（金币价）那档照旧不出。 */
{
  const vue = codeOf(read(EXAM_VUE));
  const js = codeOf(read(EXAM_JS));
  const barTags = (vue.match(/<coupon-goods-bar\b[\s\S]*?\/>/g) || []);
  const barGate = barTags.length === 1 && /v-if="couponVisible"/.test(barTags[0]);
  const derive = /couponVisible\(\) \{\s*return !this\.isVirtualPay\(this\.data\) && !this\.data\.is_subscribe;/.test(js);
  ok('㉚ 练习详情：已经加入过练习（`is_subscribe`）⇒ 优惠券领取条整条不出'
    + '（判据只存 `couponVisible` 一处，虚拟支付那档照旧不出）',
    barGate && derive,
    '挂载=' + barGate + '(' + barTags.length + ') 判据=' + derive);
}

/* ---------- ㉛ 拼团态的价格格：数字仍是原价、标题写「原价」（2026-10-30 用户点名） ----------
 * 用户原话：「假如开启拼团的话，这里子项中的价格应该是原价，你确认一下，现在是否是这样的？」
 * 同一屏拼团区已经写着拼团价（¥10），属性卡那一格若还写「售价 ¥20」会被读成「两个卖价」。
 * 口径：① 数字始终是商品自己的售卖价（`data.pay_price`，后端 `Exercises::detail` 不改这一列）；
 *      ② 标题在活动进行中从「售价」切成「原价」（`priceLabel`，吃拼团区 `@ready` 上抛的
 *         `activity`，与底栏那枚拼团按钮、封面弹幕同一份来源）；
 *      ③ **只换标题、不动显隐**：这一行 ㉔ 要求常驻，拼团那一趟也照样能读到数字。
 * 三道静态门禁都看不见「这一格写的是哪个词」——只有真机/浏览器读得出来。 */
{
  const vue = codeOf(read(EXAM_VUE));
  const js = codeOf(read(EXAM_JS));
  const labelWire = /\{\{\s*priceLabel\s*\}\}/.test(vue);
  const derive = /priceLabel\(\)\s*\{[\s\S]{0,200}?gbEntry[\s\S]{0,80}?\.activity[\s\S]{0,40}?'原价'[\s\S]{0,40}?'售价'/.test(js);
  const stillPayPrice = /\{\{\s*data\.pay_price\s*\}\}/.test(vue);
  ok('㉛ 练习详情价格格：拼团那一趟标题写「原价」、数字仍是 `data.pay_price`（不拿活动价覆盖），'
    + '活动结束 / 没有活动时回到「售价」',
    labelWire && derive && stillPayPrice,
    '标题吃 priceLabel=' + labelWire + ' 判据=' + derive + ' 数字仍 pay_price=' + stillPayPrice);
}

/* ---------- ㉜ 练习属性卡：卡内满宽 + 子项等分（2026-10-30 用户第二次点名等宽） ----------
 * 用户原话：「exam-property-box 这里面子项应该是等宽呀，我们之前已经改过了，为什么现在全都没有了？」
 * 这一行的枚数会随「是否单独售卖」在 3 / 4 之间变：写死 300px + `space-between` 时它均的是间隙、
 * 各格宽度随文案长短（售价 2 字 / 总题量 3 字 / 单次题量·出题模式 4 字），而且永远挤在卡中间那一小条。
 * 口径（origin `be5a1ba7`）：容器满宽、每项 `flex:1 1 0` 等分、`min-width:0` 防长文案撑破；
 * 容器不再写 `justify-content: space-between`、不再写死 300px。
 * 这一族只有几何看得见，`sfc-check` / `ui-audit` 都验不到。 */
{
  const css = read('src/pages/app/exam/detail/css.css');
  const boxRule = (css.match(/\.exam-property-box\s*\{[^}]*\}/) || [''])[0];
  const itemRule = (css.match(/\.exam-property-box \.exam-property-item\s*\{[^}]*\}/) || [''])[0];
  const fullWidth = /width:\s*100%/.test(boxRule);
  const noFixed = !/width:\s*300px/.test(boxRule) && !/justify-content:\s*space-between/.test(boxRule);
  const equal = /flex:\s*1 1 0/.test(itemRule) && /min-width:\s*0/.test(itemRule);
  ok('㉜ 练习属性卡：卡内满宽（`width:100%`，不写死 300px）＋ 子项等分'
    + '（`flex:1 1 0` + `min-width:0`），容器不再用 `space-between` 均间隙',
    fullWidth && noFixed && equal,
    '满宽=' + fullWidth + ' 未写死=' + noFixed + ' 等分=' + equal);
}

/* ---------- ㉝ 已成团那颗按钮：实物写「查看订单」并去订单详情、线下活动写「查看票券」并去我的票券
 * （2026-10-30 用户点名 team 6935；2026-10-31 用户点名 team 7142）----------
 * 用户原话：①「/pages/app/group_buy/detail/detail?team_id=6935 这里拼单成功不要显示查看商品呀，应该是查看订单。」
 *          ②「pages/app/group_buy/detail/detail?team_id=7142 线下活动拼团成功，下面的按钮应该是查看票券」
 * 团 6935 是实物团（`app_group_buy_team.goods_type=physical`，goods_id=2 人工智能学习实体资料）：
 * 实物拼完成团要查的是**自己那一单的收货信息**，商品页那趟已经没有新的可读信息。
 * 团 7142 是线下活动团（`goods_type=activity`）：买到的是报名名额，成团后能看的凭据是**票券**
 * （落点与支付成功页「查看我的票券」同一页 `app/activity/user`，那一页自己按状态分页签 + 检索）。
 * 口径：① `successText` 只对 `physical` 写「查看订单」、`activity` 写「查看票券」，课程写「查看课程」，
 *      其余大类写「查看商品」；
 *      ② `goSuccess` 与文案同一份判据：实物走 `goOrder()`（订单详情）、线下活动走 `goTickets()`（我的票券）、
 *      其余走 `goGoods()`（商品详情）；
 *      ③ 缺省 / 空串按课程走（与后端 `GoodsSpec::handleTypeOf()` 同口径）。
 * 这一族只有模板与跳转两处、`sfc-check` 与 `ui-audit` 都看不见，只能在这里钉。 */
{
  const vue = codeOf(read('src/pages/app/group_buy/detail/detail.vue'));
  const textOk = /<tz-button :text="successText"/.test(vue)
    && /successText\(\)\s*\{[\s\S]{0,400}?=== 'physical'[\s\S]{0,80}?'查看订单'/.test(vue)
    && /successText\(\)\s*\{[\s\S]{0,700}?=== 'activity'[\s\S]{0,80}?'查看票券'/.test(vue);
  const navOk = /goSuccess\(\)\s*\{[\s\S]{0,400}?=== 'physical'[\s\S]{0,120}?this\.goOrder\(\)/.test(vue)
    && /goSuccess\(\)\s*\{[\s\S]{0,700}?=== 'activity'[\s\S]{0,120}?this\.goTickets\(\)/.test(vue)
    && /goTickets\(\)\s*\{[\s\S]{0,200}?'\/pages\/app\/activity\/user\/user'/.test(vue)
    && /goSuccess\(\)\s*\{[\s\S]{0,900}?this\.goGoods\(\)/.test(vue);
  ok('㉝ 拼团详情「已成团」按钮：实物写「查看订单」且去订单详情、线下活动写「查看票券」且去我的票券，'
    + '其余大类写「查看商品」/课程写「查看课程」',
    textOk && navOk,
    '文案=' + textOk + ' 跳转=' + navOk);
}

/* ---------- ㉞ 拼团的下单额外信息走商品自己的中间页（2026-10-30 用户点名） ----------
 * 用户两句：①「这里的选择上课校区呀。为什么还是使用原生的 Picker 选择弹窗呀？明明有自定义的校区选择呀，
 * 为什么不用？」②「如果说是校区课程套餐的话，那么点击拼团之后应该还是进入这个页面（确认报名页），
 * 去确认他的上课校区以及学生。」
 * 病根：2026-10-28 把「教务套餐要在下单时收校区/学生」直接内联进了结算页，校区还是一个原生 `u-picker`，
 * 而普通购买链里这两样本来就有自己的确认页（`app/school/package/confirm`，本页就有自定义校区弹窗
 * `campus-select-popup`）⇒ 同一条业务两个入口、两套选择器。
 * 口径：① 拼团区加 `host-order`（缺省 false）：不导航、把 `gbCtx()` 经 `order` 上抛；
 *      ② 教务套餐商详接 `@order`，带 `gb_*` + 规格下标/校区 **先** 进确认报名页；
 *      ③ 确认页校区走 `campus-select-popup`（自定义校区卡 + 单选），与学生一起确认完再带
 *         `gb_campus` / `gb_student` 进结算页；
 *      ④ 结算页**不再有**校区/学生选择器（原生 `u-picker` 与学生弹层都删净）；2026-10-31 起
 *         连「只读回显」也删掉（用户点名「拼团下单的提交订单应该与单独购买一样，不要显示这个
 *         校区和学生了」），只按名单校验、只把 id 交给 `team.open/join`；
 *      ⑤ 中间页之间那组 `gb_*` 键只存 `common/utils/group-buy-order.js` 一处。
 * 这一族 `sfc-check`（模板合法）与 `ui-audit`（版式合法）都看不见，只能在这里钉。 */
{
  const submitCode = codeOf(read('src/components/order/submit-order.vue'));
  const areaCode = codeOf(read(AREA));
  const pkgVueCode = codeOf(read('src/pages/app/school/package/detail/detail.vue'));
  const pkgJsCode = codeOf(read('src/pages/app/school/package/detail/js.vue'));
  const cfmVueCode = codeOf(read('src/pages/app/school/package/confirm/confirm.vue'));
  const cfmJsCode = codeOf(read('src/pages/app/school/package/confirm/js.vue'));
  const orderUtil = read('src/common/utils/group-buy-order.js');
  const hostOrderApi = /hostOrder: \{ type: Boolean, default: false \}/.test(areaCode)
    && /emits: \['go-pay', 'ready', 'pick-spec', 'order'\]/.test(areaCode)
    // 2026-10-31 起同一支出口也服务 `hostTicket`（线下活动连选票/份数一起交宿主）⇒ 判据认两枚的组合写法
    && /if \(this\.hostOrder(?: \|\| this\.hostTicket)?\) \{\s*\n\s*this\.\$emit\('order', ctx\)/.test(areaCode);
  ok('㉞1 拼团区有 `host-order` 模式：宿主带路时只上抛 `order`（拼团上下文），自己不导航',
    hostOrderApi);
  const pkgWired = /host-order/.test(pkgVueCode) && /@order="onGbOrder"/.test(pkgVueCode);
  const pkgNavigate = /onGbOrder\(ctx\)\s*\{[\s\S]{0,1800}?groupBuyConfirmUrl\(\{/.test(pkgJsCode)
    && /gb: \{[\s\S]{0,900}?gb_activity: c\.activity_id/.test(pkgJsCode)
    && /gb_goods_type: 'school_package'/.test(pkgJsCode);
  ok('㉞2 教务套餐商详：拼团下单先带 `gb_*` 与规格下标/校区进「确认报名」页（不再直进结算页）',
    pkgWired && pkgNavigate, '接线=' + pkgWired + ' 跳转=' + pkgNavigate);
  const cfmCampus = /<campus-select-popup/.test(cfmVueCode) && !/<u-picker|<u-select/.test(cfmVueCode)
    && /onCampusPicked/.test(cfmJsCode) && /this\.campusId = Number\(c\.id\) \|\| 0;/.test(cfmJsCode);
  const cfmForward = /readGroupBuyOrder\(options\)/.test(cfmJsCode)
    && /withGroupBuyOrder\(url, Object\.assign\(\{\}, this\.gb, \{[\s\S]{0,300}?gb_campus: this\.campusId,[\s\S]{0,120}?gb_student: this\.student\.id/.test(cfmJsCode);
  ok('㉞3 确认报名页：校区走自定义校区弹窗 `campus-select-popup`（与课时余额页同一只），'
    + '确认完把 `gb_campus` / `gb_student` 带回结算页',
    cfmCampus && cfmForward, '校区=' + cfmCampus + ' 回带=' + cfmForward);
  const submitClean = !/<u-picker/.test(submitCode) && !/<student-select-popup/.test(submitCode)
    && !/studentPopup/.test(submitCode) && !/campusPicker/.test(submitCode);
  const submitRead = /const preCampus = Number\(\(this\.pageParams \|\| \{\}\)\.gb_campus\) \|\| 0;/.test(submitCode)
    && /const preStudent = Number\(\(this\.pageParams \|\| \{\}\)\.gb_student\) \|\| 0;/.test(submitCode);
  // 2026-10-31 用户点名「拼团下单的提交订单应该与单独购买一样，不要显示这个校区和学生了」：
  // 结算页连**回显**都不许有（单独购买链这两样只在 goodsList.extend 里、结算页一个字不摆），
  // 拼团额外信息块因此只留给线下活动的报名信息（`kind === 'activity'`）。
  const submitTpl = (submitCode.match(/<template>([\s\S]*)<\/template>/) || ['', ''])[1];
  // 2026-10-31 起线下活动的报名信息也在它自己的「选票 → 报名信息」两页收完、随 `gb_form` 进来 ⇒
  // 结算页那一行只留给「老链接 / 历史栈没带 gb_form」的补填档（与单独购买同形：正常链一个字不摆）
  const submitNoShow = !/campusName|studentName/.test(submitCode)
    && !/(上课校区|上课学生)/.test(submitTpl)
    && /<template v-if="isGroupBuy && gbExtra\.kind === 'activity' && !gbExtra\.formUserId">/.test(submitTpl);
  ok('㉞4 结算页不再摆校区/学生选择器（原生 `u-picker` 与学生弹层都删净），'
    + '**也不再回显**（2026-10-31：与单独购买同形），只按 `gb_campus` / `gb_student` 校验名单；'
    + '线下活动的报名信息行同样只留给没带 `gb_form` 的补填档',
    submitClean && submitRead && submitNoShow,
    '清干净=' + submitClean + ' 读参=' + submitRead + ' 不显示=' + submitNoShow);
  const utilSingle = /export const GB_ORDER_KEYS = \[[\s\S]{0,400}?'gb_campus',[\s\S]{0,200}?'gb_student',/.test(orderUtil)
    && /export function groupBuyConfirmUrl\(params\)/.test(orderUtil)
    && /import \{ groupBuyConfirmUrl \} from '@\/common\/utils\/group-buy-order\.js';/.test(pkgJsCode)
    && /import \{ readGroupBuyOrder, withGroupBuyOrder \} from '@\/common\/utils\/group-buy-order\.js';/.test(cfmJsCode)
    // 两个中间页都不自己列键名（列了就是第二份会分叉的键表）
    && countOf(pkgJsCode + cfmJsCode, "'gb_activity'") === 0
    // 确认页路径也不许在页面里再写一遍（普通报名与拼团两条路都走 `groupBuyConfirmUrl()`）
    && countOf(pkgJsCode, '/pages/app/school/package/confirm/confirm') === 0;
  ok('㉞5 中间页之间那组 `gb_*` 键与确认页地址只存 `common/utils/group-buy-order.js` 一处'
    + '（两页都不自己列键名 / 不自己拼路径）',
    utilSingle);
  // 老链接 / 失效值的兜底：结算页不摆选择器，必须有一个把人带回确认页的出口（否则就是死路）
  const fallbackOk = /import \{ groupBuyConfirmUrl \} from '@\/common\/utils\/group-buy-order\.js';/.test(submitCode)
    && /goConfirmForSchool\(\)\s*\{[\s\S]{0,1400}?groupBuyConfirmUrl\(\{/.test(submitCode)
    && /confirmText: '去选择'/.test(submitCode)
    && /that\.goConfirmForSchool\(\);/.test(submitCode)
    && /this\.\$nav\.to\(url, 'local', 'redirectTo'\);/.test(submitCode);
  ok('㉞6 老链接 / 失效值兜底：结算页缺校区或学生时弹「去选择」，把人带回确认报名页补选'
    + '（`redirectTo`，栈里不留两张结算页）',
    fallbackOk);
}

/* ---------- ㉟ 线下活动拼团：价格贴标题 + 报名已截止禁用 + 先选票再填报名信息（2026-10-31） ----------
 * 用户三条原话（`/pages/app/activity/detail/detail?id=11`）：
 *   ①「活动的拼团价格应该放在标题的下面。」
 *   ②「如果报名已截止，那么立即拼团也不能点击」
 *   ③「活动拼团点击后，应该在 /pages/app/activity/ticket/ticket?id=11 中添加报名信息啊，
 *      然后再跳转到 /pages/app/activity/form/form?id=11&ticket=%7B"105"%3A1%7D 填写报名信息。我们要求过得。」
 * 口径：
 *   ① 拼团卡（第一行就是拼团价横幅）整块上移到标题卡正下方，活动时间/地点/浏览次数格顺次下移；
 *      拼团玩法与凑团仍紧跟横幅（㉔ 那条「一整块连着放」不变——动的是整块的落点，不是块内次序）；
 *   ② 底栏拼团入口与主按钮吃同一枚 `data.apply_status` 置灰（**已在团里那一档不灰**：「查看拼团详情」
 *      只是看自己的团），组件里也拦一次 `$emit('open')`；
 *      **另一条入口同批收口**（硬约束 47）：卡里「他们正在拼团」每一行的「去凑团」也是参与入口 ⇒
 *      报名已截止时整段不出，开团/参团的口子再兜一层「报名已截止」；
 *   ③ 拼团区挂 `host-ticket` + `host-order`：不弹它那只配置层，上下文经 `order` 回页 → 选票页（带 `gb_*`）
 *      → 报名信息页（原样带 `gb_*`，再补齐票种/张数/报名信息 id）→ 结算页；键名只存
 *      `common/utils/group-buy-order.js`，三页都不自己列键表。
 * `sfc-check` 只编译模板、`ui-audit` 只看版式，跨页那组键与「灰着还能不能点」都看不见，只能在这里钉。 */
{
  const actVue = codeOf(read('src/pages/app/activity/detail/detail.vue'));
  const actJs = codeOf(read('src/pages/app/activity/detail/js.vue'));
  const areaCode = codeOf(read(AREA));
  const btnCode = codeOf(read('src/components/tz/group-buy-btn.vue'));
  const ticketJs = codeOf(read('src/pages/app/activity/ticket/js.vue'));
  const formJs = codeOf(read('src/pages/app/activity/form/js.vue'));
  const submitCode2 = codeOf(read('src/components/order/submit-order.vue'));
  const orderUtil2 = read('src/common/utils/group-buy-order.js');

  // ① 拼团卡落在标题卡之后、活动信息格之前（拼团价就是它第一行）
  const afterHead = inOrder(actVue, 'class="info"', '<tz-group-buy-area')
    && inOrder(actVue, '<tz-group-buy-area', 'class="activity-info-box"');
  ok('㉟1 线下活动：拼团卡（第一行就是拼团价横幅）压在标题卡正下方、活动时间/地点格顺次下移'
    + '（2026-10-31 用户点名「活动的拼团价格应该放在标题的下面」）',
    afterHead,
    '标题卡先于拼团卡=' + inOrder(actVue, 'class="info"', '<tz-group-buy-area')
      + ' 拼团卡先于信息格=' + inOrder(actVue, '<tz-group-buy-area', 'class="activity-info-box"'));

  // ② 报名已截止 ⇒ 拼团入口同样禁用（宿主传参 + 组件拦点击），卡里「去凑团」那条路也一起收
  const disabledOk = /<tz-group-buy-btn[\s\S]{0,500}?:disabled="!data\.apply_status && !gbInTeam"/.test(actVue)
    && /disabled: \{ type: Boolean, default: false \}/.test(btnCode)
    && /if \(this\.disabled\) \{ return; \}/.test(btnCode)
    && /:disabled="disabled"/.test(btnCode);
  // 硬约束 47：底栏灰掉只是关了第一条路 —— 卡里「去凑团」那一行照样能进票券页
  const closedOk = /:closed="!data\.apply_status"/.test(actVue)
    && /closed: \{ type: Boolean, default: false \}/.test(areaCode)
    && /return !this\.closed && this\.teamsEnabled && this\.teams\.length > 0;/.test(areaCode)
    && /if \(this\.closed\) \{\s*\n\s*uni\.showToast\(\{ title: '报名已截止'/.test(areaCode)
    && /handleJoin\(payload\) \{\s*\n\s*if \(this\.closed\)/.test(areaCode)
    && /handleCreate\(payload\) \{\s*\n\s*if \(this\.closed\)/.test(areaCode);
  ok('㉟2 报名已截止：底栏拼团入口与主按钮吃同一枚 `data.apply_status` 置灰（已在团里那一档「查看拼团详情」不灰），'
    + '组件里也拦一次 `$emit(\'open\')`；卡里「他们正在拼团」整段收掉、开团/参团入口再兜一层原因句'
    + '（灰着还能点开弹层 / 从「去凑团」绕过去＝没做，硬约束 47）',
    disabledOk && closedOk, '宿主传参=' + /:disabled="!data\.apply_status && !gbInTeam"/.test(actVue)
      + ' 组件入参=' + /disabled: \{ type: Boolean, default: false \}/.test(btnCode)
      + ' 组件拦点击=' + /if \(this\.disabled\) \{ return; \}/.test(btnCode)
      + ' 另一条入口=' + closedOk);

  // ③ 一条链：详情 → 选票 → 报名信息 → 结算
  const areaMode = /hostTicket: \{ type: Boolean, default: false \}/.test(areaCode)
    // 非阶梯：直接交上下文（票种/份数都由宿主页面收，本区不弹配置层）
    && /if \(this\.hostTicket && !this\.isLadder\) \{\s*\n\s*this\.goBuy\(this\.gbCtx\(\)\);/.test(areaCode)
    // 参团：整条链走宿主的选票页（团上那一档人数由 gbCtx 带上）
    && /if \(this\.hostTicket\) \{\s*\n\s*this\.goBuy\(this\.gbCtx\(\{ team_id: this\.joinTeam \}\)\);/.test(areaCode)
    && /if \(this\.hostOrder \|\| this\.hostTicket\) \{/.test(areaCode)
    // 阶梯型仍开那只配置层，但只问人数档（规格/份数两节收起 —— 那两样在宿主的选票页里选）
    && /:hide-spec="\(hostSpec \|\| hostTicket\) && !joinMode"/.test(areaCode);
  const actWired = /host-ticket host-order/.test(actVue) && /@order="gbOrder"/.test(actVue)
    && /gbOrder\(ctx\)\s*\{[\s\S]{0,900}?withGroupBuyOrder\('\/pages\/app\/activity\/ticket\/ticket\?id='/.test(actJs)
    // 票种/张数由选票页选 ⇒ 详情这一跳不许把 gb_spec / gb_count 带下去（两个来源就是分叉）
    && !/gbOrder\(ctx\)[\s\S]{0,900}?gb_spec/.test(actJs)
    && !/gbOrder\(ctx\)[\s\S]{0,900}?gb_count/.test(actJs);
  ok('㉟3 线下活动拼团改走「详情 → 选票页 → 报名信息页 → 结算」：拼团区 `host-ticket` 不弹配置层、'
    + '上下文经 `@order` 回页再带进选票页（票种/张数不在详情这一跳预先带）',
    areaMode && actWired, '组件=' + areaMode + ' 宿主=' + actWired);

  const ticketHop = /readGroupBuyOrder\(that\.pageParams\)/.test(ticketJs)
    && /withGroupBuyOrder\([\s\S]{0,300}?ticket=' \+ JSON\.stringify\(this\.ticketSelected\)/.test(ticketJs)
    && /拼团一次只能选择一种票券/.test(ticketJs)
    // 身份核的是 `gb_goods_id`（活动 9）不是 `gb_activity`（拼团活动 12388）：两者不是同一个 id
    && /Number\(gbIn\.gb_goods_id\) \|\| 0/.test(ticketJs)
    && !/Number\(gbIn\.gb_activity\) === Number\(that\.pageParams\.id\)/.test(ticketJs);
  const formHop = /readGroupBuyOrder\(that\.pageParams\)/.test(formJs)
    && /Number\(gbIn\.gb_goods_id\) \|\| 0/.test(formJs)
    && !/Number\(gbIn\.gb_activity\) === Number\(that\.pageParams\.id\)/.test(formJs)
    && /gb_spec: Number\(firstTicket\.id\) \|\| 0/.test(formJs)
    && /gb_spec_set: 1/.test(formJs)
    && /gb_count: Number\(firstTicket\.number\) > 1/.test(formJs)
    && /gb_form: Number\(res\.data\[0\]\) \|\| ''/.test(formJs)
    && /withGroupBuyOrder\(url, Object\.assign\(\{\}, that\.gbOrder, \{/.test(formJs)
    // 后端只收一枚 form_user_id：「每张票券需单独报名」的活动拼团一次只能买 1 张，超出就地明说
    && /拼团一次只能购买 1 张/.test(formJs);
  ok('㉟4 选票页与报名信息页只搬运那组 `gb_*`：选票页拦住多票种（后端 `team.open/join` 只认一枚 spec_id）、'
    + '报名信息页补齐票种/张数/报名信息 id 再进结算页',
    ticketHop && formHop, '选票=' + ticketHop + ' 报名=' + formHop);

  const submitRead2 = /const preForm = Number\(\(this\.pageParams \|\| \{\}\)\.gb_form\) \|\| 0;/.test(submitCode2)
    && /this\.gbExtra\.formUserId = preForm;/.test(submitCode2);
  const utilKey = /'gb_student',\s*\n\s*'gb_form',/.test(orderUtil2);
  ok('㉟5 结算页只读 `gb_form` 当报名信息 id（不再弹那张表单层）；`gb_form` 登记在 `GB_ORDER_KEYS` 唯一一份键表里',
    submitRead2 && utilKey, '结算=' + submitRead2 + ' 键表=' + utilKey);
}

/* ---------- ㊱ 线下活动「选票页」：拼团价适配 + 骨架屏加载（2026-10-31 同日第二轮） ----------
 * 用户两条原话（路由 `/pages/app/activity/ticket/ticket?id=9&gb_activity=12388&gb_goods_type=activity&gb_goods_id=9`）：
 *   ①「价格并未适配拼团」
 *   ②「改为骨架屏加载」
 * 口径：
 *   ① 拼团那一趟（URL 带 `gb_activity`）票种单价取**拼团活动**那一份（`group_buy.activity.detail`
 *      的 `specs[].price`；阶梯型按 URL 上 `gb_ladder` 取 `ladder[].price`，缺省第一档，
 *      与拼团区 `initPick()` 同口径），划线原价取活动快照 `specs[].origin_price`；合计与卡片同源。
 *      普通报名链不发这一条、逐字不变；
 *   ② 加载态一律骨架屏：外壳走真实 `.ticket-item`、灰块 `#e5e6eb` 只替会变的那几格，
 *      底栏与空态在取数落地前不摆；**三路取数（详情 / 票券 / 拼团活动）各自落地才算完**，
 *      只按最后回来的那一路收口会把拼团价先闪成原价（硬约束 22）。
 * `sfc-check` 只编译模板、`ui-audit` 只看版式，价格来源与「骨架什么时候撤」都看不见，只能在这里钉。
 *
 * 同日第三轮（用户点名报名信息页 `/pages/app/activity/form/form?id=9&ticket=…&gb_activity=…`
 * 「这个也没有适配啊」+「拼团的提交页面：选择票券、填写表单，都要对拼团进行主题色调整」）：
 *   ③ 报名信息页的票券行金额与合计同读 `ticketUnitPrice`（价仍只从拼团活动取），张数/合计改 computed；
 *   ④ 两页在拼团那一趟换拼团业务色（主按钮红橙渐变、价格 `#cf350e`），色值只存
 *      `common/utils/group-buy-theme.js` 一处；报名信息弹层确认条经 `form-modal.theme` 同档。 */
{
  const tkVue = codeOf(read('src/pages/app/activity/ticket/ticket.vue'));
  const tkJs = codeOf(read('src/pages/app/activity/ticket/js.vue'));
  const tkCss = read('src/pages/app/activity/ticket/css.css');
  const fmJs = codeOf(read('src/pages/app/activity/form/js.vue'));
  const fmVue = codeOf(read('src/pages/app/activity/form/form.vue'));
  // 「票种 → 拼团价」的映射只存一份 util（两张中间页同读）：旧规格 id 认回、阶梯档、活动快照原价
  const priceUtil = read('src/common/utils/group-buy-ticket-price.js');
  const priceUtilOk = /export function gbTicketPrice\(activity, item, ladderId\)/.test(priceUtil)
    && /Number\(r\.legacy_spec_id\) === id/.test(priceUtil)
    && /Number\(ladderId\) \|\| 0/.test(priceUtil)
    && /hit\.origin_price/.test(priceUtil)
    && /import \{ gbTicketPrice \} from '@\/common\/utils\/group-buy-ticket-price\.js';/.test(tkJs)
    && /import \{ gbTicketPrice \} from '@\/common\/utils\/group-buy-ticket-price\.js';/.test(fmJs)
    // 页面里不许再自己映射一份（列旧 id / 取档位 / 读 origin_price 都只该在 util 那一份）
    && !/legacy_spec_id/.test(tkJs + fmJs)
    && !/origin_price/.test(tkJs + fmJs);

  const gbSource = /that\.\$api\('group_buy\.activity\.detail', \{ goods_type: goodsType, goods_id: goodsId \}\)/.test(tkJs)
    && priceUtilOk;
  const gbShown = /<span class="ticket-price-value">\{\{ ticketUnitText\(item\) \}\}<\/span>/.test(tkVue)
    && /v-if="ticketOrigin\(item\) && !isVirtualPay\(detail\)"/.test(tkVue)
    && /price \+= this\.ticketUnitPrice\(this\.ticketList\[j\]\) \* this\.ticketSelected\[i\]/.test(tkJs);
  ok('㊱1 选票页拼团价适配：票种单价与合计都吃 `group_buy.activity.detail` 的拼团价（阶梯型按 URL 那一档）、'
    + '划线原价取活动快照 `origin_price`，映射只存 `group-buy-ticket-price.js` 一份；普通报名链逐字不变',
    gbSource && gbShown, '取价=' + gbSource + ' 映射=' + priceUtilOk + ' 展示=' + gbShown);

  const skGate = /loading\(\) \{\s*\n\s*return !\(this\.detailLoaded && this\.ticketLoaded && this\.gbLoaded\);/.test(tkJs)
    && countOf(tkJs, 'that.detailLoaded = true;') >= 2
    && countOf(tkJs, 'that.ticketLoaded = true;') >= 2
    && /that\.gbLoaded = true;/.test(tkJs);
  const skTpl = !/u-loading-page/.test(tkVue)
    && /<view class="ticker-list" v-if="loading">/.test(tkVue)
    && /class="ticket-item" v-for="n in 3"/.test(tkVue)
    && /class="tk-sk tk-sk-name"/.test(tkVue)
    && /<template v-else>/.test(tkVue)
    // 底栏在骨架期间整条不摆（合计 0.00 会被读成这一单是 0 元）
    && tkVue.indexOf('control-box h5-bottom-bar') > tkVue.indexOf('<template v-else>');
  const skCss = /\.tk-sk\{[\s\S]{0,80}?background: #e5e6eb;/.test(tkCss);
  ok('㊱2 选票页加载态是骨架屏：外壳走真实 `.ticket-item`、灰块 `#e5e6eb` 只替会变的那几格，'
    + '底栏/空态在落地前不摆；三路取数（详情 / 票券 / 拼团活动）各自落地才撤骨架（成功与失败两档都收口）',
    skGate && skTpl && skCss, '收口=' + skGate + ' 模板=' + skTpl + ' 灰块=' + skCss);

  // ㊱3（同日第三轮，用户点名报名信息页 `form?id=9&ticket=…&gb_activity=…`「这个也没有适配啊」）：
  // 行金额与合计同读 `ticketUnitPrice`，价只从拼团活动取；张数与合计改 computed（价晚到手也能重算）
  const fmSource = /that\.\$api\('group_buy\.activity\.detail', \{ goods_type: goodsType, goods_id: goodsId \}\)/.test(fmJs)
    && /Number\(res\.data\.activity_id\) === Number\(that\.gbOrder\.gb_activity\)/.test(fmJs)
    && /return !\(this\.detailLoaded && this\.ticketLoaded && this\.formLoaded && this\.gbLoaded\);/.test(fmJs)
    && /totalPrice\(\) \{[\s\S]{0,300}?this\.ticketUnitPrice\(item\) \* \(Number\(item\.number\) \|\| 0\)/.test(fmJs);
  const fmShown = /\(ticketUnitPrice\(item\) \* item\.number\)\.toFixed\(2\)/.test(fmVue)
    && /totalPrice\.toFixed\(2\)/.test(fmVue)
    && !/total\.price/.test(fmVue)
    && !/item\.price \* item\.number/.test(fmVue);
  ok('㊱3 报名信息页拼团价适配：票券行金额与合计都吃 `ticketUnitPrice`（拼团活动那一家），'
    + '张数/合计改 computed、整条链四路取数都在骨架判据里',
    fmSource && fmShown, '取价=' + fmSource + ' 展示=' + fmShown);

  // ㊱4（同日第三轮，用户点名「选择票券、填写表单，都要对拼团进行主题色调整」）：
  // 两页在拼团那一趟换业务色：主按钮红橙渐变、价格业务红；色值只存 `group-buy-theme.js` 一处；
  // 报名信息弹层的确认条同档（`form-modal` 把 `theme` 透传给 `tz-bottom-btn` 的 `type == ''` 条）
  const themeUtil = read('src/common/utils/group-buy-theme.js');
  const btnCode = codeOf(read('src/components/tz/bottom-btn.vue'));
  const fmodal = codeOf(read('src/components/tz/form-modal.vue'));
  const themeOk = /export const GB_GRADIENT = 'linear-gradient\(90deg, #ff4b2b 0%, #ff8f2b 100%\)';/.test(themeUtil)
    && /export const GB_TEXT = '#cf350e';/.test(themeUtil)
    && /import \{ GB_GRADIENT, GB_TEXT \} from '@\/common\/utils\/group-buy-theme\.js';/.test(tkJs)
    && /import \{ GB_GRADIENT, GB_TEXT \} from '@\/common\/utils\/group-buy-theme\.js';/.test(fmJs)
    // 两页的按钮/价格都经 computed 下发、模板不写死色值（模板读不到 import）
    && /return this\.gbPicking \? GB_GRADIENT : '';/.test(tkJs)
    && /return this\.gbPicking \? \{ color: GB_TEXT \} : \{\};/.test(tkJs)
    && /return this\.gbPicking \? GB_GRADIENT : '';/.test(fmJs)
    && /return this\.gbPicking \? \{ color: GB_TEXT \} : \{\};/.test(fmJs)
    && /:color="gbBtnColor"/.test(tkVue) && /:style="gbPriceStyle"/.test(tkVue)
    && /:color="gbBtnColor"/.test(fmVue) && /:style="gbPriceStyle"/.test(fmVue)
    && /:color="gbPlainColor"/.test(fmVue)
    && /:theme="gbPicking \? 'group-buy' : ''"/.test(fmVue)
    && /theme: \{[\s\S]{0,80}?type: String,\s*\n\s*default: ''/.test(fmodal)
    && /<tz-bottom-btn @handle="submit" btnTitle="确定" :theme="theme"\/>/.test(fmodal)
    && /\{ 'tbb-bar--gb': theme == 'group-buy' \}\]" v-if="type == ''"/.test(btnCode)
    // 两页不许再写一份渐变字面量（只存 util 一处）
    && !/linear-gradient\(90deg, #ff4b2b/.test(tkVue + tkJs + fmVue + fmJs);
  ok('㊱4 拼团提交链主题色：选票页/报名信息页的按钮换红橙渐变、价格换业务红，'
    + '报名信息弹层确认条同档（`form-modal.theme` → `tz-bottom-btn`）；色值只存 `common/utils/group-buy-theme.js` 一处',
    themeOk);

  /* ---------- ㊲ 规格弹层头区封面：空地址也落默认图，且不许再用 `cover === null` 当「不摆这一格」 ----------
   * 2026-10-31 用户实报（微信小程序）：「这个页面点击多规格弹窗之后，那么弹窗左上角的商品图片并没有
   * 加载出来，并且也没有默认填充的内容，只显示灰色的背景。」
   * 病根两层：① 圈子那只把 `:cover="null"` 当「不摆封面」（M80 当初的写法），而**小程序端经组件属性
   * 通道进来的 `null` 已经不是 `null`** ⇒ `<image v-if="cover !== null">` 恒真，这一格照画；② `coverSrc`
   * 对空地址返回空串，而 `<image src="">` **不会触发 `@error`** ⇒ 默认图那一档的兜底根本不执行。
   * 两条叠起来 = 一块 90px 的 `.sps-cover`（底色 #F7F8FA）+ 空 src：用户读到的正是「图片没加载、
   * 也没有默认填充、只有灰底」。口径：**这一格恒在**（四只弹层同一档视觉，M80），`coverSrc` 空地址
   * 与取图失败都落 `coverFallback`（M65 的全站默认商品图），圈子由宿主把 `info.cover` 传进来。 */
  const circlePopupSrc = read('src/components/tz/circle-spec-popup.vue');
  const presaleSrc = read('src/pages/app/circle/presale/presale.vue');
  const coverFallbackOk = !/v-if="cover !== null"/.test(shellSrc)
    && /<image class="sps-cover"[^>]*:src="coverSrc"/.test(shellSrc)
    && /if \(!this\.cover\) \{ return this\.coverFallback; \}/.test(shellSrc)
    && /cover: \{ type: String, default: '' \}/.test(shellSrc)
    && /:cover="cover"/.test(circlePopupSrc)
    && /cover: \{ type: String, default: '' \}/.test(circlePopupSrc)
    && /:cover="\(info && info\.cover\) \|\| ''"/.test(presaleSrc);
  ok('㊲ 四只规格弹层头区封面恒摆一格，**空地址 / 取图失败都落默认商品图**（`coverFallback`）；'
    + '圈子那只不再用 `cover=null` 表示「不摆封面」（小程序端 null 过属性通道已不是 null ⇒ 渲染出灰底空图），'
    + '改由宿主传 `info.cover`（2026-10-31 用户实报「商品图片没加载、也没有默认填充、只有灰色背景」）',
    coverFallbackOk,
    '壳=' + (/v-if="cover !== null"/.test(shellSrc) ? '仍在用 null 判显隐' : 'OK')
      + ' / 空地址回落=' + (/if \(!this\.cover\) \{ return this\.coverFallback; \}/.test(shellSrc) ? 'YES' : 'NO')
      + ' / 圈子传封面=' + (/:cover="cover"/.test(circlePopupSrc) ? 'YES' : 'NO'));
}

let fail = 0;
results.forEach((r) => {
  if (!r.pass) fail++;
  console.log((r.pass ? '[PASS] ' : '[FAIL] ') + r.name + (r.note ? ' — ' + r.note : ''));
});
console.log('\n共 ' + results.length + ' 条，失败 ' + fail + ' 条');

if (process.argv.indexOf('--can-be-red') > -1) {
  const NEG = [
    [IDX, '<tz-tabs', '<u-tabs'],
    [IDX, '$api(', '$api.post('],
    [IDX, "pluginState('group_buy')", "pluginState('group_buy_zz')"],
    [DET, "pluginState('group_buy')", "pluginState('group_buy_zz')"],
    // ㉗ 的两颗样件：把倒计时方块改回平台主色蓝／摘掉一枚按钮的业务主题档
    [DET, '    background: #cf350e;', '    background: #0968f6;'],
    [DET, '<tz-button text="立即加入" type="primary" theme="group-buy"', '<tz-button text="立即加入" type="primary"'],
    // 9.9 的两颗样件：模板改回端上自拼的那一枚 computed → 红；把句子搬回页面 → 也红
    [DET, '{{ detail.fail_text }}', '{{ failText }}'],
    // 9.9 的样件（2026-10-29 换锚点：`countdownText()` 已随 2026-10-27 重排删掉，旧锚点一直 SKIP ⇒
    // 改为插在 `countdownParts()` 之前，仍能验「端上自己拼那句失败说明」会红）
    [DET, '        countdownParts() {', "        failText() {\n            return '本团未成团，参团金额已原路退回。';\n        },\n        countdownParts() {"],
    // 样件的替身串**不许含被搜的那一截**（`我的拼团zz` 里仍然有 `我的拼团`、`gbAreaZz` 里仍然有 `gbArea`，
    // 这种反例永远恒绿 —— 是样件写错，不是判据虚）
    [USER, '我的拼团', '拼团中心'],
    ['src/pages/course/detail/detail.vue', '<tz-group-buy-area', '<tz-group-buy-zz'],
    [PHYS, '<tz-group-buy-area', '<tz-group-buy-zz'],
    [COURSE, 'gbArea', 'teamAreaRef'],
    [LANG, '"source.group_buy"', '"source.group_buy_zz"'],
    [PAGES, 'group_buy/index/index', 'group_buy/index/zz'],
    // 17.4 的样件：预取 prop 的缺省值退回 `undefined` —— 小程序把「宿主没传」落成 null，
    // 与「后端明确没有活动」撞成一档 ⇒ 练习/打卡等八个不传 preload 的宿主首屏不再发 activity/detail
    [AREA, 'preload: { type: Object, default: () => ({}) }', 'preload: { type: Object, default: undefined }'],
    ['src/components/modal/share-modal.vue', ':show-recommend="showRecommend"', ':show-recommend2="showRecommend"'],
    ['src/components/modal/share-modal.vue', ':show-link="!!article.link || articleLoading"', ':show-link2="!!article.link || articleLoading"'],
    [DET, '<share-modal', '<share-modalZz'],
    [DET, 'type="team"', 'type="course"'],
    [DET, ':val="teamId"', ':val="teamZz"'],
    [DET, 'inviteFriend()', 'inviteFriendZz()'],
    // ⑩ 组五颗样件：摘掉列表页页脚 / 摘掉详情页页脚 / 关掉详情页的下拉开关 / 换掉下拉那一条链 / 把收条搬回成功那一支
    [IDX, '<tz-footer />', ''],
    [DET, '<tz-tab-bar />', ''],
    [PAGES, '"navigationBarTitleText": "拼团详情",\n\t\t\t\t\t\t"h5": { "titleNView": false },\n\t\t\t\t\t\t"enablePullDownRefresh": true,', '"navigationBarTitleText": "拼团详情",\n\t\t\t\t\t\t"h5": { "titleNView": false },'],
    [DET, 'onPullDownRefresh()', 'onPullDownZz()'],
    [DET, '                    uni.stopPullDownRefresh();\n                });', '                });'],
    // 6.1/6.2 的样件：把「生成分享海报」文字链塞回动作区 ⇒ 「撤净」那两条同时红
    [DET, '<view class="gbd-actions"', '<view class="gbd-poster-link" @click="openPoster"><text>生成分享海报</text></view>\n            <view class="gbd-actions"'],
    // 6.2b 的样件已随分享弹窗改成公共组件：改 `:val` 那颗在上面的 6.1 组里（`:val="teamId"` → `teamZz`）
    // ⑥b 组四件各配一颗样件：「立即加入」档 / 跳商品页的团参数 / 还差行 / 商品卡置顶
    [DET, '@click="joinNow"', '@click="joinNowZz"'],
    [DET, 'gb_team: Number(this.teamId),', 'gbzz: Number(this.teamId),'],
    [DET, '{{ needNum }}', '{{ needNumZz }}'],
    [DET, 'Number(this.detail.expire_time) * 1000 - this.now', 'Number(this.detail.expire_time) - this.now'],
    // 6.2c 的样件：倒计时退回分钟粒度与 30 秒一跳
    [DET, 'setTimeout(tick, 1000)', 'setTimeout(tick, 30000)'],
    // 6.9 的样件：把「出不出倒计时」改回端上自己比到期时刻 → 同源判据与「端上不重判」两头同时红
    [DET, 'showCountdown() { return this.detail.status === 0 && Number(this.detail.expire_time) > 0; }', 'showCountdown() { return Number(this.detail.expire_time) <= Date.now(); }'],
    // ⑥c 组：成员列表形态（副行函数改坏 = 不再是那条列表行的组装）
    // 6.8 的样件（2026-10-29 改写：旧版钉 `memberSub` 那条已随重排删净 ⇒ 换成「团长小标那一枚被改名」）
    [DET, 'class="gbd-leader-tag"', 'class="gbd-leaderZz"'],
    // 13.2 的样件：失败档那条缺口句的判据改坏 ⇒ 两档只剩一档
    // ⑧ 组：订单详情拼团块的落位（title 改坏 = 行没了；marginTop 拿掉 = 不再「单独一块/上下边距」）
    ['src/pages/order/detail/detail.vue', 'title="拼团状态"', 'title="拼团状态Zz"'],
    ['src/pages/order/detail/detail.vue', '<tz-box v-if="data.group_buy && data.group_buy.label" :marginTop="10" round>', '<tz-box v-if="data.group_buy && data.group_buy.label" round>'],
    // ⑧ 组第三颗（2026-10-29）：把拼团标塞回列表卡状态那一行 ⇒ 8.1 红（正是用户点名之前的那一版）
    ['src/components/order/order.vue',
      "                    {{ statusText || $t('status.'+ status) }}",
      '                    <text class="order-gb-tag" v-if="groupBuy && groupBuy.label">{{ groupBuy.label }}</text>\n                    {{ statusText || $t(\'status.\'+ status) }}'],
    // 替身串不许含被搜的那一截（`gbd-goodsZz` 里仍有 `gbd-goods` ⇒ 那条反例永远恒绿）
    [DET, 'gbd-goods', 'zzGoodsBox'],
    [IDX, ':list="courseCard(row)"', ':id="1"'],
    // ⑦ 组（2026-10-18 商品卡统一到紧凑档）四件各配一颗样件：换回大档 / 圆角整批拿掉 / 骨架与真卡间距两档 / 紧凑档没有无封面占位
    [DET, '<tz-course-mini v-else-if', '<tz-course v-else-if'],
    [IDX, ':round="true" :border="false"', ':border="false"'],
    [DET, ':margin="0" :round="true"', ':round="true"'],
    ['src/components/tz/course-mini.vue', '<div class="placeholder" v-else>', '<div class="placeholder" v-if="0">'],
    ['src/components/tz/course-mini.vue', 'background: #F2F3F5;', 'background: #FFFFFF;'],
    // 7.5 的三颗样件：① 详情页把实物那枚换回实物卡（= 2026-10-29 团 6536 用户报的那一版）；
    // ② 列表页把「按 goods_type 分支出卡」接回来；③ 详情页把那枚 computed 接回来 —— 7.5 各自报红
    [DET, '<tz-course-mini v-else-if="detail.activity"', '<tz-physical-goods v-else-if="detail.activity && isPhysical"'],
    [IDX, '<tz-course-mini :list="courseCard(row)"', '<tz-course-mini v-if="row.goods_type !== \'physical\'" :list="courseCard(row)"'],
    [DET, '        firstFrame() {', "        isPhysical() {\n            return String(((this.detail.activity || {}).goods_type) || '') === 'physical';\n        },\n        firstFrame() {"],
    [APIS, "url: 'app/group_buy/team/open'", "url: 'app/group_buy/team/zz'"],
    [APIS, "url: 'app/group_buy/team/join'", "url: 'app/group_buy/team/join'\n\t\t\tjoin2: {\n\t\t\t\turl: 'app/group_buy/team/join',\n\t\t\t},"],
    // ⑨ 组那三件（六档落地页）各配一颗样件：挂载、goods-type 那一档、onShow 兑账那一环、死属性
    ['src/pages/app/composite/detail/detail.vue', '<tz-group-buy-area', '<tz-group-buy-zz'],
    ['src/pages/app/circle/presale/presale.vue', '<tz-group-buy-area', '<tz-group-buy-zz'],
    ['src/pages/app/checkin/intro/intro.vue', '<tz-group-buy-area', '<tz-group-buy-zz'],
    ['src/pages/app/exam/detail/detail.vue', '<tz-group-buy-area', '<tz-group-buy-zz'],
    // 样件一律带上 `ref="gbArea"` 前缀：练习页上半行还有一枚优惠券条也写着 goods-type="exercises"，
    // 只写 goods-type 那一截会先命中它、把反例配到一枚没人判的属性上（假绿）
    ['src/pages/app/composite/detail/detail.vue', 'ref="gbArea" goods-type="composite"', 'ref="gbArea" goods-type="goods"'],
    ['src/pages/app/circle/presale/presale.vue', 'ref="gbArea" goods-type="circle"', 'ref="gbArea" goods-type="checkin"'],
    ['src/pages/app/checkin/intro/intro.vue', 'ref="gbArea" goods-type="checkin"', 'ref="gbArea" goods-type="course"'],
    ['src/pages/app/exam/detail/detail.vue', 'ref="gbArea" goods-type="exercises"', 'ref="gbArea" goods-type="checkin"'],
    ['src/pages/app/composite/detail/js.vue', "if (!that.gbPending) { return; }\n    that.gbPending = false;\n    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }", "if (!that.gbPending) { return; }"],
    ['src/pages/app/circle/presale/js.vue', "if (!that.gbPending) { return; }\n    that.gbPending = false;\n    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }", "if (!that.gbPending) { return; }"],
    ['src/pages/app/exam/detail/js.vue', "if (!that.gbPending) { return; }\n    that.gbPending = false;\n    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }", "if (!that.gbPending) { return; }"],
    [PHYSJS, "if (!that.gbPending) { return; }\n    that.gbPending = false;\n    if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }", "if (!that.gbPending) { return; }"],
    ['src/pages/app/checkin/intro/js.vue', "that.gbPending = false;\n      if (that.$refs.gbArea) { that.$refs.gbArea.reload(); }", "that.gbPending = false;"],
    [PHYS, 'ref="gbArea" goods-type="physical"', 'ref="gbArea" :order-goods-id="goodsId" goods-type="physical"'],
    // 期望表自己也能红：把它改坏一档 → 9.7 与那一页的 9.1 同时报红（这张表是唯一一份名单，改这里 = 改口径）
    ['scripts/check-group-buy-detail.js', "{ type: 'exercises', id: 'data.id', via: 'onShow',", "{ type: 'exam', id: 'data.id', via: 'onShow',"],
    // ⑪ 组五件各配一颗样件：状态词不再吃后端 / 头像读点没了 / 倒计时退回秒毫秒直减 /
    // 原价划线字段改名 / 骨架订单块没了
    [IDX, '{{ teamLabel(row) }}', "{{ row.team_label || '拼团中' }}"],
    [IDX, 'memberAvatars(row)', '[]'],
    [IDX, 'joined_num', 'joinedNumZz'],
    [IDX, 'end * 1000 - this.now', 'end - this.now'],
    [IDX, 'price_marking:', 'priceMarkingZz:'],
    [IDX, 'gbl-sk-order', 'gblSkOrderZz'],
    // ⑫ 组四件各配一颗样件：商品卡段落改名（先后判据失配）/ 把「我的订单：」加回去 /
    // 结果态图标不再按状态取 / 进度条百分比写死
    [IDX, 'class="gbl-goods"', 'class="gbl-goodsZz"'],
    [IDX, '{{ row.status_label }}', '我的订单：{{ row.status_label }}'],
    [IDX, 'v-if="showOrderTag(row)"', ''],
    [DET, ':src="resultIcon"', ':src="\'\'"'],
    [DET, 'detail.status === 2 && gapNum > 0', 'detail.status === 3 && gapNum > 0'],
    // ⑬ 组：进度口径不再读 TeamProgress（详情自己数一份 → 13.3 红）
    ['../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/TeamPage.php',
      'TeamProgress::joinedOnly(', 'TeamProgressZz::joinedOnly('],
    // 13.4：虚拟人数那两枚格子撤掉（模板不再摆 → 13.4 红；2026-10-28 团 4933 那一轮）
    [DET, 'v-for="n in virtualSlots"', 'v-for="n in virtualSlotsZz"'],
    // 9.10~9.13（2026-10-27）：预热态判据 / 弹幕模板 / 后端预热取数各一颗
    [AREA, "activity.state === 'not_start'", "activity.state === 'running'"],
    [DANMU, 'class="gba-danmu"', 'class="gba-danmuZz"'],
    // 9.15 的样件：封面那一枚撤掉（落点回到拼团区原位）必须报红
    [COURSE_VUE, '<tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />', ''],
    ['../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/GoodsArea.php',
      'upcomingPreheatOf', 'upcomingZz'],
    // 9.14 的样件（2026-10-29）：标题退回模板里写死的「多人拼团」（= 用户报的那一版，三种类型读出来一样）
    [BANNER, '<text class="gba-side-title">{{ typeTitle }}</text>', '<text class="gba-side-title">多人拼团</text>'],
    // ⑯ 组四件：多一件「单规格课程不弹选择层」——把 openPopup 里的跳过支删掉必须报红
    [AREA, "            if (!this.needsConfig) {\n                this.goBuy({ activity_id: this.activity ? this.activity.activity_id : 0 });\n                return;\n            }\n", ""],
    // ⑯ 组三件：弹窗自己导航（16.1 红）/ 「起」恒加（16.3 红）/ 份数不进 OrderBridge（16.7 红）
    [CONFIG, "this.$emit('confirm', payload);", "this.$nav.to('/pages/order/submit/submit'); this.$emit('confirm', payload);"],
    ['src/common/utils/group-buy-spec.js', "min === max ? '' : '起'", "'起'"],
    ['../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/OrderBridge.php',
      "'count'     => max(1, min(99, intval(isset($ctx['count']) ? $ctx['count'] : 1))),", "'count'     => 1,"],
    // ⑮ 组四件：页面选择块不受控（15.1 红）/ 显隐退回「多档就出」（15.1 红，正是 2026-10-29 用户报的那一版）/
    // 规格卡片又塞回页面（15.2 红）/ 档位价端上另算（15.3 红）/ 宿主又自带 gb-btn（15.6 红）
    [AREA, 'v-if="showPicker"', 'v-if="true"'],
    // 15.1（2026-10-29 第二轮）：显隐退回「多档就出」/ 把 `specInline` 那一档漏掉 ⇒ 红
    [AREA, 'return this.isLadder && (!this.hasSpec || this.specInline);', 'return this.specRows.length > 1 || this.isLadder;'],
    [AREA, '<view class="gba-tiers" v-if="tiers.length">', '<view class="gba-spec-card"></view><view class="gba-tiers" v-if="tiers.length">'],
    [AREA, 'money(row.price)', 'row.price'],
    [PHYS, '<tz-group-buy-btn v-if="gbEntry"', '<button class="buy-btn gb-btn" v-if="gbEntry"'],
    // ⑮ 组四件（2026-10-29 在线凑团段三轮）：显隐退回「只要开关就摆」（15.9 红，正是「没有可参与的团
    // 也摆一段」那一版）/ 显隐不再判 `!myTeam`、在团里照样摆（15.9 红，圈子 3168 那一轮）/
    // 取数闸门改读 `showTeams`（15.9 红，取数前 teams 恒空 ⇒ 判据自锁、列表永远取不到）/
    // 空态又长回段内（15.10 红，用户第三次点名要删掉的那一句）
    [AREA, 'return !this.closed && this.teamsEnabled && this.teams.length > 0;', 'return this.teamsEnabled;'],
    [AREA, 'return Number(this.activity.show_teams) === 1 && !this.myTeam;',
      'return Number(this.activity.show_teams) === 1;'],
    [AREA, 'if (this.teamsEnabled) {', 'if (this.showTeams) {'],
    [AREA, '<view class="gba-teams-more" v-if="teamsTotal > inlineTeams.length"',
      '<view class="gba-teams-empty" v-if="!teams.length">还没有人开团，你来开第一团</view>\n                <view class="gba-teams-more" v-if="teamsTotal > inlineTeams.length"'],
    // ⑭ 组三件各配一颗样件：H5 标题前半句丢掉（「还差 N 人成团」没了 → 14.1 红）/
    // H5 描述又写回空串（→ 14.1 与 14.6 红）/ 小程序改回长标题（→ 14.2 与 14.6 红）
    [SHARE_MOD, "return s === 0 && need > 0 ? '还差' + need + '人成团！' : '';", "return s === 0 && need > 0 ? '差' + need + '人成团！' : '';"],
    [DET, 'this.$nav.share(this.shareTitle, this.shareDesc, this.shareCover);', "this.$nav.share(this.shareTitle, '', this.shareCover);"],
    [DET, 'this.$nav.share(this.shareMpTitle,', 'this.$nav.share(this.shareTitle,'],
    // ⑰ 组四件各配一颗样件：页面不再传预取（17.3 红）/ 预取里又发了一发活动请求（17.4 红）/
    // 后端不给这个键（17.1 红）/ 预取类不再短路已订阅（17.2 红）
    ['src/pages/course/detail/detail.vue', ':preload="data.group_buy"', ''],
    [AREA, 'applyPreload(area) {\n            this.activity = area;',
      "applyPreload(area) {\n            this.$api('group_buy.activity.detail', {});\n            this.activity = area;"],
    ['../tuzhi-selfbuilt-backend/application/api/controller/course/Course.php',
      'if ($groupBuy !== false) {', 'if (false) {'],
    ['../tuzhi-selfbuilt-backend/application/common/library/app/course/DetailGroupBuy.php',
      'if ($subscribed) {', 'if (false) {'],
    // ⑱ 组三件各配一颗样件：拼团入口退回「只在未加入那支挂」（18.1 红，正是用户报的那一版）/
    // 续费不再判 inTeam（18.2 红）/ `gbInTeam` 恒 false（18.2 红，等于判据写了假值）
    ['src/pages/app/circle/presale/presale.vue',
      '<view class="footer-btn-group" v-if="joinStatus == \'joined\'">\n            <tz-group-buy-btn v-if="gbEntry" class="presale-gb-slot" height="44" :text="gbEntry ? gbEntry.text : \'\'" :price="gbEntry ? gbEntry.price_text : \'\'" @open="openGb" />',
      '<view class="footer-btn-group" v-if="joinStatus == \'joined\'">'],
    ['src/pages/app/circle/presale/presale.vue',
      'v-if="info.sell_type == 2 && !gbInTeam && !gbJoinMode"', 'v-if="info.sell_type == 2"'],
    ['src/pages/app/circle/presale/js.vue',
      'this.gbInTeam = !!(entry && entry.inTeam);', 'this.gbInTeam = false;'],
    // ⑯ 组两件（2026-10-29 单档规格那一颗）：显隐退回「只有多档才摆」（16.4 / 16.9 红）/
    // `hasSpec` 只看档数、不认单档的名字（16.9 红）
    // 规格那一节 2026-10-29 起是 `v-else-if`（多属性那一形 `v-if="isGrouped"` 在前）：样件跟着改前缀，
    // 否则整颗样件落不下去（SKIP）＝「显隐退回只有多档才摆」这条反例等于不存在
    ['src/components/tz/group-buy-config-popup.vue', 'v-else-if="!hideSpec && hasSpec"', 'v-else-if="specs.length > 1"'],
    ['src/components/tz/group-buy-config-popup.vue',
      "return rows.length === 1 && specTextOf(rows[0]) !== '';", 'return false;'],
    // ⑯ 组三件（2026-10-29 购买数量那一轮）：数量那一节改回「无条件摆」（16.5 红）/
    // 「确定」不再按可买态禁用（16.5 红）/ 份数闸门从 TeamService 撤掉（16.7 红）/
    // 多份名单把组合商品也放进去（16.10 红 —— 用户点名的正是组合商品不该有数量）
    [CONFIG, 'v-if="countEnabled && !hideCount"', ''],
    [CONFIG, ':confirm-disabled="!canBuy"', ':confirm-disabled="false"'],
    ['../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/TeamService.php',
      '$count = Quantity::assert($activity, $spec, $count, $userId);', ''],
    // ⑯ 组两件（2026-10-29 规格弹窗最低高度 250 → 第二轮「再高 100px」350 → 第三轮「再高一些」450）：
    // 下限撤成 0（16.11 红）/ 收口占位块撤掉、按钮贴住最后一节（16.11 红）
    [CONFIG, 'min-height="450px"', 'min-height="0"'],
    [SHELL, '<view class="sps-gap" v-if="fill"></view>', ''],
    // ⑯ 组三件（2026-10-29 实物多属性按维分节那一轮）：分节整段关掉、退回一排组合文案（16.14 红，正是用户报的
    // 那一版）/ 分维函数在弹窗里被短路（16.14 红）/ 实物商详不再同读那一份（16.14 红，两处各拆一次＝会分叉）
    [CONFIG, 'v-if="!hideSpec && isGrouped"', 'v-if="false"'],
    [CONFIG, 'return specGroupsOf(this.specs, specTextOf);', 'return [];'],
    [PHYSJS, 'return specGroupsOf(skuPrices, (row) => row && row.goods_sku_text);', 'return [];'],
    // ⑯ 组三件（2026-10-29 售罄档就地禁用那一轮）：售罄档不再置灰（16.12 红）/
    // 点了仍能选中（16.12 红）/ 「确定」退回「只看档数」（16.5 红）
    [CONFIG, "'gbc-chip--off': !!specBlockText(row)", "'gbc-chip--off': false"],
    [CONFIG, 'if (!specBuyable(row)) { return; }', ''],
    [CONFIG, 'return this.chosenSpec ? specBuyable(this.chosenSpec) : true;', 'return true;'],
    // ⑯ 组一颗（2026-10-29 数量行那一轮）：标题退回「在步进器上面一行」（16.13 红）
    [CONFIG, 'class="gbc-count-row"', 'class="gbc-count-col"'],
    // ⑲ 组八颗样件（2026-10-29 首帧骨架重做）：按钮矮回 37（⑲3 红）/ 头像圆改小（⑲3 红）/
    // 骨架不给真实容器类（⑲2 红）/ 判据退回 `loading`（⑲1 红）/ 骨架自己加 margin（⑲4 红）/
    // 骨架里写死真实文案（⑲5 红）/ 自有类不带前缀（⑲6 红）/ 整句只摆一行（⑲7 红）/ 段序颠倒（⑲8 红）
    [DET, '.gbd-sk-btn {\n    width: 100%;\n    height: 40px;\n}', '.gbd-sk-btn {\n    width: 100%;\n    height: 37px;\n}'],
    [DET, '.gbd-sk-avatar {\n    width: 44px;\n    height: 44px;', '.gbd-sk-avatar {\n    width: 36px;\n    height: 36px;'],
    [DET, '<view class="gbd-members">', '<view class="gbd-skbox">'],
    [DET, 'v-else-if="firstFrame"', 'v-else-if="loading"'],
    [DET, '.gbd-sk-gap {\n    width: 176px;\n    height: 15px;\n}', '.gbd-sk-gap {\n    width: 176px;\n    height: 15px;\n    margin-top: 4px;\n}'],
    [DET, '<view class="gbd-sk gbd-sk-gap"></view>', '<text>还差</text><view class="gbd-sk gbd-sk-gap"></view>'],
    [DET, 'class="gbd-sk gbd-sk-avatar"', 'class="gbd-sk skavatar"'],
    [DET, '<view class="gbd-sk-line gbd-sk-line--rule">\n                    <view class="gbd-sk gbd-sk-rule-line"></view>\n                </view>',
      '<view class="gbd-sk-line gbd-sk-line--rule">\n                    <view class="gbd-sk gbd-sk-rule-line"></view>\n                </view>\n                <view class="gbd-sk-line gbd-sk-line--rule">\n                    <view class="gbd-sk gbd-sk-rule-line"></view>\n                </view>'],
    [DET, 'class="gbd-sk-line gbd-sk-line--gap"', 'class="gbd-sk-line"'],
    // ⑲9 / ⑲10 各一颗：状态字回落到「拼团」/ 列表闸门那一档又撤骨架（并把空态改回不带 !blocked）
    [DET, '<text class="gbd-state" v-else-if="detail.status_label">{{ detail.status_label }}</text>',
      '<text class="gbd-state" v-else>{{ detail.status_label || \'拼团\' }}</text>'],
    [IDX, 'if (state === null) {', 'if (state === null) {\n                this.loading = false;'],
    ['../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/Quantity.php',
      "const MULTI_TYPES = ['physical', 'activity'];",
      "const MULTI_TYPES = ['physical', 'activity', 'composite'];"],
    // ⑳ 组四颗样件（2026-10-29 组合商品 27 那一轮）：组合页的「立即购买」去掉收起判据（⑳ 组合红）/
    // 练习页 `hide-main` 撤掉（⑳ 练习红）/ 实物页「已售罄」那一档不再判（⑳ 实物红，等于团在飞还摆售罄块）/
    // 同步句写成恒 false（⑳ 组合红，等于判据写了假值）
    ['src/pages/app/composite/detail/detail.vue', 'v-if="!gbInTeam && !gbJoinMode">立即购买', '>立即购买'],
    ['src/pages/app/exam/detail/detail.vue', ':hide-main="gbInTeam || gbJoinMode"', ''],
    ['src/pages/app/physical/detail/detail.vue', 'v-else-if="!gbInTeam && !gbJoinMode">已售罄', 'v-else>已售罄'],
    ['src/pages/app/composite/detail/js.vue',
      'this.gbInTeam = !!(entry && entry.inTeam);', 'this.gbInTeam = false;'],
    // ㉖ 组五颗样件（2026-10-30 参团中的第二条购买入口）：组合页不再把参团中传给规格弹窗 /
    // 实物弹窗的确认禁用态不再判参团中 / 圈子弹层摘掉禁用态样式 / 教务弹层摘掉禁用态类 / 常量写成空串
    ['src/pages/app/composite/detail/detail.vue', '\n      :in-team="gbInTeam"', ''],
    ['src/pages/app/physical/components/sku-select-modal.vue',
      'return this.gbBlocked || this.inTeamBlocked;', 'return this.gbBlocked;'],
    [SHELL, "'sps-confirm--off': confirmDisabled", "'sps-confirm--off': false"],
    ['src/pages/app/school/package/components/package-sku-select-modal.vue',
      "'pkg-confirm-disabled': !canConfirm || inTeamBlocked", "'pkg-confirm-disabled': !canConfirm"],
    ['src/common/utils/group-buy-spec.js',
      "export const IN_TEAM_BLOCK_TEXT = '参团中不可单独购买';", "export const IN_TEAM_BLOCK_TEXT = '';"],
    // ㉖b 组三颗样件（2026-10-30 参团中那一趟也要拼团态）：组合页退回「只在 gbPicking 时传活动」
    // （＝用户报的那一版：参团中点规格，弹窗是单独购买的价）/ 圈子页把送好友那一趟也算进拼团态
    // （送礼被画成本人参团中的原价单）/ 弹窗文案把「立即开团」摆到参团中那一句前面
    ['src/pages/app/composite/detail/detail.vue',
      ':gb="(gbPicking || gbInTeam) ? gbActivity : null"',
      ':gb="gbPicking ? gbActivity : null"'],
    ['src/pages/app/circle/presale/presale.vue',
      ':gb="(gbPicking || (gbInTeam && !giftMode)) ? gbActivity : null"',
      ':gb="(gbPicking || gbInTeam) ? gbActivity : null"'],
    ['src/pages/app/composite/components/spec-select-modal.vue',
      "        confirmText() {\n            if (this.inTeamBlocked) { return IN_TEAM_BLOCK_TEXT; }",
      "        confirmText() {\n            if (this.gbMode) { return '立即开团'; }\n            if (this.inTeamBlocked) { return IN_TEAM_BLOCK_TEXT; }"],
    // ㉑ 组三颗样件（2026-10-29 教务套餐底栏那一轮）：入口宿主 class 摘掉（小程序端入口按内容收缩）/
    // 容器 gap 归零（两枚贴死）/ u-button 内衬写回 12px（H5 上它比旁边那枚宽出 24px）
    ['src/pages/app/school/package/detail/detail.vue', 'class="pd-gb-slot" ', ''],
    ['src/pages/app/school/package/detail/css.css', '  gap: 10px;', '  gap: 0px;'],
    ['src/pages/app/school/package/detail/css.css', '  padding: 0;\n  margin: 0;', '  padding: 0 12px;\n  margin: 0;'],
    // ㉒ 组两颗样件（2026-10-29 拼团区落点那一轮）：把「教师」块插到拼团区前面（㉒ 红，正是用户看到的那一版）/
    // 价格卡锚点改名（㉒b 红：证明「拼团区在价格卡之后」不是恒真的空断言）
    ['src/pages/app/school/package/detail/detail.vue',
      '<tz-group-buy-area v-if="form.id" ref="gbArea" goods-type="school_package"',
      '<tz-title title="教师" :more="false" /><tz-group-buy-area v-if="form.id" ref="gbArea" goods-type="school_package"'],
    ['src/pages/app/school/package/detail/detail.vue', '<view class="school-head">', '<view class="school-head-x">'],
    // ㉓ 组五颗样件（2026-10-29 拼团规格复用商品规格组件那一轮）：
    // host-spec 分支摘掉（㉓2 红）/ 第二步不收规格（㉓1 红）/ 实物页不挂 host-spec（㉓3 红）/
    // 会员卡不交回 afterSpec（㉓3 红）/ 组合页去掉安装态闸门（㉓6 红）
    ['src/components/tz/group-buy-area.vue', 'if (this.hostSpec) {', 'if (false) {'],
    ['src/components/tz/group-buy-config-popup.vue', 'v-else-if="!hideSpec && hasSpec"', 'v-else-if="hasSpec"'],
    ['src/pages/app/physical/detail/detail.vue', 'host-spec', ''],
    ['src/pages/app/vip/center/js.vue', 'afterSpec({ specId: this.skuIndex, ladderId:', 'afterSpec({ specId: 0, ladderId:'],
    ['src/pages/app/composite/detail/js.vue', "app_isinstall_composite", "app_isinstall_nope"],
    // ㉔ 组四颗样件（2026-10-30 拼团一整块连着放那一轮）：
    // 宿主又把横幅挂回自己卡里 / 宿主又传 `hide-banner` / 拼团区自己那份横幅被摘掉（块首没了）/
    // 会员卡卡面回落到原价
    ['src/pages/app/physical/detail/detail.vue', '<view class="title-card detail-card">',
      '<view class="title-card detail-card"><tz-group-buy-banner :activity="gbActivity" />'],
    ['src/pages/app/physical/detail/detail.vue', 'host-spec hide-danmu', 'host-spec hide-banner hide-danmu'],
    // 2026-10-30 第五轮（拼团价覆盖原价）两颗：价格行门控被摘掉（一屏又两个价）/ 判据不再吃活动本体
    ['src/pages/app/physical/detail/detail.vue', '<view class="price-box" v-if="gbPriceShown">', '<view class="price-box">'],
    ['src/pages/course/detail/js.vue', 'return !(this.gbEntry && this.gbEntry.activity);', 'return true;'],
    [AREA, '<tz-group-buy-banner :activity="activity" />', ''],
    ['src/pages/app/vip/center/center.vue', 'gbSkuPrice(index)', 'item.price'],
    // ㉕ 组四颗样件（2026-10-29 复用规格组件要带拼团语义那一轮）：
    // 拼团标摘掉 / 页面不再传活动 / 组件不按 spec_id 取价 / 按钮退回「确定」
    [SHELL, 'class="gb-tag" v-if="tagText"', 'class="gb-tag-x" v-if="tagText"'],
    ['src/pages/app/physical/detail/detail.vue', ':gb="(gbPicking || gbInTeam) ? gbActivity : null"', ':gb="null"'],
    ['src/pages/app/composite/components/spec-select-modal.vue', 'gbTierId(this.gb,', 'null,'],
    [SHELL, '{{ gbPrice }}', '{{ gbRow.price }}'],
    ['src/pages/app/school/package/components/package-sku-select-modal.vue', '立即开团', '确定'],
    // ㉕c 一颗样件（2026-10-29 浏览器实测 `_vm.gbPriceText is not a function`）：模板直调的函数不再挂实例 ⇒ 弹窗整块渲染不出来
    [SHELL, '{{ gbPrice }}', '{{ gbPriceTextOf(gb, specId, 0) }}'],
    // ㉕d 一颗样件（2026-10-29 教育培训套餐弹窗「拼团黑色字体 / 黑色原价」）：把「拼团」标的样式规则改名 ⇒ 该条红
    ['src/pages/app/school/package/components/package-sku-select-modal.vue', '.gb-tag {', '.gb-tag-x {'],
    // ㉕e 一颗样件（2026-10-29 用户要「特殊的背景色 / 特殊的 Tag」）：摘掉「拼团专享」标 ⇒ 该条红
    [SHELL, '<view class="gb-badge" v-if="gbMode">{{ badgeText }}</view>', ''],
    // ㉕f 一颗样件（2026-10-30 用户点名「拼团的规格选择弹窗要有上圆角」）：顶格自带的圆角摘掉 ⇒ 该条红
    //（摘掉之后拼团态那层浅暖红会把左上/右上两角重新涂成直角，正是用户看到的那一版）
    [SHELL, 'border-bottom: 1px solid #F7F8FA;\n\tborder-radius: 12px 12px 0 0;\n}', 'border-bottom: 1px solid #F7F8FA;\n}'],
    // ㉔ 第五颗：原价行又被活动本体门控（2026-10-30 起原价行常驻，横幅在拼团卡里另说）⇒ 该条红
    ['src/pages/app/exam/detail/detail.vue',
      'class="exam-property-item price" v-if="data.sales_type == 2 && data.is_auth == false"',
      'class="exam-property-item price" v-if="data.sales_type == 2 && data.is_auth == false && !gbActivity"'],
    // ㉘ 组样件（2026-10-30 受邀参团；同日第二轮「团绑定商品、不绑定规格」）：
    // 宿主漏一枚 join 参数（㉘1 红）/ 底栏文案退回「立即开团」（㉘2 红）/
    // 规格弹窗不再固定团上那一档人数（㉘3 红）/ 实物页「选择」行又开自己的原价规格弹窗（㉘4 红）/
    // 后端换规格仍按团价（㉘5 红）/ 打卡落点退回主页（㉘6 红）
    [PHYS, ':join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"', ''],
    [AREA, "if (this.joinMode) { return '加入拼团'; }", "if (this.joinMode) { return '立即开团'; }"],
    [AREA, ':hide-spec="(hostSpec || hostTicket) && !joinMode" :hide-count="(hostSpec || hostTicket) && !joinMode"',
      ':hide-spec="hostSpec" :hide-count="hostSpec"'],
    [AREA, ':fixed-ladder-id="joinMode ? joinLadder : 0"', ''],
    [CONFIG, 'const fixed = Number(this.fixedLadderId) || 0;', 'const fixed = 0;'],
    [PHYS, '@tap="openSkuPicker"', '@tap="showSelectSku = true"'],
    ['../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/JoinQuote.php',
      "if ($specId === $leaderId && floatval($team['price']) > 0) {", "if (false) {"],
    ['src/common/utils/router.js', "return goodsId ? '/pages/app/checkin/intro/intro?id=' + goodsId : '';",
      'return this.getPagePath(goodsId, type);'],
    // ㉙ 组两颗样件（2026-10-30 已有使用权限那一轮）：练习页拼团区退回只看 `data.id`
    // （＝用户报的那一版：已能做题还摆着拼团价）/ 弹幕摘掉 gbVisible（已拥有态还挂一轮购买播报）
    [EXAM_VUE, '<tz-group-buy-area v-if="gbVisible"', '<tz-group-buy-area v-if="data.id"'],
    [EXAM_VUE, '<tz-group-buy-danmu v-if="gbVisible && gbBuyers.length"',
      '<tz-group-buy-danmu v-if="gbBuyers.length"'],
    // ㉜ 组两颗样件（2026-10-30 属性卡等分）：写回 300px + space-between / 摘掉 flex 等分 ⇒ 该条红
    ['src/pages/app/exam/detail/css.css', '    display: flex;\n    width: 100%;', '    display: flex;\n    width: 300px;\n    justify-content: space-between;'],
    ['src/pages/app/exam/detail/css.css', '    flex: 1 1 0;\n    min-width: 0;', '    flex: none;'],
    // ㉝ 组四颗样件（2026-10-30 已成团按钮；2026-10-31 补线下活动「查看票券」）：
    // 实物文案退回「查看商品」/ 实物跳转退回商品页 / 线下活动文案退回「查看商品」/ 票券跳转退回商品页 ⇒ 该条红
    ['src/pages/app/group_buy/detail/detail.vue', "if (t === 'physical') { return '查看订单'; }", "if (t === 'physical') { return '查看商品'; }"],
    ['src/pages/app/group_buy/detail/detail.vue', "if (t === 'physical') {\n                this.goOrder();", "if (t === 'physical') {\n                this.goGoods();"],
    ['src/pages/app/group_buy/detail/detail.vue', "if (t === 'activity') { return '查看票券'; }", "if (t === 'activity') { return '查看商品'; }"],
    ['src/pages/app/group_buy/detail/detail.vue', "if (t === 'activity') {\n                this.goTickets();", "if (t === 'activity') {\n                this.goGoods();"],
    // ㉛ 组两颗样件（2026-10-30 拼团态价格格）：标题写死「售价」/ 判据两档都写「售价」⇒ 该条红
    ['src/pages/app/exam/detail/detail.vue', '{{ priceLabel }}', '售价'],
    ['src/pages/app/exam/detail/js.vue', "? '原价' : '售价'", "? '售价' : '售价'"],
    // ㉚ 组两颗样件（2026-10-30 已加入过练习那一轮）：优惠券条退回只看虚拟支付
    // （＝用户报的那一版：加入过还摆着领券条）/ 判据摘掉 `is_subscribe` 那一半
    [EXAM_VUE, '<coupon-goods-bar v-if="couponVisible"', '<coupon-goods-bar v-if="!isVirtualPay(data)"'],
    [EXAM_JS, 'return !this.isVirtualPay(this.data) && !this.data.is_subscribe;',
      'return !this.isVirtualPay(this.data);'],
    // ㉘7 一颗样件（2026-10-30 会员卡立即开团被弹「请先选择拼团商品的规格」）：判据退回只看 spec_id 真值
    //（＝用户报的那一版：会员卡第 0 档 spec_id=0 被当成没选）
    ['src/components/order/submit-order.vue',
      'const specPicked = wantSpec > 0 || Number(gb.spec_set) === 1;',
      'const specPicked = wantSpec > 0;'],
    // ㉞ 组三颗样件（2026-10-30 拼团走确认报名页那一轮）：
    // 商详不再把下单交给确认页（㉞2 红，＝用户报的那一版：直进结算页再拿原生 Picker 选校区）/
    // 确认页校区退回原生选择器（㉞3 红）/ 结算页读不到 `gb_student`（㉞4 红）
    ['src/pages/app/school/package/detail/detail.vue',
      'goods-type="school_package" host-spec host-order hide-danmu',
      'goods-type="school_package" host-spec hide-danmu'],
    ['src/pages/app/school/package/confirm/confirm.vue', '<campus-select-popup', '<u-picker'],
    ['src/components/order/submit-order.vue',
      'const preStudent = Number((this.pageParams || {}).gb_student) || 0;',
      'const preStudent = 0;'],
    // ㉞4b/㉞4c（2026-10-31 用户点名「不要显示这个校区和学生了」）：
    //   b) 拼团额外信息块退回「教务套餐也渲染」；c) 把「上课校区」只读行加回结算页模板
    ['src/components/order/submit-order.vue',
      '<template v-if="isGroupBuy && gbExtra.kind === \'activity\' && !gbExtra.formUserId">',
      '<template v-if="isGroupBuy && gbExtra.kind">'],
    ['src/components/order/submit-order.vue',
      '<u-form-item label="报名信息" :border="false" @click="openApplyForm">',
      '<u-form-item label="上课校区" :border="true"><view class="input-item">{{ gbExtra.campusId }}</view></u-form-item>'
        + '\n                    <u-form-item label="报名信息" :border="false" @click="openApplyForm">'],
    // ㉞6 一颗样件（同日兜底出口）：把「去选择」改回只说一句的「知道了」——缺信息时没有出口 = 死路
    ['src/components/order/submit-order.vue', "confirmText: '去选择',", "confirmText: '知道了',"],
    // ㉟ 组十颗样件（2026-10-31 线下活动拼团那三条）：
    // 拼团卡退回信息格之后（㉟1 红）/ 拼团入口不判报名已截止（㉟2 红）/ 组件禁用不拦点击（㉟2 红）/
    // 「去凑团」那一段不再算报名已截止（㉟2 红）/ 详情页不再把下单交给选票页（㉟3 红）/
    // 选票页丢掉 gb_*（㉟4 红）/ 身份核错 id（㉟4 红）/ 报名信息页不补 gb_form（㉟4/㉟5 红）/
    // 多份报名不再就地拦（㉟4 红）/ 键表漏登记 gb_form（㉟5 红）
    ['src/pages/app/activity/detail/detail.vue', 'class="activity-info-box"', 'class="activity-info-box-zz"'],
    ['src/pages/app/activity/detail/detail.vue',
      ' :disabled="!data.apply_status && !gbInTeam" @open="openGb"', ' @open="openGb"'],
    ['src/components/tz/group-buy-area.vue',
      'return !this.closed && this.teamsEnabled && this.teams.length > 0;',
      'return this.teamsEnabled && this.teams.length > 0;'],
    ['src/components/tz/group-buy-btn.vue', 'if (this.disabled) { return; }', ''],
    ['src/pages/app/activity/detail/detail.vue', 'host-ticket host-order', 'host-order'],
    ['src/pages/app/activity/ticket/js.vue', 'readGroupBuyOrder(that.pageParams);', '{};'],
    // 身份核错 id（拿拼团活动号去比活动 id）⇒ ㉟4 红：整条拼团链会被误判成普通报名链
    ['src/pages/app/activity/ticket/js.vue', 'Number(gbIn.gb_goods_id) || 0', 'Number(gbIn.gb_activity) || 0'],
    ["src/pages/app/activity/form/js.vue", "gb_form: Number(res.data[0]) || ''", "gb_form: ''"],
    ["src/pages/app/activity/form/js.vue", '拼团一次只能购买 1 张', '请减少票券数量'],
    ['src/common/utils/group-buy-order.js', "    'gb_form',\n", ''],
    // ㊱ 组五颗样件（2026-10-31 选票页拼团价 + 骨架屏）：
    // 合计退回票券原价（㊱1 红）/ 拼团价不再问活动（㊱1 红）/ 骨架收口退回只看票券一路（㊱2 红）/
    // 骨架模板被关掉（㊱2 红）/ 灰块换成旧灰（㊱2 红）
    ['src/pages/app/activity/ticket/js.vue',
      'price += this.ticketUnitPrice(this.ticketList[j]) * this.ticketSelected[i]',
      'price += this.ticketList[j].price * this.ticketSelected[i]'],
    ['src/pages/app/activity/ticket/js.vue',
      "that.$api('group_buy.activity.detail', { goods_type: goodsType, goods_id: goodsId })",
      "that.$api('group_buy.activity.detail', { goods_type: goodsType, goods_id: 0 })"],
    ['src/pages/app/activity/ticket/js.vue',
      'return !(this.detailLoaded && this.ticketLoaded && this.gbLoaded);',
      'return !this.ticketLoaded;'],
    ['src/pages/app/activity/ticket/ticket.vue',
      '<view class="ticker-list" v-if="loading">',
      '<view class="ticker-list" v-if="false">'],
    ['src/pages/app/activity/ticket/css.css', 'background: #e5e6eb;', 'background: #f5f5f5;'],
    // ㊱3/㊱4 组六颗样件（2026-10-31 报名信息页拼团价 + 两页主题色）：
    // 报名页合计退回票券原价（㊱3 红）/ 报名页骨架漏掉拼团活动那一路（㊱3 红）/
    // 选票页按钮退回平台蓝（㊱4 红）/ 报名页价格退回平台价红（㊱4 红）/
    // 报名信息弹层不带主题（㊱4 红）/ 底栏 `type==''` 条不认主题（㊱4 红）
    ['src/pages/app/activity/form/js.vue',
      'p += this.ticketUnitPrice(item) * (Number(item.number) || 0);',
      'p += (Number(item.price) || 0) * (Number(item.number) || 0);'],
    // 共享映射丢掉旧规格 id 的认回（商品重存后老票种取不到拼团价）⇒ ㊱1 红
    ['src/common/utils/group-buy-ticket-price.js',
      'return Number(r.spec_id) === id || Number(r.legacy_spec_id) === id;',
      'return Number(r.spec_id) === id;'],
    ['src/pages/app/activity/form/js.vue',
      'return !(this.detailLoaded && this.ticketLoaded && this.formLoaded && this.gbLoaded);',
      'return !(this.detailLoaded && this.ticketLoaded && this.formLoaded);'],
    ['src/pages/app/activity/ticket/js.vue',
      "return this.gbPicking ? GB_GRADIENT : '';", "return '';"],
    ['src/pages/app/activity/form/js.vue',
      'return this.gbPicking ? { color: GB_TEXT } : {};', 'return {};'],
    ['src/pages/app/activity/form/form.vue',
      ':theme="gbPicking ? \'group-buy\' : \'\'"', ':theme="\'\'"'],
    ['src/components/tz/bottom-btn.vue',
      "{ 'tbb-bar--gb': theme == 'group-buy' }]\" v-if=\"type == ''\"",
      "]\" v-if=\"type == ''\""],
    // ㊲ 两颗样件（2026-10-31 用户实报「小程序规格弹窗左上角只有灰底」）：
    // a) 壳退回 `cover === null` 判显隐（＝用户看到的那一版：小程序端 null 已不是 null，渲染出灰底空图）；
    // b) 圈子宿主不再传 `info.cover`（这一格又变成「没图也没默认填充」）
    [SHELL, '<image class="sps-cover" :src="coverSrc"',
      '<image v-if="cover !== null" class="sps-cover" :src="coverSrc"'],
    ['src/pages/app/circle/presale/presale.vue', ':cover="(info && info.cover) || \'\'"', ''],
  ];
  let red = 0;
  const truthy = results.filter((r) => r.pass).length;
  NEG.forEach((n) => {
    const src = read(n[0]);
    // 样件按**目标文件的行尾**取（这批页面文件是 CRLF），否则多行样件永远落不下去、整条反例白配
    const from = n[1].replace(/\n/g, src.indexOf('\r\n') > -1 ? '\r\n' : '\n');
    if (src.indexOf(from) < 0) { console.log('[SKIP] 样件不匹配：' + n[0] + ' :: ' + n[1]); return; }
    // **全文替换**而不是只换第一处：同一枚串在这几只文件里出现两次时，只换第一处 = 反例假绿
    // （3.1 的 `app_isinstall_group_buy`、3.4 的 `gbArea`、6.1 的 `pending` 都吃过这一记）
    fs.writeFileSync(path.join(ROOT, n[0]), src.split(from).join(n[2]));
    let broke = false;
    try {
      const out = require('child_process').execSync('node ' + path.join(__dirname, 'check-group-buy-detail.js'), { encoding: 'utf8' });
      broke = /失败 [1-9]/.test(out);
    } catch (e) { broke = true; }
    fs.writeFileSync(path.join(ROOT, n[0]), src);
    if (broke) red++; else console.log('[恒绿] 反例 ' + n[1] + ' 没让任何判据变红 —— 该条是虚断言');
  });
  console.log('\n能红 ' + red + ' / ' + NEG.length + '，本轮正例通过 ' + truthy + '/' + results.length);
  process.exit(0);
}
process.exit(fail ? 1 : 0);
