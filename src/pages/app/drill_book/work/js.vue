<script>

import questionWorkShell from "@/pages/app/exam/components/question-work-shell.vue";

export default {
	components: { questionWorkShell },
	data() {
		return {
			skeletonLoading: true,
			logId: 0,
			// all / wrong / ''（'' = 正常做题）
			scope: '',
			data: {
				log: {},
				questions: [],
				collected: [],
			},
			// 题 ID → 用户答案（多选/不定项/填空为数组，其余为标量或字符串）
			answerList: {},
			// 做题模式下的即时判题结果：题 ID → 1 对 / 0 错 / 2 未作答
			resultMap: {},
			currentIndex: 0,
			starting: false,
			// 试卷答题中的「已用时」（秒）：null＝不摆（非试卷 / 解析态 / 已交卷）
			elapsedSeconds: null,
			elapsedTimer: null,
			// 填空 / 问答的本地草稿：输入只写缓存（300ms 合并一次写盘），交卷时随 answers 一起提交，
			// 避免每敲一个字符就发一次 save（2026-11-23 用户点名，同时降低高并发下的接口压力）
			draftTimer: null,
			// 交卷成功后不再回写草稿：redirectTo 触发的 onUnload 会把刚清掉的草稿又写回来
			draftCleared: false,
		};
	},
	computed: {
		/** 解析态：从结果页的「全部解析 / 错题解析」进来，只读浏览、不再作答与交卷 */
		isAnalysis() {
			return this.scope === 'all' || this.scope === 'wrong';
		},
		/**
		 * 试卷（模拟测试）走考试样式
		 *
		 * 参照产品的试卷作答复用「考试做题页」（examination/detail?drill_id）：题面带分值、
		 * 不摆刷题本练习态独有的收藏 / i 标记、底栏按考试的 70% 按钮行。目录刷题与错题重练不受影响。
		 */
		isPaper() {
			return String(this.data.log.source) === 'paper';
		},
		/**
		 * 试卷答题中的「已用时」是否摆（参照考试做题页：只在答题中摆，交卷后 / 解析态不摆）
		 *
		 * 试卷没有限时配置可用（试卷库 `app_testpaper` 无时长列，关联考试的
		 * `test_duration_limit` 都是 0＝不限时），所以这一档只能走正计时；
		 * 起点取记录 `createtime`，与交卷时后端写入的 `use_time`（now − createtime）
		 * 同源 —— 顶栏这串与结果页「总用时」不会出现两个口径。
		 */
		showElapsed() {
			return this.isPaper && !this.isAnalysis && Number(this.data.log.status) === 0;
		},
		/** 已用时 HH:mm:ss（与考试倒计时同一呈现格式） */
		elapsedText() {
			const s = this.elapsedSeconds || 0;
			const pad = n => (n < 10 ? '0' + n : '' + n);
			return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor((s % 3600) / 60)) + ':' + pad(s % 60);
		},
		analysisTitle() {
			return this.scope === 'wrong' ? '错题解析' : '全部解析';
		},
		emptyText() {
			return this.scope === 'wrong' ? '本次没有错题' : '暂无题目';
		},
		currentQuestion() {
			return this.data.questions[this.currentIndex] || {};
		},
		currentMarked() {
			const q = this.data.questions[this.currentIndex];
			return q ? Number(q.marked) === 1 : false;
		},
		isCollected() {
			const id = this.currentQuestion.id;
			return (this.data.collected || []).map(Number).includes(Number(id));
		},
		/**
		 * 交给通用做题外壳的逐题数组（外壳只负责版式，判据仍在本页）
		 *
		 * 外壳按这一份既排题面又排答题卡，所以 `id` / `marked` 必须带上；
		 * 其余键原样绑给 report 版式的 question-box。用普通对象数组而不是函数：
		 * 小程序端 props 必须可序列化。这里读到的都是本页响应式数据，作答 / 判题 / 切题后整份重算。
		 */
		workQuestions() {
			return (this.data.questions || []).map(q => ({
				id: q.id,
				marked: q.marked,
				edit: this.editOf(q),
				option: q.option,
				type: q.type,
				question: q.question,
				user_answer: this.answerOf(q),
				analysis: q.analysis,
				answer: this.rightAnswerOf(q),
				is_correct: this.correctBadgeOf(q),
				score: q.score,
				result: this.resultOf(q),
				personal_accuracy: q.personal_accuracy,
				global_accuracy: q.global_accuracy,
			}));
		},
	},
	methods: {
		finish() {
			// 数据先写进来、内容在骨架下面挂载；富文本子组件（u-parse）在 mounted 里还要再渲染一帧，
			// 等这一帧画完再撤骨架，避免「先看到选项牌、正文随后才补上」（2026-11-23 用户点名）
			this.$nextTick(() => {
				setTimeout(() => {
					if (this._isDestroyed) return;
					this.skeletonLoading = false;
					uni.stopPullDownRefresh();
				}, 80);
			});
		},
		/** 本页草稿的存储键（按刷题记录隔离，换一本不会串答案） */
		draftKey() {
			return 'drill_book_work_draft_' + this.logId;
		},
		/** 把当前答案整份写进本地缓存（不发网络） */
		cacheDraft() {
			if (!this.logId || this.isAnalysis || this.draftCleared) return;
			try {
				uni.setStorageSync(this.draftKey(), { answers: this.answerList });
			} catch (e) {
				// 存储满 / 不支持时静默：草稿只是防丢，不能让输入卡住
			}
		},
		/** 输入过程中 300ms 合并一次写盘（每次按键写盘在低端机上会拖慢输入） */
		scheduleDraft() {
			if (this.isAnalysis || !this.logId) return;
			if (this.draftTimer) clearTimeout(this.draftTimer);
			this.draftTimer = setTimeout(() => {
				this.draftTimer = null;
				if (this._isDestroyed) return;
				this.cacheDraft();
			}, 300);
		},
		/** 切后台 / 退出页面：把未落盘的草稿立即写掉 */
		flushDraft() {
			if (this.draftTimer) {
				clearTimeout(this.draftTimer);
				this.draftTimer = null;
			}
			this.cacheDraft();
		},
		clearDraft() {
			if (!this.logId) return;
			this.draftCleared = true;
			try {
				uni.removeStorageSync(this.draftKey());
			} catch (e) {
				// 忽略
			}
		},
		/**
		 * 恢复本地草稿（填空 / 问答在上一次退出前没来得及交卷的输入）
		 *
		 * 只补「服务端这一题还没有答案」的那几格：服务端已有答案时以服务端为准，
		 * 避免旧草稿把已经交过卷 / 重新答过的题覆盖回去。
		 */
		restoreDraft() {
			if (!this.logId || this.isAnalysis) return;
			let draft = null;
			try {
				draft = uni.getStorageSync(this.draftKey());
			} catch (e) {
				draft = null;
			}
			const answers = draft && draft.answers ? draft.answers : null;
			if (!answers) return;
			const valid = {};
			(this.data.questions || []).forEach(q => { valid[Number(q.id)] = true; });
			Object.keys(answers).forEach(key => {
				const id = Number(key);
				const val = answers[key];
				if (!valid[id] || !this.hasAnswerValue(val)) return;
				if (this.hasAnswerValue(this.answerList[id])) return;
				this.$set(this.answerList, id, val);
			});
		},
		/** 这一格答案是否算「已作答」（空串 / 空数组 / 空的问答对象都不算） */
		hasAnswerValue(v) {
			if (v === undefined || v === null) return false;
			if (typeof v === 'string') return v.trim() !== '';
			if (Array.isArray(v)) return v.some(x => String(x === undefined || x === null ? '' : x).trim() !== '');
			if (typeof v === 'object') {
				return String(v.text || '').trim() !== '' || (Array.isArray(v.images) && v.images.length > 0);
			}
			return true;
		},
		/**
		 * 起「已用时」计时（试卷答题中）
		 *
		 * 先停旧表再起，重复调用（buildWork 后 / onShow 回前台）不会叠出两只定时器；
		 * 每秒只写一个数字，闭包里不引用已销毁实例（硬约束 23）。
		 */
		startElapsed() {
			this.stopElapsed();
			if (!this.showElapsed) {
				this.elapsedSeconds = null;
				return;
			}
			const start = Number(this.data.log.createtime || 0);
			if (!start) {
				this.elapsedSeconds = null;
				return;
			}
			const tick = () => {
				if (this._isDestroyed) {
					this.stopElapsed();
					return;
				}
				this.elapsedSeconds = Math.max(0, Math.floor(Date.now() / 1000) - start);
			};
			tick();
			this.elapsedTimer = setInterval(tick, 1000);
		},
		stopElapsed() {
			if (this.elapsedTimer) {
				clearInterval(this.elapsedTimer);
				this.elapsedTimer = null;
			}
		},
		getData() {
			this.skeletonLoading = true;
			const url = this.isAnalysis ? 'app.drill_book.work.report' : 'app.drill_book.work.detail';
			this.$api(url, { log_id: this.logId }).then(res => {
				if (res.code !== 1) {
					this.finish();
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				if (this.isAnalysis) {
					this.buildAnalysis(res.data || {});
				} else {
					this.buildWork(res.data || {});
				}
				this.finish();
			}).catch(err => {
				this.finish();
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		/** 正常做题：取本次题集（含已存答案），退出再进可续答 */
		buildWork(d) {
			this.data = {
				log: d.log || {},
				questions: d.questions || [],
				collected: d.collected || [],
			};
			this.answerList = {};
			this.resultMap = {};
			(this.data.questions || []).forEach(q => {
				if (q.user_answer !== '' && q.user_answer !== null && q.user_answer !== undefined) {
					this.$set(this.answerList, q.id, this.parseAnswer(q));
				}
				if (q.result !== null && q.result !== undefined) {
					this.$set(this.resultMap, q.id, Number(q.result));
				}
			});
			uni.setNavigationBarTitle({ title: this.data.log.catalog_name || this.data.log.paper_name || '刷题' });
			// 本地草稿：上次没交卷的填空 / 问答输入补回答案表（服务端已有答案的格不覆盖）
			this.restoreDraft();
			// 「继续上次」/ 退出再进：落在第一道还没作答的题上（都答过就回第一题）。
			// 早前恒回第 1 题，续答的人得自己一题题翻到上次停的地方。
			this.currentIndex = 0;
			(this.data.questions || []).some((q, i) => {
				if (this.hasAnswerValue(this.answerList[q.id])) return false;
				this.currentIndex = i;
				return true;
			});
			// 试卷：顶栏「已用时」按这一条记录的 createtime 起算（续答不清零，与结果页总用时同源）
			this.startElapsed();
		},
		/**
		 * 解析态：题目、答案、解析一律取结果报告那一份（与结果页同一接口、同一判据）
		 *
		 * 「错题解析」= 报告里 result=0（答错）与 result=2（未作答）的两档 —— 空题没答对，
		 * 与结果页「刷题情况」里答错 / 未答两格同口径，只筛 0 会把空题整批漏掉；
		 * 解析视图仍是本页的 `question-box`，与练习/考试共用同一份正确答案 / 我的答案 / 解析正文版式。
		 */
		buildAnalysis(d) {
			const all = d.questions || [];
			const list = this.scope === 'wrong' ? all.filter(q => [0, 2].includes(Number(q.result))) : all;
			this.data = {
				log: d.log || {},
				collected: d.collected || [],
				questions: list.map(q => Object.assign({}, q)),
			};
			this.answerList = {};
			(this.data.questions || []).forEach(q => {
				if (q.user_answer !== '' && q.user_answer !== null && q.user_answer !== undefined) {
					this.$set(this.answerList, q.id, this.parseAnswer(q));
				}
			});
			uni.setNavigationBarTitle({ title: this.analysisTitle });
			this.currentIndex = 0;
		},
		/** 库里存的是串（多选/填空为 json 数组），渲染到 option 组件前还原成数组 */
		parseAnswer(q) {
			const raw = q.user_answer;
			if (raw === '' || raw === null || raw === undefined) return '';
			if (['multiple', 'indefinite', 'fillblank'].includes(q.type)) {
				try {
					const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
					return Array.isArray(arr) ? arr : [];
				} catch (e) {
					return [];
				}
			}
			if (q.type === 'essay') return String(raw || '');
			// 单选/判断：`Number('')` 是 0，会把「未作答」读成「选了 A」，空串必须先挡掉
			return Number(raw);
		},
		/**
		 * 正确答案例（题干解析区用）：后端存的是库里的原始串，这里按题型还原成
		 * `question-box` 要的形状 —— 多选/不定项=选项下标数组、填空=逐空数组、其余=下标数字。
		 * 直接把 "0,1,3" 这类串传进去会被 parseAnswer 当成单个下标，正确答案例只剩「A」。
		 */
		rightAnswerOf(q) {
			const raw = q.right_answer !== undefined && q.right_answer !== null ? q.right_answer : q.answer;
			if (raw === undefined || raw === null || raw === '') return '';
			if (q.type === 'multiple' || q.type === 'indefinite') {
				return String(raw).split(',').filter(x => x !== '').map(Number);
			}
			if (q.type === 'fillblank') {
				try {
					const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
					return Array.isArray(arr) ? arr : [];
				} catch (e) {
					return [];
				}
			}
			if (q.type === 'essay') return String(raw);
			return Number(raw);
		},
		/**
		 * 解析态右上角那枚「正确 / 错误」
		 *
		 * 三个来源合一：解析态与已交卷读题目行自带的 `result`，做题模式读即时判题的 `resultMap`；
		 * 未作答（2）不摆 —— 旧写法 `is_correct = (result === 1)` 把「未作答」渲成了「错误」。
		 */
		correctBadgeOf(q) {
			let r = this.resultOf(q);
			if (r === null) return null;
			if (r === 1) return 1;
			if (r === 0) return 0;
			return null;
		},
		/**
		 * 逐题判题结果原值（0 错 / 1 对 / 2 未作答 / null 未判）
		 *
		 * 右上角那枚「正确 / 错误」只摆 0 / 1（未作答不摆），但解析区那一行
		 * 「回答错误 得0分」要把未作答也读出来 —— 两处共用这一个来源，避免再各写一遍判据。
		 */
		resultOf(q) {
			let r = null;
			if (this.isAnalysis || Number(this.data.log.status) === 1) {
				r = q.result;
			} else if (this.resultMap[q.id] !== undefined) {
				r = this.resultMap[q.id];
			}
			if (r === null || r === undefined || r === '') return null;
			return Number(r);
		},
		answerOf(q) {
			return this.answerList[q.id];
		},
		/**
		 * 这一题此刻是否可作答
		 *
		 * 逐题判：做题模式每答一题就立刻转解析态，其余题仍是作答态；
		 * 交卷后与解析态则整份只读。**不能读 `currentIndex` 那一题的结果** ——
		 * swiper 里所有题同时在挂载，那样会让一道已判题的结论套到全部题目上。
		 */
		editOf(q) {
			if (this.isAnalysis) return false;
			if (Number(this.data.log.status) === 1) return false;
			const r = this.resultMap[q.id];
			if (r === undefined || r === null) return true;
			// 未作答（2）仍可作答；已判对错（1/0）转解析态
			return Number(r) === 2;
		},
		changeOption(option) {
			if (this.isAnalysis) return;
			const q = this.currentQuestion;
			if (!q.id) return;
			let value = option;
			if (option && typeof option === 'object' && ['multiple', 'indefinite'].includes(q.type)) {
				value = option.slice().sort((a, b) => a - b);
			}
			// $set：两个 map 的键都是题目 ID，运行中才新增 —— 直接赋值不带 getter，
			// 「我的答案」与「正确 / 错误」那两处读不到变化（Vue 2 的新增键不响应）
			this.$set(this.answerList, q.id, value);
			// 已交卷只看解析，不再提交
			if (Number(this.data.log.status) === 1) return;
			const isPractice = String(this.data.log.answer_mode) === 'practice';
			const isChoice = !['essay', 'fillblank'].includes(q.type);
			if (isPractice && isChoice) {
				// 做题模式：选择题立即判对错并展开解析
				this.$api('app.drill_book.work.answerOne', {
					log_id: this.logId,
					question_id: q.id,
					answer: value,
				}).then(res => {
					if (res.code !== 1) return;
					const d = res.data || {};
					this.$set(this.resultMap, q.id, Number(d.result));
					const target = this.data.questions.find(x => Number(x.id) === Number(q.id));
					if (target) {
						target.right_answer = d.right_answer;
						target.right_answer_text = d.right_answer_text;
						target.analysis = d.analysis;
						// 逐题正确率随这一次作答一起刷新（练习模式答案区第二条）
						target.personal_accuracy = d.personal_accuracy;
						target.global_accuracy = d.global_accuracy;
					}
				});
			} else {
				// 测试模式的选择题 / 填空 / 问答：只落本地草稿，不发网络。
				// 交卷时把整份 answers 一并交给 submit（后端先落明细、再统一判题），
				// 这样填空不再「每敲一个字符一次 save」——既没有 500 刷屏，也不会在
				// 大量用户同时作答时把作答明细表打满（2026-11-23 用户点名）
				this.scheduleDraft();
			}
		},
		/**
		 * 回上一步：解析态与已交卷态都有出口
		 *
		 * 正常栈内一律 navigateBack（解析态退回收结果页、已交卷退回来处那一页）；
		 * 栈只有一层（深链 / 分享落地）时回结果页，解析态与做过的记录在那里都有页面可落。
		 */
		backPrev() {
			const pages = getCurrentPages();
			if (pages && pages.length > 1) {
				uni.navigateBack({ delta: 1 });
				return;
			}
			this.$nav.to('/pages/app/drill_book/result/result?log_id=' + this.logId, 'local', 'redirectTo');
		},
		toggleCollect() {
			const q = this.currentQuestion;
			if (!q.id) return;
			this.$api('app.drill_book.work.collect', { log_id: this.logId, question_id: q.id }).then(res => {
				if (res.code !== 1) {
					this.$u.toast(res.msg || '操作失败');
					return;
				}
				const collected = Number((res.data && res.data.collected) || 0) === 1;
				if (collected) {
					if (!this.data.collected.map(Number).includes(Number(q.id))) this.data.collected.push(q.id);
				} else {
					this.data.collected = this.data.collected.filter(x => Number(x) !== Number(q.id));
				}
				this.$u.toast(res.msg);
			});
		},
		toggleMark() {
			const q = this.currentQuestion;
			if (!q.id) return;
			const next = this.currentMarked ? 0 : 1;
			this.$api('app.drill_book.work.mark', {
				log_id: this.logId, question_id: q.id, marked: next,
			}).then(res => {
				if (res.code !== 1) {
					this.$u.toast(res.msg || '操作失败');
					return;
				}
				const target = this.data.questions.find(x => Number(x.id) === Number(q.id));
				// $set：接口若没下发 marked 键，直接赋值不响应，答题卡角标读不到这次变化
				if (target) this.$set(target, 'marked', next);
				this.$u.toast(res.msg);
			});
		},
		submitConfirm() {
			const unanswered = this.data.questions.filter(q => {
				return !this.hasAnswerValue(this.answerList[q.id]);
			}).length;
			const vm = this;
			uni.showModal({
				title: '提示',
				content: unanswered > 0 ? ('还有 ' + unanswered + ' 题未作答，确定交卷吗？') : '确定要交卷吗？',
				success: function (r) {
					// modal 回调里 this 不是 vm：写成 this.submit() 会静默抛错，表现为「确认后没反应」
					if (r.confirm) vm.submit();
				},
			});
		},
		submit() {
			if (this.starting) return;
			this.starting = true;
			// 交卷把整份答案一起提交（测试模式本来就靠这一份；练习模式选择题已逐题落库并判过，
			// 这里只补填空 / 问答那两档本地缓存 —— 后端 `Work::submit` 先写明细、`LogService::submit`
			// 再对有作答的明细统一判题，所以练习模式下也走同一条提交路径）
			const answers = {};
			const isTest = String(this.data.log.answer_mode) === 'test';
			this.data.questions.forEach(q => {
				const v = this.answerList[q.id];
				if (v === undefined) return;
				const isChoice = !['essay', 'fillblank'].includes(q.type);
				// 练习模式选择题不重复写：answerOne 已落库，交卷再覆盖会把已判结果打回未判
				if (!isTest && isChoice) return;
				answers[q.id] = v;
			});
			this.flushDraft();
			this.$api('app.drill_book.work.submit', { log_id: this.logId, answers }).then(res => {
				this.starting = false;
				if (res.code !== 1) {
					this.$u.toast(res.msg || '交卷失败');
					return;
				}
				this.clearDraft();
				this.stopElapsed();
				this.$nav.to('/pages/app/drill_book/result/result?log_id=' + this.logId, 'local', 'redirectTo');
			}).catch(err => {
				this.starting = false;
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
	},
	onLoad(options) {
		this.logId = Number(options.log_id || 0);
		this.scope = options.scope === 'wrong' ? 'wrong' : (options.scope === 'all' ? 'all' : '');
		if (!this.logId) {
			this.skeletonLoading = false;
			return;
		}
		this.getData();
	},
	// 切后台收起计时（回来后按 createtime 重算，离开期间的时间照算，与 use_time 同口径）；
	// 未交卷的填空 / 问答先落本地草稿，下次进来能续上
	onHide() {
		this.stopElapsed();
		this.flushDraft();
	},
	onShow() {
		if (this.logId && this.data.log && this.data.log.id) this.startElapsed();
	},
	onUnload() {
		this.stopElapsed();
		this.flushDraft();
	},
	// 答题页分享（全站口径）：转发的落地是这份题记录，别人打开接着答
	onShareAppMessage() {
		const name = this.data.log.catalog_name || this.data.log.paper_name || '刷题';
		return this.$nav.share(name);
	},
	onShareTimeline() {
		const name = this.data.log.catalog_name || this.data.log.paper_name || '刷题';
		return this.$nav.share(name);
	},
};
</script>
