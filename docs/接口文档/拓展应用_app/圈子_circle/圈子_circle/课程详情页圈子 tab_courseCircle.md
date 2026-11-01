# 课程详情页圈子 tab

> 课程详情页圈子 tab（课程关联的展示圈子卡片列表，一个课程可绑定多个圈子）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.courseCircle` |
| 接口地址 | `POST /api/app/circle/circle/courseCircle` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 否 | 课程ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/courseCircle' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "has_circle": 1,
    "list": [
      {
        "id": 1,
        "name": "产品运营实战圈",
        "intro": "聚焦产品与运营实战，每天分享方法、案例与行业资料，和圈友一起成长",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "member_count": 158,
        "post_count": 12,
        "sell_type": 2,
        "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"show\",\"post_preview\":\"new\",\"post_preview_num\":5}",
        "joined": 1,
        "price": "59.00",
        "show_member_count": 1,
        "show_post_count": 1,
        "is_gift": 1,
        "gift_duration_type": "month",
        "gift_duration_value": 3,
        "gift_text": "3个月"
      },
      {
        "id": 2,
        "name": "产品经理进阶训练营",
        "intro": "从需求分析到数据洞察，体系化拆解产品经理的进阶之路，限时免费开放",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "member_count": 89,
        "post_count": 6,
        "sell_type": 1,
        "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"show\",\"post_preview\":\"essence\",\"post_preview_num\":5}",
        "joined": 0,
        "price": 0,
        "show_member_count": 1,
        "show_post_count": 1,
        "is_gift": 0,
        "gift_duration_type": "",
        "gift_duration_value": 0,
        "gift_text": "与课程有效期一致"
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
| data.has_circle | integer | 是否有圈子 |
| data.list | array | 列表 |
| data.list[].id | integer | ID |
| data.list[].name | string | 名称 |
| data.list[].intro | string | 简介 |
| data.list[].cover | string | 封面图 |
| data.list[].member_count | integer | 成员数量 |
| data.list[].post_count | integer | 帖子数量 |
| data.list[].sell_type | integer | sell类型 |
| data.list[].presale_config | string | 预售配置 |
| data.list[].joined | integer | joined |
| data.list[].price | string | 价格 |
| data.list[].show_member_count | integer | show成员数量 |
| data.list[].show_post_count | integer | show帖子数量 |
| data.list[].is_gift | integer | 是否礼物 |
| data.list[].gift_duration_type | string | 礼物duration类型 |
| data.list[].gift_duration_value | integer | 礼物durationvalue |
| data.list[].gift_text | string | 礼物text |
