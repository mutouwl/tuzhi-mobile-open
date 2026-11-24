# 开始答题：按设置抽题并建

> 开始答题：按设置抽题并建（或续用）刷题记录 抽题口径： - 出题模式 random：把目录题集洗牌后取前 N 条 - 出题模式 sort：按目录顺序取前 N 条 - 目录挂了随机选题规则时，规则抽出的题先参与（随机规则的语义就是「每次都不一样」），   固定题按模式决定是否洗牌；N>0 时截断。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.practice.start` |
| 接口地址 | `POST /api/app/drill_book/practice/start` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Practice（刷题（目录 → 刷题设置 → 开始答题）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| catalog_id | integer | 否 | catalogID | `0` |
| question_mode | string | 否 | 题目mode | `sort` |
| answer_mode | string | 否 | 答案mode | `practice` |
| question_count | integer | 否 | 题目数量 | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/practice/start' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","catalog_id":0,"question_mode":"sort","answer_mode":"practice","question_count":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
