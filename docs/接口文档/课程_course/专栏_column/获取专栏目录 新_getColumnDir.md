# 获取专栏目录 新

> 判断有没有订阅

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.columndir` |
| 接口地址 | `POST /api/course/column/getColumnDir` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Column（课程） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | `357` |
| sort | string | 否 | 排序 | `asc` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/column/getColumnDir' \
  -H 'Content-Type: application/json' \
  -d '{"id":357,"sort":"asc"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
