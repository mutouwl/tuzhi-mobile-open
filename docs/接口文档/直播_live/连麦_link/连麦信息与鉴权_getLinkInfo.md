# 连麦信息与鉴权

> 学员端连麦总入口：拉取各连麦开关、RTC 频道与服务商鉴权、本人进行中的连麦记录，供自动上麦、邀请弹窗与入口显隐。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `live.link.info` |
| 接口地址 | `POST /api/live/link/getLinkInfo` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 直播（live） |
| 所属控制器 | Link（直播连麦 - 用户端 学员申请/接受/拒绝/下麦 + 讲师同意/邀请（讲师通过 is_lecturer 进入，复用 api auth）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程ID | `1585` |
| platform | string | 否 | 请求端 pc / mobile；传入时额外计算该端整体可用性 platform_link_enabled | `mobile` |
| with_records | integer | 否 | 1=额外返回本人最近 20 条连麦记录（打开连麦弹窗时用），轮询不传 | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}live/link/getLinkInfo' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":1585,"platform":"mobile","with_records":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980020",
  "data": {
    "course_id": 1585,
    "channel_id": "link_1585",
    "link_enabled": 1,
    "link_pc_enabled": 1,
    "link_mobile_enabled": 1,
    "message_enabled": 1,
    "platform_link_enabled": 1,
    "allow_link": 0,
    "room_link": 1,
    "forbid_apply_link": 0,
    "ban_link": 0,
    "max_link_count": 1,
    "provider": "aliyun",
    "my_link": null,
    "rtc_user_id": "link_1585_38",
    "sdk_auth": {
      "app_id": "aed28cbe-34e1-4b06-babd-2171986c50b5",
      "region_id": "cn-shanghai",
      "data_center": "cn-shanghai",
      "user_id": 38,
      "role": "audience",
      "channel_id": "link_1585",
      "channel_join_token": "****",
      "timestamp": 1790066420,
      "token": "****"
    },
    "my_records": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.course_id | integer | 回显课程ID |
| data.channel_id | string | 连麦 RTC 频道ID（无则按 link_{course_id} 生成并落库） |
| data.link_enabled | integer | 连麦全局主开关：1开启 0关闭 |
| data.link_pc_enabled | integer | 直播设置-连麦 PC 端开关 |
| data.link_mobile_enabled | integer | 直播设置-连麦移动端开关（老数据未配置按 1） |
| data.message_enabled | integer | 通用设置「消息服务状态」：0 时连麦事件无法实时推达，前端应隐藏入口 |
| data.platform_link_enabled | integer | 当前端是否可用连麦（=全局主开关 && 平台开关） |
| data.allow_link | integer | 直播间允许连麦（历史兼容字段） |
| data.room_link | integer | 本场直播连麦开关（以运营设置为准，轮询兜底控制入口显隐） |
| data.forbid_apply_link | integer | 1=运营开启「禁止主动连麦」，学员只能等讲师邀请 |
| data.ban_link | integer | 1=当前学员被中控台单独禁止连麦 |
| data.max_link_count | integer | 单场最大同时连麦人数（当前固定 1） |
| data.provider | string | 连麦服务商标识（如 aliyun） |
| data.my_link | null | 本人最新的进行中记录（申请中/连麦中），null=无进行中连麦 |
| data.rtc_user_id | string | 本人在 RTC 频道的用户ID（link_{course_id}_{user_id}） |
| data.sdk_auth | object | 服务商 SDK 鉴权信息（取不到时为空对象） |
| data.sdk_auth.app_id | string | 服务商应用ID |
| data.sdk_auth.region_id | string | regionID |
| data.sdk_auth.data_center | string | 数据center |
| data.sdk_auth.user_id | integer | 用户ID |
| data.sdk_auth.role | string | 入房角色（恒为 audience） |
| data.sdk_auth.channel_id | string | 连麦 RTC 频道ID |
| data.sdk_auth.channel_join_token | string | 入房凭证 |
| data.sdk_auth.timestamp | integer | Token 有效期对应时间戳 |
| data.sdk_auth.token | string | 入房 Token（脱敏示例） |
| data.my_records | array | 仅 with_records=1 返回：本人最近 20 条连麦记录（id 倒序） |

## 备注

- 移动端为 8 秒级轮询 + 打开连麦弹窗时带 with_records=1 按需拉记录
- 学员端按 my_link.status==0 且 inviter==1 弹邀请提醒、status==1 自动上麦；实时消息可用时秒级感知，本接口是消息服务不可用时的轮询兜底
- 直播间不存在时返回 code=0「直播间不存在」，course_id 为 0 返回「参数错误」
- sdk_auth 中的 token 属敏感凭证，落库与文档示例均已脱敏
