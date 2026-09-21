# 优惠券列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/coupon/coupon/index` |
| 接口地址 | `POST /api/app/coupon/coupon/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| ids | string | 否 | ID集合 | `` |
| list_rows | integer | 否 | 列表rows | `10` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/coupon/coupon/index' \
  -H 'Content-Type: application/json' \
  -d '{"ids":"","list_rows":10}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
