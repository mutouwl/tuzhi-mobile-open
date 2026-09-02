# 获取分销配置

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.config.getConfig` |
| 接口地址 | `POST /api/app/agent/config/getConfig` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Config（配置） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/config/getConfig' \
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
    "mode": "2",
    "levelPlan": [
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
    "upgrade": "2",
    "withdraw_status": "1",
    "withdraw_minmoney": "0",
    "withdraw_monthlimit": "0",
    "withdraw_platform": [
      "wechat"
    ],
    "withdraw_audit": "2",
    "withdraw_tips": "恭喜你获得推广奖励，再接再厉。",
    "status": "1",
    "member_recruit_poster": "<p>尊享套餐399元享受本站全部课程资源，并取得分销资格。</p>",
    "member_recruit_condition": "0",
    "member_recruit_condition_payprice_status": "1",
    "member_recruit_audit": "0",
    "member_recruit_condition_payprice_value": "399",
    "member_recruit_status": "1",
    "member_recruit_condition_paycount_status": "1",
    "member_recruit_condition_paycount_value": "1",
    "channels": true
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.mode | string | 模式 |
| data.levelPlan | array | 等级Plan |
| data.levelPlan[].name | string | 名称 |
| data.levelPlan[].condition | object | 条件 |
| data.levelPlan[].condition.customer | object | 客户 |
| data.levelPlan[].condition.customer.status | string | 状态 |
| data.levelPlan[].condition.customer.value | string | 值 |
| data.levelPlan[].condition.customer_pay | object | 客户支付 |
| data.levelPlan[].condition.customer_pay.status | string | 状态 |
| data.levelPlan[].condition.customer_pay.value | string | 值 |
| data.levelPlan[].condition.self_pay | object | self支付 |
| data.levelPlan[].condition.self_pay.status | string | 状态 |
| data.levelPlan[].condition.self_pay.value | string | 值 |
| data.levelPlan[].condition.agent | object | 分销 |
| data.levelPlan[].condition.agent.status | string | 状态 |
| data.levelPlan[].condition.agent.value | string | 值 |
| data.levelPlan[].proportion | object | proportion |
| data.levelPlan[].proportion.customer | string | 客户 |
| data.levelPlan[].proportion.goods | string | 商品 |
| data.levelPlan[].saved | string | saved |
| data.upgrade | string | upgrade |
| data.withdraw_status | string | 提现状态 |
| data.withdraw_minmoney | string | 提现minmoney |
| data.withdraw_monthlimit | string | 提现monthlimit |
| data.withdraw_platform | array | 提现platform |
| data.withdraw_platform[] | string | 提现platform |
| data.withdraw_audit | string | 提现audit |
| data.withdraw_tips | string | 提现tips |
| data.status | string | 状态 |
| data.member_recruit_poster | string | 成员招募海报 |
| data.member_recruit_condition | string | 成员招募条件 |
| data.member_recruit_condition_payprice_status | string | 成员招募条件payprice状态 |
| data.member_recruit_audit | string | 成员招募audit |
| data.member_recruit_condition_payprice_value | string | 成员招募条件paypricevalue |
| data.member_recruit_status | string | 成员招募状态 |
| data.member_recruit_condition_paycount_status | string | 成员招募条件paycount状态 |
| data.member_recruit_condition_paycount_value | string | 成员招募条件paycountvalue |
| data.channels | boolean | 视频号 |
