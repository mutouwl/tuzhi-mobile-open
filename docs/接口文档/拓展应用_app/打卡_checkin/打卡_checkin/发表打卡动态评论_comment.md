# 发表打卡动态评论

> 闸门顺序固定：活动收不收评论 → 动态存在 → 参与资格（含拉黑）→ 可见性 → 被回复评论，文案不合并。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.comment` |
| 接口地址 | `POST /api/app/checkin/checkin/comment` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | - |
| record_id | integer | 是 | 被评论的动态 ID | - |
| content | string | 是 | 评论内容，1-500 字 | - |
| parent_id | integer | 否 | 被回复的评论 ID，0=直接评论动态 | - |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/comment' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":"xxx","record_id":"xxx","content":"xxx","parent_id":"xxx"}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data | string | 新评论标识 |
| data.id | integer | 新评论 ID |

## 备注

- 商家关闭评论总闸时先回「本活动已关闭评论」；管理员点评走后台接口，不受这一档影响
