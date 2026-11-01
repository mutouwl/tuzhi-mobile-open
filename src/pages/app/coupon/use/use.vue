<template>
  <div class="container">
    <!-- 券领取区（2026-10-27 照参考图重做）：橙色渐变页头 + 米色描边白卡（店铺头 / 虚线分隔 / 券卡）+ 橙色波浪操作区。
         类名统一挂 .coupon-hero 前缀：券卡组件 coupon-my 的根节点也叫 .coupon-box，
         页面样式不带 scoped，名字撞上会给卡里那张券加上一层页头底色（M11/M12）。
         取数失败时整块不出（M13：不把后端故障渲染成一张空券卡），失败原因交给下面那处空态说 -->
    <div class="coupon-hero" v-if="!failMsg">
      <div class="hero-card">
        <div class="hero-top">
          <!-- 店铺名/logo 来自本地系统配置，首屏就在，不参与加载态（静态文案保持真文字，M16②） -->
          <div class="hero-head">
            <div class="hero-store">
              <img :src="store.logo" class="hero-logo" /><span class="hero-name">{{
                store.name
              }}</span>
            </div>
            <!-- 分享入口挂在券自己的 share_status 上（1=开启、2=关闭）：关掉分享的券整枚不出，
                 不留一枚点了只能看弹窗的入口。点击开全站分享弹窗（小程序分享面板 / 微信内指右上角 /
                 普通浏览器复制链接都由它分路），券的分享落点是 receive 页（后端 Links coupon 那一条） -->
            <div class="hero-share" v-if="data.share_status != 2" @click="openShare">
              <tz-icon name="share" :size="15" color="#FF7E16" />
              <span class="hero-share-text">分享给好友</span>
            </div>
          </div>
          <div class="hero-cardwrap">
            <!-- 券卡骨架档由 coupon-my 自己出（:skeleton），本页不另铺一棵灰块树；
                 卡里那枚行内按钮在本页收掉（hide-action）：一屏只留下面那一枚主操作（M17） -->
            <coupon-my :skeleton="loading" :data="data" hide-action />
          </div>
        </div>
        <!-- 余量进度与操作按钮都按后端字段判，属于「v-if 才出的元素」：
             骨架档不给灰块也不预留空位（加载中先不摆这一段，免得撤下时整块跳位，M16③） -->
        <div
          class="hero-action"
          :class="{ 'hero-action--stock': data.stock_status == 1 }"
          v-if="!loading"
        >
          <template v-if="data.stock_status == 1">
            <div class="hero-progress-text">优惠券数量剩余 {{ data.stock_prop }}%</div>
            <div class="hero-progress-bar">
              <u-line-progress
                :percentage="data.stock_prop"
                inactiveColor="rgba(255, 255, 255, 0.35)"
                :showText="false"
                height="10"
                activeColor="#ffffff"
              ></u-line-progress>
            </div>
          </template>
          <div class="hero-btns">
            <!-- 一个主操作：已领到就「立即使用」，没领到就「点击领取」，
                 其余（已领完 / 已达最大领取次数 / 已结束）落成禁用态并把后端那句原因写在按钮上 -->
            <button class="hero-btn" v-if="data.can_use" @click="use()">
              立即使用
            </button>
            <button
              class="hero-btn"
              v-else-if="data.get_status == 'can_get'"
              @click="receive()"
            >
              点击领取
            </button>
            <button class="hero-btn hero-btn--disabled" v-else disabled>
              {{ data.get_status_text || '暂不可领取' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 取数失败的出口（M13）：不把后端故障渲染成一张空券卡 + 「暂无适用商品」 -->
    <u-empty
      v-if="!loading && failMsg"
      icon="/static/image/empty.png"
      width="70"
      height="70"
      :text="failMsg"
    />

    <!-- 推荐商品：券卡版式走 tz-course 自带的 round 档（10px 圆角），与券详情页（receive）同一写法。
         这一段按后端 recommend_goods_status 判（v-if），骨架档不预留 -->
    <template v-if="!loading && data.recommend_goods_status == 1 && data.goods && data.goods.length > 0">
      <tz-title title="推荐商品" bgColor="none" :more="false" />
      <tz-box bgColor="none">
        <tz-course :list="data.goods" :border="false" :round="true" type="diallel" />
      </tz-box>
    </template>

    <template v-else-if="!loading && !failMsg">
      <u-empty icon="/static/image/empty.png" width="70" height="70" :text="data.recommend_goods_status == 3 ? '暂无推荐商品' : '暂无适用商品'"/>
    </template>

    <!-- 分享弹窗：券的分享落点是 receive 页（后端 Links coupon → /pages/app/coupon/receive/receive） -->
    <share-modal
      :visible="shareVisible"
      type="coupon"
      :val="pageParams.id"
      :title="data.name || '优惠券'"
      @close="shareVisible = false"
    />

    <tz-tab-bar />
    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
