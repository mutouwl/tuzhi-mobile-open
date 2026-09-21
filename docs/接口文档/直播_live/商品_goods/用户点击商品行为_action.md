# 用户点击商品行为

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.goods.action` |
| 接口地址 | `POST /api/live/goods/action` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 直播（live） |
| 所属控制器 | Goods（直播带货） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| live_id | string | 否 | liveID | - |
| goods_id | string | 否 | 商品ID | - |
| goods_type | string | 否 | 商品类型 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}live/goods/action' \
  -H 'Content-Type: application/json' \
  -d '{"live_id":"xxx","goods_id":"xxx","goods_type":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
