#!/usr/bin/env node
/**
 * 接口键名化验：源码里每一次 $api('a.b.c') / api('a.b.c') 调用，都能在 api_list.js 里取到
 *
 * 为什么要有这一条（2026-10-03 加，起因见下）：
 *   common/request/index.js 的 getApiObj 只有一句 `api = api[v]`，**没有存在性判断**。
 *   所以键名写错时它不是「发不出请求」，而是**同步抛 TypeError**：
 *     · 抛在调用方函数里 → 那一个函数当场中断，后面的收尾全不执行；
 *     · 典型症状是加载态的标志位永远停在初值（骨架屏撤不下来、按钮点了没反应），
 *       而接口层连一条错误日志都没有 —— 与 backend.md「app\common\exception\Exception 不是异常」
 *       同族的静默，只是这次静默在 JS 侧。
 *   sfc-check 只编译模板、不解析 api_list.js，ui-audit 按正则查版式，两条门禁都看不见它。
 *
 * 用法：
 *   node tuzi-mobile/scripts/check-api-keys.js
 *
 * 退出码 0 = 全部键名可解析；1 = 有调用点取不到键（逐条列出 file:line 与缺哪一段）
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '../src');
const API_LIST = path.join(SRC, 'common/request/api_list.js');

/** 递归列出源码里的 .js / .vue */
function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) {
      if (['node_modules', 'unpackage', 'dist'].includes(name)) continue;
      walk(full, out);
    } else if (name.endsWith('.js') || name.endsWith('.vue')) {
      out.push(full);
    }
  }
  return out;
}

/** 把 api_list.js 变成一个真正的对象（去掉 import/export 后求值） */
function loadApiList() {
  let src = fs.readFileSync(API_LIST, 'utf8');
  src = src.replace(/^\s*import .*$/gm, '');
  src = src.replace(/export\s+default\s+/, 'module.exports = ');
  src = src.replace(/^\s*export\s+(const|let|var|function|class)\s/gm, '$1 ');
  const mod = { exports: {} };
  new Function('module', 'exports', 'require', src)(mod, mod.exports, require);
  return mod.exports;
}

/** 与 getApiObj 同一句走法，但把「哪一段取不到」报出来 */
function resolve(apiList, key) {
  const parts = key.split('.');
  let node = apiList;
  for (const part of parts) {
    if (node === undefined || node === null) {
      return { ok: false, missingAt: part };
    }
    node = node[part];
  }
  if (node === undefined || node === null) {
    return { ok: false, missingAt: parts[parts.length - 1] };
  }
  if (typeof node.url !== 'string' || !node.method) {
    return { ok: false, missingAt: parts[parts.length - 1], notAnApi: true };
  }
  return { ok: true };
}

/**
 * 去掉注释，但保留字符串字面量与换行数（换行数要留着，报错行号才对得上）
 *
 * 手写状态机而不是正则：`url: 'http://x'` 这种字符串里含 `//`，
 * 直接正则删 `//.*` 会把后面真正的代码连同一块删掉。
 */
function stripComments(src) {
  let out = '';
  let i = 0;
  const n = src.length;
  let quote = null;      // ' " `
  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];

    if (quote) {
      out += c;
      if (c === '\\') {            // 转义：下一个字符原样带出
        out += src[i + 1] === undefined ? '' : src[i + 1];
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i++;
      continue;
    }

    if (c === '/' && c2 === '/') {          // 行注释
      while (i < n && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && c2 === '*') {          // 块注释
      i += 2;
      while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
        if (src[i] === '\n') out += '\n';   // 保住行号
        i++;
      }
      i += 2;
      continue;
    }
    if (c === '<' && src.substr(i, 4) === '<!--') {   // 模板里的 HTML 注释
      i += 4;
      while (i < n && src.substr(i, 3) !== '-->') {
        if (src[i] === '\n') out += '\n';
        i++;
      }
      i += 3;
      continue;
    }
    if (c === "'" || c === '"' || c === '`') {
      quote = c;
      out += c;
      i++;
      continue;
    }

    out += c;
    i++;
  }
  return out;
}

function main() {
  const apiList = loadApiList();
  const files = walk(SRC);
  const problems = [];
  const seen = new Set();
  let callCount = 0;

  // $api('a.b.c') 与 api('a.b.c')，以及 $api(`a.b.c`)
  const re = /\b\$?api\(\s*['"`]([A-Za-z0-9_.]+)['"`]/g;

  for (const file of files) {
    // api_list.js 自身与 mock 数据不算调用点
    if (file === API_LIST || file.includes(path.join('mock', ''))) continue;
    const text = stripComments(fs.readFileSync(file, 'utf8'));
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      let m;
      re.lastIndex = 0;
      while ((m = re.exec(line)) !== null) {
        const key = m[1];
        // upload.config 这类只有两段且本身就是叶子（apiList 里直接是 {url,...}）
        const parts = key.split('.');
        if (parts.length < 2) continue;
        callCount++;
        seen.add(key);
        const r = resolve(apiList, key);
        if (!r.ok) {
          problems.push({
            file: path.relative(SRC, file).replace(/\\/g, '/'),
            line: i + 1,
            key,
            why: r.notAnApi
              ? '取到了但不是一个接口定义（缺 url/method）'
              : `第「${r.missingAt}」段取不到`,
          });
        }
      }
    });
  }

  console.log(`扫描 ${files.length} 个源文件、${callCount} 处接口调用、${seen.size} 个不重复键名`);
  if (!problems.length) {
    console.log('[PASS] 每一处 $api() 调用都能在 api_list.js 里取到接口定义');
    return;
  }

  console.log(`[FAIL] ${problems.length} 处调用取不到键（getApiObj 会同步抛错，调用方当场中断）：`);
  for (const p of problems) {
    console.log(`  ${p.file}:${p.line}  ${p.key}  —— ${p.why}`);
  }
  console.log('\n修法：键名与 api_list.js 的层级逐段对上；新增接口先在 api_list.js 建条目再写调用点。');
  process.exit(1);
}

main();