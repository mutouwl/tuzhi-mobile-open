const fs = require('fs')
const path = require('path')

const outputDir = path.resolve(__dirname, '../dist/build/mp-weixin')
const vendorPath = path.join(outputDir, 'common', 'vendor.js')

const baseUrlReplacement = "baseUrl:require('../static/config.js').default.apiUrl"
const redundantFiles = [
  path.join(outputDir, 'static', 'config.js-mpweixin'),
  path.join(outputDir, 'static', 'lib', 'alivc-im', 'README.md')
]

function relative(file) {
  return path.relative(process.cwd(), file)
}

function patchVendorBaseUrl() {
  if (!fs.existsSync(vendorPath)) {
    console.log('[postprocess-mp-weixin] common/vendor.js not found, skipping baseUrl patch.')
    return
  }

  const content = fs.readFileSync(vendorPath, 'utf8')
  if (content.includes(baseUrlReplacement)) {
    console.log('[postprocess-mp-weixin] common/vendor.js baseUrl already patched.')
    return
  }

  const fixed = content.replace(/baseUrl:[A-Za-z_$][\w$]*\.apiUrl/g, baseUrlReplacement)
  if (fixed === content) {
    throw new Error('[postprocess-mp-weixin] Cannot find baseUrl:<var>.apiUrl in common/vendor.js.')
  }

  fs.writeFileSync(vendorPath, fixed, 'utf8')
  console.log(`[postprocess-mp-weixin] Patched ${relative(vendorPath)}.`)
}

function removeRedundantFiles() {
  for (const file of redundantFiles) {
    if (!fs.existsSync(file)) continue
    fs.unlinkSync(file)
    console.log(`[postprocess-mp-weixin] Removed ${relative(file)}.`)
  }
}

if (!fs.existsSync(outputDir)) {
  console.log('[postprocess-mp-weixin] build directory not found, skipping.')
  process.exit(0)
}

patchVendorBaseUrl()
removeRedundantFiles()
