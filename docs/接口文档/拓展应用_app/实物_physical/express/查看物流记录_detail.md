# 查看物流记录

> 无需物流发货的订单：无物流单且订单已完成

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `physical.express.detail` |
| 接口地址 | `POST /api/app/physical/express/detail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Express（物流接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 否 | 订单号 | `` |
| express_no | string | 否 | 物流号 | `` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/physical/express/detail' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":"","express_no":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508207",
  "data": {
    "express_name": "",
    "express_code": "",
    "express_no": "",
    "status": "noexpress",
    "status_text": "无需物流",
    "order_id": 2115,
    "logs": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.express_name | string | 物流名称 |
| data.express_code | string | 物流code |
| data.express_no | string | 物流号 |
| data.status | string | 状态 |
| data.status_text | string | 状态说明 |
| data.order_id | integer | 订单ID |
| data.logs | array | logs |
