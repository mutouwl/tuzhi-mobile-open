const fs = require('fs')
const path = require('path')

const manifestPath = path.resolve(__dirname, '../src/manifest.json')
const outputDir = path.resolve(__dirname, '../dist/build/mp-weixin')
const outputPath = path.join(outputDir, 'project.config.json')

function readMpWeixinAppid() {
  if (!fs.existsSync(manifestPath)) return ''

  const manifest = fs.readFileSync(manifestPath, 'utf8')
  const mpWeixinBlock = manifest.match(/"mp-weixin"\s*:\s*\{[\s\S]*?\n\s*\}/)
  if (!mpWeixinBlock) return ''

  const appid = mpWeixinBlock[0].match(/"appid"\s*:\s*"([^"]+)"/)
  return appid ? appid[1] : ''
}

if (!fs.existsSync(outputDir)) {
  console.log('[fix-mp-weixin-project-config] build directory not found, skipping.')
  process.exit(0)
}

const config = {
  appid: readMpWeixinAppid() || 'touristappid',
  compileType: 'miniprogram',
  miniprogramRoot: './',
  projectname: 'tuzhi-mobile',
  setting: {
    urlCheck: false,
    minified: true,
    postcss: true,
    es6: true,
    enhance: true,
    ignoreUploadUnusedFiles: true,
    lazyloadPlaceholderEnable: true
  },
  packOptions: {
    ignore: [
      { type: 'folder', value: 'mock' },
      { type: 'folder', value: 'components/qiun-data-charts/static/h5' },
      { type: 'folder', value: 'components/qiun-data-charts/static/app-plus' },
      { type: 'folder', value: 'components/video/assets/components' },
      { type: 'folder', value: 'common/utils/sdk' },
      { type: 'folder', value: 'static/lib/dms' },
      { type: 'file', value: 'components/video/assets/aliplayer-min.js' },
      { type: 'file', value: 'components/video/assets/aliplayer-min.css' },
      { type: 'file', value: 'components/video/assets/aliplayercomponents-1.0.9.min.js' },
      { type: 'file', value: 'static/assets/font/icon/iconfont.ttf' },
      { type: 'suffix', value: '.DS_Store' }
    ]
  }
}

fs.writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`)
console.log(`[fix-mp-weixin-project-config] Wrote ${path.relative(process.cwd(), outputPath)}.`)
