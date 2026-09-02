# 获取二维码

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `share.getQrcode` |
| 接口地址 | `POST /api/share/getQrcode` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 分享（share） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| type | string | 否 | 类型 | `` |
| id | string | 否 | ID | `` |
| platform | string | 否 | 平台 | `h5` |

## 请求示例

```bash
curl -X POST '{apiUrl}share/getQrcode' \
  -H 'Content-Type: application/json' \
  -d '{"type":"","id":"","platform":"h5"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508183",
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOQAAADkAQMAAACymRrOAAAABlBMVEX///8AAABVwtN+AAAACXBIWXMAAA7EAAAOxAGVKw4bAAACU0lEQVRYhe2Yy3EDMQxD2QH675IdMAQgK/HkjD14rMTJWk8HDr/QVn3Xh6+Z6f0Mdg0KM1Xc6DDdv43pRu9n+f7uN+1nqZ53lx8+rmXtzTgdOmG9MLYF9RAF7Rqd2J+pRyijUOt8bqxZOvseowhlgv1bbzmZoXI7U612g4m3394rLUQV/t…（已截断，共 946 字符）"
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 数据 |
