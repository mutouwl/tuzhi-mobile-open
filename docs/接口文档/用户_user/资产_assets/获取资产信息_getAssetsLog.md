# 获取资产信息

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.assets.getAssetsLog` |
| 接口地址 | `POST /api/user/assets/getAssetsLog` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Assets（用户资产） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| mode | integer | 否 | 模式 | `0` |
| time | string | 否 | 时间 | `time(` |
| type | string | 否 | 类型 | `money` |

## 请求示例

```bash
curl -X POST '{apiUrl}user/assets/getAssetsLog' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"mode":0,"time":"time(","type":"money"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508195",
  "data": [
    {
      "id": 1347,
      "uniacid": 1,
      "user_id": 38,
      "money": "-23.00",
      "before": "96494.49",
      "after": "96471.49",
      "memo": "余额支付",
      "createtime": 1786148546,
      "value": "-23.00"
    },
    {
      "id": 1345,
      "uniacid": 1,
      "user_id": 38,
      "money": "-23.00",
      "before": "96517.49",
      "after": "96494.49",
      "memo": "余额支付",
      "createtime": 1786114411,
      "value": "-23.00"
    },
    {
      "id": 1344,
      "uniacid": 1,
      "user_id": 38,
      "money": "-23.00",
      "before": "96540.49",
      "after": "96517.49",
      "memo": "余额支付",
      "createtime": 1786114056,
      "value": "-23.00"
    },
    {
      "id": 1343,
      "uniacid": 1,
      "user_id": 38,
      "money": "-23.00",
      "before": "96563.49",
      "after": "96540.49",
      "memo": "余额支付",
      "createtime": 1786086760,
      "value": "-23.00"
    },
    {
      "id": 1342,
      "uniacid": 1,
      "user_id": 38,
      "money": "-23.00",
      "before": "96586.49",
      "after": "96563.49",
      "memo": "余额支付",
      "createtime": 1786076065,
      "value": "-23.00"
    },
    {
      "id": 1334,
      "uniacid": 1,
      "user_id": 38,
      "money": "-2.00",
      "before": "96588.49",
      "after": "96586.49",
      "memo": "余额支付",
      "createtime": 1785812333,
      "value": "-2.00"
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
| data[].money | string | 金额 |
| data[].before | string | 购买前 |
| data[].after | string | after |
| data[].memo | string | memo |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].value | string | 值 |
