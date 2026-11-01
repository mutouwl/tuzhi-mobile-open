# 领取分享有礼奖品（兼容旧包）

> 六型分流在标准版 core Grant::claim，本口只额外挂「这一批领完就把参与记录推到已领取/已过期」的回调。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/share_gift/gift/claim` |
| 接口地址 | `POST /api/app/share_gift/gift/claim` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（分享有礼学员端接口（M-P1 活动列表 / M-P2 活动详情 / M-P3 助力 / M-P4 领奖）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

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
curl -X POST '{apiUrl}app/share_gift/gift/claim' \
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
| data | string | 领取后的奖品详情，装配与 prize/prize/claim 同一份 Detail（六型只走一处），末尾多一次参与记录结算 |
| data.prize_log_id | integer | 获奖记录 ID |
| data.type | integer | 奖品类型：course/physical/coupon/score/cash/custom |
| data.status | integer | 领取状态：本口成功后恒 1=已领取 |
| data.status_text | string | 领取状态文案 |
| data.grant_ref | string | 发放回执（课程=订阅行ID、实物=0元订单号、自定义=空串） |
| data.target | string | 「去查看」落点：course/order/coupon/score/balance/custom |
| data.detail | string | 详情弹窗那张卡的数据，按 kind 分流 |

## 备注

- 新版本客户端走核心口 prize/prize/claim；本口只为已发布的老版本保留，等最低支持版本越过本次发布即可删
- 越权防线只有一处：core Grant::claim 里那条 where(user_id)，别人传 prize_log_id 进来只会得到「奖品记录不存在」
