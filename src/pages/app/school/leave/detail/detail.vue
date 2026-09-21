<template>
    <view class="school-page">
        <!-- 初始化骨架屏 -->
        <view class="skeleton-page" v-if="skeletonLoading">
            <view class="school-sk-card ld-sk-status">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="22" :rows="0" />
            </view>
            <view class="school-sk-card">
                <view class="ld-sk-title"></view>
                <view class="sk-cell" v-for="i in 2" :key="'a' + i">
                    <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="14" :rows="1" rows-width="50%" rows-height="14" />
                </view>
            </view>
            <view class="school-sk-card">
                <view class="ld-sk-title"></view>
                <view class="sk-cell" v-for="i in 5" :key="'b' + i">
                    <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="14" :rows="1" rows-width="50%" rows-height="14" />
                </view>
            </view>
            <view class="school-sk-card">
                <view class="ld-sk-title"></view>
                <view class="ld-logs">
                    <view class="ld-log-item" v-for="i in 2" :key="'c' + i">
                        <view class="ld-log-rail">
                            <view class="ld-log-dot sk" />
                        </view>
                        <view class="ld-log-body">
                            <u-skeleton :loading="true" :animate="true" :title="true" title-width="40%" title-height="14" :rows="1" rows-width="60%" rows-height="12" />
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <template v-else>
        <template v-if="!missing && !loadError">
        <view class="status-card">
            <image v-if="statusIcon" class="ld-status-icon" :src="'/static/order/status/' + statusIcon + '.png'" />
            <text class="status-title">{{ statusText }}</text>
            <tz-button v-if="detail.status == 0" size="small" text="取消请假" @click="cancelLeave"></tz-button>
        </view>
        <view class="school-block school-block--rows">
            <view class="block-title">请假人信息</view>
            <view class="row"><text class="label">姓名</text><text>{{ detail.student_name }}</text></view>
            <!-- 所在校区：接口下发 campus_id 时整行可点进校区详情（与课次详情「校区」行同目标页同箭头口径）；
                 课次已被删除时 campus_id 为 0，箭头不出、点击不响应，避免「看着能点其实点不动」 -->
            <view class="row" @click="goCampus">
                <text class="label">所在校区</text>
                <view class="val-wrap">
                    <text>{{ campusName }}</text>
                    <tz-icon v-if="detail.campus_id" name="enter" color="#86909C" :size="13" class="row-arrow" />
                </view>
            </view>
        </view>
        <view class="school-block school-block--rows">
            <view class="block-title">请假详情</view>
            <view class="row"><text class="label">请假类型</text><text>{{ typeName }}</text></view>
            <view class="row"><text class="label">班级名称</text><text>{{ detail.class_name || '-' }}</text></view>
            <view class="row"><text class="label">课程名称</text><text>{{ detail.course_name || '-' }}</text></view>
            <view class="row"><text class="label">课次</text><text>{{ sessionText }}</text></view>
            <view class="row"><text class="label">请假原因</text><text>{{ detail.reason || '-' }}</text></view>
            <view class="row"><text class="label">提交时间</text><text>{{ detail.createtime_text || '-' }}</text></view>
        </view>
        <view class="school-block school-block--rows">
            <view class="block-title">审批记录</view>
            <view class="ld-logs">
                <view class="ld-log-item">
                    <view class="ld-log-rail">
                        <view class="ld-log-dot" />
                    </view>
                    <view class="ld-log-body">
                        <view>申请已提交</view>
                        <view class="ld-log-time">{{ detail.createtime_text || '-' }}</view>
                    </view>
                </view>
                <view class="ld-log-item" v-if="detail.audit_time > 0">
                    <view class="ld-log-rail">
                        <view class="ld-log-dot" />
                    </view>
                    <view class="ld-log-body">
                        <view>{{ detail.status == 1 ? '已通过' : '已拒绝' }}</view>
                        <view class="ld-log-remark" v-if="detail.status == 2 && detail.audit_remark">拒绝理由：{{ detail.audit_remark }}</view>
                        <view class="ld-log-time">{{ auditTimeText }}</view>
                    </view>
                </view>
                <view class="ld-log-item" v-if="detail.status == 3">
                    <view class="ld-log-rail">
                        <view class="ld-log-dot" />
                    </view>
                    <view class="ld-log-body">
                        <view>请假已取消</view>
                        <view class="ld-log-time">{{ cancelTimeText }}</view>
                    </view>
                </view>
            </view>
        </view>
        </template>
        <!-- 请假单不存在或被撤销：空状态；其他异常：失败提示 -->
        <view class="empty-wrap" v-else>
            <u-empty icon="/static/image/empty.png" width="70" height="70" :text="emptyText" />
        </view>
        </template>
        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
