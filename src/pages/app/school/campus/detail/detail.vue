<template>
    <view class="campus-detail">
        <!-- 初始化骨架屏：版式对齐套餐详情页（环境图 + 名称卡 + 信息行卡 + 内容卡） -->
        <view class="skeleton-page" v-if="skeletonLoading">
            <view class="cd-sk-banner"></view>
            <view class="school-sk-card">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="60%" title-height="20" />
            </view>
            <view class="school-sk-card">
                <view class="sk-cell" v-for="i in 4" :key="i">
                    <u-skeleton :loading="true" :animate="true" :title="true" title-width="25%" title-height="14" :rows="1" rows-width="50%" rows-height="14" />
                </view>
            </view>
            <view class="school-sk-card">
                <u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="16" :rows="3" rows-width="100%" rows-height="12" />
            </view>
        </view>
        <template v-else>
            <template v-if="form.info.id">
                <!-- 顶部环境图：对齐实物商品详情页轮播图（100vw 高度上限 480px、白底等比缩放、不自动轮播），未上传环境图时回退校区 LOGO，均无则占位；点击全屏预览 -->
                <swiper
                    class="banner"
                    :indicator-dots="true"
                    :autoplay="false"
                    :circular="true"
                    indicator-color="rgba(0, 0, 0, .3)"
                    indicator-active-color="#0968f6"
                    v-if="banners.length"
                >
                    <swiper-item v-for="(b, i) in banners" :key="i">
                        <image class="banner-img" :src="b" mode="aspectFit" @tap="previewImage(i)" />
                    </swiper-item>
                </swiper>
                <view class="banner banner-placeholder" v-else>
                    <tz-icon name="coordinates" :size="48" color="#C9CDD4" />
                </view>

                <!-- 名称卡片：仅标题，版式对齐课程详情页（标题 16px/500）；地址移入下方信息行列表 -->
                <view class="title-card">
                    <view class="title-text">{{ form.info.name }}</view>
                </view>

                <!-- 校区信息：标题对齐课程套餐/教师区块标题，信息行（联系人/电话/地址/营业时间；电话与地址点击快捷复制） -->
                <view class="campus-detail-section" v-if="form.info.contact_name || form.info.contact_phone || form.info.business_hours || form.info.address">
                    <tz-title title="校区信息" :more="false" />
                    <tz-box :padding="0">
                        <view class="cell-card">
                            <view class="cell-item" v-if="form.info.contact_name">
                                <view class="cell-label">联系人</view>
                                <view class="cell-value">
                                    <text class="cell-value-text">{{ form.info.contact_name }}</text>
                                </view>
                            </view>
                            <view class="cell-item" v-if="form.info.contact_phone" @click="openContact('phone')">
                                <view class="cell-label">电话</view>
                                <view class="cell-value">
                                    <text class="cell-value-text">{{ phoneText }}</text>
                                </view>
                            </view>
                            <view class="cell-item" v-if="form.info.address" @click="openContact('address')">
                                <view class="cell-label">地址</view>
                                <view class="cell-value">
                                    <text class="cell-value-text">{{ form.info.address }}</text>
                                </view>
                            </view>
                            <view class="cell-item" v-if="form.info.business_hours">
                                <view class="cell-label">营业时间</view>
                                <view class="cell-value">
                                    <text class="cell-value-text">{{ form.info.business_hours }}</text>
                                </view>
                            </view>
                        </view>
                    </tz-box>
                </view>

                <!-- 课程套餐：最多展示三个，超出后跳转课程套餐列表（按校区筛选） -->
                <view class="campus-detail-section">
                    <tz-title title="课程套餐" :more="form.packages.length > 3" subtitle="更多" @click="morePackages" />
                    <tz-box padding="0 15px 15px">
                        <tz-package v-if="form.packages.length" :round="true" :list="form.packages.slice(0, 3)"></tz-package>
                        <u-empty
                            v-else
                            icon="/static/image/empty.png"
                            width="70"
                            height="70"
                            text="暂无课程套餐"
                        />
                    </tz-box>
                </view>

                <!-- 教师：最多展示三个，超出后弹出教师列表弹窗（卡片共用 tz-school-teacher） -->
                <view class="campus-detail-section" v-if="form.teachers.length">
                    <tz-title title="教师" :more="form.teachers.length > 3" subtitle="更多" @click="teacherPopup = true" />
                    <tz-box padding="0 15px 15px">
                        <tz-school-teacher :list="form.teachers.slice(0, 3)" />
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
        <!-- 教师列表弹窗 -->
        <u-popup :show="teacherPopup" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="teacherPopup = false">
            <view class="school-popup cd-popup">
                <view class="school-popup-title">教师列表</view>
                <tz-popup-list padding="4px 0 8px" :refreshable="false">
                    <!-- 弹窗内的老师与页面上的教师卡片同样可点进教师详情（navigate 默认开启） -->
                    <tz-school-teacher :list="form.teachers" />
                    <u-empty
                        v-if="!form.teachers.length"
                        icon="/static/image/empty.png"
                        width="70"
                        height="70"
                        text="暂无教师"
                    />
                </tz-popup-list>
            </view>
        </u-popup>

        <!-- 联系电话/地址操作弹窗（共用组件 tz-contact-popup）：电话→复制/拨打，地址→复制/导航（导航按当前环境直接调起地图） -->
        <tz-contact-popup
            :show="contactPopup"
            :type="contactType"
            :phone="form.info.contact_phone"
            :address="form.info.address"
            :location="campusLocation"
            :title="contactPopupTitle"
            @close="contactPopup = false"
        />

        <tz-hover-btn />
        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
