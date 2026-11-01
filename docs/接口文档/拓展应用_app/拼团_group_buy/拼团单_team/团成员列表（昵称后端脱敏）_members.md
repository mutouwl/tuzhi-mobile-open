# 团成员列表（昵称后端脱敏）

> 只回某个团的成员列表与虚拟成团人数，供「参团成员」独立弹层使用；昵称已在后端脱敏，前端不二次加工。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/group_buy/team/members` |
| 接口地址 | `POST /api/app/group_buy/team/members` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Team（拼团团（开团 / 参团 / 我的拼团详情 / 我的拼团列表 / 团成员）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| team_id | integer | 是 | 团 ID；不存在/已删时回「拼团不存在」 | `1967` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/team/members' \
  -H 'Content-Type: application/json' \
  -d '{"team_id":1967}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.team_id | integer | 团 ID |
| data.virtual_count | integer | 模拟成团补的虚拟人数（非成团态恒 0） |
| data.members[].id | integer | 成员行 ID |
| data.members[].nickname | string | 脱敏昵称（首字符+***，取不到 -） |
| data.members[].avatar | string | 头像（无头像给首字兜底图） |
| data.members[].is_leader | integer | 是否团长：1=是 |
| data.members[].is_new_user | integer | 是否新人：1=是 |
| data.members[].is_me | integer | 是否当前登录用户：1=是 |
| data.members[].price | number | 该成员的人民币单价（库内原值，不随虚拟支付换算） |
| data.members[].status | integer | 0=待支付 / 1=待成团 / 2=已成团 / 3=已退款 / 4=已释放 |
| data.members[].status_label | string | 成员状态文案 |
| data.members[].order_no | string | 该成员的订单号 |
| data.members[].pay_time | integer | 支付时刻（Unix 秒，0=未支付） |

## 备注

- 需登录（Team 控制器未放宽免登录）：未登录会先被 401 拦下
- 与 team/detail 共用同一个装配（只截三枚键），成员里含未支付行（status=0），也能读到 order_no / pay_time
- 要「真实已拼人数」请用 team/detail.joined_num，不要数 members 长度
- 昵称脱敏口径与移动端 privacy.js::maskNickname 同一句；user_id / 手机号 / openid 在库那一层就被剥掉
- virtual_count 只对成团态有意义（模拟成团只记缺口、不造假成员行），其它状态为 0
- api_list.js 未登记、三端当前无调用点，属仅接口存在的出口；新接入优先直接用 team/detail
