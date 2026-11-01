# 收货地址列表（兼容旧包）

> 实物奖品领取前选那一张地址簿，只回本人地址；默认地址在前。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/share_gift/prize/addresses` |
| 接口地址 | `POST /api/app/share_gift/prize/addresses` |
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
curl -X POST '{apiUrl}app/share_gift/prize/addresses' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344798",
  "data": {
    "rows": [
      {
        "id": 2,
        "name": "冯浩森",
        "mobile": "176****2595",
        "province": "河北省",
        "city": "秦皇岛市",
        "district": "北戴河区",
        "address": "123",
        "is_default": 1
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
| data.rows | array | 本页数据行数组 |
| data.rows[].id | integer | ID |
| data.rows[].name | string | 名称 |
| data.rows[].mobile | string | 手机号 |
| data.rows[].province | string | 省 |
| data.rows[].city | string | 市 |
| data.rows[].district | string | 区/县 |
| data.rows[].address | string | 地址 |
| data.rows[].is_default | integer | 是否默认 |

## 备注

- 这一段查询与核心接口 prize/prize/addresses 逐字相同，是有意重复：整个转发壳被删时连同这段一起删
