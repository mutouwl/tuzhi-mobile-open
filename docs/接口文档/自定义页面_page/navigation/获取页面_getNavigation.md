# 获取页面

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `page.navigation.getNavigation` |
| 接口地址 | `POST /api/page/navigation/getNavigation` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 自定义页面（page） |
| 所属控制器 | Navigation（自定义导航） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}page/navigation/getNavigation' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508150",
  "data": {
    "id": 1,
    "uniacid": 1,
    "name": "默认导航",
    "config": {
      "name": "默认导航",
      "color": {
        "default": "rgb(199, 203, 205)",
        "selected": "rgb(9, 104, 246)"
      },
      "take_page": [],
      "platform": [
        "wx"
      ],
      "navigation": [
        {
          "name": "首页",
          "link": {
            "type": "page_system",
            "src": "/pages/index/index?id=",
            "name": "首页",
            "selected": "page_system"
          },
          "icon": {
            "default": {
              "src": "homepage",
              "type": "icon"
            },
            "selected": {
              "src": "homepage",
              "type": "icon"
            }
          }
        },
        {
          "name": "课程分类",
          "link": {
            "type": "page_system",
            "config": [],
            "selected": "page_system",
            "name": "课程分类",
            "src": "/pages/course/category/category"
          },
          "icon": {
            "default": {
              "src": "supply",
              "type": "icon"
            },
            "selected": {
              "src": "supply",
              "type": "icon"
            }
          }
        },
        {
          "name": "圈子",
          "link": {
            "type": "circle",
            "config": [],
            "selected": "circle",
            "name": "新圈子",
            "src": 3168
          },
          "icon": {
            "default": {
              "type": "icon",
              "src": "wanchengrenwu"
            },
            "selected": {
              "type": "icon",
              "src": "wanchengrenwu"
            }
          }
        },
        {
          "name": "实物商品",
          "link": {
            "type": "page_system",
            "config": [],
            "selected": "page_system",
            "name": "实物商品列表",
            "src": "/pages/app/physical/list/list"
          },
          "icon": {
            "default": {
              "type": "icon",
              "src": "commodity"
            },
            "selected": {
              "type": "icon",
              "src": "commodity"
            }
          }
        },
        {
          "name": "我的",
          "link": {
            "type": "page_system",
            "config": [],
            "selected": "page_system",
            "name": "用户中心",
            "src": "/pages/user/index/index"
          },
          "icon": {
            "default": {
              "src": "people",
              "type": "icon"
            },
            "selected": {
              "src": "people",
              "type": "icon"
            }
          }
        }
      ],
      "status": 0
    },
    "status": 0,
    "platform": "|wx|",
    "default_navigation": 1,
    "take_page": "",
    "createtime": 1676805928,
    "updatetime": 1786097863
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.name | string | 名称 |
| data.config | object | 配置 |
| data.config.name | string | 名称 |
| data.config.color | object | 颜色 |
| data.config.color.default | string | 默认 |
| data.config.color.selected | string | 是否选中 |
| data.config.take_page | array | take页码 |
| data.config.platform | array | 平台 |
| data.config.platform[] | string | 平台 |
| data.config.navigation | array | navigation |
| data.config.navigation[].name | string | 名称 |
| data.config.navigation[].link | object | link |
| data.config.navigation[].link.type | string | 类型 |
| data.config.navigation[].link.src | string | 资源地址 |
| data.config.navigation[].link.name | string | 名称 |
| data.config.navigation[].link.selected | string | 是否选中 |
| data.config.navigation[].icon | object | icon |
| data.config.navigation[].icon.default | object | 默认 |
| data.config.navigation[].icon.selected | object | 是否选中 |
| data.config.status | integer | 状态 |
| data.status | integer | 状态 |
| data.platform | string | 平台 |
| data.default_navigation | integer | 默认navigation |
| data.take_page | string | take页码 |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
