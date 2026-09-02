# 获取阿里云互动消息鉴权信息

> 获取阿里云互动消息鉴权信息 客户端进入阿里云直播间时调用，返回 SDK 登录所需的 appId/appSign/token 等

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.message.getAliyunAuth` |
| 接口地址 | `POST /api/live/message/getAliyunAuth` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 直播（live） |
| 所属控制器 | Message（直播消息） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | `357` |
| role | string | 否 | role | `` |

## 请求示例

```bash
curl -X POST '{apiUrl}live/message/getAliyunAuth' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":357,"role":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
