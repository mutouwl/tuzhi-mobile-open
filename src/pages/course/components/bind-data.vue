<template>
    <view>
        <u-popup :show="visible" @close="closeHandle" :overlayStyle="{ zIndex: 10100 }" :zIndex="10110" :overlay="true"
            :closeable="true" :round="10" :title="title">
            <div class="file-box">
                <template v-if="list && list.length > 0">
                    <div class="file-item" v-for="(item, index) in list" :key="item.id" @click="control(item)">
                        <div class="file-name">
                            <img :src="'/static/image/filetype/' + item.filetype + '.png'" class="filetype">
                            <span>{{item.filename}}</span>
                        </div>
                        
                        <div><tz-icon name="more" :size="20" /></div>
                    </div>
                </template>

                <u-empty icon="/static/image/empty.png" width="70" height="70" v-else text="暂无文件" />
            </div>

            <u-action-sheet :round="10" :safeAreaInsetBottom="true" :show="modal.control" cancelText="取消"
                :actions="actionlist" :closeOnClickOverlay="true" :closeOnClickAction="true"
                @close="modal.control = false" @select="controlSelect">
            </u-action-sheet>

            <!-- 文件预览（通用弹窗组件，支持图片/视频/音频/文档） -->
            <tz-file-preview :visible="modal.preview" :data="option" :z-index="10200" @close="modal.preview = false" />

        </u-popup>
    </view>
</template>

<script>
    var that;
    export default {
        data() {
            return {
                pageParams: {},
                actionlist: [],
                modal: {
                    control: false,
                    preview:false
                },
                option: null,
                pdfLink:''
            };
        },
        props: {
            visible: {
                type: [Boolean, Number],
                default: false,
            },
            list: {
                type: [Array, Object],
                default: () => {
                    return [];
                },
            },
            title:{
                type: String,
                default: '资料'
            }
        },
        watch: {},
        methods: {

            showPdf(url){
                uni.downloadFile({
                    url: url,
                    success: (res) => {
                        console.log("res",res);
                    }
                });
            },
            control(option) {

                if (!option.fullurl) {
                    uni.$u.toast("请在购买课程后查看");
                    return false;
                }

                this.option = option;
                var actionlist = [
                    {
                        name: '预览',
                        type: 'preview'
                    },
                    // #ifndef MP
                    {
                        name: '下载（' + this.$tools.formatFileSize(option.filesize) + '）',
                        disabled: option.auth == 'preview',
                        type: 'download'
                    },
                    // #endif
                    {
                        name: '复制下载链接',
                        disabled: option.auth == 'preview',
                        type: 'copy'
                    }
                ];
                this.actionlist = actionlist;
                this.modal.control = true;
            },

            /**
             *  监测是否支持预览
             * */
            previewCheck() {
                //图片可以单独加载
                //文档在小程序里可以预览
                //pdf 在 h5 里可以预览
                //其他则不支持
            },
            //关闭
            closeHandle() {
                this.$emit("close", false);
            },

            controlSelect(item) {
                this.modal.control = false;
                switch (item.type) {
                    case 'preview':
                        this.preview()
                        break;
                    case 'copy':
                        this.copy()
                        break;
                    case 'download':
                        this.download()
                        break;
                }

            },

            //预览
            preview() {
                // #ifdef MP-WEIXIN
                if(this.option.filetype == 'document'){
                    this.$tools.openDocument(this.option.fullurl)
                    return;
                }
                // #endif



                uni.$u.toast("加载中…");
                this.modal.preview = true;
            },
            //复制下载链接
            copy() {
                var that = this;
                uni.setClipboardData({
                    data: that.option.fullurl,
                    success: function () {
                        uni.$u.toast("已复制文件链接,请黏贴到浏览器中下载");
                    },
                    fail: function () {
                        uni.$u.toast("复制出错,请刷新重试");
                    }
                });
            },
            download() {
                var that = this;
                // #ifdef MP
                this.copy();
                return;
                // #endif

                // #ifdef H5
                window.open(this.option.fullurl);
                // #endif

                // #ifndef H5
                // window.open(option.fullurl);
                // #endif
                // this.$tools.download(this.option.fullurl)
            },
        },
        onLoad(pageParams) {
            that = this;
            that.pageParams = that.$nav.parsePageParams(pageParams);

            this.getData();
        },
    };
</script>

<style>
    .file-box {
        width: 100%;
        height: 450px;
        overflow-y: auto;
        padding: 10px;
        box-sizing: border-box;
    }

    .file-item {
        display: flex;
        align-items: center;
        background-color: #fff;
        padding: 15px 15px;
        border-radius: 5px;
        margin-bottom: 10px;
        font-size: 14px;
        justify-content: space-between;
        border: 1px solid #F0F3F5;
    }

    .file-name {
        display: flex;
        align-items: center;
        justify-content: start;
        flex: 1;
        overflow: hidden;
        margin-right: 10px;
    }

    .file-name span {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
    }

    .filetype {
        width: 20px;
        height: 20px;
        margin-right: 10px;
    }

    .list-value {
        font-size: 12px;
        color: #86909c;
        padding: 0 6px 0 16px;
    }

    ::v-deep .u-cell__title,
    ::v-deep .u-cell__title-text {
        text-align: left !important;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
    }

    ::v-deep .u-cell__title-text {
        font-size: 14px;
        line-height: 22px;
        color: #303133;
        font-weight: 500;
    }

    ::v-deep .u-cell__body__content {
        width: 100%;
        overflow: hidden !important;
        white-space: nowrap !important;
        text-overflow: ellipsis !important;
        -o-text-overflow: ellipsis;
    }
</style>