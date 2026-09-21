<script>
var that;
import backCourseModal from "@/pages/app/form/components/back-course-modal.vue";
import customForm from "@/pages/app/form/components/custom-form.vue";
export default {
  components: {
    backCourseModal,
    customForm,
  },
  data() {
    return {
      formKey: 0,
      loading: false,
      modal: {
        backCourse: false,
      },
      code: "",
      pageParams: {},

      formValue: {},
      components: [],
      page: [],
      formConfig: [],
      status_info: {},
      content_list: [],
      editmode: false,
    };
  },
  watch: {},
  methods: {
    toLogPage() {
      uni.navigateTo({
        url: "/pages/app/form/log/log",
      });
    },

    submitCheck() {
      if (that.pageParams.log_id) {
        uni.showModal({
          title: "确认提交修改的结果吗?",
          content: "你的修改将会替换之前填写的结果",
          success: function (res) {
            if (res.confirm) {
              that.submit();
            }
          },
        });
      } else {
        that.submit();
      }
    },

    //再填一份
    resubmit() {
      this.pageParams.log_id = 0;
      that.editmode = false;

      // 先递增key强制销毁组件
      this.formKey += 1;

      // 方法1：遍历清空每个字段（保持响应式）
      Object.keys(this.formValue).forEach(key => {
        this.$set(this.formValue, key, null);
      });
      
      // 方法2：使用小程序setData
      if (uni.setData) {
        const resetData = {};
        Object.keys(this.formValue).forEach(key => {
          resetData[`formValue.${key}`] = null;
        });
        uni.setData(resetData);
      }
      
      // 强制更新视图
      this.formKey += 1;
      this.$forceUpdate();
    },

    //修改表单
    editsubmit() {
      that.editmode = true;
    },

    //返回订单页
    goBackOrder() {
      uni.navigateBack();
    },

    submit() {
      var validateRequiredFields = this.validateRequiredFields(
        that.components,
        that.formValue
      );

      if (validateRequiredFields !== true) {
        return uni.$u.toast(validateRequiredFields);
      }
      that
        .$api("app.form.submit", {
          form_id: that.pageParams.id,
          log_id: that.pageParams.log_id,
          row: that.formValue,
        })
        .then((res) => {
          if (res.code == 1) {
            // 来自订单流程的表单，提交后返回订单页
            if (that.pageParams.from === 'order') {
              uni.showToast({
                title: '提交成功',
                icon: 'success'
              });
              setTimeout(() => {
                uni.navigateBack();
              }, 500);
            } else {
              uni.redirectTo({
                url:
                  "/pages/app/form/result/result?log_id=" +
                  res.data.log_id +
                  "&status=success",
              });
            }
          } else {
            uni.$u.toast(res.msg);
          }
        })
        .catch((err) => {
          that.loading = false;
          uni.stopPullDownRefresh();
        });
    },
    getData() {
      that.loading = true;
      that
        .$api("app.form.detail", {
          id: that.pageParams.id,
          log_id: that.pageParams.log_id,
        })
        .then((res) => {
          that.loading = false;
          uni.stopPullDownRefresh();
          that.page = res.data.form.page;
          that.pageParams.id = res.data.form.id;
          that.components = res.data.form.components;
          that.formValue = res.data.value;
          that.status_info = res.data.status_info;
          that.content_list = res.data.form.content_list;

          //没有权限填写，跳转购买课程页面（from=order 时不检查，因为购买课程前表单不需要订阅）
          if (!res.data.status_info.is_auth && that.pageParams.from !== 'order') {
            uni.redirectTo({
              url:
                "/pages/app/form/result/result?id=" + that.pageParams.id + "&type=noauth",
            });
          }

          // #ifdef H5
          this.$nav.share(
            res.data.form.share_title,
            res.data.form.share_desc,
            res.data.form.share_cover
          );
          // #endif
        })
        .catch((err) => {
          that.loading = false;
          uni.stopPullDownRefresh();
        });
    },

    //刷新
    refresh() {
      that.getData();
    },

    validateRequiredFields(components, values) {
      // 需要忽略验证的表单类型
      const IGNORE_TYPES = ["image", "parse", "divider"];

      for (const component of components) {
        const { config, type } = component;

        // 跳过忽略的类型
        if (IGNORE_TYPES.includes(type)) {
          continue;
        }

        // 只检查必填字段
        if (config.required === 1) {
          const fieldId = config.id;
          const fieldValue = values[fieldId];

          // 检查字段是否存在
          if (fieldValue === undefined) {
            return `"${config.title}"是必填项，但未提供值`;
          }

          // 根据不同类型检查是否为空
          switch (component.type) {
            case "checkbox":
              // 复选框应该是一个数组，且至少有一个选项
              if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
                return `"${config.title}"是必填项，请至少选择一个选项`;
              }
              break;

            case "radio":
            case "select":
              // 单选应该是一个非空字符串
              if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
                return `"${config.title}"是必填项，请选择一个选项`;
              }
              break;

            case "input":
            case "textarea":
              // 文本输入应该是一个非空字符串
              if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
                return `"${config.title}"是必填项，请输入内容`;
              }
              break;

            case "upload":
              // 上传字段应该是一个非空数组
              if (!Array.isArray(fieldValue) || fieldValue.length === 0) {
                return `"${config.title}"是必填项，请上传文件`;
              }
              break;

            case "date":
            case "time":
              // 日期时间应该是一个非空字符串
              if (typeof fieldValue !== "string" || fieldValue.trim() === "") {
                return `"${config.title}"是必填项，请选择日期/时间`;
              }
              break;

            default:
              // 默认检查是否有值
              if (fieldValue === null || fieldValue === "") {
                return `"${config.title}"是必填项`;
              }
          }
        }
      }

      return true;
    },
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
    that.refresh();
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
