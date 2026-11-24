# 取本次答题的题目

> 取本次答题的题目（含已存答案，退出再进可续答） 交卷前不下发答案与解析（防前端偷看）；做题模式下已判过的那一题会带 `result` 与 `right_answer`/`analysis`（即时反馈要用）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.work.detail` |
| 接口地址 | `POST /api/app/drill_book/work/detail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Work（答题页（取题 / 即时判题 / 收藏 / i 标记 / 交卷 / 结果）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| log_id | integer | 否 | 记录ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/work/detail' \
  -H 'Content-Type: application/json' \
  -d '{"log_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
