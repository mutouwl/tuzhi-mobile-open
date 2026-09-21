# 获取推荐商品

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.recommend.getRecommendGoods` |
| 接口地址 | `POST /api/app/recommend/goods/getRecommendGoods` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（推荐商品） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/recommend/goods/getRecommendGoods' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508180",
  "data": [
    {
      "id": 69,
      "uniacid": 1,
      "goods_id": 69,
      "createtime": 1712887411,
      "name": "[演示]从nlp思维模型看产品经理的思考框架和职业发展",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/3dee2ed5bd20b0a36dce409cafd5816f.jpg",
      "price": "10.00",
      "price_marking": "0.00",
      "pay_type": "free",
      "type": "video",
      "is_vip_goods": true,
      "is_virtual_pay": 0
    },
    {
      "id": 28,
      "uniacid": 1,
      "goods_id": 28,
      "createtime": 1712887428,
      "name": "[演示]考纲词汇及词法第一讲11",
      "cover": "https://tuzhi.mutouweb.com//uploads/1/20231228/a54db2cf7076b038cdb5f571d5f9b35d.png",
      "price": "0.10",
      "price_marking": "0.00",
      "pay_type": "pay",
      "type": "video",
      "is_vip_goods": true,
      "is_virtual_pay": 0
    },
    {
      "id": 214,
      "uniacid": 1,
      "goods_id": 214,
      "createtime": 1761117017,
      "name": "小燕子视频1",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20250707/7bc58d0d4f208bfd4459703820a53c4a.jpg",
      "price": "1099.00",
      "price_marking": "9999.00",
      "pay_type": "pay",
      "type": "video",
      "is_vip_goods": true,
      "is_virtual_pay": 0
    },
    {
      "id": 278,
      "uniacid": 1,
      "goods_id": 278,
      "createtime": 1768353894,
      "name": "马斯克授课专区",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
      "price": "398.00",
      "price_marking": "2980.00",
      "pay_type": "pay",
      "type": "column",
      "is_vip_goods": true,
      "is_virtual_pay": 0
    },
    {
      "id": 287,
      "uniacid": 1,
      "goods_id": 287,
      "createtime": 1769395899,
      "name": "测试11999",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260116/42389cccb28d65ada8690a99c7eb67b5.png",
      "price": "0.00",
      "price_marking": "0.00",
      "pay_type": "student",
      "type": "video",
      "is_vip_goods": true,
      "is_virtual_pay": 0
    },
    {
      "id": 286,
      "uniacid": 1,
      "goods_id": 286,
      "createtime": 1769395899,
      "name": "测试",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260116/42389cccb28d65ada8690a99c7eb67b5.png",
      "price": "0.00",
      "price_marking": "0.00",
      "pay_type": "free",
      "type": "video",
      "is_vip_goods": true,
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
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].goods_id | integer | 商品ID |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].name | string | 名称 |
| data[].cover | string | 封面图 |
| data[].price | string | 价格 |
| data[].price_marking | string | 划线价 |
| data[].pay_type | string | 支付类型 |
| data[].type | string | 类型 |
| data[].is_vip_goods | boolean | 是否会员专属 |
| data[].is_virtual_pay | integer | 是否虚拟支付 |
