# 学员接听连麦邀请

> 观众接听讲师发起的连麦邀请，接通后进入「连麦中」并拿到学员端推流地址；视频邀请可在此切为语音接听。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.link.accept` |
| 接口地址 | `POST /api/live/link/accept` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |
| link_id | integer | 是 | 连麦记录ID（讲师邀请产生，inviter=1） | `1` |
| link_type | integer | 否 | 传 2 表示视频邀请改按语音接听（同时摄像头关闭），0=按原邀请模式 | `0` |
| platform | string | 否 | 请求端 pc / mobile | `mobile` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/accept' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":1585,"link_id":1,"link_type":0,"platform":"mobile"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 连麦记录ID |
| data.course_id | integer | 直播课程ID |
| data.live_room_id | integer | 直播间ID |
| data.user_id | integer | 学员用户ID |
| data.link_type | integer | 连麦模式：1视频 2语音 |
| data.status | integer | 状态：1连麦中 |
| data.inviter | string | 发起方：1讲师邀请 |
| data.provider | string | 连麦服务商标识（如 aliyun） |
| data.rtc_user_id | integer | RTC 用户ID（link_{course_id}_{user_id}） |
| data.push_url | string | 学员连麦推流地址（artc），接听成功即用该地址上麦 |
| data.mute | string | 是否静音：1静音 0正常 |
| data.video_on | string | 摄像头是否开启：1开启 0关闭（语音连麦恒 0） |
| data.start_time | integer | 接通时间（时间戳） |

## 备注

- 只能接听「申请中」的记录，状态已变更时报「连麦状态已变更，请刷新」
- 讲师未使用「连麦推流地址(RTC)」而用普通推流直播时报错提示切换推流；此时邀请记录保留申请中，学员端轮询会重新弹邀请可自动重试
- 接通时名额已满 → 「当前连麦人数已满，请稍后再试」；无权操作他人记录 → 「无权操作该连麦」
- 生成推流地址失败会直接报错；混流转推任务的瞬时失败（频道不存在等）不阻断接通，由中控台轮询兜底
