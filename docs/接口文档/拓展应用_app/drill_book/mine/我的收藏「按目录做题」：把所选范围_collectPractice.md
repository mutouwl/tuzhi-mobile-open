# 我的收藏「按目录做题」：把所选范围

> 我的收藏「按目录做题」：把所选范围（整本 / 某目录含子目录 / 未分类）的收藏题目开成一次练习 取题走 `CollectCatalog::scopeIds`（与树的计数同一份目录口径，只留题库里还在的题）。 `source` 列是远端库的 enum('practice','paper','wrong')，不为这一档改表： 收藏做题记 `practice`（它本来也是一次练习），目录名写进 `catalog_name` 以区分入口； 续答按「来源 + 目录 + 题集」判定，不会把目录刷题的那条记录错续成收藏。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.mine.collectPractice` |
| 接口地址 | `POST /api/app/drill_book/mine/collectPractice` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Mine（我的收藏 / 练习历史（两个入口同族，都是「读我自己的记录」）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| all | integer | 否 | 全部 | `0` |
| catalog_id | integer | 否 | catalogID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/mine/collectPractice' \
  -H 'Content-Type: application/json' \
  -d '{"all":0,"catalog_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
