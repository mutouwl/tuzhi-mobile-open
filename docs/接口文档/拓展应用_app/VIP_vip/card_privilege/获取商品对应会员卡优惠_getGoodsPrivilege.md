# 获取商品对应会员卡优惠

> 获取商品对应会员卡优惠 优先级：  1. 用户当前已开通会员卡  2. 指定课程作用域下绑定该商品的会员卡  3. 全部课程作用域且课程类型受作用 (article/video/audio/live/column) 的会员卡

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.vip.goods_privilege` |
| 接口地址 | `POST /api/app/vip/card_privilege/getGoodsPrivilege` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | CardPrivilege（付费会员卡） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/vip/card_privilege/getGoodsPrivilege' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508181",
  "data": {
    "goodsVipInfo": false,
    "isNowGoodsVip": false
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.goodsVipInfo | boolean | 商品VIP信息 |
| data.isNowGoodsVip | boolean | 是否Now商品VIP |
