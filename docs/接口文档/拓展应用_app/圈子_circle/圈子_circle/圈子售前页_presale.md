# 圈子售前页

> 规格列表（仅启用，按排序）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.presale` |
| 接口地址 | `POST /api/app/circle/circle/presale` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/presale' \
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
    "detail": "<p>这里是圈子的详细介绍，涵盖圈子的定位、权益与更新安排。</p><p>加入后你将获得：每周行业拆解直播、会员专属资料库、实战案例复盘与圈友一对一答疑。</p>",
    "sell_type": 2,
    "single_sell": 0,
    "renew_discount": "8",
    "member_count": 158,
    "show_member_count": 1,
    "member_limit": 0,
    "is_full": 0,
    "post_count": 12,
    "show_post_count": 1,
    "createtime": 1786060800,
    "content_protect": 0,
    "specs": [
      {
        "id": 201,
        "circle_id": 1,
        "name": "1个月",
        "price": "59.00",
        "marking_price": "99.00",
        "duration_type": "month",
        "duration_value": 1,
        "duration_text": "1个月",
        "status": 1,
        "sort": 1,
        "createtime": 1786060800,
        "updatetime": 1786060800
      },
      {
        "id": 202,
        "circle_id": 1,
        "name": "3个月",
        "price": "129.00",
        "marking_price": "199.00",
        "duration_type": "month",
        "duration_value": 3,
        "duration_text": "3个月",
        "status": 1,
        "sort": 2,
        "createtime": 1786060800,
        "updatetime": 1786060800
      },
      {
        "id": 203,
        "circle_id": 1,
        "name": "1年",
        "price": "299.00",
        "marking_price": "499.00",
        "duration_type": "year",
        "duration_value": 1,
        "duration_text": "1年",
        "status": 1,
        "sort": 3,
        "createtime": 1786060800,
        "updatetime": 1786060800
      }
    ],
    "posts": [
      {
        "id": 102,
        "user_id": 1002,
        "post_type": "image",
        "content": "今天的运营日报整理了 20 个老带新裂变玩法，需要的自取 #运营干货#",
        "media": {
          "media_type": "image",
          "images": [
            "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg"
          ]
        },
        "comment_count": 1,
        "like_count": 4,
        "view_count": 66,
        "createtime": 1786492800,
        "nickname": "学员小李",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "is_owner": 0,
        "tags": [
          {
            "id": 302,
            "name": "每日打卡"
          }
        ]
      },
      {
        "id": 101,
        "user_id": 1001,
        "post_type": "text",
        "content": "【圈公告】欢迎大家加入产品运营实战圈。每周日下午 17:00 会更新一期行业拆解直播，资料放在课程 tab，有问题随时发帖提问。",
        "comment_count": 2,
        "like_count": 8,
        "view_count": 132,
        "createtime": 1786060800,
        "nickname": "圈主小美",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "is_owner": 1,
        "tags": [
          {
            "id": 301,
            "name": "运营干货"
          }
        ]
      }
    ],
    "join_status": "none",
    "can_join_free": 0,
    "member": null,
    "drain_config": {
      "before_qrcode": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg"
    },
    "is_virtual_pay": 0,
    "is_banned": 0,
    "ban_text": ""
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
| data.detail | string | 详情 |
| data.sell_type | integer | sell类型 |
| data.single_sell | integer | singlesell |
| data.renew_discount | string | renewdiscount |
| data.member_count | integer | 成员数量 |
| data.show_member_count | integer | show成员数量 |
| data.member_limit | integer | 成员limit |
| data.is_full | integer | 是否full |
| data.post_count | integer | 帖子数量 |
| data.show_post_count | integer | show帖子数量 |
| data.createtime | integer | 创建时间（时间戳） |
| data.content_protect | integer | 内容protect |
| data.specs | array | specs |
| data.specs[].id | integer | ID |
| data.specs[].circle_id | integer | 圈子ID |
| data.specs[].name | string | 名称 |
| data.specs[].price | string | 价格 |
| data.specs[].marking_price | string | marking价格 |
| data.specs[].duration_type | string | duration类型 |
| data.specs[].duration_value | integer | durationvalue |
| data.specs[].duration_text | string | durationtext |
| data.specs[].status | integer | 状态 |
| data.specs[].sort | integer | 排序 |
| data.specs[].createtime | integer | 创建时间（时间戳） |
| data.specs[].updatetime | integer | 更新时间（时间戳） |
| data.posts | array | posts |
| data.posts[].id | integer | ID |
| data.posts[].user_id | integer | 用户ID |
| data.posts[].post_type | string | 帖子类型 |
| data.posts[].content | string | 内容 |
| data.posts[].media | object | 媒体 |
| data.posts[].media.media_type | string | 媒体类型 |
| data.posts[].media.images | array | 图片地址数组 |
| data.posts[].media.images[] | string | 图片地址数组 |
| data.posts[].comment_count | integer | 评论数量 |
| data.posts[].like_count | integer | 点赞数量 |
| data.posts[].view_count | integer | view数量 |
| data.posts[].createtime | integer | 创建时间（时间戳） |
| data.posts[].nickname | string | 昵称 |
| data.posts[].avatar | string | 头像 |
| data.posts[].is_owner | integer | 是否本人 |
| data.posts[].tags | array | tags |
| data.posts[].tags[].id | integer | ID |
| data.posts[].tags[].name | string | 名称 |
| data.join_status | string | 加入状态 |
| data.can_join_free | integer | 是否可加入free |
| data.member | null | 成员 |
| data.drain_config | object | drain配置 |
| data.drain_config.before_qrcode | string | 购买前二维码 |
| data.is_virtual_pay | integer | 是否虚拟支付 |
| data.is_banned | integer | 是否banned |
| data.ban_text | string | 禁止text |
