import './index.scss'

/**
 * 跑马灯组件
 */
export default class CopyrightComponent {
    constructor(text, style, copyrightPosition = 'random') {
        this.text = text;
        this.style = style || {
            fontSize: '12px',
            color: 'rgb(255, 255, 255)',
            opacity: '0.6'
        };
        this.copyrightPosition = copyrightPosition;

        let parentEle = document.createElement('div');
        parentEle.className = 'aliplayer-copyright-bg';
        parentEle.style.display = 'none'; // 初始状态隐藏

        let ele = document.createElement('div');
        ele.className = 'aliplayer-copyright paused';
        ele.innerText = this.text;

        parentEle.appendChild(ele);
        this.html = ele;
        this.parentHtml = parentEle;

        // 设置定时器每 10 分钟触发一次
        this.startMarquee();
    }

    createEl(el, player) {
        el.appendChild(this.parentHtml);
    }

    ready(player, e) {
        if (player.getOptions().autoplay === false) {
            this.html.style.animationPlayState = 'paused';
        }
        Object.keys(this.style).forEach(key => this.html.style[key] = this.style[key]);
        this.parentHtml.style.width = '100%';
    }

    playing(player, e) {
        this.html.style.animationPlayState = 'running';
    }

    timeupdate(player, timeStamp) {
        let el = player.el();
        let componentEl = el.querySelector('.aliplayer-copyright');
        if (!componentEl) {
            el.appendChild(this.parentHtml);
        }
    }

    pause(player, e) {
        this.html.style.animationPlayState = 'paused';
    }

    startMarquee() {
        // 立即执行一次，然后每隔10分钟执行
        this.showMarquee();
        setInterval(() => {
            this.showMarquee();
        }, 900000); // 600,000 毫秒 = 10 分钟
    }

    showMarquee() {
        this.parentHtml.style.display = 'block';
        this.html.classList.add('running');

        // 1分钟后隐藏
        setTimeout(() => {
            this.parentHtml.style.display = 'none';
            this.html.classList.remove('running');
        }, 60000); // 60,000 毫秒 = 1 分钟
    }
}
