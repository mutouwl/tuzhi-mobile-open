# 获取我的票券

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.activity.ticket.getUserTicket` |
| 接口地址 | `POST /api/app/activity/ticket/getUserTicket` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Ticket（线下活动-票券） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| status | string | 否 | 状态 | `` |
| search | string | 否 | search | - |
| sort | string | 否 | 排序 | `desc` |
| order | string | 否 | 订单 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/activity/ticket/getUserTicket' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"status":"","search":"xxx","sort":"desc","order":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508151",
  "data": [
    {
      "activity_id": 9,
      "sign": 0,
      "status": 1,
      "activity_name": "马到成功大聚会",
      "ticket_name": "全价票",
      "use_time": null,
      "price": "0.01",
      "createtime": 1779011182,
      "ticket_no": "48057608359132",
      "mobile": "456456",
      "name": "23435",
      "other": [
        [
          "姓名",
          "23435"
        ],
        [
          "手机号",
          "456456"
        ],
        [
          "姓名",
          ""
        ],
        [
          "地区",
          ""
        ],
        [
          "人数",
          ""
        ],
        [
          "身高",
          ""
        ]
      ]
    },
    {
      "activity_id": 9,
      "sign": 0,
      "status": 1,
      "activity_name": "马到成功大聚会",
      "ticket_name": "早鸟票",
      "use_time": null,
      "price": "0.01",
      "createtime": 1779010726,
      "ticket_no": "64132222222228",
      "mobile": "345345345",
      "name": "234234345",
      "other": [
        [
          "姓名",
          "234234345"
        ],
        [
          "手机号",
          "345345345"
        ],
        [
          "身高",
          ""
        ],
        [
          "介绍",
          ""
        ]
      ]
    },
    {
      "activity_id": 9,
      "sign": 0,
      "status": 1,
      "activity_name": "马到成功大聚会",
      "ticket_name": "早鸟票",
      "use_time": null,
      "price": "0.01",
      "createtime": 1778018945,
      "ticket_no": "13222222222396",
      "mobile": "13222222222",
      "name": "王月",
      "other": [
        [
          "姓名",
          "王月"
        ],
        [
          "手机号",
          "13222222222"
        ],
        [
          "身高",
          ""
        ],
        [
          "介绍",
          ""
        ]
      ]
    },
    {
      "activity_id": 9,
      "sign": 0,
      "status": 1,
      "activity_name": "马到成功大聚会",
      "ticket_name": "全价票",
      "use_time": null,
      "price": "0.01",
      "createtime": 1777809729,
      "ticket_no": "72039725085648",
      "mobile": "13222222222",
      "name": "q'we",
      "other": [
        [
          "姓名",
          "q'we"
        ],
        [
          "手机号",
          "13222222222"
        ],
        [
          "身高",
          ""
        ],
        [
          "介绍",
          ""
        ]
      ]
    },
    {
      "activity_id": 6,
      "sign": 0,
      "status": 1,
      "activity_name": null,
      "ticket_name": "付费",
      "use_time": null,
      "price": "101.00",
      "createtime": 1749969397,
      "ticket_no": "69053746128975",
      "mobile": "1123",
      "name": "4645645",
      "other": [
        [
          "姓名",
          "4645645"
        ],
        [
          "手机号",
          "1123"
        ],
        [
          "单行文本",
          "123"
        ],
        [
          "日期",
          "2015-01-01 00:00:00"
        ],
        [
          "多行文本",
          "235345"
        ]
      ]
    },
    {
      "activity_id": 6,
      "sign": 0,
      "status": 1,
      "activity_name": null,
      "ticket_name": "付费",
      "use_time": null,
      "price": "101.00",
      "createtime": 1743583015,
      "ticket_no": "82095390136464",
      "mobile": "234",
      "name": "123",
      "other": [
        [
          "姓名",
          "123"
        ],
        [
          "手机号",
          "234"
        ],
        [
          "手机号",
          ""
        ],
        [
          "身高",
          ""
        ]
      ]
    },
    {
      "activity_id": 6,
      "sign": 0,
      "status": 1,
      "activity_name": null,
      "ticket_name": "免费",
      "use_time": null,
      "price": "0.00",
      "createtime": 1743489232,
      "ticket_no": "58967402593042",
      "mobile": "345345",
      "name": "234325",
      "other": [
        [
          "姓名",
          "234325"
        ],
        [
          "手机号",
          "345345"
        ],
        [
          "手机号",
          ""
        ],
        [
          "身高",
          ""
        ]
      ]
    },
    {
      "activity_id": 6,
      "sign": 0,
      "status": 1,
      "activity_name": null,
      "ticket_name": "付费",
      "use_time": null,
      "price": "101.00",
      "createtime": 1743487900,
      "ticket_no": "34795031128764",
      "mobile": "6546",
      "name": "234",
      "other": [
        [
          "姓名",
          "234"
        ],
        [
          "手机号",
          "6546"
        ],
        [
          "手机号",
          ""
        ],
        [
          "身高",
          ""
        ]
      ]
    },
    {
      "activity_id": 6,
      "sign": 0,
      "status": 1,
      "activity_name": null,
      "ticket_name": "付费",
      "use_time": null,
      "price": "101.00",
      "createtime": 1739933403,
      "ticket_no": "58522480331716",
      "mobile": "13222222222",
      "name": "礼拜",
      "other": [
        [
          "姓名",
          "礼拜"
        ],
        [
          "手机号",
          "13222222222"
        ],
        [
          "手机号",
          ""
        ],
        [
          "身高",
          ""
        ]
      ]
    },
    {
      "activity_id": 6,
      "sign": 0,
      "status": 1,
      "activity_name": null,
      "ticket_name": "免费",
      "use_time": null,
      "price": "0.00",
      "createtime": 1739933403,
      "ticket_no": "70634359201612",
      "mobile": "13222222222",
      "name": "马云",
      "other": [
        [
          "姓名",
          "马云"
        ],
        [
          "手机号",
          "13222222222"
        ],
        [
          "手机号",
          ""
        ],
        [
          "身高",
          ""
        ]
      ]
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].activity_id | integer | 活动ID |
| data[].sign | integer | 签到 |
| data[].status | integer | 状态 |
| data[].activity_name | string | 活动名称 |
| data[].ticket_name | string | 票券名称 |
| data[].use_time | null | 使用时间 |
| data[].price | string | 价格 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].ticket_no | string | 票券号 |
| data[].mobile | string | 手机号 |
| data[].name | string | 名称 |
| data[].other | array | other |
| data[].other[][] | string | other[] |
