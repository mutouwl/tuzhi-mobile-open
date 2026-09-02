# 提交评价

> 判断是否全部评价完毕

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.evaluate.submit` |
| 接口地址 | `POST /api/order/evaluate/submit` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Evaluate（订单评价） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 否 | 订单号 | `` |
| item_id | string | 否 | 条目ID | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}order/evaluate/submit' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":"","item_id":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
