# 动态流

> 关键词规范化：截断 30 + LIKE 通配符转义（防超长搜索/通配符全表匹配，大数据量兼容）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.list` |
| 接口地址 | `POST /api/app/circle/post/list` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | string | 否 | 圈子ID | - |
| user_id | string | 否 | 用户ID | - |
| tab | string | 否 | tab | - |
| sort | string | 否 | 排序 | - |
| page | string | 否 | 页码 | - |
| limit | string | 否 | 每页数量 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/list' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":"xxx","user_id":"xxx","tab":"xxx","sort":"xxx","page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "total": 5,
    "rows": [
      {
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
        "tags": [
          {
            "id": 303,
            "name": "问答求助"
          }
        ]
      },
      {
        "id": 102,
        "uniacid": 1,
        "circle_id": 1,
        "user_id": 1002,
        "post_type": "image",
        "content": "今天的运营日报整理了 20 个老带新裂变玩法，需要的自取 #运营干货#",
        "media": {
          "media_type": "image",
          "images": [
            "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
            "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg"
          ]
        },
        "link_data": [],
        "status": 1,
        "is_show": 1,
        "audit_status": 1,
        "is_top": 0,
        "is_essence": 0,
        "is_notice": 0,
        "comment_count": 1,
        "like_count": 4,
        "view_count": 66,
        "createtime": 1786492800,
        "updatetime": 1786492800,
        "is_owner": 0,
        "nickname": "学员小李",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "is_mine": 1,
        "liked": 1,
        "like_users": [
          "圈主小美",
          "学员小张"
        ],
        "comments": [
          {
            "id": 505,
            "uniacid": 1,
            "circle_id": 1,
            "post_id": 102,
            "user_id": 1001,
            "reply_id": 0,
            "reply_user_id": 0,
            "content": "太及时了，我正在做老带新，正好用上用上",
            "media": [],
            "status": 1,
            "createtime": 1786493400,
            "nickname": "圈主小美",
            "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
            "is_owner": 1,
            "is_mine": 0,
            "liked": 0,
            "like_count": 1,
            "reply_nickname": ""
          }
        ],
        "tags": [
          {
            "id": 302,
            "name": "每日打卡"
          }
        ]
      },
      {
        "id": 101,
        "uniacid": 1,
        "circle_id": 1,
        "user_id": 1001,
        "post_type": "text",
        "content": "【圈公告】欢迎大家加入产品运营实战圈。每周日下午 17:00 会更新一期行业拆解直播，资料放在课程 tab，有问题随时发帖提问。",
        "media": {},
        "link_data": [],
        "status": 1,
        "is_show": 1,
        "audit_status": 1,
        "is_top": 1,
        "is_essence": 1,
        "is_notice": 1,
        "comment_count": 2,
        "like_count": 8,
        "view_count": 132,
        "createtime": 1786060800,
        "updatetime": 1786060800,
        "is_owner": 1,
        "nickname": "圈主小美",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "is_mine": 0,
        "liked": 1,
        "like_users": [
          "学员小李",
          "学员小张",
          "圈主小美"
        ],
        "comments": [
          {
            "id": 501,
            "uniacid": 1,
            "circle_id": 1,
            "post_id": 101,
            "user_id": 1002,
            "reply_id": 0,
            "reply_user_id": 0,
            "content": "收到，已经收藏了课程",
            "media": [],
            "status": 1,
            "createtime": 1786062000,
            "nickname": "学员小李",
            "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
            "is_owner": 0,
            "is_mine": 1,
            "liked": 0,
            "like_count": 0,
            "reply_nickname": ""
          },
          {
            "id": 502,
            "uniacid": 1,
            "circle_id": 1,
            "post_id": 101,
            "user_id": 1003,
            "reply_id": 501,
            "reply_user_id": 1002,
            "content": "同收藏，期待直播",
            "media": [],
            "status": 1,
            "createtime": 1786062600,
            "nickname": "学员小张",
            "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
            "is_owner": 0,
            "is_mine": 0,
            "liked": 0,
            "like_count": 0,
            "reply_nickname": "学员小李"
          }
        ],
        "tags": [
          {
            "id": 301,
            "name": "运营干货"
          }
        ]
      },
      {
        "id": 104,
        "uniacid": 1,
        "circle_id": 1,
        "user_id": 1003,
        "post_type": "video",
        "content": "分享一段我做的落地页 A/B 测试复盘，转化率提升了 23%，要点见视频",
        "media": {
          "media_type": "video",
          "videos": [
            {
              "url": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.mp4",
              "video_id": "",
              "name": "视频",
              "size": 0
            }
          ]
        },
        "link_data": [],
        "status": 1,
        "is_show": 1,
        "audit_status": 1,
        "is_top": 0,
        "is_essence": 0,
        "is_notice": 0,
        "comment_count": 0,
        "like_count": 3,
        "view_count": 41,
        "createtime": 1786406400,
        "updatetime": 1786406400,
        "is_owner": 0,
        "nickname": "学员小张",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "is_mine": 0,
        "liked": 0,
        "like_users": [
          "学员小李"
        ],
        "comments": [],
        "tags": [
          {
            "id": 301,
            "name": "运营干货"
          }
        ]
      },
      {
        "id": 105,
        "uniacid": 1,
        "circle_id": 1,
        "user_id": 1002,
        "post_type": "file",
        "content": "把最近整理的《增长案例模板》PDF 分享给圈友，可以直接套用",
        "media": {
          "media_type": "file",
          "files": [
            {
              "url": "https://tuzhi.mutouweb.com/uploads/1/20260613/growth-template.pdf",
              "name": "增长案例模板.pdf",
              "size": 2048576
            }
          ]
        },
        "link_data": [],
        "status": 1,
        "is_show": 1,
        "audit_status": 1,
        "is_top": 0,
        "is_essence": 0,
        "is_notice": 0,
        "comment_count": 0,
        "like_count": 2,
        "view_count": 30,
        "createtime": 1786320000,
        "updatetime": 1786320000,
        "is_owner": 0,
        "nickname": "学员小李",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "is_mine": 1,
        "liked": 0,
        "like_users": [],
        "comments": [],
        "tags": []
      }
    ]
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
| data.rows[].id | integer | ID |
| data.rows[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.rows[].circle_id | integer | 圈子ID |
| data.rows[].user_id | integer | 用户ID |
| data.rows[].post_type | string | 帖子类型 |
| data.rows[].content | string | 内容 |
| data.rows[].media | object | 媒体 |
| data.rows[].link_data | array | 动态挂的课程卡数组（按 record_id 实时 JOIN 现拼，非发布时快照；课程已删或未上架则不出卡） |
| data.rows[].status | integer | 状态 |
| data.rows[].is_show | integer | 是否显示 |
| data.rows[].audit_status | integer | audit状态 |
| data.rows[].is_top | integer | 是否置顶（动态流排序第一键） |
| data.rows[].is_essence | integer | 是否essence |
| data.rows[].is_notice | integer | 是否notice |
| data.rows[].comment_count | integer | 评论数量 |
| data.rows[].like_count | integer | 点赞数量 |
| data.rows[].view_count | integer | view数量 |
| data.rows[].createtime | integer | 创建时间（时间戳） |
| data.rows[].updatetime | integer | 更新时间（时间戳） |
| data.rows[].is_owner | integer | 是否本人 |
| data.rows[].nickname | string | 昵称 |
| data.rows[].avatar | string | 头像 |
| data.rows[].is_mine | integer | 是否本人：这一行的作者/发布者是我 |
| data.rows[].liked | integer | liked |
| data.rows[].like_users | array | 点赞users |
| data.rows[].like_users[] | string | 点赞users |
| data.rows[].comments | array | 评论预览数组（无评论为空数组） |
| data.rows[].comments[].id | integer | ID |
| data.rows[].comments[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.rows[].comments[].circle_id | integer | 圈子ID |
| data.rows[].comments[].post_id | integer | 帖子ID |
| data.rows[].comments[].user_id | integer | 用户ID |
| data.rows[].comments[].reply_id | integer | replyID |
| data.rows[].comments[].reply_user_id | integer | reply用户ID |
| data.rows[].comments[].content | string | 内容 |
| data.rows[].comments[].media | array | 媒体 |
| data.rows[].comments[].status | integer | 状态 |
| data.rows[].comments[].createtime | integer | 创建时间（时间戳） |
| data.rows[].comments[].nickname | string | 昵称 |
| data.rows[].comments[].avatar | string | 头像 |
| data.rows[].comments[].is_owner | integer | 是否本人 |
| data.rows[].comments[].is_mine | integer | 是否本人：这一行的作者/发布者是我 |
| data.rows[].comments[].liked | integer | liked |
| data.rows[].comments[].like_count | integer | 点赞数量 |
| data.rows[].comments[].reply_nickname | string | reply昵称 |
| data.rows[].tags | array | tags |
| data.rows[].tags[].id | integer | ID |
| data.rows[].tags[].name | string | 名称 |
