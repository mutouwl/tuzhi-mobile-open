# 学生签到

> 学生对本人课次签到；签到后是否同步消课由教务设置「签到自动消课」决定。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.sign` |
| 接口地址 | `POST /api/app/school/user/sign` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| schedule_student_id | integer | 是 | 学员课次ID | `8762` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/sign' \
  -H 'Content-Type: application/json' \
  -d '{"schedule_student_id":8762}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.signed | boolean | 是否签到成功 |
| data.verified | boolean | 是否已消课（机构关闭自动消课时恒为 false） |
| data.fail_reason | string | 消课失败原因（仅 verified=false 时下发） |

## 备注

- 机构未开启学生签到 → 「当前机构未开启学生签到」
- 重复签到 → 「已签到，无需重复操作」；请假已通过 → 「请假已通过的课次无需签到」；已标记未到 → 「该课次已标记未到，无需签到」；排课已取消 → 「排课已取消，不能签到」；不在签到时间窗内 → 返回服务端给出的原因文案
- 成功 msg 分三种：自动消课且成功「签到成功，已消课」、自动消课但扣课时失败「签到成功，课时扣减失败，请联系机构」、关闭自动消课「签到成功，课时待机构确认」
- 业务异常统一转成 code=0 返回 msg，避免被吞成 code=500 的通用提示
