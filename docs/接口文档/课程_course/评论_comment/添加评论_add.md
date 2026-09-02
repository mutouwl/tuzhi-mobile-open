# 添加评论

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.comment.add` |
| 接口地址 | `POST /api/course/comment/add` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Comment（评论） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | - |
| content | string | 否 | 内容 | - |
| reply_comment_id | string | 否 | reply评论ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}course/comment/add' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"xxx","content":"xxx","reply_comment_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
