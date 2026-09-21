<template>
  <div :class="[
      'course-list-box',
      {
        diallel: type == 'diallel',
        single: type == 'single',
      },
    ]">
    <div :class="[
        'course-item-box',
        {
          'course-item-box-round': round,
          'course-item-box-border': border,
        },
      ]" :style="{
        'margin-bottom': margin + 'px',
      }" v-for="(item, index) in list" :key="index" @click="detail(item.id)">
      <div class="cover">
        <img :src="getCover(item)" :alt="item.name" />
        <div class="type"><span>组合商品</span></div>
      </div>
      <div class="info">
        <div :class="[
            'title',
            { 'one-line-hidden': type == 'diallel' },
            { 'two-line-hidden': type == 'single' },
          ]">
          {{ item.name }}
        </div>
        <div class="subtitle one-line-hidden" v-if="item.sell_point">
          {{ item.sell_point }}
        </div>
        <div class="price">
          <span class="unit" v-if="!isVirtualPay(item)">¥</span> {{ item.min_price || item.price || 0 }}<span class="coin-name" v-if="isVirtualPay(item)">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    list: { type: [Object, Array], default: () => [] },
    round: { type: [Boolean, Number], default: false },
    type: { type: String, default: "single" },
    border: { type: [Boolean, Number], default: false },
    margin: { type: Number, default: 10 },
  },
  methods: {
    detail(id) {
      this.$nav.to('/pages/app/composite/detail/detail?id=' + id);
    },
    isVirtualPay(item) {
      return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },
    getCover(item) {
      if (item.cover) return item.cover;
      if (item.images && item.images.length) return item.images[0];
      if (typeof item.images === 'string') {
        try { const a = JSON.parse(item.images); return Array.isArray(a) && a.length ? a[0] : ''; } catch { return ''; }
      }
      return '';
    }
  },
};
</script>
<style>
.one-line-hidden,
.two-line-hidden {
  overflow: hidden;
  text-overflow: ellipsis;
}
.one-line-hidden { white-space: nowrap !important; }
.two-line-hidden {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.course-list-box.single .course-item-box {
  width: 100%;
  height: 124px;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  margin-bottom: 10px;
  overflow: hidden;
  box-sizing: border-box;
}
.course-list-box.single .course-item-box .info {
  width: calc(100% - 170px);
  padding: 8px;
  overflow: hidden;
  position: relative;
}
.course-list-box .cover { overflow: hidden; }
.course-list-box .cover img {
  width: 100%;
  height: 100%;
  position: absolute;
  object-fit: contain;
}
.course-list-box.single .course-item-box .cover {
  height: 100%;
  width: 170px;
  position: relative;
}
.course-list-box.single .course-item-box .info .price {
  position: absolute;
  bottom: 4px;
  left: 8px;
  font-weight: 700;
  font-size: 16px;
  color: #f53f3f;
}
.course-list-box .course-item-box .info .no-price {
  font-size: 14px;
  color: #f53f3f;
}
.course-list-box.diallel {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}
.course-list-box.diallel .course-item-box {
  width: 49%;
  background-color: #fff;
  overflow: hidden;
}
.course-list-box.diallel .course-item-box .info { padding: 8px; }
.course-list-box.diallel .course-item-box .cover {
  height: 140px;
  width: 100%;
  position: relative;
}
.course-list-box.diallel .course-item-box .info .subtitle { display: none; }
.course-list-box.diallel .course-item-box .info .price {
  margin-top: 10px;
  font-weight: 700;
  font-size: 16px;
  color: #f53f3f;
}
.course-item-box-round { border-radius: 10px; }
.course-item-box-border { border: 1px solid #F0F3F5; }
.course-item-box:last-child { margin-bottom: 0; }
.course-item-box .info .title { color: #1d2129; font-size: 14px; font-weight: 600; }
.course-item-box .info .subtitle { color: #86909c; font-size: 12px; margin-top: 4px; }
.course-item-box .info .price .unit { margin-right: 2px; font-size: 12px; font-weight: 700; }
.course-item-box .info .price .coin-name { margin-left: 2px; font-size: 12px; font-weight: 500; }
.course-item-box .info .price .marking {
  color: #c9cdd4; font-weight: 400; margin-left: 10px; font-size: 12px; text-decoration: line-through;
}
.course-item-box .cover .type {
  position: absolute; bottom: 4px; right: 4px; height: 20px;
  border-radius: 4px; padding: 0px 3px; box-sizing: border-box;
  line-height: 18px; background: rgba(0, 0, 0, 0.25);
  -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
}
.course-item-box .cover .type span { color: #fff; font-weight: 500; font-size: 12px; }
</style>
