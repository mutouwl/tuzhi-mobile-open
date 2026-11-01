# 建送礼购买单

> 在标准提交订单页（送礼分支）建「买来送人」的购买单，返回订单号供拉起支付面板；礼单不在这里生成，支付成功回调按份数结算。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `send_friend.gift.create` |
| 接口地址 | `POST /api/app/send_friend/gift/create` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（礼单（学员端六个出口，PRD §7.2）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| goods_id | string | 是 | 商品 ID；会员卡「卡ID_SKU下标」必须原样传（截断会按第一档算价） | `128` |
| goods_type | string | 否 | 商品大类，缺省 goods；端上课程传 course | `course` |
| extend | string | 否 | 圈子规格串「规格ID_价格」 | `12_99.00` |
| count | integer | 否 | 赠送份数（一份=一个好友名额），缺省 1，须 ≤ max_per_order | `2` |
| coupon_id | integer | 否 | 购买人自己的优惠券 ID，0=不用（送礼单照常可用券，与拼团相反） | `0` |
| buyer_remark | string | 否 | 买家留言，落到订单 buyer_remark | `生日快乐` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/send_friend/gift/create' \
  -H 'Content-Type: application/json' \
  -d '{"goods_id":"128","goods_type":"course","extend":"12_99.00","count":2,"coupon_id":0,"buyer_remark":"生日快乐"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.order_no | string | 购买单号，端上拿它拉起支付面板 |
| data.real_price | number | 订单行应付总额，两位小数（支付面板吃这一枚） |
| data.is_virtual_pay | integer | 1=小程序虚拟支付（扣代币） |
| data.display_price | string | 端上显示用金额：虚拟支付为代币数，否则等于 real_price |
| data.paid | integer | 1=本口已当场按支付成功收尾（券把全额抵成 0 元），端上不再弹支付方式 |
| data.goods_count | integer | 回显份数 |
| data.gift_type | string | 本单结算出的可赠送内容枚举键 |
| data.max_per_order | integer | 份数上限回显 |

## 备注

- 需登录；未装插件回「送好友功能未安装」
- 与 entry 同一份闸门在接口层再判一次（前端能绕过），拒单句子全部取自 Rules::createRules()：「送好友功能已关闭」「商品不存在或已下架」「该内容暂不支持赠送」「该内容没有定价，不能赠送」「请填写要赠送的份数」「超出单笔可赠送份数，单笔最多 N 份」
- 成功 msg 为「下单成功」，只建单不结算：礼单在 pay_success 里按份数生成 N 条（(order_no, seq) 唯一键兜住，回调重复投递只补缺的那份）
- 金额只认 real_price（创建即写的应付列），不许读 real_pay_price（未支付为 NULL 会导致面板 ¥0）；虚拟支付下 real_price 仍是人民币原值，别拿它当扣多少代币
- 入参一律走 post()，GET 取不到；goodsList 里那三枚（goodsId/goodsType/extend）必须与入口下发的一致，否则规格价会被算成第一档
