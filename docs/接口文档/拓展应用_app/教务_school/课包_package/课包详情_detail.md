# 课包详情

> 课包详情页数据：基本信息 + 轮播图 + 适用校区 + 售卖规格（含每档规格包含的课程与课时）+ 校区下讲师。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.package.detail` |
| 接口地址 | `POST /api/app/school/package/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Package（教务-课程套餐（移动端，浏览免登录）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 课包ID | `834` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/package/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":834}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980023",
  "data": {
    "id": 834,
    "uniacid": 1,
    "name": "山大计算机培训课",
    "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
    "banners": [
      {
        "url": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png"
      }
    ],
    "category_id": 0,
    "tags": [
      "山东大学",
      "精品课"
    ],
    "intro": "",
    "detail": "<p><img src=\"https://tuzhi.mutouweb.com/uploads/1/20260920/650305b1356204fe4d6b08b491f0653f.png\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png\" alt=\"\" data-href=\"\" style=\"\"/><img src=\"https://tuzhi.mutouweb.com/uploads/1/20…（已截断，共 379 字符）",
    "sort": 0,
    "sale_status": 1,
    "show_sales_balance": 0,
    "deleted": 0,
    "createtime": 1789890320,
    "updatetime": 1789895932,
    "skus": [
      {
        "id": 1053,
        "uniacid": 1,
        "package_id": 834,
        "name": "一对多",
        "price": "1.00",
        "line_price": "0.00",
        "valid_type": 1,
        "valid_days": 0,
        "limit_buy": 0,
        "stock": -1,
        "status": 1,
        "deleted": 0,
        "createtime": 1789895932,
        "updatetime": 1789895932,
        "courses": [
          {
            "id": 2676,
            "name": "计算机算法结构课程一对多",
            "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
            "intro": "",
            "is_one_to_one": 0,
            "lessons": "10.00",
            "type_text": "一对多"
          }
        ],
        "sales_balance_enabled": false,
        "sales_balance": null
      },
      {
        "id": 1054,
        "uniacid": 1,
        "package_id": 834,
        "name": "一对一",
        "price": "2.00",
        "line_price": "0.00",
        "valid_type": 1,
        "valid_days": 0,
        "limit_buy": 0,
        "stock": -1,
        "status": 1,
        "deleted": 0,
        "createtime": 1789895932,
        "updatetime": 1789895932,
        "courses": [
          {
            "id": 2675,
            "name": "计算机算法结构课程一对一",
            "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/6edaf6c84972ddde4a1bf2c0d466c08d.png",
            "intro": "学会计算机",
            "is_one_to_one": 1,
            "lessons": "20.00",
            "type_text": "一对一"
          }
        ],
        "sales_balance_enabled": false,
        "sales_balance": null
      }
    ],
    "sales_balance_enabled": false,
    "sales_balance": null,
    "campus_list": [
      {
        "id": 1994,
        "name": "山东大学",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
        "address": "山东济南学府路",
        "contact_phone": "187****8782",
        "business_hours": "16:00 - 23:00"
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
| data.id | integer | 课包ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.name | string | 课包名称 |
| data.cover | string | 课包封面 |
| data.banners | array | 轮播图数组；库内为空时回退为封面单图 [{url}] |
| data.banners[].url | string | 轮播图地址 |
| data.category_id | integer | 分类ID，0=无分类 |
| data.tags | array | 标签数组 |
| data.tags[] | string | tags |
| data.intro | string | 课包简介 |
| data.detail | string | 课包详情（富文本） |
| data.sort | integer | 排序值 |
| data.sale_status | integer | 售卖状态：1上架 0下架 |
| data.show_sales_balance | integer | show销量余额 |
| data.deleted | integer | deleted |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
| data.skus | array | 售卖规格列表（未删除且上架） |
| data.skus[].id | integer | 规格ID |
| data.skus[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.skus[].package_id | integer | packageID |
| data.skus[].name | string | 规格名称 |
| data.skus[].price | string | 售卖价 |
| data.skus[].line_price | string | 划线价 |
| data.skus[].valid_type | integer | 有效期类型：1永久有效 2按天数 |
| data.skus[].valid_days | integer | 有效天数（valid_type=2 时生效） |
| data.skus[].limit_buy | integer | 限购数（按学员），0=不限制 |
| data.skus[].stock | integer | 库存，-1=不限 |
| data.skus[].status | integer | 状态 |
| data.skus[].deleted | integer | deleted |
| data.skus[].createtime | integer | 创建时间（时间戳） |
| data.skus[].updatetime | integer | 更新时间（时间戳） |
| data.skus[].courses | array | 该规格包含的课程权益 |
| data.skus[].courses[].id | integer | 课程ID |
| data.skus[].courses[].name | string | 课程名称 |
| data.skus[].courses[].cover | string | 课程封面 |
| data.skus[].courses[].intro | string | 课程简介 |
| data.skus[].courses[].is_one_to_one | integer | 课程类型数值：0一对一 1一对多（供前端定标签样式） |
| data.skus[].courses[].lessons | string | 该课程在本规格下的课时数 |
| data.skus[].courses[].type_text | string | 课程类型文案（与数值成对下发，前端不写死） |
| data.skus[].sales_balance_enabled | boolean | 该规格是否展示余量 |
| data.skus[].sales_balance | null | 该规格余量；不展示时为 null |
| data.sales_balance_enabled | boolean | 是否展示销量余量（教务设置 + 规格限购共同决定） |
| data.sales_balance | null | 可见规格余量之和；不展示余量时为 null |
| data.campus_list | array | 适用校区列表 |
| data.campus_list[].id | integer | 校区ID |
| data.campus_list[].name | string | 校区名称 |
| data.campus_list[].logo | string | 校区 Logo |
| data.campus_list[].address | string | 校区地址 |
| data.campus_list[].contact_phone | string | 联系电话 |
| data.campus_list[].business_hours | string | 营业时间 |
| data.teachers | array | 适用校区下的启用讲师（聚合去重，与校区详情同口径） |
| data.teachers[].id | integer | 老师ID |
| data.teachers[].name | string | 老师姓名 |
| data.teachers[].avatar | string | 老师头像 |
| data.teachers[].intro | string | 老师简介 |

## 备注

- 仅返回上架（sale_status=1）且未删除的课包，否则 code=0「套餐不存在或已下架」
- 销量余量需教务设置 show_sales_balance=1 且规格限购数 limit_buy>0，余量 = 限购数 - 已支付/已完成订单数（未支付与已取消不计）
- 课时总数为各规格课程权益之和，前端展示时取第一个规格
