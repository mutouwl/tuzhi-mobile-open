# 指定商品清单（分页）

> 先切页再查商品：范围最多 200 条，逐条 describe 九类表，不切页会为翻到第二页那几件

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.score.consumeGoods` |
| 接口地址 | `POST /api/app/score/consume/goods` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Consume（积分任务「消费发放 → 指定商品」清单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| source | string | 否 | source | `base` |
| activity_id | integer | 否 | 活动ID | `0` |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `10` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/score/consume/goods' \
  -H 'Content-Type: application/json' \
  -d '{"source":"base","activity_id":0,"page":1,"limit":10}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
