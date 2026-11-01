# 动态详情

> 成员校验（非成员/黑名单/付费圈过期拦截）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.detail` |
| 接口地址 | `POST /api/app/circle/post/detail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |
| comment_sort | string | 否 | 评论排序 | `default` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":0,"comment_sort":"default"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "id": 103,
    "uniacid": 1,
    "circle_id": 1,
    "user_id": 1001,
    "post_type": "question",
    "content": "新手做用户增长，是优先做拉新还是先做留存？",
    "media": {},
    "link_data": [],
    "status": 1,
    "is_show": 1,
    "audit_status": 1,
    "is_top": 0,
    "is_essence": 0,
    "is_notice": 0,
    "comment_count": 2,
    "like_count": 6,
    "view_count": 95,
    "createtime": 1786482000,
    "updatetime": 1786482000,
    "is_owner": 1,
    "nickname": "圈主小美",
    "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
    "is_mine": 0,
    "liked": 0,
    "like_users": [
      "学员小李",
      "学员小张"
    ],
    "tags": [
      {
        "id": 303,
        "name": "问答求助"
      }
    ],
    "show_view_count": 1,
    "comments": [
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
    ],
    "comment_image_limit": 9
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
| data.circle_id | integer | 圈子ID |
| data.user_id | integer | 用户ID |
| data.post_type | string | 帖子类型 |
| data.content | string | 内容 |
| data.media | object | 媒体 |
| data.link_data | array | 动态挂的课程卡数组（按 record_id 实时 JOIN 现拼，非发布时快照；课程已删或未上架则不出卡） |
| data.status | integer | 状态 |
| data.is_show | integer | 是否显示 |
| data.audit_status | integer | audit状态 |
| data.is_top | integer | 是否置顶（动态流排序第一键） |
| data.is_essence | integer | 是否essence |
| data.is_notice | integer | 是否notice |
| data.comment_count | integer | 评论数量 |
| data.like_count | integer | 点赞数量 |
| data.view_count | integer | view数量 |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
| data.is_owner | integer | 是否本人 |
| data.nickname | string | 昵称 |
| data.avatar | string | 头像 |
| data.is_mine | integer | 是否本人：这一行的作者/发布者是我 |
| data.liked | integer | liked |
| data.like_users | array | 点赞users |
| data.like_users[] | string | 点赞users |
| data.tags | array | tags |
| data.tags[].id | integer | ID |
| data.tags[].name | string | 名称 |
| data.show_view_count | integer | showview数量 |
| data.comments | array | 评论预览数组（无评论为空数组） |
| data.comments[].id | integer | ID |
| data.comments[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.comments[].circle_id | integer | 圈子ID |
| data.comments[].post_id | integer | 帖子ID |
| data.comments[].user_id | integer | 用户ID |
| data.comments[].reply_id | integer | replyID |
| data.comments[].reply_user_id | integer | reply用户ID |
| data.comments[].content | string | 内容 |
| data.comments[].media | array | 媒体 |
| data.comments[].status | integer | 状态 |
| data.comments[].createtime | integer | 创建时间（时间戳） |
| data.comments[].nickname | string | 昵称 |
| data.comments[].avatar | string | 头像 |
| data.comments[].is_owner | integer | 是否本人 |
| data.comments[].is_mine | integer | 是否本人：这一行的作者/发布者是我 |
| data.comments[].liked | integer | liked |
| data.comments[].like_count | integer | 点赞数量 |
| data.comments[].reply_nickname | string | reply昵称 |
| data.comment_image_limit | integer | 评论图片limit |
