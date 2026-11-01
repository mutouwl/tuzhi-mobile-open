# 密码兑换参与打卡

> 参与条件为 password 的活动用兑换口令参与，不产生订单。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.passwordPay` |
| 接口地址 | `POST /api/app/checkin/checkin/passwordPay` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | - |
| password | string | 是 | 商家在活动设置里配置的兑换口令 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/passwordPay' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":"xxx","password":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 成功时为空对象 |

## 备注

- 介绍页接口不会下发兑换口令，只有这一口会校验它
