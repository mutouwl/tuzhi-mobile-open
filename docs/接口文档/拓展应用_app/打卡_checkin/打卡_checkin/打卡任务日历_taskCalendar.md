# 打卡任务日历

> 闯关打卡的任务日历：统计、红点日期与某日任务清单和本人打卡状态一次下发。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.taskCalendar` |
| 接口地址 | `POST /api/app/checkin/checkin/taskCalendar` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/taskCalendar' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344785",
  "data": {
    "title": "name",
    "cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "nickname": "冯**",
    "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
    "nickname_max": 30,
    "today": "2026-10-07",
    "joined_at": 1790247653,
    "done": 1,
    "undone": 0,
    "month_done": 0,
    "red_dots": [
      "2026-09-27"
    ],
    "tasks": [
      {
        "id": 579,
        "title": "123",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 1,
        "done": 1,
        "locked": 0,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "done",
        "check_text": "已打卡",
        "check_msg": "今日已完成该任务",
        "user_count": 2
      },
      {
        "id": 15222,
        "title": "副本-章节1任务1",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 2,
        "done": 1,
        "locked": 0,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "done",
        "check_text": "已打卡",
        "check_msg": "今日已完成该任务",
        "user_count": 2
      },
      {
        "id": 6785,
        "title": "章节1任务1",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 3,
        "done": 1,
        "locked": 0,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "done",
        "check_text": "已打卡",
        "check_msg": "今日已完成该任务",
        "user_count": 2
      },
      {
        "id": 1925,
        "title": "副本-123",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 4,
        "done": 0,
        "locked": 0,
        "released": 1,
        "can_makeup": 0,
        "can_check": 1,
        "check_state": "",
        "check_text": "",
        "check_msg": "",
        "user_count": 1
      },
      {
        "id": 1926,
        "title": "副本-123",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 5,
        "done": 0,
        "locked": 1,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "locked",
        "check_text": "未解锁",
        "check_msg": "请先完成第 4 关的打卡",
        "user_count": 1
      },
      {
        "id": 6786,
        "title": "账务4",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 6,
        "done": 1,
        "locked": 0,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "done",
        "check_text": "已打卡",
        "check_msg": "今日已完成该任务",
        "user_count": 2
      },
      {
        "id": 3884,
        "title": "任务标题",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 7,
        "done": 1,
        "locked": 0,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "done",
        "check_text": "已打卡",
        "check_msg": "今日已完成该任务",
        "user_count": 2
      },
      {
        "id": 16401,
        "title": "批量创建任务",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 8,
        "done": 0,
        "locked": 1,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "locked",
        "check_text": "未解锁",
        "check_msg": "请先完成第 4 关的打卡",
        "user_count": 1
      },
      {
        "id": 16402,
        "title": "批量创建任务",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 9,
        "done": 0,
        "locked": 1,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "locked",
        "check_text": "未解锁",
        "check_msg": "请先完成第 4 关的打卡",
        "user_count": 1
      },
      {
        "id": 23458,
        "title": "多个打卡任务",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 10,
        "done": 0,
        "locked": 1,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "locked",
        "check_text": "未解锁",
        "check_msg": "请先完成第 4 关的打卡",
        "user_count": 0
      },
      {
        "id": 23459,
        "title": "多个打卡任务",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 11,
        "done": 0,
        "locked": 1,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "locked",
        "check_text": "未解锁",
        "check_msg": "请先完成第 4 关的打卡",
        "user_count": 0
      },
      {
        "id": 23460,
        "title": "多个打卡任务",
        "day": "2026-09-27",
        "start_time": 1790438400,
        "end_time": 2105884799,
        "show_time": 0,
        "level": 12,
        "done": 0,
        "locked": 1,
        "released": 1,
        "can_makeup": 0,
        "can_check": 0,
        "check_state": "locked",
        "check_text": "未解锁",
        "check_msg": "请先完成第 4 关的打卡",
        "user_count": 0
      }
    ],
    "my_days": {
      "2026-09-24": 1,
      "2026-09-25": 3,
      "2026-09-26": 1,
      "2026-09-27": 1,
      "2026-09-28": 1
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
| data.title | string | 标题 |
| data.cover | string | 封面图 |
| data.nickname | string | 昵称 |
| data.avatar | string | 头像 |
| data.nickname_max | integer | 打卡昵称长度上限（前端输入框以接口为准，不写死） |
| data.today | string | 今天日期（Y-m-d，服务端时刻，前端不自己取） |
| data.joined_at | integer | 我的加入时刻时间戳（红点序列起点） |
| data.done | integer | 有效日期里「当天有任务且我已打卡」的天数 |
| data.undone | integer | 有效日期里「当天有任务但截至今天还没打卡」的天数 |
| data.month_done | integer | 本月内我打过卡的天数（只算有效日期） |
| data.red_dots | array | 要打卡的日期数组（Y-m-d；扣掉休息日、当天有任务即计入，不区分打过没打过） |
| data.red_dots[] | string | 要打卡的日期数组（Y-m-d；扣掉休息日、当天有任务即计入，不区分打过没打过） |
| data.tasks | array | 任务数组 |
| data.tasks[].id | integer | ID |
| data.tasks[].title | string | 标题 |
| data.tasks[].day | string | 天数 |
| data.tasks[].start_time | integer | 开始时间 |
| data.tasks[].end_time | integer | 结束时间 |
| data.tasks[].show_time | integer | 1=卡片要摆「起 至 止」时间行 / 0=不摆（闯关模式的起止是宽窗口底座） |
| data.tasks[].level | integer | 等级 |
| data.tasks[].done | integer | 已完成档：任务行 1=本人这一格已打卡；日历段为已完成条数 |
| data.tasks[].locked | integer | 1=未解锁（上一关未完成，或未到放量时刻） |
| data.tasks[].released | integer | 1=频率已放量到本任务（活动未启用按周期频率时恒 1，不能当成「都没解锁」） |
| data.tasks[].can_makeup | integer | 1=待补卡（未打、未锁、目标日早于今天、活动未结束且还有补卡次数） |
| data.tasks[].can_check | integer | 1=此刻闸门放行可打卡（按钮不置灰，点击给原因） |
| data.tasks[].check_state | string | 打卡闸门状态：空串=放行 / not_started=未开始 / ended=已截止 / rest_day=今日休息 / out_of_slot=不在时段 / invalid_slot=时段无交集 / daily_limit=次数已满 / locked=未解锁 / done=已打卡 / makeup=待补卡 / closed=发布总闸关闭 |
| data.tasks[].check_text | string | 闸门状态的右上角中文标签，放行态与总闸关闭档都是空串 |
| data.tasks[].check_msg | string | 点这张卡时的提示语与提交报错同一句话（含具体时间），放行时为空串 |
| data.tasks[].user_count | integer | 用户数量 |
| data.my_days | object | 我各日打卡条数映射 {Y-m-d: 条数}，判红点深浅用，与 done 的「日+任务」判据不同轴 |
| data.my_days.2026-09-24 | integer | 20260924 |
| data.my_days.2026-09-25 | integer | 20260925 |
| data.my_days.2026-09-26 | integer | 20260926 |
| data.my_days.2026-09-27 | integer | 20260927 |
| data.my_days.2026-09-28 | integer | 20260928 |
