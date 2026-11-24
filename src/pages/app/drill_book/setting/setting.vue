<template>
	<div class="container db-setting">
		<!-- 首屏骨架（M16）：外壳复用真实 .db-set-card，灰块只替换会变的那几行数值 -->
		<template v-if="skeletonLoading">
			<view class="db-set-card">
				<view class="db-set-label"><view class="db-sk-line" style="width:56px"></view></view>
				<view class="db-set-options">
					<view class="db-sk-option" v-for="i in 2" :key="'m' + i"></view>
				</view>
				<view class="db-set-label"><view class="db-sk-line" style="width:56px"></view></view>
				<view class="db-set-options">
					<view class="db-sk-option" v-for="i in 2" :key="'a' + i"></view>
				</view>
				<view class="db-set-label"><view class="db-sk-line" style="width:72px"></view></view>
				<view class="db-set-options">
					<view class="db-sk-option" v-for="i in 2" :key="'c' + i"></view>
				</view>
			</view>
		</template>

		<template v-else>
			<view class="db-set-tip" v-if="total > 0">上次未提交的题目不受此设置影响</view>

			<view class="db-set-card">
				<view class="db-set-label">出题模式</view>
				<view class="db-set-options">
					<view class="db-set-option" :class="{ 'db-set-option-active': form.question_mode === 'sort' }"
						@click="form.question_mode = 'sort'">
						<text>顺序出题</text>
						<tz-icon v-if="form.question_mode === 'sort'" name="checkmark" :size="14" color="#0968f6" />
					</view>
					<view class="db-set-option" :class="{ 'db-set-option-active': form.question_mode === 'random' }"
						@click="form.question_mode = 'random'">
						<text>随机出题</text>
						<tz-icon v-if="form.question_mode === 'random'" name="checkmark" :size="14" color="#0968f6" />
					</view>
				</view>

				<view class="db-set-label">
					答题模式
					<text class="db-set-tip-icon">ⓘ</text>
				</view>
				<view class="db-set-options">
					<view class="db-set-option" :class="{ 'db-set-option-active': form.answer_mode === 'practice' }"
						@click="form.answer_mode = 'practice'">
						<text>做题模式</text>
						<tz-icon v-if="form.answer_mode === 'practice'" name="checkmark" :size="14" color="#0968f6" />
					</view>
					<view class="db-set-option" :class="{ 'db-set-option-active': form.answer_mode === 'test' }"
						@click="form.answer_mode = 'test'">
						<text>测试模式</text>
						<tz-icon v-if="form.answer_mode === 'test'" name="checkmark" :size="14" color="#0968f6" />
					</view>
				</view>
				<view class="db-set-hint">
					做题模式：每题作答后立即显示对错与解析；测试模式：交卷后统一判分。
				</view>

				<view class="db-set-label">单次答题数</view>
				<view class="db-set-options">
					<view class="db-set-option" :class="{ 'db-set-option-active': !useCustom }" @click="setAll">
						<text>全部（{{ total }} 题）</text>
						<tz-icon v-if="!useCustom" name="checkmark" :size="14" color="#0968f6" />
					</view>
					<view class="db-set-option" :class="{ 'db-set-option-active': useCustom }" @click="enableCustom">
						<text>自定义题量</text>
						<tz-icon v-if="useCustom" name="checkmark" :size="14" color="#0968f6" />
					</view>
				</view>
				<view v-if="useCustom" class="db-set-count">
					<view class="db-set-count-field">
						<input class="db-set-count-input" type="number" v-model="countText" placeholder="请输入"
							placeholder-style="color:#c9cdd4;font-size:14px" @blur="normalizeCount" />
						<text class="db-set-count-unit">条</text>
					</view>
					<text class="db-set-count-hint">最多 {{ total }} 题</text>
				</view>
			</view>
		</template>

		<!-- 底栏常在：骨架期按钮一并置灰不可点，数据回来再启用（不在加载中藏掉主操作）。
		     骨架期文案保持「开始刷题」：数据没回来时还不知道题量，先写「该目录暂无题目」
		     等于进页面第一帧就报一句还没核实的状态（2026-11-23 用户点名）；只有真取到 0 题才换那句 -->
		<view class="db-set-bottom school-footer h5-bottom-bar">
			<u-button type="primary" :customStyle="{ width: '100%' }" :loading="starting"
				:disabled="skeletonLoading || total <= 0" @click="start">{{ skeletonLoading || total > 0 ? '开始刷题' : '该目录暂无题目' }}</u-button>
		</view>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
