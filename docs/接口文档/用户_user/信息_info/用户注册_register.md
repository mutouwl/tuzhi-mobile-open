# 用户注册

> 注册会员

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.info.register` |
| 接口地址 | `POST /api/user/info/register` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Info（会员接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| username | string | 否 | 用户名 | - |
| password | string | 否 | 密码 | - |
| email | string | 否 | email | - |
| mobile | string | 否 | 手机号 | - |
| code | string | 否 | code | - |

## 请求示例

```bash
curl -X POST '{apiUrl}user/info/register' \
  -H 'Content-Type: application/json' \
  -d '{"username":"xxx","password":"xxx","email":"xxx","mobile":"xxx","code":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
