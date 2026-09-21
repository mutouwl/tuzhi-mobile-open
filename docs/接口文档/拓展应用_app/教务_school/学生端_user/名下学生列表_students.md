# 名下学生列表

> 当前登录用户名下的学生（学员）列表，逐行带所在班级；page>0 时分页，并下发学生自建上限。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.students` |
| 接口地址 | `POST /api/app/school/user/students` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码；0 或不传表示一次返回全部 | `0` |
| limit | integer | 否 | 每页数量，默认 20（1~100，越界回落 20） | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/students' \
  -H 'Content-Type: application/json' \
  -d '{"page":0,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980027",
  "data": {
    "list": [
      {
        "id": 3619,
        "name": "刘**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "phone": "187****4234",
        "gender": 1,
        "birthday": 1789833600,
        "class_names": "刘洋-计算机算法结构课程一对一"
      }
    ],
    "student_limit": 5
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 学生列表（按 id 升序） |
| data.list[].id | integer | 学生ID |
| data.list[].name | string | 学生姓名 |
| data.list[].avatar | string | 学生头像 |
| data.list[].phone | string | 手机号（学员/家长） |
| data.list[].gender | integer | 性别：1男 2女 |
| data.list[].birthday | integer | 生日（时间戳，0=未设置） |
| data.list[].class_names | string | 所在班级名称（多个用、拼接，未在班时为空串） |
| data.student_limit | integer | 学生端可自建学生上限（0=机构不允许自建，缺省 5） |

## 备注

- 只返回未软删除（deleted=0）且归属当前登录用户的学生
- 不分页调用（不传 page 或 page=0）时不下发 total / has_more
- student_limit 供前端决定「新增学生」入口是否展示与提示文案
