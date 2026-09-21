import api from '@/common/request/index';
import tools from '@/common/utils/tools';
// var timer = null;
export default {
  timer: null,
  screen_record_timer: null,
  setStudyLog(courseId,columnId, currentTime,pause=0) {
    // 学习时长统计关闭后不再上报
    if (tools.systemConfig("app_statistics_study_log") == '0') {
      return;
    }
    api('study.setLog', {
      course_id: courseId,
      column_id: columnId,
      media_progress: currentTime,
      pause:pause
    });
  },
  intervalSetStudyLog(courseId,columnId, currentTime) {
    this.stopStudyLog();
    // 学习时长统计关闭后不再启动定时上报
    if (tools.systemConfig("app_statistics_study_log") == '0') {
      return;
    }
    this.timer = setInterval(function () {
      api('study.setLog', {
        course_id: courseId,
        column_id: columnId,
        media_progress: currentTime
      });
    }, 5000);
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
