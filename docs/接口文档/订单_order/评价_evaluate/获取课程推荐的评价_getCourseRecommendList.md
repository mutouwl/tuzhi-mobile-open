# 获取课程推荐的评价

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.evaluate.getCourseRecommendList` |
| 接口地址 | `POST /api/order/evaluate/getCourseRecommendList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Evaluate（订单评价） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}order/evaluate/getCourseRecommendList' \
  -H 'Content-Type: application/json' \
  -d '{"id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508209",
  "data": {
    "list": [],
    "count": 0,
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
| data.list | array | 列表 |
| data.count | integer | 数量 |
| data.is_virtual_pay | integer | 是否虚拟支付 |
