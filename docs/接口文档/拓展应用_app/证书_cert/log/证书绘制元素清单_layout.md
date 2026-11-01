# 证书绘制元素清单

> 显示哪些数据、坐标、字号、颜色全部由后端算好下发，前端 canvas 只照单绘制，与后端 PNG 消费同一份 CertLayout。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.cert.layout` |
| 接口地址 | `POST /api/app/cert/log/layout` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 我的证书记录 ID（app/cert/log/index 返回的 id） | `96` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/cert/log/layout' \
  -H 'Content-Type: application/json' \
  -d '{"id":96}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |

## 备注

- 证书未安装或该 id 不属当前登录用户时分别回「证书获取错误」与渲染异常提示
