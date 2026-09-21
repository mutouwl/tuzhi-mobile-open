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
    ele.innerHTML = '<div class="rate-components">    <div class="current-rate">1.0x</div>    <ul class="rate-list"> <li data-rate="2.0">2.0x</li> <li data-rate="1.5">1.5x</li> <li data-rate="1.25">1.25x</li> <li data-rate="1.0" class="current">1.0x</li> <li data-rate="0.5">0.5x</li> </ul></div>';
    this.html = ele.childNodes[0]
    // this.html = parseDom(rateHtml)
  }

  createEl(el) {
    let eleControlbar = el.querySelector('.prism-controlbar')
    if(eleControlbar){
      eleControlbar.appendChild(this.html)
    }
  }

  ready(player, e) {
    let currentRateEle = this.html.querySelector('.current-rate')
    let rateListEle = this.html.querySelector('.rate-list')
    let timeId = null

    // 隐藏设置里面的倍速播放
    let settingRate = document.querySelector('.prism-setting-item.prism-setting-speed')
    if (settingRate) {
      settingRate.classList.add('player-hidden')
    }

    currentRateEle.onclick = () => {
      if(rateListEle.style.display == 'block'){
        rateListEle.style.display = 'none'
      }else{
        rateListEle.style.display = 'block'
      }
      
    }
    currentRateEle.onmouseleave = () => {
      
      timeId = setTimeout(() => {
        rateListEle.style.display = 'none'
      }, 100);
    }

    rateListEle.onmouseenter = () => {
      clearTimeout(timeId)
    }
    rateListEle.onmouseleave = () => {
      rateListEle.style.display = 'none';
    }


    rateListEle.onclick = ({ target }) => {
      let rate = target.dataset.rate
      if (rate) {
        player.setSpeed(rate)
        if (target.className !== 'current') {
          let currentEle = rateListEle.querySelector('.current')
          if (currentEle) {
            currentEle.className = ''
          }
          target.className = 'current'
        }
        currentRateEle.innerText = rate + 'x'
      }
      rateListEle.style.display = 'none'
    }
  }

}