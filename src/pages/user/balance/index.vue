<template>
  <div class="redpacket-page">
    <!-- 余额卡片 -->
    <div class="balance-card">
      <div class="balance-info">
        <div class="balance-label-row">
          <text class="balance-label">余额（元）</text>
        </div>
        <text class="balance-value">{{ balance }}</text>
      </div>
      <div class="balance-stats">
        <div class="stat-item">
          <text class="stat-value">{{ totalIncome }}</text>
          <text class="stat-label">总收入</text>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <text class="stat-value">{{ totalWithdraw }}</text>
          <text class="stat-label">已提现</text>
        </div>
      </div>
    </div>

    <!-- 提现 -->
    <tz-box margin="10" padding="16px 16px" v-if="isWithdrawEnabled">
      <u-alert v-if="withdrawTip" type="warning" :title="withdrawTip" :showIcon="true" effect="light" customStyle="margin-bottom: 12px;" />
      <div class="form-item">
        <text class="form-label">提现金额</text>
        <div class="amount-input-wrap">
          <text class="amount-symbol">¥</text>
          <input
            class="amount-input"
            type="digit"
            v-model="withdrawAmount"
            :placeholder="amountPlaceholder"
            :placeholder-style="'color: #ccc'"
          />
        </div>
        <div class="form-extra" v-if="withdrawMinMoney > 0">
          <text>最低提现金额 ¥{{ Number(withdrawMinMoney).toFixed(2) }}</text>
        </div>
        <div class="form-extra" v-if="monthRemaining >= 0">
          <text>本月还可提现 {{ monthRemaining }} 次</text>
        </div>
      </div>

      <div class="form-item">
        <text class="form-label">提现方式</text>
        <div class="pay-type-list">
          <div
            class="pay-type-item"
            :class="{ active: withdrawType == item.value }"
            v-for="item in payTypes"
            :key="item.value"
            @click="withdrawType = item.value"
          >
            <text class="pay-type-name">{{ item.label }}</text>
          </div>
        </div>
        <!-- 微信零钱未绑定提示 -->
        <div class="wechat-tip" v-if="withdrawType == 'wechat' && !wechatBound">
          <text>你还未绑定微信，绑定后方可提现到微信零钱</text>
          <text class="wechat-bind-link" @click="goBindAccount">去绑定</text>
        </div>
      </div>

      <!-- 微信零钱无需收款账户（自动用绑定的微信openid） -->
      <div class="form-item" v-if="needAccount">
        <text class="form-label">收款账户</text>
        <div class="account-select" @click="showAccountPopup = true">
          <text class="account-text" v-if="selectedAccount">{{ selectedAccount.name }}（{{ selectedAccount.account }}）</text>
          <text class="account-placeholder" v-else>请选择收款账户</text>
          <tz-icon name="arrow-right" color="#999" :size="14" class="account-arrow" />
        </div>
      </div>
      <div class="form-item" v-else>
        <text class="form-label">到账方式</text>
        <div class="account-select static">
          <text class="account-text">微信零钱（需微信确认收款）</text>
        </div>
        <div class="wechat-realname-tip" v-if="needWechatRealName">
          <text>单笔微信提现达到 ¥2,000.00 时，需填写收款人真实姓名。</text>
        </div>
      </div>

      <button class="withdraw-btn" :disabled="withdrawSubmitting" @click="submitWithdraw">申请提现</button>
    </tz-box>

    <!-- 提现未开启提示 -->
    <tz-box margin="10" padding="16px 16px" v-else>
      <div class="withdraw-disabled-tip">
        <text>提现功能暂未开启，敬请期待</text>
      </div>
    </tz-box>

    <!-- 记录查询 -->
    <tz-box margin="10" padding="0px 16px">
      <u-cell-group :border="false" class="record-menu">
        <u-cell title="余额明细" isLink :border="true" @click="goAssetsDetail"></u-cell>
        <u-cell title="提现记录" isLink :border="false" @click="goWithdrawLog"></u-cell>
      </u-cell-group>
    </tz-box>

    <!-- 收款账户弹窗 -->
    <u-popup :show="showAccountPopup" @close="showAccountPopup = false" mode="bottom" :round="10">
      <div class="account-popup">
        <div class="popup-header">
          <text class="popup-title">收款账户</text>
          <text class="popup-add" @click="openAddAccount">+ 添加</text>
        </div>
        <div class="account-list" v-if="currentTypeAccounts.length > 0">
          <div
            class="account-item"
            v-for="(item, index) in currentTypeAccounts"
            :key="index"
            @click="selectAccount(item)"
          >
            <div class="account-info">
              <text class="account-name">{{ item.name }}</text>
              <text class="account-no">{{ item.account }}</text>
              <text class="account-type-tag" v-if="item.ext">{{ item.ext }}</text>
            </div>
            <div class="account-actions">
              <text class="account-default" v-if="item.is_default == 1">默认</text>
              <text class="account-edit" @click.stop="editAccount(item)">编辑</text>
              <text class="account-del" @click.stop="deleteAccount(item)">删除</text>
              <text class="account-check" v-if="selectedAccount && selectedAccount.id == item.id">✓</text>
            </div>
          </div>
        </div>
        <div class="account-empty" v-else>
          <text>暂无{{ currentAccountTypeLabel }}收款账户，请添加</text>
        </div>
      </div>
    </u-popup>

    <!-- 添加/编辑账户弹窗 -->
    <u-popup :show="showAddAccount" @close="showAddAccount = false" mode="bottom" :round="10">
      <div class="add-account-popup">
        <div class="popup-header">
          <text class="popup-title">{{ accountForm.id ? '编辑收款账户' : '添加收款账户' }}</text>
        </div>
        <div class="add-form">
          <div class="form-item">
            <text class="form-label">账户类型</text>
            <div class="pay-type-list">
              <div
                class="pay-type-item"
                :class="{ active: accountForm.type == item.value }"
                v-for="item in accountTypes"
                :key="item.value"
                @click="accountForm.type = item.value"
              >
                <text class="pay-type-name">{{ item.label }}</text>
              </div>
            </div>
          </div>
          <div class="form-item">
            <text class="form-label">{{ accountNameLabel }}</text>
            <input class="form-input" v-model="accountForm.account_name" :placeholder="accountNamePlaceholder" />
          </div>
          <div class="form-item">
            <text class="form-label">{{ accountNoLabel }}</text>
            <input class="form-input" v-model="accountForm.account_no" :placeholder="accountNoPlaceholder" />
          </div>
          <div class="form-item" v-if="accountForm.type == 'bank'">
            <text class="form-label">开户行</text>
            <input class="form-input" v-model="accountForm.ext" placeholder="请输入开户行（如：中国工商银行xx支行）" />
          </div>
          <button class="save-btn" :disabled="accountSaving" @click="saveAccount">保存</button>
        </div>
      </div>
    </u-popup>

    <!-- 微信高额提现实名弹窗 -->
    <u-popup :show="showWechatNamePopup" @close="cancelWechatRealName" mode="bottom" :round="10" :safeAreaInsetBottom="true">
      <div class="wechat-name-popup">
        <div class="popup-header">
          <text class="popup-title">收款人真实姓名</text>
        </div>
        <div class="wechat-name-body">
          <text class="wechat-name-desc">微信提现金额达到 ¥2,000.00 时，微信支付需要校验收款用户姓名。</text>
          <input
            class="form-input wechat-name-input"
            v-model="wechatRealName"
            maxlength="32"
            placeholder="请输入收款人真实姓名"
            :adjust-position="true"
          />
        </div>
        <div class="wechat-name-actions">
          <button class="wechat-name-btn cancel" @click="cancelWechatRealName">取消</button>
          <button class="wechat-name-btn primary" @click="confirmWechatRealName">继续提现</button>
        </div>
      </div>
    </u-popup>
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style scoped>
@import "./css.css";
</style>
