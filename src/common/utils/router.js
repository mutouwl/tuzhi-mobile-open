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
                    case 'circle':
                        url = '/pages/app/circle/presale/presale?id=' + src;
                        break;
                }
            }
        }
        return url;
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
     * @param {*} type  time_line=用户点击右上角转发到朋友圈  app_message=用户点击右上角转发
     */
    share(title = '',desc='',logo='', type = 'app_message') {

        var shareParams = {};

        let pages = getCurrentPages()    //获取加载的页面
        let currentPage = pages[pages.length - 1]    //获取当前页面的对象

        // 页面栈为空（如 App 启动早期 getConfig 兜底调用）时无法构造分享链接，跳过设置
        if (!currentPage) {
            return shareParams;
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


        var link = baseUrl + "#" + shareParams.path;

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