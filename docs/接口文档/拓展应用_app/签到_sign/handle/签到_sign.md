# 签到

> 获取积分规则

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.sign.sign` |
| 接口地址 | `POST /api/app/sign/handle/sign` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Handle（日历签到） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| month | string | 否 | month | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/sign/handle/sign' \
  -H 'Content-Type: application/json' \
  -d '{"month":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "签到成功",
  "time": "1786508173",
  "data": {
    "uniacid": 1,
    "user_id": 38,
    "date": "2026-08-12",
    "score": "100",
    "id": "173"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.user_id | integer | 用户ID |
| data.date | string | 日期 |
| data.score | string | 积分 |
| data.id | string | ID |
