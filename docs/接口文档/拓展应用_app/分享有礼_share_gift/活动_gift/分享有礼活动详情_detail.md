# 分享有礼活动详情

> 活动 + 奖品 + 我的进度，并把已完成/未完成两档受邀人一次给全，前端本地切页签。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `share_gift.gift.detail` |
| 接口地址 | `POST /api/app/share_gift/gift/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（分享有礼学员端接口（M-P1 活动列表 / M-P2 活动详情 / M-P3 助力 / M-P4 领奖）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | integer | 是 | 分享有礼活动 ID | `3137` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/share_gift/gift/detail' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":3137}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344794",
  "data": {
    "activity": {
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
    },
    "prizes": [
      {
        "prize_id": 1696,
        "type": "coupon",
        "type_text": "优惠券",
        "name": "指定商品可用优惠券",
        "cover": "",
        "score_value": 0,
        "cash_amount": "0.00",
        "stock_total": 9978,
        "stock_left": 9977
      }
    ],
    "stats": {
      "need": 2,
      "success": 0,
      "fail": 0
    },
    "assists_done": [],
    "assists_undone": [],
    "my": {
      "joined": false,
      "status": -1,
      "status_text": "",
      "assist_num": 0,
      "invite_num": 2,
      "done_text": "",
      "landing": "invite",
      "button_text": "去邀请好友"
    },
    "stock_tip": "奖品有限，先到先得",
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
| data.activity | object | 活动 |
| data.activity.id | integer | ID |
| data.activity.title | string | 标题 |
| data.activity.invite_num | integer | 活动门槛的需邀请人数，达到即发奖 |
| data.activity.end_time | integer | 结束时间 |
| data.activity.end_time_text | string | 截止时间文案（后端格式化好的文本，前端不自己比时间戳） |
| data.activity.run_state | string | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.activity.run_state_text | string | 活动状态标签文案（进行中 / 已结束 / 已失效） |
| data.activity.condition_text | string | 参与条件文案，固定句式「邀请N人即可获得超值奖品」 |
| data.activity.assist_num | integer | 我已邀请到的有效人数（进度分子＝助力表中状态=有效的行数，不存计数列） |
| data.activity.progress_text | string | 进度文案「已邀请数/需邀请数」 |
| data.activity.action_text | string | 活动清单行右侧按钮文案：进行中=去参与，已结束/已失效=查看详情 |
| data.prizes | array | 奖品行数组（活动侧是本场的奖品配置，my 段内是本人获奖行） |
| data.prizes[].prize_id | integer | 活动奖品配置行ID |
| data.prizes[].type | string | 类型 |
| data.prizes[].type_text | string | 类型说明 |
| data.prizes[].name | string | 名称 |
| data.prizes[].cover | string | 封面图 |
| data.prizes[].score_value | integer | 积分奖品的积分数（1~1000000），非积分型为 0 |
| data.prizes[].cash_amount | string | 现金奖品的单份金额（元，0.01~500.00），非现金型为 0.00 |
| data.prizes[].stock_total | integer | 该奖品配的份数上限，0=不限；课程/积分/自定义三型恒 0 |
| data.prizes[].stock_left | integer | 剩余可发份数，发奖时带守卫原子递减，0=已发完抢不到名额 |
| data.stats | object | 受邀人三格统计（需邀请 / 已完成 / 未完成） |
| data.stats.need | integer | 需邀请人数（取自活动门槛列） |
| data.stats.success | integer | 有效（已完成）的受邀人数 |
| data.stats.fail | integer | 未成功（未完成）的受邀人数 |
| data.assists_done | array | 已完成档的受邀人行数组（助力状态=有效） |
| data.assists_undone | array | 未完成档的受邀人行数组（前端本地切这两份，不二次请求） |
| data.my | object | 我在本活动的状态段：是否参与、进度、达标标签、主按钮文案与落点 |
| data.my.joined | boolean | 1=我已参与（已建参与记录行）；未参与时状态回 -1、文案回空串 |
| data.my.status | integer | 状态 |
| data.my.status_text | string | 状态说明 |
| data.my.assist_num | integer | 我已邀请到的有效人数（进度分子＝助力表中状态=有效的行数，不存计数列） |
| data.my.invite_num | integer | 活动门槛的需邀请人数，达到即发奖 |
| data.my.done_text | string | 标题行「已完成」标签文案：有效邀请数≥需邀请数时给「已完成」，否则空串整枚收起 |
| data.my.landing | string | 主按钮落点标识：prize=跳我的奖品（已达标）invite=去分享（未达标） |
| data.my.button_text | string | 主按钮文案：去邀请好友 / 继续邀请好友 / 查看我的奖品 |
| data.stock_tip | string | 主按钮副文字：奖品配了份数上限时给「奖品有限，先到先得」 |
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

- 详情按 id 定位（学员可能正打开一条历史活动），不重新判「当前生效」，否则手上那张奖会凭空消失
