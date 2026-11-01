# 打卡动态流分页

> 活动主页下方那一列动态，支持只看精选、发表日期区间、分组、排序、按任务与正文关键词筛选。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.feed` |
| 接口地址 | `POST /api/app/checkin/checkin/feed` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 10 | - |
| featured | integer | 否 | 只看精选：1=只看管理员精选的动态 | - |
| day_start | string | 否 | 发表日期起（Y-m-d） | - |
| day_end | string | 否 | 发表日期止（Y-m-d） | - |
| group_id | integer | 否 | 分组 ID（分组隔离模式下按组筛选） | - |
| task_id | integer | 否 | 只看某个任务下的动态 | - |
| keyword | string | 否 | 正文关键词 | - |
| order | string | 否 | 排序档：desc=最新在前（缺省）/ asc=最早在前 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/feed' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"page":"xxx","limit":"xxx","featured":"xxx","day_start":"xxx","day_end":"xxx","group_id":"xxx","task_id":"xxx","keyword":"xxx","order":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344783",
  "data": {
    "total": 15,
    "rows": [
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
      },
      {
        "id": 33601,
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "is_official": 0,
        "day": "2026-09-27",
        "day_seq": 3,
        "task_id": 579,
        "task_title": "123",
        "content": "知道了",
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
        "like_count": 1,
        "comment_count": 0,
        "comments": [],
        "is_liked": 0,
        "createtime": 1790519033,
        "is_mine": 0
      },
      {
        "id": 32489,
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "is_official": 0,
        "day": "2026-09-27",
        "day_seq": 3,
        "task_id": 0,
        "task_title": "普通日记打卡",
        "content": "你好",
        "images": [
          "https://tuzhi.mutouweb.com/uploads/1/20260927/966c7d7e7e50f8138a674308041cdc1b.jpeg",
          "https://tuzhi.mutouweb.com/uploads/1/20260927/c05937dd679ebc6ff6d81e17a783e83e.png",
          "https://tuzhi.mutouweb.com/uploads/1/20260927/16d6b5380d6c709e57c10ebe2e6abc92.png",
          "https://tuzhi.mutouweb.com/uploads/1/20260927/6840239e3277599beaf6780abaee6684.png"
        ],
        "videos": [],
        "audios": [],
        "files": [],
        "link_data": [],
        "is_makeup": 0,
        "allow_user_comment": 1,
        "is_featured": 0,
        "is_top": 0,
        "visible_to": 0,
        "like_count": 1,
        "comment_count": 0,
        "comments": [],
        "is_liked": 0,
        "createtime": 1790511276,
        "is_mine": 0
      },
      {
        "id": 31866,
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "is_official": 0,
        "day": "2026-09-27",
        "day_seq": 3,
        "task_id": 3884,
        "task_title": "任务标题",
        "content": "你说的",
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
        "like_count": 2,
        "comment_count": 0,
        "comments": [],
        "is_liked": 1,
        "createtime": 1790492851,
        "is_mine": 0
      },
      {
        "id": 31865,
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "is_official": 0,
        "day": "2026-09-27",
        "day_seq": 3,
        "task_id": 6785,
        "task_title": "章节1任务1",
        "content": "嘿哈",
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
        "createtime": 1790492840,
        "is_mine": 0
      },
      {
        "id": 31864,
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "is_official": 0,
        "day": "2026-09-27",
        "day_seq": 3,
        "task_id": 6786,
        "task_title": "账务4",
        "content": "还查查\n你好吗\n我知道了",
        "images": [
          "https://tuzhi.mutouweb.com/uploads/1/20260927/966c7d7e7e50f8138a674308041cdc1b.jpeg"
        ],
        "videos": [],
        "audios": [],
        "files": [
          {
            "url": "https://tuzhi.mutouweb.com/uploads/1/20260927/4cf97757f94823d1bea8ec8e6299b178.pdf",
            "name": "%E5%8D%8E%E4%B8%BA%E4%BA%91%E5%90%88%E4%BD%9C%E4%BC%99%E4%BC%B4%E8%AE%A4%E8%AF%81%E5%8D%8F%E8%AE%AE-2023.pdf",
            "size": 251487
          }
        ],
        "link_data": [],
        "is_makeup": 0,
        "allow_user_comment": 1,
        "is_featured": 0,
        "is_top": 0,
        "visible_to": 0,
        "like_count": 2,
        "comment_count": 3,
        "comments": [
          {
            "id": 2080,
            "user_id": 486,
            "parent_id": 1752,
            "content": "哈哈哈",
            "star": 0,
            "is_admin": 0,
            "nickname": "冯**",
            "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
            "reply_nickname": "Admin1",
            "createtime": 1790510947
          },
          {
            "id": 1752,
            "user_id": 0,
            "parent_id": 0,
            "content": "还行吧",
            "star": 5,
            "is_admin": 1,
            "nickname": "A**",
            "avatar": "http://tuzhi.mutouweb.com/assets/img/avatar.png",
            "reply_nickname": "",
            "createtime": 1790500675
          },
          {
            "id": 1730,
            "user_id": 486,
            "parent_id": 0,
            "content": "哈哈",
            "star": 0,
            "is_admin": 0,
            "nickname": "冯**",
            "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
            "reply_nickname": "",
            "createtime": 1790492824
          }
        ],
        "is_liked": 1,
        "createtime": 1790492707,
        "is_mine": 0
      },
      {
        "id": 30340,
        "user_id": 38,
        "nickname": "冯**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "is_official": 0,
        "day": "2026-09-27",
        "day_seq": 4,
        "task_id": 3884,
        "task_title": "任务标题",
        "content": "非常开心😃",
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
        "like_count": 1,
        "comment_count": 0,
        "comments": [],
        "is_liked": 1,
        "createtime": 1790473514,
        "is_mine": 1
      },
      {
        "id": 25984,
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "is_official": 0,
        "day": "2026-09-26",
        "day_seq": 2,
        "task_id": 15222,
        "task_title": "副本-章节1任务1",
        "content": "哈哈哈",
        "images": [
          "https://tuzhi.mutouweb.com/uploads/20260926/16d6b5380d6c709e57c10ebe2e6abc92.png"
        ],
        "videos": [],
        "audios": [],
        "files": [],
        "link_data": [],
        "is_makeup": 0,
        "allow_user_comment": 1,
        "is_featured": 0,
        "is_top": 0,
        "visible_to": 0,
        "like_count": 2,
        "comment_count": 0,
        "comments": [],
        "is_liked": 1,
        "createtime": 1790419043,
        "is_mine": 0
      },
      {
        "id": 16568,
        "user_id": 38,
        "nickname": "冯**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
        "is_official": 0,
        "day": "2026-09-26",
        "day_seq": 3,
        "task_id": 579,
        "task_title": "123",
        "content": "pages/app/checkin/diary/diary?id=13223&amp;amp;checkin_id=628\n如果是别人的动态，点击右上角按钮不要显示日签图，日签图仅自己可见，如果右上角按钮点击后没有按钮，不要显示右上角的按钮了\npages/app/checkin/diary\n\n/diary?id=13223&amp;amp;checkin_id=628\n如果是别人的动态，点击右上角按钮不要显示日签图，日签图仅自己可见，如果右上角按钮点击后没有按钮，不要显示右上角的按钮了pages/app/checkin/diary/diary?id=13223&amp;amp;checkin_…（已截断，共 488 字符）",
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
        "like_count": 1,
        "comment_count": 5,
        "comments": [
          {
            "id": 629,
            "user_id": 486,
            "parent_id": 626,
            "content": "哈哈哈",
            "star": 0,
            "is_admin": 0,
            "nickname": "冯**",
            "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
            "reply_nickname": "Admin1",
            "createtime": 1790413486
          },
          {
            "id": 628,
            "user_id": 0,
            "parent_id": 0,
            "content": "我知道了",
            "star": 5,
            "is_admin": 1,
            "nickname": "A**",
            "avatar": "http://tuzhi.mutouweb.com/assets/img/avatar.png",
            "reply_nickname": "",
            "createtime": 1790413304
          },
          {
            "id": 627,
            "user_id": 0,
            "parent_id": 0,
            "content": "我知道了",
            "star": 5,
            "is_admin": 1,
            "nickname": "A**",
            "avatar": "http://tuzhi.mutouweb.com/assets/img/avatar.png",
            "reply_nickname": "",
            "createtime": 1790413233
          }
        ],
        "is_liked": 1,
        "createtime": 1790393317,
        "is_mine": 1
      },
      {
        "id": 16376,
        "user_id": 486,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "is_official": 0,
        "day": "2026-09-26",
        "day_seq": 2,
        "task_id": 1925,
        "task_title": "副本-123",
        "content": "弄",
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
        "like_count": 1,
        "comment_count": 0,
        "comments": [],
        "is_liked": 0,
        "createtime": 1790386988,
        "is_mine": 0
      }
    ]
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
| data.rows[].user_id | integer | 用户ID |
| data.rows[].nickname | string | 昵称 |
| data.rows[].avatar | string | 头像 |
| data.rows[].is_official | integer | 1=管理员后台发布的官方动态（user_id=0，不计入学员统计与排名） |
| data.rows[].day | string | 天数 |
| data.rows[].day_seq | integer | 这条动态是作者加入后的第 N 天（同日多条同序号，官方动态恒 0） |
| data.rows[].task_id | integer | 任务ID |
| data.rows[].task_title | string | 动态卡上的任务名：task_id=0 时是「普通日记打卡」，官方动态是「官方日记」 |
| data.rows[].content | string | 内容 |
| data.rows[].images | array | 图片地址数组 |
| data.rows[].videos | array | 视频地址数组 |
| data.rows[].audios | array | 语音地址数组 |
| data.rows[].files | array | 附件数组（每项含 url、name、size） |
| data.rows[].link_data | array | 动态挂的课程卡数组（按 record_id 实时 JOIN 现拼，非发布时快照；课程已删或未上架则不出卡） |
| data.rows[].is_makeup | integer | 是否补卡提交：1=补卡（day 记的是被补的那一天） |
| data.rows[].allow_user_comment | integer | 活动级评论总闸：0=学员不能评论与回复，管理员点评不受影响 |
| data.rows[].is_featured | integer | 是否被管理员设为精选（动态流「只看精选」筛这一列） |
| data.rows[].is_top | integer | 是否置顶（动态流排序第一键） |
| data.rows[].visible_to | integer | 动态可见范围：0=所有人 / 1=仅管理员（除作者本人外的学员与游客都看不到，本人始终看得见自己那条） |
| data.rows[].like_count | integer | 点赞数量 |
| data.rows[].comment_count | integer | 评论数量 |
| data.rows[].comments | array | 评论预览数组（无评论为空数组） |
| data.rows[].is_liked | integer | 当前用户是否已点过赞（接口回权威值，前端不自己 +1） |
| data.rows[].createtime | integer | 创建时间（时间戳） |
| data.rows[].is_mine | integer | 是否本人：这一行的作者/发布者是我 |
