# 获取消息记录

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `user.message.list` |
| 接口地址 | `POST /api/user/message/getList` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 用户（user） |
| 所属控制器 | Message（消息通知） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| limit | integer | 否 | 每页数量 | `10` |
| page | integer | 否 | 页码 | `1` |

## 请求示例

```bash
curl -X POST '{apiUrl}user/message/getList' \
  -H 'Content-Type: application/json' \
  -d '{"limit":10,"page":1}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786508191",
  "data": [
    {
      "id": 5,
      "title": "122",
      "content": "<p>1</p>",
      "btn_text": "查看更多",
      "createtime": 1766019477,
      "status": 1,
      "link": {
        "type": "",
        "src": ""
      }
    },
    {
      "id": 4,
      "title": "测试标题肉毒注射",
      "content": "<p>测试内容</p>",
      "btn_text": "查看更多",
      "createtime": 1749699636,
      "status": 1,
      "link": {
        "type": "course",
        "src": 111,
        "selected": "course",
        "name": "圆明园的四十景"
      }
    },
    {
      "id": 2,
      "title": "测试管理员日志",
      "content": "<p>测试管理员日志</p>",
      "btn_text": "查看更多",
      "createtime": 1703208419,
      "status": 1,
      "link": {
        "type": "",
        "src": ""
      }
    },
    {
      "id": 1,
      "title": "兔知云课堂出独立版了",
      "content": "<p>兔知云课堂出独立版了</p><p><br></p><p><img src=\"https://tuzistudy.oss-cn-beijing.aliyuncs.com/uploads/20240402/1076657288a7fda5f6e29c013625fc5a.png\" alt=\"\" data-href=\"\" style=\"\"/></p>",
      "btn_text": "查看更多",
      "createtime": 1691206500,
      "status": 1,
      "link": {
        "type": "page_system",
        "src": "/pages/public/diy/diy?id=",
        "selected": "page_system",
        "name": "首页"
      }
    }
  ]
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data[].id | integer | ID |
| data[].title | string | 标题 |
| data[].content | string | 内容 |
| data[].btn_text | string | btntext |
| data[].createtime | integer | 创建时间（时间戳） |
| data[].status | integer | 状态 |
| data[].link | object | link |
| data[].link.type | string | 类型 |
| data[].link.src | string | 资源地址 |
