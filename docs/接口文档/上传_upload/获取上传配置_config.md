# 获取上传配置

> 上传分流配置（白名单过滤，严禁透传 accessKeySecret/accessKeyId） 移动端据此判断：oss.client 直传 / vod 直传 / 服务器上传 读库内最新值：后台关闭云存储后必须立即停止下发直传参数，否则客户端仍会直传

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `upload.config` |
| 接口地址 | `POST /api/upload/config` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 上传（upload） |
| 所属控制器 | Upload（上传接口） |
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
