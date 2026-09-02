<template>
  <div>
    <!-- 申请/接听 弹窗（底部弹出） -->
    <u-popup
      :show="show"
      @close="close"
      :closeable="false"
      :round="12"
      mode="bottom"
      bgColor="transparent"
      :overlayStyle="{ zIndex: 10200 }"
      :zIndex="10210"
    >
      <div class="link-apply-modal">
        <!-- 右上角关闭按钮（对齐 redpacket 弹窗） -->
        <div class="modal-close" @click="close">
          <tz-icon name="close" color="#fff" :size="12" />
        </div>

        <!-- 标题 -->
        <div class="apply-title">{{ modalTitle }}</div>
        <div class="apply-desc">{{ modalDesc }}</div>

        <!-- 数据加载中（骨架屏）：点击工具条立即弹窗，状态确认前先展示骨架 -->
        <template v-if="mode == 'pending'">
          <div class="record-scroll apply-skeleton">
            <div class="apply-skeleton-item" v-for="index in 3" :key="index">
              <u-skeleton
                :loading="true"
                :animate="true"
                :avatar="true"
                avatar-shape="circle"
                avatar-size="32"
                :title="true"
                title-width="40%"
                title-height="14"
                :rows="1"
                rows-width="55%"
                rows-height="12"
              />
            </div>
          </div>
        </template>

        <!-- 被禁止申请连麦（个人禁止/全场禁止主动连麦）：空态提示，不展示语音/视频选择 -->
        <template v-if="mode == 'disabled'">
          <div class="apply-disabled">
            <u-empty icon="/static/image/empty.png" width="70" height="70" text="当前禁止连麦"></u-empty>
          </div>
        </template>

        <!-- 模式选择（主动申请，列表形式；点击后选中项显示加载状态） -->
        <template v-if="mode == 'apply'">
          <div class="apply-type-list">
            <div
              class="apply-type-item"
              :class="{ 'is-loading': applyLoadingType == 2, 'is-muted': applyLoadingType > 0 && applyLoadingType != 2 }"
              @click="confirmType(2)"
            >
              <div class="type-icon">
                <u-loading-icon
                  v-if="applyLoadingType == 2"
                  mode="circle"
                  size="18"
                  color="#0968f6"
                ></u-loading-icon>
                <tz-icon v-else name="sound-on" color="#0968f6" :size="18" />
              </div>
              <div class="type-info">
                <text class="type-text">语音连麦</text>
                <text class="type-desc">{{ applyLoadingType == 2 ? '正在提交语音连麦申请' : '仅开启麦克风' }}</text>
              </div>
              <tz-icon name="right" color="#c9cdd4" :size="12" />
            </div>
            <div
              class="apply-type-item"
              :class="{ 'is-loading': applyLoadingType == 1, 'is-muted': applyLoadingType > 0 && applyLoadingType != 1 }"
              @click="confirmType(1)"
            >
              <div class="type-icon">
                <u-loading-icon
                  v-if="applyLoadingType == 1"
                  mode="circle"
                  size="18"
                  color="#0968f6"
                ></u-loading-icon>
                <tz-icon v-else name="video" color="#0968f6" :size="18" />
              </div>
              <div class="type-info">
                <text class="type-text">视频连麦</text>
                <text class="type-desc">{{ applyLoadingType == 1 ? '正在提交视频连麦申请' : '开启摄像头与麦克风' }}</text>
              </div>
              <tz-icon name="right" color="#c9cdd4" :size="12" />
            </div>
          </div>
        </template>

        <!-- 收到讲师邀请（接听/拒绝） -->
        <template v-if="mode == 'invite'">
          <view class="invite-body">
            <view class="invite-icon-wrap">
              <view class="invite-icon">
                <tz-icon :name="inviteLinkType == 2 ? 'sound-on' : 'video'" color="#86909c" :size="26" />
              </view>
            </view>
            <div class="invite-info">
              <text class="invite-type">{{ inviteLinkType == 2 ? '语音连麦邀请' : '视频连麦邀请' }}</text>
            </div>
          </view>
        </template>

        <!-- 连麦记录（连麦申请弹窗）：仅展示最近一条记录（最新状态即可操作），申请中可取消、讲师邀请可接听/拒绝 -->
        <template v-if="mode == 'record'">
          <div class="record-loading" v-if="recordLoading">
            <u-loading-icon mode="circle" size="36" color="#0968f6"></u-loading-icon>
            <text class="record-loading-text">加载中...</text>
          </div>
          <scroll-view scroll-y class="record-scroll" v-else>
            <template v-if="visibleRecords.length > 0">
              <div
                class="record-item"
                v-for="(item, index) in visibleRecords"
                :key="item.id || index"
              >
                <div class="record-item-icon">
                  <tz-icon
                    :name="item.link_type == 2 ? 'sound-on' : 'video'"
                    color="#0968f6"
                    :size="16"
                  />
                </div>
                <div class="record-info">
                  <text class="record-type">{{ item.link_type_text }}</text>
                  <text class="record-meta">
                    {{ item.inviter == 1 ? '讲师邀请' : '学员申请' }} · {{ $tools.formatDate(item.createtime) }}
                  </text>
                </div>
                <div class="record-right">
                  <!-- 申请中：学员申请可取消 / 讲师邀请可接听拒绝 -->
                  <template v-if="item.status == 0">
                    <div
                      v-if="item.inviter != 1"
                      class="record-btn record-btn-cancel"
                      @click="cancelRecord(item)"
                    >
                      取消连麦
                    </div>
                    <template v-else>
                      <div
                        class="record-btn record-btn-accept"
                        :class="{ 'is-loading': isRecordLoading(item, 'accept') }"
                        @click="acceptRecord(item)"
                      >
                        <u-loading-icon
                          v-if="isRecordLoading(item, 'accept')"
                          mode="circle"
                          size="11"
                          color="#fff"
                          inactiveColor="rgba(255,255,255,0.35)"
                        ></u-loading-icon>
                        <text v-else>接听</text>
                      </div>
                      <div
                        class="record-btn record-btn-reject"
                        :class="{ 'is-loading': isRecordLoading(item, 'reject') }"
                        @click="rejectRecord(item)"
                      >
                        <u-loading-icon
                          v-if="isRecordLoading(item, 'reject')"
                          mode="circle"
                          size="11"
                          color="#f53f3f"
                          inactiveColor="rgba(245,63,63,0.2)"
                        ></u-loading-icon>
                        <text v-else>拒绝</text>
                      </div>
                    </template>
                  </template>
                  <!-- 连麦中：讲师已同意但尚未上麦时可直接进入连麦 -->
                  <template v-else-if="item.status == 1">
                    <div class="record-btn record-btn-accept" @click="enterLinkByRecord(item)">
                      进入连麦
                    </div>
                  </template>
                  <text v-else class="record-status" :class="'status-' + item.status">
                    {{ item.status_text }}
                  </text>
                </div>
              </div>
            </template>
            <div class="record-empty" v-else>
              <u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无连麦记录"></u-empty>
            </div>
          </scroll-view>
        </template>

        <!-- 底部操作：加载中不显示操作；邀请弹窗只提供接听/拒绝；
             记录弹窗仅在没有进行中记录（申请中/连麦中）时显示「申请连麦」入口 -->
        <div class="apply-actions" v-if="mode != 'pending'">
          <template v-if="mode == 'invite'">
            <div
              class="apply-btn-accept"
              :class="{ 'is-loading': inviteAction == 'accept', 'is-muted': inviteAction == 'reject' }"
              @click="acceptLink"
            >
              <template v-if="inviteAction == 'accept'">
                <u-loading-icon mode="circle" size="13" color="#fff" inactiveColor="rgba(255,255,255,0.35)"></u-loading-icon>
                <text class="apply-btn-text">接听中</text>
              </template>
              <text v-else>接听</text>
            </div>
            <div
              class="apply-btn-reject"
              :class="{ 'is-loading': inviteAction == 'reject', 'is-muted': inviteAction == 'accept' }"
              @click="rejectLink"
            >
              <template v-if="inviteAction == 'reject'">
                <u-loading-icon mode="circle" size="13" color="#fff" inactiveColor="rgba(255,255,255,0.35)"></u-loading-icon>
                <text class="apply-btn-text">拒绝中</text>
              </template>
              <text v-else>拒绝</text>
            </div>
          </template>
          <template v-else-if="mode == 'record'">
            <div
              v-if="!hasActiveRecord && !recordLoading"
              class="apply-btn-cancel"
              @click="handleCancel"
            >
              申请连麦
            </div>
          </template>
          <div
            v-else
            class="apply-btn-cancel"
            @click="handleCancel"
          >
            {{ cancelText }}
          </div>
        </div>
      </div>
    </u-popup>
  </div>
</template>

<script src="./link-apply.js"></script>

<style scoped>
@import "./css.css";
</style>
