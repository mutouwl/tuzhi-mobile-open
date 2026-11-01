<template>
	<div class="container">

		<!-- ===== 首屏骨架屏（2026-10-30 用户点名 `/pages/app/exam/detail/detail?id=5`「加载的效果给我骨架屏」）=====
		     取代原来 `getData()` 里那枚黑底转圈的 `showLoading`（标题「请稍后」）等待 toast（M16）：
		     转圈不预布局、撤下时整屏内容跳位，且与练习模块其余页分叉。
		     形状按「先摆真实元素」落，灰块只进到容器内部替换会变的那一格（M16/M18）：
		       ① 封面仍走 `.exam-header-box` / `.exam-cover` 同一份几何（230px），只有图片替换成灰块；
		          压在上面的标题在真实页是 20px 白字 + 深色蒙层，占位块取白色半透明（同族，M6⑤）；
		       ② 属性卡仍走真实的 `tz-box` + `.exam-property-box` / `.exam-property-item` 等分档，
		          **静态文案（总题量 / 单次题量 / 出题模式）保持真文字**，只把三个数值盖成灰块；
		          价格那一格是 `data.sales_type == 2` 才出的段 ⇒ 不给灰块、也不预留空位（M16③）；
		       ③ 底栏按真实 `tz-bottom-btn` 的「60 filler + 10 内衬 + 40 按钮」占位，数据回来不弹出一条。
		     优惠券条 / 送好友长条 / 拼团区 / 关联课程 / 练习详情整段都是 `v-if` 才出的段，同一条判据不给占位。 -->
		<template v-if="skeletonLoading">
			<view class="exam-header-box">
				<view class="exam-cover exam-sk-cover"></view>
				<view class="exam-info-box">
					<view class="exam-sk-title"></view>
				</view>
			</view>

			<tz-box>
				<view class="exam-property-box">
					<view class="exam-property-item">
						<view class="exam-property-item-name">总题量</view>
						<view class="exam-sk-value"></view>
					</view>
					<view class="exam-property-item">
						<view class="exam-property-item-name">单次题量</view>
						<view class="exam-sk-value"></view>
					</view>
					<view class="exam-property-item">
						<view class="exam-property-item-name">出题模式</view>
						<view class="exam-sk-value"></view>
					</view>
				</view>
			</tz-box>

			<view class="exam-sk-filler"></view>
			<view class="exam-sk-bar h5-bottom-bar">
				<view class="exam-sk-bar-btn"></view>
			</view>
		</template>

		<!-- 取不到练习（id 缺失 / 接口失败 / 已下架）：给一处可读出口，不许停在空白页（M13、M16 的退出分支那一档）。
		     骨架收掉之后 `data.id` 仍为空即是这一档；下拉刷新是这一屏唯一的重载出口（pages.json 已开 enablePullDownRefresh） -->
		<u-empty v-else-if="!data.id" icon="/static/image/empty.png" width="70" height="70" text="练习不存在或已下架"></u-empty>

		<template v-else>
			<div class="exam-header-box gbd-anchor">
				<img :src="data.cover" class="exam-cover">
				<tz-group-buy-danmu v-if="gbVisible && gbBuyers.length" :buyers="gbBuyers" overlay />
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

			<!-- 拼团价横幅回拼团区（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner 下面，
			     也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」）：横幅与玩法、
			     凑团列表放在同一张卡里连着排，本卡恢复售价格。
			     2026-10-30 另一点：已有使用权限（`!gbVisible`）时横幅 / 弹幕 / 拼团区三处一起不出 -->
			<tz-box>
				<div class="exam-property-box">

					<div class="exam-property-item price" v-if="data.sales_type == 2 && data.is_auth == false">
						<div class="exam-property-item-name">{{ priceLabel }}</div>

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

				<!-- 优惠券条：已经加入过练习（`is_subscribe`，底栏那枚「加入练习」按过的状态）就不出
				     ——2026-10-30 用户点名「如果已经加入了练习，就不要再显示这个优惠券领取bar了」。
				     判据只在 js.vue 的 `couponVisible` 一处；虚拟支付那档照旧不出 -->
				<coupon-goods-bar v-if="couponVisible" goods-type="exercises" :goods-id="data.id"/>

				<!-- 送好友（2026-10-28 补练习入口）：购买前（立即订阅）与购买后（查看练习）都是这一页，
				     入口不随 `is_auth` / `is_subscribe` 消失 —— 与课程 M45「买过也能送人」同一口径。
				     显隐只吃后端 `send_friend_entry`（免费练习/绑定课程/停售由后端闸门拒，前端不重判）。
				     **上距按页给（2026-10-30 用户点名「sfa-entry sfa-entry--card 要有上边距」）**：
				     组件里不写死 `margin-top`（M45），本页长条上方是优惠券条（自身 10px 上距）/ 属性卡，
				     不传就与上面那一块粘成一段 ⇒ 传 8，与课程商详、圈子售前同一档。 -->
				<tz-send-friend-area v-if="data.id" scene="inCard" goods-type="exercises" :goods-id="data.id" :margin-top="8" />
			</tz-box>

			<!-- 拼团区（M-P1）：压在「售价 + 题量 + 出题模式」那张卡正下方，拼团价与售卖价同一屏可比
			     （落点与课程详情页同一档：都是紧跟那张卡的 `</tz-box>`）。
			     两条入参：① `goods-type` 取后端 `ActivityForm::GOODS_TYPES` 里那一档 `exercises`，
			     与本页「立即订阅」那份 goodsList 里的 goodsType、上面优惠券条的 goods-type 逐字相同；
			     ② `goods-id` 用本页真实的练习 id `data.id`（首屏 `data` 还是空壳，v-if 挂在这枚上 ⇒ 不带 undefined 去取数）。
			     `@go-pay` 只记账：导航由组件自己发，见 js.vue 的 gbGoPay。
			     **已有使用权限 ⇒ 整段不出**（2026-10-30 用户点名「当前已经有了练习的使用权限，为什么还会显示拼团价格」）：
			     判据 `gbVisible`（`data.id ∧ !data.is_auth`），与上面横幅、弹幕、底栏那几枚同源；
			     换个判据写第二份，就是同一件事在两处各判一遍（硬约束 11） -->
			<tz-group-buy-area v-if="gbVisible" ref="gbArea" goods-type="exercises" :goods-id="data.id" hide-danmu
				:join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
				:join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
				:join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
				:join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
				:join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
				:join-price="gbJoinCtx ? gbJoinCtx.price : 0"
				@go-pay="gbGoPay" @ready="gbReady" />

			<template v-if="data.sales_type == 3 && data.course && data.course.id">
				<tz-divider bgColor="#fafafa" />
				<tz-title title="该练习关联课程" size="small" :more="false" />
				<tz-box padding="0 15px 15px">
					<bind-course-list :data="[data.course]"/>
				</tz-box>
			</template>

			<template v-if="data.sales_type == 3 && (!data.course || !data.course.id)">
				<tz-divider bgColor="#fafafa" />
				<tz-title title="该练习关联课程" size="small" :more="false" />
				<tz-box padding="0 15px 15px">
					<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无关联课程"></u-empty>
				</tz-box>
			</template>

			<template v-if="data.detail && data.detail != '<p><br></p>'">
				<tz-divider bgColor="#fafafa" />
				<tz-title title="练习详情" size="small" :more="false" />
				<tz-box padding="0 15px 15px">
					<tz-parse :content="data.detail" />
				</tz-box>
			</template>

			<template v-if="!data.is_auth">
				<!-- 底栏：活动期间与「立即订阅」并排多一枚「¥xx 拼团」——拼团入口塞进 tz-bottom-btn 的
				     order-extra 插槽（与课程页同一机制），摘要空串（无活动/未装插件）整枚不渲染。
				     **我正在这一场拼团里已有进行中的团（`gbInTeam`）→ 主按钮收起**（PRD 2026-10-27）：
				     与课程详情页同一枚 `hide-main`，底栏只留「查看拼团详情」这一个出口 -->
				<tz-bottom-btn @handle="subscription()" btnTitle="立即订阅" v-if="data.sales_type == 2" :hide-main="gbInTeam || gbJoinMode">
					<tz-group-buy-btn v-if="gbEntry" class="tbb-slot" slot="order-extra" :text="gbEntry.text" :price="gbEntry.price_text" @open="openGb" />
				</tz-bottom-btn>
				<tz-bottom-btn @handle="$nav.to(data.course.id, 'course')" :btnTitle="(data.course && data.course.id) ? '去订阅关联课程' : '暂未开放'" v-if="data.sales_type == 3"/>
			</template>
			<template v-if="data.is_auth">

				<tz-bottom-btn @handle="subscribe" v-if="!data.is_subscribe" btnTitle="加入练习"/>

				<tz-bottom-btn v-else @handle="modal.exercisesControl = true" btnTitle="查看练习"/>			
			</template>
			<tz-footer />
		</template>

		<tz-tab-bar />

		<bind-mobile-modal/>

		<exercises-control-modal :exercises-id="data.id" @close="modal.exercisesControl = false" :visible="modal.exercisesControl"/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
