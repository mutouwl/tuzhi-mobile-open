# 提交表单

> 处理编辑模式

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.form.submit` |
| 接口地址 | `POST /api/app/form/form/submit` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Form（表单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| form_id | string | 否 | 表单ID | - |
| log_id | string | 否 | 记录ID | - |
| row | string | 否 | row | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/form/form/submit' \
  -H 'Content-Type: application/json' \
  -d '{"form_id":"xxx","log_id":"xxx","row":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
