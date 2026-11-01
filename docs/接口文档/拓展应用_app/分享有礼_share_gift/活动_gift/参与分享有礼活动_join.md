# 参与分享有礼活动

> 「我也要拿奖品」：受邀人自己转为参与者，建一条属于他的参与记录。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `share_gift.gift.join` |
| 接口地址 | `POST /api/app/share_gift/gift/join` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（分享有礼学员端接口（M-P1 活动列表 / M-P2 活动详情 / M-P3 助力 / M-P4 领奖）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程（直播间）ID | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/share_gift/gift/join' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 参与结果 |
| data.record_id | integer | 本人的参与记录 ID |
| data.invite_num | integer | 活动要求的目标邀请人数 |
| data.assist_num | integer | 本人当前有效助力人数 |

## 备注

- 本口需要登录；未登录回「请先登录」
