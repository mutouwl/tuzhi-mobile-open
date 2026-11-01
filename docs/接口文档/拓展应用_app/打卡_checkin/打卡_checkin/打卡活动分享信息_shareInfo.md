# 打卡活动分享信息

> 微信分享卡片用的标题、描述、封面与 H5 落地链接，由活动行与 share/Links 出链统一口径生成。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `checkin.checkin.shareInfo` |
| 接口地址 | `POST /api/app/checkin/checkin/shareInfo` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Checkin（打卡用户端接口（日历打卡 / 闯关打卡）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| checkin_id | integer | 是 | 打卡活动 ID | `628` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/checkin/checkin/shareInfo' \
  -H 'Content-Type: application/json' \
  -d '{"checkin_id":628}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1791344791",
  "data": {
    "title": "name",
    "cover": "https://tuzhi.mutouweb.com/uploads/20260924/1790238068591-1.png",
    "id": 628,
    "h5_link": "http://127.0.0.1:8099/index.php?i=1&route=#/pages/app/checkin/intro/intro?id=628"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.title | string | 标题 |
| data.cover | string | 封面图 |
| data.id | integer | ID |
| data.h5_link | string | 活动的 H5 分享落地链接 |

## 备注

- 封面未上传时下发空串，由前端分享导航栏回退站点 logo
