<template>
	<div class="container">


		<div class="icon">
			<img src="/static/image/verify.png" alt="">
		</div>

		<div class="tip">
			<template v-if="step == 1">
				<div class="title">
					验证当前手机号 {{ mobile }}
				</div>
				<div class="subtitle">
					更换手机号前，请先用当前手机号验证身份
				</div>
			</template>

			<template v-if="step == 2">
				<div class="title">
					请验证新手机号
				</div>
			</template>

		</div>

		<tz-box padding="5px 20px" v-if="step == 1">
			<u-input border="none" class="u-input-diy" v-model="form.confirm.captcha" placeholder="请输入验证码">
				<template slot="suffix">
					<u-code ref="olduCode" @change="oldCodeChange" seconds="60" changeText="X秒重新获取"></u-code>
					<span class="get-code-btn" @click="getCode('old')" :text="tips.old">{{ tips.old }}</span>
				</template>
			</u-input>
		</tz-box>

		<tz-box padding="5px 20px" v-if="step == 2">
			<u-input border="none" v-model="form.change.mobile" class="u-input-diy" placeholder="请输入新手机号">
			</u-input>
			<tz-divider margin="10" height="1" bgColor="#efefef" />
			<u-input border="none" v-model="form.change.captcha" class="u-input-diy" placeholder="请输入验证码">
				<template slot="suffix">
					<u-code ref="newuCode" @change="newCodeChange" seconds="60" changeText="X秒重新获取"></u-code>
					<span class="get-code-btn" @click="getCode('new')" :text="tips.new">{{ tips.new }}</span>
				</template>
			</u-input>
		</tz-box>


		<tz-divider height="20" bgColor="none" />

		<tz-box bgColor="none">
			<u-button type="primary" text="确定" @click="submit"></u-button>
		</tz-box>
		<tz-footer/>

	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
