# 获取特权商品列表

> 获取card详情

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.vip.goods` |
| 接口地址 | `POST /api/app/vip/card_privilege/getGoodsList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | CardPrivilege（付费会员卡） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| type | string | 否 | 类型 | `` |
| name | string | 否 | 名称 | `` |
| sort | string | 否 | 排序 | `time` |
| order | string | 否 | 订单 | `desc` |
| privilege_type | string | 否 | 权益类型 | `free` |
| card_id | string | 否 | 卡片ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/vip/card_privilege/getGoodsList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"type":"","name":"","sort":"time","order":"desc","privilege_type":"free","card_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
