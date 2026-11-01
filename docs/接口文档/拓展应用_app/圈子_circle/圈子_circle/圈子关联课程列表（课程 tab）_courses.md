# 圈子关联课程列表（课程 tab）

> 黑名单成员禁止查看圈子课程（免登录接口，仅对已登录用户校验）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.courses` |
| 接口地址 | `POST /api/app/circle/circle/courses` |
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
curl -X POST '{apiUrl}app/circle/circle/courses' \
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
      "gift_duration_type": "month",
      "gift_duration_value": 3
    },
    {
      "id": 9002,
      "name": "用户增长案例拆解课",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "price": 99,
      "briefing": "12 个典型增长案例逐环节拆解，可直接套用到自己的产品",
      "type": "video",
      "pay_type": "pay",
      "gift_duration_type": "month",
      "gift_duration_value": 1
    },
    {
      "id": 9003,
      "name": "A/B 测试落地实操课",
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
      "price": 129,
      "briefing": "从实验设计到结果解读，手把手完成一次高质量 A/B 测试",
      "type": "video",
      "pay_type": "pay",
      "gift_duration_type": "",
      "gift_duration_value": 0
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
| data[].gift_duration_type | string | 礼物duration类型 |
| data[].gift_duration_value | integer | 礼物durationvalue |
