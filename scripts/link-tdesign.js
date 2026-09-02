const fs = require('fs')
const path = require('path')

/**
 * 修复 @tdesign/uniapp 的 exports 字段导致 uni-app 编译 mp-weixin 时
 * .js/.wxss 和 .wxml/.json 输出路径不一致的问题。
 *
 * 原理：在 node_modules/@tdesign/uniapp/ 下为 dist/ 中的每个组件目录
 * 创建符号链接，使 @tdesign/uniapp/cell/cell.vue 直接通过符号链接
 * 解析到 dist/cell/cell.vue，编译器看到的是同一个物理路径，
 * 所有产物文件（.js/.wxss/.wxml/.json）输出到同一目录。
 */
const tdesignDir = path.resolve(__dirname, '../node_modules/@tdesign/uniapp')
const distDir = path.join(tdesignDir, 'dist')

if (!fs.existsSync(distDir)) {
  console.log('[link-tdesign] dist directory not found, skipping.')
  process.exit(0)
}

let linked = 0
const entries = fs.readdirSync(distDir, { withFileTypes: true })
for (const entry of entries) {
  if (!entry.isDirectory()) continue
  const name = entry.name
  const linkPath = path.join(tdesignDir, name)
  const targetPath = path.join('dist', name)

  // 已存在则跳过
  if (fs.existsSync(linkPath)) {
    const stat = fs.lstatSync(linkPath)
    if (stat.isSymbolicLink()) {
      // 已是符号链接，检查指向是否正确
      const current = fs.readlinkSync(linkPath)
      if (current === targetPath) continue
      fs.unlinkSync(linkPath)
    } else {
      // 是真实目录，跳过
      continue
    }
  }

  fs.symlinkSync(targetPath, linkPath)
  linked++
}

console.log(`[link-tdesign] Created ${linked} symlink(s).`)
