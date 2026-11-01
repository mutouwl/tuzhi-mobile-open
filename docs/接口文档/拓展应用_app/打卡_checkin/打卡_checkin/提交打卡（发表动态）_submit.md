# 提交打卡（发表动态）

> 闸门与内容校验在 SubmitService，与后台测试共用同一份代码；打卡成功即按条件发证书，发证失败不影响打卡结果。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.submit` |
| 接口地址 | `POST /api/app/checkin/checkin/submit` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | - |
| task_id | integer | 否 | 闯关打卡的任务 ID，日历打卡传 0 | - |
| is_makeup | integer | 否 | 是否补卡：1=使用补卡次数 | - |
| content | string | 否 | 动态正文（活动或任务要求必填时按后端原句提示） | - |
| images | array | 否 | 图片地址列表，数量上限见 publishConfig | - |
| videos | array | 否 | 视频列表（VOD 素材） | - |
| audios | array | 否 | 音频列表 | - |
| files | array | 否 | 附件列表 | - |
| visible_to | integer | 否 | 可见范围：0=按活动设置（缺省），其余档由 publishConfig 下发 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/submit' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":"xxx","task_id":"xxx","is_makeup":"xxx","content":"xxx","images":"xxx","videos":"xxx","audios":"xxx","files":"xxx","visible_to":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 本次打卡结果 |
| data.record_id | integer | 新生成的动态（打卡记录）ID |
| data.day | integer | 本次打卡的日期（Y-m-d） |
| data.total_days | string | 该成员累计打卡天数 |
| data.makeup_left | string | 剩余补卡次数 |

## 备注

- 不在打卡时间窗、任务已解锁前置未满足、超出媒体上限等都回业务错误（code=0），提示语与服务端校验逐字一致
