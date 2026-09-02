# 密码兑换

> 获取课程详情

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `order.subscription.password` |
| 接口地址 | `POST /api/course/subscription/passwordPay` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Subscription（订阅课程） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| password | string | 否 | 密码 | `` |
| course_id | string | 否 | 课程ID | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/subscription/passwordPay' \
  -H 'Content-Type: application/json' \
  -d '{"password":"","course_id":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
