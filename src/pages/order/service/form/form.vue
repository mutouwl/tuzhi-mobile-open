<template>
	<view class="container">

		<template v-if="!error">
			<tz-box padding="15px 15px 0">
				<!-- <div  v-for="(item, index) in data.goodsList" :key="index" :id="item.item_id">{{ item.snapshoot.count }}--</div> -->
				<course v-if="item.snapshoot" v-for="(item, index) in data.goodsList" :key="index" :itemId="item.item_id"
					:name="item.snapshoot.name" :cover="item.snapshoot.cover" :type="item.snapshoot.type"
					:price="item.snapshoot.price" :count="item.count" />
				<tz-divider bgColor="#fff" />
				<u-line dashed></u-line>
				<tz-divider bgColor="#fff" />
				<div class="total-box">
					共{{ data.goods_count }}件，商品小记：
					<span class="price">
						<span class="unit">¥</span>
						{{ data.real_price }}
					</span>
				</div>
				<tz-divider bgColor="#fff" />
				<u-form :labelWidth="labelWidth">
					<u-form-item label="售后方式">
						<u-input border="none" value="退款" disabled disabledColor="#ffffff" inputAlign="right"></u-input>
					</u-form-item>
					<u-form-item label="售后原因" @click="modal.reason = true">
						<div class="reason-text">{{ reasonText }}</div>
							<u-icon slot="right" color="#999" @click="modal.reason = true" name="arrow-right"></u-icon>
					</u-form-item>


				</u-form>
			</tz-box>
			<tz-divider />
			<tz-box padding="5px 15px">
				<u-form :labelWidth="labelWidth">
					<u-form-item label="退款金额">
						<u-input border="none" color="red" value="¥2.00" disabled disabledColor="#ffffff"
							inputAlign="right"></u-input>

					</u-form-item>
					<u-alert type="info" :fontSize="12" description="最多可退¥2.00，退款时将返还实际支付金额"></u-alert>
					<u-form-item label="联系电话">
						<u-input border="none" v-model="form.mobile" placeholder="请输入联系电话" inputAlign="right"></u-input>
					</u-form-item>
					<u-form-item label="售后说明">
						<u-input border="none" v-model="form.remark" placeholder="请输入内容,最多可输入200字" maxlength="200" inputAlign="right"></u-input>
					</u-form-item>
				</u-form>
			</tz-box>
			<tz-bottom-btn btnTitle="提交" @handle="submit" />
		</template>
		<u-empty mode="order" text="加载中" v-if="error"></u-empty>


		<u-action-sheet v-if="reasonOption.length > 0" cancelText="取消" :closeOnClickOverlay="true" :closeOnClickAction="true"
			 :show="modal.reason"
			@close="modal.reason = false" :actions="reasonOption" title="请选择原因" @select="reasonSelect">
		</u-action-sheet>
		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
