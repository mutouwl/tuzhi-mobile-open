# 打卡动态详情

> 作者口径与动态流同一份：本人看得见自己那条，判据只存 VisibilityService::canView 一处。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.diaryDetail` |
| 接口地址 | `POST /api/app/checkin/checkin/diaryDetail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| record_id | integer | 是 | 动态 ID | `33827` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/diaryDetail' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"record_id":33827}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344789",
  "data": {
    "id": 33827,
    "uniacid": 1,
    "checkin_id": 628,
    "task_id": 15222,
    "user_id": 38,
    "day": "2026-09-28",
    "content": "你好吗？我知道了。",
    "images": [],
    "videos": [],
    "audios": [],
    "files": [],
    "is_makeup": 0,
    "visible_to": 0,
    "is_featured": 0,
    "is_top": 0,
    "like_count": 0,
    "comment_count": 0,
    "status": 1,
    "createtime": 1790569760,
    "updatetime": 1790569760,
    "link_data": [],
    "nickname": "冯**",
    "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
    "is_official": 0,
    "checkin_title": "name",
    "checkin_cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "allow_user_comment": 1,
    "task_title": "副本-章节1任务1",
    "day_seq": 5,
    "total_days": 5,
    "quotes": [
      {
        "text": "千里之行，始于足下。",
        "from": "老子《道德经》"
      },
      {
        "text": "合抱之木，生于毫末。",
        "from": "老子《道德经》"
      },
      {
        "text": "不积跬步，无以至千里。",
        "from": "荀子《劝学》"
      },
      {
        "text": "锲而不舍，金石可镂。",
        "from": "荀子《劝学》"
      },
      {
        "text": "天行健，君子以自强不息。",
        "from": "《周易》"
      },
      {
        "text": "路漫漫其修远兮，吾将上下而求索。",
        "from": "屈原《离骚》"
      },
      {
        "text": "博观而约取，厚积而薄发。",
        "from": "苏轼《稼说送张琥》"
      },
      {
        "text": "苟日新，日日新，又日新。",
        "from": "《礼记·大学》"
      },
      {
        "text": "绳锯木断，水滴石穿。",
        "from": "罗大经《鹤林玉露》"
      },
      {
        "text": "不驰于空想，不骛于虚声。",
        "from": "李大钊"
      }
    ],
    "share_bgs": [],
    "is_liked": 0,
    "is_mine": 1
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
| data.checkin_id | integer | 打卡活动ID |
| data.task_id | integer | 任务ID |
| data.user_id | integer | 用户ID |
| data.day | string | 天数 |
| data.content | string | 内容 |
| data.images | array | 图片地址数组 |
| data.videos | array | 视频地址数组 |
| data.audios | array | 语音地址数组 |
| data.files | array | 附件数组（每项含 url、name、size） |
| data.is_makeup | integer | 是否补卡提交：1=补卡（day 记的是被补的那一天） |
| data.visible_to | integer | 动态可见范围：0=所有人 / 1=仅管理员（除作者本人外的学员与游客都看不到，本人始终看得见自己那条） |
| data.is_featured | integer | 是否被管理员设为精选（动态流「只看精选」筛这一列） |
| data.is_top | integer | 是否置顶（动态流排序第一键） |
| data.like_count | integer | 点赞数量 |
| data.comment_count | integer | 评论数量 |
| data.status | integer | 状态 |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
| data.link_data | array | 动态挂的课程卡数组（按 record_id 实时 JOIN 现拼，非发布时快照；课程已删或未上架则不出卡） |
| data.nickname | string | 昵称 |
| data.avatar | string | 头像 |
| data.is_official | integer | 1=管理员后台发布的官方动态（user_id=0，不计入学员统计与排名） |
| data.checkin_title | string | 所属打卡活动名称（与任务名 title 区分开） |
| data.checkin_cover | string | 所属打卡活动封面地址（分享卡片用，缺失时前端回退站点 logo） |
| data.allow_user_comment | integer | 活动级评论总闸：0=学员不能评论与回复，管理员点评不受影响 |
| data.task_title | string | 动态卡上的任务名：task_id=0 时是「普通日记打卡」，官方动态是「官方日记」 |
| data.day_seq | integer | 这条动态是作者加入后的第 N 天（同日多条同序号，官方动态恒 0） |
| data.total_days | integer | 合计天数 |
| data.quotes | array | 日签图金句数组，每项 {text 金句正文, from 出处} |
| data.quotes[].text | string | 文本 |
| data.quotes[].from | string | 出处（日签图金句的那一句来源） |
| data.share_bgs | array | 日签图背景图清单，空清单正是前端「整排用自带弥散渐变档」的判据 |
| data.is_liked | integer | 当前用户是否已点过赞（接口回权威值，前端不自己 +1） |
| data.is_mine | integer | 是否本人：这一行的作者/发布者是我 |

## 备注

- 软删的动态仍允许本人读到落地页（用于「已删除」那一档的界面），不可见者回「该日记不可见」
