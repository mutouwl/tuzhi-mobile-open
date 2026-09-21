<template>
	<view class="container">
		<view class="header-tip">
				<div class="title">
					你好,
				</div>
				<div class="sub-title">
					欢迎加入{{ $tools.systemConfig('name') }}
				</div>
			</view>


			<div class="input-box">

				<u-input class="u-input-diy" v-model="form.mobile" placeholder="请输入手机号" border="bottom" />
				<u-input class="u-input-diy" v-model="form.code" placeholder="请输入验证码" border="bottom">
					<template slot="suffix">
						<u-code ref="uCode" @change="codeChange" seconds="60" changeText="X秒重新获取"></u-code>
						<span class="get-code-btn" @click="getCode" :text="tips">{{ tips }}</span>
					</template>
				</u-input>

				<u-input placeholder="请输入密码" type="password" v-model="form.password" border="bottom"/>
			</div>


			<div class="btn-box">
				<u-button @click="submit" text="确定" type="primary"></u-button>
			</div>


			<div class="nav-btn">
				<div class="pass-login-btn">
					<span @click="login">登录</span>
				</div>
				<div class="register-btn">
					<span @click="resetpwd">忘记密码</span>
				</div>
			</div>


			<!-- 加载 -->
			<u-loading-page bg-color="#e8e8e8" v-if="isRotate"></u-loading-page>

			<!-- 消息提示 -->
			<u-toast ref="uToast"></u-toast>

			<!-- <tz-footer/> -->
	</view>
</template>

<script src="./js.vue">

</script>


<style lang="scss">
@import "./css.css";
</style>