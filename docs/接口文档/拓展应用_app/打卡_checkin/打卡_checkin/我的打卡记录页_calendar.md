# 我的打卡记录页

> 统计卡 + 月历高亮 + 已加入天数；带 user_id 就是看该学员的，判据与某日详情共用 CheckinBase::viewTarget。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.calendar` |
| 接口地址 | `POST /api/app/checkin/checkin/calendar` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| user_id | integer | 否 | 被查看学员的用户 ID，缺省为本人 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/calendar' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"user_id":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344784",
  "data": {
    "title": "name",
    "cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "nickname": "冯**",
    "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
    "nickname_max": 30,
    "masked": 0,
    "stats": {
      "diary": 7,
      "featured": 1,
      "liked": 4,
      "total": 5,
      "streak": 0
    },
    "days": {
      "2026-09-24": 1,
      "2026-09-25": 3,
      "2026-09-26": 1,
      "2026-09-27": 1,
      "2026-09-28": 1
    },
    "joined_days": 13,
    "own_start": "2026-09-24",
    "own_end": "2026-10-20",
    "makeup_left": 0,
    "owner_id": 38,
    "is_self": 1
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
| data.nickname | string | 昵称 |
| data.avatar | string | 头像 |
| data.nickname_max | integer | 打卡昵称长度上限（前端输入框以接口为准，不写死） |
| data.masked | integer | 跨组遮蔽标记：1=人照给但内容一概不取，那一句原因走 masked_msg |
| data.stats | object | 统计卡五格；跨组遮蔽档整块不下发（不留 0 占位） |
| data.stats.diary | integer | 该学员在本活动的动态条数（软删不计，看别人时只算所有人可见的） |
| data.stats.featured | integer | 其中被设为精选的条数 |
| data.stats.liked | integer | 获赞总数（各条 like_count 求和） |
| data.stats.total | integer | 累计打卡天数（按 day 去重） |
| data.stats.streak | integer | 连续打卡天数（今天没打不算断，从昨天起算） |
| data.days | object | 月历红点用的映射 {Y-m-d: 当日条数}，只含有动态的日期 |
| data.days.2026-09-24 | integer | 20260924 |
| data.days.2026-09-25 | integer | 20260925 |
| data.days.2026-09-26 | integer | 20260926 |
| data.days.2026-09-27 | integer | 20260927 |
| data.days.2026-09-28 | integer | 20260928 |
| data.joined_days | integer | 已加入 N 天（从加入当天含当日，与活动窗口无关） |
| data.own_start | string | 我的个人打卡窗起始日（Y-m-d） |
| data.own_end | string | 我的个人打卡窗截止日（Y-m-d）；活动「结束不限」时是哨兵值 9999-12-31，界面别直接摆出来 |
| data.makeup_left | integer | 剩余可补卡次数（活动总次数减已提交的补卡动态，实时算） |
| data.owner_id | integer | 这一页记录归属的学员用户ID |
| data.is_self | integer | 1=看的是自己的记录页 / 0=带 user_id 看别人（含跨组遮蔽） |

## 备注

- 未参与（含被拉黑）时先听到原因句：被拉黑回「已被主办方移出本活动」，其余回「请先参与打卡」
