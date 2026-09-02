# 用户侧同步微信提现结果

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.withdraw.syncWechatTransfer` |
| 接口地址 | `POST /api/user/withdraw/syncWechatTransfer` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 用户（user） |
| 所属控制器 | Withdraw（账户提现 - 用户端 自直播红包模块抽离为通用账户提现： 余额口径统一为 user.money（直播红包收入只是账户收入来源之一），提现不依赖直播红包插件。 说明：提现/收款账户数据存于 user_withdraw / user_withdraw_account 表（与用户关联）； 自动转账由用户余额提现转账服务 WithdrawTransferService 处理。） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}user/withdraw/syncWechatTransfer' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
