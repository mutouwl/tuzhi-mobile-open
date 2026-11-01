# 打卡任务详情

> 活动由任务行反推：任务卡、分享链接、海报二维码三个入口形状相同，只带 task_id 也能定位。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.taskDetail` |
| 接口地址 | `POST /api/app/checkin/checkin/taskDetail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| task_id | integer | 是 | 打卡任务 ID | `15222` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/taskDetail' \
  -H 'Content-Type: application/json' \
  -d '{"task_id":15222}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344782",
  "data": {
    "id": 15222,
    "title": "副本-章节1任务1",
    "content": "<p>正文内容</p><p><br></p>",
    "tip": "",
    "template": "",
    "require": {
      "text_min": 0,
      "images_min": 0,
      "videos_min": 0,
      "audios_min": 0
    },
    "preview": 1,
    "day": "2026-09-27",
    "level": 2,
    "start_time": 1790438400,
    "end_time": 2105884799,
    "show_time": 0,
    "user_count": 2,
    "done": 1,
    "locked": 0,
    "released": 1,
    "can_makeup": 0,
    "can_check": 0,
    "check_state": "done",
    "check_text": "已打卡",
    "check_msg": "今日已完成该任务",
    "checkin_id": 628,
    "checkin_mode": 2,
    "checkin_title": "name",
    "checkin_cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "is_member": 1,
    "member_status": 1,
    "can_submit": 1
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.title | string | 标题 |
| data.content | string | 内容 |
| data.tip | string | 该任务的打卡提示文本（未解锁且关了提前预习时为空串） |
| data.template | string | 该任务的打卡范本（提交页预填） |
| data.require | object | 打卡要求（本口已解析成对象，下限键见 text_min / images_min 等） |
| data.require.text_min | integer | 正文最少字数下限，0=不限制 |
| data.require.images_min | integer | 图片最少张数下限，0=不限制 |
| data.require.videos_min | integer | 视频最少个数下限，0=不限制（与 images_min 合计不得超过 9） |
| data.require.audios_min | integer | 语音最少条数下限，0=不限制 |
| data.preview | integer | 1=正文已下发 / 0=因未解锁被清空（页面据此说明「不是本来就空的」） |
| data.day | string | 天数 |
| data.level | integer | 等级 |
| data.start_time | integer | 开始时间 |
| data.end_time | integer | 结束时间 |
| data.show_time | integer | 1=卡片要摆「起 至 止」时间行 / 0=不摆（闯关模式的起止是宽窗口底座） |
| data.user_count | integer | 用户数量 |
| data.done | integer | 1=我已打过这张卡（日历模式按「目标日 + 任务」判） |
| data.locked | integer | 1=未解锁（上一关未完成，或未到放量时刻） |
| data.released | integer | 1=频率已放量到本任务（活动未启用按周期频率时恒 1，不能当成「都没解锁」） |
| data.can_makeup | integer | 1=待补卡（未打、未锁、目标日早于今天、活动未结束且还有补卡次数） |
| data.can_check | integer | 1=此刻闸门放行可打卡（按钮不置灰，点击给原因） |
| data.check_state | string | 打卡闸门状态：空串=放行 / not_started=未开始 / ended=已截止 / rest_day=今日休息 / out_of_slot=不在时段 / invalid_slot=时段无交集 / daily_limit=次数已满 / locked=未解锁 / done=已打卡 / makeup=待补卡 / closed=发布总闸关闭 |
| data.check_text | string | 闸门状态的右上角中文标签，放行态与总闸关闭档都是空串 |
| data.check_msg | string | 点这张卡时的提示语与提交报错同一句话（含具体时间），放行时为空串 |
| data.checkin_id | integer | 打卡活动ID |
| data.checkin_mode | integer | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |
| data.checkin_title | string | 所属打卡活动名称（与任务名 title 区分开） |
| data.checkin_cover | string | 所属打卡活动封面地址（分享卡片用，缺失时前端回退站点 logo） |
| data.is_member | integer | 1=当前用户已参与本活动（被移除或被拉黑都视同未参与） |
| data.member_status | integer | 成员状态值（打卡：1=正常 2=暂停可浏览不可提交 0=移除/未参与） |
| data.can_submit | integer | 是否可提交 |

## 备注

- task_id 不存在或已隐藏时回「任务不存在或已隐藏」，与提交接口的可见性校验同一句文案
