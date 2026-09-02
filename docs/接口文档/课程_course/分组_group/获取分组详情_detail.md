# 获取分组详情

> 获取父级信息

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.group.detail` |
| 接口地址 | `POST /api/course/group/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Group（课程分组接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/group/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508201",
  "data": {
    "id": 24,
    "name": "家庭育儿",
    "parent_id": 0,
    "image": "",
    "sort": 0,
    "parent_name": ""
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
| data.name | string | 名称 |
| data.parent_id | integer | 上级ID |
| data.image | string | 图片 |
| data.sort | integer | 排序 |
| data.parent_name | string | 上级名称 |
