# 列表（分页）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.designated` |
| 接口地址 | `POST /api/app/checkin/designated/getList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Designated（指定打卡清单（学员端「打卡列表」，积分任务「关联打卡」的落点）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/designated/getList' \
  -H 'Content-Type: application/json' \
  -d '{"page":1,"limit":20}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
