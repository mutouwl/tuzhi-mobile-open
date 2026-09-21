# 初始化

> 获取 App/小程序/H5 初始化配置，包括系统名称、各端登录/注册开关、支付开关、插件安装状态、接口地址前缀等。页面进入时通常首先调用，返回的 apiUrl 用于拼接后续接口请求地址。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `common.init` |
| 接口地址 | `POST /api/common/init` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 公共（common） |
| 所属控制器 | Common（公共接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| version | string | 否 | 版本号（用于版本检测） | - |
| lng | string | 否 | 经度 | - |
| lat | string | 否 | 纬度 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}common/init' \
  -H 'Content-Type: application/json' \
  -d '{"version":"xxx","lng":"xxx","lat":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "",
  "time": "1786508142",
  "data": {
    "name": "凸知学堂",
    "logo": "https://tuzhi.mutouweb.com/uploads/1/20260531/395826a3e28838ecd43b3bdf54fe6746.png",
    "copyright": "凸知自建卖课平台",
    "copyright_link": "",
    "status": "open",
    "register": "open",
    "bind_mobile_modal": "close",
    "userinfo_edit_modal": "close",
    "mobile_login": "open",
    "mobile_pc_route": "close",
    "wx_login": "open",
    "app_id": "wx0000000000000000",
    "wx_mp_login": "open",
    "wx_mp_ban_pay": "close",
    "wx_mp_app_id": "wx0000000000000000",
    "wx_mp_ban_screen_record": "close",
    "wx_mp_ban_pc_use": "close",
    "dy_mp_login": "open",
    "dy_mp_appid": "tt0000000000000000",
    "dy_mp_ban_pay": "open",
    "apiUrl": "https://tuzhi.mutouweb.com/index.php?i=1&route=api/",
    "app_isinstall_test": true,
    "app_isinstall_channels": true,
    "app_isinstall_cert": true,
    "app_isinstall_form": true,
    "app_isinstall_composite": true,
    "app_isinstall_circle": true,
    "app_isinstall_live_gift": true,
    "app_isinstall_live_redpacket": true,
    "marquee": {
      "bullet_status": "1",
      "bullet_color": "rgb(214, 24, 24)",
      "bullet_font_size": "12",
      "bullet_opacity": "0.6",
      "copyright_status": "1",
      "copyright_text": "【版权声明测试】本课程版权归提供者所有，仅限个人学习，严禁任何形式的录制、传播和账号分享。一经发现，平台将依法保留追究权，情节严重者将承担法律责任"
    },
    "app_complaint": "1"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.name | string | 系统名称 |
| data.logo | string | 系统 Logo 地址 |
| data.copyright | string | 版权信息 |
| data.copyright_link | string | 版权链接 |
| data.status | string | 站点状态：open=开启 |
| data.register | string | 注册开关：open=开启 |
| data.bind_mobile_modal | string | 绑定手机号弹窗开关 |
| data.userinfo_edit_modal | string | 编辑资料弹窗开关 |
| data.mobile_login | string | 手机号登录开关：open=开启 |
| data.mobile_pc_route | string | 手机号PC端路由开关 |
| data.wx_login | string | 微信公众号登录开关：open=开启 |
| data.app_id | string | AppID |
| data.wx_mp_login | string | 微信小程序登录开关 |
| data.wx_mp_ban_pay | string | 微信小程序是否禁止支付 |
| data.wx_mp_app_id | string | 微信小程序AppID |
| data.wx_mp_ban_screen_record | string | 微信小程序禁止录屏开关 |
| data.wx_mp_ban_pc_use | string | 微信小程序禁止PC端使用开关 |
| data.dy_mp_login | string | 抖音小程序登录开关 |
| data.dy_mp_appid | string | 抖音小程序AppID |
| data.dy_mp_ban_pay | string | 抖音小程序禁止支付 |
| data.apiUrl | string | 接口地址前缀（实际请求地址 = apiUrl + 路由） |
| data.app_isinstall_test | boolean | 考试插件是否安装 |
| data.app_isinstall_channels | boolean | 视频号小店插件是否安装 |
| data.app_isinstall_cert | boolean | 证书插件是否安装 |
| data.app_isinstall_form | boolean | 表单插件是否安装 |
| data.app_isinstall_composite | boolean | 组合商品插件是否安装 |
| data.app_isinstall_circle | boolean | 圈子插件是否安装 |
| data.app_isinstall_live_gift | boolean | 直播礼物插件是否安装 |
| data.app_isinstall_live_redpacket | boolean | 直播红包插件是否安装 |
| data.marquee | object | 跑马灯公告配置 |
| data.marquee.bullet_status | string | 弹幕状态 |
| data.marquee.bullet_color | string | 弹幕颜色 |
| data.marquee.bullet_font_size | string | 弹幕字体大小 |
| data.marquee.bullet_opacity | string | 弹幕不透明度 |
| data.marquee.copyright_status | string | 版权状态 |
| data.marquee.copyright_text | string | 版权声明文本 |
| data.app_complaint | string | App投诉 |

## 备注

- 所有页面进入前通常都会调用该接口，返回的 apiUrl 用于拼接接口请求地址
- 返回值中可能包含业务开关（如 bind_mobile_modal、userinfo_edit_modal、mobile_pc_route 等），取值 open/close
