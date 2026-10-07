<template>
	<!-- 展示/编辑共用：editable 时右侧为删除按钮（emit remove），展示模式为更多箭头（emit open） -->
	<view class="post-files">
		<view v-for="(file, i) in shownFiles" :key="file.id" class="post-file-item" @tap.stop="openFile(file)">
			<image :src="'/static/image/filetype/' + file.filetype + '.png'" class="file-icon" mode="aspectFit" />
			<text class="file-name">{{ file.filename }}</text>
			<view v-if="editable" class="file-del" :class="{ 'is-disabled': disabled }" @tap.stop="!disabled && $emit('remove', file, file.srcIndex)"><tz-icon name="close" :size="10" color="#fff" /></view>
			<tz-icon v-else name="more" :size="10" color="#86909c" />
		</view>
		<!-- preview 模式自带通用预览弹窗：调用点只传数据，不再各写一份「点开文件要干什么」 -->
		<tz-file-preview v-if="preview" :visible="previewVisible" :data="previewData" @close="previewVisible = false" />
	</view>
</template>

<script>
/**
 * 文件列表（通用组件：动态卡片/动态详情/打卡日记展示 + 发布页/回复弹窗媒体编辑器共用，样式完全一致）
 * props: files（两种形状都收：展示结构 [{ id, filename, filetype, fullurl, filesize }] 或上传/接口回的原始结构
 *        [{ url, name, size }]，缺 filetype 按文件名扩展名推；历史接口把 files 列原样回传成 JSON 文本或
 *        单条对象时也收，件内自己归一，见 normalizeList）、editable（编辑模式：右侧删除按钮，默认 false）、
 *        limit（最多显示几条，0 = 不限制；卡片只摆得下三行）、preview（true = 组件自己弹通用预览，
 *        微信文档走原生打开；false = 只 emit open，预览交给调用方，圈子那两处维持原口径）
 * emits: open(file)（点击文件行）、remove(file, index)（编辑模式点击删除）
 */
export default {
	name: 'tz-circle-file-list',
	props: {
		// 类型放宽到 [Array, String, Object]：只为接住历史接口的原样回传，组件内一律归一成数组，
		// 走到这里仍是字符串/对象时不该整套附件区连渲染一起崩（见 normalizeList）
		files: { type: [Array, String, Object], default: () => [] },
		editable: { type: Boolean, default: false },
		// 禁用删除操作（上传中/页面加载中）：删除按钮置灰且不可点击
		disabled: { type: Boolean, default: false },
		limit: { type: Number, default: 0 },
		preview: { type: Boolean, default: false },
	},
	data() {
		return {
			previewVisible: false,
			previewData: null,
		};
	},
	emits: ['open', 'remove'],
	computed: {
		shownFiles() {
			const list = [];
			this.normalizeList(this.files).forEach((file, i) => {
				if (this.limit > 0 && list.length >= this.limit) return;
				const item = this.normalize(file, i);
				if (item) list.push(item);
			});
			return list;
		},
	},
	methods: {
		// 入参归一（历史接口兼容）：数组原样；JSON 文本解析（解不出按空）；单条对象包成数组。
		// 旧接口把 record.files 列原样回传（形如 "[{\"url\":..}]"），调用方 v-if 判 .length 会放行，
		// 直接 forEach 就抛 TypeError，把整块附件区（动态里的文档）一起打断，所以收敛在这一处
		normalizeList(files) {
			if (Array.isArray(files)) return files;
			if (typeof files === 'string') {
				const text = files.trim();
				if (!text) return [];
				try {
					const parsed = JSON.parse(text);
					if (Array.isArray(parsed)) return parsed;
					return parsed && typeof parsed === 'object' ? [parsed] : [];
				} catch (e) {
					return [];
				}
			}
			return files && typeof files === 'object' ? [files] : [];
		},
		// 两种入参形状归一：原始 {url,name,size}（媒体编辑器与打卡接口给的）与展示 {fullurl,filename,filesize}
		// srcIndex 记的是条目在传入数组里的原下标：坏条目被跳过后可编辑列表按它删，才不会删错行
		normalize(file, i) {
			if (!file) return null;
			if (typeof file === 'string') file = { url: file };
			const fullurl = file.fullurl || file.url || '';
			if (!fullurl) return null;
			const filename = file.filename || file.name || '附件文件';
			return {
				id: file.id === undefined || file.id === '' ? 'file-' + i : file.id,
				srcIndex: i,
				filename: filename,
				filetype: file.filetype || this.$tools.getFilePreviewType(filename),
				fullurl: fullurl,
				filesize: file.filesize || file.size || 0,
			};
		},
		openFile(file) {
			if (!file) return;
			this.$emit('open', file);
			if (!this.preview) return;
			// 微信小程序端文档要下载后原生打开（与动态卡片同一分支），图片/视频/音频进通用预览弹窗
			// #ifdef MP-WEIXIN
			if (file.filetype == 'document') {
				this.$tools.openDocument(file.fullurl);
				return;
			}
			// #endif
			this.previewData = file;
			this.previewVisible = true;
		},
	},
};
</script>

<style scoped>
.post-files { display: flex; flex-direction: column; }
.post-file-item { display: flex; align-items: center; background: #f2f3f5; border-radius: 4.5px; padding: 9px; margin-bottom: 6px; }
.post-file-item:last-child { margin-bottom: 0; }
.post-file-item .file-icon { width: 18px; height: 18px; margin-right: 7.5px; flex-shrink: 0; }
.post-file-item .file-name { flex: 1; font-size: 14px; color: #1d2129; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
/* 编辑模式删除按钮（与媒体九宫格删除按钮一致：圆形半透明底） */
.file-del { flex: none; width: 16px; height: 16px; border-radius: 50%; background: rgba(31,35,41,0.68); display: flex; align-items: center; justify-content: center; }
/* 禁用态（上传中/加载中）：删除按钮置灰，不可点击 */
.file-del.is-disabled { opacity: 0.5; }
</style>
