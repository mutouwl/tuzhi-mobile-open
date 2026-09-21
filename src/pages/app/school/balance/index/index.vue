<template>
    <view class="school-page">
        <!-- 学生选择统一在教务中心页右上角，本页不再提供切换入口 -->
        <view class="bal-filter-bar">
            <view class="filter-item" @click="coursePickerVisible = true"><text class="filter-label">课程</text><text class="filter-value" :class="{ dim: courseId == 0 }">{{ courseName }}</text><tz-icon name="enter" color="#86909C" :size="14" /></view>
            <view class="filter-item" @click="campusPickerVisible = true"><text class="filter-label">校区</text><text class="filter-value" :class="{ dim: campusId == 0 }">{{ campusName }}</text><tz-icon name="enter" color="#86909C" :size="14" /></view>
        </view>
        <!-- 课程选择弹窗（单选，按课程卡渲染：封面 + 类型标签 + 简介）；选中后由 js.vue 的 courseId watch 刷新统计与列表，无需 select 回调 -->
        <course-select-popup
            :show="coursePickerVisible"
            title="选择课程"
            :list="courseOptions"
            v-model="courseId"
            empty-text="暂无可选课程"
            @close="coursePickerVisible = false"
        />
        <!-- 校区选择弹窗（单选）；同上，选中后由 campusId watch 刷新 -->
        <campus-select-popup
            :show="campusPickerVisible"
            :list="campusOptions"
            v-model="campusId"
            @close="campusPickerVisible = false"
        />
        <!-- 加载态骨架屏：筛选栏保持可见（用户正在操作），统计与账户卡按真实结构占位 -->
        <view class="bal-sk" v-if="loading">
            <view class="bal-sk-stats">
                <view class="bal-sk-stat" v-for="i in 3" :key="i">
                    <view class="bal-sk-bar bal-sk-num"></view>
                    <view class="bal-sk-bar bal-sk-label"></view>
                </view>
            </view>
            <view class="bal-sk-accounts">
                <view class="bal-sk-card" v-for="i in 3" :key="i">
                    <view class="bal-sk-bar bal-sk-name"></view>
                    <u-skeleton
                        :loading="true"
                        :animate="true"
                        :title="false"
                        :rows="4"
                        :rows-width="['72%', '58%', '80%', '64%']"
                        rows-height="13"
                    />
                    <view class="bal-sk-entry"><view class="bal-sk-bar bal-sk-btn"></view></view>
                </view>
            </view>
        </view>
        <template v-else>
            <view class="stats">
                <view class="stat"><view class="num">{{ courseCount }}</view><view class="bal-stat-label">课程数</view></view>
                <view class="stat"><view class="num orange">{{ remain }}</view><view class="bal-stat-label">剩余课时</view></view>
                <view class="stat"><view class="num orange">{{ used }}</view><view class="bal-stat-label">已上课时</view></view>
            </view>
            <view class="accounts">
                <view class="account" v-for="a in accounts" :key="a.id">
                    <view class="acc-head">
                        <text class="acc-name">{{ a.course_name }}</text>
                        <!-- 状态标签：只在异常状态展示（已过期 / 课时不足），正常可预约的账户不打标 -->
                        <text v-if="accStatusText(a)" class="acc-status" :class="{ gray: isExpired(a), orange: !isExpired(a) }">{{ accStatusText(a) }}</text>
                    </view>
                    <!-- 元信息统一 meta-row：label 居左、value 靠右，排列方式对齐订单详情数据列表（标签浅灰、值深灰） -->
                    <view class="acc-meta">
                        <view class="meta-row"><text class="meta-label">校区：</text><text class="meta-value">{{ a.campus_name || '-' }}</text></view>
                        <view class="meta-row"><text class="meta-label">剩余课时：</text><text class="meta-value"><text class="orange">{{ remainOf(a) }}课时</text>（已上{{ a.used_lessons }}课时）</text></view>
                        <view class="meta-row"><text class="meta-label">开通时间：</text><text class="meta-value">{{ fmtDate(a.createtime) }}</text></view>
                        <view class="meta-row"><text class="meta-label">有效期：</text><text class="meta-value">{{ a.expire_time > 0 ? fmtDate(a.expire_time) : '长期有效' }}</text></view>
                    </view>
                    <!-- 操作入口统一在卡片右下角：有课时→预约（账户过期时置灰，外壳接管点击说明原因）；课时不足→续费
                         按钮尺寸取 mid，与课表（schedule）列表卡内操作按钮同一档 -->
                    <view class="book-entry" v-if="hasBookEntry(a)" @click.stop="goBook(a)">
                        <tz-button size="mid" type="primary" text="预约" :disabled="!canBook(a)"></tz-button>
                    </view>
                    <view class="book-entry" v-else-if="needRenew(a)" @click.stop="goRenew(a)">
                        <tz-button size="mid" type="primary" text="续费"></tz-button>
                    </view>
                </view>
                <!-- 分页加载行：账户滚动到底部续拉下一页（列表非空才展示；末页收起，与本模块其余列表口径一致） -->
                <view class="acc-loadmore" v-if="accounts.length && accountLoadStatus !== 'nomore'"><u-loadmore :status="accountLoadStatus" /></view>
                <!-- 空状态：加载中由骨架屏占位，能走到这里即已出结果 -->
                <u-empty
                    v-if="!accounts.length"
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    text="暂无课时账户"
                />
            </view>
        </template>

        <!-- 续费套餐弹窗：该课程有多个套餐时展示（仅 1 个可购买套餐时直接进套餐详情，不经弹窗） -->
        <renew-package-popup
            :show="renewPopupVisible"
            :course-name="renewCourseName"
            :list="renewList"
            :loading="renewLoading"
            :loaded="renewLoaded"
            :load-status="renewLoadStatus"
            @close="renewPopupVisible = false"
            @lower="loadMoreRenew"
            @pick="goRenewPackage"
        />

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
