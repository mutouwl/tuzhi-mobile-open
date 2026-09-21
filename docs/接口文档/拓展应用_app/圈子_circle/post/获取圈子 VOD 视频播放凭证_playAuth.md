# 获取圈子 VOD 视频播放凭证

> 获取圈子 VOD 视频播放凭证。 圈子直传视频可能使用阿里云私有加密转码，不能把 GetPlayInfo 返回的 m3u8 当作普通 URL 交给浏览器播放，必须使用 VID + PlayAuth 播放。 播放凭证仅在用户有权查看动态，或正在预览自己刚上传但尚未关联动态的 附件时签发，避免客户端通过 video_id 枚举获取其他视频凭证。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.playAuth` |
| 接口地址 | `POST /api/app/circle/post/playAuth` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| post_id | string | 否 | 帖子ID | `$this->request->param('post_id', 0` |
| video_id | string | 否 | videoID | `$this->request->param('video_id', '` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/playAuth' \
  -H 'Content-Type: application/json' \
  -d '{"post_id":"$this->request->param('post_id', 0","video_id":"$this->request->param('video_id', '"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
