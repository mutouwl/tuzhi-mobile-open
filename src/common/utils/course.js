import api from '@/common/request/index';
import tools from '@/common/utils/tools';
import sls from '@/common/utils/log-sls';

// var timer = null;

/**
 * 学习心跳上报
 *
 * 页面照旧每 5 秒喂一次进度，桶满（或用户离开、切课）才真正发一次请求。
 * 通道判据与 App.vue 的 record() 同一形状，二选一、不并流：
 *   本地档  打后端 study.setLog → tuzhi_study
 *   SLS 档  只直连阿里云日志服务，一条 setLog 都不发；
 *           后端 crontab 的「日志学习明细回流」把这些明细补写回 tuzhi_study，
 *           学习时长、完课率、续播进度的口径不变（见 common/library/log/ReflowStudy.php）
 */
const bucket = {
  courseId: 0,
  columnId: 0,
  bucketStart: 0,
  lastTs: 0,
  delta: 0,
  progress: 0
};

/** 明细唯一ID，回流任务按它幂等去重 */
function newLogId() {
  const rand = Math.random().toString(36).slice(2, 10);
  return Date.now().toString(36) + '-' + rand;
}

/**
 * 学习明细归属的用户ID
 *
 * 走后端时 user_id 由 $this->auth->id 在服务端定，端上不用传；
 * 直连 SLS 后这一条不再经过后端，回流要认人，所以人必须写在明细里。
 * 未登录（游客看试看片那一档）取到 0，回流侧按 0 落库，与后端那一条口径一致。
 * @return {number}
 */
function studyUserId() {
  const user = tools.cachedUser();
  return user && user.id ? Number(user.id) : 0;
}

function resetBucket() {
  bucket.courseId = 0;
  bucket.columnId = 0;
  bucket.bucketStart = 0;
  bucket.lastTs = 0;
  bucket.delta = 0;
  bucket.progress = 0;
}

/**
 * 结算当前桶
 * @param pause 传 1 时后端会立刻把缓存落库，用于用户离开页面这一刻
 */
function flushBucket(pause) {
  const courseId = bucket.courseId;
  const columnId = bucket.columnId;
  const delta = Math.round(bucket.delta);
  const start = bucket.bucketStart;
  const end = bucket.lastTs;
  const progress = bucket.progress;

  resetBucket();

  if (!courseId || delta <= 0) {
    return;
  }

  // 通道二选一：SLS 档一条 setLog 都不发，时长与进度由后端回流补进 tuzhi_study
  if (!sls.isSlsMode()) {
    api('study.setLog', {
      course_id: courseId,
      column_id: columnId,
      media_progress: progress,
      delta_seconds: delta,
      pause: pause || 0
    });
    return;
  }

  sls.send({
    biz_type: 'study',
    log_id: newLogId(),
    user_id: studyUserId(),
    course_id: courseId,
    column_id: columnId,
    bucket_start: start,
    bucket_end: end,
    delta_seconds: delta,
    media_progress: progress,
    pause: pause || 0
  });
}

/**
 * 记一次心跳：累加到当前桶，桶满或需要结算时才发请求
 * @param courseId 课程ID
 * @param columnId 专栏ID
 * @param currentTime 播放器当前秒数（绝对进度，续播靠它）
 * @param pause 传 1 表示用户离开，立刻结算并让后端落库
 */
function pushStudyLog(courseId, columnId, currentTime, pause) {
  const now = Math.floor(Date.now() / 1000);
  const sec = sls.granularity();

  // 换课或换专栏：旧桶必须先结算，否则增量会算到新课程头上
  if (bucket.courseId && (bucket.courseId !== courseId || bucket.columnId !== columnId)) {
    flushBucket(0);
  }

  // 桶按墙钟对齐，这样同一秒重放进同一个桶，回放不会翻倍
  const bucketStart = Math.floor(now / sec) * sec;
  if (bucket.bucketStart && bucketStart !== bucket.bucketStart) {
    flushBucket(0);
  }

  if (!bucket.lastTs) {
    bucket.lastTs = now;
  } else {
    const gap = now - bucket.lastTs;
    // 合盖/挂机后间隔可能是几小时，照实累加会把时长记飞
    bucket.delta += Math.max(0, Math.min(gap, sls.maxDelta()));
    bucket.lastTs = now;
  }

  bucket.courseId = courseId;
  bucket.columnId = columnId;
  bucket.bucketStart = bucketStart;
  bucket.progress = currentTime;

  if (pause) {
    flushBucket(pause);
  }
}

/**
 * 直播明细用的桶
 *
 * 直播这一路心跳固定 5 秒、不能降频（在线人数是按 end_time 时间窗反推的，
 * 心跳间隔就是那两个指标的时间分辨率），所以聚合腿照旧每 5 秒打后端。
 * 但明细腿仍要进 SLS —— 每日对账拿它比对总秒数，缺了直播那部分就对不上。
 * 网络请求已经在发，明细按粒度攒一攒不额外增加往返。
 */
const detailBucket = {
	courseId: 0,
	columnId: 0,
	bucketStart: 0,
	lastTs: 0,
	delta: 0,
	progress: 0
};

function resetDetailBucket() {
	detailBucket.courseId = 0;
	detailBucket.columnId = 0;
	detailBucket.bucketStart = 0;
	detailBucket.lastTs = 0;
	detailBucket.delta = 0;
	detailBucket.progress = 0;
}

/** 直播的明细桶 —— 本地档由 intervalSetStudyLog 每 5 秒打后端，SLS 档只走这一条 */
function flushDetailBucket() {
	// 先把要用的都取出来，resetDetailBucket 会把桶清零
	const courseId = detailBucket.courseId;
	const columnId = detailBucket.columnId;
	const delta = Math.round(detailBucket.delta);
	const start = detailBucket.bucketStart;
	const end = detailBucket.lastTs;
	const progress = detailBucket.progress;

	resetDetailBucket();

	if (!courseId || delta <= 0) {
		return;
	}

	sls.send({
		biz_type: 'study',
		log_id: newLogId(),
		user_id: studyUserId(),
		course_id: courseId,
		column_id: columnId,
		bucket_start: start,
		bucket_end: end,
		delta_seconds: delta,
		media_progress: progress
	});
}

function pushDetailLog(courseId, columnId, currentTime) {
	const now = Math.floor(Date.now() / 1000);
	const sec = sls.granularity();

	if (detailBucket.courseId && (detailBucket.courseId !== courseId || detailBucket.columnId !== columnId)) {
		flushDetailBucket();
	}

	const bucketStart = Math.floor(now / sec) * sec;
	if (detailBucket.bucketStart && bucketStart !== detailBucket.bucketStart) {
		flushDetailBucket();
	}

	if (!detailBucket.lastTs) {
		detailBucket.lastTs = now;
	} else {
		const gap = now - detailBucket.lastTs;
		detailBucket.delta += Math.max(0, Math.min(gap, sls.maxDelta()));
		detailBucket.lastTs = now;
	}

	detailBucket.courseId = courseId;
	detailBucket.columnId = columnId;
	detailBucket.bucketStart = bucketStart;
	detailBucket.progress = currentTime;
}

export default {
  timer: null,
  screen_record_timer: null,
  /**
   * 主课 / 音频 / 图文的心跳入口。页面每 5 秒调一次即可，实际发请求的节奏由汇总粒度决定
   */
  setStudyLog(courseId,columnId, currentTime,pause=0) {
    // 学习时长统计关闭后不再上报
    if (tools.systemConfig("app_statistics_study_log") == '0') {
      return;
    }
    pushStudyLog(courseId, columnId, currentTime, pause);
  },
  /**
   * 直播这一路不参与汇总桶，硬钉 5 秒
   *
   * 本地档那 5 秒一次的 setLog 是「当前在线人数」降级口径与在线趋势的时间分辨率来源，
   * 降到 60 秒会让在线人数直接少报一个量级（主口径是消息服务的群组在线列表）。
   * 切到 SLS 档后这条请求不再发，进阿里云的明细仍按后台「记录粒度」攒桶。
   */
  intervalSetStudyLog(courseId,columnId, currentTime) {
    this.stopStudyLog();
    // 学习时长统计关闭后不再启动定时上报
    if (tools.systemConfig("app_statistics_study_log") == '0') {
      return;
    }
    this.timer = setInterval(function () {
      if (!sls.isSlsMode()) {
        api('study.setLog', {
          course_id: courseId,
          column_id: columnId,
          media_progress: currentTime
        });
      }
      pushDetailLog(courseId, columnId, currentTime);
    }, 5000);
  },
  /**
   * 直播间离开页面时补最后一枪
   *
   * 原来 onHide 只停定时器，缓存里最后一段时长要等定时任务才落库；
   * pause=1 让后端立刻 singleSyncCache。SLS 档这一条不打后端，pause 写进明细，
   * 由回流任务读到后替这一条立刻落库（ReflowStudy）。明细桶也在这里结算。
   */
  flushLiveStudyLog(courseId, columnId) {
    if (tools.systemConfig("app_statistics_study_log") == '0') {
      return;
    }
    if (!courseId) {
      return;
    }
    flushDetailBucket();
    if (!sls.isSlsMode()) {
      api('study.setLog', {
        course_id: courseId,
        column_id: columnId,
        pause: 1
      });
    }
  },
  /**
   * 切课 / 换专栏时结算直播明细桶，避免增量算到下一场直播头上
   */
  flushLiveDetail() {
    flushDetailBucket();
  },
  stopStudyLog() {
    console.log("stopStudyLog - course.js:26")
    clearInterval(this.timer);
  },
  /**
   * 禁止PC端访问
   * @params type 课程类型
   * @params id 课程ID
   */
  checkBanPc(type, id) {
    var platform = wx.getDeviceInfo().platform;
    if (
      (type == 'video' || type == 'audio' || type == 'live') &&
      tools.systemConfig("wx_mp_ban_pc_use") == "open" &&
      (platform == 'windows' || platform == 'mac' || platform == 'macos' || platform == 'devtools')
    ) {
      uni.redirectTo({
        url: "/pages/public/banpc/banpc?id=" + id
      });
    }
  },
  // 禁止录屏/截屏
  banScreenRecordStart() {

    // #ifndef MP-WEIXIN
    return;
    // #endif

    if (tools.systemConfig("wx_mp_ban_screen_record") != "open") {
      return;
    }

    //防录屏/截屏
    let platform = uni.getSystemInfoSync().platform;
    //安卓手机
    if (platform === "android" || platform === "ohos") {
      if (wx.setVisualEffectOnCapture) {
        wx.setVisualEffectOnCapture({
          visualEffect: 'hidden',
          success: (res) => {
          }
        })
        
      }
    } else {
      //苹果手机
      this.screen_record_timer = setInterval(() => {
        wx.getScreenRecordingState({
          success: (res) => {
            if (res.state == 'on') {
              uni.showToast({
                title: '此页面不允许录屏',
                icon: 'none'
              })
              setTimeout(() => {
                uni.reLaunch({
                  url: '/pages/index/index'
                })
              }, 1000)
            }
          }
        })
      }, 2000)
    }
  },
  // 取消防录屏/截屏
  banScreenRecordCancel() {

    // #ifndef MP-WEIXIN
    return;
    // #endif

    if (tools.systemConfig("wx_mp_ban_screen_record") != "open") {
      return;
    }

    if (wx.setVisualEffectOnCapture) {
      wx.setVisualEffectOnCapture({
        visualEffect: 'none',
        success: (res) => {
        }
      })
    }

    if (this.screen_record_timer) {
      clearInterval(this.screen_record_timer);
    }

  }
}
