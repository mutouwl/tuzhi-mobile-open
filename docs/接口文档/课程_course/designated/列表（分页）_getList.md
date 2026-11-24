# 列表（分页）

> 商家勾选的课可能只在专栏里卖（sales_type 不含 alone），指定清单不套广场那个筛选

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.designated` |
| 接口地址 | `POST /api/course/designated/getList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Designated（指定课程清单（学员端「课程列表」，积分任务「学完指定课程」的落点）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `10` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/designated/getList' \
  -H 'Content-Type: application/json' \
  -d '{"page":1,"limit":10}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
