<template>
  <u-upload
    @afterRead="afterRead"
    :fileList="imgList"
    @delete="deletePic"
    multiple
    name="img"
    :maxCount="maxCount ? maxCount : 9"
    :disabled="disabled"
  ></u-upload>
</template>

<script>
export default {
  props: {
    value: {
      type: [Array, String],
      default: () => [],
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    maxCount: {
      type: [Number, String],
      default: 9,
    },
    showProgress: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: [Boolean, Number],
      default: false,
    },
    uploadUrl: {
      type: String,
      default: "common/upload",
    },
  },
  data() {
    return {
      imgList: [],
      uploading: false,
    };
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newVal) {
        // 确保imgList格式正确
        if (Array.isArray(newVal)) {
          this.imgList = newVal.map((url) => ({ url }));
        } else {
          this.imgList = [];
        }
      },
    },
  },
  methods: {
    // 统一更新图片列表的方法
    updateImgList() {
      // 提取URL数组
      const urls = this.imgList.map((item) => item.url);
      console.log("urls", urls);
      // 触发v-model更新
      this.$emit("input", urls);
      // 同时触发change事件
      this.$emit("change", urls);
    },

    // 删除图片
    deletePic(event) {
      if (this.disabled) {
        return false;
      }
      // 先更新本地列表
      this.imgList.splice(event.index, 1);
      // 再触发更新
      this.updateImgList();
    },

    // 新增图片
    // async afterRead(event) {
    //   if (this.disabled) {
    //     return false;
    //   }
    //   if (event.file.length > 0) {
    //     for (var i in event.file) {
    //       this.$tools.uploadImage("common/upload", event.file[i].url).then((res) => {
    //         // that.imgList.push({
    //         //   url: res.full_url,
    //         // });
    //         // this.form.imgs.push(res.url);
    //         const imgIndex = this.imgList.length - event.file.length + i;
    //         this.$set(this.imgList, imgIndex, { url: res.full_url });
    //         this.updateImgList();
    //       });
    //     }
    //   }
    // },

    async afterRead(event) {
      if (this.disabled) {
        return false;
      }
      if (!event.file || event.file.length === 0) return;

      this.uploading = true;
      const files = Array.isArray(event.file) ? event.file : [event.file];

      try {
        // 上传前先添加临时预览图
        files.forEach((file) => {
          this.imgList.push({ url: file.url });
        });

        // 上传图片
        const uploadTasks = files.map((file) => {
          return this.$tools.uploadImage(this.uploadUrl, file.url);
        });

        const results = await Promise.all(uploadTasks);

        // 替换临时URL为服务器返回的URL
        results.forEach((res, index) => {
          const imgIndex = this.imgList.length - results.length + index;
          this.$set(this.imgList, imgIndex, { url: res.full_url });
        });

        // 触发更新
        this.updateImgList();
      } catch (error) {
        console.error("上传失败:", error);
        // 上传失败移除临时图片
        this.imgList.splice(-files.length, files.length);
        this.$emit("error", error);
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
