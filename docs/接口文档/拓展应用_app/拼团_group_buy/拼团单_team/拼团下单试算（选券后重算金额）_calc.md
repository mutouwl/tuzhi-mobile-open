# 拼团下单试算（选券后重算金额）

> 下单页换券/自动选券时按「与建单同一份上下文」重算金额，回费用明细与真实参与核算的那张券。权威实付价仍是 open/join 提交那一刻现算的那一份。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.team.calc` |
| 接口地址 | `POST /api/app/group_buy/team/calc` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Team（拼团团（开团 / 参团 / 我的拼团详情 / 我的拼团列表 / 团成员）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | integer | 否 | 开团档必填：进行中的活动 ID；team_id>0 时忽略 | `8204` |
| team_id | integer | 否 | 参团档必填：团 ID（>0 时走参团档，活动从团反查、档位沿团上快照） | `0` |
| ladder_id | integer | 否 | 开团档的阶梯档 ID | `0` |
| spec_id | integer | 否 | 所选规格 ID（参团档=参团人自选的那一档，0=团上快照） | `12` |
| spec_set | integer | 否 | 1=显式选了 spec_id=0 这一档 | `0` |
| count | integer | 否 | 份数，缺省 1，夹到 1~99 | `1` |
| address_id | integer | 否 | 收货地址 ID（实物或含实物组合的取价口要它） | `0` |
| coupon_id | integer | 否 | 用户券 ID，0=不用券 | `0` |
| auto_coupon | integer | 否 | 1=让后端在本单可用券里自动挑最优的一张（只有试算口认这一枚，建单口永不自动） | `1` |
| form_user_id | integer | 否 | 线下活动报名信息 ID（缺了取价口会报「报名信息错误」） | `0` |
| student_id | integer | 否 | 教务套餐上课学生 ID | `0` |
| campus_id | integer | 否 | 教务套餐上课校区 ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/team/calc' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":8204,"team_id":0,"ladder_id":0,"spec_id":12,"spec_set":0,"count":1,"address_id":0,"coupon_id":0,"auto_coupon":1,"form_user_id":0,"student_id":0,"campus_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.goods_total_price | number | 商品合计（两位小数字符串） |
| data.goods_total_price_marking | string | 商品划线价合计 |
| data.order_total_price | number | 订单总额（含运费、应付之前） |
| data.dispatch_price | number | 运费 |
| data.vip_discount_price | number | 会员折扣额 |
| data.coupon_discount_fee | string | 券抵扣额（0=这张券没抵上） |
| data.discount_price | number | 优惠合计（券+会员） |
| data.real_price | number | 应付金额（虚拟支付那一档已换代币） |
| data.score_amount | number | 所需积分（拼团单恒 0） |
| data.goods_count | integer | 购买件数 |
| data.is_virtual_pay | integer | 1=虚拟支付（上面所有金额字段都是代币数） |
| data.coupon_id | integer | 本次真正参与核算的那张用户券 ID（自动选券时端上要拿它回填券行，否则「按券算了却不带券提交」） |
| data.coupon_info.id | integer | 券行 Tag 的用户券 ID（没用上券时为 null） |
| data.coupon_info.type | integer | reduce=满减 / discount=折扣 |
| data.coupon_info.tag_text | string | Tag 文案（如「满100减10」），端上不自己拼 |
| data.coupon_can_use | string | 本单可用券张数（券行「请选择优惠券」与「暂无可用优惠券」的分档判据） |
| data.need_address | integer | 这一单要不要收货地址：1=要 |
| data.orderGoodsList[].goodsId | string | 商品 ID |
| data.orderGoodsList[].goodsType | string | 底层商品类型（course→goods / physical→physical 等） |
| data.orderGoodsList[].count | integer | 份数 |
| data.orderGoodsList[].unit_price | number | 单价（拼团价由核心适配器覆盖） |
| data.orderGoodsList[].total_price | number | 该行合计 |
| data.orderGoodsList[].total_price_marking | string | 该行划线价合计 |
| data.orderGoodsList[].discount_price | number | 该行优惠额 |
| data.orderGoodsList[].coupon_discount_fee | string | 该行券分摊额 |
| data.orderGoodsList[].real_price | number | 该行应付 |
| data.orderGoodsList[].detail | string | 核心 Handle::getGoodsDetail() 原样透出的商品快照（字段随大类） |
| data.msg | string | 只在「带了券但没抵上」时出现，恒为「优惠券不可用」；其余情况这个键不存在 |

## 备注

- 需登录；team_id>0 时团不存在回「该团不存在，去开新团」、活动不在进行中回「活动已结束」；team_id=0 时活动不存在回「活动不存在」
- 两条链（试算与建单）在后端共用 OrderBridge::params() + OrderContext 同一份参数形状，试算看到的价与实扣的才是同一档商品的价
- msg 的语义被刻意收窄成「这张券没抵上」：带券且 coupon_discount_fee=0 时恒为「优惠券不可用」，其余情况这个键被摘掉（地址缺失由页面自己的地址卡负责）
- auto_coupon=1 只在试算口生效；后端只按本单真实抵扣额排序，虚拟支付 / 未登录 / 商品 0 元时不自动挑，coupon_id 回 0
- 端上拿到 msg 要「清券 + 回落不带券再算一次 + 把原因说给用户」，不能静默留着那张券（提交那一刻会直接失败）
- 取价必需项（线下活动 form_user_id、教务套餐 campus_id+student_id）缺了会让本口整体失败，要先补齐再让 auto_coupon 生效
