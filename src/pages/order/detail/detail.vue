<template>
	<view class="container">
		<tz-loading-page tip="订单数据加载中" :loading="loading" />
		<template v-if="!error">
			<tz-box round>
				<status-bar :status="data.status" :describe="data.describe" />
			</tz-box>


		<!-- 收货地址 - 实物商品或规格含实物商品的组合商品显示 -->
		<tz-box v-if="data.address"  padding="15px 15px" :marginTop="10" round>
			<view class="address-detail">
				<view class="user-info">
					<text class="name">{{ data.address.consignee }}</text>
					<text class="mobile">{{ data.address.mobile }}</text>
				</view>
				<view class="address-text">
					{{ data.address.province_name }}{{ data.address.city_name }}{{ data.address.district_name }}{{ data.address.address }}
				</view>
			</view>
		</tz-box>

		<tz-box padding="5px 15px 10px" :marginTop="10" round>
				<!-- <div  v-for="(item, index) in data.goodsList" :key="index" :id="item.item_id">{{ item.snapshoot.count }}--</div> -->
				<template v-for="(item, index) in data.goodsList">
					<view :key="index" v-if="item.snapshoot">
						<course :itemId="item.item_id" :name="item.snapshoot.name" :cover="item.snapshoot.cover"
							:type="item.snapshoot.type" :price="item.snapshoot.price" :count="item.count" :more="true"
							:is-virtual-pay="isVirtualPay"/>
						<!-- 组合商品内含子商品 -->
						<view class="sub-goods-list" v-if="item.snapshoot.type === 'composite' && item.snapshoot.sub_goods_list && item.snapshoot.sub_goods_list.length">
							<view class="sub-goods-item" v-for="(sub, si) in item.snapshoot.sub_goods_list" :key="si">
								<image class="sub-goods-cover" :src="sub.sub_goods_cover" mode="aspectFill">
									<view class="sub-goods-type-tag">{{ subGoodsTypeName(sub.sub_goods_type) }}</view>
								</image>
								<view class="sub-goods-info">
									<text class="sub-goods-name">{{ sub.sub_goods_name }}</text>
									<view class="sub-goods-bottom">
										<text class="sub-goods-price">¥{{ sub.sub_goods_price }}</text>
										<text class="sub-goods-validity" v-if="subGoodsValidity(sub)">{{ subGoodsValidity(sub) }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>
				</template>
				<tz-divider bgColor="#fff" />
				<!-- <u-line dashed></u-line> -->
				<tz-divider bgColor="#fff" />
				<div class="total-box">
					合计：
					<span class="price">
						<span class="unit" v-if="!isVirtualPay">¥</span>
						{{ data.real_price ? data.real_price : 0 }}
						<span class="unit" v-if="isVirtualPay">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
					</span>
				</div>
			</tz-box>

			<!-- <tz-divider />
			<tz-box>
				<u-cell-group :border="false">
					<u-cell size="large" :border="false" title="优惠券" value="-¥1.23"></u-cell>
					<u-cell size="large" :border="false" title="积分抵扣" value="-¥20.3"></u-cell>
				</u-cell-group>
				<tz-divider bgColor="#fff" />
				<u-line dashed></u-line>
				<tz-divider bgColor="#fff" />
				<div class="total-box">
					实付：
					<span class="price">
						<span class="unit">¥</span>
						232
					</span>
				</div>
			</tz-box> -->

			<tz-box :marginTop="10" round>
				<u-cell-group :border="false" :customStyle="{ fontSize: '12px' }">
					<u-cell size="large" :border="false" title="备注"
						:value="data.buyer_remark ? data.buyer_remark : '-'"></u-cell>
					<u-cell size="large" :border="false" title="支付方式" :value="$t('paytype.' + data.pay_type)"></u-cell>
					<u-cell size="large" :border="false" title="订单号" :value="data.order_no"></u-cell>
					<u-cell v-if="data.coupon_discount_fee > 0" size="large" :border="false" title="优惠券"
						:value="formatDiscountPrice(data.coupon_discount_fee)"></u-cell>
					<u-cell v-if="data.vip_discount_price > 0" size="large" :border="false" title="会员折扣"
						:value="formatDiscountPrice(data.vip_discount_price)"></u-cell>
					<u-cell v-if="data.score_amount" size="large" :border="false" title="消耗积分"
						:value="'-' + data.score_amount"></u-cell>
					<u-cell size="large" :border="false" title="创建时间"
						:value="$tools.formatDate(data.createtime)"></u-cell>
					<!-- <u-cell size="large" :border="false" title="支付时间" :value="$tools.formatDate(data.pay_time)"></u-cell> -->
				</u-cell-group>
			</tz-box>
			<!-- <tz-divider /> -->
			<tz-box padding="10px 15px" :marginTop="10" round >
				<div class="order-footer">
					<!-- <u-button v-if="showRefundLogBtn"
						@click="$nav.to('/pages/order/service/refundlog/refundlog?order_no='+data.order_no)"
						class="order-btn" text="退款记录" style="width: 70px;"></u-button> -->
					<!-- <u-button v-for="(item, index) in data.controll" :key="index" v-if="item"
						@click="orderHandle(index)" class="order-btn" :text="$t('controll.' + index)"
						style="width: 70px;"></u-button> -->

					<tz-button v-if="showRefundLogBtn" size="small" text="退款记录" @click="
              $nav.to(
                '/pages/order/service/refundlog/refundlog?order_no=' + data.order_no
              )
            "></tz-button>

					<template v-for="(item, index) in data.controll">
						<tz-button :key="index" v-if="item" size="small" :text="$t('controll.' + index)"
							style="margin-left: 10px" @click="orderHandle(index)"></tz-button>
					</template>
				</div>
			</tz-box>

			<evaluate-items :visible="modal.evaluate" :orderNo="data.order_no" @close="modelShow('evaluate')" />
			<tz-pay :visible="modal.pay" :order-no="data.order_no" :money="data.real_price" :is-virtual-pay="isVirtualPay" @close="modelShow('pay')"
				@handle="payHandle"></tz-pay>
		</template>
		<u-empty mode="order" text="加载中" v-if="error"></u-empty>

		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>
