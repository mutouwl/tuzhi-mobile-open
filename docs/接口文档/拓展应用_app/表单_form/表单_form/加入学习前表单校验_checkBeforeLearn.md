# 加入学习前表单校验

> 用户获得课程权限后、进入学习前，检查是否还有「加入学习前表单」（bind_type=before_learn）未提交，未提交则前端拦截去填表单。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.form.checkBeforeLearn` |
| 接口地址 | `POST /api/app/form/form/checkBeforeLearn` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Form（表单） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| course_id | integer | 否 | 课程ID；为空不报错，直接返回 has_form=false / all_submitted=true | `0` |
| column_id | integer | 否 | 专栏ID；课程隶属专栏时，绑在专栏上的表单同样拦截其下课程（不传也能自动解析，传值作补充） | `0` |

## 请求示例

```bash
curl -X POST '{apiUrl}app/form/form/checkBeforeLearn' \
  -H 'Content-Type: application/json' \
  -d '{"course_id":0,"column_id":0}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1789980021",
  "data": {
    "has_form": false,
    "all_submitted": true,
    "forms": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.has_form | boolean | 是否存在需填写的加入学习前表单 |
| data.all_submitted | boolean | 现有表单是否已全部由当前用户提交（has_form=true 且存在未提交项时为 false） |
| data.forms | array | 表单清单（同一表单绑定多来源时已按 form_id 去重） |

## 备注

- 后端 $noNeedLogin 为空数组，实际需登录（未登录返回 code=401）；api_list.js 里注册为 auth:false 是前端有意为之——游客浏览课程详情时不弹登录框，仅在有 token 时自动携带
- 无错误分支：course_id 缺失也走成功返回，前端按 code==1 且 data.all_submitted 判定是否放行
- 匹配范围：课程绑定按 content_type ∈ {video,audio,article,column,live}（课程类商品同表存储、限类型防 ID 冲突），专栏绑定经 ColumnBind 反查并以显式 column_id 补充
- 只统计启用中（status=1）且 bind_type=before_learn 的表单；已结束（定量满额或定时过期）的表单自动剔除、不拦截
- 表单为付费插件能力：调用前需判断安装状态 \app\admin\library\project\App::isInstall('form')，未安装时不得调用
