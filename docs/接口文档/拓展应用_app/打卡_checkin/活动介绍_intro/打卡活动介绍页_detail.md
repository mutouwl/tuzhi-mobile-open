# 打卡活动介绍页

> 分享出去的落地页：只出活动段（封面/名称/统计/打卡信息/活动介绍/关联课程）与参与态标记，不含任务栏与动态流。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.intro.detail` |
| 接口地址 | `POST /api/app/checkin/intro/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Intro（打卡用户端接口 - 活动介绍页（商品详情形态，未登录也能看）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/intro/detail' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344794",
  "data": {
    "id": 628,
    "uniacid": 1,
    "title": "name",
    "cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "detail": "<p>123<img src=\"https://tuzistudy.oss-cn-beijing.aliyuncs.com/uploads/20260924/1790238068591-1.png\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png\" alt=\"\" data-href=\"\" style=\"\"/></p>",
    "checkin_mode": 2,
    "task_show_type": 1,
    "time_type": 1,
    "frequency_type": 2,
    "frequency_days": 1,
    "frequency_time": "08:00:00",
    "frequency_tasks": 1,
    "start_date": "2026-09-24",
    "end_date": null,
    "total_days": 0,
    "rest_type": 0,
    "rest_weeks": "",
    "rest_dates": "[]",
    "day_start": "00:00:00",
    "day_end": "23:59:59",
    "per_day_type": 2,
    "per_day": 0,
    "makeup_total": 0,
    "join_type": "free",
    "price": "0.00",
    "course_id": 0,
    "join_deadline_type": 1,
    "join_deadline": 0,
    "isolation_mode": 1,
    "allow_user_post": 1,
    "allow_user_comment": 1,
    "default_tip": "",
    "default_template": "",
    "default_day_start": "00:00:00",
    "default_day_end": "23:59:59",
    "default_require": {
      "preview": 1,
      "task_max": 1,
      "allow_image": 1,
      "allow_audio": 1,
      "allow_video": 1,
      "allow_file": 1
    },
    "share_title": "",
    "share_desc": "",
    "share_cover": "",
    "status": 1,
    "createtime": 1790246123,
    "updatetime": 1790559179,
    "run_state": "ongoing",
    "done_days": 14,
    "join_count": 4,
    "record_count": 19,
    "is_member": 0,
    "is_black": 0,
    "attr": {
      "checkin_mode": {
        "1": "日历打卡",
        "2": "闯关打卡"
      },
      "join_type": {
        "free": "免费参与",
        "pay": "付费参与",
        "password": "****",
        "student": "指定学员",
        "course": "绑定课程"
      },
      "time_type": {
        "1": "固定起止时间",
        "2": "固定天数（随到随学）"
      },
      "run_state": {
        "not_started": "未开始",
        "ongoing": "进行中",
        "ended": "已结束"
      }
    },
    "course": null,
    "has_course": 0,
    "is_virtual_pay": 0
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
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.title | string | 标题 |
| data.cover | string | 封面图 |
| data.detail | string | 详情 |
| data.checkin_mode | integer | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |
| data.task_show_type | integer | 活动级显示设置遗留列，判据已降到任务行，仅随活动行带出 |
| data.time_type | integer | 时间类型 |
| data.frequency_type | integer | 打卡频率：1=按周期放量 / 2=自定义逐任务排期（不做放量闸门，缺省档） |
| data.frequency_days | integer | 按周期档：每 N 天放量一次（≤0 按 1 算），基准日是成员自己窗口的起始日 |
| data.frequency_time | string | 按周期档：每个周期的解锁时刻 HH:MM:SS（空值按 08:00:00） |
| data.frequency_tasks | integer | 按周期档：每次累计解锁 M 个任务（≤0 按 1 算） |
| data.start_date | string | 开始日期（Y-m-d） |
| data.end_date | null | 结束日期（Y-m-d） |
| data.total_days | integer | 合计天数 |
| data.rest_type | integer | 休息日类型：0=不设 / 1=按周 / 2=按日期（补卡不受休息日限制） |
| data.rest_weeks | string | 按周休息的星期清单（逗号串，0=周日…6=周六） |
| data.rest_dates | string | 按日期休息的日期清单（JSON 数组串，下发列原值） |
| data.day_start | string | 活动每日打卡时段开始 HH:MM:SS |
| data.day_end | string | 活动每日打卡时段结束 HH:MM:SS |
| data.per_day_type | integer | 每日次数限制方式：1=最多 N 次 / 2=不限制 |
| data.per_day | integer | 每日最多打卡次数（per_day_type=1 时生效） |
| data.makeup_total | integer | 允许补卡的总次数，0=不允许补卡 |
| data.join_type | string | 加入类型 |
| data.price | string | 价格 |
| data.course_id | integer | 课程ID |
| data.join_deadline_type | integer | 参与截止方式：1=无限制 / 2=自定义（只有 2 且时间戳>0 才拦人） |
| data.join_deadline | integer | 自定义参与截止时间戳，过期拒绝新参与 |
| data.isolation_mode | integer | 分组隔离：0=关 / 1=开（开=已分组学员只可见本组动态，未分组不受限） |
| data.allow_user_post | integer | 发布兜底总闸：0=学员既不能提交打卡也不能发普通动态，只有管理员后台能发 |
| data.allow_user_comment | integer | 活动级评论总闸：0=学员不能评论与回复，管理员点评不受影响 |
| data.default_tip | string | 默认规则的打卡提示（不选任务的普通动态与建任务预填都用它） |
| data.default_template | string | 默认规则的打卡范本（提交页预填参考文本） |
| data.default_day_start | string | 默认规则时段开始 HH:MM:SS——普通动态（task_id=0）判当日时段就用它 |
| data.default_day_end | string | 默认规则时段结束 HH:MM:SS，与 default_day_start 成对 |
| data.default_require | object | 默认打卡要求（下限键 text_min/images_min/videos_min/audios_min + 任务规则缺省键） |
| data.default_require.preview | integer | 预览 |
| data.default_require.task_max | integer | 本任务当日可提交次数上限，0=不限制，最大 99 |
| data.default_require.allow_image | integer | 图片上传开关：0=关闭（关则连一条都不收） |
| data.default_require.allow_audio | integer | 语音上传开关：0=关闭 |
| data.default_require.allow_video | integer | 视频上传开关：0=关闭 |
| data.default_require.allow_file | integer | 附件上传开关：0=关闭 |
| data.share_title | string | 分享标题 |
| data.share_desc | string | 分享描述 |
| data.share_cover | string | 分享封面图 |
| data.status | integer | 状态 |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
| data.run_state | string | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.done_days | integer | 活动到今天已跑掉的有效天数（扣休息日；固定天数档返回 0） |
| data.join_count | integer | 加入数量 |
| data.record_count | integer | 本活动动态总条数（软删的不计，官方动态也计） |
| data.is_member | integer | 1=当前用户已参与本活动（被移除或被拉黑都视同未参与） |
| data.is_black | integer | 1=我已被本活动拉黑（吸底栏据此换成「已被拉黑」那句，不摆必被拒的参与按钮） |
| data.attr | object | 枚举文案字典（界面标签的唯一来源，前端禁止写死选项） |
| data.attr.checkin_mode | object | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |
| data.attr.checkin_mode[] | string | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |
| data.attr.join_type | object | 加入类型 |
| data.attr.join_type.free | string | 免费参与 |
| data.attr.join_type.pay | string | 付费参与 |
| data.attr.join_type.password | string | 密码兑换 |
| data.attr.join_type.student | string | 指定学员 |
| data.attr.join_type.course | string | 绑定课程 |
| data.attr.time_type | object | 时间类型 |
| data.attr.time_type[] | string | 打卡时间方式：1=固定起止时间 / 2=固定天数随到随学 |
| data.attr.run_state | object | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.attr.run_state.not_started | string | 未开始 |
| data.attr.run_state.ongoing | string | 进行中 |
| data.attr.run_state.ended | string | 已结束 |
| data.course | null | 课程 |
| data.has_course | integer | 是否有课程 |
| data.is_virtual_pay | integer | 1=本行 price 是代币展示价（仅微信小程序端可能为 1）/ 0=人民币 |

## 备注

- 免登录接口，但带 token 时仍回本人的参与态（is_member / has_course / is_black），吸底栏不会把「进入打卡」错显示成「免费参与」
- 兑换口令由本接口抹掉，页面只按 join_type 渲染参与入口
