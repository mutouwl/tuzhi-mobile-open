# 获取分享图文

> 来源圈子 ID（圈子课程列表分享时携带，链接需带该参数以便课程详情页展示圈子目录）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `share.getArticle` |
| 接口地址 | `POST /api/share/getArticle` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 分享（share） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| type | string | 否 | 类型 | `` |
| src | string | 否 | 资源地址 | `` |
| circle_id | integer | 否 | 圈子ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}share/getArticle' \
  -H 'Content-Type: application/json' \
  -d '{"type":"","src":"","circle_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508145",
  "data": {
    "text": "【🎉推荐】最近在家闲来无事，就开始学习一些。发现这种方式真的很适合我，可以自由安排时间和地点。\n【🔗链接】https://tuzhi.mutouweb.com/index.php?i=1&route=#/0?share=38",
    "poster": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.text | string | 文本 |
| data.poster | array | 海报 |
