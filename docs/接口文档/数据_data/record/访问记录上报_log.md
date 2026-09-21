# 访问记录上报

> 过滤掉登录页和外部浏览器页面的记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `data.record` |
| 接口地址 | `POST /api/data/record/log` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 数据（data） |
| 所属控制器 | Record（访问记录） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| url | string | 否 | 链接 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}data/record/log' \
  -H 'Content-Type: application/json' \
  -d '{"url":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
