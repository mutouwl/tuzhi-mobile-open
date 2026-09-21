# 提交记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.form.log` |
| 接口地址 | `POST /api/app/form/form/log` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Form（表单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/form/form/log' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508170",
  "data": [
    {
      "id": 16,
      "updatetime": "2026-06-19 15:21:28",
      "form": {
        "name": "客户信息收集"
      }
    },
    {
      "id": 10,
      "updatetime": "2025-11-02 09:28:53",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 9,
      "updatetime": "2025-07-12 21:19:19",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 8,
      "updatetime": "2025-07-12 21:18:52",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 7,
      "updatetime": "2025-07-06 23:15:56",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 6,
      "updatetime": "2025-07-06 22:08:25",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 5,
      "updatetime": "2025-07-06 22:08:16",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 4,
      "updatetime": "2025-07-06 22:07:34",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 3,
      "updatetime": "2025-07-06 21:34:44",
      "form": {
        "name": "新表单"
      }
    },
    {
      "id": 2,
      "updatetime": "2025-07-06 21:34:33",
      "form": {
        "name": "新表单"
      }
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
| data[].updatetime | string | 更新时间（时间戳） |
| data[].form | object | 表单 |
| data[].form.name | string | 名称 |
