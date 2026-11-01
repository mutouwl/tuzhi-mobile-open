# 领取奖品

> 一枚奖品的六型分流（课程/实物/优惠券/积分/现金/自定义）都在这一个出口，跨业务的「这一批算不算领完」由各业务自己传回调。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `prize.prize.claim` |
| 接口地址 | `POST /api/prize/prize/claim` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 奖品（prize） |
| 所属控制器 | Prize（的登录闸门与权限节点是两道」），四口全部需要登录——奖品列表与地址簿都是本人的东西。） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| prize_log_id | integer | 是 | 奖品记录 ID | - |
| address_id | integer | 否 | 收货地址 ID，实物型奖品必填 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}prize/prize/claim' \
  -H 'Content-Type: application/json' \
  -d '{"prize_log_id":"xxx","address_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 领取后的奖品详情（与 myPrizes 行同构，六型只走 Detail 一处装配） |
| data.prize_log_id | integer | 获奖记录 ID |
| data.type | integer | 奖品类型：course/physical/coupon/score/cash/custom |
| data.status | integer | 领取状态：本口成功后恒 1=已领取 |
| data.status_text | string | 领取状态文案 |
| data.grant_ref | string | 发放回执：课程=订阅行ID 优惠券=我的券行ID 实物=0元订单号 积分/现金=流水ID 自定义=空串 |
| data.name | string | 奖品名称 |
| data.cover | string | 奖品图片地址 |
| data.target | string | 「去查看」落点：course/order/coupon/score/balance/custom |
| data.can_receive | string | 是否还摆「立即领取」，领取后为 false |
| data.can_view | string | 是否摆「去查看」 |
| data.detail | string | 详情弹窗那张卡的数据，按 kind 分流；custom 只有型标识 |
| data.detail.kind | string | 版式分流标识：course/physical/coupon/score/cash/custom |
| data.detail.course_id | integer | 奖品课程 ID（课程型） |
| data.detail.goods_id | integer | 奖品商品 ID（实物型），其余型为 0 |
| data.detail.order_no | string | 实物奖品生成的 0 元订单号 |
| data.detail.coupon | string | 本人那张券（券用户行带券关联，未领取时为空） |
| data.detail.score_value | string | 积分奖品的积分数 |
| data.detail.cash_amount | number | 现金奖品的金额（元） |

## 备注

- 越权防线只有一处：Grant::claim 里的 where(user_id)，别人的 prize_log_id 传进来查不到行
