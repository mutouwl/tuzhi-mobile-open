# AI 开放接口 - 文件上传出口（multipart）

> 收 multipart 文件的唯一出口：图片上传与发货表建批；动作名走表单/查询串的 action，文件字段固定 file。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/aiopen/gateway/media` |
| 接口地址 | `POST /api/app/aiopen/gateway/media` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Gateway（AI 开放接口入口（免登录，凭 Bearer 令牌）） |
| 鉴权方式 | 请求头 `Authorization: Bearer <AI 令牌>`（后台创建，与用户 token 无关） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| action | string | 是 | media.image_upload（图片上传）/ order.ship_batch_import（发货表建批），可放表单字段或查询串 | `media.image_upload` |
| file | file | 是 | 固定字段名 file；图片 jpg/jpeg/png/gif/webp/bmp、表格 csv/xls/xlsx | `@cover.png` |
| params | string\|array | 否 | 业务参数整包（JSON 串或 params[name] 数组），也可按字段名单键平铺 | `attachment_group=1` |
| dry_run | string | 否 | 1/0（空串、0、false、no 视为假）；这两个动作不支持预演 | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| Authorization | `Bearer <AI 令牌>`（与原生调用出口同一套令牌） |
| Content-Type | `multipart/form-data` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/aiopen/gateway/media?action=media.image_upload' \
  -H 'Authorization: Bearer <AI 令牌>' \
  -F 'file=@cover.png' \
  -F 'attachment_group=1'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | media.image_upload 回：附件 ID |
| data.url | string | media.image_upload 回：相对地址 |
| data.full_url | string | media.image_upload 回：完整访问地址 |
| data.filesize | string | media.image_upload 回：文件字节数 |
| data.batch_id | integer | order.ship_batch_import 回：批次 ID（用它轮询 order.ship_batch_status） |
| data.total | integer | order.ship_batch_import 回：本批行数 |
| data.next | string | order.ship_batch_import 回：下一步动作提示 |
| data.defaults_applied | string | 写操作漏传参数时后端自动补的默认值 |
| data.hint | string | 补默认值时给调用方的提示句 |

## 备注

- JSON 入口（gateway/call）既不收文件也不收 base64，上传必须走这条
- 参数来源：action 与业务参数从表单/查询串合并后的 param() 里取；三种写法都认（action 在查询串、params 传 JSON 串或 params[key]、业务参数单键平铺）
- 扩展名白名单在一切业务判断之前：只放 jpg/jpeg/png/gif/webp/bmp/csv/xls/xlsx；代码/脚本/压缩包/网页一律 400，并提示改走后台「附件管理」
- media.image_upload 还要 getimagesize 认出是真图，落库归属改回令牌绑定的管理员，可带 attachment_group
- order.ship_batch_import 只建批返回 batch_id（≤5MB、≤5000 行），终态用 order.ship_batch_status 轮询；物理发货插件未装时该 action 是 404 +「未安装」提示
- 令牌、限流、权限节点、「允许删除」、响应头（nosniff / X-Frame-Options: DENY / Cache-Control: no-store，无 CORS）与原生调用出口一致，HTTP 状态码同样恒 200
