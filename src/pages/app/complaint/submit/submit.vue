<template>
	<view class="complaint-submit-page">
		<view v-if="!submitted">
			<view class="section">
				<view class="section-title">投诉类型</view>
				<view class="category-path">{{ categoryPathText }}</view>
			</view>

			<view class="section">
				<view class="section-title">投诉内容</view>
				<t-textarea
					:value="content"
					:maxlength="200"
					:indicator="true"
					placeholder="请填写投诉内容"
					@change="onContentChange"
				/>
			</view>

			<view class="section">
				<view class="section-header">
					<view class="section-title">证据截图</view>
					<view class="section-count">{{ images.length }}/4</view>
				</view>
				<tz-upload v-model="images" :maxCount="4" :multiple="true" uploadUrl="common/upload" @change="onImagesChange" />
			</view>

			<view class="submit-footer">
				<t-button block theme="primary" shape="round" :loading="submitting" :disabled="!canSubmit" @click="submit">提交</t-button>
			</view>
		</view>

		<view v-else class="success-page">
			<view class="success-icon">
				<u-icon name="checkbox-mark" size="64" color="#07C160" />
			</view>
			<view class="success-text">已提交投诉</view>
			<view class="success-footer">
				<t-button block theme="primary" shape="round" variant="outline" @click="handleDone">我知道了</t-button>
			</view>
		</view>
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
