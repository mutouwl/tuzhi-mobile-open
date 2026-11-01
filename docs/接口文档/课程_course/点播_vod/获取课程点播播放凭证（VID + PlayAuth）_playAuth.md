# 获取课程点播播放凭证（VID + PlayAuth）

> 按课程 ID + 字段名向阿里云点播现签一枚播放凭证，供 H5 播放器用 VID+PlayAuth 起播（替代一次性 m3u8 地址档）。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.playAuth` |
| 接口地址 | `POST /api/course/vod/playAuth` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Vod（课程点播播放凭证） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 课程 ID，<=0 回「参数错误」 | `123` |
| field | string | 否 | video=正片（默认）/ try_watch=试看；其他值回「参数错误」 | `video` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/vod/playAuth' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":123,"field":"video"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.video_id | string | 服务端从课程素材行取出的点播视频 ID（不是客户端传的） |
| data.play_auth | string | 阿里云播放凭证，短命，端上不要缓存或落库 |
| data.field | string | 回显本次 field（video/try_watch），端上不读、仅供核对 |
| data.reason | string | 仅签发失败时出现：给商家/运维看的原因（学员侧只显示 msg） |

## 备注

- 需登录（正片）：field=video 未登录回 HTTP 401 + code=401「请登录后操作」；已登录但无该课订阅权益回「无权播放该视频」。field=try_watch 公开，访客也能取
- 不收客户端传的视频 ID：只认 course_id + field，视频 ID 由服务端从课程素材行取（避免任何人都能换到任意视频的凭证）
- 参数走 param()（GET/POST/JSON body 均可），键名 snake_case；登录态走请求头 token（不是 Authorization）
- 小程序闸门：H5/PC 且课程类型在「只能小程序学」清单内 → 连凭证都不发，msg「本课程需在微信小程序中学习」
- 其余错误分支（HTTP 200 + code=0）：课程不存在、该课程没有试看视频、该课程的视频不支持播放凭证（非阿里云点播素材）；上游签发失败回「视频暂时无法播放，请稍后重试」，data 带 video_id + reason 给运维看
- 不缓存、每次起播现取（凭证短命，阿里云默认 100 秒）：取不到就回落详情里下发的 fullurl 地址档，不阻断播放；本接口只判权限、不写订阅行
