# 删除媒体

> 从动态编辑页删除一个媒体，并同步清理未被其他内容引用的远程附件。 仅允许动态作者操作；动态尚未保存时（id=0）仅删除当前用户刚上传的附件。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.removeMedia` |
| 接口地址 | `POST /api/app/circle/post/removeMedia` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |
| type | string | 否 | 类型 | `` |
| url | string | 否 | 链接 | `` |
| video_id | string | 否 | videoID | `` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/removeMedia' \
  -H 'Content-Type: application/json' \
  -d '{"id":0,"type":"","url":"","video_id":""}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
