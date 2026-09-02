<template>
	<div class="container">
		<u-loading-page :loading="loading"></u-loading-page>

		<banner :cover="data.cover" type="activity" />

		<tz-box padding="15px 15px 15px">
			<div class="info">
				<div class="title">
					{{ data.name }}
				</div>
				<div class="activity-price" v-if="hasPrice(data.price)">
					<template v-if="isVirtualPay(data)">
						<span class="price-value">{{ data.price }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
					</template>
					<template v-else>
						<span class="price-unit">¥</span><span class="price-value">{{ data.price }}</span>
					</template>
				</div>
			</div>

			<live-start-time-bar :start-time="data.activity_start_time" />

			<coupon-goods-bar v-if="!isVirtualPay(data)" goods-type="activity" :goods-id="data.id" />
		</tz-box>
		<tz-divider />

		<template v-if="bindCoutseList.length > 0">
			<tz-box padding="0px 15px 0px">
				<div class="bind-course-box">
					<div class="bind-course-title">参与该活动需订阅以下课程</div>

					<div
						class="bind-course-item-box"
						v-for="(item, index) in bindCoutseList"
						@click="$nav.to(item.course.id, 'course')">
						<div class="bind-course-item-cover">
							<img :src="item.course.cover" />
						</div>

						<div class="bind-course-item-info">
							<div class="bind-course-item-info-title one-line-hidden">
								{{ item.course.name }}
							</div>
							<div class="bind-course-item-info-subtitle">
								{{ item.subscription ? "已订阅" : "未订阅" }}
							</div>
						</div>

						<div class="bind-course-item-more">
							<tz-icon name="enter" color="#86909C" :size="16" />
						</div>
					</div>
				</div>
			</tz-box>
			<tz-divider />
		</template>

		<tz-box padding="0px 5px 0px">
			<div class="activity-info-box">
				<u-cell-group :border="false">
					<u-cell
						v-if="data.activity_start_time"
						icon="setting-fill"
						:title="
              $tools.formatDate(data.activity_start_time) +
              ' 至 ' +
              $tools.formatDate(data.activity_end_time)
            ">
						<template #icon>
							<span class="activity-info-title"> 活动时间: </span>
						</template>
					</u-cell>
					<u-cell
						v-if="data.activity_start_time"
						icon="setting-fill"
						:title="
              $tools.formatDate(data.apply_start_time) +
              ' 至 ' +
              $tools.formatDate(data.apply_end_time)
            ">
						<template #icon>
							<span class="activity-info-title"> 报名时间: </span>
						</template>
					</u-cell>
					<u-cell
						:border="data.apply_user_count > 0"
						icon="setting-fill"
						:title="data.location">
						<template slot="icon">
							<span class="activity-info-title"> 活动地点: </span>
						</template>
					</u-cell>
					<u-cell
						v-if="data.apply_user_count > 0"
						:border="false"
						icon="setting-fill"
						:title="data.apply_user_count + '人'">
						<template #icon>
							<span class="activity-info-title"> 报名人数: </span>
						</template>
					</u-cell>

					<u-cell icon="setting-fill" :title="data.views + 1 + '次'">
						<template slot="icon">
							<span class="activity-info-title"> 浏览次数: </span>
						</template>
					</u-cell>
				</u-cell-group>
			</div>
		</tz-box>

		<tz-divider />

		<tz-box padding="15px 15px 15px"
			v-if="data.detail && data.detail != '<p><br></p>'">
			<tz-parse :limitCopy="true" :content="data.detail"
				:selectable="true"></tz-parse>
		</tz-box>

		<tz-bottom-btn
			@handle="apply"
			:disabled="!data.apply_status"
			:btnTitle="!data.apply_status ? '报名已截止' : '立即报名'" />

		<bind-mobile-modal />

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
