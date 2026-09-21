# 课包可选校区

> 课包列表页「校区」筛选的数据源：启用中校区的 id 与名称。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.package.campus` |
| 接口地址 | `POST /api/app/school/package/campus` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Package（教务-课程套餐（移动端，浏览免登录）） |

## 请求参数

无请求参数。

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/package/campus' \
  -H 'Content-Type: application/json' \
  -d '{}'
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
        "id": 37,
        "name": "凸知校园"
      },
      {
        "id": 121,
        "name": "幸福小学"
      },
      {
        "id": 160,
        "name": "实验中学"
      },
      {
        "id": 1994,
        "name": "山东大学"
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
| data.list | array | 校区列表（按 sort 倒序） |
| data.list[].id | integer | 校区ID |
| data.list[].name | string | 校区名称 |

## 备注

- 浏览类接口，无需登录；只含未删除且启用（status=1）的校区
