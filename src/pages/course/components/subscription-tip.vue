<template>
    <div class="pay_tip">
        <div class="icon">
            <tz-icon name="lock" color="#777" />
        </div>
        {{ text }}
    </div>
</template>


<script >

var that;
export default {
    data() {
        return {

        }
    },
    props: {
        text: {
            type: String,
            default: '订阅后查看完整内容'
        }
    },
}
</script>
<style>
.pay_tip {

    width: 100%;
    padding: 100px 0;
    text-align: center;
    color: #777;
    font-size: 14px;
    background-image: linear-gradient(to bottom, #fff, #f6f6f6, #fff, #f6f6f6, #fff, #f6f6f6, #fff, #f6f6f6, #fff, #f6f6f6, #fff, #f6f6f6, #fff, #f6f6f6, #fff);
}

.pay_tip .icon {
    margin-bottom: 4px;
}
</style>