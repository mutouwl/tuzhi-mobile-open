# OSS 附件补记

> OSS 附件补记（OSS 回调不可达的部署由客户端补记；幂等）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `upload.ossNotify` |
| 接口地址 | `POST /api/upload/ossNotify` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 上传（upload） |
| 所属控制器 | Upload（上传接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| url | string | 否 | 链接 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}upload/ossNotify' \
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
