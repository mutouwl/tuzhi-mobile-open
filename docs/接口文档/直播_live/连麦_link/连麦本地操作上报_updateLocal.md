# 连麦本地操作上报

> 学员连麦面板的本地开关（麦克风静音、摄像头）上报落库，供中控台混流布局与记录展示，不直接控制 SDK。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.link.updateLocal` |
| 接口地址 | `POST /api/live/link/updateLocal` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |
| link_id | integer | 是 | 连麦记录ID（须为本人记录） | `1` |
| field | string | 是 | 字段名白名单：mute / video_on / mirror / beauty，其余报「参数错误」 | `mute` |
| value | integer | 否 | 取值 0 / 1 | `1` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/updateLocal' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":1585,"link_id":1,"field":"mute","value":1}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.field | string | 回显操作的字段名 |
| data.value | string | 实际落库值（语音连麦上报 video_on 会被强制为 0） |

## 备注

- 语音连麦（link_type=2）上报 video_on 时强制落 0，返回值同样是 0
- mirror / beauty 仅为历史兼容保留在白名单（翻转按钮已整链路移除，live_link 表也无对应列），前端不应再发送
- 记录须属于本人（按 id + course_id + user_id 定位），查不到报「连麦记录不存在」；上报失败前端静默忽略不打扰用户
