# 证书列表

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.cert.log` |
| 接口地址 | `POST /api/app/cert/log/index` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |
| type | string | 否 | 类型 | `all` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/cert/log/index' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1,"type":"all"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508157",
  "data": [
    {
      "id": 21,
      "uniacid": 1,
      "cert_id": 12,
      "user_id": 38,
      "data": {
        "score": 8
      },
      "cert_no": "CT6388258565631352",
      "createtime": "2025-04-08 16:01:02",
      "type": "test",
      "title": "证书的标题",
      "cert": {
        "type": "test",
        "title": "证书的标题",
        "type_text": "考试",
        "status_text": "正常",
        "issue_condition_course_type_text": "Issue_condition_course_type part",
        "background_type_text": "Background_type default",
        "user_info_text": "User_info nickname,User_info avatar",
        "test_display_text": "test_display show",
        "test_name_display_text": "test_name_display normal",
        "course_display_text": "Course_display show",
        "course_name_display_text": "Course_name_display diy",
        "course_data_text": "Course_data course_count,Course_data study_time",
        "test_data_text": "Test_data score",
        "issue_date_display_text": "Issue_date_display show",
        "number_display_text": "Number_display random",
        "qr_code_display_text": "Qr_code_display show",
        "qr_code_link_text": "Qr_code_link course",
        "bind_content": {
          "id": 2,
          "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/f61a95907b27e0e9c7ae7c0dbab4c595.png",
          "name": "考试测验演示",
          "type": "test",
          "issue_time_text": "",
          "test_time_end_text": "",
          "test_time_start_text": "",
          "status_text": "",
          "join_user_num": 14,
          "join_user_times": 60,
          "status_submit": 60,
          "status_unsubmit": 0
        },
        "user_info": [
          "nickname",
          "avatar"
        ],
        "course_data": [
          "course_count",
          "study_time"
        ],
        "get_user_number": 7
      }
    },
    {
      "id": 20,
      "uniacid": 1,
      "cert_id": 13,
      "user_id": 38,
      "data": {
        "course_count": 7,
        "study_time": 4.5
      },
      "cert_no": "CT1322222222292342",
      "createtime": "2025-04-02 12:27:23",
      "type": "course",
      "title": "你好",
      "cert": {
        "type": "course",
        "title": "你好",
        "type_text": "Course",
        "status_text": "正常",
        "issue_condition_course_type_text": "Issue_condition_course_type all",
        "background_type_text": "Background_type default",
        "user_info_text": "User_info nickname,User_info avatar",
        "test_display_text": "test_display show",
        "test_name_display_text": "test_name_display normal",
        "course_display_text": "Course_display show",
        "course_name_display_text": "Course_name_display diy",
        "course_data_text": "Course_data course_count,Course_data study_time",
        "test_data_text": "Test_data score",
        "issue_date_display_text": "Issue_date_display show",
        "number_display_text": "Number_display random",
        "qr_code_display_text": "Qr_code_display show",
        "qr_code_link_text": "Qr_code_link course",
        "bind_content": {
          "id": 306,
          "cover": "https://tuzhi.mutouweb.com/uploads/1/20260529/3e8a1d523fa3174394fb472e829c38a4.jpg",
          "name": "测试",
          "type": "column"
        },
        "user_info": [
          "nickname",
          "avatar"
        ],
        "course_data": [
          "course_count",
          "study_time"
        ],
        "get_user_number": 1
      }
    },
    {
      "id": 13,
      "uniacid": 1,
      "cert_id": 10,
      "user_id": 38,
      "data": {
        "course_count": 5,
        "study_time": 0.9
      },
      "cert_no": "CT4073834550366698",
      "createtime": "2025-04-02 11:45:05",
      "type": "course",
      "title": "凸知卖课系统",
      "cert": {
        "type": "course",
        "title": "凸知卖课系统",
        "type_text": "Course",
        "status_text": "正常",
        "issue_condition_course_type_text": "Issue_condition_course_type part",
        "background_type_text": "Background_type default",
        "user_info_text": "User_info nickname,User_info avatar",
        "test_display_text": "test_display show",
        "test_name_display_text": "test_name_display normal",
        "course_display_text": "Course_display show",
        "course_name_display_text": "Course_name_display diy",
        "course_data_text": "Course_data course_count,Course_data study_time",
        "test_data_text": "Test_data score",
        "issue_date_display_text": "Issue_date_display show",
        "number_display_text": "Number_display random",
        "qr_code_display_text": "Qr_code_display show",
        "qr_code_link_text": "Qr_code_link course",
        "bind_content": null,
        "user_info": [
          "nickname",
          "avatar"
        ],
        "course_data": [
          "course_count",
          "study_time"
        ],
        "get_user_number": 5
      }
    },
    {
      "id": 3,
      "uniacid": 1,
      "cert_id": 3,
      "user_id": 38,
      "data": {
        "score": 20
      },
      "cert_no": "CT4934213222222222",
      "createtime": "2025-03-30 10:26:19",
      "type": "test",
      "title": "安全员培训",
      "cert": {
        "type": "test",
        "title": "安全员培训",
        "type_text": "考试",
        "status_text": "正常",
        "issue_condition_course_type_text": "Issue_condition_course_type part",
        "background_type_text": "Background_type default",
        "user_info_text": "User_info nickname,User_info avatar",
        "test_display_text": "test_display show",
        "test_name_display_text": "test_name_display normal",
        "course_display_text": "Course_display show",
        "course_name_display_text": "Course_name_display diy",
        "course_data_text": "Course_data course_count,Course_data study_time",
        "test_data_text": "Test_data score",
        "issue_date_display_text": "Issue_date_display show",
        "number_display_text": "Number_display random",
        "qr_code_display_text": "Qr_code_display show",
        "qr_code_link_text": "Qr_code_link course",
        "bind_content": {
          "id": 2,
          "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/f61a95907b27e0e9c7ae7c0dbab4c595.png",
          "name": "考试测验演示",
          "type": "test",
          "issue_time_text": "",
          "test_time_end_text": "",
          "test_time_start_text": "",
          "status_text": "",
          "join_user_num": 14,
          "join_user_times": 60,
          "status_submit": 60,
          "status_unsubmit": 0
        },
        "user_info": [
          "nickname",
          "avatar"
        ],
        "course_data": [
          "course_count",
          "study_time"
        ],
        "get_user_number": 2
      }
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
| data[].cert_id | integer | 证书ID |
| data[].user_id | integer | 用户ID |
| data[].data | object | 数据 |
| data[].data.score | integer | 积分 |
| data[].cert_no | string | 证书号 |
| data[].createtime | string | 创建时间（时间戳） |
| data[].type | string | 类型 |
| data[].title | string | 标题 |
| data[].cert | object | 证书 |
| data[].cert.type | string | 类型 |
| data[].cert.title | string | 标题 |
| data[].cert.type_text | string | 类型说明 |
| data[].cert.status_text | string | 状态说明 |
| data[].cert.issue_condition_course_type_text | string | issue条件课程类型text |
| data[].cert.background_type_text | string | background类型text |
| data[].cert.user_info_text | string | 用户信息text |
| data[].cert.test_display_text | string | 考试displaytext |
| data[].cert.test_name_display_text | string | 考试名称displaytext |
| data[].cert.course_display_text | string | 课程displaytext |
| data[].cert.course_name_display_text | string | 课程名称displaytext |
| data[].cert.course_data_text | string | 课程数据text |
| data[].cert.test_data_text | string | 考试数据text |
| data[].cert.issue_date_display_text | string | issue日期displaytext |
| data[].cert.number_display_text | string | numberdisplaytext |
| data[].cert.qr_code_display_text | string | qrcodedisplaytext |
| data[].cert.qr_code_link_text | string | qrcodelinktext |
| data[].cert.bind_content | object | 绑定内容 |
| data[].cert.bind_content.id | integer | ID |
| data[].cert.bind_content.cover | string | 封面图 |
| data[].cert.bind_content.name | string | 名称 |
| data[].cert.bind_content.type | string | 类型 |
| data[].cert.bind_content.issue_time_text | string | issue时间text |
| data[].cert.bind_content.test_time_end_text | string | 考试时间endtext |
| data[].cert.bind_content.test_time_start_text | string | 考试时间starttext |
| data[].cert.bind_content.status_text | string | 状态说明 |
| data[].cert.bind_content.join_user_num | integer | 加入用户数量 |
| data[].cert.bind_content.join_user_times | integer | 加入用户times |
| data[].cert.bind_content.status_submit | integer | 状态提交 |
| data[].cert.bind_content.status_unsubmit | integer | 状态unsubmit |
| data[].cert.user_info | array | 用户信息 |
| data[].cert.user_info[] | string | 用户信息 |
| data[].cert.course_data | array | 课程数据 |
| data[].cert.course_data[] | string | 课程数据 |
| data[].cert.get_user_number | integer | 获取用户number |
