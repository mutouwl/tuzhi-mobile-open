<template>
  <view class="container">
    <view class="header-tip">
      <!-- #ifdef MP-TOUTIAO -->
      <div class="title">抖音用户信息授权登录</div>
      <!-- #endif -->

      <!-- #ifndef MP-TOUTIAO -->
      <div class="title">用户登录</div>
      <div class="sub-title">首次登录将自动创建账号</div>

      <!-- #endif -->
    </view>

    
    <template v-if="$tools.systemConfig('mobile_login') == 'open'">
      <div class="input-box">
        <u-input
          class="u-input-diy"
          v-model="form.account"
          placeholder="请输入手机号"
          border="none"
        />
        <u-input
          class="u-input-diy"
          v-model="form.captcha"
          placeholder="请输入验证码"
          border="none"
          v-if="loginType == 'captcha'"
        >
          <template slot="suffix">
            <u-code
              ref="uCode"
              @change="codeChange"
              seconds="60"
              changeText="X秒重新获取"
            ></u-code>
            <span class="get-code-btn" @click="getCode" :text="tips">{{ tips }}</span>
          </template>
        </u-input>

        <u-input
          class="u-input-diy"
          placeholder="请输入密码"
          type="password"
          v-model="form.password"
          border="none"
          v-if="loginType == 'password'"
        />
      </div>

      <div class="btn-box">
        <!-- #ifdef MP-TOUTIAO -->
        <u-button @click="login" text="抖音手机号授权快捷登录" type="primary"></u-button>
        <!-- #endif -->

        <!-- #ifndef MP-TOUTIAO -->
        <u-button @click="login" text="登录" type="primary"></u-button>
        <!-- #endif -->
      </div>

      <div class="nav-btn">
        <div class="pass-login-btn">
          <!-- #ifdef MP-TOUTIAO -->
          <span @click="changeLoginType">{{
            loginType == "captcha" ? "账号密码" : "验证码"
          }}</span>
          <!-- #endif -->
          <!-- #ifndef MP-TOUTIAO -->
          <span @click="changeLoginType">{{
            loginType == "captcha" ? "账号密码登录" : "验证码登录"
          }}</span>
          <!-- #endif -->
        </div>
        <div class="register-btn">
          <span @click="resetpwd">忘记密码</span>
        </div>
      </div>
    </template>

    <template v-else>
      <img src="@/pages/public/static/image/login_canva.png" style="width: 200px;height:190px;margin: 50px auto;display: block;">
    </template>

    <!-- #ifdef H5 -->
    <!-- -->
    <div
      class="login-more-btn"
       v-if="$tools.isWechat() && $tools.systemConfig('wx_login') == 'open'"
    >
      <div class="divider">选择登录方式</div>
      <div class="platform-btn">
        <u-button @click="wxLogin" color="#00C261" icon="weixin-circle-fill" iconColor="#fff">微信一键登录</u-button>
        <!-- <span @click="wxLogin">
          <u-icon size="50px" color="#00DF6C" name="weixin-circle-fill"></u-icon>
        </span> -->
      </div>
    </div>
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <div class="login-more-btn" v-if="$tools.systemConfig('wx_mp_login') == 'open'">
      <div class="divider">更多登录方式</div>
      <div class="platform-btn">
        <!-- <button open-type="getUserInfo" class="wx-button" @getuserinfo="getuserinfo">
          <u-icon size="55px" color="#00DF6C" name="weixin-circle-fill"></u-icon>
        </button> -->
        <u-button open-type="getUserInfo" @getuserinfo="getuserinfo" custom-style="border:none!important" style="border:none!important" color="#00C261" icon="weixin-circle-fill" iconColor="#fff">微信一键登录</u-button>
      </div>
    </div>
    <!-- #endif -->

    <!-- #ifdef MP-TOUTIAO -->
    <div class="login-more-btn" v-if="$tools.systemConfig('dy_mp_login') == 'open'">
      <div class="divider">更多登录方式</div>
      <div class="platform-btn">
        <button class="wx-button" @click="getuserinfo">
          <!-- <u-icon size="50px" color="#00DF6C" name="weixin-circle-fill"></u-icon> -->
          <img src="@/pages/public/static/image/douyin.png" style="width: 50px; height: 50px" />
        </button>
      </div>
    </div>
    <!-- #endif -->

    <view class="agreement-box">
      <u-checkbox
        :customStyle="{
          textAlign: 'center',
          justifyContent: 'center',
        }"
        :checked="agreementChecked"
        label="已阅读并同意"
        size="14px"
        labelSize="12px"
        class="agreement"
        @change="agreementChange"
      >
      </u-checkbox>
      <span class="agreement"
        ><span @click="agreement('user')">《用户协议》</span>和<span
          @click="agreement('privacy')"
          >《隐私政策》</span
        ></span
      >
    </view>

    <!-- 加载 -->
    <u-loading-page bg-color="#e8e8e8" v-if="isRotate"></u-loading-page>

    <!-- 消息提示 -->
    <u-toast ref="uToast"></u-toast>
    <!-- <tz-footer/> -->

    <!-- <tz-footer /> -->
  </view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
