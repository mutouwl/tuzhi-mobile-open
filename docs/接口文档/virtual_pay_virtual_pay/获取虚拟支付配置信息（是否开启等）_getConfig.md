# 获取虚拟支付配置信息（是否开启等）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `virtual_pay/getConfig` |
| 接口地址 | `POST /api/virtual_pay/getConfig` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | virtual_pay（virtual_pay） |
| 所属控制器 | VirtualPay（虚拟支付） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}virtual_pay/getConfig' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
