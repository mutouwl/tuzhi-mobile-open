# 我的收藏（题目列表，可分页）

> 搜索下推 SQL：题目正文在题目表里，先按题干命中筛出题目 id 再约束收藏行，

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.mine.collects` |
| 接口地址 | `POST /api/app/drill_book/mine/collects` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Mine（我的收藏 / 练习历史（两个入口同族，都是「读我自己的记录」）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| keyword | string | 否 | 关键词 | - |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/mine/collects' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","keyword":"xxx","page":1,"limit":20}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
