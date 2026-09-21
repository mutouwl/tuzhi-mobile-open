# 讲师同意连麦申请

> 讲师（或中控台侧复用学员端登录态）同意学员的连麦申请，接通后返回与接听接口一致的连麦记录。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live/link/agree` |
| 接口地址 | `POST /api/live/link/agree` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |
| link_id | integer | 是 | 连麦记录ID（学员申请产生，inviter=2） | `1` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/agree' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":1585,"link_id":1}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 接通后的连麦记录（字段同 live/link/accept，含 push_url、status=1、start_time、rtc_user_id） |

## 备注

- 来源：后端控制器（未在 api_list.js 注册）；中控台正常走 admin 接口，本接口供讲师端登录态调用
- 接通时名额已满或服务商异常，错误文案与 live/link/accept 一致
