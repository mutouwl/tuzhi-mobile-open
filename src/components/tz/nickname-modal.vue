<template>
	<!--
	  修改昵称弹窗（共用组件）：两处入口改的是两份不同的字段，口径全部集中在下面的 FIELDS 表里——
	    field="account"：账号昵称（我的-设置，user.info.profile，用户表 nickname 列 varchar(50)）
	    field="checkin"：我在本打卡活动内的打卡昵称（打卡记录页/任务日历页用户卡，
	                     checkin.checkin.setNickname，成员表 nickname 列 varchar(30)，
	                     展示优先级高于账号昵称：动态流/排行榜/成员列表/日签图都跟着变）
	  调用点只用 field 选改哪一份、target 传目标参数，标题/暗提示/上限/校验文案不得再抄第二份
	  （硬约束 11「同一组字段出现在两个界面必须抽一份字段组组件」；弹层写法见 ui-baseline-mobile M18）。
	-->
	<u-popup :show="show" mode="bottom" :round="12" bgColor="transparent" :closeable="true"
		:closeOnClickOverlay="true" :safeAreaInsetBottom="false" @close="close">
		<view class="tz-nickname-popup">
			<view class="tz-nickname-title">{{ conf.title }}</view>
			<view class="tz-nickname-body">
				<!-- type="nickname"：微信内置浏览器/小程序里键盘上方可直接「使用微信昵称」，
				     该值只在 change 事件里到手，所以 v-model 与 @change 都要留（u-input 不支持此 type） -->
				<input class="tz-nickname-input" type="nickname" v-model="draft" :maxlength="limit"
					:placeholder="conf.placeholder" @change="onChange" />
				<!-- 字段范围灰字：打卡昵称只在本活动内显示，不写这一句用户会以为改的是全局昵称 -->
				<text class="tz-nickname-tip" v-if="conf.tip">{{ conf.tip }}</text>
			</view>
			<view class="tz-nickname-submit">
				<tz-button type="primary" long text="确定" @click="confirm" />
			</view>
		</view>
	</u-popup>
</template>

<script>
/**
 * tz-nickname-modal：修改昵称的共用弹窗（打开方式与 tz-circle-reply-popup 一致：$refs.xxx.open()）
 *
 * props:
 *   field    'account'（默认）| 'checkin'
 *   nickname 当前昵称，用于回填输入框与「没改动就不提交」判定
 *   target   field=checkin 时必填：{ checkin_id: 628 }
 * emits:
 *   saved(newNickname) —— 保存成功，值是接口回读的那份；父级按它更新本页
 *
 * 两份字段的差异（接口名/标题/暗提示/上限/空值提示）只在这里存一份；
 * 上限与后端一致：账号昵称 = user.nickname varchar(50)（profile 接口不判长度，超长会被库静默截断），
 * 打卡昵称 = MemberService::NICKNAME_MAX（成员表 varchar(30)，后端会拦并给同一句文案）。
 */
const FIELDS = {
	account: {
		title: '修改昵称',
		placeholder: '请输入要修改的昵称',
		// 用户表 nickname 列 varchar(50)；profile 接口不判长度，超长会被数据库静默截断，前端先拦住
		maxLen: 50,
		emptyTip: '请输入昵称',
		tip: '',
		api: 'user.info.profile',
	},
	checkin: {
		title: '修改打卡昵称',
		placeholder: '请输入打卡昵称',
		// 兜底值：调用点传了 max-len（接口下发的 nickname_max）就以接口为准
		maxLen: 30,
		emptyTip: '请输入打卡昵称',
		tip: '仅在本活动内显示，不影响账号昵称',
		api: 'checkin.checkin.setNickname',
	},
};

export default {
	name: 'tz-nickname-modal',
	props: {
		field: { type: String, default: 'account' },
		nickname: { type: String, default: '' },
		target: { type: Object, default: null },
		// 接口下发的长度上限（打卡昵称由后端 MemberService::NICKNAME_MAX 给），传了就用接口的，不前端写死
		maxLen: { type: [Number, String], default: 0 },
	},
	data() {
		return {
			show: false,
			draft: '',
			saving: false,
		};
	},
	computed: {
		conf() {
			// 认不出的 field 落回账号口径，不静默改成另一种提交
			return FIELDS[this.field] || FIELDS.account;
		},
		limit() {
			const fromApi = Number(this.maxLen);
			return fromApi > 0 ? fromApi : this.conf.maxLen;
		},
	},
	methods: {
		open() {
			this.draft = this.nickname || '';
			this.saving = false;
			this.show = true;
		},
		close() {
			this.show = false;
		},
		// 微信昵称一键填充：值从 change 事件到手，补进 draft 再提交
		onChange(e) {
			this.draft = (e && e.detail && e.detail.value) || '';
		},
		async confirm() {
			if (this.saving) return;
			const value = String(this.draft || '').trim();
			if (!value) {
				uni.showToast({ title: this.conf.emptyTip, icon: 'none' });
				return;
			}
			// 没改动就直接收起，不发无意义的请求
			if (value === String(this.nickname || '').trim()) {
				this.close();
				return;
			}
			const params = Object.assign({}, this.field === 'checkin' ? this.target || {} : {}, { nickname: value });
			// 打卡昵称按活动定位：调用点没传活动 id 就不发这条请求（否则只会拿到「打卡活动不存在」），
			// 并且要说一句话——静默收起弹窗的表象就是「点了没反应」（M13）
			if (this.field === 'checkin' && !Number(params.checkin_id)) {
				uni.showToast({ title: '活动信息加载中，请稍后再试', icon: 'none' });
				return;
			}
			this.saving = true;
			uni.showLoading({ title: '提交中…', mask: true });
			let ret = null;
			try {
				ret = await this.$api(this.conf.api, params);
			} catch (e) {
				// 网络异常：$api 走 reject，这里兜住，否则 loading 卡死、弹窗既不收也不报错
				uni.hideLoading();
				this.saving = false;
				uni.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
				return;
			}
			uni.hideLoading();
			this.saving = false;
			// M13：拦截器对 code=0 只 toast 一秒，失败分支必须自己给出可读出口
			if (!ret || ret.code !== 1) {
				uni.showToast({ title: (ret && ret.msg) || '修改失败，请重试', icon: 'none' });
				return;
			}
			const saved = (ret.data && ret.data.nickname) || value;
			// 只有账号昵称才要动本地缓存（缓存里存的是登录时的账号资料）；打卡昵称不落缓存
			if (this.field === 'account') {
				this.$tools.patchCachedUser({ nickname: saved });
			}
			uni.showToast({ title: '修改成功', icon: 'none' });
			this.close();
			this.$emit('saved', saved);
		},
	},
};
</script>

<style scoped>
/* 弹层外壳与标题对齐全局教务档 .school-popup / .school-popup-title（16px/600 左对齐、
   内衬左右 16px + 底部 20px 安全区，微信端安全区减半）：本组件是 isolated 的，
   全局档进不来，故在这里自带一份同一组数值（参照 tz/teacher-info-popup 的写法） */
.tz-nickname-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	padding: 0 16px 20px;
	padding-bottom: calc(20px + constant(safe-area-inset-bottom));
	padding-bottom: calc(20px + env(safe-area-inset-bottom));
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(20px + constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(20px + env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}
.tz-nickname-title {
	padding: 15px 0 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}
.tz-nickname-submit {
	/* 与上方字段块拉开 50px（原 20 + 本轮加 30，剩下 20 在标题与输入框之间）：
	   弹窗整体加高 50px 只加在这里，标题档与外壳内衬是全局 .school-popup 的数值，不动 */
	margin-top: 50px;
}
/* 输入框版式沿用「我的-设置」里那份修改昵称输入框（白底、40px 高、14px 字、#f5f5f5 描边），
   组件是 isolated 的，全局档进不来，故在这里写死同一组数值 */
.tz-nickname-body {
	display: flex;
	flex-direction: column;
	width: 100%;
	padding-top: 20px;
}
.tz-nickname-input {
	display: block;
	width: 100%;
	height: 40px;
	line-height: 40px;
	padding: 0 10px;
	font-size: 14px;
	color: #1d2129;
	background-color: #fff;
	border: 1px solid #f5f5f5;
	border-radius: 4px;
}
/* 输入框下的灰字说明：12px 辅助灰（§1 辅助信息档），只有打卡昵称那一份有 */
.tz-nickname-tip {
	display: block;
	width: 100%;
	margin-top: 6px;
	font-size: 12px;
	line-height: 1.5;
	color: #86909c;
}
</style>
