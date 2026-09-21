# 拉起支付

> 余额支付

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order/pay/handle` |
| 接口地址 | `POST /api/order/pay/handle` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 订单（order） |
| 所属控制器 | Pay（支付 暂时废弃） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 否 | 订单号 | - |
| pay_type | string | 否 | 支付类型 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}order/pay/handle' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":"xxx","pay_type":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
