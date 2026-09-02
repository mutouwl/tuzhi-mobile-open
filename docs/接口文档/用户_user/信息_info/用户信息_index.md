# 用户信息

> 会员中心

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.info.index` |
| 接口地址 | `POST /api/user/info/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Info（会员接口） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}user/info/index' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "",
  "time": "1786508145",
  "data": {
    "id": 38,
    "username": "13222222222",
    "nickname": "冯浩森@凸知",
    "platform": null,
    "openid": "****",
    "mobile": "13222222222",
    "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
    "money": "96471.49",
    "score": 4342,
    "token": "****",
    "user_id": 38,
    "uniacid": 0,
    "createtime": 1786508141,
    "expiretime": 1789100141,
    "expires_in": 2591996,
    "coupon_num": 10,
    "update_info_modal": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.username | string | 用户名 |
| data.nickname | string | 昵称 |
| data.platform | null | 平台 |
| data.openid | string | OpenID |
| data.mobile | string | 手机号 |
| data.avatar | string | 头像 |
| data.money | string | 金额 |
| data.score | integer | 积分 |
| data.token | string | 登录凭证 |
| data.user_id | integer | 用户ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.createtime | integer | 创建时间（时间戳） |
| data.expiretime | integer | 过期时间（时间戳） |
| data.expires_in | integer | 有效期（秒） |
| data.coupon_num | integer | 优惠券数量 |
| data.update_info_modal | integer | 完善资料弹窗开关 |
