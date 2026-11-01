<template>
  <div>
    <u-popup :show="show" @close="close" @open="open" title="优惠券" :closeable="true" :round="10">
      
      <u-sticky bgColor="none" :disabled="true">
        <div class="nav-bar">
          <u-subsection
            :list="tabs"
            :current="current"
            @change="tabChange"
          ></u-subsection>
        </div>
      </u-sticky>
      <div class="service-box">
        <tz-box padding="10px 15px 15px" bgColor="none">
          <!-- 加载态：券卡骨架屏（M16，2026-10-29 用户点名「不要使用这个 Loading 弹窗了，
               要使用一个骨架屏放在这个优惠券弹窗里面」）——原来这里是 `uni.showLoading` 的黑底转圈 toast：
               它不预留版面，撤下时弹窗整块跳高，且盖住整个屏幕、连弹窗标题与页签都看不清。
               骨架由券卡组件自己出（`coupon-my` 的 `skeleton`），外壳/圆角/间距仍是真实那张券，
               本组件不另铺一棵灰块树（M16「共用组件里存版式的那一份由组件自己出加载档」）。
               摆 2 张：券卡实高 ≈130px（卡 100 + 外层 10 + 卡自身上下 10×2），两张 ≈260px
               落在 .service-box 的 340px 画布内，不到顶也不会只露半张卡（M18⑨d 面板首帧就占住这一档）。
               页签不进骨架：它是静态的筛选项，加载中照样可点（切档 = 重新取数）；
               底部两枚动作反过来要铺骨架——取数期间它们没有可用的落点，见 `btn-box` 那一处注释 -->
          <template v-if="loading">
            <div v-for="i in 2" :key="i" style="margin-top: 10px; width: 100%">
              <coupon-my :skeleton="true" />
            </div>
          </template>
          <template v-else-if="currentList.length > 0">
            <div
              v-for="(item, index) in currentList"
              style="margin-top: 10px; width: 100%"
            >
              <coupon-my
                :cant-use-msg="item.cannot_use_msg"
                :data="item.coupon"
                :uc-id="item.id"
                :disabled="current != 0"
                :picker="true && current == 0"
                :checked-id="couponCheckedId"
                @change="couponChange"
              />
            </div>
          </template>
          <!-- 空态：取数失败时说失败原因，不把后端故障说成「暂无优惠券」（M13）；
               文案按页签分档（2026-10-30 用户点名「如果当前没有可用的优惠券，那么就显示
               暂无可用优惠券」）：第一档是下单页券行点进来的默认页，说的是「可用」这两字 -->
          <u-empty v-else icon="/static/image/empty.png" width="70" height="70" :text="failMsg || emptyText"/>
        </tz-box>
      </div>
      <tz-box bgColor="none">
        <div class="btn-box">
          <!-- 加载态：底部两枚动作一并给骨架（2026-10-29 用户点名「优惠券加载的时候，底下的这两个按钮
               也应该做一个骨架屏加载呀」）——清单在取时「不使用优惠券 / 确定」按下去也没有券可选，
               留着真按钮就是两枚假的落点（M13）。灰块几何与真实按钮逐值对齐：
               宽度不写死，仍由 `.not-use-btn`(42%) / `.sure-use-btn`(56%) 那两格给（改按钮宽度时灰块跟着走）；
               高度取 `tz-button size="normal"` 的 40px（上下内衬 10×2 + 14px 行盒 20，与拼团详情页
               `.gbd-sk-btn` 那一档同值，门禁 `check-group-buy-detail.js` ⑲3 钉的就是 40）；圆角 4（M17）、
               底色 #e5e6eb（这里是白底，走 M18 的白底骨架档，不跟券卡那张有色底一起用暖橙） -->
          <template v-if="loading">
            <div class="not-use-btn"><view class="cpn-sk-btn"></view></div>
            <div class="sure-use-btn"><view class="cpn-sk-btn"></view></div>
          </template>
          <template v-else>
            <div class="not-use-btn">
              <tz-button text="不使用优惠券" long @click="notUse"></tz-button>
            </div>
            <div class="sure-use-btn">
              <tz-button :disabled="!couponCheckedId" text="确定" long @click="changeCoupon" type="primary"></tz-button>
            </div>
          </template>
        </div>
      </tz-box>
    </u-popup>
  </div>
</template>

<script>
import couponMy from "@/components/coupon/coupon-my.vue";
export default {
  components: {
    couponMy,
  },
  data() {
    return {
      couponCheckedId: "",
      uselist: {
        cannot: [],
        can: [],
      },
      show: false,
      current: 0,
      /**
       * 券清单在取（2026-10-29 用户点名改用骨架屏）
       *
       * 只服务「清单本身还没到手」这一档：模板按它把券卡整块翻成 `coupon-my` 的骨架档、
       * 底部两枚动作也一并换成灰块（取数期间它们没有可用的落点），页签照常摆着可点。
       * 切页签同样是换一次数据，所以也走这一枚（M16「切档那一支也是加载态，不是本地换数组」）。
       */
      loading: false,
      // 取数失败的原因（空串 = 没失败）：落到空态文案，不把接口故障说成「暂无优惠券」（M13）
      failMsg: "",
      // 切页签 / 关掉重开的竞态闸门：晚到的那一发不得把新选中的那一档列表盖回来
      seq: 0,
      tabs: [
        {
          name: "可用优惠券",
          type: "",
        },
        {
          name: "不可用优惠券",
          type: "unpaid",
        },
      ],
    };
  },
  computed: {
    // 当前页签那一档（模板只读这一份，不再到处写 `current == 0 ? ... : ...`）
    currentList() {
      return (this.current == 0 ? this.uselist.can : this.uselist.cannot) || [];
    },
    // 空态那一句同样按页签：第一档「暂无可用优惠券」（下单页券行默认落这一页）
    emptyText() {
      return this.current == 0 ? '暂无可用优惠券' : '暂无不可用优惠券';
    },
  },
  props: {
    visible: {
      type: [Boolean, Number],
      default: false,
    },
    type: {
      type: String,
      default: "",
    },
    goods: {
      type: [Array, Object],
      default: () => {
        return [];
      },
    },
    checkedId: {
      type: [String, Number],
      default: "",
    },
    /**
     * 取券的口（2026-10-29 拼团开放用券）
     *
     * 缺省空串 = 全站既有的 `app.coupon.use`（goodsList/goodsType 两个 prop）；
     * 拼团档传 `group_buy.team.coupons` + `apiParams`（活动/团 + 规格/阶梯/份数），
     * 由后端用**与建单同一份**上下文算「可用/不可用」—— 端上不自己拼商品串去问全站券口，
     * 否则券门槛会按商品原价判、与拼团价对不上。
     */
    apiKey: {
      type: String,
      default: "",
    },
    apiParams: {
      type: Object,
      default: null,
    },
  },
  watch: {
    visible() {
      this.show = this.visible;
      if (this.visible) {
        // 打开时把外部选中态带进来（2026-10-29 下单页默认选最优券）：
        // `couponCheckedId` 只在用户点选时被写，初始 prop 不会触发下面那个 watcher ——
        // 不回填就会「券行已经显示抵扣、弹窗里却一张没勾」
        this.couponCheckedId = this.checkedId;
        this.refresh();
      }
    },
    checkedId(newVal) {
      this.couponCheckedId = newVal;
    }
  },
  methods: {
    close() {
      this.$emit("close", false);
    },
    open() {
      this.$emit("open", false);
    },

    couponChange(id) {
      this.couponCheckedId = id;
    },

    changeCoupon() {
      if(!this.couponCheckedId){
        return false;
      }
      this.$emit("change", this.couponCheckedId);
    },
    tabChange(index) {
      this.current = index;
      this.getData();
    },

    notUse() {
      this.couponCheckedId = 0;
      this.$emit("change", this.couponCheckedId);
    },

    getData() {
      // 竞态闸门：切页签 / 关掉重开时连发两发，早发的那一发可能后回
      // （M16③：只有最后一条结果算数，晚到的整条丢弃）
      const seq = ++this.seq;
      this.loading = true;
      this.failMsg = "";

      // 券口：拼团档走插件口（与建单同一份上下文），其余下单流照旧走全站券口。
      // 一律用 `this.$api`，不读模块级 `that`（两个宿主共用本组件时 `that` 会被后挂载的实例顶掉）
      const req = this.apiKey
        ? this.$api(this.apiKey, this.apiParams || {})
        : this.$api("app.coupon.use", {
            goodsList: this.goods,
            goodsType: this.type ? this.type : "goods",
          });

      req
        .then((res) => {
          // 晚到的旧响应整条丢弃，加载态留给最新那一发关（它一定有 then / catch 两条出口）
          if (seq !== this.seq) return;
          this.loading = false;

          if (res && res.code === 1) {
            this.uselist.cannot = res.data.cannot_use || [];
            this.uselist.can = res.data.can_use || [];
            return;
          }

          // 业务失败：撤骨架 + 把原因交给空态那句（M13：空态不是错误的同义词）
          this.failMsg = (res && res.msg) || "优惠券加载失败，请重试";
        })
        .catch(() => {
          // 网络异常同样要撤骨架（硬约束 22：进入加载态要把退出分支一次扫完）；
          // 别把网络失败静默成「暂无优惠券」（M13）
          if (seq !== this.seq) return;
          this.loading = false;
          this.failMsg = "优惠券加载失败，请重试";
          uni.showToast({ title: this.failMsg, icon: "none" });
        });
      uni.stopPullDownRefresh();
    },
    //刷新
    refresh() {
      this.uselist = { cannot: [], can: [] };
      this.getData();
    },
  },
  created() {},
  mounted() {
    this.show = this.visible;
    if (this.visible) {
      this.couponCheckedId = this.checkedId;
      this.refresh();
    }
  },
};
</script>

<style scoped>

.nav-bar {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
}

.service-box {
  max-height: 340px;
  overflow-x: auto;
  padding-bottom: 60px;
}

.btn-box {
  /* position: fixed; */
  bottom: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  justify-content: space-between;
}

.not-use-btn {
  width: 42%;
}

.sure-use-btn {
  width: 56%;
}

/* 底部两枚动作的骨架块（2026-10-29 用户点名「优惠券加载的时候，底下的这两个按钮也应该做一个骨架屏」）：
   高度 = `tz-button size="normal" long` 实高 40（上下内衬 10×2 + 14px 行盒 20，与拼团详情页
   `.gbd-sk-btn` 同一档，`check-group-buy-detail.js` ⑲3 钉的也是 40，写成 37 会被判矮）；
   宽度 100% 由 .not-use-btn / .sure-use-btn 那两格给，不在这里另存 42/56 那份数；
   圆角 4（M17 按钮档）、底色 #e5e6eb（这里是白底，走 M18 的白底骨架档） */
.cpn-sk-btn {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  background: #e5e6eb;
}
</style>
