# 新建名下学生

> 为当前登录用户新增一名学生（学员）；头像留空时取当前用户头像。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.studentAdd` |
| 接口地址 | `POST /api/app/school/user/studentAdd` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| name | string | 是 | 学生姓名（最长 50 字符） | `张小明` |
| phone | string | 是 | 手机号，须匹配 1[3-9]\d{9} | `13800138000` |
| gender | integer | 否 | 性别：1男 2女，默认 1；其他值报「请选择性别」 | `1` |
| birthday | string | 否 | 生日日期（如 2018-06-01），可空；无法解析时报错 | `2018-06-01` |
| avatar | string | 否 | 头像地址，留空时取当前登录用户头像 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/studentAdd' \
  -H 'Content-Type: application/json' \
  -d '{"name":"张小明","phone":"13222222222","gender":1,"birthday":"2018-06-01","avatar":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 新建学生ID |
| data.name | string | 学生姓名（回显） |

## 备注

- 校验失败提示：请填写学生姓名 / 学生姓名最多 50 个字符 / 请填写正确的手机号码 / 请选择性别 / 请选择正确的生日日期
- 自建上限由教务设置 student_create_limit 决定：为 0 时报「机构未开放学生自行创建，如需添加请联系机构」，达到上限报「最多可创建N个学生，如需增加请联系机构」
- 上限只约束学生端，后台管理员添加学生不受限制
- 空头像写库时取当前用户头像的原始值（模型访问器会给空头像生成超长 data URI，不能直接落库）
