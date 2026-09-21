# 学习统计

> 获取统计

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `study.getStatistics` |
| 接口地址 | `POST /api/user/study/getStatistics` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Study（学习统计） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| time | integer | 否 | 时间 | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}user/study/getStatistics' \
  -H 'Content-Type: application/json' \
  -d '{"time":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508200",
  "data": {
    "log": {
      "01月": {
        "time": 1.8,
        "course": 5
      },
      "02月": {
        "time": 5.9,
        "course": 2
      },
      "03月": {
        "time": 0,
        "course": 0
      },
      "04月": {
        "time": 0.3,
        "course": 1
      },
      "05月": {
        "time": 1.3,
        "course": 9
      },
      "06月": {
        "time": 0.5,
        "course": 19
      },
      "07月": {
        "time": 1.1,
        "course": 16
      },
      "08月": {
        "time": 1.7,
        "course": 28
      }
    },
    "total": {
      "time": 59,
      "course": 140
    },
    "time_total": {
      "time": 1.7,
      "course": 28
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
| data.log | object | 记录 |
| data.log.01月 | object | 01月 |
| data.log.01月.time | number | 时间 |
| data.log.01月.course | integer | 课程 |
| data.log.02月 | object | 02月 |
| data.log.02月.time | number | 时间 |
| data.log.02月.course | integer | 课程 |
| data.log.03月 | object | 03月 |
| data.log.03月.time | integer | 时间 |
| data.log.03月.course | integer | 课程 |
| data.log.04月 | object | 04月 |
| data.log.04月.time | number | 时间 |
| data.log.04月.course | integer | 课程 |
| data.log.05月 | object | 05月 |
| data.log.05月.time | number | 时间 |
| data.log.05月.course | integer | 课程 |
| data.log.06月 | object | 06月 |
| data.log.06月.time | number | 时间 |
| data.log.06月.course | integer | 课程 |
| data.log.07月 | object | 07月 |
| data.log.07月.time | number | 时间 |
| data.log.07月.course | integer | 课程 |
| data.log.08月 | object | 08月 |
| data.log.08月.time | number | 时间 |
| data.log.08月.course | integer | 课程 |
| data.total | object | 合计 |
| data.total.time | integer | 时间 |
| data.total.course | integer | 课程 |
| data.time_total | object | 时间合计 |
| data.time_total.time | number | 时间 |
| data.time_total.course | integer | 课程 |
