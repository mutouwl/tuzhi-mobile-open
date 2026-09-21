# 课时流水

> 学生课时变动流水（开通/购买/核销/调整），支持关键词与时间筛选、分页。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.logs` |
| 接口地址 | `POST /api/app/school/user/logs` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID | `3619` |
| keyword | string | 否 | 关键词：课程名模糊匹配；纯数字同时匹配课时账户ID | - |
| start_time | integer | 否 | 发生时间起（秒级时间戳），0=不限 | `0` |
| end_time | integer | 否 | 发生时间止（秒级时间戳），0=不限 | `0` |
| page | integer | 否 | 页码，默认 1 | `1` |
| limit | integer | 否 | 每页数量，默认 20（最大 100） | `20` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/logs' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"keyword":"xxx","start_time":0,"end_time":0,"page":1,"limit":20}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980031",
  "data": {
    "list": [
      {
        "id": 4061,
        "uniacid": 1,
        "account_id": 1748,
        "student_id": 3619,
        "course_id": 2675,
        "type": 2,
        "before_lessons": "39.00",
        "change_lessons": "20.00",
        "after_lessons": "59.00",
        "operator_type": "system",
        "operator_id": 0,
        "operator_name": "system",
        "remark": "订单ID 3017",
        "createtime": 1789895121,
        "updatetime": 0,
        "type_text": "购买增加",
        "course_name": "计算机算法结构课程一对一"
      },
      {
        "id": 4060,
        "uniacid": 1,
        "account_id": 1748,
        "student_id": 3619,
        "course_id": 2675,
        "type": 2,
        "before_lessons": "19.00",
        "change_lessons": "20.00",
        "after_lessons": "39.00",
        "operator_type": "system",
        "operator_id": 0,
        "operator_name": "system",
        "remark": "订单ID 3016",
        "createtime": 1789894431,
        "updatetime": 0,
        "type_text": "购买增加",
        "course_name": "计算机算法结构课程一对一"
      },
      {
        "id": 3891,
        "uniacid": 1,
        "account_id": 1747,
        "student_id": 3619,
        "course_id": 2676,
        "type": 3,
        "before_lessons": "10.00",
        "change_lessons": "-1.00",
        "after_lessons": "9.00",
        "operator_type": "user",
        "operator_id": 38,
        "operator_name": "学生签到",
        "remark": "课次ID 8728",
        "createtime": 1789891085,
        "updatetime": 0,
        "type_text": "核销扣减",
        "course_name": "计算机算法结构课程一对多"
      },
      {
        "id": 3889,
        "uniacid": 1,
        "account_id": 1748,
        "student_id": 3619,
        "course_id": 2675,
        "type": 3,
        "before_lessons": "20.00",
        "change_lessons": "-1.00",
        "after_lessons": "19.00",
        "operator_type": "user",
        "operator_id": 38,
        "operator_name": "学生签到",
        "remark": "课次ID 8709",
        "createtime": 1789890895,
        "updatetime": 0,
        "type_text": "核销扣减",
        "course_name": "计算机算法结构课程一对一"
      },
      {
        "id": 3826,
        "uniacid": 1,
        "account_id": 1748,
        "student_id": 3619,
        "course_id": 2675,
        "type": 2,
        "before_lessons": "0.00",
        "change_lessons": "20.00",
        "after_lessons": "20.00",
        "operator_type": "system",
        "operator_id": 0,
        "operator_name": "system",
        "remark": "订单ID 3009",
        "createtime": 1789890530,
        "updatetime": 0,
        "type_text": "购买增加",
        "course_name": "计算机算法结构课程一对一"
      },
      {
        "id": 3825,
        "uniacid": 1,
        "account_id": 1747,
        "student_id": 3619,
        "course_id": 2676,
        "type": 2,
        "before_lessons": "0.00",
        "change_lessons": "10.00",
        "after_lessons": "10.00",
        "operator_type": "system",
        "operator_id": 0,
        "operator_name": "system",
        "remark": "订单ID 3008",
        "createtime": 1789890512,
        "updatetime": 0,
        "type_text": "购买增加",
        "course_name": "计算机算法结构课程一对多"
      }
    ],
    "has_more": false,
    "total": 6
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.list | array | 流水列表（按发生时间倒序） |
| data.list[].id | integer | 流水ID |
| data.list[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.list[].account_id | integer | 课时账户ID |
| data.list[].student_id | integer | 学生ID |
| data.list[].course_id | integer | 课程ID |
| data.list[].type | integer | 变动类型：1后台开通 2购买增加 3核销扣减 4手动调整 |
| data.list[].before_lessons | string | 变动前课时 |
| data.list[].change_lessons | string | 变动课时（正增负减） |
| data.list[].after_lessons | string | 变动后课时 |
| data.list[].operator_type | string | 操作人类型：admin / teacher / system / user |
| data.list[].operator_id | integer | 操作人ID |
| data.list[].operator_name | string | 操作人名称 |
| data.list[].remark | string | 备注 |
| data.list[].createtime | integer | 发生时间（时间戳） |
| data.list[].updatetime | integer | 更新时间（时间戳） |
| data.list[].type_text | string | 变动类型文案 |
| data.list[].course_name | string | 课程名称 |
| data.has_more | boolean | 是否还有下一页 |
| data.total | integer | 筛选后的总条数 |

## 备注

- 排序 createtime desc → id desc：同一批写入的流水时间相同，补 id 兜底避免翻页重复或漏行
- 关键词无匹配课程且非纯数字时直接查空（不下发全量）
