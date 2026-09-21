<template>
    <div class="box">

        <u-cell :border="false" style="text-align: left;" :title="username" :label="time">
            <template #icon>
                <img :src="avatar"
                    class="avatar">
            </template>
        </u-cell>

        <tz-box padding="0 10px 10px 60px">

            <div class="content">
                <div class="text">
                    {{ content }}
                </div>

                <div class="image" v-if="imgs.length > 0">
                    <u-album :maxCount="6" :multipleSize="multipleSize" :urls="imgs"></u-album>
                </div>
            </div>

            <div class="footer">
                <div class="rate">
                    <u-rate :count="5"  v-model="rate" :size="20" :readonly="true"></u-rate>
                </div>
                <div class="like">

                    <!-- <span> <tz-icon name="praise_fill" color="#E5E6EB" :size="24" /> </span>
                    <span>有用(0)</span> -->
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
            multipleSize:70,
            urls: [
            ]
        }
    },
    props: {
        avatar: {
            type: [Number, String],
            default: ''
        },
        username: {
            type: [Number, String],
            default: '匿名用户'
        },
        time: {
            type: [Number, String],
            default: ''
        },
        imgs: {
            type: [Array],
            default: []
        },
        rate: {
            type: [Number, String],
            default: ''
        },
        content: {
            type: [Number, String],
            default: ''
        }
    },
    methods: {
        albumWidth(option){
            // this.multipleSize = option/3 - 10;
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
}


.content .image {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    margin-bottom: 10px;
}

.image-item {
    position: relative;
    float: left;
    width: 32%;
    padding-top: 30%;

    margin-bottom: 2%;
}

.image-item img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

// .content .image img{
//     width: 100%;
//     height: 100%;
// }




.footer {
    display: flex;
    justify-content: space-between;
}

.like span {
    vertical-align: middle;
    color: #4E5969;
}

::v-deep .u-cell__body .u-cell__title-text {
    font-size: 14px!important;
    font-weight: 500!important;
}

::v-deep .u-cell__body .u-cell__label--large {
    font-size: 12px!important;

}

::v-deep .u-cell__body .u-cell__label {
    margin-top: 0!important;
}

::v-deep .u-cell__body .u-cell__value {
    font-size: 12px!important;
}</style>

