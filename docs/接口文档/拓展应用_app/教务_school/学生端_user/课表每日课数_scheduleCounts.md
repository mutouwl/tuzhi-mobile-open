# 课表每日课数

> 选择日期弹窗的日历角标：轻量接口，只返回日期到当天课节数的映射。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.scheduleCounts` |
| 接口地址 | `POST /api/app/school/user/scheduleCounts` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| start_date | string | 否 | 起始日期 Y-m-d，默认往前 180 天 | `2026-03-25` |
| end_date | string | 否 | 结束日期 Y-m-d，默认往后 180 天 | `2027-03-24` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/scheduleCounts' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"start_date":"2026-03-25","end_date":"2027-03-24"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980029",
  "data": {
    "counts": {
      "2026-09-20": 2
    }
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.counts | object | 「日期 => 课节数」映射（JSON 对象，如 {"2026-09-19":3}；无数据时为 {}） |
| data.counts.2026-09-20 | integer | 20260920 |

## 备注

- 只统计未取消（status=1）且未删除的课次
- counts 即使无数据也下发为对象 {}：PHP 空数组会被序列化成 []，前端日历按字典消费会报类型错误，故在下发边界统一转对象
