<template>
	<!-- 展示/编辑共用：editable 时右侧为删除按钮（emit remove），展示模式为更多箭头（emit open） -->
	<view class="post-files">
		<view v-for="(file, i) in files" :key="file.id" class="post-file-item" @tap.stop="openFile(file)">
			<image :src="'/static/image/filetype/' + file.filetype + '.png'" class="file-icon" mode="aspectFit" />
			<text class="file-name">{{ file.filename }}</text>
			<view v-if="editable" class="file-del" :class="{ 'is-disabled': disabled }" @tap.stop="!disabled && $emit('remove', file, i)"><tz-icon name="close" :size="10" color="#fff" /></view>
			<tz-icon v-else name="more" :size="10" color="#86909c" />
		</view>
	</view>
</template>

<script>
/**
 * 圈子动态文件列表（通用组件：动态卡片/动态详情展示 + 发布页/回复弹窗媒体编辑器共用，样式完全一致）
 * props: files（[{ id, filename, filetype, fullurl, filesize }]）、editable（编辑模式：右侧删除按钮，默认 false）
 * emits: open(file)（点击文件行，预览/打开交给父级处理）、remove(file, index)（编辑模式点击删除）
 */
export default {
	name: 'tz-circle-file-list',
	props: {
		files: { type: Array, default: () => [] },
		editable: { type: Boolean, default: false },
		// 禁用删除操作（上传中/页面加载中）：删除按钮置灰且不可点击
		disabled: { type: Boolean, default: false },
	},
	emits: ['open', 'remove'],
	methods: {
		openFile(file) {
			if (file) this.$emit('open', file);
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
