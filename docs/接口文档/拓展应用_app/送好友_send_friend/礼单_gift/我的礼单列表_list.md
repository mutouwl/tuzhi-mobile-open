# 我的礼单列表

> 只列「我买出来送人」的礼单：三档状态 + 服务端分页 + 页签角标同源；订单详情那条入口可带单号收窄到一张购买单。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `send_friend.gift.list` |
| 接口地址 | `POST /api/app/send_friend/gift/list` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（礼单（学员端六个出口，PRD §7.2）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| status | string | 否 | 0=待赠送 / 2=已领取 / 3=已失效；不传或 all = 全部（其它值含历史 1 按未筛处理） | `0` |
| page | integer | 否 | 页码，从 1 起，缺省 1 | `1` |
| limit | integer | 否 | 每页条数，缺省 10，夹在 1~50 | `10` |
| order_no | string | 否 | 订单详情入口带进来，模糊匹配购买单号并与「只回本人」取「与」 | `SN20261101000001` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/send_friend/gift/list' \
  -H 'Content-Type: application/json' \
  -d '{"status":"0","page":1,"limit":10,"order_no":"SN20261101000001"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.total | integer | 同条件下的总条数（「第 N/M 份」与末页兜底用） |
| data.status_count | object | 三档份数 {"0":n,"2":n,"3":n}（与列表同条件、只关掉 status 那一轴） |
| data.attr.statusList | string | 状态值→文案（0/2/3） |
| data.attr.giftTypeOptions | string | 可赠送内容枚举键→中文 |
| data.attr.sortable | string | 可排序字段（id/goods_count/shared_at/claimed_at） |
| data.attr.record_max | string | 单次最多可查多少条（20） |
| data.page | string | 回显页码 |
| data.limit | string | 回显每页条数 |
| data.has_more | boolean | 还有下一页（端上优先吃这一枚） |
| data.rows[].id | integer | 礼单 ID |
| data.rows[].gift_no | string | 32 位领取凭据 |
| data.rows[].seq | string | 同一购买单里的第几份 |
| data.rows[].order_no | string | 购买单号 |
| data.rows[].order_item_id | integer | 购买单商品行 ID |
| data.rows[].goods_count | integer | 该购买单买了多少份 |
| data.rows[].goods_id | integer | 商品 ID（快照，商家改名不回写） |
| data.rows[].goods_type | string | 商品大类 |
| data.rows[].course_type | string | 课程细分类型 |
| data.rows[].gift_type | string | 可赠送内容枚举键 |
| data.rows[].gift_type_label | string | 可赠送内容中文 |
| data.rows[].goods_name | string | 商品名快照 |
| data.rows[].goods_desc | string | 权益一句话 |
| data.rows[].cover | string | 封面快照 |
| data.rows[].price_paid | string | 实付摊到这一份的金额，两位小数 |
| data.rows[].status | integer | 状态值：0=待赠送 / 2=已领取 / 3=已失效 |
| data.rows[].status_label | string | 状态文案（异常值 -），端上不写死 |
| data.rows[].giver | string | 购买人整条用户对象 {id,nickname,username,avatar} |
| data.rows[].giver_user_id | integer | 购买人用户 ID |
| data.rows[].receiver | object|null | 领取人整条用户对象，未领取为 null（直接渲染会变成 [object Object]，用 receiver_name） |
| data.rows[].receiver_user_id | integer | 领取人用户 ID，未领取为 0 |
| data.rows[].receiver_name | string | 领取人昵称，未领取为 - |
| data.rows[].receiver_avatar | string | 领取人头像（已补全 cdn 前缀/首字兜底），未领取为空串 |
| data.rows[].shared_at | string | 送出时刻（Unix 秒，0=未送出） |
| data.rows[].shared_at_text | string | 送出时刻格式化串（未送出为 -） |
| data.rows[].claimed_at | string | 领取时刻（Unix 秒） |
| data.rows[].claimed_at_text | string | 领取时刻格式化串 |
| data.rows[].createtime_text | string | 生成时间格式化串 |
| data.rows[].expire_time | integer | 到期时刻（Unix 秒，0=不限） |
| data.rows[].expire_time_text | string | 到期时间文案（0 时为「不限」） |
| data.rows[].claim_order_no | string | 0 元领取单号，空串=未生成 |
| data.rows[].void_reason | string | 失效/回收原因 |
| data.rows[].receive_url | string | 领取链接，仅 status=0 有值，已领取/已失效为空串 |
| data.rows[].can_void | boolean | 可作废：true=是（status=0） |
| data.rows[].can_give | boolean | 可赠送：true=是（status=0） |
| data.rows[].can_claim | boolean | 这一份还开着且未到期：true=是（不是「当前登录人能不能领」） |

## 备注

- 需登录；只回 giver_user_id=当前用户，别人的礼单/别人的单号一律拿不到
- 翻页参数是 page 不是 offset：发 offset 时后端落回 page=1，上拉加载会把第 1 页反复拼到列表尾部，而接口一路 200
- has_more 是分页收口，只有它缺失时才用 rows.length < total 兜底；total 不能拿本页行数代替
- 状态只有三档（0 待赠送 / 2 已领取 / 3 已失效）：「送出」不是状态，打开分享面板只记 shared_at
- 列表负载不含手机号，只有昵称/用户名/头像（防枚举口径写在 GiftRead 一处）
- can_claim 是「这一份还开着且未到期」（userId=0 口径），不是「当前登录人能不能领」；领取页读的是 gift/info 的 claimable
