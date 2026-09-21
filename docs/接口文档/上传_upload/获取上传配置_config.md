# 获取上传配置

> 上传分流配置（白名单过滤，严禁透传 accessKeySecret/accessKeyId） 移动端据此判断：oss.client 直传 / vod 直传 / 服务器上传

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `upload.config` |
| 接口地址 | `POST /api/upload/config` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 上传（upload） |
| 所属控制器 | Upload（上传接口 image/uploadBase64 为无需登录的服务器直传（既有）； config/ossParams/vodUrl/vodRefresh/vodNotify/ossNotify 为 App 登录态直传端点（新增）： - OSS 直传回调复用 addons/alioss/index/notify（aliosstoken 校验，无 admin 锁），   回调不可达的部署场景由 ossNotify 客户端补记（幂等） - VOD 上传凭证由阿里云 CreateUploadVideo 签发（STS 临时凭证，自动过期），   上传成功后由 vodNotify 补记 Attachment（storage=alivod, url=videoId） - 客户端不接触主 AK/Secret） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}upload/config' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509546",
  "data": {
    "oss": {
      "status": "close",
      "uploadmode": "client",
      "direct": 0,
      "uploadurl": "https://tuzistudy.oss-cn-beijing.aliyuncs.com",
      "cdnurl": "https://tuzistudy.oss-cn-beijing.aliyuncs.com",
      "maxsize": "1000M",
      "expire": 999999
    },
    "vod": {
      "status": "close",
      "direct": 0
    },
    "server": {
      "maxsize": "50mb"
    }
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.oss | object | oss |
| data.oss.status | string | 状态 |
| data.oss.uploadmode | string | uploadmode |
| data.oss.direct | integer | direct |
| data.oss.uploadurl | string | uploadurl |
| data.oss.cdnurl | string | cdnurl |
| data.oss.maxsize | string | maxsize |
| data.oss.expire | integer | 过期 |
| data.vod | object | vod |
| data.vod.status | string | 状态 |
| data.vod.direct | integer | direct |
| data.server | object | server |
| data.server.maxsize | string | maxsize |
