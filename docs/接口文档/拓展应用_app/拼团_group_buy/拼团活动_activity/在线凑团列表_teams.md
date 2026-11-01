# 在线凑团列表

> 商详页「N 人正在拼团」弹层的分页数据：服务端分页并回全量总数，带 token 时自动剔掉「我已经在里面的团」。没有可凑的团就回空数组，那一段给空态、不收起。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.activity.teams` |
| 接口地址 | `POST /api/app/group_buy/activity/teams` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Activity（拼团活动（学员端只读那一面：商详页拼团区 / 在线凑团 / 阶梯档）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | integer | 是 | 活动 ID（activity/detail 的 activity_id）；<=0 直接回空分页体 | `8204` |
| page | integer | 否 | 页码，从 1 起，缺省 1 | `1` |
| limit | integer | 否 | 每页条数，缺省 10，服务端夹到 1~50 | `10` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/activity/teams' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":8204,"page":1,"limit":10}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 分页体 {rows, total, has_more}；rows 为空数组表示此刻没有可凑的团 |
| data.rows[].team_id | integer | 团 ID（「去凑团」带它进 team/join） |
| data.rows[].nickname | string | 团长昵称（后端脱敏：首字符+***，取不到写 -） |
| data.rows[].avatar | string | 团长头像（无头像给首字兜底图） |
| data.rows[].target_num | integer | 成团人数 |
| data.rows[].used_num | integer | 已占名额数 |
| data.rows[].need_num | integer | 还差几人（= target_num - used_num，服务端算好） |
| data.rows[].spec_id | integer | 这一团拼的规格 ID（多规格商品靠它分辨同商品两档团） |
| data.rows[].spec_text | string | 规格文案（弹层里写「团长已选 XXL」） |
| data.rows[].expire_time | integer | 团到期时刻（Unix 秒，端上要 ×1000） |
| data.rows[].createtime | integer | 开团时刻（Unix 秒） |
| data.total | integer | 这一活动此刻可凑的团总数（不是本页行数） |
| data.has_more | boolean | 是否还有下一页（端上优先吃这一枚） |

## 备注

- 免登录可看；带 token 时按「有没有我的成员行」剔除，列表返回的就是「此刻我能去凑的」，端上不要自己再过滤
- 只列同时满足四条：团长自己那一行已支付、团状态为拼团中且未过期、非超员活动还要求未满、团规格仍在售
- total 是这一活动可凑的团总数（不是本页行数），弹层那句「N 人正在拼团」必须吃它，否则就是假统计位
- activity_id<=0 / 活动不存在 / 一张可凑的团都没有：都回 rows 为空、total 为 0、has_more 为 false 的同一形状，端上按空态处理
- 免登录数据纪律：user_id / 手机号 / openid 一律不下发（脱敏在 TeamPage/TeamListPage 一处收口）
