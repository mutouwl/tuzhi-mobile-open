# 获取练习详情

> 判断是否已经订阅

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.exam.exercises.detail` |
| 接口地址 | `POST /api/app/exam/exercises/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Exercises（练习） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | `14` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/exam/exercises/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":14}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508209",
  "data": {
    "id": 14,
    "uniacid": 1,
    "name": "六道题-全部题型",
    "cover": "https://tuzhi.mutouweb.com/uploads/1/20260716/b08b0d48c2998ad62715990db2f808aa.jpg",
    "detail": "<p>detail</p>",
    "question_count": 50,
    "question_total_count": 6,
    "question_mode": "random",
    "degree": 2,
    "sales_type": 1,
    "pay_price": "0.00",
    "bind_course": 0,
    "group_id": 0,
    "hide": 0,
    "status": 1,
    "views": 4,
    "sales": 0,
    "updatetime": 1784175113,
    "createtime": 1784175113,
    "course": {
      "id": null,
      "uniacid": null,
      "name": null,
      "cover": null,
      "type": null,
      "detail": null,
      "briefing": null,
      "warm_up_cover": null,
      "live_start_time": null,
      "live_end_time": null,
      "live_type": null,
      "live_screen_ratio": null,
      "live_video": null,
      "live_video_duration": null,
      "live_video_convert_replay": null,
      "live_custom_url": null,
      "video_patch": null,
      "video_path": null,
      "audio_path": null,
      "sales_type": null,
      "pay_type": null,
      "price": null,
      "price_marking": null,
      "password": null,
      "validity_type": null,
      "validity_diy_time": null,
      "validity_fix_time": null,
      "try_read_status": null,
      "try_read_content": null,
      "try_listen_status": null,
      "try_listen_content": null,
      "try_watch_status": null,
      "try_watch_content": null,
      "limit_watch": null,
      "limit_copy": null,
      "bullet_screen": null,
      "bind_data": null,
      "shelf_type": null,
      "shelf_time": null,
      "unshelf_status": null,
      "unshelf_time": null,
      "shelf_pause": null,
      "shelf_timing": null,
      "unshelf_timing": null,
      "hide": null,
      "column_update": null,
      "status": null,
      "views": null,
      "sales": null,
      "createtime": null,
      "updatetime": null
    },
    "is_auth": true,
    "is_subscribe": true,
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
| data.cover | string | 封面图 |
| data.detail | string | 详情 |
| data.question_count | integer | 题目数量 |
| data.question_total_count | integer | 题目合计数量 |
| data.question_mode | string | 题目mode |
| data.degree | integer | degree |
| data.sales_type | integer | 销售方式 |
| data.pay_price | string | 支付价格 |
| data.bind_course | integer | 绑定课程 |
| data.group_id | integer | 分组ID |
| data.hide | integer | 是否隐藏 |
| data.status | integer | 状态 |
| data.views | integer | 浏览量 |
| data.sales | integer | 销量 |
| data.updatetime | integer | 更新时间（时间戳） |
| data.createtime | integer | 创建时间（时间戳） |
| data.course | object | 课程 |
| data.course.id | null | ID |
| data.course.uniacid | null | 应用ID（公众号/uniacid） |
| data.course.name | null | 名称 |
| data.course.cover | null | 封面图 |
| data.course.type | null | 类型 |
| data.course.detail | null | 详情 |
| data.course.briefing | null | 简介 |
| data.course.warm_up_cover | null | warmup封面图 |
| data.course.live_start_time | null | livestart时间 |
| data.course.live_end_time | null | liveend时间 |
| data.course.live_type | null | live类型 |
| data.course.live_screen_ratio | null | livescreenratio |
| data.course.live_video | null | livevideo |
| data.course.live_video_duration | null | livevideoduration |
| data.course.live_video_convert_replay | null | livevideoconvert回放 |
| data.course.live_custom_url | null | livecustom链接 |
| data.course.video_patch | null | videopatch |
| data.course.video_path | null | videopath |
| data.course.audio_path | null | audiopath |
| data.course.sales_type | null | 销售方式 |
| data.course.pay_type | null | 支付类型 |
| data.course.price | null | 价格 |
| data.course.price_marking | null | 划线价 |
| data.course.password | null | 密码 |
| data.course.validity_type | null | validity类型 |
| data.course.validity_diy_time | null | validitydiy时间 |
| data.course.validity_fix_time | null | validityfix时间 |
| data.course.try_read_status | null | tryread状态 |
| data.course.try_read_content | null | tryread内容 |
| data.course.try_listen_status | null | trylisten状态 |
| data.course.try_listen_content | null | trylisten内容 |
| data.course.try_watch_status | null | trywatch状态 |
| data.course.try_watch_content | null | trywatch内容 |
| data.course.limit_watch | null | limitwatch |
| data.course.limit_copy | null | limitcopy |
| data.course.bullet_screen | null | 弹幕开关 |
| data.course.bind_data | null | 绑定数据 |
| data.course.shelf_type | null | shelf类型 |
| data.course.shelf_time | null | shelf时间 |
| data.course.unshelf_status | null | unshelf状态 |
| data.course.unshelf_time | null | unshelf时间 |
| data.course.shelf_pause | null | shelfpause |
| data.course.shelf_timing | null | shelftiming |
| data.course.unshelf_timing | null | unshelftiming |
| data.course.hide | null | 是否隐藏 |
| data.course.column_update | null | 专栏更新 |
| data.course.status | null | 状态 |
| data.course.views | null | 浏览量 |
| data.course.sales | null | 销量 |
| data.course.createtime | null | 创建时间（时间戳） |
| data.course.updatetime | null | 更新时间（时间戳） |
| data.is_auth | boolean | 是否鉴权 |
| data.is_subscribe | boolean | 是否订阅 |
| data.is_virtual_pay | integer | 是否虚拟支付 |
