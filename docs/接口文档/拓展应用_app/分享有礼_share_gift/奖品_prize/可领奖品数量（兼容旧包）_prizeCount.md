# 可领奖品数量（兼容旧包）

> 未领取且未过期的奖品数，口径与核心接口共用同一个 MyPrize::summary()，两处不允许各算一遍。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/share_gift/prize/prizeCount` |
| 接口地址 | `POST /api/app/share_gift/prize/prizeCount` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Prize（分享有礼「奖品」三口的**兼容转发壳**（2026-10-03 起不再有任何业务逻辑）） |
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
curl -X POST '{apiUrl}app/share_gift/prize/prizeCount' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344799",
  "data": {
    "total": 0
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
