# 获取考试结果

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exam.exercises.result` |
| 接口地址 | `POST /api/app/exam/exercises_log/getResult` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | ExercisesLog（练习记录） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/exam/exercises_log/getResult' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508213",
  "data": {
    "id": 218,
    "uniacid": 1,
    "user_id": 38,
    "exercises_id": 1,
    "question_ids": "174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223,224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239,240,241,242,243,244,245,246,247,248,…（已截断，共 399 字符）",
    "data_index": 128,
    "question_count": 100,
    "result_true_count": 0,
    "result_error_count": 0,
    "status": 0,
    "updatetime": 0,
    "createtime": 1771728024,
    "prop": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.user_id | integer | 用户ID |
| data.exercises_id | integer | 练习ID |
| data.question_ids | string | 题目ID集合 |
| data.data_index | integer | 数据列表 |
| data.question_count | integer | 题目数量 |
| data.result_true_count | integer | 正确数量 |
| data.result_error_count | integer | 结果错题数量 |
| data.status | integer | 状态 |
| data.updatetime | integer | 更新时间（时间戳） |
| data.createtime | integer | 创建时间（时间戳） |
| data.prop | integer | prop |
