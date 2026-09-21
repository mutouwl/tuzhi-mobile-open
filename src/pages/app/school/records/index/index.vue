<template>
    <view class="school-page">
        <!-- 顶部搜索栏：搜索框 + 时间筛选（与圈子搜索页共用组件） -->
        <tz-search-filter-bar :value="keyword" placeholder="搜索课程/班级/老师" :filter-active="filterActive" filter-icon="shijianfanwei2" @change="onKeywordChange" @submit="onSearch" @filter="toggleFilter" />
        <!-- 学生选择统一在教务中心页右上角，本页不再提供切换入口 -->
        <view class="school-cards">
            <!-- 列表骨架屏：仿上课记录卡片版式（对齐教务其他列表骨架屏做法） -->
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
                        :rows="4"
                        :rows-width="['95%', '80%', '70%', '85%']"
                        rows-height="12"
                    />
                </view>
            </block>
            <template v-else>
                <view class="school-card" v-for="s in list" :key="s.id">
                    <view class="card-head">
                        <text class="card-title">{{ s.class_name }}</text>
                        <!-- 角标＝签到/消课两维合并文案（接口 list_status_text 下发，口径与课表页一致）；
                             配色沿用本页绿/红/橙三档（已完成绿、未签到红、请假未到橙） -->
                        <text class="status" :class="statusClassMap[s.status_tag] || 'orange'">{{ s.status_tag }}</text>
                    </view>
                    <view class="line">课程：{{ s.course_name }}｜{{ s.lessons }} 课时</view>
                    <view class="line">学生：{{ currentStudentName }}</view>
                    <view class="line">老师：{{ s.main_teacher || '-' }}</view>
                    <view class="line">时间：{{ fmtDate(s.lesson_date) }} {{ s.start_time }}-{{ s.end_time }}</view>
                    <!-- 签到状态与消课状态各占一行：签到看人来没来（学生自签算已签到），消课看机构有没有确认扣课时；
                         关闭「签到自动消课」时学生签到后是「已签到 + 待消课」，两行各说一件事 -->
                    <view class="line">签到状态：{{ s.sign_status_text || '-' }}</view>
                    <view class="line">消课状态：{{ s.consume_status_text || '-' }}</view>
                </view>
                <!-- 分页加载：记录随学期增长，滚到底部续拉下一页；已无下一页时不再展示 -->
                <view class="loadmore" v-if="list.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
                <u-empty
                    v-if="!list.length && !loading"
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    :text="emptyText"
                />
            </template>
        </view>

        <!-- 记录筛选弹窗（仅时间筛选，排序组隐藏） -->
        <tz-filter-popup :visible="modal.filter" title="记录筛选" :sort-options="[]" :time-filter="timeFilter" :custom-range="customRange" @update:visible="modal.filter = $event" @confirm="onFilterConfirm" />

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
