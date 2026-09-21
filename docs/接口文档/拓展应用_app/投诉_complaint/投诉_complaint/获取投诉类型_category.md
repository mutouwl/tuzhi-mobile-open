# 获取投诉类型

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.complaint.category` |
| 接口地址 | `POST /api/app/complaint/complaint/category` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Complaint（投诉） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| pid | integer | 否 | 父级ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/complaint/complaint/category' \
  -H 'Content-Type: application/json' \
  -d '{"pid":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508163",
  "data": [
    {
      "id": 1,
      "pid": 0,
      "title": "诈骗",
      "description": "",
      "status_text": "",
      "has_children": 1
    },
    {
      "id": 2,
      "pid": 0,
      "title": "传播不实信息",
      "description": "",
      "status_text": "",
      "has_children": 1
    },
    {
      "id": 3,
      "pid": 0,
      "title": "抄袭/洗稿、滥用原创",
      "description": "",
      "status_text": "",
      "has_children": 1
    },
    {
      "id": 4,
      "pid": 0,
      "title": "内容侵权",
      "description": "",
      "status_text": "",
      "has_children": 1
    },
    {
      "id": 5,
      "pid": 0,
      "title": "违规营销",
      "description": "",
      "status_text": "",
      "has_children": 1
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
| data[].pid | integer | 父级ID |
| data[].title | string | 标题 |
| data[].description | string | 描述 |
| data[].status_text | string | 状态说明 |
| data[].has_children | integer | 是否有下级 |
