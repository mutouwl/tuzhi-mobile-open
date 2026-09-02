# 兑换

> 判断code是否可用

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exchange.exchange` |
| 接口地址 | `POST /api/app/exchange/code/exchange` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Code（兑换码） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| code | string | 否 | code | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/exchange/code/exchange' \
  -H 'Content-Type: application/json' \
  -d '{"code":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
