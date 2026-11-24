# 练习历史

> 练习历史（刷题 / 试卷 两个页签） 已交卷与进行中两类都列（参照产品历史列表里就有「未完成」），进行中的点进去接着答。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.mine.history` |
| 接口地址 | `POST /api/app/drill_book/mine/history` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Mine（我的收藏 / 练习历史（两个入口同族，都是「读我自己的记录」）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| source | string | 否 | source | `practice` |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `20` |
| keyword | string | 否 | 关键词 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/mine/history' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","source":"practice","page":1,"limit":20,"keyword":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
