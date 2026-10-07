<template>
	<view class="school-page">
		<!-- 领取期提示走登记在册的 u-alert（与「余额」页那条提现提示同档，M22）：
		     警示句用组件自带的浅黄底 + 警示图标，不自绘一行灰字。
		     文案由接口下发（attr.deadline_tip / 顶层 deadline_tip），前端不写「15 天」。
		     外层只负责留边——左右 10px 与下面 .school-cards 的内衬对齐，否则提示条会通栏、
		     下面的卡片却缩进，一眼看过去是错位的。 -->
		<view class="sgp-tip" v-if="deadlineTip">
			<!-- 自带 margin-bottom 的那一档已收掉（2026-10-03 用户点名「列表顶部的外边距有点大，
			     距离这个 alert 有点大」）：原来 alert 的 12px 下外边距与下面 .school-cards 的 10px
			     上内衬叠成 22px，比卡片之间的间距还宽一截，读起来像提示条与列表是两块不相干的东西。
			     现在只留 .school-cards 那 10px，与卡间距同档 -->
			<u-alert type="warning" :title="deadlineTip" :showIcon="true" effect="light" />
		</view>

		<view class="school-cards">
			<!-- 首屏骨架（M16）：外壳复用真实那一只 .school-card，灰块与真实行三块一一对应
			     （封面 60 方、两行文字、右侧按钮块），判据 loading && !list.length —— 上拉翻页由已有列表顶着，不闪骨架。
			     rows-width 带冒号绑成数组：写成静态属性就是一条字符串，u-skeleton 认不出数组 -->
			<view class="sgp-sk-wrap" v-if="loading && !list.length">
				<view class="school-card sgp-sk" v-for="i in 3" :key="'sgp-sk-' + i">
					<view class="sgp-sk-cover"></view>
					<view class="sgp-sk-info">
						<u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['58%', '36%']" rows-height="14"></u-skeleton>
					</view>
					<view class="sgp-sk-btn"></view>
				</view>
			</view>

			<template v-else>
				<view class="school-card sgp-item" v-for="item in list" :key="item.prize_log_id" @tap="view(item)">
					<!-- 封面两种缺法都要有样子（2026-10-03 用户点名「左侧的封面是空的」）：
					     ① 商家压根没配奖品图（cover 为空串）；
					     ② 配了但图加载不出来（地址失效、网慢、图被删）。
					     原先只有 ① 的空灰块、② 完全没有兜底——<image> 加载失败在页面上就是一片空白，
					     左边那一格直接空在那里。两条都落同一张默认商品图（与套餐卡、校区卡同一张），
					     分支判据是后端给的 cover 加上按 mpKey(地址) 记的失败表（硬约束 25：
					     地址原样作 data 的键会被 setData 当成嵌套路径解析后抛错）。 -->
					<image
						class="sgp-cover"
						v-if="showCover(item)"
						:src="cover(item.cover)"
						mode="aspectFill"
						@error="onCoverError(item)"
					></image>
					<image class="sgp-cover" v-else :src="defaultCover" mode="aspectFill"></image>
					<view class="sgp-info">
						<view class="sgp-name">{{ item.name }}</view>
						<view class="sgp-meta">
							<text class="sgp-meta-type">{{ item.type_text }}</text>
							<text class="sgp-meta-tag" v-if="item.status_text">{{ item.status_text }}</text>
						</view>
						<view class="sgp-sub" v-if="fromLine(item)">{{ fromLine(item) }}</view>
					</view>
					<!-- 整卡可点（M19）：点卡片任意一处都弹详情窗，不必非得点中那枚按钮——
					     2026-10-03 用户点名「点击这个列表卡片就应该弹出来详情弹窗」。
					     **按钮那一格 @tap.stop**：按钮自己那条动作（领取 / 兑奖方式）不许再冒泡成
					     「开详情窗」，否则点一下会同时开两只窗。stop 加在这一层 view 上而不是
					     tz-button 上：那是自定义组件，事件名不由本层决定（硬约束 27）。
					     已过期那几行整枚不出按钮，但整卡照样可点（详情窗照样弹得出来）。
					     **size=mini**（2026-10-04 用户点名「右侧这个按钮呀，稍微有点大了，size 可以为 mini」）：
					     本卡按钮是「右侧那一列、与整块信息垂直居中」的落点（不是贴卡片右下角独占一行），
					     走 mini 那一档＝12px 文字 + 内衬 2/10、热区 20px，与本卡 12/10px 的元信息同档；
					     原来给 mid（14px 文字、热区 27px）显得压过卡片主信息，**且与骨架块对不上**——
					     下方 .sgp-sk-btn 早就按 mini 的 20 高写死并注明了档位，改成 mid 等于加载完整体换版。
					     教务账户卡/分享有礼那一档仍是 mid：那是贴在卡片右下角独占一行的入口，形态不同，不跟着改 -->
					<view class="sgp-actions" v-if="item.can_receive || (item.can_view && item.target)" @tap.stop>
						<tz-button v-if="item.can_receive" size="mini" type="primary" text="领取" @click="claim(item)"></tz-button>
						<tz-button v-else-if="item.can_view && item.target" size="mini" text="去查看" @click="view(item)"></tz-button>
					</view>
				</view>

				<view class="sgp-loadmore" v-if="list.length && loadStatus !== 'nomore'">
					<u-loadmore :status="loadStatus" />
				</view>

				<u-empty
					v-if="!list.length"
					icon="/static/image/empty.png"
					width="70"
					height="70"
					:text="errorText || '暂无奖品'"
				></u-empty>
			</template>
		</view>

		<!-- 领奖那一条链是标准版共用的（实物收地址 / 自定义弹兑奖方式 / 其余领完弹奖品详情），
		     直播间活动详情弹窗挂的是同一只组件，两处不许各写一份。
		     claimed 回调把那一行就地换成「已领取 + 去查看」，不整页重取（理由见 js.vue onClaimed） -->
		<tz-prize-claim ref="claim" :tip="deadlineTip" @claimed="onClaimed"></tz-prize-claim>

		<!-- 底栏形态照「我的证书」与教务校区列表那一档：自定义 tab bar + 版权行 -->
		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
