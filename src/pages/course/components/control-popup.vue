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
            v-if="liveDetail && liveDetail != '<p><br></p>'"
          >
            <div><tz-icon name="barrage" color="#1D2129" :size="30" /></div>
            <div>直播介绍</div>
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

    <!-- 详情弹窗 -->
    <u-popup
      title="直播介绍"
      v-if="modal.detail && liveDetail && liveDetail != '<p><br></p>'"
      :show="modal.detail"
      @close="modal.detail = false"
      @open="modal.detail = true"
      :closeable="true"
      :round="10"
      mode="bottom"
      :overlayStyle="{ zIndex: 10111 }"
      :zIndex="10121"
    >
      <tz-box bgColor="none">

        <div style="height: 400px;width:100%; overflow-y: auto;">
          <tz-parse
            :limitCopy="limit_copy == 1 ? true : false"
            :content="liveDetail"
            :selectable="true"
          ></tz-parse>
        </div>
      </tz-box>
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
export default {
  components: { bindData, interactionTab },
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
    limit_copy: {
      type: [Boolean, Number, String],
      default: false,
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
</style>
