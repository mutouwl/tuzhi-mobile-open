<template>
  <div>
    <u-popup
      :show="show"
      title="更多"
      @close="close"
      :overlayStyle="{ zIndex: 10100 }"
      :zIndex="10110"
      @open="open"
      :overlay="true"
      :closeable="true"
      :round="10"
    >
      <tz-box bgColor="none">
        <div class="control-box">

            <div
            class="control-btn"
            @click="$nav.to('/pages/index/index', 'local', 'reLaunch')"
          >
            <tz-icon name="homepage" color="#1D2129" :size="30" />
            <div>首页</div>
          </div>

          <div class="control-btn" @click="$nav.to('/pages/order/list/list', 'local')">
            <div><tz-icon name="createtask" color="#1D2129" :size="30" /></div>
            <div>订单管理</div>
          </div>
          <div
            class="control-btn"
            @click="$nav.to('/pages/user/index/index', 'local', 'reLaunch')"
          >
            <div><tz-icon name="people" color="#1D2129" :size="30" /></div>
            <div>个人中心</div>
          </div>

          <div
            class="control-btn"
            @click="modal.detail = true"
            v-if="showLiveDetail"
          >
            <div><tz-icon name="barrage" color="#1D2129" :size="30" /></div>
            <div>直播详情</div>
          </div>
          <div class="control-btn" @click="modal.bindData = true" v-if="bindData && bindData.length > 0">
            <div><tz-icon name="document" color="#1D2129" :size="30" /></div>
            <div>课程资料</div>
          </div>
          <div class="control-btn" @click="modal.courseware = true">
            <div><tz-icon name="accessory" color="#1D2129" :size="30" /></div>
            <div>直播课件</div>
          </div>

          <div class="control-btn" @click="modal.interaction = true">
            <div><tz-icon name="task" color="#1D2129" :size="30" /></div>
            <div>互动内容</div>
          </div>
          <div class="control-btn" @click="collect()">
            <div v-if="iscollect">
              <tz-icon name="collection_fill" color="#0968f6" :size="30" />
            </div>
            <div v-else><tz-icon name="collection" color="#1D2129" :size="30" /></div>
            <div>收藏直播</div>
          </div>
          
          
        </div>
      </tz-box>
    </u-popup>

    <!-- 相关资料  start-->
    <bind-data
      title="直播课件"
      @close="modal.courseware = false"
      :visible="modal.courseware"
      :list="coursewareList"
    />
    <!-- 相关资料  end-->

    <!-- 相关资料  start-->
    <bind-data
      title="课程资料"
      @close="modal.bindData = false"
      :visible="modal.bindData"
      :list="bindData"
    />
    <!-- 相关资料  end-->

    <!-- 直播详情弹窗：封面 + 标题/简介 + 直播时间 + 详情介绍
         （信息区版式参照课程详情页，封面直接复用课程详情页同一个 banner 组件） -->
    <u-popup
      title="直播详情"
      v-if="modal.detail"
      :show="modal.detail"
      @close="modal.detail = false"
      @open="modal.detail = true"
      :closeable="true"
      :round="10"
      mode="bottom"
      :overlayStyle="{ zIndex: 10111 }"
      :zIndex="10121"
    >
      <div class="live-detail-popup">
        <banner :cover="liveCover" type="live" />
        <div class="live-detail-body">
          <div class="live-detail-title">{{ liveName }}</div>
          <div class="live-detail-brief" v-if="liveBriefing">{{ liveBriefing }}</div>
          <div class="live-detail-time" v-if="hasLiveTime">
            <live-start-time-bar
              :start-time="liveStartTime"
              :end-time="liveEndTime || liveStartTime"
            />
          </div>
          <tz-parse
            v-if="hasLiveDetail"
            :limitCopy="limit_copy == 1 ? true : false"
            :content="liveDetail"
            :selectable="true"
          ></tz-parse>
          <u-empty
            v-else
            icon="/static/image/empty.png"
            width="70"
            height="70"
            text="暂无详情介绍"
          />
        </div>
      </div>
    </u-popup>

    <!-- 互动弹窗 -->
    <u-popup
      title="互动"
      v-if="modal.interaction"
      :show="modal.interaction"
      @close="modal.interaction = false"
      @open="modal.interaction = true"
      :closeable="true"
      :round="10"
      mode="bottom"
      :overlayStyle="{ zIndex: 10111 }"
      :zIndex="10121"
    >
      <tz-box bgColor="none">
        <interaction-tab :course-id="courseId" />
      </tz-box>
    </u-popup>
  </div>
</template>

<script>
var that;
import bindData from "@/pages/course/components/bind-data.vue";
import interactionTab from "@/pages/course/components/interaction.vue";
import liveStartTimeBar from "@/components/course/live-start-time-bar.vue";
import banner from "@/components/course/banner.vue";
export default {
  components: { bindData, interactionTab, liveStartTimeBar, banner },
  data() {
    return {
      show: this.visible,
      modal: {
        //直播课件
        courseware: false,
        //课程资料
        bindData: false,
        detail: false,
        interaction: false,
      },
      //是否收藏
      iscollect: false,
      coursewareList: [],
      bind_data: [],
    };
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    courseId: {
      type: [String, Number],
      default: "",
    },
    bindData: {
      type: Array,
      default: () => [],
    },
    liveDetail: {
      type: String,
      default: () => "",
    },
    // 是否显示「直播详情」入口：仅直播间传入（直播详情对每场直播都有意义，
    // 不依赖详情介绍内容是否为空，空内容在弹窗内给出空状态）
    showLiveDetail: {
      type: Boolean,
      default: false,
    },
    // 直播封面/标题/简介：与课程详情页信息区同口径（封面复用 banner 组件）
    liveCover: {
      type: String,
      default: "",
    },
    liveName: {
      type: String,
      default: "",
    },
    liveBriefing: {
      type: String,
      default: "",
    },
    // 直播开始/结束时间：直播详情弹窗内展示本场直播时间
    liveStartTime: {
      type: [String, Number],
      default: 0,
    },
    liveEndTime: {
      type: [String, Number],
      default: 0,
    },
    limit_copy: {
      type: [Boolean, Number, String],
      default: false,
    },
  },
  computed: {
    // 详情介绍是否有内容（富文本空内容为 <p><br></p>）
    hasLiveDetail() {
      return !!this.liveDetail && this.liveDetail != "<p><br></p>";
    },
    // 是否有本场直播时间（未设置开播时间的直播间不展示时间条）
    hasLiveTime() {
      return Number(this.liveStartTime) > 0;
    },
  },
  watch: {
    visible() {
      this.show = this.visible;
      this.getIsCollect();
      this.getCoursewareList();
    },
  },
  methods: {
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },
    optionHandle(index) {
      this.$emit("jump", index);
    },
    control(type) {
      this.$emit("control", type);
    },

    getCoursewareList() {
      var courseId = this.courseId;
      that
        .$api("live.courseware.list", {
          course_id: courseId,
        })
        .then((res) => {
          that.coursewareList = res.data;
        });
    },

    /**
     * 获取是否收藏
     */
    getIsCollect() {
      var courseId = this.courseId;
      that
        .$api("user.collect.getIsCollect", {
          item_id: that.courseId,
          type: "course",
        })
        .then((res) => {
          that.iscollect = res.data;
        });
    },
    /**
     * 取消收藏/收藏课程
     */
    collect() {
      var courseId = this.courseId;
      that
        .$api("user.collect.setCollect", {
          item_id: courseId,
          type: "course",
        })
        .then((res) => {
          uni.$u.toast(res.msg);
          that.getIsCollect();
        });
    },
  },
  created() {
    that = this;
  },
  mounted() {
    that = this;
    this.show = this.visible;
  },
};
</script>

<style scoped>
.control-box {
  width: 100%;
  padding: 0 15px 15px;

  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 每行三列 */
  grid-row-gap: 20px; /* 行间距 */
  grid-column-gap: 10px; /* 列间距 */

  z-index: 100;
  border-top-right-radius: 10px;
  border-top-left-radius: 10px;
}

.control-btn {
  text-align: center;
  font-size: 12px;
  color: #1d2129;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px; /* 图标与文字距离 */
}

.popup-title {
  width: 100%;
  height: 50px;
  line-height: 50px;
  font-size: 14px;
  text-align: center;
  border-bottom: 1px solid #efefef;
}

/* 直播详情弹窗：封面 + 标题/简介 + 直播时间 + 详情介绍，内容随高度自适应、超长时弹窗内滚动 */
.live-detail-popup {
  width: 100%;
  max-height: 70vh;
  overflow-y: auto;
}

/* 信息区留白：封面整宽，文字与详情介绍统一左右 15px */
.live-detail-body {
  padding: 12px 15px 15px;
}

.live-detail-title {
  color: #1d2129;
  font-weight: 500;
  font-size: 16px;
}

.live-detail-brief {
  color: #86909c;
  font-size: 12px;
  margin-top: 6px;
}

.live-detail-time {
  margin-top: 12px;
}
</style>
