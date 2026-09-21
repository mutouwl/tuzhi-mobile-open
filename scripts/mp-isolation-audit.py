#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
量化「页面给自定义组件实例挂 class，但该类只在页面样式里定义」的情况。
微信小程序下 uni-app 自定义组件默认 styleIsolation=isolated，
页面样式无法作用到组件（连组件根节点也不行），H5 无隔离所以能生效。
仅 @tdesign/uniapp 与 tz/tab-bar、tz/icon 被构建脚本注入 shared。
"""
import os, re
from collections import Counter, defaultdict

ROOT = r"C:\Users\Admin\Documents\HBuilderProjects\selfbuild\tuzi-mobile\src"
DIRS = [os.path.join(ROOT, "pages"), os.path.join(ROOT, "components", "tz")]

def rel(p):
    return os.path.relpath(p, ROOT).replace("\\", "/")

SHARED = ("t-",)          # 构建脚本注入了 styleIsolation: shared
ISO = ("u-", "uni-", "tz-", "qiun-", "yingbing-")

files = []
for d in DIRS:
    for dp, dn, fn in os.walk(d):
        for f in fn:
            if f.endswith(".vue"):
                files.append(os.path.join(dp, f))

hits = defaultdict(list)      # 组件前缀 -> [(file, line, tag, cls)]
defined_cnt = Counter()
total = Counter()

for fp in files:
    t = open(fp, encoding="utf-8", errors="replace").read()
    styles = "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", t, re.S))
    # 追 @import 的 css 文件
    for imp in re.findall(r'@import\s+["\']([^"\']+)["\']', styles):
        cand = os.path.join(ROOT, imp.lstrip("~/"))
        if imp.startswith("@/"):
            cand = os.path.join(ROOT, imp[2:])
        if os.path.isfile(cand):
            styles += "\n" + open(cand, encoding="utf-8", errors="replace").read()
    defined = set(re.findall(r"\.([A-Za-z][\w-]*)", styles))

    # 组件标签（单标签或成对）
    for m in re.finditer(r"<((?:t|u|uni|tz|qiun|yingbing)[a-z0-9-]*)\b([^>]*)>", t):
        tag, attrs = m.group(1), m.group(2)
        prefix = next((p for p in ISO + SHARED if tag.startswith(p)), None)
        if not prefix:
            continue
        total[prefix] += 1
        cls = []
        cm = re.search(r'(?<![:\w])class\s*=\s*"([^"]*)"', attrs)
        if cm:
            cls += [c for c in cm.group(1).split() if c and "{" not in c]
        for ccm in re.findall(':class\s*=\s*"([^"]*)"|\:class\s*=\s*\'([^\']*)\'', attrs):
            raw = ccm[0] or ccm[1]
            cls += re.findall(r"['\"]([A-Za-z][\w-]*)['\"]", raw)
            for bare in re.findall(r"^\s*([A-Za-z][\w-]*)\s*$", raw):
                cls.append(bare)
        used_defined = [c for c in cls if c in defined]
        if used_defined:
            defined_cnt[prefix] += 1
            line = t[:m.start()].count("\n") + 1
            hits[prefix].append((rel(fp), line, tag, " ".join(sorted(set(used_defined)))))

print("=" * 84)
print("页面给组件实例挂 class，且该类由页面样式定义 → 小程序下失效（isolated）")
print("=" * 84)
print("%-10s %14s %22s" % ("组件前缀", "组件出现次数", "挂页面类的实例数"))
for p in ISO + SHARED:
    if total[p]:
        mark = "  ← shared，可生效" if p in SHARED else "  ← isolated，失效"
        print("%-10s %14d %22d%s" % (p, total[p], defined_cnt[p], mark))

print()
print("-" * 84)
print("按前缀列出实例（最多 8 条/前缀）")
print("-" * 84)
for p in ISO + SHARED:
    if not hits[p]:
        continue
    print("\n[%s] 共 %d 处" % (p, len(hits[p])))
    for f, l, tag, c in hits[p][:8]:
        print("   %s:%d  <%s class=\"%s\">" % (f, l, tag, c))
    if len(hits[p]) > 8:
        print("   ... 其余 %d 处省略" % (len(hits[p]) - 8))

# 汇总按文件，给出 TOP 文件
byfile = Counter()
for p in ISO:
    for f, l, tag, c in hits[p]:
        byfile[f] += 1
print()
print("=" * 84)
print("受影响最严重的文件 TOP 25")
print("=" * 84)
for f, n in byfile.most_common(25):
    print("  %-70s %d 处" % (f, n))
print("\n受影响文件总数: %d；失效实例总数: %d" % (len(byfile), sum(byfile.values())))
