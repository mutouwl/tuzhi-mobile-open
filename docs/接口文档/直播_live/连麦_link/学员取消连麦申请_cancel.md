# 学员取消连麦申请

> 观众取消本人发起且尚未被讲师处理的连麦申请，记录置为「已取消」。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.link.cancel` |
| 接口地址 | `POST /api/live/link/cancel` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |
| link_id | integer | 是 | 连麦记录ID（取自 my_link 或 my_records 的 id） | `1` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/cancel' \
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
| data | string | 无业务数据（仅返回 msg「已取消」） |

## 备注

- 只允许取消 inviter=2（学员申请）且仍在申请中的记录；讲师邀请的记录报「讲师邀请的连麦请使用拒绝操作」
- 记录写入 status=5（已取消）、background=「学员取消」，并广播实时消息供中控台刷新待处理徽标
