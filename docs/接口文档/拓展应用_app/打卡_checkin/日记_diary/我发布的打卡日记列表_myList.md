# 我发布的打卡日记列表

> 跨活动汇总：我在每个打卡活动里发布的日记按发布时间倒序，每行带活动与任务标识供打 Tag。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.diary.myList` |
| 接口地址 | `POST /api/app/checkin/diary/myList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Diary（打卡用户端接口 - 我的日记（「我的打卡」页「发布的日记」页签）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

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
curl -X POST '{apiUrl}app/checkin/diary/myList' \
  -H 'Content-Type: application/json' \
  -d '{"page":"xxx","limit":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 分页结果 |
| data.total | number | 我发布的日记总条数 |
| data.rows | array | 日记行数组（按发布时间倒序） |
| data.rows[].id | integer | 动态（打卡记录）ID |
| data.rows[].checkin_id | integer | 所属打卡活动 ID |
| data.rows[].checkin_title | string | 所属打卡活动名称（卡片上的打卡 Tag） |
| data.rows[].task_id | integer | 关联任务 ID，0=普通日记打卡 |
| data.rows[].task_title | string | 关联任务名称（卡片上的任务 Tag） |
| data.rows[].day | integer | 这条动态的打卡日期（Y-m-d，补卡时是被补的那天） |
| data.rows[].day_seq | string | 作者加入后的第 N 天（官方动态恒 0） |
| data.rows[].user_id | integer | 作者用户 ID（官方动态为 0） |
| data.rows[].nickname | string | 显示名：打卡昵称优先，为空回落账号昵称，官方动态固定「官方」 |
| data.rows[].avatar | string | 作者头像地址 |
| data.rows[].is_official | string | 是否管理员发布的官方动态：1=是（不计入学员统计与排名） |
| data.rows[].is_mine | string | 该行作者是否本人（决定编辑/删除入口） |
| data.rows[].is_makeup | string | 是否补卡提交：1=补卡 |
| data.rows[].is_featured | string | 是否被设为精选 |
| data.rows[].is_top | string | 是否置顶 |
| data.rows[].visible_to | string | 可见范围：0=所有人 / 1=仅管理员 |
| data.rows[].allow_user_comment | string | 本活动评论开关：0=本活动已关闭评论 |
| data.rows[].content | string | 动态正文 |
| data.rows[].images | array | 图片地址数组 |
| data.rows[].videos | string | 视频地址数组 |
| data.rows[].audios | string | 语音地址数组 |
| data.rows[].files | string | 附件数组（每项含 url、name、size） |
| data.rows[].link_data | string | 动态挂的课程卡数组（实时 JOIN 现拼，课程已下架不出卡） |
| data.rows[].like_count | integer | 点赞数 |
| data.rows[].comment_count | integer | 评论数（管理员点评也算一条） |
| data.rows[].comments | string | 该动态最新几条评论预览（无评论为空数组） |
| data.rows[].is_liked | string | 我是否点过赞 |
| data.rows[].createtime | integer | 发布时间戳 |
