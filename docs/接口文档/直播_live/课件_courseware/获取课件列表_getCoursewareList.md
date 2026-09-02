# 获取课件列表

> 判断是否已订阅

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.courseware.list` |
| 接口地址 | `POST /api/live/courseware/getCoursewareList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 直播（live） |
| 所属控制器 | Courseware（直播课件） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | `357` |

## 请求示例

```bash
curl -X POST '{apiUrl}live/courseware/getCoursewareList' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":357}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
