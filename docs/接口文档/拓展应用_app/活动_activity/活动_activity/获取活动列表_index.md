# 获取活动列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.activity.list` |
| 接口地址 | `POST /api/app/activity/activity/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Activity（线下活动） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| search | string | 否 | search | - |
| sort | string | 否 | 排序 | `desc` |
| order | string | 否 | 订单 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/activity/activity/index' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"search":"xxx","sort":"desc","order":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508151",
  "data": [
    {
      "id": 12,
      "uniacid": 1,
      "name": "测试",
      "price": 0,
      "location": "测试的",
      "activity_start_time": 1777996800,
      "activity_end_time": 1778083200,
      "apply_time_type": 1,
      "apply_start_time": 0,
      "apply_end_time": 0,
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
      "detail": "<p><br></p>",
      "ticket_show_rule": 1,
      "apply_member_show": 1,
      "apply_info_collet": 1,
      "apply_info_form": "[]",
      "sales": 0,
      "status": 1,
      "views": 7,
      "createtime": 1778018524,
      "type": "activity",
      "pay_type": "free",
      "price_marking": 0,
      "is_virtual_pay": 0
    },
    {
      "id": 11,
      "uniacid": 1,
      "name": "啊啊",
      "price": "1.00",
      "location": "啊啊",
      "activity_start_time": 1767650400,
      "activity_end_time": 1768233600,
      "apply_time_type": 1,
      "apply_start_time": 0,
      "apply_end_time": 0,
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20251229/306d4c8157c1974eb6b8ea20d80ed7e0.jpeg",
      "detail": "<p><br></p>",
      "ticket_show_rule": 1,
      "apply_member_show": 1,
      "apply_info_collet": 1,
      "apply_info_form": "[]",
      "sales": 0,
      "status": 1,
      "views": 17,
      "createtime": 1767837848,
      "type": "activity",
      "pay_type": "pay",
      "price_marking": 0,
      "is_virtual_pay": 0
    },
    {
      "id": 10,
      "uniacid": 1,
      "name": "S2集训营",
      "price": "499.00",
      "location": "协和路1号",
      "activity_start_time": 1751212800,
      "activity_end_time": 1751212980,
      "apply_time_type": 1,
      "apply_start_time": 0,
      "apply_end_time": 0,
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20250628/e059be108db69f07cc1396a8dc4cb751.png",
      "detail": "<p>123</p>",
      "ticket_show_rule": 1,
      "apply_member_show": 1,
      "apply_info_collet": 0,
      "apply_info_form": "[]",
      "sales": 0,
      "status": 1,
      "views": 44,
      "createtime": 1751176454,
      "type": "activity",
      "pay_type": "pay",
      "price_marking": 0,
      "is_virtual_pay": 0
    },
    {
      "id": 9,
      "uniacid": 1,
      "name": "马到成功大聚会",
      "price": "0.01",
      "location": "北京市朝阳区",
      "activity_start_time": 1750003200,
      "activity_end_time": 1781712006,
      "apply_time_type": 1,
      "apply_start_time": 0,
      "apply_end_time": 0,
      "cover": "https://tuzhi.mutouweb.com/uploads/1/20250525/c01f8bfc2a3bf088c4cebe2cfe9fdbbb.jpeg",
      "detail": "<p><img src=\"https://tuzhi.mutouweb.com/uploads/1/20250506/f61a95907b27e0e9c7ae7c0dbab4c595.png\" alt=\"\" data-href=\"\" style=\"\"/></p>",
      "ticket_show_rule": 1,
      "apply_member_show": 1,
      "apply_info_collet": 1,
      "apply_info_form": "[{\"required\":false,\"name\":\"\\u8eab\\u9ad8\",\"type\":\"input\"},{\"required\":false,\"name\":\"\\u4ecb\\u7ecd\",\"type\":\"textarea\"}]",
      "sales": 6,
      "status": 1,
      "views": 181,
      "createtime": 1750043114,
      "type": "activity",
      "pay_type": "pay",
      "price_marking": 0,
      "is_virtual_pay": 0
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
| data[].uniacid | integer | 应用ID（公众号/uniacid） |
| data[].name | string | 名称 |
| data[].price | integer | 价格 |
| data[].location | string | 位置 |
| data[].activity_start_time | integer | 活动开始时间 |
| data[].activity_end_time | integer | 活动结束时间 |
| data[].apply_time_type | integer | 申请时间类型 |
| data[].apply_start_time | integer | 报名开始时间 |
| data[].apply_end_time | integer | 报名结束时间 |
| data[].cover | string | 封面图 |
| data[].detail | string | 详情 |
| data[].ticket_show_rule | integer | 票券展示规则 |
| data[].apply_member_show | integer | 申请会员展示 |
| data[].apply_info_collet | integer | 报名信息收集 |
| data[].apply_info_form | string | 申请信息表单 |
| data[].sales | integer | 销量 |
| data[].status | integer | 状态 |
| data[].views | integer | 浏览量 |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].type | string | 类型 |
| data[].pay_type | string | 支付类型 |
| data[].price_marking | integer | 划线价 |
| data[].is_virtual_pay | integer | 是否虚拟支付 |
