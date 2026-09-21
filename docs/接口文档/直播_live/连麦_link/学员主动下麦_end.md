# 学员主动下麦

> 观众结束自己的连麦并下麦恢复普通观看，结束后混流自动恢复。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.link.end` |
| 接口地址 | `POST /api/live/link/end` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |
| link_id | integer | 是 | 连麦记录ID | `1` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/end' \
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
| data | string | 无业务数据（仅返回 msg「已下麦」） |

## 备注

- ⚠ 本接口不校验记录归属：服务层只按 course_id + link_id 定位记录，理论上拿到 link_id 即可结束他人连麦。前端只应在本人的连麦面板中调用
- 申请中的记录也可被 end（置为已结束）；原因文案固定记「学员下麦」
- 结束后混流自动恢复：仍有其他连麦成员则保留混流，否则恢复主播单路转推
- 讲师踢学员下麦/全员下麦走中控台（admin）接口，并通过 link_end / link_end_all 定向通知学员端本地下麦
