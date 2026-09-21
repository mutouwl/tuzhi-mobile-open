# 获取悬浮窗数据

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/pc/navigation/footer` |
| 接口地址 | `POST /api/app/pc/navigation/footer` |
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
curl -X POST '{apiUrl}app/pc/navigation/footer' \
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
    "type": "2",
    "icp": "京ICP备2312323号",
    "copyright": "版权信息",
    "location": "文本输入二",
    "mobile": "文本输入一",
    "navigation": [
      {
        "name": "课程",
        "link": {
          "type": "course",
          "config": [],
          "selected": "course",
          "name": "[演示]一个产品经理的自我修养",
          "src": "72"
        }
      },
      {
        "name": "自定义链接",
        "link": {
          "type": "url",
          "config": [],
          "selected": "url",
          "name": "https://wei.mutouweb.com",
          "src": "https://wei.mutouweb.com"
        }
      }
    ],
    "link": [
      {
        "type": "weibo",
        "name": "微博",
        "link": "1111111111111111111",
        "status": "0"
      },
      {
        "type": "weixin",
        "name": "微信",
        "link": "https://tuzhi.mutouweb.com//uploads/1/20240224/b5aed4c49b5e121854ce908ca65bfb57.png",
        "status": "0"
      },
      {
        "type": "qq",
        "name": "QQ",
        "link": "5555555",
        "status": "0"
      }
    ],
    "name": "凸知学堂"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.type | string | 类型 |
| data.icp | string | icp |
| data.copyright | string | 版权 |
| data.location | string | 位置 |
| data.mobile | string | 手机号 |
| data.navigation | array | navigation |
| data.navigation[].name | string | 名称 |
| data.navigation[].link | object | link |
| data.navigation[].link.type | string | 类型 |
| data.navigation[].link.config | array | 配置 |
| data.navigation[].link.selected | string | 是否选中 |
| data.navigation[].link.name | string | 名称 |
| data.navigation[].link.src | string | 资源地址 |
| data.link | array | link |
| data.link[].type | string | 类型 |
| data.link[].name | string | 名称 |
| data.link[].link | string | link |
| data.link[].status | string | 状态 |
| data.name | string | 名称 |
