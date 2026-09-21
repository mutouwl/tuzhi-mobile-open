# 取消预约

> 学生取消本人预约，仅未消课且未开始的课次可取消，可填写取消原因。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.bookCancel` |
| 接口地址 | `POST /api/app/school/user/bookCancel` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 预约单ID | `1282` |
| cancel_reason | string | 否 | 取消原因（最长 200 字） | `临时有事` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/bookCancel' \
  -H 'Content-Type: application/json' \
  -d '{"id":1282,"cancel_reason":"临时有事"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 无业务数据（仅返回 msg「取消成功」） |

## 备注

- 取消来源记为学员取消（cancel_source=2），记录状态置 3；学生端文案显示「已取消」
- 不可取消（已开始、已消课、超过机构设置的取消时限）由服务端判定，失败以 code=0 返回原因
- 前端按预约列表/详情的 cancel_allowed 决定是否放开按钮
