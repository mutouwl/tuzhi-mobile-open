# 获取客服配置

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `config.service` |
| 接口地址 | `POST /api/config/getServiceConfig` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 配置（config） |
| 所属控制器 | Config（获取配置） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}config/getServiceConfig' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508197",
  "data": {
    "status": "open",
    "mobile": "13222222222",
    "code": "https://tuzistudy.oss-cn-beijing.aliyuncs.com/uploads/20251113/1322222222251-0.png"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.status | string | 状态 |
| data.mobile | string | 手机号 |
| data.code | string | code |
