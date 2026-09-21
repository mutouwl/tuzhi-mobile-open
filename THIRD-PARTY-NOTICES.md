# 第三方组件与许可声明（THIRD-PARTY NOTICES）

> 本清单由 tools/open-source-export 自动生成（模板），**发布前请逐项核对**：
> 确认每个组件的许可协议是否允许随本项目（凸知开源协议 V1.0）分发，无许可头或闭源 SDK 需确认授权范围。
> 最近一次人工核对：2026-08-16（html2canvas/clipboard.js 许可已确认；yingbing-video 无许可证且无引用，开源快照已排除）

| 组件 | 位置 | 许可 | 备注 |
|------|------|------|------|
| @dcloudio/uni-app 系列 | package.json | Apache-2.0 | 宽松许可，可随本项目分发 |
| Vue 2 / vue-cli | package.json | MIT | 宽松许可，可随本项目分发 |
| @tdesign/uniapp | package.json / node_modules | MIT | 本仓库含适配补丁，见 src/vue.config.js |
| uview-ui | src/components/uview-ui/ | MIT | 随源码内置，含少量二次修改 |
| qiun-data-charts / u-charts | src/components/qiun-data-charts/ | 见目录内 license.md | 图表组件 |
| echarts | src/components/qiun-data-charts/static/ | Apache-2.0 | 宽松许可，可随本项目分发 |
| mqtt.js | src/static/lib/dms/mqtt.js | MIT | MQTT.js 官方 npm 包（mqtt）的 browserify 打包产物，包内含 @license MIT 标注；开放源码，可随本项目分发 |
| html2canvas | src/common/utils/sdk/html2canvas.js | MIT | html2canvas 0.5.0-beta3（Copyright Niklas von Hertzen），文件头含 MIT 标注 |
| clipboard.js | src/common/utils/sdk/sdk-h5.js | MIT | 文件名为 sdk-h5.js，实际内容为 clipboard.js（MIT），用于 H5 剪贴板复制 |
| AliPlayer | src/components/video/assets/ | 阿里云播放器 H5 SDK（商业产品） | aliyun-aliplayer v2.15.2 + aliplayercomponents-1.0.9 本地化资源；用于播放阿里云点播/直播视频，使用需阿里云账号并开通对应服务，商用按阿里云服务协议与授权执行 |
| yingbing-video | src/components/yingbing-video/ | 仓库内无许可证（来源仓库亦未声明） | 该目录在代码中无任何引用（死代码）；开源快照已排除该目录，随私有化商业授权交付时请自行与作者确认授权 |

> ⚠️ 若上述任一项无法随项目分发，请在发布前从快照中移除对应目录/文件，并同步更新本清单。