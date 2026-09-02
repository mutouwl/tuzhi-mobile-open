# 商品列表

> 全站聚合商品列表（含课程、会员卡、活动、实物商品等类型，由商品聚合模型统一查询并扩展各类型信息）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `goods.list` |
| 接口地址 | `POST /api/goods/goods/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 商品（goods） |
| 所属控制器 | Goods（商品列表 区别于课程列表，这里展示的是处理课程外的所有商品，如会员卡、活动） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `5` |
| page | integer | 否 | 页码 | `1` |
| searchKey | string | 否 | 搜索关键词 | `` |
| sort | string | 否 | 排序 | `time` |
| type | string | 否 | 类型 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}goods/goods/index' \
  -H 'Content-Type: application/json' \
  -d '{"limit":5,"page":1,"searchKey":"","sort":"time","type":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508192",
  "data": [
    {
      "id": 645,
      "name": "开心",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
      "createtime": 1786365122,
      "views": "14",
      "type": "live",
      "status": 1,
      "sales": 0,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "",
      "uniacid": 1,
      "price": "0.00",
      "pay_type": "free",
      "price_marking": "0.00",
      "is_virtual_pay": 0
    },
    {
      "id": 3,
      "name": "平安扣",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
      "createtime": 1786365011,
      "views": "0",
      "type": "physical",
      "status": 1,
      "sales": null,
      "hide": "is_hide",
      "sales_type": "alone",
      "briefing": null,
      "uniacid": 1,
      "price": "300.00",
      "pay_type": "pay",
      "price_marking": "0.00",
      "spec_type": "single",
      "image": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
      "status_text": "",
      "spec_type_text": "单规格",
      "is_virtual_pay": 0
    },
    {
      "id": 644,
      "name": "李龙",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260808/f27490ef8b3c3fc362c77644e7c606aa.jpeg",
      "createtime": 1786214258,
      "views": "0",
      "type": "live",
      "status": 1,
      "sales": 0,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "李龙生日会",
      "uniacid": 1,
      "price": "0.00",
      "pay_type": "free",
      "price_marking": "0.00",
      "is_virtual_pay": 0
    },
    {
      "id": 430,
      "name": "سىناق دەرىسلىك",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/3e8411d84caf66fd56d7a46746f72e2e.jpg",
      "createtime": 1785478504,
      "views": "126",
      "type": "column",
      "status": 1,
      "sales": 2,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "简介",
      "uniacid": 1,
      "price": "100.00",
      "pay_type": "free",
      "price_marking": "50.00",
      "is_virtual_pay": 0
    },
    {
      "id": 420,
      "name": "55666666666333333",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/e16476aadf780e297d93cf3c840d5d0f.jpg",
      "createtime": 1785410608,
      "views": "4",
      "type": "column",
      "status": 1,
      "sales": 0,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "123",
      "uniacid": 1,
      "price": "88.00",
      "pay_type": "pay",
      "price_marking": "0.00",
      "is_virtual_pay": 0
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
| data[].name | string | 名称 |
| data[].cover | string | 封面图 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].views | string | 浏览量 |
| data[].type | string | 类型 |
| data[].status | integer | 状态 |
| data[].sales | integer | 销量 |
| data[].hide | string | 是否隐藏 |
| data[].sales_type | string | 销售方式 |
| data[].briefing | string | 简介 |
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].price | string | 价格 |
| data[].pay_type | string | 支付类型 |
| data[].price_marking | string | 划线价 |
| data[].is_virtual_pay | integer | 是否虚拟支付 |

## 备注

- 返回条目类型由 data[].type 区分，各类型详情接口：实物商品 → app/physical/goods/detail、组合商品 → app/composite/goods/detail、课程 → course/course/detail、会员卡 → app/vip/card/getCardList、活动 → app/activity/activity/detail
- 规格（SKU）不是独立接口：实物商品详情的返回中包含 spec_type / sku_tree / sku_prices 等规格字段
