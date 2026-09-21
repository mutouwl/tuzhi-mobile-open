# 课程详情

> 增加浏览量

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.detail` |
| 接口地址 | `POST /api/course/course/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | Course（课程） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | ID | `0` |
| add_views | integer | 否 | 添加浏览 | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}course/course/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":0,"add_views":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508201",
  "data": {
    "id": 645,
    "name": "开心",
    "cover": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
    "type": "live",
    "detail": "<p>生日晚会</p>",
    "briefing": "",
    "warm_up_cover": "",
    "live_start_time": 1786365037,
    "live_end_time": 1786365037,
    "live_type": 1,
    "live_screen_ratio": 1,
    "video_patch": "",
    "video_path": "",
    "audio_path": "",
    "sales_type": [
      "alone"
    ],
    "pay_type": "free",
    "price": "0.00",
    "price_marking": "0.00",
    "try_read_status": true,
    "try_read_content": "<p>生日晚会</p>",
    "try_listen_status": false,
    "try_listen_content": "",
    "try_watch_status": false,
    "try_watch_content": "",
    "limit_copy": "0",
    "bullet_screen": "13222222222",
    "bind_data": [],
    "views": 14,
    "createtime": 1786365122,
    "subscription": true,
    "vip_free_access": false,
    "live_room": {
      "id": 90,
      "uniacid": 1,
      "course_id": 645,
      "app_name": "live",
      "stream_name": "jt4hdDovSI",
      "message_topic": "brOxeETiq9",
      "live_record_key": "b1l0GJ2qET",
      "config": {
        "play_back": "1",
        "play_back_type": "1",
        "play_pause": "0",
        "views": "0",
        "discuss_public": "0",
        "like": "0",
        "comment_audit": 0,
        "low_latency": "1",
        "notice": "测试看看",
        "ban_words": "流量,抖音",
        "play_back_record": "1",
        "bullet_screen": "1",
        "play_back_save_type": "vod",
        "gift": 1,
        "gift_max_count": "10000",
        "goods": 1,
        "redpacket": 1
      },
      "createtime": 1786365122,
      "push_url": {
        "rtmp": "rtmp://play.live.mutouweb.com/live/jt4hdDovSI?auth_key=1786508801-0-0-7b6a7bcb3c0f2a9dfbaaf0d6ed430ca0",
        "artc": "artc://play.live.mutouweb.com/live/jt4hdDovSI?auth_key=1786508801-0-0-7b6a7bcb3c0f2a9dfbaaf0d6ed430ca0",
        "flv": "https://play.live.mutouweb.com/live/jt4hdDovSI.flv?auth_key=1786508801-0-0-6939df069c5310cbb0df02ba1f7e07fe",
        "hls": "https://play.live.mutouweb.com/live/jt4hdDovSI.m3u8?auth_key=1786508801-0-0-c1fa1e6c9813c1ffcdbb06861ffd3b54"
      },
      "qualities": [
        {
          "name": "标清",
          "template_id": "lsd",
          "level": 2,
          "url": {
            "rtmp": "rtmp://play.live.mutouweb.com/live/jt4hdDovSI_lsd?auth_key=1786508801-0-0-c1d220e92de69542df9d0bd85941051b",
            "artc": "artc://play.live.mutouweb.com/live/jt4hdDovSI_lsd?auth_key=1786508801-0-0-c1d220e92de69542df9d0bd85941051b",
            "flv": "https://play.live.mutouweb.com/live/jt4hdDovSI_lsd.flv?auth_key=1786508801-0-0-27b9595034a04560d9215028157fbc06",
            "hls": "https://play.live.mutouweb.com/live/jt4hdDovSI_lsd.m3u8?auth_key=1786508801-0-0-4fae3b7b0641f08a7e604bd1453eb74f"
          }
        },
        {
          "name": "流畅",
          "template_id": "lld",
          "level": 1,
          "url": {
            "rtmp": "rtmp://play.live.mutouweb.com/live/jt4hdDovSI_lld?auth_key=1786508801-0-0-424a757a42905924b09bb4e7218a012d",
            "artc": "artc://play.live.mutouweb.com/live/jt4hdDovSI_lld?auth_key=1786508801-0-0-424a757a42905924b09bb4e7218a012d",
            "flv": "https://play.live.mutouweb.com/live/jt4hdDovSI_lld.flv?auth_key=1786508801-0-0-65a6bd2b7641a2df9cda59b8a371f283",
            "hls": "https://play.live.mutouweb.com/live/jt4hdDovSI_lld.m3u8?auth_key=1786508801-0-0-6e4066d1894880edc1d65233f7bac731"
          }
        }
      ]
    },
    "study_num": 2,
    "comment_num": 0,
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
| data.name | string | 名称 |
| data.cover | string | 封面图 |
| data.type | string | 类型 |
| data.detail | string | 详情 |
| data.briefing | string | 简介 |
| data.warm_up_cover | string | warmup封面图 |
| data.live_start_time | integer | livestart时间 |
| data.live_end_time | integer | liveend时间 |
| data.live_type | integer | live类型 |
| data.live_screen_ratio | integer | livescreenratio |
| data.video_patch | string | videopatch |
| data.video_path | string | videopath |
| data.audio_path | string | audiopath |
| data.sales_type | array | 销售方式 |
| data.sales_type[] | string | 销售方式 |
| data.pay_type | string | 支付类型 |
| data.price | string | 价格 |
| data.price_marking | string | 划线价 |
| data.try_read_status | boolean | tryread状态 |
| data.try_read_content | string | tryread内容 |
| data.try_listen_status | boolean | trylisten状态 |
| data.try_listen_content | string | trylisten内容 |
| data.try_watch_status | boolean | trywatch状态 |
| data.try_watch_content | string | trywatch内容 |
| data.limit_copy | string | limitcopy |
| data.bullet_screen | string | 弹幕开关 |
| data.bind_data | array | 绑定数据 |
| data.views | integer | 浏览量 |
| data.createtime | integer | 创建时间（时间戳） |
| data.subscription | boolean | 订阅 |
| data.vip_free_access | boolean | VIPfreeaccess |
| data.live_room | object | live直播间 |
| data.live_room.id | integer | ID |
| data.live_room.uniacid | integer | 应用ID（公众号/uniacid） |
| data.live_room.course_id | integer | 课程ID |
| data.live_room.app_name | string | App名称 |
| data.live_room.stream_name | string | stream名称 |
| data.live_room.message_topic | string | 消息topic |
| data.live_room.live_record_key | string | liverecord密钥 |
| data.live_room.config | object | 配置 |
| data.live_room.config.play_back | string | 播放back |
| data.live_room.config.play_back_type | string | 播放back类型 |
| data.live_room.config.play_pause | string | 播放pause |
| data.live_room.config.views | string | 浏览量 |
| data.live_room.config.discuss_public | string | discusspublic |
| data.live_room.config.like | string | 点赞 |
| data.live_room.config.comment_audit | integer | 评论audit |
| data.live_room.config.low_latency | string | lowlatency |
| data.live_room.config.notice | string | notice |
| data.live_room.config.ban_words | string | 禁止words |
| data.live_room.config.play_back_record | string | 播放backrecord |
| data.live_room.config.bullet_screen | string | 弹幕开关 |
| data.live_room.config.play_back_save_type | string | 播放back保存类型 |
| data.live_room.config.gift | integer | 礼物 |
| data.live_room.config.gift_max_count | string | 礼物max数量 |
| data.live_room.config.goods | integer | 商品 |
| data.live_room.config.redpacket | integer | 红包 |
| data.live_room.createtime | integer | 创建时间（时间戳） |
| data.live_room.push_url | object | push链接 |
| data.live_room.push_url.rtmp | string | RTMP 拉流地址 |
| data.live_room.push_url.artc | string | ARTC 拉流地址 |
| data.live_room.push_url.flv | string | FLV 拉流地址 |
| data.live_room.push_url.hls | string | HLS 拉流地址 |
| data.live_room.qualities | array | qualities |
| data.live_room.qualities[].name | string | 名称 |
| data.live_room.qualities[].template_id | string | templateID |
| data.live_room.qualities[].level | integer | 等级 |
| data.live_room.qualities[].url | object | 链接 |
| data.live_room.qualities[].url.rtmp | string | RTMP 拉流地址 |
| data.live_room.qualities[].url.artc | string | ARTC 拉流地址 |
| data.live_room.qualities[].url.flv | string | FLV 拉流地址 |
| data.live_room.qualities[].url.hls | string | HLS 拉流地址 |
| data.study_num | integer | 学习数量 |
| data.comment_num | integer | 评论数量 |
| data.is_virtual_pay | integer | 是否虚拟支付 |
