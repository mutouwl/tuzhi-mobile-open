<template>
    <view class="school-page school-page--bar">
        <!-- 初始化骨架屏 -->
        <view class="skeleton-page" v-if="skeletonLoading">
            <view class="school-sk-card">
                <view class="sk-goods">
                    <view class="sk-cover"></view>
                    <view class="sk-lines">
                        <u-skeleton :loading="true" :animate="true" :title="true" title-width="70%" title-height="18" :rows="2" rows-width="50%" rows-height="14" />
                    </view>
                </view>
            </view>
            <view class="school-sk-card">
                <view class="sk-cell" v-for="i in 2" :key="i">
                    <u-skeleton :loading="true" :animate="true" :title="true" title-width="25%" title-height="14" :rows="1" rows-width="50%" rows-height="14" />
                </view>
            </view>
        </view>
        <template v-else>
            <!-- 套餐信息（共用商品卡组件，与订单详情报名信息弹窗同源）；本页走通栏口径，圆角关掉 -->
            <package-goods-card
                class="goods-card-slot"
                :round="false"
                :cover="form.cover"
                :name="form.name"
                :sku-name="sku.name"
                :price="sku.price"
                :lessons="skuLessons"
                :valid-text="validText"
            />
            <!-- 校区回显（弹层内选定）；上课学生支持本页切换，默认带入缓存选中的学生 -->
            <view class="school-cell-card">
                <view class="school-cell-item">
                    <view class="school-cell-label">校区</view>
                    <view class="school-cell-value">
                        <text class="school-cell-value-text" :class="{ 'cell-placeholder': !campusName }">{{ campusName || '-' }}</text>
                    </view>
                </view>
                <view class="school-cell-item student-cell" @click="studentPopup = true">
                    <view class="school-cell-label">上课学生</view>
                    <!-- 已选学生复用「选择上课学生」弹层的列表样式（头像 + 姓名 + 班级标签）；
                         school-cell-value 挂到小程序的组件宿主节点上撑满剩余宽度，箭头才会贴右（组件内部的 flex:1 只作用在 H5 端） -->
                    <student-info class="school-cell-value" :student="student" v-if="student.id" />
                    <view class="school-cell-value" v-else>
                        <text class="school-cell-value-text cell-placeholder">请选择上课学生</text>
                    </view>
                    <view class="school-cell-arrow"><tz-icon name="enter" color="#86909C" :size="13" /></view>
                </view>
            </view>
        </template>
        <view class="school-footer h5-bottom-bar" v-if="!skeletonLoading">
            <!-- 文案与目标页同名（提交订单页），点击后先关掉本页再进提交订单页，返回时不再退回确认报名页 -->
            <u-button class="submit-btn" type="primary" text="提交订单" @click="goSubmit"></u-button>
        </view>

        <!-- 选择上课学生弹层 -->
        <student-select-popup
            :show="studentPopup"
            :student-id="student.id"
            @confirm="onStudentPicked"
            @close="studentPopup = false"
        />

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
