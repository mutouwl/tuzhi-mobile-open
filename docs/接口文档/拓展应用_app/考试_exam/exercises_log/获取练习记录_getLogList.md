# 获取练习记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exam.exercises.getLogList` |
| 接口地址 | `POST /api/app/exam/exercises_log/getLogList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | ExercisesLog（练习记录） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| id | integer | 否 | ID | `1` |
| sort | string | 否 | 排序 | `desc` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/exam/exercises_log/getLogList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"id":1,"sort":"desc"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508166",
  "data": [
    {
      "id": 218,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 0,
      "updatetime": 0,
      "createtime": 1771728024,
      "prop": 0
    },
    {
      "id": 215,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 1,
      "updatetime": 1767336438,
      "createtime": 1767336413,
      "prop": 0
    },
    {
      "id": 214,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 0,
      "updatetime": 0,
      "createtime": 1766220618,
      "prop": 0
    },
    {
      "id": 213,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 0,
      "updatetime": 0,
      "createtime": 1766220308,
      "prop": 0
    },
    {
      "id": 212,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 0,
      "updatetime": 0,
      "createtime": 1766219781,
      "prop": 0
    },
    {
      "id": 211,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 3,
      "updatetime": 1766219778,
      "createtime": 1766219764,
      "prop": 0
    },
    {
      "id": 210,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 1,
      "updatetime": 1766219761,
      "createtime": 1766219752,
      "prop": 0
    },
    {
      "id": 209,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 3,
      "updatetime": 1766219274,
      "createtime": 1766219247,
      "prop": 0
    },
    {
      "id": 206,
      "exercises_id": 1,
      "question_count": 100,
      "result_true_count": 0,
      "result_error_count": 0,
      "updatetime": 0,
      "createtime": 1766196546,
      "prop": 0
    },
    {
      "id": 138,
      "exercises_id": 1,
      "question_count": 37,
      "result_true_count": 2,
      "result_error_count": 11,
      "updatetime": 1751966515,
      "createtime": 1751966491,
      "prop": 6
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].exercises_id | integer | 练习ID |
| data[].question_count | integer | 题目数量 |
| data[].result_true_count | integer | 正确数量 |
| data[].result_error_count | integer | 结果错题数量 |
| data[].updatetime | integer | 更新时间（时间戳） |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].prop | integer | prop |
