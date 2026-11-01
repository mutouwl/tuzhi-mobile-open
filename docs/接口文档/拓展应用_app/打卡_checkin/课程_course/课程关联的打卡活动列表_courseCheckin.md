# 课程关联的打卡活动列表

> 课程详情页底栏「打卡」入口：按课程（含其所属专栏）反查上架中的打卡活动，免登录可读。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.course.courseCheckin` |
| 接口地址 | `POST /api/app/checkin/course/courseCheckin` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Course（打卡用户端接口 - 按课程反查（课程详情页底栏「打卡」入口）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 课程 ID | `6199` |
| column_id | integer | 否 | 专栏 ID（加速器，服务端仍会按绑定关系反查父专栏） | - |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 20 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/course/courseCheckin' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":6199,"column_id":"xxx","page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344791",
  "data": {
    "total": 0,
    "rows": [],
    "has_more": 0,
    "attr": {
      "join_type": {
        "free": "免费参与",
        "pay": "付费参与",
        "password": "****",
        "student": "指定学员",
        "course": "绑定课程"
      },
      "run_state": {
        "not_started": "未开始",
        "ongoing": "进行中",
        "ended": "已结束"
      },
      "checkin_mode": {
        "1": "日历打卡",
        "2": "闯关打卡"
      }
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
| data.total | integer | 合计 |
| data.rows | array | 本页数据行数组 |
| data.has_more | integer | 是否有more |
| data.attr | object | 枚举文案字典（界面标签的唯一来源，前端禁止写死选项） |
| data.attr.join_type | object | 加入类型 |
| data.attr.join_type.free | string | 免费参与 |
| data.attr.join_type.pay | string | 付费参与 |
| data.attr.join_type.password | string | 密码兑换 |
| data.attr.join_type.student | string | 指定学员 |
| data.attr.join_type.course | string | 绑定课程 |
| data.attr.run_state | object | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.attr.run_state.not_started | string | 未开始 |
| data.attr.run_state.ongoing | string | 进行中 |
| data.attr.run_state.ended | string | 已结束 |
| data.attr.checkin_mode | object | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |
| data.attr.checkin_mode[] | string | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |

## 备注

- 有没有关联由 total 表达，不再补一枚 has_checkin 说同一件事
- 免登录接口：未登录也能拿到列表，参与态与打卡闸门在点进活动主页时判
