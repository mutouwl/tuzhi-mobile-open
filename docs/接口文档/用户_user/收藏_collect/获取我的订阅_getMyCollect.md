# 获取我的订阅

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.collect.getMyCollect` |
| 接口地址 | `POST /api/user/collect/getMyCollect` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Collect（用户shocking） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| type | string | 否 | 类型 | `all` |

## 请求示例

```bash
curl -X POST '{apiUrl}user/collect/getMyCollect' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"type":"all"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508197",
  "data": [
    {
      "id": 108,
      "uniacid": 1,
      "user_id": 38,
      "item_id": 214,
      "type": "course",
      "createtime": 1763105296,
      "course": {
        "id": 214,
        "name": "小燕子视频1",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250707/7bc58d0d4f208bfd4459703820a53c4a.jpg",
        "type": "video"
      }
    },
    {
      "id": 102,
      "uniacid": 1,
      "user_id": 38,
      "item_id": 68,
      "type": "course",
      "createtime": 1752538553,
      "course": {
        "id": 68,
        "name": "[演示]年轻人如何打造个人IP—做120分职场人",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20240118/2e2d50d2e882b2bdab7dc8f2efb358d8.jpg",
        "type": "video"
      }
    },
    {
      "id": 75,
      "uniacid": 1,
      "user_id": 38,
      "item_id": 139,
      "type": "course",
      "createtime": 1740484683,
      "course": {
        "id": 139,
        "name": "本地存储",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/3dee2ed5bd20b0a36dce409cafd5816f.jpg",
        "type": "video"
      }
    },
    {
      "id": 58,
      "uniacid": 1,
      "user_id": 38,
      "item_id": 62,
      "type": "course",
      "createtime": 1724994449,
      "course": {
        "id": 62,
        "name": "[演示]对谈天虹副总经理谭晓华：怎么做好社群运营？",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20240118/47389e8b6a3eec1fc66a720d32f1be3b.png",
        "type": "live"
      }
    },
    {
      "id": 55,
      "uniacid": 1,
      "user_id": 38,
      "item_id": 33,
      "type": "course",
      "createtime": 1724137314,
      "course": {
        "id": 33,
        "name": "[演示]技术产品的产品经理是如何炼成的",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/57a1f0afb73cf9225ae3ad8ef2bc3af0.png",
        "type": "audio"
      }
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
| data[].user_id | integer | 用户ID |
| data[].item_id | integer | 条目ID |
| data[].type | string | 类型 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].course | object | 课程 |
| data[].course.id | integer | ID |
| data[].course.name | string | 名称 |
| data[].course.cover | string | 封面图 |
| data[].course.type | string | 类型 |
