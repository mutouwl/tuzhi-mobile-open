# 获取订单详情

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.detail` |
| 接口地址 | `POST /api/order/order/getDetail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Order（订单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 否 | 订单号 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}order/order/getDetail' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508202",
  "data": {
    "createtime": 1786148544,
    "goods_count": 1,
    "live_id": 0,
    "coupon_discount_fee": "0.00",
    "real_price": "23.00",
    "evaluate": 0,
    "service": 0,
    "status": "success",
    "order_no": "202608222487831090038000",
    "user_id": 38,
    "pay_type": "balance",
    "score_amount": 0,
    "vip_discount_price": "0.00",
    "order_type": "circle",
    "is_virtual_pay": 0,
    "goodsList": [
      {
        "snapshoot": {
          "id": 3168,
          "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
          "type": "circle",
          "name": "新圈子",
          "price": "23.00"
        },
        "item_id": 3168,
        "createtime": 1786148544,
        "count": 1,
        "id": 2160
      }
    ],
    "goods_total_price": 1,
    "controll": {
      "evaluate": true,
      "cancel": false,
      "pay": false,
      "service": false,
      "surereceive": false,
      "express": false
    },
    "describe": "订单已完成交易"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.createtime | integer | 创建时间（时间戳） |
| data.goods_count | integer | 商品数量 |
| data.live_id | integer | liveID |
| data.coupon_discount_fee | string | 优惠券discountfee |
| data.real_price | string | 实付价格 |
| data.evaluate | integer | 评价 |
| data.service | integer | 服务承诺 |
| data.status | string | 状态 |
| data.order_no | string | 订单号 |
| data.user_id | integer | 用户ID |
| data.pay_type | string | 支付类型 |
| data.score_amount | integer | 积分amount |
| data.vip_discount_price | string | VIPdiscount价格 |
| data.order_type | string | 订单类型 |
| data.is_virtual_pay | integer | 是否虚拟支付 |
| data.goodsList | array | 商品列表 |
| data.goodsList[].snapshoot | object | 快照 |
| data.goodsList[].snapshoot.id | integer | ID |
| data.goodsList[].snapshoot.cover | string | 封面图 |
| data.goodsList[].snapshoot.type | string | 类型 |
| data.goodsList[].snapshoot.name | string | 名称 |
| data.goodsList[].snapshoot.price | string | 价格 |
| data.goodsList[].item_id | integer | 条目ID |
| data.goodsList[].createtime | integer | 创建时间（时间戳） |
| data.goodsList[].count | integer | 数量 |
| data.goodsList[].id | integer | ID |
| data.goods_total_price | integer | 商品合计价格 |
| data.controll | object | 操作控制 |
| data.controll.evaluate | boolean | 评价 |
| data.controll.cancel | boolean | 取消 |
| data.controll.pay | boolean | 支付 |
| data.controll.service | boolean | 服务承诺 |
| data.controll.surereceive | boolean | surereceive |
| data.controll.express | boolean | 物流 |
| data.describe | string | describe |
