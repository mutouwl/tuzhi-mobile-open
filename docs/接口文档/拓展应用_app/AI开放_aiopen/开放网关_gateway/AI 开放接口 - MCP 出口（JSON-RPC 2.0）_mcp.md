# AI 开放接口 - MCP 出口（JSON-RPC 2.0）

> 把同一份操作注册表按 Model Context Protocol 暴露：单路径 POST 一问一答，支持 initialize / tools/list / tools/call / ping / notifications。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/aiopen/gateway/mcp` |
| 接口地址 | `POST /api/app/aiopen/gateway/mcp` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gateway（AI 开放接口入口（免登录，凭 Bearer 令牌）） |
| 鉴权方式 | 请求头 `Authorization: Bearer <AI 令牌>`（后台创建，与用户 token 无关） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| jsonrpc | string | 是 | 恒为 "2.0" | `2.0` |
| id | number\|string | 否 | 请求 ID，原样回显；不带 ID 视为通知 | `1` |
| method | string | 是 | initialize / notifications/initialized / notifications/cancelled / ping / tools/list / tools/call | `tools/list` |
| params | object | 否 | 按方法取：tools/call 用 {name, arguments}，arguments 就是目标操作的参数对象 | `{"name":"ai.actions.list","arguments":{}}` |

## 请求头

| Header | 说明 |
| --- | --- |
| Authorization | `Bearer <AI 令牌>`；initialize 与 ping 不校验，tools/list、tools/call 必须带 |
| Content-Type | `application/json`（服务端直接读原始体，缺头也能解析） |
| MCP-Protocol-Version | `2025-03-26`（缺省）/ `2025-06-18`，其他值 → HTTP 400 空体 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/aiopen/gateway/mcp' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <AI 令牌>' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| jsonrpc | string | 恒为 "2.0" |
| id | number|string|null | 回显请求 ID（通知类为 null） |
| result.protocolVersion | string | 协商出的协议版本（initialize） |
| result.serverInfo | object | 服务信息 {name, title, version}（initialize） |
| result.instructions | string | 服务使用说明（initialize） |
| result.tools[].name | string | 工具名（tools/list） |
| result.tools[].inputSchema | object | 该工具的入参 JSON Schema |
| result.tools[].outputSchema | object | 该工具的出参 JSON Schema（有才给） |
| result.tools[].annotations | object | 工具注解（readOnlyHint / destructiveHint / idempotentHint） |
| result.content[] | array | tools/call 的结果内容数组，元素形如 {type:"text", text:"..."} |
| result.content[].text | string | tools/call 的结果：JSON 字符串（内含 {code,msg,data}），不是对象 |
| result.structuredContent | object | 目标操作的 data 原样；data 不是对象时包成 {"data":...} |
| result.isError | boolean | true=目标操作 code!=0（错误在 result 里，不是 JSON-RPC error） |
| error.code | integer | -32700 体不是合法 JSON / -32600 批量请求 / -32601 未知方法 / -32602 tools/call 缺 name / -32001 令牌无效（仅 tools/list） |
| error.message | string | 错误说明 |

## 备注

- Streamable HTTP 的「单路径 POST 一问一答」档：只回 application/json，不实现 SSE/长连接，GET 不适用
- HTTP 状态码与普通接口不同：200=带 JSON-RPC 体；202=通知类请求（空体）；400=MCP-Protocol-Version 不被支持（空体）。协议层错误一律 HTTP 200 + error 对象
- 鉴权差异：initialize/ping 免令牌；tools/list 无令牌回 JSON-RPC 错误码 -32001；tools/call 无令牌或令牌无效时仍回 HTTP 200，结果里 isError=true、正文是网关的 code=401 回体
- tools/list 只给 3 枚元工具（ai.actions.list / ai.action.detail / ai.action.call），体积与操作总数无关；不支持 cursor 分页，也没有 list_changed 通知
- tools/call 的 dry_run 放在 arguments 里，会被摘出来当预演开关（ai.action.call 除外，它自己消费内层 dry_run）
- 文件类操作（media.image_upload、order.ship_batch_import）在 MCP 通道传不了文件，必须走 gateway/media；批量请求（顶层数组）直接拒 -32600
