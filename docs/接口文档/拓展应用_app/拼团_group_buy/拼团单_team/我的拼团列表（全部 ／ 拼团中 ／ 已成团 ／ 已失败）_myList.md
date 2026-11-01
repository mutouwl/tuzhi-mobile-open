# 我的拼团列表（全部 / 拼团中 / 已成团 / 已失败）

> 学员自己的拼团记录分页列表，按「我的参与状态」四档筛选；每行带团状态文案、倒计时终点、商品卡快照与已拼人数/头像。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.team.myList` |
| 接口地址 | `POST /api/app/group_buy/team/myList` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Team（拼团团（开团 / 参团 / 我的拼团详情 / 我的拼团列表 / 团成员）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| state | integer | 否 | 页签：0=全部（缺省）/ 1=拼团中 / 2=已成团 / 3=已失败 | `1` |
| page | integer | 否 | 页码，从 1 起，缺省 1 | `1` |
| limit | integer | 否 | 每页条数，缺省 10 | `10` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/team/myList' \
  -H 'Content-Type: application/json' \
  -d '{"state":1,"page":1,"limit":10}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.rows[].member_id | integer | 成员行 ID（同一团多次参与会出现多行） |
| data.rows[].team_id | integer | 团 ID（「查看详情」跳团详情用它） |
| data.rows[].order_no | string | 我这一单的订单号 |
| data.rows[].price | number | 我这一份的实付单价（虚拟支付已换代币） |
| data.rows[].is_virtual_pay | integer | 1=虚拟支付（商品卡单位跟着它走） |
| data.rows[].status | integer | 我的成员行状态：0=待支付 / 1=待成团 / 2=已成团 / 3=已退款 / 4=已释放 |
| data.rows[].status_label | string | 成员状态文案，端上不写死 |
| data.rows[].is_leader | integer | 我是不是团长：1=是 |
| data.rows[].team_status | integer | 团状态：0=拼团中 / 1=已成团 / 2=已失败 / 3=已停止（读侧派生） |
| data.rows[].team_label | string | 团状态文案，端上不写死 |
| data.rows[].target_num | integer | 成团人数 |
| data.rows[].used_num | integer | 已占名额数（「还差 N 人」可用 target-used） |
| data.rows[].expire_time | integer | 团到期时刻（Unix 秒；0=不限时，显示「不限时」而不是空白） |
| data.rows[].goods_type | string | 商品大类（卡片按它选样式与落点） |
| data.rows[].goods_id | integer | 商品 ID |
| data.rows[].goods_name | string | 商品名（前端自己拼「（团长已选 XXL）」后缀） |
| data.rows[].goods_cover | string | 商品封面 |
| data.rows[].origin_price | number | 商品原价快照（划线价，只有高于 price 时才摆） |
| data.rows[].spec_id | integer | 团上快照的规格 ID |
| data.rows[].spec_text | string | 规格文案（卡片名下面那一行「买的是哪一档」） |
| data.rows[].joined_num | integer | 参与过的人数（含已退款，不含未支付/超时释放） |
| data.rows[].member_avatars | array | 已拼头像，最多 3 枚、团长在前 |
| data.total | integer | 符合条件（按 state 过滤后）的总条数 |
| data.has_more | boolean | 是否还有下一页 |

## 备注

- 需登录；state 筛的是我的成员行状态（1=待成团、2=已成团、3=[已退款,已释放]），不是团状态：两个状态轴（status / team_status）要分开摆
- team_status / team_label 是读侧派生：到时限还挂在拼团中的团按「已失败」下发，与团详情同一句判据，避免同一条团两屏说法不一
- 倒计时只对 team_status=0 的行跑，expire_time=0 是「不限时」，不能当成「早已过期」
- 「已拼 N 人」读 joined_num（参与过三档），不要用 used_num：失败团退款/释放会把 used_num 扣回去
- 分页收口 has_more = (page-1)*limit + 本页行数 < total；换页签时旧 total 要一起清
