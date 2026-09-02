# 课程详情页圈子 tab

> 课程详情页圈子 tab（课程关联的展示圈子卡片列表，一个课程可绑定多个圈子）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.courseCircle` |
| 接口地址 | `POST /api/app/circle/circle/courseCircle` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 否 | 课程ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/courseCircle' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
