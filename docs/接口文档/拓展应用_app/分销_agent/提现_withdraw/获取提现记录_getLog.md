# 获取提现记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.withdraw.log` |
| 接口地址 | `POST /api/app/agent/withdraw/getLog` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Withdraw（提现） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| mode | integer | 否 | 模式 | `0` |
| time | string | 否 | 时间 | `time(` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/withdraw/getLog' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"mode":0,"time":"time("}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
