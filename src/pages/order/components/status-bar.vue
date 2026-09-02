<template>
    <div>
        <u-cell :border="false" :titleStyle="{ fontWeight: 600 }" :title="$t('status.'+ status)" :label="describe" center>
            <template #icon>
                <img :src="'/static/order/status/'+status+'.png'" class="icon">
            </template>
        </u-cell>
    </div>
</template>

<script>
// #ifdef MP-TOUTIAO
import i18n from '@/components/language/index.js';
// #endif
export default {
// #ifdef MP-TOUTIAO
    i18n,
    // #endif
    components: {},
    data() {
        return {
        }
    },
    props: {
        status:{
            type:String,
            default:''
        },
        title:{
            type:String,
            default:''
        },
        describe:{
            type:[String,Number],
            default:''
        }
    },
    methods: {},
    watch: {
    },
    mounted() {
    }
}
</script>
<style>
.icon {
    width: 36px;
    height: 36px;
    margin-right: 4px;
}

::v-deep .u-cell__label {
    margin-top: 5px!important;
}


::v-deep .u-cell__body {
    padding: 0 0!important;
}


::v-deep .u-cell__title{
    margin-left: 4px;
}
::v-deep .u-cell__body--large {
    padding-top: 5px!important;
    padding-bottom: 5px!important;
}

::v-deep .u-cell__title-text--large,
::v-deep .u-cell__value--large {
    font-size: 14px!important;
}
</style>

