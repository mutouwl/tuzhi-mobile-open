# 打卡动态评论列表

> 一级评论 + 回复两级返回；管理员点评（带星级）恒排最前，不跟随排序档。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.commentList` |
| 接口地址 | `POST /api/app/checkin/checkin/commentList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| record_id | integer | 是 | 动态 ID | `33827` |
| sort | string | 否 | 排序档：default=默认 / latest=最新在前 / 其余为最早在前 | - |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 20，上限 50 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/commentList' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"record_id":33827,"sort":"xxx","page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344790",
  "data": {
    "total": 0,
    "rows": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.total | integer | 合计 |
| data.rows | array | 本页数据行数组 |
