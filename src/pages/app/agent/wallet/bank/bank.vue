<template>
	<div class="container">
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


		<tz-tab-bar />

		<tz-footer/>
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
@import "./css.css";
</style>
