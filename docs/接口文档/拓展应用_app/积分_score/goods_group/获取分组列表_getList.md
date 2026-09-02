# 获取分组列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.score.goodsgroup` |
| 接口地址 | `POST /api/app/score/goods_group/getList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | GoodsGroup（积分商城商品分组） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/score/goods_group/getList' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508172",
  "data": [
    {
      "id": 1,
      "uniacid": 1,
      "name": "虚拟商品",
      "sort": 0,
      "status": 1,
      "createtime": 1691415880
    },
    {
      "id": 3,
      "uniacid": 1,
      "name": "书籍",
      "sort": 2,
      "status": 1,
      "createtime": 1724737029
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
| data[].sort | integer | 排序 |
| data[].status | integer | 状态 |
| data[].createtime | integer | 创建时间（时间戳） |
