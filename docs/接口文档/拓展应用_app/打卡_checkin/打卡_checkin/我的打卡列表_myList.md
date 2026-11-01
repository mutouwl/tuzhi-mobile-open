# 我的打卡列表

> 「我参与的」活动行在前、「可参与的」预览段在后，末尾统一下发参与条件/打卡状态/打卡模式三组枚举文案。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.myList` |
| 接口地址 | `POST /api/app/checkin/checkin/myList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 10 | - |
| sort | string | 否 | 排序档：join=最近加入（缺省）/ use=最近使用 / today=今日任务 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/myList' \
  -H 'Content-Type: application/json' \
  -d '{"page":"xxx","limit":"xxx","sort":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344779",
  "data": {
    "total": 4,
    "rows": [
      {
        "id": 17565,
        "uniacid": 1,
        "title": "闯关打卡",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "detail": "<p>123</p>",
        "checkin_mode": 2,
        "task_show_type": 1,
        "time_type": 2,
        "frequency_type": 1,
        "frequency_days": 1,
        "frequency_time": "08:00:00",
        "frequency_tasks": 1,
        "start_date": null,
        "end_date": null,
        "total_days": 10,
        "rest_type": 2,
        "rest_weeks": "",
        "rest_dates": "[\"2026-09-08\",\"2026-09-11\",\"2026-09-12\",\"2026-09-13\",\"2026-09-14\",\"2026-09-15\",\"2026-09-16\",\"2026-09-17\",\"2026-09-18\",\"2026-09-19\",\"2026-09-20\",\"2026-09-21\",\"2026-09-22\",\"2026-09-23\",\"2026-09-24\",\"2026-09-25\",\"2026-09-29\",\"2026-09-30\",\"2026-10-01\",\"2026-10-02\",\"2026-10-03\",\"2026-10-04\",\"2026-10-05\",…（已截断，共 391 字符）",
        "day_start": "00:00:00",
        "day_end": "23:59:59",
        "per_day_type": 2,
        "per_day": 0,
        "makeup_total": 0,
        "join_type": "free",
        "price": "0.00",
        "password": "****",
        "course_id": 0,
        "join_deadline_type": 1,
        "join_deadline": 0,
        "isolation_mode": 0,
        "allow_user_post": 1,
        "allow_user_comment": 1,
        "default_tip": "",
        "default_template": "",
        "default_day_start": "00:00:00",
        "default_day_end": "23:59:59",
        "default_require": "{\"preview\":1,\"task_max\":1,\"allow_image\":1,\"allow_audio\":1,\"allow_video\":1,\"allow_file\":1}",
        "share_title": "",
        "share_desc": "",
        "share_cover": "",
        "status": 1,
        "createtime": 1790414076,
        "updatetime": 1790414117,
        "member_id": 22560,
        "member_status": 1,
        "own_start": "2026-09-27",
        "own_end": "2026-10-06",
        "my_nickname": "",
        "run_state": "ongoing",
        "done_days": 0,
        "task_count": 3,
        "join_count": 2,
        "record_count": 3,
        "course_name": "",
        "course_cover": "",
        "is_member": 1,
        "day_count": 1
      },
      {
        "id": 12638,
        "uniacid": 1,
        "title": "闯关打卡",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "detail": "<p>123</p>",
        "checkin_mode": 2,
        "task_show_type": 1,
        "time_type": 1,
        "frequency_type": 2,
        "frequency_days": 1,
        "frequency_time": "08:00:00",
        "frequency_tasks": 1,
        "start_date": "2026-09-28",
        "end_date": null,
        "total_days": 0,
        "rest_type": 0,
        "rest_weeks": "",
        "rest_dates": "",
        "day_start": "00:00:00",
        "day_end": "23:59:59",
        "per_day_type": 1,
        "per_day": 1,
        "makeup_total": 0,
        "join_type": "free",
        "price": "0.00",
        "password": "****",
        "course_id": 0,
        "join_deadline_type": 1,
        "join_deadline": 0,
        "isolation_mode": 0,
        "allow_user_post": 1,
        "allow_user_comment": 1,
        "default_tip": "",
        "default_template": "",
        "default_day_start": "00:00:00",
        "default_day_end": "23:59:59",
        "default_require": "",
        "share_title": "",
        "share_desc": "",
        "share_cover": "",
        "status": 1,
        "createtime": 1790393863,
        "updatetime": 1790393914,
        "member_id": 11227,
        "member_status": 1,
        "own_start": "2026-09-28",
        "own_end": "9999-12-31",
        "my_nickname": "",
        "run_state": "ongoing",
        "done_days": 10,
        "task_count": 2,
        "join_count": 2,
        "record_count": 1,
        "course_name": "",
        "course_cover": "",
        "is_member": 1,
        "day_count": 0
      },
      {
        "id": 4130,
        "uniacid": 1,
        "title": "收费打卡",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "detail": "<p>123</p>",
        "checkin_mode": 1,
        "task_show_type": 1,
        "time_type": 1,
        "frequency_type": 2,
        "frequency_days": 1,
        "frequency_time": "08:00:00",
        "frequency_tasks": 1,
        "start_date": "2026-09-25",
        "end_date": "2026-10-20",
        "total_days": 26,
        "rest_type": 0,
        "rest_weeks": "",
        "rest_dates": "",
        "day_start": "00:00:00",
        "day_end": "23:59:59",
        "per_day_type": 1,
        "per_day": 1,
        "makeup_total": 0,
        "join_type": "pay",
        "price": "1.00",
        "password": "****",
        "course_id": 0,
        "join_deadline_type": 1,
        "join_deadline": 0,
        "isolation_mode": 0,
        "allow_user_post": 1,
        "allow_user_comment": 1,
        "default_tip": "",
        "default_template": "",
        "default_day_start": "00:00:00",
        "default_day_end": "23:59:59",
        "default_require": "",
        "share_title": "",
        "share_desc": "",
        "share_cover": "",
        "status": 1,
        "createtime": 1790317105,
        "updatetime": 1790317133,
        "member_id": 3929,
        "member_status": 1,
        "own_start": "2026-09-25",
        "own_end": "2026-10-20",
        "my_nickname": "",
        "run_state": "ongoing",
        "done_days": 13,
        "task_count": 1,
        "join_count": 1,
        "record_count": 2,
        "course_name": "",
        "course_cover": "",
        "is_member": 1,
        "day_count": 2
      },
      {
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
        "password": "****",
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
        "default_require": "{\"preview\":1,\"task_max\":1,\"allow_image\":1,\"allow_audio\":1,\"allow_video\":1,\"allow_file\":1}",
        "share_title": "",
        "share_desc": "",
        "share_cover": "",
        "status": 1,
        "createtime": 1790246123,
        "updatetime": 1790559179,
        "member_id": 627,
        "member_status": 1,
        "own_start": "2026-09-24",
        "own_end": "2026-10-20",
        "my_nickname": "冯浩森@凸",
        "run_state": "ongoing",
        "done_days": 14,
        "task_count": 12,
        "join_count": 4,
        "record_count": 19,
        "course_name": "",
        "course_cover": "",
        "is_member": 1,
        "day_count": 5
      }
    ],
    "discover": [],
    "attr": {
      "join_type": {
        "free": "免费参与",
        "pay": "付费参与",
        "password": "****",
        "student": "指定学员",
        "course": "绑定课程"
      },
      "run_state": {
        "not_started": "未开始",
        "ongoing": "进行中",
        "ended": "已结束"
      },
      "checkin_mode": {
        "1": "日历打卡",
        "2": "闯关打卡"
      }
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
| data.rows[].id | integer | ID |
| data.rows[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.rows[].title | string | 标题 |
| data.rows[].cover | string | 封面图 |
| data.rows[].detail | string | 详情 |
| data.rows[].checkin_mode | integer | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |
| data.rows[].task_show_type | integer | 活动级显示设置遗留列，判据已降到任务行，仅随活动行带出 |
| data.rows[].time_type | integer | 时间类型 |
| data.rows[].frequency_type | integer | 打卡频率：1=按周期放量 / 2=自定义逐任务排期（不做放量闸门，缺省档） |
| data.rows[].frequency_days | integer | 按周期档：每 N 天放量一次（≤0 按 1 算），基准日是成员自己窗口的起始日 |
| data.rows[].frequency_time | string | 按周期档：每个周期的解锁时刻 HH:MM:SS（空值按 08:00:00） |
| data.rows[].frequency_tasks | integer | 按周期档：每次累计解锁 M 个任务（≤0 按 1 算） |
| data.rows[].start_date | null | 开始日期（Y-m-d） |
| data.rows[].end_date | null | 结束日期（Y-m-d） |
| data.rows[].total_days | integer | 合计天数 |
| data.rows[].rest_type | integer | 休息日类型：0=不设 / 1=按周 / 2=按日期（补卡不受休息日限制） |
| data.rows[].rest_weeks | string | 按周休息的星期清单（逗号串，0=周日…6=周六） |
| data.rows[].rest_dates | string | 按日期休息的日期清单（JSON 数组串，下发列原值） |
| data.rows[].day_start | string | 活动每日打卡时段开始 HH:MM:SS |
| data.rows[].day_end | string | 活动每日打卡时段结束 HH:MM:SS |
| data.rows[].per_day_type | integer | 每日次数限制方式：1=最多 N 次 / 2=不限制 |
| data.rows[].per_day | integer | 每日最多打卡次数（per_day_type=1 时生效） |
| data.rows[].makeup_total | integer | 允许补卡的总次数，0=不允许补卡 |
| data.rows[].join_type | string | 加入类型 |
| data.rows[].price | string | 价格 |
| data.rows[].password | string | 密码 |
| data.rows[].course_id | integer | 课程ID |
| data.rows[].join_deadline_type | integer | 参与截止方式：1=无限制 / 2=自定义（只有 2 且时间戳>0 才拦人） |
| data.rows[].join_deadline | integer | 自定义参与截止时间戳，过期拒绝新参与 |
| data.rows[].isolation_mode | integer | 分组隔离：0=关 / 1=开（开=已分组学员只可见本组动态，未分组不受限） |
| data.rows[].allow_user_post | integer | 发布兜底总闸：0=学员既不能提交打卡也不能发普通动态，只有管理员后台能发 |
| data.rows[].allow_user_comment | integer | 活动级评论总闸：0=学员不能评论与回复，管理员点评不受影响 |
| data.rows[].default_tip | string | 默认规则的打卡提示（不选任务的普通动态与建任务预填都用它） |
| data.rows[].default_template | string | 默认规则的打卡范本（提交页预填参考文本） |
| data.rows[].default_day_start | string | 默认规则时段开始 HH:MM:SS——普通动态（task_id=0）判当日时段就用它 |
| data.rows[].default_day_end | string | 默认规则时段结束 HH:MM:SS，与 default_day_start 成对 |
| data.rows[].default_require | string | 默认打卡要求（下限键 text_min/images_min/videos_min/audios_min + 任务规则缺省键） |
| data.rows[].share_title | string | 分享标题 |
| data.rows[].share_desc | string | 分享描述 |
| data.rows[].share_cover | string | 分享封面图 |
| data.rows[].status | integer | 状态 |
| data.rows[].createtime | integer | 创建时间（时间戳） |
| data.rows[].updatetime | integer | 更新时间（时间戳） |
| data.rows[].member_id | integer | 成员记录ID（我在这一块成员表里的那一行） |
| data.rows[].member_status | integer | 成员状态值（打卡：1=正常 2=暂停可浏览不可提交 0=移除/未参与） |
| data.rows[].own_start | string | 我的个人打卡窗起始日（Y-m-d） |
| data.rows[].own_end | string | 我的个人打卡窗截止日（Y-m-d）；活动「结束不限」时是哨兵值 9999-12-31，界面别直接摆出来 |
| data.rows[].my_nickname | string | 我在本活动填的打卡昵称原值（空串=没填） |
| data.rows[].run_state | string | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.rows[].done_days | integer | 活动到今天已跑掉的有效天数（扣休息日；固定天数档返回 0） |
| data.rows[].task_count | integer | 本活动未删除任务数 |
| data.rows[].join_count | integer | 加入数量 |
| data.rows[].record_count | integer | 本活动动态总条数（软删的不计，官方动态也计） |
| data.rows[].course_name | string | 课程名称 |
| data.rows[].course_cover | string | 课程封面图 |
| data.rows[].is_member | integer | 1=当前用户已参与本活动（被移除或被拉黑都视同未参与） |
| data.rows[].day_count | integer | 天数数量 |
| data.discover | array | 「可参与的」首屏预览段（全量走 discoverList） |
| data.attr | object | 枚举文案字典（界面标签的唯一来源，前端禁止写死选项） |
| data.attr.join_type | object | 加入类型 |
| data.attr.join_type.free | string | 免费参与 |
| data.attr.join_type.pay | string | 付费参与 |
| data.attr.join_type.password | string | 密码兑换 |
| data.attr.join_type.student | string | 指定学员（后台名单导入） |
| data.attr.join_type.course | string | 绑定课程（需先购课） |
| data.attr.run_state | object | 活动运行状态：not_started=未开始 / ongoing=进行中 / ended=已结束 |
| data.attr.run_state.not_started | string | 未开始 |
| data.attr.run_state.ongoing | string | 进行中 |
| data.attr.run_state.ended | string | 已结束 |
| data.attr.checkin_mode | object | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |
| data.attr.checkin_mode[] | string | 打卡模式：1=日历打卡（统一进度）2=闯关打卡（打完上一关才解锁下一关） |

## 备注

- 打卡是付费插件，未安装时本族路由的控制器文件根本不存在，调用点须先按 common/init 下发的 app_isinstall_checkin 收起入口
- attr.join_type / attr.run_state / attr.checkin_mode 是卡片标签的唯一文案来源，前端禁止写死选项
