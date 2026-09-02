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
| 所属控制器 | Upload（上传接口 image/uploadBase64 为无需登录的服务器直传（既有）； config/ossParams/vodUrl/vodRefresh/vodNotify/ossNotify 为 App 登录态直传端点（新增）： - OSS 直传回调复用 addons/alioss/index/notify（aliosstoken 校验，无 admin 锁），   回调不可达的部署场景由 ossNotify 客户端补记（幂等） - VOD 上传凭证由阿里云 CreateUploadVideo 签发（STS 临时凭证，自动过期），   上传成功后由 vodNotify 补记 Attachment（storage=alivod, url=videoId） - 客户端不接触主 AK/Secret） |
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
