# 「继续」：回到练习

> 「继续」：回到练习（目录行点「继续」带 catalog_id；不带 = 全本「继续上次」老口径） 首页目录行内的「继续上次 ›」已由用户点名去掉（2026-11-22 第二轮），改成 叶子目录行做过题就把「做题」换成「继续」：点哪一行就续哪一个目录。 落点由 `ResumeTarget` 定：没交卷的记录原样续；否则按目标目录新开、跳过做过的题。 取题仍走 `openPractice` 那一份，端上不会再拿到与「开始答题」不同的题集。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.practice.resume` |
| 接口地址 | `POST /api/app/drill_book/practice/resume` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Practice（刷题（目录 → 刷题设置 → 开始答题）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| catalog_id | integer | 否 | catalogID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/practice/resume' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","catalog_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
