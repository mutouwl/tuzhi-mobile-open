# 学员拒绝连麦邀请

> 观众拒绝讲师发来的连麦邀请，记录置为「已拒绝」并向中控台广播拒绝事件。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.link.reject` |
| 接口地址 | `POST /api/live/link/reject` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |
| link_id | integer | 是 | 连麦记录ID（讲师邀请） | `1` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/reject' \
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
| data | string | 无业务数据（仅返回 msg「已拒绝」） |

## 备注

- 记录写入 status=3（已拒绝）、background=「学员拒绝」
- 只能处理申请中的记录；讲师邀请的记录不能用 cancel 取消，必须走本接口
- 失败提示：连麦记录不存在 / 无权操作该连麦 / 连麦状态已变更，请刷新
