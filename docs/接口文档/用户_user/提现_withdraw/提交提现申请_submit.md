# 提交提现申请

> 检查提现开关

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.withdraw.submit` |
| 接口地址 | `POST /api/user/withdraw/submit` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 用户（user） |
| 所属控制器 | Withdraw（账户提现 - 用户端） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| money | string | 否 | 金额 | - |
| type | string | 否 | 类型 | `bank` |
| user_name | string | 否 | 用户名称 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}user/withdraw/submit' \
  -H 'Content-Type: application/json' \
  -d '{"money":"xxx","type":"bank","user_name":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
