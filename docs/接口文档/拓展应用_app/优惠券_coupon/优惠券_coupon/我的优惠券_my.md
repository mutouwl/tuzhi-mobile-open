# 我的优惠券

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.coupon.my` |
| 接口地址 | `POST /api/app/coupon/coupon/my` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| type | string | 否 | 类型 | `can_use` |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/coupon/coupon/my' \
  -H 'Content-Type: application/json' \
  -d '{"type":"can_use","limit":10,"page":1}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508164",
  "data": [
    {
      "id": 322,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1785035369,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 319,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777865977,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 318,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777865968,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 314,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777865949,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 312,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777817846,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 311,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777817844,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 310,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777807186,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 309,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777807185,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 308,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777806986,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
    },
    {
      "id": 307,
      "uniacid": 1,
      "user_id": 38,
      "get_type": 1,
      "coupon_id": 14,
      "use_order_id": 0,
      "use_time": null,
      "status": "can_use",
      "createtime": 1777799258,
      "updatetime": null,
      "coupon": {
        "id": 14,
        "uniacid": 1,
        "name": "12313",
        "type": "reduce",
        "use_scope": "all_use",
        "goods": null,
        "amount": "10.00",
        "discount": "0.00",
        "max_amount": "0.00",
        "max_amount_status": 1,
        "enough": "11.00",
        "enough_status": 1,
        "stock": 99958,
        "limit_num": 0,
        "limit_status": 1,
        "use_time_type": "range",
        "use_start_time": "2020-06-24 00:00",
        "use_end_time": "2029-07-31 00:00",
        "start_days": 0,
        "days": 0,
        "description": "",
        "recommend_goods_status": 1,
        "stock_status": 1,
        "share_status": 1,
        "public_status": 1,
        "double_discount_status": 1,
        "status": 1,
        "createtime": 1746629658,
        "updatetime": 1746629658,
        "deletetime": null,
        "type_text": "满减券",
        "use_num": 8,
        "get_num": 43,
        "status_text": "进行中",
        "use_scope_text": "全场通用",
        "amount_text": "满11.00元,减10元",
        "use_time_status": "ing",
        "use_time_text": "发放中",
        "stock_all": 100001,
        "stock_prop": 99,
        "received": true,
        "goods_bind_ids": []
      },
      "name": "12313",
      "type": "reduce",
      "status_text": "立即使用",
      "get_type_text": "用户领取"
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
| data[].get_type | integer | 获取类型 |
| data[].coupon_id | integer | 优惠券ID |
| data[].use_order_id | integer | 使用订单ID |
| data[].use_time | null | 使用时间 |
| data[].status | string | 状态 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].updatetime | null | 更新时间（时间戳） |
| data[].coupon | object | 优惠券 |
| data[].coupon.id | integer | ID |
| data[].coupon.uniacid | integer | 应用ID（公众号/uniacid） |
| data[].coupon.name | string | 名称 |
| data[].coupon.type | string | 类型 |
| data[].coupon.use_scope | string | 使用scope |
| data[].coupon.goods | null | 商品 |
| data[].coupon.amount | string | 金额 |
| data[].coupon.discount | string | discount |
| data[].coupon.max_amount | string | maxamount |
| data[].coupon.max_amount_status | integer | maxamount状态 |
| data[].coupon.enough | string | enough |
| data[].coupon.enough_status | integer | enough状态 |
| data[].coupon.stock | integer | 库存 |
| data[].coupon.limit_num | integer | limit数量 |
| data[].coupon.limit_status | integer | limit状态 |
| data[].coupon.use_time_type | string | 使用时间类型 |
| data[].coupon.use_start_time | string | 使用start时间 |
| data[].coupon.use_end_time | string | 使用end时间 |
| data[].coupon.start_days | integer | start天数 |
| data[].coupon.days | integer | 天数 |
| data[].coupon.description | string | 描述 |
| data[].coupon.recommend_goods_status | integer | 推荐商品状态 |
| data[].coupon.stock_status | integer | 库存状态 |
| data[].coupon.share_status | integer | 分享状态 |
| data[].coupon.public_status | integer | public状态 |
| data[].coupon.double_discount_status | integer | doublediscount状态 |
| data[].coupon.status | integer | 状态 |
| data[].coupon.createtime | integer | 创建时间（时间戳） |
| data[].coupon.updatetime | integer | 更新时间（时间戳） |
| data[].coupon.deletetime | null | deletetime |
| data[].coupon.type_text | string | 类型说明 |
| data[].coupon.use_num | integer | 使用数量 |
| data[].coupon.get_num | integer | 获取数量 |
| data[].coupon.status_text | string | 状态说明 |
| data[].coupon.use_scope_text | string | 使用scopetext |
| data[].coupon.amount_text | string | amounttext |
| data[].coupon.use_time_status | string | 使用时间状态 |
| data[].coupon.use_time_text | string | 使用时间text |
| data[].coupon.stock_all | integer | 库存全部 |
| data[].coupon.stock_prop | integer | 库存prop |
| data[].coupon.received | boolean | received |
| data[].coupon.goods_bind_ids | array | 商品绑定ID集合 |
| data[].name | string | 名称 |
| data[].type | string | 类型 |
| data[].status_text | string | 状态说明 |
| data[].get_type_text | string | 获取类型text |
