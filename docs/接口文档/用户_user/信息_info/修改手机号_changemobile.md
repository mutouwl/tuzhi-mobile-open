# 修改手机号

> 判断有没有绑定微信账号，绑定了不可用

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.info.changemobile` |
| 接口地址 | `POST /api/user/info/changemobile` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Info（会员接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| mobile | string | 否 | 手机号 | - |
| captcha | string | 否 | captcha | - |

## 请求示例

```bash
curl -X POST '{apiUrl}user/info/changemobile' \
  -H 'Content-Type: application/json' \
  -d '{"mobile":"xxx","captcha":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
