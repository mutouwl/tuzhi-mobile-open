# 上课记录

> 学生历史课次记录（已签到/已消课/请假/未到，或课次已结束仍未签到），支持关键词、时间筛选与分页。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.records` |
| 接口地址 | `POST /api/app/school/user/records` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| keyword | string | 否 | 关键词：匹配课程名/班级名/授课老师名（超 30 字符截断，% _ \ 已转义） | - |
| start_time | integer | 否 | 上课日期起（秒级时间戳），0=不限 | `0` |
| end_time | integer | 否 | 上课日期止（秒级时间戳），0=不限 | `0` |
| page | integer | 否 | 页码，默认 1 | `1` |
| limit | integer | 否 | 每页数量，默认 20（1~100） | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/records' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"keyword":"xxx","start_time":0,"end_time":0,"page":1,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980029",
  "data": {
    "list": [
      {
        "id": 9831,
        "lessons": "1.00",
        "verify_status": 1,
        "sign_time": 1789891085,
        "account_id": 1747,
        "leave_id": 0,
        "lesson_date": 1789833600,
        "start_time": "18:00",
        "end_time": "20:00",
        "type": 1,
        "course_name": "计算机算法结构课程一对多",
        "class_name": "算法结构一对多",
        "status_text": "已签到",
        "sign_status_text": "已签到",
        "consume_status_text": "已消课",
        "consume_pending": 0,
        "list_status_text": "已消课"
      },
      {
        "id": 9820,
        "lessons": "1.00",
        "verify_status": 1,
        "sign_time": 1789890895,
        "account_id": 1748,
        "leave_id": 0,
        "lesson_date": 1789833600,
        "start_time": "18:00",
        "end_time": "20:00",
        "type": 1,
        "course_name": "计算机算法结构课程一对一",
        "class_name": "刘洋-计算机算法结构课程一对一",
        "status_text": "已签到",
        "sign_status_text": "已签到",
        "consume_status_text": "已消课",
        "consume_pending": 0,
        "list_status_text": "已消课"
      }
    ],
    "has_more": false
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 上课记录列表（按上课日期倒序） |
| data.list[].id | integer | 学员课次ID |
| data.list[].lessons | string | 本节扣课时 |
| data.list[].verify_status | integer | 点名状态：0未签到 1已签到 2消课失败 3请假 4未到 |
| data.list[].sign_time | integer | 签到时间（0=未签到） |
| data.list[].account_id | integer | 课时账户ID |
| data.list[].leave_id | integer | 请假单ID |
| data.list[].lesson_date | integer | 上课日期（当天 0 点时间戳） |
| data.list[].start_time | string | 开始时间 HH:MM |
| data.list[].end_time | string | 结束时间 HH:MM |
| data.list[].type | integer | 排课类型：1正常上课 2补课 |
| data.list[].course_name | string | 课程名称 |
| data.list[].class_name | string | 班级名称 |
| data.list[].status_text | string | 签到状态文案（与 sign_status_text 同值，兼容旧字段） |
| data.list[].sign_status_text | string | 签到维文案 |
| data.list[].consume_status_text | string | 消课维文案 |
| data.list[].consume_pending | integer | 是否待消课：1=已签到但机构未确认扣课时 |
| data.list[].list_status_text | string | 卡片角标文案（签到与消课两维合并） |
| data.has_more | boolean | 是否还有下一页 |

## 备注

- 口径与后台「签到记录」列表一致：未到上课时间、以及正在进行中还没有结果的课次都不算记录（否则倒序分页时未来课次会把历史记录挤出窗口）
- 关键词命中授课老师时，先按老师查关联课次 ID 再过滤，避免多老师联表出重复行
- 排序 lesson_date desc → start_ts desc → ss.id desc，保证翻页不重不漏
