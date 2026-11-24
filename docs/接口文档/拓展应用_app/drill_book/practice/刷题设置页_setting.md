# 刷题设置页

> 刷题设置页（点目录进来） 返回该目录题量与默认设置，供「刷题设置」页回显： 出题模式（顺序/随机）、答题模式（做题模式=即时判题 / 测试模式=交卷判题）、单次答题数。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.practice.setting` |
| 接口地址 | `POST /api/app/drill_book/practice/setting` |
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
curl -X POST '{apiUrl}app/drill_book/practice/setting' \
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
