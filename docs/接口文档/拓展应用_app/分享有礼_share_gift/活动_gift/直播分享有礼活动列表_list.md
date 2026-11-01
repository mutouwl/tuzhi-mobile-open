# 直播分享有礼活动列表

> 本场直播的活动清单与入口显隐判据；has_record 只说「这一场添加过活动」，进行中/已结束/已失效都算。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `share_gift.gift.list` |
| 接口地址 | `POST /api/app/share_gift/gift/list` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（分享有礼学员端接口（M-P1 活动列表 / M-P2 活动详情 / M-P3 助力 / M-P4 领奖）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程（直播间）ID | `6199` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/share_gift/gift/list' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":6199}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344794",
  "data": {
    "has_active": true,
    "has_record": true,
    "rows": [
      {
        "id": 3137,
        "title": "两个人",
        "invite_num": 2,
        "end_time": 1791368241,
        "end_time_text": "2026-10-07 18:17",
        "run_state": "ongoing",
        "run_state_text": "进行中",
        "condition_text": "邀请2人即可获得超值奖品",
        "assist_num": 0,
        "progress_text": "0/2",
        "action_text": "去参与"
      }
    ],
    "attr": {
      "record_status": [
        "进行中",
        "待领取",
        "已领取",
        "已过期"
      ],
      "prize_status": [
        "待领取",
        "已领取",
        "已过期"
      ],
      "assist_status": {
        "1": "有效",
        "2": "未成功"
      },
      "prize_type": {
        "course": "线上课程",
        "physical": "实物商品",
        "coupon": "优惠券",
        "score": "积分",
        "cash": "现金奖励",
        "custom": "自定义奖品"
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
| data.has_active | boolean | 此刻是否有正在进行中的活动（不含已结束/已失效），与入口显隐是两根轴，别拿它当入口判据 |
| data.has_record | boolean | 本场是否存在过任何未删活动行（进行中/已结束/已失效都算），直播间右侧悬浮入口的唯一判据 |
| data.rows | array | 本页数据行数组 |
| data.rows[].id | integer | ID |
| data.rows[].title | string | 标题 |
| data.rows[].invite_num | integer | 活动门槛的需邀请人数，达到即发奖 |
| data.rows[].end_time | integer | 结束时间 |
| data.rows[].end_time_text | string | 截止时间文案（后端格式化好的文本，前端不自己比时间戳） |
| data.rows[].run_state | string | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.rows[].run_state_text | string | 活动状态标签文案（进行中 / 已结束 / 已失效） |
| data.rows[].condition_text | string | 参与条件文案，固定句式「邀请N人即可获得超值奖品」 |
| data.rows[].assist_num | integer | 我已邀请到的有效人数（进度分子＝助力表中状态=有效的行数，不存计数列） |
| data.rows[].progress_text | string | 进度文案「已邀请数/需邀请数」 |
| data.rows[].action_text | string | 活动清单行右侧按钮文案：进行中=去参与，已结束/已失效=查看详情 |
| data.attr | object | 枚举文案字典（界面标签的唯一来源，前端禁止写死选项） |
| data.attr.record_status | array | 分享有礼参与记录状态：0=进行中 1=待领取 2=已领取 3=已过期 |
| data.attr.record_status[] | string | 分享有礼参与记录状态：0=进行中 1=待领取 2=已领取 3=已过期 |
| data.attr.prize_status | array | 奖品领取状态：0=待领取 1=已领取 2=已过期 |
| data.attr.prize_status[] | string | 奖品领取状态：0=待领取 1=已领取 2=已过期 |
| data.attr.assist_status | object | 助力状态：1=有效（计入邀请人进度）2=未成功 |
| data.attr.assist_status[] | string | 助力状态：1=有效（计入邀请人进度）2=未成功 |
| data.attr.prize_type | object | 奖品类型：course=线上课程 physical=实物商品 coupon=优惠券 score=积分 cash=现金奖励 custom=自定义奖品 |
| data.attr.prize_type.course | string | 课程 |
| data.attr.prize_type.physical | string | 实物 |
| data.attr.prize_type.coupon | string | 优惠券 |
| data.attr.prize_type.score | string | 积分 |
| data.attr.prize_type.cash | string | 现金奖励 |
| data.attr.prize_type.custom | string | 自定义奖品（发放不写权益，按兑奖联系方式联系商家） |
| data.attr.deadline_tip | string | 领取期截止文案（唯一来源是「请在15天内领取奖品，过期将无法兑换」） |

## 备注

- 直播间开关 live_room.config.share_gift 自 2026-10-04 起不参与这一枚入口判据，前端只赋值不 ∧ 别的条件
- has_active 是「此刻有没有进行中的」另一根轴，不要拿它当入口显隐判据
