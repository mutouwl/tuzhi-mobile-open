<template>
	<div class="container">
		<!-- 已存的银行卡随接口回填：到手前整块按真实表单版式铺骨架屏（三行「标签 80 + 输入值」+ 确定按钮），
		     既不摆一张看着像没填的空表，也不给一次会把已存卡号覆盖掉的提交（M16） -->
		<div class="bnk-sk" v-if="loading">
			<tz-box padding="0 15px">
				<div class="bnk-sk-item">
					<span class="bnk-sk-label bnk-sk-block"></span>
					<span class="bnk-sk-line bnk-sk-block sk-w-30"></span>
				</div>
				<div class="bnk-sk-item">
					<span class="bnk-sk-label bnk-sk-block"></span>
					<span class="bnk-sk-line bnk-sk-block sk-w-55"></span>
				</div>
				<div class="bnk-sk-item">
					<span class="bnk-sk-label bnk-sk-block"></span>
					<span class="bnk-sk-line bnk-sk-block sk-w-45"></span>
				</div>
			</tz-box>
			<tz-box bgColor="non3">
				<span class="bnk-sk-btn bnk-sk-block"></span>
			</tz-box>
		</div>
		<template v-else>
			<tz-box padding="0 15px">
				<u-form labelPosition="left" :model="form" :rules="rules" ref="uForm">
					<u-form-item labelWidth="80" label="持卡人" prop="name"  borderBottom>
						<u-input :fontSize="14" v-model="form.name" border="none" placeholder="请输入持卡人姓名"></u-input>
					</u-form-item>
					<u-form-item labelWidth="80" label="卡号" prop="card_no" borderBottom>
						<u-input type="number" :fontSize="14" v-model="form.card_no" border="none" placeholder="请输入卡号"></u-input>
					</u-form-item>
					<u-form-item labelWidth="80" label="开户银行" prop="card_no">
						<u-input :fontSize="14" v-model="form.address" border="none" placeholder="请输入开户银行"></u-input>
					</u-form-item>
				</u-form>
			</tz-box>

			<tz-box bgColor="non3">
				<u-button text="确定" type="primary" @click="setCard"></u-button>
			</tz-box>
		</template>


		<tz-tab-bar />

		<tz-footer/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
