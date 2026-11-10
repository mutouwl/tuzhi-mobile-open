#!/usr/bin/env node
/**
 * 分销员招募条件「已达成 / 未达成」的数值比较门禁
 *
 * 口径出处：.trae/progress/trade.md 2026-11-03「分销等级升级条件按字符串比较」同族复核。
 * `userCondition.pay_price` 来自 MySQL SUM（PDO 回来是字符串），配置值也是字符串；
 * 模板里直接写 `'5.00' >= '10'`，JS 走的是字典序（'5' > '1'）⇒ 没达标会显示「已达成」。
 * 同类：pay_count（'3' >= '10' 也判真）。
 *
 * 用法：node tuzi-mobile/scripts/check-agent-recruit-condition.js
 */
const fs = require('fs');
const path = require('path');

const MOBILE = path.resolve(__dirname, '..');
const JS = path.join(MOBILE, 'src/pages/app/agent/member/recruit/js.vue');
const VUE = path.join(MOBILE, 'src/pages/app/agent/member/recruit/recruit.vue');

let checks = 0;
let failed = 0;
const failures = [];

function ok(name, cond, extra) {
    checks++;
    if (cond) {
        console.log(`  [PASS] ${name}`);
    } else {
        failed++;
        failures.push(name);
        console.log(`  [FAIL] ${name}${extra ? ' :: ' + extra : ''}`);
    }
}

function loadComponent(file) {
    const text = fs.readFileSync(file, 'utf8');
    const open = text.indexOf('<script');
    const bodyStart = text.indexOf('>', open) + 1;
    const bodyEnd = text.indexOf('</script>', bodyStart);
    if (open < 0 || bodyEnd < 0) {
        throw new Error('找不到 <script> 段：' + file);
    }
    const src = text.slice(bodyStart, bodyEnd).replace('export default', 'module.exports =');
    const mod = { exports: {} };
    // eslint-disable-next-line no-new-func
    new Function('module', src)(mod);
    return mod.exports;
}

function vmOf(comp, payCount, payPrice, needCount, needPrice) {
    return {
        userCondition: { pay_count: payCount, pay_price: payPrice },
        config: {
            member_recruit_condition_paycount_value: needCount,
            member_recruit_condition_payprice_value: needPrice,
        },
    };
}

function main() {
    const comp = loadComponent(JS);
    const computed = comp.computed || {};
    const template = fs.readFileSync(VUE, 'utf8');

    console.log('分销员招募条件（pay_count / pay_price）');

    ok('js.vue 有 payCountAchieved 计算属性', typeof computed.payCountAchieved === 'function');
    ok('js.vue 有 payPriceAchieved 计算属性', typeof computed.payPriceAchieved === 'function');

    if (typeof computed.payCountAchieved === 'function' && typeof computed.payPriceAchieved === 'function') {
        ok('消费笔数 5 < 10 判「未达成」', computed.payCountAchieved.call(vmOf(null, '5', '0', '10', '0')) === false);
        ok('消费笔数 10 >= 10 判「已达成」', computed.payCountAchieved.call(vmOf(null, '10', '0', '10', '0')) === true);
        ok('自购金额 5.00 < 10 判「未达成」', computed.payPriceAchieved.call(vmOf(null, '0', '5.00', '0', '10')) === false);
        ok('自购金额 10.00 >= 10 判「已达成」', computed.payPriceAchieved.call(vmOf(null, '0', '10.00', '0', '10')) === true);
        ok('自购金额 100.00 >= 20 判「已达成」', computed.payPriceAchieved.call(vmOf(null, '0', '100.00', '0', '20')) === true);
    }

    ok('模板用 payCountAchieved 而不是直接比字符串', template.indexOf('payCountAchieved ?') >= 0
        && template.indexOf('userCondition.pay_count >=') < 0);
    ok('模板用 payPriceAchieved 而不是直接比字符串', template.indexOf('payPriceAchieved ?') >= 0
        && template.indexOf('userCondition.pay_price >=') < 0);

    // 反例样件：证明这个门禁不是空断言（旧写法在 JS 里确实会走字典序）
    const oldCount = '5' >= '10';
    const newCount = Number('5') >= Number('10');
    ok('旧写法确实会把 5 笔判成已达成（字典序）', oldCount === true && newCount === false);

    console.log('');
    if (failed > 0) {
        console.log(`结论：${checks} 条断言里 ${failed} 条失败 —— ${failures.join('；')}`);
        process.exit(1);
    }
    console.log(`结论：${checks} 条断言全部通过`);
    process.exit(0);
}

main();
