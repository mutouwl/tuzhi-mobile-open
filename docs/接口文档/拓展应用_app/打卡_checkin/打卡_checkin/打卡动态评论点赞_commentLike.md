# 打卡动态评论点赞

> 对一条评论点赞或取消点赞，返回切换后的状态与最新评论点赞数。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.commentLike` |
| 接口地址 | `POST /api/app/checkin/checkin/commentLike` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | - |
| record_id | integer | 是 | 评论所属动态 ID | - |
| comment_id | integer | 是 | 被点赞的评论 ID | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/commentLike' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":"xxx","record_id":"xxx","comment_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 点赞结果 |
| data.liked | string | 当前用户此刻是否已点赞该评论 |
| data.like_count | integer | 该评论的最新点赞数 |
