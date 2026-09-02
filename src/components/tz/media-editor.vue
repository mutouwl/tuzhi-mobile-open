<template>
	<view class="tz-media-editor">
		<!-- 图片/视频/音频九宫格（复用 tz-circle-media-grid：动态卡片/详情/编辑三处一致；editable 编辑模式：删除按钮/视频文件名/90% 居中） -->
		<tz-circle-media-grid class="editor-media-margin" v-if="gridItems.length" :items="gridItems" editable :disabled="disabled" @preview-image="previewImage" @preview-video="previewVideo" @preview-audio="previewAudio" @remove="removeMediaItem" />

		<!-- 文件列表（复用 tz-circle-file-list：动态卡片/详情/编辑三处一致；editable 编辑模式：右侧删除按钮） -->
		<tz-circle-file-list class="editor-file-margin" v-if="fileListItems.length" :files="fileListItems" editable :disabled="disabled" @open="previewFile" @remove="removeFile" />

		<!-- 图片/视频/音频预览：通用预览弹窗（tz-file-preview，与动态列表附件预览一致；视频 H5 阿里云播放器/非 H5 原生 video，音频项目播放器） -->
		<tz-file-preview :visible="previewVisible" :data="previewData" @close="previewVisible = false" />
	</view>
</template>

<script>
/**
 * 媒体编辑器（图片/视频/音频/文件，发布动态与回复弹窗共用）
 * v-model 绑定结构：{ images: [], videos: [{ url, name, size, cover, video_id }], audio: { url, name, size }, files: [{ url, name, size }] }
 * cover 为视频临时封面（小程序 chooseVideo 返回的 thumbTempFilePath），仅本地展示用，不上传
 * 上传按钮由调用方在页面底部放置，通过 ref 调用 chooseImage/chooseVideo/chooseAudio/chooseFile
 * sizeLimits 为圈子发布上传配置：{ media_image_size, media_audio_size, media_video_size, media_file_size }（MB，0 不限制）
 * fileTypes 为文件按钮可选扩展名（逗号分隔字符串或数组，如 doc,docx,xls,xlsx）
 * mediaEnables 为各类型上传开关：{ media_image_enable, media_video_enable, media_audio_enable, media_file_enable }（0 关闭后不可上传，缺省视为开启）
 */
import filePreview from '@/components/tz/file-preview.vue';
import fileList from '@/components/tz/circle-file-list.vue';

export default {
	name: 'tz-media-editor',
	components: {
		filePreview,
		fileList,
	},
	data() {
		return {
			// 通用预览弹窗（图片/视频/音频，tz-file-preview）：与动态列表附件预览共用
			previewVisible: false,
			previewData: null,
			// 上传中的图片数：计入剩余可传数量，防止并发多选累计超过 maxImages
			pendingImages: 0,
			// 上传中的文件数（图片/视频/音频/文件）：>0 表示有文件上传中，发布页据此禁用 footer-bar 操作
			uploadingCount: 0,
			removing: false,
			// 文件扩展名 -> MIME 类型映射（H5 端选择器 accept 需用 MIME 类型，iOS 才能正确限制文件类型；纯扩展名 accept 在 iOS 无效）
			fileMime: {
				doc: 'application/msword',
				docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				xls: 'application/vnd.ms-excel',
				xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				pdf: 'application/pdf',
				ppt: 'application/vnd.ms-powerpoint',
				pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
				txt: 'text/plain',
				zip: 'application/zip',
				rar: 'application/vnd.rar',
			},
			// H5 端自建的文件选择 input 实例：下次调用前先移除旧的，避免用户取消选择后残留隐藏节点
			h5FileInput: null,
		};
	},
	props: {
		value: {
			type: Object,
			default: () => ({ images: [], videos: [], audio: {}, files: [] }),
		},
		maxImages: { type: Number, default: 9 },
		maxVideos: { type: Number, default: 1 },
		maxAudio: { type: Number, default: 9 },
		maxFiles: { type: Number, default: 9 },
		// 大小限制（MB，0 不限制），来自圈子发布上传设置
		sizeLimits: { type: Object, default: () => ({}) },
		// 文件按钮可选类型（逗号分隔或数组扩展名，空则使用默认 doc,docx,xls,xlsx,pdf）
		fileTypes: { type: [String, Array], default: 'doc,docx,xls,xlsx,pdf' },
		// 各类型上传开关（0 关闭后不可上传，缺省视为开启）
		mediaEnables: { type: Object, default: () => ({}) },
		// 发布页开启后，点击删除会同步删除未被引用的远程附件；回复弹窗默认关闭
		remoteDelete: { type: Boolean, default: false },
		postId: { type: Number, default: 0 },
		// 禁用编辑操作（页面加载中/文件上传中由调用方传入）：九宫格与文件列表删除按钮不可点击
		disabled: { type: Boolean, default: false },
	},
	computed: {
		media() {
			const m = this.value || {};
			if (!Array.isArray(m.images)) m.images = [];
			if (!Array.isArray(m.videos)) m.videos = [];
			if (!m.audio || typeof m.audio !== 'object') m.audio = {};
			if (!Array.isArray(m.files)) m.files = [];
			return m;
		},
		gridItems() {
			const items = [];
			this.media.images.forEach(url => items.push({ type: 'image', url }));
			// 转码中视频 url 可能为空，但 video_id（alivod 标记）存在，仍展示占位
			this.media.videos.forEach((v, vi) => {
				if (v.url || v.video_id) {
					items.push({ type: 'video', url: v.url || '', video_id: v.video_id || '', cover: v.cover || '', name: v.name || '', _vi: vi });
				}
			});
			if (this.media.audio && this.media.audio.url) {
				items.push({ type: 'audio', url: this.media.audio.url, name: this.media.audio.name || '语音' });
			}
			return items;
		},
		// 文件列表（复用 tz-circle-file-list 的 files 结构：id/filename/filetype/fullurl/filesize）
		fileListItems() {
			return (this.media.files || []).map((f, i) => ({
				id: 'file-' + i,
				filename: f.name || '附件文件',
				filetype: this.$tools.getFilePreviewType(f.name),
				fullurl: f.url,
				filesize: f.size || 0,
			}));
		},
		// 文件按钮可选扩展名数组（去点小写）
		fileExts() {
			let values = this.fileTypes;
			if (!Array.isArray(values)) {
				const str = String(values || '').trim();
				try {
					const parsed = JSON.parse(str);
					values = Array.isArray(parsed) ? parsed : str.split(/[,，;；\s]+/);
				} catch (e) {
					values = str.split(/[,，;；\s]+/);
				}
			}
			const exts = values.map(s => String(s || '').trim().replace(/^\.+/, '').toLowerCase()).filter(Boolean);
			const uniqueExts = Array.from(new Set(exts));
			return uniqueExts.length ? uniqueExts : ['doc', 'docx', 'xls', 'xlsx', 'pdf'];
		},
		// 音频可选扩展名数组（去点小写）
		audioExts() {
			return ['mp3', 'wav', 'm4a', 'aac', 'ogg'];
		},
		// 是否有文件正在上传：驱动发布页禁用 footer-bar 操作，避免提交不完整媒体
		uploading() {
			return this.uploadingCount > 0;
		},
	},
	watch: {
		// 上传状态变化通知父级（$refs 在父级首轮渲染时尚未注册，computed 无法依赖子组件状态，必须用事件传递）
		uploading(v) {
			this.$emit('uploading-change', v);
		},
	},
	methods: {
		sync() {
			this.$emit('input', this.media);
		},
		// 统一兼容 H5 直接参数与微信小程序 detail/__args__ 自定义事件参数。
		normalizeMediaPayload(payload) {
			let item = payload;
			if (Array.isArray(item)) item = item[0];
			if (item && item.detail) {
				item = item.detail.__args__ || item.detail;
				if (Array.isArray(item)) item = item[0];
			}
			return item && (item.url || item.fullurl) ? item : null;
		},
		// 上传开关校验：关闭后该类型不可上传（缺省视为开启）
		checkEnabled(type, label) {
			if (Number(this.mediaEnables['media_' + type + '_enable']) === 0) {
				uni.showToast({ title: '该圈子已关闭' + label + '上传', icon: 'none' });
				return false;
			}
			return true;
		},
		// 大小校验：limitMb 为 0/空表示不限制；设置了上限但无法取得文件大小时拒绝上传
		checkSize(size, limitMb, label) {
			const limit = Number(limitMb);
			if (!(limit > 0)) return true;
			const fileSize = Number(size);
			if (!(fileSize > 0)) {
				uni.showToast({ title: '无法获取' + label + '大小，请重试', icon: 'none' });
				return false;
			}
			if (fileSize > limit * 1024 * 1024) {
				uni.showToast({ title: label + '大小不能超过' + limit + 'MB', icon: 'none' });
				return false;
			}
			return true;
		},
		// 部分微信基础库返回的媒体对象没有 size，按本地临时路径补读文件大小。
		getLocalFileSize(file, filePath) {
			const size = Number(file && file.size);
			if (size > 0) return Promise.resolve(size);
			if (!filePath || typeof uni.getFileInfo !== 'function') return Promise.resolve(0);
			return new Promise(resolve => {
				uni.getFileInfo({
					filePath: filePath,
					success: res => resolve(Number(res && res.size) || 0),
					fail: () => resolve(0),
				});
			});
		},
		// 返回统一的大小与校验结果；大小上限为 0 时不读取文件信息，直接视为不限制。
		validateFileSize(file, filePath, limitMb, label) {
			const limit = Number(limitMb);
			const initialSize = Number(file && file.size) || 0;
			if (!(limit > 0)) return Promise.resolve({ pass: true, size: initialSize });
			return this.getLocalFileSize(file, filePath).then(size => ({
				pass: this.checkSize(size, limit, label),
				size: size,
			}));
		},
		getFilePath(file) {
			return (file && (file.path || file.tempFilePath || file.url)) || '';
		},
		getFileName(file) {
			return (file && (file.name || file.fileName || file.filename)) || '';
		},
		getFileExtension(name) {
			const value = String(name || '').split(/[?#]/)[0];
			const match = value.match(/\.([^.\/]+)$/);
			return match ? match[1].toLowerCase() : '';
		},
		getUploadFileName(file, fallback) {
			const name = this.getFileName(file);
			if (name) return name;
			const ext = this.getFileExtension(this.getFilePath(file));
			return ext ? '附件文件.' + ext : (fallback || '附件文件');
		},
		// chooseMedia 已按 video 限制类型，补充校验扩展名，防止部分微信版本把文件类结果当作视频渲染
		isVideoFile(file) {
			const type = String((file && file.type) || '').toLowerCase();
			if (type && type !== 'video') return false;
			const ext = this.getFileExtension(this.getFileName(file) || this.getFilePath(file));
			return !ext || ['mp4', 'mov', 'm4v', 'avi', 'mkv', 'webm', '3gp'].indexOf(ext) !== -1;
		},
		// 小程序原生选择器按扩展名过滤；回调中仍会再次校验，防止旧基础库忽略 extension。
		chooseMessageFiles(count, label, extensions, onChoose) {
			// #ifdef MP-WEIXIN
			const allowed = (extensions || []).map(ext => String(ext || '').replace(/^\.+/, '').toLowerCase()).filter(Boolean);
			const options = {
				count: count,
				type: 'file',
				// 微信客户端选择器先按 extension 过滤；成功回调再过滤一次，兼容忽略 extension 的旧基础库。
				extension: allowed,
				success: (res) => {
					const selected = (res && res.tempFiles) || [];
					const accepted = selected.filter(file => {
						const ext = this.getFileExtension(this.getFileName(file) || this.getFilePath(file));
						return allowed.indexOf(ext) !== -1;
					});
					if (accepted.length !== selected.length) {
						uni.showToast({ title: '仅支持上传' + allowed.join('/') + '格式' + label, icon: 'none' });
					}
					onChoose(accepted);
				},
				fail: (err) => this.handleChooseFail(label, err),
			};
			wx.chooseMessageFile(options);
			// #endif
		},
		// 文件选择失败处理：用户取消（errMsg 含 cancel）不算失败，不弹提示，避免误报"选择失败"
		handleChooseFail(label, err) {
			const msg = (err && err.errMsg) || '';
			if (msg.indexOf('cancel') !== -1) return;
			uni.showToast({ title: '选择' + label + '失败', icon: 'none' });
		},
		chooseImage() {
			if (!this.checkEnabled('image', '图片')) return;
			// 上限 0 表示不限制；剩余可传数 = 上限 - 已选 - 上传中：上传期间重复点击也不会累计超限
			const imageLimit = Number(this.maxImages);
			const limit = imageLimit > 0 ? imageLimit : Infinity;
			const remain = limit - this.media.images.length - this.pendingImages;
			if (remain <= 0) {
				uni.showToast({ title: '最多上传' + imageLimit + '张图片', icon: 'none' });
				return;
			}
			uni.chooseImage({
				// 选择器单次最多 9 张（微信限制），无限制时按剩余可选但不超过 9
				count: Math.min(remain, 9),
				// 圈子动态用于页面展示，压缩图可降低 OSS/服务器上传体积并减少失败率
				sizeType: ['compressed'],
				success: (res) => {
					const files = res.tempFiles || [];
					this.pendingImages += files.length;
					files.forEach((f, i) => {
						const filePath = res.tempFilePaths[i] || this.getFilePath(f);
						if (!filePath) {
							if (this.pendingImages > 0) this.pendingImages--;
							uni.showToast({ title: '图片文件无效', icon: 'none' });
							return;
						}
						this.validateFileSize(f, filePath, this.sizeLimits.media_image_size, '图片').then(({ pass, size }) => {
							if (!pass) {
								// 大小超限或无法取得大小：释放待处理名额
								if (this.pendingImages > 0) this.pendingImages--;
								return;
							}
							this.uploadFile(filePath, 'image', { size: size });
						});
					});
				},
			});
		},
		chooseVideo() {
			if (!this.checkEnabled('video', '视频')) return;
			const videoLimit = Number(this.maxVideos);
			// 数量上限 0 表示无限制；微信 chooseMedia 单次最多选择 9 个，超出时分批选择。
			const remain = videoLimit > 0 ? videoLimit - this.media.videos.length : Infinity;
			if (remain <= 0) {
				uni.showToast({ title: '最多上传' + videoLimit + '个视频', icon: 'none' });
				return;
			}
			const chooseCount = Math.min(remain, 9);
			// #ifdef MP-WEIXIN
			// chooseMedia 按 mediaType 严格限制为视频（真机与开发者工具均可选中视频文件），
			// 避免误选 MP3 等非视频文件后被当作视频展示；thumbTempFilePath 为临时封面
			wx.chooseMedia({
				count: chooseCount,
				mediaType: ['video'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const files = (res.tempFiles || []).slice(0, chooseCount);
					files.forEach(f => {
						if (!this.isVideoFile(f)) {
							uni.showToast({ title: '请选择视频格式文件', icon: 'none' });
							return;
						}
						const path = this.getFilePath(f);
						if (!path) {
							uni.showToast({ title: '视频文件无效', icon: 'none' });
							return;
						}
						this.validateFileSize(f, path, this.sizeLimits.media_video_size, '视频').then(({ pass, size }) => {
							if (!pass) return;
							this.uploadFile(path, 'video', { name: this.getFileName(f) || '视频', size: size, cover: f.thumbTempFilePath || '' });
						});
					});
				},
				fail: (err) => this.handleChooseFail('视频', err),
			});
			// #endif
			// #ifndef MP-WEIXIN
			uni.chooseVideo({
				// thumbTempFilePath 为小程序端返回的临时封面，H5 无此字段，封面留空走占位图
				success: (res) => {
					this.validateFileSize(res, res.tempFilePath, this.sizeLimits.media_video_size, '视频').then(({ pass, size }) => {
						if (!pass) return;
						this.uploadFile(res.tempFilePath, 'video', { name: res.name || '视频', size: size, cover: res.thumbTempFilePath || '' });
					});
				},
				fail: (err) => this.handleChooseFail('视频', err),
			});
			// #endif
		},
		chooseAudio() {
			if (!this.checkEnabled('audio', '音频')) return;
			const audioLimit = Number(this.maxAudio);
			// 数量上限 0 表示无限制；音频媒体结构按单条动态保留一个音频对象。
			const remain = audioLimit > 0 ? audioLimit - (this.media.audio && this.media.audio.url ? 1 : 0) : 1;
			if (remain <= 0) {
				uni.showToast({ title: '最多上传' + audioLimit + '段音频', icon: 'none' });
				return;
			}
			const exts = this.audioExts;
			const handle = (tempFiles) => {
				(tempFiles || []).forEach(f => {
					const name = this.getFileName(f);
					const path = this.getFilePath(f);
					const ext = this.getFileExtension(name || path);
					if (exts.indexOf(ext) === -1) {
						uni.showToast({ title: '仅支持上传' + exts.join('/') + '格式音频', icon: 'none' });
						return;
					}
					if (!path) {
						uni.showToast({ title: '音频文件无效', icon: 'none' });
						return;
					}
					this.validateFileSize(f, path, this.sizeLimits.media_audio_size, '音频').then(({ pass, size }) => {
						if (!pass) return;
						this.uploadFile(path, 'audio', { name: name || '音频', size: size });
					});
				});
			};
			// #ifdef MP-WEIXIN
			this.chooseMessageFiles(1, '音频', exts, handle);
			// #endif
			// #ifdef H5
			// uni.chooseFile 的 accept 仅支持 all/image/video，无法限制音频类型，且其扩展名 accept 在 iOS 无效（会弹相册/拍照/文件通用菜单）；自建 input 用 MIME accept 精确限制
			this.chooseH5File({
				count: 1,
				accept: 'audio/*,.mp3,.wav,.m4a,.aac,.ogg',
				onChoose: (tempFiles) => handle(tempFiles),
			});
			// #endif
		},
		chooseFile() {
			if (!this.checkEnabled('file', '文件')) return;
			const fileLimit = Number(this.maxFiles);
			// 数量上限 0 表示无限制；选择器按 9 个一批，避免将无限制转换为非法的大 count。
			const remain = fileLimit > 0 ? fileLimit - this.media.files.length : Infinity;
			if (remain <= 0) {
				uni.showToast({ title: '最多上传' + fileLimit + '个文件', icon: 'none' });
				return;
			}
			const chooseCount = fileLimit > 0 ? remain : 9;
			const exts = this.fileExts;
			const handle = (tempFiles) => {
				(tempFiles || []).slice(0, remain).forEach(f => {
					const name = this.getUploadFileName(f);
					const path = this.getFilePath(f);
					const ext = this.getFileExtension(name || path);
					if (!ext || exts.indexOf(ext) === -1) {
						uni.showToast({ title: '仅支持上传' + exts.join('/') + '格式文件', icon: 'none' });
						return;
					}
					if (!path) {
						uni.showToast({ title: '文件无效', icon: 'none' });
						return;
					}
					this.validateFileSize(f, path, this.sizeLimits.media_file_size, '文件').then(({ pass, size }) => {
						if (!pass) return;
						this.uploadFile(path, 'file', { name: name || '附件文件', size: size });
					});
				});
			};
			// #ifdef MP-WEIXIN
			this.chooseMessageFiles(chooseCount, '文件', exts, handle);
			// #endif
			// #ifdef H5
			// 文件选择：accept 用 MIME 类型 + 扩展名兜底（纯扩展名 accept 在 iOS 无效，MIME 才能正确限制文件类型）
			const accept = exts.map(e => this.fileMime[e] || '').filter(Boolean).concat(exts.map(e => '.' + e)).join(',');
			this.chooseH5File({
				count: chooseCount,
				accept: accept,
				onChoose: (tempFiles) => handle(tempFiles),
			});
			// #endif
		},
		// H5 端本地文件选择：uni.chooseFile 的 accept 由 type 参数决定（仅 all/image/video），
		// 无法表达音频/文件类型，且其生成的扩展名 accept 在 iOS 无效（弹出相册/拍照/文件通用菜单）。
		// 自建 input[type=file] 并精确设置 MIME accept，实现真正的类型限制。
		chooseH5File({ count, accept, onChoose }) {
			// #ifdef H5
			if (this.h5FileInput) {
				document.body.removeChild(this.h5FileInput);
				this.h5FileInput = null;
			}
			const input = document.createElement('input');
			input.type = 'file';
			input.accept = accept || '';
			if (count > 1) input.multiple = 'multiple';
			input.style.cssText = 'position:absolute;visibility:hidden;width:0;height:0;top:0;left:0;';
			document.body.appendChild(input);
			this.h5FileInput = input;
			input.addEventListener('change', () => {
				const files = Array.prototype.slice.call(input.files || []);
				if (this.h5FileInput === input) this.h5FileInput = null;
				document.body.removeChild(input);
				onChoose(files.map(f => ({
					path: URL.createObjectURL(f),
					name: f.name,
					size: f.size,
				})));
			});
			input.click();
			// #endif
		},
		uploadFile(filePath, fileType, extra) {
			this.uploadingCount++;
			uni.showLoading({ title: '上传中' });
			// 上传工具会实时读取后台 VOD/OSS 状态与 OSS uploadmode，决定直传或服务器中转。
			const uploadTask = this.$tools.uploadImage('common/upload', filePath, {
				fileType: fileType,
				name: (extra && extra.name) || '',
				size: (extra && extra.size) || 0,
			});
			uploadTask.then(res => {
				uni.hideLoading();
				if (this.uploadingCount > 0) this.uploadingCount--;
				const url = res.full_url || res.url;
				if (fileType == 'image') {
					this.media.images.push(url);
					// 上传完成：释放待处理名额
					if (this.pendingImages > 0) this.pendingImages--;
				} else if (fileType == 'video') {
					// video_id 携带 alivod:{videoId} 直传标记，编辑回填/重提交时用于还原原始标记
					this.media.videos.push({ url, video_id: res.video_id || '', name: (extra && extra.name) || '视频', size: (extra && extra.size) || 0, cover: (extra && extra.cover) || '' });
				} else if (fileType == 'audio') {
					this.media.audio = { url, name: (extra && extra.name) || '音频', size: (extra && extra.size) || 0 };
				} else if (fileType == 'file') {
					this.media.files.push({ url, name: (extra && extra.name) || '附件文件', size: (extra && extra.size) || 0 });
				}
				this.sync();
			}).catch((error) => {
				uni.hideLoading();
				if (this.uploadingCount > 0) this.uploadingCount--;
				// 上传失败：释放待处理名额
				if (fileType == 'image' && this.pendingImages > 0) this.pendingImages--;
				uni.showToast({ title: (error && error.message) || '上传失败', icon: 'none' });
			});
		},
		// 点击网格播放按钮：通用预览弹窗播放（视频 H5 阿里云播放器 / 非 H5 原生 video 兜底，见 tz-file-preview 条件编译）
		async previewVideo(payload) {
			const item = this.normalizeMediaPayload(payload);
			const fullurl = item && (item.url || item.fullurl);
			if (!item || !fullurl) return;
			const option = { id: 'video', filename: item.name || item.filename || '视频', filetype: 'video', fullurl: fullurl, filesize: item.size || 0 };
			const marker = item.video_id || '';
			// #ifdef H5
			// H5 播放器需要 playAuth；微信小程序原生 video 使用上传结果中的 fullurl。
			if (/^alivod:/i.test(marker)) {
				uni.showLoading({ title: '准备播放', mask: true });
				try {
					const res = await this.$api('circle.post.playAuth', {
						post_id: Number(this.postId || 0),
						video_id: marker,
					});
					if (!res || res.code !== 1 || !res.data || !res.data.play_auth || !res.data.video_id) {
						uni.showToast({ title: (res && res.msg) || '视频播放凭证获取失败', icon: 'none' });
						return;
					}
					option.vod_id = res.data.video_id;
					option.playauth = res.data.play_auth;
				} catch (e) {
					uni.showToast({ title: (e && e.msg) || '视频播放凭证获取失败', icon: 'none' });
					return;
				} finally {
					uni.hideLoading();
				}
			}
			// #endif
			this.previewData = option;
			this.previewVisible = true;
		},
		// 点击图片格：通用预览弹窗展示（组件事件为全部图片地址 + 当前下标，与动态列表附件预览一致）
		previewImage(images, index) {
			if (!images || !images.length) return;
			const url = images[index] || images[0];
			this.previewData = { id: 'image', filename: '图片', filetype: 'image', fullurl: url, filesize: 0 };
			this.previewVisible = true;
		},
		// 点击音频格：通用预览弹窗播放（与动态列表附件预览一致）
		previewAudio(payload) {
			const item = this.normalizeMediaPayload(payload);
			const fullurl = item && (item.url || item.fullurl);
			if (!item || !fullurl) return;
			this.previewData = { id: 'audio', filename: item.name || item.filename || '语音', filetype: 'audio', fullurl: fullurl, filesize: item.size || 0 };
			this.previewVisible = true;
		},
		// 点击文件行：预览弹窗打开（与动态卡片/详情附件预览一致；小程序文档直接系统预览）
		previewFile(file) {
			if (!file || !file.fullurl) return;
			const option = {
				id: file.id || 'file',
				filename: file.filename || '附件文件',
				filetype: file.filetype || this.$tools.getFilePreviewType(file.filename),
				fullurl: file.fullurl,
				filesize: file.filesize || 0,
			};
			// #ifdef MP-WEIXIN
			if (option.filetype == 'document') {
				this.$tools.openDocument(option.fullurl, option.filename);
				return;
			}
			// #endif
			this.previewData = option;
			this.previewVisible = true;
		},
		async removeRemoteMedia(type, media) {
			if (!this.remoteDelete) return true;
			if (this.removing) return false;
			this.removing = true;
			uni.showLoading({ title: '删除中', mask: true });
			try {
				const res = await this.$api('circle.post.removeMedia', {
					id: Number(this.postId || 0),
					type: type,
					url: (media && (media.url || media.fullurl)) || '',
					video_id: (media && media.video_id) || '',
				});
				if (!res || res.code !== 1) {
					uni.showToast({ title: (res && res.msg) || '删除失败，请重试', icon: 'none' });
					return false;
				}
				return true;
			} catch (e) {
				uni.showToast({ title: (e && (e.msg || e.errMsg)) || '删除失败，请重试', icon: 'none' });
				return false;
			} finally {
				this.removing = false;
				uni.hideLoading();
			}
		},
		async removeMediaItem(item, index) {
			if (!(await this.removeRemoteMedia(item.type, item))) return;
			if (item.type == 'image') {
				// 图片排在九宫格最前，网格索引即图片数组索引
				this.media.images.splice(index, 1);
			} else if (item.type == 'video') {
				// 多视频：按网格项携带的视频数组下标删除
				if (item._vi !== undefined && this.media.videos[item._vi]) {
					this.media.videos.splice(item._vi, 1);
				}
			} else if (item.type == 'audio') {
				this.media.audio = {};
			}
			this.sync();
		},
		async removeFile(file, index) {
			if (!(await this.removeRemoteMedia('file', file))) return;
			this.media.files.splice(index, 1);
			this.sync();
		},
	},
};
</script>

<style scoped>
/* 媒体九宫格/文件列表上间距：与动态卡片/详情统一 10px（样式本体在 tz-circle-media-grid / tz-circle-file-list 内） */
.editor-media-margin { margin-top: 10px; }
.editor-file-margin { margin-top: 10px; }
</style>
