import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


import { 
    ease,
    smoother, createSmoother,
    getRelativePosition
} from "./page/common";
import { Navi, Footer, navShowHide, Mobile_Navi } from "./page/nav"
import DraggableSlider from "./class/DraggableSlider"


//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded', e =>{
    console.log("DOMContentLoaded");
    
    /* PC */
    if(!isMobile){
        // createSmoother(true);

        Navi.init();
        /* 뉴스룸일 때 원뎁스 메뉴 활성화 */
        if(!document.querySelector('.doc-rich')) Navi.naviActive(3);
        
        Footer.st();

        navShowHide();
        window.addEventListener('scroll', e => navShowHide() );

        ScrollTrigger.config({ 
            limitCallbacks: true,
            ignoreMobileResize: true
        })
        // ScrollTrigger.addEventListener("refresh", e=> console.log("ScrollTrigger refresh") )

    }

    /* Mobile */
    else {
        Mobile_Navi.init()
        Mobile_Navi.naviActive(3);
        AnotherArticle()
    };

    /* 모바일 풋터 정책 문서  */
    footerDocument.init()
    footerDocument.addEvent();
});


const AnotherArticle =()=>{
    let CMS = document.querySelector('.cms_another-articles');
    if(!CMS) return;
    
    const totalNum = document.querySelectorAll('.another-articles_item').length
    const w = gsap.getProperty('.another-articles_item', 'width') + gsap.getProperty('.another-articles_item', 'margin-right');
    
    const snap = [];
    document.querySelectorAll('.another-articles_item').forEach( (item, i)=> {
        if( i === 0 ) snap.push( 0 )
        else{
            if( i === 1 ){
                const itemX = getRelativePosition(item.parentNode, item).x;
                const parentW = gsap.getProperty(item.parentNode, 'width');
                const itemW = gsap.getProperty(item, 'width');

                snap.push( -itemX + parentW/2 - itemW/2  );
            } else {
                snap.push(snap[i-1] - w);
            }
        }
    
    });

    new DraggableSlider({
        selector: ".another-articles_list",
        totalNum: totalNum,
        snap: snap,
        min: -w * totalNum + window.innerWidth - 60,
        max: 0,
        slideItemSize: w
    });      
    
    
}


//===============================================================================================================================
/*===== 모바일 정책문서 불러오기  ======================*/
//===============================================================================================================================

const footerDocument =(function(exports){
    let popup, terms, privacy, closeBtn,
        pageY, shopNowImgY;

    async function preLoad( url, target ){
        const res = await fetch(url);
        const contentType = res.headers.get('content-type');
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        target.appendChild( doc.querySelector('main') )
    }


    const open=(e)=>{             
        pageY = window.pageYOffset;
        document.querySelector('.page-wrap').style.top = `-${pageY}px`;
        document.body.classList.add('fixed');

        e.preventDefault();
        e.currentTarget.id === "Terms" ? terms.classList.remove('is-hide') : privacy.classList.remove('is-hide')
        popup.classList.remove('is-hide')
        gsap.to(popup, 0.4, {y: 0, ease: ease.standard})
    }

    const close=(e)=>{
        document.body.classList.remove('fixed');
        document.querySelector('.page-wrap').style.top = `-${0}px`;
        window.scrollTo(0, pageY);

        gsap.to(popup, 0.3, {y: window.innerHeight, ease: ease.exit, onComplete:()=>{
            terms.scrollTop = 0
            privacy.scrollTop = 0
            popup.classList.add('is-hide')
            terms.classList.add('is-hide')
            privacy.classList.add('is-hide')
        }})
    }

    const addEvent=()=>{
        if(!document.querySelector('.popup')) return;
        document.querySelector('#Terms').addEventListener('click', open);
        document.querySelector('#Privacy').addEventListener('click', open);
    }

    const init=()=>{
        if(!document.querySelector('.popup')) return;
        popup = document.querySelector('.popup');
        terms = popup.querySelector('.terms');
        privacy = popup.querySelector('.privacy');
        closeBtn = popup.querySelector('.btn-close'); 

        preLoad(document.querySelector('#Terms').href, terms)
        preLoad(document.querySelector('#Privacy').href , privacy)

        // document.querySelector('#Terms').addEventListener('click', open);
        // document.querySelector('#Privacy').addEventListener('click', open);
        closeBtn.addEventListener('click', close);
    }

    exports.addEvent = addEvent;
    exports.init = init;
    return exports;
})({});
