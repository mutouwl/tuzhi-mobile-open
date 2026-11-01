# 商品橱窗商品列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.showcase` |
| 接口地址 | `POST /api/app/circle/circle/showcase` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | integer | 否 | 圈子ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/showcase' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": [
    {
      "id": 9001,
      "name": "产品运营实战入门课",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "price": 0,
      "briefing": "零基础快速掌握产品与运营核心方法论，含实战案例分析",
      "type": "video",
      "pay_type": "pay",
      "goods_type": "course"
    },
    {
      "id": 9002,
      "name": "用户增长案例拆解课",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "price": 99,
      "briefing": "12 个典型增长案例逐环节拆解，可直接套用到自己的产品",
      "type": "video",
      "pay_type": "pay",
      "goods_type": "course"
    },
    {
      "id": 8001,
      "name": "运营进阶会员卡",
      "cover": "",
      "price": 199,
      "briefing": "开通会员畅学全部圈子课程与直播回放",
      "type": "vipcard",
      "pay_type": "pay",
      "goods_type": "vipcard"
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
| data[].cover | string | 封面图 |
| data[].price | integer | 价格 |
| data[].briefing | string | 简介 |
| data[].type | string | 类型 |
| data[].pay_type | string | 支付类型 |
| data[].goods_type | string | 商品类型 |
