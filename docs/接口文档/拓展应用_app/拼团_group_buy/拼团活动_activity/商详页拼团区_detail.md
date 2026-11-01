# 商详页拼团区

> 按商品定位「此刻进行中」或「最近一场开了预热」的拼团活动，一次下发活动摘要、规格价、阶梯档、玩法文案与我的团入口。没有活动时回 data=null（不是错误），商详页据此整段不渲染。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.activity.detail` |
| 接口地址 | `POST /api/app/group_buy/activity/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Activity（拼团活动（学员端只读那一面：商详页拼团区 / 在线凑团 / 阶梯档）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| goods_type | string | 是 | 商品大类，白名单 course/physical/exercises/checkin/circle/composite/vipcard/activity/school_package；不传按 course 处理，白名单外直接回 null | `course` |
| goods_id | integer | 是 | 商品 ID（课程/实物/活动/套餐各自主键） | `26020` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/activity/detail' \
  -H 'Content-Type: application/json' \
  -d '{"goods_type":"course","goods_id":26020}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 拼团区数据；null=该商品此刻没有可展示的拼团活动，商详页整段不渲染 |
| data.activity_id | integer | 拼团活动 ID，teams / open / calc / coupons 都吃它 |
| data.type | string | 活动类型：normal=普通拼团 / ladder=阶梯拼团 / invite=邀新拼团 |
| data.name | string | 活动名 |
| data.goods_type | string | 商品大类（原样回，端上据此选落地页与卡片样式） |
| data.goods_sub_type | string | 商品细分类型（图文/视频/直播等；存量行为空串） |
| data.goods_id | integer | 商品 ID |
| data.price | number | 展示价，多档时取最低一档；阶梯型取全部档位最小值 |
| data.price_max | number | 档位最高价（单档时与 price 相等） |
| data.price_text | string | 价区间文案（单档 9.90、多档 9.90~29.90），直接展示 |
| data.leader_price | number | 团长价（0=未配置） |
| data.origin_price | number | 商品原价区间的最高值（划线价） |
| data.origin_price_text | string | 原价区间文案（多档用 - 连接），无价回 - |
| data.team_num | integer | 成团人数（普通/邀新型） |
| data.invite_min | integer | 邀新型的「其中至少 N 名新用户」 |
| data.team_expire | integer | 团有效期（秒），开团时据此算 expire_time |
| data.simulate | integer | 是否开启模拟成团：1=开 0=关 |
| data.simulate_num | integer | 模拟成团门槛人数 |
| data.overflow | integer | 是否允许超员参团：1=允许 0=不允许 |
| data.show_teams | integer | 是否下发「正在拼团」那一区：1=有 0=无（预热态恒 0，端上据此不再发 activity/teams） |
| data.end_time | integer | 活动结束时刻（Unix 秒），跑「距结束」倒计时 |
| data.start_time | integer | 活动开始时刻（Unix 秒），预热态跑「距开始」倒计时 |
| data.state | string | running=进行中 / not_start=未开始但开了预热（端上按它切倒计时标签与底栏文案） |
| data.preheat | integer | 活动预热开关：1=开 0=关 |
| data.danmu | integer | 购买弹幕开关：1=开 0=关 |
| data.goods_name | string | 商品名 |
| data.goods_cover | string | 商品封面 |
| data.spec_type | string | multi=规格行多于一行 / single=单档 |
| data.has_spec | integer | 这件商品吃不吃「规格」：1=吃（实物/会员卡/线下活动/组合/教务套餐/圈子），0=不吃（不弹规格层） |
| data.spec_label | string | 规格栏标题词条（规格/时长/票种/套餐规格） |
| data.specs[].spec_id | integer | 规格 ID（已归一到商品当前 ID） |
| data.specs[].legacy_spec_id | integer | 活动里存的旧规格 ID（老链接/老团带的是它，两个都要认） |
| data.specs[].spec_text | string | 规格文案（尺码/时长/票种名） |
| data.specs[].price | number | 该档拼团价 |
| data.specs[].leader_price | number | 该档团长价 |
| data.specs[].origin_price | number | 该档商品原价（划线价） |
| data.specs[].sort | string | 排序值 |
| data.specs[].legacy | boolean | 是否老活动/不吃规格的合成行 |
| data.specs[].need_address | integer | 这一档下单要不要收货地址：1=要 0=不要（组合商品含实物子商品时为 1） |
| data.specs[].stock | string | 库存；-1=不限 |
| data.specs[].count_max | integer | 份数上限：0=不可买（售罄/限购用尽）/ 1=只能买一份（端上不摆步进器）/ >=2=步进器上限 |
| data.specs[].count_note | string | 限购说明（如「终身限购 2 件，已购 1 件」），空串=无 |
| data.order_extra.kind | string | 下单页要补的额外上下文：空=无 / activity=线下活动报名信息 / school=教务套餐校区与学生 |
| data.order_extra.activity_id | integer | kind=activity 时的活动（表单）ID |
| data.order_extra.package_id | integer | kind=school 时的套餐 ID |
| data.refund_rule | string | 「未成团时钱怎么走」半句（读 auto_refund 开关，关掉时不写「自动退款」） |
| data.rule_text | string | 拼团玩法整句（邀请 N 人参团 + 退款半句；阶梯/邀新各一版） |
| data.join_count | integer | 本场参与人数（占名额的成员行数；预热态恒 0） |
| data.my_team.team_id | integer | 我在这场进行中的团 ID（仅登录且非预热时下发；底栏入口据此改成「查看拼团详情」） |
| data.ladder[].id | integer | 阶梯档 ID（开团时当 ladder_id 交回） |
| data.ladder[].spec_id | integer | 该档归属的规格 ID（先选规格再列它的人数档） |
| data.ladder[].invite_num | integer | 这一档的成团人数 |
| data.ladder[].price | number | 这一档的单价（虚拟支付已换代币） |
| data.buyers[].nickname | string | 购买弹幕昵称（脱敏，首字+***） |
| data.buyers[].avatar | string | 购买弹幕头像（无头像为首字兜底图） |
| data.is_virtual_pay | integer | 1=微信小程序虚拟支付（顶层价格已换代币） |

## 备注

- 免登录；不带 token 只是不下发 my_team，其余照常
- 无活动、商品不吃拼团、规格一档都不在售：一律 data=null（HTTP 200 + code=1），不报错也不留占位
- 取参必须走 param()（合并 GET/POST/JSON body）：移动端全档 POST 且参数在 JSON body 里，只按查询串取会永远取空、回 null
- 同一件商品同一时刻只出一档：有进行中就出进行中，没有再找「开了预热且未开始」的那一场，两档不并存
- 价一律后端现算（price/price_text/origin_price_text/ladder[].price）：端上不许自己再拼区间、加「起」字或重算一遍
- specs[].price / leader_price / origin_price 不随虚拟支付换代币（只有顶层三枚与 ladder[].price 换了），端上不要把两者直接比大小
