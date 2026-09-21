# 提交预约

> 学生为指定课次提交预约，是否需机构确认由教务设置 booking_audit 决定。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `school.user.book` |
| 接口地址 | `POST /api/app/school/user/book` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | User（教务-学生端（需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| student_id | integer | 是 | 学生ID（须为本人名下） | `3619` |
| schedule_id | integer | 是 | 课次ID（取自可预约场次列表的 id） | `8728` |
| contact_name | string | 否 | 联系人姓名 | - |
| contact_phone | string | 否 | 联系人手机号 | `13800138000` |
| remark | string | 否 | 学员备注（最长 200 字） | `希望安排靠前的时段` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/user/book' \
  -H 'Content-Type: application/json' \
  -d '{"student_id":3619,"schedule_id":8728,"contact_name":"xxx","contact_phone":"13222222222","remark":"希望安排靠前的时段"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 预约单ID |
| data.need_confirm | integer | 是否需机构确认：1=待机构确认（状态 0），0=已直接落定 |

## 备注

- 成功 msg 分两种：需审核「提交成功，等待机构确认」、免审核「预约成功」
- 名额已满、超出可约时段（提前天数/停止预约小时数/周期上限）、课时不足等限制由服务端判定，失败以 code=0 返回具体原因
- 预约来源记为线上预约（source=2）；机构确认后回填 schedule_student_id 并占用课时
