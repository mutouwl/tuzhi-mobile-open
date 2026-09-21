<template>
    <view class="school-page school-page--bar">
        <view class="school-block school-block--rows">
            <!-- 请假学生由教务中心统一选择后带入，本页仅回显，不再提供切换 -->
            <view class="row">
                <text class="label">请假学生</text>
                <text class="value" :class="{ placeholder: !currentStudentName }">{{ currentStudentName || '请在教务中心选择学生' }}</text>
            </view>
            <view class="row" @click="pickSessionVisible = true">
                <text class="label">选择课次</text>
                <view class="link"><text>{{ currentSessionText || '请选择' }}</text><tz-icon name="enter" color="#86909C" :size="13" /></view>
            </view>
            <view class="row" @click="pickTypeVisible = true">
                <text class="label">请假类型</text>
                <view class="link"><text>{{ typeName }}</text><tz-icon name="enter" color="#86909C" :size="13" /></view>
            </view>
        </view>
        <view class="school-block school-block--rows">
            <view class="block-title">请假原因</view>
            <textarea class="reason" v-model="reason" placeholder="请填写请假原因" :maxlength="200" />
            <view class="count">{{ reason.length }}/200</view>
        </view>
        <view class="school-block school-block--rows">
            <view class="block-title">图片 <text class="tip">最多可上传6张图片</text></view>
            <view class="imgs-block">
                <!-- 复用圈子发布动态的媒体编辑器：choose 后走 common/upload 真实上传，仅启用图片；
                     添加格由编辑器渲染（show-add），与图片排在同一九宫格里，右侧接着排、满三列换行 -->
                <tz-media-editor
                    ref="mediaEditor"
                    v-model="mediaForm"
                    :max-images="6"
                    :media-enables="{ media_video_enable: 0, media_audio_enable: 0, media_file_enable: 0 }"
                    :disabled="uploading"
                    :show-add="true"
                    @add="chooseImage"
                    @uploading-change="onUploadingChange"
                />
            </view>
        </view>
        <view class="school-footer h5-bottom-bar">
            <u-button class="submit" type="primary" text="提交申请" @click="submit"></u-button>
        </view>

        <!-- 选课次弹层（多选，仅未来待核销课次） -->
        <u-popup :show="pickSessionVisible" mode="bottom" :round="10" bgColor="transparent" :safeAreaInsetBottom="false" :zIndex="10075" :overlayStyle="{ zIndex: 10070 }" @close="pickSessionVisible = false">
            <view class="school-popup la-popup">
                <view class="school-popup-title">选择课次<text class="popup-count" v-if="selectedSessions.length">已选{{ selectedSessions.length }}个</text></view>
                <!-- 筛选行：课程 + 时间水平排列（摆法照课时余额页的课程/校区筛选行，两项间竖线分隔）；
                     课程走独立单选弹层选完即回本弹层，时间点开区间日历调整；两者任一变化都按新条件重新加载 -->
                <view class="pick-filter">
                    <view class="pick-filter-item" @click="pickCourseVisible = true">
                        <text class="pick-filter-label">课程</text>
                        <text class="pick-filter-value" :class="{ dim: courseId == 0 }">{{ courseName }}</text>
                        <tz-icon name="enter" color="#86909C" :size="13" />
                    </view>
                    <view class="pick-filter-item" @click="rangeVisible = true">
                        <text class="pick-filter-label">时间</text>
                        <text class="pick-filter-value range">{{ rangeText }}</text>
                        <tz-icon name="enter" color="#86909C" :size="13" />
                    </view>
                </view>
                <tz-popup-list height="46vh" :refreshing="sessionRefreshing" @refresh="loadSessions(true)" @lower="loadSessions(false)">
                    <view class="pick-item" v-for="s in sessions" :key="s.id" @click="toggleSession(s)">
                        <text>{{ s.class_name }} {{ s.start_time }}-{{ s.end_time }}</text>
                        <!-- 多选弹层右侧用方形选择器（单选才是圆形 radio），选中蓝底白勾 -->
                        <view class="checkbox" :class="{ on: selectedSessionIds.indexOf(s.id) > -1 }"></view>
                    </view>
                    <view class="popup-loadmore" v-if="sessions.length"><u-loadmore :status="sessionLoadStatus" /></view>
                    <!-- 加载态骨架屏：首屏加载中、以及切换课程/改时间后重拉期间占位（行结构与课次行一致：文字条 + 右侧方形选择器） -->
                    <view class="pick-skeleton" v-if="sessionLoading && !sessions.length">
                        <view class="pick-skeleton-item" v-for="(w, i) in sessionSkRows" :key="i">
                            <view class="pick-sk-text">
                                <!-- rows-width 走数组分支才能按行指定宽度（标量值会被末行 70% 的默认规则覆盖） -->
                                <u-skeleton :loading="true" :animate="true" :title="false" :rows="1" :rows-width="[w]" rows-height="14" />
                            </view>
                            <view class="pick-sk-box"></view>
                        </view>
                    </view>
                    <view class="empty" v-else-if="!studentId">请先选择学生</view>
                    <u-empty
                        v-else-if="!sessions.length"
                        icon="/static/image/empty.png"
                        width="70"
                        height="70"
                        text="暂无可请假的课次"
                    />
                </tz-popup-list>
                <view class="popup-confirm"><u-button type="primary" text="确定" @click="confirmSessions"></u-button></view>
            </view>
        </u-popup>

        <!-- 选择课程弹层（单选，按课程卡渲染：封面 + 类型标签 + 简介；选中即应用并回到选课次弹层）。
             层级必须高于选课次弹层（10075），否则会被下层弹层盖住点不到；
             选中后由 js.vue 的 courseId watch 重新拉取课次，故无需 select 回调 -->
        <course-select-popup
            :show="pickCourseVisible"
            title="选择课程"
            :list="courseOptions"
            v-model="courseId"
            empty-text="暂无可选课程"
            :z-index="10085"
            :overlay-style="{ zIndex: 10080 }"
            @close="pickCourseVisible = false"
        />

        <!-- 选类型弹层（单选：选中即应用并关闭，与校区/课程选择弹窗一致） -->
        <u-popup :show="pickTypeVisible" mode="bottom" :round="10" bgColor="transparent" :safeAreaInsetBottom="false" :zIndex="10075" :overlayStyle="{ zIndex: 10070 }" @close="pickTypeVisible = false">
            <view class="school-popup la-popup">
                <view class="school-popup-title">请假类型</view>
                <tz-popup-list height="46vh" :refreshable="false">
                    <!-- 右侧圆形单选器：复用课程套餐「选择校区/选择课程」弹窗的选择标识（campus-select-popup 的 .radio / tz-school-course 的 .tz-school-course-radio） -->
                    <view class="pick-item" v-for="(n, t) in types" :key="t" @click="type = t; pickTypeVisible = false">
                        <text :class="{ active: type == t }">{{ n }}</text>
                        <view class="radio" :class="{ on: type == t }"></view>
                    </view>
                </tz-popup-list>
            </view>
        </u-popup>

        <!-- 课次时间范围选择：区间日历（今天 ~ 180 天后，与 tz-school-calendar 可选范围一致；
             TDesign 弹窗默认 z-index 11500，高于选课次弹层的 10075，故可直接叠在其上） -->
        <t-calendar
            :visible="rangeVisible"
            type="range"
            switch-mode="month"
            title="选择时间范围"
            :min-date="rangeMinDate"
            :max-date="rangeMaxDate"
            :value="rangeValue"
            :custom-style="'border-top-left-radius: 32rpx; border-top-right-radius: 32rpx;'"
            :confirm-btn="{ style: 'height: 44px; line-height: 44px; border-radius: 4px; font-size: 15px; font-weight: 500;' }"
            @update:visible="onRangeVisible"
            @confirm="onRangeConfirm"
            @close="onRangeClose"
        ></t-calendar>

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
