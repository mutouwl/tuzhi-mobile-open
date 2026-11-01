# 修改活动内打卡昵称

> 只改本活动这一行的昵称，不动账号资料（user.nickname）；成功后回读一次再下发，界面按接口返回值渲染。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.setNickname` |
| 接口地址 | `POST /api/app/checkin/checkin/setNickname` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | - |
| nickname | string | 是 | 新的活动内昵称，长度上限见返回的 nickname_max | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/setNickname' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":"xxx","nickname":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 修改后的本人卡片 |
| data.nickname | string | 活动内昵称（服务端回读的那一份） |
| data.avatar | string | 头像地址 |
| data.nickname_max | string | 昵称长度上限 |

## 备注

- 被拉黑或成员已暂停时拒绝修改，文案与参与闸门同一句
