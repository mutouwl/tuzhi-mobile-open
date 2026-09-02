// import rateHtml from './index.html'
import './index.scss'
// import { parseDom } from '../unit.js'
/**
 * 倍速播放组件
 */
export default class RateComponent {
  /**
   * @constructor 倍速播放组件构造函数
   */
  constructor(views) {
    this.text = views;
    let ele = document.createElement('div')
    ele.innerHTML = '<div class="hot-tag"><span><svg t="1689309616780" class="hot-views-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="24080" width="200" height="200"><path d="M512 832c-156.448 0-296.021333-98.730667-418.410667-291.605333a52.938667 52.938667 0 0 1 0-56.789334C215.978667 290.730667 355.552 192 512 192c156.448 0 296.021333 98.730667 418.410667 291.605333a52.938667 52.938667 0 0 1 0 56.789334C808.021333 733.269333 668.448 832 512 832z m0-576c-129.514667 0-249.461333 83.850667-360.117333 256C262.538667 684.149333 382.485333 768 512 768c129.514667 0 249.461333-83.850667 360.117333-256C761.461333 339.850667 641.514667 256 512 256z m0 405.333333c-83.210667 0-150.666667-66.858667-150.666667-149.333333S428.789333 362.666667 512 362.666667s150.666667 66.858667 150.666667 149.333333S595.210667 661.333333 512 661.333333z m0-64c47.552 0 86.101333-38.208 86.101333-85.333333S559.552 426.666667 512 426.666667c-47.552 0-86.101333 38.208-86.101333 85.333333s38.549333 85.333333 86.101333 85.333333z" fill="#ffffff" p-id="24081"></path></svg></span><span id="hot-views-val"></span></div>';
    this.html = ele.childNodes[0]
  }

  createEl (el, player) {
    this.html.querySelector('#hot-views-val').innerText = this.text;
    el.appendChild(this.html)
  }

  ready(player, e) {
    
  }

}