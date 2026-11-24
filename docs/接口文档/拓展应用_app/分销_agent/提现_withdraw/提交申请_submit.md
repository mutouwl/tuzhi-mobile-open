# 提交申请 提的是分销钱包那一截

> 提交申请 提的是分销钱包那一截（佣金记录创建时商家还没开「结算到用户余额」的那几笔）； 开了之后新到账的佣金直接进用户余额，走「我的 - 余额」提现，支持支付宝/微信自动转账。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.withdraw.submit` |
| 接口地址 | `POST /api/app/agent/withdraw/submit` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| money | string | 否 | 金额 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/withdraw/submit' \
  -H 'Content-Type: application/json' \
  -d '{"money":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
