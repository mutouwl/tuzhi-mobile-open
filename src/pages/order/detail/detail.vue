<template>
	<view class="container">
		<!-- 加载骨架屏：块结构与真实内容逐块对齐（状态卡 / 商品卡 / 订单信息卡），替代整页 loading 遮罩；
		     仅首次加载展示，onShow 等已有内容刷新静默更新不闪骨架 -->
		<template v-if="loading && error">
			<view class="detail-sk-card">
				<view class="detail-sk-status">
					<view class="detail-sk-status-icon"></view>
					<view class="detail-sk-status-info">
						<view class="detail-sk-status-title"></view>
						<view class="detail-sk-status-label"></view>
					</view>
				</view>
			</view>
			<view class="detail-sk-card">
				<view class="detail-sk-goods" v-for="i in 2" :key="i">
					<view class="detail-sk-goods-cover"></view>
					<view class="detail-sk-goods-info">
						<u-skeleton :loading="true" :animate="true" :title="true" title-width="70%" title-height="16" :rows="2" rows-width="45%" rows-height="12" />
					</view>
				</view>
				<view class="detail-sk-total"></view>
			</view>
			<view class="detail-sk-card">
				<view class="detail-sk-cell" v-for="i in 4" :key="i">
					<view class="detail-sk-cell-label"></view>
					<view class="detail-sk-cell-value"></view>
				</view>
			</view>
		</template>
		<template v-else-if="!error">
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
						<course :itemId="item.item_id" :packageId="item.snapshoot.package_id || ''" :name="item.snapshoot.name" :cover="item.snapshoot.cover"
							:type="item.snapshoot.type" :price="item.snapshoot.price" :count="item.count" :more="true"
							:is-virtual-pay="isVirtualPay"/>
						<!-- 组合商品内含子商品 -->
						<view class="sub-goods-list" v-if="item.snapshoot.type === 'composite' && item.snapshoot.sub_goods_list && item.snapshoot.sub_goods_list.length">
							<view class="sub-goods-item" v-for="(sub, si) in item.snapshoot.sub_goods_list" :key="si">
								<view class="sub-goods-cover">
									<!-- 类型标签不能写在 <image> 内部：小程序的 image 不渲染子节点，编译期会静默丢掉该节点（H5 正常） -->
									<image class="sub-goods-img" :src="sub.sub_goods_cover" mode="aspectFill" />
									<view class="sub-goods-type-tag">{{ subGoodsTypeName(sub.sub_goods_type) }}</view>
								</view>
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
			<!-- 底部操作卡：无任何可展示按钮时整卡不渲染，避免详情页底部留一张空白卡片 -->
			<tz-box v-if="hasOrderAction" padding="10px 15px" :marginTop="10" round >
				<div class="order-footer">
					<!-- <u-button v-if="showRefundLogBtn"
						@click="$nav.to('/pages/order/service/refundlog/refundlog?order_no='+data.order_no)"
						class="order-btn" text="退款记录" style="width: 70px;"></u-button> -->
					<!-- <u-button v-for="(item, index) in data.controll" :key="index" v-if="item"
						@click="orderHandle(index)" class="order-btn" :text="$t('controll.' + index)"
						style="width: 70px;"></u-button> -->

					<tz-button v-if="isSchoolOrder" size="small" text="报名信息" @click="openEnroll"></tz-button>

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

				<!-- 报名信息弹层 - 教务订单（复用确认报名页版式：商品卡 + 校区/上课学生/班级卡，商品卡可跳转套餐详情） -->
				<u-popup :show="modal.enroll" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="true"
					@close="modelShow('enroll')">
					<view class="enroll-popup">
						<view class="enroll-popup-title">报名信息</view>
						<!-- 加载态：骨架屏占位，块结构与真实内容一一对应（商品卡 90px 封面 + 三行信息 + 底部按钮行），请求返回前不是空白弹层，返回时弹层高度不跳动 -->
						<view class="enroll-popup-body" v-if="enrollLoading">
							<view class="enroll-sk-card enroll-sk-goods">
								<view class="enroll-sk-cover"></view>
								<view class="enroll-sk-goods-info">
									<u-skeleton
										:loading="true"
										:animate="true"
										title-width="70%"
										title-height="18"
										:rows="2"
										rows-width="50%"
										rows-height="14"
									/>
								</view>
							</view>
							<view class="enroll-sk-card">
								<view class="enroll-sk-cell" v-for="i in 3" :key="i">
									<view class="enroll-sk-label"></view>
									<view class="enroll-sk-value"></view>
								</view>
							</view>
							<view class="enroll-sk-ops"></view>
						</view>
						<view class="enroll-popup-body" v-else>
							<!-- 商品卡为共用组件 package-goods-card（与确认报名页同源），可点击跳转套餐详情 -->
							<package-goods-card
								class="enroll-goods-card"
								:cover="enrollInfo.cover"
								:name="enrollInfo.package_name"
								:sku-name="enrollInfo.sku_name"
								:price="enrollInfo.real_price"
								:lessons="enrollInfo.lessons_total"
								:valid-text="enrollInfo.valid_text"
								:arrow="canGoPackage"
								@card-click="goPackage"
							/>
								<view class="enroll-cell-card">
									<!-- 校区行整行可点进校区详情（同请假详情/课次详情「校区」行口径）；
									     校区已删除/后台开课未选校区时接口不下发 campus_id，箭头不出、点击不响应 -->
									<view class="enroll-cell" @click="goCampus">
										<view class="enroll-label">校区</view>
										<view class="enroll-value">
											<text class="enroll-value-text" :class="{ 'enroll-placeholder': !enrollInfo.campus_name }">{{ enrollInfo.campus_name || '-' }}</text>
											<tz-icon v-if="enrollInfo.campus_id" class="enroll-arrow" name="enter" color="#86909C" :size="13" />
										</view>
									</view>
								<view class="enroll-cell">
									<view class="enroll-label">上课学生</view>
									<view class="enroll-value">
										<text class="enroll-value-text" :class="{ 'enroll-placeholder': !enrollInfo.student_name }">{{ enrollInfo.student_name || '-' }}</text>
									</view>
								</view>
								<view class="enroll-cell">
									<view class="enroll-label">班级</view>
									<view class="enroll-value">
										<text class="enroll-value-text" :class="{ 'enroll-placeholder': !enrollInfo.class_names }">{{ enrollInfo.class_names || '-' }}</text>
									</view>
								</view>
							</view>
							<!-- 底部操作按钮：样式取「我的预约」详情弹层下方按钮（tz-button size=normal + long 整宽、
							     默认灰底档，同「取消预约」那颗），与本页其余操作按钮同款组件；
							     左右仍跟卡片同边界，故只补上间距 -->
							<view class="enroll-popup-ops">
								<tz-button size="normal" long text="进入教务中心" @click="goSchoolCenter"></tz-button>
							</view>
						</view>
					</view>
				</u-popup>
		</template>
		<u-empty mode="order" text="加载中" v-else></u-empty>

		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>
