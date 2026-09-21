# 教师详情

> 老师基本信息（含联系电话）+ 其授课课包 + 所属启用校区。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.teacher.detail` |
| 接口地址 | `POST /api/app/school/teacher/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Teacher（教务-教师（移动端，浏览免登录）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 老师ID | `31` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/teacher/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":31}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980026",
  "data": {
    "info": {
      "id": 31,
      "name": "小雅老师",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20260731/94f405e93d2ca771b0ee1ea77a2516f4.jpg",
      "phone": "176****2595",
      "gender": 1,
      "intro": "小雅老师是专业的小提琴老师"
    },
    "packages": [],
    "campuses": [
      {
        "id": 37,
        "name": "凸知校园",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "address": "123",
        "business_hours": "18:05 - 22:00"
      },
      {
        "id": 160,
        "name": "实验中学",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260821/cd7af56d4c7645c41f017df0bbc71cc5.jpg",
        "address": "山东日照",
        "business_hours": "09:00 - 14:00"
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
| data.info | object | 老师基本信息 |
| data.info.id | integer | 老师ID |
| data.info.name | string | 老师姓名 |
| data.info.avatar | string | 老师头像 |
| data.info.phone | string | 联系电话 |
| data.info.gender | integer | 性别：1男 2女 |
| data.info.intro | string | 老师简介 |
| data.packages | array | 授课课包（仅上架，字段口径同课包列表） |
| data.campuses | array | 所属启用校区（卡片字段对齐校区列表页） |
| data.campuses[].id | integer | 校区ID |
| data.campuses[].name | string | 校区名称 |
| data.campuses[].logo | string | 校区 Logo |
| data.campuses[].address | string | 校区地址 |
| data.campuses[].business_hours | string | 营业时间 |

## 备注

- 老师已删除或停用时返回 code=0「教师不存在或已停用」
- 授课课包由其排课关联课程反查（PackageModel::idsByTeacher），与课包列表页 teacher_id 筛选同源
- 学生端课次详情的老师弹窗用 app/school/user/teacherDetail（带归属校验），本接口面向公开浏览
