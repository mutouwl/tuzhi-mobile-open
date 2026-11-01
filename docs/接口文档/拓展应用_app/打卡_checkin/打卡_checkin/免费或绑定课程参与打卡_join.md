# 免费或绑定课程参与打卡

> 参与条件为 free / course 的活动走这一口；判据与未购券引导都在 MemberService::freeJoin 一处。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.join` |
| 接口地址 | `POST /api/app/checkin/checkin/join` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/join' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 成功时为空对象，结果由 code/msg 表达 |

## 备注

- 不支持直接加入（付费/密码/指定学员）回「该打卡活动不支持直接加入」；未买关联课程回「请先购买关联课程」
- 参与截止时间已过时按后端下发的原句提示，前端不自己比时间戳
