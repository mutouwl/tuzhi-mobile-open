# 商品详情

> 实物商品详情，包含商品参数（params）、规格（spec_type / sku_tree）与 SKU 价格库存（sku_prices）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `physical.physical.detail` |
| 接口地址 | `POST /api/app/physical/goods/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（商品接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/physical/goods/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508202",
  "data": {
    "id": 1,
    "name": "123123",
    "price": "1.00",
    "stock": 1,
    "cover": "https://tuzhi.mutouweb.com/uploads/1/20260616/3cd1f6398ddc48ab334a442e4898f6d1.png",
    "carousel": [
      "https://test.tuzhi.ltd/uploads/1/20260419/5cb498f4ea4dce590a0f477c56d68393.jpg",
      "https://test.tuzhi.ltd/uploads/1/20260419/376bb76bd31aa33ad01836f2348c1ef8.png"
    ],
    "spec_type": "single",
    "detail": "<p><br></p>",
    "delivery_time": 1,
    "support_return": 0,
    "support_exchange": 0,
    "params": [],
    "single_limit": 0,
    "lifetime_limit": 0,
    "sku_prices": [
      {
        "id": 1,
        "uniacid": 1,
        "goods_sku_ids": null,
        "goods_sku_text": null,
        "goods_id": 1,
        "image": "",
        "stock": 1,
        "stock_warning": null,
        "sn": "SPJHN10OBWGHVHE",
        "weight": "0.00",
        "volume": "0.000",
        "cost_price": "0.00",
        "original_price": "0.00",
        "price": "1.00",
        "status": 1,
        "weigh": 0,
        "createtime": 1776570565,
        "updatetime": 1782809933,
        "status_text": "上架"
      }
    ],
    "is_virtual_pay": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.name | string | 名称 |
| data.price | string | 价格 |
| data.stock | integer | 库存（单规格商品） |
| data.cover | string | 封面图 |
| data.carousel | array | 轮播图列表 |
| data.carousel[] | string | 轮播图 |
| data.spec_type | string | 规格类型：single=单规格，multi=多规格 |
| data.detail | string | 详情 |
| data.delivery_time | integer | 发货时间 |
| data.support_return | integer | 是否支持退货 |
| data.support_exchange | integer | 是否支持换货 |
| data.params | array | 商品参数（JSON 数组，如品牌、材质等） |
| data.single_limit | integer | 单次限购数量 |
| data.lifetime_limit | integer | 终身限购数量 |
| data.sku_prices | array | SKU 价格库存列表（每个 SKU 的价格/库存/编号/规格文本等） |
| data.sku_prices[].id | integer | ID |
| data.sku_prices[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.sku_prices[].goods_sku_ids | null | SKU 组合 ID |
| data.sku_prices[].goods_sku_text | null | SKU 规格文本（如 红色/XL） |
| data.sku_prices[].goods_id | integer | 商品ID |
| data.sku_prices[].image | string | 图片 |
| data.sku_prices[].stock | integer | 库存 |
| data.sku_prices[].stock_warning | null | 库存预警值 |
| data.sku_prices[].sn | string | SKU 编号 |
| data.sku_prices[].weight | string | 重量 |
| data.sku_prices[].volume | string | 体积 |
| data.sku_prices[].cost_price | string | 成本价 |
| data.sku_prices[].original_price | string | 原价 |
| data.sku_prices[].price | string | 价格 |
| data.sku_prices[].status | integer | 状态 |
| data.sku_prices[].weigh | integer | 权重（排序值） |
| data.sku_prices[].createtime | integer | 创建时间（时间戳） |
| data.sku_prices[].updatetime | integer | 更新时间（时间戳） |
| data.sku_prices[].status_text | string | 状态说明 |
| data.is_virtual_pay | integer | 是否虚拟支付 |
