# 语言包

> 默认只加载了控制器对应的语言名，你还根据控制器名来加载额外的语言包

## 基本信息

| 项目 | 内容 |
| --- | --- |
| API Key | `common.lang` |
| 接口地址 | `POST /api/common/lang` |
| 请求方式 | POST |
| 是否需登录 | 否 |
| 所属模块 | 公共（common） |
| 所属控制器 | Common（公共接口） |

## 请求参数

| 参数名 | 类型 | 必填 | 说明 | 示例值 |
| --- | --- | --- | --- | --- |
| controllername | string | 否 | controllername | - |

## 请求示例

```bash
curl -X POST '{apiUrl}common/lang' \
  -H 'Content-Type: application/json' \
  -d '{"controllername":"xxx"}'
```

## 返回示例

```json
{
  "code": 1,
  "msg": "获取成功",
  "time": "1786509545",
  "data": {
    "user center": "会员中心",
    "register": "注册",
    "login": "登录",
    "sign up successful": "注册成功",
    "username can not be empty": "用户名不能为空",
    "username must be 3 to 30 characters": "用户名必须3-30个字符",
    "username must be 6 to 30 characters": "用户名必须6-30个字符",
    "password can not be empty": "密码不能为空",
    "password must be 6 to 30 characters": "密码必须6-30个字符",
    "mobile is incorrect": "手机格式不正确",
    "username already exist": "用户名已经存在",
    "nickname already exist": "昵称已经存在",
    "email already exist": "邮箱已经存在",
    "mobile already exist": "手机号已经存在",
    "username is incorrect": "用户名不正确",
    "email is incorrect": "邮箱不正确",
    "account is locked": "账户已经被锁定",
    "password is incorrect": "密码不正确",
    "account is incorrect": "账户不正确",
    "account not exist": "账户不存在",
    "account can not be empty": "账户不能为空",
    "username or password is incorrect": "用户名或密码不正确",
    "you are not logged in": "你当前还未登录",
    "you've logged in, do not login again": "你已经存在，请不要重复登录",
    "profile": "个人资料",
    "verify email": "邮箱验证",
    "change password": "修改密码",
    "captcha is incorrect": "验证码不正确",
    "logged in successful": "登录成功",
    "logout successful": "退出成功",
    "operation failed": "操作失败",
    "invalid parameters": "参数不正确",
    "change password failure": "修改密码失败",
    "change password successful": "修改密码成功",
    "reset password successful": "重置密码成功",
    "paytype.balance": "余额支付",
    "paytype.wechat": "微信支付",
    "paytype.alipay": "支付宝支付",
    "paytype.douyinpay": "支付宝支付",
    "paytype.score": "积分支付",
    "paytype.virtual_pay": "微信虚拟支付",
    "controll.delete": "删除",
    "controll.evaluate": "评价",
    "controll.cancel": "取消",
    "controll.pay": "支付",
    "controll.express": "物流记录",
    "controll.surereceive": "确认收货",
    "controll.service": "售后",
    "status.close": "已关闭",
    "status.unpaid": "待付款",
    "status.paid": "已付款",
    "status.unreceive": "待收货",
    "status.unsend": "待发货",
    "status.surereceive": "确认收货",
    "status.success": "交易成功",
    "status.cancel": "已取消",
    "status.service": "售后中",
    "status.refund": "已退款",
    "wait_playback": "待生成回放视频",
    "end": "直播已结束,未开启回放",
    "run_playback": "可查看回放",
    "not_start": "暂未开始",
    "online": "直播中",
    "offline": "主播暂时离开",
    "forbidden": "当前直播已关闭",
    "onlinefaild": "当前直播异常",
    "course": "课程",
    "video": "视频",
    "audio": "音频",
    "article": "文章",
    "goods": "实物商品",
    "column": "专栏",
    "live": "直播",
    "status 0": "未提交",
    "status 1": "已交卷",
    "grade status 0": "待批阅",
    "grade status 1": "已批阅",
    "appid": "APPID",
    "serect": "App Serect",
    "token": "****",
    "pushkey": "消息密钥",
    "url": "推送地址",
    "createtime": "创建时间",
    "store_id": "店铺",
    "openid": "****",
    "nickname": "分享员昵称",
    "bind_time": "绑定时间",
    "sharer_type": "分享员类型",
    "unionid": "Unionid",
    "wechat": "微信号",
    "status": "状态",
    "status 2": "清退",
    "status 3": "解绑",
    "status 4": "待绑定",
    "sharer type 1": "店铺分享员",
    "sharer type 0": "普通分享员",
    "store.nickname": "名称",
    "edit status 0": "初始值",
    "edit status 1": "编辑中",
    "edit status 2": "审核中",
    "edit status 3": "审核失败",
    "edit status 4": "审核成功",
    "edit status 7": "上传中",
    "edit status 8": "上传失败",
    "status 5": "上架",
    "status 6": "回收站",
    "status 11": "自主下架",
    "status 13": "违规下架/风控系统下架",
    "status 14": "保证金不足下架",
    "status 15": "品牌过期下架",
    "status 20": "商品被封禁",
    "channels_order_id": "视频号订单号",
    "order_id": "系统订单号",
    "mobile": "联系电话",
    "buyer_remark": "买家备注",
    "merch_remark": "商家备注",
    "live_id": "直播 ID",
    "finder_id": "视频号id",
    "order_scene": "下单场景",
    "sharer_openid": "openid",
    "sharer_unionid": "Unionid",
    "handling_progress": "是否已解析",
    "handling_progress 1": "解析完成",
    "handling_progress 0": "解析中",
    "update_time": "更新时间",
    "create_time": "床见时间",
    "member.nickname": "分享员昵称",
    "order.real_price": "实收金额",
    "status 10": "待付款",
    "status 21": "部分发货",
    "status 30": "待收货",
    "status 100": "完成",
    "status 200": "售后取消",
    "status 250": "订单取消",
    "status 300": "订单取消",
    "sharer_type 0": "普通分享员",
    "sharer_type 1": "店铺分享员",
    "share_scene": "分享场景",
    "share_scene 1": "直播间",
    "share_scene 2": "橱窗",
    "share_scene 3": "短视频",
    "share_scene 4": "视频号主页",
    "share_scene 5": "商品详情页",
    "share_scene 6": "带商品的公众号文章",
    "share_scene 7": "商品链接",
    "share_scene 8": "商品二维码",
    "share_scene 9": "商品短链",
    "share_scene 10": "分享直播间",
    "share_scene 11": "分享预约直播间",
    "share_scene 12": "视频号橱窗的短链",
    "share_scene 13": "视频号橱窗的二维码",
    "orderscene 1": "其他",
    "orderscene 2": "直播间",
    "orderscene 3": "短视频",
    "orderscene 4": "商品分享",
    "orderscene 5": "商品橱窗主页",
    "orderscene 6": "公众号文章商品卡片",
    "waiting": "待处理",
    "refuse": "驳回",
    "success": "成功",
    "keep login": "保持会话",
    "username": "用户名",
    "user id": "会员ID",
    "password": "密码",
    "sign up": "注 册",
    "sign in": "登 录",
    "sign out": "退 出",
    "guest": "游客",
    "welcome": "%s，你好！",
    "add": "添加",
    "edit": "编辑",
    "delete": "删除",
    "move": "移动",
    "name": "名称",
    "weigh": "权重",
    "operate": "操作",
    "warning": "温馨提示",
    "default": "默认",
    "page": "单页",
    "ok": "确定",
    "cancel": "取消",
    "loading": "加载中",
    "more": "更多",
    "normal": "正常",
    "hidden": "隐藏",
    "submit": "提交",
    "reset": "重置",
    "execute": "执行",
    "close": "关闭",
    "search": "搜索",
    "refresh": "刷新",
    "first": "首页",
    "previous": "上一页",
    "next": "下一页",
    "last": "末页",
    "none": "无",
    "home": "主页",
    "logout": "退出",
    "index": "首页",
    "hot": "热门",
    "recommend": "推荐",
    "dashboard": "控制台",
    "code": "编号",
    "message": "内容",
    "line": "行号",
    "file": "文件",
    "menu": "菜单",
    "type": "类型",
    "title": "标题",
    "content": "内容",
    "append": "追加",
    "memo": "备注",
    "parent": "父级",
    "params": "参数",
    "permission": "权限",
    "advance search": "高级搜索",
    "check all": "选中全部",
    "expand all": "展开全部",
    "begin time": "开始时间",
    "end time": "结束时间",
    "create time": "创建时间",
    "flag": "标志",
    "please login first": "请登录后操作",
    "uploaded successful": "上传成功",
    "you can upload up to %d file%s": "你最多还可以上传%d个文件",
    "you can choose up to %d file%s": "你最多还可以选择%d个文件",
    "chunk file write error": "分片写入失败",
    "chunk file info error": "分片文件错误",
    "chunk file merge error": "分片合并错误",
    "chunk file disabled": "未开启分片上传功能",
    "cancel upload": "取消上传",
    "upload canceled": "上传已取消",
    "no file upload or server upload limit exceeded": "未上传文件或超出服务器上传限制",
    "uploaded file format is limited": "上传文件格式受限制",
    "uploaded file is not a valid image": "上传文件不是有效的图片文件",
    "are you sure you want to cancel this upload?": "确定取消上传？",
    "remove file": "移除文件",
    "you can only upload a maximum of %s files": "你最多允许上传 %s 个文件",
    "you can't upload files of this type": "不允许上传的文件类型",
    "server responded with %s code": "请求失败，请稍后重试",
    "file is too big (%smib), max filesize: %smib": "当前上传(%sM)，最大允许上传文件大小:%sM",
    "redirect now": "立即跳转",
    "operation completed": "成功操作",
    "unknown data format": "未知的数据格式",
    "network error": "网络连接断开，请检查网络设置",
    "advanced search": "高级搜索",
    "no results were found": "记录未找到",
    "parameter %s can not be empty": "参数%s不能为空",
    "you have no permission": "你没有权限访问",
    "an unexpected error occurred": "发生异常，请稍后重试",
    "this page will be re-directed in %s seconds": "页面将在 %s 秒后自动跳转",
    "pay_wechat": "微信支付",
    "pay_alipay": "支付宝支付",
    "pay_douyinpay": "抖音支付",
    "pay_balance": "余额支付",
    "pay_virtual_pay": "虚拟支付",
    "type.article": "文章",
    "type.physical": "实物商品",
    "type.video": "视频",
    "type.audio": "音频",
    "type.column": "专栏",
    "type.live_gift": "直播礼物",
    "type.form": "表单",
    "type.evaluation": "练习",
    "evaluation": "练习",
    "type.activity": "线下活动",
    "physical": "实物商品",
    "type.test": "考试",
    "activity": "线下活动",
    "form": "表单",
    "vipcard": "会员卡",
    "single": "单选题",
    "judge": "判断题",
    "multiple": "多选题",
    "indefinite": "不定项选择题",
    "fillblank": "填空题",
    "essay": "问答题",
    "exercises": "练习",
    "wxofficialaccount": "公众号",
    "wxminiprogram": "小程序",
    "h5": "H5",
    "gettype.pay": "付费获取",
    "gettype.free": "免费获取",
    "gettype.password": "密码兑换",
    "gettype.exchange": "兑换码",
    "gettype.admin": "管理员",
    "test": "考试",
    "live_gift": "直播礼物",
    "pending grading": "待批阅",
    "undefined variable": "未定义变量",
    "undefined index": "未定义数组索引",
    "undefined offset": "未定义数组下标",
    "parse error": "语法解析错误",
    "type error": "类型错误",
    "fatal error": "致命错误",
    "syntax error": "语法错误",
    "dispatch type not support": "不支持的调度类型",
    "method param miss": "方法参数错误",
    "method not exists": "方法不存在",
    "module not exists": "模块不存在",
    "controller not exists": "控制器不存在",
    "class not exists": "类不存在",
    "property not exists": "类的属性不存在",
    "template not exists": "模板文件不存在",
    "illegal controller name": "非法的控制器名称",
    "illegal action name": "非法的操作名称",
    "url suffix deny": "禁止的URL后缀访问",
    "route not found": "当前访问路由未定义",
    "undefined db type": "未定义数据库类型",
    "variable type error": "变量类型错误",
    "psr-4 error": "PSR-4 规范错误",
    "not support total": "简洁模式下不能获取数据总数",
    "not support last": "简洁模式下不能获取最后一页",
    "error session handler": "错误的SESSION处理器类",
    "not allow php tag": "模板不允许使用PHP语法",
    "not support": "不支持",
    "redisd master": "Redisd 主服务器错误",
    "redisd slave": "Redisd 从服务器错误",
    "must run at sae": "必须在SAE运行",
    "memcache init error": "未开通Memcache服务，请在SAE管理平台初始化Memcache服务",
    "kvdb init error": "没有初始化KVDB，请在SAE管理平台初始化KVDB服务",
    "fields not exists": "数据表字段不存在",
    "where express error": "查询表达式错误",
    "not support data": "不支持的数据表达式",
    "no data to update": "没有任何数据需要更新",
    "miss data to insert": "缺少需要写入的数据",
    "miss complex primary data": "缺少复合主键数据",
    "miss update condition": "缺少更新条件",
    "model data not found": "模型数据不存在",
    "table data not found": "表数据不存在",
    "delete without condition": "没有条件不会执行删除操作",
    "miss relation data": "缺少关联表数据",
    "tag attr must": "模板标签属性必须",
    "tag error": "模板标签错误",
    "cache write error": "缓存写入失败",
    "sae mc write error": "SAE mc 写入错误",
    "route name not exists": "路由标识不存在（或参数不够）",
    "invalid request": "非法请求",
    "bind attr has exists": "模型的属性已经存在",
    "relation data not exists": "关联数据不存在",
    "relation not support": "关联不支持",
    "chunk not support order": "Chunk不支持调用order方法",
    "closure not support cache(true)": "使用闭包查询不支持cache(true)，请指定缓存Key",
    "unknown upload error": "未知上传错误！",
    "file write error": "文件写入失败！",
    "upload temp dir not found": "找不到临时文件夹！",
    "no file to uploaded": "没有文件被上传！",
    "only the portion of file is uploaded": "文件只有部分被上传！",
    "upload file size exceeds the maximum value": "上传文件大小超过了最大值！",
    "upload write error": "文件上传保存错误！",
    "has the same filename: {:filename}": "存在同名文件：{:filename}",
    "upload illegal files": "非法上传文件",
    "illegal image files": "非法图片文件",
    "extensions to upload is not allowed": "上传文件后缀不允许",
    "mimetype to upload is not allowed": "上传文件MIME类型不允许！",
    "filesize not match": "上传文件大小不符！",
    "directory {:path} creation failed": "目录 {:path} 创建失败！",
    ":attribute require": ":attribute不能为空",
    ":attribute must be numeric": ":attribute必须是数字",
    ":attribute must be integer": ":attribute必须是整数",
    ":attribute must be float": ":attribute必须是浮点数",
    ":attribute must be bool": ":attribute必须是布尔值",
    ":attribute not a valid email address": ":attribute格式不符",
    ":attribute not a valid mobile": ":attribute格式不符",
    ":attribute must be a array": ":attribute必须是数组",
    ":attribute must be yes,on or 1": ":attribute必须是yes、on或者1",
    ":attribute not a valid datetime": ":attribute不是一个有效的日期或时间格式",
    ":attribute not a valid file": ":attribute不是有效的上传文件",
    ":attribute not a valid image": ":attribute不是有效的图像文件",
    ":attribute must be alpha": ":attribute只能是字母",
    ":attribute must be alpha-numeric": ":attribute只能是字母和数字",
    ":attribute must be alpha-numeric, dash, underscore": ":attribute只能是字母、数字和下划线_及破折号-",
    ":attribute not a valid domain or ip": ":attribute不是有效的域名或者IP",
    ":attribute must be chinese": ":attribute只能是汉字",
    ":attribute must be chinese or alpha": ":attribute只能是汉字、字母",
    ":attribute must be chinese,alpha-numeric": ":attribute只能是汉字、字母和数字",
    ":attribute must be chinese,alpha-numeric,underscore, dash": ":attribute只能是汉字、字母、数字和下划线_及破折号-",
    ":attribute not a valid url": ":attribute不是有效的URL地址",
    ":attribute not a valid ip": ":attribute不是有效的IP地址",
    ":attribute must be dateformat of :rule": ":attribute必须使用日期格式 :rule",
    ":attribute must be in :rule": ":attribute必须在 :rule 范围内",
    ":attribute be notin :rule": ":attribute不能在 :rule 范围内",
    ":attribute must between :1 - :2": ":attribute只能在 :1 - :2 之间",
    ":attribute not between :1 - :2": ":attribute不能在 :1 - :2 之间",
    "size of :attribute must be :rule": ":attribute长度不符合要求 :rule",
    "max size of :attribute must be :rule": ":attribute长度不能超过 :rule",
    "min size of :attribute must be :rule": ":attribute长度不能小于 :rule",
    ":attribute cannot be less than :rule": ":attribute日期不能小于 :rule",
    ":attribute cannot exceed :rule": ":attribute日期不能超过 :rule",
    ":attribute not within :rule": "不在有效期内 :rule",
    "access ip is not allowed": "不允许的IP访问",
    "access ip denied": "禁止的IP访问",
    ":attribute out of accord with :2": ":attribute和确认字段:2不一致",
    ":attribute cannot be same with :2": ":attribute和比较字段:2不能相同",
    ":attribute must greater than or equal :rule": ":attribute必须大于等于 :rule",
    ":attribute must greater than :rule": ":attribute必须大于 :rule",
    ":attribute must less than or equal :rule": ":attribute必须小于等于 :rule",
    ":attribute must less than :rule": ":attribute必须小于 :rule",
    ":attribute must equal :rule": ":attribute必须等于 :rule",
    ":attribute has exists": ":attribute已存在",
    ":attribute not conform to the rules": ":attribute不符合指定规则",
    "invalid request method": "无效的请求类型",
    "invalid token": "令牌数据无效",
    "not conform to the rules": "规则错误"
  }
}
```

## 返回参数说明

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| code | integer | 状态码：1=成功，0=业务错误，401=未登录 |
| msg | string | 提示信息 |
| data | object | 业务数据 |
| data.user center | string | 用户center |
| data.register | string | register |
| data.login | string | login |
| data.sign up successful | string | 签到upsuccessful |
| data.username can not be empty | string | 用户名是否可未待评价empty |
| data.username must be 3 to 30 characters | string | 用户名must待评价3待评价30characters |
| data.username must be 6 to 30 characters | string | 用户名must待评价6待评价30characters |
| data.password can not be empty | string | 密码是否可未待评价empty |
| data.password must be 6 to 30 characters | string | 密码must待评价6待评价30characters |
| data.mobile is incorrect | string | 手机号是否incorrect |
| data.username already exist | string | 用户名alreadyexist |
| data.nickname already exist | string | 昵称alreadyexist |
| data.email already exist | string | emailalreadyexist |
| data.mobile already exist | string | 手机号alreadyexist |
| data.username is incorrect | string | 用户名是否incorrect |
| data.email is incorrect | string | email是否incorrect |
| data.account is locked | string | 账号是否locked |
| data.password is incorrect | string | 密码是否incorrect |
| data.account is incorrect | string | 账号是否incorrect |
| data.account not exist | string | 账号未exist |
| data.account can not be empty | string | 账号是否可未待评价empty |
| data.username or password is incorrect | string | 用户名or密码是否incorrect |
| data.you are not logged in | string | youare未loggedin |
| data.you've logged in, do not login again | string | you'veloggedin,do未loginagain |
| data.profile | string | profile |
| data.verify email | string | verifyemail |
| data.change password | string | 修改密码 |
| data.captcha is incorrect | string | captcha是否incorrect |
| data.logged in successful | string | loggedinsuccessful |
| data.logout successful | string | logoutsuccessful |
| data.operation failed | string | operationfailed |
| data.invalid parameters | string | invalidparameters |
| data.change password failure | string | 修改密码failure |
| data.change password successful | string | 修改密码successful |
| data.reset password successful | string | 重置密码successful |
| data.paytype.balance | string | 余额 |
| data.paytype.wechat | string | 微信 |
| data.paytype.alipay | string | alipay |
| data.paytype.douyinpay | string | douyinpay |
| data.paytype.score | string | 积分 |
| data.paytype.virtual_pay | string | virtual支付 |
| data.controll.delete | string | 删除 |
| data.controll.evaluate | string | 评价 |
| data.controll.cancel | string | 取消 |
| data.controll.pay | string | 支付 |
| data.controll.express | string | 物流 |
| data.controll.surereceive | string | surereceive |
| data.controll.service | string | 服务承诺 |
| data.status.close | string | 关闭 |
| data.status.unpaid | string | unpaid |
| data.status.paid | string | paid |
| data.status.unreceive | string | unreceive |
| data.status.unsend | string | unsend |
| data.status.surereceive | string | surereceive |
| data.status.success | string | success |
| data.status.cancel | string | 取消 |
| data.status.service | string | 服务承诺 |
| data.status.refund | string | 退款 |
| data.wait_playback | string | wait回放 |
| data.end | string | end |
| data.run_playback | string | run回放 |
| data.not_start | string | 未start |
| data.online | string | 在线 |
| data.offline | string | offline |
| data.forbidden | string | forbidden |
| data.onlinefaild | string | onlinefaild |
| data.course | string | 课程 |
| data.video | string | video |
| data.audio | string | audio |
| data.article | string | 文案 |
| data.goods | string | 商品 |
| data.column | string | 专栏 |
| data.live | string | live |
| data.status 0 | string | 状态0 |
| data.status 1 | string | 状态1 |
| data.grade status 0 | string | grade状态0 |
| data.grade status 1 | string | grade状态1 |
| data.appid | string | AppID |
| data.serect | string | serect |
| data.token | string | 登录凭证 |
| data.pushkey | string | pushkey |
| data.url | string | 链接 |
| data.createtime | string | 创建时间（时间戳） |
| data.store_id | string | 小店ID |
| data.openid | string | OpenID |
| data.nickname | string | 昵称 |
| data.bind_time | string | 绑定时间 |
| data.sharer_type | string | 分享员类型 |
| data.unionid | string | unionid |
| data.wechat | string | 微信 |
| data.status | string | 状态 |
| data.status 2 | string | 状态2 |
| data.status 3 | string | 状态3 |
| data.status 4 | string | 状态4 |
| data.sharer type 1 | string | 分享员类型1 |
| data.sharer type 0 | string | 分享员类型0 |
| data.store.nickname | string | 昵称 |
| data.edit status 0 | string | 编辑状态0 |
| data.edit status 1 | string | 编辑状态1 |
| data.edit status 2 | string | 编辑状态2 |
| data.edit status 3 | string | 编辑状态3 |
| data.edit status 4 | string | 编辑状态4 |
| data.edit status 7 | string | 编辑状态7 |
| data.edit status 8 | string | 编辑状态8 |
| data.status 5 | string | 状态5 |
| data.status 6 | string | 状态6 |
| data.status 11 | string | 状态11 |
| data.status 13 | string | 状态13 |
| data.status 14 | string | 状态14 |
| data.status 15 | string | 状态15 |
| data.status 20 | string | 状态20 |
| data.channels_order_id | string | 视频号订单ID |
| data.order_id | string | 订单ID |
| data.mobile | string | 手机号 |
| data.buyer_remark | string | buyerremark |
| data.merch_remark | string | merchremark |
| data.live_id | string | liveID |
| data.finder_id | string | finderID |
| data.order_scene | string | 订单scene |
| data.sharer_openid | string | 分享员openid |
| data.sharer_unionid | string | 分享员unionid |
| data.handling_progress | string | handling进度 |
| data.handling_progress 1 | string | handling进度1 |
| data.handling_progress 0 | string | handling进度0 |
| data.update_time | string | 更新时间 |
| data.create_time | string | 创建时间 |
| data.member.nickname | string | 昵称 |
| data.order.real_price | string | 实付价格 |
| data.status 10 | string | 状态10 |
| data.status 21 | string | 状态21 |
| data.status 30 | string | 状态30 |
| data.status 100 | string | 状态100 |
| data.status 200 | string | 状态200 |
| data.status 250 | string | 状态250 |
| data.status 300 | string | 状态300 |
| data.sharer_type 0 | string | 分享员类型0 |
| data.sharer_type 1 | string | 分享员类型1 |
| data.share_scene | string | 分享scene |
| data.share_scene 1 | string | 分享scene1 |
| data.share_scene 2 | string | 分享scene2 |
| data.share_scene 3 | string | 分享scene3 |
| data.share_scene 4 | string | 分享scene4 |
| data.share_scene 5 | string | 分享scene5 |
| data.share_scene 6 | string | 分享scene6 |
| data.share_scene 7 | string | 分享scene7 |
| data.share_scene 8 | string | 分享scene8 |
| data.share_scene 9 | string | 分享scene9 |
| data.share_scene 10 | string | 分享scene10 |
| data.share_scene 11 | string | 分享scene11 |
| data.share_scene 12 | string | 分享scene12 |
| data.share_scene 13 | string | 分享scene13 |
| data.orderscene 1 | string | orderscene1 |
| data.orderscene 2 | string | orderscene2 |
| data.orderscene 3 | string | orderscene3 |
| data.orderscene 4 | string | orderscene4 |
| data.orderscene 5 | string | orderscene5 |
| data.orderscene 6 | string | orderscene6 |
| data.waiting | string | 待支付 |
| data.refuse | string | refuse |
| data.success | string | success |
| data.keep login | string | keeplogin |
| data.username | string | 用户名 |
| data.user id | string | 用户ID |
| data.password | string | 密码 |
| data.sign up | string | 签到up |
| data.sign in | string | 签到in |
| data.sign out | string | 签到out |
| data.guest | string | guest |
| data.welcome | string | welcome |
| data.add | string | 添加 |
| data.edit | string | 编辑 |
| data.delete | string | 删除 |
| data.move | string | move |
| data.name | string | 名称 |
| data.weigh | string | 权重（排序值） |
| data.operate | string | operate |
| data.warning | string | warning |
| data.default | string | 默认 |
| data.page | string | 页码 |
| data.ok | string | ok |
| data.cancel | string | 取消 |
| data.loading | string | 加载状态 |
| data.more | string | more |
| data.normal | string | 普通 |
| data.hidden | string | 是否隐藏 |
| data.submit | string | 提交 |
| data.reset | string | 重置 |
| data.execute | string | execute |
| data.close | string | 关闭 |
| data.search | string | search |
| data.refresh | string | 刷新 |
| data.first | string | first |
| data.previous | string | previous |
| data.next | string | next |
| data.last | string | last |
| data.none | string | none |
| data.home | string | 主页 |
| data.logout | string | logout |
| data.index | string | 列表 |
| data.hot | string | hot |
| data.recommend | string | 推荐 |
| data.dashboard | string | dashboard |
| data.code | string | code |
| data.message | string | 消息 |
| data.line | string | line |
| data.file | string | 文件 |
| data.menu | string | menu |
| data.type | string | 类型 |
| data.title | string | 标题 |
| data.content | string | 内容 |
| data.append | string | append |
| data.memo | string | memo |
| data.parent | string | 上级 |
| data.params | string | 商品参数 |
| data.permission | string | permission |
| data.advance search | string | advancesearch |
| data.check all | string | 校验全部 |
| data.expand all | string | expand全部 |
| data.begin time | string | begin时间 |
| data.end time | string | end时间 |
| data.create time | string | 创建时间 |
| data.flag | string | flag |
| data.please login first | string | pleaseloginfirst |
| data.uploaded successful | string | uploadedsuccessful |
| data.you can upload up to %d file%s | string | you是否可上传up待评价%dfile%s |
| data.you can choose up to %d file%s | string | you是否可chooseup待评价%dfile%s |
| data.chunk file write error | string | chunk文件write错题 |
| data.chunk file info error | string | chunk文件信息错题 |
| data.chunk file merge error | string | chunk文件合并错题 |
| data.chunk file disabled | string | chunk文件disabled |
| data.cancel upload | string | 取消上传 |
| data.upload canceled | string | 上传canceled |
| data.no file upload or server upload limit exceeded | string | 号文件上传orserver上传limitexceeded |
| data.uploaded file format is limited | string | uploaded文件format是否limited |
| data.uploaded file is not a valid image | string | uploaded文件是否未avalid图片 |
| data.are you sure you want to cancel this upload? | string | areyousureyouwant待评价取消thisupload? |
| data.remove file | string | remove文件 |
| data.you can only upload a maximum of %s files | string | you是否可only上传amaximumof%sfiles |
| data.you can't upload files of this type | string | youcan't上传filesofthis类型 |
| data.server responded with %s code | string | serverrespondedwith%scode |
| data.file is too big (%smib), max filesize: %smib | string | 文件是否toobig(%smib),maxfilesize:%smib |
| data.redirect now | string | redirectnow |
| data.operation completed | string | operationcompleted |
| data.unknown data format | string | unknown数据format |
| data.network error | string | network错题 |
| data.advanced search | string | advancedsearch |
| data.no results were found | string | 号resultswerefound |
| data.parameter %s can not be empty | string | parameter%s是否可未待评价empty |
| data.you have no permission | string | youhave号permission |
| data.an unexpected error occurred | string | anunexpected错题occurred |
| data.this page will be re-directed in %s seconds | string | this页码will待评价redirectedin%sseconds |
| data.pay_wechat | string | 支付微信 |
| data.pay_alipay | string | 支付alipay |
| data.pay_douyinpay | string | 支付douyinpay |
| data.pay_balance | string | 支付余额 |
| data.pay_virtual_pay | string | 支付virtual支付 |
| data.type.article | string | 文案 |
| data.type.physical | string | 实物 |
| data.type.video | string | video |
| data.type.audio | string | audio |
| data.type.column | string | 专栏 |
| data.type.live_gift | string | live礼物 |
| data.type.form | string | 表单 |
| data.type.evaluation | string | evaluation |
| data.evaluation | string | evaluation |
| data.type.activity | string | 活动 |
| data.physical | string | 实物 |
| data.type.test | string | 考试 |
| data.activity | string | 活动 |
| data.form | string | 表单 |
| data.vipcard | string | vipcard |
| data.single | string | single |
| data.judge | string | judge |
| data.multiple | string | multiple |
| data.indefinite | string | indefinite |
| data.fillblank | string | fillblank |
| data.essay | string | essay |
| data.exercises | string | 练习 |
| data.wxofficialaccount | string | wxofficialaccount |
| data.wxminiprogram | string | wxminiprogram |
| data.h5 | string | H5 |
| data.gettype.pay | string | 支付 |
| data.gettype.free | string | free |
| data.gettype.password | string | 密码 |
| data.gettype.exchange | string | 兑换 |
| data.gettype.admin | string | admin |
| data.test | string | 考试 |
| data.live_gift | string | live礼物 |
| data.pending grading | string | pendinggrading |
| data.undefined variable | string | undefinedvariable |
| data.undefined index | string | undefined列表 |
| data.undefined offset | string | undefinedoffset |
| data.parse error | string | parse错题 |
| data.type error | string | 类型错题 |
| data.fatal error | string | fatal错题 |
| data.syntax error | string | syntax错题 |
| data.dispatch type not support | string | dispatch类型未support |
| data.method param miss | string | methodparammiss |
| data.method not exists | string | method未exists |
| data.module not exists | string | module未exists |
| data.controller not exists | string | controller未exists |
| data.class not exists | string | class未exists |
| data.property not exists | string | property未exists |
| data.template not exists | string | template未exists |
| data.illegal controller name | string | illegalcontroller名称 |
| data.illegal action name | string | illegal操作名称 |
| data.url suffix deny | string | 链接suffixdeny |
| data.route not found | string | route未found |
| data.undefined db type | string | undefineddb类型 |
| data.variable type error | string | variable类型错题 |
| data.psr-4 error | string | psr4错题 |
| data.not support total | string | 未support合计 |
| data.not support last | string | 未supportlast |
| data.error session handler | string | 错题会话handler |
| data.not allow php tag | string | 未allowphptag |
| data.not support | string | 未support |
| data.redisd master | string | redisdmaster |
| data.redisd slave | string | redisdslave |
| data.must run at sae | string | mustrunatsae |
| data.memcache init error | string | memcache初始化错题 |
| data.kvdb init error | string | kvdb初始化错题 |
| data.fields not exists | string | fields未exists |
| data.where express error | string | where物流错题 |
| data.not support data | string | 未support数据 |
| data.no data to update | string | 号数据待评价更新 |
| data.miss data to insert | string | miss数据待评价insert |
| data.miss complex primary data | string | misscomplexprimary数据 |
| data.miss update condition | string | miss更新条件 |
| data.model data not found | string | model数据未found |
| data.table data not found | string | table数据未found |
| data.delete without condition | string | 删除without条件 |
| data.miss relation data | string | missrelation数据 |
| data.tag attr must | string | tagattrmust |
| data.tag error | string | tag错题 |
| data.cache write error | string | cachewrite错题 |
| data.sae mc write error | string | saemcwrite错题 |
| data.route name not exists | string | route名称未exists |
| data.invalid request | string | invalidrequest |
| data.bind attr has exists | string | 绑定attr是否有exists |
| data.relation data not exists | string | relation数据未exists |
| data.relation not support | string | relation未support |
| data.chunk not support order | string | chunk未support订单 |
| data.closure not support cache(true) | string | closure未supportcache(true) |
| data.unknown upload error | string | unknown上传错题 |
| data.file write error | string | 文件write错题 |
| data.upload temp dir not found | string | 上传temp目录未found |
| data.no file to uploaded | string | 号文件待评价uploaded |
| data.only the portion of file is uploaded | string | onlytheportionof文件是否uploaded |
| data.upload file size exceeds the maximum value | string | 上传文件数量exceedsthemaximumvalue |
| data.upload write error | string | 上传write错题 |
| data.has the same filename: {:filename} | string | 是否有thesamefilename:{:filename} |
| data.upload illegal files | string | 上传illegalfiles |
| data.illegal image files | string | illegal图片files |
| data.extensions to upload is not allowed | string | extensions待评价上传是否未allowed |
| data.mimetype to upload is not allowed | string | mimetype待评价上传是否未allowed |
| data.filesize not match | string | filesize未match |
| data.directory {:path} creation failed | string | directory{:path}creationfailed |
| data.:attribute require | string | :attributerequire |
| data.:attribute must be numeric | string | :attributemust待评价numeric |
| data.:attribute must be integer | string | :attributemust待评价integer |
| data.:attribute must be float | string | :attributemust待评价float |
| data.:attribute must be bool | string | :attributemust待评价bool |
| data.:attribute not a valid email address | string | :attribute未avalidemail地址 |
| data.:attribute not a valid mobile | string | :attribute未avalid手机号 |
| data.:attribute must be a array | string | :attributemust待评价aarray |
| data.:attribute must be yes,on or 1 | string | :attributemust待评价yes,onor1 |
| data.:attribute not a valid datetime | string | :attribute未avaliddatetime |
| data.:attribute not a valid file | string | :attribute未avalid文件 |
| data.:attribute not a valid image | string | :attribute未avalid图片 |
| data.:attribute must be alpha | string | :attributemust待评价alpha |
| data.:attribute must be alpha-numeric | string | :attributemust待评价alphanumeric |
| data.:attribute must be alpha-numeric, dash, underscore | string | :attributemust待评价alphanumeric,dash,underscore |
| data.:attribute not a valid domain or ip | string | :attribute未avaliddomainorip |
| data.:attribute must be chinese | string | :attributemust待评价chinese |
| data.:attribute must be chinese or alpha | string | :attributemust待评价chineseoralpha |
| data.:attribute must be chinese,alpha-numeric | string | :attributemust待评价chinese,alphanumeric |
| data.:attribute must be chinese,alpha-numeric,underscore, dash | string | :attributemust待评价chinese,alphanumeric,underscore,dash |
| data.:attribute not a valid url | string | :attribute未avalid链接 |
| data.:attribute not a valid ip | string | :attribute未avalidip |
| data.:attribute must be dateformat of :rule | string | :attributemust待评价dateformatof:rule |
| data.:attribute must be in :rule | string | :attributemust待评价in:rule |
| data.:attribute be notin :rule | string | :attribute待评价notin:rule |
| data.:attribute must between :1 - :2 | string | :attributemustbetween:1:2 |
| data.:attribute not between :1 - :2 | string | :attribute未between:1:2 |
| data.size of :attribute must be :rule | string | 数量of:attributemust待评价:rule |
| data.max size of :attribute must be :rule | string | max数量of:attributemust待评价:rule |
| data.min size of :attribute must be :rule | string | min数量of:attributemust待评价:rule |
| data.:attribute cannot be less than :rule | string | :attributecannot待评价lessthan:rule |
| data.:attribute cannot exceed :rule | string | :attributecannotexceed:rule |
| data.:attribute not within :rule | string | :attribute未within:rule |
| data.access ip is not allowed | string | accessip是否未allowed |
| data.access ip denied | string | accessipdenied |
| data.:attribute out of accord with :2 | string | :attributeoutofaccordwith:2 |
| data.:attribute cannot be same with :2 | string | :attributecannot待评价samewith:2 |
| data.:attribute must greater than or equal :rule | string | :attributemustgreaterthanorequal:rule |
| data.:attribute must greater than :rule | string | :attributemustgreaterthan:rule |
| data.:attribute must less than or equal :rule | string | :attributemustlessthanorequal:rule |
| data.:attribute must less than :rule | string | :attributemustlessthan:rule |
| data.:attribute must equal :rule | string | :attributemustequal:rule |
| data.:attribute has exists | string | :attribute是否有exists |
| data.:attribute not conform to the rules | string | :attribute未conform待评价therules |
| data.invalid request method | string | invalidrequestmethod |
| data.invalid token | string | invalidtoken |
| data.not conform to the rules | string | 未conform待评价therules |
