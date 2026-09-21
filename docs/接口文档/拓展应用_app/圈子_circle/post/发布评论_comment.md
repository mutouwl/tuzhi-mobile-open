# 发布评论

> 黑名单校验（非成员/黑名单/付费圈过期拦截）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.comment` |
| 接口地址 | `POST /api/app/circle/post/comment` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| post_id | integer | 否 | 帖子ID | `0` |
| content | string | 否 | 内容 | `` |
| reply_id | integer | 否 | replyID | `0` |
| media | string | 否 | 媒体 | `` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/comment' \
  -H 'Content-Type: application/json' \
  -d '{"post_id":0,"content":"","reply_id":0,"media":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
