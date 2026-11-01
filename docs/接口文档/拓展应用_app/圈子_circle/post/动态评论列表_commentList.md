# 动态评论列表

> 动态评论列表（评论排序切换专用接口） 独立于详情接口：排序切换只拉评论，避免重新请求动态详情导致浏览量 +1、重复拉取整篇动态。 参数：post_id（动态 id）、sort（default/earliest 按 id 升序，latest 按 id 降序）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.commentList` |
| 接口地址 | `POST /api/app/circle/post/commentList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| post_id | integer | 否 | 帖子ID | `0` |
| sort | string | 否 | 排序 | `default` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/commentList' \
  -H 'Content-Type: application/json' \
  -d '{"post_id":0,"sort":"default"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": [
    {
      "id": 503,
      "uniacid": 1,
      "circle_id": 1,
      "post_id": 103,
      "user_id": 1001,
      "reply_id": 0,
      "reply_user_id": 0,
      "content": "建议先做留存，再谈拉新。留存跑不通的拉新只是买流量打水漂，可以先围绕核心使用链路做 3 个关键行为引导，观察次周留存再放大获取。",
      "media": [],
      "status": 1,
      "createtime": 1786482600,
      "nickname": "圈主小美",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "is_owner": 1,
      "is_mine": 0,
      "liked": 0,
      "like_count": 3,
      "reply_nickname": ""
    },
    {
      "id": 504,
      "uniacid": 1,
      "circle_id": 1,
      "post_id": 103,
      "user_id": 1002,
      "reply_id": 503,
      "reply_user_id": 1001,
      "content": "受教了，留存确实比拉新更重要，谢谢圈主",
      "media": [],
      "status": 1,
      "createtime": 1786483000,
      "nickname": "学员小李",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "is_owner": 0,
      "is_mine": 1,
      "liked": 0,
      "like_count": 0,
      "reply_nickname": "圈主小美"
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].circle_id | integer | 圈子ID |
| data[].post_id | integer | 帖子ID |
| data[].user_id | integer | 用户ID |
| data[].reply_id | integer | replyID |
| data[].reply_user_id | integer | reply用户ID |
| data[].content | string | 内容 |
| data[].media | array | 媒体 |
| data[].status | integer | 状态 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].nickname | string | 昵称 |
| data[].avatar | string | 头像 |
| data[].is_owner | integer | 是否本人 |
| data[].is_mine | integer | 是否本人：这一行的作者/发布者是我 |
| data[].liked | integer | liked |
| data[].like_count | integer | 点赞数量 |
| data[].reply_nickname | string | reply昵称 |
