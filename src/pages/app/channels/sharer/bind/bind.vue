<template>
	<view class="container">

		

		<tz-box bgColor="none">
			<div class="customer-list" v-if="list.length > 0">
				<div class="customer-item" v-for="(item, index) in list">
					<div class="customer-item-info">
						<div class="customer-item-header">
							<div class="customer-item-name">
								<div>{{ item.store.nickname}}</div>
								<div class="customer-item-list">
									绑定时间: {{ item.bind_time_text }}
								</div>
							</div>
							<div class="customer-item-more" v-if="item.status == 1" @click="unbind(item.id)">
								<u-text color="#FF6146" text="解绑" :size="14"/>
							</div>
							<div class="customer-item-more" v-if="!item.openid" @click="unbind(item.id)">
								<u-text color="#FF6146" text="删除" :size="14"/>
							</div>
						</div>

						<div class="customer-item-list">
							微信号码: {{ item.wechat ? item.wechat : '-'}}
						</div>
						<div class="customer-item-list">
							微信昵称: {{ item.nickname ? item.nickname : '-'}}
						</div>
						<div class="customer-item-list">
							身份类型: {{ item.sharer_type_text ? item.sharer_type_text : '-'}}
						</div>
						<div class="customer-item-list">
							绑定状态: {{ item.status_text ? item.status_text : '-'}}
						</div>
						
					</div>
				</div>
			</div>

			
			<u-empty icon="/static/image/empty.png" text="暂无记录" width="70" height="70" v-else />
		</tz-box>



		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
