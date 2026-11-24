# 刷题本列表

> 刷题本列表（全部上架刷题本，不按权益过滤） 与 `list()`（我的刷题本）的差别只有「权益过滤」这一档：本接口不看订阅/购买， 凡「状态正常 ∧ 未隐藏」的刷题本全部摆出（自定义页面「刷题本列表」这类入口用）， 点进详情后再按 `is_auth` / 详情页底栏走购买或去学习。 行形状与 `list()` 共用 `rowOf()`，两处不会出现「同一本卡上说法不一」。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.index.allList` |
| 接口地址 | `POST /api/app/drill_book/books/allList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Books（我的刷题本（个人中心入口 / 分类列表）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | 关键词 | - |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `15` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/books/allList' \
  -H 'Content-Type: application/json' \
  -d '{"keyword":"xxx","page":1,"limit":15}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
