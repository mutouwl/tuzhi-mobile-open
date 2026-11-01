# 打卡成员列表

> 活动主页「更多 → 成员」那一屏，支持按昵称/手机号关键词搜索与正反序切换。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.memberList` |
| 接口地址 | `POST /api/app/checkin/checkin/memberList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 20 | - |
| keyword | string | 否 | 成员昵称或账号关键词 | - |
| order | string | 否 | 排序方向：desc=打卡天数多在前（缺省）/ asc=反之 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/memberList' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"page":"xxx","limit":"xxx","keyword":"xxx","order":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344786",
  "data": {
    "title": "name",
    "cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "total": 4,
    "rows": [
      {
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "streak": 0,
        "join_time": 1790288916
      },
      {
        "user_id": 1000003992,
        "nickname": "莎**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/PiajxSqBRaEITnAXTIuVibaibNPhNXhRv5pZsL5q5Dclx2S3qAYbT8rA3TWqichUibIlPVKDStNnvZuibjSbaDydqEHcbDW1TTHOrWAqnicVUTGbT9glyEzsNptkg/132",
        "streak": 0,
        "join_time": 1790256641
      },
      {
        "user_id": 38,
        "nickname": "冯**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "streak": 0,
        "join_time": 1790247653
      },
      {
        "user_id": 1000003993,
        "nickname": "D**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/PiajxSqBRaELTVwA9Qry7j8ydfDmVvqykOjRAEQkBOyibahjJNHH7jcUGDKluKhqAU1J437smJMyiaXNMnLibRj6WPsAC5BuTk2kT97ozTR23aZd8jFOFPXGBQ/132",
        "streak": 0,
        "join_time": 1790246239
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
| data.title | string | 标题 |
| data.cover | string | 封面图 |
| data.total | integer | 合计 |
| data.rows | array | 本页数据行数组 |
| data.rows[].user_id | integer | 用户ID |
| data.rows[].nickname | string | 昵称 |
| data.rows[].avatar | string | 头像 |
| data.rows[].streak | integer | 连续打卡天数（从今天往前数，今天没打不算断、从昨天起算） |
| data.rows[].join_time | integer | 成员加入时刻时间戳 |
