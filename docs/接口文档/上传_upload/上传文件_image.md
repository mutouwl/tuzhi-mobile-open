# 上传文件

> 判断是否已经存在附件

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `upload/image` |
| 接口地址 | `POST /api/upload/image` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 上传（upload） |
| 所属控制器 | Upload（上传接口） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| file | File | 否 | 文件流 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}upload/image' \
  -H 'Content-Type: application/json' \
  -d '{"file":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
