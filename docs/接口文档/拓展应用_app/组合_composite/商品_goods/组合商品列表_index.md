# 组合商品列表

> 虚拟支付价格转换

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `composite.composite.index` |
| 接口地址 | `POST /api/app/composite/goods/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（组合商品接口） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/composite/goods/index' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509550",
  "data": {
    "total": 2,
    "per_page": 10,
    "current_page": 1,
    "last_page": 1,
    "data": [
      {
        "id": 1,
        "uniacid": 1,
        "name": "测试组合商品",
        "images": [
          "http://selfbuilt.cn/uploads/1/20260619/71e43294828de6c1a47e279d46495998.png"
        ],
        "sell_point": "123",
        "detail": "<p><br></p>",
        "group_id": 0,
        "status": 1,
        "sale_status": 1,
        "sale_time": null,
        "timed_down": 0,
        "timed_down_time": null,
        "temporarily_stop": 0,
        "is_show": 1,
        "total_sales": 5,
        "virtual_sales": 0,
        "visit": 0,
        "views": 35,
        "weigh": 0,
        "min_price": "0.01",
        "createtime": 1781585298,
        "updatetime": 1781842615,
        "status_text": "已上架",
        "sale_status_text": "立即上架",
        "is_show_text": "显示"
      },
      {
        "id": 3,
        "uniacid": 1,
        "name": "名称",
        "images": [
          "http://selfbuilt.cn/uploads/1/20260531/395826a3e28838ecd43b3bdf54fe6746.png"
        ],
        "sell_point": "123",
        "detail": "<p>123</p>",
        "group_id": 0,
        "status": 1,
        "sale_status": 1,
        "sale_time": null,
        "timed_down": 0,
        "timed_down_time": null,
        "temporarily_stop": 0,
        "is_show": 1,
        "total_sales": 7,
        "virtual_sales": 0,
        "visit": 0,
        "views": 53,
        "weigh": 0,
        "min_price": "0.01",
        "createtime": 1781591227,
        "updatetime": 1781842604,
        "status_text": "已上架",
        "sale_status_text": "立即上架",
        "is_show_text": "显示"
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
| data.total | integer | 合计 |
| data.per_page | integer | per页码 |
| data.current_page | integer | 当前页码 |
| data.last_page | integer | last页码 |
| data.data | array | 数据 |
| data.data[].id | integer | ID |
| data.data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.data[].name | string | 名称 |
| data.data[].images | array | images |
| data.data[].images[] | string | images |
| data.data[].sell_point | string | sellpoint |
| data.data[].detail | string | 详情 |
| data.data[].group_id | integer | 分组ID |
| data.data[].status | integer | 状态 |
| data.data[].sale_status | integer | sale状态 |
| data.data[].sale_time | null | sale时间 |
| data.data[].timed_down | integer | timeddown |
| data.data[].timed_down_time | null | timeddown时间 |
| data.data[].temporarily_stop | integer | temporarilystop |
| data.data[].is_show | integer | 是否显示 |
| data.data[].total_sales | integer | 总销量 |
| data.data[].virtual_sales | integer | virtual销量 |
| data.data[].visit | integer | visit |
| data.data[].views | integer | 浏览量 |
| data.data[].weigh | integer | 权重（排序值） |
| data.data[].min_price | string | 最低价 |
| data.data[].createtime | integer | 创建时间（时间戳） |
| data.data[].updatetime | integer | 更新时间（时间戳） |
| data.data[].status_text | string | 状态说明 |
| data.data[].sale_status_text | string | sale状态text |
| data.data[].is_show_text | string | 是否showtext |
