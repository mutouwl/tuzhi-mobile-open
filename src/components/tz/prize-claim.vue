<template>
	<!--
	  分享有礼「领奖」那一条链的唯一实现（直播间活动详情弹窗与「我的奖品」页共用，见 M22/硬约束 11：
	  同一组字段与同一条动作两处各写一份必然分叉）。三条分流只在这里判一次：
	    · 实物 → 先收收货地址（吃 prize/addresses 那份地址簿，新增走既有地址编辑页，不再长第二套地址表单）；
	    · 自定义奖品 → 领完直接弹「兑奖方式」（商家微信号可复制 + 二维码引导添加微信，
	      联系方式上面还摆着这一枚奖品本身的信息卡）；
	    · 其余型 → 领完弹「奖品详情」窗（券卡/实物卡/课程卡/积分介绍/现金，各型一张）。
	  六型之间的差异不写在界面里：状态与类型文字、领取期提示都由接口下发，本组件只渲染拿到的那一份。

	  2026-10-03 自 `tz-share-gift-claim.vue` 改名而来：奖品能力已升入标准版，任何业务发的奖都走
	  这一条链，组件不该再带着某一个付费插件的名字。调用点两处（我的奖品页 / 直播间活动详情弹窗）同步改标签。
	-->
	<view>
		<u-popup
			:show="addrShow"
			mode="bottom"
			bgColor="transparent"
			:round="12"
			:closeable="true"
			:safeAreaInsetBottom="false"
			:zIndex="addrZ"
			:overlayStyle="{ zIndex: addrZ - 10 }"
			@close="closeAddr"
		>
			<view class="sgc">
				<view class="sgc-title">选择收货地址</view>
				<view class="sgc-desc" v-if="tip">{{ tip }}</view>
				<!-- 取地址中：骨架条与真实行同一档高度（M16，弹层里那一格先占位再盖灰块）；
				     rows-width 必须带冒号绑成数组，写成静态属性就是一条字符串，u-skeleton 认不出数组 -->
				<tz-popup-list height="46vh" padding="0">
					<!-- 取地址中：骨架条与真实行同一档高度（M16，弹层里那一格先占位再盖灰块）；
					     rows-width 必须带冒号绑成数组，写成静态属性就是一条字符串，u-skeleton 认不出数组 -->
				<view class="sgc-sk" v-if="addrLoading && !addrList.length">
					<view class="sgc-sk-item" v-for="i in 3" :key="'sgc-sk-' + i">
						<u-skeleton :loading="true" :animate="true" :title="false" :rows="2" :rows-width="['62%', '88%']" rows-height="14"></u-skeleton>
					</view>
				</view>
					<block v-else>
						<view
							class="sgc-addr"
							:class="{ 'sgc-addr--last': index == addrList.length - 1 }"
							v-for="(item, index) in addrList"
							:key="item.id"
							@tap="pickAddr(item)"
						>
							<view class="sgc-addr-head">
								<text class="sgc-addr-name">{{ item.name }}</text>
								<text class="sgc-addr-mobile">{{ item.mobile }}</text>
								<text class="sgc-addr-tag" v-if="item.is_default == 1">默认</text>
							</view>
							<view class="sgc-addr-text">{{ region(item) }}</view>
						</view>
						<!-- 失败要说得出为什么（M13）：接口故障不能渲染成「您还没有地址」 -->
						<u-empty
							v-if="!addrList.length && !addrLoading"
							icon="/static/image/empty.png"
							width="70"
							height="70"
							:text="addrError || '暂无收货地址'"
						></u-empty>
					</block>
					</tz-popup-list>
				<view class="sgc-foot">
					<tz-button size="normal" long type="primary" text="去新增收货地址" @click="goAddAddress"></tz-button>
				</view>
			</view>
		</u-popup>

		<u-popup
			:show="contactShow"
			mode="bottom"
			bgColor="transparent"
			:round="12"
			:closeable="true"
			:safeAreaInsetBottom="false"
			:zIndex="contactZ"
			:overlayStyle="{ zIndex: contactZ - 10 }"
			@close="closeContact"
		>
			<view class="sgc">
				<view class="sgc-title">兑奖方式</view>
				<!-- 静态文案块要有下限高度（M18⑨d，参照 tz/recommend-modal.vue:128）：只有一行说明 + 一枚二维码时
				     面板会缩成一条，按钮几乎贴着标题，读起来像没渲染完 -->
				<view class="sgc-body">
				<!-- 兑奖前先让人看清兑的是哪一个：奖品图与名称要摆在联系方式**上面**那一段，
				     2026-10-03 用户点名「除了商家的微信号，上面还会显示商品的信息」。
				     这块与「奖品详情」弹窗里那张卡共用同一个 tz-prize-card（同一枚奖品两处显示，
				     版式只存一份，硬约束 11） -->
				<tz-prize-card :row="contactRow" mode="mini"></tz-prize-card>
				<view class="sgc-desc">{{ contactTip }}</view>
				<view class="sgc-contact" v-if="contactWechat">
					<text class="sgc-contact-label">商家微信号</text>
					<text class="sgc-contact-value">{{ contactWechat }}</text>
				</view>
				<image
					class="sgc-qrcode"
					v-if="contactQrcode"
					:src="contactQrcode"
					mode="widthFix"
					@tap="previewQrcode"
				></image>
				</view>
				<view class="sgc-foot" v-if="contactWechat">
					<tz-button size="normal" long type="primary" text="复制微信号" @click="copyWechat"></tz-button>
				</view>
			</view>
		</u-popup>

		<!-- 领取成功后自动弹出来的那只详情窗（自定义奖品除外：它弹的是上面那只兑奖方式窗）。
		     挂在页面根、zIndex 再抬一档（压在兑奖窗之上，两层同时在场时仍看得见收边） -->
		<tz-prize-detail ref="detail" :z-index="detailZ" @close="onDetailClose"></tz-prize-detail>
	</view>
</template>

<script>
import { prizeImage } from '@/common/utils/prize';

/**
 * props: tip（领取期提示那一句，来自接口 attr.deadline_tip / deadline_tip，没有就不摆）
 *        zIndex（压在调用方弹层之上；直播间详情弹窗那一段要更高一档）
 * 用法（ref 命令式）：
 *   this.$refs.prizeClaim.open(row)          领奖（行需带 prize_log_id / type / need_address）
 *   this.$refs.prizeClaim.showContact(row)   已领取的自定义奖品再看兑奖方式（「去查看」target=contact）
 * emits: claimed（领取成功，payload = 接口 data，调用方按它刷新那一行）
 *
 * 三口接口都已随奖品能力升入标准版（prize.prize.myPrizes / addresses / claim），不按业务来源分家。
 */
export default {
	name: 'tz-prize-claim',
	props: {
		tip: { type: String, default: '' },
		zIndex: { type: [Number, String], default: 10330 },
	},
	data() {
		return {
			addrShow: false,
			addrLoading: false,
			// 地址取不到要说出口（M13），不能留一句「暂无收货地址」把接口故障说成用户没建过地址
			addrError: '',
			addrList: [],
			contactShow: false,
			contactWechat: '',
			contactQrcode: '',
			contactTip: '中奖者需主动联系商家进行奖品兑换',
			// 兑奖窗里那一枚奖品（身份卡要显示的就是它）：存实例字段，关窗时不会被父页清空
			contactRow: null,
			// 本次待领的那一行（地址选完要接着它去领）
			pending: null,
			claiming: false,
		};
	},
	computed: {
		addrZ() {
			return Number(this.zIndex) + 20;
		},
		contactZ() {
			return Number(this.zIndex) + 30;
		},
		detailZ() {
			return Number(this.zIndex) + 40;
		},
	},
	methods: {
		/**
		 * 页面正在卸载时晚到的回音不许再写 data（M26：给已出栈页面 setData 会拖死整条推送通道）
		 */
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		open(prize) {
			if (!prize || !prize.prize_log_id) {
				uni.showToast({ title: '奖品信息不完整，请刷新后重试', icon: 'none' });
				return;
			}
			if (this.claiming) {
				return;
			}
			this.pending = prize;
			if (this.needAddress(prize)) {
				this.showAddr();
				return;
			}
			this.claim(0);
		},
		/**
		 * 要不要先收地址：我的奖品那一行由后端逐行下发 need_address；
		 * 活动详情的 my.prizes 只给到 type，那一档退回按 type 判（两处都只读后端给的字段，前端不自算状态）
		 */
		needAddress(prize) {
			if (prize.need_address === undefined || prize.need_address === null || prize.need_address === '') {
				return prize.type === 'physical';
			}
			return Number(prize.need_address) === 1 || prize.need_address === true;
		},
		showAddr() {
			this.addrError = '';
			this.addrShow = true;
			this.loadAddr();
		},
		closeAddr() {
			this.addrShow = false;
			this.pending = null;
		},
		loadAddr() {
			this.addrLoading = true;
			return this.$api('prize.prize.addresses', {}).then((ret) => {
				if (this.gone()) return;
				this.addrLoading = false;
				if (!ret || ret.code !== 1) {
					this.addrList = [];
					this.addrError = (ret && ret.msg) || '收货地址获取失败，请重试';
					return;
				}
				this.addrList = (ret.data && ret.data.rows) || [];
			}).catch(() => {
				if (this.gone()) return;
				this.addrLoading = false;
				this.addrList = [];
				this.addrError = '收货地址获取失败，请重试';
			});
		},
		region(item) {
			const province = item.province || '';
			const city = item.city || '';
			const district = item.district || '';
			// 直筒子市接口会把市与区回成同一个名字，重复那一段不铺两遍
			const head = province + (city && city !== province ? city : '') + (district && district !== city ? district : '');
			return head + (item.address || '');
		},
		pickAddr(item) {
			if (this.claiming) {
				uni.showToast({ title: '正在领取，请稍候', icon: 'none' });
				return;
			}
			this.claim(item.id);
		},
		/**
		 * 新增地址走系统既有的地址编辑页（地址簿的字段只存那一处，这里不再长一份表单）；
		 * 回来后再点「立即领取」会重新取一次地址簿，新填的那一张就在里面了
		 */
		goAddAddress() {
			this.addrShow = false;
			this.pending = null;
			uni.navigateTo({ url: '/pages/user/address/edit/edit' });
		},
		claim(addressId) {
			const prize = this.pending || {};
			if (!prize.prize_log_id) {
				uni.showToast({ title: '请先选择收货地址', icon: 'none' });
				return;
			}
			if (this.claiming) {
				return;
			}
			this.claiming = true;
			const params = { prize_log_id: prize.prize_log_id };
			if (addressId) {
				params.address_id = addressId;
			}
			this.$api('prize.prize.claim', params).then((ret) => {
				if (this.gone()) {
					this.claiming = false;
					return;
				}
				this.claiming = false;
				if (!ret || ret.code !== 1) {
					// code=0 由请求层 toast 过一句，但那一秒过去后这一行还停在「可领」：
					// 状态由调用方重取接口收敛，这里只把失败说出口，不静默收起弹层
					this.addrShow = false;
					this.pending = null;
					uni.showToast({ title: (ret && ret.msg) || '领取失败，请重试', icon: 'none' });
					return;
				}
				const data = ret.data || {};
				this.addrShow = false;
				this.pending = null;
				uni.showToast({ title: ret.msg || '领取成功', icon: 'none' });
				// 先把这一行的新形态交回调用方（它按 prize_log_id 就地换成「已领取 + 去查看」，
				// 不整页重取），再把详情窗弹出来——顺序反了会出现「弹窗里还是领取前那张卡」
				this.$emit('claimed', data);
				// 自定义奖品没有权益可发：领完把「怎么兑」递到手上（微信号/二维码来自领取接口回执）
				if (data.type === 'custom') {
					this.showContact(data);
					return;
				}
				// 其余五型领完自动弹详情窗：券卡/实物卡/课程卡/积分介绍/现金金额，
				// 让学员当场看见兑到了什么，而不是还要自己再点一次「去查看」
				this.openDetail(data);
			}).catch(() => {
				if (this.gone()) {
					this.claiming = false;
					return;
				}
				this.claiming = false;
				uni.showToast({ title: '领取失败，请重试', icon: 'none' });
			});
		},
		/**
		 * 兑奖方式窗：行上已有 contact_wechat / contact_qrcode 时直接吃行（已领取那一张回看），
		 * 领取成功那一次吃接口回执（两处的字段名逐字相同）
		 *
		 * 同时把那枚奖品本身摆上：自定义礼盒是「商家私下发货/线下兑换」，
		 * 只给一个微信号学员不知道兑的是哪个奖品，所以身份卡（封面+名称+类型）要压在联系方式上面。
		 */
		showContact(row) {
			const data = row || {};
			this.contactRow = data;
			this.contactWechat = String(data.contact_wechat || '');
			this.contactQrcode = prizeImage(data.contact_qrcode, this.$tools);
			if (!this.contactWechat && !this.contactQrcode) {
				uni.showToast({ title: '商家还没留下兑奖联系方式，请联系客服', icon: 'none' });
				return;
			}
			this.contactShow = true;
		},
		closeContact() {
			this.contactShow = false;
			this.contactRow = null;
		},
		/**
		 * 详情窗：领取成功后自动弹，以及列表那枚「去查看」点进来，都走这一处
		 * （同一枚奖品两个入口不许各弹一份，硬约束 11）
		 */
		openDetail(row) {
			this.$refs.detail.open(row);
		},
		showDetail(row) {
			this.openDetail(row);
		},
		onDetailClose() {
			this.$emit('detail-close');
		},
		copyWechat() {
			// H5 的剪贴板是同步的，必须在点击这一层当场调用（等接口回来再复制已脱离用户手势）
			if (!this.contactWechat) {
				uni.showToast({ title: '商家没有留下微信号，请扫二维码添加', icon: 'none' });
				return;
			}
			this.$tools.copy(this.contactWechat);
		},
		previewQrcode() {
			if (!this.contactQrcode) {
				return;
			}
			uni.previewImage({ urls: [this.contactQrcode] });
		},
	},
};
</script>

<style scoped>
/* 面板：白底 + 顶部圆角 12（多值写法，弹窗档位）+ 自带内衬与安全区
   （组件 isolated，全局 .school-popup 档进不来，数值与 tz-nickname-modal 同一组） */
/* 面板：白底 + 顶部圆角 12（多值写法，弹窗档位）；安全区只挂这一份，底部那一格内衬交给
   内容最后一块自己给（.sgc-foot 的 padding-bottom；地址弹层以按钮收尾、兑奖弹层同样以按钮收尾）。
   不再写「20px + 安全区」：iPhone X 下那样叠成 20 + 34 = 54px，比同屏礼物/商品弹层
   （内容自己 10px + 安全区 34px = 44px）明显多一截，2026-10-01 用户点名
   「邀请达人榜、分享有礼模块相关的弹窗底部安全距离都太大了，参考其他的 popup 组件」。
   组件 isolated，全局 .school-popup 档进不来，规则写在自身样式里 */
.sgc {
	position: relative;
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	padding: 0 16px;
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}
/* 标题走 .school-popup-title 口径：16px/600 左对齐、内衬 15/0/12，不自造居中标题行（M18） */
.sgc-title {
	padding: 15px 0 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
.sgc-desc {
	font-size: 12px;
	line-height: 18px;
	color: #86909c;
}
.sgc-sk {
	padding: 6px 0;
}
.sgc-sk-item {
	padding: 12px 0;
	border-bottom: 1px solid #f2f3f5;
}
.sgc-addr {
	padding: 12px 0;
	border-bottom: 1px solid #f2f3f5;
}
.sgc-addr--last {
	border-bottom: none;
}
.sgc-addr-head {
	display: flex;
	align-items: center;
}
.sgc-addr-name {
	font-size: 14px;
	color: #1d2129;
}
.sgc-addr-mobile {
	margin-left: 8px;
	font-size: 12px;
	color: #86909c;
}
/* 默认标签走小元素档 4px（§1 圆角只给小元素 4px） */
.sgc-addr-tag {
	margin-left: 8px;
	padding: 1px 6px;
	font-size: 10px;
	line-height: 14px;
	color: #86909c;
	background: #f2f3f5;
	border-radius: 4px;
}
.sgc-addr-text {
	margin-top: 4px;
	font-size: 12px;
	line-height: 18px;
	color: #4e5969;
}
.sgc-body {
	min-height: 220px;
}
/* 兑奖窗里那一枚奖品身份卡：与下面那句说明之间留 12px，
   说明与联系方式之间由 .sgc-contact 自己的 margin-top 给（三段间距各归各的块，不叠着写） */
.sgc-body .ppc {
	margin-bottom: 12px;
}


.sgc-contact {
	display: flex;
	align-items: center;
	margin-top: 14px;
	padding: 12px;
	background: #f7f8fa;
	border-radius: 4px;
}
.sgc-contact-label {
	font-size: 12px;
	color: #86909c;
	margin-right: 8px;
}
.sgc-contact-value {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	color: #1d2129;
	word-break: break-all;
}
/* 二维码走封面档圆角 8（§1），不描边不加投影 */
.sgc-qrcode {
	display: block;
	width: 180px;
	height: 180px;
	margin: 16px auto 0;
	border-radius: 8px;
}
/* 按钮那一行：面板最后一块，底部 12px 内衬由它自己带（面板只挂安全区那一份）。
   两只弹层（收地址 / 兑奖方式）都以这一行收尾；兑奖那一支按钮是 v-if（没有商家微信号时不出），
   那一档面板底部只剩安全区——那一屏本来就只有一句说明与二维码，压边可接受，不再为它单开一档 */
.sgc-foot {
	margin-top: 18px;
	padding-bottom: 12px;
}
</style>
