# 获取待评价的商品

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.evaluate.getBeItems` |
| 接口地址 | `POST /api/order/evaluate/getBeItems` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Evaluate（订单评价） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 否 | 订单号 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}order/evaluate/getBeItems' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508209",
  "data": [
    {
      "id": 2160,
      "uniacid": 1,
      "user_id": 38,
      "order_no": "202608222487831090038000",
      "item_id": 3168,
      "item_name": "新圈子",
      "goods_type": "circle",
      "unit_price": "23.00",
      "total_price": "23.00",
      "score_amount": 0,
      "vip_discount_price": "0.00",
      "coupon_discount_fee": "0.00",
      "count": 1,
      "total_price_marking": "0.00",
      "discount_price": "0.00",
      "real_price": "23.00",
      "send_status": "unpaid",
      "after_sale_status": 0,
      "refund_price": null,
      "refund_time": null,
      "refund_msg": null,
      "refund_can_use": 0,
      "refund_status": 0,
      "snapshoot": {
        "id": 3168,
        "name": "新圈子",
        "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
        "price": "23.00",
        "price_marking": "0.00",
        "type": "circle",
        "status": 1,
        "spec_id": 1814,
        "spec_name": "1个月",
        "duration_text": "1月",
        "is_renew": 0
      },
      "evaluate": 0,
      "extend_data": "1814_23.00",
      "createtime": 1786148544,
      "refund_time_text": ""
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
| data[].order_no | string | 订单号 |
| data[].item_id | integer | 条目ID |
| data[].item_name | string | 条目名称 |
| data[].goods_type | string | 商品类型 |
| data[].unit_price | string | unit价格 |
| data[].total_price | string | 合计价格 |
| data[].score_amount | integer | 积分amount |
| data[].vip_discount_price | string | VIPdiscount价格 |
| data[].coupon_discount_fee | string | 优惠券discountfee |
| data[].count | integer | 数量 |
| data[].total_price_marking | string | 合计价格marking |
| data[].discount_price | string | discount价格 |
| data[].real_price | string | 实付价格 |
| data[].send_status | string | send状态 |
| data[].after_sale_status | integer | aftersale状态 |
| data[].refund_price | null | 退款价格 |
| data[].refund_time | null | 退款时间 |
| data[].refund_msg | null | 退款msg |
| data[].refund_can_use | integer | 退款是否可使用 |
| data[].refund_status | integer | 退款状态 |
| data[].snapshoot | object | 快照 |
| data[].snapshoot.id | integer | ID |
| data[].snapshoot.name | string | 名称 |
| data[].snapshoot.cover | string | 封面图 |
| data[].snapshoot.price | string | 价格 |
| data[].snapshoot.price_marking | string | 划线价 |
| data[].snapshoot.type | string | 类型 |
| data[].snapshoot.status | integer | 状态 |
| data[].snapshoot.spec_id | integer | specID |
| data[].snapshoot.spec_name | string | spec名称 |
| data[].snapshoot.duration_text | string | durationtext |
| data[].snapshoot.is_renew | integer | 是否renew |
| data[].evaluate | integer | 评价 |
| data[].extend_data | string | extend数据 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].refund_time_text | string | 退款时间text |
