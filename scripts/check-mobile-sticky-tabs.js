/**
 * 共用页签 `tz-tabs` 的「吸顶带」合同（2026-10-28 用户点名「tabs 要吸顶啊」）
 *
 * 用户原话只给了两条路由＋一句：
 *   `#/pages/app/send_friend/gift/gift`、`/pages/app/group_buy/index/index`「tabs 要吸顶啊」
 *
 * 为什么单独落一条门禁：
 *  - `ui-audit --pattern sticky-missing` 认的是 `<u-tabs` / `<u-search` 这些字面，
 *    **`<tz-tabs>` 一个都不匹配**（它既不是 `class="…tabs"` 也不叫 `u-tabs`）⇒ 这两个调用点
 *    在那一支里等于不存在，页签被滚走也永远报 PASS（`.trae/rules/frame.md` 硬约束 26）。
 *  - 「吸顶」这一条很容易在下次改版里被顺手拆掉（把 `u-sticky` 换成裸 `<tz-tabs>` 只掉一行），
 *    而症状只在**列表变长**之后才出现（M5 的正句）。
 *
 * 合同三条（对象＝所有 `tz-tabs` 调用点，不判裸 `u-tabs` 的页面）：
 *  ① 每个 `<tz-tabs>` 都必须包在 `<u-sticky>` 带里，带子给 `bgColor="#fff"` + `:offsetTop="0"`
 *     （白底与下方 #f7f8fa 列表区分，M5 正句）；
 *  ② 带内**只有页签行本身**：`<u-sticky>` 与 `</u-sticky>` 之间除注释与 `<tz-tabs>` 外只剩空白
 *     （「仅看订单」那类随数据变的说明行留在带外，M5「带里只放页签/搜索栏」）；
 *  ③ 组件自己不许再挂死挂件：`components/tz/tabs.vue` 里不得出现 `<tz-course>`
 *     ——它没被传 `list`，easycom 会真挂起来但 `rows` 恒空，渲染成一只 10px 空白块，
 *     包进白底吸顶带后就是页签行下面凭空多一道白边（本轮同批清掉的根因）。
 *
 * 用法：node tuzi-mobile/scripts/check-mobile-sticky-tabs.js
 *       node tuzi-mobile/scripts/check-mobile-sticky-tabs.js --selftest   （四颗坏样件必须全红）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const TABS_COMP = path.join(SRC, 'components/tz/tabs.vue');

const stripHtmlComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ');

/** 递归收 `.vue`（只走 pages 与 components，够用且不扫 node_modules） */
function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (name.endsWith('.vue')) out.push(p);
  }
  return out;
}

/** 所有引用了 `<tz-tabs` 的页面文件（按路径排序，输出稳定） */
function callSites(srcMap) {
  return Object.keys(srcMap)
    .filter((p) => /[\/]pages[\/]/.test(p) && /<tz-tabs\b/.test(srcMap[p]))
    .sort();
}

/**
 * 取 `<u-sticky …>` 开标签的结束位置（属性里可能有 `>`，但本仓这几处都是普通属性；
 * 仍按「最后一个 `>` 之前没有 `<`」的朴素判据切一刀，遇到异常直接返回 -1 让合同报红）
 */
function openTagEnd(src, at) {
  const gt = src.indexOf('>', at);
  const lt = src.indexOf('<', at + 1);
  if (gt < 0) return -1;
  if (lt >= 0 && lt < gt) return -1;
  return gt;
}

function check(srcMap) {
  const pass = [];
  const fail = [];
  const ok = (name, cond, got) => {
    if (cond) pass.push(name);
    else fail.push(name + (got === undefined ? '' : ' -> ' + got));
  };

  const pages = callSites(srcMap);
  ok('① 存在 `tz-tabs` 调用点（本仓两个：我的拼团 / 赠送记录）', pages.length > 0, '调用点=' + pages.length);

  const noSticky = [];
  const badBand = [];
  const badStyle = [];
  const strayInBand = [];
  for (const p of pages) {
    const tpl = stripHtmlComments(srcMap[p]);
    const rel = path.relative(ROOT, p);
    let cursor = 0;
    let hit;
    while ((hit = tpl.indexOf('<tz-tabs', cursor)) >= 0) {
      cursor = hit + 1;
      // 从本处往前找最近的 `<u-sticky`，要求它到本处之间没有 `</u-sticky>`（＝真包着）
      const stickyAt = tpl.lastIndexOf('<u-sticky', hit);
      const closedBefore = stickyAt >= 0 ? tpl.lastIndexOf('</u-sticky>', hit) : -1;
      const openEnd = stickyAt >= 0 ? openTagEnd(tpl, stickyAt) : -1;
      const wrapped = stickyAt >= 0 && openEnd > 0 && openEnd < hit && closedBefore < stickyAt;
      const closeAt = wrapped ? tpl.indexOf('</u-sticky>', hit) : -1;
      if (!wrapped || closeAt < 0) {
        noSticky.push(rel + ' @' + tpl.slice(0, hit).split('\n').length);
        continue;
      }
      const openTag = tpl.slice(stickyAt, openEnd + 1);
      if (!/bgColor="#fff"/i.test(openTag) || !/(^|\s):?offsetTop="0"/.test(openTag)) badStyle.push(rel + ' ' + openTag);
      // 带内除页签行外不许有别的东西（注释已剥）
      let inner = tpl.slice(openEnd + 1, closeAt);
      while (/<tz-tabs\b[^>]*\/>/.test(inner)) inner = inner.replace(/<tz-tabs\b[^>]*\/>/, '');
      while (/<tz-tabs\b[\s\S]*?<\/tz-tabs>/.test(inner)) inner = inner.replace(/<tz-tabs\b[\s\S]*?<\/tz-tabs>/, '');
      if (inner.trim() !== '') strayInBand.push(rel + ' >> ' + inner.replace(/\s+/g, ' ').trim().slice(0, 80));
    }
  }
  ok('① 每个 `tz-tabs` 都包在 `<u-sticky …>` 带里（M5：列表一长页签就滚走）',
    pages.length > 0 && noSticky.length === 0, noSticky.join(' | '));
  ok('① 带子白底 + `:offsetTop="0"`（带底与下方灰底列区分，且在页面顶端吸住）',
    badStyle.length === 0, badStyle.join(' | '));
  ok('② 带内只有页签行本身（说明行 / chip 行留在带外）',
    strayInBand.length === 0, strayInBand.join(' | '));

  const comp = srcMap[TABS_COMP] || '';
  // 只认 `<template>` 那一段：script 里的注释会提到 `<tz-tabs @click>`（讲事件为什么重发），
  // 拿整份文件做「组件里有没有别的 tz-* 标签」会把文档当代码报（同 check-live-popup-height.js 的手法）
  const compTpl = stripHtmlComments((comp.match(/<template>([\s\S]*)<\/template>/) || ['', ''])[1]);
  ok('③ `components/tz/tabs.vue` 不再挂没传 list 的 `<tz-course>`（那只会渲染成 10px 空白块）',
    comp !== '' && !/<tz-course\b/.test(compTpl));
  ok('③ 组件只出 `u-tabs` 一行（页签组件不替调用页摆列表，M24「版式只有一份」）',
    /<u-tabs\b/.test(compTpl) && !/<tz-[a-z]/.test(compTpl),
    (compTpl.match(/<tz-[a-z-]+/g) || []).join(' '));

  return { pass, fail };
}

function readSources() {
  const map = {};
  for (const f of walk(SRC, [])) map[f] = fs.readFileSync(f, 'utf8');
  return map;
}

function report({ pass, fail }) {
  pass.forEach((n) => console.log('[PASS] ' + n));
  fail.forEach((n) => console.log('[FAIL] ' + n));
  console.log('\n结果：' + (fail.length ? '有 ' + fail.length + ' 项不符合预期' : '全部符合预期')
    + '（通过 ' + pass.length + ' 项 / 违反 ' + fail.length + ' 项）');
}

if (process.argv.includes('--selftest')) {
  const src = readSources();
  const gift = path.join(SRC, 'pages/app/send_friend/gift/gift.vue');
  const gb = path.join(SRC, 'pages/app/group_buy/index/index.vue');
  const samples = {
    '摘掉吸顶带': { [gift]: src[gift].replace(/<u-sticky[^>]*>\s*(<tz-tabs[^>]*\/>)\s*<\/u-sticky>/, '$1') },
    '带底改成透明': { [gb]: src[gb].replace('bgColor="#fff"', 'bgColor="none"') },
    '带里塞一行说明': { [gift]: src[gift].replace(/(<u-sticky[^>]*>)(\s*)(<tz-tabs)/, '$1$2<view class="sfg-scope">x</view>$2$3') },
    '组件把死挂件加回来': { [TABS_COMP]: src[TABS_COMP].replace(/(<\/u-tabs>)/, '$1\n        <tz-course></tz-course>') },
  };
  let red = 0;
  for (const name of Object.keys(samples)) {
    const over = samples[name];
    const changed = Object.keys(over).some((k) => over[k] !== src[k]);
    if (!changed) {
      console.log('[FAIL] 坏样件没能造出来（' + name + ' 的锚点文本变了，请同步本脚本）');
      continue;
    }
    const res = check(Object.assign({}, src, over));
    if (res.fail.length) {
      red++;
      console.log('[RED ] ' + name + ' -> ' + res.fail.length + ' 项报红：' + res.fail[0].slice(0, 60));
    } else {
      console.log('[MISS] ' + name + ' -> 没报红（判据失明）');
    }
  }
  console.log('\nSELFTEST ' + (red === 4 ? 'PASS：四颗坏样件全部报红' : 'FAIL：期望 4 颗全红，实得 ' + red));
  process.exit(red === 4 ? 0 : 1);
}

const res = check(readSources());
report(res);
process.exit(res.fail.length ? 1 : 0);
