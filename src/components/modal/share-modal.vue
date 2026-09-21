<template>
    <div>
        <u-popup :show="show" title="分享" @close="close" @open="open" :closeable="true" :round="10" :overlayStyle="{ zIndex: 12000 }" :zIndex="12010">
            <div class="share-box">
                <div class="share-tabs">
                    <!-- <u-tabs :list="tabs" :scrollable="false" @change="tabChange"></u-tabs> -->
                    <u-subsection :list="tabs" :current="current" @change="tabChange"></u-subsection>
                </div>

                <tz-box padding="10px 15px 15px" bgColor="none">
                    <div class="share-article" v-if="checkTab == 'article'">
                        <!-- 图文加载中：骨架屏 -->
                        <div class="share-article-loading" v-if="articleLoading">
                            <u-skeleton
                                :loading="true"
                                :animate="true"
                                :title="true"
                                title-width="50%"
                                title-height="14"
                                :rows="3"
                                rows-height="12"
                            />
                            <!-- 按钮骨架：加载中替代「切换文案/复制文案」 -->
                            <div class="share-btn-loading">
                                <div class="share-btn-loading-item"></div>
                                <div class="share-btn-loading-item"></div>
                            </div>
                        </div>
                        <template v-else>
                            <div class="share-text" v-if="article.text">
                                <text>{{ article.text }}</text>
                            </div>
                            <div class="share-imgs" v-if="article.poster && article.poster.length > 0">
                                <u-album :urls="article.poster" :multipleSize="110" :maxCount="3"></u-album>
                                <div class="share-tip">点击图片后长按可保存至相册</div>
                            </div>
                            <div class="share-empty" v-if="!article.text && (!article.poster || article.poster.length === 0)">
                                暂无分享内容
                            </div>

                            <div class="share-btn">
                                <u-button text="切换文案" type="info" @click="getArticle"></u-button>
                                <u-button text="复制文案" type="primary" @click="copy"></u-button>
                            </div>
                        </template>
                    </div>

                    <div class="share-poster" v-if="checkTab == 'poster'">
                        <div class="share-imgs">
                            <!-- 海报加载中：骨架屏（块尺寸与真实海报一致，避免弹窗高度跳动） -->
                            <div class="poster-loading" v-if="posterLoading">
                                <div class="poster-loading-img"></div>
                            </div>
                            <div class="share-poster-img" v-else-if="!posterSrc" @click="getPoster">
                                海报生成失败，点此重试
                            </div>
                            <img class="share-poster-img" v-else @click="preview" :src="posterSrc">
                            <div class="share-tip" v-if="!posterLoading">点击图片后长按可保存至相册</div>
                        </div>

                        <div class="poster-themes">
                            <img src="@/static/image/preview/preview_black.png" :class="[
                                'poster-themes-item',
                                { 'item-active': posterThemesChecked == 'black' }
                            ]" @click="changePosterThemes('black')" />
                            <img src="@/static/image/preview/preview_blue.png" :class="[
                                'poster-themes-item',
                                { 'item-active': posterThemesChecked == 'blue' }
                            ]" @click="changePosterThemes('blue')" />
                            <img src="@/static/image/preview/preview_steel.png" :class="[
                                'poster-themes-item',
                                { 'item-active': posterThemesChecked == 'steel' }
                            ]" @click="changePosterThemes('steel')" />
                        </div>
                    </div>

                </tz-box>
            </div>
        </u-popup>
    </div>
</template>

<script >
export default {
    data() {
        return {
            show: false,
            current:0,
            imgs: [
            ],
            checkTab: 'article',
            posterSrc: '',
            articleLoading: false,
            posterLoading: false,
            articleRequestId: 0,
            posterRequestId: 0,
            posterThemes: ['blue', 'black', 'steel'],
            posterThemesChecked: 'blue',
            article: {
                text: ''
            }
        }
    },
    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        },
        val: {
            type: [String, Number],
            default: ''
        },
        type:{
            type: String,
            default: 'goods'
        },
        //来源圈子 ID：从圈子课程列表进入课程详情后分享，分享链接需携带该参数
        circleId: {
            type: [String, Number],
            default: ''
        },
    },
    computed: {
        tabs() {
            const t = [{ name: '海报', type: 'poster' }];
            // #ifdef H5
            t.unshift({ name: '图文', type: 'article' });
            // #endif
            return t;
        }
    },
    watch: {
        visible() {
            this.show = this.visible;
            if (this.show) {
                this.posterThemesChecked = 'blue';
                this.tabChange(0);
            }
        }
    },
    methods: {
        tabChange(value) {
            this.checkTab = this.tabs[value].type;
            this.current = value;

            if (this.checkTab == 'poster') {
                this.getPoster();
            } else {
                this.getArticle();
            }
        },
        close() {
            this.$emit('close', false);
        },
        open() {
            this.$emit('open', false);
        },
        copy() {
            var that = this;
            uni.setClipboardData({
                data: that.article.text,
                success: function () {
                    uni.$u.toast('文案已复制');
                }
            });
        },
        changePosterThemes(type) {

            this.posterThemesChecked = type;
            this.getPoster();
        },

        getArticle() {
            var that = this;
            // 防重复请求：加载中再次触发（如反复点「切换文案」）直接忽略
            if (that.articleLoading) return;

            if(that.type == 'page' && that.val == ''){
                let pages = getCurrentPages()    //获取加载的页面
                
			    let currentPage = pages[pages.length - 1]    //获取当前页面的对象   
                that.val = currentPage.route;
            }

            that.posterSrc = '';
            var requestId = ++that.articleRequestId;
            that.articleLoading = true;
            that.$api('share.getArticle', {
                type: that.type,
                src: that.val,
                circle_id: that.circleId
            }).then(res => {
                if (requestId !== that.articleRequestId) return;
                that.articleLoading = false;
                if (res.code === 1) {
                    that.article = res.data;
                }
            }).catch(() => {
                if (requestId === that.articleRequestId) {
                    that.articleLoading = false;
                }
            });
        },

        getPoster() {
            var that = this;
            var requestId = ++that.posterRequestId;
            that.posterSrc = '';
            that.posterLoading = true;
            that.$api('share.getPoster', {
                type: that.type,
                src: that.val,
                themes: that.posterThemesChecked,
                circle_id: that.circleId
            }).then(res => {
                if (requestId !== that.posterRequestId) return;
                that.posterLoading = false;
                if (res.code === 1) {
                    that.posterSrc = res.data;
                }
            }).catch(() => {
                if (requestId === that.posterRequestId) {
                    that.posterLoading = false;
                }
            });
        },
        preview() {
            var imgPath = [this.posterSrc];
            uni.previewImage({
                urls: imgPath,
                longPressActions: {
                    itemList: ['发送给朋友', '保存图片', '收藏'],
                    success: function (data) {
                    },
                    fail: function (err) {
                        console.log(err.errMsg);
                    }
                }
            });
        },
    },
    mounted() {
        this.show = this.visible;
    }
}

</script>

<style>
.share-title {
    width: 100%;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    text-align: center;
    border-bottom: 1px solid #efefef;
}


.share-box {
    /* 高度自适应内容：无图片时弹窗包裹文字与按钮，不再出现大片空白；超出最高高度滚动 */
    min-height: 300px;
    max-height: 70vh;
    overflow-y: auto;
}

.share-tabs {
    width: 200px;
    margin: 0 auto;
}

.share-text {
    background-color: #F7F8FA;
    padding: 15px;
    border-radius: 4px;
    font-size: 12px;
    overflow-wrap: break-word;
}

.share-article-loading {
    padding: 6px 0;
}

.poster-loading-img {
    width: 270px;
    height: 340px;
    margin: 0 auto;
    border-radius: 4px;
    background: linear-gradient(90deg, #F1F2F4 25%, #e6e6e6 37%, #F1F2F4 50%);
    background-size: 400% 100%;
    animation: share-loading 1.8s ease infinite;
}

@keyframes share-loading {
    0% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0 50%;
    }
}

.share-imgs {
    margin-top: 10px;
    text-align: center;
}

.share-tip {
    width: 100%;
    text-align: center;
    font-size: 12px;
    color: #86909C;
    margin-top: 10px;
}

.share-empty {
    padding: 40px 0;
    text-align: center;
    font-size: 12px;
    color: #86909C;
}

.share-btn {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.share-btn-loading {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.share-btn-loading-item {
    width: 48%;
    height: 40px;
    border-radius: 4px;
    background: linear-gradient(90deg, #F1F2F4 25%, #e6e6e6 37%, #F1F2F4 50%);
    background-size: 400% 100%;
    animation: share-loading 1.8s ease infinite;
}

.share-btn button {
    width: 48%;
}

.share-poster-img {
    width: 270px;
    height: 340px;
    line-height: 340px;
    text-align: center;
    font-size: 12px;
    margin: 0 auto;
    border-radius: 4px;
}

.poster-themes {
    text-align: center;
}

.poster-themes-item {
    width: 40px;
    height: 46px;
    margin: 8px 4px;
    border-radius: 3px;
    padding: 5px;
    border: 3px solid #efefef;
}

.poster-themes-item.item-active {
    border: 3px solid #0968f6;
}

</style>
