# 获取在线观看人数 数据来源为消息服务

> 获取在线观看人数 数据来源为消息服务（奥点云/阿里云）的在线用户数 前端在开启"观看人数"且消息服务已开启时轮询此接口

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.room.getOnlineUserNum` |
| 接口地址 | `POST /api/live/room/getOnlineUserNum` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 直播（live） |
| 所属控制器 | Room（直播间） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}live/room/getOnlineUserNum' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
