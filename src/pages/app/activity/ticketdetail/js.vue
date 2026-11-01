<script>
import { ticketStatusText, ticketStatusClass, ticketStartText } from '@/common/utils/activity-ticket';
import { code128Bars } from '@/common/utils/code128';
import { qrMatrix, qrRowGradients } from '@/common/utils/qrcode';

export default {
  components: {},
  data() {
    return {
      ticketNo: '',
      // 加载态：详情未落地前铺骨架（M16 禁止 showLoading / tz-loading-page）
      loading: true,
      notFound: false,
      loadMsg: '未查询到相关票券信息',
      info: {},
      coverFailed: false,
      // 码位当前画哪种：barcode（默认）/ qr，点一下互相切换
      codeMode: 'barcode'
    }
  },
  computed: {
    // 状态与活动时间口径与列表共读 common/utils/activity-ticket（状态、配色、时间只存一份）
    startText() {
      return ticketStartText(this.info.activity_start_time);
    },
    statusText() {
      return ticketStatusText(this.info);
    },
    statusClass() {
      return ticketStatusClass(this.info);
    },
    isVirtualPay() {
      return Number(this.info.is_virtual_pay) === 1 && uni.getStorageSync('platform') === 'wxMiniProgram';
    },
    // 条码：票号按 Code128B 现场编码，一段一条 / 一空；空数组表示票号不可编码（此时只出票号文字）
    barcodeBars() {
      return code128Bars(this.info.ticket_no);
    },
    /**
     * 二维码：票号按 QR（M 级纠错）现场编码，与条码同一个内容、同一个票号
     *
     * 模块边长取整数像素：票号 14 位 → 版本 1（21×21），21×4 = 84，与条码同高、切换时版式不跳；
     * 万一内容变长升了版本，按 3px 收一档，最多 116px。
     * 编不出来（超长等）返回 null，页面据此只给条码（codeView 会自动回条码）。
     */
    qr() {
      const no = this.info && this.info.ticket_no;
      if (!no) {
        return null;
      }
      const matrix = qrMatrix(no, 'M');
      if (!matrix) {
        return null;
      }
      const scale = matrix.size * 4 <= 116 ? 4 : 3;
      return {
        size: matrix.size * scale,
        scale: scale,
        rows: qrRowGradients(matrix, scale)
      };
    },
    // 当前该画哪种码：切到二维码但编不出来时自动回条码，不留一块空白
    codeView() {
      return this.codeMode === 'qr' && this.qr ? 'qr' : 'barcode';
    },
    // 两种码都出得来才给切换提示，否则那行提示指向一个切不动的动作
    canSwitchCode() {
      return this.barcodeBars.length > 0 && !!this.qr;
    },
    // 票券信息行：参加人 / 手机号 / 报名表单其余字段 / 购买时间 / 使用时间
    // （票档与价格已在票码区展示，状态在票码标题右侧，避免同一件事在页里说两遍）
    infoRows() {
      const d = this.info || {};
      const rows = [
        { label: '参加人', value: d.name || '-' },
        { label: '手机号', value: d.mobile || '-' }
      ];
      const other = Array.isArray(d.other) ? d.other : [];
      for (let i = 0; i < other.length; i++) {
        const item = other[i] || [];
        rows.push({
          label: item[0] || '报名信息',
          value: (item[1] === 0 || item[1]) ? String(item[1]) : '-'
        });
      }
      rows.push({
        label: '购买时间',
        value: d.createtime ? this.$tools.formatDate(d.createtime) : '-'
      });
      if (d.use_time) {
        rows.push({ label: '使用时间', value: this.$tools.formatDate(d.use_time) });
      }
      return rows;
    }
  },
  methods: {
    getData() {
      return this.$api('app.activity.ticket.getDetail', { ticket_no: this.ticketNo }).then(res => {
        if (res && res.code === 1 && res.data) {
          this.info = res.data;
          this.notFound = false;
        } else {
          this.notFound = true;
          this.loadMsg = (res && res.msg) || '未查询到相关票券信息';
        }
        this.loading = false;
      }).catch(() => {
        this.notFound = true;
        this.loadMsg = '加载失败，请重试';
        this.loading = false;
      });
    },
    // 封面加载失败：退成占位图（记在当前页，不涉及列表数据）
    onCoverError() {
      this.coverFailed = true;
    },
    /**
     * 点票号：把票号复制到剪贴板（扫票人员核对、转给客服/同事时用）
     *
     * 必须在点击回调这一层**同步**写剪贴板：H5 的 uni.setClipboardData 走
     * document.execCommand('copy')，等接口/异步回来再复制已经脱离用户手势，
     * iOS / 微信内置浏览器里返回 false、success 不回调，读出来就是「点了没反应」。
     * 微信小程序端 setClipboardData 自带「内容已复制」提示，这里不再叠一枚 toast
     * （两枚一起弹就是两个框）；其余端补一句说清复制了什么。
     * 没有票号也要给原因，不留一枚点了没声的控件（M13）。
     */
    copyTicketNo() {
      const no = this.info && this.info.ticket_no;
      if (!no) {
        uni.showToast({ title: '暂无票号可复制', icon: 'none' });
        return;
      }
      uni.setClipboardData({
        data: String(no),
        success: () => {
          // #ifndef MP-WEIXIN
          uni.showToast({ title: '票号已复制', icon: 'none' });
          // #endif
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请重试', icon: 'none' });
        }
      });
    },
    // 点一下码位：条码 ⇄ 二维码（两种码都出得来才切换，见 canSwitchCode）
    toggleCodeMode() {
      if (!this.canSwitchCode) {
        return;
      }
      this.codeMode = this.codeView === 'qr' ? 'barcode' : 'qr';
    },
    /**
     * 点场馆地址：打开地图（用户 2026-10-31 口径：小程序调小程序的接口、微信内 H5 调 H5 的接口、
     * 微信外的 H5 走原生能力；哪一端都打不开地图时，退到「快速复制地址」）
     *
     * 这里有个硬限制：活动表只存文本地址（`tuzhi_app_activity.location`），没有经纬度，
     * 而微信小程序 `uni.openLocation` 与微信 JS-SDK `jweixin.openLocation` 都必须吃坐标 ——
     * 所以小程序 / App 这一端现在没有「按文字地址打开地图」的接口，按口径复制地址；
     * H5 可以用地图网页按文字检索（`uri.amap.com/search`），微信内外都打得开：
     * 微信内置浏览器在同一 webview 里跳（微信里 window.open 常被拦），其余浏览器新开窗口。
     */
    openVenueMap() {
      const address = String((this.info && this.info.activity_location) || '').trim();
      if (!address) {
        uni.showToast({ title: '暂无场馆地址', icon: 'none' });
        return;
      }
      // #ifdef H5
      const url = 'https://uri.amap.com/search?keyword=' + encodeURIComponent(address);
      if (this.$wxsdk && this.$wxsdk.isWechat()) {
        window.location.href = url;
      } else {
        window.open(url, '_blank');
      }
      return;
      // #endif
      // #ifndef H5
      this.copyVenueAddress(address);
      // #endif
    },
    // 打不开地图那一档的兜底：把地址复制走（M13：复制成功 / 失败都要说话）
    copyVenueAddress(address) {
      uni.setClipboardData({
        data: String(address),
        success: () => {
          // 微信小程序 setClipboardData 自带「内容已复制」，等它收起来再补一句为什么只复制了地址
          // #ifdef MP-WEIXIN
          setTimeout(() => {
            uni.showToast({ title: '当前环境无法直接打开地图，可粘贴到地图 App 搜索', icon: 'none' });
          }, 1500);
          // #endif
          // #ifndef MP-WEIXIN
          uni.showToast({ title: '已复制场馆地址，可在地图 App 中搜索', icon: 'none' });
          // #endif
        },
        fail: () => {
          uni.showToast({ title: '复制失败，请长按地址手动复制', icon: 'none' });
        }
      });
    },
    // 订单详情 → 订单列表的详情页（票券只带订单号，没有订单主键）
    goOrder() {
      if (!this.info.order_no) return;
      this.$nav.to('/pages/order/detail/detail?order_no=' + encodeURIComponent(this.info.order_no), 'local');
    }
  },
  onLoad(pageParams) {
    this.ticketNo = (pageParams && pageParams.ticket_no) || '';
    if (!this.ticketNo) {
      this.loading = false;
      this.notFound = true;
      this.loadMsg = '未查询到相关票券信息';
      return;
    }
    this.getData();
  },
  // 从订单/活动详情返回时静默重取（不闪骨架）：签到状态、使用时间可能在别处已变
  onShow() {
    if (this.ticketNo && !this.loading) {
      this.getData();
    }
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  }
}
</script>
