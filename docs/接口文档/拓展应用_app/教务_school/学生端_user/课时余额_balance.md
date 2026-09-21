# 课时余额

> 学生课时汇总 + 课时账户明细分页，并下发课程与校区筛选选项；汇总始终按筛选后的全部账户计算。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.balance` |
| 接口地址 | `POST /api/app/school/user/balance` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| course_id | integer | 否 | 按课程筛选账户，0=全部 | `0` |
| campus_id | integer | 否 | 按校区筛选账户，0=全部 | `0` |
| page | integer | 否 | 页码，默认 1（只影响账户明细，不影响顶部统计与选项） | `1` |
| limit | integer | 否 | 每页数量，默认 20（最大 100） | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/balance' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"course_id":0,"campus_id":0,"page":1,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980030",
  "data": {
    "course_count": 2,
    "total_lessons": 70,
    "used_lessons": 2,
    "remain_lessons": 68,
    "accounts": [
      {
        "id": 1748,
        "uniacid": 1,
        "student_id": 3619,
        "user_id": 38,
        "course_id": 2675,
        "campus_id": 1994,
        "total_lessons": "60.00",
        "used_lessons": "1.00",
        "expire_time": 0,
        "source": 1,
        "status": 1,
        "deleted": 0,
        "createtime": 1789890530,
        "updatetime": 1789895121,
        "course_name": "计算机算法结构课程一对一",
        "campus_name": "山东大学"
      },
      {
        "id": 1747,
        "uniacid": 1,
        "student_id": 3619,
        "user_id": 38,
        "course_id": 2676,
        "campus_id": 1994,
        "total_lessons": "10.00",
        "used_lessons": "1.00",
        "expire_time": 0,
        "source": 1,
        "status": 1,
        "deleted": 0,
        "createtime": 1789890512,
        "updatetime": 1789891085,
        "course_name": "计算机算法结构课程一对多",
        "campus_name": "山东大学"
      }
    ],
    "has_more": false,
    "total": 2,
    "course_options": [
      {
        "id": 0,
        "name": "全**"
      },
      {
        "id": 2675,
        "name": "计**",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/6edaf6c84972ddde4a1bf2c0d466c08d.png",
        "intro": "学会计算机",
        "is_one_to_one": 1,
        "type_text": "一对一"
      },
      {
        "id": 2676,
        "name": "计**",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260822/40fce2ec85c1d72e933072ac15f5e21e.png",
        "intro": "",
        "is_one_to_one": 0,
        "type_text": "一对多"
      }
    ],
    "campus_options": [
      {
        "id": 0,
        "name": "全**"
      },
      {
        "id": 1994,
        "name": "山**",
        "logo": "https://tuzhi.mutouweb.com/uploads/1/20260919/dab4a5dd42ed4382c324322b22a24acd.png",
        "address": "山东济南学府路",
        "contact_phone": "187****8782",
        "business_hours": "16:00 - 23:00"
      }
    ],
    "student": {
      "id": 3619,
      "uniacid": 1,
      "user_id": 38,
      "name": "刘**",
      "avatar": "https://tuzhi.mutouweb.com/uploads/1/20250712/b487136c49fd59a1b1d5e35fe6cdbbfc.png",
      "phone": "187****4234",
      "gender": 1,
      "birthday": 1789833600,
      "remark": "",
      "deleted": 0,
      "createtime": 1789890438,
      "updatetime": 1789890438
    }
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.course_count | integer | 课程数（=筛选后的账户数） |
| data.total_lessons | integer | 总课时（保留两位小数） |
| data.used_lessons | integer | 已用课时 |
| data.remain_lessons | integer | 剩余课时（总课时 - 已用） |
| data.accounts | array | 当前页课时账户 |
| data.accounts[].id | integer | 账户ID |
| data.accounts[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.accounts[].student_id | integer | 学生ID |
| data.accounts[].user_id | integer | 用户ID |
| data.accounts[].course_id | integer | 课程ID |
| data.accounts[].campus_id | integer | 校区ID |
| data.accounts[].total_lessons | string | 账户总课时 |
| data.accounts[].used_lessons | string | 账户已用课时 |
| data.accounts[].expire_time | integer | 有效期至（0=长期有效） |
| data.accounts[].source | integer | 开通方式：1后台开通课包 2在线购买 3后台单独开通 |
| data.accounts[].status | integer | 状态：1正常 0已过期 |
| data.accounts[].deleted | integer | deleted |
| data.accounts[].createtime | integer | 创建时间（时间戳） |
| data.accounts[].updatetime | integer | 更新时间（时间戳） |
| data.accounts[].course_name | string | 课程名称 |
| data.accounts[].campus_name | string | 校区名称 |
| data.has_more | boolean | 账户明细是否还有下一页 |
| data.total | integer | 筛选后的账户总数 |
| data.course_options | array | 课程筛选选项（首项「全部课程」id=0，顺序按账户出现顺序） |
| data.course_options[].id | integer | ID |
| data.course_options[].name | string | 名称 |
| data.campus_options | array | 校区筛选选项（首项「全部校区」id=0，其余字段与校区列表卡片一致） |
| data.campus_options[].id | integer | ID |
| data.campus_options[].name | string | 名称 |
| data.student | object | 学生信息（id/name/avatar/phone/gender/birthday） |
| data.student.id | integer | ID |
| data.student.uniacid | integer | 应用ID（公众号/uniacid） |
| data.student.user_id | integer | 用户ID |
| data.student.name | string | 名称 |
| data.student.avatar | string | 头像 |
| data.student.phone | string | 电话 |
| data.student.gender | integer | 性别 |
| data.student.birthday | integer | 生日 |
| data.student.remark | string | 备注 |
| data.student.deleted | integer | deleted |
| data.student.createtime | integer | 创建时间（时间戳） |
| data.student.updatetime | integer | 更新时间（时间戳） |

## 备注

- 顶部统计与筛选下拉选项始终基于筛选后的全部账户，只有 accounts 明细按页下发
- 剩余课时为 0 时前端按课程跳 app/school/package/course 走续费入口
- campus_options 下发名称/封面/地址/营业时间，选择校区弹窗直接复用校区卡渲染
