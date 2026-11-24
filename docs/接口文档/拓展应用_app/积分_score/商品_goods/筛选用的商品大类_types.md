# 筛选用的商品大类

> 筛选用的商品大类（列表 `type` 参数的可选值，前端不写死） 与列表同一把尺：只给此刻真能摆出来的大类（`TypeGate::available()`，未装插件的那几档不出现）， 否则会筛出一个必然为空的分档。首项「全部」= 不按类型筛（空串）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.score.types` |
| 接口地址 | `POST /api/app/score/goods/types` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（积分商城） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/score/goods/types' \
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
