# 动态流

> 关键词规范化：截断 30 + LIKE 通配符转义（防超长搜索/通配符全表匹配，大数据量兼容）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.list` |
| 接口地址 | `POST /api/app/circle/post/list` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | string | 否 | 圈子ID | - |
| user_id | string | 否 | 用户ID | - |
| tab | string | 否 | tab | - |
| sort | string | 否 | 排序 | - |
| page | string | 否 | 页码 | - |
| limit | string | 否 | 每页数量 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/list' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":"xxx","user_id":"xxx","tab":"xxx","sort":"xxx","page":"xxx","limit":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
