# 撤回请假

> 撤回本人提交、尚在流程中的请假单，撤回后课次恢复为可请假/可签到。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.leaveCancel` |
| 接口地址 | `POST /api/app/school/user/leaveCancel` |
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
curl -X POST '{apiUrl}app/school/user/leaveCancel' \
  -H 'Content-Type: application/json' \
  -d '{"id":1235}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 无业务数据（仅返回 msg「撤回成功」） |

## 备注

- 撤回失败（无权操作、状态已变更等）由 LeaveService::cancel 抛异常并转成 code=0，msg 为具体原因
- 撤回后学员课次上的 leave_id 被清空，该课次可再次发起请假
