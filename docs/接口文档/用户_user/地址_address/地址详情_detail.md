# 地址详情

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.address.detail` |
| 接口地址 | `POST /api/user/address/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Address（收货地址控制器 用于管理用户收货地址） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | `2` |

## 请求示例

```bash
curl -X POST '{apiUrl}user/address/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":2}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508202",
  "data": {
    "id": 2,
    "user_id": 38,
    "uniacid": 1,
    "name": "冯浩森",
    "mobile": "13222222222",
    "province": "河北省",
    "city": "秦皇岛市",
    "district": "北戴河区",
    "address": "123",
    "is_default": 1,
    "createtime": 1778997131,
    "updatetime": 1778997131
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
| data.user_id | integer | 用户ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.name | string | 名称 |
| data.mobile | string | 手机号 |
| data.province | string | 省 |
| data.city | string | 市 |
| data.district | string | 区/县 |
| data.address | string | 地址 |
| data.is_default | integer | 是否默认 |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
