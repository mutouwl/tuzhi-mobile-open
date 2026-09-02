# 检测Token是否过期

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `token/check` |
| 接口地址 | `POST /api/token/check` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | token（token） |
| 所属控制器 | Token（Token接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}token/check' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "",
  "time": "1786509560",
  "data": {
    "token": "****",
    "expires_in": 2591985
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.token | string | 登录凭证 |
| data.expires_in | integer | 有效期（秒） |
