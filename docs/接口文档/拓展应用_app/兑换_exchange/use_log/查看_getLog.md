# 查看

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exchange.getLog` |
| 接口地址 | `POST /api/app/exchange/use_log/getLog` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | UseLog（兑换记录） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/exchange/use_log/getLog' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508170",
  "data": [
    {
      "id": 12,
      "uniacid": 1,
      "user_id": 38,
      "code": "h5uUIf9xDa",
      "goods_id": 111,
      "batch_id": 12,
      "createtime": 1758595896,
      "batch": {
        "name": "抖店商品"
      },
      "course": {
        "name": null,
        "type": null
      }
    },
    {
      "id": 8,
      "uniacid": 1,
      "user_id": 38,
      "code": "NARsrade0B",
      "goods_id": 69,
      "batch_id": 7,
      "createtime": 1742349453,
      "batch": {
        "name": "课程兑换码测试"
      },
      "course": {
        "name": "[演示]从nlp思维模型看产品经理的思考框架和职业发展",
        "type": "video"
      }
    },
    {
      "id": 9,
      "uniacid": 1,
      "user_id": 38,
      "code": "NARsrade0B",
      "goods_id": 68,
      "batch_id": 7,
      "createtime": 1742349453,
      "batch": {
        "name": "课程兑换码测试"
      },
      "course": {
        "name": "[演示]年轻人如何打造个人IP—做120分职场人",
        "type": "video"
      }
    },
    {
      "id": 10,
      "uniacid": 1,
      "user_id": 38,
      "code": "NARsrade0B",
      "goods_id": 28,
      "batch_id": 7,
      "createtime": 1742349453,
      "batch": {
        "name": "课程兑换码测试"
      },
      "course": {
        "name": "[演示]考纲词汇及词法第一讲11",
        "type": "video"
      }
    },
    {
      "id": 5,
      "uniacid": 1,
      "user_id": 38,
      "code": "nmQoOeM0jX",
      "goods_id": 88,
      "batch_id": 4,
      "createtime": 1724209265,
      "batch": {
        "name": "434434"
      },
      "course": {
        "name": null,
        "type": null
      }
    },
    {
      "id": 6,
      "uniacid": 1,
      "user_id": 38,
      "code": "nmQoOeM0jX",
      "goods_id": 72,
      "batch_id": 4,
      "createtime": 1724209265,
      "batch": {
        "name": "434434"
      },
      "course": {
        "name": null,
        "type": null
      }
    },
    {
      "id": 7,
      "uniacid": 1,
      "user_id": 38,
      "code": "nmQoOeM0jX",
      "goods_id": 32,
      "batch_id": 4,
      "createtime": 1724209265,
      "batch": {
        "name": "434434"
      },
      "course": {
        "name": null,
        "type": null
      }
    },
    {
      "id": 4,
      "uniacid": 1,
      "user_id": 38,
      "code": "mBWliL1I2G",
      "goods_id": 69,
      "batch_id": 2,
      "createtime": 1712133417,
      "batch": {
        "name": "私密"
      },
      "course": {
        "name": "[演示]从nlp思维模型看产品经理的思考框架和职业发展",
        "type": "video"
      }
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
| data[].id | integer | ID |
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].user_id | integer | 用户ID |
| data[].code | string | code |
| data[].goods_id | integer | 商品ID |
| data[].batch_id | integer | batchID |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].batch | object | batch |
| data[].batch.name | string | 名称 |
| data[].course | object | 课程 |
| data[].course.name | null | 名称 |
| data[].course.type | null | 类型 |
