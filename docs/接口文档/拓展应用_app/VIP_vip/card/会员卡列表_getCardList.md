# 会员卡列表

> 获取可开通的会员卡列表（会员中心展示，含价格与权益概览）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.vip.detail` |
| 接口地址 | `POST /api/app/vip/card/getCardList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Card（付费会员卡） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/vip/card/getCardList' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508174",
  "data": [
    {
      "id": 1,
      "uniacid": 1,
      "title": "全科会员",
      "price": "0.30",
      "subtitle": "全新会员新会员",
      "detail": "<p>初一到初三全科会员。</p>",
      "sku": [
        {
          "price": "0.3",
          "time": "99999",
          "limit": "0"
        }
      ],
      "privilege_discount": 1,
      "privilege_discount_val": "9",
      "privilege_discount_scope": "all",
      "privilege_free": 0,
      "privilege_free_scope": "all",
      "style": 1,
      "style_color": "",
      "status": 1,
      "is_virtual_pay": 0,
      "privilege_free_goods": [
        {
          "id": 71,
          "name": "[演示]金牌公关李国威：拒绝中年危机，忠于专业是离开平台的底气",
          "cover": "https://tuzhi.mutouweb.com//uploads/1/20240118/7c94074bcc9f0893104a3541cde91567.jpeg",
          "type": "audio",
          "pay_type": "free",
          "price": "0.00",
          "price_marking": "10.00",
          "is_vip_goods": true
        },
        {
          "id": 70,
          "name": "[测试]遇言·不止CEO席越：女性在职场中的自我成长",
          "cover": "https://tuzhi.mutouweb.com//uploads/1/20240118/15d615056bd04820a0157a8088f1a9e3.jpeg",
          "type": "audio",
          "pay_type": "pay",
          "price": "0.00",
          "price_marking": "10.00",
          "is_vip_goods": true
        }
      ],
      "privilege_discount_goods": []
    },
    {
      "id": 7,
      "uniacid": 1,
      "title": "免费权益",
      "price": "1.00",
      "subtitle": "",
      "detail": "<p><br></p>",
      "sku": [
        {
          "price": "1",
          "time": "1",
          "limit": "0"
        }
      ],
      "privilege_discount": 0,
      "privilege_discount_val": "9",
      "privilege_discount_scope": "all",
      "privilege_free": 1,
      "privilege_free_scope": "all",
      "style": 2,
      "style_color": "rgb(55, 81, 179)",
      "status": 1,
      "is_virtual_pay": 0,
      "privilege_free_goods": [],
      "privilege_discount_goods": []
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
| data[].title | string | 标题 |
| data[].price | string | 价格 |
| data[].subtitle | string | 副标题 |
| data[].detail | string | 详情 |
| data[].sku | array | sku |
| data[].sku[].price | string | 价格 |
| data[].sku[].time | string | 时间 |
| data[].sku[].limit | string | 每页数量 |
| data[].privilege_discount | integer | 权益discount |
| data[].privilege_discount_val | string | 权益discountval |
| data[].privilege_discount_scope | string | 权益discountscope |
| data[].privilege_free | integer | 权益free |
| data[].privilege_free_scope | string | 权益freescope |
| data[].style | integer | style |
| data[].style_color | string | style颜色 |
| data[].status | integer | 状态 |
| data[].is_virtual_pay | integer | 是否虚拟支付 |
| data[].privilege_free_goods | array | 权益free商品 |
| data[].privilege_free_goods[].id | integer | ID |
| data[].privilege_free_goods[].name | string | 名称 |
| data[].privilege_free_goods[].cover | string | 封面图 |
| data[].privilege_free_goods[].type | string | 类型 |
| data[].privilege_free_goods[].pay_type | string | 支付类型 |
| data[].privilege_free_goods[].price | string | 价格 |
| data[].privilege_free_goods[].price_marking | string | 划线价 |
| data[].privilege_free_goods[].is_vip_goods | boolean | 是否会员专属 |
| data[].privilege_discount_goods | array | 权益discount商品 |
