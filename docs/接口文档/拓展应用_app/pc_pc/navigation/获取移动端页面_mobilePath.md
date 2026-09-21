# 获取移动端页面

> 判断当前开放的终端

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/pc/navigation/mobilePath` |
| 接口地址 | `POST /api/app/pc/navigation/mobilePath` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Navigation（推荐商品） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| type | string | 否 | 类型 | `index` |
| id | integer | 否 | ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/pc/navigation/mobilePath' \
  -H 'Content-Type: application/json' \
  -d '{"type":"index","id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509555",
  "data": {
    "h5": "https://tuzhi.mutouweb.com?i=1&route=index#/pages/public/diy/diy?id=0",
    "mini": false,
    "dy": false
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.h5 | string | H5 |
| data.mini | boolean | 小程序 |
| data.dy | boolean | 抖音 |
