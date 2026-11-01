<template>
	<div class="container">
		<!-- 首屏骨架（2026-10-31 用户点名「加载方式调整为骨架屏」）：外壳走真实版式那一档
		     （封面 → 标题卡 → 信息行 → 底栏），灰块只替换会变的那几格（标题 / 价格 / 时间条 /
		     每行标签与取值 / 主按钮），静态文案与「按数据才出」的段（关联课程、拼团区、详情正文）
		     一个都不摆——它们在取数落地前根本不存在，先铺灰块再撤掉读出来是「闪了一下又没了」。
		     底栏在详情到手前也不出现，否则 `apply_status` 还是空的那一帧会先闪一句「报名已截止」。 -->
		<view v-if="loading">
			<view class="adetail-sk-cover"></view>

			<tz-box padding="15px 15px 15px">
				<view class="adetail-sk-block adetail-sk-title"></view>
				<view class="adetail-sk-block adetail-sk-price"></view>
				<view class="adetail-sk-block adetail-sk-time"></view>
			</tz-box>
			<tz-divider bgColor="#fafafa" />

			<tz-box padding="0px 5px 0px">
				<view class="adetail-sk-cell" v-for="n in 4" :key="'sk' + n">
					<view class="adetail-sk-block adetail-sk-label"></view>
					<view class="adetail-sk-block adetail-sk-value"></view>
				</view>
			</tz-box>
			<tz-divider bgColor="#fafafa" />

			<view class="adetail-sk-bar h5-bottom-bar">
				<view class="adetail-sk-block adetail-sk-btn"></view>
			</view>
		</view>

		<view class="act-media gbd-anchor" v-if="!loading">
			<banner :cover="data.cover" type="activity" />
			<tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
		</view>

		<tz-box padding="15px 15px 15px" v-if="!loading">
			<div class="info">
				<div class="title">
					{{ data.name }}
				</div>
				<!-- 拼团进行中本卡价格行收起（2026-10-30 第五轮：「拼团价要复制覆盖原来的价格」⇒ 一屏只有一个价）：
				     拼团价由**正下方那张拼团卡第一行的横幅**给（2026-10-31 整块上移到标题卡正下方，
				     用户点名「活动的拼团价格应该放在标题的下面」），横幅与玩法/凑团仍连成一块。 -->
				<div class="activity-price" v-if="gbPriceShown && hasPrice(data.price)">
					<template v-if="isVirtualPay(data)">
						<span class="price-value">{{ data.price }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
					</template>
					<template v-else>
						<span class="price-unit">¥</span><span class="price-value">{{ data.price }}</span>
					</template>
				</div>
			</div>

			<live-start-time-bar :start-time="data.activity_start_time" :end-time="data.activity_end_time" />

			<coupon-goods-bar v-if="!isVirtualPay(data)" goods-type="activity" :goods-id="data.id" />
		</tz-box>
		<tz-divider bgColor="#fafafa" v-if="!loading" />

		<template v-if="!loading && bindCoutseList.length > 0">
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
			<tz-divider bgColor="#fafafa" />
		</template>

		<!-- 拼团区（2026-10-28 用户点名「线下活动也要能拼团」）：与其它商详页同一枚组件、
		     同一套 @go-pay/@ready 接线；goods-id 取活动 id（后端 goodsArea 按它查进行中的活动）。
		     **落点（2026-10-31 用户点名「活动的拼团价格应该放在标题的下面」）**：整块上移到标题卡
		     正下方（拼团价横幅就是它那张卡的第一行），活动时间/地点/浏览次数那几张信息格顺次下移；
		     拼团玩法与凑团仍紧跟横幅，口径与 2026-10-30「上下挨在一起，不要拆分放」一致。
		     **`host-ticket` + `host-order`（2026-10-31 用户点名「活动拼团点击后，应该在 ticket
		     中添加报名信息，然后再跳转到 form 填写报名信息」）**：线下活动的商品是票券，拼团单要带
		     「票种 + 张数 + 报名信息 id」，这三样本来就在本页自己的两张中间页里收（选票页 → 报名信息页）
		     ⇒ 拼团区不弹它那只配置层、不在这里拼规格份数，只把拼团上下文经 `@order` 交回本页，
		     由本页带进选票页。 -->
		<tz-group-buy-area v-if="data.id" ref="gbArea" goods-type="activity" :goods-id="data.id" hide-danmu
			host-ticket host-order :closed="!data.apply_status"
			:join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
			:join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
			:join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
			:join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
			:join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
			:join-price="gbJoinCtx ? gbJoinCtx.price : 0"
			@go-pay="gbGoPay" @ready="gbReady" @order="gbOrder" />

		<tz-divider bgColor="#fafafa" v-if="!loading" />

		<tz-box padding="0px 5px 0px" v-if="!loading">
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

		<tz-divider bgColor="#fafafa" v-if="!loading" />

		<tz-box padding="15px 15px 15px"
			v-if="!loading && data.detail && data.detail != '<p><br></p>'">
			<tz-parse :limitCopy="true" :content="data.detail"
				:selectable="true"></tz-parse>
		</tz-box>

		<tz-bottom-btn
			v-if="!loading && data.id"
			@handle="apply"
			:disabled="!data.apply_status"
			:hide-main="gbInTeam || gbJoinMode"
			:btnTitle="!data.apply_status ? '报名已截止' : '立即报名'">
			<!-- 拼团入口：与课程/实物/练习那几页同一枚插槽件（底栏只提供加性插槽，不认识插件）。
			     **我正在这一场拼团里已有进行中的团（`gbInTeam`）→ 主按钮「立即报名」收起**
			     （PRD 2026-10-27）：与课程详情页同一枚 `hide-main`，底栏只留「查看拼团详情」。
			     **报名已截止（2026-10-31 用户点名「如果报名已截止，那么立即拼团也不能点击」）**：
			     与同栏主按钮吃同一枚 `data.apply_status`，主按钮灰掉时这枚也灰掉、点了不发声
			     （`tz-group-buy-btn` 的 `disabled` 在组件里也拦一次 `$emit('open')`）。
			     **但「查看拼团详情」那一档不灰**（`!gbInTeam` 才关）：已在团里的人只是去看自己的团，
			     报名时间过了不该连自己那一团都点不开。 -->
			<tz-group-buy-btn v-if="gbEntry" class="tbb-slot" slot="order-extra" :text="gbEntry.text"
				:price="gbEntry.price_text" :disabled="!data.apply_status && !gbInTeam" @open="openGb" />
		</tz-bottom-btn>

		<bind-mobile-modal />

		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
