# 获取提现记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.withdraw.getLog` |
| 接口地址 | `POST /api/user/withdraw/getLog` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 用户（user） |
| 所属控制器 | Withdraw（账户提现 - 用户端 自直播红包模块抽离为通用账户提现： 余额口径统一为 user.money（直播红包收入只是账户收入来源之一），提现不依赖直播红包插件。 说明：提现/收款账户数据存于 user_withdraw / user_withdraw_account 表（与用户关联）； 自动转账由用户余额提现转账服务 WithdrawTransferService 处理。） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `10` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}user/withdraw/getLog' \
  -H 'Content-Type: application/json' \
  -d '{"page":1,"limit":10}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508199",
  "data": {
    "total": 7,
    "rows": [
      {
        "id": 90,
        "uniacid": 1,
        "user_id": 38,
        "money": "1.00",
        "type": "alipay",
        "account_name": "冯浩森",
        "account_no": "13222222222",
        "account_ext": "",
        "transfer_no": "20260728020070011322222222257337",
        "wechat_transfer_bill_no": "",
        "wechat_transfer_state": "",
        "status": "success",
        "remark": "自动转账成功",
        "createtime": 1785228922,
        "updatetime": 1785228935,
        "type_text": "支付宝",
        "status_text": "已成功",
        "can_confirm_wechat_transfer": false,
        "wechat_transfer_state_text": ""
      },
      {
        "id": 89,
        "uniacid": 1,
        "user_id": 38,
        "money": "1.00",
        "type": "alipay",
        "account_name": "冯浩森",
        "account_no": "13222222222",
        "account_ext": "",
        "transfer_no": "20260728020070011322222222219240",
        "wechat_transfer_bill_no": "",
        "wechat_transfer_state": "",
        "status": "success",
        "remark": "自动转账成功",
        "createtime": 1785228887,
        "updatetime": 1785228888,
        "type_text": "支付宝",
        "status_text": "已成功",
        "can_confirm_wechat_transfer": false,
        "wechat_transfer_state_text": ""
      },
      {
        "id": 77,
        "uniacid": 1,
        "user_id": 38,
        "money": "1.00",
        "type": "alipay",
        "account_name": "冯浩森",
        "account_no": "13222222222",
        "account_ext": "",
        "transfer_no": "20260728020070011322222222283096",
        "wechat_transfer_bill_no": "",
        "wechat_transfer_state": "",
        "status": "success",
        "remark": "自动转账成功",
        "createtime": 1785220405,
        "updatetime": 1785228841,
        "type_text": "支付宝",
        "status_text": "已成功",
        "can_confirm_wechat_transfer": false,
        "wechat_transfer_state_text": ""
      },
      {
        "id": 61,
        "uniacid": 1,
        "user_id": 38,
        "money": "1.00",
        "type": "alipay",
        "account_name": "冯浩森",
        "account_no": "13222222222",
        "account_ext": "",
        "transfer_no": "RP2026072712415361196",
        "wechat_transfer_bill_no": "",
        "wechat_transfer_state": "",
        "status": "refuse",
        "remark": "人工处理：转账失败，已退还余额",
        "createtime": 1785124351,
        "updatetime": 1785220400,
        "type_text": "支付宝",
        "status_text": "已拒绝",
        "can_confirm_wechat_transfer": false,
        "wechat_transfer_state_text": ""
      },
      {
        "id": 59,
        "uniacid": 1,
        "user_id": 38,
        "money": "1.00",
        "type": "alipay",
        "account_name": "冯浩森",
        "account_no": "13222222222",
        "account_ext": "",
        "transfer_no": "RP2026072710132359309",
        "wechat_transfer_bill_no": "",
        "wechat_transfer_state": "",
        "status": "fail",
        "remark": "支付宝应用公钥证书未配置，请上传 appCertPublicKey_*.crt 文件",
        "createtime": 1785118394,
        "updatetime": 1785209903,
        "type_text": "支付宝",
        "status_text": "转账失败",
        "can_confirm_wechat_transfer": false,
        "wechat_transfer_state_text": ""
      },
      {
        "id": 13,
        "uniacid": 1,
        "user_id": 38,
        "money": "2.00",
        "type": "alipay",
        "account_name": "冯浩森",
        "account_no": "13222222222",
        "account_ext": "",
        "transfer_no": "RP2026072113222222222",
        "wechat_transfer_bill_no": "",
        "wechat_transfer_state": "",
        "status": "fail",
        "remark": "转账异常：ERROR_GATEWAY: Get Alipay API Error:Invalid Arguments - isv.missing-app-cert-sn",
        "createtime": 1784631784,
        "updatetime": 1785135737,
        "type_text": "支付宝",
        "status_text": "转账失败",
        "can_confirm_wechat_transfer": false,
        "wechat_transfer_state_text": ""
      },
      {
        "id": 12,
        "uniacid": 1,
        "user_id": 38,
        "money": "1.00",
        "type": "bank",
        "account_name": "1232",
        "account_no": "4234234",
        "account_ext": "234234",
        "transfer_no": "WD20260721132222222225",
        "wechat_transfer_bill_no": "",
        "wechat_transfer_state": "",
        "status": "success",
        "remark": "你好",
        "createtime": 1784628070,
        "updatetime": 1785220381,
        "type_text": "银行卡",
        "status_text": "已成功",
        "can_confirm_wechat_transfer": false,
        "wechat_transfer_state_text": ""
      }
    ]
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.total | integer | 合计 |
| data.rows | array | rows |
| data.rows[].id | integer | ID |
| data.rows[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.rows[].user_id | integer | 用户ID |
| data.rows[].money | string | 金额 |
| data.rows[].type | string | 类型 |
| data.rows[].account_name | string | 账号名称 |
| data.rows[].account_no | string | 账号号 |
| data.rows[].account_ext | string | 账号ext |
| data.rows[].transfer_no | string | transfer号 |
| data.rows[].wechat_transfer_bill_no | string | 微信transferbill号 |
| data.rows[].wechat_transfer_state | string | 微信transferstate |
| data.rows[].status | string | 状态 |
| data.rows[].remark | string | 备注 |
| data.rows[].createtime | integer | 创建时间（时间戳） |
| data.rows[].updatetime | integer | 更新时间（时间戳） |
| data.rows[].type_text | string | 类型说明 |
| data.rows[].status_text | string | 状态说明 |
| data.rows[].can_confirm_wechat_transfer | boolean | 是否可confirm微信transfer |
| data.rows[].wechat_transfer_state_text | string | 微信transferstatetext |
