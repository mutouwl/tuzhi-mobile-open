# 拼团阶梯档价格表

> 按活动 ID 回一张纯价格表（档位 ID、成团人数、单价），供只需要「人越多越便宜」清单的场景使用。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/group_buy/activity/ladder` |
| 接口地址 | `POST /api/app/group_buy/activity/ladder` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Activity（拼团活动（学员端只读那一面：商详页拼团区 / 在线凑团 / 阶梯档）） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | integer | 是 | 活动 ID；<=0 或该活动没有档位行时回空数组 | `8204` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/activity/ladder' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":8204}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 档位数组（按 sort、invite_num 升序）；空数组不是错误 |
| data[].id | integer | 档位 ID（开团时当 ladder_id 交回） |
| data[].invite_num | integer | 这一档的成团人数 |
| data[].price | number | 这一档的单价（人民币原值，未换代币） |

## 备注

- 免登录；只做「读价」，不判活动状态、不判规格是否在售：非阶梯型活动或档位全被过滤时就是空数组
- 这一口不带 spec_id、也不做虚拟支付代币换算；多规格阶梯必须读 activity/detail 的 ladder[]（带 spec_id 且已换代币），两处口径不同不要混用
- 返回的是档位快照价，不是这一单实付价：实付仍以 team/open / team/calc 现算为准
- api_list.js 未登记、移动端当前无调用点（拼团区/弹层/横幅全部读 activity/detail 的 ladder[]），属仅接口存在的出口，新接入优先复用 detail 那一份
