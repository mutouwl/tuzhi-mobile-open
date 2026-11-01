# 圈子课程目录树

> 圈子课程目录树（课程 tab 用，免登录） 返回扁平列表，前端按 p_id 组装树形结构

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `circle.circle.courseDir` |
| 接口地址 | `POST /api/app/circle/circle/courseDir` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Circle（圈子接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| circle_id | integer | 否 | 圈子ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/circle/circle/courseDir' \
  -H 'Content-Type: application/json' \
  -d '{"circle_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": 1786492800,
  "data": [
    {
      "id": 401,
      "circle_id": 1,
      "course_id": 0,
      "p_id": 0,
      "type": 2,
      "title": "第一章 产品与运营基础",
      "sort": 1,
      "try": 0,
      "createtime": 1786060800,
      "bindcourse": null
    },
    {
      "id": 402,
      "circle_id": 1,
      "course_id": 9001,
      "p_id": 401,
      "type": 1,
      "title": "",
      "sort": 1,
      "try": 0,
      "createtime": 1786060800,
      "bindcourse": {
        "id": 9001,
        "name": "产品运营实战入门课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "price": 0,
        "briefing": "零基础快速掌握产品与运营核心方法论，含实战案例分析",
        "type": "video",
        "pay_type": "pay",
        "updatetime": 1785974400,
        "views": 2380
      }
    },
    {
      "id": 403,
      "circle_id": 1,
      "course_id": 9002,
      "p_id": 401,
      "type": 1,
      "title": "",
      "sort": 2,
      "try": 0,
      "createtime": 1786060800,
      "bindcourse": {
        "id": 9002,
        "name": "用户增长案例拆解课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "price": 99,
        "briefing": "12 个典型增长案例逐环节拆解，可直接套用到自己的产品",
        "type": "video",
        "pay_type": "pay",
        "updatetime": 1785974400,
        "views": 1560
      }
    },
    {
      "id": 404,
      "circle_id": 1,
      "course_id": 0,
      "p_id": 0,
      "type": 2,
      "title": "第二章 增长实战演练",
      "sort": 2,
      "try": 0,
      "createtime": 1786060800,
      "bindcourse": null
    },
    {
      "id": 405,
      "circle_id": 1,
      "course_id": 9003,
      "p_id": 404,
      "type": 1,
      "title": "",
      "sort": 1,
      "try": 0,
      "createtime": 1786060800,
      "bindcourse": {
        "id": 9003,
        "name": "A/B 测试落地实操课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
        "price": 129,
        "briefing": "从实验设计到结果解读，手把手完成一次高质量 A/B 测试",
        "type": "video",
        "pay_type": "pay",
        "updatetime": 1785974400,
        "views": 920
      }
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].circle_id | integer | 圈子ID |
| data[].course_id | integer | 课程ID |
| data[].p_id | integer | pID |
| data[].type | integer | 类型 |
| data[].title | string | 标题 |
| data[].sort | integer | 排序 |
| data[].try | integer | try |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].bindcourse | null | bindcourse |
