# 课包列表

> 移动端课包目录：只下发上架课包，可按校区、分类、讲师、名称关键词筛选，分页返回并附课包分类选项。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.package.list` |
| 接口地址 | `POST /api/app/school/package/list` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Package（教务-课程套餐（移动端，浏览免登录）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| campus_id | integer | 否 | 按校区筛选，0=全部校区 | `0` |
| category_id | integer | 否 | 按课包分类筛选，0=全部分类 | `0` |
| teacher_id | integer | 否 | 按讲师筛选（其排课课程反查课包），0=不限 | `0` |
| keyword | string | 否 | 课包名称模糊搜索 | - |
| page | integer | 否 | 页码，默认 1 | `1` |
| limit | integer | 否 | 每页数量，默认 20（最大 100） | `20` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/package/list' \
  -H 'Content-Type: application/json' \
  -d '{"campus_id":0,"category_id":0,"teacher_id":0,"keyword":"xxx","page":1,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980021",
  "data": {
    "list": [
      {
        "id": 946,
        "name": "秋季课本同步辅导09211624套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 945,
        "name": "秋季课本同步辅导09211622套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 944,
        "name": "秋季课本同步辅导09211619套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 943,
        "name": "秋季课本同步辅导09211558套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 942,
        "name": "秋季课本同步辅导09211555套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 941,
        "name": "秋季课本同步辅导09211553套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 940,
        "name": "秋季课本同步辅导09211547套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 939,
        "name": "秋季课本同步辅导09211544套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 938,
        "name": "秋季课本同步辅导09211541套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 937,
        "name": "秋季课本同步辅导09211528套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "sort": 0,
        "price": "299.00",
        "tags": [],
        "campus_names": [
          "山东大学"
        ]
      },
      {
        "id": 834,
        "name": "山大计算机培训课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "intro": "",
        "sort": 0,
        "price": "1.00",
        "tags": [
          "山东大学",
          "精品课"
        ],
        "campus_names": [
          "山东大学"
        ]
      }
    ],
    "categories": [],
    "has_more": false,
    "total": 11
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 课包列表 |
| data.list[].id | integer | 课包ID |
| data.list[].name | string | 课包名称 |
| data.list[].cover | string | 课包封面 |
| data.list[].intro | string | 课包简介 |
| data.list[].sort | integer | 排序值（数字越大越靠前） |
| data.list[].price | string | 起售价（在售规格最低价，无在售规格时为 0） |
| data.list[].tags | array | 标签数组（库内 JSON 解码） |
| data.list[].campus_names | array | 适用校区名称数组 |
| data.list[].campus_names[] | string | 校区names |
| data.categories | array | 课包分类选项（仅启用中，按 sort 倒序） |
| data.has_more | boolean | 是否还有下一页 |
| data.total | integer | 筛选后的总条数 |

## 备注

- 浏览类接口，无需登录
- price 取该课包未删除且上架规格（school_package_sku）的最低价，无任何在售规格时为 0
- teacher_id 口径与教师详情「授课课程」同源：由讲师排课关联课程反查包含这些课程的课包
- campus_names 为适用校区名称数组，按校区筛选时只含命中的校区
