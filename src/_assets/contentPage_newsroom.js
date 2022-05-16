import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother);


import BezierEasing from "./js/class/BezierEasing.js";
import { scrollIntoView, ease } from "./js/utils.js";
import { Navi, Footer , forScrollVariable_Reset, navShowHide, nav } from "./js/PC_Nav.js"


//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded', e =>{
    console.log("DOMContentLoaded");

    // if( !document.querySelector("[data-barba]") ) return;

    // barbaInit();

    // ourstoryIndi = document.querySelector('.ourstory-indi');
    // const ourstoryIndiLeft =()=> gsap.set( ".ourstory-indi_border", { width: (document.body.offsetWidth - 1440) / 2})
    // ourstoryIndiLeft()
    // window.addEventListener('resize' , e=> ourstoryIndiLeft())

    // Link.navi()
    Navi.init();
    Navi.naviActive(3);
    Footer.st();
    
    createSmoother(true);

    ScrollTrigger.config({ 
        limitCallbacks: true,
        ignoreMobileResize: true
    })
    // ScrollTrigger.addEventListener("refresh", e=> console.log("ScrollTrigger refresh") )

    /* 스크롤 이벤트 */
    navShowHide();
    window.addEventListener('scroll', e => navShowHide() )
});

//===============================================================================================================================
/*===== 스무스 스크롤  ======================*/
//===============================================================================================================================
let smoother;
const createSmoother=(isTop)=>{
    /* 삭제 후 다시 설치 방법 */
    // if(smoother) smoother.kill();
    // smoother = ScrollSmoother.create({
    //     wrapper: `[data-smooth="wrapper"]`,
    //     content: `[data-smooth="content"]`,
    //     normalizeScroll: true, effects: true,
    // });

    /* 컨텐츠만 다시 바꿔치기 */
    if(smoother) smoother.content(`[data-smooth="content"]`);
    else {
        smoother = ScrollSmoother.create({
            wrapper: `[data-smooth="wrapper"]`,
            content: `[data-smooth="content"]`,
            normalizeScroll: true, effects: true,
        });
    };
    isTop && setTimeout(() => smoother ? smoother.scrollTo(0) : window.scrollTo( 0, 0 ) , 0)
};
