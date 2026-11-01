# 邀请达人榜榜单

> TOP3 + 分页列表 + 我的名次 + 活动展示段一次下发；名次、人数、活动状态一律后端算好，前端不按下标 +1、不比时间戳。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `invite_rank.rank.board` |
| 接口地址 | `POST /api/app/invite_rank/rank/board` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Rank（邀请达人榜（学员端）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程（直播间）ID | `6199` |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，移动端默认档 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/invite_rank/rank/board' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":6199,"page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344796",
  "data": {
    "show_entry": true,
    "top": [
      {
        "rank": 1,
        "user_id": 38,
        "nickname": "冯**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "invite_num": 2,
        "is_me": false
      }
    ],
    "list": [
      {
        "rank": 1,
        "user_id": 38,
        "nickname": "冯**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "invite_num": 2,
        "is_me": false
      }
    ],
    "total": 1,
    "page": 1,
    "has_more": false,
    "me": {
      "rank": 0,
      "invite_num": 0,
      "on_board": false,
      "nickname": "",
      "avatar": ""
    },
    "activity": {
      "status": 1,
      "run_state": 1,
      "run_state_text": "进行中",
      "run_state_key": "running",
      "end_time": 1791983424,
      "end_time_text": "2026-10-14 21:10",
      "show_rule": 1,
      "rule_html": "<p>123123</p>",
      "show_prize": 0,
      "rewards": []
    },
    "attr": {
      "risk_tip": "邀请达人榜活动存在诱导分享行为，可能会受到微信平台的管控"
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
| data.show_entry | boolean | 直播间右侧达人榜入口是否显示：只认达人榜设置表单那枚「状态」=开启，与榜上有没有人、是否到期无关 |
| data.top | array | 榜单前三名行数组（与 list 行同构，最多三条） |
| data.top[].rank | integer | 名次（后端算好下发，前端不按下标 +1） |
| data.top[].user_id | integer | 用户ID |
| data.top[].nickname | string | 昵称 |
| data.top[].avatar | string | 头像 |
| data.top[].invite_num | integer | 活动门槛的需邀请人数，达到即发奖 |
| data.top[].is_me | boolean | 该行是否本人 |
| data.list | array | 榜单本页行数组（名次/用户 ID/昵称/头像/邀请人数/是否本人），已按前 50 名截好 |
| data.list[].rank | integer | 名次（后端算好下发，前端不按下标 +1） |
| data.list[].user_id | integer | 用户ID |
| data.list[].nickname | string | 昵称 |
| data.list[].avatar | string | 头像 |
| data.list[].invite_num | integer | 活动门槛的需邀请人数，达到即发奖 |
| data.list[].is_me | boolean | 该行是否本人 |
| data.total | integer | 合计 |
| data.page | integer | 页码 |
| data.has_more | boolean | 是否有more |
| data.me | object | 「我」那一行：名次/进度/是否上榜 |
| data.me.rank | integer | 名次（后端算好下发，前端不按下标 +1） |
| data.me.invite_num | integer | 活动门槛的需邀请人数，达到即发奖 |
| data.me.on_board | boolean | 我是否在榜上（名下有至少一条已计入归因行）；未登录或未邀人为 false |
| data.me.nickname | string | 昵称 |
| data.me.avatar | string | 头像 |
| data.activity | object | 活动 |
| data.activity.status | integer | 状态 |
| data.activity.run_state | integer | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.activity.run_state_text | string | 活动状态标签文案（进行中 / 已结束 / 已失效） |
| data.activity.run_state_key | string | 活动状态键 off=未开启 / running=进行中 / ended=已结束，前端上色只认它 |
| data.activity.end_time | integer | 结束时间 |
| data.activity.end_time_text | string | 截止时间文案（后端格式化好的文本，前端不自己比时间戳） |
| data.activity.show_rule | integer | 是否展示活动规则：0 时规则正文整段回空串，不回落 |
| data.activity.rule_html | string | 活动规则说明富文本正文（上限 2000 字） |
| data.activity.show_prize | integer | 是否展示奖品档位：0 时档位数组回空 |
| data.activity.rewards | array | 奖励档位数组（按起始名次升序，最多 10 档） |
| data.attr | object | 枚举文案字典（界面标签的唯一来源，前端禁止写死选项） |
| data.attr.risk_tip | string | 合规提示文案（诱导分享可能被微信平台管控那句） |

## 备注

- 入口显隐只看达人榜设置表单那枚「状态」（show_entry），榜空照出、自然到期也不收入口
- 只显示前 50 名（APP_RANK_MAX），has_more 一并算对，避免上拉一直在转圈却拿不到新行
- 免登录可读：游客拿到的 me 自然落「未上榜」
