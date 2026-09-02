# 通过 ids 获取组合商品（不分页）

> 虚拟支付价格转换

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `composite.composite.ids` |
| 接口地址 | `POST /api/app/composite/goods/ids` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（组合商品接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| ids | string | 否 | ID集合 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/composite/goods/ids' \
  -H 'Content-Type: application/json' \
  -d '{"ids":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
