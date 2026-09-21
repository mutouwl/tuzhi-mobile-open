<template>
	<view class="student-edit-page">
		<!-- 编辑模式初始化骨架屏：row-col 按表单行布局（标签 + 右侧值/头像） -->
		<view class="sk-card" v-if="pageLoading">
			<t-skeleton :loading="true" animation="gradient" :row-col="skeletonRows" t-class="sk-rows" />
		</view>
		<template v-else>
		<view class="form-section" v-if="!detailError">
			<view class="form-item" @click="chooseAvatar">
				<text class="form-label">头像</text>
				<view class="avatar-wrap">
					<u-avatar :src="form.avatar" shape="square" :size="56" mode="aspectFill"></u-avatar>
				</view>
			</view>
			<view class="form-item">
				<text class="form-label">姓名</text>
				<!-- placeholder-style 兼容小程序：mp 原生 input 不响应 css ::placeholder，属性两端均支持 -->
				<input
					class="form-input"
					v-model="form.name"
					placeholder="请输入学生姓名"
					placeholder-style="color: #ccc"
					maxlength="50"
				/>
			</view>
			<view class="form-item">
				<text class="form-label">手机号</text>
				<input
					class="form-input"
					v-model="form.phone"
					placeholder="请输入手机号码"
					placeholder-style="color: #ccc"
					type="number"
					maxlength="11"
				/>
			</view>
			<view class="form-item">
				<text class="form-label">性别</text>
				<view class="gender-group">
					<view class="gender-item" :class="{ on: form.gender == 1 }" @click="form.gender = 1">
						<view class="gender-radio" />
						<text>男</text>
					</view>
					<view class="gender-item" :class="{ on: form.gender == 2 }" @click="form.gender = 2">
						<view class="gender-radio" />
						<text>女</text>
					</view>
				</view>
			</view>
			<view class="form-item">
				<text class="form-label">生日</text>
				<view class="picker-row" @click="openBirthday">
					<text class="form-value" :class="{ placeholder: !form.birthday }">{{ form.birthday || '请选择生日' }}</text>
					<tz-icon name="enter" color="#86909C" :size="13" />
				</view>
			</view>
		</view>

		<!-- 学生不存在/已删除：空态提示 + 新建入口（隐藏表单与保存按钮） -->
		<view class="empty-state" v-else>
			<u-empty
				icon="/static/image/empty.png"
				width="70"
				height="70"
				:text="detailErrorMsg"
			/>
			<view class="empty-btn">
				<u-button class="empty-add-btn" type="primary" text="新建学生" @click="resetToCreate"></u-button>
			</view>
		</view>

		<view class="bottom-btns h5-bottom-bar" v-if="!detailError">
			<u-button class="save-btn" type="primary" text="保存" :loading="submitting" loading-text="保存中…" @click="save"></u-button>
		</view>
		</template>

		<u-popup :show="birthdayVisible" mode="bottom" :round="12" bgColor="transparent" :safeAreaInsetBottom="false" @close="birthdayVisible = false">
			<view class="student-birthday-popup">
				<view class="student-birthday-header">
					<text class="student-birthday-title">选择生日</text>
					<text class="student-birthday-cancel" @click="birthdayVisible = false">取消</text>
					<text class="student-birthday-confirm" @click="confirmBirthday">确定</text>
				</view>
				<t-date-time-picker
					v-if="birthdayVisible"
					:use-popup="false"
					:header="false"
					mode="date"
					format="YYYY-MM-DD"
					:value="birthdayValue"
					:start="minBirthdayTs"
					:end="maxBirthdayTs"
					@pick="onBirthdayPick"
				/>
			</view>
		</u-popup>

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
