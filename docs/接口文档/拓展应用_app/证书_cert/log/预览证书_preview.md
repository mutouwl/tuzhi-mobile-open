# 预览证书

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.cert.preview` |
| 接口地址 | `POST /api/app/cert/log/preview` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | `21` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/cert/log/preview' \
  -H 'Content-Type: application/json' \
  -d '{"id":21}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508204",
  "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAvgAAAVQCAIAAACxqLm5AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAgAElEQVR4nOy9aZRc13EmGPFyrcysfa/CvhAEQIC7SHCBJEqkbckmvfSoLXlsubs97vH4dPc53b9m+syP+dWnz5w53TNueabneJMty9psj7WYFElR3PcFIAGQ2IFC7VVZlVm5Z773Yn7ciLj3ZSZIzDT0x50pEah6+d69EV9s3417M4GXFqrQe/VevVfv1Xv1Xr1X7/UP8R…（已截断，共 985286 字符）"
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 数据 |
