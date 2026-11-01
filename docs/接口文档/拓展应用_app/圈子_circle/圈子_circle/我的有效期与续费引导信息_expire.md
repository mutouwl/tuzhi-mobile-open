# 我的有效期与续费引导信息

> 黑名单成员禁止查看圈子有效期/续费信息

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.expire` |
| 接口地址 | `POST /api/app/circle/circle/expire` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | integer | 否 | 圈子ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/expire' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "member": {
      "expire_time": 1786723200,
      "expire_text": "2026-08-15",
      "is_expired": 0,
      "createtime": 1786060800
    },
    "circle": {
      "id": 1,
      "name": "产品运营实战圈",
      "sell_type": 2,
      "renew_discount": "8"
    },
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
    "stats": {
      "post_count": 3,
      "like_count": 6,
      "comment_count": 2
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
| data.member | object | 成员 |
| data.member.expire_time | integer | 过期时间 |
| data.member.expire_text | string | 过期text |
| data.member.is_expired | integer | 是否expired |
| data.member.createtime | integer | 创建时间（时间戳） |
| data.circle | object | 圈子 |
| data.circle.id | integer | ID |
| data.circle.name | string | 名称 |
| data.circle.sell_type | integer | sell类型 |
| data.circle.renew_discount | string | renewdiscount |
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
| data.stats | object | 统计数据对象 |
| data.stats.post_count | integer | 帖子数量 |
| data.stats.like_count | integer | 点赞数量 |
| data.stats.comment_count | integer | 评论数量 |
