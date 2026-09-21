<template>
    <div>
        <u-popup :show="show" title="报名信息" @close="close" @open="open" :closeable="true" :round="10">
            <div class="form-box">
                <tz-box padding="10px 15px 15px">
                    <u-form labelPosition="top" ref="uForm" labelWidth="300">
                        <u-form-item v-for="(item, index) in field" :required="item.required" :label="item.name" >
                            <u-input class="u-input-diy" v-model="form[index]" v-if="item.type == 'input'" border="surround"></u-input>
                            <u-textarea v-model="form[index]" v-if="item.type == 'textarea'" border="surround"
                                style="text-align: left;" placeholder="请输入内容" autoHeight></u-textarea>

                            <template v-if="item.type == 'time'">
                                <div @click="timeindex=index;timeshow = true" style="display: flex;justify-content: space-between;align-items: center;width: 100%;">
                                    <u-input class="u-input-diy" v-model="form[index]" disabledColor="#ffffff" placeholder="请选择时间日期"
                                        border="surround"></u-input>
                                    <u-icon slot="right" name="arrow-right"></u-icon>
                                </div>

                            </template>
                        </u-form-item>
                    </u-form>
                    <tz-bottom-btn @handle="submit"  btnTitle="确定"/>
                </tz-box>
            </div>
        </u-popup>
        <u-datetime-picker :show="timeshow" mode="datetime" :closeOnClickOverlay="true" @confirm="timeConfirm" @close="timeshow=false"></u-datetime-picker>
    </div>
</template>

<script >

var that;
export default {
    components: {},
    data() {
        return {
            timeshow: false,
            timeindex:0,
            show: false,
            form: {}
        }
    },
    props: {
        visible: {
            type: [Boolean, Number],
            default: false
        },
        field: {
            type: [Object, Array],
            default: {}
        },
        initdata:{
            type: [Object, Array],
            default: function(){
                return {}
            }
        },
    },
    watch: {
        visible() {
            this.show = this.visible;

            if(this.show){
                var form = {}

                for(var i in this.field){
                    form[i] = ''
                }

                if(this.initdata){
                    for(var i in this.initdata){
                        form[i] = this.initdata[i]
                    }
                }

                console.log("form",form)
                this.form = form;
            }
        }
    },
    methods: {
        timeConfirm(option){
            this.form[this.timeindex] = this.$tools.formatDate(option.value/1000);
            this.timeshow = false;
        },
        submit(){
            for(var i in this.field){
                if(this.field[i].required && (!this.form.hasOwnProperty(i) || this.form[i] === '')){
                    uni.$u.toast('请完善表单');
                    return false;
                    break;
                }
            }
            this.$emit('ok', this.form);
        },
        close() {
            this.$emit('close', false);
        },
        open() {
            this.$emit('open', false);
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
::v-deep .u-form-item__body {
    padding-bottom: 0;
}

.form-box {
    text-align: center;
    max-height: 500px;
    overflow-y: scroll;
}
.form-box .u-textarea{
    padding-left: 0;
    padding-right: 0;
}

.custom-style {
    margin-top: 10px;
}

::v-deep .u-form-item__body__left__content__label {
    font-weight: 500;
    color: #4E5969;
}

.u-input-diy {
    height: 40px;
    line-height: 40px;
    margin-top: 4px;
}
</style>
