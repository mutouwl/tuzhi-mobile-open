<script>
export default {
	components: {},
	data() {
		return {
			pageParams: {},
			path: [],
			content: '',
			images: [],
			submitting: false,
			submitted: false
		}
	},
	computed: {
		categoryPathText() {
			if (this.path.length > 0) {
				return this.path.map(item => this.deepDecode(item.title || '')).join(' / ');
			}
			return this.deepDecode(this.pageParams.category_title || '');
		},
		canSubmit() {
			return this.content.trim().length > 0 && this.content.length <= 200 && this.images.length <= 4 && !this.submitting;
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
		onContentChange(e) {
			this.content = String(e.value || '').slice(0, 200);
		},
		onImagesChange(images) {
			this.images = images.slice(0, 4);
		},
		handleDone() {
			uni.reLaunch({ url: '/pages/index/index' });
		},
		submit() {
			if (this.content.trim().length == 0) {
				uni.showToast({ title: '请填写投诉内容', icon: 'none' });
				return;
			}
			if (this.content.length > 200) {
				uni.showToast({ title: '投诉内容不能超过200字', icon: 'none' });
				return;
			}
			if (this.images.length > 4) {
				uni.showToast({ title: '证据截图最多上传4张', icon: 'none' });
				return;
			}
			if (this.submitting) {
				return;
			}
			this.submitting = true;
			this.$api('app.complaint.submit', {
				category_id: this.pageParams.category_id,
				content: this.content,
				images: this.images,
				target_type: this.pageParams.target_type || '',
				target_id: this.pageParams.target_id || '',
				target_title: decodeURIComponent(this.pageParams.target_title || '')
			}).then(res => {
				this.submitting = false;
				if (res.code == 1) {
					this.submitted = true;
				}
			}).catch(() => {
				this.submitting = false;
			});
		}
	}
}
</script>
