# 邀请归因上报

> 受邀人进入直播页时调一次，把 share 参数里的邀请人记成这一场的归因；幂等由唯一键保证。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `invite_rank.rank.report` |
| 接口地址 | `POST /api/app/invite_rank/rank/report` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Rank（邀请达人榜（学员端）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 是 | 直播课程（直播间）ID | - |
| share | integer | 否 | 邀请人用户 ID，来自分享链接上的 share 参数（出链已由 share_id 改名为 share） | - |
| source | string | 否 | 归因来源：link=分享链接（缺省）等 | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/invite_rank/rank/report' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":"xxx","share":"xxx","source":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 上报结果 |
| data.counted | string | 本次是否已计入邀请人数 |

## 备注

- 未登录到达直接回 counted=false 且不报错，避免 401 让前端把 storage 里的 share 参数白存一次
- 失败一律静默：不在界面上弹「归因失败」
