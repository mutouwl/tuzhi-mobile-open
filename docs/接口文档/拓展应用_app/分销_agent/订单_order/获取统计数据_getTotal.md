# 获取统计数据

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.order.getTotal` |
| 接口地址 | `POST /api/app/agent/order/getTotal` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Order（订单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| type | string | 否 | 类型 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/order/getTotal' \
  -H 'Content-Type: application/json' \
  -d '{"type":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508154",
  "data": {
    "price_waiting": 0,
    "sales_waiting": 0,
    "sales_success": 0,
    "price_success": 0,
    "price_goods": 0,
    "price_invite": 0,
    "order_count": 0,
    "price_total": 0,
    "sales_total": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.price_waiting | integer | 待支付价格 |
| data.sales_waiting | integer | 待支付销量 |
| data.sales_success | integer | 成交销量 |
| data.price_success | integer | 成交价 |
| data.price_goods | integer | 价格商品 |
| data.price_invite | integer | 价格邀请 |
| data.order_count | integer | 订单数量 |
| data.price_total | integer | 价格合计 |
| data.sales_total | integer | 总销量 |
