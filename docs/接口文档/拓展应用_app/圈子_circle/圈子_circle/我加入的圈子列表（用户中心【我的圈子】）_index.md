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
  "time": "1786508161",
  "data": {
    "total": 2,
    "rows": [
      {
        "member_id": 2955,
        "expire_time": 1819629584,
        "member_status": 1,
        "id": 3168,
        "name": "学习论坛",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260808/f27490ef8b3c3fc362c77644e7c606aa.jpeg",
        "intro": "简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容",
        "member_count": 3,
        "post_count": 15,
        "sell_type": 2,
        "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"hide\",\"post_preview\":\"new\",\"post_preview_num\":5}",
        "is_expired": 0,
        "expire_text": "2027-08-30",
        "show_member_count": 1,
        "show_post_count": 1
      },
      {
        "member_id": 168,
        "expire_time": 1785833907,
        "member_status": 1,
        "id": 25,
        "name": "123",
        "cover": "http://selfbuilt.cn/uploads/1/20260730/dfca4c4fbff604720c9598890bd04cd2.png",
        "intro": "123",
        "member_count": 2,
        "post_count": 32,
        "sell_type": 1,
        "presale_config": "{\"member_count\":\"show\",\"post_preview\":\"essence\",\"post_preview_num\":5}",
        "is_expired": 0,
        "expire_text": "永久有效",
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
| data.rows | array | rows |
| data.rows[].member_id | integer | 成员ID |
| data.rows[].expire_time | integer | 过期时间 |
| data.rows[].member_status | integer | 成员状态 |
| data.rows[].id | integer | ID |
| data.rows[].name | string | 名称 |
| data.rows[].cover | string | 封面图 |
| data.rows[].intro | string | intro |
| data.rows[].member_count | integer | 成员数量 |
| data.rows[].post_count | integer | 帖子数量 |
| data.rows[].sell_type | integer | sell类型 |
| data.rows[].presale_config | string | 预售配置 |
| data.rows[].is_expired | integer | 是否expired |
| data.rows[].expire_text | string | 过期text |
| data.rows[].show_member_count | integer | show成员数量 |
| data.rows[].show_post_count | integer | show帖子数量 |
