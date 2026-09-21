# 喜欢评价

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.comment.like` |
| 接口地址 | `POST /api/course/comment/like` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Comment（评论） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| comment_id | string | 否 | 评论ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}course/comment/like' \
  -H 'Content-Type: application/json' \
  -d '{"comment_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
