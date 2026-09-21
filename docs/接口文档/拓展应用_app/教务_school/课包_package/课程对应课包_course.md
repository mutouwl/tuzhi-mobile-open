# 课程对应课包

> 课时余额页「续费」入口：按课程反查包含该课程的规格所属课包，下发是否售罄/是否可购买与状态文案。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.package.course` |
| 接口地址 | `POST /api/app/school/package/course` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Package（教务-课程套餐（移动端，浏览免登录）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 课程ID（小于等于 0 报「请选择课程」） | `2676` |
| page | integer | 否 | 页码，默认 1 | `1` |
| limit | integer | 否 | 每页数量，默认 20（最大 100） | `20` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/package/course' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":2676,"page":1,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980024",
  "data": {
    "list": [
      {
        "id": 834,
        "name": "山大计算机培训课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "intro": "",
        "tags": [
          "山东大学",
          "精品课"
        ],
        "sale_status": 1,
        "price": "1.00",
        "lessons": 10,
        "sold_out": false,
        "buyable": true,
        "status_text": "",
        "campus_names": [
          "山东大学"
        ]
      }
    ],
    "has_more": false,
    "total": 1
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 课包列表（可购买的在前，已下架沉底） |
| data.list[].id | integer | 课包ID |
| data.list[].name | string | 课包名称 |
| data.list[].cover | string | 课包封面 |
| data.list[].intro | string | 课包简介 |
| data.list[].tags | array | 标签数组 |
| data.list[].tags[] | string | tags |
| data.list[].sale_status | integer | 售卖状态：1上架 0下架 |
| data.list[].price | string | 该课程对应规格的最小价（两位小数字符串） |
| data.list[].lessons | integer | 该课程对应规格的最大课时（数值） |
| data.list[].sold_out | boolean | 是否售罄（仅按该课程对应的规格判定） |
| data.list[].buyable | boolean | 是否可购买（在架且未售罄），前端据此决定能否进详情下单 |
| data.list[].status_text | string | 状态文案：已下架 / 已售罄 / 空串（可购买） |
| data.list[].campus_names | array | 适用校区名称数组 |
| data.list[].campus_names[] | string | 校区names |
| data.has_more | boolean | 是否还有下一页 |
| data.total | integer | 筛选后的总条数 |

## 备注

- 不过滤上下架：已下架课包一并下发（带 sale_status 与 status_text），让学员看到「该课程有哪些课包」全貌
- sold_out 口径与下单一致：该课程对应的全部规格都是有限库存（stock>=0）且已扣完才算售罄，任一规格不限库存或仍有余量即可购买
- price 保持两位小数字符串（与课包列表同形态，前端直出不二次格式化）
- 该课程没有任何在售规格时返回空列表，分页字段照常下发（前端展示空态）
