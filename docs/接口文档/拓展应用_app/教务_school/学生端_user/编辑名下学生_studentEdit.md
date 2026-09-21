# 编辑名下学生

> 修改本人名下学生的姓名、手机号、性别、生日与头像，校验规则与新建一致。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.studentEdit` |
| 接口地址 | `POST /api/app/school/user/studentEdit` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| name | string | 是 | 学生姓名（最长 50 字符） | `张小明` |
| phone | string | 是 | 手机号，须匹配 1[3-9]\d{9} | `13800138000` |
| gender | integer | 否 | 性别：1男 2女，默认 1 | `1` |
| birthday | string | 否 | 生日日期（如 2018-06-01），可空 | `2018-06-01` |
| avatar | string | 否 | 头像地址，留空时取当前登录用户头像 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/studentEdit' \
  -H 'Content-Type: application/json' \
  -d '{"id":3619,"name":"张小明","phone":"13222222222","gender":1,"birthday":"2018-06-01","avatar":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 学生ID |
| data.name | string | 学生姓名（回显） |

## 备注

- 先校验归属（非本人名下或已删除 → 「学生不存在」），再按新建学生的同套规则校验字段
- 编辑不占用自建名额
