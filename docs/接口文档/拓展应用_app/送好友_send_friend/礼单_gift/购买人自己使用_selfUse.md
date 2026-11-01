# 购买人自己使用

> 送礼页那枚【自己使用】：与领取同一条结算链、同一份回体，只多两道闸 —— 只认购买人本人、跳过「不能领自己」。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `send_friend.gift.selfUse` |
| 接口地址 | `POST /api/app/send_friend/gift/selfUse` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（礼单（学员端六个出口，PRD §7.2）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| code | string | 是 | 礼单凭据 gift_no（送礼页 onLoad 那一枚） | `3f7a9c1e5b2d48f6a0c3e7d9b1f24a68` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/send_friend/gift/selfUse' \
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
| data.id | integer | 礼单 ID |
| data.status | integer | 固定 2 |
| data.status_label | string | 固定「已领取」 |
| data.claim_order_no | string | 0 元领取单号 |
| data.goods_name | string | 商品名快照 |
| data.goods_desc | string | 权益一句话快照 |
| data.goods_id | integer | 商品 ID |
| data.goods_type | string | 商品大类 |
| data.course_type | string | 课程细分类型 |
| data.gift_type | string | 可赠送内容枚举键 |
| data.detail_type | string | 详情页路由型别 |
| data.detail_id | integer | 详情页商品 ID |
| data.tip | string | 成功提示句「已放进你的已购」 |

## 备注

- 要登录；非购买人本人与「不存在」回同一句「礼物不存在」（不把「这一条存在但不是你的」告诉调用方）
- 判据 = 本人且跳过「不能领自己」那一闸：已领取/已失效/到期/已永久拥有该课程/已订阅该练习照旧被挡，与界面 self_usable 同一份
- 与 receive 共用同一个结算方法与回体装配，回体形状不会一边有一边没有
- 领取链接那条路（receive）仍按默认判据挡住自领 —— 不是把自领整条放开，两条入口只是同一判据的两个门
- 动作不可逆：自用后好友再也领不到、也分享不出去；再调一次回「这份礼物已被领取」。端上点击先弹原生确认，取消支不发请求
