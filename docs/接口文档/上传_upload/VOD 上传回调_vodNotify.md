# VOD 上传回调

> VOD 附件补记（客户端直传成功后调用；storage=alivod, url=videoId；幂等） 先校验源文件已真正落桶（Range 探测 mezzanine 源文件地址），防止"客户端报成功但文件未落"导致视频永久"处理中"

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `upload.vodNotify` |
| 接口地址 | `POST /api/upload/vodNotify` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 上传（upload） |
| 所属控制器 | Upload（上传接口 image/uploadBase64 为无需登录的服务器直传（既有）； config/ossParams/vodUrl/vodRefresh/vodNotify/ossNotify 为 App 登录态直传端点（新增）： - OSS 直传回调复用 addons/alioss/index/notify（aliosstoken 校验，无 admin 锁），   回调不可达的部署场景由 ossNotify 客户端补记（幂等） - VOD 上传凭证由阿里云 CreateUploadVideo 签发（STS 临时凭证，自动过期），   上传成功后由 vodNotify 补记 Attachment（storage=alivod, url=videoId） - 客户端不接触主 AK/Secret） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| url | string | 否 | 链接 | `` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}upload/vodNotify' \
  -H 'Content-Type: application/json' \
  -d '{"url":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
