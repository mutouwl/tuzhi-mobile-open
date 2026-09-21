<template>
    <div :style="{
        'background-color': bgColor
    }">
        <!-- #ifdef MP-TOUTIAO -->
        <u-parse :content="data" :selectable="!limitCopy" :previewImg="!limitCopy"></u-parse>
        <!-- #endif -->

        <!-- #ifndef MP-TOUTIAO -->
        <u-parse :content="contentStr" :selectable="!limitCopy" :previewImg="!limitCopy"></u-parse>
        <!-- #endif -->
    </div>
</template>
<script lang="ts">
export default {
    components: {},
    data() {
        return {

        }
    },
    computed: {
        contentStr() {
            return this.content !== null && this.content !== undefined ? String(this.content) : '';
        },
        // #ifdef MP-TOUTIAO
        data() {
            var data = this.contentStr.replaceAll('<p>', '<p style="margin:0;font-size:16px;max-width:100%">');
            data = data.replaceAll('<h1>', '<h1 style="margin:0;">');
            data = data.replaceAll('<h2>', '<h2 style="margin:0;">');
            data = data.replaceAll('<h3>', '<h3 style="margin:0;">');
            data = data.replaceAll('<h4>', '<h4 style="margin:0;">');
            data = data.replaceAll('<h5>', '<h5 style="margin:0;">');
            data = data.replaceAll('<h6>', '<h6 style="margin:0;">');
            return data;
        }
        // #endif
    },

    props: {

        content: {
            type: [String,Number],
            default: ''
        },
        //背景颜色
        bgColor: {
            type: String,
            default: 'none'
        },
        limitCopy: {
            type: Boolean,
            default: false
        }

    },
    methods: {

    }


};
</script>

<style>
[alt] {
    max-width: 100%;
}

</style>
