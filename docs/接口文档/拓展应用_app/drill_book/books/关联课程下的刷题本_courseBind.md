# 关联课程下的刷题本

> 关联课程下的刷题本（课程详情页底栏「刷题本」入口与它的弹窗用） 与管理端「关联课程参与」同一份事实（关联表 ∪ 老单列，见 `BindCourse::bookIdsOfCourse`）： 课程页按本接口回的列表决定要不要出那一枚，与保存时选的是同一份事实，前端不另判一次。 只列**售卖方式=关联课程**的刷题本（2026-11-22 用户点名：其余档挂着课程也不产生随课权益， 摆出来等于把课程学员引到一扇打不开的门）。 多选之后一门课可能挂多本刷题本，本接口本来就是按课程反查的列表，口径不变。 出参形状与 `list()` 统一成 `{total, rows, has_more}`：弹窗列表要真分页（W13/M6 的列表口径）， 「已关联 N 个」读 `total` 而不是本页条数。此前这里回的是裸数组，调用方（课程互动栏）按 `data.rows` 取行，两端一起改，不留两种形状。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.drill_book.index.courseBind` |
| 接口地址 | `POST /api/app/drill_book/books/courseBind` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Books（我的刷题本（个人中心入口 / 分类列表）） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 否 | 课程ID | `0` |
| page | integer | 否 | 页码 | `1` |
| limit | integer | 否 | 每页数量 | `10` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/drill_book/books/courseBind' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":0,"page":1,"limit":10}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
