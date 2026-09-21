# 课次已有请假单

> 请假申请页带入课次时先查一次：命中待审核/已通过请假单的课次直接跳详情，避免用户停在提交必被拦截的表单里。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.lessonLeave` |
| 接口地址 | `POST /api/app/school/user/lessonLeave` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| schedule_student_ids | array | 是 | 学员课次ID数组，单次最多 30 个 | `8762` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/lessonLeave' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"schedule_student_ids":[8762]}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980031",
  "data": {
    "list": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 已有请假单的课次（无请假单时为空数组） |

## 备注

- 只返回确有「待审核 / 已通过」请假单的课次；已拒绝、已取消的不在列（这类课次仍可再次请假）
- 先按学生收窄再查请假单：传他人课次 ID 查不到
- 与提交请假同口径限流，超过 30 个课次报「单次最多查询 30 个课次」
