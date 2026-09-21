const Copy = require('rollup-plugin-copy');
module.exports = {
	transpileDependencies: ['uview-ui'],
	// AuthenticatorAttestationResponse
	// transpileDependencies
	// chainWebpack: config => {
	// 	// 忽略编译 config.js  
	// 	config.module.rule('js').exclude.add(/siteinfo\.js$/)
	// }
	chainWebpack: config => {
		// 忽略编译 config.js  

		// #ifdef MP // #endif
		// config.module.rule('js').exclude.add(/live\.js$/)
		// config.module.rule('js').exclude.add(/course\.js$/)
		config.module.rule('js').exclude.add(/siteinfo\.js$/)

		// #ifdef MP-WEIXIN
		// config.module.rule('json').exclude.add(/ext\.json$/)
		// #endif
	},
	configureWebpack: (config) => {
		// 如果你需要使用 rollup-plugin-copy 插件
		config.plugins.push(
			Copy({
				targets: [
					{
						src: 'src/common/utils/live.js',  // 需要复制的文件或文件夹路径
						dest: 'dist/build/mp-weixin/static/js' // 目标路径
					},
				],
				hook: 'writeBundle', // 何时进行复制，可以是 'buildStart', 'generateBundle' 或 'writeBundle'
			})
		);
	}

}