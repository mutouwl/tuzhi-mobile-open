# 获取退款记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.service.refundLog` |
| 接口地址 | `POST /api/order/service/getRefundLog` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Service（售后服务） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 否 | 订单号 | - |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}order/service/getRefundLog' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":"xxx","limit":10,"page":1}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
