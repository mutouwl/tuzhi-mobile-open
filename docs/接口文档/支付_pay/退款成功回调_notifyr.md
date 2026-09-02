# 退款成功回调

> 编写退款逻辑

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `pay/notifyr` |
| 接口地址 | `POST /api/pay/notifyr` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 支付（pay） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}pay/notifyr' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
