# 校区详情

> 校区信息（含经纬度与环境图）+ 该校区适用课包 + 校区讲师；课包与讲师全量下发，前端各展示前三条。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.campus.detail` |
| 接口地址 | `POST /api/app/school/campus/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Campus（教务-校区（移动端，浏览免登录）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 校区ID | `1994` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/campus/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":1994}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980025",
  "data": {
    "info": {
      "id": 1994,
      "name": "山东大学",
      "logo": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
      "address": "山东济南学府路",
      "lng": "0.000000",
      "lat": "0.000000",
      "contact_name": "李**",
      "contact_phone": "187****8782",
      "business_hours": "16:00 - 23:00",
      "environment": []
    },
    "packages": [
      {
        "id": 946,
        "name": "秋季课本同步辅导09211624套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 945,
        "name": "秋季课本同步辅导09211622套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 944,
        "name": "秋季课本同步辅导09211619套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 943,
        "name": "秋季课本同步辅导09211558套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 942,
        "name": "秋季课本同步辅导09211555套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 941,
        "name": "秋季课本同步辅导09211553套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 940,
        "name": "秋季课本同步辅导09211547套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 939,
        "name": "秋季课本同步辅导09211544套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 938,
        "name": "秋季课本同步辅导09211541套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 937,
        "name": "秋季课本同步辅导09211528套餐",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260920/19cfbea99b5e379bb767e83d481e6b15.png",
        "intro": "",
        "tags": [],
        "price": "299.00"
      },
      {
        "id": 834,
        "name": "山大计算机培训课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "intro": "",
        "tags": [
          "山东大学",
          "精品课"
        ],
        "price": "1.00"
      }
    ],
    "teachers": [
      {
        "id": 1944,
        "name": "李老师",
        "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
        "intro": "计算机老师"
      }
    ]
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.info | object | 校区信息 |
| data.info.id | integer | 校区ID |
| data.info.name | string | 校区名称 |
| data.info.logo | string | 校区 Logo |
| data.info.address | string | 校区地址 |
| data.info.lng | string | 经度（导航用，gcj02） |
| data.info.lat | string | 纬度（导航用，gcj02） |
| data.info.contact_name | string | 联系人 |
| data.info.contact_phone | string | 联系电话 |
| data.info.business_hours | string | 营业时间 |
| data.info.environment | array | 校区环境图数组（最多 10 张） |
| data.packages | array | 该校区适用课包（仅上架，全量下发） |
| data.packages[].id | integer | 课包ID |
| data.packages[].name | string | 课包名称 |
| data.packages[].cover | string | 课包封面 |
| data.packages[].intro | string | 课包简介 |
| data.packages[].tags | array | 标签数组 |
| data.packages[].price | string | 起售价（在售规格最低价） |
| data.teachers | array | 校区讲师（仅启用；联系方式不在本接口下发） |
| data.teachers[].id | integer | 老师ID |
| data.teachers[].name | string | 老师姓名 |
| data.teachers[].avatar | string | 老师头像 |
| data.teachers[].intro | string | 老师简介 |

## 备注

- 校区已删除或停用时返回 code=0「校区不存在或已停用」
- environment 兼容库内两种存量格式（字符串数组 / 对象数组），出参统一为 [{url}]
- 课包超出三条时跳课包列表页（app/school/package/list 传 campus_id），讲师超出三条时弹窗展示
