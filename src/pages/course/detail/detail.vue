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

		<!-- 小程序学习闸门：已订阅 ∧ 后端下发 mp_study=1（本端不能学）→ 整页铺白只显示跳转信息，
		     播放器/详情/目录/推荐/底栏全部被盖住（用户 2026-10-27 点名：不要在播放器位置塞一块）。
		     判据只认后端这枚 flag；试看那一档不拦，购买前价格区另有提示 -->
		<tz-mp-study v-if="data.subscription && data.mp_study == 1" fullscreen :course-id="data.id"
			:course-name="data.name" />
		<template v-else-if="data.subscription">
			<banner :cover="data.cover" :type="data.type" v-if="data.type == 'article' || data.type == 'column'" />

			<audio-play @ended="playEnd" @ready="mediaReady" @play="playHandle" @paused="pausedHandle" v-show="data.type == 'audio'" ref="audioPlayer" :name="data.name" :path="data.audio_path.fullurl" :allow-background-play="true"
				:patch="data.cover" :disable-seek="data.progress_seek == 'close'" />
 
			<!-- 直播课程的直播源不适配课程播放器（直播课程没有 video_path，播放器会提示播放异常），
			     详情页只作跳转直播页的中转：不初始化播放器，跳转前保持加载态（见 js.vue 的 getData），
			     未跳转时用封面占位 -->
			<!-- 视频课的两档播放（H5 / 小程序不同一条链，判据只存 vodMediaOf 与 vodSourceOf 两处）：
			     · 凭证到手（或这门根本不需要凭证）⇒ 挂播放器：H5 拿 vid+playauth 走阿里云官方
			       那条取址解密链，小程序仍然只吃 fullurl（video-mp 收不到 vid，给它 VID 等于换个坏源）；
			     · 还在取凭证的那一两百毫秒 ⇒ 由封面占位（本页未订阅那一档本来就是这个样子，
			       不另造加载形态），因为「先挂地址档再换凭证」会让桌面浏览器先亮一块
			       「播放出错啦」的错误板再开始播。
			     @error / @onM3u8Retry / @refresh 三枚都接到 renewVodAuth：过去「要刷新整页才能播」
			     是因为手上那条签名地址已经作废而端上没有第二次取址的入口，现在这一发就是那个出口。 -->
			<video-play @end="playEnd" @ready="mediaReady" @play="playHandle" @paused="pausedHandle"
				v-if="data.type == 'video' && vodReady" ref="videoPlayer"
				:cover="data.video_patch ? data.video_patch : data.cover" :source="vodSourceOf(data.video_path)"
				:vid="vodAuth.vid" :playauth="vodAuth.play_auth"
				:bulletScreen="data.bullet_screen ? data.bullet_screen : false"
				:disable-seek="data.progress_seek == 'close'"
				:prevent-page-reload-on-refresh="true" :refresh-needs-new-auth="true"
				@error="renewVodAuth('error')" @onM3u8Retry="renewVodAuth('onM3u8Retry')" @refresh="renewVodAuth('refresh')" />
			<banner v-else-if="data.type == 'video'" :cover="data.video_patch ? data.video_patch : data.cover" :type="data.type" />
			<banner v-if="data.type == 'live'" :cover="data.warm_up_cover || data.cover" :type="data.type" />
		</template>
		<!-- 封面/试看播放器这一格（2026-10-29 用户点名「gba-danmu 应该放在这个页面的左上角，
		     也就是说这个封面图片或者是轮播图片的左上角」）：外面这层 `.cd-media` 只负责
		     `position: relative`，购买弹幕由 `tz-group-buy-danmu` 贴到它的左上角（`overlay`）。
		     素材与拼团区同一份（拼团区 `@ready` 上抛的 `activity.buyers`；首屏那一拍由 `:preload`
		     回填得与拼团区同帧），本页给拼团区传 `hide-danmu` ⇒ 白块里那一枚收掉，
		     整屏只有封面这一枚；组件按空数组不渲染，预热/无买家时不留空壳。 -->
		<view class="cd-media gbd-anchor" v-if="!data.subscription">
			<audio-play @play="playHandle" @paused="pausedHandle" v-if="data.type == 'audio' && data.try_listen_status && data.try_listen_content" :name="data.name" :allow-background-play="true"
				:path="data.try_listen_content.fullurl" :patch="data.cover" :disable-seek="data.progress_seek == 'close'" />
			<!-- 试看片与正片同一档：H5 走凭证（试看对未登录也放开，接口那一侧 auth=false），
			     凭证取不到就照旧吃地址；未订阅这一屏没有播放器可「刷新整页」救回来，
			     回落地址档是唯一不许把画面卡死的选择 -->
			<video-play @play="playHandle" @paused="pausedHandle" v-else-if="data.type == 'video' && data.try_watch_status && data.try_watch_content && vodReady"
				:cover="data.cover" :source="vodSourceOf(data.try_watch_content)"
				:vid="vodAuth.vid" :playauth="vodAuth.play_auth"
				:bullet_screen="data.bullet_screen ? data.bullet_screen : false"
				:disable-seek="data.progress_seek == 'close'"
				:prevent-page-reload-on-refresh="true" :refresh-needs-new-auth="true"
				@error="renewVodAuth('error')" @onM3u8Retry="renewVodAuth('onM3u8Retry')" @refresh="renewVodAuth('refresh')" />
			<banner v-else :cover="data.cover" :type="data.type" />
			<tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
		</view>

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
				<div class="score" v-if="isScorePage">
					<span><span class="unit">兑换积分</span> {{ scoreGoodsDetail.score }}</span>
					<span class="sales">销量{{ scoreGoodsDetail.sales }}</span>
				</div>

				<!-- 拼团价横幅不再压进价格格（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner
				     下面，也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」）：
				     横幅回拼团区那张卡的第一行，玩法与凑团列表紧跟其后 ⇒ 拼团一整块在页面下方连成一片；
				     拼团进行中本格收起（第五轮：一屏只留横幅那一个价）。 -->
				<div class="price" v-else-if="gbPriceShown">

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

				<div class="title">
					{{ data.name }}
				</div>
				<div class="subtitle" v-if="data.briefing">
					{{ data.briefing }}
				</div>

				<!-- 送好友长条（图2）：标题/简介下面（2026-10-27 起 `.vip-bar` 移到它下面）、与同卡 `.vip-bar` 同一档（奶白底 + 深蓝图底 + 右侧细箭头）。
				     显隐仍只由插件那枚后端 flag 决定（未装/关着整段不渲染、一条请求都不发）。
				     **未订阅这一档的送好友入口只有这一枚**（2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，
				     就不用在底部操作栏再显示 iconfont icon-lipin」）：底栏那枚纯图标已撤，本长条接过「进来就能看见」的位置。
				     上边距按页给（2026-10-28 用户第二次点名「sfa-entry sfa-entry--card 要留出上边距，注意，仅在这个页面调整」）：
				     组件里不写死 `margin-top`（M45），这一页用 `:margin-top="8"` 补回简介与长条之间那一档；
				     圈子售前 / 圈子首页 / 练习详情 / 会员中心四页不传，上距仍是 0。
				     ref 另起名 `sfCard`（底栏那一枚叫 `sfArea`）——两处同名时下拉刷新重取到的会是错的那个实例。
				     **积分商品（`type=score`）整段不出**（2026-10-29 用户点名「如果是积分商品，应该在页面中屏蔽送好友、
				     拼团、优惠券」）：兑换来的课不是买来送人的，挂一枚送好友入口只会把人送进必然被拦的下单页。
				     `v-if` 在宿主这一层，组件不挂载 ⇒ 连那一条 `entry` 请求都不发。 -->
				<tz-send-friend-area v-if="!isScorePage" ref="sfCard" scene="inCard" goods-type="course" :goods-id="data.id || 0" :margin-top="8" @open="sfGoPay" />

				<!-- 会员权益条（2026-10-27 用户点名「vip-bar可以移动到sfa-entry sfa-entry--card下面」）：
				     原先压在价格行下方、标题之前，现在挂在送好友长条之后（同一张信息卡内）；
				     两行的间距由 `.vip-bar` 自己的 5px 上距给。
				     **送好友条的上距只在这一页给**（2026-10-28 用户第二次点名「要留出上边距，注意，仅在这个页面调整」）：
				     上面那枚 `:margin-top="8"` 就是它与简介之间的那一档，宿主容器不再另行补；
				     调这一档时改调用点的数，不要回组件样式表里写死。
				     送好友插件未装/未开启时 `.sfa-entry` 整段不出，这一段直接接在简介后面，不留空位。 -->
				<div class="vip-bar" @click="goVipCenter()"
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

				<!-- 购买前先把「去哪学」说清：付完才发现只能去小程序，是最容易起退款的那一种（M-P 小程序学习） -->
				<view class="mp-study-tip" v-if="data.mp_study == 1">购买后需在微信小程序中学习</view>

				<template v-if="data.type == 'live'">
					<tz-divider bgColor="none" />
					<live-start-time-bar :start-time="data.live_start_time" :end-time="data.live_end_time" />
				</template>
			</div>

			<!-- 领券条：积分商品不参与优惠券（2026-10-29 用户点名「如果是积分商品，应该在页面中屏蔽送好友、拼团、优惠券」）。
			     券是给「付款买」用的，兑换价与券面额不是一套计价；`v-if` 收掉组件 ⇒ 领取列表那条请求也不发 -->
			<coupon-goods-bar v-if="!isVirtualPay(data) && !isScorePage" :goods-type="data.type" :goods-id="data.id"/>
		</tz-box>

		<!-- 拼团区（M-P1）：压在价格那一块正下方，拼团价与售卖价同一屏可比。
		     三条 `v-if` 都有必要：
		     ① `!data.subscription` —— 这是**购买入口**，已订阅的人再摆一枚拼团按钮就是死入口；
		     ② `data.id` —— 首屏那一刻 `data` 还是空壳，带着 0 去取数只会取回一个 null，
		        整段按「无活动」关掉之后就不会再自己开（拼团区自己发那两条请求，页面不替它取）；
		     ③ `!isScorePage` —— 积分商品不参与拼团（2026-10-29 用户点名「如果是积分商品，应该在页面中屏蔽送好友、
		        拼团、优惠券」）：兑换走积分，拼团价与兑换价不是一套计价，且这枚入口会把兑换链换成拼团下单链。
		        `v-if` 在宿主这一层 ⇒ 拼团区不挂载，活动/在团/横幅三条取数链一发都不发。
		     `@go-pay` 只负责把「用户态可能要变」那本账标上（导航由组件自己发，见 js.vue 的 gbGoPay）；
		     `@ready` 把活动摘要收下来：`text` 喂给底栏那枚拼团按钮（**按钮在底部工具条里与「立即订阅」并排**，
		     2026-10-16 用户点名），`inTeam` 决定底栏那枚「立即订阅」收不收（正在这一场拼团中 ⇒ 收起，
		     2026-10-27）。横幅不再提到价格格（2026-10-30），本区自己就是从横幅开始那一整块。
		     `hide-danmu` —— 购买弹幕也由本页提到封面左上角了（2026-10-29，见 `.cd-media` 那段）：
		     拼团区白块里不再重复一轮；其余八类商详页没传这一枚，仍是原位那一档；积分兑换页整区不渲染（③）。
		     `:preload` —— 2026-10-29「详情页显示拼团信息有延迟」：拼团区摘要由本次课程详情响应一次带回
		     （后端 `common/library/app/course/DetailGroupBuy`），拼团区挂载即渲染，不再等
		     「详情回包 → 再发一发活动接口」那第二跳；后端回 `null` 表示确认没有进行中活动，
		     拼团区连首屏那一发请求都不发（缺键 = 旧后端，仍按原逻辑自己取）。 -->
		<tz-group-buy-area v-if="!data.subscription && data.id && !isScorePage" ref="gbArea" goods-type="course"
			:goods-id="data.id" :share="pageParams.share || 0" hide-danmu
			:preload="data.group_buy"
			:join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
			:join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
			:join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
			:join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
			:join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
			:join-price="gbJoinCtx ? gbJoinCtx.price : 0"
			@go-pay="gbGoPay" @ready="gbReady" />



		<!-- 块与块之间的「间隔条」取页面底色（2026-10-27 用户点名「间隔条，背景色也调整为页面的背景色」，
		     同 M58：`tz-divider` 默认 `#f5f5f5` 比页面底 `#fafafa` 深一档，10px 条读成「浅灰条」而不是缝；
		     卡内那两枚仍 `bgColor="none"`（跟着白卡，见 live-start-time-bar 与详情页签那两处） -->
		<tz-divider bgColor="#fafafa" />


		<template v-if="data.bind_data.length > 0">
			<tz-title @click="bindDataShow = true" title="资料" :subtitle="'共' + data.bind_data.length + '个文件'" />
			<tz-divider bgColor="#fafafa" />
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
			<tz-divider bgColor="#fafafa" />
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
			<tz-divider bgColor="#fafafa" />
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
			<view class="circle-course-nav h5-bottom-bar">
				<view class="circle-course-nav-item" @tap="openCircleDirectory"><view class="circle-course-nav-content"><tz-icon name="createtask" :size="16" color="#59616b" /><text>目录</text></view></view>
				<view class="circle-course-nav-item" @tap="switchCircleCourse(-1)"><view class="circle-course-nav-content"><tz-icon name="return" :size="16" color="#59616b" /><text>上一课程</text></view></view>
				<view class="circle-course-nav-item" @tap="switchCircleCourse(1)"><view class="circle-course-nav-content"><text>下一课程</text><u-icon name="arrow-right" :size="16" color="#59616b" /></view></view>
			</view>
		</template>

		<u-action-sheet :round="10" :safeAreaInsetBottom="true" :show="modal.buy_type" :actions="buyTypes" title="请选择购买方式"
			:closeOnClickOverlay="true" :closeOnClickAction="true" cancelText="取消" @close="changeModalShow('buy_type')"
			@select="buyTypesSelect">
		</u-action-sheet>


		<!-- 海报画这一条课程的封面与名称，取本页 course.detail 已加载的数据；
		     内容卡只有「封面 + 标题」两样（2026-09-26 用户点名简化），价格/类型不再抄给海报 -->
		<share-modal :val="data.id" :circle-id="pageParams.circle_id" :visible="modal.share" @close="modal.share = false"
			:title="data.name" :cover="data.cover" />


		<!-- 学习前表单拦截层：绑定"加入学习前"表单未填写时阻止学习（填写弹窗关闭后的兜底层） -->
		<view class="learn-form-mask" v-if="learnForm.blocking">
			<view class="learn-form-card">
				<view class="learn-form-title">加入学习前需填写表单</view>
				<view class="learn-form-tip">完成填写后即可继续学习</view>
				<view class="learn-form-item" v-for="(item, index) in learnForm.forms" :key="index"
					v-if="!item.is_submitted">
					<text class="learn-form-name">{{ item.form_name }}</text>
					<text class="learn-form-status">待填写</text>
				</view>
				<view class="learn-form-btn" @click="openLearnFormPopup">去填写</view>
			</view>
		</view>

		<!-- 学习前表单填写弹窗：底部弹窗内直接填写提交，与其他弹窗组件样式一致 -->
		<u-popup :show="learnFormPopup.show" mode="bottom" :round="10" :closeable="true"
			:title="learnFormPopup.name" :safeAreaInsetBottom="true"
			@close="learnFormPopup.show = false">
			<view class="learn-form-popup">
				<scroll-view :scroll-y="true" class="learn-form-popup-body">
					<view class="learn-form-popup-loading" v-if="learnFormPopup.loading">
						<u-loading-icon mode="circle" size="36" color="#ff781f"></u-loading-icon>
						<text class="learn-form-popup-loading-text">表单加载中…</text>
					</view>
					<custom-form v-else-if="learnFormPopup.components.length > 0"
						:key="learnFormPopup.key" v-model="learnFormPopup.value"
						:components="learnFormPopup.components" />
					<u-empty v-else icon="/static/image/empty.png" width="70" height="70"
						text="暂无内容" />
				</scroll-view>
				<view class="learn-form-popup-btn" @click="submitLearnForm">{{ learnFormPopup.submitting ? '提交中…' : '提交' }}</view>
			</view>
		</u-popup>

		<tz-hover-btn />
		<tz-footer />

		<bind-mobile-modal/>



		<!-- 底栏插件入口（M-P1，按参照产品收进购买栏那一条）：拼团那一枚独立组件塞进 tz-bottom-btn 的
		     order-extra 插槽，自己判拼团区的安装态与活动摘要（未装/无活动整枚不渲染、一条请求都不发；
		     摘要吃拼团区 `@ready` 上抛的那一枚，空串不渲染）。
		     **`class="tbb-slot"` 不能省**（2026-10-29 用户点名「立即开团与立即订阅按钮不等宽」）：
		     小程序端这一行的 flex 项是**自定义组件的宿主节点**，子组件根类 `.gbb-entry{flex:1}` 到不了宿主，
		     不挂这个 class 时拼团那枚按内容收缩、主按钮吃掉全部剩余宽度 ⇒ 两枚不等宽。
		     `flex:1 1 0 + min-width:0` 落在**全局样式表 `src/App.vue`**（`.tbb-slot` 那一条）——
		     ⚠ 不是 `bottom-btn.vue`：那里的小程序 wxss 受组件隔离、H5 侧又被自动 scoped，两个端都够不着
		     这个宿主节点（2026-10-29 第三次点名「四个按钮为什么不能等宽」的根因，详见 App.vue 那段注释）。
		     调用点只负责把宿主 class 点出来，不在页面里另写一份宽度。
		     **送好友不再占这一格**（2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，
		     就不用在底部操作栏再显示 iconfont icon-lipin」）：未订阅态的入口收在信息卡那条长条里，
		     已订阅态的入口仍在下面的 control-extra（买过也能送人）。
		     **我正在这一场拼团中 → 主购买按钮收起**（2026-10-27 用户点名「如果我当前正在拼团，那么是不能再
		     购买的。也就是说，详情页不要再显示单独购买按钮了」）：判据吃拼团区上抛的 `inTeam`，本页不判
		     `my_team`；底栏留「查看拼团详情」这一个出口，不留一枚点了会被后端拒的「立即订阅」。
		     顺序按竞品底栏：拼团随后、购买的「立即订阅」仍在最右主位。
		     积分商品（`type=score`）这一枚整枚不出（2026-10-29 用户点名「如果是积分商品，应该在页面中屏蔽
		     送好友、拼团、优惠券」）：拼团区在积分页整区不挂载，摘要恒为空、按钮本来就渲染不出来，
		     这里再显式收一次，读代码的人不必顺着 `gbEntry` 的取数链去推。 -->
		<tz-bottom-btn type="order" v-if="!data.subscription" :hide-main="!!(gbEntry && gbEntry.inTeam) || gbJoinMode" :disabled="subscribing || (isLogin && data.pay_type == 'student')" :params="{
			'course': data.id,
			'iscollect': iscollect,
			'is_virtual_pay': isVirtualPay(data),
		}" :btnTitle="joinBtnText()" @handle="buyCheck" @share="share" @collect="collect" >
			<tz-group-buy-btn v-if="!isScorePage && gbEntry" class="tbb-slot" slot="order-extra" :text="gbEntry.text" :price="gbEntry.price_text" @open="openGb" />
		</tz-bottom-btn>

		<!-- 已订阅态底栏：打卡那一枚只在「这门课（或其所属专栏）关联了上架打卡活动」时出，
		     判据是 loadCheckin 取回来的列表非空（未安装打卡插件时那条请求根本不发，自然也是空） -->
		<tz-bottom-btn v-if="data.subscription && !circleCourseContext" type="control" :params="{
			'iscollect': iscollect,
			'column_id': pageParams.column_id,
			'checkin': checkinList.length > 0
		}" @collect="collect" @share="share" @comment="modal.comment = true; commentReplyId = 0;"
			@dir="modal.columnCourse = true" @checkin="modal.checkin = true">
			<!-- 送好友入口（已订阅这一档，2026-10-16 用户追问「课程购买之后就不能送好友了？」后补）：
			     与「打卡」同一形态挂在控制栏里，显隐仍只由插件那枚后端 flag 决定；
			     **`class="sf-control-slot"` 不能省**（2026-10-29 三次点名同一处：先「送好友三个字变成
			     分三行」、再「宽度占了一半」、再「收藏、评论、分享、送好友 四个按钮为什么不能等宽」）：
			     这个 class 是全局样式表里唯一能选中这一枚的抓手。宽度不在底栏组件里给 ——
			     小程序端 flex 项是**自定义组件的宿主节点**（组件 wxss 受样式隔离够不着），
			     H5 端组件样式被自动 scoped（底栏的 scope id 落不到页面的插槽节点上）⇒
			     写在 `bottom-btn.vue` 的那两版都是死的。等分口径落在 `src/App.vue` 的
			     `.sf-control-slot { flex: 1 1 0; min-width: 0 }`，与同栏 `.control-btn` 逐值相同。
			     **积分商品不出**（2026-10-29 用户点名「如果是积分商品，应该在页面中屏蔽送好友、拼团、优惠券」）：
			     兑换商品本来就不是买来送人的，同信息卡那条长条一起收掉。

			     **这一枚是动态的，不许按固定枚数排版**（用户 2026-10-29 追问「下面的按钮不一定是固定 4 个，
			     这个送好友它是动态显示的，你要做兼容处理」）：插件未装 / 总开关关 / 这门课不可送，
			     它都要收掉，剩下「收藏 / 目录 / 评论 / 打卡 / 分享」按实际枚数均分。小程序端的宿主节点
			     不会随组件根的 `v-if` 消失 ⇒ 必须给宿主挂「这一拍不占宽度」那一档：
			     `sf-control-slot--off`（`display:none`，连 gap 一起收掉，见 `App.vue`）；
			     状态吃组件 `visible` 事件（判据落定才抛，取数在途不抛）→ `sfEntryShown`。
			     **不许改成 `v-if` 卸载**：下拉刷新 / 支付成功回来要靠 `$refs.sfArea.reload()` 重新点亮。
			     首值给 `true`（乐观）：给 `false` 就永远挂不上组件、也就永远收不到 `visible`（硬约束 31② 的自锁）。 -->
			<tz-send-friend-area v-if="!isScorePage" class="sf-control-slot"
				:class="{ 'sf-control-slot--off': !sfEntryShown }" slot="control-extra" ref="sfArea"
				scene="control" goods-type="course" :goods-id="data.id || 0" @visible="sfEntryShown = $event"
				@open="sfGoPay" />
		</tz-bottom-btn>

		<!-- 底栏「打卡」弹窗：本课程关联的打卡活动列表，数据与上面那枚按钮同一份（不再让弹窗自己取一次） -->
		<checkin-course-modal :show="modal.checkin" :list="checkinList" :attr="checkinAttr"
			:load-status="checkinLoadStatus" @close="modal.checkin = false"
			@lower="loadMoreCheckin" @open="goCheckin" />

	</view>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
