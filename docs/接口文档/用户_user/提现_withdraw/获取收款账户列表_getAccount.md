# 获取收款账户列表

> 检查微信绑定状态

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.withdraw.getAccount` |
| 接口地址 | `POST /api/user/withdraw/getAccount` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 用户（user） |
| 所属控制器 | Withdraw（账户提现 - 用户端 自直播红包模块抽离为通用账户提现： 余额口径统一为 user.money（直播红包收入只是账户收入来源之一），提现不依赖直播红包插件。 说明：提现/收款账户数据存于 user_withdraw / user_withdraw_account 表（与用户关联）； 自动转账由用户余额提现转账服务 WithdrawTransferService 处理。） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}user/withdraw/getAccount' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508195",
  "data": {
    "list": [
      {
        "id": 40,
        "uniacid": 1,
        "user_id": 38,
        "type": "bank",
        "name": "冯浩森",
        "account": "6274983943423434",
        "ext": "港式",
        "is_default": 0,
        "createtime": 1785059237,
        "updatetime": 1785059237
      },
      {
        "id": 39,
        "uniacid": 1,
        "user_id": 38,
        "type": "bank",
        "name": "冯浩森",
        "account": "6274983943423434",
        "ext": "港式",
        "is_default": 0,
        "createtime": 1785059237,
        "updatetime": 1785059237
      },
      {
        "id": 1,
        "uniacid": 1,
        "user_id": 38,
        "type": "alipay",
        "name": "冯浩森",
        "account": "13222222222",
        "ext": "",
        "is_default": 0,
        "createtime": 1784624932,
        "updatetime": 1785048000
      }
    ],
    "wechat_bound": false
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 列表 |
| data.list[].id | integer | ID |
| data.list[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.list[].user_id | integer | 用户ID |
| data.list[].type | string | 类型 |
| data.list[].name | string | 名称 |
| data.list[].account | string | 账号 |
| data.list[].ext | string | ext |
| data.list[].is_default | integer | 是否默认 |
| data.list[].createtime | integer | 创建时间（时间戳） |
| data.list[].updatetime | integer | 更新时间（时间戳） |
| data.wechat_bound | boolean | 微信bound |
