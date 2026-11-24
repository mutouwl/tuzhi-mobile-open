# 刷题本详情 + 首页数据 对访客开放

> 刷题本详情 + 首页数据 对访客开放（`noNeedLogin`）：未登录也能看封面/简介/目录与题量，购买与答题才要登录。 `is_auth` 告诉前端底部主按钮该显示「购买 / 去学习 / 已拥有」哪一档。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.index.detail` |
| 接口地址 | `POST /api/app/drill_book/index/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Index（刷题本首页（用户端）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/index/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
