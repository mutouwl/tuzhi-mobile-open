


// #ifdef MP-WEIXIN
// let siteinfo = wx.getExtConfigSync? wx.getExtConfigSync(): {}
// #endif

import siteinfo from '../siteinfo.js';

export default {
    "apiUrl": siteinfo.siteroot + '?i='+siteinfo.uniacid+'&c=entry&m=tuzi_v1&do=index&route=api/',
    // "apiUrl": siteinfo.siteroot + 'api/'

    // Mock 总开关（仅 H5 开发环境生效，小程序/App 不受影响）：
    //   true  - 请求优先命中 src/mock/data/ 下对应的本地 JSON，未命中文件的接口自动回退真实后端
    //   false - 全部走真实后端接口
    // 显式设置后优先级高于浏览器控制台的 enableMock 存储值与 MOCK_ENABLE 环境变量；
    // 删除本属性则按「请求级 mock 参数 > 控制台 enableMock > 环境变量」原有逻辑判断。
    "enableMock": false,
};