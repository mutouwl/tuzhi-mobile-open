# 获取小程序学习入口

> 被拦在 H5/PC 的课程，返回小程序页面路径、小程序码图地址与商家提示语，供引导页渲染「前往小程序学习」。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `course.mpStudy.entry` |
| 接口地址 | `POST /api/course/mp_study/entry` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 课程（course） |
| 所属控制器 | MpStudy（小程序学习引导） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | integer | 是 | 课程 ID，缺省或 <=0 回「缺少课程ID」 | `123` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}course/mp_study/entry' \
  -H 'Content-Type: application/json' \
  -d '{"id":123}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.available | integer | 小程序是否已配置：1=可用（端上才出按钮/码），0=商家未完成配置 |
| data.path | string | 小程序页面路径，不带前导斜杠（pages/course/detail/detail?id=123）；available=0 时为空串 |
| data.qrcode | string | 小程序码图完整 URL（免登录 GET，直接给 <image src>）；available=0 时为空串 |
| data.tip | string | 商家自定义提示（如「请先在个人中心绑定手机号」），空串=端上整段不渲染 |

## 备注

- 需登录（用户 token 走请求头 token）；noNeedRight=*，不校验权限节点
- 只取素材、不判「要不要引导」：哪些课程需要引导由 course/course/detail 的 mp_study 与 order/order/getDetail 的 mp_study_entry 下发
- available=0 的唯一原因：后台「微信小程序」AppID/Secret 未填或被掩码；此时 path/qrcode 同为空串，端上改说「商家尚未完成小程序配置」
- 缺 id 或 id<=0：HTTP 200 + code=0 +「缺少课程ID」（不走 404）；不校验课程是否存在与类型
- tip 与 available 相互独立（没配小程序也可能有提示语）；端上时机是引导组件 mounted 调一次
