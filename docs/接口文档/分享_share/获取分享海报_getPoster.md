# 获取分享海报

> 来源圈子 ID（圈子课程列表分享时携带，链接需带该参数以便课程详情页展示圈子目录）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `share.getPoster` |
| 接口地址 | `POST /api/share/getPoster` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 分享（share） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| type | string | 否 | 类型 | `` |
| src | string | 否 | 资源地址 | `` |
| themes | string | 否 | themes | `` |
| circle_id | integer | 否 | 圈子ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}share/getPoster' \
  -H 'Content-Type: application/json' \
  -d '{"type":"","src":"","themes":"","circle_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
