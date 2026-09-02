# 获取我的红包记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.redpacket.getMyList` |
| 接口地址 | `POST /api/live/red_packet/getMyList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | RedPacket（直播红包 - 用户端） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `10` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/red_packet/getMyList' \
  -H 'Content-Type: application/json' \
  -d '{"page":1,"limit":10}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508198",
  "data": {
    "total": 13,
    "rows": [
      {
        "id": 273,
        "uniacid": 1,
        "redpacket_id": 241,
        "course_id": 331,
        "user_id": 38,
        "amount": "1.13",
        "is_max": 0,
        "createtime": 1785295580,
        "redpacket_type": "lucky",
        "admin_name": "admin",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
      },
      {
        "id": 272,
        "uniacid": 1,
        "redpacket_id": 240,
        "course_id": 331,
        "user_id": 38,
        "amount": "100.00",
        "is_max": 1,
        "createtime": 1785222854,
        "redpacket_type": "lucky",
        "admin_name": "liveteach",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
      },
      {
        "id": 271,
        "uniacid": 1,
        "redpacket_id": 239,
        "course_id": 331,
        "user_id": 38,
        "amount": "1.36",
        "is_max": 0,
        "createtime": 1785222813,
        "redpacket_type": "lucky",
        "admin_name": "liveteach",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
      },
      {
        "id": 270,
        "uniacid": 1,
        "redpacket_id": 238,
        "course_id": 331,
        "user_id": 38,
        "amount": "2.00",
        "is_max": 1,
        "createtime": 1785222666,
        "redpacket_type": "equal",
        "admin_name": "admin",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
      },
      {
        "id": 269,
        "uniacid": 1,
        "redpacket_id": 237,
        "course_id": 331,
        "user_id": 38,
        "amount": "1.66",
        "is_max": 0,
        "createtime": 1785222650,
        "redpacket_type": "lucky",
        "admin_name": "admin",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
      },
      {
        "id": 268,
        "uniacid": 1,
        "redpacket_id": 236,
        "course_id": 312,
        "user_id": 38,
        "amount": "11.00",
        "is_max": 1,
        "createtime": 1785131587,
        "redpacket_type": "lucky",
        "admin_name": "admin",
        "course_name": "自定义播流地址 - 竖屏直播"
      },
      {
        "id": 267,
        "uniacid": 1,
        "redpacket_id": 234,
        "course_id": 331,
        "user_id": 38,
        "amount": "9.39",
        "is_max": 0,
        "createtime": 1785118830,
        "redpacket_type": "lucky",
        "admin_name": "admin",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
      },
      {
        "id": 265,
        "uniacid": 1,
        "redpacket_id": 232,
        "course_id": 414,
        "user_id": 38,
        "amount": "0.38",
        "is_max": 0,
        "createtime": 1785112852,
        "redpacket_type": "lucky",
        "admin_name": "admin",
        "course_name": null
      },
      {
        "id": 36,
        "uniacid": 1,
        "redpacket_id": 67,
        "course_id": 331,
        "user_id": 38,
        "amount": "5.36",
        "is_max": 0,
        "createtime": 1785050388,
        "redpacket_type": "lucky",
        "admin_name": "admin",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
      },
      {
        "id": 35,
        "uniacid": 1,
        "redpacket_id": 66,
        "course_id": 331,
        "user_id": 38,
        "amount": "0.59",
        "is_max": 0,
        "createtime": 1785050312,
        "redpacket_type": "equal",
        "admin_name": "admin",
        "course_name": "自定义播流地址 - 横屏直播｜阿里云消息"
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
| data.rows | array | rows |
| data.rows[].id | integer | ID |
| data.rows[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.rows[].redpacket_id | integer | 红包ID |
| data.rows[].course_id | integer | 课程ID |
| data.rows[].user_id | integer | 用户ID |
| data.rows[].amount | string | 金额 |
| data.rows[].is_max | integer | 是否max |
| data.rows[].createtime | integer | 创建时间（时间戳） |
| data.rows[].redpacket_type | string | 红包类型 |
| data.rows[].admin_name | string | admin名称 |
| data.rows[].course_name | string | 课程名称 |
