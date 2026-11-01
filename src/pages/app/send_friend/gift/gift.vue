<template>
	<view class="school-page sfg">
		<!-- 页签：全部 / 待赠送 / 已领取 / 已失效。走登记在册的 tz-tabs（它内部就是 u-tabs，
		     对外事件是 tab-change，M2/硬约束 12「登记在册的组件禁止重造」，口径同「我的拼团」那一页）。
		     2026-10-20 用户点名取消「待领取」：分享只是记送出时刻，礼单领取前一直停在待赠送。
		     **吸顶（M5，2026-10-28 用户点名「tabs 要吸顶」）**：整条页签行包在 u-sticky 里，
		     带底给白底、与下方 #f7f8fa 的卡片区区分；带里只放页签行本身——
		     「仅看订单」那行是随数据变的说明行，留在带外跟着列表滚走（M5「带内只放页签/搜索栏」） -->
		<u-sticky bgColor="#fff" :offsetTop="0">
			<tz-tabs :tabs="tabs" @tab-change="onTab" />
		</u-sticky>

		<!-- 订单详情那枚「送礼记录」带 order_no 进来时，说明这一屏只列那一张购买单的礼单；
		     把范围写出来（否则用户会以为自己的礼单只剩这些）。普通入口不带这一参，整行不出 -->
		<view class="sfg-scope" v-if="orderNo">
			<text class="sfg-scope-label">仅看订单</text>
			<text class="sfg-scope-no">{{ orderNo }}</text>
		</view>

		<view class="school-cards">
			<!-- 首屏骨架（M16）：外壳与真实那一行同一只，条目卡走 tz-course-mini 自己的骨架档
			     （卡高/封面宽/圆角全由那一版式给一份，改卡版式不会「真实卡变了、骨架还是老尺寸」）；
			     信息区三段与真实行同序同形：状态标 + 份数刻度 → 领取人头像 + 昵称 → 时间 + 按钮。
			     v-for 与 v-if 不叠在同一元素上：那一档 v-if 由 skRows 这一枚 computed 给（硬约束 22 的写法） -->
			<view class="school-card sfg-item sfg-sk" v-for="i in skRows" :key="'sfg-sk-' + i">
				<tz-course-mini :skeleton="true" :skeleton-count="1" :margin="0" :round="true" :border="false" />
				<view class="sfg-info">
					<view class="sfg-head">
						<view class="sfg-sk-status"></view>
						<view class="sfg-sk-seq"></view>
					</view>
					<view class="sfg-receiver-row">
						<text class="sfg-receiver-label">领取人</text>
						<view class="sfg-avatar sfg-avatar--sk"></view>
						<view class="sfg-sk-name"></view>
					</view>
					<view class="sfg-foot">
						<view class="sfg-sk-time"></view>
						<view class="sfg-sk-btn"></view>
					</view>
				</view>
			</view>

			<!-- 条目卡复用紧凑档课程卡 `tz-course-mini`（2026-10-20 用户点名「course-item item 可以替换为
			     course-item mini」；口径同「我的拼团」那一页）。
			     2026-10-28 用户点名「点击记录应该跳转到送好友详情，点击记录列表中的商品也不要直接跳商品详情，
			     也是跳转送好友详情；之后在送好友详情点击商品再跳商品详情」：
			       · **整条记录**（含商品卡与时间那一行）点击 → 送礼页 `goSend(row)`；
			       · 商品卡 `:clickable="false"`：卡片自己的商品详情跳转关掉，统一由整条记录接住；
			       · 右侧动作按钮外包一层 `@click.stop`：按钮点自己那一档（赠送/查看），不连带触发整条记录的跳转。
			     2026-10-26 用户点名「赠送记录列表也比较单调，参考拼团优化方式丰富一下」：
			     卡下三段——① 状态标 + 第 N/M 份；② 领取人；③ 时间 + 行内动作。 -->
			<view class="school-card sfg-item" v-for="row in rows" :key="row.id" @click="goSend(row)">
				<tz-course-mini :list="courseCard(row)" :margin="0" :round="true" :border="false"
					:clickable="false" />

				<view class="sfg-info">
					<view class="sfg-head">
						<text class="sfg-tag" :class="[tagClass(row.status)]" v-if="row.status_label">{{ row.status_label }}</text>
						<text class="sfg-seq" v-if="seqText(row)">{{ seqText(row) }}</text>
					</view>

					<!-- 领取人块：头像吃后端 `receiver_avatar`（领取后才有），名字仍只读 `receiver_name`；
					     未领取那一档不给一个空圆占位，直接说「还没人领取」 -->
					<view class="sfg-receiver-row">
						<!-- 角色标签放在头像前、头像紧贴昵称（M35⑧，2026-10-27 用户点名「领取人三个字
						     放在头像和昵称中间」）：标签 → 头像 → 昵称，骨架那一行同序。 -->
						<template v-if="hasReceiver(row)">
							<text class="sfg-receiver-label">领取人</text>
							<!-- 头像取不到（地址失效 / CDN 掉图 / 域名没进白名单）时换全站默认头像，
							     不给一个空圆：2026-10-29 用户点名「列表中的图片如果加载失败要有默认填充的图片」。
							     查表走方法（模板看不到模块级 import，M27），键的转换收在 `avatarSrc` 里 -->
							<image class="sfg-avatar" v-if="receiverAvatar(row)" :src="avatarSrc(row)"
								mode="aspectFill" @error="onAvatarError(row)" />
							<text class="sfg-receiver">{{ row.receiver_name }}</text>
						</template>
						<text class="sfg-receiver-empty" v-else>还没人领取</text>
					</view>

					<!-- 灰字时间走 §1 的 10px 档：静态标签与后端下发的值拆成两枚节点（M35）；
					     行内动作按「后端已经算好的那一档」出，端上不重算状态机（M22）。
					     两样都没有（已失效且没有可说的时刻）时整行不出，不留一条空内衬（M18⑨） -->
					<view class="sfg-foot"
						v-if="timeLine(row) || canGive(row) || canView(row)">
						<view class="sfg-time" v-if="timeLine(row)">
							<text class="sfg-time-label">{{ timeLine(row).label }}</text>
							<text class="sfg-time-value">{{ timeLine(row).value }}</text>
						</view>
						<!-- 行内动作外包一层 `@click.stop`：按钮自己发的 custom click 照常执行（赠送/查看都进送礼页），
						     但原生点击不再冒泡到整条记录，避免「点一下跳两次」。
						     `can_give`（0 待赠送）→ 赠送；已领取/已失效 → 查看（送礼页终局态，真有落点，不是死按钮） -->
						<view class="sfg-action" @click.stop
							v-if="canGive(row) || canView(row)">
							<tz-button v-if="canGive(row)" size="small" type="primary"
								text="赠送" @click="goSend(row)"></tz-button>
							<tz-button v-else size="small" text="查看" @click="goSend(row)"></tz-button>
						</view>
					</view>
				</view>
			</view>

			<view class="sfg-loadmore" v-if="rows.length && loadStatus !== 'nomore'">
				<u-loadmore :status="loadStatus" />
			</view>

			<view class="sfg-empty" v-if="!loading && !rows.length">
				<u-empty icon="/static/image/empty.png" width="70" height="70" :text="notice"></u-empty>
			</view>
		</view>

		<!-- 底部导航 + 版权页脚：与本页同族的「领取赠送」页已有 tz-footer，两页统一到同一档
		     （口径见 pages/app/checkin/detail/detail.vue 同节注释：tz-tab-bar 只在本页被配成
		     底部导航项时渲染，tz-footer 常驻） -->
		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue">
</script>

<style lang="scss">
@import "./css.css";
</style>
