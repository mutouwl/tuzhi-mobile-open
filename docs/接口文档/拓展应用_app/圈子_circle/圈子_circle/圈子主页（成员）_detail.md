# 圈子主页（成员）

> 成员/权益综合校验：非成员/黑名单/付费圈过期统一拦截。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.detail` |
| 接口地址 | `POST /api/app/circle/circle/detail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "id": 1,
    "name": "产品运营实战圈",
    "intro": "聚焦产品与运营实战，每天分享方法、案例与行业资料，和圈友一起成长",
    "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
    "member_count": 158,
    "show_member_count": 1,
    "post_count": 12,
    "show_post_count": 1,
    "showcase_count": 2,
    "course_count": 3,
    "owner_post_count": 4,
    "top_posts": [
      {
        "id": 101,
        "content": "【圈公告】欢迎大家加入产品运营实战圈。每周日下午 17:00 会更新一期行业拆解直播，资料放在课程 tab，有问题随时发帖提问。"
      }
    ],
    "content_protect": 0,
    "nav_config": [
      {
        "type": "all",
        "name": "全部",
        "key": "all",
        "status": 1,
        "sort": 1
      },
      {
        "type": "essence",
        "name": "精选",
        "key": "essence",
        "status": 1,
        "sort": 2
      },
      {
        "type": "tag",
        "name": "运营干货",
        "key": "301",
        "status": 1,
        "sort": 3
      },
      {
        "type": "showcase",
        "name": "橱窗",
        "key": "showcase",
        "status": 1,
        "sort": 4
      }
    ],
    "avatars": [
      "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg"
    ],
    "tags": [
      {
        "id": 301,
        "name": "运营干货",
        "sort": 1
      },
      {
        "id": 302,
        "name": "每日打卡",
        "sort": 2
      },
      {
        "id": 303,
        "name": "问答求助",
        "sort": 3
      }
    ],
    "my_member": {
      "role": "member",
      "status": 1,
      "expire_time": 1786723200,
      "expire_text": "2026-08-15",
      "is_expired": 0,
      "createtime": 1786060800
    }
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
| data.name | string | 名称 |
| data.intro | string | 简介 |
| data.cover | string | 封面图 |
| data.member_count | integer | 成员数量 |
| data.show_member_count | integer | show成员数量 |
| data.post_count | integer | 帖子数量 |
| data.show_post_count | integer | show帖子数量 |
| data.showcase_count | integer | 橱窗数量 |
| data.course_count | integer | 课程数 |
| data.owner_post_count | integer | owner帖子数量 |
| data.top_posts | array | topposts |
| data.top_posts[].id | integer | ID |
| data.top_posts[].content | string | 内容 |
| data.content_protect | integer | 内容protect |
| data.nav_config | array | nav配置 |
| data.nav_config[].type | string | 类型 |
| data.nav_config[].name | string | 名称 |
| data.nav_config[].key | string | 密钥 |
| data.nav_config[].status | integer | 状态 |
| data.nav_config[].sort | integer | 排序 |
| data.avatars | array | avatars |
| data.avatars[] | string | avatars |
| data.tags | array | tags |
| data.tags[].id | integer | ID |
| data.tags[].name | string | 名称 |
| data.tags[].sort | integer | 排序 |
| data.my_member | object | 我的成员 |
| data.my_member.role | string | role |
| data.my_member.status | integer | 状态 |
| data.my_member.expire_time | integer | 过期时间 |
| data.my_member.expire_text | string | 过期text |
| data.my_member.is_expired | integer | 是否expired |
| data.my_member.createtime | integer | 创建时间（时间戳） |
