# 获取礼物列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.gift.options` |
| 接口地址 | `POST /api/live/gift/getGiftOptions` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 直播（live） |
| 所属控制器 | Gift（直播带货） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}live/gift/getGiftOptions' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508183",
  "data": [
    {
      "id": 11,
      "uniacid": 1,
      "name": "打火机",
      "price": "10.00",
      "icon": "https://tuzhi.mutouweb.com/uploads/1/20250821/f18048b8171f2f5027d062ab7a1af115.jpeg",
      "status": 1,
      "weigh": 11,
      "createtime": 1780127176,
      "status_text": "Status 1"
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].name | string | 名称 |
| data[].price | string | 价格 |
| data[].icon | string | icon |
| data[].status | integer | 状态 |
| data[].weigh | integer | 权重（排序值） |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].status_text | string | 状态说明 |
