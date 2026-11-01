# 我的收货地址列表

> 实物奖品领取前选地址，复用系统既有地址簿（user/address/index），奖品侧不再长第二套地址表单。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `prize.prize.addresses` |
| 接口地址 | `POST /api/prize/prize/addresses` |
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
curl -X POST '{apiUrl}prize/prize/addresses' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344795",
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
