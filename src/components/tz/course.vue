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
      }" v-for="(item, index) in list" :key="index" @click="handleClick(item)">
      
      <div class="cover">
      <div class="vip-tag" v-if="item.is_vip_goods"><span class="vip-tag-text">会员商品</span></div>
        <img :src="item.cover" :alt="item.name" class="back-img"/>
        <img :src="item.cover" :alt="item.name"/>
        <div class="type">
          <span>{{ $t(item.type) }}</span>
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
        <div class="subtitle one-line-hidden" v-if="item.briefing">
          {{ item.briefing }}
        </div>
        <template v-if="item.type == 'activity'">
          <div class="subtitle one-line-hidden">
            <tz-icon color="#86909C" name="coordinates" :size="16" />{{ item.location }}
          </div>
        </template>
        <div class="price">
          <template v-if="item.pay_type">
            <template v-if="item.pay_type == 'free'">
              <span class="no-price">免费</span>
            </template>
            <template v-if="item.pay_type == 'student'">
              <span class="no-price">指定学员</span>
            </template>
            <template v-if="item.pay_type == 'bind_course'">
              <span class="no-price">绑定课程</span>
            </template>
            <template v-if="item.pay_type == 'password'">
              <span class="no-price">密码兑换</span>
            </template>
            <template v-if="item.pay_type == 'pay'">
                <template v-if="isVirtualPay(item)">
                  <span class="price-value">{{ item.price }}</span><span class="coin-name">{{ $tools.systemConfig('coin_name') || '金币' }}</span>
                </template>
              <template v-else>
              <span class="unit">¥ </span> {{ item.price }} <span v-if="item.type=='activity'" style="font-size: 12px;margin-left:2px">起</span>
              <span class="marking" v-if="item.price_marking">¥{{ item.price_marking }}</span>
              </template>
            </template>
          </template>
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
    },
    methods: {
      handleClick(item) {
        this.$emit('click', item);
        if (this.navigate) {
          this.detail(item.id, item.type);
        }
      },
      detail(id, type) {
        // console.log("id, type",id, type)
        // console.log(this.$nav.getPagePath(id, type),'123')
        this.$nav.to(this.$nav.getPagePath(id, type));
      },
      isVirtualPay(item) {
        return Number(item && item.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
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

  .course-list-box .cover {
    overflow: hidden;
  }

  .course-list-box .cover .back-img {
    scale: 1.5;
    filter: blur(12px);
  }

  .course-list-box .cover img {
    width: 100%;
    height: 100%;
    position: absolute;
    -o-object-fit: contain;
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

  .course-list-box.single .course-item-box .info .price .price-value {
    font-size: 16px;
    font-weight: 700;
  }

  .course-list-box.single .course-item-box .info .price .coin-name {
    font-size: 10px;
    font-weight: 500;
    margin-left: 2px;
  }

  .course-list-box .course-item-box .info .no-price {
    font-size: 14px;
    color: #f53f3f;
    /* font-weight: normal; */
  }

  .course-list-box.diallel {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }

  .course-list-box.diallel .course-item-box {
    width: 49%;
    /* height: 214px; */
    background-color: #fff;
    overflow: hidden;
  }

  .course-list-box.diallel .course-item-box .info {
    padding: 8px;
  }

  .course-list-box.diallel .course-item-box .cover {
    height: 140px;
    width: 100%;
    position: relative;
  }



  .course-list-box.diallel .course-item-box .info .subtitle {
    display: none;
  }

  .course-list-box.diallel .course-item-box .info .price {
    margin-top: 10px;
    font-weight: 700;
    font-size: 16px;
    color: #f53f3f;
  }

  .course-list-box.diallel .course-item-box .info .price .price-value {
    font-size: 16px;
    font-weight: 700;
  }

  .course-list-box.diallel .course-item-box .info .price .coin-name {
    font-size: 10px;
    font-weight: 500;
    margin-left: 2px;
  }

  .course-item-box-round {
    border-radius: 10px;
  }
 
  .course-item-box-border {
    border: 1px solid #F0F3F5;
  }

  .course-item-box:last-child {
    margin-bottom: 0;
  }

  .course-item-box .info .title {
    color: #1d2129;
    font-size: 14px;
    font-weight: 600;
  }

  .course-item-box .info .subtitle {
    color: #86909c;
    font-size: 12px;
    margin-top: 4px;
  }


  .course-item-box .info .price .unit {
    margin-right: 2px;
    font-size: 12px;
    font-weight: 700;
  }

  .course-item-box .info .price .marking {
    color: #c9cdd4;
    font-weight: 400;
    margin-left: 10px;
    font-size: 12px;
    text-decoration: line-through;
  }

  .course-item-box .cover .type {
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

  .course-item-box .cover .type span {
    color: #fff;
    font-weight: 500;
    font-size: 12px;
  }

  .vip-tag{
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
.vip-tag .vip-tag-text{
    color: #66351f;
    font-size: 10px;
    font-weight: 600;
    line-height: 12px;
}
</style>