<template>
    <view class="school-page">
        <!-- 初始化骨架屏：版式对齐课程信息卡（标题 + 信息行）与操作区骨架 -->
        <view class="skeleton-page" v-if="skeletonLoading">
            <view class="school-sk-card sd-sk-card">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="16" />
                <view class="sk-row" v-for="i in 6" :key="i">
                    <view class="sk-label"></view>
                    <u-skeleton :loading="true" :animate="true" :title="true" title-width="45%" title-height="14" />
                </view>
            </view>
            <view class="sd-ops">
                <view class="sd-btn" v-for="i in 2" :key="'op' + i"></view>
            </view>
        </view>
        <block v-else>
        <view class="school-block school-block--rows sd-block" v-if="!missing && !loadError">
            <view class="block-title">课程信息</view>
            <view class="row" v-if="lesson.student_name"><text class="label">学生</text><text>{{ lesson.student_name }}</text></view>
            <view class="row">
                <text class="label">课程名称</text>
                <view class="val-wrap"><text>{{ lesson.course_name || '-' }}</text><text class="type-tag" v-if="lesson.type == 2">补课</text></view>
            </view>
            <view class="row"><text class="label">班级</text><text>{{ lesson.class_name || '-' }}</text></view>
            <!-- 校区：接口下发 campus_id 时整行可点进校区详情（与校区列表、套餐/教师详情的校区卡同目标页）；
                 没有 ID（如后端未更新到下发该字段的版本）时箭头不出、点击不响应，避免「看着能点其实点不动」 -->
            <view class="row" @click="goCampus">
                <text class="label">校区</text>
                <view class="val-wrap">
                    <text>{{ lesson.campus_name || '-' }}</text>
                    <tz-icon v-if="lesson.campus_id" name="enter" color="#86909C" :size="13" class="row-arrow" />
                </view>
            </view>
            <!-- 授课老师：与其他信息行同款 label-value；行尾箭头表示可点进去看老师详情
                 （头像/姓名/简介/联系电话/授课课程/所属校区），单个老师直接进他的详情页；
                 多个老师先弹名单（含各自联系电话，身份/简介都在），弹窗里每位老师仍可点进各自详情 -->
            <view class="row" @click="onTeacherTap">
                <text class="label">老师</text>
                <view class="val-wrap">
                    <text>{{ teacherText }}</text>
                    <tz-icon v-if="lessonTeachers.length" name="enter" color="#86909C" :size="13" class="row-arrow" />
                </view>
            </view>
            <view class="row" v-if="lesson.classroom_name"><text class="label">教室</text><text>{{ lesson.classroom_name }}</text></view>
            <view class="row"><text class="label">开课时间</text><text>{{ lessonTime }}</text></view>
            <view class="row"><text class="label">扣课时</text><text>{{ lesson.lessons || '-' }}</text></view>
            <view class="row" v-if="lesson.user_remark"><text class="label">备注</text><text>{{ lesson.user_remark }}</text></view>
            <view class="row"><text class="label">签到状态</text><text>{{ signText }}</text></view>
            <view class="row"><text class="label">消课状态</text><text>{{ consumeText }}</text></view>
        </view>
        <!-- 操作卡：签到/请假按钮横排靠右，尺寸与排列对齐订单详情底部按钮（按钮显隐跟随教务设置与课次状态，与课表页口径一致） -->
        <view class="ops-card" v-if="!missing && !loadError && (showSignBtn || showLeaveBtn)">
            <!-- 签到：已签到/无需签到（已核销、请假已通过）时整体隐藏；置灰时点击弹窗说明原因；tz-button disabled 会吞掉自身点击，由外层接管 -->
            <view class="ops-btn" v-if="showSignBtn" @click="onSignTap">
                <tz-button size="small" type="primary" text="签到" :disabled="!lesson.can_sign"></tz-button>
            </view>
            <!-- 请假：教务设置关闭学生请假、或该课次已不可请假时整体隐藏（allow_leave / can_leave 由 schedule 接口下发）；
                 课次已有请假单（待审核/已通过）时转为「请假详情」，点击进请假详情页而非申请表单 -->
            <view class="ops-btn" v-if="showLeaveBtn">
                <tz-button size="small" :text="lesson.leave_id ? '请假详情' : '请假'" @click="goLeave"></tz-button>
            </view>
        </view>
        <view class="empty-wrap" v-if="(missing || loadError) && !skeletonLoading">
            <u-empty icon="/static/image/empty.png" width="70" height="70" :text="emptyText" />
        </view>
        </block>

        <!-- 老师弹窗：列为授课老师（头像/姓名/身份/联系电话），多老师时一次展示全部 -->
        <teacher-info-popup :show="teacherPopupShow" :teachers="lessonTeachers" @close="teacherPopupShow = false" />

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
