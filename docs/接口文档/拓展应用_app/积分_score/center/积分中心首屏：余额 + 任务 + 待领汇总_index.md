# 积分中心首屏：余额 + 任务 + 待领汇总

> getUserinfo() 是白名单字段，不含 score_frozen；这两个数值直接读用户行

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.score.center` |
| 接口地址 | `POST /api/app/score/center/index` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Center（学员端积分中心：余额 / 任务 / 领取 / 规则） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

无请求参数。

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/score/center/index' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
