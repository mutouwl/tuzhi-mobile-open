# 发送短信验证码

> 发送验证码

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `sms.send` |
| 接口地址 | `POST /api/sms/send` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 短信（sms） |
| 所属控制器 | Sms（手机短信接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| mobile | string | 否 | 手机号 | - |
| event | string | 否 | event | - |

## 请求示例

```bash
curl -X POST '{apiUrl}sms/send' \
  -H 'Content-Type: application/json' \
  -d '{"mobile":"xxx","event":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
