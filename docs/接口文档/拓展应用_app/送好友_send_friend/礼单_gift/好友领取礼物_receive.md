# 好友领取礼物

> 好友点领取链接：乐观并发把礼单 0→2、建 0 元领取单，权益交回既有零元结算链发放；回体带详情落点，端上关页跳商品详情。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `send_friend.gift.receive` |
| 接口地址 | `POST /api/app/send_friend/gift/receive` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（礼单（学员端六个出口，PRD §7.2）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| code | string | 是 | 领取凭据 gift_no（32 位小写字母数字），来自领取链接的 ?code= | `3f7a9c1e5b2d48f6a0c3e7d9b1f24a68` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/send_friend/gift/receive' \
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
| data.claim_order_no | string | 0 元领取单号（不是购买单号） |
| data.goods_name | string | 商品名快照 |
| data.goods_desc | string | 权益一句话快照 |
| data.goods_id | integer | 商品 ID |
| data.goods_type | string | 商品大类 |
| data.course_type | string | 课程细分类型 |
| data.gift_type | string | 可赠送内容枚举键 |
| data.detail_type | string | 详情页路由型别：课程五型取 course_type（缺失回落 course），其余为 circle/exercises/vipcard |
| data.detail_id | integer | 详情页商品 ID（= goods_id） |
| data.tip | string | 成功提示句「领取成功，已放进你的已购」 |

## 备注

- 要登录；未带 token 由 Api 基类统一回 code=401「请登录后再操作」；未装插件回「送好友功能未安装」
- 顺序固定且整笔事务：抢这一份（0→2）→ 建 0 元领取单 → 回写 claim_order_no → 交回零元结算链发权益；任一步失败整笔回滚，不会「记了领取人却没发权益」
- 一份只被领一次：并发或重复领取回业务错误「这份礼物已被领取」，不是幂等成功
- 拒领句子全部来自 claimBlockReason 一处：已被领取 / 已失效（原因）/ 领取已到期 / 不能领取自己赠送的礼物 / 你已永久拥有该内容 / 你已拥有该练习 / 暂不可领取
- 领取不判商家当前的可赠送内容勾选（取消勾选只挡新购买，不追溯已买出的礼单）；营收只吃购买单，本单金额恒 0
- 端上不做成功屏：按 detail_type + detail_id 走「详情页路由」后关页跳详情，缺任一枚只关页（不跳空地址）
