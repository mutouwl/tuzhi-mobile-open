# 获取表单详情

> 当指定 log_id 时的处理

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.form.detail` |
| 接口地址 | `POST /api/app/form/form/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Form（表单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | - |
| log_id | string | 否 | 记录ID | `16` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/form/form/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":"xxx","log_id":16}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508213",
  "data": {
    "form": {
      "id": 30,
      "uniacid": 1,
      "name": "客户信息收集",
      "can_modify": 0,
      "allow_multiple": 0,
      "end_condition": 1,
      "target_count": 100,
      "complete_message": "问卷收集已结束",
      "time_limit_type": 0,
      "end_time": 0,
      "share_title": "请填写反馈意见",
      "share_desc": "期待你的宝贵建议，帮助我们改进产品",
      "share_cover": "",
      "bind_type": "before_buy",
      "status": 1,
      "createtime": 1781702189,
      "end_time_text": "1970-01-01 08:00:00",
      "bind_type_text": "Bind_type before_buy",
      "status_text": "Status 1",
      "is_recycle": false,
      "content_list": [
        {
          "id": 316,
          "name": "羽毛球课程",
          "cover": "https://tuzhi.mutouweb.com/uploads/1/20260613/c0f98523b11b3c70b73401d81cc4533c.jpeg",
          "createtime": 1782010866,
          "views": "9",
          "type": "column",
          "status": 1,
          "sales": 0,
          "hide": "0",
          "sales_type": "[\"alone\"]",
          "briefing": "",
          "uniacid": 1,
          "price": "0.00",
          "pay_type": "free"
        }
      ],
      "page": {
        "diyColor": "#fff",
        "bgColor": "default",
        "name": "客户信息收集",
        "status": 1,
        "banner_bg_img": "",
        "banner_desc": "",
        "banner_show": 1
      },
      "components": [
        {
          "type": "input",
          "remark": "",
          "name": "单行文本框",
          "config": {
            "desc": "",
            "maxlength": 50,
            "title": "姓名",
            "title_desc": "请输入你的姓名",
            "title_show": 1,
            "required": 1,
            "id": "5v7isgm4ae"
          }
        },
        {
          "type": "input",
          "remark": "",
          "name": "单行文本框",
          "config": {
            "desc": "",
            "maxlength": 50,
            "title": "年龄",
            "title_desc": "表单描述",
            "title_show": 1,
            "required": 1,
            "id": "ggdxe6m9ee"
          }
        },
        {
          "type": "divider",
          "remark": "",
          "name": "分隔",
          "config": {
            "bgColor": "#f5f5f5",
            "padding": 0,
            "margin": 0,
            "round": 0,
            "height": 10,
            "title": "表单名称",
            "title_desc": "表单描述",
            "title_show": 1,
            "required": 1,
            "id": "785f959epi"
          }
        },
        {
          "type": "input",
          "remark": "",
          "name": "单行文本框",
          "config": {
            "desc": "",
            "maxlength": 50,
            "title": "性别",
            "title_desc": "表单描述",
            "title_show": 1,
            "required": 1,
            "id": "l6mh5y85ef"
          }
        },
        {
          "type": "input",
          "remark": "",
          "name": "单行文本框",
          "config": {
            "desc": "",
            "maxlength": 50,
            "title": "手机号",
            "title_desc": "表单描述",
            "title_show": 1,
            "required": 1,
            "id": "keyqyej22f"
          }
        }
      ]
    },
    "value": {
      "ggdxe6m9ee": "234"
    },
    "status_info": {
      "is_end": false,
      "can_submit": true,
      "can_modify": true,
      "can_resubmit": true,
      "is_submitted": true,
      "is_auth": true,
      "message": "修改"
    }
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.form | object | 表单 |
| data.form.id | integer | ID |
| data.form.uniacid | integer | 应用ID（公众号/uniacid） |
| data.form.name | string | 名称 |
| data.form.can_modify | integer | 是否可modify |
| data.form.allow_multiple | integer | allowmultiple |
| data.form.end_condition | integer | end条件 |
| data.form.target_count | integer | target数量 |
| data.form.complete_message | string | complete消息 |
| data.form.time_limit_type | integer | 时间limit类型 |
| data.form.end_time | integer | 结束时间 |
| data.form.share_title | string | 分享标题 |
| data.form.share_desc | string | 分享描述 |
| data.form.share_cover | string | 分享封面图 |
| data.form.bind_type | string | 绑定类型 |
| data.form.status | integer | 状态 |
| data.form.createtime | integer | 创建时间（时间戳） |
| data.form.end_time_text | string | end时间text |
| data.form.bind_type_text | string | 绑定类型text |
| data.form.status_text | string | 状态说明 |
| data.form.is_recycle | boolean | 是否recycle |
| data.form.content_list | array | 内容列表 |
| data.form.content_list[].id | integer | ID |
| data.form.content_list[].name | string | 名称 |
| data.form.content_list[].cover | string | 封面图 |
| data.form.content_list[].createtime | integer | 创建时间（时间戳） |
| data.form.content_list[].views | string | 浏览量 |
| data.form.content_list[].type | string | 类型 |
| data.form.content_list[].status | integer | 状态 |
| data.form.content_list[].sales | integer | 销量 |
| data.form.content_list[].hide | string | 是否隐藏 |
| data.form.content_list[].sales_type | string | 销售方式 |
| data.form.content_list[].briefing | string | 简介 |
| data.form.content_list[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.form.content_list[].price | string | 价格 |
| data.form.content_list[].pay_type | string | 支付类型 |
| data.form.page | object | 页码 |
| data.form.page.diyColor | string | diy颜色 |
| data.form.page.bgColor | string | bg颜色 |
| data.form.page.name | string | 名称 |
| data.form.page.status | integer | 状态 |
| data.form.page.banner_bg_img | string | 轮播图bg图片 |
| data.form.page.banner_desc | string | 轮播图描述 |
| data.form.page.banner_show | integer | 轮播图show |
| data.form.components | array | components |
| data.form.components[].type | string | 类型 |
| data.form.components[].remark | string | 备注 |
| data.form.components[].name | string | 名称 |
| data.form.components[].config | object | 配置 |
| data.form.components[].config.desc | string | 描述 |
| data.form.components[].config.maxlength | integer | maxlength |
| data.form.components[].config.title | string | 标题 |
| data.form.components[].config.title_desc | string | 标题描述 |
| data.form.components[].config.title_show | integer | 标题show |
| data.form.components[].config.required | integer | 是否必填 |
| data.form.components[].config.id | string | ID |
| data.value | object | 值 |
| data.value.ggdxe6m9ee | string | ggdxe6m9ee |
| data.status_info | object | 状态信息 |
| data.status_info.is_end | boolean | 是否end |
| data.status_info.can_submit | boolean | 是否可提交 |
| data.status_info.can_modify | boolean | 是否可modify |
| data.status_info.can_resubmit | boolean | 是否可resubmit |
| data.status_info.is_submitted | boolean | 是否submitted |
| data.status_info.is_auth | boolean | 是否鉴权 |
| data.status_info.message | string | 消息 |
