<template>
    <div class="footer-box" v-if="!isInIframe">
        <div class="links">
            <span @click="$nav.to('/pages/index/index','local','reLaunch')">店铺主页</span>
            <span @click="$nav.to('/pages/user/index/index','local','reLaunch')">个人中心</span>
            <span @click="$nav.to('/pages/order/list/list','local','reLaunch')">订单列表</span>
            <span v-if="$tools.systemConfig('app_complaint') === '1'" @click="$nav.to('/pages/app/complaint/index/index','local','navigateTo')">投诉</span>
        </div>

        <div class="copyright" @click="jump">
            <span v-if="$tools.systemConfig('name')">{{ $tools.systemConfig('name') }}</span><span v-if="$tools.systemConfig('copyright')">@{{ $tools.systemConfig('copyright') }}</span>
        </div>   
    </div>
</template>
<script lang="ts">
export default {
    components: {},
    data() {
        return {
            show: false,
            isInIframe: false
        }
    },
    props: {
        
    },
    mounted() {
        this.checkIframe();
    },
    methods: {
        checkIframe() {
            try {
                if (typeof window !== 'undefined' && window.self && window.top) {
                    this.isInIframe = window.self !== window.top;
                } else {
                    this.isInIframe = false;
                }
            } catch (e) {
                this.isInIframe = false;
            }
        },
        jump(){
            var copyright_link = this.$tools.systemConfig('copyright_link');
            if(copyright_link){
                this.$nav.to(copyright_link, 'url')
            }
            
        }
    },
    watch: {
        
    }


};
</script>

<style>

.footer-box{
    margin-top: 40px;

    padding-bottom: 60px;
}

.links{
    text-align: center;
}

.links span{
    color: #4E5969;
    font-size: 12px;
    margin: 10px 8px;
}


.copyright{
    width: 100%;
    text-align: center;
    margin: 15px 0;
    color: #C9CDD4;
    font-size: 12px;

    font-family: serif;
}

</style>
