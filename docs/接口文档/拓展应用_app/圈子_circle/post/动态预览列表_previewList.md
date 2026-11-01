# 动态预览列表

> 动态预览列表（DIY 装修/售前页展示用，免登录，不含互动信息）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.previewList` |
| 接口地址 | `POST /api/app/circle/post/previewList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | integer | 否 | 圈子ID | `0` |
| tab | string | 否 | tab | `all` |
| limit | integer | 否 | 每页数量 | `5` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/previewList' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":0,"tab":"all","limit":5}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": [
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
      "liked": 0,
      "like_users": [],
      "comments": [],
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
      "liked": 0,
      "like_users": [],
      "comments": [],
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
      "liked": 0,
      "like_users": [],
      "comments": [],
      "tags": [
        {
          "id": 301,
          "name": "运营干货"
        }
      ]
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
| data[].user_id | integer | 用户ID |
| data[].post_type | string | 帖子类型 |
| data[].content | string | 内容 |
| data[].media | object | 媒体 |
| data[].media.media_type | string | 媒体类型 |
| data[].media.images | array | 图片地址数组 |
| data[].media.images[] | string | 图片地址数组 |
| data[].link_data | array | 动态挂的课程卡数组（按 record_id 实时 JOIN 现拼，非发布时快照；课程已删或未上架则不出卡） |
| data[].status | integer | 状态 |
| data[].is_show | integer | 是否显示 |
| data[].audit_status | integer | audit状态 |
| data[].is_top | integer | 是否置顶（动态流排序第一键） |
| data[].is_essence | integer | 是否essence |
| data[].is_notice | integer | 是否notice |
| data[].comment_count | integer | 评论数量 |
| data[].like_count | integer | 点赞数量 |
| data[].view_count | integer | view数量 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].updatetime | integer | 更新时间（时间戳） |
| data[].is_owner | integer | 是否本人 |
| data[].nickname | string | 昵称 |
| data[].avatar | string | 头像 |
| data[].liked | integer | liked |
| data[].like_users | array | 点赞users |
| data[].comments | array | 评论预览数组（无评论为空数组） |
| data[].tags | array | tags |
| data[].tags[].id | integer | ID |
| data[].tags[].name | string | 名称 |
