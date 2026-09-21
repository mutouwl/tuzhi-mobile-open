<template>
    <view class="school-page school-page--bar">
        <!-- 状态页签吸顶：与订单列表 /pages/order/list/list 同款（裸 u-tabs + 默认配色，不写页面级覆写） -->
        <u-sticky bgColor="#fff" style="padding-bottom: 2px;" :offsetTop="0">
            <u-tabs :list="tabs" :current="current" :scrollable="true" @change="tabChange"></u-tabs>
        </u-sticky>
        <view class="school-cards">
            <!-- 列表骨架屏：仿请假记录卡片版式（对齐教务其他列表骨架屏做法） -->
            <block v-if="loading && !list.length">
                <view class="school-card" v-for="n in 4" :key="n">
                    <view class="sk-card-head">
                        <view class="sk-bar sk-title"></view>
                        <view class="sk-bar sk-status"></view>
                    </view>
                    <u-skeleton
                        :loading="true"
                        :animate="true"
                        :title="false"
                        :rows="3"
                        :rows-width="['60%', '45%', '70%']"
                        rows-height="12"
                    />
                </view>
            </block>
            <template v-else>
                <view class="school-card" v-for="l in list" :key="l.id" @click="goDetail(l.id)">
                    <view class="card-head">
                        <text class="card-title">{{ l.student_name }}的请假</text>
                        <text class="status" :class="{ green: l.status == 1, red: l.status == 2, gray: l.status == 3 }">{{ l.status_text }}</text>
                    </view>
                    <view class="line">{{ typeTextMap[l.type] || '-' }}｜{{ l.lessons }} 课时</view>
                    <view class="line">课程：{{ l.course_name || '-' }}</view>
                    <view class="line">班级：{{ l.class_name || '-' }}</view>
                    <view class="line">课次：{{ sessionText(l) }}</view>
                </view>
                <!-- 分页加载：请假记录按页拉取，滚到底部续拉下一页；已无下一页时不再展示 -->
                <view class="leave-loadmore" v-if="list.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
                <u-empty
                    v-if="!list.length && !loading"
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    text="暂无请假记录"
                />
            </template>
        </view>
        <view class="school-footer h5-bottom-bar" v-if="allowLeave">
            <u-button class="apply-btn" type="primary" text="发起请假" @click="goApply"></u-button>
        </view>

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
