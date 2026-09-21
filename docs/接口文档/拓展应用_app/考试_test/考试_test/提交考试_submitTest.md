# 提交考试

> 交卷时兜底保存所有题型答案，避免实时提交失败导致选择题丢答案。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.test.submitTest` |
| 接口地址 | `POST /api/app/test/test/submitTest` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Test（考试） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/test/test/submitTest' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
