<template>
    <view class="school-page school-page--bar">
        <!-- 状态页签吸顶：与订单列表 /pages/order/list/list 同款（裸 u-tabs + 组件默认配色，不写页面级覆写），滚动长列表时页签常驻 -->
        <u-sticky bgColor="#fff" style="padding-bottom: 2px;" :offsetTop="0">
            <u-tabs :list="tabs" :current="current" :scrollable="true" @change="tabChange">
                <!-- 时间范围筛选入口：走 u-tabs 自带的 right 插槽落在页签行右侧（不挤压页签的横向滚动区），
                     图标用「时间范围」（shijianfanwei2），尺寸与选中色跟圈子搜索页、流水页共用的
                     tz-search-filter-bar 筛选按钮保持同一口径 -->
                <template #right>
                    <view class="bl-filter-btn" @click="toggleFilter">
                        <tz-icon name="shijianfanwei2" :size="20" :color="filterActive ? '#0968f6' : '#86909c'" />
                    </view>
                </template>
            </u-tabs>
        </u-sticky>

        <view class="bl-list">
            <!-- 列表骨架屏：仿「左侧时间轴 + 预约卡」版式（左列日期灰块与轨道灰点由 tz-school-timeline 渲染，
                 口径与真行一致传 mode="date"，只占一块灰块） -->
            <block v-if="loading && !list.length">
                <tz-school-timeline v-for="n in 3" :key="n" skeleton mode="date" card-radius="0">
                    <view class="bl-head">
                        <view class="bl-sk-bar bl-sk-title"></view>
                        <view class="bl-sk-bar bl-sk-status"></view>
                    </view>
                    <view class="bl-sk-bar bl-sk-line"></view>
                    <view class="bl-sk-bar bl-sk-line short"></view>
                    <view class="bl-ops"><view class="bl-sk-bar bl-sk-btn"></view></view>
                </tz-school-timeline>
            </block>
            <template v-else>
                <!-- 预约时间轴：左侧课次日期 + 轨道圆点，右侧预约卡（与「我的课表」同款共用组件 tz-school-timeline）
                     本页列表跨多天且分页加载（按天分组头会在翻页处被拆成两段），故不做按天分组，
                     左列改为按日期扫读（mode=date），时间段回到卡内「课次」行（与详情弹层同一口径）；
                     卡体传 card-radius=0：教务列表页条目卡统一不做圆角，组件默认 10px 圆角仍供其他页使用 -->
                <tz-school-timeline
                    v-for="(b, i) in list"
                    :key="b.id"
                    :first="i === 0"
                    :last="i === list.length - 1"
                    mode="date"
                    card-radius="0"
                    :date-text="shortDate(b)"
                    :dot-color="statusClass(b.status)"
                    @card-click="openDetail(b)"
                >
                    <!-- 卡片头部：课程名（标识）+ 状态，对齐订单卡「订单号 + 状态」版式 -->
                    <view class="bl-head">
                        <text class="bl-title">{{ b.course_name || '预约课程' }}</text>
                        <text class="bl-status" :class="statusClassMap[b.status] || 'gray'">{{ b.status_text }}</text>
                    </view>
                    <view class="bl-row">
                        <text class="bl-label">课次</text>
                        <text class="bl-value">{{ (b.date_text || '-') + ' ' + (b.start_time || '') + '-' + (b.end_time || '') }}</text>
                    </view>
                    <view class="bl-row">
                        <text class="bl-label">上课地点</text>
                        <text class="bl-value">{{ b.campus_name || '-' }}{{ b.classroom_name ? ' ' + b.classroom_name : '' }}</text>
                    </view>
                    <view class="bl-row">
                        <text class="bl-label">上课老师</text>
                        <text class="bl-value">{{ b.main_teacher || '-' }}</text>
                    </view>
                    <view class="bl-row">
                        <text class="bl-label">消耗课时</text>
                        <text class="bl-value">{{ b.lessons }}</text>
                    </view>
                    <!-- 取消原因：已取消记录带出机构填的原因（提交后没通过的预约靠它说明缘由），
                         没有原因（学生自行取消）时整行不出现 -->
                    <view class="bl-row" v-if="b.status == 3 && b.cancel_reason">
                        <text class="bl-label">取消原因</text>
                        <text class="bl-value">{{ b.cancel_reason }}</text>
                    </view>
                    <!-- 取消预约：待确认/待上课可取消；取消规则不允许取消时置灰，外壳接管点击说明原因
                         按钮尺寸取 mid（mini 放大 1/3），与「我的课表」「预约上课」卡片内操作按钮一致 -->
                    <view class="bl-ops" v-if="b.status == 0 || b.status == 1" @click.stop>
                        <view class="bl-btn" @click="onCancelTap(b)">
                            <tz-button size="mid" text="取消预约" :disabled="!canCancel(b)"></tz-button>
                        </view>
                    </view>
                </tz-school-timeline>
                <!-- 分页加载：预约记录随学期增长，滚到底部续拉下一页；已无下一页时不再展示 -->
                <view class="bl-loadmore" v-if="list.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
                <u-empty
                    v-if="!list.length && !loading"
                    icon="/static/image/empty.png"
                    width="70"
                    height="70"
                    :text="emptyText"
                />
            </template>
        </view>

        <view class="bl-footer h5-bottom-bar">
            <u-button class="bl-apply-btn" type="primary" text="预约上课" @click="goBook"></u-button>
        </view>

        <!-- 预约详情弹层：信息行改用 u-cell（large），字号/行高对齐订单详情参数行（备注、支付方式、订单号）
             （对齐教务模块弹层规范：u-popup + bgColor=transparent + round）
             安全区由弹层自身 padding 承担，关掉 u-popup 的安全区补白，避免白底下方多出一条遮罩缝 -->
        <u-popup
            :show="detailVisible"
            mode="bottom"
            :round="10"
            closeable
            bgColor="transparent"
            :safeAreaInsetBottom="false"
            :zIndex="10075"
            :overlayStyle="{ zIndex: 10070 }"
            @close="detailVisible = false"
        >
            <view class="bl-popup">
                <view class="bl-popup-title">预约详情</view>
                <u-cell-group :border="false">
                    <!-- 带 action 的行（上课地点/上课老师）出右箭头并响应点击，跳校区/教师详情页；
                         箭头交给 u-cell 的 is-link 承载：右侧图标区由组件按 is-link 决定渲染与否，
                         页面样式在小程序进不去 u-cell 内部，不适合自己塞图标 -->
                    <u-cell
                        v-for="(r, i) in detailRows"
                        :key="i"
                        size="large"
                        :border="false"
                        :title="r.label"
                        :value="r.value"
                        :is-link="!!r.action"
                        @click="onRowTap(r)"
                    ></u-cell>
                </u-cell-group>
                <!-- 操作行：取消入口与卡片同一判定（不可取消时置灰，外壳接管点击说明原因）；
                     课程详情入口只在预约已落定为课次时出现，两个按钮各占一半、次要动作靠左 -->
                <view class="bl-popup-ops" v-if="popupCancelable || canViewLesson">
                    <view class="bl-btn" v-if="popupCancelable" @click="onCancelTap(detailRow)">
                        <tz-button size="normal" long text="取消预约" :disabled="!canCancel(detailRow)"></tz-button>
                    </view>
                    <view class="bl-btn" v-if="canViewLesson" @click="goLesson">
                        <tz-button size="normal" long type="primary" text="课程详情"></tz-button>
                    </view>
                </view>
            </view>
        </u-popup>

        <!-- 多位主讲老师时的名单弹窗：复用课次详情的授课老师弹层（头像/身份/联系电话，每位可再点进各自详情）。
             放在详情弹层之外、并在打开它前先收起详情弹层，原因见 js.vue 的 showModalAboveDetail 注释：
             本页弹层层级为 10075/遮罩 10070，再叠一层同层级弹层会被压住 -->
        <teacher-info-popup :show="teacherPopupShow" :teachers="detailTeachers" @close="onTeacherPopupClose" />

        <!-- 预约筛选弹窗（仅时间范围，排序组隐藏）：与圈子搜索页右上角筛选按钮共用同一弹窗组件 -->
        <tz-filter-popup
            :visible="modal.filter"
            title="预约筛选"
            :sort-options="[]"
            :time-filter="timeFilter"
            :custom-range="customRange"
            @update:visible="modal.filter = $event"
            @confirm="onFilterConfirm"
        />

        <tz-tab-bar />
        <tz-footer />
    </view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
