<script>
var that;

export default {
	props: {
		data: {
			type: Object,
			default: () => ({}),
		},
		activeMenu: [Number, String],
		pagination: Object,
	},
	methods: {
		goDetail(id) {
			uni.navigateTo({
				url: `/pages/app/physical/detail/detail?id=${id}`,
			});
		}
	}
}
</script>
