# 店铺圈子列表（DIY 装修/店铺展示用，免登录）

> 最低规格价格（付费圈列表展示起点价）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.goodsList` |
| 接口地址 | `POST /api/app/circle/circle/goodsList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `6` |
| ids | string | 否 | ID集合 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/goodsList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":6,"ids":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": [
    {
      "id": 1,
      "name": "产品运营实战圈",
      "intro": "聚焦产品与运营实战，每天分享方法、案例与行业资料，和圈友一起成长",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "member_count": 158,
      "post_count": 12,
      "sell_type": 2,
      "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"show\",\"post_preview\":\"new\",\"post_preview_num\":5}",
      "joined": 1,
      "price": "59.00",
      "show_member_count": 1,
      "show_post_count": 1
    },
    {
      "id": 2,
      "name": "产品经理进阶训练营",
      "intro": "从需求分析到数据洞察，体系化拆解产品经理的进阶之路，限时免费开放",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "member_count": 89,
      "post_count": 6,
      "sell_type": 1,
      "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"show\",\"post_preview\":\"essence\",\"post_preview_num\":5}",
      "joined": 0,
      "price": 0,
      "show_member_count": 1,
      "show_post_count": 1
    },
    {
      "id": 3,
      "name": "运营增长实战训练营",
      "intro": "复盘真实增长案例，系统输出拉新、转化、留存的方法论与工具清单",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "member_count": 46,
      "post_count": 8,
      "sell_type": 2,
      "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"show\",\"post_preview\":\"new\",\"post_preview_num\":5}",
      "joined": 0,
      "price": "99.00",
      "show_member_count": 1,
      "show_post_count": 1
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].name | string | 名称 |
| data[].intro | string | 简介 |
| data[].cover | string | 封面图 |
| data[].member_count | integer | 成员数量 |
| data[].post_count | integer | 帖子数量 |
| data[].sell_type | integer | sell类型 |
| data[].presale_config | string | 预售配置 |
| data[].joined | integer | joined |
| data[].price | string | 价格 |
| data[].show_member_count | integer | show成员数量 |
| data[].show_post_count | integer | show帖子数量 |
