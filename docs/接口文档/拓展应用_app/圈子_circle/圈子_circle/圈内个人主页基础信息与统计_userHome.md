# 圈内个人主页基础信息与统计

> 个人主页仅对当前圈子的有效成员开放：非成员/黑名单/付费圈过期统一拦截（data.access 供前端判定）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.userHome` |
| 接口地址 | `POST /api/app/circle/circle/userHome` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | integer | 否 | 圈子ID | `0` |
| user_id | integer | 否 | 用户ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/userHome' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":0,"user_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "user": {
      "id": 1002,
      "nickname": "学员小李",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "is_owner": 0,
      "join_time": 1786061184,
      "location": "上海"
    },
    "stats": {
      "post_count": 3,
      "like_count": 6,
      "essence_count": 0
    },
    "content_protect": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.user | object | 用户 |
| data.user.id | integer | ID |
| data.user.nickname | string | 昵称 |
| data.user.avatar | string | 头像 |
| data.user.is_owner | integer | 是否本人 |
| data.user.join_time | integer | 成员加入时刻时间戳 |
| data.user.location | string | 位置 |
| data.stats | object | 统计数据对象 |
| data.stats.post_count | integer | 帖子数量 |
| data.stats.like_count | integer | 点赞数量 |
| data.stats.essence_count | integer | essence数量 |
| data.content_protect | integer | 内容protect |
