<template>
  <!--
    回放列表弹层。版式对齐校务模块的 Popup 档（参照 pages/app/school/package/components/
    course-select-popup.vue、campus/detail 的教师列表）：u-popup 底部弹出 + 面板自带顶部圆角
    + 标题 16px/600 左对齐（不再是居中的 .popup-header 那一版）+ 关闭用 u-popup 自带的右上角关闭。
    本组件是 isolated 的（小程序端全局 .school-popup 进不来），故按 tz-nickname-modal 的写法
    在组件内自带一份同一组数值；滚动区用 tz-popup-list（确定高度，禁止 min/max-height，M6）。

    列表底色档（2026-10-02 用户点名「给列表增加一个浅灰色的背景，列表中间不同成员中间不要再有分隔条，
    浅灰色的背景要有一个内边距给它隔开，上下列表之间要有外边距，背景应该是特别浅的灰色」）：
    整块列表吃一块 #f7f8fa（全站浅灰档），发丝线全部去掉、按 index 收口那套随之作废（M6
    「行改成底色分块时整档让位」），行与行之间改由行自身的上下内衬隔开。
  -->
  <u-popup
    :show="show"
    mode="bottom"
    :round="12"
    bgColor="transparent"
    :closeable="true"
    :safeAreaInsetBottom="false"
    @close="close"
    @open="open"
  >
    <view class="pbk-popup">
      <view class="pbk-popup-title">回放列表</view>

      <!-- 列表区按 M6 的「选项类 46vh」给确定高度（这一弹窗只有几条回放；校务那两只选择弹窗用组件默认
           60vh 那一档，条数少时下方留白更多）；小程序端 scroll-view 只给 min/max-height 会滑不动。
           底部那一格内衬交给内容最后一块（.pbk-body 的 margin-bottom）自己给，滚动画布只管左右内衬 -->
      <tz-popup-list height="46vh" padding="0 16px" :refreshable="false">
        <!-- 内容外层：存在的唯一目的是那一格底部内衬，空态那一支也要有（M6「底部内衬由内容最后一块给」） -->
        <view class="pbk-body">
          <!-- 列表块：整块吃 #f7f8fa（全站浅灰档），块内 4px 上下内衬把行与灰底边缘隔开、
               块外 4px 上外边距与标题那一行隔开（M6「底色分块」那一档：发丝线全部去掉、
               按 index 收口那套随之作废，行与行之间只由行自身的上下内衬隔开） -->
          <view class="pbk-list" v-if="loading || videoList.length">
            <!-- 取数中的骨架行：与真实行逐块对齐（序号块 + 名称条 + 状态条 + 行尾播放位），
                 块色比全站骨架那一档 #e5e6eb 深一档（压在 #f7f8fa 上 #e5e6eb 只有 1.17:1、
                 几乎看不出来，参照 pages/app/agent/center 的 .agent-sk-deep 那一档） -->
            <view class="pbk-sk" v-if="loading">
              <view class="pbk-sk-row" v-for="index in 4" :key="'pbk-sk-' + index">
                <view class="pbk-sk-no"></view>
                <view class="pbk-sk-main">
                  <view class="pbk-sk-name"></view>
                  <view class="pbk-sk-state"></view>
                </view>
                <view class="pbk-sk-play"></view>
              </view>
            </view>

            <u-cell-group v-else :border="false">
              <u-cell
                size="large"
                v-for="(item, index) in videoList"
                :key="item.id || item.file_path || index"
                :class="[{ 'pbk-active': index === activeIndex }]"
                @click="play(index)"
                :border="false"
              >
                <view slot="title" class="pbk-name">{{ item.file_name }}</view>
                <view slot="title" class="pbk-state">{{ stateText(item, index) }}</view>
                <view slot="icon">
                  <view class="pbk-no">{{ index + 1 }}.</view>
                </view>
                <view slot="value">
                  <u-icon
                    name="play-right"
                    :color="index === activeIndex ? '#0968f6' : '#c9cdd4'"
                  />
                </view>
              </u-cell>
            </u-cell-group>
          </view>

          <u-empty
            v-else
            icon="/static/image/empty.png"
            width="70"
            height="70"
            :text="loadError || '暂无回放视频'"
          />
        </view>
      </tz-popup-list>
    </view>
  </u-popup>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      activeIndex: null,
      videoList: [],
      show: false,
      loading: false,
      // 列表取数失败时的那句原因（M13：失败分支必须有可读出口，不能渲染成「暂无回放视频」）
      loadError: "",
      requestId: 0,
    };
  },
  computed: {},
  props: {
    courseId: {
      type: [String, Number],
      default: 0,
    },
    visible: {
      type: Boolean,
      default: false,
    },
    currentVideoUrl: {
      type: String,
      default: "",
    },
  },
  watch: {
    courseId() {
      // that.getData();
    },
    visible() {
      this.show = this.visible;
      if (this.show) {
        this.getData();
      }
    },
    currentVideoUrl() {
      this.syncActiveIndex();
    },
  },
  methods: {
    /**
     * 点击某一条回放：只有真的拿到播放地址才把这一行标成「正在播放」并把地址交给播放器。
     * 地址为空（点播转码未完成、取址失败）时把原因说出口并留在原状态——原先无论有没有地址
     * 都先改 activeIndex 再 emit，父级 `if (!url) return` 静默退出，用户读出来就是
     * 「列表显示正在播放、画面没有任何反应」（M13：点了没反应必须给一句原因）
     */
    play(index) {
      var item = this.videoList[index] || {};
      var url = String(item.file_path || "");
      if (!url) {
        uni.showToast({ title: "回放地址获取失败，请稍后重试", icon: "none" });
        return;
      }
      this.activeIndex = index;
      this.$emit("play", url);
    },
    /**
     * 一行只表达一件事：正在播放 / 暂不可播 / 待播放。
     * 「暂不可播」是这一条本身没有可播放地址，与用户挑哪一条无关
     */
    stateText(item, index) {
      if (index === this.activeIndex) {
        return "正在播放";
      }
      if (!item || !item.file_path) {
        return "暂不可播";
      }
      return "待播放";
    },
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", true);
    },
    /**
     * M26：本页可能在这一批回调回来之前就退回上一页，晚到的回调写 data 会把
     * 整条 setData 通道拖死（症状是所有页面停在骨架屏），判据用 Vue 自己的销毁标记
     */
    gone() {
      return this._isDestroyed === true || this._isBeingDestroyed === true;
    },
    normalizeVideoUrl(url) {
      return String(url || "").split("#")[0].split("?")[0];
    },
    syncActiveIndex() {
      if (!this.currentVideoUrl || !this.videoList.length) {
        this.activeIndex = null;
        return;
      }

      var currentUrl = this.normalizeVideoUrl(this.currentVideoUrl);
      this.activeIndex = this.videoList.findIndex((item) => {
        return this.normalizeVideoUrl(item.file_path) === currentUrl;
      });
      if (this.activeIndex < 0) {
        this.activeIndex = null;
      }
    },
    getData() {
      var currentRequestId = ++this.requestId;
      this.loading = true;
      this.videoList = [];
      this.activeIndex = null;
      this.loadError = "";

      this
        .$api("live.room.playback", {
          course_id: this.courseId,
        })
        .then((res) => {
          if (this.gone() || currentRequestId !== this.requestId) return;
          if (res.code === 1) {
            this.videoList = Array.isArray(res.data) ? res.data : [];
            this.syncActiveIndex();
            return;
          }
          // M13：接口回失败也要有可读出口——只 toast 一秒的话，这一格会被读成「这家店没有回放」，
          // 而真因可能是取址/权限失败；文案吃后端那句，前端不另存一套
          this.loadError = (res && res.msg) || "回放列表加载失败，请重试";
        })
        .catch(() => {
          if (this.gone() || currentRequestId !== this.requestId) return;
          this.loadError = "回放列表加载失败，请重试";
        })
        .then(() => {
          if (this.gone() || currentRequestId === this.requestId) {
            this.loading = false;
          }
        });
    },
  },
  mounted() {
    this.show = this.visible;
  },
};
</script>

<style scoped>
/* 面板与标题对齐全局教务档 .school-popup / .school-popup-title：组件是 isolated 的，
   全局档进不来，故在这里自带一份同一组数值（写法同 tz-nickname-modal、校务 course-select-popup）。
   安全区由面板自身承担（模板已关 u-popup 的 safeAreaInsetBottom），微信端按教务口径减半 */
.pbk-popup {
  background: #fff;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /*  #ifdef  MP-WEIXIN  */
  padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
  padding-bottom: calc(env(safe-area-inset-bottom) / 2);
  /*  #endif  */
}

.pbk-popup-title {
  padding: 15px 16px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
  text-align: left;
}

/* 内容外层：只承担那一格底部内衬。空态（u-empty）与列表两支都在它里面，
   换句话说「弹层底部留白」不由滚动画布的 padding 给、也不由面板给，只由这一格给 */
.pbk-body {
  margin-bottom: 12px;
}

/* 列表块：整块吃一块特别浅的灰（#f7f8fa = 全站浅灰档，M5 那一条「列表区与上方吸底区同一轮背景色」
   与 M6 底色分块那一档都取这一档）。块自身留 4px 上下内衬把行与灰底边缘隔开，
   块外留 4px 上外边距与标题那一行隔开；行与行之间不再有任何发丝线，
   间距只由行自身的上下内衬（u-cell size=large 的 13px）给 */
.pbk-list {
  margin-top: 4px;
  padding: 4px 0;
  border-radius: 8px;
  background: #f7f8fa;
}

.pbk-no {
  font-size: 16px;
  font-weight: 700;
  color: #86909c;
  width: 30px;
}

.pbk-name {
  font-size: 14px;
  /* 行高写死：骨架那一列按同一个 39px 盒子摆（.pbk-sk-main），两档行盒逐字相等、加载完不跳版 */
  line-height: 20px;
  color: #1d2129;
}

/* 状态行：12px 辅助灰（§1 辅助信息档）。压在 #f7f8fa 上实算 3.05:1 —— 与它压白底时的 3.24:1
   同一档（#f7f8fa 是中性浅灰、与 #86909c 同一支，不是 M6「有色底」那一族，换色系的条件不成立）；
   序号 #86909c 3.05:1、行名 #1d2129 15.2:1、主色 #0968f6 4.57:1 逐档都算过。
   要把这一档提到 ≥4.5 得换 #4e5969（压 #f7f8fa 为 6.68:1），那是全站辅助灰的口径变更、
   要连同其它调用点一起改，不在本次「加一块浅灰底」的范围内 */
.pbk-state {
  margin-top: 2px;
  font-size: 12px;
  line-height: 17px;
  color: #86909c;
}

.pbk-active .pbk-name,
.pbk-active .pbk-state {
  color: #0968f6;
}

/* ===== 骨架：与真实行同一块灰底、同一块留白（.pbk-sk-row 的上下内衬与 u-cell large 的 13px 逐字对齐），
   加载完不跳版（M16）。占位块四块（序号 / 名称 / 状态 / 行尾播放位）共用一条声明，
   颜色与圆角只写一处。压在这块 #f7f8fa 上不能用全站骨架灰 #e5e6eb —— 实算只有 1.17:1、
   等于没画；按 pages/app/agent/center 的 .agent-sk-deep 那一档加深一档（#d6d8de），
   仍是同一支中性灰、与灰底同族，不是另引入一个色系 */
.pbk-sk-row {
  display: flex;
  align-items: center;
  padding: 13px 15px;
}
.pbk-sk-no,
.pbk-sk-name,
.pbk-sk-state,
.pbk-sk-play {
  border-radius: 4px;
  background-image: linear-gradient(90deg, #d6d8de 25%, #c9cdd4 37%, #d6d8de 50%);
  background-size: 400% 100%;
  animation: pbk-sk-animate 1.8s ease infinite;
}
/* 序号位：与真实行 .pbk-no 同一列宽（30），行内那一格才对得齐 */
.pbk-sk-no {
  width: 30px;
  height: 16px;
  flex: none;
}
/* 中间那一列写死 39px = 真实行 .pbk-name 的 20 + .pbk-state 的 margin 2 + 17，
   灰块在盒内上下均分（M16「灰块盒 + 上下外衬 = 真实行盒」，不是行盒本身） */
.pbk-sk-main {
  flex: 1;
  min-width: 0;
  height: 39px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.pbk-sk-name {
  height: 14px;
  width: 62%;
}
.pbk-sk-state {
  height: 12px;
  width: 26%;
}
/* 行尾播放位：与真实行那枚 u-icon 同一尺寸（u-icon 默认 16px），居中方式也同由行容器的 align-items 给 */
.pbk-sk-play {
  width: 16px;
  height: 16px;
  margin-left: 10px;
  flex: none;
}
/* 流光与全站骨架同节奏（u-skeleton 内置 90deg / 1.8s），不另写一套 */
@keyframes pbk-sk-animate {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
