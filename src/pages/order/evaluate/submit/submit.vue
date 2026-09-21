<template>
	<view class="container">
		<tz-box>
			<course
			:name="data.snapshoot.name"
			:cover="data.snapshoot.cover"
			:type="data.snapshoot.type"
			:price="data.snapshoot.price"
			:count="data.count"
			/>
			<tz-divider bgColor="#fff" />
		</tz-box>
		<tz-divider />
		<tz-box>
			<u-form :labelWidth="labelWidth" :model="form">

				<u-form-item label="打分" ref="item1">
					<u-rate :count="5" v-model="form.rate" :size="26"></u-rate>
				</u-form-item>

				<tz-divider bgColor="#fff" height="10" />
				<u-line color="#ebedf0"></u-line>
				<tz-divider bgColor="#fff" height="10" />

				<u-textarea v-model="form.content" border="none" placeholder="请输入评价内容" count confirmType="done"></u-textarea>

				<tz-divider bgColor="#fff" height="10" />
				<div style="color:#86909C;">添加图片</div>
				<tz-divider bgColor="#fff" height="5" />

				<u-upload @afterRead="afterRead" :fileList="imgList" :multiple="false" @delete="deletePic" name="img" multiple :maxCount="9"></u-upload>


				<tz-divider bgColor="#fff" height="10" />
				<u-line color="#ebedf0"></u-line>
				<tz-divider bgColor="#fff" height="10" />


				<u-form-item label="匿名评价">
					<u-switch v-model="form.anonymity" :activeValue="1" :inactiveValue="0"></u-switch>
				</u-form-item>

			</u-form>
		</tz-box>


		<tz-bottom-btn type="evaluate" @handle="submit"/>

		<tz-footer/>
	</view>
</template>

<script src="./js.vue">

</script>

<style>
@import "./css.css";
</style>
