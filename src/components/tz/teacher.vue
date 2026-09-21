<template>
  <div :class="['teacher-box', { 'teacher-box-round': round }]">
    <div class="teacher-box-header">
      <!-- 头像加载失败：图片图标填充（对齐校区 LOGO 兜底）；无头像时首字占位（对齐老师信息弹窗/教师详情页的占位风格） -->
      <img class="head_image" :src="avatar" v-if="avatar && !avatarError" @error="onAvatarError" />
      <div class="head_image icon-placeholder" v-else-if="avatar">
        <tz-icon name="picture" :size="20" color="#C9CDD4" />
      </div>
      <div class="head_image placeholder" v-else>{{ (name || '?').slice(0, 1) }}</div>
      <div class="header-info">
        <div class="header-info-name one-line-hidden">{{ name }}</div>
        <span class="header-info-introduce two-line-hidden">{{ introduce }}</span>
      </div>
    </div>
    <div class="teacher-box-body" v-if="course && course.length > 0">
      <div class="course-box">
        <div
          class="course-item"
          v-for="(item, index) in course"
          @click="detail(item.id, item.type)"
        >
          <span class="type-tag theme-customize-border">{{ $t(item.type) }}</span
          ><span class="one-line-hidden">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      avatarError: false,
    };
  },
  props: {
    name: {
      type: String,
      default: "",
    },
    introduce: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    course: {
      type: [Object, Array],
      default: () => {
        return [];
      },
    },
    //是否有圆角
    round: {
            type: [Number, Boolean],
            default: 0
        }
  },
  computed: {},
  methods: {
    // 头像加载失败：切图片图标占位（对齐校区 LOGO 兜底）
    onAvatarError() {
      this.avatarError = true;
    },
    detail(id, type) {
      this.$nav.to(this.$nav.getPagePath(id, type));
    },
  },
  watch: {
    // 头像地址变化（列表复用/重新拉取）时允许重新尝试加载
    avatar() {
      this.avatarError = false;
    },
  },
  mounted() {},
};
</script>
<style>
.one-line-hidden,
	.two-line-hidden {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.one-line-hidden {
		white-space: nowrap !important;
	}

	.two-line-hidden {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
	}
.teacher-box {
  padding: 10px;
  width: 100%;
  background: #fff;
  box-sizing: border-box;
}

.teacher-box-header {
  display: flex;
  flex-direction: row;
  padding: 13px 0;
  width: 100%;
  border-radius: 8px 8px 0 0;
  border-bottom: 1px solid #ebebeb;
  box-sizing: border-box;
  align-items: center;
}

.teacher-box-header .head_image {
  flex-shrink: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
}

.teacher-box-header .head_image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0968f6;
  color: #fff;
  font-size: 16px;
}

/* 头像加载失败占位（图片图标填充，对齐校区 LOGO 兜底样式） */
.teacher-box-header .head_image.icon-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f2f3f5;
}

.teacher-box-header .header-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 8px;
  width: calc(100% - 38px);
}

.teacher-box-header .header-info-name {
  width: 100%;
  font-weight: 500;
  font-size: 16px;
  color: #1d2129;
  line-height: 19px;
}

.teacher-box-header .header-info-introduce {
  font-size: 13px;
  color: #86909c;
  line-height: 19px;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 11px;
  line-height: 15px;
  margin-top: 6px;
}

.teacher-box-body {
  padding: 5px 0px;
}

.teacher-box-body .course-box {
  width: 100%;
}

.teacher-box-body .course-box .course-item {
  display: flex;
  height: 36px;
  font-size: 14px;
  color: #1d2129;
  font-weight: 500;
  align-items: center;
}

.teacher-box-body .course-box .course-item .type-tag {
  margin-right: 4px;
  border: 1px solid #0968f6;
  color: #0968f6;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 17px;
  padding: 0 4px;
  border-radius: 2px;
  box-sizing: border-box;
  font-size: 11px;
  flex-shrink: 0;
}

.teacher-box-round {
  border-radius: 10px;
}
</style>
