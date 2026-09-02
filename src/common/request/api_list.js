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

		

		columndir: {
			url: 'course/column/getDir',
			auth: false,
			method: 'POST',
			// desc: '获取专栏目录',
		},
		columncourse: {
			url: 'course/column/getCourse',
			auth: false,
			method: 'POST',
			// desc: '获取专栏包含的课程',
		},
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
				// desc: '获取我的证书',
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
		/** 视频号小店 ↓ **/
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

};
