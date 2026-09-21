# 获取直播间详情

> 判断是否已订阅

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.room.detail` |
| 接口地址 | `POST /api/live/room/getRoomDetail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 直播（live） |
| 所属控制器 | Room（直播间） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | string | 否 | 课程ID | `645` |

## 请求示例

```bash
curl -X POST '{apiUrl}live/room/getRoomDetail' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":645}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "操作成功",
  "time": "1786508220",
  "data": {
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
      "rtmp": "rtmp://play.live.mutouweb.com/live/jt4hdDovSI?auth_key=1786508820-0-0-104e7357e628309c89c00306867e4ec1",
      "artc": "artc://play.live.mutouweb.com/live/jt4hdDovSI?auth_key=1786508820-0-0-104e7357e628309c89c00306867e4ec1",
      "flv": "https://play.live.mutouweb.com/live/jt4hdDovSI.flv?auth_key=1786508820-0-0-3f680e329564c77ba85a1d89c0b4111a",
      "hls": "https://play.live.mutouweb.com/live/jt4hdDovSI.m3u8?auth_key=1786508820-0-0-842851279df2d905850098cb7eebc888"
    },
    "qualities": [
      {
        "name": "标清",
        "template_id": "lsd",
        "level": 2,
        "url": {
          "rtmp": "rtmp://play.live.mutouweb.com/live/jt4hdDovSI_lsd?auth_key=1786508820-0-0-52ad29f8c9870286561a7ad8270be601",
          "artc": "artc://play.live.mutouweb.com/live/jt4hdDovSI_lsd?auth_key=1786508820-0-0-52ad29f8c9870286561a7ad8270be601",
          "flv": "https://play.live.mutouweb.com/live/jt4hdDovSI_lsd.flv?auth_key=1786508820-0-0-23171b83b8a34aa51265fa820115668d",
          "hls": "https://play.live.mutouweb.com/live/jt4hdDovSI_lsd.m3u8?auth_key=1786508820-0-0-9a00270f11f47dc0cd97626f2742249d"
        }
      },
      {
        "name": "流畅",
        "template_id": "lld",
        "level": 1,
        "url": {
          "rtmp": "rtmp://play.live.mutouweb.com/live/jt4hdDovSI_lld?auth_key=1786508820-0-0-a63a6a3f164ea56dc9ae2f9f4afbe273",
          "artc": "artc://play.live.mutouweb.com/live/jt4hdDovSI_lld?auth_key=1786508820-0-0-a63a6a3f164ea56dc9ae2f9f4afbe273",
          "flv": "https://play.live.mutouweb.com/live/jt4hdDovSI_lld.flv?auth_key=1786508820-0-0-29c0ccde842bf5602123001c50e8ab7f",
          "hls": "https://play.live.mutouweb.com/live/jt4hdDovSI_lld.m3u8?auth_key=1786508820-0-0-598be196c7f41d4b2ee766b803b83ddc"
        }
      }
    ],
    "status": "wait_playback",
    "status_text": "待生成回放视频",
    "message_pubkey": "pub_76f9c3928af87c1bd6c1d71698035cf4",
    "message_provider": "aodianyun",
    "message_enabled": 1,
    "user_count": 2
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
| data.course_id | integer | 课程ID |
| data.app_name | string | App名称 |
| data.stream_name | string | stream名称 |
| data.message_topic | string | 消息topic |
| data.live_record_key | string | liverecord密钥 |
| data.config | object | 配置 |
| data.config.play_back | string | 播放back |
| data.config.play_back_type | string | 播放back类型 |
| data.config.play_pause | string | 播放pause |
| data.config.views | string | 浏览量 |
| data.config.discuss_public | string | discusspublic |
| data.config.like | string | 点赞 |
| data.config.comment_audit | integer | 评论audit |
| data.config.low_latency | string | lowlatency |
| data.config.notice | string | notice |
| data.config.ban_words | string | 禁止words |
| data.config.play_back_record | string | 播放backrecord |
| data.config.bullet_screen | string | 弹幕开关 |
| data.config.play_back_save_type | string | 播放back保存类型 |
| data.config.gift | integer | 礼物 |
| data.config.gift_max_count | string | 礼物max数量 |
| data.config.goods | integer | 商品 |
| data.config.redpacket | integer | 红包 |
| data.createtime | integer | 创建时间（时间戳） |
| data.push_url | object | push链接 |
| data.push_url.rtmp | string | RTMP 拉流地址 |
| data.push_url.artc | string | ARTC 拉流地址 |
| data.push_url.flv | string | FLV 拉流地址 |
| data.push_url.hls | string | HLS 拉流地址 |
| data.qualities | array | qualities |
| data.qualities[].name | string | 名称 |
| data.qualities[].template_id | string | templateID |
| data.qualities[].level | integer | 等级 |
| data.qualities[].url | object | 链接 |
| data.qualities[].url.rtmp | string | RTMP 拉流地址 |
| data.qualities[].url.artc | string | ARTC 拉流地址 |
| data.qualities[].url.flv | string | FLV 拉流地址 |
| data.qualities[].url.hls | string | HLS 拉流地址 |
| data.status | string | 状态 |
| data.status_text | string | 状态说明 |
| data.message_pubkey | string | 消息pubkey |
| data.message_provider | string | 消息provider |
| data.message_enabled | integer | 消息enabled |
| data.user_count | integer | 用户数量 |
