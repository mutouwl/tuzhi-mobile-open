# 请假列表

> 本人名下学生的请假单列表，按状态页签过滤并分页，逐行补学生名与课次（课程/班级/上课时间）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.leaveList` |
| 接口地址 | `POST /api/app/school/user/leaveList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| status | integer | 否 | 状态页签：-1全部（默认）、0待审核、1已通过、2已拒绝、3已取消 | `-1` |
| page | integer | 否 | 页码，默认 1 | `1` |
| limit | integer | 否 | 每页数量，默认 20（最大 100） | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/leaveList' \
  -H 'Content-Type: application/json' \
  -d '{"status":-1,"page":1,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980127",
  "data": {
    "list": [
      {
        "id": 1235,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 8762,
        "schedule_id": 5813,
        "type": 2,
        "reason": "你好",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789818479,
        "createtime": 1789818479,
        "updatetime": 1789818479,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 1234,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 8681,
        "schedule_id": 7398,
        "type": 1,
        "reason": "你好",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789817982,
        "createtime": 1789817982,
        "updatetime": 1789817982,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 1233,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 8676,
        "schedule_id": 7385,
        "type": 1,
        "reason": "你好",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789817982,
        "createtime": 1789817982,
        "updatetime": 1789817982,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 1232,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 8674,
        "schedule_id": 7383,
        "type": 1,
        "reason": "你好",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789817982,
        "createtime": 1789817982,
        "updatetime": 1789817982,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 1231,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 6959,
        "schedule_id": 5830,
        "type": 1,
        "reason": "123",
        "images": "[\"https://tuzhi.mutouweb.com\\/uploads\\/1\\/20260919\\/6a53992c8f008780e4a9ee5fabee7110.png\",\"https://tuzhi.mutouweb.com\\/uploads\\/1\\/20260919\\/97961cedd0eff068b79d49ae2899dfc7.png\"]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789815288,
        "createtime": 1789815288,
        "updatetime": 1789815289,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 1230,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 8394,
        "schedule_id": 5806,
        "type": 1,
        "reason": "123",
        "images": "[\"https://tuzhi.mutouweb.com\\/uploads\\/1\\/20260919\\/6a53992c8f008780e4a9ee5fabee7110.png\",\"https://tuzhi.mutouweb.com\\/uploads\\/1\\/20260919\\/97961cedd0eff068b79d49ae2899dfc7.png\"]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789815288,
        "createtime": 1789815288,
        "updatetime": 1789815288,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 949,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 5345,
        "schedule_id": 4745,
        "type": 2,
        "reason": "nih",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789724822,
        "createtime": 1789724822,
        "updatetime": 1789724822,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 938,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 1141,
        "schedule_id": 882,
        "type": 1,
        "reason": "请问",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789708609,
        "createtime": 1789708609,
        "updatetime": 1789708609,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "nih",
        "class_name": "幸福班级",
        "lesson_date_text": "2026-09-19",
        "start_time": "10:00",
        "end_time": "11:00"
      },
      {
        "id": 937,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 1143,
        "schedule_id": 883,
        "type": 1,
        "reason": "请问",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789708609,
        "createtime": 1789708609,
        "updatetime": 1789708609,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "nih",
        "class_name": "幸福班级",
        "lesson_date_text": "2026-09-19",
        "start_time": "04:06",
        "end_time": "08:05"
      },
      {
        "id": 936,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 1195,
        "schedule_id": 909,
        "type": 1,
        "reason": "你好",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789708598,
        "createtime": 1789708598,
        "updatetime": 1789708598,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "nih",
        "class_name": "幸福班级",
        "lesson_date_text": "2026-10-02",
        "start_time": "04:06",
        "end_time": "08:05"
      },
      {
        "id": 935,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 1189,
        "schedule_id": 906,
        "type": 1,
        "reason": "你好",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789708598,
        "createtime": 1789708598,
        "updatetime": 1789708598,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "nih",
        "class_name": "幸福班级",
        "lesson_date_text": "2026-10-01",
        "start_time": "10:00",
        "end_time": "11:00"
      },
      {
        "id": 934,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 1191,
        "schedule_id": 907,
        "type": 1,
        "reason": "你好",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789708598,
        "createtime": 1789708598,
        "updatetime": 1789708598,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "nih",
        "class_name": "幸福班级",
        "lesson_date_text": "2026-10-01",
        "start_time": "04:06",
        "end_time": "08:05"
      },
      {
        "id": 882,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 3382,
        "schedule_id": 2981,
        "type": 1,
        "reason": "12323",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789565638,
        "createtime": 1789565638,
        "updatetime": 1789565638,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 881,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 3576,
        "schedule_id": 3203,
        "type": 1,
        "reason": "12323",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789565638,
        "createtime": 1789565638,
        "updatetime": 1789565638,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 880,
        "uniacid": 1,
        "student_id": 256,
        "user_id": 38,
        "schedule_student_id": 1135,
        "schedule_id": 879,
        "type": 1,
        "reason": "12323",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789565638,
        "createtime": 1789565638,
        "updatetime": 1789565638,
        "student_name": "封**",
        "status_text": "已通过",
        "course_name": "nih",
        "class_name": "幸福班级",
        "lesson_date_text": "2026-09-17",
        "start_time": "04:06",
        "end_time": "08:05"
      },
      {
        "id": 879,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 3950,
        "schedule_id": 3595,
        "type": 1,
        "reason": "123",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789564115,
        "createtime": 1789564115,
        "updatetime": 1789564115,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 754,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 3473,
        "schedule_id": 3076,
        "type": 2,
        "reason": "1243",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789561323,
        "createtime": 1789561323,
        "updatetime": 1789561323,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 753,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 3383,
        "schedule_id": 2981,
        "type": 2,
        "reason": "1243",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789561323,
        "createtime": 1789561323,
        "updatetime": 1789561323,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 752,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 3115,
        "schedule_id": 2736,
        "type": 2,
        "reason": "1243",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789561323,
        "createtime": 1789561323,
        "updatetime": 1789561323,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      },
      {
        "id": 751,
        "uniacid": 1,
        "student_id": 63,
        "user_id": 38,
        "schedule_student_id": 3909,
        "schedule_id": 3548,
        "type": 2,
        "reason": "1243",
        "images": "[]",
        "lessons": "1.00",
        "status": 1,
        "is_deduct": 0,
        "audit_remark": "",
        "audit_time": 1789561323,
        "createtime": 1789561323,
        "updatetime": 1789561323,
        "student_name": "冯**",
        "status_text": "已通过",
        "course_name": "",
        "class_name": "",
        "lesson_date_text": "",
        "start_time": "",
        "end_time": ""
      }
    ],
    "has_more": true,
    "total": 38,
    "allow_leave": 1
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 请假单列表 |
| data.list[].id | integer | 请假单ID |
| data.list[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.list[].student_id | integer | 学生ID |
| data.list[].user_id | integer | 提交用户ID |
| data.list[].schedule_student_id | integer | 学员课次ID |
| data.list[].schedule_id | integer | 课次ID |
| data.list[].type | integer | 请假类型：1事假 2病假 3其他 |
| data.list[].reason | string | 请假原因 |
| data.list[].images | string | 图片凭证 URL 数组（最多 6 张） |
| data.list[].lessons | string | 请假课时 |
| data.list[].status | integer | 状态：0待审核 1已通过 2已拒绝 3已取消 |
| data.list[].is_deduct | integer | 请假是否扣课时：0不扣 1扣 |
| data.list[].audit_remark | string | 审核备注（拒绝原因） |
| data.list[].audit_time | integer | 处理时间（时间戳） |
| data.list[].createtime | integer | 提交时间（时间戳） |
| data.list[].updatetime | integer | 更新时间（时间戳） |
| data.list[].student_name | string | 学生姓名 |
| data.list[].status_text | string | 状态文案 |
| data.list[].course_name | string | 课程名称（课次已不存在时为空串） |
| data.list[].class_name | string | 班级名称 |
| data.list[].lesson_date_text | string | 上课日期（Y-m-d） |
| data.list[].start_time | string | 开始时间 HH:MM |
| data.list[].end_time | string | 结束时间 HH:MM |
| data.has_more | boolean | 是否还有下一页 |
| data.total | integer | 筛选后的总条数 |
| data.allow_leave | integer | 机构是否开启学生请假 |

## 备注

- status 在服务端过滤：分页后由前端按页签过滤会出现「某页被筛空、却还有下一页」的假空态
- 课次信息用一次批量查询取回（含课程/班级左联），课次已不存在时相关四项为空串，前端按 - 兜底
- 排序 createtime desc → id desc（同一批提交的请假单时间相同）
