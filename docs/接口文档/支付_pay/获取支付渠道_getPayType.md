# 获取支付渠道

> 余额不再区分来源（含直播红包），全部可用于支付

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `pay.getPayType` |
| 接口地址 | `POST /api/pay/getPayType` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 支付（pay） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}pay/getPayType' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508150",
  "data": [
    {
      "name": "余额支付",
      "type": "balance",
      "index": 1,
      "subname": "可用余额 ¥96471.49"
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
| data[].name | string | 名称 |
| data[].type | string | 类型 |
| data[].index | integer | 列表 |
| data[].subname | string | subname |
