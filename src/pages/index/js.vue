<script>
import { readDecoratePage, writeDecoratePage } from '@/common/utils/decorate-page-cache';

/**
 * 从当前页地址里取「自定义页 id」：`.../pages/index/index?id=3&share=486` ⇒ `'3'`。
 *
 * 老写法是 `path.substring(path.indexOf('id=') + 3)`——只要 `id` 后面还有参数
 * （分享链接就是 `?id=3&share=486`、Tab 配置偶尔也带分类参数），就会把
 * `3&share=486` 整段当成 id：接口按这串查不到记录会回落到默认首页，
 * 缓存也会给同一个页面存出两个键。**id 是页面身份**，这一处只许取出纯 id。
 * @param {String} path 当前页地址（H5 是 hash，小程序是 fullPath）
 * @return {String} 页面 id；没有 `id` 参数时回空串（默认首页）
 */
function pageIdFromPath(path) {
  const source = path || '';
  const queryIndex = source.indexOf('?');
  if (queryIndex === -1) {
    return '';
  }
  const query = source.substring(queryIndex + 1).split('#')[0];
  const pairs = query.split('&');
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    if (pair.substring(0, 3) !== 'id=') {
      continue;
    }
    const value = pair.substring(3);
    if (!value) {
      return '';
    }
    try {
      return decodeURIComponent(value);
    } catch (err) {
      return value;
    }
  }
  return '';
}

var that;
export default {
  data() {
    return {
      pageParams: {
        id: 0,
      },
      data: {
        page: {},
      },
      pageNull: false,
      loading: true,
      // 首屏数据是否已落地；落地后 onShow 不再整页重取（2026-10-28 刷新分层，见 onShow 注释）
      loaded: false,
      // 已落地的页面 id：切 tab / 切页面回来判「还是不是同一页」，
      // H5 同一个实例换了装修页（hash 里的 id 变了）时也靠它把新页取回来
      loadedPageId: null,
      // 落地时用的是哪一枚登录态：券那几段带 userCoupons，登录/换号后不能因为「同一页」就跳过重取
      loadedToken: "",
      circleList: [],
      circlePostList: [],
      circleInstalled: false,
      // 教务插件安装状态（付费插件）：未安装时模板不渲染课程套餐/老师/校区组件
      schoolInstalled: false,
      // 打卡插件安装状态（付费插件）：未安装时模板不渲染打卡列表组件
      checkinInstalled: false,
      // 拼团插件安装状态（付费插件）：未安装时模板不渲染拼团商品组件
      groupBuyInstalled: false,
      // 积分商城「展示兑换量」开关：缺省 1 = 显示，与 /marketing/score 设置、装修组件同一份配置
      scoreShowRedeemed: 1,
    };
  },
  watch: {},
  methods: {
    /**
     * 取数（2026-10-28 刷新分层）
     *
     * 判据只有三条：
     *   ① force（下拉刷新）——这一页唯一的强制重载出口，重新请求并覆盖缓存；
     *   ② 缓存命中（同一个页面 id + 同一枚 user_token）——直接复原，**一条请求都不发**、也不挂加载页；
     *      切 tab / 切自定义页 / 从子页退回都走这一档。底部导航切页走 `redirectTo`
     *      （`tz/tab-bar.vue` → `$nav.to(..., 'redirectTo')`），当前页实例会被销毁，
     *      所以缓存必须按页面 id 留在模块作用域（`common/utils/decorate-page-cache`）；
     *   ③ 兜底取数：首进 / 缓存未命中 / 登录态变了——取一次。
     *
     * 首取失败不写缓存，下一次 onShow 照旧重试，不会卡在空页 / 加载页里出不来。
     * @param {Boolean} force 是否强制重取（只有下拉刷新传 true）
     */
    getData(force = false) {
      const pageId = that.pageParams.id;
      // 装修接口虽然 noNeedLogin，但登录态会影响券那几段（后端 `Decorate::parseData` 的 coupon
      // 分支走 `user_info()`、随行带 userCoupons）⇒ 缓存按「取数时那枚 token」存 / 取，
      // 登录、换号、退出后不能摆着上一个人的「继续领 / 点击领取」
      const token = uni.getStorageSync("user_token") || "";

      if (!force) {
        const cached = readDecoratePage(pageId);
        if (cached && cached.token === token) {
          that.renderPage(cached.data, cached.circleList, cached.circlePostList, token);
          // 圈子那两段是装修接口回来后才发的第二组请求：页面本体先落缓存，
          // 没凑齐时只补这两段，不整页重取、不再挂一次加载页
          if (!cached.circleLoaded) {
            that.fillCircleComponents(cached.data, pageId, token);
          }
          return;
        }
      }

      that.loading = true;
      that
        .$api("page.decorate.getPage", {
          id: pageId,
        })
        .then((res) => {
          uni.stopPullDownRefresh();
          // 期间切到了别的自定义页（H5 同一个实例换了 hash）：这一份照样按发请求时那个 id 入缓存，
          // 但不再往新页面上贴（否则新页会闪一下旧页的内容）
          const samePage = String(that.pageParams.id || "") === String(pageId || "");
          if (res.code == 1) {
            // 页面本体先入缓存：圈子那两段还在路上时切走，回来也不必重拉整页
            writeDecoratePage(pageId, {
              data: res.data,
              circleList: [],
              circlePostList: [],
              circleLoaded: false,
              token: token,
            });
            if (!samePage) {
              return;
            }
            that.renderPage(res.data, [], [], token);
            that.fillCircleComponents(res.data, pageId, token);
          } else if (samePage) {
            that.loading = false;
            that.pageNull = true;
          }
        })
        .catch((err) => {
          uni.stopPullDownRefresh();
          if (String(that.pageParams.id || "") !== String(pageId || "")) {
            return;
          }
          that.loading = false;
        });
    },

    /**
     * 把一份装修数据落到页面上（首取与缓存复原共用这一处，避免两套赋值漂移）。
     * @param {Object} pageData 装修接口的 data
     * @param {Array} circleList 缓存里的圈子列表（首取传空数组，由 fillCircleComponents 补）
     * @param {Array} circlePostList 缓存里的圈子动态列表（同上）
     * @param {String} token 这份数据是按哪枚登录态取的（onShow 靠它判身份有没有变）
     */
    renderPage(pageData, circleList, circlePostList, token) {
      that.loaded = true;
      that.loadedPageId = that.pageParams.id;
      that.loadedToken = token || "";
      that.pageNull = false;
      that.data = pageData;
      that.circleList = circleList || [];
      that.circlePostList = circlePostList || [];
      that.loading = false;
      uni.setNavigationBarTitle({
        title: pageData.page.name,
      });

      if (pageData.default_page == 1 || pageData.type == "index") {
        uni.setStorageSync("index_id", pageData.id);
      }

      // 教务组件安装状态：未安装时模板不渲染（数据由装修接口在插件已安装时下发）
      that.schoolInstalled = !!that.$tools.systemConfig("app_isinstall_school");
      // 打卡组件安装状态：同上，取数已在装修接口里按配置做完，这里只挡模板
      that.checkinInstalled = !!that.$tools.systemConfig("app_isinstall_checkin");
      // 拼团组件安装状态：同上（付费插件，未安装时装修接口也不下发这一段的 list）
      that.groupBuyInstalled = !!that.$tools.systemConfig("app_isinstall_group_buy");
      // 圈子组件安装状态：**必须在落地这一处判**——缓存里 circleLoaded 已凑齐时不会再走
      // loadCircleComponents，少了这一句，切 tab 回来圈子那两段会因为模板闸门恒 false 整段消失
      that.circleInstalled = !!that.$tools.systemConfig("app_isinstall_circle");

      // 积分商城「展示兑换量」：与本页装修数据分开取（装修接口只下发商品行，开关在积分配置里）。
      // 落地这一处判，与上面几枚安装状态同档；缓存命中时也照常刷新一次（开关是商家随时会改的）
      that.loadScoreShowRedeemed();

      // #ifdef H5
      that.$nav.share(pageData.page.name);
      // #endif
    },

    /**
     * 积分商城「展示兑换量」开关（`app.score.config` → `show_redeemed`，缺省 1 = 显示）
     *
     * 装修接口只下发商品行、不带这个开关；本页在落地那一处取一次即可（不阻塞首屏渲染：
     * 缺省值就是「显示」，开关为关时卡片只是把「已兑换 N」这一格隐藏，不牵动版式）。
     */
    loadScoreShowRedeemed() {
      const vm = that;
      vm.$api("app.score.config", {})
        .then((res) => {
          if (res.code === 1 && res.data) {
            vm.scoreShowRedeemed =
              res.data.show_redeemed === undefined ? 1 : Number(res.data.show_redeemed);
          }
        })
        .catch(() => {
          // 取失败沿用缺省「显示」，不把这一格误藏
        });
    },

    /**
     * 圈子类组件的二次取数（装修接口不下发这几段）+ 回写缓存。
     * 实例在发请求那一刻捕获：模块级 `that` 会被别的实例改写，异步回来时不许再拿它取值。
     * @param {Object} pageData 装修接口的 data
     * @param {String|Number} pageId 这份数据属于哪个自定义页（缓存键，与实例无关）
     * @param {String} token 这一份是按哪枚登录态取的（缓存按它判身份有没有变）
     */
    fillCircleComponents(pageData, pageId, token) {
      const vm = that;
      return vm
        .loadCircleComponents(pageData.compontents || [], vm)
        .then(() => {
          // 期间若有一次新的取数覆盖了缓存（下拉刷新 / 换页），这一份圈子结果就不算数：
          // 直接按 pageData 重建会把旧页面本体写回去，覆盖掉新那一份
          const current = readDecoratePage(pageId);
          if (!current || current.data !== pageData) return;
          writeDecoratePage(pageId, {
            data: current.data,
            circleList: vm.circleList,
            circlePostList: vm.circlePostList,
            circleLoaded: true,
            token: current.token,
          });
        })
        .catch(() => {
          // 圈子取失败不影响页面本体：缓存里 circleLoaded 仍是 false，
          // 下次切回来只补这两段（getData 的缓存分支），不会整页重拉
        });
    },

    // 加载圈子类组件数据（插件未安装时跳过，组件不渲染）
    // vm：本次取数所属的页面实例（不传时回落模块级 that；异步链路一律显式传，防切页后写到别的实例上）
    async loadCircleComponents(compontents, vm) {
      const page = vm || that;
      page.circleInstalled = !!page.$tools.systemConfig("app_isinstall_circle");
      if (!page.circleInstalled) {
        return;
      }
      for (const item of compontents) {
        if (!item || !item.type) {
          continue;
        }
        if (item.type == "circle") {
          const config = item.config || {};
          const source = config.source || "auto";
          if (source == "manual" && config.list && config.list.length) {
            const ids = config.list.map(c => c.id).join(',');
            const res = await page.$api("circle.circle.goodsList", { ids });
            if (res.code == 1) {
              page.circleList = res.data || [];
            }
          } else {
            const res = await page.$api("circle.circle.goodsList", { limit: config.maxShowNum || 6 });
            if (res.code == 1) {
              page.circleList = res.data || [];
            }
          }
        }
        if (item.type == "circle_post") {
          const config = item.config || {};
          if (config.circleId) {
            const res = await page.$api("circle.post.previewList", {
              circle_id: config.circleId,
              tab: config.postType || "all",
              limit: config.maxShowNum || 5,
            });
            if (res.code == 1) {
              page.circlePostList = res.data || [];
            }
          }
        }
      }
    },

    // 自定义页圈子动态卡片点击：进入动态详情（与圈子主页 goDetail 一致，详情页按 id 加载）
    goPostDetail(post) {
      if (!post || !post.id) return;
      that.$nav.to('/pages/app/circle/post/detail?id=' + post.id);
    },

    //刷新（下拉刷新：唯一的强制重载出口——不吃缓存，重新请求并覆盖缓存）
    refresh() {
      that.getData(true);
    },
  },
  onShow() {
    // 模块级 that 停在最后一次 onLoad 的实例上；本页重新可见先收回绑定。
    // 本页下面几行就要往 that.pageParams 上写，绑定不收回到当前实例就会写到别的（已销毁的）首页实例上
    that = this;
    // 获取当前页面的路由信息
    // 声明只写一处：两个平台分支各写一次 `path` 会让「两端只编译其一」的代码在静态检查里
    // 撞成「Identifier 'path' has already been declared」（mobile-sfc-check 不剥条件编译）
    let path = "";

    // #ifdef MP-WEIXIN || MP-TOUTIAO
    let pages = getCurrentPages(); //获取加载的页面
    let currentPage = pages[pages.length - 1]; //获取当前页面的对象
    path = currentPage.$page.fullPath;
    // #endif

    // #ifdef H5
    path = window.location.hash;
    // #endif

    // id 变了＝**另一个自定义页**（H5 走同一路由只换 query 时，uni-app 会复用这个页面实例：
    // onLoad 不再重跑，只补一次 onShow）⇒ 页面级状态按新页重置、滚动回第一屏，
    // 再按新 id 走缓存 / 取数；缓存键就是 id，上一页的内容不会被当成这一页。
    // 老实例发出的在途请求回来时由 getData 的 samePage 判据丢掉，不会贴到新页上。
    const nextPageId = pageIdFromPath(path);
    const idChanged = that.loaded && String(that.loadedPageId) !== String(nextPageId);
    that.pageParams.id = nextPageId;
    if (idChanged) {
      // 圈子那两段是按上一页的配置取的，先清掉；新页有用的话 renderPage/补取会填回来
      that.circleList = [];
      that.circlePostList = [];
      // 实例被复用时滚动位置留在上一页，新页从第一屏看起
      if (typeof uni.pageScrollTo === "function") {
        uni.pageScrollTo({ scrollTop: 0, duration: 0 });
      }
    }

    // 判据（2026-10-28 刷新分层）：本页数据已经落地、还是同一个自定义页、且登录态没变 → 一条请求都不发。
    // 从子页退回、切 tab 回来都在这一档；页面实例被重建时 loaded 为 false，
    // getData 会先吃本会话缓存（切 tab 回来同样不重拉，也不闪加载页）。
    // 登录 / 换号后本地 token 会变：券那几段是按人下发的，这一档必须重取（缓存也按 token 分档）。
    // 想要最新内容走下拉刷新——那是这一页唯一的强制重载出口。
    const currentToken = uni.getStorageSync("user_token") || "";
    const samePage = that.loaded
      && String(that.loadedPageId) === String(that.pageParams.id)
      && that.loadedToken === currentToken;
    if (!samePage) {
      that.getData();
    }

    if (this.$refs.hasOwnProperty("tabbar")) {
      this.$refs["tabbar"].refresh();
    }
  },
  onLoad(pageParams) {
    that = this;
    that.pageParams = that.$nav.parsePageParams(pageParams);
  },
  //下拉刷新
  onPullDownRefresh() {
    that.refresh();
  },
  //上划加载
  onReachBottom() {
    return false;
  },
  onShareAppMessage() {
    return this.$nav.share();
  },
  onShareTimeline() {
    return this.$nav.share();
  },
};
</script>
