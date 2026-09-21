#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""抽取小程序样式兼容问题的具体位置（file:line 证据）"""
import os, re
from collections import defaultdict

ROOT = r"C:\Users\Admin\Documents\HBuilderProjects\selfbuild\tuzi-mobile\src"
DIRS = [os.path.join(ROOT, "pages"), os.path.join(ROOT, "components", "tz")]

FILES = []
for d in DIRS:
    for dp, dn, fn in os.walk(d):
        for f in fn:
            if f.endswith(".vue") or f.endswith(".css"):
                FILES.append(os.path.join(dp, f))

def rel(p):
    return os.path.relpath(p, ROOT).replace("\\", "/")

def grep_lines(pat, limit=8):
    rx = re.compile(pat)
    out = []
    for fp in FILES:
        try:
            lines = open(fp, encoding="utf-8", errors="replace").read().split("\n")
        except Exception:
            continue
        for i, ln in enumerate(lines, 1):
            if rx.search(ln):
                out.append((rel(fp), i, ln.strip()[:110]))
                if len(out) >= limit:
                    return out
    return out

def dump(title, pat, limit=8):
    print("\n### %s" % title)
    for f, i, t in grep_lines(pat, limit):
        print("  %s:%d  %s" % (f, i, t))

dump("flex gap（iOS<14.5 不支持 flex gap）", r"[;{(\s]gap\s*:\s*[0-9]")
dump("backdrop-filter（WXSS 不支持）", r"backdrop-filter\s*:")
dump("::placeholder（WXSS 不支持）", r"::placeholder")
dump("display:grid", r"display\s*:\s*grid")
dump("position:sticky", r"position\s*:\s*sticky")

# 原生 button 且未重置 ::after
print("\n### 页面使用原生 <button> 但未重置 button::after（小程序默认边框/底色）")
n = 0
for fp in FILES:
    t = open(fp, encoding="utf-8", errors="replace").read()
    if re.search(r"<button[\s>]", t) and not re.search(r"button\s*::?:\s*after", t):
        used = len(re.findall(r"<button[\s>]", t))
        print("  %s  (button 出现 %d 次)" % (rel(fp), used))
        n += 1
        if n >= 20:
            print("  ... 其余省略")
            break

# <image> 未设宽高（style/class 中都没有 width/height）
print("\n### <image> 标签（小程序 image 默认 320x240，未设宽高会撑开）")
cnt = 0
for fp in FILES:
    t = open(fp, encoding="utf-8", errors="replace").read()
    for m in re.finditer(r"<image\b[^>]*>", t):
        tag = m.group(0)
        if re.search(r"(width|height|w-|h-|size)", tag):
            continue
        line = t[:m.start()].count("\n") + 1
        print("  %s:%d  %s" % (rel(fp), line, tag.replace("\n", " ")[:105]))
        cnt += 1
        if cnt >= 15:
            break
    if cnt >= 15:
        print("  ... 其余省略")
        break

# 100vh 与 safe-area 的样例
dump("100vh（小程序含/不含导航栏口径不同，键盘弹起会变）", r"100vh", 6)
dump("env(safe-area-inset-bottom) 缺 constant() 回退的文件", r"", 0) if False else None

print("\n### 用了 env(safe-area-inset-bottom) 但同文件没有 constant() 回退")
cnt = 0
for fp in FILES:
    t = open(fp, encoding="utf-8", errors="replace").read()
    if "env(safe-area-inset-bottom)" in t and "constant(safe-area-inset-bottom)" not in t:
        print("  %s" % rel(fp))
        cnt += 1
        if cnt >= 12:
            print("  ... 其余省略")
            break
