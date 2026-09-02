import CN from './zh-CN.js'
import US from './US.js'
 
import VueI18n from 'vue-i18n'; 
import Vue from 'vue'
Vue.use(VueI18n);

var config = {
	locale: 'zh-Hans',
	messages: {
		'zh-Hans': CN,//简体
		'en':US,//英文
	}
};
const i18n = new VueI18n(config)
export default i18n;