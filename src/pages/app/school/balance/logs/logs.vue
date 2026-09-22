<template>
    <view class="school-page">
        <!-- 顶部搜索栏：搜索框 + 时间筛选（与圈子搜索页共用组件） -->
        <tz-search-filter-bar :value="keyword" placeholder="搜索课程名称" :filter-active="filterActive" filter-icon="shijianfanwei2" @change="onKeywordChange" @submit="onSearch" @filter="toggleFilter" />
        <view class="school-cards">
            <!-- 刷新时仅列表区域展示骨架屏，顶部搜索/时间筛选保持可见（与套餐列表页一致） -->
            <view class="sk-list" v-if="loading">
                <view class="school-card" v-for="i in 4" :key="i">
                    <!-- 骨架卡头：左上角一枚标签条，位置与尺寸对齐新卡头的合并标签（12px 字 + 上下 2px 内边距 = 22px 高） -->
                    <view class="log-sk-head">
                        <view class="log-sk-bar log-sk-tag"></view>
                    </view>
                    <!-- 骨架字段行：逐行仿真实卡体（定宽标签条 + 值条），行高 22px + 行距 4px 与真实行一致、
                         值条宽度按各行实际文案长度取 ⇒ 骨架卡与真实卡等高，加载完成切换不跳动 -->
                    <view class="log-sk-row"><view class="log-sk-bar log-sk-label"></view><view class="log-sk-bar log-sk-value w-course"></view></view>
                    <view class="log-sk-row"><view class="log-sk-bar log-sk-label"></view><view class="log-sk-bar log-sk-value w-before"></view></view>
                    <view class="log-sk-row"><view class="log-sk-bar log-sk-label"></view><view class="log-sk-bar log-sk-value w-after"></view></view>
                    <view class="log-sk-row"><view class="log-sk-bar log-sk-label"></view><view class="log-sk-bar log-sk-value w-time"></view></view>
                </view>
            </view>
            <template v-else>
                <view class="school-card" v-for="l in list" :key="l.id">
                    <!-- 卡头：变动类型与本次变动课时合并成一枚标签，放在卡片左上角（口径对齐 web 课时流水把「变动类型」做成 Tag）。
                         标签底色只按变动方向区分（增加绿 / 减少红，见 .log-tag-up/down），不按变动类型分色；
                         增减另由值前 +/- 符号直读，颜色只是辅助（页面类名统一 log- 前缀，见 css.css） -->
                    <view class="card-head">
                        <view class="log-tag" :class="'log-tag-' + changeColor(l.change_lessons)">
                            <text>{{ l.type_text }}</text>
                            <text class="log-tag-change">{{ l.change_lessons > 0 ? '+' : '' }}{{ fmtLessons(l.change_lessons) }}课时</text>
                        </view>
                    </view>
                    <!-- 字段行：label 定宽浅灰 + 值深灰（版式对齐「我的预约」卡的信息行），逐项标注字段含义 -->
                    <view class="log-row"><text class="log-label">课程</text><text class="log-value">{{ l.course_name || '-' }}</text></view>
                    <view class="log-row"><text class="log-label">学生</text><text class="log-value">{{ l.student_name || '-' }}</text></view>
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
