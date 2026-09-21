# 提交课包订单

> 教务套餐的独立下单入口：创建待支付的课包订单（order_type=school_package），支付由系统统一支付完成。

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app/school/order/submit` |
| 接口地址 | `POST /api/app/school/order/submit` |
| 请求方式 | POST |
| 是否需登录 | 是 |
| 所属模块 | 拓展应用（app） |
| 所属控制器 | Order（教务-课程套餐订单（移动端，需登录）） |
| 登录方式 | 请求头携带 `token`（登录接口返回） |
| 来源 | 后端控制器（未在 mobile `api_list.js` 中定义） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| sku_id | integer | 是 | 课包规格ID | `79` |
| student_id | integer | 是 | 报名学生ID（须为本人名下学生） | `3619` |
| campus_id | integer | 否 | 校区ID | `0` |

## 请求头

| Header | 说明 |
| --- | --- |
| token | 用户登录凭证，登录成功后由 `user/info/login` 返回，前端自动携带 |

## 请求示例

```bash
curl -X POST '{apiUrl}app/school/order/submit' \
  -H 'Content-Type: application/json' \
  -d '{"sku_id":79,"student_id":3619,"campus_id":0}'
```

## 返回示例

> 暂无真实返回数据。

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.order_no | string | 订单号（用于拉起支付与查询订单详情） |
| data.real_price | number | 实付金额 |

## 备注

- 移动端确认订单页以 type=school_package 走系统统一订单接口下单，本接口未在 api_list.js 注册（来源：后端控制器）
- 售罄、超出限购、学生不属于本人等业务失败由 OrderService::createOrder 抛出，以 code=0 返回具体提示
- 下单后需调用支付接口（pay/getPayType 取渠道、pay/handle 拉起支付）
