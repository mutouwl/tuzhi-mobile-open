<script>

export default {
	data() {
		return {
			// 首屏骨架（M16）：请求三条出口（成功 / 业务失败 / 网络异常）都要收回
			skeletonLoading: true,
			bookId: 0,
			catalogId: 0,
			catalogName: '',
			total: 0,
			starting: false,
			// 「自定义题量」开关：输入框可见与否只看它，清空输入时整行不会消失
			useCustom: false,
			// 输入框原样文本（number 框清空时是 ''，不直接拿它当数值判据）
			countText: '',
			form: {
				question_mode: 'sort',
				answer_mode: 'practice',
				question_count: 0,
			},
		};
	},
	methods: {
		getData() {
			this.skeletonLoading = true;
			this.$api('app.drill_book.practice.setting', {
				id: this.bookId,
				catalog_id: this.catalogId,
			}).then(res => {
				if (res.code !== 1) {
					this.skeletonLoading = false;
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				const d = res.data || {};
				this.total = Number(d.total || 0);
				this.catalogName = (d.catalog && d.catalog.name) || this.catalogName;
				uni.setNavigationBarTitle({ title: this.catalogName || '刷题设置' });
				this.skeletonLoading = false;
			}).catch(err => {
				this.skeletonLoading = false;
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		setAll() {
			this.useCustom = false;
			this.countText = '';
			this.form.question_count = 0;
		},
		enableCustom() {
			this.useCustom = true;
			if (!(parseInt(this.countText, 10) > 0)) {
				this.countText = String(Math.min(10, this.total || 1));
			}
		},
		/** 失焦/开考前统一收敛：非数字与越界都裁到 [1, total]，并把裁过的值写回框内 */
		normalizeCount() {
			const max = Math.max(1, Number(this.total) || 1);
			let n = parseInt(String(this.countText || '').replace(/\D/g, ''), 10);
			if (isNaN(n) || n < 1) n = 1;
			if (n > max) n = max;
			this.countText = String(n);
			this.form.question_count = n;
			return n;
		},
		start() {
			if (this.starting) return;
			const count = this.useCustom ? this.normalizeCount() : 0;
			this.starting = true;
			this.$api('app.drill_book.practice.start', {
				id: this.bookId,
				catalog_id: this.catalogId,
				question_mode: this.form.question_mode,
				answer_mode: this.form.answer_mode,
				question_count: count,
			}).then(res => {
				this.starting = false;
				if (res.code !== 1) {
					this.$u.toast(res.msg || '开始失败');
					return;
				}
				const logId = (res.data && res.data.log_id) || 0;
				this.$nav.to('/pages/app/drill_book/work/work?log_id=' + logId, 'local', 'redirectTo');
			}).catch(err => {
				this.starting = false;
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
	},
	onLoad(options) {
		this.bookId = Number(options.id || 0);
		this.catalogId = Number(options.catalog_id || 0);
		this.catalogName = decodeURIComponent(options.name || '');
		if (this.catalogName) {
			uni.setNavigationBarTitle({ title: this.catalogName });
		}
		this.getData();
	},
};
</script>
