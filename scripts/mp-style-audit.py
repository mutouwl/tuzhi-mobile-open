#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""扫描 tuzi-mobile/src 中与微信小程序样式相关的风险点"""
import os, re, sys, json
from collections import defaultdict, Counter

ROOT = r"C:\Users\Admin\Documents\HBuilderProjects\selfbuild\tuzi-mobile\src"
SCAN_DIRS = [os.path.join(ROOT, "pages"), os.path.join(ROOT, "components", "tz")]
SCAN_DIRS.append(os.path.join(ROOT, "App.vue"))

def iter_files():
    for d in SCAN_DIRS:
        if os.path.isfile(d):
            yield d
            continue
        for dp, dn, fn in os.walk(d):
            for f in fn:
                if f.endswith(".vue") or f.endswith(".css"):
                    yield os.path.join(dp, f)

FILES = list(iter_files())

PATTERNS = [
    ("placeholder 伪元素", r"::placeholder"),
    ("placeholder-class 属性", r"placeholder-class"),
    ("placeholder-style 属性", r"placeholder-style"),
    ("原生 <button>", r"<button[\s>]"),
    ("button::after 重置", r"button\s*::?:\s*after"),
    ("<image>", r"<image[\s>]"),
    ("scroll-view", r"<scroll-view"),
    ("backdrop-filter", r"backdrop-filter"),
    ("filter: blur()", r"filter\s*:\s*blur"),
    ("display:grid", r"display\s*:\s*grid"),
    ("gap:", r"[;{(\s]gap\s*:"),
    ("100vh", r"100vh"),
    ("env(safe-area-inset", r"env\("),
    ("constant(safe-area-inset", r"constant\("),
    ("position:fixed", r"position\s*:\s*fixed"),
    ("position:sticky", r"position\s*:\s*sticky"),
    ("fit-content", r"fit-content"),
    ("-webkit-line-clamp", r"-webkit-line-clamp"),
    ("pointer-events", r"pointer-events"),
    ("!important", r"!important"),
    ("id 选择器 (#x {)", r"^\s*#[A-Za-z][\w-]*\s*[,{ ]"),
    ("标签选择器 view{/text{", r"^\s*(view|text|image|button|input|scroll-view)\s*[,{ ]"),
    ("属性选择器 [x=]", r"\[[a-zA-Z_-]+[~^$*|]?="),
    ("rpx", r"\d+rpx"),
    ("px 单位", r"\d+px"),
    ("1px 实线边框", r"1px\s+(solid|dashed)"),
    (":active", r":active"),
    (":nth-child", r":nth-child"),
    ("calc(", r"calc\("),
    ("::v-deep", r"::v-deep"),
    ("v-deep 指向 .u-", r"::v-deep[^{]*\.u-"),
    ("v-deep 指向 .t-", r"::v-deep[^{]*\.t-"),
    ("v-deep 指向 .uni-", r"::v-deep[^{]*\.uni-"),
    ("v-deep 指向 .tz-/.card", r"::v-deep[^{]*(\.tz-|\.card)"),
]

print("=" * 78)
print("A. 小程序兼容性风险点统计（范围：src/pages + src/components/tz + App.vue）")
print("=" * 78)
print("%-30s %8s %8s" % ("模式", "命中", "文件数"))
rows = []
for name, pat in PATTERNS:
    rx = re.compile(pat, re.M)
    hits = 0
    files = 0
    flist = []
    for fp in FILES:
        try:
            t = open(fp, encoding="utf-8", errors="replace").read()
        except Exception:
            continue
        m = rx.findall(t)
        if m:
            hits += len(m)
            files += 1
            flist.append(fp)
    rows.append((name, hits, files, flist))
    print("%-30s %8d %8d" % (name, hits, files))

# ---- B. 样式隔离分析：页面 style 是否 scoped ----
print()
print("=" * 78)
print("B. 页面 <style> scoped 情况")
print("=" * 78)
pages = [f for f in FILES if f.endswith(".vue") and "pages" in f]
scoped_cnt = 0
noscoped_cnt = 0
for f in pages:
    t = open(f, encoding="utf-8", errors="replace").read()
    blocks = re.findall(r"<style([^>]*)>", t)
    if not blocks:
        continue
    if all("scoped" in b for b in blocks):
        scoped_cnt += 1
    else:
        noscoped_cnt += 1
print("页面 .vue 总数: %d；全部 style 都 scoped: %d；存在非 scoped style: %d" % (len(pages), scoped_cnt, noscoped_cnt))

# ---- C. 跨页样式依赖（H5 全局泄漏被当作公共样式用） ----
def split_style_template(text):
    styles = re.findall(r"<style[^>]*>(.*?)</style>", text, re.S)
    tmpl = re.findall(r"<template>(.*?)</template>", text, re.S)
    return "\n".join(styles), "\n".join(tmpl)

def classes_used(tmpl):
    out = set()
    for m in re.findall(r'class\s*=\s*"([^"]*)"', tmpl):
        for c in re.split(r"[\s]+", m):
            c = c.strip()
            if c and not c.startswith("{") and not c.startswith("["):
                out.add(c)
    for m in re.findall(':class\\s*=\\s*"([^"]*)"', tmpl):
        for c in re.findall(r"['\"]([A-Za-z][\w-]*)['\"]", m):
            out.add(c)
    return out

def classes_defined(css):
    return set(re.findall(r"\.([A-Za-z][\w-]*)", css))

page_css = {}
page_used = {}
for f in pages:
    t = open(f, encoding="utf-8", errors="replace").read()
    st, tp = split_style_template(t)
    # 追一层 @import
    for imp in re.findall(r'@import\s+["\']([^"\']+)["\']', st):
        p = imp.lstrip("~@/").lstrip("/")
        cand = os.path.join(ROOT, p) if not imp.startswith("@/") else os.path.join(ROOT, imp[2:])
        if os.path.isfile(cand):
            st += "\n" + open(cand, encoding="utf-8", errors="replace").read()
    page_css[f] = classes_defined(st)
    page_used[f] = classes_used(tp)

def_def = defaultdict(list)
for f, cs in page_css.items():
    for c in cs:
        def_def[c].append(f)

cross = []
for f, used in page_used.items():
    for c in used:
        if c in page_css[f]:
            continue
        owners = def_def.get(c)
        if owners:
            cross.append((f, c, owners[0]))

print()
print("=" * 78)
print("C. 跨页样式依赖（A 页定义的类，被 B 页使用 → H5 靠全局泄漏生效，小程序失效）")
print("=" * 78)
print("命中条目数: %d" % len(cross))
byowner = Counter()
detail = defaultdict(list)
for f, c, o in cross:
    byowner[(o, c)] += 1
    detail[(o, c)].append(f)
for (o, c), n in byowner.most_common(40):
    print("  定义于 %-58s .%-22s 被 %d 个页面使用" % (
        os.path.relpath(o, ROOT).replace("\\", "/"), c, n))
