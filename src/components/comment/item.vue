<template>
    <div class="box">

        <u-cell :border="false" style="text-align: left;" :title="username ? username : '匿名用户'" :label="$tools.timestamp(time)">
            <template #icon>
                <img :src="avatar" class="avatar">
            </template>
        </u-cell>

        <tz-box padding="0 10px 10px 60px">

            <div class="content">
                <div class="text">
                    <rich-text :nodes="content"></rich-text>
                </div>
            </div>

            <div class="reply-content" v-if="replyContent">
                <span class="name">@{{ replyName ? replyName : '匿名用户' }}：</span>{{ replyContent }}
            </div>

            <div class="footer">
                <div class="del">
                    <span v-if="canDel" @click="del">删除</span>
                </div>

                <div class="control">
                    <div class="like" @click="like">
                        <span v-if="!isLike"> <tz-icon name="dianzan-xiankuang" color="#4E5969" :size="20" /> </span>
                        <span v-if="isLike"> <tz-icon name="dianzan-shixin" color="#F53F3F" :size="20" /> </span>
                        <span>有用({{ likeNum }})</span>
                    </div>

                    <div class="like" @click="reply">
                        <span> <tz-icon name="pinglun" color="#4E5969" :size="20" /> </span>
                        <span>回复</span>
                    </div>
                </div>
            </div>
        </tz-box>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {
        }
    },
    props: {
        no:{
            type: [Number, String],
            default: 0
        },
        itemId: {
            type: [Number, String],
            default: ''
        },
        avatar: {
            type: [Number, String],
            default: ''
        },
        username: {
            type: [Number, String],
            default: '匿名用户'
        },
        canDel: {
            type: [Number, Boolean],
            default: false
        },
        time: {
            type: [Number, String],
            default: 0
        },
        content: {
            type: [Number, String],
            default: ''
        },
        isLike:{
            type: [Number, Boolean],
            default: false
        },
        likeNum:{
            type: [Number, String],
            default: 0
        },
        replyName:{
            type: [Number, String],
            default: ''
        },
        replyContent:{
            type: [Number, String],
            default: ''
        }
    },
    methods: {
        reply() {
            this.$emit('reply', this.itemId);
        },
        like(){
            this.$emit('like', this.itemId,this.no);
        },
        del(){
            this.$emit('del', this.itemId,this.no);
        }
    },
    watch: {
    },
    mounted() {
    }
}
</script>
<style lang="scss">
.box {
    width: 100%;
    background-color: #fff;
    border-bottom: 1px solid #F2F3F5;
}

.avatar {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    margin-right: 5px;
}

.content {
    margin-bottom: 10px;
}

.content .text {
    font-size: 14px;
    line-height: 18px;
    color: #4E5969;
}



.reply-content{
    background-color: #F7F8FA;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    color: #4E5969;
}

.reply-content .name{
    color: #1D2129;
    font-weight: 500;
}

.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;

    margin-top: 20px;
}

.footer .like {
    align-items: center;
    margin-left: 15px;
    vertical-align: middle;
    align-items: center;
    display: flex;
}

.footer .del{
    font-size: 12px;
    color: #86909C;
}

.footer .control{
    display: flex;
    justify-content: flex-end;
}

.like span {
    color: #4E5969;
    font-size: 12px;
}

::v-deep .u-cell__body .u-cell__title-text {
    font-size: 14px !important;
    font-weight: 500 !important;
}

::v-deep .u-cell__body .u-cell__label--large {
    font-size: 12px !important;

}

::v-deep .u-cell__body .u-cell__label {
    margin-top: 0 !important;
}

::v-deep .u-cell__body .u-cell__value {
    font-size: 12px !important;
}
</style>

