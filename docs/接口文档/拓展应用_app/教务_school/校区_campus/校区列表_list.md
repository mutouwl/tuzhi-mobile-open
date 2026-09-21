# 校区列表

> 移动端校区列表：仅启用校区，关键词同时匹配名称/地址/联系人/联系电话，分页下发。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.campus.list` |
| 接口地址 | `POST /api/app/school/campus/list` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Campus（教务-校区（移动端，浏览免登录）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| keyword | string | 否 | 关键词，模糊匹配校区名称/地址/联系人/联系电话 | - |
| page | integer | 否 | 页码，默认 1 | `1` |
| limit | integer | 否 | 每页数量，默认 20（最大 100） | `20` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/campus/list' \
  -H 'Content-Type: application/json' \
  -d '{"keyword":"xxx","page":1,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980025",
  "data": {
    "list": [
      {
        "id": 37,
        "name": "凸知校园",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "address": "123",
        "contact_name": "1**",
        "contact_phone": "****",
        "business_hours": "18:05 - 22:00"
      },
      {
        "id": 121,
        "name": "幸福小学",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260818/000e0fb1cf8c0169425a08117383530f.jpg",
        "address": "山东日照市",
        "contact_name": "李**",
        "contact_phone": "187****7890",
        "business_hours": ""
      },
      {
        "id": 160,
        "name": "实验中学",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260821/cd7af56d4c7645c41f017df0bbc71cc5.jpg",
        "address": "山东日照",
        "contact_name": "封**",
        "contact_phone": "187****2345",
        "business_hours": "09:00 - 14:00"
      },
      {
        "id": 1994,
        "name": "山东大学",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
        "address": "山东济南学府路",
        "contact_name": "李**",
        "contact_phone": "187****8782",
        "business_hours": "16:00 - 23:00"
      }
    ],
    "has_more": false,
    "total": 4
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 校区列表 |
| data.list[].id | integer | 校区ID |
| data.list[].name | string | 校区名称 |
| data.list[].logo | string | 校区 Logo |
| data.list[].address | string | 校区地址 |
| data.list[].contact_name | string | 联系人 |
| data.list[].contact_phone | string | 联系电话 |
| data.list[].business_hours | string | 营业时间 |
| data.has_more | boolean | 是否还有下一页 |
| data.total | integer | 筛选后的总条数 |

## 备注

- 搜索口径与后台校区管理一致
- 排序：sort 倒序 → id 升序
- 浏览类接口，无需登录
