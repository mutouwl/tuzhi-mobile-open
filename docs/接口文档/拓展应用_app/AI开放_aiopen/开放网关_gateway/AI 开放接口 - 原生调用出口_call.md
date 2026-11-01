# AI 开放接口 - 原生调用出口

> 用一枚 AI 访问令牌按操作名执行后台能力：action / params / dry_run 三个字段一问一答，统一回 code / msg / data。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/aiopen/gateway/call` |
| 接口地址 | `POST /api/app/aiopen/gateway/call` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gateway（AI 开放接口入口（免登录，凭 Bearer 令牌）） |
| 鉴权方式 | 请求头 `Authorization: Bearer <AI 令牌>`（后台创建，与用户 token 无关） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| action | string | 是 | 操作名，严格取自 ai.actions.list 的清单（区分大小写） | `course.get` |
| params | object | 否 | 该操作 inputSchema 的参数对象，未声明的键会被拒 | `{"id":123}` |
| dry_run | boolean | 否 | true=只预演不落库；上传类操作不支持预演 | `false` |

## 请求头

| Header | 说明 |
| --- | --- |
| Authorization | `Bearer <AI 令牌>`，令牌在后台「AI 开放接口-访问令牌」创建，明文只在创建时显示一次 |
| Content-Type | `application/json`；非 JSON 时按表单参数兜底，params 可传 JSON 串 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/aiopen/gateway/call' \
  -H 'Content-Type: application/json' \
  -d '{"action":"course.get","params":{"id":123},"dry_run":false}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 0=成功；401=令牌缺失/无效/撤销/停用/过期/IP 不在白名单；403=无权限；404=未知操作；400=参数或业务错；429=限流；500=服务错 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| code | string | 0=成功；401/403/404/400/429/500 见「返回参数说明」上方与备注 |
| msg | string | 成功恒为 "ok"；失败是一句能给人看的原因 |
| data | object|null | 目标操作自己的返回体；参数不合格时为 {"errors":[...]}；写操作漏传带默认值的参数时追加 defaults_applied + hint |
| data.errors | string | 参数校验失败时的完整错误清单（msg 只带前 12 条） |
| data.defaults_applied | string | 写操作漏传参数时后端自动补的默认值 |
| data.hint | string | 补默认值时给调用方的提示句 |

## 备注

- 入口不继承学员端 Api 基类：不读 token/cookie、不发任何 CORS 头（浏览器跨域不是使用场景），回体也没有 time 字段
- 凭据只认 Authorization: Bearer <令牌>（query/body 里带令牌一律当没有）；鉴权失败按 IP 封顶 30 次/分钟，令牌按 rate_limit 限流（默认 60 次/分钟）
- 令牌校验顺序：IP 封顶 → 令牌存在 → 未撤销/停用/过期 → IP 白名单 → 限流 → 必须已绑定管理员；任一不过都是 HTTP 200 + code=401/429（不是 HTTP 4xx）
- 授权按令牌绑定管理员的真实角色判（防提权）：没有该权限节点回 403；删除类操作还需令牌打开「允许删除」，否则同样 403
- 参数按 inputSchema 严格校验（未声明的键也拒），一次报全：msg 只带前 12 条，整份在 data.errors
- dry_run 是顶层布尔且按 !empty() 判真：传字符串 "false" 会被当成 true，只能传 JSON false
- 响应头固定 X-Content-Type-Options: nosniff / X-Frame-Options: DENY / Cache-Control: no-store；HTTP 状态码恒 200
