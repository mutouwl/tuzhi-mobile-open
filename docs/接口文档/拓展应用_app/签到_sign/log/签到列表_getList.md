# 签到列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.sign.log` |
| 接口地址 | `POST /api/app/sign/log/getList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Log（签到） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/sign/log/getList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508174",
  "data": [
    {
      "id": 173,
      "uniacid": 1,
      "user_id": 38,
      "date": "2026-08-12",
      "score": 100
    },
    {
      "id": 171,
      "uniacid": 1,
      "user_id": 38,
      "date": "2026-07-10",
      "score": 100
    },
    {
      "id": 170,
      "uniacid": 1,
      "user_id": 38,
      "date": "2026-07-07",
      "score": 100
    },
    {
      "id": 169,
      "uniacid": 1,
      "user_id": 38,
      "date": "2026-06-27",
      "score": 100
    },
    {
      "id": 168,
      "uniacid": 1,
      "user_id": 38,
      "date": "2026-06-10",
      "score": 100
    },
    {
      "id": 167,
      "uniacid": 1,
      "user_id": 38,
      "date": "2026-05-06",
      "score": 100
    },
    {
      "id": 160,
      "uniacid": 1,
      "user_id": 38,
      "date": "2025-11-11",
      "score": 100
    },
    {
      "id": 159,
      "uniacid": 1,
      "user_id": 38,
      "date": "2025-11-04",
      "score": 100
    },
    {
      "id": 157,
      "uniacid": 1,
      "user_id": 38,
      "date": "2025-10-23",
      "score": 100
    },
    {
      "id": 148,
      "uniacid": 1,
      "user_id": 38,
      "date": "2025-08-04",
      "score": 100
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
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].user_id | integer | 用户ID |
| data[].date | string | 日期 |
| data[].score | integer | 积分 |
