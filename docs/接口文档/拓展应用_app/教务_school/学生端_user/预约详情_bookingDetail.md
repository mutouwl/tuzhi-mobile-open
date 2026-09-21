# 预约详情

> 单条预约详情（仅本人）：预约单 + 课次与老师信息 + 学生资料 + 签到与消课两维状态。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.bookingDetail` |
| 接口地址 | `POST /api/app/school/user/bookingDetail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 预约单ID | `1282` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/bookingDetail' \
  -H 'Content-Type: application/json' \
  -d '{"id":1282}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980036",
  "data": {
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
    "student": {
      "id": 3619,
      "name": "刘**",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
      "phone": "187****4234",
      "gender": 1
    },
    "sign_time_text": "2026-09-20 15:58:05",
    "verify_status": 1,
    "sign_status_text": "已签到",
    "consume_status_text": "已消课",
    "verify_status_text": "已签到"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 预约单ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.user_id | integer | 用户ID |
| data.student_id | integer | 学生（学员）ID |
| data.schedule_id | integer | 课次ID |
| data.schedule_student_id | integer | 学员课次ID（0=预约未落定） |
| data.course_id | integer | 课程ID |
| data.booking_date | integer | 预约日期 |
| data.lessons | string | 课时 |
| data.status | integer | 状态：0待确认 1待上课 2已上课 3已取消 |
| data.source | integer | source |
| data.cancel_source | integer | 取消来源：0未取消 1后台取消 2学员取消 |
| data.cancel_reason | string | 取消原因 |
| data.contact_name | string | contact名称 |
| data.contact_phone | string | contact电话 |
| data.confirm_admin_id | integer | confirmadminID |
| data.confirm_time | integer | confirm时间 |
| data.remark | string | 学员备注 |
| data.admin_remark | string | adminremark |
| data.deleted | integer | deleted |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
| data.student_name | string | 学生姓名 |
| data.student_avatar | string | 学生头像 |
| data.student_phone | string | 学生手机号 |
| data.student_gender | integer | 学生性别 |
| data.course_name | string | 课程名称 |
| data.course_cover | string | 课程封面图 |
| data.course_intro | string | 课程简介 |
| data.course_is_one_to_one | integer | 课程是否one待评价one |
| data.lesson_date | integer | 课时日期 |
| data.start_time | string | 开始时间 |
| data.end_time | string | 结束时间 |
| data.schedule_lessons | string | 课次扣课时 |
| data.campus_id | integer | 校区ID |
| data.class_id | integer | 班级ID |
| data.classroom_id | integer | 教室ID（0=无需教室） |
| data.campus_name | string | 校区名称 |
| data.class_name | string | 班级名称 |
| data.classroom_name | string | 教室名称 |
| data.date_text | string | 上课日期（Y-m-d） |
| data.teachers | array | teachers |
| data.teachers[].id | integer | ID |
| data.teachers[].teacher_id | integer | 老师ID |
| data.teachers[].name | string | 名称 |
| data.teachers[].avatar | string | 头像 |
| data.teachers[].phone | string | 电话 |
| data.teachers[].gender | integer | 性别 |
| data.teachers[].intro | string | 简介 |
| data.teachers[].role | integer | role |
| data.main_teacher | string | 主讲老师姓名（多人用、拼接） |
| data.main_teacher_list | array | 主讲老师完整资料 |
| data.main_teacher_list[].id | integer | ID |
| data.main_teacher_list[].teacher_id | integer | 老师ID |
| data.main_teacher_list[].name | string | 名称 |
| data.main_teacher_list[].avatar | string | 头像 |
| data.main_teacher_list[].phone | string | 电话 |
| data.main_teacher_list[].gender | integer | 性别 |
| data.main_teacher_list[].intro | string | 简介 |
| data.main_teacher_list[].role | integer | role |
| data.assistant_teacher | string | 助教姓名（多人用、拼接） |
| data.status_text | string | 学生端状态文案（与「我的预约」列表逐行一致） |
| data.source_text | string | sourcetext |
| data.createtime_text | string | createtimetext |
| data.confirm_time_text | string | confirm时间text |
| data.student | object | 预约学生资料 |
| data.student.id | integer | 学生ID |
| data.student.name | string | 学生姓名 |
| data.student.avatar | string | 学生头像 |
| data.student.phone | string | 学生手机号 |
| data.student.gender | integer | 性别：1男 2女 |
| data.sign_time_text | string | 签到时间（Y-m-d H:i:s，未签到为空串） |
| data.verify_status | integer | 点名状态：0未签到 1已签到 2消课失败 3请假 4未到；-1=预约未落定 |
| data.sign_status_text | string | 签到维文案（未落定时为空串） |
| data.consume_status_text | string | 消课维文案 |
| data.verify_status_text | string | 签到状态文案（兼容旧字段，与 sign_status_text 同值） |

## 备注

- 只允许查看本人预约，非本人或记录不存在时返回「预约记录不存在」
- 状态文案换学生端口径（未通过 / 机构取消 / 已取消），避免弹层里的状态与卡片标签说成两回事
- 预约未落定到学生课次时（schedule_student_id=0），签到与消课两项文案为空串
