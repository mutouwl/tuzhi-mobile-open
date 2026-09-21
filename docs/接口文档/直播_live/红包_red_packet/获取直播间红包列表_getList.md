# 获取直播间红包列表

> 检查过期

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.redpacket.getList` |
| 接口地址 | `POST /api/live/red_packet/getList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | RedPacket（直播红包 - 用户端） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | - |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `10` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/red_packet/getList' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"xxx","page":1,"limit":10}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
