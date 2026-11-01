# 累计学习时长

> 个人中心「学习中心」卡上那一句说明用的分钟数，只回一个数值，不做分桶。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `study.getStudyTime` |
| 接口地址 | `POST /api/user/study/getStudyTime` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Study（学习统计） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}user/study/getStudyTime' \
  -H 'Content-Type: application/json' \
  -d '{}'
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

- 与学习数据页「累计学习时长」同一张表同一列（sum(total_time)）
- 统计开关 statistics.study_log 关闭后库里不再新增记录，本口回的就是到手的历史累计
