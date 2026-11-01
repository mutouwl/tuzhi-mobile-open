# 打卡排行榜

> 按周期取榜单分页，周期与名次都由后端算好下发，前端不自己按下标 +1。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.rank` |
| 接口地址 | `POST /api/app/checkin/checkin/rank` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| period | string | 否 | 统计周期：total=累计（缺省）/ week=本周 / lastweek=上周 / today=今日 / yesterday=昨日 | `total` |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，默认 20 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/rank' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"period":"total","page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344786",
  "data": {
    "title": "name",
    "cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "period": "total",
    "rows": [
      {
        "rank": 1,
        "user_id": 486,
        "num": 12,
        "nickname": "打**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132"
      },
      {
        "rank": 2,
        "user_id": 38,
        "num": 7,
        "nickname": "冯**",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png"
      }
    ],
    "total": 2,
    "page": 1,
    "limit": 20,
    "has_more": 0,
    "my": {
      "rank": 2,
      "user_id": 38,
      "num": 7,
      "nickname": "冯**",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png"
    },
    "total_users": 4,
    "total_records": 19
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.title | string | 标题 |
| data.cover | string | 封面图 |
| data.period | string | 统计周期档 |
| data.rows | array | 本页数据行数组 |
| data.rows[].rank | integer | 名次（后端算好下发，前端不按下标 +1） |
| data.rows[].user_id | integer | 用户ID |
| data.rows[].num | integer | 本期内的次数（打卡榜为动态条数，与名次同一口径） |
| data.rows[].nickname | string | 昵称 |
| data.rows[].avatar | string | 头像 |
| data.total | integer | 合计 |
| data.page | integer | 页码 |
| data.limit | integer | 每页数量 |
| data.has_more | integer | 是否有more |
| data.my | object | 我的 |
| data.my.rank | integer | 名次（后端算好下发，前端不按下标 +1） |
| data.my.user_id | integer | 用户ID |
| data.my.num | integer | 本期内的次数（打卡榜为动态条数，与名次同一口径） |
| data.my.nickname | string | 昵称 |
| data.my.avatar | string | 头像 |
| data.total_users | integer | 本活动参与人数（未被移除成员数，含一次没打卡的人） |
| data.total_records | integer | 本期全员打卡次数之和（官方动态已排除） |
