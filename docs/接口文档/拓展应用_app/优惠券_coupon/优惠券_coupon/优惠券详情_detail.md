# 优惠券详情

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `app.coupon.detail` |
| 接口地址 | `POST /api/app/coupon/coupon/detail` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 拓展应用（app） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| id | string | 否 | ID | `14` |
| ucid | string | 否 | ucid | - |

## 请求示例

```bash
curl -X POST '{apiUrl}app/coupon/coupon/detail' \
  -H 'Content-Type: application/json' \
  -d '{"id":14,"ucid":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "优惠券详情",
  "time": "1786508206",
  "data": {
    "id": 14,
    "uniacid": 1,
    "name": "12313",
    "type": "reduce",
    "use_scope": "all_use",
    "goods": [
      {
        "id": 423,
        "name": "__circle_showcase_count_test__",
        "cover": null,
        "createtime": 1785419585,
        "views": "0",
        "type": "video",
        "status": 1,
        "sales": 0,
        "hide": null,
        "sales_type": null,
        "briefing": null,
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 422,
        "name": "__circle_showcase_count_test__",
        "cover": null,
        "createtime": 1785419517,
        "views": "0",
        "type": "video",
        "status": 1,
        "sales": 0,
        "hide": null,
        "sales_type": null,
        "briefing": null,
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 420,
        "name": "55666666666333333",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260730/e16476aadf780e297d93cf3c840d5d0f.jpg",
        "createtime": 1785410608,
        "views": "4",
        "type": "column",
        "status": 1,
        "sales": 0,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "123",
        "uniacid": 1,
        "price": "88.00",
        "pay_type": "pay"
      },
      {
        "id": 419,
        "name": "健康管理2",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
        "createtime": 1785235491,
        "views": "32",
        "type": "article",
        "status": 1,
        "sales": 5,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "健康管理",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 418,
        "name": "健康管理1",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
        "createtime": 1785235474,
        "views": "9",
        "type": "article",
        "status": 1,
        "sales": 3,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "健康管理",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 417,
        "name": "健康管理",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260720/5b67fabd7ece549dcd890f4ae9d8c2bc.jpg",
        "createtime": 1785217206,
        "views": "18",
        "type": "article",
        "status": 1,
        "sales": 2,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "健康管理",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 325,
        "name": "测试课程",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260616/3cd1f6398ddc48ab334a442e4898f6d1.png",
        "createtime": 1782823400,
        "views": "5",
        "type": "video",
        "status": 1,
        "sales": 1,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "这是课程的介绍",
        "uniacid": 1,
        "price": "0.20",
        "pay_type": "pay"
      },
      {
        "id": 317,
        "name": "外贸社媒全流程线上课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260616/3cd1f6398ddc48ab334a442e4898f6d1.png",
        "createtime": 1782115934,
        "views": "18",
        "type": "column",
        "status": 1,
        "sales": 0,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "专线网络搭建，Tik Tok注册下载",
        "uniacid": 1,
        "price": "3980.00",
        "pay_type": "pay"
      },
      {
        "id": 306,
        "name": "测试",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260529/3e8a1d523fa3174394fb472e829c38a4.jpg",
        "createtime": 1780927326,
        "views": "29",
        "type": "column",
        "status": 1,
        "sales": 6,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 301,
        "name": "cs",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260428/7c2fc541a5700d7b38c8ebd79c4380bb.png",
        "createtime": 1778549734,
        "views": "35",
        "type": "video",
        "status": 1,
        "sales": 0,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "cs",
        "uniacid": 1,
        "price": "0.00",
        "pay_type": "pay"
      },
      {
        "id": 299,
        "name": "qwqw",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
        "createtime": 1778146885,
        "views": "18",
        "type": "column",
        "status": 1,
        "sales": 8,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "1212",
        "uniacid": 1,
        "price": "7.00",
        "pay_type": "pay"
      },
      {
        "id": 298,
        "name": "121",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/c808b6bf4f6f46b36e754830d4556e83.jpg",
        "createtime": 1778146794,
        "views": "6",
        "type": "article",
        "status": 1,
        "sales": 0,
        "hide": "1",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "1212",
        "uniacid": 1,
        "price": "11.00",
        "pay_type": "pay"
      },
      {
        "id": 296,
        "name": "测试",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
        "createtime": 1776668459,
        "views": "57",
        "type": "column",
        "status": 1,
        "sales": 15,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "111",
        "uniacid": 1,
        "price": "0.30",
        "pay_type": "pay"
      },
      {
        "id": 293,
        "name": "123",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260116/42389cccb28d65ada8690a99c7eb67b5.png",
        "createtime": 1772260819,
        "views": "51",
        "type": "article",
        "status": 1,
        "sales": 2,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "123",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 285,
        "name": "测试图文",
        "cover": "https://tuzhi.mutouweb.com3",
        "createtime": 1768529357,
        "views": "3",
        "type": "article",
        "status": 1,
        "sales": 0,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "测试",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 282,
        "name": "兰兰小课",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260110/f3a4d11a8588e2684fd31a7bfd1d696c.jpeg",
        "createtime": 1768014551,
        "views": "45",
        "type": "video",
        "status": 1,
        "sales": 3,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "兰兰报表",
        "uniacid": 1,
        "price": "0.01",
        "pay_type": "pay"
      },
      {
        "id": 278,
        "name": "马斯克授课专区",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
        "createtime": 1766420021,
        "views": "417",
        "type": "column",
        "status": 1,
        "sales": 16,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "马斯克授课专区简介",
        "uniacid": 1,
        "price": "398.00",
        "pay_type": "pay"
      },
      {
        "id": 243,
        "name": "嘻嘻付费测试",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250908/9686fa51275d259a90fd6052acf7a42b.jpg",
        "createtime": 1757483472,
        "views": "131",
        "type": "article",
        "status": 1,
        "sales": 5,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "嘻嘻付费测试",
        "uniacid": 1,
        "price": "99.00",
        "pay_type": "pay"
      },
      {
        "id": 238,
        "name": "必美立测试直播1",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250814/fd012e874897686df260cce5dc3a784c.jpg",
        "createtime": 1755507650,
        "views": "40",
        "type": "article",
        "status": 1,
        "sales": 0,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 222,
        "name": "小燕子音频",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250718/8483ce2182efaf5518129a0e71de2ece.png",
        "createtime": 1753344880,
        "views": "10013",
        "type": "audio",
        "status": 1,
        "sales": 0,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "测试测试",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 214,
        "name": "小燕子视频1",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250707/7bc58d0d4f208bfd4459703820a53c4a.jpg",
        "createtime": 1752136482,
        "views": "222",
        "type": "video",
        "status": 1,
        "sales": 3,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "的点点滴滴的点点滴滴",
        "uniacid": 1,
        "price": "1099.00",
        "pay_type": "pay"
      },
      {
        "id": 201,
        "name": "非遗1",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250628/f42851089b8ff473c49d37ff72af3fb9.png",
        "createtime": 1751177341,
        "views": "135",
        "type": "video",
        "status": 1,
        "sales": 0,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "12",
        "uniacid": 1,
        "price": "99.00",
        "pay_type": "pay"
      },
      {
        "id": 189,
        "name": "象限交易~稳赢技巧",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250704/0b4485406a66fff9b907f233272c8b3a.jpg",
        "createtime": 1747280403,
        "views": "782",
        "type": "video",
        "status": 1,
        "sales": 13,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "只为学员供应，需要下单购买产品才能成为我的会员，我只教会我的学员。",
        "uniacid": 1,
        "price": "9.90",
        "pay_type": "pay"
      },
      {
        "id": 142,
        "name": "k12 学习工具的3个产品原则",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/f61a95907b27e0e9c7ae7c0dbab4c595.png",
        "createtime": 1742809856,
        "views": "137",
        "type": "article",
        "status": 1,
        "sales": 2,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "本文希望通过梳理、分析k12用户的用户价值，基于教育行业的背景，来聊一聊学习工具产品设计的一些原则。",
        "uniacid": 1,
        "price": "9.90",
        "pay_type": "pay"
      },
      {
        "id": 100,
        "name": "新的直播鹅考",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/23fa90ae64b75d84068a9dbbf9ced502.png",
        "createtime": 1724994812,
        "views": "1097",
        "type": "live",
        "status": 1,
        "sales": 20,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "",
        "uniacid": 1,
        "price": "10.00",
        "pay_type": "pay"
      },
      {
        "id": 70,
        "name": "[测试]遇言·不止CEO席越：女性在职场中的自我成长",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20240118/15d615056bd04820a0157a8088f1a9e3.jpeg",
        "createtime": 1705551195,
        "views": "1049",
        "type": "audio",
        "status": 1,
        "sales": 38,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "密码：123",
        "uniacid": 1,
        "price": "10.00",
        "pay_type": "pay"
      },
      {
        "id": 33,
        "name": "[演示]技术产品的产品经理是如何炼成的",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/57a1f0afb73cf9225ae3ad8ef2bc3af0.png",
        "createtime": 1701134891,
        "views": "697",
        "type": "audio",
        "status": 1,
        "sales": 11,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "",
        "uniacid": 1,
        "price": "0.10",
        "pay_type": "pay"
      },
      {
        "id": 31,
        "name": "[演示]樊登：如何打造0到50亿的社群增长",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250506/57a1f0afb73cf9225ae3ad8ef2bc3af0.png",
        "createtime": 1700620776,
        "views": "563",
        "type": "live",
        "status": 1,
        "sales": 17,
        "hide": "0",
        "sales_type": "[\"alone\",\"column\"]",
        "briefing": "樊登：如何打造0到50亿的社群增长",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 28,
        "name": "[演示]考纲词汇及词法第一讲11",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20231228/a54db2cf7076b038cdb5f571d5f9b35d.png",
        "createtime": 1700309115,
        "views": "1322",
        "type": "video",
        "status": 1,
        "sales": 17,
        "hide": "0",
        "sales_type": "[\"alone\"]",
        "briefing": "",
        "uniacid": 1,
        "price": "0.10",
        "pay_type": "pay"
      },
      {
        "id": 12,
        "name": "测试",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
        "createtime": 1778018524,
        "views": "8",
        "type": "activity",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "0.00",
        "pay_type": "pay"
      },
      {
        "id": 11,
        "name": "啊啊",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20251229/306d4c8157c1974eb6b8ea20d80ed7e0.jpeg",
        "createtime": 1767837848,
        "views": "17",
        "type": "activity",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "0.00",
        "pay_type": "pay"
      },
      {
        "id": 10,
        "name": "S2集训营",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250628/e059be108db69f07cc1396a8dc4cb751.png",
        "createtime": 1751176454,
        "views": "44",
        "type": "activity",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "0.00",
        "pay_type": "pay"
      },
      {
        "id": 9,
        "name": "马到成功大聚会",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20250525/c01f8bfc2a3bf088c4cebe2cfe9fdbbb.jpeg",
        "createtime": 1750043114,
        "views": "181",
        "type": "activity",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "0.01",
        "pay_type": "pay"
      },
      {
        "id": 7,
        "name": "免费权益",
        "cover": "https://tuzhi.mutouweb.com/assets/image/vip.png",
        "createtime": 1781342831,
        "views": "0",
        "type": "vipcard",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": "",
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 5,
        "name": "未绑定分组的题目",
        "cover": "https://tuzhi.mutouweb.com//uploads/1/20231228/cab004734f2b40cfeda64e9e88e5f448.png",
        "createtime": 1733316265,
        "views": "561",
        "type": "exercises",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "2",
        "briefing": null,
        "uniacid": 1,
        "price": "20.00",
        "pay_type": "pay"
      },
      {
        "id": 3,
        "name": "平安扣",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260810/7631976f7173f433740831e0f426a134.jpg",
        "createtime": 1786365011,
        "views": "0",
        "type": "physical",
        "status": 1,
        "sales": null,
        "hide": "is_hide",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "300.00",
        "pay_type": "pay"
      },
      {
        "id": 3,
        "name": "名称",
        "cover": "http://selfbuilt.cn/uploads/1/20260531/395826a3e28838ecd43b3bdf54fe6746.png",
        "createtime": 1781591227,
        "views": "53",
        "type": "composite",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "0.01",
        "pay_type": "pay"
      },
      {
        "id": 2,
        "name": "人工智能学习实体资料",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260224/5042c1b029a934bafb155b1e18cce768.jpeg",
        "createtime": 1777794934,
        "views": "0",
        "type": "physical",
        "status": 1,
        "sales": null,
        "hide": "is_hide",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "99.00",
        "pay_type": "pay"
      },
      {
        "id": 1,
        "name": "全科会员",
        "cover": "https://tuzhi.mutouweb.com/assets/image/vip.png",
        "createtime": 1692506279,
        "views": "0",
        "type": "vipcard",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": "全新会员新会员",
        "uniacid": 1,
        "price": "0.30",
        "pay_type": "pay"
      },
      {
        "id": 1,
        "name": "123123",
        "cover": "https://tuzhi.mutouweb.com/uploads/1/20260616/3cd1f6398ddc48ab334a442e4898f6d1.png",
        "createtime": 1776570565,
        "views": "0",
        "type": "physical",
        "status": 1,
        "sales": null,
        "hide": "is_hide",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "1.00",
        "pay_type": "pay"
      },
      {
        "id": 1,
        "name": "测试组合商品",
        "cover": "http://selfbuilt.cn/uploads/1/20260619/71e43294828de6c1a47e279d46495998.png",
        "createtime": 1781585298,
        "views": "35",
        "type": "composite",
        "status": 1,
        "sales": null,
        "hide": "0",
        "sales_type": "alone",
        "briefing": null,
        "uniacid": 1,
        "price": "0.01",
        "pay_type": "pay"
      }
    ],
    "amount": "10.00",
    "discount": "0.00",
    "max_amount": "0.00",
    "max_amount_status": 1,
    "enough": "11.00",
    "enough_status": 1,
    "stock": 99958,
    "limit_num": 0,
    "limit_status": 1,
    "use_time_type": "range",
    "use_start_time": "2020-06-24 00:00",
    "use_end_time": "2029-07-31 00:00",
    "start_days": 0,
    "days": 0,
    "description": "",
    "recommend_goods_status": 1,
    "stock_status": 1,
    "share_status": 1,
    "public_status": 1,
    "double_discount_status": 1,
    "status": 1,
    "createtime": 1746629658,
    "updatetime": 1746629658,
    "deletetime": null,
    "get_status": "can_get",
    "get_status_text": "",
    "can_use": true,
    "user_coupons": [
      {
        "id": 217,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 1602,
        "use_time": 1752306911,
        "status": "used",
        "createtime": 1747019311,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "已使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 235,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 1755,
        "use_time": 1754909326,
        "status": "used",
        "createtime": 1749799685,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "已使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 242,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 1788,
        "use_time": 1764065595,
        "status": "used",
        "createtime": 1750247734,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "已使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 244,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 1789,
        "use_time": 1764065604,
        "status": "used",
        "createtime": 1753519980,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "已使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 256,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 1910,
        "use_time": 1777871974,
        "status": "used",
        "createtime": 1761481066,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "已使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 259,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 1884,
        "use_time": 1777818770,
        "status": "used",
        "createtime": 1764060545,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "已使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 307,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777799258,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 308,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777806986,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 309,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777807185,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 310,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777807186,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 311,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777817844,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 312,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777817846,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 314,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777865949,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 318,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777865968,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 319,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1777865977,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      },
      {
        "id": 322,
        "uniacid": 1,
        "user_id": 38,
        "get_type": 1,
        "coupon_id": 14,
        "use_order_id": 0,
        "use_time": null,
        "status": "can_use",
        "createtime": 1785035369,
        "updatetime": null,
        "name": "12313",
        "type": "reduce",
        "status_text": "立即使用",
        "get_type_text": "用户领取"
      }
    ],
    "type_text": "满减券",
    "use_num": 8,
    "get_num": 43,
    "status_text": "进行中",
    "use_scope_text": "全场通用",
    "amount_text": "满11.00元,减10元",
    "use_time_status": "ing",
    "use_time_text": "发放中",
    "stock_all": 100001,
    "stock_prop": 99,
    "received": true,
    "goods_bind_ids": []
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.id | integer | ID |
| data.uniacid | integer | 应用ID（公众号/uniacid） |
| data.name | string | 名称 |
| data.type | string | 类型 |
| data.use_scope | string | 使用scope |
| data.goods | array | 商品 |
| data.goods[].id | integer | ID |
| data.goods[].name | string | 名称 |
| data.goods[].cover | null | 封面图 |
| data.goods[].createtime | integer | 创建时间（时间戳） |
| data.goods[].views | string | 浏览量 |
| data.goods[].type | string | 类型 |
| data.goods[].status | integer | 状态 |
| data.goods[].sales | integer | 销量 |
| data.goods[].hide | null | 是否隐藏 |
| data.goods[].sales_type | null | 销售方式 |
| data.goods[].briefing | null | 简介 |
| data.goods[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.goods[].price | string | 价格 |
| data.goods[].pay_type | string | 支付类型 |
| data.amount | string | 金额 |
| data.discount | string | discount |
| data.max_amount | string | maxamount |
| data.max_amount_status | integer | maxamount状态 |
| data.enough | string | enough |
| data.enough_status | integer | enough状态 |
| data.stock | integer | 库存 |
| data.limit_num | integer | limit数量 |
| data.limit_status | integer | limit状态 |
| data.use_time_type | string | 使用时间类型 |
| data.use_start_time | string | 使用start时间 |
| data.use_end_time | string | 使用end时间 |
| data.start_days | integer | start天数 |
| data.days | integer | 天数 |
| data.description | string | 描述 |
| data.recommend_goods_status | integer | 推荐商品状态 |
| data.stock_status | integer | 库存状态 |
| data.share_status | integer | 分享状态 |
| data.public_status | integer | public状态 |
| data.double_discount_status | integer | doublediscount状态 |
| data.status | integer | 状态 |
| data.createtime | integer | 创建时间（时间戳） |
| data.updatetime | integer | 更新时间（时间戳） |
| data.deletetime | null | deletetime |
| data.get_status | string | 获取状态 |
| data.get_status_text | string | 获取状态text |
| data.can_use | boolean | 是否可使用 |
| data.user_coupons | array | 用户coupons |
| data.user_coupons[].id | integer | ID |
| data.user_coupons[].uniacid | integer | 应用ID（公众号/uniacid） |
| data.user_coupons[].user_id | integer | 用户ID |
| data.user_coupons[].get_type | integer | 获取类型 |
| data.user_coupons[].coupon_id | integer | 优惠券ID |
| data.user_coupons[].use_order_id | integer | 使用订单ID |
| data.user_coupons[].use_time | integer | 使用时间 |
| data.user_coupons[].status | string | 状态 |
| data.user_coupons[].createtime | integer | 创建时间（时间戳） |
| data.user_coupons[].updatetime | null | 更新时间（时间戳） |
| data.user_coupons[].name | string | 名称 |
| data.user_coupons[].type | string | 类型 |
| data.user_coupons[].status_text | string | 状态说明 |
| data.user_coupons[].get_type_text | string | 获取类型text |
| data.type_text | string | 类型说明 |
| data.use_num | integer | 使用数量 |
| data.get_num | integer | 获取数量 |
| data.status_text | string | 状态说明 |
| data.use_scope_text | string | 使用scopetext |
| data.amount_text | string | amounttext |
| data.use_time_status | string | 使用时间状态 |
| data.use_time_text | string | 使用时间text |
| data.stock_all | integer | 库存全部 |
| data.stock_prop | integer | 库存prop |
| data.received | boolean | received |
| data.goods_bind_ids | array | 商品绑定ID集合 |
