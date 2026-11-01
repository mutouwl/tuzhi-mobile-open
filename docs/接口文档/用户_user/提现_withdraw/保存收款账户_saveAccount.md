# 保存收款账户

> 新增：同一类型收款账户最多可添加三个

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.withdraw.saveAccount` |
| 接口地址 | `POST /api/user/withdraw/saveAccount` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 用户（user） |
| 所属控制器 | Withdraw（账户提现 - 用户端） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |
| type | string | 否 | 类型 | - |
| name | string | 否 | 名称 | - |
| account | string | 否 | 账号 | - |
| ext | string | 否 | ext | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}user/withdraw/saveAccount' \
  -H 'Content-Type: application/json' \
  -d '{"id":0,"type":"xxx","name":"xxx","account":"xxx","ext":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
