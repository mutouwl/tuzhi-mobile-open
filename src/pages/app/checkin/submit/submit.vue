<template>
  <view class="school-page school-page--bar">
    <!-- 首屏骨架屏（替代整页 Loading）：外壳直接用真实区块的 .school-block（通栏、直角、无阴影），
         灰块与真实版式逐块对齐（任务卡两行 / 正文输入区含媒体工具条 186 高 / 可见范围行） -->
    <block v-if="loading">
      <!-- 骨架外壳与真实头卡挂同一个 cs-task-head：贴顶规则只有一份，加载完成不会忽然多出一条灰缝 -->
      <view class="school-block cs-sk-card cs-task-head">
        <u-skeleton :loading="true" :animate="true" :title="true" title-width="52%" title-height="17" :rows="1" :rows-width="['68%']" rows-height="12" />
      </view>
      <view class="school-block cs-sk-card cs-sk-area"></view>
      <view class="school-block cs-sk-card cs-sk-line-row">
        <view class="cs-sk-line"></view>
        <view class="cs-sk-chip"></view>
      </view>
    </block>
    <view v-if="!loading && !notFound">
      <!-- 任务信息头：通栏白块（.school-block 白底无圆角无阴影 + .school-head 内衬 14/16，照确认报名页头部卡） -->
      <view class="school-block school-head cs-task-head">
        <view class="cs-task-title">{{ task ? task.title : '普通日记打卡' }}</view>
        <view class="cs-task-date" v-if="task && task.show_time != 0">{{ fmt(task.start_time) }} 至 {{ fmt(task.end_time) }}</view>
        <view class="cs-task-date" v-else-if="!task">该日记不会关联到任何打卡任务</view>
      </view>

      <!-- 规则提示与要求条：同为通栏块（自带底色，不借 .school-block 的白底），与上下卡片贴齐不露灰底 -->
      <view class="cs-tip" v-if="rule.tip">{{ rule.tip }}</view>
      <view class="cs-require" v-if="requireText">
        <text class="cs-require-label">至少上传：</text>
        <text class="cs-require-item" v-for="(t, i) in requireItems" :key="i">{{ t }}</text>
      </view>

      <!-- 内容输入：正文 + 计数 + 已选媒体同处一张通栏白块（左右内衬 16 与表单区块同线）；
           四类媒体「入口」与圈子发布页一样落在吸底栏，图片九宫格跟在计数行下面 -->
      <view class="school-block cs-editor">
        <textarea class="cs-textarea" v-model="content" :placeholder="rule.template ? '' : '请输入日记内容...'" :maxlength="10000"
          auto-height style="min-height: 140px;" />
        <view class="cs-count">{{ content.length }}/10000</view>
        <!-- 媒体九宫格收进正文卡内（照教务请假申请页 .imgs-block 的摆法，圈子发布页同样在留白内）：
             跟着白卡吃 16px 左右内衬，不再通栏铺到屏幕两边 —— 通栏时一行最后一格的删除按钮（right:-6px）
             会顶出视口，选满 3 张（正好一行）整页就能左右滑 -->
        <view class="cs-media">
          <tz-media-editor ref="mediaEditor" v-model="mediaForm" :max-images="limits.media_image_limit" :max-videos="limits.media_video_limit"
            :max-audio="limits.media_audio_limit" :max-files="limits.media_file_limit" :size-limits="limits" :file-types="limits.media_file_types"
            :media-enables="limits" :disabled="uploading" @uploading-change="onUploadingChange" />
        </view>
      </view>

      <!-- 可见范围：行卡走教务表单行档 .school-cell-card + .school-cell-item（通栏、直角、行内衬 14/16、
           1px #f7f8fa 分隔线）；与上面的正文卡贴齐，两卡之间补一条 1px #f2f3f5 分割线。
           任务级已定死可见对象时整条隐藏（visible_locked 由 publishConfig 下发），不给一个改了不生效的开关 -->
      <view class="school-cell-card cs-visible-card" v-if="!visibleLocked">
        <view class="school-cell-item cs-visible">
          <text class="cs-visible-label">打卡可见范围</text>
          <view class="cs-visible-chips">
            <view :class="['cs-visible-chip', visibleTo === 0 ? 'cs-visible-chip-active' : '']" @tap="visibleTo = 0">所有人</view>
            <view :class="['cs-visible-chip', visibleTo === 1 ? 'cs-visible-chip-active' : '']" @tap="visibleTo = 1">仅管理员</view>
          </view>
        </view>
      </view>

      <!-- 注意事项：各类上限那句由 publishConfig 的返回值拼出来，不在模板里写死数字 -->
      <view class="cs-notes">
        <view v-for="(line, i) in noteLines" :key="i">{{ line }}</view>
      </view>

      <!-- 吸底操作栏：与圈子发布页同构（左＝四类媒体入口、右＝主操作单按钮），容器与安全区仍走全局
           .school-footer；媒体入口按接口开关逐类显隐、上传中置灰，点击转调 tz-media-editor 的选择器
           （附件与圈子动态同一档，上限与可选类型由 checkin.checkin.publishConfig 下发，前端不写死数字） -->
      <view class="school-footer h5-bottom-bar cs-footer">
        <view class="cs-toolbar">
          <view class="cs-tool" :class="uploading ? 'cs-tool-disabled' : ''" v-if="limits.media_image_enable !== 0" @tap="pickImage">
            <tz-icon name="picture" :size="22" color="#4e5969" />
          </view>
          <view class="cs-tool" :class="uploading ? 'cs-tool-disabled' : ''" v-if="limits.media_video_enable !== 0" @tap="pickVideo">
            <tz-icon name="video" :size="22" color="#4e5969" />
          </view>
          <view class="cs-tool" :class="uploading ? 'cs-tool-disabled' : ''" v-if="limits.media_audio_enable !== 0" @tap="pickAudio">
            <tz-icon name="sound-on" :size="22" color="#4e5969" />
          </view>
          <view class="cs-tool" :class="uploading ? 'cs-tool-disabled' : ''" v-if="limits.media_file_enable !== 0" @tap="pickFile">
            <tz-icon name="document" :size="22" color="#4e5969" />
          </view>
        </view>
        <tz-button class="cs-btn-primary" size="normal" type="primary" :disabled="submitting || uploading" :text="submitText" @click="doSubmit"></tz-button>
      </view>
    </view>

    <!-- 活动不可访问：不给一张提交不出去的空表单 -->
    <u-empty v-if="!loading && notFound" :text="loadMsg" icon="/static/image/empty.png" width="70" height="70" margin-top="80"></u-empty>

    <!-- 深链被任务闸门拦住的原生确认弹窗（只给「知道了」）由 js.vue 的 showGuard 直接调起（uni.showModal）：
         内容是后端逐条下发的 check_msg（与提交接口拒绝时同一句），点掉它才退页 -->

    <!-- 日签图（分享海报）不在本页弹：提交成功即退出本页进这条日记的详情页，由详情页自动弹出（M-P3 交互闭环） -->
  </view>
</template>

<script src="./js.vue"></script>
<style>
@import "./css.css";
</style>
