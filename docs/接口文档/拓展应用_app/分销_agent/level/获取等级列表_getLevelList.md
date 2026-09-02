# 获取等级列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.level.getLevelList` |
| 接口地址 | `POST /api/app/agent/level/getLevelList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Level（配置） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/level/getLevelList' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508152",
  "data": {
    "list": [
      {
        "name": "A",
        "condition": {
          "customer": {
            "status": "",
            "value": "0"
          },
          "customer_pay": {
            "status": "",
            "value": "0"
          },
          "self_pay": {
            "status": "",
            "value": "0"
          },
          "agent": {
            "status": "",
            "value": "0"
          }
        },
        "proportion": {
          "customer": "0",
          "goods": "0"
        },
        "saved": "1"
      },
      {
        "id": "1322222222227",
        "saved": "1",
        "name": "B",
        "condition": {
          "customer": {
            "status": "0",
            "disabled": "",
            "value": ""
          },
          "customer_pay": {
            "status": "0",
            "disabled": "",
            "value": ""
          },
          "self_pay": {
            "status": "0",
            "disabled": "",
            "value": ""
          },
          "agent": {
            "status": "1",
            "disabled": "",
            "value": "100"
          }
        },
        "proportion": {
          "goods": "10",
          "customer": "0"
        }
      }
    ],
    "user": 1
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 列表 |
| data.list[].name | string | 名称 |
| data.list[].condition | object | 条件 |
| data.list[].condition.customer | object | 客户 |
| data.list[].condition.customer.status | string | 状态 |
| data.list[].condition.customer.value | string | 值 |
| data.list[].condition.customer_pay | object | 客户支付 |
| data.list[].condition.customer_pay.status | string | 状态 |
| data.list[].condition.customer_pay.value | string | 值 |
| data.list[].condition.self_pay | object | self支付 |
| data.list[].condition.self_pay.status | string | 状态 |
| data.list[].condition.self_pay.value | string | 值 |
| data.list[].condition.agent | object | 分销 |
| data.list[].condition.agent.status | string | 状态 |
| data.list[].condition.agent.value | string | 值 |
| data.list[].proportion | object | proportion |
| data.list[].proportion.customer | string | 客户 |
| data.list[].proportion.goods | string | 商品 |
| data.list[].saved | string | saved |
| data.user | integer | 用户 |
