# 获取悬浮窗数据

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/pc/navigation/float` |
| 接口地址 | `POST /api/app/pc/navigation/float` |
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
curl -X POST '{apiUrl}app/pc/navigation/float' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509554",
  "data": {
    "status": "1",
    "navigation": [
      {
        "icon": {
          "src": "banben",
          "type": "icon"
        },
        "icon_name": "测试图标",
        "show_icon": "1",
        "show_type": "1",
        "img": "https://tuzhi.mutouweb.com/uploads/1/20251117/4ab65235cea6696a1ceabee1e3125ada.png",
        "discribe": "请输入描述内容请输入描述内容请输入描述内容",
        "link": {
          "type": "course",
          "config": [],
          "selected": "course",
          "name": "圆明园的四十景",
          "src": "111"
        }
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
| data.status | string | 状态 |
| data.navigation | array | navigation |
| data.navigation[].icon | object | icon |
| data.navigation[].icon.src | string | 资源地址 |
| data.navigation[].icon.type | string | 类型 |
| data.navigation[].icon_name | string | icon名称 |
| data.navigation[].show_icon | string | showicon |
| data.navigation[].show_type | string | show类型 |
| data.navigation[].img | string | 图片 |
| data.navigation[].discribe | string | discribe |
| data.navigation[].link | object | link |
| data.navigation[].link.type | string | 类型 |
| data.navigation[].link.config | array | 配置 |
| data.navigation[].link.selected | string | 是否选中 |
| data.navigation[].link.name | string | 名称 |
| data.navigation[].link.src | string | 资源地址 |
