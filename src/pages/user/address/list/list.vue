<template>
	<view class="address-list-page">
		<view class="address-list">
			<view 
				class="address-item" 
				v-for="(item, index) in addressList" 
				:key="item.id"
				@click="selectAddress(item)"
			>
				<view class="address-main">
					<view class="address-info">
						<view class="user-info">
							<text class="name">{{ item.name }}</text>
							<text class="mobile">{{ item.mobile }}</text>
						</view>
						<view class="address-text">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.address }}</view>
					</view>
					<text class="cell-arrow" v-if="isSelectMode"><tz-icon name="enter" :size="16" /></text>
				</view>
				<view class="address-actions">
					<view class="default-section" @click.stop="setDefault(item)">
						<view class="radio" :class="{ 'radio-checked': item.is_default === 1 }"></view>
						<text class="default-text">设为默认</text>
					</view>
					<view class="action-btns">
						<text class="action-btn" @click.stop="deleteAddress(item)">删除</text>
						<text class="action-btn" @click.stop="editAddress(item)">编辑</text>
					</view>
				</view>
			</view>
			
			<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="addressList.length === 0 && !loading" text="暂无收货地址" />
		</view>
		
		<u-loading-page :loading="loading" bg-color="#F7F8FA"></u-loading-page>
		
		<view class="bottom-btn">
			<button class="add-btn" @click="addAddress">新增地址</button>
		</view>
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
