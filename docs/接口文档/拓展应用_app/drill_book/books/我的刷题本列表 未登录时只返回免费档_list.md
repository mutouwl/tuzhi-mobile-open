# 我的刷题本列表 未登录时只返回免费档

> 我的刷题本列表 未登录时只返回免费档（与「刷题本商品列表」同一批数据，便于访客浏览后登录购买）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.index.list` |
| 接口地址 | `POST /api/app/drill_book/books/list` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Books（我的刷题本（个人中心入口 / 分类列表）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | 关键词 | - |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `20` |
| group_id | integer | 否 | 分组ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/books/list' \
  -H 'Content-Type: application/json' \
  -d '{"keyword":"xxx","page":1,"limit":20,"group_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
