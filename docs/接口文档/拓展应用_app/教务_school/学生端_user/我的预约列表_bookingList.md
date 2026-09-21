# 我的预约列表

> 学生自己的全部预约记录（含未通过与已取消），可按状态页签与上课日期范围筛选并分页。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.bookingList` |
| 接口地址 | `POST /api/app/school/user/bookingList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| status | integer | 否 | 状态页签：-1全部（默认）、0待确认、1待上课、2已上课、3已取消 | `-1` |
| page | integer | 否 | 页码，默认 1 | `1` |
| limit | integer | 否 | 每页数量，默认 20（最大 100） | `20` |
| start_time | integer | 否 | 按课次上课日期起（秒级时间戳），0=不限 | `0` |
| end_time | integer | 否 | 按课次上课日期止（秒级时间戳），0=不限 | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/bookingList' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"status":-1,"page":1,"limit":20,"start_time":0,"end_time":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980035",
  "data": {
    "list": [
      {
        "id": 1282,
        "uniacid": 1,
        "user_id": 38,
        "student_id": 3619,
        "schedule_id": 8728,
        "schedule_student_id": 9831,
        "course_id": 2676,
        "booking_date": 1789833600,
        "lessons": "1.00",
        "status": 2,
        "source": 2,
        "cancel_source": 0,
        "cancel_reason": "",
        "contact_name": "刘**",
        "contact_phone": "187****4234",
        "confirm_admin_id": 0,
        "confirm_time": 1789891051,
        "remark": "",
        "admin_remark": "",
        "deleted": 0,
        "createtime": 1789891051,
        "updatetime": 1789891085,
        "student_name": "刘**",
        "student_avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "student_phone": "187****4234",
        "student_gender": 1,
        "course_name": "计算机算法结构课程一对多",
        "course_cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "course_intro": "",
        "course_is_one_to_one": 0,
        "lesson_date": 1789833600,
        "start_time": "18:00",
        "end_time": "20:00",
        "schedule_lessons": "1.00",
        "campus_id": 1994,
        "class_id": 1947,
        "classroom_id": 738,
        "campus_name": "山东大学",
        "class_name": "算法结构一对多",
        "classroom_name": "计算机学院",
        "date_text": "2026-09-20",
        "teachers": [
          {
            "id": 1944,
            "teacher_id": 1944,
            "name": "李**",
            "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
            "phone": "187****8778",
            "gender": 1,
            "intro": "计算机老师",
            "role": 1
          }
        ],
        "main_teacher": "李老师",
        "main_teacher_list": [
          {
            "id": 1944,
            "teacher_id": 1944,
            "name": "李**",
            "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
            "phone": "187****8778",
            "gender": 1,
            "intro": "计算机老师",
            "role": 1
          }
        ],
        "assistant_teacher": "",
        "status_text": "已上课",
        "source_text": "线上预约",
        "createtime_text": "2026-09-20 15:57:31",
        "confirm_time_text": "2026-09-20 15:57:31",
        "cancel_allowed": false
      }
    ],
    "has_more": false,
    "total": 1
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 预约单列表 |
| data.list[].id | integer | 预约单ID |
| data.list[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.list[].user_id | integer | 用户ID |
| data.list[].student_id | integer | 学生（学员）ID |
| data.list[].schedule_id | integer | 课次ID |
| data.list[].schedule_student_id | integer | 学员课次ID（0=尚未落定到课次） |
| data.list[].course_id | integer | 课程ID（预约时快照） |
| data.list[].booking_date | integer | 预约日期 |
| data.list[].lessons | string | 课时 |
| data.list[].status | integer | 状态：0待确认 1待上课 2已上课 3已取消 |
| data.list[].source | integer | 来源：1后台手动录入 2线上预约 |
| data.list[].cancel_source | integer | 取消来源：0未取消 1后台取消 2学员取消 |
| data.list[].cancel_reason | string | 取消原因（机构取消时展示机构填写的原因） |
| data.list[].contact_name | string | 联系人姓名 |
| data.list[].contact_phone | string | 联系人手机号 |
| data.list[].confirm_admin_id | integer | confirmadminID |
| data.list[].confirm_time | integer | confirm时间 |
| data.list[].remark | string | 学员备注 |
| data.list[].admin_remark | string | adminremark |
| data.list[].deleted | integer | deleted |
| data.list[].createtime | integer | 创建时间（时间戳） |
| data.list[].updatetime | integer | 更新时间（时间戳） |
| data.list[].student_name | string | 学生姓名 |
| data.list[].student_avatar | string | 学生头像 |
| data.list[].student_phone | string | 学生手机号 |
| data.list[].student_gender | integer | 学生性别：1男 2女 |
| data.list[].course_name | string | 课程名称 |
| data.list[].course_cover | string | 课程封面 |
| data.list[].course_intro | string | 课程简介 |
| data.list[].course_is_one_to_one | integer | 课程类型数值 |
| data.list[].lesson_date | integer | 上课日期（当天 0 点时间戳） |
| data.list[].start_time | string | 开始时间 HH:MM |
| data.list[].end_time | string | 结束时间 HH:MM |
| data.list[].schedule_lessons | string | 课次消耗课时 |
| data.list[].campus_id | integer | 校区ID |
| data.list[].class_id | integer | 班级ID |
| data.list[].classroom_id | integer | 教室ID（0=无需教室） |
| data.list[].campus_name | string | 校区名称 |
| data.list[].class_name | string | 班级名称 |
| data.list[].classroom_name | string | 教室名称 |
| data.list[].date_text | string | 上课日期（Y-m-d） |
| data.list[].teachers | array | 授课老师（含完整资料） |
| data.list[].teachers[].id | integer | ID |
| data.list[].teachers[].teacher_id | integer | 老师ID |
| data.list[].teachers[].name | string | 名称 |
| data.list[].teachers[].avatar | string | 头像 |
| data.list[].teachers[].phone | string | 电话 |
| data.list[].teachers[].gender | integer | 性别 |
| data.list[].teachers[].intro | string | 简介 |
| data.list[].teachers[].role | integer | role |
| data.list[].main_teacher | string | 主讲老师姓名（多人用、拼接） |
| data.list[].main_teacher_list | array | 主讲老师完整资料（头像/姓名/手机号/性别/简介） |
| data.list[].main_teacher_list[].id | integer | ID |
| data.list[].main_teacher_list[].teacher_id | integer | 老师ID |
| data.list[].main_teacher_list[].name | string | 名称 |
| data.list[].main_teacher_list[].avatar | string | 头像 |
| data.list[].main_teacher_list[].phone | string | 电话 |
| data.list[].main_teacher_list[].gender | integer | 性别 |
| data.list[].main_teacher_list[].intro | string | 简介 |
| data.list[].main_teacher_list[].role | integer | role |
| data.list[].assistant_teacher | string | 助教姓名（多人用、拼接） |
| data.list[].status_text | string | 学生端状态文案：待确认 / 待上课 / 已上课 / 未通过 / 机构取消 / 已取消 |
| data.list[].source_text | string | 来源文案 |
| data.list[].createtime_text | string | 提交时间（Y-m-d H:i:s） |
| data.list[].confirm_time_text | string | 机构确认时间（Y-m-d H:i:s） |
| data.list[].cancel_allowed | boolean | 本条是否允许取消（服务端按取消规则 + 上课前小时数 + 是否已上课判定） |
| data.has_more | boolean | 是否还有下一页 |
| data.total | integer | 筛选后的总条数 |

## 备注

- 已取消记录同样下发：机构未通过（提交后未获确认）与机构取消在库里都是 status=3 + cancel_source，学生端文案按取消来源与是否落定细分（未通过 / 机构取消 / 已取消）
- 时间筛选按课次上课日期（天粒度）过滤，与「上课记录」同一口径；条件与分页一起下推 SQL，total/has_more 与实际可选项一致
- cancel_allowed 由服务端判定，前端只据此置灰并给出原因，避免把取消规则再实现一遍
