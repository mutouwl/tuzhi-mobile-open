<script>
import { listTitle, applyH5Share, mpCard } from "@/common/utils/checkin-share";
var that;
export default {
  data() {
    return {
      id: 0,
      taskId: 0,
      isMakeup: false,
      loading: true,
      submitting: false,
      uploading: false,
      info: null,
      notFound: false,
      loadMsg: "",
      task: null,
      rule: { tip: "", template: "", require: null },
      content: "",
      mediaForm: { images: [], videos: [], audio: {}, files: [] },
      // 媒体上限与可选文件类型：由 checkin.checkin.publishConfig 下发（口径只存后端 MediaLimit 一处）。
      // 这里的初值只在接口还没回来的那一瞬兜住模板取值，取到即以接口为准整体覆盖（与圈子发布页同一写法）
      limits: {
        media_image_limit: 9,
        media_video_limit: 9,
        media_audio_limit: 1,
        media_file_limit: 9,
        media_image_video_limit: 9,
        media_file_types: "",
        media_image_enable: 1,
        media_video_enable: 1,
        media_audio_enable: 1,
        media_file_enable: 1,
      },
      visibleTo: 0,
      // 动态可见对象被任务级定死时为 true：那一行整条隐藏，不给一个改了没反应的开关
      visibleLocked: false,
      recordId: 0,
      // 编辑自己的日记：>0 即编辑态（日记详情页「更多 - 编辑」带 record_id 进来），
      // 与 recordId（刚提交成功那条的 id）分开存，别互相覆盖
      editId: 0,
      finished: false,
    };
  },
  computed: {
    isEdit() {
      return !!this.editId;
    },
    // 主按钮文案：编辑态出「保存修改」，普通打卡/补卡口径不变
    submitText() {
      if (this.isEdit) return "保存修改";
      return this.isMakeup ? "补打卡" : "发表日记";
    },
    // 微信分享卡片（列表页口径）：提交页挂在具体活动下，标题用「活动名 · 发表动态」、封面用活动封面
    // （深链/分享可直达本页，卡片只写「发表动态」认不出是哪个活动）
    shareTitle() {
      return listTitle(this.info && this.info.title, "发表日记");
    },
    shareCover() {
      return (this.info && this.info.cover) || "";
    },
    requireItems() {
      const r = this.rule.require || {};
      const items = [];
      if (r.text_min) items.push(r.text_min + "个字");
      if (r.images_min) items.push(r.images_min + "张图片");
      if (r.videos_min) items.push(r.videos_min + "个视频");
      if (r.audios_min) items.push(r.audios_min + "条语音");
      return items;
    },
    requireText() {
      return this.requireItems.length ? "至少上传" : "";
    },
    // 注意事项：前两条是拍摄建议（与内容无关），第三条把接口下发的各类上限拼出来——
    // 原先整段文字写死在模板里，后端改了上限页面还说旧数字，正是「页面说 9 条、提交按别的数拒」
    noteLines() {
      const lines = [
        "1. 视频文件过大时压缩时间较长，请耐心等待",
        "2. 建议您调整手机拍摄清晰度选择720p及以下的规格进行拍摄",
      ];
      const l = this.limits || {};
      const parts = [];
      if (l.media_image_video_limit) parts.push("图片+视频最多添加" + l.media_image_video_limit + "条");
      if (l.media_audio_limit) parts.push("语音最多添加" + l.media_audio_limit + "条");
      if (l.media_file_enable !== 0 && l.media_file_limit) {
        const types = String(l.media_file_types || "").split(",").filter(Boolean).join("/");
        parts.push("附件最多添加" + l.media_file_limit + "个" + (types ? "（仅 " + types + "）" : ""));
      }
      if (parts.length) lines.push("3. " + parts.join("；"));
      return lines;
    },
  },
  onLoad(options) {
    that = this;
    if (!that.$tools.systemConfig("app_isinstall_checkin")) {
      uni.showToast({ title: "打卡功能未安装", icon: "none" });
      setTimeout(() => uni.navigateBack(), 800);
      that.loading = false; // 兜底分支也要撤骨架：这一页只弹一句 toast 就留在灰块上，看着像「一直加载中」
      return;
    }
    that.id = Number(options.id || 0);
    that.taskId = Number(options.task_id || 0);
    that.isMakeup = options.makeup === "1";
    // 动态详情页「更多 - 编辑」带 record_id 进来：同一张表单进编辑态（H5 无原生标题栏，标题只在小程序端生效）
    that.editId = Number(options.record_id || 0);
    if (that.editId) uni.setNavigationBarTitle({ title: "编辑日记" });
    // 上传开关与可见范围现在是「这个任务」的配置：先取到任务行再问一次配置，
    // 早一步发出去只能拿到不带任务的全局配置，页面会先亮出四类上传入口、提交才被拒
    that.getData().then(() => that.loadLimits());
  },
  // 模块级 that 停在最后 onLoad 的实例上；本页重新可见先收回绑定。
  // 本页可能被同一个路由压在栈里两次（编辑态从日记详情再进来），提交/上传这些动作都读 that，
  // 不收回就会把提交结果与 loading 写到已销毁的那一个实例上（症状：提交后一直转、页面不动）
  onShow() {
    that = this;
  },
  methods: {
    // 分享卡片口径见 common/utils/checkin-share：H5 走 JSSDK，小程序端走下面的 onShare* 钩子
    applyShare() {
      applyH5Share(this.$nav, this.shareTitle, this.shareCover);
    },
    pad(n) { return n < 10 ? "0" + n : "" + n; },
    fmt(ts) {
      if (!ts) return "--";
      const d = new Date(ts * 1000);
      return d.getFullYear() + "-" + this.pad(d.getMonth() + 1) + "-" + this.pad(d.getDate()) + " " + this.pad(d.getHours()) + ":" + this.pad(d.getMinutes()) + ":" + this.pad(d.getSeconds());
    },
    // 编辑态先取这条日记（正文/媒体/可见范围与它挂的任务），再取活动与规则；
    // 顺序不能反：规则与提示要按任务口径出，而任务 id 只在日记里
    getData() {
      if (!that.editId) return that.loadActivity();
      return that.$api("checkin.checkin.diaryDetail", { checkin_id: that.id, record_id: that.editId })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            that.notFound = true;
            that.loadMsg = (ret && ret.msg) || "日记不存在或已删除";
            that.loading = false;
            return;
          }
          const rec = ret.data || {};
          that.taskId = Number(rec.task_id) || 0;
          that.content = rec.content || "";
          that.visibleTo = Number(rec.visible_to) || 0;
          // 媒体结构与 tz-media-editor 的 v-model 对齐：后端 images/videos/audios 存的都是 URL 字符串，
          // 视频与语音要还原成 {url,name,size}；本页表单只支持一条语音，取首项
          that.mediaForm = {
            images: (rec.images || []).slice(),
            videos: (rec.videos || []).map((u) => (typeof u === "string" ? { url: u, name: "视频", size: 0 } : u)).filter(Boolean),
            audio: (rec.audios || []).length ? { url: rec.audios[0], name: "语音", size: 0 } : {},
            // 附件列本来就是 {url,name,size}，与编辑器的 v-model 同形，直接接回来即可
            files: (rec.files || []).slice(),
          };
          return that.loadActivity();
        })
        .catch(() => {
          that.notFound = true;
          that.loadMsg = "加载失败，请重试";
          that.loading = false;
        });
    },
    loadActivity() {
      return that.$api("checkin.checkin.detail", { checkin_id: that.id })
        .then((ret) => {
          if (!ret || ret.code !== 1) {
            // 拦截器只 toast 一秒，规则/活动名取不到时必须留下后端给的原因，否则是个没有表单说明的白屏
            if (!that.info) {
              that.notFound = true;
              that.loadMsg = (ret && ret.msg) || "打卡活动不存在或已下架";
            }
            that.loading = false;
            return;
          }
          that.info = ret.data;
          that.notFound = false;
          that.loadMsg = "";
          if (that.taskId) {
            that.task = (ret.data.tasks || []).filter((t) => t.id == that.taskId)[0] || null;
            // 深链/分享可直达提交页：未解锁、时间窗外的任务在这里挡住，
            // 原因文案由后端逐条下发（check_msg），与提交接口拒绝时说的是同一句话。
            // 编辑态不判这条：日记早就提交成功了，窗外的日子恰恰是要改的对象
            // 拦挡用原生确认弹窗（只给「知道了」，2026-09-26 用户口径）：这一句里带着「等到几点」的时刻，
            // 一秒的 toast 来不及读；点掉弹窗才退页，不再 toast + 800ms 自动退
            if (!that.isEdit && that.task && that.task.can_check == 0) {
              that.showGuard(that.task.check_msg);
              return;
            }
          }
          // 规则：任务优先，否则活动默认规则
          if (that.task) {
            let req = that.task.require;
            if (typeof req === "string" && req) { try { req = JSON.parse(req); } catch (e) { req = null; } }
            that.rule = { tip: that.task.tip || "", template: that.task.template || "", require: req };
            if (!that.isEdit && !that.content && that.task.template) that.content = that.task.template;
          } else {
            that.rule = {
              tip: ret.data.default_tip || "",
              template: ret.data.default_template || "",
              require: ret.data.default_require && Object.keys(ret.data.default_require).length ? ret.data.default_require : null,
            };
            if (!that.isEdit && !that.content && ret.data.default_template) that.content = ret.data.default_template;
          }
          that.loading = false;
          // 分享标题要带活动名，放在数据回调最后一步（H5 分享调用抛异常会中断前面的渲染）
          this.applyShare();
        })
        .catch(() => {
          if (!that.info) {
            that.notFound = true;
            that.loadMsg = "加载失败，请重试";
          }
          that.loading = false;
        });
    },
    // 深链/分享直达本页却被任务闸门拦住：原生确认弹窗（只给「知道了」，样式用 uni.showModal 本体，
    // 2026-09-26 用户口径）把后端那句原因说清，读完（几点解锁/先完成哪一关）点「知道了」才退页
    showGuard(msg) {
      uni.showModal({
        title: "暂时不能打卡",
        content: msg || "当前不能打卡",
        showCancel: false,
        confirmText: "知道了",
        confirmColor: "#0968f6",
        complete: () => uni.navigateBack(),
      });
    },
    onUploadingChange(v) {
      that.uploading = !!v;
    },
    // 工具条三个入口转调媒体编辑器的选择器（微信小程序模板里不写内联转调，统一走显式方法）
    pickImage() {
      if (that.uploading) return;
      that.$refs.mediaEditor.chooseImage();
    },
    pickVideo() {
      if (that.uploading) return;
      that.$refs.mediaEditor.chooseVideo();
    },
    pickAudio() {
      if (that.uploading) return;
      that.$refs.mediaEditor.chooseAudio();
    },
    pickFile() {
      if (that.uploading) return;
      that.$refs.mediaEditor.chooseFile();
    },
    // 媒体上限、可上传种类与动态可见对象以后端一处为准（SubmitConfig 已按任务级 require 叠加过）；
    // 取不到就保持初值不误拦，失败原因由请求层 toast，页面不留白
    loadLimits() {
      return that.$api("checkin.checkin.publishConfig", { checkin_id: that.id, task_id: that.taskId || 0 }).then((ret) => {
        if (!ret || ret.code !== 1 || !ret.data) return;
        that.limits = Object.assign({}, that.limits, ret.data);
        // 任务级定死了谁能看：这一行整条隐藏（留着一个改了不生效的开关最容易被当成坏了），
        // 并把落库值按后端给的填上——提交时后端还会再覆盖一次，这里只是让页面显示的与发出去的一致
        if (Number(ret.data.visible_locked) === 1) {
          that.visibleLocked = true;
          that.visibleTo = Number(ret.data.visible_to) || 0;
        }
      });
    },
    doSubmit() {
      const images = (that.mediaForm.images || []).map((x) => (typeof x === "string" ? x : x.url)).filter(Boolean);
      const videos = (that.mediaForm.videos || []).map((x) => (typeof x === "string" ? x : x.url)).filter(Boolean);
      const audios = [];
      if (that.mediaForm.audio && that.mediaForm.audio.url) audios.push(that.mediaForm.audio.url);
      // 附件必须带文件名与大小（卡片按文件名出类型图标、后端按扩展名与大小判上限），只留有地址的条目
      const files = (that.mediaForm.files || [])
        .map((f) => ({ url: (f && f.url) || "", name: (f && f.name) || "附件文件", size: Number(f && f.size) || 0 }))
        .filter((f) => f.url);
      if (!that.content.trim() && !images.length && !videos.length && !audios.length && !files.length) {
        uni.showToast({ title: "请填写打卡内容", icon: "none" });
        return;
      }
      const imageVideoLimit = Number(that.limits.media_image_video_limit) || 0;
      if (imageVideoLimit > 0 && images.length + videos.length > imageVideoLimit) {
        uni.showToast({ title: "图片+视频最多添加" + imageVideoLimit + "条", icon: "none" });
        return;
      }
      that.submitting = true;
      // 编辑态：走 editOwn（只回内容与可见范围），保存后退出本页；
      // 不参与「日签图 → 动态栏」那条新发布收尾链，改完就回来看这条日记
      if (that.isEdit) {
        that.$api("checkin.checkin.editOwn", {
          checkin_id: that.id,
          record_id: that.editId,
          visible_to: that.visibleTo,
          content: that.content,
          images: images,
          videos: videos,
          audios: audios,
          files: files,
        })
          .then((ret) => {
            that.submitting = false;
            if (!ret || ret.code !== 1) return;
            uni.showToast({ title: "修改成功", icon: "none" });
            // 退回上一页后不在这里替它取数：被返回的那一页（日记详情页 / 打卡记录页 / 活动主页 / 任务详情页）
            // 各自的 onShow 会重取，口径见 ui-baseline-mobile M20「退栈时列表页 onShow 顺手重取」。
            // 原先这里靠本页 onUnload 调 `getCurrentPages()[length - 2].$vm.getData()`，H5 端够错了页：
            // onUnload 由 router.afterEach 触发，那一刻 getCurrentPages 已把本页摘掉（uni-h5 create-app.js
            // 「删除已经准备销毁的上个页面」），length-2 取到的是目标页再下面的一层，于是「改完退回来
            // 数据没刷新」（2026-09-25 用户点名，日记详情页改完仍显示旧正文）。
            setTimeout(() => uni.navigateBack(), 800);
          })
          .catch(() => {
            that.submitting = false;
          });
        return;
      }
      that.$api("checkin.checkin.submit", {
        checkin_id: that.id,
        task_id: that.taskId,
        is_makeup: that.isMakeup ? 1 : 0,
        visible_to: that.visibleTo,
        content: that.content,
        images: images,
        videos: videos,
        audios: audios,
        files: files,
      })
        .then((ret) => {
          that.submitting = false;
          if (!ret || ret.code !== 1) return;
          // 这条日记的 id 只有在这里能拿到：详情页靠它打开，并在数据到位后自动弹日签图
          that.recordId = (ret.data && ret.data.record_id) || 0;
          that.finishToDiary();
        })
        .catch(() => {
          that.submitting = false;
        });
    },
    // 打卡成功的收尾（口径由用户 2026-09-25 两次点名定下，2026-09-25 再修一次落点）：
    // **不在提交页弹日签图**，而是关掉本页 → 回到「把本页打开的那一页」→ 由那一页打开这条新日记的
    // 详情（带 daily=1）→ 详情页取到数据后弹日签图。动态列表必须垫在详情下面（从详情按返回落回列表）。
    // ⚠ 开详情这件事**不能**挂在 navigateBack / redirectTo 的 success 里：H5 端这两个 API 的 success
    // 是「同步立即」回调的（uni 平台层 `onAppRoute` 直接返回 errMsg，`wrapper` 拿到返回值当场
    // invokeCallbackHandler；此时 `router.go(-delta)`/`router.replace` 的历史遍历还没执行），
    // 在 success 里 navigateTo 会和未落定的后退/替换互踩，最终落在列表页甚至退回提交页（用户实测：
    // 提交后停在打卡列表 `checkin/index/index`，没进动态详情）。改成把「要打开的日记 id」交给承接页
    // 自己：退栈这一支写在它的 vm 上（pendingDiaryId），深链这一支走 ?open_record=，由它在 onShow 里开。
    // 承接页按页面栈从近到远找第一个对得上的（M20③）：任务详情页（本页由它的「立即打卡」打开）与
    // 活动主页两处都能自己开详情、也都在 onShow 重取本页动态；原先只认活动主页，从任务详情页打卡的人
    // 被一路退到活动主页，从日记按返回就再也回不到那条任务（2026-09-25 用户点名）。
    // 深链/分享直达提交页时栈里没有承接页，用 redirectTo 换到活动主页
    // （navigateBack 在这种情况下静默失败，人就卡在提交页）。
    finishToDiary() {
      // 防重复：连点提交或接口重投时这条退栈链只能走一次，否则会多退一层、多开一层详情
      if (that.finished) return;
      that.finished = true;
      // record_id 取不到（老后端没回）就只回列表页，不开一条 ?id=undefined 的详情
      const recordId = Number(that.recordId) || 0;
      const DETAIL = "/pages/app/checkin/detail/detail";
      const TASK = "/pages/app/checkin/taskdetail/taskdetail";
      const pages = getCurrentPages();
      for (let i = pages.length - 2; i >= 0; i--) {
        const vm = pages[i].$vm;
        if (!vm) continue;
        const route = that.pageRoute(pages[i]);
        // 任务详情页按 task_id 对（活动主页那层还在它下面，先撞上近的这一个）
        if (route === TASK && Number(that.taskId) && Number(vm.taskId) === Number(that.taskId)) {
          vm.pendingDiaryId = recordId;
          uni.navigateBack({ delta: pages.length - 1 - i });
          return;
        }
        // 路由对得上还要 id 对得上才算入口页：日记卡的「活动 chip」会再开一层别的主页
        if (route === DETAIL && Number(vm.id) === Number(that.id)) {
          if (vm.showFeedTab) vm.showFeedTab();
          vm.pendingDiaryId = recordId;
          uni.navigateBack({ delta: pages.length - 1 - i });
          return;
        }
      }
      uni.redirectTo({ url: DETAIL + "?id=" + that.id + "&tab=feed&open_record=" + recordId });
    },
    // 页面路由在小程序挂在 page.route，H5 端还有 page.$page.route，统一成 "/a/b/c" 再比
    pageRoute(page) {
      const route = (page && (page.route || (page.$page && page.$page.route))) || "";
      return "/" + String(route).replace(/^\//, "");
    },
  },
  // 小程序转发/朋友圈卡片：与 H5 同一份标题封面（口径见 common/utils/checkin-share）
  onShareAppMessage() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover);
  },
  onShareTimeline() {
    return mpCard(this.$nav, this.shareTitle, this.shareCover, true);
  },
};
</script>
