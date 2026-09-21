# 判断是否为默认主页

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `page.decorate.isIndex` |
| 接口地址 | `POST /api/page/decorate/isIndex` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 自定义页面（page） |
| 所属控制器 | Decorate（自定义页面） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page_id | string | 否 | 页码ID | - |

## 请求示例

```bash
curl -X POST '{apiUrl}page/decorate/isIndex' \
  -H 'Content-Type: application/json' \
  -d '{"page_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
