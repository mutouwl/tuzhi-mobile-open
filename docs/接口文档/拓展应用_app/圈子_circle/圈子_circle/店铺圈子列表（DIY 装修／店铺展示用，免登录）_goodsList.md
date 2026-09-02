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
| ids | string | 否 | ID集合 | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/goodsList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":6,"ids":""}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508185",
  "data": [
    {
      "id": 3168,
      "name": "学习论坛",
      "intro": "简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容简介内容",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260808/f27490ef8b3c3fc362c77644e7c606aa.jpeg",
      "member_count": 3,
      "post_count": 15,
      "sell_type": 2,
      "presale_config": "{\"member_count\":\"show\",\"post_count\":\"show\",\"view_count\":\"hide\",\"post_preview\":\"new\",\"post_preview_num\":5}",
      "joined": 1,
      "price": 23,
      "show_member_count": 1,
      "show_post_count": 1
    },
    {
      "id": 2308,
      "name": "123",
      "intro": "123",
      "cover": "http://selfbuilt.cn/uploads/1/20260730/dfca4c4fbff604720c9598890bd04cd2.png",
      "member_count": 1,
      "post_count": 8,
      "sell_type": 2,
      "presale_config": "{\"member_count\":\"hide\",\"post_count\":\"show\",\"post_preview\":\"essence\",\"post_preview_num\":5}",
      "joined": 0,
      "price": 23,
      "show_member_count": 0,
      "show_post_count": 1
    },
    {
      "id": 25,
      "name": "123",
      "intro": "123",
      "cover": "http://selfbuilt.cn/uploads/1/20260730/dfca4c4fbff604720c9598890bd04cd2.png",
      "member_count": 2,
      "post_count": 32,
      "sell_type": 1,
      "presale_config": "{\"member_count\":\"show\",\"post_preview\":\"essence\",\"post_preview_num\":5}",
      "joined": 0,
      "price": 0,
      "show_member_count": 1,
      "show_post_count": 1
    },
    {
      "id": 22,
      "name": "Python 学习交流圈",
      "intro": "一起学 Python，打卡交流，资料分享",
      "cover": "http://selfbuilt.cn/uploads/1/20260802/40fce2ec85c1d72e933072ac15f5e21e.png",
      "member_count": 1,
      "post_count": 4,
      "sell_type": 2,
      "presale_config": null,
      "joined": 0,
      "price": 29.9,
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
| data[].intro | string | intro |
| data[].cover | string | 封面图 |
| data[].member_count | integer | 成员数量 |
| data[].post_count | integer | 帖子数量 |
| data[].sell_type | integer | sell类型 |
| data[].presale_config | string | 预售配置 |
| data[].joined | integer | joined |
| data[].price | integer | 价格 |
| data[].show_member_count | integer | show成员数量 |
| data[].show_post_count | integer | show帖子数量 |
