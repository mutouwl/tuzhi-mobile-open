# 获取登录信息

> 系统名称

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/pc/login/loginInfo` |
| 接口地址 | `POST /api/app/pc/login/loginInfo` |
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
curl -X POST '{apiUrl}app/pc/login/loginInfo' \
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
    "name": "凸知学堂",
    "can_wechat_login": true,
    "is_login": true,
    "mobile_login": "open"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.name | string | 名称 |
| data.can_wechat_login | boolean | 是否可微信login |
| data.is_login | boolean | 是否login |
| data.mobile_login | string | 手机号login |
