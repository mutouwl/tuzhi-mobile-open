# 获取课程分组列表（兼容旧接口）

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.group.getList` |
| 接口地址 | `POST /api/course/group/getList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Group（课程分组接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| parent_id | integer | 否 | 上级ID | `0` |
| group | integer | 否 | 分组 | `0` |
| is_deep | integer | 否 | 是否递归子分类 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/group/getList' \
  -H 'Content-Type: application/json' \
  -d '{"parent_id":0,"group":0,"is_deep":1}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "返回成功",
  "time": "1786508182",
  "data": [
    {
      "id": 24,
      "uniacid": 1,
      "parent_id": 0,
      "name": "家庭育儿",
      "image": null,
      "sort": 0,
      "status": 1,
      "createtime": 1783680708
    },
    {
      "id": 23,
      "uniacid": 1,
      "parent_id": 0,
      "name": "考研升学",
      "image": "",
      "sort": 0,
      "status": 1,
      "createtime": 1782873836
    },
    {
      "id": 20,
      "uniacid": 1,
      "parent_id": 0,
      "name": "英语留学",
      "image": "",
      "sort": 14,
      "status": 1,
      "createtime": 1771929157
    },
    {
      "id": 21,
      "uniacid": 1,
      "parent_id": 0,
      "name": "办公技能",
      "image": "",
      "sort": 15,
      "status": 1,
      "createtime": 1771929184
    },
    {
      "id": 22,
      "uniacid": 1,
      "parent_id": 0,
      "name": "健康常识",
      "image": "",
      "sort": 16,
      "status": 1,
      "createtime": 1771929192
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
| data[].parent_id | integer | 上级ID |
| data[].name | string | 名称 |
| data[].image | null | 图片 |
| data[].sort | integer | 排序 |
| data[].status | integer | 状态 |
| data[].createtime | integer | 创建时间（时间戳） |
