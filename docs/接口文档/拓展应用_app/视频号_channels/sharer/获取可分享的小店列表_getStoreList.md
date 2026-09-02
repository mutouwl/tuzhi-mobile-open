# 获取可分享的小店列表

> 判断是否已经绑定

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.channels.sharer.store` |
| 接口地址 | `POST /api/app/channels/sharer/getStoreList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Sharer（分享员） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/channels/sharer/getStoreList' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508158",
  "data": [
    {
      "id": 16,
      "nickname": "凸知",
      "is_bind": false
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].nickname | string | 昵称 |
| data[].is_bind | boolean | 是否绑定 |
