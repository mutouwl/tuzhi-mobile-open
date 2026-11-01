# 编辑我的打卡动态

> 只收 record_id 与内容字段——改 task_id 或 day 等于改打卡事实，接口不接受。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.editOwn` |
| 接口地址 | `POST /api/app/checkin/checkin/editOwn` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | - |
| record_id | integer | 是 | 本人已发布动态的 ID | - |
| content | string | 否 | 动态正文 | - |
| images | array | 否 | 图片地址列表 | - |
| videos | array | 否 | 视频列表 | - |
| audios | array | 否 | 音频列表 | - |
| files | array | 否 | 附件列表 | - |
| visible_to | integer | 否 | 可见范围 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/editOwn' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":"xxx","record_id":"xxx","content":"xxx","images":"xxx","videos":"xxx","audios":"xxx","files":"xxx","visible_to":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 修改后的动态标识 |
| data.record_id | integer | 动态 ID |
| data.day | integer | 动态所属日期（Y-m-d） |
| data.task_id | integer | 关联任务 ID |

## 备注

- 任务结束后不可修改，回「任务结束后不可修改打卡记录」，与删除同一道闸门
