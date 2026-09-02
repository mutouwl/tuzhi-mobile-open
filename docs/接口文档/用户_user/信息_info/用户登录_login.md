# 用户登录

> 手机号密码登录，成功后返回用户信息与登录凭证 token，后续请求需在请求头携带 token。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.info.login` |
| 接口地址 | `POST /api/user/info/login` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Info（会员接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| account | string | 是 | 手机号（11 位，需符合 ^1\d{10}$） | - |
| password | string | 是 | 登录密码 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}user/info/login' \
  -H 'Content-Type: application/json' \
  -d '{"account":"xxx","password":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "登录成功",
  "time": "1786508396",
  "data": {
    "userinfo": {
      "id": 38,
      "username": "13222222222",
      "nickname": "冯浩森@凸知",
      "platform": null,
      "openid": "****",
      "mobile": "13222222222",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
      "money": "96471.49",
      "score": 4442,
      "token": "****",
      "user_id": 38,
      "uniacid": 0,
      "createtime": 1786508396,
      "expiretime": 1789100396,
      "expires_in": 2592000
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
| data.userinfo | object | 用户信息对象 |
| data.userinfo.id | integer | 用户 ID |
| data.userinfo.username | string | 用户名（通常为手机号） |
| data.userinfo.nickname | string | 昵称 |
| data.userinfo.platform | null | 平台 |
| data.userinfo.openid | string | OpenID |
| data.userinfo.mobile | string | 手机号 |
| data.userinfo.avatar | string | 头像地址 |
| data.userinfo.money | string | 余额 |
| data.userinfo.score | integer | 积分 |
| data.userinfo.token | string | 登录凭证，后续请求放入请求头 token |
| data.userinfo.user_id | integer | 用户 ID（与 id 一致） |
| data.userinfo.uniacid | integer | 应用ID（公众号/uniacid） |
| data.userinfo.createtime | integer | 创建时间（时间戳） |
| data.userinfo.expiretime | integer | token 过期时间戳 |
| data.userinfo.expires_in | integer | token 有效期（秒） |

## 备注

- 登录成功后请保存 token（如 uni.setStorageSync('user_token', token)），前端请求拦截器会自动携带
- 登录失败时 code=0，msg 为具体原因（如账号不存在、密码错误）
- 该接口无需登录（auth=false）
