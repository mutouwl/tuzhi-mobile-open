# 课程列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.course` |
| 接口地址 | `POST /api/course/course/getList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Course（课程） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| group | string | 否 | 分组 | - |
| is_deep | integer | 否 | 是否递归子分类 | `1` |
| searchKey | string | 否 | 搜索关键词 | `` |
| sort | string | 否 | 排序 | `time` |
| type | string | 否 | 类型 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/course/getList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"group":"xxx","is_deep":1,"searchKey":"","sort":"time","type":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508176",
  "data": [
    {
      "id": 645,
      "name": "开心",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
      "type": "live",
      "briefing": "",
      "pay_type": "free",
      "price": "0.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 644,
      "name": "李龙",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260808/f27490ef8b3c3fc362c77644e7c606aa.jpeg",
      "type": "live",
      "briefing": "李龙生日会",
      "pay_type": "free",
      "price": "0.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 430,
      "name": "سىناق دەرىسلىك",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/3e8411d84caf66fd56d7a46746f72e2e.jpg",
      "type": "column",
      "briefing": "简介",
      "pay_type": "free",
      "price": "100.00",
      "price_marking": "50.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 420,
      "name": "55666666666333333",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/e16476aadf780e297d93cf3c840d5d0f.jpg",
      "type": "column",
      "briefing": "123",
      "pay_type": "pay",
      "price": "88.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 419,
      "name": "健康管理2",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
      "type": "article",
      "briefing": "健康管理",
      "pay_type": "pay",
      "price": "1.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 418,
      "name": "健康管理1",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
      "type": "article",
      "briefing": "健康管理",
      "pay_type": "pay",
      "price": "1.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 417,
      "name": "健康管理",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
      "type": "article",
      "briefing": "健康管理",
      "pay_type": "pay",
      "price": "1.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 380,
      "name": "健康管理",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
      "type": "article",
      "briefing": "健康管理",
      "pay_type": "free",
      "price": "0.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 372,
      "name": "111",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260712/505920496acd47d8d91c2782db2df2d2.jpeg",
      "type": "article",
      "briefing": "",
      "pay_type": "free",
      "price": "0.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
      "is_virtual_pay": 0
    },
    {
      "id": 331,
      "name": "自定义播流地址 - 横屏直播｜阿里云消息",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260615/072936d7c65cb51a52e6b2946f0dc9c6.png",
      "type": "live",
      "briefing": "",
      "pay_type": "free",
      "price": "0.00",
      "price_marking": "0.00",
      "is_vip_goods": true,
      "sales_type": [
        "alone"
      ],
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
| data[].type | string | 类型 |
| data[].briefing | string | 简介 |
| data[].pay_type | string | 支付类型 |
| data[].price | string | 价格 |
| data[].price_marking | string | 划线价 |
| data[].is_vip_goods | boolean | 是否会员专属 |
| data[].sales_type | array | 销售方式 |
| data[].sales_type[] | string | 销售方式 |
| data[].is_virtual_pay | integer | 是否虚拟支付 |
