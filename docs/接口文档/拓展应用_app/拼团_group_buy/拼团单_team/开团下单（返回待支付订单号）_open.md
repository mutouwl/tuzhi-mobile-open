# 开团下单（返回待支付订单号）

> 学员以团长身份开一个新团：后端在一个事务里落团、走全站下单链建订单、写成员行，回团 ID + 订单号 + 后端算出的实付价，端上据此拉起支付面板。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.team.open` |
| 接口地址 | `POST /api/app/group_buy/team/open` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Team（拼团团（开团 / 参团 / 我的拼团详情 / 我的拼团列表 / 团成员）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | integer | 是 | 进行中的活动 ID | `8204` |
| ladder_id | integer | 否 | 阶梯型所选档位 ID（非阶梯型传 0） | `0` |
| spec_id | integer | 否 | 选中的商品规格 ID（会员卡第 0 档合法，要配 spec_set=1） | `12` |
| spec_set | integer | 否 | 1=调用方显式选了 spec_id=0 这一档（不是「没带规格」） | `0` |
| count | integer | 否 | 购买份数，缺省 1，服务端夹到 1~99；只影响订单份数与金额，不占团名额 | `1` |
| buyer_remark | string | 否 | 买家留言，落订单 buyer_remark（与其他单同一列） | `请尽快发货` |
| address_id | integer | 否 | 收货地址 ID；实物单或所选规格含实物子商品的组合单必填，其余传 0 | `0` |
| coupon_id | integer | 否 | 用户券 ID，0=不使用券（与普通单同一枚键名） | `0` |
| form_user_id | integer | 否 | 线下活动的报名信息 ID（一人一份） | `0` |
| student_id | integer | 否 | 教务套餐的上课学生 ID | `0` |
| campus_id | integer | 否 | 教务套餐的上课校区 ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/team/open' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":8204,"ladder_id":0,"spec_id":12,"spec_set":0,"count":1,"buyer_remark":"请尽快发货","address_id":0,"coupon_id":0,"form_user_id":0,"student_id":0,"campus_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.team_id | integer | 新建的团 ID（支付面板关掉后跳团详情就用它） |
| data.order_no | string | 待支付订单号（必须判空，否则会起一个订单号为空的支付面板） |
| data.order_id | integer | 订单主键 |
| data.price | number | 后端算出的人民币应付金额（券后 real_price，不是未支付的 real_pay_price） |
| data.is_virtual_pay | integer | 1=微信小程序虚拟支付单 |
| data.display_price | string | 支付面板显示的那一格：虚拟支付=代币数，其余=两位小数人民币字符串 |
| data.paid | integer | 1=本单已由后端当场收尾（0 元或券后 0 元），端上直接去支付成功页、不弹支付方式 |

## 备注

- 需登录；登录态与下单链取到的用户不一致时当场拒（「请先登录」/「请重新登录后再参与拼团」），不会静默写出错配订单
- 团 / 订单 / 成员行在同一事务：任一拒因抛错即整体回滚，不会留下「占着名额但没有订单」的孤儿团
- 活动状态只认「进行中」：未开始 / 已结束 / 已失效对外统一一句「活动已结束」；activity_id<=0 是「活动不存在」
- 拒因顺序（越根本越先）：活动状态 → 规格是否在售 → 份数上限 → 档位/改价 → 每人限参次数 → 收货地址 → 建团建单
- 金额只认回体：price 是人民币实付原值，虚拟支付要拿 display_price 上面板，否则会「显示 ¥9.9、实扣 99 金币」
- 成功 msg 是「开团成功」；端上必须判 code===1 且 data.order_no 非空才前进（连点会建出第二个团，端上另需在途锁）
