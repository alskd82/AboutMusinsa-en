import {gsap} from "gsap";
import{ ease } from "../common";


class LoadMore {
    constructor(opts){
        this.nextBtn = document.querySelector(opts.nextBtn);
        this.src = this.nextBtn.getAttribute('href')
        if(this.src === undefined) return

        this.indexOfNum = this.src.indexOf("=");
        this.nextNum = this.src.substr(this.indexOfNum + 1);        // 해당순서부터 출력 //
        this.nextSrc = this.src.substring(0, this.indexOfNum + 1)   // 시작위치, 끝위치 //
        
        this.cms = opts.cms;
        this.list = opts.cms + ' .w-dyn-items';
        this.initY = opts.initY;
        this.customScroll = opts.customScroll;

        // console.log(this.nextSrc + this.nextNum)
        this.fetchPage( this.nextSrc + this.nextNum );

        this.nextBtn.addEventListener('click', this.btnClickHandler.bind(this), false)
    }

    btnClickHandler(e){
        e.preventDefault();

        for(let i=0; i<this.itemsArr.length; i++ ){
            document.querySelector(this.list).appendChild( this.itemsArr[i] )
        }

        this.itemShow()
        this.autoScroll()

        this.nextNum++
        this.fetchPage( this.nextSrc + this.nextNum );
    }


    fetchPage(src){
        (async()=>{
            const res = await fetch(src);
            const contentType = res.headers.get('content-type');
            if (contentType?.includes('application/json')){
                const json = await res.json();
            } else {
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // ------ items ---------- //
                this.itemsArr = doc.querySelectorAll(this.cms + ' .w-dyn-item');
                if(this.itemsArr.length > 0){
                    this.itemInit()
                } else {
                    this.nextBtn.style.display = 'none';
                    // if(_this.customScroll != undefined) _this.customScroll.update() 
                }
            }
        })()
    };

    itemInit(){ gsap.set(this.itemsArr , { autoAlpha: 0, y: this.initY }) };
    itemShow(){ gsap.to( this.itemsArr ,  .5, { stagger: 0.06, y:0, autoAlpha: 1, ease: 'Quad.easeOut'}) };
    autoScroll(){
        const moduleH = gsap.getProperty( this.itemsArr[0] , 'height') * 0.5;
        const windowY = window.pageYOffset;
        typeof( this.customScroll.fn ) === "function" && this.customScroll.fn()
        gsap.to(window, 1, { scrollTo: windowY + moduleH , ease: ease.material });
    };
};

export default LoadMore;