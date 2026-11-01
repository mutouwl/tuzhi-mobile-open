<template>
    <view class="school-page school-page--bar">
        <!-- 初始化骨架屏 -->
        <view class="skeleton-page" v-if="skeletonLoading">
            <view class="pd-sk-banner"></view>
            <view class="school-sk-card">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="60%" title-height="20" :rows="1" rows-width="40%" rows-height="16" />
                <u-skeleton class="sk-gap" :loading="true" :animate="true" :title="false" :rows="1" rows-width="45%" rows-height="22" />
            </view>
            <view class="school-sk-card">
                <view class="sk-cell" v-for="i in 2" :key="i">
                    <u-skeleton :loading="true" :animate="true" :title="true" title-width="25%" title-height="14" :rows="1" rows-width="50%" rows-height="14" />
                </view>
            </view>
            <view class="school-sk-card">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="16" :rows="3" rows-width="100%" rows-height="12" />
            </view>
        </view>
        <template v-else>
        <template v-if="!missing && !loadError">
            <view class="banner-wrap gbd-anchor">
                <swiper class="banner" indicator-dots circular autoplay>
                    <swiper-item v-for="(b, i) in form.banners" :key="i">
                        <image class="pd-banner-img" :src="b.url || b" mode="aspectFill" />
                    </swiper-item>
                </swiper>
                <tz-group-buy-danmu v-if="gbBuyers.length" :buyers="gbBuyers" overlay />
            </view>
            <view class="school-head">
                <view class="name">{{ form.name }}</view>
                <view class="balance" v-if="salesBalanceTag">{{ salesBalanceTag }}</view>
                <view class="tags"><text class="tag" v-for="(t, i) in form.tags" :key="i">{{ t }}</text></view>
                <!-- 拼团价横幅回拼团区（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner 下面，
                     也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」）：
                     横幅与玩法、凑团列表在下面那张卡里连着排，拼团进行中本卡价格行收起（第五轮）。
                     横幅以下**不再补任何小字**（2026-10-29 用户点名「pd-gb-lessons 这个又是从哪里冒出来的呀？」）：
                     上一版自作主张把「/ N 课时」折成横幅下方一行，已删；课时回到「选择套餐」弹层里看） -->
                <view class="price" v-if="gbPriceShown"><text class="rmb">￥</text><text class="num">{{ minPrice }}</text> / {{ totalLessons }}课时</view>
            </view>
            <!-- 拼团区（2026-10-28 用户点名「教务套餐也要能拼团」；2026-10-29 用户点名它排错位置了：
                 「你这个拼团的消息卡怎么放在教师下面了？你应该放在这个价格下面呀，或者直接把这个价格给覆盖掉呀」）。
                 落点与其它八类商详页同一档：**压在价格卡（这里 `.school-head`）正下方**，规格/介绍/教师/校区都在它后面。
                 2026-10-30 起横幅回到本卡第一行（与玩法/凑团连成一块），宿主的 `hide-banner` 随本轮删净；
                 `v-if` 挂 `form.id`（首屏是 0/空 → 不带 0 去取数），`goods-id` 是**套餐 id**
                 （规格由活动逐档设价、学员在凑团弹层里选），后端 goodsArea 按套餐查进行中的活动。
                 **`host-order`（2026-10-30 用户点名「拼团也要进确认报名页」）**：`@order` 收到拼团上下文后
                 先进本页自己的确认报名页（校区 + 上课学生），那一页确认完再带同一组 `gb_*` 键进结算页 -->
            <tz-group-buy-area v-if="form.id" ref="gbArea" goods-type="school_package" host-spec host-order hide-danmu
                :goods-id="form.id"
                :join-team="gbJoinCtx ? gbJoinCtx.teamId : 0"
                :join-activity="gbJoinCtx ? gbJoinCtx.activityId : 0"
                :join-goods-id="gbJoinCtx ? gbJoinCtx.goodsId : 0"
                :join-spec="gbJoinCtx ? gbJoinCtx.specId : 0"
                :join-ladder="gbJoinCtx ? gbJoinCtx.ladderId : 0"
                :join-price="gbJoinCtx ? gbJoinCtx.price : 0"
                @pick-spec="openGbSpec" @go-pay="gbGoPay" @ready="gbReady" @order="onGbOrder" />
            <view class="school-cell-card">
                <view class="school-cell-item" @click="openSkuPicker">
                    <view class="school-cell-label">选择套餐</view>
                    <view class="school-cell-value">
                        <text class="school-cell-value-text" :class="{ 'cell-placeholder': !currentSku.name }">{{ currentSku.name || '请选择套餐' }}</text>
                    </view>
                    <view class="school-cell-arrow"><tz-icon name="enter" color="#86909C" :size="13" /></view>
                </view>
            </view>
            <!-- 课程介绍：区块标题统一用 tz-title（与校区/教师详情页同款 50px 标题条 + 更多），卡片为全幅白卡（12px 上下间距、无圆角，对齐实物商品详情页卡片口径） -->
            <view class="school-block">
                <tz-title title="课程介绍" :more="false" />
                <tz-box padding="0 15px 15px">
                    <tz-parse v-if="courseIntroduction" :content="courseIntroduction" />
                    <u-empty v-else icon="/static/image/empty.png" width="70" height="70" text="暂无课程介绍" />
                </tz-box>
            </view>
            <!-- 教师：最多展示三个，超出后由标题右侧「更多」弹出教师列表弹窗（卡片共用 tz-school-teacher） -->
            <view class="school-block" v-if="form.teachers && form.teachers.length">
                <tz-title title="教师" :more="form.teachers.length > 3" subtitle="更多" @click="teacherPopup = true" />
                <tz-box padding="0 15px 15px">
                    <tz-school-teacher :list="form.teachers.slice(0, 3)" />
                </tz-box>
            </view>

            <!-- 校区：展示套餐可上课校区列表，卡片用共用组件 tz-campus，封面边长/间距一律走组件默认值（与校区列表页同一张卡） -->
            <view class="school-block" v-if="form.campus_list && form.campus_list.length">
                <tz-title title="可上课校区" :more="false" />
                <tz-box padding="0 15px 15px">
                    <tz-campus :list="form.campus_list" @click="goCampus" />
                </tz-box>
            </view>
        </template>
        <!-- 套餐不存在/已下架：空状态；其他异常：失败提示 -->
        <view class="empty-wrap" v-else>
            <u-empty icon="/static/image/empty.png" width="70" height="70" :text="emptyText" />
        </view>
        </template>
        <!-- 底栏：拼团入口与「立即报名」并排（2026-10-29 用户点名「中间没有间隔，也不是等宽」）。
             两件都归容器/宿主管：
              ① 项与项的间距只由容器 `gap` 给（硬约束 20）——原先容器没有 gap，两枚贴死；
              ② 小程序端父级布局里的 flex 项是 `<tz-group-buy-btn>` 的**宿主节点**，子组件根上的
                 `flex:1` 到不了宿主（M73）⇒ 入口按内容收缩、「立即报名」吃掉剩余宽度；
                 宿主 class `pd-gb-slot` + 页面样式表那条 `flex:1` 才是等分的那一份（H5 没有宿主节点，
                 class 并到组件根上，同一套值，看不出差别）；
              ③ `v-if="gbEntry"` 挂在宿主标签上：没有进行中的活动时整枚宿主不渲染，否则 MP 端那枚
                 空宿主仍占着 `flex:1` 的半个栏宽。 -->
        <view class="school-footer pd-footer h5-bottom-bar" v-if="!skeletonLoading && !missing && !loadError">
            <tz-group-buy-btn v-if="gbEntry" class="pd-gb-slot" :text="gbEntry ? gbEntry.text : ''" :price="gbEntry ? gbEntry.price_text : ''" @open="openGb" />
            <!-- 我在这一场拼团里已有进行中的团（`gbInTeam`）→ 「立即报名」收起（PRD 2026-10-27）：
                 底栏只留「查看拼团详情」这一个出口，不留一枚点了会被后端拒的死按钮 -->
            <u-button class="pd-buy-btn" type="primary" text="立即报名" @click="buy" v-if="!gbInTeam && !gbJoinMode"></u-button>
        </view>

        <!-- 选套餐弹层（参照实物商品规格弹窗；校区选择一并收入弹层内、置于选择套餐上方）
             `in-team`（2026-10-30）：底栏「立即报名」收起只是把入口藏起来，「选择套餐」这一行照样
             点得开、弹层里照样能下原价单——用户点名「这应该是一个逻辑漏洞」。弹层照开（套餐权益 /
             校区只有这里看得见），确认按钮由 `inTeamBlocked` 换成禁用态并写原因。
             参团中那一趟也带活动（同组合商品）：弹层按拼团态画价与人数档，按钮仍是禁用 + 原因 -->
        <package-sku-select-modal
            :show="skuPopup"
            :package-info="form"
            :campus-list="form.campus_list"
            :campus.sync="activeCampus"
            :value.sync="activeSku"
            :gb="(gbPicking || gbInTeam) ? gbActivity : null"
            :in-team="gbInTeam"
            @confirm="confirmSku"
            @close="closeSkuPopup"
        />

        <!-- 教师列表弹窗（超出三个时展示全部，参照校区详情页） -->
        <u-popup :show="teacherPopup" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="teacherPopup = false">
            <view class="school-popup pd-popup">
                <view class="school-popup-title">教师列表</view>
                <tz-popup-list padding="4px 0 8px" :refreshable="false">
                    <!-- 弹窗内的老师与页面上的教师卡片同样可点进教师详情（navigate 默认开启） -->
                    <tz-school-teacher :list="form.teachers" />
                </tz-popup-list>
            </view>
        </u-popup>

        <tz-hover-btn />
        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
