# 智能识别地址

> 简单的地址识别逻辑

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.address.parse` |
| 接口地址 | `POST /api/user/address/parse` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Address（收货地址控制器 用于管理用户收货地址） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| text | string | 否 | 文本 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}user/address/parse' \
  -H 'Content-Type: application/json' \
  -d '{"text":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
