# 获取评论列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.comment.index` |
| 接口地址 | `POST /api/course/comment/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Comment（评论） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | - |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| sort | string | 否 | 排序 | `time` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/comment/index' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"xxx","limit":10,"page":1,"sort":"time"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508142",
  "data": [
    {
      "id": 98,
      "uniacid": 1,
      "course_id": 32,
      "user_id": 0,
      "content": "11",
      "reply_user_id": 0,
      "reply_comment_id": 97,
      "status": 1,
      "createtime": 1768812857,
      "like_count": 0,
      "reply": {
        "id": 97,
        "content": "aaa",
        "createtime": 1767664933,
        "user": {
          "nickname": null,
          "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgaGVpZ2h0PSIxMDAiIHdpZHRoPSIxMDAiPjxyZWN0IGZpbGw9InJnYigxNjAsMjI5LDE3OSkiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3JlY3Q+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjUwIiB0ZXh0LWNvcHk9ImZhc3QiIG…（已截断，共 430 字符）"
        }
      },
      "user": {
        "nickname": "管理员",
        "avatar": "/assets/logo.png"
      },
      "islike": false,
      "candel": false
    },
    {
      "id": 97,
      "uniacid": 1,
      "course_id": 32,
      "user_id": 0,
      "content": "aaa",
      "reply_user_id": 0,
      "reply_comment_id": 96,
      "status": 1,
      "createtime": 1767664933,
      "like_count": 0,
      "reply": {
        "id": 96,
        "content": "sss",
        "createtime": 1767664923,
        "user": {
          "nickname": null,
          "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgaGVpZ2h0PSIxMDAiIHdpZHRoPSIxMDAiPjxyZWN0IGZpbGw9InJnYigxNjAsMjI5LDE3OSkiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3JlY3Q+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjUwIiB0ZXh0LWNvcHk9ImZhc3QiIG…（已截断，共 430 字符）"
        }
      },
      "user": {
        "nickname": "管理员",
        "avatar": "/assets/logo.png"
      },
      "islike": false,
      "candel": false
    },
    {
      "id": 96,
      "uniacid": 1,
      "course_id": 32,
      "user_id": 0,
      "content": "sss",
      "reply_user_id": 38,
      "reply_comment_id": 94,
      "status": 1,
      "createtime": 1767664923,
      "like_count": 0,
      "reply": {
        "id": 94,
        "content": "qwe",
        "createtime": 1763273723,
        "user": {
          "nickname": "冯浩森@凸知",
          "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png"
        }
      },
      "user": {
        "nickname": "管理员",
        "avatar": "/assets/logo.png"
      },
      "islike": false,
      "candel": false
    },
    {
      "id": 95,
      "uniacid": 1,
      "course_id": 70,
      "user_id": 875,
      "content": "你好",
      "reply_user_id": null,
      "reply_comment_id": null,
      "status": 1,
      "createtime": 1764246034,
      "like_count": 0,
      "user": {
        "nickname": "132****9405",
        "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgaGVpZ2h0PSIxMDAiIHdpZHRoPSIxMDAiPjxyZWN0IGZpbGw9InJnYigxNjAsMjI5LDE2NSkiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3JlY3Q+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjUwIiB0ZXh0LWNvcHk9ImZhc3QiIG…（已截断，共 430 字符）"
      },
      "islike": false,
      "candel": false
    },
    {
      "id": 94,
      "uniacid": 1,
      "course_id": 32,
      "user_id": 38,
      "content": "qwe",
      "reply_user_id": 51,
      "reply_comment_id": 40,
      "status": 1,
      "createtime": 1763273723,
      "like_count": 0,
      "reply": {
        "id": 40,
        "content": "？？？",
        "createtime": 1704026776,
        "user": {
          "nickname": "这个抖音名字超级超级超级超级超级长",
          "avatar": "https://p3.douyinpic.com/aweme/100x100/aweme-avatar/tos-cn-i-0813c001_4f94d5229b694e91a1817c75e5ef1655.jpeg?from=3782654143"
        }
      },
      "user": {
        "nickname": "冯浩森@凸知",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png"
      },
      "islike": false,
      "candel": true
    },
    {
      "id": 93,
      "uniacid": 1,
      "course_id": 189,
      "user_id": 38,
      "content": "？？？？？？？",
      "reply_user_id": null,
      "reply_comment_id": null,
      "status": 1,
      "createtime": 1753614814,
      "like_count": 0,
      "user": {
        "nickname": "冯浩森@凸知",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png"
      },
      "islike": false,
      "candel": true
    },
    {
      "id": 92,
      "uniacid": 1,
      "course_id": 142,
      "user_id": 27,
      "content": "你好",
      "reply_user_id": null,
      "reply_comment_id": null,
      "status": 1,
      "createtime": 1749965452,
      "like_count": 0,
      "user": {
        "nickname": "你好",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250515/bd9d231d6fb984276afba0bb0e2d8226.jpeg"
      },
      "islike": false,
      "candel": false
    },
    {
      "id": 91,
      "uniacid": 1,
      "course_id": 95,
      "user_id": 624,
      "content": "123",
      "reply_user_id": null,
      "reply_comment_id": null,
      "status": 1,
      "createtime": 1749788342,
      "like_count": 0,
      "user": {
        "nickname": "187****1243",
        "avatar": "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgaGVpZ2h0PSIxMDAiIHdpZHRoPSIxMDAiPjxyZWN0IGZpbGw9InJnYigyMjksMTYwLDIwMSkiIHg9IjAiIHk9IjAiIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48L3JlY3Q+PHRleHQgeD0iNTAiIHk9IjUwIiBmb250LXNpemU9IjUwIiB0ZXh0LWNvcHk9ImZhc3QiIG…（已截断，共 430 字符）"
      },
      "islike": false,
      "candel": false
    },
    {
      "id": 90,
      "uniacid": 1,
      "course_id": 138,
      "user_id": 38,
      "content": "123",
      "reply_user_id": null,
      "reply_comment_id": null,
      "status": 1,
      "createtime": 1749426943,
      "like_count": 2,
      "user": {
        "nickname": "冯浩森@凸知",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png"
      },
      "islike": true,
      "candel": true
    },
    {
      "id": 89,
      "uniacid": 1,
      "course_id": 186,
      "user_id": 27,
      "content": "123",
      "reply_user_id": null,
      "reply_comment_id": null,
      "status": 1,
      "createtime": 1747275811,
      "like_count": 0,
      "user": {
        "nickname": "你好",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250515/bd9d231d6fb984276afba0bb0e2d8226.jpeg"
      },
      "islike": false,
      "candel": false
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
| data[].course_id | integer | 课程ID |
| data[].user_id | integer | 用户ID |
| data[].content | string | 内容 |
| data[].reply_user_id | integer | reply用户ID |
| data[].reply_comment_id | integer | reply评论ID |
| data[].status | integer | 状态 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].like_count | integer | 点赞数量 |
| data[].reply | object | 回复 |
| data[].reply.id | integer | ID |
| data[].reply.content | string | 内容 |
| data[].reply.createtime | integer | 创建时间（时间戳） |
| data[].reply.user | object | 用户 |
| data[].reply.user.nickname | null | 昵称 |
| data[].reply.user.avatar | string | 头像 |
| data[].user | object | 用户 |
| data[].user.nickname | string | 昵称 |
| data[].user.avatar | string | 头像 |
| data[].islike | boolean | islike |
| data[].candel | boolean | candel |
