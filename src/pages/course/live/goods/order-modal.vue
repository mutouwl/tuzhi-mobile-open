<template>
    <div>
        <u-popup title="提交订单" :show="show" @close="close" @open="open" :closeable="true" :round="10" :overlayStyle="{ zIndex: 12100 }" :zIndex="12110">
            <tz-box bgColor="#F7F8FA" class="goods-box">
                <template v-if="orderParams && Object.keys(orderParams).length > 0">
                    <submit-order-page :components-params="orderParams" @close="close"/>
                </template>
            </tz-box>
        </u-popup>
    </div>
</template>

<script>
    var that;
    import submitOrderPage from "@/components/order/submit-order.vue";
    // import submitOrderPage from "@/pages/order/submit/submit.vue";

    export default {
        components: { submitOrderPage },
        data() {
            return {
                show: false,
                list: []
            };
        },
        props: {
            liveId: {
                type: [String, Number],
                default: 0,
            },
            visible: {
                type: [Boolean, Number],
                default: false,
            },
            orderParams: {
                type: [ Object],
                default: () => {
                    return {};
                }
            },
        },
        watch: {
            visible() {
                this.show = this.visible;
            }
        },
        methods: {
            close() {
                this.$emit("close", false);
            },
            open() {
                this.$emit("open", false);
            },
        },
        created() { },
        mounted() {
            that = this;
            this.show = this.visible;
        },
    };
</script>

<style scoped>
    .goods-box {
        width: 100%;
        height: 60vh;
        overflow-y: auto;
    }
</style>
