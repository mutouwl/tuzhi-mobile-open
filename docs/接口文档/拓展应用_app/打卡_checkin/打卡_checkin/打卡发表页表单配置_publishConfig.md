# 打卡发表页表单配置

> 发表动态页的上传开关、媒体数量上限、可见对象与打卡要求；上限只存 MediaLimit 一处，前后端共用。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.publishConfig` |
| 接口地址 | `POST /api/app/checkin/checkin/publishConfig` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |
| task_id | integer | 否 | 任务 ID（闯关打卡从任务卡进入时带上，取任务级要求） | `15222` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/publishConfig' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628,"task_id":15222}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344782",
  "data": {
    "media_image_limit": 9,
    "media_video_limit": 9,
    "media_audio_limit": 1,
    "media_file_limit": 9,
    "media_image_video_limit": 9,
    "media_image_size": 0,
    "media_video_size": 0,
    "media_audio_size": 0,
    "media_file_size": 0,
    "media_file_types": "doc,docx,xls,xlsx,pdf",
    "media_image_enable": 1,
    "media_video_enable": 1,
    "media_audio_enable": 1,
    "media_file_enable": 1,
    "visible_locked": 0,
    "visible_to": null
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
| data.media_video_limit | integer | 视频可选个数上限 |
| data.media_audio_limit | integer | 语音可选条数上限 |
| data.media_file_limit | integer | 附件可选个数上限 |
| data.media_image_video_limit | integer | 图片+视频合计上限（与提交校验同口径） |
| data.media_image_size | integer | 图片单个大小上限 MB，恒为 0=不限制 |
| data.media_video_size | integer | 视频单个大小上限 MB，恒为 0=不限制 |
| data.media_audio_size | integer | 语音单个大小上限 MB，恒为 0=不限制 |
| data.media_file_size | integer | 附件单个大小上限 MB，当前 0=不限制 |
| data.media_file_types | string | 附件可选扩展名串（大小写不敏感，其余拒） |
| data.media_image_enable | integer | 图片上传入口开关 1/0（0 时选择器不出这一类，不留「图标在、点了被拒」） |
| data.media_video_enable | integer | 视频上传入口开关 1/0 |
| data.media_audio_enable | integer | 语音上传入口开关 1/0 |
| data.media_file_enable | integer | 附件上传入口开关 1/0 |
| data.visible_locked | integer | 1=可见对象已被任务规则定死，前端把「打卡可见范围」那一行整个藏掉 |
| data.visible_to | null | 未锁定时为 null（出「可见范围」那一行让学员自己选）；锁定时给落库值 0=所有人 / 1=仅管理员 |

## 备注

- 媒体上限若前端再写死一份，就会出现「页面上能选、提交才被拒」或两种说法不一致
