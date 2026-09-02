# 商品列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `physical.physical.index` |
| 接口地址 | `POST /api/app/physical/goods/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（商品接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| category_id | string | 否 | 分类ID | - |
| limit | string | 否 | 每页数量 | - |
| sort | string | 否 | 排序 | - |
| order | string | 否 | 订单 | - |
| keyword | string | 否 | 关键词 | - |
| page | string | 否 | 页码 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/physical/goods/index' \
  -H 'Content-Type: application/json' \
  -d '{"category_id":"xxx","limit":"xxx","sort":"xxx","order":"xxx","keyword":"xxx","page":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508171",
  "data": {
    "total": 3,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "name": "123123",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260616/3cd1f6398ddc48ab334a442e4898f6d1.png",
        "price": 1,
        "stock": 1,
        "virtual_sales": 0,
        "weigh": 0,
        "createtime": 1776570565,
        "spec_type": "single",
        "is_virtual_pay": 0,
        "status_text": "",
        "spec_type_text": "单规格"
      },
      {
        "id": 2,
        "name": "人工智能学习实体资料",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
        "price": 99,
        "stock": 93,
        "virtual_sales": 0,
        "weigh": 0,
        "createtime": 1777794934,
        "spec_type": "multi",
        "is_virtual_pay": 0,
        "status_text": "",
        "spec_type_text": "多规格"
      },
      {
        "id": 3,
        "name": "平安扣",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
        "price": 300,
        "stock": 99999,
        "virtual_sales": 0,
        "weigh": 0,
        "createtime": 1786365011,
        "spec_type": "single",
        "is_virtual_pay": 0,
        "status_text": "",
        "spec_type_text": "单规格"
      }
    ]
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.total | integer | 合计 |
| data.per_page | integer | per页码 |
| data.current_page | integer | 当前页码 |
| data.last_page | integer | last页码 |
| data.data | array | 数据 |
| data.data[].id | integer | ID |
| data.data[].name | string | 名称 |
| data.data[].cover | string | 封面图 |
| data.data[].price | integer | 价格 |
| data.data[].stock | integer | 库存 |
| data.data[].virtual_sales | integer | virtual销量 |
| data.data[].weigh | integer | 权重（排序值） |
| data.data[].createtime | integer | 创建时间（时间戳） |
| data.data[].spec_type | string | 规格类型 |
| data.data[].is_virtual_pay | integer | 是否虚拟支付 |
| data.data[].status_text | string | 状态说明 |
| data.data[].spec_type_text | string | spec类型text |
