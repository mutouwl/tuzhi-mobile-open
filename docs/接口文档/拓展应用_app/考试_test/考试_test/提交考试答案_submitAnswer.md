# 提交考试答案

> 提交考试答案 学员每次点选完题目后，都会调用该接口

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.test.submitAnswer` |
| 接口地址 | `POST /api/app/test/test/submitAnswer` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Test（考试） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| answer | string | 否 | 答案 | - |
| id | string | 否 | ID | - |
| question_id | string | 否 | 题目ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/test/test/submitAnswer' \
  -H 'Content-Type: application/json' \
  -d '{"answer":"xxx","id":"xxx","question_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
