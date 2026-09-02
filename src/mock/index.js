// #ifdef H5
import config from '@/static/config.js'
// #endif

let mockContext = null

function getMockContext() {
	// #ifdef H5
	if (!mockContext) {
		mockContext = require.context('./data', true, /\.json$/)
	}
	// #endif
	return mockContext
}

/**
 * 判断当前请求是否启用 Mock
 * 优先级：options.mock（请求级）> config.enableMock（配置文件开关）> uni.getStorageSync('enableMock')（运行时）> 构建环境变量
 * 仅在 H5 开发环境生效
 * @param {Object} options - 请求配置项
 * @returns {Boolean}
 */
function isMockEnabled(options = {}) {
	// Mock 仅在 H5 开发环境生效
	if (process.env.NODE_ENV !== 'development') {
		return false
	}

	// 1. 请求级开关（单接口强制 mock / 强制走真实接口）
	if (options.mock === true) {
		return true
	}
	if (options.mock === false) {
		return false
	}

	// 2. 配置文件开关（src/static/config.js 的 enableMock，显式指定时优先于运行时/环境变量）
	// #ifdef H5
	if (config.enableMock === true || config.enableMock === 'true' || config.enableMock === 1 || config.enableMock === '1') {
		return true
	}
	if (config.enableMock === false || config.enableMock === 'false' || config.enableMock === 0 || config.enableMock === '0') {
		return false
	}
	// #endif

	// 3. 运行时开关（浏览器控制台临时切换，配置文件未显式指定时才生效）
	const storageMock = uni.getStorageSync('enableMock')
	if (storageMock === true || storageMock === 'true' || storageMock === 1 || storageMock === '1') {
		return true
	}

	// 4. 构建环境变量（.env 文件或启动命令注入，vue-cli 仅注入 VUE_APP_ 前缀变量）
	const envMock = process.env.VUE_APP_MOCK_ENABLE || process.env.MOCK_ENABLE
	if (envMock === true || envMock === 'true' || envMock === 1 || envMock === '1') {
		return true
	}

	return false
}

/**
 * 将请求 URL 归一化为路由
 * @param {String} url - 完整请求地址
 * @param {String} baseUrl - 接口基础地址
 * @returns {String}
 */
function normalizeRoute(url, baseUrl) {
	if (!url) {
		return ''
	}

	let route = url

	if (baseUrl && route.indexOf(baseUrl) === 0) {
		route = route.substring(baseUrl.length)
	} else if (/^https?:\/\//.test(route)) {
		const matched = route.match(/^https?:\/\/[^/]+(\/.*)$/)
		route = matched ? matched[1] : route
	}

	route = route.replace(/^\/+/, '')
	route = route.split('?')[0].split('#')[0]

	return route
}

/**
 * 获取 Mock 文件路径
 * @param {String} route - 归一化后的路由，如 app/course/index
 * @returns {String}
 */
function getMockFilePath(route) {
	return `src/mock/data/${route}.json`
}

/**
 * 尝试加载指定路由的 Mock 数据
 * 仅在 H5 开发环境下生效
 * @param {String} route - 归一化后的路由
 * @returns {Object|null}
 */
function tryLoadMock(route) {
	// #ifndef H5
	return null
	// #endif

	// #ifdef H5
	if (!route || process.env.NODE_ENV !== 'development') {
		return null
	}
	const context = getMockContext()
	if (!context) {
		return null
	}
	const key = `./${route}.json`
	const keys = context.keys()
	if (keys.indexOf(key) === -1) {
		return null
	}
	return context(key)
	// #endif
}

/**
 * 将数据包装为标准响应结构
 * @param {*} data - 响应数据
 * @param {Number} code - 状态码
 * @param {String} msg - 提示信息
 * @returns {Object}
 */
function wrapMockResponse(data, code = 1, msg = 'success') {
	return {
		code,
		msg,
		data
	}
}

export default {
	isMockEnabled,
	normalizeRoute,
	getMockFilePath,
	tryLoadMock,
	wrapMockResponse
}

export {
	isMockEnabled,
	normalizeRoute,
	getMockFilePath,
	tryLoadMock,
	wrapMockResponse
}
