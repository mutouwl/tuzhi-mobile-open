<template>
	<div class="container db-index" :style="pageStyle">
		<!-- 加载态走通用加载页（M16「多状态 / 装修页」那一档）：本页正文是否渲染、按什么顺序渲染
		     全由后台装修配置决定（intro / nav / overview / catalog / notice / image_ad … 任意组合），
		     加载前无法预知会落成哪一版，手摆骨架灰块必然与真实版式对不上（2026-11-22 用户点名）。
		     不猜版式，用与自定义页面（`pages/index/index.vue`）同一枚 `tz-loading-page`；
		     正文等 `pageLoading=false` 再挂载，加载中不露任何半成品版式。 -->
		<tz-loading-page tip="页面加载中…" :loading="pageLoading" />

		<!-- 取不到刷题本（id 缺失 / 接口失败 / 已下架）：给一处可读出口，不停在空白页 -->
		<u-empty v-if="!pageLoading && !book.id" icon="/static/image/empty.png" width="70" height="70"
			text="刷题本不存在或已下架" />

		<!-- 未获得使用权限：购买页形态（照 `/pages/course/detail/detail` 那一屏的购买态版式：
		     封面 → 「价格 + 名称 + 简介」信息卡（含送好友长条）→ 拼团区 → 分隔条 → 正文 → 吸底购买栏）。
		     不露出刷题进度 / 目录 / 四宫格这些「用起来才有的东西」
		     （2026-11-18 用户点名「即使还未购买，还是展示了当前刷题进度，这个是不对的」） -->
		<template v-else-if="!pageLoading && !isAuth">
			<!-- 封面：外层只负责 `position: relative`，购买弹幕由 tz-group-buy-danmu 贴到左上角
			     （与课程商详 `.cd-media` 同一口径；素材吃拼团区 `@ready` 上抛的 activity.buyers）。
			     购买态不在图上压名称：名称归下面信息卡那一行（与课程商详一致，一屏只写一次标题） -->
			<view class="db-cover-box gbd-anchor">
				<img v-if="book.cover" class="db-cover" :src="book.cover" mode="aspectFill" />
				<view v-else class="db-cover db-cover-empty"></view>
				<tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
			</view>

			<!-- 信息卡：满宽白块（照课程商详 `tz-box` 那一档，不套 `.db-card` 的内缩边距）——
			     下方拼团区本身就是满宽白卡（组件内部 `tz-box padding="0"`），两块并排才连得上 -->
			<view class="db-buy-info">
				<!-- 价格行：拼团进行中收起（一屏只留拼团横幅那一个价，与课程商详 `gbPriceShown` 同判据） -->
				<view class="db-buy-price" v-if="book.is_pay && priceShown">
					<!-- 积分兑换模式（积分商城卡片进来）：价格区换积分口径，与九类商详同一档 -->
					<template v-if="isScoreExchange">
						{{ scoreExchangeScore }}<span class="db-buy-price-unit"> 积分</span>
					</template>
					<!-- 微信小程序虚拟支付：币种读系统配置的代币名（与课程商详同一档），pay_price 已由后端换算 -->
					<template v-else-if="isVirtualPay">
						{{ priceText }}<span class="db-buy-coin">{{ coinName }}</span>
					</template>
					<template v-else>
						<span class="db-buy-price-unit">¥</span>{{ priceText }}
					</template>
				</view>

				<view class="db-buy-name">{{ pageName }}</view>
				<view class="db-buy-brief" v-if="book.brief">{{ book.brief }}</view>

				<!-- 商品事实（照课程商详那句「N 次学习」的位置）：刷题本这一档是总题数与有效期 -->
				<view class="db-buy-facts">
					<text>共 {{ stat.total_count }} 题</text>
					<text class="db-buy-dot">·</text>
					<text>{{ validityText }}</text>
				</view>

				<!-- 关联课程卡：只有「不买课就用不了」的档位才需要这一行说明；
				     免费档挂了关联课程也照旧对所有人开放，摆这句反而像在设门槛。
				     可关联多门（2026-11-21 用户点名）：逐门各摆一行，订阅任意一门都算有权限。 -->
				<view v-if="!book.is_free && bindCourses.length" class="db-bind-course-group">
					<view v-for="(c, i) in bindCourses" :key="c.id || i" class="db-bind-course" @click="goCourseItem(c)">
						<image v-if="c.cover" class="db-bind-cover" :src="c.cover" mode="aspectFill" />
						<view class="db-bind-info">
							<view class="db-bind-name one-line-hidden">{{ c.name }}</view>
							<view class="db-bind-tip">购买该课程后可获得本刷题本的使用权限</view>
						</view>
						<tz-icon name="enter" :size="14" color="#c9cdd4" />
					</view>
				</view>

				<!-- 送好友长条：与课程商详同一条链（后端 `GiftType` 已登记 drill_book）。
				     显隐只吃插件那枚后端 flag，未装/关着整段不渲染 ⇒ 一条请求都不发 -->
				<tz-send-friend-area v-if="book.id && !isScoreExchange" ref="sfCard" scene="inCard" goods-type="drill_book"
					:goods-id="book.id" :margin-top="14" @open="sfGoPay" />
			</view>

			<!-- 拼团区（M-P1）：压在信息卡正下方，拼团价与售价同一屏可比（落点与课程/练习商详同一档）。
			     后端 `ActivityForm::GOODS_TYPES` 已含 `drill_book`，与下单那份 goodsType 逐字相同；
			     `hide-danmu` 与课程页同口径：弹幕已提到封面左上角，白块里不再重复一轮 -->
			<tz-group-buy-area v-if="book.id && book.is_pay && !isScoreExchange" ref="gbArea" goods-type="drill_book"
				:goods-id="book.id" hide-danmu
				:join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
				:join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
				:join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
				:join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
				:join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
				:join-price="gbJoinCtx ? gbJoinCtx.price : 0"
				@go-pay="gbGoPay" @ready="gbReady" />

			<!-- 刷题本介绍（富文本）：满宽白块 + 标题，照课程商详「详情」那一段的落法。
			     间隔条归这一块自己所有（M87）：正文不渲染时条一起不渲染，不留一条悬空的灰缝。
			     显隐吃装修页「页面设置 → 刷题本介绍」（2026-11-24 用户点名可关） -->
			<template v-if="book.detail && showDetail">
				<!-- 间隔条取页面底色（同课程商详：tz-divider 默认色比页面底深一档，会读成「浅灰条」） -->
				<tz-divider bgColor="#f7f8fa" />
				<view class="db-buy-detail">
					<view class="db-buy-detail-head">刷题本介绍</view>
					<view class="db-detail">
						<tz-parse :content="book.detail" :selectable="!Number(book.copy_detail)" />
					</view>
				</view>
			</template>

			<tz-footer />
		</template>

		<!-- 已获得使用权限：固定封面 + 装修内容（nav → overview → catalog …）
		     封面不是装修组件、也不参与排序（2026-11-19 用户定）：只有一张图 + 压在图底的名称，
		     轮播图那套「多图 / 模板 / 指示器」在端上从来只渲染第一张，留着就是空配置项。 -->
		<template v-else-if="!pageLoading">
			<view class="db-cover-box">
				<img v-if="book.cover" class="db-cover" :src="book.cover" mode="aspectFill" />
				<view v-else class="db-cover db-cover-empty"></view>
				<view class="db-cover-title one-line-hidden">{{ pageName }}</view>
			</view>

			<block v-for="(comp, ci) in components" :key="ci">
				<!-- 「组件样式」三段（左右内边距 / 上下内边距 / 组件背景）落在这一层壳上：
				     后台装修页每一枚组件都有这三格，端上不消费它们＝面板改了端上不变。
				     串在 js.vue 的 components computed 里预计算（boxStyleOf 等）：小程序端 `:style`
				     不能写方法调用、也不能绑对象，未配时为空串，版式与原先完全一致。 -->

				<!-- 刷题简介（照参照图：左封面 + 右刷题本名，下一行简介；文案与图取自刷题本本身，
				     面板里只能开关封面显隐 —— show_cover === false 只藏左侧那张图，标题行仍在） -->
				<view v-if="comp.type === 'intro'" class="db-card db-intro" :style="comp.cssBox">
					<view class="db-intro-head">
						<image v-if="comp.config.show_cover !== false && book.cover" class="db-intro-cover"
							:src="book.cover" mode="aspectFill" />
						<view v-else-if="comp.config.show_cover !== false"
							class="db-intro-cover db-intro-cover-empty"></view>
						<view class="db-intro-name one-line-hidden">{{ pageName }}</view>
					</view>
					<view class="db-intro-text">{{ book.brief || '简介' }}</view>
				</view>

				<!-- 刷题导航（固定四枚 + 自定义入口；显隐/排序/字号色由装修配置控制） -->
				<view v-else-if="comp.type === 'nav'" class="db-card" :style="comp.cssBox">
					<view class="db-nav" :class="'db-nav-' + navStyle.template">
						<view class="db-nav-item" v-for="(nav, index) in navs" :key="index" @click="goNav(nav)">
							<!-- 图标两档（与后台 icon-select 写的 {type,src} 对应）：图标库字体 / 图片。
							     与自定义页面导航组件（components/tz/navigation.vue）同口径：
							     图标就是一枚裸 tz-icon、不传 color、不铺任何底色，颜色跟页面文字色走；
							     只有图片那一档才按图片本身出。老数据是纯图片地址，navIconOf 一并兼容
							     （2026-11-19 用户点名「不需要增加这个丰富多彩的背景，直接默认即可」） -->
							<template v-if="navIconOf(nav).src">
								<view v-if="navIconOf(nav).type === 'icon'" class="db-nav-icon db-nav-icon-font">
									<tz-icon :name="navIconOf(nav).src" :size="24" />
								</view>
								<image v-else class="db-nav-icon" :src="navIconOf(nav).src" mode="aspectFit" />
							</template>
							<view v-else class="db-nav-icon db-nav-icon-default" :class="'db-nav-' + nav.nav_key">
								<tz-icon :name="defaultNavIcon(nav.nav_key)" :size="28" />
							</view>
							<view class="db-nav-name" :style="navNameStyle">{{ nav.name || navKeyName(nav.nav_key) }}</view>
						</view>
					</view>
				</view>

				<!-- 刷题总览（5 格可各自关掉）：进度行 = 标题 + 百分比 + 进度条；
				     这张卡只摆进度事实，不放操作按钮 -->
				<view class="db-card" v-else-if="comp.type === 'overview'" :style="comp.cssBox">
					<!-- 进度带（参照图实测）：浅蓝底通栏压卡片上沿，标题与百分比同为深蓝、条为亮蓝 -->
					<view class="db-overview-band" :style="comp.cssBand">
						<view class="db-overview-head">
							<view class="db-overview-title">
								刷题进度
							</view>
							<view class="db-overview-percent">{{ stat.progress || 0 }}%</view>
							<view class="db-overview-track">
								<u-line-progress :percentage="stat.progress" :showText="false" activeColor="#1472ff"
									inactiveColor="#eceef5" height="8" />
							</view>
						</view>
					</view>
					<view class="db-overview-row">
						<view class="db-overview-cell" v-if="comp.config.total !== false">
							<view class="db-overview-num">{{ stat.total_count }}</view>
							<view class="db-overview-label">总题数</view>
						</view>
						<view class="db-overview-cell" v-if="comp.config.unanswered !== false">
							<view class="db-overview-num">{{ unansweredCount }}</view>
							<view class="db-overview-label">未做题</view>
						</view>
						<view class="db-overview-cell" v-if="comp.config.answered !== false">
							<view class="db-overview-num">{{ stat.answered_count }}</view>
							<view class="db-overview-label">已做题</view>
						</view>
						<view class="db-overview-cell" v-if="comp.config.error !== false">
							<view class="db-overview-num">{{ stat.error_count }}</view>
							<view class="db-overview-label">错题</view>
						</view>
						<view class="db-overview-cell" v-if="comp.config.accuracy !== false">
							<view class="db-overview-num">{{ stat.answered_count ? (stat.accuracy + '%') : '-' }}</view>
							<view class="db-overview-label">正确率</view>
						</view>
					</view>
					<!-- 进度面板只摆进度事实：总览卡里不放过任何操作按钮（2026-11-19 用户点名
					     「操作按钮不要显示在刷题进度面板里」）。刷题出口在目录行与底部操作栏。 -->
				</view>

				<!-- 刷题目录（照参照图：每行两段 —— 名称行 + 进度行
				     父级与子级同一套行结构：圆钮 + 名称 + 分段进度；
				     名称行右侧不再挂 ›（折叠/展开看左侧圆钮，2026-11-22 用户点名去掉）；
				     叶子目录且有题目：整行最右、垂直居中的动作钮（不在名称行里）——
				     这个目录里做过题就显示「继续」（续那一支的练习），一题没做显示「做题」；
				     名称行内的「继续上次 ›」已由用户点名去掉（2026-11-22 第二轮）
				     展开后左侧按祖先层级画导引线，子行用短横线接到父级那条线上 -->
				<view class="db-card db-catalog" v-else-if="comp.type === 'catalog'" :style="comp.cssBox">
					<view class="db-catalog-title">刷题目录</view>
					<u-empty v-if="!book.catalogs || !book.catalogs.length" icon="/static/image/empty.png"
						width="70" height="70" text="还没有目录" margin-top="30" />
					<template v-else>
						<!-- 目录层级树只有一份实现（pages/app/drill_book/components/drill-catalog.vue）：
						     缩进 / 导引线 / 折叠圆钮 / 名称 + 进度行全在组件里，本页只把右侧那格
						     适配成「做题 / 继续」动作钮 -->
						<drill-catalog :rows="catalogRows" show-progress @node-click="onCatalogRow"
							@toggle="onCatalogRow">
							<template v-slot:right="{ node }">
								<view v-if="node.canPractice" class="db-cat-do"
									@click.stop="onCatalogAction(node)">{{ node.actionText }}</view>
								<!-- 叶子目录没题目：这一格直接写明（占的是「做题 / 继续」那一格）。
								     早前进的是整行可点、点了弹「该目录暂无题目」toast——一进页面
								     点第一行就先吃一枚提示，读起来像「进入这个页面就提示暂无题目」
								     （2026-11-23 用户点名）。状态由布局说清，不再用 toast 复述；
								     父级（有子级）不摆这一格，题目在子级里 -->
								<text v-else-if="!node.hasChildren" class="db-cat-none">暂无题目</text>
							</template>
						</drill-catalog>
					</template>
				</view>

				<!-- 公告：直接用自定义页面那枚 tz-notice（u-notice-bar：铃铛 + 橙字 + 可跳时右箭头），
				     不再自己写一行裸文字；装修画布复用同一套公告组件（2026-11-22 用户点名） -->
				<view class="db-notice" v-else-if="comp.type === 'notice'" :style="comp.cssBox">
					<tz-notice v-if="comp.config.text" :text="comp.config.text" :link="comp.config.link" />
				</view>

				<!-- 图片广告六档排列（组件模版）：
				     1/2/3 = 一行 N 张（flex 列宽手算，小程序 WXSS 不吃 grid）；
				     4 = 轮播图（原生 swiper，2:1 画幅 + 指示点）；
				     5/6 = 横向滑动（scroll-view + 大图 78% / 小图 32% 露出下一张） -->
				<block v-else-if="comp.type === 'image_ad'">
					<view v-if="adTemplateOf(comp) <= 3" class="db-image-ad" :style="comp.cssAdBox">
						<view class="db-image-ad-cell" v-for="(img, i2) in (comp.config.images || [])" :key="i2"
							:style="comp.cssAdCell"
							@click="goLink(img.link)">
							<img v-if="img.url" class="db-image-ad-img" :src="img.url" mode="aspectFill" />
							<view v-if="comp.config.show_title && img.title" class="db-image-ad-title">{{ img.title }}</view>
						</view>
					</view>
					<view v-else-if="adTemplateOf(comp) === 4" class="db-image-ad db-image-ad-carousel"
						:style="comp.cssAdBox">
						<view class="db-image-ad-carousel-box">
							<swiper class="db-image-ad-swiper"
								:indicator-dots="(comp.config.images || []).length > 1"
								indicator-color="rgba(255,255,255,0.35)"
								indicator-active-color="#ffffff"
								:autoplay="true" circular :interval="4000" :duration="300">
								<swiper-item v-for="(img, i2) in (comp.config.images || [])" :key="i2">
									<view class="db-image-ad-slide" :style="comp.cssAdCorner"
										@click="goLink(img.link)">
										<img v-if="img.url" class="db-image-ad-img" :src="img.url" mode="aspectFill" />
										<view v-if="comp.config.show_title && img.title"
											class="db-image-ad-title">{{ img.title }}</view>
									</view>
								</swiper-item>
							</swiper>
						</view>
					</view>
					<scroll-view v-else scroll-x :show-scrollbar="false" class="db-image-ad-scroll"
						:style="comp.cssAdBox">
						<view class="db-image-ad-cell" v-for="(img, i2) in (comp.config.images || [])" :key="i2"
							:style="comp.cssAdScrollCell"
							@click="goLink(img.link)">
							<img v-if="img.url" class="db-image-ad-img" :src="img.url" mode="aspectFill" />
							<view v-if="comp.config.show_title && img.title" class="db-image-ad-title">{{ img.title }}</view>
						</view>
					</scroll-view>
				</block>

				<!-- 富文本 -->
				<view class="db-card db-richtext" v-else-if="comp.type === 'richtext'" :style="comp.cssBox">
					<tz-parse :content="comp.config.html" />
				</view>

				<!-- 音频（复用全站 tz-audio：H5/小程序两端同一份播放器） -->
				<view class="db-card" v-else-if="comp.type === 'audio'" :style="comp.cssBox">
					<tz-audio v-if="comp.config.url" :path="comp.config.url"
						:title="comp.config.name || '音频'" :link_status="0" />
					<view v-else class="db-audio-empty">未配置音频地址</view>
				</view>

				<!-- 视频 -->
				<view class="db-card" v-else-if="comp.type === 'video'" :style="comp.cssBox">
					<view class="db-audio-title">{{ comp.config.name || '视频' }}</view>
					<video v-if="comp.config.url" class="db-video-player" :src="comp.config.url" controls
						:poster="comp.config.patch || ''" />
					<view v-else class="db-audio-empty">未配置视频地址</view>
				</view>
			</block>

			<!-- 刷题本完整介绍（后端 detail 字段；与「刷题简介」组件不重复）
			     显隐吃装修页「页面设置 → 刷题本介绍」（2026-11-24 用户点名可关） -->
			<view class="db-card" v-if="book.detail && showDetail && !hasComponent('intro')">
				<view class="db-catalog-title">刷题本介绍</view>
				<view class="db-detail">
					<tz-parse :content="book.detail" :selectable="!Number(book.copy_detail)" />
				</view>
			</view>

			<!-- 已授权态不再挂底部固定操作栏（含那条白底）：本屏已有总览卡内的「开始刷题」
			     与目录行两个出口，底栏那枚是重复入口（2026-11-19 用户点名去掉）。
			     原先 2026-11-18 是为「目录为空只剩白底框」补的按钮，改由总览卡内按需显隐承载。 -->

			<tz-footer />
		</template>

		<!-- 吸底操作栏（照课程商详 `tz-bottom-btn`）：未获使用权限这一屏只有这一条主链。
		     走 `type` 空档（与练习详情页同一支）：那一支只有「插件插槽 + 主按钮」，
		     不挂首页/分享/收藏三枚 —— 刷题本的收藏接口只认 `type=course`（`api/controller/user/Collect.php`
		     写死），摆一枚点了必被拒的图标就是死入口。
		     拼团那一枚塞进 `order-extra` 插槽（与课程/练习商详同一机制）：摘要为空串（无活动/未装插件）
		     整枚不渲染。`hide-main` 吃两档 —— 正在这一场拼团中（`inTeam`）或受邀参团（`gbJoinMode`），
		     此时底栏只留拼团那一个出口，不给一枚点了会被后端拒的「立即购买」。
		     四档（登录 / 购买 / 关联课程 / 无权限）的文案与去处收在 js.vue 的两枚 computed 与 buyCheck 里。 -->
		<!-- 关联课程多于一门时，底栏「购买关联课程后使用」先弹这一层让用户挑一门
		     （M18：选项类菜单一律 u-action-sheet，不自造弹层与关闭行） -->
		<u-action-sheet :round="10" :safeAreaInsetBottom="true" cancelText="取消" :show="modal.course"
			title="请选择要订阅的课程" :actions="courseActions" :closeOnClickOverlay="true"
			:closeOnClickAction="true" @close="modal.course = false" @select="pickBindCourse"></u-action-sheet>

		<tz-bottom-btn v-if="showBottomBar" :hide-main="gbHideMain" :disabled="buyDisabled" :btnTitle="buyBtnText"
			@handle="buyCheck">
			<tz-group-buy-btn v-if="gbEntry && !isScoreExchange" class="tbb-slot" slot="order-extra" :text="gbEntry.text"
				:price="gbEntry.price_text" @open="openGb" />
		</tz-bottom-btn>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
