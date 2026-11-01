# 打卡某日动态列表

> 打卡记录页点某一天；带 user_id 就是看该学员当天的记录，跨组遮蔽时仍回完整形状（total=0）并给出遮蔽原因。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.dayDetail` |
| 接口地址 | `POST /api/app/checkin/checkin/dayDetail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| day | string | 否 | 日期（Y-m-d），缺省为当天 | `2026-09-28` |
| user_id | integer | 否 | 被查看学员的用户 ID，缺省或等于本人即看自己 | - |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 10，上限 30 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/dayDetail' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"day":"2026-09-28","user_id":"xxx","page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344787",
  "data": {
    "day": "2026-09-28",
    "total": 1,
    "page": 1,
    "limit": 10,
    "has_more": false,
    "records": [
      {
        "id": 33827,
        "user_id": 38,
        "nickname": "冯**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "is_official": 0,
        "day": "2026-09-28",
        "day_seq": 5,
        "task_id": 15222,
        "task_title": "副本-章节1任务1",
        "content": "你好吗？我知道了。",
        "images": [],
        "videos": [],
        "audios": [],
        "files": [],
        "link_data": [],
        "is_makeup": 0,
        "allow_user_comment": 1,
        "is_featured": 0,
        "is_top": 0,
        "visible_to": 0,
        "like_count": 0,
        "comment_count": 0,
        "comments": [],
        "is_liked": 0,
        "createtime": 1790569760,
        "is_mine": 1
      }
    ],
    "tasks": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.day | string | 天数 |
| data.total | integer | 合计 |
| data.page | integer | 页码 |
| data.limit | integer | 每页数量 |
| data.has_more | boolean | 是否有more |
| data.records | array | 记录数组 |
| data.records[].id | integer | ID |
| data.records[].user_id | integer | 用户ID |
| data.records[].nickname | string | 昵称 |
| data.records[].avatar | string | 头像 |
| data.records[].is_official | integer | 1=管理员后台发布的官方动态（user_id=0，不计入学员统计与排名） |
| data.records[].day | string | 天数 |
| data.records[].day_seq | integer | 这条动态是作者加入后的第 N 天（同日多条同序号，官方动态恒 0） |
| data.records[].task_id | integer | 任务ID |
| data.records[].task_title | string | 动态卡上的任务名：task_id=0 时是「普通日记打卡」，官方动态是「官方日记」 |
| data.records[].content | string | 内容 |
| data.records[].images | array | 图片地址数组 |
| data.records[].videos | array | 视频地址数组 |
| data.records[].audios | array | 语音地址数组 |
| data.records[].files | array | 附件数组（每项含 url、name、size） |
| data.records[].link_data | array | 动态挂的课程卡数组（按 record_id 实时 JOIN 现拼，非发布时快照；课程已删或未上架则不出卡） |
| data.records[].is_makeup | integer | 是否补卡提交：1=补卡（day 记的是被补的那一天） |
| data.records[].allow_user_comment | integer | 活动级评论总闸：0=学员不能评论与回复，管理员点评不受影响 |
| data.records[].is_featured | integer | 是否被管理员设为精选（动态流「只看精选」筛这一列） |
| data.records[].is_top | integer | 是否置顶（动态流排序第一键） |
| data.records[].visible_to | integer | 动态可见范围：0=所有人 / 1=仅管理员（除作者本人外的学员与游客都看不到，本人始终看得见自己那条） |
| data.records[].like_count | integer | 点赞数量 |
| data.records[].comment_count | integer | 评论数量 |
| data.records[].comments | array | 评论预览数组（无评论为空数组） |
| data.records[].is_liked | integer | 当前用户是否已点过赞（接口回权威值，前端不自己 +1） |
| data.records[].createtime | integer | 创建时间（时间戳） |
| data.records[].is_mine | integer | 是否本人：这一行的作者/发布者是我 |
| data.tasks | array | 任务数组 |

## 备注

- 只看「所有人可见」：带 user_id 看别人时，仅管理员可见的动态既列不出来，也不在统计与日历红点里占位
- 被分组遮蔽时不报错，改为 masked=1 + 空列表，那一句原因由记录页的 masked_msg 说
