<template>
  <div class="container">
  <tz-loading-page tip="正在加载页面" :loading="loading" />
    <div class="icon">
      <img :src="'/static/image/' + status + '.png'" alt="" />
    </div>

    <div class="tip">
      <div class="title">
        {{ title }}
      </div>

      <div class="subtitle">
        {{ subtitle }}
      </div>
    </div>

    <tz-divider height="40" bgColor="none" />

    <template v-if="type == 'noauth'">
      <tz-title bgColor="none" title="请订阅下方课程后继续填写" :more="false" />
      <tz-box bgColor="none" padding="0 15px 0px">
        <template v-if="content_list && content_list.length > 0">
          <tz-course-mini :list="content_list" :border="true" :round="true" />
        </template>

        <u-empty
          icon="/static/image/empty.png"
          width="70"
          height="70"
          v-else
          text="暂未绑定课程"
        />
      </tz-box>
    </template>

    <template v-else>
      <tz-box bgColor="none">
        <div class="btn-group">
          <div v-if="status_info.can_resubmit">
            <tz-button
              text="再填一份"
              style="width: 100%"
              long
              @click="$nav.to('/pages/app/form/submit/submit?id='+form.id, 'local', 'redirectTo')"
            ></tz-button>
          </div>
		  <div v-else>
            <tz-button
              text="返回首页"
              style="width: 100%"
              long
              @click="$nav.to('/pages/index/index', 'local', 'reLaunch')"
            ></tz-button>
          </div>
          <div>
            <tz-button
              text="查看填写详情"
              style="width: 100%"
              long
              @click="
                $nav.to(
                  '/pages/app/form/submit/submit?log_id=' + pageParams.log_id,
                  'local',
                  'redirectTo'
                )
              "
            ></tz-button>
          </div>
        </div>
      </tz-box>
    </template>

    <tz-footer />
  </div>
</template>

<script src="./js.vue"></script>

<style lang="scss" scoped>
@import "./css.css";
</style>
