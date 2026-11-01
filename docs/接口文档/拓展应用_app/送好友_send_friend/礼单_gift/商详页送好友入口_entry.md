# 商详页送好友入口

> 一件商品「能不能送好友」的唯一判据口：后端把总开关、生效内容勾选、商品可送三枚轴折成一枚 send_friend_entry，不通过时只回 0、不报错。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `send_friend.gift.entry` |
| 接口地址 | `POST /api/app/send_friend/gift/entry` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（礼单（学员端六个出口，PRD §7.2）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| goods_type | string | 否 | 商品大类：course（课程五型）/ circle / exercises / vipcard；缺省按 goods 处理 | `course` |
| goods_id | string | 否 | 商品 ID；会员卡是「卡ID_SKU下标」形态（不能截成卡 ID）；缺失或 `_` 前那段 <=0 时 flag 恒 0 | `128` |
| extend | string | 否 | 规格位，圈子传「规格ID_价格」；会员卡 SKU 已在 goods_id 里，这里留空 | `12_99.00` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/send_friend/gift/entry' \
  -H 'Content-Type: application/json' \
  -d '{"goods_type":"course","goods_id":"128","extend":"12_99.00"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.send_friend_entry | string | 唯一判据：1=可送、0=不可送（0 时只有这一枚键） |
| data.gift_type | string | 可赠送内容枚举键：article/video/audio/column/live/circle/exercises/vipcard |
| data.gift_type_label | string | 该枚举键的中文（图文/视频/音频/专栏/直播/圈子/练习/会员） |
| data.order_type | string | 下单链那一轴：课程五型恒为 goods，其余三类回自己的键；选券时要原样交给券接口 |
| data.tip | string | 该类的权益说明一句（如「好友领取后可永久观看该图文课程」） |
| data.order_goods_id | integer | 下单链要用的商品 ID：会员卡为「卡ID_SKU下标」原串，其余为数字 ID |
| data.extend | string | 规格串原样回显（圈子「规格ID_价格」） |
| data.goods_name | string | 商品快照名 |
| data.cover | string | 商品封面 |
| data.price | number | 商品当前价，两位小数（送礼按原价买一份，不与拼团价/改价并存） |
| data.max_per_order | integer | 单笔可买份数上限（设置缺省 5，上限 20），步进器吃这一枚 |
| data.receive_expire_days | string | 领取有效期天数，0=不限（缺省 30） |
| data.expire_text | string | 「送出后 N 天内可领取」/「领取不限时」 |
| data.button_text | string | 固定「送好友」 |

## 备注

- 免登录；插件未安装时由基类回 code=0「送好友功能未安装」，那是另一档，不是 send_friend_entry=0
- 不通过时只回一枚 0（不回 msg、不回商品名、不报错）：端上按 !== 1 整块不渲染，字段缺失同样不渲染
- goods_id 一律按字符串处理再判存在（只取 `_` 前那段）；圈子不带 extend、会员卡不带 `_下标` 时入口直接不开，后端不替用户选规格
- 课程五型只认 pay_type=pay：免费/口令/仅指定学员三档与 0 价内容一律不开（价格列是历史残留，不能拿它判）
- 取参优先方法形参，否则从 param() 认蛇形与驼峰两种键，POST/GET 都吃；spec 是 extend 的别名
- 商详页首屏与点击复核各发一次本口（同一判据、只读、无副作用），商家改完设置只有下拉刷新那次能看到
