// import {API_URL} from '@/env'
// import router from '@/common/router'

export default {
	isWechat() {
		// #ifdef MP-WEIXIN
		return false;
		// #endif
		// #ifdef H5
		var ua = window.navigator.userAgent.toLowerCase();
		if (ua.match(/MicroMessenger/i) == 'micromessenger') {
			return true; // 微信中打开
		} else {
			return false; // 普通浏览器中打开
		}
		// #endif
		return false;
	},
	//是否为微信小程序
	isMpWechat() {
		// #ifdef MP-WEIXIN
		return true;
		// #endif
		return false;
	},
	systemConfig(name) {
		var config = uni.getStorageSync('systemConfig');
		if (config) {
			config = JSON.parse(config);
			if (config.hasOwnProperty(name)) {
				return config[name];
			}
		}

		return '';
	},
	/**
	 * 跳转再封装，不支持复杂传参。
	 */
	routerTo(path, params = {}, isLogin) {
		let objParams = params;
		// 是否跳转外部链接
		if (~path.indexOf('http')) {
			// #ifdef H5
			window.location = path;
			// #endif
			// #ifndef  H5
			router.push({
				path: '/pages/public/webview',
				query: {
					'webviewPath': path
				}
			})
			// #endif
			return false
		}
		// 判断是否有参数
		if (path.indexOf('?') !== -1) {
			let index = path.lastIndexOf('?');
			let query = path.substring(index + 1, path.length);
			let arr = query.split('&')
			path = path.slice(0, index);
			arr.forEach(item => {
				let mArr = item.split('=');
				objParams[mArr[0]] = mArr[1]
			})
		}
		// 判断是否是tabbar
		if (isLogin) {
			router.replaceAll({
				path: path,
				query: objParams
			})
		} else {
			router.push({
				path: path,
				query: objParams
			})
		}

	},
	/**
	 * fn：检测图片协议，主要用于检测海报图片协议。
	 * param(imgPath): 图片地址。
	 */

	checkImgHttp(imgPath) {
		let newPath = '';
		if (imgPath.indexOf('data:image/svg+xml') !== -1) {
			newPath = '/static/imgs/base_avatar.png'
		} else {
			let pathArr = imgPath.split('://');
			// #ifdef H5
			let ishttps = 'https:' == window.location.protocol ? true : false;
			ishttps ? (pathArr[0] = 'https') : (pathArr[0] = 'http');
			// #endif
			newPath = pathArr.join('://');
		}
		return newPath;
	},
	// 打电话
	callPhone(phoneNumber = '') {
		let num = phoneNumber.toString()
		uni.makePhoneCall({
			phoneNumber: num,
			fail(err) {
				console.log('makePhoneCall出错 - tools.js:107', err)
			},
		});
	},
	// 图片处理-选择图片
	chooseImage(count = 1) {
		return new Promise((resolve, reject) => {
			uni.chooseImage({
				count: count, //默认9
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album'], //从相册选择
				success: res => {
					resolve(res.tempFilePaths);
				}
			});
		}).catch(e => {
			reject(e)
		})
	},
	openDocument(url, fileName = '') {
		let config_url = this.systemConfig('apiUrl');
		let token = uni.getStorageSync('user_token');
		// 获取文件类型
		let fileType = this.getFileType(fileName || url);
		uni.showLoading({
			title:'正在加载文件',
			mask:true
		})
		uni.downloadFile({
			url: url, //仅为示例，并非真实的资源
			header: {
				token: token,
				'platform': uni.getStorageSync('platform'),
				// #ifdef MP-WEIXIN || MP-TOUTIAO
				//模拟ajax请求 避免微擎后台开启【获取用户信息】后弹出授权框
				'X-Requested-With': 'xmlhttprequest'
				// #endif
			},
			success: (res) => {
				uni.hideLoading();
				wx.openDocument({
					filePath: res.tempFilePath,
					fileType: fileType,
					success: function (res) {
					},
					fail: (err) => {
						uni.$u.toast('预览异常,请刷新重试');
						
					}
				})
			},
			fail: (err) => {
				uni.hideLoading();
				uni.$u.toast('下载失败');
			}
		});
	},
	download(url) {
		let config_url = this.systemConfig('apiUrl');

		let token = uni.getStorageSync('user_token');
		uni.showLoading({
			title:'加载中'
		})
		uni.downloadFile({
			url: url, //仅为示例，并非真实的资源
			header: {
				token: token,
				'platform': uni.getStorageSync('platform'),
				// #ifdef MP-WEIXIN || MP-TOUTIAO
				//模拟ajax请求 避免微擎后台开启【获取用户信息】后弹出授权框
				'X-Requested-With': 'xmlhttprequest'
				// #endif
			},
			success: (res) => {
				uni.hideLoading();
				// #ifdef MP-WEIXIN || MP-TOUTIAO
				console.log(res.tempFilePath);
				uni.getFileSystemManager().saveFile({
					tempFilePath: res.tempFilePath,
					success: (res) => {
						console.log("res - tools.js:188",res)
						uni.showToast({
							title: '下载成功'
						})
					},
					fail: (err) => {
						uni.$u.toast('保存文件失败');
					}
				})
				// #endif
				// #ifdef H5
				uni.showToast({
					title: '下载成功'
				})
				// #endif
			},
			fail: (err) => {
				uni.hideLoading();
				uni.$u.toast('下载失败');
			}
		});
	},
	// 图片处理-上传图片
	// opts: { fileType: 'image'|'video'|'audio'|'file', name: 文件名, size: 字节数, directUpload: false 可强制服务器中转 }
	// 分流：视频在 VOD 启用且配置完整时默认直传；否则仅在 OSS 启用且 uploadmode=client 时直传；其余服务器中转。
	uploadImage(api, url, opts = {}) {
		let config_url = this.systemConfig('apiUrl');
		uni.showLoading({
			title: '上传中'
		});
		const token = uni.getStorageSync('user_token');
		const fileType = opts.fileType || '';
		// 保留显式强制中转能力；圈子上传默认不传此项，完全按后台 OSS/VOD 配置分流。
		if (opts.directUpload === false) {
			return this.uploadServer(api, url, config_url, token).catch(e => {
				uni.hideLoading();
				uni.$u.toast('上传失败');
				throw e;
			});
		}
		// 每次真正上传前强制读取最新配置，后台刚切换启用状态/上传模式时立即生效。
		return this.getUploadConfig(true).then(cfg => {
			const strategy = this.getUploadStrategy(cfg, fileType);
			if (strategy === 'vod') return this.uploadVod(url, opts);
			if (strategy === 'oss') return this.uploadOss(url, opts);
			return this.uploadServer(api, url, config_url, token);
		}).catch(e => {
			uni.hideLoading();
			uni.$u.toast('上传失败');
			throw e;
		})
	},
	// 纯策略判断：VOD 没有直连/中转字段，启用且配置完整即默认直传；OSS 继续按 uploadmode 判断。
	getUploadStrategy(cfg, fileType) {
		const vod = (cfg && cfg.vod) || {};
		const oss = (cfg && cfg.oss) || {};
		if (fileType === 'video' && vod.status === 'open') {
			return Number(vod.direct === undefined ? 1 : vod.direct) === 1 ? 'vod' : 'server';
		}
		if (oss.status === 'open') {
			return oss.uploadmode === 'client' && Number(oss.direct === undefined ? 1 : oss.direct) === 1 ? 'oss' : 'server';
		}
		return 'server';
	},
	// 服务器中转上传（既有链路）
	uploadServer(api, url, config_url, token) {
		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: config_url + api,
				filePath: url,
				method: 'POST',
				header: {
					token: token,
					'platform': uni.getStorageSync('platform'),
					// #ifdef MP-WEIXIN || MP-TOUTIAO
					//模拟ajax请求 避免微擎后台开启【获取用户信息】后弹出授权框
					'X-Requested-With': 'xmlhttprequest'
					// #endif
				},
				name: 'file',
				success: res => {
					let data = null;
					try {
						data = JSON.parse(res.data);
					} catch (e) {
						data = null;
					}
					if (data && data.code === 1) {
						uni.hideLoading();
						uni.showToast({
							title: '上传成功',
							icon: 'none'
						});
						resolve(data.data)
					} else {
						// 上传失败（服务端返回错误）：必须 reject，否则调用方 promise 永远挂起，
						// 上传中状态无法复位，发布页底部操作按钮保持禁用
						uni.hideLoading();
						uni.$u.toast((data && data.msg) || '上传失败');
						reject(new Error((data && data.msg) || '上传失败'))
					}
				},
				// 网络异常/中断：同样要 reject，避免上传状态无法复位
				fail: err => {
					uni.hideLoading();
					reject(err)
				}
			});
		})
	},
	// 上传分流配置（普通读取可缓存；真正上传 force=true 刷新；同一批并发文件复用一个在途请求）
	_uploadConfigCache: null,
	_uploadConfigTime: 0,
	_uploadConfigPromise: null,
	getUploadConfig(force) {
		const now = Date.now();
		if (!force && this._uploadConfigCache && now - this._uploadConfigTime < 300000) {
			return Promise.resolve(this._uploadConfigCache);
		}
		const cached = uni.getStorageSync('uploadConfig');
		const cachedTime = uni.getStorageSync('uploadConfigTime') || 0;
		if (!force && cached && cachedTime && now - Number(cachedTime) < 300000) {
			this._uploadConfigCache = cached;
			this._uploadConfigTime = Number(cachedTime);
			return Promise.resolve(cached);
		}
		if (this._uploadConfigPromise) return this._uploadConfigPromise;
		const api = require('../request').default;
		const request = api('upload.config', {}).then(res => {
			if (res && res.code === 1 && res.data) {
				this._uploadConfigCache = res.data;
				this._uploadConfigTime = Date.now();
				uni.setStorageSync('uploadConfig', res.data);
				uni.setStorageSync('uploadConfigTime', Date.now());
				return res.data;
			}
			return null;
		}).catch(() => null);
		this._uploadConfigPromise = request.then(result => {
			this._uploadConfigPromise = null;
			return result;
		}, () => {
			this._uploadConfigPromise = null;
			return null;
		});
		return this._uploadConfigPromise;
	},
	// OSS 直传：后端签发签名（policy/signature/aliosstoken），客户端 POST 表单直传 bucket
	// 附件由 OSS 服务器回调 addons/alioss/index/notify 落库
	uploadOss(url, opts) {
		const api = require('../request').default;
		let name = (opts && opts.name) || url.split('/').pop() || '';
		// H5 blob / 小程序临时路径可能不含扩展名，OSS 白名单按后缀校验，缺扩展名时按类型兜底
		if (!/\.[a-zA-Z0-9]+$/.test(name)) {
			const defaults = { image: 'image.jpg', video: 'video.mp4', audio: 'audio.mp3', file: 'file.pdf' };
			const fileType = (opts && opts.fileType) || 'image';
			name = defaults[fileType] || 'file.jpg';
		}
		return api('upload.ossParams', { name, md5: '', group: 'circle' }).then(res => {
			if (!res || res.code !== 1 || !res.data) {
				throw new Error('获取OSS签名失败');
			}
			const p = res.data;
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: p.uploadurl,
					filePath: url,
					method: 'POST',
					name: 'file',
					formData: {
						key: p.key,
						policy: p.policy,
						OSSAccessKeyId: p.OSSAccessKeyId,
						signature: p.signature,
						success_action_status: '200',
						callback: p.callbackBase64,
					},
					success: () => {
						uni.hideLoading();
						uni.showToast({ title: '上传成功', icon: 'none' });
						resolve({
							url: p.key,
							full_url: (p.cdnurl ? p.cdnurl : p.uploadurl) + '/' + p.key,
						});
					},
					fail: err => reject(err),
				});
			});
		});
	},
	// VOD 直传：CreateUploadVideo 签发 STS 上传凭证，客户端生成 policy 签名 POST 表单直传点播 OSS
	// 上传成功后调 upload/vodNotify 补记 Attachment；media 存储 alivod:{videoId}
	uploadVod(url, opts) {
		const api = require('../request').default;
		const ossSign = require('./oss-sign');
		const rawName = String((opts && opts.name) || '视频').trim() || '视频';
		// 微信 chooseMedia 在部分机型只返回“视频”等展示名，未携带扩展名；
		// CreateUploadVideo 的 FileName 必须有合法视频扩展名，因此优先从临时路径补回扩展名。
		const pathWithoutQuery = String(url || '').split(/[?#]/)[0];
		const pathExtMatch = pathWithoutQuery.match(/\.([a-zA-Z0-9]+)$/);
		const fallbackExt = pathExtMatch ? pathExtMatch[1].toLowerCase() : 'mp4';
		const name = /\.[a-zA-Z0-9]+$/.test(rawName) ? rawName : rawName + '.' + fallbackExt;
		const size = (opts && opts.size) || 0;
		return api('upload.vodUrl', { title: name, filename: name }).then(res => {
			if (!res || res.code !== 1 || !res.data || !res.data.VideoId) {
				throw new Error('获取上传凭证失败');
			}
			const videoId = res.data.VideoId;
			// 新接口在 CreateUploadVideo 阶段已绑定转码模板组；由 VOD 在上传完成后自动转码。
			// 兼容旧后端/旧凭证：没有该标记时，vodNotify 会等待媒资状态后再手动兜底。
			const autoTranscode = Number(res.data.auto_transcode || res.data.AutoTranscode || 0) === 1;
			// 解析 STS 临时凭证与上传地址（base64 JSON）
			const auth = ossSign.decodeJson(res.data.UploadAuth);
			const addr = ossSign.decodeJson(res.data.UploadAddress);
			// UploadAuth 内必须是服务端签发的完整 STS 临时凭证；缺少 SecurityToken 时禁止退化为长期 AK 直传。
			if (!auth.AccessKeyId || !auth.AccessKeySecret || !auth.SecurityToken || !addr.Bucket || !addr.FileName) {
				throw new Error('STS临时上传凭证不完整');
			}
			// 阿里云返回的 Endpoint 可能已带 https:// 协议头，拼接 bucket 域名前先剥离，避免出现 xxx.https://oss-... 的非法主机名
			const endpoint = String(addr.Endpoint || '').replace(/^https?[:/]*/i, '');
			// POST policy 过期时间需早于 STS 临时凭证过期时间（预留 120s 安全窗口），否则 OSS 拒绝。
			// UploadAuth.Expiration 为秒数时长（如 "3600"），直接 new Date 会被解析为公元 3600 年导致非法 policy，
			// 应优先用 ExpireUTCTime（真实过期时间戳），缺省时按 now + Expiration 秒推算。
			const rawExpire = auth.ExpireUTCTime || (function () {
				const sec = String(auth.Expiration || '').trim();
				if (/^\d+(\.\d+)?$/.test(sec)) {
					return new Date(Date.now() + parseFloat(sec) * 1000).toISOString();
				}
				return auth.Expiration;
			})();
			const policyExpiration = (() => {
				const d = new Date(rawExpire);
				if (isNaN(d.getTime())) return rawExpire;
				d.setSeconds(d.getSeconds() - 120);
				return d.toISOString();
			})();
			const policy = ossSign.makePolicy(policyExpiration, size);
			const signature = ossSign.signPolicy(policy, auth.AccessKeySecret);
			return new Promise((resolve, reject) => {
				uni.uploadFile({
					url: 'https://' + addr.Bucket + '.' + endpoint,
					filePath: url,
					method: 'POST',
					name: 'file',
					formData: {
						key: addr.FileName,
						policy: policy,
						OSSAccessKeyId: auth.AccessKeyId,
						signature: signature,
						'success_action_status': '200',
						'x-oss-security-token': auth.SecurityToken,
					},
					success: (uploadRes) => {
						if (!uploadRes || Number(uploadRes.statusCode) < 200 || Number(uploadRes.statusCode) >= 300) {
							reject(new Error('VOD直传失败，HTTP ' + ((uploadRes && uploadRes.statusCode) || 0)));
							return;
						}
						// 补记附件并校验源文件已真正落桶：vodNotify 内部探测源文件存在性，
						// 失败（文件未落桶）则视为上传失败，避免媒体格里出现永久"视频处理中"的幽灵视频
						api('upload.vodNotify', {
							url: videoId,
							size: size,
							name: name,
							type: 'video/mp4',
							auto_transcode: autoTranscode ? 1 : 0,
						})
							.then((notifyRes) => {
								if (!notifyRes || notifyRes.code !== 1) {
									throw new Error((notifyRes && notifyRes.msg) || 'VOD上传结果确认失败');
								}
								uni.hideLoading();
								uni.showToast({ title: '上传成功', icon: 'none' });
								resolve({
									url: 'alivod:' + videoId,
									full_url: 'alivod:' + videoId,
									video_id: 'alivod:' + videoId,
								});
							})
							.catch((err) => {
								uni.hideLoading();
								uni.showToast({ title: (err && (err.msg || err.message)) || '上传失败，请重试', icon: 'none' });
								reject(err || new Error('vodNotify failed'));
							});
					},
					fail: err => reject(err),
				});
			});
		});
	},
	// 图片处理-预览图片
	previewImage(urls = [], current = 0) {
		uni.previewImage({
			urls: urls,
			current: current,
			indicator: 'default',
			loop: true,
			fail(err) {
				console.log('previewImage出错 - tools.js:259', urls, err)
			},
		})
	},
	// 图片处理-获取图片信息
	getImageInfo(src = '') {
		return new Promise((resolve, reject) => {
			uni.getImageInfo({
				src: src,
				success: (image) => {
					resolve(image)
				},
				fail(err) {
					console.log('getImageInfo出错 - tools.js:272', src, err)
				},
			})
		}).catch(e => {
			reject(e)
		})

	},
	/**
	 * 格式化时间
	 */
	//时间格式化 天时分秒
	format(t) {
		let format = {
			d: '00',
			h: '00',
			m: '00',
			s: '00',
		}
		if (t > 0) {
			let d = Math.floor(t / 86400)
			let h = Math.floor((t / 3600) % 24)
			let m = Math.floor((t / 60) % 60)
			let s = Math.floor(t % 60)
			format.d = d < 10 ? '0' + d : d
			format.h = h < 10 ? '0' + h : h
			format.m = m < 10 ? '0' + m : m
			format.s = s < 10 ? '0' + s : s
		}
		return format
	},
	//时间格式化(格式化最大为小时)
	formatToHours(t) {
		let format = {
			d: '00',
			h: '00',
			m: '00',
			s: '00',
		}
		if (t > 0) {
			let h = Math.floor(t / 3600)
			let m = Math.floor((t / 60) % 60)
			let s = Math.floor(t % 60)

			format.h = h < 10 ? '0' + h : h
			format.m = m < 10 ? '0' + m : m
			format.s = s < 10 ? '0' + s : s
		}
		return format
	},
	// 年月日
	timestamp(timestamp) {
		let date = new Date(timestamp * 1000); //根据时间戳生成的时间对象
		let y = date.getFullYear();
		let m = date.getMonth() + 1;
		let d = date.getDate();

		m = m < 10 ? '0' + m : m;
		d = d < 10 ? '0' + d : d

		let dateText = y + "-" + m + "-" + d
		return dateText
	},
	// 年月
	yearmonth(timestamp) {
		let date = new Date(timestamp * 1000); //根据时间戳生成的时间对象
		let y = date.getFullYear();
		let m = date.getMonth() + 1;
		let d = date.getDate();

		m = m < 10 ? '0' + m : m;

		let dateText = y + "-" + m
		return dateText
	},
	// 年月日，时分秒
	// "YYYY-mm-dd HH:MM"
	dateFormat(fmt, date) {
		let ret;
		const opt = {
			"Y+": date.getFullYear().toString(), // 年
			"m+": (date.getMonth() + 1).toString(), // 月
			"d+": date.getDate().toString(), // 日
			"H+": date.getHours().toString(), // 时
			"M+": date.getMinutes().toString(), // 分
			"S+": date.getSeconds().toString() // 秒
			// 有其他格式化字符需求可以继续添加，必须转化成字符串
		};
		for (let k in opt) {
			ret = new RegExp("(" + k + ")").exec(fmt);
			if (ret) {
				fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
			};
		};
		return fmt;
	},
	/**提示框
	 *title(标题)
	 *icon(图标):  success，loading，none
	 *duration(延时): 0为不关闭, 毫秒数
	 *options(其它参数)
	 */
	toast(title, icon = 'none', options) {
		wx.showToast({
			title: title || '',
			icon: icon,
			duration: (options && options.duration) || 1500,
			image: (options && options.image) || '',
			mask: (options && options.mask) || true,
		});
	},

	//时间戳转时间
	formatDate(time, format) {
		time = time * 1000;
		var date = new Date(time);
		
		// 如果没有指定格式，使用默认格式
		if (!format) {
			const Y = date.getFullYear() + '-';
			const M = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) + '-' : date.getMonth() + 1 + '-';
			const D = date.getDate() < 10 ? '0' + date.getDate() + ' ' : date.getDate() + ' ';
			const h = date.getHours() < 10 ? '0' + date.getHours() + ':' : date.getHours() + ':';
			const m = date.getMinutes() < 10 ? '0' + date.getMinutes() + ':' : date.getMinutes() + ':';
			const s = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
			return Y + M + D + h + m + s;
		}
		
		// 自定义格式处理
		const month = date.getMonth() + 1;
		const day = date.getDate();
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const seconds = date.getSeconds();
		
		// 替换格式字符串
		let result = format;
		result = result.replace('MM', month < 10 ? '0' + month : month);
		result = result.replace('DD', day < 10 ? '0' + day : day);
		result = result.replace('HH', hours < 10 ? '0' + hours : hours);
		result = result.replace('mm', minutes < 10 ? '0' + minutes : minutes);
		result = result.replace('ss', seconds < 10 ? '0' + seconds : seconds);
		
		return result;
	},

	/**
	 * 格式化媒体时间
	 * @param {*} duration 
	 * @returns 
	 */
	formatStudyTime(seconds) {
		const hours = Math.floor(seconds / 3600).toString().padStart(2, '');
		const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '');
		// const remainingSeconds = (seconds % 60).toString().padStart(2, '0');
		if (hours == 0) {
			return minutes + `分钟`;
		}
		return `${hours}小时${minutes}分钟`;
	},

	/**
	 * 格式化媒体时间
	 * @param {*} duration 
	 * @returns 
	 */
	formatMediaTime(seconds) {

		if (!seconds || seconds == 'NaN') {
			return '00:00'
		}

		const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
		const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
		const remainingSeconds = parseInt(seconds % 60).toString().padStart(2, '0');
		if (minutes == '0') {
			minutes = '00';
		}
		if (hours == '0') {
			hours = '00';
		}
		if (remainingSeconds == '0') {
			remainingSeconds = '00';
		}
		if (hours == '00') {
			return `${minutes}:${remainingSeconds}`;
		} else {

			return `${hours}:${minutes}:${remainingSeconds}`;
		}

	},

	//文件大小
	formatFileSize(fileSize) {
		var arrUnit = ["B", "K", "M", "G", "T", "P"],
			baseStep = 1024,
			unitCount = arrUnit.length,
			unitIndex = 0;
		while (fileSize >= baseStep && unitIndex < unitCount - 1) {
			unitIndex++;
			fileSize /= baseStep;
		}
		fileSize = fileSize.toFixed(2);
		return fileSize + " " + arrUnit[unitIndex];
	},

	//效验手机号码
	checkModbile(mobile) {
		var re = /^1[3,4,5,6,7,8,9][0-9]{9}$/;
		var result = re.test(mobile);
		if (!result) {
			return false;//若手机号码格式不正确则返回false
		}
		return true;
	},

	//效验手机号码
	checkPassword(password) {
		var re = /^[\w!@#$%^&*]{6,16}$/;
		var result = re.test(password);
		if (!result) {
			return false;//若手机号码格式不正确则返回false
		}
		return true;
	},

	//效验验证码
	checkSmsCode(code) {
		var re = /^[0-9]{4,6}$/;
		var result = re.test(code);
		if (!result) {
			return false;//若手机号码格式不正确则返回false
		}
		return true;
	},
	copy(val) {
		uni.setClipboardData({
			data: val,
			success: () => {
				uni.showToast({
					icon: 'none',
					title: '复制成功'
				});
			}
		})
	},
	// 获取元素位置信息
	getRect(selector, queryDom) {
		return new Promise((resolve) => {

			if (!queryDom) {
				queryDom = uni.createSelectorQuery()
			}

			queryDom.select(selector)
				.boundingClientRect((res) => {
					resolve(res);
				})
				.exec();
		});
	},
	/**
	 * 获取数组成员数量
	 * @param {*} arr 
	 * @returns 
	 */
	countSparseArrayMembers(arr) {
		let count = 0;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i] !== undefined) {
				count++;
			}
		}
		return count;
	},

	/**
	 * 获取文件类型（扩展名）
	 * @param {string} fileName - 文件名或文件路径
	 * @returns {string} 文件扩展名（小写）
	 */
	getFileType(fileName) {
		if (!fileName || typeof fileName !== 'string') {
			return '';
		}
		
		// 方法1：简洁版本（推荐），去掉查询参数/哈希，避免 wx.openDocument 收到非法类型
		const cleanName = fileName.split(/[?#]/)[0];
		const fileType = cleanName.split('.').pop().toLowerCase();
		return fileType;
		
		// 方法2：原始复杂版本（与您提供的代码等效）
		// let fileType = fileName.split('').reverse().join('').split('.').shift().split('').reverse().join('').toLowerCase();
		// return fileType;
	},

	/**
	 * 根据文件扩展名获取文件类型信息
	 * @param {string} fileName - 文件名或文件路径
	 * @returns {object} 包含文件类型和分类的对象
	 */
	getFileInfo(fileName) {
		const fileType = this.getFileType(fileName);
		
		// 定义文件类型分类
		const fileCategories = {
			image: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'],
			video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'],
			audio: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'],
			document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
			archive: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
			code: ['js', 'css', 'html', 'vue', 'json', 'xml', 'php', 'py', 'java', 'c', 'cpp']
		};
		
		// 确定文件分类
		let category = 'other';
		for (const [cat, extensions] of Object.entries(fileCategories)) {
			if (extensions.includes(fileType)) {
				category = cat;
				break;
			}
		}
		
		return {
			fileType: fileType,
			category: category
		};
	},

	/**
	 * 根据文件名判断文件预览类型（与预览弹窗 filetype 对应）
	 * 视频/音频/图片走对应播放器预览，其余（文档/压缩包等）走文档预览
	 * @param {string} fileName - 文件名或文件路径
	 * @returns {string} image/video/audio/document
	 */
	getFilePreviewType(fileName) {
		const info = this.getFileInfo(fileName);
		if (['image', 'video', 'audio'].includes(info.category)) {
			return info.category;
		}
		return 'document';
	}


}
