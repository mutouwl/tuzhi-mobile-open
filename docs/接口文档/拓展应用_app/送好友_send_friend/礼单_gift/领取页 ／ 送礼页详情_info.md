# 领取页 / 送礼页详情

> 用领取凭据换出这一份礼物的三态判据、按钮文案与商品卡；未登录只回商品名与封面 + need_login，其余一律不出。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `send_friend.gift.info` |
| 接口地址 | `POST /api/app/send_friend/gift/info` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（礼单（学员端六个出口，PRD §7.2）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| code | string | 是 | 领取凭据 gift_no，32 位小写字母数字；缺失或形状不符回「领取链接有误」 | `3f7a9c1e5b2d48f6a0c3e7d9b1f24a68` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/send_friend/gift/info' \
  -H 'Content-Type: application/json' \
  -d '{"code":"3f7a9c1e5b2d48f6a0c3e7d9b1f24a68"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.need_login | integer | 1=未登录（此时只有 need_login、goods_name、cover 三枚） |
| data.goods_name | string | 商品名快照（未登录也给） |
| data.cover | string | 封面快照（未登录也给） |
| data.goods_desc | string | 权益一句话（后端派生，三端同一句） |
| data.gift_type | string | 可赠送内容枚举键 |
| data.gift_type_label | string | 可赠送内容中文 |
| data.goods_id | integer | 礼单背后的商品 ID |
| data.goods_type | string | 商品大类 |
| data.course_type | string | 课程细分类型 |
| data.giver_name | string | 送出人昵称（只昵称，不出手机号） |
| data.giver_avatar | string | 送出人头像地址 |
| data.status | integer | 0=待赠送 / 2=已领取 / 3=已失效 |
| data.status_label | string | 状态文案 |
| data.claimable | integer | 1=现在能领（block_reason 为空串） |
| data.block_reason | string | 不能领的那一句，空串=可领（与 receive 同一份判据） |
| data.button_text | string | 「领取赠送」/「暂不可领取」 |
| data.expire_text | string | 「领取不限时」/「领取已到期」/「请在 Y-m-d H:i 前领取」 |
| data.other_pending | integer | 同一购买单里还在「待赠送」的份数（含本份），只给购买人，其余人恒 0 |
| data.is_giver | integer | 1=当前登录人就是购买人（送礼页整页能不能看吃这一枚） |
| data.self_usable | integer | 1=购买人本人且尚未拥有这份权益（跳过「不能领自己」后判据仍成立） |
| data.receive_url | string | 分享卡片落地链接，仅「本人且 status=0」下发；端上不许自己拼地址 |
| data.receiver_name | string | 领取人昵称（已领取白卡用，仅购买人与领取人可见） |
| data.receiver_avatar | string | 领取人头像 |
| data.claimed_at_date | string | 领取日期 Y-m-d，未领取为空串 |
| data.void_reason | string | 失效/回收原因，只给购买人 |

## 备注

- 免登录；未登录一律不出状态、不出送出人资料、不出商品 ID（need_login=1 时只有 need_login、goods_name、cover 三枚），状态本身也是信息（防枚举）
- code 只认 32 位小写字母数字（形状不符直接「领取链接有误」，不打库）；查无此行回「礼物不存在」
- 三枚白卡字段（receiver_name/receiver_avatar/claimed_at_date）只给购买人本人与领取人本人；void_reason / other_pending 只给购买人
- claimable/block_reason 走默认判据（allowSelf=false）：购买人自己打开领取链接会拿到 block_reason「不能领取自己赠送的礼物」，他该用 self_usable 那条路
- self_usable 是重跑一次跳过「不能领自己」的判据：已领取/已失效/到期/已永久拥有课程/已订阅练习都不给按钮，不是点下去再被拒
- 本口不下发 price/pay_type：领取页商品卡不摆价格（价格属购买单那一侧的事实）
