# 创建订单

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.create` |
| 接口地址 | `POST /api/order/order/createOrder` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Order（订单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_type | string | 否 | 订单类型 | `goods` |
| coupon_id | string | 否 | 优惠券ID | `` |
| buyer_remark | string | 否 | buyerremark | `` |
| live_id | string | 否 | liveID | `` |
| live_goods_action_id | string | 否 | live商品操作ID | `` |
| address_id | string | 否 | 地址ID | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}order/order/createOrder' \
  -H 'Content-Type: application/json' \
  -d '{"order_type":"goods","coupon_id":"","buyer_remark":"","live_id":"","live_goods_action_id":"","address_id":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
