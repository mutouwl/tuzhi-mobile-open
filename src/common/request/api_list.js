import popup from "../../components/uview-ui/libs/config/props/popup";

/**
 * 接口列表文件
 */
export default {

	common: {
		lang: {
			url: "common/lang",
			auth: false,
			method: 'POST'
		},
		init: {
			url: "common/init",
			auth: false,
			method: 'POST'
		},
		agreenment: {
			url: "common/agreenment",
			auth: false,
			method: 'POST'
		}
	},
	upload: {
		/** 上传图片 ↓ **/
		// image: {
		// 	url: 'upload/image',
		// 	auth: false,
		// 	method: 'POST',
		// 	// desc: '上传',
		// },
		image: {
			url: 'common/upload',
			auth: false,
			method: 'POST',
			// desc: '上传',
		},

		/** 上传Base64图片 ↓ **/
		base64: {
			url: 'upload/uploadBase64',
			auth: false,
			method: 'POST',
			// desc: '上传Base64位图片',
		},

		/** 上传直传（OSS/VOD，需登录）↓ **/
		config: {
			url: 'upload/config',
			auth: true,
			method: 'POST',
		},
		ossParams: {
			url: 'upload/ossParams',
			auth: true,
			method: 'POST',
		},
		vodUrl: {
			url: 'upload/vodUrl',
			auth: true,
			method: 'POST',
		},
		vodRefresh: {
			url: 'upload/vodRefresh',
			auth: true,
			method: 'POST',
		},
		vodNotify: {
			url: 'upload/vodNotify',
			auth: true,
			method: 'POST',
		},
		/**
		 * OSS 直传成功后的客户端补记（服务端幂等）：OSS 回调不可达的部署场景由它兜底，
		 * 与 vodNotify 同一档。调用点在 common/utils/tools.js 的 OSS 上传 success 回调里。
		 * 这一条曾经漏登记——getApiObj 取不到键会**同步抛错**，于是上传明明成功，
		 * 后面的 hideLoading / toast / resolve 全不执行，调用方的上传 Promise 永不 settle
		 * （症状＝文件传完了页面还在转圈）。由 scripts/check-api-keys.js 补回。
		 */
		ossNotify: {
			url: 'upload/ossNotify',
			auth: true,
			method: 'POST',
		},
	},
	/** 微信Jssdk ↓ **/
	wechat: {
		jssdk: {
			url: 'wechat/jssdk',
			auth: false,
			method: 'POST',
			// desc: '微信Jssdk',
		},
	},

	/** 短信 ↓ **/
	sms: {
		send: {
			url: 'sms/send',
			auth: false,
			method: 'POST',
			// desc: '发送短信',
		},
		check: {
			url: 'sms/check',
			auth: false,
			method: 'POST',
			// desc: '验证短信',
		},
	},

	/** 自定义页面 ↓ **/
	page: {
		decorate: {
			getPage: {
				url: 'page/decorate/getPage',
				auth: false,
				method: 'POST',
				// desc: '获取页面',
			},
			isIndex: {
				url: 'page/decorate/isIndex',
				auth: false,
				method: 'POST'
			}
		},
		navigation: {
			getNavigation: {
				url: 'page/navigation/getNavigation',
				auth: false,
				method: 'POST',
				// desc: '获取页面',
			}
		},
		userCenter: {
			getConfig: {
				url: 'page/user_center/getConfig',
				auth: false,
				method: 'POST'
				// desc: '个人中心装修配置，未装修时 data.config 为 null'
			}
		}

	},
	/** 支付 ↓ **/
	// pay: {
	// 	handle: {
	// 		url: 'order/pay/handle',
	// 		auth: false,
	// 		method: 'POST',
	// 		// desc: '拉起支付',
	// 	}
	// },
	/** 支付 ↓ **/
	pay: {
		handle: {
			url: 'pay/handle',
			auth: false,
			method: 'POST',
			// desc: '拉起支付',
		},
		getPayType: {
			url: 'pay/getPayType',
			auth: false,
			method: 'POST',
			// desc: '支付渠道',
		}
	},
	goods: {
		list: {
			url: 'goods/goods/index',
			auth: false,
			method: 'POST',
			// desc: '拉起支付',
		}
	},
	/** 订单 ↓ **/
	order: {

		//售后
		service:{
			reason:{
				url: 'order/service/getRefundReason',
				auth: false,
				method: 'POST',
				// desc: '获取退款原因',
			},
			apply:{
				url: 'order/service/apply',
				auth: false,
				method: 'POST',
				// desc: '提交售后申请',
			},
			cancel:{
				url: 'order/service/cancel',
				auth: false,
				method: 'POST',
				// desc: '撤销售后申请',
			},
			detail:{
				url: 'order/service/getDetail',
				auth: false,
				method: 'POST',
				// desc: '售后详情',
			},
			refundLog:{
				url: 'order/service/getRefundLog',
				auth: false,
				method: 'POST',
				// desc: '获取退款记录',
			}
		},

		//订阅
		subscription: {
			password: {
				url: 'course/subscription/passwordPay',
				auth: false,
				method: 'POST',
				// desc: '密码订阅',
			},
			free: {
				url: 'course/subscription/free',
				auth: false,
				method: 'POST',
				// desc: '免费订阅',
			},
			getMySubscription: {
				url: 'course/subscription/getMySubscription',
				auth: false,
				method: 'POST',
				// desc: '我的订阅',
			}
		},
		create: {
			url: 'order/order/createOrder',
			auth: false,
			method: 'POST',
			// desc: '创建订单',
		},
		detail: {
			url: 'order/order/getDetail',
			auth: false,
			method: 'POST',
			// desc: '订单详情',
		},
		list: {
			url: 'order/order/getOrderList',
			auth: false,
			method: 'POST',
			// desc: '订单详情',
		},
		calculate: {
			url: 'order/order/calculate',
			auth: false,
			method: 'POST',
			// desc: '订单核算',
		},
		status: {
			cancel: {
				url: 'order/order/cancelOrder',
				auth: false,
				method: 'POST',
				// desc: '取消订单',
			},
			delete: {
				url: 'order/order/deleteOrder',
				auth: false,
				method: 'POST',
				// desc: '删除订单',
			},
			confirmReceive: {
				url: 'order/order/confirmReceive',
				auth: true,
				method: 'POST',
				// desc: '确认收货',
			}
		},
		//评价
		evaluate: {
			getBeItems: {
				url: 'order/evaluate/getBeItems',
				auth: false,
				method: 'POST',
				// desc: '获取待评价的商品',
			},
			getToItemInfo: {
				url: 'order/evaluate/getToItemInfo',
				auth: false,
				method: 'POST',
				// desc: '获取待评价的商品',
			},
			submit: {
				url: 'order/evaluate/submit',
				auth: false,
				method: 'POST',
				// desc: '获取待评价的商品',
			},
			list: {
				url: 'order/evaluate/getList',
				auth: false,
				method: 'POST',
				// desc: '获取待评价的商品',
			},

			getCourseRecommendList: {
				url: 'order/evaluate/getCourseRecommendList',
				auth: false,
				method: 'POST',
				// desc: '获取课程推荐的评价',
			},
		}
	},
	/** 用户 ↓ **/
	user: {
		// 消息通知
		message: {
			list: {
				url: 'user/message/getList',
				auth:  false,
				method: 'POST',
				// desc: '获取消息/通知列表',
			}
		},
		/** 收藏 ↓ **/
		collect: {
			setCollect: {
				url: 'user/collect/setCollect',
				auth: false,
				method: 'POST',
				// desc: '设置收藏',
			},
			getIsCollect: {
				url: 'user/collect/getIsCollect',
				auth: false,
				method: 'POST',
				// desc: '收藏状态',
			},
			getMyCollect: {
				url: 'user/collect/getMyCollect',
				auth: false,
				method: 'POST',
				// desc: '获取收藏列表',
			},
		},
		//合并账号
		merge:{
			bindUserInfo:{
				url: 'user/merge/getMergeAccount',
				auth: false,
				method: 'POST',
				// desc: '获取被绑定账号信息',
			},
			submit:{
				url: 'user/merge/submit',
				auth: false,
				method: 'POST',
				// desc: '提交合并申请',
			}
		},
		info: {
			login: {
				url: 'user/info/login',
				auth: false,
				method: 'POST',
				// desc: '用户登陆',
			},
			tokenLogin: {
				url: 'user/info/tokenLogin',
				auth: false,
				method: 'POST',
				// desc: '用户登陆',
			},
			wxAccountLogin: {
				url: 'user/info/wxAccountLogin',
				auth: false,
				method: 'POST',
				// desc: '微信公众号登录',
			},
			getDyMiniProgramSessionKey: {
				url: 'user/info/getDyMiniProgramSessionKey',
				auth: false,
				method: 'POST',
				// desc: '获取抖音小程序session_key',
			},
			
			dyMiniProgramLogin: {
				url: 'user/info/dyMiniProgramLogin',
				auth: false,
				method: 'POST',
				// desc: '抖音小程序登录',
			},
			getWxMiniProgramSessionKey: {
				url: 'user/info/getWxMiniProgramSessionKey',
				auth: false,
				method: 'POST',
				// desc: '获取微信小程序session_key',
			},
			wxMiniProgramLogin: {
				url: 'user/info/wxMiniProgramLogin',
				auth: false,
				method: 'POST',
				// desc: '微信小程序登录',
			},
			mobilelogin: {
				url: 'user/info/mobilelogin',
				auth: false,
				method: 'POST',
				// desc: '手机号登陆',
			},
			changemobile: {
				url: 'user/info/changemobile',
				auth: false,
				method: 'POST',
				// desc: '修改手机号',
			},

			register: {
				url: 'user/info/register',
				auth: false,
				method: 'POST',
				// desc: '用户注册',
			},
			resetpwd: {
				url: 'user/info/resetpwd',
				auth: false,
				method: 'POST',
				// desc: '找回密码',
			},
			index: {
				url: 'user/info/index',
				auth: false,
				method: 'POST',
				// desc: '用户信息',
			},
			profile: {
				url: 'user/info/profile',
				auth: false,
				method: 'POST',
				// desc: '修改资料',
			},
			logout: {
				url: 'user/info/logout',
				auth: false,
				method: 'POST',
				// desc: '退出登陆',
			}
		},
		assets: {
			getAssetsLog: {
				url: 'user/assets/getAssetsLog',
				auth: false,
				method: 'POST',
				// desc: '用户资产信息',
			}
		},
		/** 账户提现 ↓ **/
		withdraw: {
			getBalance: {
				url: 'user/withdraw/getBalance',
				auth: true,
				method: 'POST',
			},
			submit: {
				url: 'user/withdraw/submit',
				auth: true,
				method: 'POST',
			},
			getLog: {
				url: 'user/withdraw/getLog',
				auth: true,
				method: 'POST',
			},
			getWechatReceiveParams: {
				url: 'user/withdraw/getWechatReceiveParams',
				auth: true,
				method: 'POST',
			},
			syncWechatTransfer: {
				url: 'user/withdraw/syncWechatTransfer',
				auth: true,
				method: 'POST',
			},
			getAccount: {
				url: 'user/withdraw/getAccount',
				auth: true,
				method: 'POST',
			},
			saveAccount: {
				url: 'user/withdraw/saveAccount',
				auth: true,
				method: 'POST',
			},
			delAccount: {
				url: 'user/withdraw/delAccount',
				auth: true,
				method: 'POST',
			},
			setDefaultAccount: {
				url: 'user/withdraw/setDefaultAccount',
				auth: true,
				method: 'POST',
			},
		},
		/** 收货地址 ↓ **/
		address: {
			index: {
				url: 'user/address/index',
				auth: false,
				method: 'POST',
				// desc: '地址列表',
			},
			default: {
				url: 'user/address/default',
				auth: false,
				method: 'POST',
				// desc: '获取默认地址',
			},
			detail: {
				url: 'user/address/detail',
				auth: false,
				method: 'POST',
				// desc: '地址详情',
			},
			save: {
				url: 'user/address/save',
				auth: false,
				method: 'POST',
				// desc: '添加/编辑地址',
			},
			delete: {
				url: 'user/address/delete',
				auth: false,
				method: 'POST',
				// desc: '删除地址',
			},
			setDefault: {
				url: 'user/address/setDefault',
				auth: false,
				method: 'POST',
				// desc: '设置默认地址',
			},
			parse: {
				url: 'user/address/parse',
				auth: false,
				method: 'POST',
				// desc: '智能识别地址',
			}
		}

	},
	/** 学习中心 ↓ **/
	study: {
		setLog: {
			url: 'user/study/setLog',
			auth:  false,
			method: 'POST',
			// desc: '添加记录',
		},
		finish: {
			url: 'user/study/finish',
			auth:  false,
			method: 'POST',
			// desc: '完成',
		},
		getLog: {
			url: 'user/study/getStudyLog',
			auth: false,
			method: 'POST',
			// desc: '学习记录',
		},
		getStatistics: {
			url: 'user/study/getStatistics',
			auth: false,
			method: 'POST',
			// desc: '学习统计',
		},
		getStudyTime: {
			url: 'user/study/getStudyTime',
			auth: false,
			method: 'POST',
			// desc: '累计学习时长（分钟）',
		},
		getContinuousStudyDays: {
			url: 'user/study/getContinuousStudyDays',
			auth: false,
			method: 'POST',
			// desc: '连续学习天数',
		},
		media:{
			progress: {
				url: 'user/study/getMediaProgress',
				auth: false,
				method: 'POST',
				// desc: '媒体播放进度',
			}
		}
	},

	/** 直播 ↓ **/
	live: {
		courseware: {
			list: {
				url: 'live/courseware/getCoursewareList',
				auth: false,
				method: 'POST',
				// desc: '课件列表',
			},
		},
		message: {
		send: {
			url: 'live/message/send',
			auth: false,
			method: 'POST',
			// desc: '发送消息',
		},
		list: {
			url: 'live/message/getMessageList',
			auth: false,
			method: 'POST',
			// desc: '消息记录',
		},
		getAliyunAuth: {
			url: 'live/message/getAliyunAuth',
			auth: false,
			method: 'POST',
			// desc: '获取阿里云互动消息鉴权信息',
		}
	},
		gift:{
			options: {
				url: 'live/gift/getGiftOptions',
				auth: false,
				method: 'POST',
				// desc: '礼物列表',
			},
			send: {
				url: 'live/gift/send',
				auth: false,
				method: 'POST',
				// desc: '赠送礼物',
			},
		},
		/** 直播红包 ↓ **/
		redpacket: {
			getActive: {
				url: 'live/red_packet/getActive',
				auth: true,
				method: 'POST',
			},
			grab: {
				url: 'live/red_packet/grab',
				auth: true,
				method: 'POST',
			},
			detail: {
				url: 'live/red_packet/detail',
				auth: true,
				method: 'POST',
			},
			getList: {
				url: 'live/red_packet/getList',
				auth: true,
				method: 'POST',
			},
			getMyList: {
				url: 'live/red_packet/getMyList',
				auth: true,
				method: 'POST',
			},
		},
		goods:{
			list: {
				url: 'live/goods/index',
				auth: false,
				method: 'POST',
				// desc: '带货商品列表',
			},
			explaining: {
				url: 'live/goods/explaining',
				auth: false,
				method: 'POST',
				// desc: '讲解中的商品',
			},
			action: {
				url: 'live/goods/action',
				auth: false,
				method: 'POST',
				// desc: '讲解中的商品',
			}
		},
		/** 直播连麦 ↓（live_link） */
		link: {
			apply: {
				url: 'live/link/apply',
				auth: true,
				method: 'POST',
			},
			accept: {
				url: 'live/link/accept',
				auth: true,
				method: 'POST',
			},
			reject: {
				url: 'live/link/reject',
				auth: true,
				method: 'POST',
			},
			cancel: {
				url: 'live/link/cancel',
				auth: true,
				method: 'POST',
			},
			end: {
				url: 'live/link/end',
				auth: true,
				method: 'POST',
			},
			info: {
				url: 'live/link/getLinkInfo',
				auth: true,
				method: 'POST',
			},
			list: {
				url: 'live/link/getLinkList',
				auth: true,
				method: 'POST',
			},
			updateLocal: {
				url: 'live/link/updateLocal',
				auth: true,
				method: 'POST',
			},
		},
		room: {
			detail: {
				url: 'live/room/getRoomDetail',
				auth: false,
				method: 'POST',
				// desc: '直播间详情',
			},
			playback: {
				url: 'live/room/getPlaybackList',
				auth: false,
				method: 'POST',
				// desc: '获取回放视频',
			},
			status: {
				url: 'live/room/getRoomStatus',
				auth: false,
				method: 'POST',
				// desc: '获取直播间状态',
			},
			getOnlineUserNum: {
				url: 'live/room/getOnlineUserNum',
				auth: false,
				method: 'POST',
				// desc: '获取在线观看人数',
			}
		}
	},

	/** 全部商品 ↓ **/
	physical: {
			physical: {
				index: {
					url: 'app/physical/goods/index',
					auth: false,
					method: 'POST',
					// desc: '商品列表',
				},
				ids: {
					url: 'app/physical/goods/ids',
					auth: false,
					method: 'POST',
					// desc: '通过IDs获取商品',
				},
				detail: {
					url: 'app/physical/goods/detail',
					auth: false,
					method: 'POST',
					// desc: '商品详情',
				}
			},
			category: {
				index: {
					url: 'app/physical/category/index',
				auth: false,
				method: 'POST',
				// desc: '分类列表',
			},
			all: {
				url: 'app/physical/category/all',
				auth: false,
				method: 'POST',
				// desc: '所有分类树',
			}
		},
		express: {
			detail: {
				url: 'app/physical/express/detail',
				auth: true,
				method: 'POST',
				// desc: '查看物流记录',
			},
				refresh: {
					url: 'app/physical/express/refresh',
					auth: true,
					method: 'POST',
					// desc: '刷新物流信息',
				}
			}
		},

	/** 组合商品 ↓ **/
	composite: {
		composite: {
			index: {
				url: 'app/composite/goods/index',
				auth: false,
				method: 'POST',
			},
			ids: {
				url: 'app/composite/goods/ids',
				auth: false,
				method: 'POST',
			},
			detail: {
				url: 'app/composite/goods/detail',
				auth: false,
				method: 'POST',
			}
		}
	},

	/** 打卡 ↓ **/
	checkin: {
		checkin: {
			myList: {
				url: 'app/checkin/checkin/myList',
				auth: true,
				method: 'POST',
			},
			// 可参与的打卡分页列表（myList 的 discover 段只给首屏预览条数，全量走这个接口）
			discoverList: {
				url: 'app/checkin/checkin/discoverList',
				auth: true,
				method: 'POST',
			},
			detail: {
				url: 'app/checkin/checkin/detail',
				auth: true,
				method: 'POST',
			},
			// 任务详情（任务正文 + 打卡态）：只带 task_id 也能取，分享链接落这一页
			taskDetail: {
				url: 'app/checkin/checkin/taskDetail',
				auth: true,
				method: 'POST',
			},
			// 发表动态页的媒体上限（图片/视频/语音/附件数量与大小）；此前只在控制器有动作、
			// 这里没登记，$api 解析不到键名，提交页取上限的请求实际是发不出去的
			publishConfig: {
				url: 'app/checkin/checkin/publishConfig',
				auth: true,
				method: 'POST',
			},
			feed: {
				url: 'app/checkin/checkin/feed',
				auth: true,
				method: 'POST',
			},
			join: {
				url: 'app/checkin/checkin/join',
				auth: true,
				method: 'POST',
			},
			passwordPay: {
				url: 'app/checkin/checkin/passwordPay',
				auth: true,
				method: 'POST',
			},
			calendar: {
				url: 'app/checkin/checkin/calendar',
				auth: true,
				method: 'POST',
			},
			setNickname: {
				url: 'app/checkin/checkin/setNickname',
				auth: true,
				method: 'POST',
			},
			taskCalendar: {
				url: 'app/checkin/checkin/taskCalendar',
				auth: true,
				method: 'POST',
			},
			rank: {
				url: 'app/checkin/checkin/rank',
				auth: true,
				method: 'POST',
			},
			memberList: {
				url: 'app/checkin/checkin/memberList',
				auth: true,
				method: 'POST',
			},
			dayDetail: {
				url: 'app/checkin/checkin/dayDetail',
				auth: true,
				method: 'POST',
			},
			submit: {
				url: 'app/checkin/checkin/submit',
				auth: true,
				method: 'POST',
			},
			diaryDetail: {
				url: 'app/checkin/checkin/diaryDetail',
				auth: true,
				method: 'POST',
			},
			like: {
				url: 'app/checkin/checkin/like',
				auth: true,
				method: 'POST',
			},
			comment: {
				url: 'app/checkin/checkin/comment',
				auth: true,
				method: 'POST',
			},
			commentList: {
				url: 'app/checkin/checkin/commentList',
				auth: true,
				method: 'POST',
			},
			// 评论点赞（幂等切换）：共用评论组件的点赞入口用，接口名由调用页下发给 tz-circle-comment
			commentLike: {
				url: 'app/checkin/checkin/commentLike',
				auth: true,
				method: 'POST',
			},
			deleteOwn: {
				url: 'app/checkin/checkin/deleteOwn',
				auth: true,
				method: 'POST',
			},
			// 编辑自己已发的打卡日记（正文/媒体/可见范围），提交页编辑态用
			editOwn: {
				url: 'app/checkin/checkin/editOwn',
				auth: true,
				method: 'POST',
			},
			shareInfo: {
				url: 'app/checkin/checkin/shareInfo',
				auth: true,
				method: 'POST',
			},
		},
		// 按课程反查打卡活动（课程详情页底栏「打卡」入口）：未登录也要能判断这门课有没有关联活动，
		// 故 auth=false，与同形状的 app.form.checkBeforeLearn 一样收 course_id + 可选 column_id
		course: {
			courseCheckin: {
				url: 'app/checkin/course/courseCheckin',
				auth: false,
				method: 'POST',
			},
		},
		// 我的日记列表（「我的打卡」页第二个页签）：跨活动按发布时间倒序，
		// 每行带 checkin_id/checkin_title（打卡 Tag）与 task_id/task_title（任务 Tag），
		// 详情进打卡日记页（pages/app/checkin/diary，复用现有日记组件）
		diary: {
			myList: {
				url: 'app/checkin/diary/myList',
				auth: true,
				method: 'POST',
			},
		},
		// 打卡介绍页（pages/app/checkin/intro）：分享出去的落地页，未登录也要看得清「这是什么活动、
		// 多少钱、怎么参与」，故 auth=false，与 course.courseCheckin 同一档。
		// 只出活动段（封面/名称/统计/打卡信息/活动介绍/关联课程 + is_member/is_black/has_course），
		// 任务栏与动态流仍在 checkin.checkin.detail（主页用，auth=true）；
		// 参与/购买/密码兑换那几个按钮都留 auth=true，未登录点它们由请求层统一弹「请登录后继续操作」
		intro: {
			detail: {
				url: 'app/checkin/intro/detail',
				auth: false,
				method: 'POST',
			},
		},
	},
	/** 分享有礼（直播拉新付费插件）↓
	 *  入口与列表免登录（右侧悬浮图标、活动列表要出得来看，判据同 api Gift::$noNeedLogin）；
	 *  助力/参与/领奖/我的奖品/地址簿都要登录态。状态文案与选项表由接口 attr 下发，前端不写死。 **/
	share_gift: {
		gift: {
			list: {
				url: 'app/share_gift/gift/list',
				auth: false,
				method: 'POST',
			},
			detail: {
				url: 'app/share_gift/gift/detail',
				auth: false,
				method: 'POST',
			},
			assist: {
				url: 'app/share_gift/gift/assist',
				auth: true,
				method: 'POST',
			},
			join: {
				url: 'app/share_gift/gift/join',
				auth: true,
				method: 'POST',
			},
		},
	},
	/** 拼团（付费插件 group_buy）↓
	 *  活动详情/在线凑团免登录（商详页那一段只放宽「看」，判据同 api Activity::$noNeedLogin）；
	 *  「我的拼团」列表与团详情都是本人的东西，要登录态。
	 *  状态文案（team_label / status_label）由接口逐行下发，前端不写死（W69 / 硬约束 35）。
	 *  ⚠ `$api` 是 common/request/index.js 默认导出的**函数**，没有 `.post` 这一档：
	 *   `this.$api.post('app/group_buy/…')` 会在取数那一刻抛 `is not a function`，
	 *  页面永远停在骨架屏；调用一律写成本表登记过的键（`this.$api('group_buy.team.myList', …)`） **/
	group_buy: {
		activity: {
			detail: {
				url: 'app/group_buy/activity/detail',
				auth: false,
				method: 'POST',
			},
			teams: {
				url: 'app/group_buy/activity/teams',
				auth: false,
				method: 'POST',
			},
			visit: {
				url: 'app/group_buy/activity/visit',
				auth: false,
				method: 'POST',
			},
		},
		team: {
			open: {
				url: 'app/group_buy/team/open',
				auth: true,
				method: 'POST',
			},
			join: {
				url: 'app/group_buy/team/join',
				auth: true,
				method: 'POST',
			},
			detail: {
				url: 'app/group_buy/team/detail',
				auth: true,
				method: 'POST',
			},
			// 2026-10-29 拼团开放用券：下单页选券后试算 / 券弹窗的可用清单。
			// 两者与 `open/join` 共用后端 `OrderBridge` + `TeamService::context*` 同一份参数形状
			calc: {
				url: 'app/group_buy/team/calc',
				auth: true,
				method: 'POST',
			},
			coupons: {
				url: 'app/group_buy/team/coupons',
				auth: true,
				method: 'POST',
			},
			myList: {
				url: 'app/group_buy/team/myList',
				auth: true,
				method: 'POST',
			},
		},
	},
	/** 送好友（付费插件 send_friend）↓
	 *  七口全部登记在这一份表里，调用一律写成本表的键（`this.$api('send_friend.gift.list', …)`）。
 *  （2026-10-28 新增 `gift/selfUse`：送礼页【自己使用】，只有购买人本人能调）
	 *  ⚠ `$api` 是 common/request/index.js 默认导出的**函数**，没有 `.post` 这一档：
	 *   `this.$api.post('app/send_friend/…')` 会在取数那一刻抛 `is not a function`，
	 *  页面永远停在骨架屏而接口一条都不发（与本文件 1021-1027 行拼团那一族同一条教训）。
	 *  礼单状态文案（逐行 `status_label`，四档名称在 `attr.statusList` 里）、领取页那三态的句子（`block_reason`
	 *  + `status_label`）、有效期那一句（`expire_text`）都由接口下发，前端不写死（W69 / 硬约束 35 / M44）。
	 *  ⚠ 键名以生产者为准：`GiftRead::decorate()` 交 `status_label`（不是 `status_text`）、
	 *  `receiver_name`（`receiver` 是整枚用户对象，直接渲染就是 `[object Object]`）、
	 *  `shared_at_text`/`claimed_at_text`/`expire_time_text`（裸戳是 Unix 秒）；
	 *  `Gift::info()` 交 `claimable`/`giver_name`（不是 `can_claim`/`giver_nickname`），
	 *  `other_pending` 是**剩余份数**（只对购买人本人生效），全站从不发 `next_code`。
	 *  `gift/info` 与 `gift/entry` 是免登录的两口：前者是好友点开领取链接时先让他看见「这是哪门课」
	 *  再引导登录（§2.3-4，后端对未登录只回商品名与封面 + need_login，判据同 api Gift::$noNeedLogin），
	 *  后者是商详页那一枚入口 flag（登录与否看到的「能不能送」是同一件事，不该要登录）。
	 *  ⚠ **`gift/entry` 的调用点是 `components/tz/send-friend-area.vue` 自己**（M-P1 的取数形态逐值照
	 *  `group-buy-area.vue:151-170` 那一档：插件块自己发自己那条口，**不挤进全站共用的课程详情载荷**，
	 *  课程详情那张表是核心出口、少一版客户端也在读，为插件块加一列等于把插件的存活性写进核心载荷
	 *  ——`paid-plugins.md` §4.2 与 §12.1-⑨ 说的「字段缺失回落不显示」正是留给这种老包的）。
	 *  未装插件 ⇒ 这口一次都不发（闸门在组件 `checkInstall()` 里，`app_isinstall_send_friend` 为假就 return）。 **/
	send_friend: {
		gift: {
			// M-P1 商详页入口 flag：{goods_type, goods_id} → {send_friend_entry, max_per_order, ...}
			// 免登录；三枚轴（总开关 ∧ 类别勾选 ∧ 商品可送）已由后端 Gate 折成一枚，前端不重判（M36②）
			entry: {
				url: 'app/send_friend/gift/entry',
				auth: false,
				method: 'POST',
			},
			// M-P2 建送礼购买单：{goods_id, goods_type, count, coupon_id} → {order_no, real_price}
			// **调用点是标准提交订单页的送礼分支**（`sf=1` 时 `components/order/submit-order.vue` 走这一口；
			//  插件自己的送礼下单页 2026-10-16 已撤，与全站购买流并成一条）
			create: {
				url: 'app/send_friend/gift/create',
				auth: true,
				method: 'POST',
			},
			// M-P4 我的礼单：{status, offset, limit} → {total, rows}（只回 giver_user_id = 当前用户）
			list: {
				url: 'app/send_friend/gift/list',
				auth: true,
				method: 'POST',
			},
			// M-P5 打开分享面板即记「已送出」：{id}，幂等只更新 shared_at（§3.3）
			share: {
				url: 'app/send_friend/gift/share',
				auth: true,
				method: 'POST',
			},
			// M-P6 领取页取数：{code} → 三态 + need_login（免登录那一档只回商品名与封面）
			info: {
				url: 'app/send_friend/gift/info',
				auth: false,
				method: 'POST',
			},
			// M-P6 领取：{code}，一人一领的乐观并发在后端收口（§3.6）
			receive: {
				url: 'app/send_friend/gift/receive',
				auth: true,
				method: 'POST',
			},
			// M-P9 自己使用（2026-10-28 送礼页 P1）：{code} —— 只有购买人本人能调，
			// 后端跳过「不能领自己」那一条、其余判据与领取同一份；成功后与 receive 同一份回体
			selfUse: {
				url: 'app/send_friend/gift/selfUse',
				auth: true,
				method: 'POST',
			},
		},
	},
	/**
	 * 奖品（标准版核心）↓
	 *  2026-10-03 自 share_gift.prize 升上来：奖品能力不再只属于分享有礼，任何业务发的奖
	 *  都走这一组口，不按来源分家。四口全部要登录（奖品列表与地址簿都是本人的东西）。
	 *  枚举与文案一律由 attr 下发，前端不写死。
	 *
	 *  老路径 app/share_gift/prize/* 与 app/share_gift/gift/claim 在**后端**仍保留为转发壳
	 *  （api/controller/app/share_gift/Prize.php 与 Gift::claim），让已发布的老版本还能开页领奖。
	 *  本文件里**不再**给它们留条目：api_list 是编进安装包的，老包自带一份，
	 *  在新代码里挂一组没人调的条目只是给自己添乱（真正要删的是老包，最低支持版本越线后随包一起走）。
	 **/
	prize: {
		prize: {
			// 我的奖品分页：跨所有发奖业务的一枚奖一行，page/limit + total/has_more
			myPrizes: {
				url: 'prize/prize/myPrizes',
				auth: true,
				method: 'POST',
			},
			// 收货地址簿（实物奖品领取前选那一张）：只回本人已有地址，新增走既有的地址编辑页
			addresses: {
				url: 'prize/prize/addresses',
				auth: true,
				method: 'POST',
			},
			// 个人中心「资产管理 - 我的奖品」那一格：还有多少**未领取且未过期**的奖。
			// 单独一个出口而不是并进 user/info：奖品走自己的取数口径（要跨业务聚合 + 读出口收敛过期），
			// 硬塞进 user/info 会让那个口变成一个什么都干的聚合口
			count: {
				url: 'prize/prize/prizeCount',
				auth: true,
				method: 'POST',
			},
			// 领取一枚：六型分流在后端 Grant，跨业务的「这一批算不算领完」由各业务自己收尾
			claim: {
				url: 'prize/prize/claim',
				auth: true,
				method: 'POST',
			},
		},
	},
	/** 直播邀请达人榜 ↓（付费插件：未安装时后端这三条路由根本不存在，调用点先按 app_isinstall_invite_rank 收起入口） **/
	invite_rank: {
		rank: {
			// 榜单：TOP3 + 分页列表 + 我的名次 + 活动展示段，入口显隐也吃这一条下发的 show_entry。
			// auth:false 与后端 $noNeedLogin 成对：商家把开关打开就是要给进店的人看这张榜，
			// 未登录（游客）也要能出入口与榜单，判「我的名次」那一段后端按 user_id=0 自然给未上榜
			board: {
				url: 'app/invite_rank/rank/board',
				auth: false,
				method: 'POST',
			},
			// 我的邀请：只按当前登录用户过滤，不接受前端传 user_id
			my: {
				url: 'app/invite_rank/rank/my',
				auth: true,
				method: 'POST',
			},
			// 归因上报：允许未登录到达（后端不记录也不报错），不能让 401 把 storage 里的 share 参数白丢
			report: {
				url: 'app/invite_rank/rank/report',
				auth: false,
				method: 'POST',
			},
		},
	},
	/** 圈子 ↓ **/
	circle: {
		circle: {
			index: {
				url: 'app/circle/circle/index',
				auth: true,
				method: 'POST',
			},
			goodsList: {
				url: 'app/circle/circle/goodsList',
				auth: false,
				method: 'POST',
			},
			courseCircle: {
				url: 'app/circle/circle/courseCircle',
				auth: false,
				method: 'POST',
			},
			presale: {
				url: 'app/circle/circle/presale',
				auth: false,
				method: 'POST',
			},
			join: {
				url: 'app/circle/circle/join',
				auth: true,
				method: 'POST',
			},
			detail: {
				url: 'app/circle/circle/detail',
				auth: true,
				method: 'POST',
			},
			publishConfig: {
				url: 'app/circle/circle/publishConfig',
				auth: true,
				method: 'POST',
			},
			showcase: {
					url: 'app/circle/circle/showcase',
					auth: false,
					method: 'POST',
				},
				courses: {
					url: 'app/circle/circle/courses',
					auth: false,
					method: 'POST',
				},
				courseDir: {
					url: 'app/circle/circle/courseDir',
					auth: false,
					method: 'POST',
				},
				expire: {
					url: 'app/circle/circle/expire',
					auth: true,
					method: 'POST',
				},
				userHome: {
					url: 'app/circle/circle/userHome',
					auth: true,
					method: 'POST',
				},
		},
		post: {
			list: {
				url: 'app/circle/post/list',
				auth: true,
				method: 'POST',
			},
			previewList: {
				url: 'app/circle/post/previewList',
				auth: false,
				method: 'POST',
			},
			detail: {
					url: 'app/circle/post/detail',
					auth: true,
					method: 'POST',
				},
				playAuth: {
					url: 'app/circle/post/playAuth',
					auth: true,
					method: 'POST',
				},
				commentList: {
				url: 'app/circle/post/commentList',
				auth: true,
				method: 'POST',
			},
			publish: {
				url: 'app/circle/post/publish',
				auth: true,
				method: 'POST',
			},
			edit: {
				url: 'app/circle/post/edit',
				auth: true,
				method: 'POST',
			},
			removeMedia: {
				url: 'app/circle/post/removeMedia',
				auth: true,
				method: 'POST',
			},
			del: {
				url: 'app/circle/post/del',
				auth: true,
				method: 'POST',
			},
			ask: {
				url: 'app/circle/post/ask',
				auth: true,
				method: 'POST',
			},
			like: {
				url: 'app/circle/post/like',
				auth: true,
				method: 'POST',
			},
			unlike: {
				url: 'app/circle/post/unlike',
				auth: true,
				method: 'POST',
			},
			comment: {
				url: 'app/circle/post/comment',
				auth: true,
				method: 'POST',
			},
			delComment: {
				url: 'app/circle/post/delComment',
				auth: true,
				method: 'POST',
			},
		}
	},

	/** 数据  ↓ **/
	data: {
		area: {
			index: {
				url: 'data/area/index',
				auth: false,
				method: 'POST',
				// desc: '完整省市区树',
			},
			children: {
				url: 'data/area/children',
				auth: false,
				method: 'POST',
				// desc: '获取下级地区',
			},
			search: {
				url: 'data/area/search',
				auth: false,
				method: 'POST',
				// desc: '搜索地区',
			}
		},
		record: {
			url: 'data/record/log',
			auth: false,
			method: 'POST',
			// desc: '访问记录',
		}
	},


	/** 课程 ↓ **/
	course: {

		// 小程序学习引导（课程设置「小程序学习」开启后，H5 付款方要去小程序学习）：
		// entry 取路径与码图地址；urllink 只有微信外才懒调（URL Link 有配额）；
		// 码图本身走 <image src>，不经这里（后端免登录，见 api/controller/course/MpStudy::code）
		mpStudy: {
			entry: {
				url: 'course/mp_study/entry',
				auth: true,
				method: 'POST',
			},
			urllink: {
				url: 'course/mp_study/urllink',
				auth: true,
				method: 'POST',
			},
		},

		group: {
			index: {
				url: 'course/group/index',
				auth: false,
				method: 'POST',
				// desc: '获取分组列表',
			},
			all: {
				url: 'course/group/all',
				auth: false,
				method: 'POST',
				// desc: '获取所有分组树',
			},
			level: {
				url: 'course/group/level',
				auth: false,
				method: 'POST',
				// desc: '获取指定层级分组',
			},
			detail: {
				url: 'course/group/detail',
				auth: false,
				method: 'POST',
				// desc: '获取分组详情',
			},
			getList: {
				url: 'course/group/getList',
				auth: false,
				method: 'POST',
				// desc: '课程分组',
			}
		},

		//课程评论
		comment: {
			add: {
				url: 'course/comment/add',
				auth: false,
				method: 'POST',
				// desc: '添加评论',
			},
			del: {
				url: 'course/comment/del',
				auth: false,
				method: 'POST',
				// desc: '删除评论',
			},
			index: {
				url: 'course/comment/index',
				auth: false,
				method: 'POST',
				// desc: '评论列表',
			},
			like: {
				url: 'course/comment/like',
				auth: false,
				method: 'POST',
				// desc: '喜欢评论',
			}
		},

		course: {
			url: 'course/course/getList',
			auth: false,
			method: 'POST',
			// desc: '课程列表',
		},
		detail: {
			url: 'course/course/detail',
			auth: false,
			method: 'POST',
			// desc: '课程详情',
		},
		// 阿里云点播播放凭证（H5 的 VID+PlayAuth 那一档）。
		// auth 给 false 而不是 true：试看是公开内容，未登录也要能取凭证（正片那一支由服务端
		// 判登录态回 401，走响应拦截的登录引导）——写 true 会让访客的试看直接发不出请求。
		playAuth: {
			url: 'course/vod/playAuth',
			auth: false,
			method: 'POST',
			// desc: '课程点播播放凭证',
		},

		

		columncourse: {
			url: 'course/column/getCourse',
			auth: false,
			method: 'POST',
			// desc: '获取专栏包含的课程',
		},
		// 这里原来还有一条同名的 columndir → course/column/getDir，被下面这条覆盖掉了
		// （对象字面量后写的键赢），所以目录页一直是走 getColumnDir 那版批量判据。
		// 谁清理重复键挑错一个，目录就退回逐条 N+1 那一版，故把那一条删净、只留这一份真源。
		columndir: {
			url: 'course/column/getColumnDir',
			auth: false,
			method: 'POST',
			// desc: '获取专栏包含的课程',
		},
		columnnext: {
			url: 'course/column/getNextCourse',
			auth: false,
			method: 'POST',
			// desc: '获取专栏包含的课程',
		},
		getBelongsColumn: {
			url: 'course/course/getBelongsColumn',
			auth: false,
			method: 'POST',
			// desc: '获取专栏包含的课程',
		}
	},
	//分享
	share: {
		getPoster: {
			url: 'share/getPoster',
			auth: false,
			method: 'POST',
			// desc: '获取分享海报',
		},
		getArticle: {
			url: 'share/getArticle',
			auth: false,
			method: 'POST',
			// desc: '获取分享文案',
		},
		getQrcode:{
			url: 'share/getQrcode',
			auth: false,
			method: 'POST',
			// desc: '获取分享二维码',
		}
	},
	config: {
		service: {
			url: 'config/getServiceConfig',
			auth: false,
			method: 'POST',
			// desc: '获取客服配置',
		}
	},

	/** 拓展应用 ↓ **/
	app: {
		/** 投诉 ↓ **/
		complaint: {
			config: {
				url: 'app/complaint/complaint/config',
				auth: false,
				method: 'POST',
			},
			category: {
				url: 'app/complaint/complaint/category',
				auth: false,
				method: 'POST',
			},
			submit: {
				url: 'app/complaint/complaint/submit',
				auth: true,
				method: 'POST',
			}
		},
		/** 表单 ↓ **/
		form: {
			detail:{
				url: 'app/form/form/detail',
				auth: false,
				method: 'POST',
				// desc: '表单详情',
			},
			submit:{
				url: 'app/form/form/submit',
				auth: false,
				method: 'POST',
				// desc: '提交表单',
			},
			log:{
				url: 'app/form/form/log',
				auth: false,
				method: 'POST',
				// desc: '表单记录',
			},
			courseBindForm: {
				url: 'app/form/form/getCourseBindForm',
				auth: false,
				method: 'POST',
				// desc: '课程绑定的表单',
			},
			checkBeforeBuy: {
				url: 'app/form/form/checkBeforeBuy',
				auth: false,
				method: 'POST',
				// desc: '检查购买课程前表单',
			},
			checkBeforeLearn: {
				url: 'app/form/form/checkBeforeLearn',
				auth: false,
				method: 'POST',
				// desc: '检查加入学习前表单',
			}
		},
		/** 证书 ↓ **/
		cert: {
			log:{
				url: 'app/cert/log/index',
				auth: false,
				method: 'POST',
				// desc: '获取我的证书',
			},
			preview:{
				url: 'app/cert/log/preview',
				auth: false,
				method: 'POST',
				// desc: '获取我的证书（后端渲染 PNG，旧包兼容）',
			},
			layout:{
				url: 'app/cert/log/layout',
				auth: false,
				method: 'POST',
				// desc: '获取证书元素清单（前端 canvas 照单出图）',
			}
		},
		/** 优惠券 ↓ **/
		coupon: {
			goods:{
				url: 'app/coupon/coupon/goodsGetCoupon',
				auth: false,
				method: 'POST',
				// desc: '获取商品可领的优惠券',
			},
			detail:{
				url: 'app/coupon/coupon/detail',
				auth: false,
				method: 'POST',
				// desc: '优惠券详情',
			},
			receive:{
				url: 'app/coupon/coupon/receive',
				auth: false,
				method: 'POST',
				// desc: '领取优惠券',
			},
			use:{
				url: 'app/coupon/coupon/useCoupon',
				auth: false,
				method: 'POST',
				// desc: '获取',
			},
			my:{
				url: 'app/coupon/coupon/my',
				auth: false,
				method: 'POST',
				// desc: '我的优惠券',
			}
		},
		/** 微信小店 ↓ **/
		channels: {
			delivery: {
				detail:{
					url: 'app/channels/delivery/detail',
					auth: false,
					method: 'POST',
					// desc: '视频号发货',
				}
			},
			sharer: {
				invite:{
					url: 'app/channels/sharer/invite',
					auth: false,
					method: 'POST',
					// desc: '邀请分享员',
				},
				check:{
					url: 'app/channels/sharer/checkBind',
					auth: false,
					method: 'POST',
					// desc: '检查绑定',
				},
				my:{
					url: 'app/channels/sharer/myBind',
					auth: false,
					method: 'POST',
					// desc: '检查绑定',
				},
				unbind:{
					url: 'app/channels/sharer/unbind',
					auth: false,
					method: 'POST',
					// desc: '检查绑定',
				},
				store:{
					url: 'app/channels/sharer/getStoreList',
					auth: false,
					method: 'POST',
					// desc: '获取绑定的小店',
				}
			}
		},
		/** 线下活动 ↓ **/
		activity: {
			detail: {
				url: 'app/activity/activity/detail',
				auth: false,
				method: 'POST',
				// desc: '活动详情',
			},

			courseBindActivity: {
				url: 'app/activity/bind_course/getCourseBindActivity',
				auth: false,
				method: 'POST',
				// desc: '课程绑定的活动',
			},
			
			list: {
				url: 'app/activity/activity/index',
				auth: false,
				method: 'POST',
				// desc: '活动列表',
			},
			ticket:{
				getTicket: {
					url: 'app/activity/ticket/getTicket',
					auth: false,
					method: 'POST',
					// desc: '获取票券列表',
				},
				getDetail: {
					url: 'app/activity/ticket/getTicketDetail',
					auth: false,
					method: 'POST',
					// desc: '获取票券详情',
				},
				getUserTicket: {
					url: 'app/activity/ticket/getUserTicket',
					auth: false,
					method: 'POST',
					// desc: '获取用户票券列表',
				}
			},
			form:{
				submit: {
					url: 'app/activity/form/submit',
					auth: false,
					method: 'POST',
					// desc: '提交表单',
				},
				getform: {
					url: 'app/activity/form/getApplyForm',
					auth: false,
					method: 'POST',
					// desc: '获取表单字段',
				},
			},
			signin:{
				signin: {
					url: 'app/activity/signin/signin',
					auth: false,
					method: 'POST',
					// desc: '活动签到',
				}
			},
			course:{
				list:{
					url: 'app/activity/bind_course/getBindCourse',
					auth: false,
					method: 'POST',
					// desc: '获取活动绑定课程',
				},
				check:{
					url: 'app/activity/bind_course/checkJoinAuth',
					auth: false,
					method: 'POST',
					// desc: '检查是否加入',
				}
			}
		},

		/** 考试 ↓ **/
		test: {
			getCourseBindTest: {
				url: 'app/test/test/getCourseBindTest',
				auth: false,
				method: 'POST',
				// desc: '考试详情',
			},
			detail: {
				url: 'app/test/test/detail',
				auth: false,
				method: 'POST',
				// desc: '考试详情',
			},
			buildLog: {
				url: 'app/test/test/buildLog',
				auth: false,
				method: 'POST',
				// desc: '新建考试记录',
			},
			getLog: {
				url: 'app/test/test/getLog',
				auth: false,
				method: 'POST',
				// desc: '新建考试记录',
			},
			submitAnswer: {
				url: 'app/test/test/submitAnswer',
				auth: false,
				method: 'POST',
				// desc: '提交答案',
			},
			submitTest: {
				url: 'app/test/test/submitTest',
				auth: false,
				method: 'POST',
				// desc: '提交考试',
			},
			result: {
				url: 'app/test/test/getResult',
				auth: false,
				method: 'POST',
				// desc: '考试结果',
			},
			worklog: {
				url: 'app/test/worklog/getLog',
				auth: false,
				method: 'POST',
				// desc: '考试记录',
			},
		},

		/** 题库练习 ↓ **/
		exam: {
			exercises: {
				getCourseBindExam: {
					url: 'app/exam/exercises/getCourseBindExam',
					auth: false,
					method: 'POST',
					// desc: '获取课程绑定的考试练习',
				},
				detail: {
					url: 'app/exam/exercises/detail',
					auth: false,
					method: 'POST',
					// desc: '练习详情',
				},
				group: {
						url: 'app/exam/exercises/group',
						auth: false,
						method: 'POST',
						// desc: '练习分组',
					},
					groupTree: {
						url: 'app/exam/exercises/groupTree',
						auth: false,
						method: 'POST',
						// desc: '练习分组树',
					},
				subscribe: {
					url: 'app/exam/exercises/subscribe',
					auth: false,
					method: 'POST',
					// desc: '订阅练习',
				},

				buildLog: {
					url: 'app/exam/exercises_log/buildLog',
					auth: false,
					method: 'POST',
					// desc: '新建练习',
				},

				getLog: {
					url: 'app/exam/exercises_log/getLogDetail',
					auth: false,
					method: 'POST',
					// desc: '获取练习详情',
				},

				getLogList: {
					url: 'app/exam/exercises_log/getLogList',
					auth: false,
					method: 'POST',
					// desc: '获取练习记录列表',
				},
				getGoodsList: {
					url: 'app/exam/exercises/getGoodsList',
					auth: false,
					method: 'POST',
					// desc: '获取练习商品列表',
				},
				getErrorQuestion: {
					url: 'app/exam/exercises_log/getErrorQuestion',
					auth: false,
					method: 'POST',
					// desc: '获取错题本',
				},
				delErrorQuestion: {
					url: 'app/exam/exercises_log/delErrorQuestion',
					auth: false,
					method: 'POST',
					// desc: '获取错题本',
				},
				submit: {
					url: 'app/exam/exercises_log/submit',
					auth: false,
					method: 'POST',
					// desc: '交卷',
				},
				result: {
					url: 'app/exam/exercises_log/getResult',
					auth: false,
					method: 'POST',
					// desc: '练习结果',
				},
				getSubscribeList: {
					url: 'app/exam/exercises/getSubscribeList',
					auth: false,
					method: 'POST',
					// desc: '获取订阅练习',
				}
			}
		},

		/** VIP ↓ **/
		vip: {
			detail: {
				url: 'app/vip/card/getCardList',
				auth: false,
				method: 'POST',
				// desc: '会员中心',
			},
			goods: {
				url: 'app/vip/card_privilege/getGoodsList',
				auth: false,
				method: 'POST',
				// desc: '会员商品',
			},

			goods_privilege: {
				url: 'app/vip/card_privilege/getGoodsPrivilege',
				auth: false,
				method: 'POST',
				// desc: '指定商品优惠',
			},
			user: {
				url: 'app/vip/card/getUserVip',
				auth: false,
				method: 'POST',
				// desc: '获取会员开通信息',
			},
			config: {
				url: 'app/vip/config/getConfig',
				auth: false,
				method: 'POST',
				// desc: '配置',
			},
		},
		/** 积分商城 ↓ **/
		score: {
			list: {
				url: 'app/score/goods/index',
				auth: false,
				method: 'POST',
				// desc: '积分商品列表',
			},
			detail: {
				url: 'app/score/goods/detail',
				auth: false,
				method: 'POST',
				// desc: '积分详情',
			},
			goodsgroup: {
				url: 'app/score/goods_group/getList',
				auth: false,
				method: 'POST',
				// desc: '积分详情',
			},
			config: {
				url: 'app/score/config/getConfig',
				auth: false,
				method: 'POST',
				// desc: '配置',
			},
		},
		//签到
		sign: {
			index: {
				url: 'app/sign/handle/index',
				auth: false,
				method: 'POST',
				// desc: '获取签到记录',
			},
			sign: {
				url: 'app/sign/handle/sign',
				auth: false,
				method: 'POST',
				// desc: '签到',
			},
			log: {
				url: 'app/sign/log/getList',
				auth: false,
				method: 'POST',
				// desc: '获取签到记录',
			},
			config: {
				url: 'app/sign/config/getConfig',
				auth: false,
				method: 'POST',
				// desc: '配置',
			},
		},
		//兑换码
		exchange: {
			exchange: {
				url: 'app/exchange/code/exchange',
				auth: false,
				method: 'POST',
				// desc: '获取订单统计',
			},
			getLog: {
				url: 'app/exchange/use_log/getLog',
				auth: false,
				method: 'POST',
				// desc: '兑换记录',
			}
		},
		//推荐商品
		recommend: {
			getRecommendGoods: {
				url: 'app/recommend/goods/getRecommendGoods',
				auth: false,
				method: 'POST',
				// desc: '获取订单统计',
			}
		},
		//分销
		agent: {

			order: {
				getTotal: {
					url: 'app/agent/order/getTotal',
					auth: false,
					method: 'POST',
					// desc: '获取订单统计',
				},
				getOrderList: {
					url: 'app/agent/order/getOrderList',
					auth: false,
					method: 'POST',
					// desc: '提交申请',
				}
			},
			customer: {
				getCustomerList: {
					url: 'app/agent/customer/getCustomerList',
					auth: false,
					method: 'POST',
					// desc: '获取下级',
				},

				getCustomerDetail: {
					url: 'app/agent/customer/getCustomerDetail',
					auth: false,
					method: 'POST',
					// desc: '获取下级',
				}
			},
			recruit: {
				getStatus: {
					url: 'app/agent/recruit/getStatus',
					auth: false,
					method: 'POST',
					// desc: '获取申请状态',
				},
				apply: {
					url: 'app/agent/recruit/apply',
					auth: false,
					method: 'POST',
					// desc: '提交申请',
				},
				getUserCondition: {
					url: 'app/agent/recruit/getUserCondition',
					auth: false,
					method: 'POST',
					// desc: '获取用户满足的题哦啊见',
				}
			},
			member: {
				getMember: {
					url: 'app/agent/member/getMember',
					auth: false,
					method: 'POST',
					// desc: '获取成员信息',
				},
				getMemberTotal: {
					url: 'app/agent/member/getMemberTotal',
					auth: false,
					method: 'POST',
					// desc: '获取用户统计数据',
				}
			},
			config: {
				getConfig: {
					url: 'app/agent/config/getConfig',
					auth: false,
					method: 'POST',
					// desc: '获取配置',
				}
			},
			level: {
				getLevelList: {
					url: 'app/agent/level/getLevelList',
					auth: false,
					method: 'POST',
					// desc: '获取配置',
				}
			},
			wallet: {
				getMoneyLog: {
					url: 'app/agent/wallet/getMoneyLog',
					auth: false,
					method: 'POST',
					// desc: '获取余额记录',
				},
				getCard: {
					url: 'app/agent/withdraw_card/getCard',
					auth: false,
					method: 'POST',
					// desc: '获取银行卡',
				},
				setCard: {
					url: 'app/agent/withdraw_card/setCard',
					auth: false,
					method: 'POST',
					// desc: '设置银行卡信息',
				}
			},
			goods: {
				getGoodsList: {
					url: 'app/agent/goods/getGoodsList',
					auth:  false,
					method: 'POST',
					// desc: '分佣商品列表',
				}
			},
			withdraw: {
				submit: {
					url: 'app/agent/withdraw/submit',
					auth: false,
					method: 'POST',
					// desc: '提交提现申请',
				},
				log: {
					url: 'app/agent/withdraw/getLog',
					auth: false,
					method: 'POST',
					// desc: '获取提现记录',
				}
			}

		}

	},

	school: {
		package: {
			list: { url: 'app/school/package/list', auth: false, method: 'POST' },
			detail: { url: 'app/school/package/detail', auth: false, method: 'POST' },
			campus: { url: 'app/school/package/campus', auth: false, method: 'POST' },
			// 课时余额页「续费」用：按课程反查套餐（含上下架状态）
			course: { url: 'app/school/package/course', auth: false, method: 'POST' }
		},
		campus: {
			list: { url: 'app/school/campus/list', auth: false, method: 'POST' },
			detail: { url: 'app/school/campus/detail', auth: false, method: 'POST' }
		},
		teacher: {
			detail: { url: 'app/school/teacher/detail', auth: false, method: 'POST' }
		},
		order: {
			detail: { url: 'app/school/order/detail', auth: true, method: 'POST' }
		},
		user: {
			students: { url: 'app/school/user/students', auth: true, method: 'POST' },
			studentAdd: { url: 'app/school/user/studentAdd', auth: true, method: 'POST' },
			studentDetail: { url: 'app/school/user/studentDetail', auth: true, method: 'POST' },
			studentEdit: { url: 'app/school/user/studentEdit', auth: true, method: 'POST' },
			schedule: { url: 'app/school/user/schedule', auth: true, method: 'POST' },
			scheduleCounts: { url: 'app/school/user/scheduleCounts', auth: true, method: 'POST' },
			records: { url: 'app/school/user/records', auth: true, method: 'POST' },
			balance: { url: 'app/school/user/balance', auth: true, method: 'POST' },
			logs: { url: 'app/school/user/logs', auth: true, method: 'POST' },
			leaveSubmit: { url: 'app/school/user/leaveSubmit', auth: true, method: 'POST' },
			lessonLeave: { url: 'app/school/user/lessonLeave', auth: true, method: 'POST' },
			leaveList: { url: 'app/school/user/leaveList', auth: true, method: 'POST' },
			leaveDetail: { url: 'app/school/user/leaveDetail', auth: true, method: 'POST' },
			leaveCancel: { url: 'app/school/user/leaveCancel', auth: true, method: 'POST' },
			sign: { url: 'app/school/user/sign', auth: true, method: 'POST' },
			teacherDetail: { url: 'app/school/user/teacherDetail', auth: true, method: 'POST' },
			bookable: { url: 'app/school/user/bookable', auth: true, method: 'POST' },
			bookableCounts: { url: 'app/school/user/bookableCounts', auth: true, method: 'POST' },
			book: { url: 'app/school/user/book', auth: true, method: 'POST' },
			bookCancel: { url: 'app/school/user/bookCancel', auth: true, method: 'POST' },
			bookingList: { url: 'app/school/user/bookingList', auth: true, method: 'POST' },
			bookingDetail: { url: 'app/school/user/bookingDetail', auth: true, method: 'POST' }
		}
	}
};