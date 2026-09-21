# 获取悬浮窗数据

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/pc/navigation/navigation` |
| 接口地址 | `POST /api/app/pc/navigation/navigation` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Navigation（推荐商品） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/pc/navigation/navigation' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509555",
  "data": {
    "logo": {
      "img": "https://tuzhi.mutouweb.com/uploads/1/20250718/ed7bbb9550732b95d8ab29b13946f9d3.jpeg",
      "link": {
        "type": "",
        "config": []
      }
    },
    "quick_access": {
      "search": {
        "status": "1",
        "text": "搜索"
      },
      "record": {
        "status": "1",
        "text": "学习记录"
      },
      "purchased": {
        "status": "1",
        "text": "我的已购"
      }
    },
    "background": {
      "type": "white",
      "img": "https://tuzhi.mutouweb.com/uploads/1/20250908/9686fa51275d259a90fd6052acf7a42b.jpg",
      "color": "rgb(2, 83, 250)"
    },
    "font": {
      "size": "medium",
      "color": "rgb(150, 48, 48)"
    },
    "navigation": [
      {
        "key": "5s4c3f",
        "name": "首页",
        "link": {
          "type": "unlink",
          "config": [],
          "selected": "unlink",
          "name": "",
          "src": "unlink"
        },
        "type": "parent",
        "children": [
          {
            "key": "iq9xa5",
            "name": "z招生院校",
            "parent_index": "0",
            "type": "children",
            "link": {
              "type": "page_diy_pc",
              "config": [],
              "selected": "page_diy_pc",
              "name": "新建页面",
              "src": "6"
            }
          },
          {
            "key": "ynkx8i",
            "name": "在线报名",
            "parent_index": "0",
            "type": "children",
            "link": {
              "type": "exercises",
              "config": [],
              "selected": "exercises",
              "name": "题库练习11",
              "src": "1"
            }
          },
          {
            "key": "0p8yco",
            "name": "课程列表",
            "parent_index": "0",
            "type": "children",
            "link": {
              "type": "course",
              "config": [],
              "selected": "course",
              "name": "非遗1",
              "src": "201"
            }
          }
        ]
      },
      {
        "key": "ivzjv1",
        "name": "在线报名",
        "link": {
          "type": "url",
          "config": [],
          "selected": "url",
          "name": "https://tuzhi.mutouweb.com?i=1&route=index#/pages/app/form/submit/submit?id=28",
          "src": "https://tuzhi.mutouweb.com?i=1&route=index#/pages/app/form/submit/submit?id=28"
        },
        "type": "parent",
        "children": []
      },
      {
        "key": "1pyi1e",
        "name": "123",
        "link": {
          "type": "exercises",
          "config": [],
          "selected": "exercises",
          "name": "历年真题",
          "src": "1"
        },
        "type": "parent",
        "children": []
      },
      {
        "key": "jr28ts",
        "name": "12",
        "link": {
          "type": "exercises",
          "config": [],
          "selected": "exercises",
          "name": "随堂测试练习题，职业测试",
          "src": "6"
        },
        "type": "parent",
        "children": []
      }
    ]
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.logo | object | Logo |
| data.logo.img | string | 图片 |
| data.logo.link | object | link |
| data.logo.link.type | string | 类型 |
| data.logo.link.config | array | 配置 |
| data.quick_access | object | quickaccess |
| data.quick_access.search | object | search |
| data.quick_access.search.status | string | 状态 |
| data.quick_access.search.text | string | 文本 |
| data.quick_access.record | object | record |
| data.quick_access.record.status | string | 状态 |
| data.quick_access.record.text | string | 文本 |
| data.quick_access.purchased | object | purchased |
| data.quick_access.purchased.status | string | 状态 |
| data.quick_access.purchased.text | string | 文本 |
| data.background | object | background |
| data.background.type | string | 类型 |
| data.background.img | string | 图片 |
| data.background.color | string | 颜色 |
| data.font | object | 字体 |
| data.font.size | string | 数量 |
| data.font.color | string | 颜色 |
| data.navigation | array | navigation |
| data.navigation[].key | string | 密钥 |
| data.navigation[].name | string | 名称 |
| data.navigation[].link | object | link |
| data.navigation[].link.type | string | 类型 |
| data.navigation[].link.config | array | 配置 |
| data.navigation[].link.selected | string | 是否选中 |
| data.navigation[].link.name | string | 名称 |
| data.navigation[].link.src | string | 资源地址 |
| data.navigation[].type | string | 类型 |
| data.navigation[].children | array | 下级 |
| data.navigation[].children[].key | string | 密钥 |
| data.navigation[].children[].name | string | 名称 |
| data.navigation[].children[].parent_index | string | 上级列表 |
| data.navigation[].children[].type | string | 类型 |
| data.navigation[].children[].link | object | link |
| data.navigation[].children[].link.type | string | 类型 |
| data.navigation[].children[].link.config | array | 配置 |
| data.navigation[].children[].link.selected | string | 是否选中 |
| data.navigation[].children[].link.name | string | 名称 |
| data.navigation[].children[].link.src | string | 资源地址 |
