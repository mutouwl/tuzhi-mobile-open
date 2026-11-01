# 我加入的圈子列表（用户中心【我的圈子】）

> 免费圈子成员永久有效：不因历史 expire_time 数据误判过期（与售前页 join_status 口径一致）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.index` |
| 接口地址 | `POST /api/app/circle/circle/index` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `10` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/index' \
  -H 'Content-Type: application/json' \
  -d '{"page":1,"limit":10}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "total": 1,
    "rows": [
      {
        "member_id": 5001,
        "expire_time": 1786723200,
        "member_status": 1,
        "id": 1,
        "name": "产品运营实战圈",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "intro": "聚焦产品与运营实战，每天分享方法、案例与行业资料，和圈友一起成长",
        "member_count": 158,
        "post_count": 12,
        "sell_type": 2,
        "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"show\",\"post_preview\":\"new\",\"post_preview_num\":5}",
        "is_expired": 0,
        "expire_text": "2026-08-15",
        "show_member_count": 1,
        "show_post_count": 1
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
| data.rows[].member_id | integer | 成员记录ID（我在这一块成员表里的那一行） |
| data.rows[].expire_time | integer | 过期时间 |
| data.rows[].member_status | integer | 成员状态值（打卡：1=正常 2=暂停可浏览不可提交 0=移除/未参与） |
| data.rows[].id | integer | ID |
| data.rows[].name | string | 名称 |
| data.rows[].cover | string | 封面图 |
| data.rows[].intro | string | 简介 |
| data.rows[].member_count | integer | 成员数量 |
| data.rows[].post_count | integer | 帖子数量 |
| data.rows[].sell_type | integer | sell类型 |
| data.rows[].presale_config | string | 预售配置 |
| data.rows[].is_expired | integer | 是否expired |
| data.rows[].expire_text | string | 过期text |
| data.rows[].show_member_count | integer | show成员数量 |
| data.rows[].show_post_count | integer | show帖子数量 |
