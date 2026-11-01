<template>
	<!--
	  商品规格弹窗里的「拼团人数」档位选择（2026-10-29 用户点名）

	  口径：**阶梯型的人数档在「选择商品规格」这一步就选掉**，不再由拼团区那只第二步弹窗再问一遍
	  （原话「在这个选择商品规格弹窗里面，增加这个阶梯的选择。注意，不同阶梯对应的价格不同，
	  要进行单独适配」）。四只宿主规格弹窗（实物 `sku-select-modal` / 组合 `spec-select-modal` /
	  圈子 `tz-circle-spec-popup` / 教务 `package-sku-select-modal`）与会员卡页内那一排规格卡挂的是
	  **同一份组件**：档位清单、选中回落、价格文案只此一处（硬约束 11），各宿主只把
	  「当前选中的规格 id」传进来、把 `v-model` 收回来的档位 id 记在自己身上。

	  三条纪律：
	   ① **档位清单只读后端** `activity.ladder`（按 `spec_id` 分组下发），端上不按人数自己排队；
	   ② **落点跟随规格**：规格一换，原来选的那一档对不上 ⇒ 自动落这一档规格的第一档
	      （`gbTiersOf()` 的回落规则与拼团区一致，见 `common/utils/group-buy-spec.js`）；
	   ③ **空表整块不出**：不是阶梯型 / 还没配档位时一枚标签都不摆（能推导的不开放填写，硬约束 9）。
	-->
	<view class="gbl" v-if="rows.length">
		<view class="gbl-title">{{ title }}</view>
		<view class="gbl-chips">
			<view class="gbl-chip" v-for="row in rows" :key="row.id"
				:class="{ 'gbl-chip--on': Number(value) === Number(row.id) }"
				@click="pick(row)">
				<text class="gbl-chip-text">¥{{ priceTextOf(row) }}/{{ row.invite_num }}人团</text>
			</view>
		</view>
	</view>
</template>

<script>
import { gbTiersOf, gbTierPriceText } from '@/common/utils/group-buy-spec.js';

export default {
	name: 'GbLadderPicker',
	props: {
		/** 拼团活动本体（后端 `group_buy/activity/detail` 的回体；非阶梯型相当于没有档位） */
		activity: { type: Object, default: null },
		/** 当前选中的商品规格 id（档位按它分组取；会员卡是 sku 下标、可能为 0） */
		specId: { type: [Number, String], default: 0 },
		/** 选中的人数额（v-model；0 = 还没选，`ensure()` 会落第一档） */
		value: { type: [Number, String], default: 0 },
		/** 小节标题（四只规格弹窗用默认「拼团人数」；拼团档位弹窗那一只写「拼团类型」，见 M39） */
		title: { type: String, default: '拼团人数' },
		/**
		 * 档位价带「起」：同一人数档在各规格下价不同时（多规格活动的第一步还没定规格）。
		 * 缺省 false ⇒ 四只规格弹窗逐字不变（那里规格已选定，给的就是准确价）。
		 */
		range: { type: Boolean, default: false },
	},
	emits: ['input', 'pick'],
	computed: {
		rows() {
			return gbTiersOf(this.activity, this.specId);
		},
	},
	watch: {
		// 规格一换 / 活动重取：原来那一档可能不在新清单里 ⇒ 落这一档规格的第一档
		rows() { this.ensure(); },
		specId() { this.ensure(); },
	},
	created() {
		this.ensure();
	},
	methods: {
		/** 选中项对齐到当前规格的档位清单（不合法就落第一档；空清单回 0，让宿主知道「没有档位」） */
		ensure() {
			const rows = this.rows;
			if (!rows.length) {
				if (Number(this.value)) { this.$emit('input', 0); }
				return;
			}
			const hit = rows.filter((row) => Number(row.id) === Number(this.value))[0];
			if (!hit) { this.$emit('input', Number(rows[0].id) || 0); }
		},
		pick(row) {
			const id = Number(row.id) || 0;
			if (id !== Number(this.value)) { this.$emit('input', id); }
			this.$emit('pick', row);
		},
		/** 档位 chip 上的价：规格已定给准确价，多规格第一步按 `range` 带「起」（口径只存 util 一处） */
		priceTextOf(row) {
			if (this.range) { return gbTierPriceText(this.activity, row); }
			return this.money(row.price);
		},
		money(v) {
			return (Number(v) || 0).toFixed(2);
		},
	},
};
</script>

<style scoped>
/* 版式与四只宿主规格弹窗的 section 同档（实物 `.sku-section` / 套餐 `.pkg-section`：
   标题 14/500/#333 + 下 12px、选项 8px×16px 圆角 6、间距 10）——组件本身不带左右内衬，
   宿主 body 已经有 16px 内衬（硬约束 18：块高由内容算，不叠两层 padding） */
.gbl {
	margin-bottom: 20px;
}
.gbl-title {
	font-size: 14px;
	color: #333;
	font-weight: 500;
	margin-bottom: 12px;
}
.gbl-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}
/* 选中态与拼团弹层 `.gbc-chip--on` / 四只宿主弹窗的拼团态同值（红边 + 浅红底 + 红字），
   不在这一处另起一套色（硬约束 29：同一业务的主色只存一处口径） */
.gbl-chip {
	display: inline-flex;
	align-items: center;
	padding: 8px 16px;
	background-color: #f7f8fa;
	border: 1px solid transparent;
	border-radius: 6px;
}
.gbl-chip--on {
	background-color: #fff7f7;
	border-color: #f53f3f;
}
.gbl-chip-text {
	font-size: 14px;
	color: #333;
	line-height: 20px;
}
.gbl-chip--on .gbl-chip-text {
	color: #f53f3f;
}
</style>
