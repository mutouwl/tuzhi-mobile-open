# 获取退款原因

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.service.reason` |
| 接口地址 | `POST /api/order/service/getRefundReason` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Service（售后服务） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}order/service/getRefundReason' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508188",
  "data": {
    "1": "不想要了",
    "2": "商家服务原因",
    "3": "商品质量问题",
    "4": "其他"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[] | string | 数据 |
