# 获取练习分组列表（平铺，兼容旧 tabs 调用）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exam.exercises.group` |
| 接口地址 | `POST /api/app/exam/exercises/group` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Exercises（练习） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/exam/exercises/group' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "返回成功",
  "time": "1786508165",
  "data": [
    {
      "id": 1,
      "uniacid": 1,
      "parent_id": 0,
      "name": "1235",
      "status": 1,
      "sort": 0,
      "createtime": 1712816722
    },
    {
      "id": 5,
      "uniacid": 1,
      "parent_id": 0,
      "name": "茨木",
      "status": 1,
      "sort": 5,
      "createtime": 1713838125
    },
    {
      "id": 3,
      "uniacid": 1,
      "parent_id": 0,
      "name": "324",
      "status": 1,
      "sort": 6,
      "createtime": 1712819913
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
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].parent_id | integer | 上级ID |
| data[].name | string | 名称 |
| data[].status | integer | 状态 |
| data[].sort | integer | 排序 |
| data[].createtime | integer | 创建时间（时间戳） |
