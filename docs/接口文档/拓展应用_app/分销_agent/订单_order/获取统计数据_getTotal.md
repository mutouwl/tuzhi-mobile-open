# 获取统计数据

> 获取统计数据 除了四个金额，还下发「下一笔什么时候到账」那两句：天数与日期都由后端算， 学员端结算中心那一格直接吃它，禁止前端拿列表第一行自己比时间（M22/M35）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.order.getTotal` |
| 接口地址 | `POST /api/app/agent/order/getTotal` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Order（订单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| type | string | 否 | 类型 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/order/getTotal' \
  -H 'Content-Type: application/json' \
  -d '{"type":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508154",
  "data": {
    "price_waiting": 0,
    "sales_waiting": 0,
    "sales_success": 0,
    "price_success": 0,
    "price_goods": 0,
    "price_invite": 0,
    "order_count": 0,
    "price_total": 0,
    "sales_total": 0,
    "price_balance": 0,
    "next_settle_time": 0,
    "next_settle_text": ""
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.price_waiting | integer | 待支付价格 |
| data.sales_waiting | integer | 待支付销量 |
| data.sales_success | integer | 成交销量 |
| data.price_success | integer | 成交价 |
| data.price_goods | integer | 价格商品 |
| data.price_invite | integer | 价格邀请 |
| data.order_count | integer | 订单数量 |
| data.price_total | integer | 价格合计 |
| data.sales_total | integer | 总销量 |
| data.price_balance | integer | 已结算到用户余额的佣金合计（元）：开启「结算到用户余额」后到账的那一截 |
| data.next_settle_time | integer | 最近一笔待结算佣金的预计到账时间戳，0=还没有起算的 |
| data.next_settle_text | string | 到账提示整句，如「预计 3 天后到账」「待订单完成后起算」；没有待结算时为空串 |

## 备注

- 读
- 这
- 一
- 组
- 数
- 据
- 时
- 后
- 端
- 会
- 先
- 把
- 本
- 人
- 已
- 到
- 点
- 的
- 佣
- 金
- 就
- 地
- 结
- 算
- 掉
- ，
- 所
- 以
- 这
- 里
- 的
- 待
- 结
- 算
- 金
- 额
- 与
- 账
- 户
- 余
- 额
- 是
- 同
- 一
- 时
- 刻
- 的
- 数
- ；
- 到
- 账
- 天
- 数
- 与
- 日
- 期
- 一
- 律
- 由
- 后
- 端
- 算
- 好
- 下
- 发
- ，
- 前
- 端
- 不
- 许
- 自
- 己
- 比
- 时
- 间
- 。
