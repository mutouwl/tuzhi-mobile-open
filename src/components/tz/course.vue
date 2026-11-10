<template>
  <div :class="[
      'course-list-box',
      {
        diallel: type == 'diallel',
        single: type == 'single',
        'course-list-box--divider': divider,
      },
    ]">
    <!-- 骨架档（ui-baseline-mobile M16）：调用页 loading 时传 :skeleton="true"，灰块套在真实卡同一只
         外壳类里（卡高、封面宽、圆角、间距全部由本版式给），页面不必再抄一份卡片尺寸；
         骨架档下真实卡走空数据（rows 计算属性），两者不会同屏叠出 -->
    <div :class="[
        'course-item-box',
        {
          'course-item-box-round': round,
          'course-item-box-border': border,
        },
      ]" :style="{
        'margin-bottom': divider ? 0 : margin + 'px',
      }" v-for="i in skCount" :key="'sk' + i">
      <div class="cover">
        <div class="course-sk-cover"></div>
      </div>
      <div class="info">
        <!-- rows-width 用数组传值：u-skeleton 对单行列表会把「最后一行」宽度写死成 70%，传字符串不生效 -->
        <u-skeleton
          :loading="true"
          :animate="true"
          :title="true"
          title-width="85%"
          title-height="16"
          :rows="1"
          :rows-width="['60%']"
          rows-height="12"
        />
        <div class="course-sk-price"></div>
      </div>
    </div>
    <div :class="[
        'course-item-box',
        {
          'course-item-box-round': round,
          'course-item-box-border': border,
          'course-item-box--last': last && index === rows.length - 1,
        },
      ]" :style="{
        'margin-bottom': divider ? 0 : margin + 'px',
      }" v-for="(item, index) in rows" :key="index" @click="handleClick(item)">
      
      <div class="cover">
      <div class="vip-tag" v-if="item.is_vip_goods"><span class="vip-tag-text">会员商品</span></div>
        <template v-if="item.cover && !imgErrors[index]">
          <img :src="item.cover" :alt="item.name" class="back-img" @error="onCoverError(index)"/>
          <img :src="item.cover" :alt="item.name" @error="onCoverError(index)"/>
        </template>
        <view v-else class="placeholder">
          <tz-icon name="picture" :size="40" color="#C9CDD4" />
        </view>
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
          <div class="subtitle one-line-hidden subtitle--with-icon">
            <tz-icon color="#86909C" name="coordinates" :size="16" />
            <text class="subtitle-text">{{ item.location }}</text>
          </div>
        </template>
        <!-- 进度行（行数据带 progress 才出，其余调用点不传即逐字不变）：图标 + 线型进度条 + 状态文字。
             percent 为空表示没有分母（如打卡「结束不限」），只出状态文字、不出条；
             与左下角价格位同占卡片底行：一条卡只出其一（已参与出进度、未参与出价格） -->
        <div class="course-progress" v-if="item.progress">
          <block v-if="item.progress.percent !== null && item.progress.percent !== undefined">
            <u-icon class="course-progress-ic" name="calendar" size="19" color="#0968f6"></u-icon>
            <u-line-progress class="course-progress-bar" :percentage="item.progress.percent" :show-text="false"
              :height="6" active-color="#0968f6" inactive-color="#f2f3f5"></u-line-progress>
          </block>
          <text class="course-progress-text">{{ item.progress.text }}</text>
        </div>
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
      return {
        imgErrors: {},
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
      //骨架档：只出灰块，不出真实卡（见模板顶部注释）
      skeleton: {
        type: Boolean,
        default: false,
      },
      //骨架档铺几张卡
      skeletonCount: {
        type: Number,
        default: 4,
      },
      //分隔线档：白底通栏、条目之间 1px 发丝线（卡间距随之归零），封面缩进 10 并做 8px 圆角、
      //卡高由内容给（三行：标题 / 灰字元信息 / 底行）。默认 false = 其余调用点逐字不变
      divider: {
        type: [Boolean, Number],
        default: false,
      },
      //末位条目：调用点知道本组件是列表的最后一条时传 true，这一条不画下沿发丝线
      //（分隔线档一条卡一只组件，:last-child 每条都成立收不了口）。默认 false = 其余调用点逐字不变
      last: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      // 骨架档铺几张灰卡（非骨架档为 0，模板里 v-for 一个数即按 1..N 出条目）
      skCount() {
        return this.skeleton ? this.skeletonCount : 0;
      },
      // 真实卡数据：骨架档一律出空，避免骨架与真实卡同屏
      rows() {
        return this.skeleton ? [] : this.list || [];
      },
    },
    methods: {
      // 封面加载失败：切图片图标占位（对齐课程套餐/校区卡片兜底）
      onCoverError(index) {
        this.$set(this.imgErrors, index, true);
      },
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

  /* 无封面/加载失败占位（图片图标填充，对齐课程套餐卡片兜底） */
  .course-list-box .cover .placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #F2F3F5;
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

  /* 行内图标 + 文字：文字收成 <text> 并把行高钉到图标同档（:size=16），间距交给容器 gap
     （匿名文本项的行盒与图标行盒不同档，只靠 align-items 会一高一低） */
  .course-item-box .info .subtitle--with-icon {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .course-item-box .info .subtitle-text {
    font-size: 12px;
    line-height: 16px;
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

/* ===== 骨架档灰块（M16）：封面块铺满真实 .cover 的盒子，价格块对齐左下角价格位 ===== */
.course-sk-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #e5e6eb;
}

.course-sk-price {
  width: 72px;
  height: 16px;
  border-radius: 4px;
  background: #e5e6eb;
  margin-top: 10px;
}

.course-list-box.single .course-sk-price {
  position: absolute;
  bottom: 8px;
  left: 8px;
  margin-top: 0;
}

/* ===== 进度行（行数据带 progress 才出，其余调用点不传即逐字不变）=====
   图标走 §1「行内图标」的 16px 墨迹档（uview calendar = size 19），文字 12px 辅助灰 */
.course-progress {
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.course-progress-bar {
  flex: 1;
  min-width: 0;
  margin: 0 8px;
}

.course-progress-text {
  flex-shrink: 0;
  font-size: 12px;
  color: #86909c;
}

/* ===== 分隔线档（divider）：白底通栏 + 条目间 1px 发丝线，替代 10px 灰底卡间距 =====
   封面不再通高：112×66 圆角 8（§1 的封面档，按课程卡 170 通高缩掉约 1/3），条目左右内衬 10 让封面与屏幕缘留出缩进；
   卡高由内容给（标题 / 灰字元信息 / 底行三行），底行（价格位或进度行）用 margin-top:auto 贴到底，
   与封面下沿齐平。分隔线一律画在条目下沿：调用点可以一行一只组件（打卡活动卡），
   此时 :last-child 每条都成立，用 :last-child 收口就等于整列没有线——列表末位由调用点传 last 收口。 */
.course-list-box--divider {
  background-color: #fff;
}

.course-list-box--divider.single .course-item-box {
  height: auto;
  padding: 12px 10px;
  border-bottom: 1px solid #f2f3f5;
}

/* 末位条目（调用点传 last）不发线：白底容器里末条下面那根线会悬空，通栏灰底列表不传即逐字不变 */
.course-list-box--divider.single .course-item-box--last {
  border-bottom: none;
}

.course-list-box--divider.single .course-item-box .cover {
  width: 112px;
  height: 66px;
  flex-shrink: 0;
  border-radius: 8px;
}

.course-list-box--divider.single .course-item-box .info {
  width: auto;
  flex: 1;
  min-width: 0;
  padding: 0 0 0 10px;
  display: flex;
  flex-direction: column;
}

.course-list-box--divider.single .course-item-box .info .title {
  font-size: 16px;
  line-height: 22px;
}

.course-list-box--divider.single .course-item-box .info .price {
  position: static;
  margin-top: auto;
  padding-top: 6px;
}

.course-list-box--divider.single .course-item-box .info .course-progress {
  margin-top: auto;
  padding-top: 6px;
}

.course-list-box--divider.single .course-item-box .info .course-sk-price {
  position: static;
  margin-top: auto;
  padding-top: 6px;
}
</style>