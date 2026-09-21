# 获取票券详情

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.activity.ticket.getDetail` |
| 接口地址 | `POST /api/app/activity/ticket/getTicketDetail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Ticket（线下活动-票券） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| ticket_no | string | 否 | 票券号 | `48057608359132` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/activity/ticket/getTicketDetail' \
  -H 'Content-Type: application/json' \
  -d '{"ticket_no":"48057608359132"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508203",
  "data": {
    "activity_id": 9,
    "status": 1,
    "activity_name": "马到成功大聚会",
    "ticket_name": "全价票",
    "use_time": null,
    "price": "0.01",
    "createtime": 1779011182,
    "ticket_no": "48057608359132",
    "mobile": "456456",
    "name": "23435",
    "other": "[[\"\\u59d3\\u540d\",\"23435\"],[\"\\u624b\\u673a\\u53f7\",\"456456\"],[\"\\u59d3\\u540d\",\"\"],[\"\\u5730\\u533a\",\"\"],[\"\\u4eba\\u6570\",\"\"],[\"\\u8eab\\u9ad8\",\"\"]]"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.activity_id | integer | 活动ID |
| data.status | integer | 状态 |
| data.activity_name | string | 活动名称 |
| data.ticket_name | string | 票券名称 |
| data.use_time | null | 使用时间 |
| data.price | string | 价格 |
| data.createtime | integer | 创建时间（时间戳） |
| data.ticket_no | string | 票券号 |
| data.mobile | string | 手机号 |
| data.name | string | 名称 |
| data.other | string | other |
