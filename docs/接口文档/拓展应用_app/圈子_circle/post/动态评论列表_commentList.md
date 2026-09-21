# 动态评论列表

> 动态评论列表（评论排序切换专用接口） 独立于详情接口：排序切换只拉评论，避免重新请求动态详情导致浏览量 +1、重复拉取整篇动态。 参数：post_id（动态 id）、sort（default/earliest 按 id 升序，latest 按 id 降序）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.commentList` |
| 接口地址 | `POST /api/app/circle/post/commentList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| post_id | integer | 否 | 帖子ID | `0` |
| sort | string | 否 | 排序 | `default` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/commentList' \
  -H 'Content-Type: application/json' \
  -d '{"post_id":0,"sort":"default"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
