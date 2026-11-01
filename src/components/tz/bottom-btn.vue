<template>
    <div>
        <div class="filler-box"></div>

        <view class="box control-box tbb-bar h5-bottom-bar" v-if="type == 'control'">
            <template>
                <!-- <div class="control-btn"  @click="$nav.to('/pages/index/index')">
                    <tz-icon name="homepage" color="#444" />
                    <div>首页</div>
                </div> -->
                <div class="control-btn" @click="collect">
                    <tz-icon name="collection_fill" v-if="params.iscollect" :customStyle="{ color: '#0968f6' }" color="#0968f6" />
                    <tz-icon name="collection" v-if="!params.iscollect" :customStyle="{ color: '#0968f6' }" color="#444" />
                    <div>收藏</div>
                </div>
                <div class="control-btn" @click="dir" v-if="params.column_id">
                    <div><tz-icon name="createtask" color="#444" /></div>
                    <div>目录</div>
                </div>

                <div class="control-btn" @click="comment" v-if="$tools.systemConfig('comment_entry_status') != 'close'">
                    <div><tz-icon name="editor" color="#444" /></div>
                    <div>评论</div>
                </div>

                <!-- 打卡入口只在「这门课（或其所属专栏）确实关联了上架活动」时出，显隐判据由调用页按接口
                     返回值给（params.checkin），未安装打卡插件时调用页根本不发请求，这里不再判一次 -->
                <div class="control-btn" @click="checkin" v-if="params.checkin">
                    <div><tz-icon name="tasklist" color="#444" /></div>
                    <div>打卡</div>
                </div>

                <div class="control-btn" @click="share">
                    <div><tz-icon name="share" color="#444" /></div>
                    <div>分享</div>
                </div>

                <!-- 插件区入口（加性具名插槽，缺省不渲染；2026-10-16 送好友：「已订阅」这一档挂这里，
                     与上面那枚「打卡」同一形态 —— 显隐仍只由插件那枚后端 flag 决定） -->
                <slot name="control-extra"></slot>
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>


        <view class="box tbb-bar box--peer-main h5-bottom-bar" v-if="type == 'order'">

            <template>
                <div class="icon" @click="$nav.to('/pages/index/index')">
                    <tz-icon name="homepage" color="#444" />
                </div>
                <div class="icon" @click="share">
                    <tz-icon name="share" color="#444" />
                </div>
                <div class="icon" @click="collect">
                    <!-- <u-button class="custom-style" style="border:none;padding-right: 30px;" :text="'收藏'"
                    @click="handle"></u-button> -->
                    <tz-icon name="collection_fill" v-if="params.iscollect" color="#F53F3F" />
                    <tz-icon name="collection" v-if="!params.iscollect" color="#444" />
                </div>

                <!-- 插件区入口（加性具名插槽，缺省不渲染；2026-10-16 送好友与拼团两个入口都收进
                     这一条：各自一枚独立组件塞进来 —— 底栏只提供插槽，不认识任何插件） -->
                <slot name="order-extra"></slot> 

                <!-- #ifdef MP-WEIXIN -->
                <u-button :customStyle="mainBtnStyle" :disabled="disabled" class="custom-style"
                    v-if="!hideMain && (params.is_virtual_pay || $tools.systemConfig('wx_mp_ban_pay') == 'close' || platform != 'ios')" type="primary"
                    :text="btnTitle ? btnTitle : '立即订阅'" @click="handle"></u-button>
                <u-button :customStyle="mainBtnStyle" :disabled="disabled" class="custom-style" v-else-if="!hideMain" type="primary"
                    text="不支持IOS端支付" disabled></u-button>
                <!-- #endif -->

                <!-- #ifdef MP-TOUTIAO -->
                <u-button :customStyle="mainBtnStyle" :disabled="disabled" class="custom-style"
                    v-if="!hideMain && ($tools.systemConfig('dy_mp_ban_pay') == 'close' || platform != 'ios')" type="primary"
                    :text="btnTitle ? btnTitle : '立即订阅' + platform" @click="handle"></u-button>
                <u-button :customStyle="mainBtnStyle" :disabled="disabled" class="custom-style" v-else-if="!hideMain" type="primary"
                    text="不支持IOS端支付" disabled></u-button>
                <!-- #endif -->

                <!-- #ifdef H5 -->
                <u-button :customStyle="mainBtnStyle" :disabled="disabled" class="custom-style" type="primary"
                    v-if="!hideMain" :text="btnTitle ? btnTitle : '立即订阅'" @click="handle"></u-button>
                <!-- #endif -->
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>

        <view :class="['box', 'tbb-bar', 'h5-bottom-bar', { 'tbb-bar--sf': theme == 'send-friend', 'tbb-bar--gb': theme == 'group-buy' }]" v-if="type == 'submit'">
            <template>
                <div class="price">
                    <!-- 送好友那一档（图1）只留「¥ + 金额」、金额放大；普通下单页仍是「合计: ¥x」 -->
                    <span class="total-text" v-if="theme != 'send-friend'">合计:</span>
                    <span class="unit" v-if="!params.is_virtual_pay">¥</span><span class="value">{{ params.price }}</span><span class="unit" v-if="params.is_virtual_pay">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                </div>

                <!-- #ifdef MP-WEIXIN -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    v-if="params.is_virtual_pay || $tools.systemConfig('wx_mp_ban_pay') == 'close' || platform != 'ios'"
                    :text="btnTitle ? btnTitle : '立即支付'" @click="handle"></u-button>
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" v-else type="primary"
                    text="暂不支持支付" disabled></u-button>
                <!-- #endif -->

                <!-- #ifdef MP-TOUTIAO -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即支付'" @click="handle"></u-button>
                <!-- #endif -->

                <!-- #ifdef H5 -->
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即支付'" @click="handle"></u-button>
                <!-- #endif -->


            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>

        <view class="box tbb-bar h5-bottom-bar" v-if="type == 'evaluate'">
            <template>
                <u-button :customStyle="{ width: '100%' }" :disabled="disabled" class="custom-style" type="primary"
                    :text="btnTitle ? btnTitle : '立即评价'" @click="handle"></u-button>
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>

        <view :class="['box', 'tbb-bar', 'box--peer-main', 'h5-bottom-bar', { 'tbb-bar--gb': theme == 'group-buy' }]" v-if="type == ''">
            <template>
                <!-- 插件区入口（加性具名插槽：练习详情页的拼团入口走这一支，与 order 档同一份口径） -->
                <slot name="order-extra"></slot>
                <u-button :customStyle="mainBtnStyle" :disabled="disabled" class="custom-style" type="primary"
                    v-if="!hideMain" :text="btnTitle ? btnTitle : '立即评价'" @click="handle"></u-button>
            </template>
            <!-- #ifdef MP-TOUTIAO -->
            <u-safe-bottom></u-safe-bottom>
            <!-- #endif -->
        </view>
        <!-- #ifndef MP-TOUTIAO -->
        <u-safe-bottom></u-safe-bottom>
        <!-- #endif -->
    </div>
</template>

<script >

var that;
export default {
    data() {
        return {
            platform: ''
        }
    },
    computed: {
        /**
         * 主按钮的内联样式（2026-10-31 活动详情页「立即报名接近百分百、立即开团只剩 10px」）。
         *
         * **小程序端 u-button 是 virtualHost**：渲染出来直接是内部 `<button>`，组件标签上的
         * `class="custom-style"` 不会落到它身上（实测 WXML 里那枚 button 只有 u-button 自己的类），
         * 底栏的 wxss 也进不去 u-button 内部 —— 于是 `.box--peer-main .u-button{flex:1}` 与
         * `.box--peer-main .custom-style{...}` 两条规则在本端都落空；按钮只剩 uview 自己的
         * inline `width:100%`，flex-basis 就是整条栏宽，同栏 basis 0 的拼团入口被压成 0。
         *
         * 唯一可靠的落点是 uview 的 `customStyle`：它直接写成内部根节点的 inline style。
         * `flex: 1 1 0` 的 basis 会盖掉同一条 inline style 里的 `width:100%`（flex 布局按 basis 算，
         * width 只在非 flex 容器里生效）。H5 侧这条 inline 与 `.u-button{flex:1}` 同值，不冲突。
         *
         * **submit / evaluate 两支不要这一档**：submit 的 `.price` 是定宽 400px，给主按钮
         * `flex:1 1 0` 会把它压成 0（与 2026-10-16 那条同一个坑，底栏 `.box--peer-main` 只挂
         * order 与空档两支正是为此）。
         */
        mainBtnStyle() {
            if (this.type === 'order' || this.type === '') {
                return { width: '100%', flex: '1 1 0', minWidth: 0 };
            }
            return { width: '100%' };
        },
    },
    props: {
        btnTitle: {
            type: String,
            default: ''
        },
        type: {
            type: String,
            default: ''
        },
        /**
         * 配色档：'' = 全站既有那一档（主色蓝）；'send-friend' = 送好友提交页那一档（深钢蓝 + 只放金额）；
         * 'group-buy' = 拼团提交页那一档（红橙渐变，与 `tz-button theme="group-buy"` 逐字同值）。
         * 生效范围是 `type == 'submit'`（提交页底栏）与 `type == ''`（`form-modal` 那只确认条，
         * 2026-10-31 拼团报名信息弹层要用同一档）；别处传了也不改任何东西。
         */
        theme: {
            type: String,
            default: ''
        },
        /**
         * 隐藏主购买按钮（2026-10-27 用户点名「如果我当前正在拼团，那么是不能再购买的。
         * 也就是说，详情页不要再显示单独购买按钮了」）：
         * 学员在这一场拼团里**有进行中的团**时，商详页只留拼团入口那枚「查看拼团详情」，
         * 「立即订阅 / 立即支付」连同 iOS 那枚「不支持IOS端支付」的替代按钮一起收起。
         * **只收主按钮**：底栏外壳、首页/分享/收藏图标与插件插槽照旧渲染（插件入口本身就是出口）。
         * 只在 `order` 与空档（`''`，练习详情页那一支）生效 —— 其余档没有插件插槽，传了也不改任何东西。
         */
        hideMain: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        params: {
            type: Object,
            default: (ret) => {
                return {
                    iscollect: false
                }
            }
        }
    },

    mounted() {
        // 平台判定只吃这一枚（`platform != 'ios'` 那两条支付闸门用它）。
        // **`uni.getSystemInfoSync()` 已废弃**（微信基础库 2.02.2609232 / lib 3.17 起，
        // 控制台会打一条 `wx.getSystemInfoSync is deprecated`；2026-10-29 用户贴的崩溃栈里
        // 这一帧正好是 `mounted @ bottom-btn`）：新口径是 `getDeviceInfo`，
        // 本仓 uni-app 版本在 MP 端已经代理了这个口（`@dcloudio/uni-mp-weixin` 的 API 白名单里有
        // `getDeviceInfo`）。老版本没有这个口时回落老 API，再不行按「取不到平台」处理 ——
        // **不许因为一次平台探测把底栏挂载打断**（挂了底栏不渲染，整页就少一条主按钮）。
        let platform = '';
        try {
            const info = typeof uni.getDeviceInfo === 'function'
                ? uni.getDeviceInfo()
                : uni.getSystemInfoSync();
            platform = (info && info.platform) || '';
        } catch (e) {
            platform = '';
        }
        this.platform = platform;
    },
    methods: {
        collect() {
            this.$emit('collect', false);
        },
        dir() {
            this.$emit('dir', false);
        },
        share() {
            this.$emit('share', false);
        },
        handle() {
            this.$emit('handle', false);
        },
        comment() {
            this.$emit('comment', false);
        },
        checkin() {
            this.$emit('checkin', false);
        }
    }
}

</script>

<style>
.box {
    position: fixed;
    bottom: 0;
    left: 0;

    width: calc(100%);
    /* height: 50px; */
    /* width: 100%; */

    padding: 10px 10px 10px;

    background-color: #fff;
    box-shadow: 0 0 8px 0 rgb(0 0 0 / 8%);

    display: flex;
    justify-content: space-between;

    align-items: center;

    z-index: 10;

    box-sizing: border-box;

    /*  #ifdef  MP-WEIXIN  */
    /* 微信小程序端：底部安全区按设计加半（iPhone X 约 17px），按钮不直贴屏底、
    也不过高；抖音端已由各 box 内 u-safe-bottom 处理全量安全区，此处不再叠加 */
    padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
    padding-bottom: calc(env(safe-area-inset-bottom) / 2);
    /*  #endif  */
}

/* ⚠ 本文件的样式块没有 scoped，`.box` 是**全站共用类名**（`comment/evaluate.vue`、`video.vue`、
   `tz/title.vue` 等十几处都叫 `.box`），所以 gap 不能挂在裸 `.box` 上 —— 那会给全站每一处
   `.box` 都塞 10px 间距。这里用底栏自己那一枚 `tbb-bar`（五条分支各带一枚）收口。
   为什么行内间距要走容器 gap（硬约束 20）：原先按项写 `margin: 0 5px`，而插件入口是 `<view>`
   （H5 编译成 `uni-view`）、匹配不到 `.box > div` ⇒「送好友 / 拼团」那两枚与左右邻居落在
   0 间距上（用户 2026-10-16 早先问过「间距大小你觉得合适吗」）；改 gap 后图标↔图标、
   图标↔插件入口、插件入口↔主按钮一律 10px，与改造前图标之间那一档逐值相同。
   五条分支都要：`control`（5~6 枚同排）、`order`（图标 + 插件入口 + 主按钮）、
   `submit`（价格 + 主按钮，撤了按项 margin 后这一档只剩 gap 一处给间距）、
   空档（插件入口 + 主按钮）；`evaluate` 只有一枚按钮、gap 无影响。 */
.tbb-bar {
    gap: 10px;
}

/* 带插件入口的那两条（`order` 与空档）：主按钮与插件入口**等分剩余宽度**。
   不这么写就是「主按钮 flex-basis = width:100%、容器没有剩余空间 ⇒ flex:1（basis 0）的
   插件入口被压成 0 宽」，2026-10-16 用户点名「立即按钮把拼团按钮覆盖掉了」即此。
   参照页三处同款：实物商详 `.detail-tabbar{gap:10px} + .buy-btn{flex:1}`、
   圈子 `.footer-btn-group{gap:10px} + .footer-btn{flex:1}`、打卡 `.cdi-main-btn{flex:1}` */
.box--peer-main .u-button {
    flex: 1 1 0;
    min-width: 0;
}

/* ⚠ 小程序端（2026-10-31 实测）u-button 是 **virtualHost**：组件标签不产生宿主节点，渲染出来
   直接是组件内部的 `<button>`；调用点写的 `class="custom-style"` 不会落到它身上（WXML 里那枚
   button 只有 u-button 自己的类），底栏 wxss 也进不去 u-button 内部。所以 `.u-button` 与
   `.custom-style` 两条在本端都够不着 —— 按钮只剩 uview 自己的 inline `width:100%`，
   flex-basis 就是整条栏宽，同栏 basis 0 的拼团入口被压成 0（2026-10-31 用户点名
   「立即报名接近百分百、立即拼团只剩 10px」；2026-10-16「立即按钮把拼团按钮覆盖掉了」同一族）。
   **本端的正解在模板的 `customStyle` 上**：`mainBtnStyle`（inline `flex:1 1 0; min-width:0`，
   flex-basis 会盖掉同一条 inline 的 `width:100%`），见 script 里的 computed。
   这一条保留作**老基础库（virtualHost 不可用）**的兜底：那时 u-button 有宿主、class 落得上，
   宿主档在这里生效；H5 侧这条也命中子组件根节点，与 `.u-button` 同值。 */
.box--peer-main .custom-style {
    flex: 1 1 0;
    min-width: 0;
}

/* ⚠ 插槽里的插件入口（拼团 `.tbb-slot` / 送好友 `.sf-control-slot`）的宽度**不在这张表里**：
   这两条规则写在本文件是**死的**，两个端各死一次 ——
     · 小程序端：这一行的 flex 项是自定义组件的**宿主节点**（页面所有），底栏组件的 wxss 受组件
       样式隔离，选择器到不了宿主（`.gbb-entry` / `.sfa-entry` 写在子组件根上同样到不了）；
     · H5 端：uni-app 把组件样式自动 scoped，`.control-box .sf-control-slot[data-v-底栏]` 要求
       子组件根带上**底栏的** scope id，而插槽内容是页面渲染的（只带页面的 scope id）⇒ 不命中。
   于是「送好友」那枚按内容收缩、同栏三兄弟等分，用户读到的就是「底部操作栏四个按钮不等宽」
   （2026-10-29 第三次点名同一处：先三行字、再占一半、再不等宽）。
   正确落点是**全局样式表 `src/App.vue`**（`app.wxss` / 全局 CSS 两端都够得着，
   见那里 `.sf-control-slot, .tbb-slot { flex: 1 1 0; min-width: 0 }`）；
   调用点仍负责在组件标签上点出这两个 class（它们是宿主/根节点上唯一能被全局选中的抓手）。
   ⇒ 别再把宽度规则搬回本文件，搬回来一次就等于再坏一次（`frame.md` 硬约束 45）。 */

.filler-box {
    width: 100%;
    height: 60px;
    background: none;
}

.price {
    font-weight: 600;
    font-size: 22px;
    color: #f53f3f;

    line-height: 40px;

    width: 400px;
}

.price .total-text {
    font-weight: 400;
    font-size: 14px;
    color: #1D2129;
    
}

.price .unit {
    font-weight: 400;
    font-size: 16px;
    margin-right: 2px;
    margin-left: 4px;
}

/* 送好友档（2026-10-27 图1）：价格只留「¥ + 金额」、金额放大、主按钮换深钢蓝。
   按钮圆角仍吃 u-button 的 4px —— 图里那枚大圆角不照抄（硬约束 12：按钮只有 tz-button/u-button 的 4px） */
.tbb-bar--sf .price {
    font-size: 20px;
    font-weight: 600;
    color: #F53F3F;
}

.tbb-bar--sf .price .unit {
    margin-left: 0;
    margin-right: 2px;
    font-size: 13px;
    font-weight: 400;
}

.tbb-bar--sf .u-button {
    background-color: #004C8B !important;
    border-color: #004C8B !important;
}

/* 拼团档（2026-10-30 用户点名「如果说是拼团的订单，那么下面立即支付按钮也应该是拼团的红橙主题色」）：
   底色取 `tz-button theme="group-buy"` 与商详底栏「立即开团」那一条
   `linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)`，逐字同值；圆角仍吃 u-button 的 4px（M17）。
   送好友档与普通档的蓝底一字不动 —— 只认 `theme == 'group-buy'` 这一枚显式传参。 */
.tbb-bar--gb .u-button {
    background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%) !important;
    border-color: transparent !important;
}


.dir-btn {
    width: 100%;
    text-align: center;
    font-size: 12px;

    padding-bottom: 10px;
}


.control-box {
    justify-content: center;
}

/* 控制栏（已订阅那一档）里的每一枚入口**一律等分**：宽度由 flex 给，不写百分比。
   ① 百分比是「按这一栏有几枚」写死的：`24%` 是四枚那一档的数，来了目录/打卡变成五、六枚时
      一定超宽（4×24% + 3×10px gap 已经比一栏宽），只能靠 shrink 硬压；
   ② 插件入口（送好友）那一枚的宽度规则够不着本组件的样式表（见上方那段注释），
      它的 flex 落在 `App.vue` 的全局 `.sf-control-slot` 上；两边都写 `1 1 0` 才真的等宽 ——
      `width:24%` 与 `flex:1` 混用，basis 不同，收缩后还是不等宽（2026-10-29 用户点名
      「又是收藏、评论、分享、送好友，四个按钮为什么不能等宽」）。
   `min-width:0` 让三字标签（送好友）能跟两字标签一样被压到同一档，不按内容反撑。 */
.control-btn {
    flex: 1 1 0;
    min-width: 0;
    text-align: center;
    font-size: 12px;
    color: #888;
}

.custom-style {
    width: 100%;
}
</style>
