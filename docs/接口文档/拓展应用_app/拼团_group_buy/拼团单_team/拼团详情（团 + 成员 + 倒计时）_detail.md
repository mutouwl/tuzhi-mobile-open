# 拼团详情（团 + 成员 + 倒计时）

> 团详情页的唯一取数口：一次给齐团状态与派生文案、还差人数、已拼头像、单价与规格快照、成员列表、活动摘要与失败说明。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.team.detail` |
| 接口地址 | `POST /api/app/group_buy/team/detail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Team（拼团团（开团 / 参团 / 我的拼团详情 / 我的拼团列表 / 团成员）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| team_id | integer | 是 | 团 ID；不存在/已删/活动被删时回「拼团不存在」 | `1967` |
| spec_id | integer | 否 | 参团页带自己选的规格来询价（0 或不传=用团上快照；团详情页本就不传） | `0` |
| spec_set | integer | 否 | 1=显式选了 spec_id=0 这一档 | `0` |
| count | integer | 否 | 份数（仅签名占位）：详情页下发的是单价、不乘份数 | `1` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/team/detail' \
  -H 'Content-Type: application/json' \
  -d '{"team_id":1967,"spec_id":0,"spec_set":0,"count":1}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.team_id | integer | 团 ID |
| data.team_no | string | 团号（当前就是团 ID 的字符串形式） |
| data.is_virtual_pay | integer | 1=虚拟支付（价格字段已换代币） |
| data.status | integer | 团状态：0=拼团中 / 1=已成团 / 2=已失败 / 3=已停止 |
| data.status_label | string | 团状态文案（拼团中/已成团/已失败/已停止），端上不写死 |
| data.target_num | integer | 成团人数 |
| data.used_num | integer | 已占名额数（退款/释放会扣回去） |
| data.joined_num | integer | 参与过的人数（已支付/已成团/已退款三档，不含未支付与超时释放） |
| data.member_avatars | array | 已拼头像，最多 3 枚、团长在前（字符串数组） |
| data.price | number | 这一档的单价（不乘份数、不含运费；虚拟支付已换代币） |
| data.spec_id | integer | 团上快照的规格 ID（带 spec_id 询价时回参团人自己那一档） |
| data.spec_text | string | 规格文案（详情页写「团长已选 XXL」） |
| data.ladder_id | integer | 团上快照的阶梯档（0=非阶梯/老团） |
| data.virtual_count | integer | 模拟成团补的虚拟人数（只有成团态才有值） |
| data.is_simulated | integer | 该团是否模拟成团：1=是 |
| data.expire_time | integer | 团到期时刻（Unix 秒，端上 ×1000 跑倒计时；0=不限时） |
| data.createtime | integer | 开团时刻（Unix 秒） |
| data.activity.id | integer | 活动 ID |
| data.activity.type | string | normal/ladder/invite |
| data.activity.name | string | 活动名 |
| data.activity.goods_type | string | 商品大类（卡片选档、成团按钮文案都吃它） |
| data.activity.goods_id | integer | 商品 ID |
| data.activity.goods_name | string | 商品名 |
| data.activity.goods_cover | string | 商品封面（分享卡片封面） |
| data.activity.origin_price | number | 商品原价（划线价，虚拟支付已换代币） |
| data.activity.invite_min | integer | 邀新型的「至少 N 名新用户」 |
| data.activity.rule_text | string | 拼团玩法整句（与商详区同一份） |
| data.activity.order_extra | object | 参团下单页要补的上下文（kind/activity_id/package_id） |
| data.activity.need_address | integer | 这一档参团要不要收货地址：1=要 |
| data.members[].id | integer | 成员行 ID |
| data.members[].nickname | string | 脱敏昵称（首字符+***，取不到 -），后端已脱敏，前端不要再加工 |
| data.members[].avatar | string | 头像（无头像给首字兜底图） |
| data.members[].is_leader | integer | 是否团长：1=是 |
| data.members[].is_new_user | integer | 是否新人（邀新判定快照）：1=是 |
| data.members[].is_me | integer | 是否当前登录用户：1=是（「我的订单/邀请好友/立即加入」全靠它，端上不猜） |
| data.members[].price | number | 该成员这一份的人民币单价（库内原值，不换代币） |
| data.members[].status | integer | 成员状态：0=待支付 / 1=待成团 / 2=已成团 / 3=已退款 / 4=已释放 |
| data.members[].status_label | string | 成员状态文案（待支付/待成团/已成团/已退款/已释放） |
| data.members[].order_no | string | 该成员的订单号（「查看订单/查看退款」的真去处） |
| data.members[].pay_time | integer | 支付时刻（Unix 秒；0=未支付） |
| data.refund_rule | string | 「未成团时钱怎么走」半句（auto_refund 关掉时不是「自动退款」） |
| data.refund_pending | string | 团已失败但钱还没退的笔数（未失败恒 0） |
| data.fail_text | string | 失败那一屏的状态说明（按待退笔数拼好；未失败是空串） |

## 备注

- 需登录；team_id<=0、团不存在/已删、活动被删都回同一句「拼团不存在」（不区分「无权看」）
- status 是读侧派生：expire_time 已到但库里还挂在拼团中，按「已失败」下发；倒计时吃 expire_time、状态吃 status，两头必须同源，界面不许自己再判一次到期
- 昵称脱敏与私隐字段剥离写在 TeamPage：user_id / 手机号 / openid 一律不下发，前端不靠 ID 认人、用 is_me
- members 含未支付成员行（status=0），这样待支付阶段的「我这一行 / 我的订单号」也读得到；「已拼 N 人」与头像只用 joined_num / member_avatars，别拿 members 长度当人数
- price 是单价不是总价（份数与券后金额在 calc / open / join）；虚拟支付时 price 已是代币数而 members[].price 仍是人民币原值，两处单位不同不要混着显示
- refund_rule / refund_pending 已下发但端上无直接读点：玩法句折进 rule_text、失败说明折进 fail_text
