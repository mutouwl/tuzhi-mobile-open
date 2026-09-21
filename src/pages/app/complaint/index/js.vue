<script>
export default {
	data() {
		return {
			loading: true,
			pageParams: {},
			list: [],
			title: '请选择投诉类型',
			path: []
		}
	},
	onLoad(options) {
		this.pageParams = this.$nav.parsePageParams(options || {});
		if (this.pageParams.path) {
			try {
				this.path = JSON.parse(this.deepDecode(this.pageParams.path));
			} catch(e) {
				this.path = [];
			}
		}
		if (this.pageParams.title) {
			this.title = '请选择' + this.deepDecode(this.pageParams.title) + '类型';
		}
		this.checkConfig();
	},
	methods: {
		deepDecode(str) {
			let prev = '';
			let curr = str;
			try {
				do {
					prev = curr;
					curr = decodeURIComponent(prev);
				} while (curr !== prev);
			} catch(e) {}
			return curr;
		},
		checkConfig() {
			this.loading = true;
			this.$api('app.complaint.config', {}).then(res => {
				if (res.code == 1 && res.data && String(res.data.status) !== '1') {
					this.loading = false;
					uni.showToast({ title: '投诉功能已关闭', icon: 'none' });
					setTimeout(() => {
						uni.navigateBack();
					}, 800);
					return;
				}
				this.getList();
			}).catch(() => {
				this.getList();
			});
		},
		getList() {
			this.loading = true;
			this.$api('app.complaint.category', {
				pid: this.pageParams.pid || 0
			}).then(res => {
				this.loading = false;
				if (res.code == 1) {
					this.list = res.data || [];
				}
			}).catch(() => {
				this.loading = false;
			});
		},
		selectItem(item) {
			var path = this.path.concat([{ id: item.id, title: item.title }]);
			var query = '&target_type=' + (this.pageParams.target_type || '')
				+ '&target_id=' + (this.pageParams.target_id || '')
				+ '&target_title=' + encodeURIComponent(this.pageParams.target_title || '');

			if (item.has_children == 1) {
				uni.navigateTo({
					url: '/pages/app/complaint/index/index?pid=' + item.id
						+ '&title=' + encodeURIComponent(item.title)
						+ '&path=' + encodeURIComponent(JSON.stringify(path))
						+ query
				});
				return;
			}

			uni.navigateTo({
				url: '/pages/app/complaint/submit/submit?category_id=' + item.id
					+ '&category_title=' + encodeURIComponent(item.title)
					+ '&path=' + encodeURIComponent(JSON.stringify(path))
					+ query
			});
		}
	}
}
</script>
