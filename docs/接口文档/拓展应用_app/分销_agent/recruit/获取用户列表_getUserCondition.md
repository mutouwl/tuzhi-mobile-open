# 获取用户列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.recruit.getUserCondition` |
| 接口地址 | `POST /api/app/agent/recruit/getUserCondition` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Recruit（分销员招募） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/recruit/getUserCondition' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508154",
  "data": {
    "pay_price": "23422.34",
    "pay_count": 308,
    "last_pay_time": 1701754358
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.pay_price | string | 支付价格 |
| data.pay_count | integer | 支付数量 |
| data.last_pay_time | integer | last支付时间 |
