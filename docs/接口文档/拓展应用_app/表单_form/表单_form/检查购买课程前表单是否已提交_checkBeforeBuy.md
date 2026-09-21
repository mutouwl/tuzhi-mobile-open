# 检查购买课程前表单是否已提交

> 通过 content_id 匹配，不按 content_type（因为课程类商品 order 的 goodsType 是 course，

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.form.checkBeforeBuy` |
| 接口地址 | `POST /api/app/form/form/checkBeforeBuy` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Form（表单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| goods_list | string | 否 | 商品列表 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/form/form/checkBeforeBuy' \
  -H 'Content-Type: application/json' \
  -d '{"goods_list":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508147",
  "data": {
    "has_form": false,
    "all_submitted": true,
    "forms": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.has_form | boolean | 是否有表单 |
| data.all_submitted | boolean | 全部submitted |
| data.forms | array | forms |
