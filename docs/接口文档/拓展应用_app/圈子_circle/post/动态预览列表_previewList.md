# 动态预览列表

> 动态预览列表（DIY 装修/售前页展示用，免登录，不含互动信息）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.previewList` |
| 接口地址 | `POST /api/app/circle/post/previewList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | integer | 否 | 圈子ID | `0` |
| tab | string | 否 | tab | `all` |
| limit | integer | 否 | 每页数量 | `5` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/previewList' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":0,"tab":"all","limit":5}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
