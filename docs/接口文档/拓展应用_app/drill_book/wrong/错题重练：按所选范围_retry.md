# 错题重练：按所选范围

> 错题重练：按所选范围（整本 / 目录树 / 一次试卷）的错题建一条 source=wrong 的记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.wrong.retry` |
| 接口地址 | `POST /api/app/drill_book/wrong/retry` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Wrong（错题本（刷题 / 试卷 两个页签 + 题目列表 + 批量移除 + 重练）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| source | string | 否 | source | `practice` |
| all | integer | 否 | 全部 | `0` |
| catalog_id | integer | 否 | catalogID | `0` |
| paper_id | integer | 否 | 试卷ID | `0` |
| log_id | integer | 否 | 记录ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/wrong/retry' \
  -H 'Content-Type: application/json' \
  -d '{"source":"practice","all":0,"catalog_id":0,"paper_id":0,"log_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
