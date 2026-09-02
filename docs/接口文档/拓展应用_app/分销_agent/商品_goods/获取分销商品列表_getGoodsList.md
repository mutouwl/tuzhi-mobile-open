# 获取分销商品列表

> 部分商品的实际价格依赖关联表或历史同步结果，不能只靠 goods.price 过滤

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.goods.getGoodsList` |
| 接口地址 | `POST /api/app/agent/goods/getGoodsList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Goods（分销商品） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| type | string | 否 | 类型 | `` |
| name | string | 否 | 名称 | `` |
| sort | string | 否 | 排序 | `time` |
| order | string | 否 | 订单 | `desc` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/goods/getGoodsList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"type":"","name":"","sort":"time","order":"desc"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508155",
  "data": [
    {
      "id": 3,
      "name": "平安扣",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
      "createtime": 1786365011,
      "views": "0",
      "type": "physical",
      "status": null,
      "sales": null,
      "hide": "is_hide",
      "sales_type": "alone",
      "briefing": null,
      "uniacid": 1,
      "price": "300.00",
      "pay_type": "pay",
      "goods_id": 3,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "0.00",
      "spec_type": "single",
      "image": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
      "status_text": "",
      "spec_type_text": "单规格",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "30.00",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 3168,
      "name": "学习论坛",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260808/f27490ef8b3c3fc362c77644e7c606aa.jpeg",
      "createtime": 1785917437,
      "views": "0",
      "type": "circle",
      "status": null,
      "sales": 3,
      "hide": "0",
      "sales_type": "alone",
      "briefing": "简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容",
      "uniacid": 1,
      "price": "23.00",
      "pay_type": "pay",
      "goods_id": 3168,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "0.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "2.30",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 2308,
      "name": "123",
      "cover": "http://selfbuilt.cn/uploads/1/20260730/dfca4c4fbff604720c9598890bd04cd2.png",
      "createtime": 1785897564,
      "views": "0",
      "type": "circle",
      "status": null,
      "sales": 1,
      "hide": "0",
      "sales_type": "alone",
      "briefing": "123",
      "uniacid": 1,
      "price": "23.00",
      "pay_type": "pay",
      "goods_id": 2308,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "0.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "2.30",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 420,
      "name": "55666666666333333",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/e16476aadf780e297d93cf3c840d5d0f.jpg",
      "createtime": 1785410608,
      "views": "4",
      "type": "column",
      "status": null,
      "sales": 0,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "123",
      "uniacid": 1,
      "price": "88.00",
      "pay_type": "pay",
      "goods_id": 420,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "0.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "8.80",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 22,
      "name": "Python 学习交流圈",
      "cover": "http://selfbuilt.cn/uploads/1/20260802/40fce2ec85c1d72e933072ac15f5e21e.png",
      "createtime": 1785397831,
      "views": "0",
      "type": "circle",
      "status": null,
      "sales": 1,
      "hide": "0",
      "sales_type": "alone",
      "briefing": "一起学 Python，打卡交流，资料分享",
      "uniacid": 1,
      "price": "29.90",
      "pay_type": "pay",
      "goods_id": 22,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "59.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "2.99",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 418,
      "name": "健康管理1",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
      "createtime": 1785235474,
      "views": "9",
      "type": "article",
      "status": null,
      "sales": 3,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "健康管理",
      "uniacid": 1,
      "price": "1.00",
      "pay_type": "pay",
      "goods_id": 418,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "0.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "0.10",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 417,
      "name": "健康管理",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
      "createtime": 1785217206,
      "views": "18",
      "type": "article",
      "status": null,
      "sales": 2,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "健康管理",
      "uniacid": 1,
      "price": "1.00",
      "pay_type": "pay",
      "goods_id": 417,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "0.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "0.10",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 325,
      "name": "测试课程",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260616/3cd1f6398ddc48ab334a442e4898f6d1.png",
      "createtime": 1782823400,
      "views": "5",
      "type": "video",
      "status": null,
      "sales": 1,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "这是课程的介绍",
      "uniacid": 1,
      "price": "0.20",
      "pay_type": "pay",
      "goods_id": 325,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": "0.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "0.02",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 317,
      "name": "外贸社媒全流程线上课",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260616/3cd1f6398ddc48ab334a442e4898f6d1.png",
      "createtime": 1782115934,
      "views": "18",
      "type": "column",
      "status": 1,
      "sales": 0,
      "hide": "0",
      "sales_type": "[\"alone\"]",
      "briefing": "专线网络搭建，Tik Tok注册下载",
      "uniacid": 1,
      "price": "3980.00",
      "pay_type": "pay",
      "goods_id": 317,
      "goods_type": "course",
      "mode": 2,
      "prop_rule": "{\"0\":{\"proportion\":{\"customer\":\"1\",\"goods\":\"40\"},\"price\":{\"customer\":\"0\",\"goods\":\"0\"}},\"1322222222227\":{\"proportion\":{\"goods\":\"10\",\"customer\":\"1\"},\"price\":{\"customer\":\"0\",\"goods\":\"0\"}}}",
      "price_marking": "6980.00",
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "398.00",
          "customer": "0.00"
        }
      }
    },
    {
      "id": 3,
      "name": "名称",
      "cover": "http://selfbuilt.cn/uploads/1/20260531/395826a3e28838ecd43b3bdf54fe6746.png",
      "createtime": 1781591227,
      "views": "53",
      "type": "composite",
      "status": null,
      "sales": null,
      "hide": "0",
      "sales_type": "alone",
      "briefing": null,
      "uniacid": 1,
      "price": "0.01",
      "pay_type": "pay",
      "goods_id": 3,
      "goods_type": null,
      "mode": null,
      "prop_rule": null,
      "price_marking": 0,
      "prop": {
        "mode": 1,
        "prop": {
          "goods": "10",
          "customer": "0"
        },
        "price": {
          "goods": "0.00",
          "customer": "0.00"
        }
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
| data[].name | string | 名称 |
| data[].cover | string | 封面图 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].views | string | 浏览量 |
| data[].type | string | 类型 |
| data[].status | null | 状态 |
| data[].sales | null | 销量 |
| data[].hide | string | 是否隐藏 |
| data[].sales_type | string | 销售方式 |
| data[].briefing | null | 简介 |
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].price | string | 价格 |
| data[].pay_type | string | 支付类型 |
| data[].goods_id | integer | 商品ID |
| data[].goods_type | null | 商品类型 |
| data[].mode | null | 模式 |
| data[].prop_rule | null | proprule |
| data[].price_marking | string | 划线价 |
| data[].spec_type | string | 规格类型 |
| data[].image | string | 图片 |
| data[].status_text | string | 状态说明 |
| data[].spec_type_text | string | spec类型text |
| data[].prop | object | prop |
| data[].prop.mode | integer | 模式 |
| data[].prop.prop | object | prop |
| data[].prop.prop.goods | string | 商品 |
| data[].prop.prop.customer | string | 客户 |
| data[].prop.price | object | 价格 |
| data[].prop.price.goods | string | 商品 |
| data[].prop.price.customer | string | 客户 |
