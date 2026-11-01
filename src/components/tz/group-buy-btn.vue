<template>
    <!--
      商详页「拼团」入口（M-P1）——**与送好友同构**（`send-friend-area.vue` 的 scene 形态先例）：
      一枚吃 `text` 的按钮，由宿主页塞进 `tz-bottom-btn` 的 `order-extra` 插槽，排在购买按钮左侧
      （竞品 07 图那一条：售卖 + 发起拼团；送好友入口 2026-10-27 已收进商详信息卡的长条，不占这一格）。

      为什么是独立组件 + 插槽，而不是底栏组件里的 props：
        `tz-bottom-btn` 是共用底栏，插件入口长什么样应该由**插件自己的组件**决定
        （送好友先例，M45 已入册）；底栏只提供「加性具名插槽」，不认识任何插件。

      props: `text`（宿主页从拼团区 `@ready` 接到的摘要，如「立即开团 / 即将开团 / 查看拼团详情」；空串不渲染）
      emits: `open`（**非原生名**，硬约束 27①）——宿主接它就地开凑团弹层。

      两条纪律：
       ① 根节点 `flex:1 + min-width:0`：`.box` 这条 flex 里 slot 内容就是 flex 项，
          不给它 flex 权重它按内容收缩（tz-button/u-button 那套「fit-content 缩成一点」的同族坑）；
       ② 按钮本体走 `u-button`（4px 圆角档，M17），**底色取商详拼团横幅那一条红橙渐变**
          （`linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)`，与 `group-buy-banner.vue` 的
          `.gba-banner` 逐字同值；2026-10-27 用户点名「立即开团按钮要尽量跟 gba-banner
          一致」）——同一场活动在拼团横幅与底栏读成同一套配色，不是红底配橙条。
          u-button 的 `color` 支持传渐变色串（`baseColor` 里识别 `gradient` ⇒ 置
          `backgroundImage`、隐边框、文字转白），不必 `::v-deep` 穿进去改（M12）。
          原先的纯色 `#f53f3f` 已撤，不留第二处色值。
    -->
    <view class="gbb-entry" v-if="text" @click="open">
        <!-- 两行：动作 + 拼团价（2026-10-28 参照小鹅通活动/实物/会员卡三张图 ——
             「立即开团」在上、「¥1」在下）。没给价时退回单行，课程那类只有活动价、按钮仍是一行。
             `disabled`（2026-10-31）：报名已截止这类宿主状态整枚置灰，与同栏主按钮同一档禁用观感
             （uview 的 `.u-button--disabled` 就是 opacity .5），点击不发声 -->
        <u-button :disabled="disabled" :customStyle="{ width: '100%', fontWeight: 600, height: height + 'px' }"
            color="linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)" class="custom-style">
            <view class="gbb-lines" :class="{ 'gbb-lines--two': price }">
                <text class="gbb-text">{{ text }}</text>
                <text class="gbb-price" v-if="price">{{ price }}</text>
            </view>
        </u-button>
    </view>
</template>

<script>
/**
 * 商详页「拼团」入口（M-P1，2026-10-16）
 *
 * 摘要数据住在 `group-buy-area` 组件里（`@ready` 上抛 { text } / null），宿主页只做转发——
 * 本组件不取数、不判插件装没装（摘要为空整枚不渲染；空摘要的四种来源：
 * 未装插件 / 无进行中活动 / 活动已结束 / 取数失败，前两者不该有按钮，后两者同）；
 * 点击事件交给宿主 `open`，由宿主调拼团区的 `openPopup()` 就地开弹层。
 */
export default {
    name: 'GroupBuyBtn',
    props: {
        /** 按钮动作文案（**不再拼价格**：价格单独一行，见 2026-10-28 那三张参照图） */
        text: { type: String, default: '' },
        /**
         * 拼团价文案（如「¥9.90」，已格式化好的串）：由拼团区的 `@ready` 载荷转发。
         * 空串 = 不摆第二行（老调用点/无价格档一个像素都不变）。
         */
        price: { type: String, default: '' },
        /**
         * 按钮高度（px）：与宿主底栏其它按钮同档。`tz-bottom-btn` / 打卡页那几条是 40，
         * 实物/组合/圈子三页底栏是 44（各自的 `.buy-btn` / `.footer-btn` 就写 44）——
         * 同一行里两枚按钮差 4px 是肉眼可见的参差，所以由宿主传自己的档位，组件不写死
         */
        height: { type: [Number, String], default: 40 },
        /**
         * 禁用（2026-10-31，加性、缺省 false）：宿主那一屏「这一单做不成了」的事实
         * （线下活动 = 报名已截止）直接落到这枚入口上 —— 与同栏主按钮同一枚判据、同一档禁用观感，
         * 点了不发声（宿主也不用在 `open` 里再补一层）。
         */
        disabled: { type: Boolean, default: false },
    },
    emits: ['open'],
    methods: {
        open() {
            // 禁用态连事件都不发：否则宿主 `openPopup()` 仍会开弹层（按钮灰着还能点开＝没做）
            if (this.disabled) { return; }
            this.$emit('open');
        },
    },
};
</script>

<style scoped>
/* 根节点是 .box 里的 flex 项：给足权重与收缩下限（见头注释①） */
.gbb-entry {
    flex: 1;
    min-width: 0;
}

.custom-style {
    width: 100%;
}

/* 一行 / 两行的排版都收在这里：底栏高 60、按钮 40（`.tbb-bar` 那一档），
   两行时上行 15px 600、下行 11px 90% 不透明，总行高 30 + 上下各 5 内衬正好 40，不把底栏撑高 */
.gbb-lines {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.gbb-lines--two {
    flex-direction: column;
    line-height: 1.1;
}

.gbb-text {
    font-size: 15px;
    font-weight: 600;
    color: #fff;
}

.gbb-price {
    margin-top: 1px;
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.95);
}
</style>
