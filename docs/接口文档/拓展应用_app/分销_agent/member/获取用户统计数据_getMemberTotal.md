# 获取用户统计数据

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.member.getMemberTotal` |
| 接口地址 | `POST /api/app/agent/member/getMemberTotal` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Member（成员） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/member/getMemberTotal' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508152",
  "data": {
    "order": {
      "total": {
        "price_waiting": 0,
        "sales_waiting": 0,
        "sales_success": 0,
        "price_success": 0,
        "price_goods": 0,
        "price_invite": 0,
        "order_count": 0,
        "price_total": 0,
        "sales_total": 0
      },
      "today": {
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
    },
    "customer": {
      "total": {
        "count": 3,
        "normal": 3,
        "hidden": 0
      },
      "today": {
        "count": 0,
        "normal": 0,
        "hidden": 0
      }
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
| data.order | object | 订单 |
| data.order.total | object | 合计 |
| data.order.total.price_waiting | integer | 待支付价格 |
| data.order.total.sales_waiting | integer | 待支付销量 |
| data.order.total.sales_success | integer | 成交销量 |
| data.order.total.price_success | integer | 成交价 |
| data.order.total.price_goods | integer | 价格商品 |
| data.order.total.price_invite | integer | 价格邀请 |
| data.order.total.order_count | integer | 订单数量 |
| data.order.total.price_total | integer | 价格合计 |
| data.order.total.sales_total | integer | 总销量 |
| data.order.today | object | today |
| data.order.today.price_waiting | integer | 待支付价格 |
| data.order.today.sales_waiting | integer | 待支付销量 |
| data.order.today.sales_success | integer | 成交销量 |
| data.order.today.price_success | integer | 成交价 |
| data.order.today.price_goods | integer | 价格商品 |
| data.order.today.price_invite | integer | 价格邀请 |
| data.order.today.order_count | integer | 订单数量 |
| data.order.today.price_total | integer | 价格合计 |
| data.order.today.sales_total | integer | 总销量 |
| data.customer | object | 客户 |
| data.customer.total | object | 合计 |
| data.customer.total.count | integer | 数量 |
| data.customer.total.normal | integer | 普通 |
| data.customer.total.hidden | integer | 是否隐藏 |
| data.customer.today | object | today |
| data.customer.today.count | integer | 数量 |
| data.customer.today.normal | integer | 普通 |
| data.customer.today.hidden | integer | 是否隐藏 |
