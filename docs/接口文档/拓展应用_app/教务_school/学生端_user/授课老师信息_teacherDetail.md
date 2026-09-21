# 授课老师信息

> 课次详情老师弹窗的数据源：老师头像、姓名与联系电话，且仅限本人学生课次中出现过的老师。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.teacherDetail` |
| 接口地址 | `POST /api/app/school/user/teacherDetail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| teacher_id | integer | 是 | 老师ID | `1944` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/teacherDetail' \
  -H 'Content-Type: application/json' \
  -d '{"teacher_id":1944}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980033",
  "data": {
    "id": 1944,
    "name": "李**",
    "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
    "phone": "187****8778"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 老师ID |
| data.name | string | 老师姓名 |
| data.avatar | string | 老师头像 |
| data.phone | string | 联系电话 |

## 备注

- 老师必须出现在当前用户名下学生的课次中，否则一律返回「老师不存在」（防止遍历 ID 枚举全机构老师的联系方式）
- 学生归属口径与请假详情一致；公开浏览场景请用 app/school/teacher/detail
