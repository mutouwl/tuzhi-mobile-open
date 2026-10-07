<template>
	<view class="container">

		<u-sticky bgColor="#fff" :offsetTop="0">
			<!-- <u-tabs :list="tabs" @change="tabChange"></u-tabs> -->
			<tz-box padding="10px 15px 5px">
				<div class="filter-bar">
					<u-search  shape="square" style="width:100%"placeholder="请输入用户昵称" @search="refresh" v-model="form.name" :showAction="false"></u-search>
					<div class="search-field" @click="changeOrder">
						<span>按绑定时间排序</span>
						<span>
							<tz-icon :name="form.order == 'asc' ? 'zhengxu2' : 'daoxu'" :size="14" />
						</span>
					</div>
				</div>
			</tz-box>
		</u-sticky>



		<tz-box bgColor="none">
			<!-- 首屏骨架屏：占位块逐块对齐真实客户卡（45px 头像圆 / 昵称行 + 最近下单 / 两行订单金额），
			     吸顶搜索栏与排序按钮留在骨架屏外保持可点（M16）；翻页追加列表不闪骨架 -->
			<div class="customer-list cus-sk" v-if="loading">
				<div class="customer-item" v-for="i in 4" :key="i">
					<div class="customer-item-cover cus-sk-block"></div>
					<div class="customer-item-info">
						<div class="customer-item-header">
							<div class="cus-sk-col">
								<div class="cus-sk-line cus-sk-block sk-h-14 sk-w-35"></div>
								<div class="cus-sk-line cus-sk-block sk-h-12 sk-w-50"></div>
							</div>
						</div>
						<div class="cus-sk-line cus-sk-block sk-h-12 sk-w-60"></div>
						<div class="cus-sk-line cus-sk-block sk-h-12 sk-w-60"></div>
					</div>
				</div>
			</div>

			<div class="customer-list" v-else-if="list.length > 0">
				<div class="customer-item" v-for="(item, index) in list"
					@click="$nav.to('/pages/app/agent/log/customer/detail/detail?id=' + item.user_id)">
					<div class="customer-item-cover">
						<img :src="item.user.avatar" />
					</div>
					<div class="customer-item-info">
						<div class="customer-item-header">
							<div class="customer-item-name">
								<div>{{ item.user.nickname }}</div>
								<div class="customer-item-list">
									最近下单: {{ item.order.order_last_time ? $tools.formatDate(item.order.order_last_time) :
										'-' }}
								</div>
							</div>
							<div class="customer-item-more">
								<tz-icon name="enter" color="#86909C" :size="13" />
							</div>
						</div>

						<div class="customer-item-list">
							等结算订单金额: ¥{{ item.order.price_waiting }}
						</div>
						<div class="customer-item-list">
							已结算订单金额: ¥{{ item.order.price_success }}
						</div>
					</div>
				</div>
			</div>

			<u-empty icon="/static/image/empty.png" width="70" height="70" v-else />
		</tz-box>

		<tz-footer />
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
