# 个人中心装修配置

> 读取商家在后台装修的个人中心布局与格子配置，用户端据此渲染；未装修时保持页面里写死的老结构。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `page.userCenter.getConfig` |
| 接口地址 | `POST /api/page/user_center/getConfig` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 自定义页面（page） |
| 所属控制器 | UserCenter（个人中心装修配置） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}page/user_center/getConfig' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344778",
  "data": {
    "config": {
      "version": 1,
      "header": {
        "vip_entry": 1
      },
      "assets": {
        "status": 1,
        "items": [
          "score",
          "money",
          "coupon",
          "prize"
        ]
      },
      "study_center": {
        "status": 1
      },
      "functions": {
        "status": 1,
        "style": "grid",
        "items": [
          {
            "key": "study",
            "status": 1
          },
          {
            "key": "vip",
            "status": 1
          },
          {
            "key": "school",
            "status": 1
          },
          {
            "key": "circle",
            "status": 1
          },
          {
            "key": "checkin",
            "status": 1
          },
          {
            "key": "subscription",
            "status": 1
          },
          {
            "key": "collect",
            "status": 1
          },
          {
            "key": "agent",
            "status": 1
          },
          {
            "key": "exchange",
            "status": 1
          },
          {
            "key": "sign",
            "status": 1
          },
          {
            "key": "score_shop",
            "status": 1
          },
          {
            "key": "practice",
            "status": 1
          },
          {
            "key": "test",
            "status": 1
          },
          {
            "key": "ticket",
            "status": 1
          },
          {
            "key": "form",
            "status": 1
          },
          {
            "key": "cert",
            "status": 1
          },
          {
            "key": "service",
            "status": 1
          },
          {
            "key": "address",
            "status": 1
          },
          {
            "key": "setting",
            "status": 1
          }
        ]
      }
    },
    "options": {
      "assets": [
        {
          "key": "money",
          "name": "余额",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "score",
          "name": "积分",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "coupon",
          "name": "优惠券",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "prize",
          "name": "我的奖品",
          "app_tag": "",
          "installed": true
        }
      ],
      "functions": [
        {
          "key": "study",
          "name": "学习中心",
          "icon": "barrage",
          "path": "/pages/user/study/study",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "vip",
          "name": "会员中心",
          "icon": "huiyuan",
          "path": "/pages/app/vip/center/center",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "school",
          "name": "教务中心",
          "icon": "peixun",
          "size": 21,
          "path": "/pages/app/school/index/index",
          "app_tag": "school",
          "installed": true
        },
        {
          "key": "circle",
          "name": "我的圈子",
          "icon": "group",
          "path": "/pages/app/circle/my/index",
          "app_tag": "circle",
          "installed": true
        },
        {
          "key": "checkin",
          "name": "我的打卡",
          "icon": "task",
          "path": "/pages/app/checkin/index/index",
          "app_tag": "checkin",
          "installed": true
        },
        {
          "key": "subscription",
          "name": "我的订阅",
          "icon": "task",
          "path": "/pages/user/subscription/subscription",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "collect",
          "name": "我的收藏",
          "icon": "like",
          "path": "/pages/user/collect/collect",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "agent",
          "name": "分销中心",
          "icon": "jiagoufenxiao",
          "path": "/pages/app/agent/center/center",
          "not_platform": [
            "dyMiniProgram"
          ],
          "app_tag": "",
          "installed": true
        },
        {
          "key": "exchange",
          "name": "兑换码",
          "icon": "flashlight",
          "path": "/pages/app/exchange/center/center",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "sign",
          "name": "每日签到",
          "icon": "flag",
          "path": "/pages/app/sign/center/center",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "score_shop",
          "name": "积分商城",
          "icon": "service",
          "path": "/pages/app/score/center/center",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "practice",
          "name": "练习",
          "icon": "brush",
          "path": "/pages/app/exam/center/center",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "test",
          "name": "考试",
          "icon": "document",
          "path": "/pages/app/test/log/log",
          "app_tag": "test",
          "installed": true
        },
        {
          "key": "ticket",
          "name": "活动票券",
          "icon": "qrcode",
          "path": "/pages/app/activity/user/user",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "form",
          "name": "表单",
          "icon": "activity",
          "path": "/pages/app/form/log/log",
          "app_tag": "form",
          "installed": true
        },
        {
          "key": "cert",
          "name": "我的证书",
          "icon": "headlines",
          "path": "/pages/app/cert/index/index",
          "app_tag": "cert",
          "installed": true
        },
        {
          "key": "service",
          "name": "联系客服",
          "icon": "customerservice",
          "path": "service",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "address",
          "name": "收货地址",
          "icon": "coordinates",
          "path": "/pages/user/address/list/list",
          "app_tag": "",
          "installed": true
        },
        {
          "key": "setting",
          "name": "设置",
          "icon": "shezhi",
          "path": "/pages/user/setting/setting",
          "app_tag": "",
          "installed": true
        }
      ],
      "styles": [
        {
          "value": "grid",
          "name": "宫格"
        },
        {
          "value": "list",
          "name": "列表"
        }
      ]
    }
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.config | object | 商家装修好的个人中心配置，null=未装修（用户端保持写死的老结构） |
| data.config.version | integer | 配置结构版本号 |
| data.config.header | object | 头部装修配置 |
| data.config.header.vip_entry | integer | 个人中心头部会员入口显示开关 1=显示 0=隐藏 |
| data.config.assets | object | 资产管理那一块 |
| data.config.assets.status | integer | 资产管理整块开关：1=显示 0=隐藏 |
| data.config.assets.items | array | 要显示的资产项 key 列表（余额/积分/优惠券等，取值见 options.assets） |
| data.config.assets.items[] | string | 条目 |
| data.config.study_center | object | 学习中心卡整块显隐开关（只配开关，名称/图标/跳转由用户端自己给） |
| data.config.study_center.status | integer | 学习中心卡整块显隐开关 |
| data.config.functions | object | 功能区配置：整块开关 + 排布 + 功能项数组 |
| data.config.functions.status | integer | 功能区整块开关：1=显示 0=隐藏 |
| data.config.functions.style | string | 功能区排布：grid=宫格 / list=列表 |
| data.config.functions.items | array | 功能项数组（每项 key + status） |
| data.config.functions.items[].key | string | 功能项标识（与 options.functions[].key 对齐） |
| data.config.functions.items[].status | integer | 单个功能项开关：1=显示 0=隐藏 |
| data.options | object | 可配置项候选清单（前端按它渲染，不写死） |
| data.options.assets | array | 可装修的资产项候选 |
| data.options.assets[].key | string | 资产项标识 |
| data.options.assets[].name | string | 名称 |
| data.options.assets[].app_tag | string | 该项所属付费插件标识（空=核心功能） |
| data.options.assets[].installed | boolean | 该项所属付费插件是否已安装（未安装用户端不渲染） |
| data.options.functions | array | 可装修的功能项候选清单（未安装插件的项 installed=false） |
| data.options.functions[].key | string | 功能项标识 |
| data.options.functions[].name | string | 名称 |
| data.options.functions[].icon | string | 图标标识 |
| data.options.functions[].path | string | 点击跳转的页面路径 |
| data.options.functions[].app_tag | string | 该项所属付费插件标识（空=核心功能） |
| data.options.functions[].installed | boolean | 该项所属付费插件是否已安装（未安装用户端不渲染） |
| data.options.styles | array | 功能区排布档候选（value + name） |
| data.options.styles[].value | string | 排布档取值：grid / list |
| data.options.styles[].name | string | 名称 |

## 备注

- config 为 null 表示商家未装修，这是正常状态、不走 error
- options 按当前访问端（Platform::getPlatform）下发可装修的格子清单，前端不写死选项
