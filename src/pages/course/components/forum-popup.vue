<template>
    <div>
        <u-popup :show="show" @close="close" @open="open" :overlayStyle="{zIndex:10000}" :zIndex="10010" :closeable="true" :round="10">
            <div class="sheet-title">讨论区</div>
            <div class="sheet-box">
                <message-box @control="forumModal.control=true" :height="500" />
            </div>
        </u-popup>
        <control-popup :visible="forumModal.control" @close="forumModal.control=false"/>
    </div>
</template>

<script >
import messageBox from "@/pages/course/components/message-box.vue";
import controlPopup from "@/pages/course/components/control-popup.vue";
var that;
export default {
    components: {messageBox,controlPopup},
    data() {
        return {
            show: this.visible,
            forumModal:{
                control:false   
            }
        }
    },
    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        }
    },
    watch: {
        visible() {
            this.show = this.visible;
        }
    },
    methods: {
        close() {
            this.$emit('close', false);
        },
        open() {
            this.$emit('open', false);
        },
        optionHandle(index){
            this.$emit('jump', index);
        }
    },
    created() {

    },
    mounted() {
        that = this;
        this.show = this.visible;

    }
}

</script>

<style>
.sheet-title {
    background: #f5f5f5;
    width: 100%;
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    text-align: center;
    border-bottom: 1px solid #efefef;
}

.sheet-box{
    height: 500px;
    /* padding-bottom: calc(env(safe-area-inset-bottom)); */
}


</style>
