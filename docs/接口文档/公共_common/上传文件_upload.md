# 上传文件

> 必须设定cdnurl为空,否则cdnurl函数计算错误

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `upload.image` |
| 接口地址 | `POST /api/common/upload` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 公共（common） |
| 所属控制器 | Common（公共接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| file | File | 否 | 文件流 | - |
| chunkid | string | 否 | chunkid | - |
| action | string | 否 | 操作 | - |
| filename | string | 否 | 文件名 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}common/upload' \
  -H 'Content-Type: application/json' \
  -d '{"file":"xxx","chunkid":"xxx","action":"xxx","filename":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
