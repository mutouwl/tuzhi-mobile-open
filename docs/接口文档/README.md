# 接口文档

> 本目录由 [`tools/api-doc-gen`](../../tools/api-doc-gen/README.md) 脚本自动生成，**请勿手工修改**。
> 数据源：`tuzhi-selfbuilt-mobile/src/common/request/api_list.js`（Mobile 端接口配置文件）。

- 生成时间：2026/8/12 13:49:20
- 接口总数：311 个（19 个模块）
- 已生成文档：311 份

## 通用约定

### 接口地址（URL）

- 每个接口的**实际请求地址** = `{apiUrl}` + 路由，例如 `POST {apiUrl}user/info/login`；
- `apiUrl` 由 `common/init` 接口返回（字段 `data.apiUrl`），形如 `https://域名/index.php?i=1&route=api/`；
- 本文档中接口地址统一写作 `/api/{模块}/{控制器}/{方法}`（如 `POST /api/user/info/login`），实际请求时拼接上述 `apiUrl`。

### 登录凭证（Token）

- 登录类接口（如 `user/info/login`）成功后返回 `data.userinfo.token`；
- 前端登录成功后保存 token，后续所有请求自动在**请求头**携带 `token` 字段；
- 需要登录的接口（基本信息中「是否需登录」为「是」）若未携带或 token 已失效，返回 `code=401`，需重新登录；
- token 有效期见登录返回的 `expires_in`（秒）。

### 通用响应格式

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码（见下方「响应码列表」） |
| msg | string | 提示信息 |
| time | string | 服务器时间戳（秒） |
| data | object/array | 业务数据（详见各接口「返回参数说明」） |

### 响应码列表

| code | 说明 |
| --- | --- |
| 1 | 请求成功 |
| 0 | 业务错误（msg 为具体错误提示） |
| 401 | 未登录或登录态失效（需重新登录） |
| 403 | 无权限（如无权播放该视频） |
| 其他 | 业务自定义错误码（msg 为具体错误提示） |

## 模块导航

### 公共（common）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/common/lang` | 语言包 | [查看](公共_common/语言包_lang.md) |
| `POST /api/common/init` | 初始化 | [查看](公共_common/初始化_init.md) |
| `POST /api/common/agreenment` | 协议内容 | [查看](公共_common/协议内容_agreenment.md) |
| `POST /api/common/upload` | 上传文件 | [查看](公共_common/上传文件_upload.md) |
| `POST /api/common/getAllLangFile` | 获取全部语言文件名称（后端） | [查看](公共_common/获取全部语言文件名称_getAllLangFile.md) |

### 上传（upload）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/upload/uploadBase64` | 上传 Base64 图片 | [查看](上传_upload/上传 Base64 图片_uploadBase64.md) |
| `POST /api/upload/config` | 获取上传配置 | [查看](上传_upload/获取上传配置_config.md) |
| `POST /api/upload/ossParams` | 获取 OSS 直传参数 | [查看](上传_upload/获取 OSS 直传参数_ossParams.md) |
| `POST /api/upload/vodUrl` | 获取 VOD 上传地址 | [查看](上传_upload/获取 VOD 上传地址_vodUrl.md) |
| `POST /api/upload/vodRefresh` | 刷新 VOD 上传凭证 | [查看](上传_upload/刷新 VOD 上传凭证_vodRefresh.md) |
| `POST /api/upload/vodNotify` | VOD 上传回调 | [查看](上传_upload/VOD 上传回调_vodNotify.md) |
| `POST /api/upload/image` | 上传文件（后端） | [查看](上传_upload/上传文件_image.md) |
| `POST /api/upload/ossNotify` | OSS 附件补记（后端） | [查看](上传_upload/OSS 附件补记_ossNotify.md) |

### 微信（wechat）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/wechat/jssdk` | 获取微信 JSSDK 配置 | [查看](微信_wechat/获取微信 JSSDK 配置_jssdk.md) |
| `POST /api/wechat/index` | 微信公众号服务端API对接（后端） | [查看](微信_wechat/微信公众号服务端API对接_index.md) |
| `POST /api/wechat/wxacode` | wxacode（后端） | [查看](微信_wechat/wxacode_wxacode.md) |
| `POST /api/wechat/callback` | 登录回调（后端） | [查看](微信_wechat/登录回调_callback.md) |

### 短信（sms）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/sms/send` | 发送短信验证码 | [查看](短信_sms/发送短信验证码_send.md) |
| `POST /api/sms/check` | 校验短信验证码 | [查看](短信_sms/校验短信验证码_check.md) |

### 自定义页面（page）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/page/decorate/getPage` | 获取页面 | [查看](自定义页面_page/decorate/获取页面_getPage.md) |
| `POST /api/page/decorate/isIndex` | 判断是否为默认主页 | [查看](自定义页面_page/decorate/判断是否为默认主页_isIndex.md) |
| `POST /api/page/navigation/getNavigation` | 获取页面 | [查看](自定义页面_page/navigation/获取页面_getNavigation.md) |

### 支付（pay）

#### handle（handle）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/handle` | 拉起支付 | [查看](支付_pay/拉起支付_handle.md) |

#### 获取支付类型（getPayType）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/getPayType` | 获取支付渠道 | [查看](支付_pay/获取支付渠道_getPayType.md) |

#### alipay（alipay）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/alipay` | 支付宝网页支付（后端） | [查看](支付_pay/支付宝网页支付_alipay.md) |

#### 获取Notify链接（getNotifyUrl）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/getNotifyUrl` | 获取Notify链接（后端） | [查看](支付_pay/获取Notify链接_getNotifyUrl.md) |

#### 余额支付（balancePay）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/balancePay` | 余额支付（后端） | [查看](支付_pay/余额支付_balancePay.md) |

#### 获取NotifyParams（getNotifyParams）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/getNotifyParams` | 获取回调中的参数（后端） | [查看](支付_pay/获取回调中的参数_getNotifyParams.md) |

#### notifyx（notifyx）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/notifyx` | 支付成功回调（后端） | [查看](支付_pay/支付成功回调_notifyx.md) |

#### transferNotify（transferNotify）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/transferNotify` | 微信商家转账结果回调（后端） | [查看](支付_pay/微信商家转账结果回调_transferNotify.md) |

#### successHandle（successHandle）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/successHandle` | 支付成功回调处理（后端） | [查看](支付_pay/支付成功回调处理_successHandle.md) |

#### notifyr（notifyr）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/pay/notifyr` | 退款成功回调（后端） | [查看](支付_pay/退款成功回调_notifyr.md) |

### 商品（goods）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/goods/goods/index` | 商品列表 | [查看](商品_goods/商品_goods/商品列表_index.md) |

### 订单（order）

#### 服务承诺（service）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/order/service/getRefundReason` | 获取退款原因 | [查看](订单_order/服务承诺_service/获取退款原因_getRefundReason.md) |
| `POST /api/order/service/apply` | 申请退款 | [查看](订单_order/服务承诺_service/申请退款_apply.md) |
| `POST /api/order/service/cancel` | 撤销售后申请 | [查看](订单_order/服务承诺_service/撤销售后申请_cancel.md) |
| `POST /api/order/service/getDetail` | 获取售后详情 | [查看](订单_order/服务承诺_service/获取售后详情_getDetail.md) |
| `POST /api/order/service/getRefundLog` | 获取退款记录 | [查看](订单_order/服务承诺_service/获取退款记录_getRefundLog.md) |

#### 订单（order）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/order/order/createOrder` | 创建订单 | [查看](订单_order/订单_order/创建订单_createOrder.md) |
| `POST /api/order/order/getDetail` | 获取订单详情 | [查看](订单_order/订单_order/获取订单详情_getDetail.md) |
| `POST /api/order/order/getOrderList` | 获取订单列表 | [查看](订单_order/订单_order/获取订单列表_getOrderList.md) |
| `POST /api/order/order/calculate` | 核算订单 | [查看](订单_order/订单_order/核算订单_calculate.md) |
| `POST /api/order/order/cancelOrder` | 取消订单 | [查看](订单_order/订单_order/取消订单_cancelOrder.md) |
| `POST /api/order/order/deleteOrder` | 删除订单 | [查看](订单_order/订单_order/删除订单_deleteOrder.md) |
| `POST /api/order/order/confirmReceive` | 确认收货 | [查看](订单_order/订单_order/确认收货_confirmReceive.md) |

#### 评价（evaluate）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/order/evaluate/getBeItems` | 获取待评价的商品 | [查看](订单_order/评价_evaluate/获取待评价的商品_getBeItems.md) |
| `POST /api/order/evaluate/getToItemInfo` | 获取被评价的商品信息 | [查看](订单_order/评价_evaluate/获取被评价的商品信息_getToItemInfo.md) |
| `POST /api/order/evaluate/submit` | 提交评价 | [查看](订单_order/评价_evaluate/提交评价_submit.md) |
| `POST /api/order/evaluate/getList` | 获取评价列表 | [查看](订单_order/评价_evaluate/获取评价列表_getList.md) |
| `POST /api/order/evaluate/getCourseRecommendList` | 获取课程推荐的评价 | [查看](订单_order/评价_evaluate/获取课程推荐的评价_getCourseRecommendList.md) |

#### 支付（pay）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/order/pay/notifyx` | 支付成功回调（后端） | [查看](订单_order/支付_pay/支付成功回调_notifyx.md) |
| `POST /api/order/pay/handle` | 拉起支付（后端） | [查看](订单_order/支付_pay/拉起支付_handle.md) |
| `POST /api/order/pay/balancePay` | 余额支付（后端） | [查看](订单_order/支付_pay/余额支付_balancePay.md) |

### 课程（course）

#### 订阅（subscription）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/course/subscription/passwordPay` | 密码兑换 | [查看](课程_course/订阅_subscription/密码兑换_passwordPay.md) |
| `POST /api/course/subscription/free` | 免费加入学习 | [查看](课程_course/订阅_subscription/免费加入学习_free.md) |
| `POST /api/course/subscription/getMySubscription` | 获取我的订阅 | [查看](课程_course/订阅_subscription/获取我的订阅_getMySubscription.md) |

#### 分组（group）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/course/group/index` | 获取分组列表（支持指定层级） | [查看](课程_course/分组_group/获取分组列表（支持指定层级）_index.md) |
| `POST /api/course/group/all` | 获取所有分组树 | [查看](课程_course/分组_group/获取所有分组树_all.md) |
| `POST /api/course/group/level` | 获取指定层级分组 | [查看](课程_course/分组_group/获取指定层级分组_level.md) |
| `POST /api/course/group/detail` | 获取分组详情 | [查看](课程_course/分组_group/获取分组详情_detail.md) |
| `POST /api/course/group/getList` | 获取课程分组列表（兼容旧接口） | [查看](课程_course/分组_group/获取课程分组列表（兼容旧接口）_getList.md) |

#### 评论（comment）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/course/comment/add` | 添加评论 | [查看](课程_course/评论_comment/添加评论_add.md) |
| `POST /api/course/comment/del` | 删除评价 | [查看](课程_course/评论_comment/删除评价_del.md) |
| `POST /api/course/comment/index` | 获取评论列表 | [查看](课程_course/评论_comment/获取评论列表_index.md) |
| `POST /api/course/comment/like` | 喜欢评价 | [查看](课程_course/评论_comment/喜欢评价_like.md) |

#### 课程（course）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/course/course/getList` | 课程列表 | [查看](课程_course/课程_course/课程列表_getList.md) |
| `POST /api/course/course/detail` | 课程详情 | [查看](课程_course/课程_course/课程详情_detail.md) |
| `POST /api/course/course/getBelongsColumn` | 获取课程所属专栏 | [查看](课程_course/课程_course/获取课程所属专栏_getBelongsColumn.md) |
| `POST /api/course/course/courseDataLimit` | 课程数据限制 根据是否已订阅返回相关数据（后端） | [查看](课程_course/课程_course/课程数据限制 根据是否已订阅返回相关数据_courseDataLimit.md) |

#### 专栏（column）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/course/column/getColumnDir` | 获取专栏目录 新 | [查看](课程_course/专栏_column/获取专栏目录 新_getColumnDir.md) |
| `POST /api/course/column/getCourse` | 获取专栏所属课程 | [查看](课程_course/专栏_column/获取专栏所属课程_getCourse.md) |
| `POST /api/course/column/getNextCourse` | 获取下一课程 | [查看](课程_course/专栏_column/获取下一课程_getNextCourse.md) |
| `POST /api/course/column/getDir` | 获取专栏目录（后端） | [查看](课程_course/专栏_column/获取专栏目录_getDir.md) |

### 用户（user）

#### 消息（message）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/message/getList` | 获取消息记录 | [查看](用户_user/消息_message/获取消息记录_getList.md) |

#### 收藏（collect）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/collect/setCollect` | 设置收藏状态 | [查看](用户_user/收藏_collect/设置收藏状态_setCollect.md) |
| `POST /api/user/collect/getIsCollect` | 获取是否收藏 | [查看](用户_user/收藏_collect/获取是否收藏_getIsCollect.md) |
| `POST /api/user/collect/getMyCollect` | 获取我的订阅 | [查看](用户_user/收藏_collect/获取我的订阅_getMyCollect.md) |

#### 合并（merge）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/merge/getMergeAccount` | 获取需要合并的账号 | [查看](用户_user/合并_merge/获取需要合并的账号_getMergeAccount.md) |
| `POST /api/user/merge/submit` | 合并账号 | [查看](用户_user/合并_merge/合并账号_submit.md) |
| `POST /api/user/merge/check` | 检测被绑定账号合规（后端） | [查看](用户_user/合并_merge/检测被绑定账号合规_check.md) |

#### 信息（info）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/info/login` | 用户登录 | [查看](用户_user/信息_info/用户登录_login.md) |
| `POST /api/user/info/tokenLogin` | Token 登录 | [查看](用户_user/信息_info/Token 登录_tokenLogin.md) |
| `POST /api/user/info/wxAccountLogin` | 微信公众号登录 | [查看](用户_user/信息_info/微信公众号登录_wxAccountLogin.md) |
| `POST /api/user/info/getDyMiniProgramSessionKey` | 获取抖音小程序 SessionKey | [查看](用户_user/信息_info/获取抖音小程序 SessionKey_getDyMiniProgramSessionKey.md) |
| `POST /api/user/info/dyMiniProgramLogin` | 抖音小程序登录 | [查看](用户_user/信息_info/抖音小程序登录_dyMiniProgramLogin.md) |
| `POST /api/user/info/getWxMiniProgramSessionKey` | 获取微信小程序 SessionKey | [查看](用户_user/信息_info/获取微信小程序 SessionKey_getWxMiniProgramSessionKey.md) |
| `POST /api/user/info/wxMiniProgramLogin` | 微信小程序登录 | [查看](用户_user/信息_info/微信小程序登录_wxMiniProgramLogin.md) |
| `POST /api/user/info/mobilelogin` | 手机号登录 | [查看](用户_user/信息_info/手机号登录_mobilelogin.md) |
| `POST /api/user/info/changemobile` | 修改手机号 | [查看](用户_user/信息_info/修改手机号_changemobile.md) |
| `POST /api/user/info/register` | 用户注册 | [查看](用户_user/信息_info/用户注册_register.md) |
| `POST /api/user/info/resetpwd` | 找回密码 | [查看](用户_user/信息_info/找回密码_resetpwd.md) |
| `POST /api/user/info/index` | 用户信息 | [查看](用户_user/信息_info/用户信息_index.md) |
| `POST /api/user/info/profile` | 修改个人资料 | [查看](用户_user/信息_info/修改个人资料_profile.md) |
| `POST /api/user/info/logout` | 退出登录 | [查看](用户_user/信息_info/退出登录_logout.md) |
| `POST /api/user/info/getWxLoginBackPath` | 获取微信授权回调地址（后端） | [查看](用户_user/信息_info/获取微信授权回调地址_getWxLoginBackPath.md) |
| `POST /api/user/info/wxOauth` | 微信公众号授权(非直接登陆)（后端） | [查看](用户_user/信息_info/微信公众号授权(非直接登陆)_wxOauth.md) |
| `POST /api/user/info/oauthLoginOrRegister` | 第三方登录或自动注册（后端） | [查看](用户_user/信息_info/第三方登录或自动注册_oauthLoginOrRegister.md) |
| `POST /api/user/info/changeemail` | 修改邮箱（后端） | [查看](用户_user/信息_info/修改邮箱_changeemail.md) |
| `POST /api/user/info/third` | 第三方登录（后端） | [查看](用户_user/信息_info/第三方登录_third.md) |

#### 资产（assets）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/assets/getAssetsLog` | 获取资产信息 | [查看](用户_user/资产_assets/获取资产信息_getAssetsLog.md) |

#### 提现（withdraw）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/withdraw/getBalance` | 获取账户余额 | [查看](用户_user/提现_withdraw/获取账户余额_getBalance.md) |
| `POST /api/user/withdraw/submit` | 提交提现申请 | [查看](用户_user/提现_withdraw/提交提现申请_submit.md) |
| `POST /api/user/withdraw/getLog` | 获取提现记录 | [查看](用户_user/提现_withdraw/获取提现记录_getLog.md) |
| `POST /api/user/withdraw/getWechatReceiveParams` | 获取微信提现确认收款参数 | [查看](用户_user/提现_withdraw/获取微信提现确认收款参数_getWechatReceiveParams.md) |
| `POST /api/user/withdraw/syncWechatTransfer` | 用户侧同步微信提现结果 | [查看](用户_user/提现_withdraw/用户侧同步微信提现结果_syncWechatTransfer.md) |
| `POST /api/user/withdraw/getAccount` | 获取收款账户列表 | [查看](用户_user/提现_withdraw/获取收款账户列表_getAccount.md) |
| `POST /api/user/withdraw/saveAccount` | 保存收款账户 | [查看](用户_user/提现_withdraw/保存收款账户_saveAccount.md) |
| `POST /api/user/withdraw/delAccount` | 删除收款账户 | [查看](用户_user/提现_withdraw/删除收款账户_delAccount.md) |
| `POST /api/user/withdraw/setDefaultAccount` | 设置默认收款账户 | [查看](用户_user/提现_withdraw/设置默认收款账户_setDefaultAccount.md) |

#### 地址（address）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/address/index` | 地址列表 | [查看](用户_user/地址_address/地址列表_index.md) |
| `POST /api/user/address/default` | 默认地址 | [查看](用户_user/地址_address/默认地址_default.md) |
| `POST /api/user/address/detail` | 地址详情 | [查看](用户_user/地址_address/地址详情_detail.md) |
| `POST /api/user/address/save` | 添加/编辑地址 | [查看](用户_user/地址_address/添加／编辑地址_save.md) |
| `POST /api/user/address/delete` | 删除地址 | [查看](用户_user/地址_address/删除地址_delete.md) |
| `POST /api/user/address/setDefault` | 设置默认地址 | [查看](用户_user/地址_address/设置默认地址_setDefault.md) |
| `POST /api/user/address/parse` | 智能识别地址 | [查看](用户_user/地址_address/智能识别地址_parse.md) |

#### 学习（study）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/user/study/setLog` | 记录学习进度 | [查看](用户_user/学习_study/记录学习进度_setLog.md) |
| `POST /api/user/study/finish` | 完成学习 | [查看](用户_user/学习_study/完成学习_finish.md) |
| `POST /api/user/study/getStudyLog` | 学习记录 | [查看](用户_user/学习_study/学习记录_getStudyLog.md) |
| `POST /api/user/study/getStatistics` | 学习统计 | [查看](用户_user/学习_study/学习统计_getStatistics.md) |
| `POST /api/user/study/getContinuousStudyDays` | 连续学习天数 | [查看](用户_user/学习_study/连续学习天数_getContinuousStudyDays.md) |
| `POST /api/user/study/getMediaProgress` | 媒体播放进度 | [查看](用户_user/学习_study/媒体播放进度_getMediaProgress.md) |

### 直播（live）

#### 课件（courseware）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/live/courseware/getCoursewareList` | 获取课件列表 | [查看](直播_live/课件_courseware/获取课件列表_getCoursewareList.md) |

#### 消息（message）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/live/message/send` | 发送消息 | [查看](直播_live/消息_message/发送消息_send.md) |
| `POST /api/live/message/getMessageList` | 获取消息列表 历史消息 | [查看](直播_live/消息_message/获取消息列表 历史消息_getMessageList.md) |
| `POST /api/live/message/getAliyunAuth` | 获取阿里云互动消息鉴权信息 | [查看](直播_live/消息_message/获取阿里云互动消息鉴权信息_getAliyunAuth.md) |

#### 礼物（gift）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/live/gift/getGiftOptions` | 获取礼物列表 | [查看](直播_live/礼物_gift/获取礼物列表_getGiftOptions.md) |
| `POST /api/live/gift/send` | 发送礼物 | [查看](直播_live/礼物_gift/发送礼物_send.md) |

#### 红包（red_packet）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/live/red_packet/getActive` | 获取直播间当前红包 | [查看](直播_live/红包_red_packet/获取直播间当前红包_getActive.md) |
| `POST /api/live/red_packet/grab` | 抢红包 | [查看](直播_live/红包_red_packet/抢红包_grab.md) |
| `POST /api/live/red_packet/detail` | 获取红包详情 | [查看](直播_live/红包_red_packet/获取红包详情_detail.md) |
| `POST /api/live/red_packet/getList` | 获取直播间红包列表 | [查看](直播_live/红包_red_packet/获取直播间红包列表_getList.md) |
| `POST /api/live/red_packet/getMyList` | 获取我的红包记录 | [查看](直播_live/红包_red_packet/获取我的红包记录_getMyList.md) |

#### 商品（goods）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/live/goods/index` | 带货商品列表 | [查看](直播_live/商品_goods/带货商品列表_index.md) |
| `POST /api/live/goods/explaining` | 获取讲解中的商品 | [查看](直播_live/商品_goods/获取讲解中的商品_explaining.md) |
| `POST /api/live/goods/action` | 用户点击商品行为 | [查看](直播_live/商品_goods/用户点击商品行为_action.md) |
| `POST /api/live/goods/getGoods` | 获取商品（后端） | [查看](直播_live/商品_goods/获取商品_getGoods.md) |

#### 直播间（room）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/live/room/getRoomDetail` | 获取直播间详情 | [查看](直播_live/直播间_room/获取直播间详情_getRoomDetail.md) |
| `POST /api/live/room/getPlaybackList` | 获取回放视频 | [查看](直播_live/直播间_room/获取回放视频_getPlaybackList.md) |
| `POST /api/live/room/getRoomStatus` | 获取直播间状态 | [查看](直播_live/直播间_room/获取直播间状态_getRoomStatus.md) |
| `POST /api/live/room/getOnlineUserNum` | 获取在线观看人数 数据来源为消息服务 | [查看](直播_live/直播间_room/获取在线观看人数 数据来源为消息服务_getOnlineUserNum.md) |

### 拓展应用（app）

#### 实物（physical）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/physical/goods/index` | 商品列表 | [查看](拓展应用_app/实物_physical/商品_goods/商品列表_index.md) |
| `POST /api/app/physical/goods/ids` | 通过 ids 获取商品（不分页） | [查看](拓展应用_app/实物_physical/商品_goods/通过 ids 获取商品（不分页）_ids.md) |
| `POST /api/app/physical/goods/detail` | 商品详情 | [查看](拓展应用_app/实物_physical/商品_goods/商品详情_detail.md) |
| `POST /api/app/physical/category/index` | 获取分类列表（三级分类） | [查看](拓展应用_app/实物_physical/category/获取分类列表（三级分类）_index.md) |
| `POST /api/app/physical/category/all` | 获取所有分类树 | [查看](拓展应用_app/实物_physical/category/获取所有分类树_all.md) |
| `POST /api/app/physical/express/detail` | 查看物流记录 | [查看](拓展应用_app/实物_physical/express/查看物流记录_detail.md) |
| `POST /api/app/physical/express/refresh` | 刷新物流信息 | [查看](拓展应用_app/实物_physical/express/刷新物流信息_refresh.md) |

#### 组合（composite）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/composite/goods/index` | 组合商品列表 | [查看](拓展应用_app/组合_composite/商品_goods/组合商品列表_index.md) |
| `POST /api/app/composite/goods/ids` | 通过 ids 获取组合商品（不分页） | [查看](拓展应用_app/组合_composite/商品_goods/通过 ids 获取组合商品（不分页）_ids.md) |
| `POST /api/app/composite/goods/detail` | 组合商品详情 | [查看](拓展应用_app/组合_composite/商品_goods/组合商品详情_detail.md) |

#### 圈子（circle）

##### 圈子（circle/circle）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/circle/circle/index` | 我加入的圈子列表（用户中心【我的圈子】） | [查看](拓展应用_app/圈子_circle/圈子_circle/我加入的圈子列表（用户中心【我的圈子】）_index.md) |
| `POST /api/app/circle/circle/goodsList` | 店铺圈子列表（DIY 装修/店铺展示用，免登录） | [查看](拓展应用_app/圈子_circle/圈子_circle/店铺圈子列表（DIY 装修／店铺展示用，免登录）_goodsList.md) |
| `POST /api/app/circle/circle/courseCircle` | 课程详情页圈子 tab | [查看](拓展应用_app/圈子_circle/圈子_circle/课程详情页圈子 tab_courseCircle.md) |
| `POST /api/app/circle/circle/presale` | 圈子售前页 | [查看](拓展应用_app/圈子_circle/圈子_circle/圈子售前页_presale.md) |
| `POST /api/app/circle/circle/join` | 免费加入圈子 | [查看](拓展应用_app/圈子_circle/圈子_circle/免费加入圈子_join.md) |
| `POST /api/app/circle/circle/detail` | 圈子主页（成员） | [查看](拓展应用_app/圈子_circle/圈子_circle/圈子主页（成员）_detail.md) |
| `POST /api/app/circle/circle/publishConfig` | 发布上传配置 | [查看](拓展应用_app/圈子_circle/圈子_circle/发布上传配置_publishConfig.md) |
| `POST /api/app/circle/circle/showcase` | 商品橱窗商品列表 | [查看](拓展应用_app/圈子_circle/圈子_circle/商品橱窗商品列表_showcase.md) |
| `POST /api/app/circle/circle/courses` | 圈子关联课程列表（课程 tab） | [查看](拓展应用_app/圈子_circle/圈子_circle/圈子关联课程列表（课程 tab）_courses.md) |
| `POST /api/app/circle/circle/courseDir` | 圈子课程目录树 | [查看](拓展应用_app/圈子_circle/圈子_circle/圈子课程目录树_courseDir.md) |
| `POST /api/app/circle/circle/expire` | 我的有效期与续费引导信息 | [查看](拓展应用_app/圈子_circle/圈子_circle/我的有效期与续费引导信息_expire.md) |
| `POST /api/app/circle/circle/userHome` | 圈内个人主页基础信息与统计 | [查看](拓展应用_app/圈子_circle/圈子_circle/圈内个人主页基础信息与统计_userHome.md) |

##### 帖子（circle/post）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/circle/post/list` | 动态流 | [查看](拓展应用_app/圈子_circle/post/动态流_list.md) |
| `POST /api/app/circle/post/previewList` | 动态预览列表 | [查看](拓展应用_app/圈子_circle/post/动态预览列表_previewList.md) |
| `POST /api/app/circle/post/detail` | 动态详情 | [查看](拓展应用_app/圈子_circle/post/动态详情_detail.md) |
| `POST /api/app/circle/post/playAuth` | 获取圈子 VOD 视频播放凭证 | [查看](拓展应用_app/圈子_circle/post/获取圈子 VOD 视频播放凭证_playAuth.md) |
| `POST /api/app/circle/post/commentList` | 动态评论列表 | [查看](拓展应用_app/圈子_circle/post/动态评论列表_commentList.md) |
| `POST /api/app/circle/post/publish` | 发布动态 | [查看](拓展应用_app/圈子_circle/post/发布动态_publish.md) |
| `POST /api/app/circle/post/edit` | 编辑动态（仅自己） | [查看](拓展应用_app/圈子_circle/post/编辑动态（仅自己）_edit.md) |
| `POST /api/app/circle/post/removeMedia` | 删除媒体 | [查看](拓展应用_app/圈子_circle/post/删除媒体_removeMedia.md) |
| `POST /api/app/circle/post/del` | 删除动态（仅自己） | [查看](拓展应用_app/圈子_circle/post/删除动态（仅自己）_del.md) |
| `POST /api/app/circle/post/ask` | 提问（向圈主） | [查看](拓展应用_app/圈子_circle/post/提问（向圈主）_ask.md) |
| `POST /api/app/circle/post/like` | 点赞 | [查看](拓展应用_app/圈子_circle/post/点赞_like.md) |
| `POST /api/app/circle/post/unlike` | 取消点赞 | [查看](拓展应用_app/圈子_circle/post/取消点赞_unlike.md) |
| `POST /api/app/circle/post/comment` | 发布评论 | [查看](拓展应用_app/圈子_circle/post/发布评论_comment.md) |
| `POST /api/app/circle/post/delComment` | 删除评论（仅自己） | [查看](拓展应用_app/圈子_circle/post/删除评论（仅自己）_delComment.md) |

#### 投诉（complaint）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/complaint/complaint/config` | 获取投诉配置 | [查看](拓展应用_app/投诉_complaint/投诉_complaint/获取投诉配置_config.md) |
| `POST /api/app/complaint/complaint/category` | 获取投诉类型 | [查看](拓展应用_app/投诉_complaint/投诉_complaint/获取投诉类型_category.md) |
| `POST /api/app/complaint/complaint/submit` | 提交投诉 | [查看](拓展应用_app/投诉_complaint/投诉_complaint/提交投诉_submit.md) |

#### 表单（form）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/form/form/detail` | 获取表单详情 | [查看](拓展应用_app/表单_form/表单_form/获取表单详情_detail.md) |
| `POST /api/app/form/form/submit` | 提交表单 | [查看](拓展应用_app/表单_form/表单_form/提交表单_submit.md) |
| `POST /api/app/form/form/log` | 提交记录 | [查看](拓展应用_app/表单_form/表单_form/提交记录_log.md) |
| `POST /api/app/form/form/getCourseBindForm` | 获取课程关联的考试 | [查看](拓展应用_app/表单_form/表单_form/获取课程关联的考试_getCourseBindForm.md) |
| `POST /api/app/form/form/checkBeforeBuy` | 检查购买课程前表单是否已提交 | [查看](拓展应用_app/表单_form/表单_form/检查购买课程前表单是否已提交_checkBeforeBuy.md) |
| `POST /api/app/form/form/validateRequiredFields` | 验证必填字段（后端） | [查看](拓展应用_app/表单_form/表单_form/验证必填字段_validateRequiredFields.md) |

#### 证书（cert）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/cert/log/index` | 证书列表 | [查看](拓展应用_app/证书_cert/log/证书列表_index.md) |
| `POST /api/app/cert/log/preview` | 预览证书 | [查看](拓展应用_app/证书_cert/log/预览证书_preview.md) |

#### 优惠券（coupon）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/coupon/coupon/goodsGetCoupon` | 获取商品可领取的优惠券 | [查看](拓展应用_app/优惠券_coupon/优惠券_coupon/获取商品可领取的优惠券_goodsGetCoupon.md) |
| `POST /api/app/coupon/coupon/detail` | 优惠券详情 | [查看](拓展应用_app/优惠券_coupon/优惠券_coupon/优惠券详情_detail.md) |
| `POST /api/app/coupon/coupon/receive` | 领取优惠券 | [查看](拓展应用_app/优惠券_coupon/优惠券_coupon/领取优惠券_receive.md) |
| `POST /api/app/coupon/coupon/useCoupon` | 获取用户可用和不可用优惠券 | [查看](拓展应用_app/优惠券_coupon/优惠券_coupon/获取用户可用和不可用优惠券_useCoupon.md) |
| `POST /api/app/coupon/coupon/my` | 我的优惠券 | [查看](拓展应用_app/优惠券_coupon/优惠券_coupon/我的优惠券_my.md) |
| `POST /api/app/coupon/coupon/index` | 优惠券列表（后端） | [查看](拓展应用_app/优惠券_coupon/优惠券_coupon/优惠券列表_index.md) |

#### 视频号（channels）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/channels/delivery/detail` | 发货详情 | [查看](拓展应用_app/视频号_channels/delivery/发货详情_detail.md) |
| `POST /api/app/channels/sharer/invite` | 生成邀请码 | [查看](拓展应用_app/视频号_channels/sharer/生成邀请码_invite.md) |
| `POST /api/app/channels/sharer/checkBind` | 检查是否绑定成功 | [查看](拓展应用_app/视频号_channels/sharer/检查是否绑定成功_checkBind.md) |
| `POST /api/app/channels/sharer/myBind` | 我的绑定 | [查看](拓展应用_app/视频号_channels/sharer/我的绑定_myBind.md) |
| `POST /api/app/channels/sharer/unbind` | 解绑 | [查看](拓展应用_app/视频号_channels/sharer/解绑_unbind.md) |
| `POST /api/app/channels/sharer/getStoreList` | 获取可分享的小店列表 | [查看](拓展应用_app/视频号_channels/sharer/获取可分享的小店列表_getStoreList.md) |

#### 活动（activity）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/activity/activity/detail` | 活动详情 | [查看](拓展应用_app/活动_activity/活动_activity/活动详情_detail.md) |
| `POST /api/app/activity/bind_course/getCourseBindActivity` | 获取课程关联的活动 | [查看](拓展应用_app/活动_activity/bind_course/获取课程关联的活动_getCourseBindActivity.md) |
| `POST /api/app/activity/activity/index` | 获取活动列表 | [查看](拓展应用_app/活动_activity/活动_activity/获取活动列表_index.md) |
| `POST /api/app/activity/ticket/getTicket` | 获取活动票券 | [查看](拓展应用_app/活动_activity/ticket/获取活动票券_getTicket.md) |
| `POST /api/app/activity/ticket/getTicketDetail` | 获取票券详情 | [查看](拓展应用_app/活动_activity/ticket/获取票券详情_getTicketDetail.md) |
| `POST /api/app/activity/ticket/getUserTicket` | 获取我的票券 | [查看](拓展应用_app/活动_activity/ticket/获取我的票券_getUserTicket.md) |
| `POST /api/app/activity/form/submit` | 提交表单 | [查看](拓展应用_app/活动_activity/表单_form/提交表单_submit.md) |
| `POST /api/app/activity/form/getApplyForm` | 获取报名信息 | [查看](拓展应用_app/活动_activity/表单_form/获取报名信息_getApplyForm.md) |
| `POST /api/app/activity/signin/signin` | 签到 | [查看](拓展应用_app/活动_activity/signin/签到_signin.md) |
| `POST /api/app/activity/bind_course/getBindCourse` | 获取绑定课程 | [查看](拓展应用_app/活动_activity/bind_course/获取绑定课程_getBindCourse.md) |
| `POST /api/app/activity/bind_course/checkJoinAuth` | 检查参与权限 | [查看](拓展应用_app/活动_activity/bind_course/检查参与权限_checkJoinAuth.md) |
| `POST /api/app/activity/form/parseForm` | 格式化表单（后端） | [查看](拓展应用_app/活动_activity/表单_form/格式化表单_parseForm.md) |

#### 考试（test）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/test/test/getCourseBindTest` | 获取课程关联的考试 | [查看](拓展应用_app/考试_test/考试_test/获取课程关联的考试_getCourseBindTest.md) |
| `POST /api/app/test/test/detail` | 获取练习详情 | [查看](拓展应用_app/考试_test/考试_test/获取练习详情_detail.md) |
| `POST /api/app/test/test/buildLog` | 新建练习 | [查看](拓展应用_app/考试_test/考试_test/新建练习_buildLog.md) |
| `POST /api/app/test/test/getLog` | 获取考试记录详情 | [查看](拓展应用_app/考试_test/考试_test/获取考试记录详情_getLog.md) |
| `POST /api/app/test/test/submitAnswer` | 提交考试答案 | [查看](拓展应用_app/考试_test/考试_test/提交考试答案_submitAnswer.md) |
| `POST /api/app/test/test/submitTest` | 提交考试 | [查看](拓展应用_app/考试_test/考试_test/提交考试_submitTest.md) |
| `POST /api/app/test/test/getResult` | 考试结果 | [查看](拓展应用_app/考试_test/考试_test/考试结果_getResult.md) |
| `POST /api/app/test/worklog/getLog` | worklog记录 | [查看](拓展应用_app/考试_test/worklog/worklog记录_getLog.md) |
| `POST /api/app/test/test/getButtonText` | 获取考试操作按钮状态（后端） | [查看](拓展应用_app/考试_test/考试_test/获取考试操作按钮状态_getButtonText.md) |

#### 考试（exam）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/exam/exercises/getCourseBindExam` | 获取课程关联的题库练习 | [查看](拓展应用_app/考试_exam/exercises/获取课程关联的题库练习_getCourseBindExam.md) |
| `POST /api/app/exam/exercises/detail` | 获取练习详情 | [查看](拓展应用_app/考试_exam/exercises/获取练习详情_detail.md) |
| `POST /api/app/exam/exercises/group` | 获取练习分组列表（平铺，兼容旧 tabs 调用） | [查看](拓展应用_app/考试_exam/exercises/获取练习分组列表（平铺，兼容旧 tabs 调用）_group.md) |
| `POST /api/app/exam/exercises/groupTree` | 获取练习分组树 | [查看](拓展应用_app/考试_exam/exercises/获取练习分组树_groupTree.md) |
| `POST /api/app/exam/exercises/subscribe` | 加入练习 | [查看](拓展应用_app/考试_exam/exercises/加入练习_subscribe.md) |
| `POST /api/app/exam/exercises_log/buildLog` | 新建练习 | [查看](拓展应用_app/考试_exam/exercises_log/新建练习_buildLog.md) |
| `POST /api/app/exam/exercises_log/getLogDetail` | 获取做题记录详情 | [查看](拓展应用_app/考试_exam/exercises_log/获取做题记录详情_getLogDetail.md) |
| `POST /api/app/exam/exercises_log/getLogList` | 获取练习记录 | [查看](拓展应用_app/考试_exam/exercises_log/获取练习记录_getLogList.md) |
| `POST /api/app/exam/exercises/getGoodsList` | 获取练习商品列表 | [查看](拓展应用_app/考试_exam/exercises/获取练习商品列表_getGoodsList.md) |
| `POST /api/app/exam/exercises_log/getErrorQuestion` | 获取错误本 | [查看](拓展应用_app/考试_exam/exercises_log/获取错误本_getErrorQuestion.md) |
| `POST /api/app/exam/exercises_log/delErrorQuestion` | 删除错题 | [查看](拓展应用_app/考试_exam/exercises_log/删除错题_delErrorQuestion.md) |
| `POST /api/app/exam/exercises_log/submit` | 提交练习 | [查看](拓展应用_app/考试_exam/exercises_log/提交练习_submit.md) |
| `POST /api/app/exam/exercises_log/getResult` | 获取考试结果 | [查看](拓展应用_app/考试_exam/exercises_log/获取考试结果_getResult.md) |
| `POST /api/app/exam/exercises/getSubscribeList` | 获取订阅列表 | [查看](拓展应用_app/考试_exam/exercises/获取订阅列表_getSubscribeList.md) |

#### VIP（vip）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/vip/card/getCardList` | 会员卡列表 | [查看](拓展应用_app/VIP_vip/card/会员卡列表_getCardList.md) |
| `POST /api/app/vip/card_privilege/getGoodsList` | 获取特权商品列表 | [查看](拓展应用_app/VIP_vip/card_privilege/获取特权商品列表_getGoodsList.md) |
| `POST /api/app/vip/card_privilege/getGoodsPrivilege` | 获取商品对应会员卡优惠 | [查看](拓展应用_app/VIP_vip/card_privilege/获取商品对应会员卡优惠_getGoodsPrivilege.md) |
| `POST /api/app/vip/card/getUserVip` | 获取我的会员信息 | [查看](拓展应用_app/VIP_vip/card/获取我的会员信息_getUserVip.md) |
| `POST /api/app/vip/config/getConfig` | 获取会员配置 | [查看](拓展应用_app/VIP_vip/配置_config/获取会员配置_getConfig.md) |

#### 积分（score）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/score/goods/index` | 商品列表 | [查看](拓展应用_app/积分_score/商品_goods/商品列表_index.md) |
| `POST /api/app/score/goods/detail` | 积分商品详情 | [查看](拓展应用_app/积分_score/商品_goods/积分商品详情_detail.md) |
| `POST /api/app/score/goods_group/getList` | 获取分组列表 | [查看](拓展应用_app/积分_score/goods_group/获取分组列表_getList.md) |
| `POST /api/app/score/config/getConfig` | 积分配置 | [查看](拓展应用_app/积分_score/配置_config/积分配置_getConfig.md) |

#### 签到（sign）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/sign/handle/index` | 签到列表 | [查看](拓展应用_app/签到_sign/handle/签到列表_index.md) |
| `POST /api/app/sign/handle/sign` | 签到 | [查看](拓展应用_app/签到_sign/handle/签到_sign.md) |
| `POST /api/app/sign/log/getList` | 签到列表 | [查看](拓展应用_app/签到_sign/log/签到列表_getList.md) |
| `POST /api/app/sign/config/getConfig` | 签到配置 | [查看](拓展应用_app/签到_sign/配置_config/签到配置_getConfig.md) |

#### 兑换（exchange）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/exchange/code/exchange` | 兑换 | [查看](拓展应用_app/兑换_exchange/code/兑换_exchange.md) |
| `POST /api/app/exchange/use_log/getLog` | 查看 | [查看](拓展应用_app/兑换_exchange/use_log/查看_getLog.md) |

#### 推荐（recommend）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/recommend/goods/getRecommendGoods` | 获取推荐商品 | [查看](拓展应用_app/推荐_recommend/商品_goods/获取推荐商品_getRecommendGoods.md) |

#### 分销（agent）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/agent/order/getTotal` | 获取统计数据 | [查看](拓展应用_app/分销_agent/订单_order/获取统计数据_getTotal.md) |
| `POST /api/app/agent/order/getOrderList` | 获取订单列表 | [查看](拓展应用_app/分销_agent/订单_order/获取订单列表_getOrderList.md) |
| `POST /api/app/agent/customer/getCustomerList` | 获取下级列表 | [查看](拓展应用_app/分销_agent/customer/获取下级列表_getCustomerList.md) |
| `POST /api/app/agent/customer/getCustomerDetail` | 获取客户详情 | [查看](拓展应用_app/分销_agent/customer/获取客户详情_getCustomerDetail.md) |
| `POST /api/app/agent/recruit/getStatus` | 获取当前申请状态 | [查看](拓展应用_app/分销_agent/recruit/获取当前申请状态_getStatus.md) |
| `POST /api/app/agent/recruit/apply` | 提交申请 | [查看](拓展应用_app/分销_agent/recruit/提交申请_apply.md) |
| `POST /api/app/agent/recruit/getUserCondition` | 获取用户列表 | [查看](拓展应用_app/分销_agent/recruit/获取用户列表_getUserCondition.md) |
| `POST /api/app/agent/member/getMember` | 获取成员 | [查看](拓展应用_app/分销_agent/member/获取成员_getMember.md) |
| `POST /api/app/agent/member/getMemberTotal` | 获取用户统计数据 | [查看](拓展应用_app/分销_agent/member/获取用户统计数据_getMemberTotal.md) |
| `POST /api/app/agent/config/getConfig` | 获取分销配置 | [查看](拓展应用_app/分销_agent/配置_config/获取分销配置_getConfig.md) |
| `POST /api/app/agent/level/getLevelList` | 获取等级列表 | [查看](拓展应用_app/分销_agent/level/获取等级列表_getLevelList.md) |
| `POST /api/app/agent/wallet/getMoneyLog` | 获取资产信息 | [查看](拓展应用_app/分销_agent/wallet/获取资产信息_getMoneyLog.md) |
| `POST /api/app/agent/withdraw_card/getCard` | 获取银行卡信息 | [查看](拓展应用_app/分销_agent/withdraw_card/获取银行卡信息_getCard.md) |
| `POST /api/app/agent/withdraw_card/setCard` | 设置银行卡信息 | [查看](拓展应用_app/分销_agent/withdraw_card/设置银行卡信息_setCard.md) |
| `POST /api/app/agent/goods/getGoodsList` | 获取分销商品列表 | [查看](拓展应用_app/分销_agent/商品_goods/获取分销商品列表_getGoodsList.md) |
| `POST /api/app/agent/withdraw/submit` | 提交申请 | [查看](拓展应用_app/分销_agent/提现_withdraw/提交申请_submit.md) |
| `POST /api/app/agent/withdraw/getLog` | 获取提现记录 | [查看](拓展应用_app/分销_agent/提现_withdraw/获取提现记录_getLog.md) |
| `POST /api/app/agent/wallet/getMoney` | 获取金额（后端） | [查看](拓展应用_app/分销_agent/wallet/获取金额_getMoney.md) |
| `POST /api/app/agent/withdraw/check` | 检查（后端） | [查看](拓展应用_app/分销_agent/提现_withdraw/检查_check.md) |

#### pc（pc）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/app/pc/login/pcLoginPath` | 获取登录地址（后端） | [查看](拓展应用_app/pc_pc/login/获取登录地址_pcLoginPath.md) |
| `POST /api/app/pc/login/pcLoginState` | 获取登录状态（后端） | [查看](拓展应用_app/pc_pc/login/获取登录状态_pcLoginState.md) |
| `POST /api/app/pc/login/pcLoginCallback` | 登录回调（后端） | [查看](拓展应用_app/pc_pc/login/登录回调_pcLoginCallback.md) |
| `POST /api/app/pc/login/loginInfo` | 获取登录信息（后端） | [查看](拓展应用_app/pc_pc/login/获取登录信息_loginInfo.md) |
| `POST /api/app/pc/navigation/float` | 获取悬浮窗数据（后端） | [查看](拓展应用_app/pc_pc/navigation/获取悬浮窗数据_float.md) |
| `POST /api/app/pc/navigation/navigation` | 获取悬浮窗数据（后端） | [查看](拓展应用_app/pc_pc/navigation/获取悬浮窗数据_navigation.md) |
| `POST /api/app/pc/navigation/footer` | 获取悬浮窗数据（后端） | [查看](拓展应用_app/pc_pc/navigation/获取悬浮窗数据_footer.md) |
| `POST /api/app/pc/navigation/mobilePath` | 获取移动端页面（后端） | [查看](拓展应用_app/pc_pc/navigation/获取移动端页面_mobilePath.md) |
| `POST /api/app/pc/page/index` | 页码列表（后端） | [查看](拓展应用_app/pc_pc/自定义页面_page/页码列表_index.md) |
| `POST /api/app/pc/page/meta` | meta（后端） | [查看](拓展应用_app/pc_pc/自定义页面_page/meta_meta.md) |

### 数据（data）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/data/area/index` | 省市区数据 | [查看](数据_data/area/省市区数据_index.md) |
| `POST /api/data/area/children` | 获取下级地区 | [查看](数据_data/area/获取下级地区_children.md) |
| `POST /api/data/area/search` | 搜索地区 | [查看](数据_data/area/搜索地区_search.md) |
| `POST /api/data/record/log` | 访问记录上报 | [查看](数据_data/record/访问记录上报_log.md) |
| `POST /api/data/express/index` | 获取快递公司列表（后端） | [查看](数据_data/express/获取快递公司列表_index.md) |
| `POST /api/data/record/getPageInfo` | 获取页面信息（后端） | [查看](数据_data/record/获取页面信息_getPageInfo.md) |
| `POST /api/data/record/parseUrl` | 解析路由（后端） | [查看](数据_data/record/解析路由_parseUrl.md) |

### 分享（share）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/share/getPoster` | 获取分享海报 | [查看](分享_share/获取分享海报_getPoster.md) |
| `POST /api/share/getArticle` | 获取分享图文 | [查看](分享_share/获取分享图文_getArticle.md) |
| `POST /api/share/getQrcode` | 获取二维码 | [查看](分享_share/获取二维码_getQrcode.md) |

### 配置（config）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/config/getServiceConfig` | 获取客服配置 | [查看](配置_config/获取客服配置_getServiceConfig.md) |

### ems（ems）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/ems/send` | 发送验证码（后端） | [查看](ems_ems/发送验证码_send.md) |
| `POST /api/ems/check` | 检测验证码（后端） | [查看](ems_ems/检测验证码_check.md) |

### token（token）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/token/check` | 检测Token是否过期（后端） | [查看](token_token/检测Token是否过期_check.md) |
| `POST /api/token/refresh` | 刷新Token（后端） | [查看](token_token/刷新Token_refresh.md) |

### validate（validate）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/validate/check_email_available` | 检测邮箱（后端） | [查看](validate_validate/检测邮箱_check_email_available.md) |
| `POST /api/validate/check_username_available` | 检测用户名（后端） | [查看](validate_validate/检测用户名_check_username_available.md) |
| `POST /api/validate/check_nickname_available` | 检测昵称（后端） | [查看](validate_validate/检测昵称_check_nickname_available.md) |
| `POST /api/validate/check_mobile_available` | 检测手机（后端） | [查看](validate_validate/检测手机_check_mobile_available.md) |
| `POST /api/validate/check_mobile_exist` | 检测手机（后端） | [查看](validate_validate/检测手机_check_mobile_exist.md) |
| `POST /api/validate/check_email_exist` | 检测邮箱（后端） | [查看](validate_validate/检测邮箱_check_email_exist.md) |
| `POST /api/validate/check_sms_correct` | 检测手机验证码（后端） | [查看](validate_validate/检测手机验证码_check_sms_correct.md) |
| `POST /api/validate/check_ems_correct` | 检测邮箱验证码（后端） | [查看](validate_validate/检测邮箱验证码_check_ems_correct.md) |

### virtual_pay（virtual_pay）

| 接口 | 说明 | 文档 |
| --- | --- | --- |
| `POST /api/virtual_pay/getConfig` | 获取虚拟支付配置信息（是否开启等）（后端） | [查看](virtual_pay_virtual_pay/获取虚拟支付配置信息（是否开启等）_getConfig.md) |
| `POST /api/virtual_pay/queryBalance` | 查询用户代币余额（后端） | [查看](virtual_pay_virtual_pay/查询用户代币余额_queryBalance.md) |
| `POST /api/virtual_pay/checkAndPay` | 检查余额并支付（后端） | [查看](virtual_pay_virtual_pay/检查余额并支付_checkAndPay.md) |
| `POST /api/virtual_pay/handle` | 拉起虚拟支付（后端） | [查看](virtual_pay_virtual_pay/拉起虚拟支付_handle.md) |
| `POST /api/virtual_pay/notify` | 虚拟支付成功回调（后端） | [查看](virtual_pay_virtual_pay/虚拟支付成功回调_notify.md) |
| `POST /api/virtual_pay/refund` | 代币支付退款（后端） | [查看](virtual_pay_virtual_pay/代币支付退款_refund.md) |
| `POST /api/virtual_pay/queryOrder` | 查询虚拟支付订单（后端） | [查看](virtual_pay_virtual_pay/查询虚拟支付订单_queryOrder.md) |
| `POST /api/virtual_pay/refundOrder` | 查询现金订单并启动退款（后端） | [查看](virtual_pay_virtual_pay/查询现金订单并启动退款_refundOrder.md) |

## 接口统计

| 模块 | 接口数 | 已生成 |
| --- | --- | --- |
| 公共（common） | 5 | 5 |
| 上传（upload） | 8 | 8 |
| 微信（wechat） | 4 | 4 |
| 短信（sms） | 2 | 2 |
| 自定义页面（page） | 3 | 3 |
| 支付（pay） | 10 | 10 |
| 商品（goods） | 1 | 1 |
| 订单（order） | 20 | 20 |
| 课程（course） | 20 | 20 |
| 用户（user） | 49 | 49 |
| 直播（live） | 19 | 19 |
| 拓展应用（app） | 139 | 139 |
| 数据（data） | 7 | 7 |
| 分享（share） | 3 | 3 |
| 配置（config） | 1 | 1 |
| ems（ems） | 2 | 2 |
| token（token） | 2 | 2 |
| validate（validate） | 8 | 8 |
| virtual_pay（virtual_pay） | 8 | 8 |
| **合计** | **311** | **311** |

## 新增接口文档流程

1. 在 `tuzhi-selfbuilt-mobile/src/common/request/api_list.js` 中新增接口定义（key、url、auth、method）。
2. 可选：在 `tools/api-doc-gen/details.js` 的 `apis` 中补充参数说明、返回字段说明、备注。
3. 运行 `node tools/api-doc-gen/index.js --key=模块.key`，文档即产出；运行 `--all` 全量刷新。

详见 [`tools/api-doc-gen/README.md`](../../tools/api-doc-gen/README.md)。
