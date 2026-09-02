# 获取订单列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.list` |
| 接口地址 | `POST /api/order/order/getOrderList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 订单（order） |
| 所属控制器 | Order（订单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| status | string | 否 | 状态 | `` |
| search | string | 否 | search | `` |
| search_field | string | 否 | searchfield | `order_no` |

## 请求示例

```bash
curl -X POST '{apiUrl}order/order/getOrderList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"status":"","search":"","search_field":"order_no"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508187",
  "data": [
    {
      "is_virtual_pay": 0,
      "order_no": "202608222487831090038000",
      "order_type": "circle",
      "pay_type": "balance",
      "real_price": "23.00",
      "real_pay_price": "23.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1786148544,
      "item": [
        {
          "snapshoot": {
            "id": 3168,
            "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
            "type": "circle",
            "name": "新圈子",
            "price": "23.00"
          },
          "item_id": 3168,
          "createtime": 1786148544,
          "count": 1,
          "id": 2160
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 1,
      "order_no": "202611081322222222203800",
      "order_type": "circle",
      "pay_type": "balance",
      "real_price": "23.00",
      "real_pay_price": null,
      "status": "unpaid",
      "evaluate": 0,
      "createtime": 1786115297,
      "item": [
        {
          "snapshoot": {
            "id": 3168,
            "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
            "type": "circle",
            "name": "新圈子",
            "price": "23.00"
          },
          "item_id": 3168,
          "createtime": 1786115297,
          "count": 1,
          "id": 2155
        }
      ],
      "controll": {
        "evaluate": false,
        "cancel": "cancel",
        "pay": true,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202610532913222222222800",
      "order_type": "circle",
      "pay_type": "balance",
      "real_price": "23.00",
      "real_pay_price": "23.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1786114409,
      "item": [
        {
          "snapshoot": {
            "id": 3168,
            "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
            "type": "circle",
            "name": "新圈子",
            "price": "23.00"
          },
          "item_id": 3168,
          "createtime": 1786114409,
          "count": 1,
          "id": 2154
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202610473413222222222000",
      "order_type": "circle",
      "pay_type": "balance",
      "real_price": "23.00",
      "real_pay_price": "23.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1786114054,
      "item": [
        {
          "snapshoot": {
            "id": 3168,
            "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
            "type": "circle",
            "name": "新圈子",
            "price": "23.00"
          },
          "item_id": 3168,
          "createtime": 1786114054,
          "count": 1,
          "id": 2153
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202603123980750323003800",
      "order_type": "circle",
      "pay_type": "balance",
      "real_price": "23.00",
      "real_pay_price": "23.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1786086759,
      "item": [
        {
          "snapshoot": {
            "id": 3168,
            "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
            "type": "circle",
            "name": "新圈子",
            "price": "23.00"
          },
          "item_id": 3168,
          "createtime": 1786086759,
          "count": 1,
          "id": 2152
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202612132222222222003800",
      "order_type": "circle",
      "pay_type": "balance",
      "real_price": "23.00",
      "real_pay_price": "23.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1786076061,
      "item": [
        {
          "snapshoot": {
            "id": 3168,
            "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
            "type": "circle",
            "name": "新圈子",
            "price": "23.00"
          },
          "item_id": 3168,
          "createtime": 1786076061,
          "count": 1,
          "id": 2151
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202610585047369970038000",
      "order_type": "circle",
      "pay_type": "balance",
      "real_price": "2.00",
      "real_pay_price": "2.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1785812330,
      "item": [
        {
          "snapshoot": {
            "id": 25,
            "cover": "http://selfbuilt.cn/uploads/1/20260730/dfca4c4fbff604720c9598890bd04cd2.png",
            "type": "circle",
            "name": "123",
            "price": "2.00"
          },
          "item_id": 25,
          "createtime": 1785812330,
          "count": 1,
          "id": 2125
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202610264829245201003800",
      "order_type": "goods",
      "pay_type": "balance",
      "real_price": "398.00",
      "real_pay_price": null,
      "status": "unpaid",
      "evaluate": 0,
      "createtime": 1785464808,
      "item": [
        {
          "snapshoot": {
            "id": 278,
            "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
            "type": "column",
            "name": "马斯克授课专区",
            "price": "398.00"
          },
          "item_id": 278,
          "createtime": 1785464808,
          "count": 1,
          "id": 2119
        }
      ],
      "controll": {
        "evaluate": false,
        "cancel": "cancel",
        "pay": true,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202611132222222220003800",
      "order_type": "goods",
      "pay_type": "alipay",
      "real_price": "1.00",
      "real_pay_price": "1.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1785294821,
      "item": [
        {
          "snapshoot": {
            "id": 419,
            "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
            "type": "article",
            "name": "健康管理2",
            "price": "1.00"
          },
          "item_id": 419,
          "createtime": 1785294821,
          "count": 1,
          "id": 2112
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
      }
    },
    {
      "is_virtual_pay": 0,
      "order_no": "202610372223099480038000",
      "order_type": "goods",
      "pay_type": "alipay",
      "real_price": "1.00",
      "real_pay_price": "1.00",
      "status": "success",
      "evaluate": 0,
      "createtime": 1785292642,
      "item": [
        {
          "snapshoot": {
            "id": 419,
            "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
            "type": "article",
            "name": "健康管理2",
            "price": "1.00"
          },
          "item_id": 419,
          "createtime": 1785292642,
          "count": 1,
          "id": 2111
        }
      ],
      "controll": {
        "evaluate": true,
        "cancel": false,
        "pay": false,
        "service": false,
        "surereceive": false,
        "express": false
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
| data[].is_virtual_pay | integer | 是否虚拟支付 |
| data[].order_no | string | 订单号 |
| data[].order_type | string | 订单类型 |
| data[].pay_type | string | 支付类型 |
| data[].real_price | string | 实付价格 |
| data[].real_pay_price | string | 实际支付价格 |
| data[].status | string | 状态 |
| data[].evaluate | integer | 评价 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].item | array | 条目 |
| data[].item[].snapshoot | object | 快照 |
| data[].item[].snapshoot.id | integer | ID |
| data[].item[].snapshoot.cover | string | 封面图 |
| data[].item[].snapshoot.type | string | 类型 |
| data[].item[].snapshoot.name | string | 名称 |
| data[].item[].snapshoot.price | string | 价格 |
| data[].item[].item_id | integer | 条目ID |
| data[].item[].createtime | integer | 创建时间（时间戳） |
| data[].item[].count | integer | 数量 |
| data[].item[].id | integer | ID |
| data[].controll | object | 操作控制 |
| data[].controll.evaluate | boolean | 评价 |
| data[].controll.cancel | boolean | 取消 |
| data[].controll.pay | boolean | 支付 |
| data[].controll.service | boolean | 服务承诺 |
| data[].controll.surereceive | boolean | surereceive |
| data[].controll.express | boolean | 物流 |
