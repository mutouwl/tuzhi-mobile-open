<template>
    <view class="school-page school-page--bar">
        <view class="school-cards">
            <!-- 列表骨架屏：仿学生卡版式（圆形头像 + 两行文字 + 编辑按钮灰块），对齐教务其他列表骨架屏做法 -->
            <block v-if="loading && !students.length">
                <view class="sl-card" v-for="n in 4" :key="n">
                    <u-skeleton
                        :loading="true"
                        :animate="true"
                        :title="false"
                        :avatar="true"
                        avatar-size="44"
                        :rows="2"
                        :rows-width="['45%', '65%']"
                        rows-height="14"
                    />
                    <view class="sl-sk-btn"></view>
                </view>
            </block>
            <view class="sl-card" v-for="s in students" :key="s.id">
                <!-- 头像（含空头像/图片加载失败）统一走 u-avatar，与学生编辑页同一组件同一默认图，不再用姓名首字占位 -->
                <u-avatar class="avatar" :src="s.avatar" :size="44" mode="aspectFill" />
                <view class="sl-info">
                    <view class="name">{{ s.name }}</view>
                    <view class="phone" v-if="s.phone">{{ s.phone }}</view>
                </view>
                <view class="edit-btn" @click.stop="goEdit(s)">编辑</view>
            </view>
            <view class="loadmore" v-if="students.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
            <u-empty
                v-if="!students.length && !loading"
                icon="/static/image/empty.png"
                width="70"
                height="70"
                :text="studentLimit > 0 ? '暂无绑定学生，点击下方新建' : '暂无绑定学生'"
            />
        </view>
        <!-- 创建上限为 0 表示机构不允许学生自行创建，隐藏新建入口 -->
        <view class="school-footer h5-bottom-bar" v-if="studentLimit > 0">
            <u-button class="sl-add-btn" type="primary" text="新建学生" @click="goAdd"></u-button>
        </view>

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
