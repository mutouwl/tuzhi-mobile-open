<template>
	<view class="address-edit-page">
		<view class="form-section">
			<view class="form-item">
				<text class="form-label">收货人</text>
				<input 
					class="form-input" 
					v-model="form.name" 
					placeholder="请输入收货人姓名"
					maxlength="50"
				/>
			</view>
			<view class="form-item">
				<text class="form-label">手机号码</text>
				<view class="mobile-input">
					<text class="mobile-prefix">+86</text>
					<input 
						class="form-input" 
						v-model="form.mobile" 
						placeholder="请输入手机号码"
						type="number"
						maxlength="11"
					/>
				</view>
			</view>
			<view class="form-item" @click="showRegionPicker = true">
				<text class="form-label">所在地区</text>
				<text class="form-value" :class="{ 'placeholder': !form.province }">
					{{ regionText || '选择省/市/区' }}
				</text>
				<tz-icon name="enter" :size="16" />
			</view>
			<view class="form-item">
				<text class="form-label">详细地址</text>
				<input 
					class="form-input" 
					v-model="form.address" 
					placeholder="请输入详细地址"
					maxlength="255"
				/>
			</view>
		</view>
		
		<!-- <view class="parse-section">
			<textarea 
				class="parse-textarea" 
				v-model="parseText"
				placeholder="请粘贴包含收货人姓名、手机号和地址的完整文本"
			/>
			<view class="parse-btns">
				<button class="parse-btn clear" @click="clearParse">清除</button>
				<button class="parse-btn confirm" @click="parseAddress">识别</button>
			</view>
		</view> -->
		
		<view class="default-section">
			<text class="default-label">设为默认收货地址</text>
			<switch 
				class="default-switch" 
				:checked="form.is_default === 1"
				@change="onDefaultChange"
				color="#0968f6"
			/>
		</view>
		
		<view class="bottom-btns">
			<button v-if="isEdit" class="delete-btn" @click="deleteAddress">删除</button>
			<button class="save-btn" @click="saveAddress">保存地址</button>
		</view>
		
		<!-- 省市区选择器 -->
		<region-picker
			:show="showRegionPicker"
			:province="form.province"
			:city="form.city"
			:district="form.district"
			@confirm="onRegionConfirm"
			@close="showRegionPicker = false"
		/>
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
