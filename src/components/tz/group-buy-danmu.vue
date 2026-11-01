<template>
    <!--
      购买弹幕（2026-10-27 首版；2026-10-29 由用户点名「gba-danmu 应该放在这个页面的左上角，
      也就是封面图片/轮播图片的左上角」从拼团区白块里提出来，成为独立一枚组件）。

      两个落点、同一份实现（硬约束 11）：
        - **拼团区原位**（`group-buy-area.vue`，缺省形态）：其余八类商详页仍压在拼团区白块的
          第一行，`overlay` 缺省 false，版式与 2026-10-27 那一版逐字相同；
        - **宿主封面上**（`pages/course/detail/detail.vue`，2026-10-29）：课程商详把本组件挂在
          `.cd-media`（`position: relative`）里、传 `overlay`，由组件自己落到封面左上角
          （`top:44px; left:15px`，左右与页面 15px 的出血对齐；上沿 2026-10-30 由 12 让到 44，
          见 `.gba-danmu--cover` 那段）。宿主同时给拼团区传
          `hide-danmu`，两处不会各出一枚。

      素材只读后端 `buyers`（已支付成员，昵称由 `TeamPage::mask()` 脱敏、无 user_id）：
      前端不再脱敏、也不自己判「谁能上榜」。3 秒换一条，只有一条时不转。
      定时器按硬约束 23 收口：销毁标记 + 每一跳先判，不往已出栈页面写数据。
    -->
    <view class="gba-danmu" :class="{ 'gba-danmu--cover': overlay }" v-if="buyer">
        <image class="gba-danmu-avatar" :src="buyer.avatar" mode="aspectFill" />
        <text class="gba-danmu-text" :key="index">{{ buyer.nickname }}购买了本商品</text>
    </view>
</template>

<script>
/** 一条停留时长（毫秒）：与原拼团区那一版一致 */
const ROTATE_MS = 3000;

export default {
    name: 'GroupBuyDanmu',
    props: {
        /** 后端 `buyers`：`[{ nickname, avatar }]`，已脱敏；空数组 ⇒ 整枚不出 */
        buyers: { type: Array, default: () => [] },
        /** 压在宿主封面左上角（默认 false = 拼团区原位那一档，带 8/15 外边距） */
        overlay: { type: Boolean, default: false },
    },
    data() {
        return {
            index: 0,
            timer: null,
        };
    },
    computed: {
        rows() {
            return this.buyers || [];
        },
        buyer() {
            const rows = this.rows;
            if (!rows.length) { return null; }
            return rows[this.index % rows.length];
        },
    },
    watch: {
        /** 重取 / 到期收掉都会整份换掉 `buyers`：下标归零，轮播按新素材重来 */
        buyers() {
            this.index = 0;
            this.startTimer();
        },
    },
    mounted() {
        this.startTimer();
    },
    beforeDestroy() {
        this.clearTimer();
    },
    beforeUnmount() {
        this.clearTimer();
    },
    methods: {
        /** 3 秒换下一条（只有一条时不转；空列表直接不转）。
         *  已销毁闸门（硬约束 23）读 Vue 实例自带的 `_isDestroyed`：`_` 开头的数据键不会被代理到
         *  `this` 上，写进 data 反而是一枚永远为 undefined 的判据。 */
        startTimer() {
            this.clearTimer();
            if (this.rows.length <= 1) { return; }
            const that = this;
            this.timer = setInterval(function tick() {
                if (that._isDestroyed) { that.clearTimer(); return; }
                that.index = (that.index + 1) % that.rows.length;
            }, ROTATE_MS);
        },
        clearTimer() {
            if (this.timer) { clearInterval(this.timer); this.timer = null; }
        },
    },
};
</script>

<style scoped>
/* 深色半透明胶囊：压在白卡或封面图上都不抢横幅的红橙主色 */
.gba-danmu {
    display: inline-flex;
    align-items: center;
    margin: 8px 15px;
    padding: 3px 10px 3px 3px;
    border-radius: 4px;
    background: rgba(29, 33, 41, 0.72);
}

/* 封面左上角落位（2026-10-29）：外层 `.cd-media` 是 relative，这里只负责贴角。
   `pointer-events: none` ⇒ 一枚纯播报，不许挡住封面/播放器的点击（封面本身可点开大图那类）。

   上沿 2026-10-30 由 12 让到 44（用户点名「这个位置有点太靠上了，如果在小程序上可能展示会被遮挡，
   可以再往下一些」）：这一格在各端都压在页面最上（H5 本页 `titleNView:false`、没有标题栏；
   小程序端封面紧贴原生导航栏下沿），`12` 就贴在封面上沿往里 12px 处，离屏顶太近、
   在小程序上容易被顶部那一带压住。`44` = 非刘海机状态栏的高度，两端同一值（§1：只用 px、
   不用 rpx，也不按端分档、不叠 `env(safe-area-inset-top)`——小程序端页面本来就在导航栏下沿，
   再叠就是二次让位），让过这一档后落点仍在封面左上那一片。 */
.gba-danmu--cover {
    position: absolute;
    top: 44px;
    left: 15px;
    z-index: 6;
    margin: 0;
    max-width: calc(100% - 30px);
    pointer-events: none;
}

.gba-danmu-avatar {
    width: 22px;
    height: 22px;
    margin-right: 6px;
    border-radius: 50%;
    background: #fff;
    flex: none;
}

.gba-danmu-text {
    max-width: 220px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #fff;
    font-size: 12px;
    line-height: 18px;
    animation: gbaDanmuIn 0.35s ease;
}

@keyframes gbaDanmuIn {
    from { transform: translateY(6px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}
</style>
