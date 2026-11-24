# 从错题本移除题目

> 从错题本移除题目（单题 / 批量同一支） 口径同练习的 error_book_show=2；`question_ids` 支持逗号分隔串、数组、JSON 数组三档， `question_id` 保留为单题调用的兼容位。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.wrong.remove` |
| 接口地址 | `POST /api/app/drill_book/wrong/remove` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Wrong（错题本（刷题 / 试卷 两个页签 + 题目列表 + 批量移除 + 重练）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| question_ids | string | 否 | 题目ID集合 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/wrong/remove' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","question_ids":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
