# 获取登录地址

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/pc/login/pcLoginPath` |
| 接口地址 | `POST /api/app/pc/login/pcLoginPath` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Login（登录） |
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
curl -X POST '{apiUrl}app/pc/login/pcLoginPath' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509554",
  "data": {
    "path": "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0000000000000000&redirect_uri=https%3A%2F%2Ftuzhi.mutouweb.com%2Findex.php%3Fi%3D1%26route%3Dapi%2Fapp/pc/login/pcLoginCallback/ticket/76ta1lzImS&response_type=code&scope=snsapi_userinfo&state=https://tuzhi.mutouweb.com/index.php?i=1&route=…（已截断，共 304 字符）",
    "ticket": "76ta1lzImS"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.path | string | path |
| data.ticket | string | 票券 |
