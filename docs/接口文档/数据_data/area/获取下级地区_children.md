# 获取下级地区

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `data.area.children` |
| 接口地址 | `POST /api/data/area/children` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 数据（data） |
| 所属控制器 | Area（省市区数据控制器） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| pid | integer | 否 | 父级ID | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}data/area/children' \
  -H 'Content-Type: application/json' \
  -d '{"pid":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508193",
  "data": [
    {
      "id": 11,
      "pid": 0,
      "level": "province",
      "name": "北京市"
    },
    {
      "id": 12,
      "pid": 0,
      "level": "province",
      "name": "天津市"
    },
    {
      "id": 13,
      "pid": 0,
      "level": "province",
      "name": "河北省"
    },
    {
      "id": 14,
      "pid": 0,
      "level": "province",
      "name": "山西省"
    },
    {
      "id": 15,
      "pid": 0,
      "level": "province",
      "name": "内蒙古自治区"
    },
    {
      "id": 21,
      "pid": 0,
      "level": "province",
      "name": "辽宁省"
    },
    {
      "id": 22,
      "pid": 0,
      "level": "province",
      "name": "吉林省"
    },
    {
      "id": 23,
      "pid": 0,
      "level": "province",
      "name": "黑龙江省"
    },
    {
      "id": 31,
      "pid": 0,
      "level": "province",
      "name": "上海市"
    },
    {
      "id": 32,
      "pid": 0,
      "level": "province",
      "name": "江苏省"
    },
    {
      "id": 33,
      "pid": 0,
      "level": "province",
      "name": "浙江省"
    },
    {
      "id": 34,
      "pid": 0,
      "level": "province",
      "name": "安徽省"
    },
    {
      "id": 35,
      "pid": 0,
      "level": "province",
      "name": "福建省"
    },
    {
      "id": 36,
      "pid": 0,
      "level": "province",
      "name": "江西省"
    },
    {
      "id": 37,
      "pid": 0,
      "level": "province",
      "name": "山东省"
    },
    {
      "id": 41,
      "pid": 0,
      "level": "province",
      "name": "河南省"
    },
    {
      "id": 42,
      "pid": 0,
      "level": "province",
      "name": "湖北省"
    },
    {
      "id": 43,
      "pid": 0,
      "level": "province",
      "name": "湖南省"
    },
    {
      "id": 44,
      "pid": 0,
      "level": "province",
      "name": "广东省"
    },
    {
      "id": 45,
      "pid": 0,
      "level": "province",
      "name": "广西壮族自治区"
    },
    {
      "id": 46,
      "pid": 0,
      "level": "province",
      "name": "海南省"
    },
    {
      "id": 50,
      "pid": 0,
      "level": "province",
      "name": "重庆市"
    },
    {
      "id": 51,
      "pid": 0,
      "level": "province",
      "name": "四川省"
    },
    {
      "id": 52,
      "pid": 0,
      "level": "province",
      "name": "贵州省"
    },
    {
      "id": 53,
      "pid": 0,
      "level": "province",
      "name": "云南省"
    },
    {
      "id": 54,
      "pid": 0,
      "level": "province",
      "name": "西藏自治区"
    },
    {
      "id": 61,
      "pid": 0,
      "level": "province",
      "name": "陕西省"
    },
    {
      "id": 62,
      "pid": 0,
      "level": "province",
      "name": "甘肃省"
    },
    {
      "id": 63,
      "pid": 0,
      "level": "province",
      "name": "青海省"
    },
    {
      "id": 64,
      "pid": 0,
      "level": "province",
      "name": "宁夏回族自治区"
    },
    {
      "id": 65,
      "pid": 0,
      "level": "province",
      "name": "新疆维吾尔自治区"
    },
    {
      "id": 71,
      "pid": 0,
      "level": "province",
      "name": "台湾省"
    },
    {
      "id": 81,
      "pid": 0,
      "level": "province",
      "name": "香港特别行政区"
    },
    {
      "id": 82,
      "pid": 0,
      "level": "province",
      "name": "澳门特别行政区"
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
| data[].pid | integer | 父级ID |
| data[].level | string | 等级 |
| data[].name | string | 名称 |
