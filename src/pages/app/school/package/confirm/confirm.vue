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
                :price="isScoreExchange ? scoreExchangeScore : displayPrice"
                :score-mode="isScoreExchange"
                :lessons="skuLessons"
                :valid-text="validText"
            />
            <!-- 校区 / 上课学生：本页就是「确认报名」这一步，两样都在这里拍板（校区走自定义校区选择弹窗，
                 与课时余额页同一只 `campus-select-popup`；学生走选择学生弹层，默认带入缓存选中的学生）。
                 拼团那一趟也从这里进来（2026-10-30：拼团同样要确认校区与学生），确认完再把校区/学生
                 交给结算页 —— 结算页不再摆任何校区/学生选择器。 -->
            <view class="school-cell-card">
                <view class="school-cell-item" @click="openCampusPicker">
                    <view class="school-cell-label">校区</view>
                    <view class="school-cell-value">
                        <text class="school-cell-value-text" :class="{ 'cell-placeholder': !campusName }">{{ campusText }}</text>
                    </view>
                    <view class="school-cell-arrow"><tz-icon name="enter" color="#86909C" :size="13" /></view>
                </view>
                <view class="school-cell-item student-cell" @click="studentPopup = true">
                    <view class="school-cell-label">上课学生</view>
                    <!-- 已选学生复用「选择上课学生」弹层的列表样式（头像 + 姓名）；
                         school-cell-value 挂到小程序的组件宿主节点上撑满剩余宽度，箭头才会贴右（组件内部的 flex:1 只作用在 H5 端） -->
                    <student-info class="school-cell-value" :student="student" :show-class="false" v-if="student.id" />
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
        <!-- 选择校区弹层（与课时余额页同一只：校区卡 + 右侧单选，复用 `tz-campus`，不另造版式） -->
        <campus-select-popup
            :show="campusPicker"
            :list="form.campus_list || []"
            :value="campusId"
            @select="onCampusPicked"
            @close="campusPicker = false"
        />

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
