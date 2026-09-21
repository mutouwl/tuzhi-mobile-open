<template>
	<div class="container">


		<div class="exam-header-box">
			<img :src="data.cover" class="exam-cover">
			<div class="exam-info-box">

				<div class="exam-info-bg"></div>

				<div class="exam-info-title one-line-hidden">
					{{ data.name }}
				</div>

				<!-- <div class="exam-info-degree">
					<div>难度</div>
					<div class="exam-info-rate">
						<u-rate :count="3" :value="data.degree" :size="16" :readonly="true"></u-rate>
					</div>
				</div> -->
			</div>
		</div>

		<tz-box>
			<div class="exam-property-box">

				<div class="exam-property-item price" v-if="data.sales_type == 2 && data.is_auth == false">
					<div class="exam-property-item-name">售价</div>

					<div class="exam-property-item-value">

						<span class="exam-property-item-unit" v-if="!isVirtualPay(data)">¥</span>
						<span>{{ data.pay_price }}</span>
						<span class="exam-property-item-unit" v-if="isVirtualPay(data)">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
					</div>
				</div>

				

				<div class="exam-property-item">
					<div class="exam-property-item-name">总题量</div>
					<div class="exam-property-item-value">
						<span>{{data.question_total_count}}</span>
						<span class="exam-property-item-unit">题</span>
					</div>
				</div>

				<div class="exam-property-item">
					<div class="exam-property-item-name">单次题量</div>
					<div class="exam-property-item-value">
						<span>{{ data.question_count }}</span>
						<span class="exam-property-item-unit">/次</span>
					</div>
				</div>

				<div class="exam-property-item">
					<div class="exam-property-item-name">出题模式</div>
					<div class="exam-property-item-value">
						<span style="font-size: 16px;">{{ data.question_mode == 'sort' ? '顺序' : '随机' }}</span>
						<span class="exam-property-item-unit"></span>
					</div>
				</div>
			</div>

			<coupon-goods-bar v-if="!isVirtualPay(data)" goods-type="exercises" :goods-id="data.id"/>
		</tz-box>

		<template v-if="data.sales_type == 3 && data.course && data.course.id">
			<tz-divider />
			<tz-title title="该练习关联课程" size="small" :more="false" />
			<tz-box padding="0 15px 15px">
				<bind-course-list :data="[data.course]"/>
			</tz-box>
		</template>

		<template v-if="data.sales_type == 3 && (!data.course || !data.course.id)">
			<tz-divider />
			<tz-title title="该练习关联课程" size="small" :more="false" />
			<tz-box padding="0 15px 15px">
				<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无关联课程"></u-empty>
			</tz-box>
		</template>

		<template v-if="data.detail && data.detail != '<p><br></p>'">
			<tz-divider />
			<tz-title title="练习详情" size="small" :more="false" />
			<tz-box padding="0 15px 15px">
				<tz-parse :content="data.detail" />
			</tz-box>
		</template>

		<template v-if="!data.is_auth">
			<tz-bottom-btn @handle="subscription()" btnTitle="立即订阅"  v-if="data.sales_type == 2"/>
			<tz-bottom-btn @handle="$nav.to(data.course.id, 'course')" :btnTitle="(data.course && data.course.id) ? '去订阅关联课程' : '暂未开放'" v-if="data.sales_type == 3"/>
		</template>
		<template v-if="data.is_auth">

			<tz-bottom-btn @handle="subscribe" v-if="!data.is_subscribe" btnTitle="加入练习"/>

			<tz-bottom-btn v-else @handle="modal.exercisesControl = true" btnTitle="查看练习"/>			
		</template>
		<tz-tab-bar />
		<tz-footer />

		<bind-mobile-modal/>

		<exercises-control-modal :exercises-id="data.id" @close="modal.exercisesControl = false" :visible="modal.exercisesControl"/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
