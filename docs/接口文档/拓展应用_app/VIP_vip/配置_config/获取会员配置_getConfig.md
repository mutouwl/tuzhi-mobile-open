# 获取会员配置

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.vip.config` |
| 接口地址 | `POST /api/app/vip/config/getConfig` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Config（配置） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/vip/config/getConfig' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508175",
  "data": {
    "status": "1",
    "entrance": "1",
    "exchange": "1"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.status | string | 状态 |
| data.entrance | string | entrance |
| data.exchange | string | 兑换 |
