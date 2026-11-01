# 删除媒体

> 从动态编辑页删掉一个媒体，并同步清理未被其它内容引用的远程附件；动态还没保存时（id=0）只清理当前用户刚上传的那一份。

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
| id | integer | 否 | 动态 ID；0=尚未保存的草稿，只清理刚上传的附件 | - |
| type | string | 是 | 媒体类型：image / video / audio / file，取值不在这四档回「媒体类型错误」 | - |
| url | string | 否 | 要删除的媒体地址，与 video_id 至少传一个 | - |
| video_id | string | 否 | VOD 视频标识，与 url 至少传一个 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/removeMedia' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","type":"xxx","url":"xxx","video_id":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "删除成功",
  "time": 1786492800,
  "data": null
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | null | 数据 |

## 备注

- 仅允许动态作者操作：id 存在时先验作者归属，再从库内原始 media 精确移除目标项，防止客户端伪造 URL 删别人的附件
- 同一动态内还有相同媒体时保留远程文件，最后一份被删才走统一的本地/OSS/VOD 清理
- 媒体不存在或已删除、动态不存在都回业务错误
