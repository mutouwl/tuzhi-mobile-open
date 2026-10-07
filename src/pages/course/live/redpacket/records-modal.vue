<template>
  <!--
    直播间红包记录弹层：右侧悬浮「红包」入口点开，列出这一场直播发过的每一只红包。
    竞品把这一屏放在直播间右下角「···」里，本系统直播间的右侧悬浮栏就是同一档运营入口，
    于是落在红包那一枚上（2026-09-30 用户点名「点击页面右侧的红包按钮，弹出一个红包记录弹窗」）。
    状态、类型、金额、个数一律吃后端逐行下发的字段，前端不比时间戳、不自己数（M22）。
    点一行进那只红包的信封：这一屏**不关**，信封叠在上面，关掉信封就回到这一屏（2026-10-01 用户点名
    「点击弹出领取红包弹窗，不要关闭这个红包记录弹窗」；竞品说这条记录页就是为「找不回那只红包」而设，
    进来一趟就把它关掉等于每次都要重新点开）。
  -->
  <u-popup
    :show="visible"
    mode="bottom"
    bgColor="transparent"
    :round="12"
    :closeable="true"
    :safeAreaInsetBottom="false"
    :overlayStyle="{ zIndex: 10200 }"
    :zIndex="10210"
    @close="close"
  >
    <div class="rp-rec">
      <div class="rp-rec-head">
        <div class="rp-rec-title">红包记录</div>
        <text class="rp-rec-total" v-if="total > 0">共 {{ total }} 个</text>
      </div>

      <!-- 列表区给确定高度（M6：只写 min/max 在小程序端滑不动也拉不出刷新）。
           这一屏按 70vh 而不是默认那档 60vh：一行两行文字、行高约 65 加 10 行距共 75，60vh 一屏露六行，
           用户读出来是「高度偏小」；再高一档（75vh）就要顶到标题那一条了 -->
      <tz-popup-list height="70vh" padding="0 0 12px" :refreshing="refreshing" @refresh="refresh" @lower="loadMore">
        <!-- 骨架按真实行的四块逐块铺：左列名称条（含行尾那枚状态标签的位置）+ 元信息条，
             右列金额块 + 时间块（M16「逐块」含行尾那一块，一条百分比占位条盖不到右半边）。
             行底色、圆角、行距与真实行同一档、块的颜色跟行底同族（.rp-rec-sk / .rp-rec-sk-row
             与下面那条四块共用的声明见样式区），数据到手不跳版 -->
        <div class="rp-rec-sk" v-if="loading && !rows.length">
          <div class="rp-rec-sk-row" v-for="i in 7" :key="'rp-rec-sk-' + i">
            <div class="rp-rec-sk-main">
              <div class="rp-rec-sk-name-row">
                <div class="rp-rec-sk-line rp-rec-sk-line--title"></div>
                <div class="rp-rec-sk-tag"></div>
              </div>
              <div class="rp-rec-sk-line rp-rec-sk-line--meta"></div>
            </div>
            <div class="rp-rec-sk-side">
              <div class="rp-rec-sk-amount"></div>
              <div class="rp-rec-sk-time"></div>
            </div>
          </div>
        </div>
        <div class="rp-rec-list" v-else>
          <div class="rp-rec-row" v-for="item in rows" :key="item.id" @tap="pick(item)">
            <div class="rp-rec-main">
              <div class="rp-rec-name-row">
                <text class="rp-rec-name">{{ nameOf(item) }}</text>
                <text
                  :class="['rp-rec-tag', item.status == 'pending' ? 'rp-rec-tag--pending' : '']"
                  v-if="statusTextOf(item.status)"
                >{{ statusTextOf(item.status) }}</text>
              </div>
              <text class="rp-rec-meta">{{ metaOf(item) }}</text>
            </div>
            <div class="rp-rec-side">
              <!-- 金额落在行尾那一列、吃价格档（红 + 600）：压在灰字元信息里会被读成第三句说明 -->
              <text class="rp-rec-amount">{{ amountTextOf(item.total_amount) }}<text class="rp-rec-amount-unit">元</text></text>
              <text class="rp-rec-time">{{ timeText(item.createtime) }}</text>
            </div>
          </div>
          <!-- 空态：这一族三处都有，且都要把「取不到了」与「本来就没有」分开说（M13）。
               本屏走 u-empty（与参照页 student/list:30 同一款组件、同一句式；那个写法是
               「表空且没在取数」，本屏这一段是骨架那支 `loading && !rows.length` 的 v-if 与
               列表那支 v-else 的一对，两支合起来正好把取数中那一档排掉，与参照页等价）；
               信封弹窗的领取记录走居中文字档（css.css:238 .rp-records-empty），
               我的红包记录页 pages/user/redpacket/log.vue:20 走 u-empty 的 v-else-if。
               判据只有「整表为空」这一张：首屏没数据 / 刷新后没数据 / 缺 course_id / 接口失败四支都落这里。
               续页那一支失败不落这里 —— 前面几十行还摆着，用户读出来是「没加载完」不是「一只红包都没有」，
               那一句交给下面 .rp-rec-error（u-loadmore 只有 loadmore/loading/nomore 三档，没有失败档） -->
          <u-empty
            v-if="!rows.length"
            icon="/static/image/empty.png"
            width="70"
            height="70"
            :text="error || '这场直播还没有发过红包'"
          ></u-empty>
          <div class="rp-rec-error" v-if="rows.length && error">{{ error }}</div>
          <u-loadmore :status="loadStatus" v-if="rows.length && loadStatus !== 'nomore'"></u-loadmore>
        </div>
      </tz-popup-list>
    </div>
  </u-popup>
</template>

<script>
import { typeText, statusText, amountText } from './redpacket-text.js';

export default {
  name: 'redpacket-records',
  props: {
    visible: { type: Boolean, default: false },
    courseId: { type: [String, Number], default: 0 },
  },
  // 事件名避开原生名（M28：H5 编译器把模板里的 @tap 单向改成 @click，组件发 tap 永远收不到）
  emits: ['close', 'pick'],
  data() {
    return {
      rows: [],
      total: 0,
      page: 1,
      limit: 20,
      hasMore: false,
      loading: false,
      refreshing: false,
      // 取数序号：下拉刷新与上拉加载可能同时在飞，过期的那一份回来不许碰 rows/page/hasMore，
      // 否则「刷新途中已经加载到第 3 页」的那份旧回音会拼到刚刷新的第 1 页后面（同一只红包出现两次）
      reqSeq: 0,
      // 取列表失败那一句（接口 msg）：空态吃它，不把接口故障说成「还没发过红包」（M13）
      error: '',
    };
  },
  computed: {
    loadStatus() {
      if (this.loading) { return 'loading'; }
      return this.hasMore ? 'loadmore' : 'nomore';
    },
  },
  watch: {
    // 每次打开静默补一次：商家在中控台刚发的那只要立刻排在最上面
    visible(val) {
      if (val) { this.load(1); }
    },
  },
  methods: {
    /** 页面正在卸载时晚到的回音不再写 data（M26） */
    gone() {
      return this._isDestroyed === true || this._isBeingDestroyed === true;
    },
    close() {
      this.$emit('close');
    },
    pick(row) {
      this.$emit('pick', row);
    },
    statusTextOf(status) {
      return statusText(status);
    },
    amountTextOf(amount) {
      return amountText(amount);
    },
    /**
     * 行首那一句：祝福语在中控台是选填，库里大量红包这一栏就是空的（实测 243/242/241… 全为空），
     * 空着退回「手气红包 / 等分红包」——用户点名不要发放人那一行（发放人是管理员账号名，
     * 在学员端读出来就是「admin发的红包」），类型名在这一行不重复出现第二次（元信息只说个数）
     */
    nameOf(item) {
      return item.blessing || typeText(item.type);
    },
    metaOf(item) {
      return '共 ' + (item.total_count || 0) + ' 个';
    },
    timeText(time) {
      return time ? this.$tools.formatDate(time, 'MM-DD HH:mm') : '';
    },
    load(page) {
      if (!this.courseId) {
        this.error = '直播信息还在加载，稍等片刻再看红包记录';
        // 这一条也是「退出口」：下拉刷新已经把 refresher-triggered 拉起来了，不收口就是转圈转不停
        this.refreshing = false;
        this.loading = false;
        return;
      }
      const target = Math.max(1, Number(page) || 1);
      if (target > 1 && this.loading) { return; }
      const seq = ++this.reqSeq;
      this.loading = true;
      this.error = '';
      this.$api('live.redpacket.getList', {
        course_id: this.courseId,
        page: target,
        limit: this.limit,
      }).then((ret) => {
        // 过期响应直接丢：这一轮的 loading/refreshing 由最新那一次收口（参照页 student/list 的 refreshSeq）
        if (seq !== this.reqSeq) { return; }
        this.loading = false;
        this.refreshing = false;
        if (this.gone()) { return; }
        if (!ret || ret.code !== 1) {
          // 只有「本来就是空表」才清成空态去接那句 error（首屏失败、缺 course_id 走这一支）；
          // 已经摆着行的那一支不抹列表 —— 下拉刷新抖一下就把几十行抹掉，用户读出来是「记录全没了」
          if (target === 1 && !this.rows.length) {
            this.rows = [];
            this.total = 0;
          }
          // hasMore 也不在这里关：这一支的意思是「这一页没取到」，不是「后面没有了」。
          // 关了就收成 nomore，u-loadmore 收起来用户连重试的点都没了，只剩「下拉刷新」一条路
          this.error = (ret && ret.msg) || '红包记录获取失败，请下拉刷新重试';
          return;
        }
        const data = ret.data || {};
        const list = data.rows || [];
        this.page = target;
        this.total = Number(data.total) || 0;
        this.rows = target === 1 ? list : this.rows.concat(list);
        // 收口吃后端下发的 has_more（M3），不再拿 total 自己推；顺带把「空页」当末页：
        // 贴着底部上拉时一页都没新增还接着发请求，就是一段空转的空页面
        this.hasMore = !!data.has_more && list.length > 0;
      }).catch(() => {
        if (seq !== this.reqSeq) { return; }
        this.loading = false;
        this.refreshing = false;
        if (this.gone()) { return; }
        // 与上面 code !== 1 那一支同一口径：空表才清成空态，有行只报错（不抹列表、不关 hasMore）
        if (target === 1 && !this.rows.length) {
          this.rows = [];
          this.total = 0;
        }
        this.error = '红包记录获取失败，请下拉刷新重试';
      });
    },
    loadMore() {
      if (!this.hasMore || this.loading) { return; }
      this.load(this.page + 1);
    },
    refresh() {
      this.refreshing = true;
      this.load(1);
    },
  },
};
</script>

<style scoped>
/* 底部安全区只挂这一份（模板已关 u-popup 的 safeAreaInsetBottom，微信端按全站减半口径）；
   底部那一格内衬交给滚动画布自己给（tz-popup-list 的 padding="0 0 12px"）——
   面板不再写「20px + 安全区」：iPhone X 下那样叠成 20 + 34 = 54px，比同屏礼物/商品弹层
   （内容自己 10px + 安全区 34px = 44px）明显多一截，2026-10-01 用户点名
   「邀请达人榜、分享有礼模块相关的弹窗底部安全距离都太大了，参考其他的 popup 组件」。
   红包记录与那两只同属直播间弹层、同一份写法，一并收口（硬约束 6：同类元素改一遍） */
.rp-rec {
  position: relative;
  background: #fff;
  border-radius: 12px 12px 0 0;
  overflow: hidden;
  padding: 0 16px;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /*  #ifdef  MP-WEIXIN  */
  padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
  padding-bottom: calc(env(safe-area-inset-bottom) / 2);
  /*  #endif  */
  display: flex;
  flex-direction: column;
}
/* 标题 16px/600 左对齐（.school-popup-title 口径，M18）；右侧留 26px 给 u-popup
   那枚绝对定位的关闭图标。2026-10-04 用户点名「共多少个做成 Tag 放在红包记录标题的右侧」，
   于是头部不再 space-between 把计数推到最右，两枚并排靠左、间距只由这一处 gap 给（硬约束 20） */
.rp-rec-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 26px 12px 0;
  flex: none;
}
.rp-rec-title {
  font-size: 16px;
  font-weight: 600;
  color: #1d2129;
}
/* 「共 N 个」Tag：走全站状态标签那一档（12px / 内衬 1px 6px / 圆角 4 / 浅灰底 + 深灰字，
   字比标题小一号），与同屏邀请达人榜标题行那枚 .irb-state-tag 逐值相同（参照页仲裁，M6）。
   这一枚压在白色面板上、不在行的粉底块里，所以不跟行内那族暖红系走（硬约束 29④：白底上的照旧，
   换色只这一族，不外溢）；灰底 #f2f3f5 上配 #4e5969 是 6.0:1，够 12px 读 */
.rp-rec-total {
  flex: none;
  padding: 1px 6px;
  font-size: 12px;
  line-height: 17px;
  color: #4e5969;
  background: #f2f3f5;
  border-radius: 4px;
}
/* 列表容器：行与行的垂直间距只由这一处 gap 给（行自身不带 margin，
   末行不用按索引收口——同族「末行收口」那套是为发丝线留的，底色分块时不再有线下沿） */
.rp-rec-list,
.rp-rec-sk {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
/* 这一页没取到、前面还有行时的那一句：压在白面板上（不在行的那块粉底上），取本弹窗已有的暖红一档，
   12px 居中；u-loadmore 没有失败档，这一行是「静默停住」那一族唯一的出口（M13） */
.rp-rec-error {
  font-size: 12px;
  line-height: 17px;
  color: #c2273d;
  text-align: center;
  padding: 2px 12px 0;
}
/* 行：浅浅的粉底块，取自红包信封那档红（弹窗红身 rgba(250,74,96) / 信封红 #f0435c，
   8% 叠白底 ≈ #fee7eb，与信封里「手气最佳」那枚标签同一份底色），行与行之间不再画发丝线 */
.rp-rec-row {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(240, 67, 92, 0.08);
}
.rp-rec-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.rp-rec-name-row {
  display: flex;
  align-items: center;
  min-width: 0;
}
/* 行内三档文字全部按这一行粉底重新取色，不再照搬白底那套冷灰（2026-09-30 用户点名
   「字体颜色跟背景的粉红色不搭」）：行底 = 信封红 8% 叠白 ≈ #fef0f2，冷灰 #86909c 压上去只有
   2.9:1（10px 的时间根本不够读）、近黑 #1d2129 又与粉底分属两个色系，看着发脏。
   三档都从信封红 #f0435c 派生的暖红系里取：名称深红 7.8:1、元信息暖灰红 5.5:1 */
.rp-rec-name {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  color: #8f2233;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rp-rec-meta {
  margin-top: 4px;
  font-size: 12px;
  line-height: 17px;
  color: #87545e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rp-rec-side {
  flex: none;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
/* 状态标签：小元素档 11px / 圆角 4（M21），紧跟在名称右侧
   （M6：右上角那格是关闭图标的，标签要贴名称而不是推到行尾）。
   两档颜色照抄红包信封那一份，不另造：结束态（已抢完/已过期/已撤回）＝白底红字，
   对应信封白卡上「手气最佳」那枚标签（rgba(240,67,92,0.08) 底 + #f0435c 字）——
   行底本身就是 8% 粉，再叠 8% 红等于没底，所以升成纯白；待领取＝红底白字，
   对应信封红身 + 白字那一档。红底压深一档（#d3314b）是给 11px 白字留对比（4.9:1） */
.rp-rec-tag {
  flex: none;
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #fff;
  font-size: 11px;
  line-height: 16px;
  color: #c2273d;
}
.rp-rec-tag--pending {
  background: #d3314b;
  color: #fff;
}
/* 金额：行内最重的一档，吃信封红 #f0435c 下压一档的 #c2273d（信封上金额是 #f0435c，
   但压在 8% 粉行底上只有 3.4:1、16px 加粗也压不住；同族的 §1 价格档 #f53f3f 同为 3.4:1） */
.rp-rec-amount {
  font-size: 16px;
  font-weight: 600;
  color: #c2273d;
  line-height: 20px;
}
.rp-rec-amount-unit {
  font-size: 11px;
  font-weight: 400;
  margin-left: 2px;
}
/* 灰字时间：10px 档，与元信息同一档暖灰红（分档再低一档，10px 读不动） */
.rp-rec-time {
  margin-top: 6px;
  font-size: 10px;
  line-height: 14px;
  color: #87545e;
}
/* ===== 骨架：与真实行同底色、同圆角、同留白（.rp-rec-sk 的 gap 同上），加载完不跳版（M16） ===== */
.rp-rec-sk-row {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  background: rgba(240, 67, 92, 0.08);
}
.rp-rec-sk-main {
  flex: 1;
  min-width: 0;
}
/* 骨架块（左侧两条 + 标签 + 行尾两块，四块共用这一条声明：颜色只写一次，
   免得下一个人只改其中一块）。压在有色行底上时占位块要跟这块底同族，不能留全站那一档中性灰
   ——2026-10-02 用户点名「列表是粉红色的，那么加载状态是灰色的，这样导致不协调」。
   色值仍从信封红 #f0435c 派生、只是浓度高一档：在那层 8% 粉行底（叠白 ≈ #fee4ec）上叠 0.28
   ⇒ 观感 ≈ #fab7c4，压行底 1.39:1（够看出一块占位），比行内最浅那档文字 #87545e 亮得多、
   不会被读成真字；灰块压粉底是两个色系，10px 那两小块读起来像「有一片脏东西」。
   判据：**有色底 + 逐块骨架**的行，占位块跟底色同族；白底上的骨架（礼物/商品/连麦记录那三只）照旧灰 */
.rp-rec-sk-line,
.rp-rec-sk-tag,
.rp-rec-sk-amount,
.rp-rec-sk-time {
  /* 圆角也一起归到这一条：四块都是 4px 档，形状与颜色同属「占位块」这一档 */
  border-radius: 4px;
  background: rgba(240, 67, 92, 0.28);
}
.rp-rec-sk-name-row {
  display: flex;
  align-items: center;
}
.rp-rec-sk-line--title {
  width: 46%;
  height: 14px;
}
/* 与真实行同位：标签在名称右侧，不在名称下面 */
.rp-rec-sk-tag {
  width: 40px;
  height: 18px;
  margin-left: 6px;
  flex: none;
}
.rp-rec-sk-line--meta {
  width: 62%;
  height: 12px;
  margin-top: 8px;
}
.rp-rec-sk-side {
  flex: none;
  margin-left: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
/* 行尾两块按真实档给：金额 16 高（真实 16px/行高 20）、时间 10 高 */
.rp-rec-sk-amount {
  width: 52px;
  height: 16px;
}
.rp-rec-sk-time {
  width: 62px;
  height: 10px;
  margin-top: 8px;
}
</style>
