# 拼团活动访客埋点

> 商详页进屏时上报一次访问，用于后台数据页的「访客数 / 访问次数 / 分享访客数」；未登录访客用本地固定串区分。埋点失败不影响购买链，这一发永远回成功。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `group_buy.activity.visit` |
| 接口地址 | `POST /api/app/group_buy/activity/visit` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Activity（拼团活动（学员端只读那一面：商详页拼团区 / 在线凑团 / 阶梯档）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| activity_id | integer | 是 | 活动 ID；<=0 或活动不存在/已删除时静默跳过，仍回成功 | `8204` |
| visitor | string | 否 | 未登录访客的本地固定串（端上生成后持久化），超过 64 字符服务端截断；登录用户可传空 | `gmf3k2a9x1q7` |
| share | integer | 否 | 受邀链接上的邀请人 user_id，>0 时这一次访问记为分享访客；缺省 0 | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/group_buy/activity/visit' \
  -H 'Content-Type: application/json' \
  -d '{"activity_id":8204,"visitor":"gmf3k2a9x1q7","share":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 恒为 null（这一发没有业务回体，端上只看 code） |

## 备注

- 免登录：未登录访客也要计入访问数；visitor 为空且未登录时后端直接不落行，接口仍回成功
- Visit::record() 内部吞异常，本口无条件回「获取成功」——端上不要为这一发写失败重试或错误提示
- 去重窗口 30 分钟：同一访客（登录按 user_id、未登录按 visitor）对同一活动 30 分钟内只记一次，来回切页不会把访问次数刷爆
- 只校验「活动存在且未删除」，不看活动状态（已结束的仍记一行）；分享归因只认 share>0，且 share 是邀请人 user_id、不是团 ID
