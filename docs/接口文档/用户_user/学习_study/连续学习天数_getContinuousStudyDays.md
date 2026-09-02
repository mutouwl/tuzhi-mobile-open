# 连续学习天数

> 获取用户连续学习天数（学习激励/打卡展示用）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `study.getContinuousStudyDays` |
| 接口地址 | `POST /api/user/study/getContinuousStudyDays` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Study（学习统计） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}user/study/getContinuousStudyDays' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508200",
  "data": {
    "study_days": 0,
    "join_days": 866
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.study_days | integer | 学习天数 |
| data.join_days | integer | 加入天数 |
