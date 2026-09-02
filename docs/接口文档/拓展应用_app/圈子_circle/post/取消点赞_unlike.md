# 取消点赞

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.post.unlike` |
| 接口地址 | `POST /api/app/circle/post/unlike` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Post（圈子动态接口） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| target_type | string | 否 | target类型 | `post` |
| target_id | integer | 否 | targetID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/post/unlike' \
  -H 'Content-Type: application/json' \
  -d '{"target_type":"post","target_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "已取消点赞",
  "time": "1786509551",
  "data": {
    "liked": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.liked | integer | liked |
