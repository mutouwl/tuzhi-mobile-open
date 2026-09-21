# 可预约场次

> 学生端「预约上课」列表：只在该学生已报名的课程内取开放预约的课次，含剩余名额、是否已约、不可约原因与日历角标。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.bookable` |
| 接口地址 | `POST /api/app/school/user/bookable` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| start_date | string | 否 | 列表起始日期 Y-m-d（学生端按天翻页时传选中当天），默认今天 | `2026-09-21` |
| end_date | string | 否 | 列表结束日期 Y-m-d，默认起始日期 +6 天 | `2026-09-27` |
| counts_start_date | string | 否 | 日历角标统计起始日期（整周），默认同 start_date | - |
| counts_end_date | string | 否 | 日历角标统计结束日期，默认同 end_date | - |
| course_id | integer | 否 | 课程筛选，0=全部课程（从课时余额页按课程进入时必带，角标与列表才对齐） | `0` |
| page | integer | 否 | 页码；0 或不传表示不分页（一次给完），下拉加载时传页码 | `0` |
| limit | integer | 否 | 每页数量，默认 10（最大 50） | `10` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/bookable' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"start_date":"2026-09-21","end_date":"2026-09-27","counts_start_date":"xxx","counts_end_date":"xxx","course_id":0,"page":0,"limit":10}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980033",
  "data": {
    "list": [
      {
        "id": 8728,
        "lesson_date": 1789833600,
        "start_time": "18:00",
        "end_time": "20:00",
        "start_ts": 1789898400,
        "end_ts": 1789905600,
        "lessons": "1.00",
        "capacity": 0,
        "booked_count": 1,
        "is_booking": 1,
        "booking_rule": "",
        "course_id": 2676,
        "campus_id": 1994,
        "classroom_id": 738,
        "course_name": "计算机算法结构课程一对多",
        "course_cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "course_intro": "",
        "course_is_one_to_one": 0,
        "campus_name": "山东大学",
        "class_name": "算法结构一对多",
        "classroom_name": "计算机学院",
        "date_text": "2026-09-20",
        "teachers": [
          {
            "id": 1944,
            "name": "李**",
            "role": 1,
            "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
            "intro": "计算机老师"
          }
        ],
        "main_teacher": "李老师",
        "joined_count": 0,
        "remain_seat": 0,
        "unlimited_seat": true,
        "remain_lessons": 9,
        "booked": true,
        "can_book": false,
        "reason": "已上课",
        "schedule_student_id": 9831
      }
    ],
    "total": 1,
    "has_more": false,
    "day_counts": {
      "2026-09-20": 1
    },
    "enrolled_course_count": 2
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 候选课次列表（含不可约的置灰行） |
| data.list[].id | integer | 课次ID（提交预约时传 schedule_id） |
| data.list[].lesson_date | integer | 上课日期（当天 0 点时间戳） |
| data.list[].start_time | string | 开始时间 HH:MM |
| data.list[].end_time | string | 结束时间 HH:MM |
| data.list[].start_ts | integer | 开始时间戳 |
| data.list[].end_ts | integer | 结束时间戳 |
| data.list[].lessons | string | 本节消耗课时 |
| data.list[].capacity | integer | 可约名额（0=不限） |
| data.list[].booked_count | integer | 已占用名额（含待确认与已确认） |
| data.list[].is_booking | integer | 该课次是否开放预约：1是 |
| data.list[].booking_rule | string | 课次级预约规则 JSON（空为继承店铺统一规则） |
| data.list[].course_id | integer | 课程ID |
| data.list[].campus_id | integer | 校区ID |
| data.list[].classroom_id | integer | 教室ID（0=无需教室） |
| data.list[].course_name | string | 课程名称 |
| data.list[].course_cover | string | 课程封面 |
| data.list[].course_intro | string | 课程简介 |
| data.list[].course_is_one_to_one | integer | 课程类型数值 |
| data.list[].campus_name | string | 校区名称 |
| data.list[].class_name | string | 班级名称 |
| data.list[].classroom_name | string | 教室名称（无需教室时为空串） |
| data.list[].date_text | string | 上课日期（Y-m-d） |
| data.list[].teachers | array | 授课老师（含角色 1主讲 2助教） |
| data.list[].teachers[].id | integer | ID |
| data.list[].teachers[].name | string | 名称 |
| data.list[].teachers[].role | integer | role |
| data.list[].teachers[].avatar | string | 头像 |
| data.list[].teachers[].intro | string | 简介 |
| data.list[].main_teacher | string | 主讲老师姓名（多人用、拼接） |
| data.list[].joined_count | integer | 该场次已参加人数 |
| data.list[].remain_seat | integer | 剩余名额（不限名额时为 0） |
| data.list[].unlimited_seat | boolean | 是否不限名额 |
| data.list[].remain_lessons | integer | 该学生本课程的剩余课时 |
| data.list[].booked | boolean | 本人是否已预约/已在该场次 |
| data.list[].can_book | boolean | 本场次当前是否可预约（false 时前端置灰） |
| data.list[].reason | string | 不可约原因文案（含名额、课时、时间、规则限制等） |
| data.list[].schedule_student_id | integer | 本人在该场次的学员课次ID（0=本人不在该场次，不可直达课次详情） |
| data.total | integer | 候选场次总数（分页时为筛选后总数） |
| data.has_more | boolean | 是否还有下一页（不分页时恒为 false） |
| data.day_counts | object | 「日期 => 当天列表条数」映射（日历角标，JSON 对象） |
| data.day_counts.2026-09-20 | integer | 20260920 |
| data.enrolled_course_count | integer | 该学生已报名的课程数（0=没有可约场次，空态应说「还没有报名课程」） |

## 备注

- 候选课次只在该学生已开通课时的课程内取（口径统一走 LedgerService::studentCourseIds），未报名任何课程时列表为空
- 不可约的场次同样在列表里（前端按 can_book 置灰并用 reason 说明），day_counts 数的就是这一整套候选场次，与点进去看到的条数一致
- 学生端按天翻页：列表传 start_date/end_date 为选中当天，日历角标另传 counts_start_date/counts_end_date 为整周（同一套筛选条件）
- 排序 lesson_date asc → start_ts asc
