const fs = require('fs')
const path = require('path')
const webpack = require('webpack')

// 修复 @tdesign/uniapp 在微信小程序下编译产物的路径不一致问题。
//
// 背景：
// - @tdesign/uniapp 源码物理位置在 node_modules/@tdesign/uniapp/dist/。
// - package.json 通过 exports 把 @tdesign/uniapp/$1 映射到 ./dist/$1。
// - 但 uni-app 在编译微信小程序时：
//     * webpack 模块产物 .js / .wxss 输出到非 dist/ 路径（按 import 路径）
//     * uni-app 编译器生成的 .wxml / .json 输出到 dist/ 路径（按物理路径）
//   两者路径不一致，且页面 .json 中 usingComponents 也是混着写。
// - 微信开发者工具运行时按 .json 里写的路径找组件，找不到就报错。
//
// 解决方案（三阶段）：
//
// 阶段 1 — processAssets 钩子（在 uni-app generate-component 之后）：
//   uni-app 的 generate-component 步骤为每个注册的组件 .js 追加 createComponent 包装，
//   但 @tdesign/uniapp 组件因为 exports 路径映射，在 componentSet 中的名字带 dist/，
//   而 webpack 资产名字不带 dist/，导致 generate-component 匹配不上、包装缺失。
//   本插件在更晚的 processAssets 阶段补充缺失的 createComponent 包装。
//
// 阶段 2 — afterEmit 钩子：
//   1. 把 dist/<comp>/ 下的 .wxml/.json 合并到 <comp>/（不复制 .js/.wxss，
//      避免用 dist/ 中的 Component({}) 存根覆盖 webpack 生成的完整文件）。
//   2. 修正所有产物中残留的 @tdesign/uniapp/dist/ 引用。
//   3. 将 easycom 生成的 TDesign 异步组件注册替换为桩组件（Vue render stub），
//      避免 Vue 尝试挂载没有 render 函数的原生小程序组件模块。
//   4. 给组件 .json 注入 styleIsolation: shared。

const TD_REL = path.join('node-modules', '@tdesign', 'uniapp')
const TD_PREFIX = TD_REL + '/'
const TD_DIST_PREFIX = TD_REL + '/dist/'

const { normalizePath } = require('@dcloudio/uni-cli-shared')
const { getMPRuntimePath } = require('@dcloudio/uni-cli-shared/lib/platform')

class FixTdesignMpPlugin {
  apply(compiler) {
    // ---- 阶段 1: 为 @tdesign 组件注入 createComponent 包装 ----
    compiler.hooks.compilation.tap('FixTdesignMpPlugin', (compilation) => {
      if (process.env.UNI_PLATFORM !== 'mp-weixin') return
      if (webpack.version[0] <= 4) return // 仅 webpack 5+

      compilation.hooks.processAssets.tap(
        {
          name: 'FixTdesignMpPlugin',
          // 与 uni-app generate-component 使用相同阶段，确保包装代码能被后续 minifier 正确处理
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
        },
        () => {
          this.injectCreateComponent(compilation, compiler)
        }
      )
    })

    // ---- 阶段 2: 文件合并、路径修正、styleIsolation 注入 ----
    compiler.hooks.afterEmit.tap('FixTdesignMpPlugin', () => {
      if (process.env.UNI_PLATFORM !== 'mp-weixin') return
      const outputDir = compiler.options.output.path
      if (!outputDir || !fs.existsSync(outputDir)) return

      // 将 src/1ext.json 复制为产物根目录下的 ext.json
      const extSrc = path.resolve(__dirname, 'src', '1ext.json')
      const extDst = path.join(outputDir, 'ext.json')
      if (fs.existsSync(extSrc)) {
        try { fs.copyFileSync(extSrc, extDst) } catch (e) {
          console.warn('[FixTdesignMpPlugin] copy ext.json failed:', e.message)
        }
      }

      // 将 src/static/config.js-mpweixin 复制为产物 static/config.js
      const configSrc = path.resolve(__dirname, 'src', 'static', 'config.js-mpweixin')
      const configDst = path.join(outputDir, 'static', 'config.js')
      if (fs.existsSync(configSrc)) {
        try { fs.copyFileSync(configSrc, configDst) } catch (e) {
          console.warn('[FixTdesignMpPlugin] copy config.js failed:', e.message)
        }
      }

      const tdRoot = path.join(outputDir, TD_REL)
      const distDir = path.join(tdRoot, 'dist')

      // 将 dist/<comp>/ 下的编译资源合并到 <comp>/。
      // 顶层组件的 .js/.wxss 由 webpack 输出到非 dist/ 路径，
      // 且 .js 已经过 createComponent 包装，
      // 而 dist/ 中的同名 .js 只是 Component({}) 存根，不能覆盖顶层产物。
      // 但日历的 template.js/calendar-header.js 等子组件资源只存在于 dist/，
      // 若不复制到目标路径，calendar.json 的 usingComponents 会在运行时找不到模块。
      // 注意：不删除 dist/ 目录！WeChat DevTools 的文件监视器可能在 afterEmit
      // 之前就已扫描了 dist/ 下的 .json 文件，如果此时删除 dist/，DevTools 会
      // 尝试打开已删除的文件导致 ENOENT 错误。dist/ 下的 .json 会被 walkAndFix
      // 统一修正路径，最终引用均指向正确位置。
      if (fs.existsSync(distDir)) {
        const COPY_ALWAYS_EXTS = new Set(['.wxml', '.json'])
        const COPY_MISSING_EXTS = new Set(['.js', '.wxss'])
        for (const entry of fs.readdirSync(distDir, { withFileTypes: true })) {
          if (!entry.isDirectory()) continue
          const from = path.join(distDir, entry.name)
          const to = path.join(tdRoot, entry.name)
          if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true })
          for (const f of fs.readdirSync(from)) {
            const ext = path.extname(f).toLowerCase()
            if (!COPY_ALWAYS_EXTS.has(ext) && !COPY_MISSING_EXTS.has(ext)) continue
            const target = path.join(to, f)
            if (COPY_ALWAYS_EXTS.has(ext) || !fs.existsSync(target)) {
              fs.copyFileSync(path.join(from, f), target)
            }
          }
        }
      }

      // 修正所有产物中残留的 @tdesign/uniapp/dist/ 引用
      this.walkAndFix(outputDir)

      // 将 easycom 生成的 TDesign 异步组件注册替换为桩组件，
      // 避免 Vue 尝试挂载没有 render 函数的原生小程序组件模块
      this.stubTdesignAsyncComponents(outputDir)

      // 置空 icon.wxss（141KB 字体图标 CSS）。
      // 微信小程序中 t-icon 通过 usingComponents 注册为原生组件，
      // icon.wxss 中的 @font-face 和数千个 .t-icon--xxx 选择器
      // 对原生组件渲染无实际作用（原生组件样式由 .wxss 自行隔离），
      // 但会被 webpack 收集进主包，严重占用主包体积。
      // t-button / t-cell 内部引用了 <t-icon>，所以即使模板中
      // 没有直接使用 <t-icon>，icon.wxss 仍会被打包。
      this.emptyTdesignIconWxss(outputDir)

      // 给 @tdesign/uniapp 组件的 .json 注入 styleIsolation: shared
      this.injectStyleIsolation(path.join(outputDir, TD_REL))
      // tz/tab-bar 也需要 styleIsolation: shared 才能让 ::v-deep 样式穿透到 @tdesign 子组件
      this.ensureStyleIsolation(path.join(outputDir, 'components', 'tz', 'tab-bar.json'))
      this.ensureStyleIsolation(path.join(outputDir, 'components', 'tz', 'icon.json'))
    })
  }

  /**
   * 为 @tdesign/uniapp 组件的 .js 资产追加 createComponent 包装。
   * 原理：uni-app 的 generate-component 步骤会遍历 componentSet 中的组件，
   * 为每个组件 .js 追加一段 createComponent 调用。但 @tdesign 组件在
   * componentSet 中的注册名带 dist/（物理路径），而 webpack 资产名不带 dist/
   * （exports 解析路径），导致匹配不上，包装缺失。
   */
  injectCreateComponent(compilation, compiler) {
    // 1. 找到 uni-app mp 运行时模块的 ID（导出 createComponent 的模块）
    const uniRuntimeModuleId = this.findUniRuntimeModuleId(compilation)
    if (uniRuntimeModuleId == null) return

    // 2. 获取 jsonpFunction 名称
    const jsonpFunction = compiler.options.output.chunkLoadingGlobal ||
      compiler.options.output.jsonpFunction || 'webpackChunktuzhi'

    // 3. 遍历所有 webpack 资产，找出 @tdesign 组件 .js
    const assets = compilation.getAssets()
    const allModules = Array.from(compilation.modules)

    for (const asset of assets) {
      const name = asset.name
      if (!name.startsWith(TD_PREFIX) || !name.endsWith('.js')) continue
      if (name.includes('create-component')) continue
      // 跳过 dist/ 路径的资产（afterEmit 阶段会清理并合并）
      if (name.startsWith(TD_DIST_PREFIX)) continue

      const src = asset.source.source()
      if (typeof src !== 'string') continue
      if (src.includes('createComponent')) continue

      const compModule = this.findModuleForAsset(compilation, allModules, name)
      const moduleId = compModule ? this.getModuleId(compilation, compModule) : null
      if (moduleId == null) continue

      const chunkName = name.replace('.js', '-create-component')
      const wrapper = `;(global["${jsonpFunction}"]=global["${jsonpFunction}"]||[]).push([["${chunkName}"],{},function(e){e(${JSON.stringify(uniRuntimeModuleId)}).createComponent(e(${JSON.stringify(moduleId)}))}]);`

      const newSource = new webpack.sources.RawSource(src + wrapper)
      compilation.updateAsset(name, newSource)
    }
  }

  /**
   * 查找 uni-app mp 运行时模块（导出 createComponent 的模块）。
   * 与 uni-app generate-component.js 使用完全相同的方法：
   * 通过 getMPRuntimePath() 获取运行时入口文件的绝对路径，
   * 然后在 compilation.modules 中精确匹配。
   */
  findUniRuntimeModuleId(compilation) {
    const uniPath = normalizePath(getMPRuntimePath())
    const modules = Array.from(compilation.modules)

    // 方式 1: 直接匹配顶层模块
    let uniModule = modules.find(
      mod => mod.resource && normalizePath(mod.resource) === uniPath
    )
    // 方式 2: webpack 5 scope hoisting — 运行时可能被合并到 concatenated module
    if (!uniModule && webpack.version[0] > 4) {
      uniModule = modules.find(
        mod => mod.rootModule && mod.rootModule.resource &&
          normalizePath(mod.rootModule.resource) === uniPath
      )
    }

    if (!uniModule) {
      console.error('[FixTdesignMpPlugin] 未找到 uni runtime 模块, uniPath=', uniPath)
      return null
    }
    return this.getModuleId(compilation, uniModule)
  }

  /**
   * 查找组件对应的 webpack 模块 ID。
   * @tdesign 组件经过 Vue loader 处理后，module.resource 带有查询参数
   * (如 ?vue&type=script)，所以需要用模糊匹配。
   */
  findModuleForAsset(compilation, allModules, assetName) {
    const nameNoExt = assetName.replace('.js', '')
    const compName = nameNoExt.substring(TD_PREFIX.length)
    const distSearchStr = '@tdesign/uniapp/dist/' + compName

    // 优先在 concatenated modules 中查找（scope hoisting 场景）
    for (const mod of allModules) {
      if (!mod.modules) continue
      for (const inner of mod.modules) {
        if (!inner.resource) continue
        if (inner.resource.includes(distSearchStr) && inner.resource.includes('type=script')) {
          return mod
        }
      }
    }

    // 回退：在顶层模块中查找
    for (const mod of allModules) {
      if (!mod.resource) continue
      if (mod.resource.includes(distSearchStr) && mod.resource.includes('type=script')) {
        return mod
      }
    }

    // 最后回退：不带 type=script 过滤
    for (const mod of allModules) {
      if (!mod.resource) continue
      if (mod.resource.includes(distSearchStr)) return mod
    }
    for (const mod of allModules) {
      if (!mod.modules) continue
      for (const inner of mod.modules) {
        if (!inner.resource) continue
        if (inner.resource.includes(distSearchStr)) return mod
      }
    }
    return null
  }

  getModuleId(compilation, mod) {
    if (!mod) return null
    return webpack.version[0] > 4
      ? compilation.chunkGraph.getModuleId(mod)
      : mod.id
  }

  /**
   * 将 easycom 生成的 TDesign 异步组件注册替换为桩组件。
   * easycom 为每个 TDesign 组件生成异步工厂函数，加载原生小程序组件模块。
   * 但这些模块只有 Component({}) 没有 Vue render 函数，导致 Vue 挂载失败。
   * 替换为返回带 render 函数的桩对象，让 Vue 跳过挂载，
   * 实际渲染由原生小程序运行时通过 usingComponents 处理。
   */
  stubTdesignAsyncComponents(outputDir) {
    // 匹配 easycom / script 生成的异步组件加载器：
    // 生产压缩包：Promise.all([...]).then(n.bind(n, NNNN))
    // 开发包模板：Promise.all(/* import() ... */ [...]).then(n.bind(n, /* ... */ "./node_modules/..."))
    // 开发包 script：Promise.all(/* require.ensure ... */ [...]).then(function(){...}.bind(null,n))["catch"](n.oe)
    // 这些写法都必须替换，否则 Vue 会尝试挂载没有 render 的原生组件模块。
    const ASYNC_LOADER_RES = [
      /Promise\.all\((?:\/\*[\s\S]*?\*\/\s*)?\[[^\]]*?@tdesign\/uniapp\/[^\]]*?\]\)\.then\(\w+\.bind\(\w+,[\s\S]*?\)\)/g,
      /Promise\.all\((?:\/\*[\s\S]*?\*\/\s*)?\[[^\]]*?@tdesign\/uniapp\/[^\]]*?\]\)\.then\(function\(\)\{return resolve\([\s\S]*?\}\.bind\(null,\w+\)\)\s*(?:\[\s*["']catch["']\s*\]|\.catch)\(\w+\.oe\)/g
    ]
    // 桩组件：返回一个带空 render 函数的 Vue 组件对象
    const STUB = '(function(){return{render:function(h){return h("view",this.$slots.default)}}})()'

    this.walkJsFiles(outputDir, (filePath) => {
      let content
      try { content = fs.readFileSync(filePath, 'utf8') } catch (e) { return }
      if (!content.includes('@tdesign/uniapp')) return
      const fixed = ASYNC_LOADER_RES.reduce((source, re) => source.replace(re, STUB), content)
      if (fixed !== content) {
        fs.writeFileSync(filePath, fixed, 'utf8')
      }
    })
  }

  /**
   * 置空 icon.wxss：保留文件路径（避免 DevTools ENOENT），但清空内容以释放体积。
   * icon.wxss 包含 @font-face 和数千个图标选择器（~141KB），
   * 在微信小程序原生组件模式下无实际渲染作用。
   */
  emptyTdesignIconWxss(outputDir) {
    const targets = [
      path.join(outputDir, TD_REL, 'icon', 'icon.wxss'),
      path.join(outputDir, TD_REL, 'dist', 'icon', 'icon.wxss')
    ]
    for (const f of targets) {
      if (fs.existsSync(f)) {
        try { fs.writeFileSync(f, '', 'utf8') } catch (e) {
          console.warn('[FixTdesignMpPlugin] empty icon.wxss failed:', f, e.message)
        }
      }
    }
  }

  walkJsFiles(dir, cb) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        this.walkJsFiles(full, cb)
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        cb(full)
      }
    }
  }

  injectStyleIsolation(tdRoot) {
    if (!fs.existsSync(tdRoot)) return
    for (const entry of fs.readdirSync(tdRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const jsonPath = path.join(tdRoot, entry.name, `${entry.name}.json`)
      if (!fs.existsSync(jsonPath)) continue
      let json
      try { json = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) } catch (e) { continue }
      if (json.styleIsolation) continue
      json.styleIsolation = 'shared'
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8')
    }
  }

  ensureStyleIsolation(jsonPath) {
    if (!fs.existsSync(jsonPath)) return
    let json
    try { json = JSON.parse(fs.readFileSync(jsonPath, 'utf8')) } catch (e) { return }
    if (json.styleIsolation) return
    json.styleIsolation = 'shared'
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8')
  }

  walkAndFix(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        this.walkAndFix(full)
      } else if (entry.isFile() && /\.(json|wxml|js|wxss)$/.test(entry.name)) {
        let content
        try { content = fs.readFileSync(full, 'utf8') } catch (e) { continue }
        if (!content.includes('@tdesign/uniapp')) continue
        // 压缩构建时，uni-app 偶尔会把组件引用写成
        // /../../../../Users/.../node-modules/@tdesign/uniapp/...。
        // 小程序组件路径必须从 miniprogramRoot（产物根目录）开始，
        // 否则微信开发者工具会把它解析到一个不存在的绝对路径。
        const fixed = content
          .replace(/@tdesign\/uniapp\/dist\//g, '@tdesign/uniapp/')
          .replace(/\/(?:\.\.\/)+[^"'\\\s]*?node-modules\/(@tdesign\/uniapp)\//g, '/node-modules/$1/')
        if (fixed !== content) fs.writeFileSync(full, fixed, 'utf8')
      }
    }
  }

  rmrf(p) {
    if (!fs.existsSync(p)) return
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, entry.name)
      if (entry.isDirectory()) this.rmrf(full)
      else fs.unlinkSync(full)
    }
    fs.rmdirSync(p)
  }
}

/**
 * 删除产物中冗余的 static 子目录。
 *
 * 背景：
 * - uniapp 默认会把 src/static/ 整个目录原样拷贝到产物。
 * - 项目中 src/static/lib/dms/dms.js（及其依赖 mqtt.js）已经被 webpack 通过
 *   `import ROP from "@/static/lib/dms/dms.js"` 打包进 vendor/分包 chunk，
 *   产物中的原始拷贝是重复的，会显著增大主包体积（mqtt.js ~418KB）。
 * - manifest.json 中 mp-weixin.exclude 字段并非官方标准，实测对 static 目录
 *   下的子路径不生效，因此通过 webpack afterEmit 钩子主动处理。
 *
 * 注意：不能直接删除文件，因为微信开发者工具的文件监视器会在 afterEmit 之前
 * 就扫描并记录这些文件路径，afterEmit 中删除后 DevTools 自动预览/上传时仍会
 * 尝试打开原路径文件而触发 ENOENT。这里改为将文件内容置空（写入 1 字节空字符），
 * 既能让 DevTools 正常打开，又能将体积压缩到接近 0。
 */
class RemoveRedundantStaticPlugin {
  constructor(options) {
    this.targets = (options && options.targets) || []
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('RemoveRedundantStaticPlugin', () => {
      const outputDir = compiler.options.output.path
      if (!outputDir || !fs.existsSync(outputDir)) return

      for (const rel of this.targets) {
        const full = path.join(outputDir, rel)
        if (!fs.existsSync(full)) continue
        try {
          if (fs.statSync(full).isDirectory()) {
            this.emptyDir(full)
          } else {
            this.emptyFile(full)
          }
        } catch (e) {
          console.warn('[RemoveRedundantStaticPlugin] empty failed:', full, e.message)
        }
      }
    })
  }

  /**
   * 递归把目录下所有文件内容置空，但保留文件本身和目录结构，
   * 防止 IDE / DevTools 因找不到文件路径而报 ENOENT。
   */
  emptyDir(p) {
    if (!fs.existsSync(p)) return
    for (const entry of fs.readdirSync(p, { withFileTypes: true })) {
      const full = path.join(p, entry.name)
      if (entry.isDirectory()) this.emptyDir(full)
      else this.emptyFile(full)
    }
  }

  emptyFile(file) {
    try {
      fs.writeFileSync(file, '')
    } catch (e) {
      console.warn('[RemoveRedundantStaticPlugin] write empty failed:', file, e.message)
    }
  }
}

module.exports = {
  transpileDependencies: ['@tdesign/uniapp'],
  configureWebpack: {
    plugins: [
      new FixTdesignMpPlugin(),
      new RemoveRedundantStaticPlugin({
        targets: ['static/lib/dms']
      })
    ]
  },
  chainWebpack: config => {
    config.module
      .rule('ts')
      .test(/\.ts$/)
      .use('babel-loader')
      .loader('babel-loader')
      .end()
  }
}
