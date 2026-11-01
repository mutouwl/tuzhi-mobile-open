# 我的奖品列表（兼容旧包）

> 老版本客户端「我的奖品」入口，实现已转发到标准版 core 的 MyPrize::page，不再有任何业务逻辑。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/share_gift/prize/myPrizes` |
| 接口地址 | `POST /api/app/share_gift/prize/myPrizes` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Prize（分享有礼「奖品」三口的**兼容转发壳**（2026-10-03 起不再有任何业务逻辑）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 10 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/share_gift/prize/myPrizes' \
  -H 'Content-Type: application/json' \
  -d '{"page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344797",
  "data": {
    "total": 11,
    "rows": [
      {
        "prize_log_id": 1336,
        "type": "coupon",
        "type_text": "优惠券",
        "name": "指定商品可用优惠券",
        "cover": "",
        "from_title": "Test the invite live room.",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-06",
        "expire_time": 1792577921,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "367",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "coupon",
        "detail": {
          "kind": "coupon",
          "coupon": {
            "id": 367,
            "uniacid": 1,
            "user_id": 38,
            "get_type": 2,
            "coupon_id": 12,
            "use_order_id": 0,
            "use_time": null,
            "status": "can_use",
            "createtime": 1791281966,
            "updatetime": 1791281966,
            "coupon": {
              "id": 12,
              "uniacid": 1,
              "name": "指定商品可用优惠券",
              "type": "reduce",
              "use_scope": "all_use",
              "goods": null,
              "amount": "10.00",
              "discount": "0.00",
              "max_amount": "0.00",
              "max_amount_status": 1,
              "enough": "10.00",
              "enough_status": 1,
              "stock": 9977,
              "limit_num": 0,
              "limit_status": 1,
              "use_time_type": "days",
              "use_start_time": null,
              "use_end_time": null,
              "start_days": 0,
              "days": 10,
              "description": "",
              "recommend_goods_status": 1,
              "stock_status": 1,
              "share_status": 1,
              "public_status": 1,
              "double_discount_status": 1,
              "status": 1,
              "createtime": 1736494803,
              "updatetime": 1742304714,
              "deletetime": null,
              "type_text": "满减券",
              "use_num": 4,
              "get_num": 23,
              "status_text": "进行中",
              "use_scope_text": "全场通用",
              "amount_text": "满10.00元,减10元",
              "use_time_status": "ing",
              "use_time_text": "发放中",
              "stock_all": 10000,
              "stock_prop": 99,
              "received": true,
              "goods_bind_ids": []
            },
            "name": "指定商品可用优惠券",
            "type": "reduce",
            "status_text": "立即使用",
            "get_type_text": "后台发放"
          }
        }
      },
      {
        "prize_log_id": 850,
        "type": "physical",
        "type_text": "实物商品",
        "name": "秋季新课本套装09210009",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "from_title": "Test the invite live room.",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-06",
        "expire_time": 1792547215,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "202608501760990684003800",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "order",
        "detail": {
          "kind": "physical",
          "goods_id": 22,
          "order_no": "202608501760990684003800"
        }
      },
      {
        "prize_log_id": 291,
        "type": "score",
        "type_text": "积分",
        "name": "__seed_prize__来自另一个业务的积分奖",
        "cover": "",
        "from_title": "__seed_prize__别的业务发的奖",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-03",
        "expire_time": 1792298443,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "351",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "score",
        "detail": {
          "kind": "score",
          "score_value": 7
        }
      },
      {
        "prize_log_id": 288,
        "type": "custom",
        "type_text": "自定义奖品",
        "name": "__seed_prize__自定义礼盒（领完弹兑奖方式）",
        "cover": "",
        "from_title": "__seed_prize__测试直播间",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-03",
        "expire_time": 1792298443,
        "contact_wechat": "seed_prize_wx",
        "contact_qrcode": "",
        "grant_ref": "",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "contact",
        "detail": {
          "kind": "custom"
        }
      },
      {
        "prize_log_id": 287,
        "type": "cash",
        "type_text": "现金奖励",
        "name": "__seed_prize__现金 5 元（点领取后进余额）",
        "cover": "",
        "from_title": "__seed_prize__测试直播间",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-03",
        "expire_time": 1792298443,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "2410",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "balance",
        "detail": {
          "kind": "cash",
          "cash_amount": "5.00"
        }
      },
      {
        "prize_log_id": 286,
        "type": "score",
        "type_text": "积分",
        "name": "__seed_prize__积分 100（点领取后到账）",
        "cover": "",
        "from_title": "__seed_prize__测试直播间",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-03",
        "expire_time": 1792298443,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "352",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "score",
        "detail": {
          "kind": "score",
          "score_value": 100
        }
      },
      {
        "prize_log_id": 285,
        "type": "coupon",
        "type_text": "优惠券",
        "name": "__seed_prize__优惠券（点领取后发券）",
        "cover": "",
        "from_title": "__seed_prize__测试直播间",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-03",
        "expire_time": 1792298443,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "340",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "coupon",
        "detail": {
          "kind": "coupon",
          "coupon": {
            "id": 340,
            "uniacid": 1,
            "user_id": 38,
            "get_type": 2,
            "coupon_id": 180,
            "use_order_id": 0,
            "use_time": null,
            "status": "can_use",
            "createtime": 1791021323,
            "updatetime": 1791021323,
            "coupon": {
              "id": 180,
              "uniacid": 1,
              "name": "__seed_prize__券",
              "type": "reduce",
              "use_scope": "all_use",
              "goods": null,
              "amount": "1.00",
              "discount": "0.00",
              "max_amount": "0.00",
              "max_amount_status": 0,
              "enough": "0.00",
              "enough_status": 0,
              "stock": 9,
              "limit_num": 0,
              "limit_status": 0,
              "use_time_type": "days",
              "use_start_time": null,
              "use_end_time": null,
              "start_days": 0,
              "days": 30,
              "description": null,
              "recommend_goods_status": 1,
              "stock_status": 1,
              "share_status": 1,
              "public_status": 1,
              "double_discount_status": 1,
              "status": 2,
              "createtime": 1791002443,
              "updatetime": 1791002443,
              "deletetime": null,
              "type_text": "满减券",
              "use_num": 0,
              "get_num": 1,
              "status_text": "已停止",
              "use_scope_text": "全场通用",
              "amount_text": "满0.00元,减1元",
              "use_time_status": "ing",
              "use_time_text": "发放中",
              "stock_all": 10,
              "stock_prop": 90,
              "received": true,
              "goods_bind_ids": []
            },
            "name": "__seed_prize__券",
            "type": "reduce",
            "status_text": "立即使用",
            "get_type_text": "后台发放"
          }
        }
      },
      {
        "prize_log_id": 284,
        "type": "physical",
        "type_text": "实物商品",
        "name": "__seed_prize__实物奖品（点领取后建 0 元单）",
        "cover": "",
        "from_title": "__seed_prize__测试直播间",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-03",
        "expire_time": 1792298443,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "202605550151602494003800",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "order",
        "detail": {
          "kind": "physical",
          "goods_id": 243,
          "order_no": "202605550151602494003800"
        }
      },
      {
        "prize_log_id": 283,
        "type": "course",
        "type_text": "线上课程",
        "name": "__seed_prize__赠课（点领取后开通课程）",
        "cover": "",
        "from_title": "__seed_prize__测试直播间",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-03",
        "expire_time": 1792298443,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "1614",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "course",
        "detail": {
          "kind": "course",
          "course_id": 4187
        }
      },
      {
        "prize_log_id": 290,
        "type": "score",
        "type_text": "积分",
        "name": "__seed_prize__已领取的积分奖（点「去查看」跳积分页）",
        "cover": "",
        "from_title": "__seed_prize__测试直播间",
        "status": 1,
        "status_text": "已领取",
        "win_time_text": "2026-10-02",
        "expire_time": 1792212043,
        "contact_wechat": "",
        "contact_qrcode": "",
        "grant_ref": "",
        "can_receive": false,
        "can_view": true,
        "need_address": false,
        "target": "score",
        "detail": {
          "kind": "score",
          "score_value": 30
        }
      }
    ],
    "has_more": true,
    "deadline_tip": "请在15天内领取奖品，过期将无法兑换",
    "attr": {
      "prize_type": {
        "course": "线上课程",
        "physical": "实物商品",
        "coupon": "优惠券",
        "score": "积分",
        "cash": "现金奖励",
        "custom": "自定义奖品"
      },
      "prize_status": [
        "待领取",
        "已领取",
        "已过期"
      ],
      "prize_source": {
        "share_gift": "分享有礼"
      },
      "deadline_tip": "请在15天内领取奖品，过期将无法兑换"
    }
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.total | integer | 合计 |
| data.rows | array | 本页数据行数组 |
| data.rows[].prize_log_id | integer | 获奖记录ID（标准版 prize_log 行，领取与详情都按它定位） |
| data.rows[].type | string | 类型 |
| data.rows[].type_text | string | 类型说明 |
| data.rows[].name | string | 名称 |
| data.rows[].cover | string | 封面图 |
| data.rows[].from_title | string | 来源名称快照（分享有礼里是中奖那场直播的标题，改名或删课不影响这一行） |
| data.rows[].status | integer | 状态 |
| data.rows[].status_text | string | 状态说明 |
| data.rows[].win_time_text | string | 中奖日期文案（Y-m-d） |
| data.rows[].expire_time | integer | 过期时间 |
| data.rows[].contact_wechat | string | 兑奖微信号（自定义奖品用，其余型空串） |
| data.rows[].contact_qrcode | string | 兑奖二维码图片地址（自定义奖品用，空串时只展示微信号） |
| data.rows[].grant_ref | string | 发放回执：课程=订阅行ID 优惠券=我的券行ID 实物=0元订单号 积分=现金=流水ID 自定义=空串 |
| data.rows[].can_receive | boolean | 是否摆「立即领取」：领取状态=待领取 |
| data.rows[].can_view | boolean | 是否摆「去查看」 |
| data.rows[].need_address | boolean | 领取前是否要先选收货地址：型=实物 且 仍待领取 |
| data.rows[].target | string | 「去查看」落点：course=课程详情 order=实物订单 coupon=我的优惠券 score=积分页 balance=余额 custom=兑奖方式 |
| data.rows[].detail | object | 详情 |
| data.rows[].detail.kind | string | 版式分流标识（前端按它选版式，不自己按字段有无猜） |
| data.rows[].detail.coupon | object | 优惠券 |
| data.rows[].detail.coupon.id | integer | ID |
| data.rows[].detail.coupon.uniacid | integer | 应用ID（公众号/uniacid） |
| data.rows[].detail.coupon.user_id | integer | 用户ID |
| data.rows[].detail.coupon.get_type | integer | 获取类型 |
| data.rows[].detail.coupon.coupon_id | integer | 优惠券ID |
| data.rows[].detail.coupon.use_order_id | integer | 使用订单ID |
| data.rows[].detail.coupon.use_time | null | 使用时间 |
| data.rows[].detail.coupon.status | string | 状态 |
| data.rows[].detail.coupon.createtime | integer | 创建时间（时间戳） |
| data.rows[].detail.coupon.updatetime | integer | 更新时间（时间戳） |
| data.rows[].detail.coupon.coupon | object | 优惠券 |
| data.rows[].detail.coupon.name | string | 名称 |
| data.rows[].detail.coupon.type | string | 类型 |
| data.rows[].detail.coupon.status_text | string | 状态说明 |
| data.rows[].detail.coupon.get_type_text | string | 获取类型text |
| data.has_more | boolean | 是否有more |
| data.deadline_tip | string | 领取期截止文案（唯一来源是「请在15天内领取奖品，过期将无法兑换」） |
| data.attr | object | 枚举文案字典（界面标签的唯一来源，前端禁止写死选项） |
| data.attr.prize_type | object | 奖品类型：course=线上课程 physical=实物商品 coupon=优惠券 score=积分 cash=现金奖励 custom=自定义奖品 |
| data.attr.prize_type.course | string | 线上课程 |
| data.attr.prize_type.physical | string | 实物商品 |
| data.attr.prize_type.coupon | string | 优惠券 |
| data.attr.prize_type.score | string | 积分 |
| data.attr.prize_type.cash | string | 现金奖励 |
| data.attr.prize_type.custom | string | 自定义奖品（发放不写权益，按兑奖联系方式联系商家） |
| data.attr.prize_status | array | 奖品领取状态：0=待领取 1=已领取 2=已过期 |
| data.attr.prize_status[] | string | 奖品领取状态：0=待领取 1=已领取 2=已过期 |
| data.attr.prize_source | object | 奖品业务来源：share_gift=分享有礼；未登记的来源回落成「其他」不丢行 |
| data.attr.prize_source.share_gift | string | 分享有礼 |
| data.attr.deadline_tip | string | 领取期截止文案（唯一来源是「请在15天内领取奖品，过期将无法兑换」） |

## 备注

- 新客户端改指 prize/prize/myPrizes；这三行转发照旧不许删——删了老包一进这一页就报「接口不存在」
