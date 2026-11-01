# 小程序码图片（PNG 图片流）

> 把当前课程的小程序码以 PNG 二进制直接吐给 <image src>：免登录、可被浏览器缓存，出不来就 404 由前端兜底。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course/mp_study/code` |
| 接口地址 | `GET /api/course/mp_study/code` |
| 请求方式 | GET |
| 是否需登录 | 否 |
| 所属模块 | 课程（course） |
| 所属控制器 | MpStudy（小程序学习引导） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 课程 ID，缺省或 <=0 直接 404 | `123` |

## 请求示例

```bash
curl -X GET '{apiUrl}course/mp_study/code?id=123' -o code.png
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| HTTP 200 响应体 | string | PNG 图片二进制（Content-Type: image/png；Cache-Control: public, max-age=86400） |
| HTTP 404 响应体 | string | 空响应体（Content-Type: text/plain），无 code/msg/data，调用方只能按状态码分支 |

## 备注

- 免登录：<image> 带不了 token，故本方法是 MpStudy 里唯一的免登录口（entry/urllink 仍要登录）
- 404 的成因：id 缺失/<=0、小程序未配置、微信出码失败；端上 <image @error> 后改成「小程序码生成失败，请在微信中搜索小程序「店铺名」」
- 服务端另有一层按课程的 7 天缓存与 60 秒失败负缓存；本接口没有强制刷新参数
- 码内编码的是 scene=id=123、落点 pages/course/detail/detail（小程序端 parseScene 解出 id），与 entry 的 path（?id= 形态）不是同一写法
- 只校验 id>0、不校验课程是否存在：暴露面仅「该课的小程序码」，不含学员身份
- 仍受 api 模块基类前置校验：店铺关闭/平台未开启时返回的是 JSON 错误体（HTTP 200），<image> 加载失败后同样走 @error 兜底
