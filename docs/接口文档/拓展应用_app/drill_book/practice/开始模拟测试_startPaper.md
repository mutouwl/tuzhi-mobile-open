# 开始模拟测试

> 开始模拟测试（按试卷建记录） 试卷题目取试卷库 `app_testpaper_question` 的顺序；不做随机规则（试卷自带顺序与分值）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.practice.startPaper` |
| 接口地址 | `POST /api/app/drill_book/practice/startPaper` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Practice（刷题（目录 → 刷题设置 → 开始答题）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| paper_id | integer | 否 | 试卷ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/practice/startPaper' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","paper_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
