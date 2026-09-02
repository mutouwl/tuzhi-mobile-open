<template>
    <div>
        <u-modal :show="show" :showCancelButton="true" confirmText="提交" cancelText="取消" CancelButton="true" :closeOnClickOverlay="true" @close="close"
            @confirm="confirm" @cancel="cancel">
            <u-textarea border="surround" style="width: 100%;" v-model="content" placeholder="请输入评论内容" :count="true" :maxlength="1000" :height="140"></u-textarea>
        </u-modal>
    </div>
</template>

<script>
export default {
    components: {},
    data() {
        return {
            content:''
        }
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        show(){
            if(this.show){
                this.content = '';
            }
            
        }
    },
    methods: {
        confirm() {
            this.$emit('confirm', this.content,this.replyId);
        },
        close() {
            this.$emit('close', false);
        },
        cancel() {
            this.$emit('cancel', false);
        }
    },
    mounted() {
    }
}
</script>
<style lang="scss"></style>

