<template>
	<view class="container">

		<template v-if="!error">


			<u-empty mode="order" text="非售后订单" v-if="data.service == 0"></u-empty>

			<template v-if="data.service != 0">
				<tz-box>
					<u-cell :border="false" :titleStyle="{ fontWeight: 600 }" :title="statusTip[data.service].title"
						:label="statusTip[data.service].describe" center>
						<template #icon>
							<img v-if="statusTip[data.service].img"
								:src="'/static/order/status/' + statusTip[data.service].img + '.png'" class="icon">
						</template>
					</u-cell>
				</tz-box>

				<tz-divider />

				<tz-title title="退款信息" :more="false" size="sm" />
				<tz-box padding="0px 15px 15px">
					<course v-if="item.snapshoot" v-for="(item, index) in data.goodsList" :key="index"
						:itemId="item.item_id" :name="item.snapshoot.name" :cover="item.snapshoot.cover"
						:type="item.snapshoot.type" :price="item.snapshoot.price" :count="item.count" />
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
					<u-cell-group :border="false" :customStyle="{ 'fontSize': '12px' }">
						<u-cell size="large" :border="false" title="售后方式" value="退款"></u-cell>
						<u-cell size="large" :border="false" title="售后原因"
							:value="service_detail && reasonOption && reasonOption[service_detail.reason] ? reasonOption[service_detail.reason].name : '-'"></u-cell>
						<u-cell size="large" :border="false" title="手机号"
							:value="service_detail.mobile ? service_detail.mobile : '-'"></u-cell>
						<u-cell size="large" :border="false" title="退款金额" value="-"></u-cell>
						<u-cell size="large" :border="false" title="申请时间"
							:value="$tools.formatDate(service_detail.createtime)"></u-cell>
						<u-cell size="large" :border="false" title="售后说明"
							:value="service_detail.remark ? service_detail.remark : '-'"></u-cell>
					</u-cell-group>
				</tz-box>
				<template v-if="data.service == 1 || data.service == 3">
					<tz-divider />
					<tz-box padding="10px 15px">
						<div class="order-footer">
							<u-button class="order-btn" @click="cancel" text="撤销申请" style="width: 70px;"></u-button>
						</div>
					</tz-box>
				</template>
			</template>

		</template>
		<u-empty mode="order" text="加载中" v-if="error"></u-empty>


		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">@import "./css.css";</style>
