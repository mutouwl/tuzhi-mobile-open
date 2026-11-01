/**
 * 提交订单页「商品信息 = 紧凑档课程卡（course-item-mini）」的机器验法（2026-10-31 用户点名）
 *
 * 用户原话：「pages/order/submit/submit 上面的商品信息，能够复刻 course-item-mini 相关的样式
 * （封面、tag、价格），然后保留当前商品信息字段」。
 *
 * 病根：结算页那张商品卡是 `components/order/course.vue`（28% 封面 + 16px 标题 + 灰价 + xN），
 * 与全站「紧凑档课程卡」是两套版式（`tz-course-mini`：封面 140×80、磨砂类型标、14px 红价）——
 * M24 的口径是「列表条目卡不另抄版式，共用组件当适配器」，这一页此前是唯一的例外。
 *
 * 改法（本脚本钉的就是这个结构）：结算页不再渲染 `course.vue`，整卡换成 `tz-course-mini`，
 * 页面只保留一份「订单行 → 卡片字段」的映射（`orderGoodsCards`），当前商品信息字段一项不少：
 * 名称 / 封面 / 类型标签 / 价格 / 件数（`count`，卡片右下角「×N」）。
 *
 * 合同八条：
 *  ① 模板里的商品卡是 `<tz-course-mini :list="orderGoodsCards"`，且不再出现 `<course` 标签；
 *  ② 页面不再 import `components/order/course.vue`，`components` 里也不注册 `course`；
 *  ③ 骨架走同一只卡片的骨架档（`:skeleton="true"`），旧的 `.sk-goods*` 灰块从模板与样式里删干净；
 *  ④ 字段映射只存一处：模板里不再出现 `data.orderGoodsList` 与 `item.detail.`；
 *  ⑤ 当前商品信息字段一项不少（id / type / cover / name / price / count + pay_type='pay' + is_virtual_pay）；
 *  ⑥ 教务套餐的 `item_id` 是规格 id，映射里必须换成 `detail.package_id`（卡片只认商品详情页）；
 *  ⑦ 件数由卡片自己画：`course-mini.vue` 有 `item.count` 的插值 + 贴卡片右下角的 `.count` 规则；
 *  ⑧ 「复刻」不是空话：封面上限 140、磨砂类型标、红色价格三处仍在卡片里（逐值核）。
 *
 * 用法：node tuzi-mobile/scripts/check-order-submit-goods-card.js
 *      node tuzi-mobile/scripts/check-order-submit-goods-card.js --selftest   # 六颗坏样件必须各自报红
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const FILES = {
  submit: path.join(ROOT, 'tuzi-mobile/src/components/order/submit-order.vue'),
  card: path.join(ROOT, 'tuzi-mobile/src/components/tz/course-mini.vue'),
};

const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ');
const stripCssComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, ' ');

/** 只留模板那一层（`<template>` 首尾之间，注释按空白抹掉，避免注释里的旧写法当违规） */
function templateOf(src) {
  const at = src.indexOf('<template');
  const end = src.lastIndexOf('</template>');
  const body = end <= at ? '' : src.slice(src.indexOf('>', at) + 1, end);
  return stripHtmlComments(body);
}

/** 取 `名字(` 起的那一段声明块（按花括号配平，取第一条命中） */
function blockAfter(src, needle) {
  const at = src.indexOf(needle);
  if (at < 0) return '';
  const open = src.indexOf('{', at + needle.length - 1);
  if (open < 0) return '';
  let depth = 0;
  for (let i = open; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (!depth) return src.slice(open + 1, i);
    }
  }
  return '';
}

/** 取 `sel { ... }` 这一条样式规则的声明块（按花括号配平，取第一条命中） */
function ruleBlock(css, sel) {
  const at = css.indexOf(sel);
  if (at < 0) return '';
  const open = css.indexOf('{', at + sel.length);
  if (open < 0) return '';
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') {
      depth--;
      if (!depth) return css.slice(open + 1, i);
    }
  }
  return '';
}

function check(src) {
  const results = [];
  const ok = (id, name, cond, got) => results.push({ id, name, ok: !!cond, got });
  const tpl = templateOf(src.submit);
  const code = stripHtmlComments(src.submit);
  const css = stripCssComments(src.card);
  const cardTpl = templateOf(src.card);
  const mapBlock = blockAfter(code, 'orderGoodsCards()');

  /* ① 商品卡只走共用紧凑档课程卡 */
  const cardTag = /<tz-course-mini[^>]*:list="orderGoodsCards"[^>]*>/.test(tpl);
  const legacyTag = /<course[\s>]/.test(tpl);
  ok('①', '① 模板里的商品卡是 `<tz-course-mini :list="orderGoodsCards"`，不再出现旧的 `<course` 卡（M24：共用组件当适配器）',
    cardTag && !legacyTag, 'tz-course-mini=' + cardTag + ' 旧卡=' + legacyTag);

  /* ② 页面不再引旧卡 */
  const legacyImport = /from\s+['"]@\/components\/order\/course\.vue['"]/.test(code);
  const compsBlock = blockAfter(code, 'components:');
  const legacyComp = /(^|[\s,{])course\s*,/.test(compsBlock);
  ok('②', '② 页面不再 import / 注册 `components/order/course.vue`（旧卡的点击 switch 一并下线）',
    !legacyImport && !legacyComp, 'import=' + legacyImport + ' 注册=' + legacyComp);

  /* ③ 骨架与真实卡同一只组件 */
  const skTag = /<tz-course-mini[^>]*:skeleton="true"[^>]*>/.test(tpl);
  const skLeft = /sk-goods/.test(code);
  ok('③', '③ 骨架走卡片自己的骨架档（`:skeleton="true"`），`.sk-goods*` 从模板与样式里删干净（M16）',
    skTag && !skLeft, 'skeleton=' + skTag + ' sk-goods残留=' + skLeft);

  /* ④ 字段映射只存一处 */
  const tplFieldLeft = /data\.orderGoodsList|item\.detail\./.test(tpl);
  ok('④', '④ 字段映射只存 `orderGoodsCards` 一处：模板里不再出现 `data.orderGoodsList` / `item.detail.`',
    mapBlock.length > 0 && !tplFieldLeft, '映射块=' + (mapBlock.length > 0) + ' 模板残留=' + tplFieldLeft);

  /* ⑤ 当前商品信息字段一项不少 */
  const keys = ['id', 'type', 'cover', 'name', 'price'];
  const missing = keys.filter((k) => !new RegExp('(^|[^\\w.])' + k + '\\s*:', 'm').test(mapBlock));
  const hasCount = /count\s*:\s*item\.count/.test(mapBlock);
  const hasPay = /pay_type\s*:\s*'pay'/.test(mapBlock);
  const hasVirtual = /is_virtual_pay\s*:/.test(mapBlock);
  ok('⑤', "⑤ 当前商品信息字段一项不少：id / type / cover / name / price / count + `pay_type: 'pay'` + is_virtual_pay",
    missing.length === 0 && hasCount && hasPay && hasVirtual,
    '缺=' + (missing.join(',') || '无') + ' count=' + hasCount + ' pay=' + hasPay + ' virtual=' + hasVirtual);

  /* ⑥ 教务套餐 id 换算（看 `id:` 那一行本身，别拿同块里 isSchool 的判据充数） */
  const idLine = (mapBlock.match(/(^|[\s{])id\s*:\s*([^\n]*)/m) || [])[2] || '';
  ok('⑥', '⑥ 教务套餐那一档把规格 id 换成 `detail.package_id`（卡片只认商品详情页，否则点开是空套餐）',
    /package_id/.test(idLine), idLine.trim());

  /* ⑦ 件数由卡片渲染 */
  const countNode = /item\.count/.test(cardTpl);
  const countRule = ruleBlock(css, '.course-list-box.single .course-item-box .count');
  const countGeom = /position\s*:\s*absolute/.test(countRule) && /right\s*:\s*8px/.test(countRule) && /bottom\s*:\s*4px/.test(countRule);
  const cardPos = /position\s*:\s*relative/.test(ruleBlock(css, '.course-list-box.single .course-item-box'));
  ok('⑦', '⑦ 件数由卡片自己画：模板有 `item.count` 插值、`.count` 贴卡片右下角（absolute + right 8 + bottom 4），卡根是定位基准',
    countNode && countGeom && cardPos, '节点=' + countNode + ' 几何=' + countGeom + ' 卡根定位=' + cardPos);

  /* ⑧ 复刻不是空话：封面 140 / 磨砂类型标 / 红色价格三处仍在 */
  const cover = ruleBlock(css, '.course-list-box.single .course-item-box .cover');
  const typeTag = ruleBlock(css, '.course-item-box .cover .type');
  const price = ruleBlock(css, '.course-list-box.single .course-item-box .info .price');
  const look = /width\s*:\s*140px/.test(cover)
    && /rgba\(0,\s*0,\s*0,\s*\.05\)/.test(typeTag) && /bottom\s*:\s*4px/.test(typeTag)
    && /#F53F3F/i.test(price);
  ok('⑧', '⑧ 卡片仍是 course-item-mini 的四落点：封面 140×80、封面右下磨砂类型标、左下红色价格',
    look, '封面140=' + /width\s*:\s*140px/.test(cover) + ' 类型标=' + /rgba\(0,\s*0,\s*0,\s*\.05\)/.test(typeTag) + ' 红价=' + /#F53F3F/i.test(price));

  return results;
}

function report(results) {
  results.forEach((r) => console.log((r.ok ? '[PASS] ' : '[FAIL] ') + r.name + (r.ok ? '' : ' -> ' + r.got)));
  const fail = results.filter((r) => !r.ok).length;
  console.log('\n结果：' + (fail ? '有 ' + fail + ' 项不符合预期' : '全部符合预期')
    + '（通过 ' + (results.length - fail) + ' 项 / 违反 ' + fail + ' 项）');
  return fail;
}

if (process.argv.includes('--selftest')) {
  // 六颗坏样件：每颗都必须让「它对应的那一条」报红（对不上号也算失败，避免改歪了仍然全绿）
  const src = {
    submit: fs.readFileSync(FILES.submit, 'utf8'),
    card: fs.readFileSync(FILES.card, 'utf8'),
  };
  const cases = [
    ['①', '商品卡退回旧卡', { submit: src.submit.replace(/<tz-course-mini[^>]*:list="orderGoodsCards"[^>]*>/, '<course v-for="(item, index) in data.orderGoodsList" :key="index" />') }],
    ['②', '页面重新 import 旧卡', { submit: src.submit.replace('<script>', '<script>\n    import course from "@/components/order/course.vue";') }],
    ['③', '骨架退回旧灰块', { submit: src.submit.replace('<tz-course-mini :skeleton="true"', '<tz-course-mini :skeleton="false"') }],
    ['⑤', '映射丢掉件数', { submit: src.submit.replace('count: item.count,', '') }],
    ['⑥', '套餐 id 退回规格 id', { submit: src.submit.replace('isSchool ? detail.package_id :', 'isSchool ? detail.id :') }],
    ['⑦', '卡片不再渲染件数', { card: src.card.replace('<div class="count" v-if="item.count">×{{ item.count }}</div>', '') }],
  ];
  let bad = 0;
  cases.forEach(([id, label, patch]) => {
    const next = { submit: patch.submit === undefined ? src.submit : patch.submit, card: patch.card === undefined ? src.card : patch.card };
    const same = next.submit === src.submit && next.card === src.card;
    if (same) {
      bad++;
      console.log('[FAIL] 坏样件「' + label + '」没能造出来（锚点文本变了，请同步本脚本）');
      return;
    }
    const res = check(next);
    const hit = res.find((r) => r.id === id);
    if (hit && !hit.ok) console.log('[PASS] 坏样件「' + label + '」-> ' + id + ' 报红');
    else {
      bad++;
      console.log('[FAIL] 坏样件「' + label + '」-> 期望 ' + id + ' 报红，实际没红');
    }
  });
  console.log(bad ? '\nSELFTEST FAIL：' + bad + ' 颗坏样件没有报红' : '\nSELFTEST PASS：' + cases.length + ' 颗坏样件全部报红');
  process.exit(bad ? 1 : 0);
}

const fail = report(check({
  submit: fs.readFileSync(FILES.submit, 'utf8'),
  card: fs.readFileSync(FILES.card, 'utf8'),
}));
process.exit(fail ? 1 : 0);
