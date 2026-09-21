# 连麦中成员列表

> 返回某场直播当前所有「连麦中」记录（含学员昵称），供连麦布局与画面窗格渲染。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.link.list` |
| 接口地址 | `POST /api/live/link/getLinkList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/getLinkList' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":1585}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[] | string | 连麦中记录数组（无记录时为空数组） |
| data[].id | integer | 连麦记录ID |
| data[].user_id | integer | 学员用户ID |
| data[].nickname | string | 学员昵称（取不到时按「学员」） |
| data[].link_type | integer | 连麦模式：1视频 2语音 |
| data[].status | integer | 状态（恒为 1 连麦中） |
| data[].inviter | string | 发起方：1讲师邀请 2学员申请 |
| data[].provider | string | 连麦服务商 |
| data[].rtc_user_id | integer | RTC 用户ID |
| data[].push_url | string | 连麦推流地址 |
| data[].mute | string | 是否静音 |
| data[].video_on | string | 摄像头是否开启 |
| data[].start_time | integer | 接通时间（时间戳） |

## 备注

- 只查 status=1（连麦中），不含申请中记录
- 移动端与 PC 端当前只注册未调用该接口（中控台连麦列表走 admin 接口，文案口径一致）
