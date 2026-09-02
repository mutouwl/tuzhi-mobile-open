<template>
	<div class="container">


		<tz-box padding="0 10px">
			<u-cell-group :border="false">
				<u-cell :border="false" :titleStyle="{ 'font-size': '14px' }"
					title="头像">
					<template #right-icon>

						<!--  #ifdef H5 -->
						<u-avatar :src="userInfo.avatar" @click="changeAvatar" shape="square"></u-avatar>
						<!--  #endif -->
						<!--  #ifdef MP-WEIXIN || MP-TOUTIAO -->
						<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="changeAvatar">
							<u-avatar :src="userInfo.avatar" shape="square"></u-avatar>
						</button>
						<!--  #endif -->
					</template>
				</u-cell>
				<u-cell :border="false" :titleStyle="{ 'font-size': '14px' }" @click="$tools.copy(userInfo.username)"
					:value="userInfo.username" title="用户名">
					<template #right-icon>
						<tz-icon name="send" color="#86909C" :size="16" />
					</template>
				</u-cell>
				<u-cell :border="false" :titleStyle="{ 'font-size': '14px' }" @click="changeModalShow('nickname')"
					:value="userInfo.nickname" title="昵称">
					<template #right-icon>
						<tz-icon name="enter" color="#86909C" :size="13" />
					</template>
				</u-cell>
				<u-cell :border="false" :titleStyle="{ 'font-size': '14px' }"
					:value="userInfo.mobile ? '更换手机号' : '绑定手机号'" @click="changeMobile" title="手机号">
					<template #right-icon>
						<tz-icon name="enter" color="#86909C" :size="13" />
					</template>
				</u-cell>

				<u-cell :border="false" :titleStyle="{ 'font-size': '14px' }" @click="changePassword" title="密码">
					<template #right-icon>
						<tz-icon name="enter" color="#86909C" :size="13" />
					</template>
				</u-cell>
			</u-cell-group>
		</tz-box>
		<tz-divider />
		<!-- <tz-box padding="0 10px">
			<u-cell-group :border="false">
				<u-cell :border="false" :titleStyle="{ 'font-size': '14px' }" title="关联账号" @click="bindAccount">
					<template #right-icon>
						<u-icon name="weixin-fill" :color="userInfo.openid ? '#30C800' : '#888'" size="28"></u-icon>
					</template>
				</u-cell>

			</u-cell-group>
		</tz-box> -->
		<img :src="'https://www.tuzhi.ltd/assets/icons/1.png'" style="display: none;">
		<!-- <tz-box padding="0 10px">
			<u-cell-group :border="false">
				<u-cell :border="false" :titleStyle="{ 'font-size': '14px' }" title="关联账号" @click="bindAccount">
					<template #right-icon>
						<u-icon name="weixin-fill" :color="userInfo.openid ? '#30C800' : '#888'" size="28"></u-icon>
					</template>
				</u-cell>

			</u-cell-group>
		</tz-box> -->

		<tz-box padding="0 10px">
			<u-cell-group :border="false">
				<u-cell :border="false" value="查看" :titleStyle="{ 'font-size': '14px' }" title="用户协议" @click="agreement('user')">
					<template #right-icon>
						<tz-icon name="enter" color="#86909C" :size="13" />
					</template>
				</u-cell>

				<u-cell :border="false" value="查看" :titleStyle="{ 'font-size': '14px' }" title="隐私政策" @click="agreement('privacy')">
					<template #right-icon>
						<tz-icon name="enter" color="#86909C" :size="13" />
					</template>
				</u-cell>

			</u-cell-group>
		</tz-box>

		<tz-divider height="30" />

		<div class="logout" @click="logout">
			退出登录
		</div>


		<u-modal :show="modal.nickname" title="修改昵称" :showCancelButton="true" :closeOnClickOverlay="true"
			@close="changeModalShow('nickname')" @confirm="nicknameConfirm" @cancel="changeModalShow('nickname')">
			<input type="nickname" placeholder="请输入要修改的昵称" @change="nicknameInputChange" v-model="nickname"
				class="nickname-input" style="background-color: #fff;"/>
			<!-- <u-input placeholder="请输入要修改的昵称" @change="nicknameInputChange" type="nickname"></u-input> -->

		</u-modal>

		<tz-footer />

		<tz-tab-bar />
		
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
