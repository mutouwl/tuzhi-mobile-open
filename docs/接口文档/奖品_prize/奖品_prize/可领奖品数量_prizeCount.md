# 可领奖品数量

> 未领取且未过期的奖品数。个人中心那一格自 2026-10-05 起改读 user/info 下发的 prize_num，本口只留兜底。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `prize.prize.count` |
| 接口地址 | `POST /api/prize/prize/prizeCount` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 奖品（prize） |
| 所属控制器 | Prize（的登录闸门与权限节点是两道」），四口全部需要登录——奖品列表与地址簿都是本人的东西。） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}prize/prize/prizeCount' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344796",
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

## 备注

- 老版本客户端调的正是本口；新客户端在 prize_num 缺失时补取一次，两处口径同为 MyPrize::summary()
