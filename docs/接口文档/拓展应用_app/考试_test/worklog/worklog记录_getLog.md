# worklog记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.test.worklog` |
| 接口地址 | `POST /api/app/test/worklog/getLog` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Worklog（练习记录） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/test/worklog/getLog' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508174",
  "data": [
    {
      "id": 245,
      "question_count": 6,
      "user_score": 8,
      "status": 1,
      "submittime": 1784175296,
      "createtime": 1784175280,
      "test": {
        "id": 59,
        "name": "全部题型"
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 83,
      "test_score": 24
    },
    {
      "id": 244,
      "question_count": 6,
      "user_score": 7,
      "status": 1,
      "submittime": 1784173378,
      "createtime": 1784173351,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 67,
      "test_score": 24
    },
    {
      "id": 243,
      "question_count": 6,
      "user_score": 6,
      "status": 1,
      "submittime": 1784173120,
      "createtime": 1784173104,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 83,
      "test_score": 24
    },
    {
      "id": 242,
      "question_count": 5,
      "user_score": 6,
      "status": 1,
      "submittime": 1784173086,
      "createtime": 1784173074,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 100,
      "test_score": 0
    },
    {
      "id": 241,
      "question_count": 6,
      "user_score": 9,
      "status": 1,
      "submittime": 1784096876,
      "createtime": 1784096848,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 67,
      "test_score": 24
    },
    {
      "id": 240,
      "question_count": 6,
      "user_score": 0,
      "status": 1,
      "submittime": 1784093127,
      "createtime": 1784093072,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 0,
      "test_score": 0
    },
    {
      "id": 239,
      "question_count": 5,
      "user_score": 10,
      "status": 1,
      "submittime": 1784093012,
      "createtime": 1784092991,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 100,
      "test_score": 0
    },
    {
      "id": 238,
      "question_count": 5,
      "user_score": 6,
      "status": 1,
      "submittime": 1784092964,
      "createtime": 1784092926,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 100,
      "test_score": 0
    },
    {
      "id": 237,
      "question_count": 5,
      "user_score": 2,
      "status": 1,
      "submittime": 1784090679,
      "createtime": 1784090638,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 20,
      "test_score": 0
    },
    {
      "id": 236,
      "question_count": 5,
      "user_score": 2,
      "status": 1,
      "submittime": 1784090054,
      "createtime": 1784090038,
      "test": {
        "id": null,
        "name": null
      },
      "status_text": "已交卷",
      "grade_status_text": "已批阅",
      "accuracy": 40,
      "test_score": 0
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
| data[].question_count | integer | 题目数量 |
| data[].user_score | integer | 用户积分 |
| data[].status | integer | 状态 |
| data[].submittime | integer | submittime |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].test | object | 考试 |
| data[].test.id | integer | ID |
| data[].test.name | string | 名称 |
| data[].status_text | string | 状态说明 |
| data[].grade_status_text | string | grade状态text |
| data[].accuracy | integer | accuracy |
| data[].test_score | integer | 考试积分 |
