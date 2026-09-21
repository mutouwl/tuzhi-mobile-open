# 设置收藏状态

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.collect.setCollect` |
| 接口地址 | `POST /api/user/collect/setCollect` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Collect（用户shocking） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| item_id | string | 否 | 条目ID | `` |
| type | string | 否 | 类型 | `course` |

## 请求示例

```bash
curl -X POST '{apiUrl}user/collect/setCollect' \
  -H 'Content-Type: application/json' \
  -d '{"item_id":"","type":"course"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
