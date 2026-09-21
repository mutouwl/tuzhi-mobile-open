# 学生详情

> 编辑页回显本人名下学生的资料，生日按 Y-m-d 文本下发。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.studentDetail` |
| 接口地址 | `POST /api/app/school/user/studentDetail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 学生ID | `3619` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/studentDetail' \
  -H 'Content-Type: application/json' \
  -d '{"id":3619}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980028",
  "data": {
    "id": 3619,
    "name": "刘**",
    "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
    "phone": "187****4234",
    "gender": 1,
    "birthday": "2026-09-20"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 学生ID |
| data.name | string | 学生姓名 |
| data.avatar | string | 学生头像 |
| data.phone | string | 手机号 |
| data.gender | integer | 性别：1男 2女 |
| data.birthday | string | 生日（Y-m-d 文本，未设置时为空串） |

## 备注

- 只查本人名下且未删除的学生，否则返回 code=0「学生不存在」
