# 请假详情

> 单条请假单详情：请假资料 + 学生姓名 + 课次（课程/班级/校区/时间）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.leaveDetail` |
| 接口地址 | `POST /api/app/school/user/leaveDetail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 请假单ID | `1235` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/leaveDetail' \
  -H 'Content-Type: application/json' \
  -d '{"id":1235}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980128",
  "data": {
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
    "course_name": "",
    "class_name": "",
    "campus_name": "",
    "campus_id": 0,
    "lesson_date_text": "",
    "start_time": "",
    "end_time": ""
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 请假单ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.student_id | integer | 学生ID |
| data.user_id | integer | 用户ID |
| data.schedule_student_id | integer | 学员课次ID |
| data.schedule_id | integer | 课次ID |
| data.type | integer | 请假类型：1事假 2病假 3其他 |
| data.reason | string | 请假原因 |
| data.images | string | 图片凭证 URL 数组 |
| data.lessons | string | 请假课时 |
| data.status | integer | 状态：0待审核 1已通过 2已拒绝 3已取消 |
| data.is_deduct | integer | 请假是否扣课时 |
| data.audit_remark | string | 审核备注（拒绝原因） |
| data.audit_time | integer | 处理时间（时间戳） |
| data.createtime | integer | 提交时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
| data.student_name | string | 学生姓名 |
| data.course_name | string | 课程名称 |
| data.class_name | string | 班级名称 |
| data.campus_name | string | 校区名称 |
| data.campus_id | integer | 校区ID（跳校区详情用；课次不存在时 0） |
| data.lesson_date_text | string | 上课日期（Y-m-d） |
| data.start_time | string | 开始时间 HH:MM |
| data.end_time | string | 结束时间 HH:MM |

## 备注

- 请假单不存在 → 「请假单不存在」；不属于本人名下学生 → 「无权查看」
- 课次已被删除时课程/班级/校区/时间四项为空（campus_id 为 0，前端此行不可点）
