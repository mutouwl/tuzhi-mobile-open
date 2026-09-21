# 设置银行卡信息

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.wallet.setCard` |
| 接口地址 | `POST /api/app/agent/withdraw_card/setCard` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | WithdrawCard（提现银行卡） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| name | string | 否 | 名称 | - |
| card_no | string | 否 | 卡片号 | - |
| address | string | 否 | 地址 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/withdraw_card/setCard' \
  -H 'Content-Type: application/json' \
  -d '{"name":"xxx","card_no":"xxx","address":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
