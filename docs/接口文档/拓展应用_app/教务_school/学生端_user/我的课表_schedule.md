# 我的课表

> 按学生 + 日期范围查课次（默认本周一共 7 天），可按课程筛选、可只取可请假课次，逐行下发签到与消课两维状态及可操作标记。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.schedule` |
| 接口地址 | `POST /api/app/school/user/schedule` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| start_date | string | 否 | 起始日期 Y-m-d，默认本周周一 | `2026-09-21` |
| end_date | string | 否 | 结束日期 Y-m-d，默认起始日期 +6 天 | `2026-09-27` |
| course_id | integer | 否 | 课程筛选，0=全部课程 | `0` |
| can_leave | integer | 否 | 1=只返回可请假课次（判定条件下推 SQL，保证分页与总数一致） | `0` |
| page | integer | 否 | 页码；0 或不传表示不分页（返回范围内全部） | `0` |
| limit | integer | 否 | 每页数量，默认 20（1~100） | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/schedule' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"start_date":"2026-09-21","end_date":"2026-09-27","course_id":0,"can_leave":0,"page":0,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980028",
  "data": {
    "list": [
      {
        "id": 9820,
        "schedule_id": 8709,
        "lessons": "1.00",
        "sign_time": 1789890895,
        "verify_status": 1,
        "account_id": 1748,
        "leave_id": 0,
        "lesson_date": 1789833600,
        "start_time": "18:00",
        "end_time": "20:00",
        "start_ts": 1789898400,
        "end_ts": 1789905600,
        "type": 1,
        "course_id": 2675,
        "campus_id": 1994,
        "user_remark": "",
        "course_name": "计算机算法结构课程一对一",
        "class_name": "刘洋-计算机算法结构课程一对一",
        "campus_name": "山东大学",
        "classroom_name": "",
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
        "student_name": "刘**",
        "schedule_id_num": 8709,
        "date_text": "2026-09-20 周日",
        "status_text": "已签到",
        "sign_status_text": "已签到",
        "consume_status_text": "已消课",
        "list_status_text": "已消课",
        "consume_pending": 0,
        "can_sign": false,
        "can_leave": false
      },
      {
        "id": 9831,
        "schedule_id": 8728,
        "lessons": "1.00",
        "sign_time": 1789891085,
        "verify_status": 1,
        "account_id": 1747,
        "leave_id": 0,
        "lesson_date": 1789833600,
        "start_time": "18:00",
        "end_time": "20:00",
        "start_ts": 1789898400,
        "end_ts": 1789905600,
        "type": 1,
        "course_id": 2676,
        "campus_id": 1994,
        "user_remark": "",
        "course_name": "计算机算法结构课程一对多",
        "class_name": "算法结构一对多",
        "campus_name": "山东大学",
        "classroom_name": "计算机学院",
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
        "student_name": "刘**",
        "schedule_id_num": 8728,
        "date_text": "2026-09-20 周日",
        "status_text": "已签到",
        "sign_status_text": "已签到",
        "consume_status_text": "已消课",
        "list_status_text": "已消课",
        "consume_pending": 0,
        "can_sign": false,
        "can_leave": false
      }
    ],
    "has_more": false,
    "allow_leave": true,
    "student_sign": true,
    "course_options": [
      {
        "id": 0,
        "name": "全**"
      },
      {
        "id": 2675,
        "name": "计**",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/6edaf6c84972ddde4a1bf2c0d466c08d.png",
        "intro": "学会计算机",
        "is_one_to_one": 1,
        "type_text": "一对一"
      },
      {
        "id": 2676,
        "name": "计**",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "intro": "",
        "is_one_to_one": 0,
        "type_text": "一对多"
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
| data.list | array | 课次列表（按上课日期、开始时间升序） |
| data.list[].id | integer | 学员课次ID（签到/请假用） |
| data.list[].schedule_id | integer | 课次ID |
| data.list[].lessons | string | 本节扣课时 |
| data.list[].sign_time | integer | 签到时间（0=未签到） |
| data.list[].verify_status | integer | 点名状态：0未签到 1已签到 2消课失败 3请假 4未到 |
| data.list[].account_id | integer | 课时账户ID（消课状态派生用） |
| data.list[].leave_id | integer | 请假单ID（0=无在途请假） |
| data.list[].lesson_date | integer | 上课日期（当天 0 点时间戳） |
| data.list[].start_time | string | 开始时间 HH:MM |
| data.list[].end_time | string | 结束时间 HH:MM |
| data.list[].start_ts | integer | 开始时间戳 |
| data.list[].end_ts | integer | 结束时间戳（0=未设置） |
| data.list[].type | integer | 排课类型：1正常上课 2补课 |
| data.list[].course_id | integer | 课程ID |
| data.list[].campus_id | integer | 校区ID（跳校区详情用） |
| data.list[].user_remark | string | 学员端备注 |
| data.list[].course_name | string | 课程名称 |
| data.list[].class_name | string | 班级名称 |
| data.list[].campus_name | string | 校区名称 |
| data.list[].classroom_name | string | 教室名称（无需教室时为空串） |
| data.list[].teachers | array | 授课老师列表 |
| data.list[].teachers[].id | integer | 老师ID |
| data.list[].teachers[].name | string | 老师姓名 |
| data.list[].teachers[].role | integer | 角色：1主讲 2助教 |
| data.list[].teachers[].avatar | string | 老师头像 |
| data.list[].teachers[].intro | string | 老师简介 |
| data.list[].main_teacher | string | 主讲老师姓名（多人用、拼接） |
| data.list[].student_name | string | 学生姓名 |
| data.list[].schedule_id_num | integer | 课次ID（数值，与 schedule_id 同值，兼容旧字段） |
| data.list[].date_text | string | 上课日期（Y-m-d 周X） |
| data.list[].status_text | string | 课次状态文案（单列口径：已签到/请假中/请假/未到/待上课） |
| data.list[].sign_status_text | string | 签到维文案 |
| data.list[].consume_status_text | string | 消课维文案 |
| data.list[].list_status_text | string | 列表角标文案（签到与消课两维合并，前端直接展示） |
| data.list[].consume_pending | integer | 是否待消课：1=已签到但机构未确认扣课时 |
| data.list[].can_sign | boolean | 本节当前是否可签到（设置开关 + 状态 + 签到时间窗） |
| data.list[].can_leave | boolean | 本节当前是否可请假 |
| data.has_more | boolean | 是否还有下一页（不分页时恒为 false） |
| data.allow_leave | boolean | 机构是否开启学生请假（false 时前端隐藏请假按钮） |
| data.student_sign | boolean | 机构是否开启学生签到（false 时用于解释签到按钮置灰） |
| data.course_options | array | 课程筛选选项（含首项「全部课程」id=0） |
| data.course_options[].id | integer | 课程ID，0=全部课程 |
| data.course_options[].name | string | 课程名称 |

## 备注

- 学生不属于当前用户时返回 code=0「学生不存在」
- 签到可用条件：教务设置 student_sign=1、未签到未核销、且落在签到时间窗内（窗口由「消课设置-学生签到规则」决定：不限制=课次当天至结束，限制=开始前 N 小时至结束后 N 小时）
- 可请假条件：allow_leave=1、未核销未签到、无未撤回/未拒绝的请假单、未过课次结束时间、未到「开课前 N 小时」停止请假线（leave_stop_hours）
- leave_id 有值表示该课次已在请假流程中，移动端把「请假」按钮改为进请假详情，同时 can_leave 置 false
- 排序补 ss.id 兜底：同日同时刻的课次排序值相同，仅按时间翻页会重复或漏行
- course_options 与列表一起下发（不再另开接口）：列表按课程筛选后选项仍是完整课程集合，用户可随时切回「全部课程」
