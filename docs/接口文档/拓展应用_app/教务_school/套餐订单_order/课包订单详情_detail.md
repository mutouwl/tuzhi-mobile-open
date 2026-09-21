# 课包订单详情

> 本人课包订单详情：商品信息、规格与课程课时、报名学生与所在班级、校区、有效期与开课状态。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.order.detail` |
| 接口地址 | `POST /api/app/school/order/detail` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Order（教务-课程套餐订单（移动端，需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| order_no | string | 是 | 订单号 | `202605051921909744003800` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/order/detail' \
  -H 'Content-Type: application/json' \
  -d '{"order_no":"202605051921909744003800"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980026",
  "data": {
    "order_no": "202605051921909744003800",
    "status": "success",
    "status_text": "已完成",
    "real_price": "2.00",
    "package_name": "山大计算机培训课",
    "package_id": 834,
    "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
    "sku_name": "一对一",
    "lessons_total": 20,
    "courses": [
      {
        "name": "计算机算法结构课程一对一",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/6edaf6c84972ddde4a1bf2c0d466c08d.png",
        "lessons": "20.00"
      }
    ],
    "student_name": "刘**",
    "student_phone": "187****4234",
    "class_names": "刘洋-计算机算法结构课程一对一",
    "campus_id": 1994,
    "campus_name": "山东大学",
    "open_status": 1,
    "valid_text": "长期有效",
    "createtime_text": "2026-09-20 17:05"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.order_no | string | 订单号 |
| data.status | string | 订单状态（统一订单字符串状态，如 unpaid/paid/success/close） |
| data.status_text | string | 订单状态文案：待付款 / 已完成 / 已取消 |
| data.real_price | string | 实付金额 |
| data.package_name | string | 课包名称（后台开课无套餐时取订单备注，兜底「后台开课」） |
| data.package_id | integer | 课包ID（跳课包详情用；后台开课为 0） |
| data.cover | string | 封面（课包封面，为空时兜底首节课程封面） |
| data.sku_name | string | 规格名称（后台开课为「后台开课」） |
| data.lessons_total | integer | 课时合计（规格内各课程课时之和） |
| data.courses | array | 规格包含的课程 |
| data.courses[].name | string | 课程名称 |
| data.courses[].cover | string | 课程封面 |
| data.courses[].lessons | string | 本课程课时 |
| data.student_name | string | 报名学生姓名 |
| data.student_phone | string | 报名学生手机号 |
| data.class_names | string | 学生所在班级名称（多个用、拼接） |
| data.campus_id | integer | 校区ID（校区已删除时为 0，前端此行不可点） |
| data.campus_name | string | 校区名称 |
| data.open_status | integer | 开课状态 |
| data.valid_text | string | 有效期文案：长期有效 / N天内有效 |
| data.createtime_text | string | 下单时间（Y-m-d H:i） |

## 备注

- 仅本人订单：订单号不属于当前用户时返回 code=0「订单不存在」
- 「后台开课」的订单没有套餐与规格记录，package_id=0、sku_name 为「后台开课」
- status_text 兼容历史数字状态（0/1）与统一订单字符串状态，与订单列表页同口径
