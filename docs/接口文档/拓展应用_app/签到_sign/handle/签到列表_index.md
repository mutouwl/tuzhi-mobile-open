# 签到列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.sign.index` |
| 接口地址 | `POST /api/app/sign/handle/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Handle（日历签到） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| month | string | 否 | month | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/sign/handle/index' \
  -H 'Content-Type: application/json' \
  -d '{"month":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508173",
  "data": {
    "days": [
      {
        "is_sign": false,
        "date": "2026-08-01",
        "time": 1785513600,
        "day": 1,
        "week": "6",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-02",
        "time": 1785600000,
        "day": 2,
        "week": "0",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-03",
        "time": 1785686400,
        "day": 3,
        "week": "1",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-04",
        "time": 1785772800,
        "day": 4,
        "week": "2",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-05",
        "time": 1785859200,
        "day": 5,
        "week": "3",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-06",
        "time": 1785945600,
        "day": 6,
        "week": "4",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-07",
        "time": 1786032000,
        "day": 7,
        "week": "5",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-08",
        "time": 1786118400,
        "day": 8,
        "week": "6",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-09",
        "time": 1786204800,
        "day": 9,
        "week": "0",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-10",
        "time": 1786291200,
        "day": 10,
        "week": "1",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-11",
        "time": 1786377600,
        "day": 11,
        "week": "2",
        "current": "before"
      },
      {
        "is_sign": false,
        "date": "2026-08-12",
        "time": 1786464000,
        "day": 12,
        "week": "3",
        "current": "today"
      },
      {
        "is_sign": false,
        "date": "2026-08-13",
        "time": 1786550400,
        "day": 13,
        "week": "4",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-14",
        "time": 1786636800,
        "day": 14,
        "week": "5",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-15",
        "time": 1786723200,
        "day": 15,
        "week": "6",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-16",
        "time": 1786809600,
        "day": 16,
        "week": "0",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-17",
        "time": 1786896000,
        "day": 17,
        "week": "1",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-18",
        "time": 1786982400,
        "day": 18,
        "week": "2",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-19",
        "time": 1787068800,
        "day": 19,
        "week": "3",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-20",
        "time": 1787155200,
        "day": 20,
        "week": "4",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-21",
        "time": 1787241600,
        "day": 21,
        "week": "5",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-22",
        "time": 1787328000,
        "day": 22,
        "week": "6",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-23",
        "time": 1787414400,
        "day": 23,
        "week": "0",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-24",
        "time": 1787500800,
        "day": 24,
        "week": "1",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-25",
        "time": 1787587200,
        "day": 25,
        "week": "2",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-26",
        "time": 1787673600,
        "day": 26,
        "week": "3",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-27",
        "time": 1787760000,
        "day": 27,
        "week": "4",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-28",
        "time": 1787846400,
        "day": 28,
        "week": "5",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-29",
        "time": 1787932800,
        "day": 29,
        "week": "6",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-30",
        "time": 1788019200,
        "day": 30,
        "week": "0",
        "current": "after"
      },
      {
        "is_sign": false,
        "date": "2026-08-31",
        "time": 1788105600,
        "day": 31,
        "week": "1",
        "current": "after"
      }
    ],
    "cuntinue_days": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.days | array | 天数 |
| data.days[].is_sign | boolean | 是否签到 |
| data.days[].date | string | 日期 |
| data.days[].time | integer | 时间 |
| data.days[].day | integer | 天数 |
| data.days[].week | string | week |
| data.days[].current | string | 当前 |
| data.cuntinue_days | integer | cuntinue天数 |
