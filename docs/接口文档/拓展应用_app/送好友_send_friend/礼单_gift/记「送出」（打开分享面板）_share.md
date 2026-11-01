# 记「送出」（打开分享面板）

> 打开分享面板时记下送出时刻，不推进状态；幂等，重复打开只刷新 shared_at，已领取/已失效一行不动。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `send_friend.gift.share` |
| 接口地址 | `POST /api/app/send_friend/gift/share` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gift（礼单（学员端六个出口，PRD §7.2）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 否 | 礼单 ID（与 code 二选一，优先） | `0` |
| code | string | 否 | 礼单凭据 gift_no，端上实际传的是这一枚；只清洗形状（32 位小写字母数字），不符等同取不到 | `3f7a9c1e5b2d48f6a0c3e7d9b1f24a68` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/send_friend/gift/share' \
  -H 'Content-Type: application/json' \
  -d '{"id":0,"code":"3f7a9c1e5b2d48f6a0c3e7d9b1f24a68"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | 礼单 ID |
| data.status | integer | 礼单状态值（这一口不会改变它） |
| data.status_label | string | 状态文案（待赠送/已领取/已失效） |
| data.gift_no | string | 领取凭据 |
| data.receive_url | string | 领取链接，仅 status=0 时下发，其余空串 |
| data.shared_at | string | 送出时刻（本次刷新后的 Unix 秒） |
| data.shared_at_text | string | 送出时间串 Y-m-d H:i:s（未记为 -） |
| data.marked | string | 是否第一次记上送出时刻（统计口径用，重复打开为 false） |

## 备注

- 需登录；只认购买人本人，id/code 取不到或不是本人一律回「礼物不存在」（越权与不存在同句，不可枚举）
- 幂等：只写 shared_at，不计数、不报错；已领取/已失效再点，状态、shared_at、marked 全部原样返回
- 三档状态里没有「待领取」：礼单在好友真正领取之前一直停在 0，领取那一刻直接 0→2
- 端上三条路都打这一口（分享弹窗、onShareAppMessage、onShareTimeline），失败只 toast 不挡海报
- 「已送出份数」是 shared_at>0 或 status=2 的派生，不建冗余计数列；marked 只说「这一次是不是第一次」
