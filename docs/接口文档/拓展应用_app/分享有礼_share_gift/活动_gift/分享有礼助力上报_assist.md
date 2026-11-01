# 分享有礼助力上报

> 受邀人点分享链接进入直播页后上报助力，幂等：同一活动同一受邀人只有一行。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `share_gift.gift.assist` |
| 接口地址 | `POST /api/app/share_gift/gift/assist` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（分享有礼学员端接口（M-P1 活动列表 / M-P2 活动详情 / M-P3 助力 / M-P4 领奖）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程（直播间）ID | - |
| inviter_id | integer | 是 | 分享人（邀请者）的用户 ID，来自链接上的 share 参数 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/share_gift/gift/assist' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"xxx","inviter_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 助力结果与弹窗要渲染的内容 |
| data.assist_id | integer | 助力记录 ID |
| data.status | integer | 助力状态值 |
| data.status_text | string | 助力状态文案（后端下发） |
| data.fail_type | integer | 失效原因类型值 |
| data.fail_text | string | 失效原因文案（后端下发） |
| data.valid_assist_count | integer | 有效助力人数 |
| data.invite_num | integer | 活动要求的目标邀请人数 |
| data.prizes | string | 奖品卡列表，与活动详情弹窗同一份装配、同一只前端组件 |

## 备注

- 入参是 inviter_id 而不是 activity_id：助力要落在「此刻生效的那条活动」上（Active::one 唯一生效）
- 未登录、给自己助力、活动已结束都回业务错误，文案见 notes 分支
