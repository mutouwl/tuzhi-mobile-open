# 商品列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.score.list` |
| 接口地址 | `POST /api/app/score/goods/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（积分商城） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| group | string | 否 | 分组 | `` |
| search | string | 否 | search | - |
| sort | string | 否 | 排序 | `desc` |
| order | string | 否 | 订单 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/score/goods/index' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"group":"","search":"xxx","sort":"desc","order":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508172",
  "data": [
    {
      "id": 28,
      "uniacid": 1,
      "goods_id": 222,
      "status": 1,
      "stock": 1,
      "sales": 0,
      "score": 1,
      "createtime": 1767683787,
      "updatetime": 1767683809,
      "course": {
        "id": 222,
        "name": "小燕子音频",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250718/8483ce2182efaf5518129a0e71de2ece.png",
        "type": "audio",
        "pay_type": "pay",
        "price": "1.00",
        "price_marking": "0.00"
      }
    },
    {
      "id": 13,
      "uniacid": 1,
      "goods_id": 28,
      "status": 1,
      "stock": 10,
      "sales": 0,
      "score": 102,
      "createtime": 1705553495,
      "updatetime": 1768293618,
      "course": {
        "id": 28,
        "name": "[演示]考纲词汇及词法第一讲11",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20231228/a54db2cf7076b038cdb5f571d5f9b35d.png",
        "type": "video",
        "pay_type": "pay",
        "price": "0.10",
        "price_marking": "0.00"
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
| data[].goods_id | integer | 商品ID |
| data[].status | integer | 状态 |
| data[].stock | integer | 库存 |
| data[].sales | integer | 销量 |
| data[].score | integer | 积分 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].updatetime | integer | 更新时间（时间戳） |
| data[].course | object | 课程 |
| data[].course.id | integer | ID |
| data[].course.name | string | 名称 |
| data[].course.cover | string | 封面图 |
| data[].course.type | string | 类型 |
| data[].course.pay_type | string | 支付类型 |
| data[].course.price | string | 价格 |
| data[].course.price_marking | string | 划线价 |
