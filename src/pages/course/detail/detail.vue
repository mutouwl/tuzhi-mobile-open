<template>
	<view class="container">

		<!-- 课程详情加载骨架屏：数据加载期间展示，布局与真实页面结构一致 -->
		<view v-if="loading" class="course-detail-skeleton">
			<view class="sk-cover"></view>
			<view class="sk-card">
				<view class="sk-line sk-w-20 sk-price"></view>
				<view class="sk-line sk-w-70"></view>
				<view class="sk-line sk-w-45"></view>
			</view>
			<view class="sk-block">
				<view class="sk-line sk-w-25"></view>
				<view class="sk-comment" v-for="i in 3" :key="i">
					<view class="sk-avatar sk-avatar-sm"></view>
					<view class="sk-comment-body">
						<view class="sk-line sk-w-30"></view>
						<view class="sk-line"></view>
					</view>
				</view>
			</view>
			<view class="sk-block">
				<view class="sk-tabs">
					<view class="sk-line sk-w-20" v-for="i in 4" :key="i"></view>
				</view>
				<view class="sk-line sk-w-90"></view>
				<view class="sk-line sk-w-70"></view>
				<view class="sk-line sk-w-50"></view>
			</view>
		</view>

		<template v-if="data.subscription">
			<banner :cover="data.cover" :type="data.type" v-if="data.type == 'article' || data.type == 'column'" />

			<audio-play @ended="playEnd" @ready="mediaReady" @play="playHandle" @paused="pausedHandle" v-show="data.type == 'audio'" ref="audioPlayer" :name="data.name" :path="data.audio_path.fullurl" :allow-background-play="true"
				:patch="data.cover" :disable-seek="data.progress_seek == 'close'" />
 
			<video-play @end="playEnd" @ready="mediaReady" @play="playHandle" @paused="pausedHandle" v-show="data.type == 'video' || data.type == 'live'" ref="videoPlayer"
				:cover="data.video_patch ? data.video_patch : data.cover" :source="data.video_path.fullurl"
				:playauth="data.video_path.play_auth ? data.video_path.play_auth : ''"
				:bulletScreen="data.bullet_screen ? data.bullet_screen : false"
				:disable-seek="data.type != 'live' && data.progress_seek == 'close'" />
		</template>
		<template v-if="!data.subscription">
			<audio-play @play="playHandle" @paused="pausedHandle" v-if="data.type == 'audio' && data.try_listen_status && data.try_listen_content" :name="data.name" :allow-background-play="true"
				:path="data.try_listen_content.fullurl" :patch="data.cover" :disable-seek="data.progress_seek == 'close'" />
			<video-play @play="playHandle" @paused="pausedHandle" v-else-if="data.type == 'video' && data.try_watch_status && data.try_watch_content"
				:cover="data.cover" :source="data.try_watch_content.fullurl"
				:bullet_screen="data.bullet_screen ? data.bullet_screen : false"
				:disable-seek="data.progress_seek == 'close'" />
			<banner v-else :cover="data.cover" :type="data.type" />

		</template>

		<tz-box padding="15px 15px 15px" v-if="data.subscription">
			<div class="info">
				<div class="title">
					{{ data.name }}
				</div>
				<div class="subtitle">
					{{ $tools.timestamp(data.createtime) }}<text v-if="data.study_num_show != 'close'">｜{{ data.study_num }} 次学习</text>
				</div>
			</div>
		</tz-box>




		<tz-box padding="10px 15px 15px" v-if="!data.subscription">

			<div class="course-info">
				<div class="score" v-if="pageParams.type && pageParams.type == 'score'">
					<span><span class="unit">兑换积分</span> {{ scoreGoodsDetail.score }}</span>
					<span class="sales">销量{{ scoreGoodsDetail.sales }}</span>
				</div>

				<div class="price" v-else>

					<template v-if="!data.sales_type.includes('alone')">
						<span class="unit" >该课程暂不支持单独订阅</span>
					</template>

					<template v-else>
						<template v-if="data.pay_type == 'pay'">
							<template v-if="isVirtualPay(data)">
								<span class="price-value">{{ data.price }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
							</template>
							<template v-else>
								<span class="unit">¥</span> {{ data.price }}
							</template>
						</template>

						<template v-if="data.pay_type == 'password'">
							密码兑换
						</template>

						<template v-if="data.pay_type == 'free'">
							免费
						</template>
						<span class="price_marking" v-if="data.price_marking > 0">{{ formatPrice(data.price_marking, data) }}</span>
					</template>


				</div>

				<div class="vip-bar" @click="$nav.to('/pages/app/vip/center/center')"
					v-if="goodsVipPrivilege && goodsVipPrivilege.goodsVipInfo">
					<span>
						<span class="vip-tag">VIP</span>
						<span>{{ goodsVipPrivilege.isNowGoodsVip ? '已' : ''
						}}开通{{ goodsVipPrivilege.goodsVipInfo.card.title }}，可享 <span class="vip-privilege">{{
	goodsVipPrivilege.goodsVipInfo.type == 'discount' ?
	goodsVipPrivilege.goodsVipInfo.card.privilege_discount_val + '折' : '免费权益' }} </span></span>
					</span>
					<span><tz-icon name="enter" :size="18" color="#FFA215" /></span>
				</div>
				<div class="title">
					{{ data.name }}
				</div>
				<div class="subtitle" v-if="data.briefing">
					{{ data.briefing }}
				</div>

				<template v-if="data.type == 'live'">
					<tz-divider bgColor="none" />
					<live-start-time-bar :start-time="data.live_start_time" :end-time="data.live_end_time" />
				</template>
			</div>

			<coupon-goods-bar v-if="!isVirtualPay(data)" :goods-type="data.type" :goods-id="data.id"/>
		</tz-box>
		

		<tz-divider />


		<template v-if="data.bind_data.length > 0">
			<tz-title @click="bindDataShow = true" title="资料" :subtitle="'共' + data.bind_data.length + '个文件'" />
			<tz-divider />
		</template>
		<template v-if="!data.subscription && $tools.systemConfig('evaluate_entry_status') != 'close'">
			<tz-title title="评价" :subtitle="evaluate.count == 0 ? '暂无评价' : '查看' + evaluate.count + '条评价'" :link="{
				src: '/pages/order/evaluate/list/list?item_id=' + data.id,
				type: 'local'
			}" />

			<div class="evaluate-list">
				<div class="evaluate-item" v-for="(item, index) in evaluate.list" :key="index"
					v-if="evaluate.list.length > 0">
					<evaluate :content="item.content" :rate="item.rate" :time="$tools.formatDate(item.createtime)"
						:imgs="item.imgs" :avatar="item.user.avatar" :username="item.user.nickname" />
				</div>
			</div>
			<tz-divider />
		</template>

		<!-- 课程所属专栏列表 -->
		<column-belongs :itemId="data.id" />


		<comment-input :show="modal.comment" @confirm="addComment" @close="modal.comment = false"
			@cancel="modal.comment = false" />
		<template v-if="tabs.length > 0">
			<tz-box padding="0px 15px 15px">

				<u-sticky :z-index="10" bgColor="#fff" :offsetTop="0">
					<div class="content-header">
						<u-tabs :list="tabs" @click="tabsChange"></u-tabs>
						<div class="filter" v-if="tabsChecked == 'comment'"
							@click="commentSort = commentSort == 'time' ? 'like' : 'time'">
							{{ commentSort == 'time' ? '按时间' : '按热度' }}
							<tz-icon name="paixu" :size="16" color="#86909C" />
						</div>

						<!-- <div class="filter" v-if="tabsChecked == 'dir'"
							@click="dirSort = dirSort == 'asc' ? 'desc' : 'asc'">
							<tz-icon v-if="dirSort == 'asc'" name="zhengxu2" :size="14" color="#86909C" />
							<tz-icon v-else name="daoxu" :size="14" color="#86909C" />
						</div> -->
					</div>

				</u-sticky>
				<!-- 专栏中的课程目录 -->
				<column-dir v-if="tabsChecked == 'dir'" :columnId="data.id" :sort="dirSort" />

				<template v-if="tabsChecked == 'comment'">
					<comment-list :courseId="data.id" @reply="replyComment" ref="comment" :sort="commentSort" />
				</template>

				<template v-if="tabsChecked == 'recommend'">
					<div class="recommend-box">
						<!-- <tz-course-mini :round="true" :border="false" :list="recommendGoodsList"
							v-if="recommendGoodsList.length > 0"></tz-course-mini> -->
						<tz-course-mini v-if="recommendGoodsList.length > 0" :list="recommendGoodsList" :border="false" :round="true" type="single" />
						<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="recommendGoodsList.length == 0" text="暂无推荐商品" />
					</div>
				</template>

			<!-- 课堂互动 start -->
			<template v-if="tabsChecked == 'interaction'">
				<subscription-tip  v-if="!data.subscription"/>
				<interaction-tab v-else :course-id="data.id"/>
			</template>
			<!-- 课堂互动 end -->

			<!-- 圈子tab start -->
			<template v-if="tabsChecked == 'circle'">
				<view class="circle-tab">
					<!-- 圈子卡片列表（复用 tz-circle 组件 mini 紧凑模式，一个课程可绑定多个圈子） -->
					<tz-circle :list="circleList" type="mini" :border="1" />
				</view>
			</template>
			<!-- 圈子tab end -->



				<template v-if="tabsChecked == 'detail'">
					<tz-divider bgColor="none" />
					<template v-if="!data.subscription">
						<subscription-tip v-if="(!data.try_read_status || !data.try_read_content)" />
						<tz-parse :limitCopy="data.limit_copy == 1 ? true : false" v-else :content="data.try_read_content"
							:selectable="true"></tz-parse>
					</template>
					<template v-else>
						<tz-parse :limitCopy="data.limit_copy == 1 ? true : false"
							v-if="tabsChecked == 'detail' && data.detail && data.detail != '<p><br></p>'"
							:content="data.detail" :selectable="true"></tz-parse>
					</template>
				</template>

			</tz-box>
			<tz-divider />
		</template>

<template v-if="data.subscription && $tools.systemConfig('evaluate_entry_status') != 'close'">
			<tz-title title="评价" :subtitle="evaluate.count == 0 ? '暂无评价' : '查看' + evaluate.count + '条评价'" :link="{
				src: '/pages/order/evaluate/list/list?item_id=' + data.id,
				type: 'local'
			}" />
		</template>



		<!-- 相关资料  start-->
		<bind-data @close="bindDataClose" :visible="bindDataShow" :list="data.bind_data" />
		<!-- 相关资料  end-->


		<!-- 密码兑换start -->
		<u-modal :show="modal.password_pay" title="兑换课程" :showCancelButton="true" :closeOnClickOverlay="true"
			@close="changeModalShow('password_pay')" @confirm="passwordPaySubscription"
			@cancel="changeModalShow('password_pay')">
			<u-input placeholder="请输入兑换码" v-model="password"></u-input>
		</u-modal>
		<!-- 密码兑换end -->

		<!-- 课程详情中获取所属专栏的课程目录弹窗 -->
		<template v-if="pageParams.column_id">
			<column-next-tip-modal :course="columnNextCourse" :visible="modal.columnNextTip" @close="modal.columnNextTip=false"/>
			<column-course-modal :visible="modal.columnCourse" :courseId="data.id"
			:columnId="pageParams.column_id" @close="modal.columnCourse = false" ref="columnCourseModel"/>
		</template>

		<!-- 从圈子课程目录进入时，固定显示目录与前后课程导航 -->
		<template v-if="pageParams.circle_id && data.subscription && circleCourseContext">
			<circle-course-modal :visible="modal.circleCourse" :circle-id="pageParams.circle_id" :current-course-id="pageParams.id" @close="modal.circleCourse = false" />
			<view class="circle-course-nav">
				<view class="circle-course-nav-item" @tap="openCircleDirectory"><view class="circle-course-nav-content"><tz-icon name="createtask" :size="16" color="#59616b" /><text>目录</text></view></view>
				<view class="circle-course-nav-item" @tap="switchCircleCourse(-1)"><view class="circle-course-nav-content"><tz-icon name="return" :size="16" color="#59616b" /><text>上一课程</text></view></view>
				<view class="circle-course-nav-item" @tap="switchCircleCourse(1)"><view class="circle-course-nav-content"><text>下一课程</text><u-icon name="arrow-right" :size="16" color="#59616b" /></view></view>
			</view>
		</template>

		<u-action-sheet :round="10" :safeAreaInsetBottom="true" :show="modal.buy_type" :actions="buyTypes" title="请选择购买方式"
			:closeOnClickOverlay="true" :closeOnClickAction="true" cancelText="取消" @close="changeModalShow('buy_type')"
			@select="buyTypesSelect">
		</u-action-sheet>


		<share-modal :val="data.id" :circle-id="pageParams.circle_id" :visible="modal.share" @close="modal.share = false" />


		<tz-hover-btn />
		<tz-footer />

		<bind-mobile-modal/>


		<tz-bottom-btn type="order" v-if="!data.subscription" :disabled="subscribing || (isLogin && data.pay_type == 'student')" :params="{
			'course': data.id,
			'iscollect': iscollect,
			'is_virtual_pay': isVirtualPay(data),
		}" :btnTitle="isLogin ? (pageParams.type && pageParams.type == 'score' ? '立即兑换' : (data.pay_type == 'student' ? '仅指定学员可用' : ((isFreeCourse(data) || data.vip_free_access) ? '加入学习' : '立即订阅'))) : '立即登录查看'"
			@handle="buyCheck" @share="share" @collect="collect" />

		<tz-bottom-btn v-if="data.subscription && !circleCourseContext" type="control" :params="{
			'iscollect': iscollect,
			'column_id': pageParams.column_id
		}" @collect="collect" @share="share" @comment="modal.comment = true; commentReplyId = 0;"
			@dir="modal.columnCourse = true" />

	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
