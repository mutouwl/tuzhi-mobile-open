# 某目录 / 某一次试卷的错题题目

> 某目录 / 某一次试卷的错题题目（含我的答案与正确答案，可直接看解析） 范围参数： - `all=1`：整本错题； - `catalog_id>0`：该目录及其全部子目录； - `log_id>0`：某一次已交卷的模拟测试； - 兼容旧读方：`source=paper&paper_id=x` 按试卷聚合所有场次。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.wrong.questions` |
| 接口地址 | `POST /api/app/drill_book/wrong/questions` |
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
| keyword | string | 否 | 关键词 | - |
| limit | integer | 否 | 每页数量 | `20` |
| page | integer | 否 | 页码 | `1` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/wrong/questions' \
  -H 'Content-Type: application/json' \
  -d '{"source":"practice","all":0,"catalog_id":0,"paper_id":0,"log_id":0,"keyword":"xxx","limit":20,"page":1}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
