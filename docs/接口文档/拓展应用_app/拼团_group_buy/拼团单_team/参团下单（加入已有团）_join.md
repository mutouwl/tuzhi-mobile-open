# 参团下单（加入已有团）

> 学员加入一个还在拼团中的团：校验团状态/名额/重复参团后原子占位、建订单、写成员行，回团 ID + 订单号 + 实付价。与开团共用同一份下单链与回体形状。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.team.join` |
| 接口地址 | `POST /api/app/group_buy/team/join` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Team（拼团团（开团 / 参团 / 我的拼团详情 / 我的拼团列表 / 团成员）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| team_id | integer | 是 | 目标团 ID；<=0 直接回「请选择拼团」 | `1967` |
| spec_id | integer | 否 | 参团人自选的那一档规格（团绑定商品、不绑定规格）；不带或 0=回落团上快照 | `12` |
| spec_set | integer | 否 | 1=显式选了 spec_id=0 这一档（会员卡第 0 档） | `0` |
| count | integer | 否 | 购买份数，缺省 1，服务端夹到 1~99；一人买几份都只占一个位置 | `1` |
| buyer_remark | string | 否 | 买家留言，落订单 buyer_remark | `` |
| address_id | integer | 否 | 收货地址 ID；所选那一档含实物子商品时必填 | `0` |
| coupon_id | integer | 否 | 用户券 ID，0=不用券 | `0` |
| form_user_id | integer | 否 | 线下活动报名信息 ID（每人一份） | `0` |
| student_id | integer | 否 | 教务套餐上课学生 ID | `0` |
| campus_id | integer | 否 | 教务套餐上课校区 ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/team/join' \
  -H 'Content-Type: application/json' \
  -d '{"team_id":1967,"spec_id":12,"spec_set":0,"count":1,"buyer_remark":"","address_id":0,"coupon_id":0,"form_user_id":0,"student_id":0,"campus_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.team_id | integer | 团 ID（回显，与入参一致） |
| data.order_no | string | 待支付订单号 |
| data.order_id | integer | 订单主键 |
| data.price | number | 后端算出的人民币应付金额（券后） |
| data.is_virtual_pay | integer | 1=微信小程序虚拟支付单 |
| data.display_price | string | 展示金额（虚拟支付=代币数） |
| data.paid | integer | 1=0 元单已当场收尾，直接去支付成功页 |

## 备注

- 需登录；与 team/open 共用同一份订单链与回体形状（端上可以只写一套「起支付面板」的代码）
- 阶梯档不接受 ladder_id：一律沿团上快照的 team.ladder_id（档位由团长开团时定死）
- 「你已参与该团」判有没有成员行（含已退款/已释放）：uniq_team_user 是物理唯一索引，放行这几档会在写成员行时撞唯一键
- 名额在事务内原子占位；满员且活动 overflow≠1 时回「该团已满，去开新团」，超员活动允许继续参
- 单价口径：选团长那一档仍吃团快照价（店改价后同档参团不受影响）；选别的规格按该档现价，拿不到价回「该规格暂不可参团，请重新选择」
- 成功 msg 是「参团成功」；同样必须判 data.order_no 非空才前进
