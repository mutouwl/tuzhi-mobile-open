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
  constructor() {
    let ele = document.createElement('div')
    ele.innerHTML = `<div class="status-btn">
    <div class="status-btn-play">
        <img src="/static/image/video/smallplay.png" >
    </div>
    <div class="status-btn-pause">
        <img src="/static/image/video/smallpause.png" >
    </div>
    <div class="status-btn-reply">
        <img src="/static/image/video/reply.png" >
    </div>
</div>`;
    this.html = ele.childNodes[0]
    // this.html = parseDom(rateHtml)
  }

  createEl(el) {
    let eleControlbar = el.querySelector('.prism-controlbar')
    if(eleControlbar){
      eleControlbar.appendChild(this.html)
    }
  }

  play(player, e) {
    let pauseBtnEle = this.html.querySelector('.status-btn-pause');
    let playBtnEle = this.html.querySelector('.status-btn-play')
    pauseBtnEle.style.display = 'block';
    playBtnEle.style.display = 'none';
  }

  pause(player, e) {
    let pauseBtnEle = this.html.querySelector('.status-btn-pause');
    let playBtnEle = this.html.querySelector('.status-btn-play')
    pauseBtnEle.style.display = 'none'
    playBtnEle.style.display = 'block'
  }

  ready(player, e) {
    let pauseBtnEle = this.html.querySelector('.status-btn-pause');
    let playBtnEle = this.html.querySelector('.status-btn-play');
    let replyBtnEle = this.html.querySelector('.status-btn-reply');
    let timeId = null

    pauseBtnEle.onclick = () => {
      player.pause();
    }
    playBtnEle.onclick = () => {
      player.play();
    }
    replyBtnEle.onclick = () => {
      player.loadByUrl(player.getSourceUrl());
      player.play();
      // player.seek(99999999)
      // player.play();
    }

  }

}