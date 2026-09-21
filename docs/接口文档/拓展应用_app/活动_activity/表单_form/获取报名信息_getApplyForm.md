# 获取报名信息

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.activity.form.getform` |
| 接口地址 | `POST /api/app/activity/form/getApplyForm` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Form（线下活动-表单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | string | 否 | 活动ID | `12` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/activity/form/getApplyForm' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":12}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508151",
  "data": [
    {
      "required": true,
      "name": "姓名",
      "type": "input"
    },
    {
      "required": true,
      "name": "手机号",
      "type": "input"
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
| data[].required | boolean | 是否必填 |
| data[].name | string | 名称 |
| data[].type | string | 类型 |
