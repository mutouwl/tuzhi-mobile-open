<template>
  <div :class="[
      'goods-list-box',
      {
        'goods-list': type == 'list',
        'goods-grid': type == 'grid',
      },
    ]">
    <div :class="[
        'goods-item-box',
        {
          'goods-item-box-round': round,
          'goods-item-box-border': border,
        },
      ]" :style="{
        'margin-bottom': margin + 'px',
      }" v-for="(item, index) in list" :key="index" @click="detail(item.id)">
      
      <div class="cover">
        <div class="vip-tag" v-if="item.is_vip_goods"><span class="vip-tag-text">会员商品</span></div>
        <img :src="item.cover" :alt="item.name" class="back-img"/>
        <img :src="item.cover" :alt="item.name"/>
        <div class="type" v-if="$t(item.type)">
          <span>{{ $t(item.type) }}</span>
        </div>
      </div>
      <div class="info">
        <div :class="[
            'title',
            { 'one-line-hidden': type == 'grid' },
            { 'two-line-hidden': type == 'list' },
          ]">
          {{ item.name }}
        </div>
        <div class="price">
          <template v-if="isVirtualPay(item)">
            <span class="price-text">{{ item.price }} {{ $tools.systemConfig('coin_name') || '金币' }}</span>
          </template>
          <template v-else>
            <span class="price-text">¥{{ item.price }}</span>
          </template>
          <span class="sales" v-if="item.total_sales !== undefined && item.total_sales !== null">已售{{ item.total_sales }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    components: {},
    data() {
      return {};
    },
    props: {
      list: {
        type: [Object, Array],
        default: () => {
          return [];
        },
      },
      type: {
        type: String,
        default: "list",
      },
      round: {
        type: [Boolean, Number],
        default: false,
      },
      border: {
        type: [Boolean, Number],
        default: false,
      },
      margin: {
        type: Number,
        default: 10,
      },
    },
    methods: {
      detail(id) {
        this.$nav.to(this.$nav.getPagePath(id, 'physical'));
      },
      isVirtualPay(item) {
        return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
      },
    },
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

  .goods-list-box.goods-list {
    display: flex;
    flex-direction: column;
  }

  .goods-list-box.goods-list .goods-item-box {
    width: 100%;
    height: 124px;
    display: flex;
    justify-content: space-between;
    background-color: #fff;
    overflow: hidden;
    box-sizing: border-box;
  }

  .goods-list-box.goods-list .goods-item-box .cover {
    height: 100%;
    width: 170px;
    position: relative;
  }

  .goods-list-box.goods-list .goods-item-box .info {
    width: calc(100% - 170px);
    padding: 8px;
    overflow: hidden;
    position: relative;
  }

  .goods-list-box.goods-list .goods-item-box .info .price {
    position: absolute;
    bottom: 4px;
    left: 8px;
    right: 8px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .goods-list-box.goods-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .goods-list-box.goods-grid .goods-item-box {
    width: 49%;
    background-color: #fff;
    overflow: hidden;
  }

  .goods-list-box.goods-grid .goods-item-box .cover {
    height: 140px;
    width: 100%;
    position: relative;
  }

  .goods-list-box.goods-grid .goods-item-box .info {
    padding: 8px;
  }

  .goods-list-box.goods-grid .goods-item-box .info .price {
    margin-top: 10px;
    display: flex;
    align-items: baseline;
    justify-content: space-between;
  }

  .goods-list-box .cover {
    overflow: hidden;
  }

  .goods-list-box .cover .back-img {
    scale: 1.5;
    filter: blur(12px);
  }

  .goods-list-box .cover img {
    width: 100%;
    height: 100%;
    position: absolute;
    -o-object-fit: contain;
    object-fit: contain;
  }

  .goods-item-box-round {
    border-radius: 10px;
  }
 
  .goods-item-box-border {
    border: 1px solid #F0F3F5;
  }

  .goods-item-box:last-child {
    margin-bottom: 0;
  }

  .goods-item-box .info .title {
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
  }

  .goods-item-box .info .price {
    font-weight: 700;
    font-size: 16px;
    color: #f53f3f;
  }

  .goods-item-box .info .price .price-text {
    margin-right: 2px;
    font-size: 16px;
    font-weight: 700;
  }

  .goods-item-box .info .price .unit {
    font-size: 12px;
    font-weight: 400;
    margin-left: 2px;
  }

  .goods-item-box .info .price .sales {
    font-size: 12px;
    color: #999;
    margin-left: 8px;
    font-weight: 400;
  }

  .goods-list-box .cover .type {
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

  .goods-list-box .cover .type span {
    color: #fff;
    font-weight: 500;
    font-size: 12px;
  }

  .goods-item-box .cover .vip-tag {
    position: absolute;
    top: 0;
    left: 0;
    display: -webkit-flex;
    display: flex;
    padding: 2px 4px;
    -webkit-justify-content: center;
    justify-content: center;
    -webkit-align-items: center;
    align-items: center;
    background: linear-gradient(275deg, #F2C89F 1.39%, #F9E5DB 100%);
    border-radius: 0 0 4px;
    z-index: 1;
  }

  .vip-tag .vip-tag-text {
    color: #66351f;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
  }
</style>
