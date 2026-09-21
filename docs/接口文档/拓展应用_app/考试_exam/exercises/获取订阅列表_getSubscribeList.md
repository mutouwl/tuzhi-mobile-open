# 获取订阅列表

> 获取练习包含题目数量

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exam.exercises.getSubscribeList` |
| 接口地址 | `POST /api/app/exam/exercises/getSubscribeList` |
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
| sort | string | 否 | 排序 | `desc` |
| order | string | 否 | 订单 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/exam/exercises/getSubscribeList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"search":"xxx","sort":"desc","order":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508164",
  "data": [
    {
      "id": 124,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 14,
      "type": "free",
      "createtime": 1784175121,
      "question_count": 6,
      "complete_question_count": 6,
      "complete_prop": 100,
      "exercises": {
        "id": 14,
        "name": "六道题-全部题型",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260716/b08b0d48c2998ad62715990db2f808aa.jpg",
        "sales_type": 1,
        "pay_price": "0.00"
      }
    },
    {
      "id": 116,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 8,
      "type": "pay",
      "createtime": 1781776201,
      "question_count": 264,
      "complete_question_count": 275,
      "complete_prop": 100,
      "exercises": {
        "id": 8,
        "name": "章节练习",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250725/b3d9569b0b7d911e8fca6a6b4ec26698.jpg",
        "sales_type": 3,
        "pay_price": "0.00"
      }
    },
    {
      "id": 117,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 6,
      "type": "pay",
      "createtime": 1781776201,
      "question_count": 231,
      "complete_question_count": 251,
      "complete_prop": 100,
      "exercises": {
        "id": 6,
        "name": "随堂测试练习题，职业测试",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250525/8098118e446e58030af45b99893853b6.jpeg",
        "sales_type": 1,
        "pay_price": "0.00"
      }
    },
    {
      "id": 118,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 5,
      "type": "pay",
      "createtime": 1781776201,
      "question_count": 213,
      "complete_question_count": 114,
      "complete_prop": 200,
      "exercises": {
        "id": 5,
        "name": "未绑定分组的题目",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20231228/cab004734f2b40cfeda64e9e88e5f448.png",
        "sales_type": 2,
        "pay_price": "20.00"
      }
    },
    {
      "id": 119,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 1,
      "type": "pay",
      "createtime": 1781776201,
      "question_count": 211,
      "complete_question_count": 291,
      "complete_prop": 100,
      "exercises": {
        "id": 1,
        "name": "历年真题",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20240319/60f5857446a27108d2eb8f15a505ee49.png",
        "sales_type": 3,
        "pay_price": "3.10"
      }
    },
    {
      "id": 105,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 8,
      "type": "bind_course",
      "createtime": 1759499692,
      "question_count": 264,
      "complete_question_count": 275,
      "complete_prop": 100,
      "exercises": {
        "id": 8,
        "name": "章节练习",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250725/b3d9569b0b7d911e8fca6a6b4ec26698.jpg",
        "sales_type": 3,
        "pay_price": "0.00"
      }
    },
    {
      "id": 74,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 5,
      "type": "pay",
      "createtime": 1734360473,
      "question_count": 213,
      "complete_question_count": 114,
      "complete_prop": 200,
      "exercises": {
        "id": 5,
        "name": "未绑定分组的题目",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20231228/cab004734f2b40cfeda64e9e88e5f448.png",
        "sales_type": 2,
        "pay_price": "20.00"
      }
    },
    {
      "id": 37,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 6,
      "type": "bind_course",
      "createtime": 1713626227,
      "question_count": 231,
      "complete_question_count": 251,
      "complete_prop": 100,
      "exercises": {
        "id": 6,
        "name": "随堂测试练习题，职业测试",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250525/8098118e446e58030af45b99893853b6.jpeg",
        "sales_type": 1,
        "pay_price": "0.00"
      }
    },
    {
      "id": 32,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 1,
      "type": "free",
      "createtime": 1711867739,
      "question_count": 211,
      "complete_question_count": 291,
      "complete_prop": 100,
      "exercises": {
        "id": 1,
        "name": "历年真题",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20240319/60f5857446a27108d2eb8f15a505ee49.png",
        "sales_type": 3,
        "pay_price": "3.10"
      }
    },
    {
      "id": 26,
      "uniacid": 1,
      "user_id": 38,
      "exercises_id": 1,
      "type": "free",
      "createtime": 1710928815,
      "question_count": 211,
      "complete_question_count": 291,
      "complete_prop": 100,
      "exercises": {
        "id": 1,
        "name": "历年真题",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20240319/60f5857446a27108d2eb8f15a505ee49.png",
        "sales_type": 3,
        "pay_price": "3.10"
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
| data[].user_id | integer | 用户ID |
| data[].exercises_id | integer | 练习ID |
| data[].type | string | 类型 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].question_count | integer | 题目数量 |
| data[].complete_question_count | integer | complete题目数量 |
| data[].complete_prop | integer | completeprop |
| data[].exercises | object | 练习 |
| data[].exercises.id | integer | ID |
| data[].exercises.name | string | 名称 |
| data[].exercises.cover | string | 封面图 |
| data[].exercises.sales_type | integer | 销售方式 |
| data[].exercises.pay_price | string | 支付价格 |
