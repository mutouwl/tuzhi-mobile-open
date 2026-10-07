<template>
  <div>
    <!-- 层级抬到 10220/遮罩 10210：这一只是**叠**在红包记录那一屏（10210/10200）之上开的 ——
         2026-10-01 用户点名「点击弹出领取红包弹窗，不要关闭这个红包记录弹窗」，两只改成同时在场。
         靠 z-index 排，不靠「谁写在模板后面谁在上」；抬的这一档仍在本页其余弹层（gift/连麦/清晰度那批走 uview 默认）之上 -->
    <u-popup
      :show="show"
      @close="close"
      @open="open"
      :closeable="false"
      :round="12"
      mode="center"
      bgColor="transparent"
      :overlayStyle="{ zIndex: 10210 }"
      :zIndex="10220"
    >
      <div class="redpacket-modal" :class="{ 'is-card': cardMode }">
        <!-- 红色信封身：白卡态才需要单独一层（白卡顶到面板顶，信封身从白卡后面起，且整面铺满到面板顶）。
             加载态也留着它 —— 这一层是面板唯一的底，撤了就只剩遮罩，壳就没了 -->
        <div class="rp-shell" v-if="cardMode"></div>

        <!-- 关闭按钮 -->
        <div class="modal-close" @click="close">
          <tz-icon name="close" :color="cardMode ? '#86909c' : '#ffffff'" :size="12" />
        </div>

        <!-- 加载态：整面一层 + 中间一枚转圈（2026-10-01 用户点名「骨架屏和最终展示的内容不匹配，
             不匹配指的是元素的位置、大小」）。这一屏在三态下是三套几何（待开一面红 / 白卡结果卡 / 领取记录），
             没有任何一块能先摆出真版式再盖灰 ⇒ 走整面那一档，高度取加载完成后那一版（见样式区）。
             关闭按钮 z-index 10 压在这一层（5）之上，加载中仍能关掉这只弹窗。
             转圈两档颜色跟着底走（2026-10-02 用户点名「加载中偏白色的那块显示成黑色」）：
             白卡态那一层底是 #fff8f4 ⇒ 转圈吃信封红下压档；待开态底是红身 ⇒ 转圈吃白。
             底色与转圈色只在这一处成对给，不许在调用点各写一个值 -->
        <div class="redpacket-loading" v-if="detailLoading">
          <u-loading-icon
            mode="circle"
            size="34"
            :color="loadingColor"
            :inactive-color="loadingInactiveColor"
          ></u-loading-icon>
        </div>

        <!-- 领取记录：白卡内列表 + 口袋里「返回查看红包」 -->
        <template v-else-if="showRecords">
          <div class="rp-card rp-card--records">
            <div class="rp-records-title">大家的手气</div>
            <scroll-view scroll-y class="rp-records-scroll">
              <div class="rp-records-row" v-for="(item, index) in grabList" :key="index">
                <image class="rp-records-avatar" :src="item.avatar || '/static/image/default-avatar.png'" mode="aspectFill" />
                <text class="rp-records-name">{{ maskName(item.nickname) }}</text>
                <text class="rp-records-lucky" v-if="item.is_max == 1">手气最佳</text>
                <text class="rp-records-amount">{{ item.amount }}<text class="rp-records-unit">元</text></text>
              </div>
              <!-- 一只都没人领（过期红包的常态）这一档：给一句实话，不留一块 212px 的空白
                   （M13：接口故障与「本来就没有」要说出口，v-if 出来的元素不许留占位） -->
              <div class="rp-records-empty" v-if="!grabList.length">还没有人领取这只红包</div>
            </scroll-view>
          </div>
          <div class="rp-pocket">
            <div class="rp-pill-btn" @click="showRecords = false">返回查看红包</div>
          </div>
        </template>

        <!-- 待开：类型 + 祝福语 + 总计金额 + 「开」 -->
        <template v-else-if="status == 'pending'">
          <div class="rp-body">
            <div class="rp-type">{{ typeLabel }}</div>
            <div class="rp-title">{{ redpacketData.blessing || '恭喜发财，大吉大利' }}</div>
            <div class="rp-total">
              <text class="rp-total-label">总计</text>
              <text class="rp-total-value">{{ totalAmountText }}</text>
              <text class="rp-total-unit">元</text>
            </div>
            <div class="rp-open-wrap">
              <div class="rp-seam"></div>
              <div class="rp-open-btn" @click="grabRedpacket">
                <text class="rp-open-text">开</text>
              </div>
            </div>
          </div>
        </template>

        <!-- 已抢到 / 已抢完 / 已过期 / 已撤回：同一块白卡 + 口袋。
             顶行是红包类型（发放人那行读出来就是「管理员」两个字，用户点名不要）；
             中间那一个大数字恒在：抢到了是我抢到的，没抢到/过期了是这只红包的总额（不给一句「下次早点来」的空位） -->
        <template v-else>
          <div class="rp-card">
            <div class="rp-card-sender">{{ typeLabel }}</div>
            <div class="rp-card-line">{{ resultLine }}</div>
            <div class="rp-card-amount">
              <text class="rp-card-value">{{ cardAmount }}</text>
              <text class="rp-card-unit">元</text>
            </div>
            <text class="rp-card-caption" v-if="status != 'grabbed'">红包总金额</text>
            <!-- 「查看大家的手气」无条件出：2026-10-01 用户点名「这个红包即使已经过期或者没人领取，也应该显示
                 查看大家的手气」。原先挂在 grabList.length > 0 上，而「没人领取」正是过期红包的常态 ⇒ 入口自己
                 把自己锁了（M28② 那一族：入口显隐不许依赖只有该入口自己能产生的数据）。
                 「有没有人领」交给记录屏那一屏的空态说，不在入口这一层藏 -->
            <div class="rp-card-link" @click="showRecords = true">查看大家的手气 ›</div>
          </div>
          <div class="rp-pocket">
            <div class="rp-pill-btn" v-if="status == 'grabbed'" @click="goBalance">去提现</div>
            <text class="rp-pocket-note" v-if="status == 'grabbed'">已存入个人余额，可提现</text>
          </div>
        </template>
      </div>
    </u-popup>
  </div>
</template>

<script src="./js.vue"></script>

<style scoped>
@import "./css.css";
</style>
