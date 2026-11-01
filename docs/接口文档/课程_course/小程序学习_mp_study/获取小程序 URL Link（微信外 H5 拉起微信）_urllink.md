# 获取小程序 URL Link（微信外 H5 拉起微信）

> 为微信外 H5 生成一条可直接跳进小程序课程详情页的微信 URL Link；生成不出来一律回空串，由前端降级成小程序码。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.mpStudy.urllink` |
| 接口地址 | `POST /api/course/mp_study/urllink` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 课程（course） |
| 所属控制器 | MpStudy（小程序学习引导） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 课程 ID | `123` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}course/mp_study/urllink' \
  -H 'Content-Type: application/json' \
  -d '{"id":123}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.url | string | 微信 URL Link（永久有效、正式版）；未配置或生成失败时为空串 |

## 备注

- 需登录，同 entry
- 只在微信外 H5 调用：微信内用 JSSDK 拉起 + entry 的 path 即可；URL Link 有微信配额，不要在首屏无条件打
- 失败不报错：小程序未配置、access_token 取不到、微信未回 url_link，一律 data.url="" + code=1，前端据此降级成小程序码
- 缓存：按课程缓存 7 天（失败负缓存 60 秒，期间不再打微信接口）
- 只请求 release 版（env_version=release、expire_type=0），没有体验版兜底；小程序未发布时按失败回空串处理
