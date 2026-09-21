# 获取指定层级分组

> 获取课程配置

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.group.level` |
| 接口地址 | `POST /api/course/group/level` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Group（课程分组接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| level | integer | 否 | 等级 | `1` |
| parent_id | integer | 否 | 上级ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/group/level' \
  -H 'Content-Type: application/json' \
  -d '{"level":1,"parent_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509551",
  "data": [
    {
      "id": 23,
      "name": "考研升学",
      "parent_id": 0,
      "image": "",
      "sort": 0
    },
    {
      "id": 24,
      "name": "家庭育儿",
      "parent_id": 0,
      "image": "",
      "sort": 0
    },
    {
      "id": 20,
      "name": "英语留学",
      "parent_id": 0,
      "image": "",
      "sort": 14
    },
    {
      "id": 21,
      "name": "办公技能",
      "parent_id": 0,
      "image": "",
      "sort": 15
    },
    {
      "id": 22,
      "name": "健康常识",
      "parent_id": 0,
      "image": "",
      "sort": 16
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
| data[].name | string | 名称 |
| data[].parent_id | integer | 上级ID |
| data[].image | string | 图片 |
| data[].sort | integer | 排序 |
