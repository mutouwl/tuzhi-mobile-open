# 提交请假

> 为学生的一次或多次课次提交请假单，是否需机构审核由教务设置 leave_audit 决定。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.leaveSubmit` |
| 接口地址 | `POST /api/app/school/user/leaveSubmit` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| schedule_student_ids | array | 否 | 学员课次ID数组（批量请假），如 [101,102] | `8762` |
| schedule_student_id | integer | 否 | 单个学员课次ID（兼容旧调用；数组有值时忽略） | `0` |
| type | integer | 否 | 请假类型：1事假 2病假 3其他，默认 1 | `1` |
| reason | string | 否 | 请假原因（最长 200 字） | `家中有事` |
| images | array | 否 | 图片凭证 URL 数组（最多 6 张） | `` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/leaveSubmit' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"schedule_student_ids":[8762],"schedule_student_id":0,"type":1,"reason":"家中有事","images":[]}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.count | integer | 成功提交的请假单数量 |

## 备注

- 学生非本人名下 → 「请选择本人名下的学生」；机构未开启学生请假 → 「当前机构未开启学生请假」
- 重复请假、课次状态不可请假等业务失败以 code=0 原样返回 msg（直接抛异常会被统一成 code=500，前端拿不到原因）
- leave_audit=1 时请假单为「待审核」（状态 0），=0 时直接通过（状态 1）
- 未传课次（数组与单值都为空）时不会创建请假单，count 为 0
