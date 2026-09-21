<template>
    <view class="teacher-detail">
        <!-- 初始化骨架屏：版式对齐校区详情页（头像卡 + 信息行卡 + 内容卡） -->
        <view class="skeleton-page" v-if="skeletonLoading">
            <view class="school-sk-card">
                <view class="td-sk-head">
                    <view class="sk-avatar"></view>
                    <view class="sk-head-info">
                        <u-skeleton :loading="true" :animate="true" :title="true" title-width="60%" title-height="20" />
                        <u-skeleton class="sk-gap" :loading="true" :animate="true" :title="true" title-width="40%" title-height="14" />
                    </view>
                </view>
            </view>
            <view class="school-sk-card">
                <view class="sk-cell" v-for="i in 3" :key="i">
                    <u-skeleton :loading="true" :animate="true" :title="true" title-width="25%" title-height="14" :rows="1" rows-width="50%" rows-height="14" />
                </view>
            </view>
            <view class="school-sk-card">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="16" :rows="3" rows-width="100%" rows-height="12" />
            </view>
            <view class="school-sk-card">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="16" :rows="3" rows-width="100%" rows-height="12" />
            </view>
        </view>
        <template v-else>
            <template v-if="form.info.id">
                <!-- 教师头卡：头像（无头像首字占位）+ 姓名 + 简介描述 -->
                <view class="head-card">
                    <view class="avatar-wrap">
                        <image class="avatar-img" :src="form.info.avatar" mode="aspectFill" v-if="form.info.avatar && !avatarError" @error="onAvatarError" />
                        <!-- 头像加载失败：图片图标填充（同校区 LOGO 兜底） -->
                        <view class="avatar-icon" v-else-if="form.info.avatar">
                            <tz-icon name="picture" :size="26" color="#C9CDD4" />
                        </view>
                        <view class="avatar-placeholder" v-else>{{ (form.info.name || '?').slice(0, 1) }}</view>
                    </view>
                    <view class="head-info">
                        <view class="head-name">{{ form.info.name }}</view>
                        <view class="head-campus" v-if="form.info.intro">
                            <text class="head-campus-txt">{{ form.info.intro }}</text>
                        </view>
                    </view>
                </view>

                <!-- 基本信息：信息行列表 -->
                <view class="teacher-detail-section" v-if="form.info.gender || form.info.phone">
                    <tz-title title="基本信息" :more="false" />
                    <tz-box :padding="0">
                        <view class="cell-card">
                            <view class="cell-item" v-if="form.info.gender">
                                <view class="cell-label">性别</view>
                                <view class="cell-value">
                                    <text class="cell-value-text">{{ form.info.gender == 1 ? '男' : '女' }}</text>
                                </view>
                            </view>
                            <view class="cell-item" v-if="form.info.phone" @click="openContact">
                                <view class="cell-label">联系电话</view>
                                <view class="cell-value">
                                    <text class="cell-value-text">{{ phoneText }}</text>
                                </view>
                            </view>
                        </view>
                    </tz-box>
                </view>

                <!-- 授课课程套餐：最多展示三个，超出后跳转课程套餐列表（按讲师筛选）。
                     数据由排课关联课程反查对应课程套餐，直接复用课程套餐列表组件（与套餐列表/校区详情套餐区同款调用：默认「课程套餐」角标、点击进套餐详情） -->
                <view class="teacher-detail-section">
                    <tz-title title="授课课程" :more="form.packages.length > 3" subtitle="更多" @click="morePackages" />
                    <tz-box padding="0 15px 15px">
                        <tz-package v-if="form.packages.length" :round="true" :list="form.packages.slice(0, 3)"></tz-package>
                        <u-empty
                            v-else
                            icon="/static/image/empty.png"
                            width="70"
                            height="70"
                            text="暂无授课课程"
                        />
                    </tz-box>
                </view>

                <!-- 所属校区：卡片用共用组件 tz-campus，风格与校区列表页完全一致（封面边长/间距/行首图标一律走组件默认值） -->
                <view class="teacher-detail-section" v-if="form.campuses.length">
                    <tz-title title="所属校区" :more="false" />
                    <tz-box padding="0 15px 15px">
                        <tz-campus :list="form.campuses" @click="goCampus" />
                    </tz-box>
                </view>
            </template>
            <view class="school-empty-box" v-else>
                <u-empty
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    :text="emptyText"
                />
            </view>
        </template>

        <!-- 联系电话操作弹窗（共用组件 tz-contact-popup）：复制 / 拨打；号码为空时不弹窗 -->
        <tz-contact-popup :show="contactPopup" type="phone" :phone="form.info.phone" @close="contactPopup = false" />

        <tz-hover-btn />
        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>