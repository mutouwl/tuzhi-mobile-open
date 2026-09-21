<template>
    <div>
        <template v-if="commentList.length > 0">
            <comment-item v-for="(item, index) in commentList" :key="index" :no="index" :itemId="item.id"
                :avatar="item.user.avatar" :username="item.user.nickname" :time="item.createtime" :content="item.content"
                :isLike="item.islike" :likeNum="item.like_count" :replyName="item.reply ? item.reply.user.nickname : ''"
                :replyContent="item.reply ? item.reply.content : ''" :canDel="item.candel" @del="delComment"
                @reply="replyComment" @like="likeComment" />
        </template>

        <u-empty text="暂无评论" width="70" height="70" icon="/static/image/empty.png" v-if="commentList.length == 0" />
        <tz-divider :height="10" bgColor="none" />
        <u-loadmore v-if="commentList.length > 0" :status="loadStatus" @loadmore="loadmore()" />
    </div>
</template>

<script>
var that;
import commentItem from "@/components/comment/item.vue";
export default {
    components: { commentItem },
    data() {
        return {
            //评论列表
            commentList: [],
            form: {
                limit: 10,
                page: 1,
                sort:'time'
            },
            loadStatus: ''
        }
    },
    props: {
        courseId: {
            type: [Number, String],
            default: 0
        },
        sort:{
            type: String,
            default: 'time'
        }
    },
    watch: {
        courseId() {
            that.refresh();
        },
        sort() {
            that.refresh();
        }
    },
    methods: {
        loadmore() {
            that.form.page++;
            that.getCommentList();
        },
        //刷新
        refresh() {
            that.form.page = 1;
            that.commentList = [];
            that.getCommentList();
        },
        /**
     * 获取评论列表
     */
        getCommentList() {
            // uni.showLoading({title:'加载中'});
            that.loadStatus = 'loading';
            that.form.course_id = that.courseId;
            that.form.sort = that.sort;
            that.$api('course.comment.index', that.form).then(res => {

                if(that.form.page == 1){
                    that.commentList = [];
                }

                if (res.code == 1) {
                    var list = that.commentList;
                    for (var i in res.data) {
                        list.push(res.data[i])
                    }
                    that.commentList = list;

                    if (res.data.length == that.form.limit) {
                        that.loadStatus = 'loadmore';
                    } else {
                        that.loadStatus = 'nomore';
                    }
                    uni.hideLoading();
                }
            });
        },
        /**
         * 删除评论
         * @param {*} commentId 
         */
        delComment(commentId, index) {
            uni.showModal({
                title: '提示',
                content: '确定要删除该评论吗',
                success: function (res) {
                    if (res.confirm) {
                        that.$api('course.comment.del', {
                            comment_id: commentId
                        }).then(res => {
                            if (res.code === 1) {
                                that.commentList.splice(index, 1);
                            }
                            uni.$u.toast(res.msg);
                        });
                    }
                }
            });
        },
        /**
         * 喜欢评论
         * @param {*} commentId 
         */
        likeComment(commentId, index) {
            that.$api('course.comment.like', {
                comment_id: commentId
            }).then(res => {
                that.commentList[index].islike = !that.commentList[index].islike;
                if (that.commentList[index].islike) {
                    that.commentList[index].like_count++;
                } else {
                    that.commentList[index].like_count--;
                }
            });
        },
        /**
         * 回复评论
         * @param {*} commentId 
         */
        replyComment(commentId) {
            this.$emit('reply', commentId);
            // that.commentReplyId = commentId;
            // that.modal.comment = true;
        }
    },

    mounted() {
        that = this;
        that.refresh()
    }
}
</script>
<style lang="scss"></style>

