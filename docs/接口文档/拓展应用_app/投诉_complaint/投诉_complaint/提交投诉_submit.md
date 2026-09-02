# 提交投诉

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.complaint.submit` |
| 接口地址 | `POST /api/app/complaint/complaint/submit` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Complaint（投诉） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| category_id | integer | 否 | 分类ID | `0` |
| content | string | 否 | 内容 | `` |
| images | string | 否 | images | - |
| target_type | string | 否 | target类型 | `` |
| target_id | integer | 否 | targetID | `0` |
| target_title | string | 否 | target标题 | `` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/complaint/complaint/submit' \
  -H 'Content-Type: application/json' \
  -d '{"category_id":0,"content":"","images":"xxx","target_type":"","target_id":0,"target_title":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
