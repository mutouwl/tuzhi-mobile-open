<template>
    <view class="school-page">
        <!-- 顶部搜索栏：搜索框 + 时间筛选（与圈子搜索页共用组件） -->
        <tz-search-filter-bar :value="keyword" placeholder="搜索课程名称" :filter-active="filterActive" filter-icon="shijianfanwei2" @change="onKeywordChange" @submit="onSearch" @filter="toggleFilter" />
        <view class="school-cards">
            <!-- 刷新时仅列表区域展示骨架屏，顶部搜索/时间筛选保持可见（与套餐列表页一致） -->
            <view class="sk-list" v-if="loading">
                <view class="school-card" v-for="i in 4" :key="i">
                    <!-- 卡头占位对齐真实卡头：左侧「变动类型 值」、右侧「变动 值」两组「标签条 + 值条」 -->
                    <view class="sk-head">
                        <view class="sk-head-item">
                            <view class="sk-bar sk-head-label"></view>
                            <view class="sk-bar sk-type"></view>
                        </view>
                        <view class="sk-head-item">
                            <view class="sk-bar sk-head-label"></view>
                            <view class="sk-bar sk-change"></view>
                        </view>
                    </view>
                    <u-skeleton
                        :loading="true"
                        :animate="true"
                        :title="false"
                        :rows="5"
                        :rows-width="['62%', '40%', '58%', '58%', '72%']"
                        rows-height="13"
                    />
                </view>
            </view>
            <template v-else>
                <view class="school-card" v-for="l in list" :key="l.id">
                    <!-- 卡头：变动类型 + 本次变动课时；两个值都带标签，避免只看一个业务词/裸数字不知道什么意思。
                         方向由 +/- 符号表达，卡头不再按增减换色（页面类名统一 log- 前缀，见 css.css） -->
                    <view class="card-head">
                        <view class="log-field">
                            <text class="log-label">变动类型</text>
                            <text class="log-type">{{ l.type_text }}</text>
                        </view>
                        <view class="log-field">
                            <text class="log-label">变动</text>
                            <text class="log-change">{{ l.change_lessons >= 0 ? '+' : '' }}{{ fmtLessons(l.change_lessons) }}课时</text>
                        </view>
                    </view>
                    <!-- 字段行：label 定宽浅灰 + 值深灰（版式对齐「我的预约」卡的信息行），逐项标注字段含义 -->
                    <view class="log-row"><text class="log-label">课程</text><text class="log-value">{{ l.course_name || '-' }}</text></view>
                    <view class="log-row"><text class="log-label">账户ID</text><text class="log-value">{{ l.account_id }}</text></view>
                    <view class="log-row"><text class="log-label">变动前</text><text class="log-value">{{ fmtLessons(l.before_lessons) }}课时</text></view>
                    <view class="log-row"><text class="log-label">变动后</text><text class="log-value">{{ fmtLessons(l.after_lessons) }}课时</text></view>
                    <view class="log-row"><text class="log-label">时间</text><text class="log-value">{{ fmtDate(l.createtime) }}</text></view>
                </view>
                <!-- 分页加载：流水随学期增长，滚到底部续拉下一页；已无下一页时不再展示 -->
                <view class="logs-loadmore" v-if="list.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
                <u-empty
                    v-if="!list.length"
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    :text="emptyText"
                />
            </template>
        </view>

        <!-- 流水筛选弹窗（仅时间筛选，排序组隐藏） -->
        <tz-filter-popup :visible="modal.filter" title="流水筛选" :sort-options="[]" :time-filter="timeFilter" :custom-range="customRange" @update:visible="modal.filter = $event" @confirm="onFilterConfirm" />

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
