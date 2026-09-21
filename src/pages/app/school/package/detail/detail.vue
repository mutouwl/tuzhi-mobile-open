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
            <view class="banner-wrap">
                <swiper class="banner" indicator-dots circular autoplay>
                    <swiper-item v-for="(b, i) in form.banners" :key="i">
                        <image class="pd-banner-img" :src="b.url || b" mode="aspectFill" />
                    </swiper-item>
                </swiper>
            </view>
            <view class="school-head">
                <view class="name">{{ form.name }}</view>
                <view class="balance" v-if="salesBalanceTag">{{ salesBalanceTag }}</view>
                <view class="tags"><text class="tag" v-for="(t, i) in form.tags" :key="i">{{ t }}</text></view>
                <view class="price"><text class="rmb">￥</text><text class="num">{{ minPrice }}</text> / {{ totalLessons }}课时</view>
            </view>
            <view class="school-cell-card">
                <view class="school-cell-item" @click="skuPopup = true">
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
                    <rich-text v-if="courseIntroduction" :nodes="courseIntroduction" />
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
        <view class="school-footer h5-bottom-bar" v-if="!skeletonLoading && !missing && !loadError">
            <u-button class="pd-buy-btn" type="primary" text="立即报名" @click="buy"></u-button>
        </view>

        <!-- 选套餐弹层（参照实物商品规格弹窗；校区选择一并收入弹层内、置于选择套餐上方） -->
        <package-sku-select-modal
            :show="skuPopup"
            :package-info="form"
            :campus-list="form.campus_list"
            :campus.sync="activeCampus"
            :value.sync="activeSku"
            @confirm="confirmSku"
            @close="skuPopup = false"
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
