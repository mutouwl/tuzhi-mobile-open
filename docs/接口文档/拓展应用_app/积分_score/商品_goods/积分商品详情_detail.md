# 积分商品详情

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.score.detail` |
| 接口地址 | `POST /api/app/score/goods/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（积分商城） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | `28` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/score/goods/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":28}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "商品详情",
  "time": "1786508203",
  "data": {
    "id": 13,
    "uniacid": 1,
    "goods_id": 28,
    "status": 1,
    "stock": 10,
    "sales": 0,
    "score": 102,
    "createtime": 1705553495,
    "updatetime": 1768293618
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
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.goods_id | integer | 商品ID |
| data.status | integer | 状态 |
| data.stock | integer | 库存 |
| data.sales | integer | 销量 |
| data.score | integer | 积分 |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
