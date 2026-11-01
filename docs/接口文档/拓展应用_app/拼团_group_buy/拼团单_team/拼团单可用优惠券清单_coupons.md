# 拼团单可用优惠券清单

> 下单页券弹窗的「可用 / 不可用」两档数据：门槛按拼团价判，与试算、建单共用同一份订单上下文。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.team.coupons` |
| 接口地址 | `POST /api/app/group_buy/team/coupons` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Team（拼团团（开团 / 参团 / 我的拼团详情 / 我的拼团列表 / 团成员）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | integer | 否 | 开团档必填：活动 ID；team_id>0 时忽略 | `8204` |
| team_id | integer | 否 | 参团档必填：团 ID | `0` |
| ladder_id | integer | 否 | 开团档的阶梯档 ID | `0` |
| spec_id | integer | 否 | 所选规格 ID（参团档=参团人自选那一档） | `12` |
| spec_set | integer | 否 | 1=显式选了 spec_id=0 这一档 | `0` |
| count | integer | 否 | 份数，缺省 1 | `1` |
| address_id | integer | 否 | 收货地址 ID | `0` |
| coupon_id | integer | 否 | 该单已选的券 ID（不影响清单本身，保持与 calc 同一批键即可） | `0` |
| form_user_id | integer | 否 | 线下活动报名信息 ID | `0` |
| student_id | integer | 否 | 教务套餐上课学生 ID | `0` |
| campus_id | integer | 否 | 教务套餐上课校区 ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/team/coupons' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":8204,"team_id":0,"ladder_id":0,"spec_id":12,"spec_set":0,"count":1,"address_id":0,"coupon_id":0,"form_user_id":0,"student_id":0,"campus_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.can_use | array | 这一单能用的券（用户券行） |
| data.can_use[].id | integer | 用户券 ID（选券后回填给 coupon_id 的就是它，不是券模板 ID） |
| data.can_use[].coupon | string | 券模板本体（前端券卡直接渲染这一棵） |
| data.can_use[].coupon.name | string | 券名 |
| data.can_use[].coupon.type | string | reduce=满减 / discount=折扣 |
| data.can_use[].coupon.type_text | string | 类型文案（满减券/折扣券） |
| data.can_use[].coupon.amount | number | 满减面额 |
| data.can_use[].coupon.discount | string | 折扣值（如 8.5） |
| data.can_use[].coupon.enough | string | 使用门槛（满 N 元） |
| data.can_use[].coupon.use_time_type | string | range=固定区间 / days=领取后 N 天 |
| data.can_use[].coupon.start_days | string | days 型的生效天数 |
| data.can_use[].coupon.use_start_time | integer | 可用开始时间（range 型） |
| data.can_use[].coupon.use_end_time | integer | 可用结束时间（range 型） |
| data.can_use[].coupon.description | string | 使用说明（券卡「规则」那一行） |
| data.can_use[].coupon.status | integer | 券状态（can_use / expired / used 等） |
| data.can_use[].coupon_money | number | 本单真实抵扣额（排序与展示都用它，不拿面额猜） |
| data.cannot_use | array | 这一单用不上的券（与 can_use 同形，多一枚原因） |
| data.cannot_use[].cannot_use_msg | string | 不可用原因（如「商品金额不满足优惠券门槛」「优惠券不支持该商品」） |

## 备注

- 需登录；与 calc / open / join 共用同一份上下文（OrderBridge::params()），券门槛按拼团价判，不会出现「按原价判门槛」
- 只扫不消耗：本口不会核销任何券，核销发生在 open / join 建单那一趟
- 虚拟支付单 / 未登录时两档都是空数组（虚拟支付扣代币，人民币券口径对不上）
- 上下文缺取价必需项时整口失败（线下活动要 form_user_id、教务套餐要 campus_id+student_id）：端上应补齐后再开券弹窗，失败原因落到空态文案，不要显示成「暂无优惠券」
- 端上两个页签直接吃 can_use / cannot_use，不要自己二次判可用性
