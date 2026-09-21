# 活动详情

> 增加浏览量

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.activity.detail` |
| 接口地址 | `POST /api/app/activity/activity/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Activity（线下活动） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | `12` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/activity/activity/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":12}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508203",
  "data": {
    "id": 12,
    "uniacid": 1,
    "name": "测试",
    "price": "0.00",
    "location": "测试的",
    "activity_start_time": 1777996800,
    "activity_end_time": 1778083200,
    "apply_time_type": 1,
    "apply_start_time": 1777996800,
    "apply_end_time": 1778083200,
    "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
    "detail": "<p><br></p>",
    "ticket_show_rule": 1,
    "apply_member_show": 1,
    "apply_info_collet": 1,
    "apply_info_form": "[]",
    "sales": 0,
    "status": 0,
    "views": 7,
    "createtime": 1778018524,
    "type": "activity",
    "apply_status": 0,
    "apply_user_count": 0,
    "is_virtual_pay": 0
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.name | string | 名称 |
| data.price | string | 价格 |
| data.location | string | 位置 |
| data.activity_start_time | integer | 活动开始时间 |
| data.activity_end_time | integer | 活动结束时间 |
| data.apply_time_type | integer | 申请时间类型 |
| data.apply_start_time | integer | 报名开始时间 |
| data.apply_end_time | integer | 报名结束时间 |
| data.cover | string | 封面图 |
| data.detail | string | 详情 |
| data.ticket_show_rule | integer | 票券展示规则 |
| data.apply_member_show | integer | 申请会员展示 |
| data.apply_info_collet | integer | 报名信息收集 |
| data.apply_info_form | string | 申请信息表单 |
| data.sales | integer | 销量 |
| data.status | integer | 状态 |
| data.views | integer | 浏览量 |
| data.createtime | integer | 创建时间（时间戳） |
| data.type | string | 类型 |
| data.apply_status | integer | 申请状态 |
| data.apply_user_count | integer | 申请用户数量 |
| data.is_virtual_pay | integer | 是否虚拟支付 |
