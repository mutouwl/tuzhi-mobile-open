# 获取账户余额

> 获取账户余额（从user.money中获取）及提现配置

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.withdraw.getBalance` |
| 接口地址 | `POST /api/user/withdraw/getBalance` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 用户（user） |
| 所属控制器 | Withdraw（账户提现 - 用户端） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}user/withdraw/getBalance' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508195",
  "data": {
    "balance": "96471.49",
    "total_income": "120398.21",
    "total_withdraw": "4.00",
    "wechat_bound": false,
    "withdraw_status": "close",
    "withdraw_types": [
      "bank"
    ],
    "withdraw_tip": "提现提示文字",
    "withdraw_min_money": 0,
    "withdraw_month_times": 5,
    "month_used_count": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.balance | string | 余额 |
| data.total_income | string | 合计income |
| data.total_withdraw | string | 合计提现 |
| data.wechat_bound | boolean | 微信bound |
| data.withdraw_status | string | 提现状态 |
| data.withdraw_types | array | 提现types |
| data.withdraw_types[] | string | 提现types |
| data.withdraw_tip | string | 提现tip |
| data.withdraw_min_money | integer | 提现min金额 |
| data.withdraw_month_times | integer | 提现monthtimes |
| data.month_used_count | integer | monthused数量 |
