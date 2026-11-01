# 我的邀请明细

> 当前登录用户的已邀请人数与受邀人明细分页，只按本人过滤，不接受前端传 user_id。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `invite_rank.rank.my` |
| 接口地址 | `POST /api/app/invite_rank/rank/my` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Rank（邀请达人榜（学员端）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程（直播间）ID | `6199` |
| page | integer | 否 | 页码，从 1 开始 | - |
| limit | integer | 否 | 每页条数，移动端默认档 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/invite_rank/rank/my' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":6199,"page":"xxx","limit":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344797",
  "data": {
    "invite_num": 2,
    "rows": [
      {
        "user_id": 1000013618,
        "nickname": "1**",
        "avatar": "",
        "count_time": 1791281920,
        "count_time_text": "2026-10-06 18:18"
      },
      {
        "user_id": 486,
        "nickname": "冯**",
        "avatar": "https://thirdwx.qlogo.cn/mmopen/vi_32/d8ZCuKyZcgBibBvGgCN44pUDibkmdZbTLD0FtVspibrdS744wMllzoxlmdWibp3o9C68icnZTiagYS0ONu5XvcnP7vBw/132",
        "count_time": 1791281890,
        "count_time_text": "2026-10-06 18:18"
      }
    ],
    "total": 2,
    "page": 1,
    "has_more": false
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.invite_num | integer | 活动门槛的需邀请人数，达到即发奖 |
| data.rows | array | 本页数据行数组 |
| data.rows[].user_id | integer | 用户ID |
| data.rows[].nickname | string | 昵称 |
| data.rows[].avatar | string | 头像 |
| data.rows[].count_time | integer | 计入时刻时间戳（受邀人被算进邀请人数那一刻，与进入时刻是两根列） |
| data.rows[].count_time_text | string | 接受邀请时间文案（Y-m-d H:i，不带秒），取不到回「-」 |
| data.total | integer | 合计 |
| data.page | integer | 页码 |
| data.has_more | boolean | 是否有more |

## 备注

- count_time_text 是后端格式化好的「Y-m-d H:i」，界面直接显示，不自己比时间戳
