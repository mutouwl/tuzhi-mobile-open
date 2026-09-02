# 获取成员

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.member.getMember` |
| 接口地址 | `POST /api/app/agent/member/getMember` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Member（成员） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/member/getMember' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508153",
  "data": {
    "id": 11,
    "uniacid": 1,
    "user_id": 38,
    "money": "0.15",
    "money_freeze": "0.00",
    "money_total": "0.15",
    "money_withdraw": "0.00",
    "level": "1322222222227",
    "status": 1,
    "audit": 1,
    "createtime": 1710598574
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.user_id | integer | 用户ID |
| data.money | string | 金额 |
| data.money_freeze | string | 金额freeze |
| data.money_total | string | 金额合计 |
| data.money_withdraw | string | 金额提现 |
| data.level | string | 等级 |
| data.status | integer | 状态 |
| data.audit | integer | audit |
| data.createtime | integer | 创建时间（时间戳） |
