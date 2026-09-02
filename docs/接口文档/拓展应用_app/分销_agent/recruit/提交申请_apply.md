# 提交申请

> 判断加入条件

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.agent.recruit.apply` |
| 接口地址 | `POST /api/app/agent/recruit/apply` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Recruit（分销员招募） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/agent/recruit/apply' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
