# meta

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/pc/page/meta` |
| 接口地址 | `POST /api/app/pc/page/meta` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Page（页面） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| type | string | 否 | 类型 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/pc/page/meta' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","type":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509555",
  "data": {
    "title": "凸知学堂",
    "keywords": "",
    "description": ""
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.title | string | 标题 |
| data.keywords | string | keywords |
| data.description | string | 描述 |
