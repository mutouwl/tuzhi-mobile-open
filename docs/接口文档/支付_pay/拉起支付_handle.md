# 拉起支付

> 购买课程前表单支付校验（防止绕过前端直接调支付）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `pay.handle` |
| 接口地址 | `POST /api/pay/handle` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 支付（pay） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 否 | 订单号 | - |
| pay_type | string | 否 | 支付类型 | - |
| openid | string | 否 | OpenID | `` |
| code | string | 否 | code | `` |
| mode | string | 否 | 模式 | `short_series_coin` |
| product_id | string | 否 | productID | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}pay/handle' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":"xxx","pay_type":"xxx","openid":"","code":"","mode":"short_series_coin","product_id":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
