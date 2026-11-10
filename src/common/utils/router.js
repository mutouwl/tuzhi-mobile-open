// #ifdef H5
import wxsdk from '@/common/wechat/sdk';
import tools from '@/common/utils/tools';
// #endif
export default {

    /**
     * 跳转路由
     * @param {*} src 地址
     * @param {*} type 类型 local本地页面 
     * @param {*} mode 跳转方式
     */
    to(src, type = 'local', mode = 'navigateTo') {
        var url = '';

        if (type == 'unlink' || !src) {
            return false;
        }

        var url = this.getPagePath(src, type);

        if (type == 'page_diy' || url == '/pages/index/index') {
            // mode = 'redirectTo';
        }

        this.jump(url, mode)
    },


    back(level = 1) {
        uni.navigateBack({
            delta: level
        })
    },
    /**
     * 转义页面地址
     * @param {*} src 
     * @param {*} type 
     * @returns 
     */
    getPagePath(src, type) {
        var url = '';

        //适配首页路由
        var indexPageId = uni.getStorageSync('index_id');
        if (indexPageId && (src == '/pages/index/index?id=' + indexPageId || (src == indexPageId && type == 'page_diy'))) {
            url = '/pages/index/index';
        } else {
            if (src == '/pages/index/index?id=') {
                url = '/pages/index/index';
            } else {
                switch (type) {
                    case 'local':
                        url = src;
                        break;
                    case "page_system":
                        url = src;
                        break;
                    case 'course':
                        url = '/pages/course/detail/detail?id=' + src;
                        break;
                    case 'column':
                        url = '/pages/course/detail/detail?id=' + src;
                        break;
                    case 'article':
                        url = '/pages/course/detail/detail?id=' + src;
                        break;
                    case 'video':
                        url = '/pages/course/detail/detail?id=' + src;
                        break;
                    case 'audio':
                        url = '/pages/course/detail/detail?id=' + src;
                        break;
                    case 'live':
                        url = '/pages/course/detail/detail?id=' + src;
                        break;
                    case 'activity':
                        url = '/pages/app/activity/detail/detail?id=' + src;
                        break;
                    case 'vipcard':
                        url = '/pages/app/vip/center/center';
                        break;
                    case 'exercises':
                        url = '/pages/app/exam/detail/detail?id=' + src;
                        break;
                    case 'course_group':
                        url = '/pages/course/group/group?id=' + src;
                        break;
                    case 'test':
                        url = '/pages/app/test/detail/detail?id=' + src;
                        break;
                    case 'url':
                        url = '/pages/public/browser/browser?url=' + src;
                        break;
                    case 'url_pages':
                        url = src;
                        break;
                    case 'page_diy':
                        url = '/pages/index/index?id=' + src;
                        break;
                    case 'form':
                        url = '/pages/app/form/submit/submit?id=' + src;
                        break;
                    case 'physical':
                        url = '/pages/app/physical/detail/detail?id=' + src;
                        break;
                    case 'composite':
                        url = '/pages/app/composite/detail/detail?id=' + src;
                        break;
                    case 'package':
                        url = '/pages/app/school/package/detail/detail?id=' + src;
                        break;
                    case 'school_package':
                        url = '/pages/app/school/package/detail/detail?id=' + src;
                        break;
                    case 'circle':
                        url = '/pages/app/circle/presale/presale?id=' + src;
                        break;
                    // 拼团商品（付费插件 group_buy）：值形如 `123_physical` —— 前段商品 id、后段商品大类
                    // （与选择课程弹窗那套混合列表 id 同形）。**落点仍是那件商品的详情页**：拼团区由商详
                    // 自己渲染（`tz-group-buy-area`，无进行中的活动就整段不出），拼团详情页要的是 team_id，
                    // 活动本身没有独立落地页。九个大类→页面的映射只走本 switch 这一处（硬约束 11），
                    // 这里再拆一次而不在调用点另拼路径 —— 十处 `$nav.to(link.src, link.type)` 一个都不用改。
                    case 'group_buy':
                        url = this.groupBuyPath(src);
                        break;
                    // 打卡活动：落地页是活动主页（参与/购买入口在该页吸底栏），与后端 share Links 的 checkin 链路同一目标
                    case 'checkin':
                        url = '/pages/app/checkin/detail/detail?id=' + src;
                        break;
                }
            }
        }
        return url;
    },

    /**
     * 积分商城商品 → 对应商详（带 `score_goods_id` 进兑换模式）
     *
     * 九类落点复用本文件同一份 type→页面映射；课程五型额外带 `type=score`
     * 兼容课程商详既有的兑换模式。不在这里再抄一遍路径。
     * @param {string} goodsType 大类（course/physical/...）
     * @param {string} subType 课程细分（article/video/...）
     * @param {number} goodsId 商品 id
     * @param {number} scoreGoodsId 积分商品行 id
     * @returns {String}
     */
    scorePath(goodsType, subType, goodsId, scoreGoodsId) {
        var type = String(goodsType || 'course');
        var sub = String(subType || '');
        var pageType = type === 'course' && sub !== '' ? sub : type;
        var base = pageType === 'vipcard'
            ? '/pages/app/vip/center/center?card_id=' + (Number(goodsId) || 0)
            : (pageType === 'checkin'
                ? '/pages/app/checkin/intro/intro?id=' + (Number(goodsId) || 0)
                : this.getPagePath(goodsId, pageType));
        if (!base) { return ''; }
        var url = base + (base.indexOf('?') >= 0 ? '&' : '?') + 'score_goods_id=' + (Number(scoreGoodsId) || 0);
        if (type === 'course') {
            url += '&type=score';
        }
        return url;
    },

    /**
     * 拼团商品链接（`<商品 id>_<商品大类>`）→ 那件商品的详情页
     *
     * 拆出大类后**复用本表同一份 type→页面映射**，不在这一档再写一遍路径；
     * 大类不认识（或老数据只存了商品 id）时与后端 `GoodsSpec::handleTypeOf()` 同口径回落课程详情。
     *
     * 分界取**第一个**下划线：商品 id 是数字、不含下划线，而大类里有 `school_package` 这种
     * 自带下划线的档（按最后一个下划线拆会把 id 拆成 `123_school`、大类拆成 `package`，
     * 落点直接指错页面 —— 这条是实跑矩阵抓出来的，别改回 lastIndexOf）。
     * @param {*} src
     * @returns {String}
     */
    groupBuyPath(src) {
        var value = String(src == null ? '' : src);
        var at = value.indexOf('_');
        var goodsId = at < 0 ? value : value.slice(0, at);
        var goodsType = at < 0 ? 'course' : value.slice(at + 1);
        if (!goodsId) {
            return '';
        }
        var url = '';
        if (goodsType !== 'group_buy') {
            url = this.groupBuyGoodsPath(goodsId, goodsType);
        }
        return url || this.getPagePath(goodsId, 'course');
    },

    /**
     * 拼团商品的**落地页**（团详情「立即加入」与 `group_buy` 分享链接共用这一份映射）
     *
     * 与 `getPagePath` 只差 `checkin` 一档：打卡的拼团区挂在**介绍页** `checkin/intro`
     * （那里才是「参与/购买」的商详形态），而通用 `checkin` 链接落的是打卡主页 `checkin/detail`
     * —— 拿通用映射去拼 join 链接，受邀人会被送到一个没有拼团区的页面。
     * 九个大类 → 页面的**唯一一份拼团口径**就长在这里；调用点只给 id 与大类。
     * @param {Number|String} goodsId
     * @param {String} goodsType
     * @return {String} 空串 = 这一档没有可落的商品页
     */
    groupBuyGoodsPath(goodsId, goodsType) {
        var type = String(goodsType || 'course');
        if (type === 'checkin') {
            return goodsId ? '/pages/app/checkin/intro/intro?id=' + goodsId : '';
        }
        return this.getPagePath(goodsId, type);
    },


    /**
     * 跳转
     * @param {*} url 页面路径
     * @param {*} mode 跳转方式
     */
    jump(url, mode) {

        // if (url == "/pages/user/index/index" || url == "/pages/index/index") {
        //     mode = 'switchTab';
        // }

        switch (mode) {
            case 'navigateTo':
                uni.navigateTo({
                    url: url
                })
                break;
            case 'redirectTo':
                uni.redirectTo({
                    url: url
                })
                break;
            case 'reLaunch':
                uni.reLaunch({
                    url: url
                })
                break;
            case 'switchTab':
                uni.switchTab({
                    url: url
                })
                break;
        }
    },

    //检查是否已经登陆
    checkLogin() {
        var userToken = uni.getStorageSync('user_token');
        if (userToken && userToken != '') {
            return true;
        }
        return false;
    },
    //解析小程序码参数
    parseScene(scene) {
        scene = decodeURIComponent(scene);
        scene = decodeURIComponent(scene);
        let ret = {}
        let regParam = /([^&=]+)=([\w\W]*?)(&|$|#)/g
        let strParam = scene;
        let result
        while ((result = regParam.exec(strParam)) != null) {
            ret[result[1]] = result[2]
        }
        return ret;
    },
    /**
     * 解析页面参数
     * @param {*} pageParams 
     * @returns 
     */
    parsePageParams(pageParams) {
        if (pageParams && pageParams.scene) {
            var sceneParams = this.parseScene(pageParams.scene);
            if (sceneParams) {
                pageParams = Object.assign({}, pageParams, sceneParams);
            }
        }

        if (pageParams && pageParams.share) {
            uni.setStorageSync('share', pageParams.share);
        }

        return pageParams;
    },

    /**
     * 分享
     * @param {String} title 卡片标题（空串＝页面的默认分享，可被后续内容页覆盖）
     * @param {String} desc 描述行（只有微信 H5 链接卡片有这一行）
     * @param {String} logo 卡片封面（空串回退站点 logo）
     * @param {*} type  time_line=用户点击右上角转发到朋友圈  app_message=用户点击右上角转发
     * @param {String} landingLink H5 落地链接（可选）：分享**不是落在本页**时才给这一参
     *   （送礼页必须落领取页 —— 本页只有购买人能看，转给好友点开会被「不是你购买的」挡住）。
     *   取值一律吃后端出链（`Links::getLink` 随接口下发），端上不自己拼域名/路由（硬约束 33）。
     */
    share(title = '',desc='',logo='', type = 'app_message', landingLink = '') {

        var shareParams = {};

        let pages = getCurrentPages()    //获取加载的页面
        let currentPage = pages[pages.length - 1]    //获取当前页面的对象

        // 页面栈为空（如 App 启动早期 getConfig 兜底调用）时无法构造分享链接，跳过设置
        if (!currentPage) {
            return shareParams;
        }

        // 页面已设置过带标题的自定义分享（如商品/课程详情）后，默认分享（无标题）不再覆盖：
        // App 启动时 common.init 的兜底分享返回常晚于页面接口，会把商品标题/主图冲成站点名称与站点 logo
        if (!title && currentPage.__shareCustomized) {
            return shareParams;
        }
        if (title) {
            currentPage.__shareCustomized = true;
        }

        var path = '/' + currentPage.route;

        //页面参数
        var pageOptions = currentPage.options;

        //设置邀请ID
        var userInfo = uni.getStorageSync('user_info');



        if (userInfo) {
            userInfo = JSON.parse(userInfo);
        }


        if (userInfo && userInfo.id) {
            pageOptions.share = userInfo.id;
        }

        var pageQuery = '';


        if (pageOptions) {
            Object.keys(pageOptions).forEach(function (key) {
                pageQuery += key + '=' + encodeURIComponent(pageOptions[key]) + '&'
            })
            pageQuery = pageQuery.substring(0, pageQuery.length - 1)
        }

        if (title) {
            shareParams.title = title;
        }else{
            // H5 下页面实例无 $holder（小程序端页面包装属性），直接读取会抛异常导致分享配置中断
            shareParams.title = (currentPage.$holder && currentPage.$holder.navigationBarTitleText) || tools.systemConfig('name');
        }


        if (type == 'app_message') {
            shareParams.path = path + '?' + pageQuery;
        } else {
            shareParams.query = pageQuery;
        }

        // #ifdef H5
        var url = window.location.href;
        var idx = url.indexOf("#/");
        // 分享链接必须为绝对地址；无 #/ 时退化为去掉 hash 的完整地址
        var baseUrl = idx > 0 ? url.substring(0, idx) : url.split('#')[0];


        // 落地链接：调用方给了就用它（后端出的整条链接，已带全参数），缺省按当前页拼
        var link = landingLink || (baseUrl + "#" + shareParams.path);

        wxsdk.share({
            title: (title ? title : tools.systemConfig('name')),
            desc: desc ? desc : '打开查看详情',
            link: link,
            path: link,
            imageUrl: logo ? logo : tools.systemConfig('logo'),
            imgUrl: logo ? logo : tools.systemConfig('logo')
        }, function () {
        })

        return;

        // #endif

        return shareParams;

    }

}