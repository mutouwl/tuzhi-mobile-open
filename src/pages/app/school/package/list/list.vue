<template>
    <view class="school-page">
        <!-- 吸顶区与订单列表 /pages/order/list/list 同款：搜索栏 + 裸 u-tabs（组件默认配色，不做页面级覆写） -->
        <u-sticky bgColor="#fff" style="padding-bottom: 2px;" :offsetTop="0">
            <view class="school-search-box">
                <u-search placeholder="搜索课程名称" shape="square" :showAction="false" v-model="keyword" @search="refresh" bgColor="#f5f5f5"></u-search>
            </view>
            <u-tabs :list="cats" :current="activeCatIndex" :scrollable="true" @change="tabsHandle"></u-tabs>
        </u-sticky>
        <view class="school-cards">
            <!-- 骨架屏只在「加载中且列表为空」时出现（与教务我的预约列表 booking/list 同一口径）：
                 切分类/搜索是换内容不是首次进页，旧列表先留着、由底部 u-loadmore 的 loading 行给反馈，
                 否则每点一次页签整屏会先被骨架屏顶掉，看起来像重新进了页面 -->
            <view class="sk-list" v-if="loading && !list.length">
                <view class="pl-sk-item" v-for="i in 4" :key="i">
                    <view class="pl-sk-cover"></view>
                    <view class="pl-sk-info">
                        <u-skeleton
                            :loading="true"
                            :animate="true"
                            :title="true"
                            title-width="85%"
                            title-height="16"
                            :rows="1"
                            rows-width="55%"
                            rows-height="12"
                        />
                        <view class="pl-sk-price"></view>
                    </view>
                </view>
            </view>
            <template v-else>
                <!-- 列表卡保留组件默认圆角（round=true，10px）：套餐/校区两个复用列表组件按用户要求恢复圆角，
                     与其余教务列表页（直角）不同，这两页是明确例外 -->
                <tz-package :round="true" :list="list" v-if="list.length > 0"></tz-package>
                <!-- 分页加载：套餐随机构增长，滚到底部续拉下一页；已无下一页时不再展示 -->
                <view class="pkg-loadmore" v-if="list.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
                <u-empty
                    v-if="!list.length && !loading"
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    text="暂无课程套餐"
                />
            </template>
        </view>

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
