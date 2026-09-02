# 发送消息

> 判断消息服务是否已开启

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.message.send` |
| 接口地址 | `POST /api/live/message/send` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 直播（live） |
| 所属控制器 | Message（直播消息） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | `357` |
| message | string | 否 | 消息 | - |
| type | string | 否 | 类型 | `text` |

## 请求示例

```bash
curl -X POST '{apiUrl}live/message/send' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":357,"message":"xxx","type":"text"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
