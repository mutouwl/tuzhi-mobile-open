# 发布上传配置

> 发布上传配置（媒体数量/大小/文件类型限制，供移动端发布页选择媒体时校验）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.publishConfig` |
| 接口地址 | `POST /api/app/circle/circle/publishConfig` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | integer | 否 | 圈子ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/publishConfig' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": {
    "media_image_limit": 9,
    "media_audio_limit": 9,
    "media_video_limit": 1,
    "media_file_limit": 9,
    "media_image_size": 10,
    "media_audio_size": 20,
    "media_video_size": 200,
    "media_file_size": 20,
    "media_file_types": "doc,docx,xls,xlsx,pdf",
    "media_image_enable": 1,
    "media_video_enable": 1,
    "media_audio_enable": 1,
    "media_file_enable": 1
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.media_image_limit | integer | 图片可选张数上限 |
| data.media_audio_limit | integer | 语音可选条数上限 |
| data.media_video_limit | integer | 视频可选个数上限 |
| data.media_file_limit | integer | 附件可选个数上限 |
| data.media_image_size | integer | 图片单个大小上限 MB，恒为 0=不限制 |
| data.media_audio_size | integer | 语音单个大小上限 MB，恒为 0=不限制 |
| data.media_video_size | integer | 视频单个大小上限 MB，恒为 0=不限制 |
| data.media_file_size | integer | 附件单个大小上限 MB，当前 0=不限制 |
| data.media_file_types | string | 附件可选扩展名串（大小写不敏感，其余拒） |
| data.media_image_enable | integer | 图片上传入口开关 1/0（0 时选择器不出这一类，不留「图标在、点了被拒」） |
| data.media_video_enable | integer | 视频上传入口开关 1/0 |
| data.media_audio_enable | integer | 语音上传入口开关 1/0 |
| data.media_file_enable | integer | 附件上传入口开关 1/0 |
