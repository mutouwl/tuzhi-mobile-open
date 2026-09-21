# 免费加入学习

> 免费加入学习 适用以下任一情形：  1. 课程本身免费（pay_type=free 或 pay_type=pay 且价格为 0）→ get_type=free  2. 用户付费会员卡免费权益命中该课程 → get_type=vip 仅支持 article/video/audio/live/column 类型课程

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.subscription.free` |
| 接口地址 | `POST /api/course/subscription/free` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Subscription（订阅课程） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/subscription/free' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
