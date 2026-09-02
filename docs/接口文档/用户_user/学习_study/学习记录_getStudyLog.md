# 学习记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `study.getLog` |
| 接口地址 | `POST /api/user/study/getStudyLog` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Study（学习统计） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}user/study/getStudyLog' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508200",
  "data": [
    {
      "total_time": "200",
      "count": 1,
      "course__name": "سىناق دەرىسلىك",
      "course__type": "column",
      "course__cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/3e8411d84caf66fd56d7a46746f72e2e.jpg",
      "course__id": 430,
      "end_time": 1786160728,
      "course": {
        "id": 430,
        "name": "سىناق دەرىسلىك",
        "type": "column",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/3e8411d84caf66fd56d7a46746f72e2e.jpg"
      }
    },
    {
      "total_time": "260",
      "count": 1,
      "course__name": "course",
      "course__type": "article",
      "course__cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
      "course__id": 450,
      "end_time": 1786150308,
      "course": {
        "id": 450,
        "name": "course",
        "type": "article",
        "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png"
      }
    },
    {
      "total_time": "30",
      "count": 1,
      "course__name": "cs",
      "course__type": "video",
      "course__cover": "https://tuzhi.mutouweb.com/uploads/1/20260428/7c2fc541a5700d7b38c8ebd79c4380bb.png",
      "course__id": 301,
      "end_time": 1786149684,
      "course": {
        "id": 301,
        "name": "cs",
        "type": "video",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260428/7c2fc541a5700d7b38c8ebd79c4380bb.png"
      }
    },
    {
      "total_time": "50",
      "count": 1,
      "course__name": "单词听力 Useful Expressions.mp3",
      "course__type": "audio",
      "course__cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
      "course__id": 548,
      "end_time": 1786149596,
      "course": {
        "id": 548,
        "name": "单词听力 Useful Expressions.mp3",
        "type": "audio",
        "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png"
      }
    },
    {
      "total_time": "280",
      "count": 1,
      "course__name": "圈子创建的图文课",
      "course__type": "article",
      "course__cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
      "course__id": 447,
      "end_time": 1786149593,
      "course": {
        "id": 447,
        "name": "圈子创建的图文课",
        "type": "article",
        "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png"
      }
    },
    {
      "total_time": "70",
      "count": 1,
      "course__name": "圈子创建的图文课",
      "course__type": "article",
      "course__cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
      "course__id": 448,
      "end_time": 1786149589,
      "course": {
        "id": 448,
        "name": "圈子创建的图文课",
        "type": "article",
        "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png"
      }
    },
    {
      "total_time": "40",
      "count": 1,
      "course__name": "5c8a136d1296774934.mp3",
      "course__type": "audio",
      "course__cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
      "course__id": 547,
      "end_time": 1786149580,
      "course": {
        "id": 547,
        "name": "5c8a136d1296774934.mp3",
        "type": "audio",
        "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png"
      }
    },
    {
      "total_time": "40",
      "count": 1,
      "course__name": "234",
      "course__type": "article",
      "course__cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png",
      "course__id": 637,
      "end_time": 1786148948,
      "course": {
        "id": 637,
        "name": "234",
        "type": "article",
        "cover": "http://selfbuilt.cn/uploads/1/20260804/d0ad3297b776726b8e86964ddd0e7b48.png"
      }
    },
    {
      "total_time": "120",
      "count": 1,
      "course__name": "ئىزلار تورى",
      "course__type": "video",
      "course__cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/96cdcb93d554907ab4c6afa7ff110787.jpeg",
      "course__id": 328,
      "end_time": 1786117107,
      "course": {
        "id": 328,
        "name": "ئىزلار تورى",
        "type": "video",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/96cdcb93d554907ab4c6afa7ff110787.jpeg"
      }
    },
    {
      "total_time": "30",
      "count": 1,
      "course__name": "cs",
      "course__type": "video",
      "course__cover": "https://tuzhi.mutouweb.com/uploads/1/20260428/7c2fc541a5700d7b38c8ebd79c4380bb.png",
      "course__id": 300,
      "end_time": 1786117103,
      "course": {
        "id": 300,
        "name": "cs",
        "type": "video",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260428/7c2fc541a5700d7b38c8ebd79c4380bb.png"
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
| data[].total_time | string | 合计时间 |
| data[].count | integer | 数量 |
| data[].course__name | string | 课程名称 |
| data[].course__type | string | 课程类型 |
| data[].course__cover | string | 课程封面图 |
| data[].course__id | integer | 课程ID |
| data[].end_time | integer | 结束时间 |
| data[].course | object | 课程 |
| data[].course.id | integer | ID |
| data[].course.name | string | 名称 |
| data[].course.type | string | 类型 |
| data[].course.cover | string | 封面图 |
