<template>
	<view class="container">
		<view class="header-tip">
			<div class="sub-title">
				{{ !pageParams.type ? '找回密码' :'重置密码' }}
			</div>
		</view>


		<div class="input-box">

			<u-input customStyle="padding: 5px 10px!important;background: #F7F8FA;margin-bottom: 10px;" class="u-input-diy" v-model="form.mobile" placeholder="请输入手机号" border="none" />
			<u-input customStyle="padding: 5px 10px!important;background: #F7F8FA;margin-bottom: 10px;" class="u-input-diy" v-model="form.captcha" placeholder="请输入验证码" border="none">
				<template slot="suffix">
					<u-code ref="uCode" @change="codeChange" seconds="60" changeText="X秒重新获取"></u-code>
					<span class="get-code-btn" @click="getCode" :text="tips">{{ tips }}</span>
				</template>
			</u-input>

			<u-input customStyle="padding: 5px 10px!important;background: #F7F8FA;margin-bottom: 10px;" class="u-input-diy" placeholder="请输入新密码" type="password" v-model="form.newpassword" border="none" />
		</div>


		<div class="btn-box">
			<u-button @click="submit" text="确定" type="primary"></u-button>
		</div>


		<template v-if="!pageParams.type">
			<div class="nav-btn">
				<div class="pass-login-btn">
					<span @click="login">登录</span>
				</div>
				<!-- <div class="register-btn">
					<span @click="register">注册</span>
				</div> -->
			</div>


		</template>


		<!-- 加载 -->
		<u-loading-page bg-color="#e8e8e8" v-if="isRotate"></u-loading-page>

		<!-- 消息提示 -->
		<u-toast ref="uToast"></u-toast>

		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>


<style lang="scss">
@import "./css.css";
</style>