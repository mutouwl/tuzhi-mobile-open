<template>
    <view class="school-page">
        <!-- 日历（周日历条 + 月面板）使用共用组件，与「我的课表」同一份实现；角标单位为「场」。
             月面板自己拉数量，须把本页的课程筛选一并带上（counts-params），否则按课程进入时
             角标统计的是全部课程、列表只有该课程，会出现「日历有场次、列表为空」。
             吸顶：场次列表滚动时周日历条常驻顶部（照本模块 package/list、booking/list 的 u-sticky 口径）。
             z-index 取 1010 是必需的：u-sticky 会形成层叠上下文，日历自己的「选择日期」弹窗（z-index 11500）
             被困在其中，必须让这一层高于 tz-tab-bar 的 1001，否则弹窗遮罩盖不住底部 tabbar -->
        <u-sticky bgColor="#fff" :offsetTop="0" :z-index="1010">
            <tz-school-calendar
                v-model="selectedTs"
                :student-id="studentId"
                :week-counts="weekCounts"
                counts-api="school.user.bookableCounts"
                :counts-params="{ course_id: courseId || 0 }"
                count-unit="场"
                loading-text="正在加载可约场次…"
                :loading="calendarLoading"
                @change="onDateChange"
            />
        </u-sticky>

        <view class="bk-list">
            <!-- 列表骨架屏：仿「左侧时间轴 + 场次卡」版式（时间列灰块与轨道灰点由 tz-school-timeline 渲染） -->
            <block v-if="listLoading">
                <tz-school-timeline v-for="i in 3" :key="i" skeleton>
                    <view class="bk-head">
                        <view class="bk-sk-bar bk-sk-name"></view>
                        <view class="bk-sk-bar bk-sk-seat"></view>
                    </view>
                    <view class="bk-sk-bar bk-sk-line"></view>
                    <view class="bk-sk-bar bk-sk-line short"></view>
                    <view class="bk-ops">
                        <view class="bk-sk-bar bk-sk-btn"></view>
                    </view>
                </tz-school-timeline>
            </block>
            <template v-else>
                <block v-if="!studentId">
                    <u-empty icon="/static/image/empty.png" width="70" height="70" text="请先在教务中心选择学生" />
                </block>
                <block v-else>
                    <!-- 场次时间轴：左侧课次时间 + 轨道圆点，右侧场次卡（与「我的课表」「我的预约」同款共用组件） -->
                    <tz-school-timeline
                        v-for="(s, i) in dayList"
                        :key="s.id"
                        :first="i === 0"
                        :last="i === dayList.length - 1"
                        :start-time="s.start_time"
                        :end-time="s.end_time"
                        :dot-color="stateClass(s)"
                        @card-click="onCardTap(s)"
                    >
                        <!-- 场次卡：卡头「课程名（场次标识）+ 名额状态」，对齐订单卡「订单号 + 状态」版式 -->
                        <view class="bk-head">
                            <text class="bk-name">{{ s.course_name }}</text>
                            <text class="bk-seat" :class="seatClassMap[s.id] || ''">{{ seatText(s) }}</text>
                        </view>
                        <view class="bk-row">
                            <text class="bk-label">上课地点</text>
                            <text class="bk-value">{{ s.campus_name || '-' }}{{ s.classroom_name ? ' ' + s.classroom_name : '' }}</text>
                        </view>
                        <view class="bk-row">
                            <text class="bk-label">上课老师</text>
                            <text class="bk-value">{{ s.main_teacher || '-' }}</text>
                        </view>
                        <view class="bk-row">
                            <text class="bk-label">消耗课时</text>
                            <text class="bk-value">{{ s.lessons }}</text>
                        </view>
                        <!-- 操作行：仅保留右侧预约按钮（对齐订单卡操作行；剩余课时不在列表展示，避免与课时余额页数据重复且口径不一） -->
                        <view class="bk-ops" @click.stop>
                            <!-- 预约按钮：本人已在该场次（已加入/已安排/已预约/待确认/已上课）或已约满时置灰；外壳接管点击——
                                 本人在场次里已有课次记录的直接进课次详情，其余（待确认/已约满/课时不足等）弹窗说明原因；
                                 尺寸取 mid（mini 放大 1/3），与「我的课表」「我的预约」卡片内操作按钮一致 -->
                            <view class="book-btn" @click="onBookTap(s)">
                                <tz-button size="mid" type="primary" :text="btnText(s)" :disabled="!s.can_book"></tz-button>
                            </view>
                        </view>
                    </tz-school-timeline>
                    <!-- 分页加载：一天场次较多时按页拉取，滚到底部续拉下一页；已无下一页时不再展示 -->
                    <view class="bk-loadmore" v-if="dayList.length && loadStatus !== 'nomore'">
                        <u-loadmore :status="loadStatus" />
                    </view>
                    <block v-if="refreshError && !dayList.length">
                        <u-empty icon="/static/image/empty.png" width="70" height="70" text="可约场次加载失败，请重试" />
                        <view class="bk-empty-ops" @click="refresh">
                            <tz-button type="primary" text="重新加载"></tz-button>
                        </view>
                    </block>
                    <u-empty
                        v-else-if="!dayList.length"
                        icon="/static/image/empty.png"
                        width="70"
                        height="70"
                        :text="emptyText"
                    />
                    <!-- 未报名任何课程（后端下发的报名课程数为 0）：列表必然为空，此时空态文案是报名引导，
                         并给出套餐入口，不让学生停在原地找不到出路 -->
                    <view class="bk-empty-ops" v-if="!dayList.length && !refreshError && enrolledCourseCount === 0" @click="goPackages">
                        <tz-button type="primary" text="选购课程套餐"></tz-button>
                    </view>
                </block>
            </template>
        </view>
        <u-loading-page :loading="pageLoading" bg-color="#F7F8FA"></u-loading-page>

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
