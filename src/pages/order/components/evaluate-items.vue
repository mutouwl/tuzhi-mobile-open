<template>
    <!-- @open="getData" -->
    <u-popup @close="close"  :show="show" :round="10" mode="bottom" :closeOnClickOverlay="true"
        :closeable="true">
        <div class="title">
            选择评价商品
        </div>
        <div class="box">
            <div class="loading" v-if="list.length == 0">
                <u-loading-icon :show="true" text="加载中" :vertical="true"></u-loading-icon>
            </div>

            <u-cell-group :border="false" v-if="list.length > 0">
                <u-cell @click="evaluate(orderNo, item.item_id)" isLink :border="false" v-for="(item, index) in list"
                    :key="index">
                    <course slot="value" :name="item.snapshoot.name" :cover="item.snapshoot.cover"
                        :type="item.snapshoot.type" :price="item.snapshoot.price" :count="item.snapshoot.count" />
                </u-cell>
            </u-cell-group>
        </div>
    </u-popup>
</template>

<script>
import course from "@/components/order/course.vue";
export default {
    components: { course },
    data() {
        return {
            show: false,
            list: []
        }
    },
    props: {
        visible: {
            type: Boolean,
            default: false
        },
        orderNo: {
            type: [String, Number],
            default: ''
        }
    },
    methods: {
        close() {
            this.list = [];
            this.$emit('close', false);
        },
        //获取数据
        getData() {
            var that = this;
            //获取需要评价的商品
            that.$api('order.evaluate.getBeItems', {
                order_no: that.orderNo
            }).then(res => {
                if (res.code === 1) {
                    var list = [];
                    for (var i in res.data) {
                        list.push(res.data[i])
                    }
                    that.list = list

                    if (that.list.length == 0) {
                        uni.$u.toast('暂无需要评价的内容');
                        this.close();
                        return false;
                    }else if (list.length == 1) {
                        that.evaluate(that.orderNo, list[0].item_id);
                    }else{
                        this.show = this.visible;
                    }
                    
                }
            });
        },
        evaluate(orderNo, itemId) {
            this.close();
            this.$nav.to('/pages/order/evaluate/submit/submit?order_no=' + orderNo + '&item_id=' + itemId);
            
        }
    },
    watch: {
        visible() {
            if(!this.visible){
                this.show = this.visible;
            }
            if(this.visible){
                this.getData();
            }
        }
    }
}
</script>
<style>
.title {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: center;
    border-bottom: 1px solid #efefef;
}

.box {
    padding: 00px 5px 10px;

    max-height: 400px;
    overflow-y: auto;
}

.loading {
    width: 100%;
    padding: 100px 0;
    text-align: center;
}
</style>

