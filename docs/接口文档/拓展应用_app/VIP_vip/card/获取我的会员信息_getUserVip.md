# 获取我的会员信息

> 获取用户开通会员

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.vip.user` |
| 接口地址 | `POST /api/app/vip/card/getUserVip` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Card（付费会员卡） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/vip/card/getUserVip' \
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
