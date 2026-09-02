<template>
	<div>
		<tz-loading-page tip="页面加载中…" :loading="loading"/>
		<div v-if="!pageNull" class="page" :style="{
			'background-color': data.page.bgColor == 'default' ? '#f5f5f5' : data.page.diyColor
		}">
			<template v-for="(item, index) in data.compontents">
				<tz-box :bg-color="data.compontents[index].config.boxbgColor"
					:round="data.compontents[index].config.boxround"
					:padding="data.compontents[index].config.boxpadding"
					:margin="data.compontents[index].config.boxmargin">

					<tz-audio  :title="data.compontents[index].config.title"
                                        :link="data.compontents[index].config.link"
                                        :link_status="data.compontents[index].config.link_status"
                                        :path="data.compontents[index].config.file.fullurl"
					v-if="item && item.type == 'audio'"/>

					<tz-video :patch="data.compontents[index].config.patch"
                                        :path="data.compontents[index].config.file.fullurl"
										:height="data.compontents[index].config.height"
					 v-if="item && item.type == 'video'"/>


					<tz-image :list="data.compontents[index].config.list"
                                        :col="data.compontents[index].config.col"
                                        :gap="data.compontents[index].config.gap"
										:height="data.compontents[index].config.height"
                                        :title_status="data.compontents[index].config.title_status"
                                        :round_status="data.compontents[index].config.round_status"
                                        :round_val="data.compontents[index].config.round_val" v-if="item && item.type == 'image'"/>

					<tz-divider :height="data.compontents[index].config.height"
						:bg-color="data.compontents[index].config.bgColor" v-if="item && item.type == 'divider'" />

					<tz-title :title="data.compontents[index].config.title" :link="data.compontents[index].config.link"
						:subtitle="data.compontents[index].config.subtitle" :more="data.compontents[index].config.more"
						:size="data.compontents[index].config.size" :color="data.compontents[index].config.color" :sub_color="data.compontents[index].config.sub_color"
						:bgColor="data.compontents[index].config.boxbgColor" :bold="data.compontents[index].config.bold"
						v-if="item && item.type == 'title'" />

					<tz-notice :text="data.compontents[index].config.text" :link="data.compontents[index].config.link"
						v-if="item && item.type == 'notice'" />

					<tz-swiper :list="data.compontents[index].config.item" :round="data.compontents[index].config.round"
						:height="data.compontents[index].config.height"
						:indicator="data.compontents[index].config.indicator"
						:indicatorMode="data.compontents[index].config.indicatorMode"
						v-if="item && item.type == 'swiper'" />

					<tz-search v-if="item && item.type == 'search'" :color="data.compontents[index].config.color"
						:inputBgColor="data.compontents[index].config.inputBgColor" />

					<tz-fans v-if="item && item.type == 'fans'" :title="data.compontents[index].config.title"
						:subtitle="data.compontents[index].config.subtitle"
						:avatar="data.compontents[index].config.avatar"
						:tipText="data.compontents[index].config.tipText" :code="data.compontents[index].config.code" />

					<tz-parse v-if="item && item.type == 'parse'" :content="data.compontents[index].config.content" />

					<tz-navigation v-if="item && item.type == 'navigation'" :list="data.compontents[index].config.item"
						:color="data.compontents[index].config.color" :col="data.compontents[index].config.col"
						:size="data.compontents[index].config.size" :fontSize="data.compontents[index].config.fontSize" :spacing="data.compontents[index].config.spacing" :border="data.compontents[index].config.border" />

					<tz-course v-if="item && item.type == 'course'" :list="data.compontents[index].config.list"
						:border="data.compontents[index].config.border" :round="data.compontents[index].config.round"
						:type="data.compontents[index].config.type" :margin="data.compontents[index].config.margin"
						:maxShowCourseNum="data.compontents[index].config.maxShowCourseNum" />

				<tz-composite v-if="item && item.type == 'composite'" :list="data.compontents[index].config.list"
					:border="data.compontents[index].config.border" :round="data.compontents[index].config.round"
					:type="data.compontents[index].config.type" :margin="data.compontents[index].config.margin" />

				<tz-circle v-if="item && item.type == 'circle' && circleInstalled" :list="circleList"
					:type="data.compontents[index].config.type" :margin="data.compontents[index].config.margin"
					:border="data.compontents[index].config.border" :round="data.compontents[index].config.round" />

				<tz-circle-post v-if="item && item.type == 'circle_post' && circleInstalled" :list="circlePostList"
					mode="preview" :circle-id="data.compontents[index].config.circleId"
					:border="data.compontents[index].config.border" :round="data.compontents[index].config.round"
					:clickable="true" @comment="goPostDetail" />

					<tz-physical-goods v-if="item && item.type == 'physical'" :list="data.compontents[index].config.list"
						:border="data.compontents[index].config.border" :round="data.compontents[index].config.round"
						:type="data.compontents[index].config.type" :margin="data.compontents[index].config.margin" />

						<tz-teacher v-if="item && item.type == 'teacher'"
						:round="data.compontents[index].config.round"
						:name="data.compontents[index].config.name" :introduce="data.compontents[index].config.introduce"
						:avatar="data.compontents[index].config.avatar" :course="data.compontents[index].config.course" />

					<tz-contact :type="data.compontents[index].config.type"
						:mobile_status="data.compontents[index].config.mobile_status"
						:mobile_val="data.compontents[index].config.mobile_val"
						:mobile_tip="data.compontents[index].config.mobile_tip"
						:link="data.compontents[index].config.link"
						:wechat_status="data.compontents[index].config.wechat_status"
						:wechat_qrcode="data.compontents[index].config.wechat_qrcode"
						:wechat_tip="data.compontents[index].config.wechat_tip"
						:modal_title="data.compontents[index].config.modal_title"
						:modal_tip="data.compontents[index].config.modal_tip"
						v-if="item && item.type == 'contact'" />


					<tz-live :source="data.compontents[index].config.source"
						:live="data.compontents[index].config.live"
						:max_show_num="data.compontents[index].config.max_show_num"
						:title_show="data.compontents[index].config.title_show"
						:introduce_show="data.compontents[index].config.introduce_show"
						:price_show="data.compontents[index].config.price_show"
						:marking_price_show="data.compontents[index].config.marking_price_show"
						:status_show="data.compontents[index].config.status_show"
						:round="data.compontents[index].config.round"
						:start_time_show="data.compontents[index].config.start_time_show"
						v-if="item && item.type == 'live'" />

					<tz-coupon @refresh="refresh()" :max_show_num="data.compontents[index].config.max_show_num"
						:coupon="data.compontents[index].config.coupon" :source="data.compontents[index].config.source"
						v-if="item && item.type == 'coupon'" />

				</tz-box>
			</template>
		</div>

		<u-empty mode="page" v-if="pageNull"></u-empty>

		<!-- tabbar 不依赖页面数据加载（v-if="!pageNull"），保证切换页面时及时展示 -->
		<tz-tab-bar ref="tabbar" :placeholder="false" />

		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">
	@import "./css.css";
</style>