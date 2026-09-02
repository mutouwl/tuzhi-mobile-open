# 获取绑定课程

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.activity.course.list` |
| 接口地址 | `POST /api/app/activity/bind_course/getBindCourse` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | BindCourse（绑定课程） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | string | 否 | 活动ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/activity/bind_course/getBindCourse' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508216",
  "data": [
    {
      "id": 73,
      "subscription": false,
      "course": {
        "id": 282,
        "name": "兰兰小课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260110/f3a4d11a8588e2684fd31a7bfd1d696c.jpeg"
      }
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].subscription | boolean | 订阅 |
| data[].course | object | 课程 |
| data[].course.id | integer | ID |
| data[].course.name | string | 名称 |
| data[].course.cover | string | 封面图 |
