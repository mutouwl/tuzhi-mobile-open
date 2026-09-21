<template>
  <div :class="[
      'package-list-box',
      {
        diallel: type == 'diallel',
        single: type == 'single',
      },
    ]">
    <div :class="[
        'package-item-box',
        {
          'package-item-box-round': round,
          'package-item-box-border': border,
        },
      ]" :style="{
        'margin-bottom': margin + 'px',
      }" v-for="(item, index) in list" :key="index" @click="handleClick(item)">

      <div class="cover">
        <template v-if="showCover(item)">
          <image class="back-img" :src="item.cover" mode="aspectFill" @error="onCoverError(item)" />
          <image class="front-img" :src="item.cover" mode="aspectFit" @error="onCoverError(item)" />
        </template>
        <!-- 封面缺失或加载失败：兜底默认商品图（与确认报名页、规格选套餐弹窗同一张默认图） -->
        <image v-else class="front-img" :src="defaultCover" mode="aspectFill" />
        <div class="type" v-if="badgeText">
          <span>{{ badgeText }}</span>
        </div>
      </div>
      <div class="info">
        <div :class="[
            'title',
            { 'one-line-hidden': type == 'diallel' },
            { 'two-line-hidden': type == 'single' },
          ]">
          {{ item.name }}
        </div>
        <div class="intro two-line-hidden" v-if="item.intro">
          {{ item.intro }}
        </div>
        <div class="tags one-line-hidden" v-if="item.tags && item.tags.length">
          <span class="tag" v-for="(t, i) in item.tags" :key="i">{{ t }}</span>
        </div>
        <div class="price" v-if="hasPrice(item)">
          <span class="unit">¥ </span> {{ item.price }} <span class="from">起</span>
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
        // 封面加载失败记录（按封面地址记录，不用数组下标：列表刷新/翻页后下标会串到别的套餐上）
        coverErrors: {},
        // 封面缺失或加载失败时的默认商品图
        defaultCover: '/static/image/default-goods.jpg',
      };
    },
    props: {
      list: {
        type: [Object, Array],
        default: () => {
          return [];
        },
      },
      //是否有圆角
      round: {
        type: [Boolean, Number],
        default: false,
      },

      //单列 双列
      type: {
        type: String,
        default: "single",
      },
      border: {
        type: [Boolean, Number],
        default: false,
      },
      //间距
      margin: {
        type: Number,
        default: 10,
      },
      //是否跳转详情
      navigate: {
        type: Boolean,
        default: true,
      },
      //封面类型角标文案；传空字符串隐藏角标（无类型场景）
      badgeText: {
        type: String,
        default: '课程套餐',
      },
    },
    methods: {
      // 有封面且未加载失败才展示原图，否则走默认商品图
      showCover(item) {
        const cover = item && item.cover;
        return !!cover && !this.coverErrors[cover];
      },
      onCoverError(item) {
        const cover = item && item.cover;
        if (cover) {
          this.$set(this.coverErrors, cover, true);
        }
      },
      // 价格为空（undefined/null/''）时隐藏价格行，兼容无价格列表
      hasPrice(item) {
        return item.price !== undefined && item.price !== null && item.price !== '';
      },
      handleClick(item) {
        this.$emit('click', item);
        if (this.navigate) {
          this.$nav.to(this.$nav.getPagePath(item.id, 'package'));
        }
      },
    },

    watch: {},
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

  .package-list-box.single .package-item-box {
    width: 100%;
    min-height: 124px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    margin-bottom: 10px;
    overflow: hidden;
    box-sizing: border-box;
  }

  .package-list-box.single .package-item-box .info {
    width: calc(100% - 124px);
    padding: 8px;
    overflow: hidden;
    position: relative;
  }

  .package-list-box .cover {
    overflow: hidden;
  }

  /* 封面衬底：模糊放大铺满，避免非方图留生硬留白（同 tz-campus 处理） */
  .package-list-box .cover .back-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    scale: 1.5;
    filter: blur(12px);
  }

  /* 封面主图：等比完整展示（默认商品图用 aspectFill 铺满，二者定位一致） */
  .package-list-box .cover .front-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* 封面块高度不能写 height:100%：卡片是高度 auto（仅 min-height）的 flex 容器，
     百分比高度解析不出值会被当成 auto，且内部两张图都是绝对定位、不产生内容高度，
     结果整块高度塌成 0，原图与默认兜底图一起看不见。
     改为 min-height 兜底 + height:auto 交给 flex 拉伸（信息区更高时封面同步长高） */
  .package-list-box.single .package-item-box .cover {
    width: 124px;
    min-height: 124px;
    flex-shrink: 0;
    position: relative;
  }

  .package-list-box.single .package-item-box .info .price {
    position: absolute;
    bottom: 4px;
    left: 8px;
    font-weight: 700;
    font-size: 16px;
    color: #f53f3f;
  }

  .package-list-box.diallel {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .package-list-box.diallel .package-item-box {
    width: 49%;
    background-color: #fff;
    overflow: hidden;
  }

  .package-list-box.diallel .package-item-box .info {
    padding: 8px;
  }

  .package-list-box.diallel .package-item-box .cover {
    aspect-ratio: 1;
    width: 100%;
    position: relative;
  }

  .package-list-box.diallel .package-item-box .info .tags,
  .package-list-box.diallel .package-item-box .info .intro {
    display: none;
  }

  .package-list-box.diallel .package-item-box .info .price {
    margin-top: 10px;
    font-weight: 700;
    font-size: 16px;
    color: #f53f3f;
  }

  .package-item-box-round {
    border-radius: 10px;
  }

  .package-item-box-border {
    border: 1px solid #F0F3F5;
  }

  .package-item-box:last-child {
    margin-bottom: 0;
  }

  .package-item-box .info .title {
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
  }

  /* 简介行：名称下方两行截断（浅灰，无 tags/price 时补齐信息区） */
  .package-item-box .info .intro {
    margin-top: 4px;
    font-size: 12px;
    color: #86909c;
    line-height: 17px;
  }

  .package-item-box .info .tags {
    margin-top: 4px;
    /* 标签超出一行直接裁切隐藏，不显示省略号 */
    text-overflow: clip;
  }

  .package-item-box .info .tags .tag {
    display: inline-block;
    color: #0968f6;
    background: #e8f4ff;
    border-radius: 3px;
    padding: 1px 6px;
    font-size: 11px;
    line-height: 16px;
    margin-right: 6px;
  }

  .package-item-box .info .price .unit {
    margin-right: 2px;
    font-size: 12px;
    font-weight: 700;
  }

  .package-item-box .info .price .from {
    margin-left: 2px;
    font-size: 12px;
    font-weight: 400;
  }

  .package-item-box .cover .type {
    position: absolute;
    bottom: 4px;
    right: 4px;
    height: 20px;
    border-radius: 5px;
    padding: 0px 3px;
    box-sizing: border-box;
    line-height: 18px;
    background: rgba(0, 0, 0, 0.25);
    border-radius: 4px;
    -webkit-backdrop-filter: blur(10px);
    backdrop-filter: blur(10px);
  }

  .package-item-box .cover .type span {
    color: #fff;
    font-weight: 500;
    font-size: 12px;
  }
</style>
