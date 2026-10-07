<template>
	<view class="container">
		<div class="user-header">
			<div class="info">
				<!-- 首屏用户信息加载中：头像与用户名按真实结构占位（.avatar 的 60px 圆、.username 的 35px 行盒），
				     数据到达后尺寸不变，避免头像瞬间出现把用户名挤到左边 -->
				<template v-if="loading">
					<div class="avatar skeleton-avatar"></div>
					<div class="content">
						<div class="username skeleton-username">
							<div class="skeleton-bar"></div>
						</div>
					</div>
				</template>

				<template v-else>
					<div @click="$nav.to('/pages/user/setting/setting')" class="avatar" v-if="userInfo && userInfo.avatar">
						<img :src="userInfo.avatar">
					</div>
					<div class="content" @click="$nav.to('/pages/user/setting/setting')">
						<div class="username">
							{{ userInfo && userInfo.nickname ? userInfo.nickname : '-'}}
						</div>
					</div>
				</template>
				<div class="message" @click="$nav.to('/pages/public/message/message')">
					<tz-icon name="message" />
				</div>
			</div>
 
			<vip-card v-if="vipEntryInHeader" />
		</div>

		<!-- 资产管理 / 常用功能受后台「店铺装修 > 个人中心」控制，配置到达前先铺骨架屏占位（M16） -->
		<template v-if="decorateLoading">
			<tz-title title="资产管理" :more="false" size="sm" />
			<tz-box padding="0 10 5">
				<div class="user-sk-row">
					<div class="user-sk-cell" v-for="i in assetSkCount" :key="i">
						<div class="user-sk-value"></div>
						<div class="user-sk-name"></div>
					</div>
				</div>
			</tz-box>
		</template>
		<template v-else-if="showAssets && assetCount">
			<tz-title title="资产管理" :more="false" size="sm" />
			<tz-box padding="0 10 5">
				<u-grid :border="false" :col="assetCol" :customStyle="gridCustomStyle">
					<u-grid-item v-for="(item, index) in assetsNav" :key="index" @click="toAssets(index)">
						<!-- 这一格单独盖灰块：奖品数那一枚字段在 user/info 里（其余三格是会员行上的列，随包就到），
						     兜底补取那条路仍在时它可能比其余三格晚一拍到；按 .nav-value 那一档占好位置，
						     名称是真文字照摆（灰块只进到会变的那一格，M18） -->
						<div class="user-sk-value" v-if="item.type == 'prize' && prizeSk"></div>
						<div class="nav-value" v-else>{{ item.value }}</div>
						<div class="nav-name">{{ item.name }}</div>
					</u-grid-item>
				</u-grid>
			</tz-box>
		</template>

		<!-- 学习中心：资产管理下方一张卡，显隐由后台「店铺装修 > 个人中心」的学习中心板块控制，
		     与资产管理/常用功能同一档：装修配置到达前先铺骨架屏占位，免得配置说「隐藏」时这张卡先闪一下再消失（M16）。
		     行版式与「常用功能」的列表版式同一档（图标 + 名称 + 右侧 enter）；
		     「累计学习 N 分钟」与名称同一行、由名称那枚 margin-right:auto 顶到右侧箭头之前 -->
		<template v-if="decorateLoading">
			<tz-divider />
			<!-- 单行卡上下各 5px 对称（行自己带上下 12px）；只给下面 15px 就成了「下边距明显大于上边距」，
			     上下都不给又太挤（常用功能那块要 15px 是因为它上面压着一行 50px 的标题条） -->
			<tz-box padding="5 15">
				<div class="user-sk-study">
					<div class="user-sk-study-ic"></div>
					<div class="user-sk-study-name"></div>
				</div>
			</tz-box>
		</template>
		<template v-else-if="showStudyCenter">
			<tz-divider />
			<tz-box padding="5 15">
				<u-cell-group :border="false">
					<u-cell :border="false" @click="nav(studyCenter.path)">
						<!-- 图标不走 u-cell 的 #icon 插槽：那个槽自带 4px 右距，方框再按字号给就会把间距撑大
						     （barrage 在 20px 字号下实测墨迹只有 13.8 宽），这一行自己摆、方框收到墨迹宽 14px，
						     图标与名称之间就是 css 里写死的 9px。
						     说明也不走 #value 插槽：上一版挪过去之后右侧那枚箭头就不显示了（用户实机反馈），
						     要右对齐就由名称那一枚 margin-right:auto 顶，箭头仍走 #right-icon（与设置页同一写法） -->
						<template #title>
							<div class="uc-study-title">
								<div class="uc-study-ic">
									<tz-icon :name="studyCenter.icon" :size="20" />
								</div>
								<text class="uc-study-name">{{ studyCenter.name }}</text>
								<text class="uc-study-note" v-if="studyMinutes !== null">累计学习 <text class="uc-study-num">{{ studyTimeText }}</text></text>
								<!-- 分钟数还在取：先按到手那一档占好位置，盖骨架条，不藏这一行也不留空白 -->
								<div class="uc-study-sk" v-else-if="studyLoading"></div>
							</div>
						</template>
						<template #right-icon>
							<tz-icon name="enter" color="#86909C" :size="13" />
						</template>
					</u-cell>
				</u-cell-group>
			</tz-box>
		</template>

		<tz-divider />

		<tz-title title="订单管理" :more="true" subtitle="查看全部订单" :link="{
			src: '/pages/order/list/list',
			type: 'local'
		}" size="sm" />
		<tz-box padding="0 10 15">
			<u-grid :border="false" :col="orderNav.length" :customStyle="gridCustomStyle">
				<u-grid-item v-for="(item, index) in orderNav" :key="index" @click="nav(item.path)">
					<tz-icon :name="item.icon" />
					<div class="nav-name">{{ item.name }}</div>
				</u-grid-item>
			</u-grid>
		</tz-box>

		<template v-if="decorateLoading">
			<tz-divider />
			<tz-title title="常用功能" :more="false" size="sm" />
			<tz-box padding="0 15 15">
				<div class="user-sk-row">
					<div class="user-sk-cell" v-for="i in 5" :key="i">
						<div class="user-sk-icon"></div>
						<div class="user-sk-name"></div>
					</div>
				</div>
			</tz-box>
		</template>
		<template v-else-if="showFunctions">
			<tz-divider />
			<tz-title title="常用功能" :more="false" size="sm" />
			<tz-box  padding="0 15 15">
				<u-grid :border="false" :col="5" :customStyle="gridCustomStyle" v-if="functionStyle == 'grid'">
					<u-grid-item v-for="(item, index) in controllNav" :key="index" @click="nav(item.path)">
						<!-- 入口图标默认 28px；个别字形墨迹偏大（满幅图标）由数据里的 size 按实测墨迹校正，如「教务中心」 -->
						<tz-icon :name="item.icon" :size="item.size || 28"/>
						<div class="nav-name">{{ item.name }}</div>
					</u-grid-item>
				</u-grid>

				<u-cell-group :border="false" v-else>
					<u-cell :border="false" @click="nav(item.path)" :title="item.name" v-for="(item, index) in controllNav"
						:key="index">
						<template #icon>
							<div class="uc-cell-icon">
								<tz-icon :name="item.icon" :size="listIconSize(item)" />
							</div>
						</template>
						<template #right-icon>
							<tz-icon name="enter" color="#86909C" :size="13" />
						</template>
					</u-cell>
				</u-cell-group>

			</tz-box>
		</template>
		<tz-tab-bar />

		<tz-footer />

		<service-modal :visible="modal.service" :mobile="serviceConfig.mobile" :code="serviceConfig.code" @close="modal.service=false" v-if="serviceConfig && serviceConfig.status == 'open'"/>

		<bind-mobile-modal/>

		<userinfo-edit-modal @close="modal.userinfoEdit = false" @ok="getData()" :nickname="userInfo.nickname" :avatar="userInfo.avatar" :visible="modal.userinfoEdit" />

	</view>
</template>

<script src="./js.vue">

</script>

<style>
@import "./css.css";
</style>
