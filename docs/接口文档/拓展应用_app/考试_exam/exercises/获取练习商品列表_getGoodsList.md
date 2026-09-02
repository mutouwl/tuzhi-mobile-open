# 获取练习商品列表

> 获取练习商品列表 注：group_id 支持传入任意层级（1~4级）分类 ID，     会自动递归收集该分类及其所有子孙分类下的练习

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exam.exercises.getGoodsList` |
| 接口地址 | `POST /api/app/exam/exercises/getGoodsList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Exercises（练习） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| search | string | 否 | search | - |
| group_id | string | 否 | 分组ID | - |
| sort | string | 否 | 排序 | `desc` |
| order | string | 否 | 订单 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/exam/exercises/getGoodsList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"search":"xxx","group_id":"xxx","sort":"desc","order":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508165",
  "data": [
    {
      "id": 14,
      "name": "六道题-全部题型",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260716/b08b0d48c2998ad62715990db2f808aa.jpg",
      "sales_type": 1,
      "pay_price": "0.00",
      "type": "exercises",
      "pay_type": "free"
    },
    {
      "id": 8,
      "name": "章节练习",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20250725/b3d9569b0b7d911e8fca6a6b4ec26698.jpg",
      "sales_type": 3,
      "pay_price": "0.00",
      "type": "exercises",
      "pay_type": "bind_course"
    },
    {
      "id": 1,
      "name": "历年真题",
      "cover": "https://tuzhi.mutouweb.com//uploads/1/20240319/60f5857446a27108d2eb8f15a505ee49.png",
      "sales_type": 3,
      "pay_price": "3.10",
      "type": "exercises",
      "pay_type": "bind_course"
    },
    {
      "id": 6,
      "name": "随堂测试练习题，职业测试",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20250525/8098118e446e58030af45b99893853b6.jpeg",
      "sales_type": 1,
      "pay_price": "0.00",
      "type": "exercises",
      "pay_type": "free"
    },
    {
      "id": 5,
      "name": "未绑定分组的题目",
      "cover": "https://tuzhi.mutouweb.com//uploads/1/20231228/cab004734f2b40cfeda64e9e88e5f448.png",
      "sales_type": 2,
      "pay_price": "20.00",
      "type": "exercises",
      "price": "20.00",
      "pay_type": "pay"
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
| data[].sales_type | integer | 销售方式 |
| data[].pay_price | string | 支付价格 |
| data[].type | string | 类型 |
| data[].pay_type | string | 支付类型 |
