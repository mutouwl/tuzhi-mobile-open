# 获取银行卡信息

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.wallet.getCard` |
| 接口地址 | `POST /api/app/agent/withdraw_card/getCard` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | WithdrawCard（提现银行卡） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/withdraw_card/getCard' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508155",
  "data": false
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | boolean | 数据 |
