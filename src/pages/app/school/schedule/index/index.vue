<template>
    <view class="school-page">
        <!-- 学生选择统一在教务中心页右上角，本页不再提供切换入口 -->
        <!-- 日历（周日历条 + 月面板）抽为共用组件，与「预约上课」页共用；角标单位为「节」；
             吸顶：列表滚动时周日历条常驻顶部（照本模块 package/list、booking/list 的 u-sticky 口径）。
             z-index 取 1010 是必需的：u-sticky 会形成层叠上下文，日历自己的「选择日期」弹窗（z-index 11500）
             被困在其中，必须让这一层高于 tz-tab-bar 的 1001，否则弹窗遮罩盖不住底部 tabbar -->
        <u-sticky bgColor="#fff" :offsetTop="0" :z-index="1010">
            <tz-school-calendar
                v-model="selectedTs"
                :student-id="studentId"
                :week-counts="dayCountMap"
                counts-api="school.user.scheduleCounts"
                count-unit="节"
                loading-text="正在加载课次…"
                @change="refresh"
            />
        </u-sticky>
        <!-- 课程列表：仅展示选中日期当天，时间轴排列 -->
        <view class="school-cards">
            <!-- 列表骨架屏：仿"按天分组 + 时间轴课程卡"版式（时间列灰块与轨道灰点由 tz-school-timeline 渲染）；
                 首屏拉学生信息阶段（pageLoading）同样走骨架，不再叠全屏 loading -->
            <view class="sk-day" v-if="listLoading || pageLoading">
                <view class="sk-day-head">
                    <view class="sk-bar sk-day-title"></view>
                    <view class="sk-bar sk-day-count"></view>
                </view>
                <tz-school-timeline v-for="i in 2" :key="i" skeleton card-bg="#f7f8fa" card-radius="0" card-padding="10px 12px">
                    <view class="sk-bar si-status"></view>
                    <u-skeleton
                        :loading="true"
                        :animate="true"
                        :title="true"
                        title-width="55%"
                        title-height="15"
                        :rows="3"
                        :rows-width="['55%', '70%', '45%']"
                        rows-height="12"
                    />
                    <view class="sk-ops">
                        <view class="sk-bar sk-btn"></view>
                        <view class="sk-bar sk-btn"></view>
                    </view>
                </tz-school-timeline>
            </view>
            <template v-else>
                <!-- 学生未就绪（列表为空/加载失败）：显式空态与重试，替代此前"交互全部静默"的死页面 -->
                <block v-if="(!studentsLoaded && studentsError) || (studentsLoaded && !students.length)">
                    <u-empty
                        icon="/static/image/empty.png"
                        width="70"
                        height="70"
                        :text="studentsError ? '学生加载失败，请重试' : '暂无学生，请先在教务中心添加学生'"
                    />
                    <view class="empty-ops" v-if="studentsError" @click="loadStudents(true)">
                        <tz-button size="mini" type="primary" text="重新加载"></tz-button>
                    </view>
                </block>
                <block v-else>
                    <view class="day-group" v-for="g in dayGroups" :key="g.date">
                        <view class="day-head">
                            <text class="day-title">{{ g.date_text }}</text>
                            <text class="day-count">共{{ g.list.length }}节</text>
                        </view>
                        <!-- 时间轴条目：左侧时间列 + 轨道圆点 + 右侧课程卡（共用组件 tz-school-timeline，
                             与「预约上课」「我的预约」同一份实现；课表嵌在白底分组卡内，故卡体传灰底；卡体圆角传 0——教务列表页条目卡统一不做圆角，组件默认 10px 圆角仍供其他页使用）
                             状态圆点色名由卡片角标同一口径派生（已完成绿 / 请假未到橙 / 未签到蓝） -->
                        <tz-school-timeline
                            v-for="(s, i) in g.list"
                            :key="s.id"
                            :first="i === 0"
                            :last="i === g.list.length - 1"
                            :start-time="s.start_time"
                            :end-time="s.end_time"
                            :dot-color="dotClass(s)"
                            card-bg="#f7f8fa"
                            card-radius="0"
                            card-padding="10px 12px"
                            @card-click="goDetail(s)"
                        >
                            <!-- 角标文案由后端 list_status_text 下发（列表页整卡口径），配色随文案分档 -->
                            <text class="status card-badge" :class="statusClassMap[s.status_tag] || ''">{{ s.status_tag }}</text>
                            <view class="card-name">{{ s.course_name }}</view>
                            <view class="card-meta">
                                <view class="meta-row"><text class="meta-label">学生：</text><text class="meta-value">{{ currentStudent.name || '-' }}</text></view>
                                <view class="meta-row"><text class="meta-label">校区：</text><text class="meta-value">{{ s.campus_name || '-' }}</text></view>
                                <view class="meta-row"><text class="meta-label">老师：</text><text class="meta-value">{{ s.main_teacher || '-' }}</text></view>
                            </view>
                            <!-- 操作区：阻止冒泡，点击按钮不触发卡片跳详情；按钮尺寸取 mid（mini 放大 1/3），
                                 与「预约上课」「我的预约」卡片内操作按钮一致；两个按钮都不显示时整块不留空档 -->
                            <view class="ops" v-if="showSignBtn(s) || showLeaveBtn(s)" @click.stop>
                                <!-- 请假：教务设置关闭学生请假、或该课次已不可请假时整体隐藏（allow_leave / can_leave 由
                                     schedule 接口下发，与课次详情页同口径）；
                                     课次已有请假单（待审核/已通过）时转为「请假详情」，点击进请假详情页而非申请表单 -->
                                <tz-button v-if="showLeaveBtn(s)" size="mid" :text="s.leave_id ? '请假详情' : '请假'" style="margin-left: 10px" @click="goLeave(s)"></tz-button>
                                <!-- 签到：已签到/无需签到（已核销、请假已通过）时整体隐藏；置灰时点击弹窗说明原因；tz-button disabled 会吞掉自身点击，由外层接管 -->
                                <view class="si-sign-btn" v-if="showSignBtn(s)" @click="onSignTap(s)">
                                    <tz-button size="mid" type="primary" text="签到" :disabled="!s.can_sign"></tz-button>
                                </view>
                            </view>
                        </tz-school-timeline>
                    </view>
                    <!-- 课表拉取失败且无数据：显式失败态+重试，不再误显示"当天暂无课程" -->
                    <block v-if="refreshError && !dayGroups.length">
                        <u-empty
                            icon="/static/image/empty.png"
                            width="70"
                            height="70"
                            text="课表加载失败，请重试"
                        />
                        <view class="empty-ops" @click="refresh">
                            <tz-button size="mini" type="primary" text="重新加载"></tz-button>
                        </view>
                    </block>
                    <u-empty
                        v-else-if="!dayGroups.length"
                        icon="/static/image/empty.png"
                        width="70"
                        height="70"
                        text="当天暂无课程"
                    />
                </block>
            </template>
        </view>

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
