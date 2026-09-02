# 获取下级列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.customer.getCustomerList` |
| 接口地址 | `POST /api/app/agent/customer/getCustomerList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Customer（下级） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| order | string | 否 | 订单 | `desc` |
| name | string | 否 | 名称 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/customer/getCustomerList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"order":"desc","name":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508153",
  "data": [
    {
      "id": 14,
      "uniacid": 1,
      "parent_id": 38,
      "user_id": 606,
      "status": 1,
      "createtime": 1749093954,
      "order": {
        "price_success": 0,
        "price_waiting": 0,
        "order_count": 0,
        "order_success_count": 0,
        "order_waiting_count": 0,
        "order_last_time": ""
      },
      "user": {
        "id": 606,
        "nickname": "微信用户",
        "avatar": "/assets/img/avatar.png"
      }
    },
    {
      "id": 12,
      "uniacid": 1,
      "parent_id": 38,
      "user_id": 424,
      "status": 1,
      "createtime": 1740582185,
      "order": {
        "price_success": 0,
        "price_waiting": 0,
        "order_count": 0,
        "order_success_count": 0,
        "order_waiting_count": 0,
        "order_last_time": ""
      },
      "user": {
        "id": 424,
        "nickname": "加油吧",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250226/a1252422bed247009ba64e77c5a0ff63.jpeg"
      }
    },
    {
      "id": 15,
      "uniacid": 1,
      "parent_id": 38,
      "user_id": 603,
      "status": 1,
      "createtime": null,
      "order": {
        "price_success": 0,
        "price_waiting": 0,
        "order_count": 0,
        "order_success_count": 0,
        "order_waiting_count": 0,
        "order_last_time": ""
      },
      "user": {
        "id": 603,
        "nickname": "微信用户",
        "avatar": "/assets/img/avatar.png"
      }
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
| data[].parent_id | integer | 上级ID |
| data[].user_id | integer | 用户ID |
| data[].status | integer | 状态 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].order | object | 订单 |
| data[].order.price_success | integer | 成交价 |
| data[].order.price_waiting | integer | 待支付价格 |
| data[].order.order_count | integer | 订单数量 |
| data[].order.order_success_count | integer | 成交订单数 |
| data[].order.order_waiting_count | integer | 待支付订单数 |
| data[].order.order_last_time | string | 最后下单时间 |
| data[].user | object | 用户 |
| data[].user.id | integer | ID |
| data[].user.nickname | string | 昵称 |
| data[].user.avatar | string | 头像 |
