import barba from '@barba/core';
import imagesLoaded from "imagesloaded"

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother, SplitText);

import BezierEasing from "./js/class/BezierEasing.js";

import LoadFromOurNews from "./js/class/LoadFromOurNews.js"
import { Navi, Footer , forScrollVariable_Reset, navShowHide, nav } from "./js/nav.js"

import { scrollIntoView, ease, BillboardText, StaggerMotion, ShopNow, smoother, createSmoother } from "./js/common.js";

import { HomeInit, HomeST } from "./js/page_home.js"
import { OurStroy, AboutInit, AboutST } from "./js/page_about.js"
import { Service } from "./js/page_service.js"
import Newsroom from "./js/page_newsroom"

let nameSpace;              //namesapce = "home"| "history" | "imapact" | "service"
let ourstoryIndi;           // ourstory 하단 인디게이터
let FromOurNews             // 각 화면에 보여줄 뉴스룸 콘텐츠





//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================
document.addEventListener('DOMContentLoaded', e =>{
    console.log("DOMContentLoaded");
    if( !document.querySelector("[data-barba]") ) return;

    barbaInit();

    ourstoryIndi = document.querySelector('.ourstory-indi');
    const ourstoryIndiLeft =()=> gsap.set( ".ourstory-indi_border", { width: (document.body.offsetWidth - 1440) / 2})
    ourstoryIndiLeft()
    window.addEventListener('resize' , e=> ourstoryIndiLeft())

    Link.navi()
    Navi.init();
    OurStroy.addEvent();

    pageBeforeLeave();
    pageBeforeEnter();
    pageEnter();

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
/*===== 로드  ======================*/
//===============================================================================================================================

// console.log( document.querySelector('circle').getTotalLength() )

const load =()=>{
    /* body 에 .load-before 가 있으면 빌보드영역만 로드, 아니면 전체 이미지 로드 */
    // document.body.classList.contains('load-before') ? sourceLoad('.section-billboard') : sourceLoad('.body-black');

    /* 빌보드 영역만 먼저 로드하고 끝나면 화면 보이게 => 이후 전체이미지 로드 */
    if(nameSpace === "home"){
        const poster = new Image()
        poster.src = document.querySelector('video').getAttribute('poster');
        poster.onload =()=>{
            gsap.delayedCall(.2 ,function(){
                loadingComplete();
                document.querySelector('video').play();
            }) 
        }
        
        imageLoad('.body-black');

    } else if(nameSpace != "newsroom"){
        imageLoad('.section-billboard' , { complete: gsap.delayedCall(.2,loadingComplete) })
        imageLoad('.body-black');

    } else {
        loadingComplete()
        imageLoad('.body-black');
    }
}

const loadingComplete =()=> {
    console.log( "loadingComplete" );
    
    if(document.body.classList.contains('before-load')){
        document.body.classList.remove('before-load');
        document.body.classList.add('loaded');
        setTimeout(() =>  document.body.classList.remove('loaded') , 3000);
    } 
    else {
        if(nameSpace === "newsroom"){
            gsap.to( "[data-barba-namespace]", { opacity: 1 , duration: 0.7, ease: 'Cubic.easeInOut', });
        }
        else {
            gsap.to( "[data-barba-namespace]", { opacity: 1 , duration: .1 });
            gsap.fromTo( '.page-wrap',{
                clipPath: `polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)`
            },{
                clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
                duration: .8,
                ease: BezierEasing(0.6,0,0.1,1),
                onComplete: pageTransitionComplete
            })
        }
    }


    document.querySelector('.loading').classList.remove('before-load');
    document.querySelector('div.m_billboard_img') && (function(){
        gsap.fromTo( 'div.m_billboard_img', {scale: 1 } ,{scale: 1.12 ,ease: BezierEasing(0.6,0,0.1,1), duration: 2.5, delay: 0.3})
    })()

    gsap.delayedCall( 1.5, BillboardText.play) // ------------------------------------------- 텍스트 모션 시작
    ScrollTrigger.refresh(true)
}


const imageLoad =( selector, opt={ onComplete: undefined }) =>{
    let imgCount = 0;

    const loader = imagesLoaded( selector, { background: '.is-back' })
    loader.on( 'always', function( instance ) {
        loader.images.forEach( (img, i)=>{
            const result = img.isLoaded ? "loaded" : "broken";
            // console.log( 'image is ' + result + ' for ' + img.img.src  );
            imgCount++;
            if( imgCount === loader.images.length && typeof(opt.onComplete)=== "function" ) opt.onComplete();
        })
    })
};


//===============================================================================================================================
/*===== 페이지 이동 시 발생  ======================*/
//===============================================================================================================================
const pageBeforeLeave =()=>{
    if(nameSpace) console.log(`beforeLeave: ${nameSpace}`)
    
    ourstoryIndi.classList.remove('is-active');
    document.body.classList.remove("is-blue");
    document.querySelector('.section-nav').classList.remove('is-blured')

    forScrollVariable_Reset(); // 네비게이션 잠금 해제, 풋터 안보이는 상태임을 암시 

    document.querySelector('.loading').classList.add('before-load');
}

const pageBeforeEnter =()=>{
    nameSpace = document.querySelector(`[data-barba="container"]`).dataset.barbaNamespace;
    console.log(`beforeEnter: ${nameSpace}`)

    if(nameSpace === "home")             Navi.naviActive(0)
    else if(nameSpace === "history")     Navi.naviActive(1)
    else if(nameSpace === "impact")      Navi.naviActive(1)
    else if(nameSpace === "service")     Navi.naviActive(2)
    else if(nameSpace === "newsroom")    Navi.naviActive(3)

    ScrollTrigger.getAll().forEach((st,i)=> st.kill() );
    
    createSmoother(true);

    BillboardText.init(nameSpace);
    StaggerMotion.init();
    ShopNow.init();

    HomeInit();
    AboutInit();
    Service.init();
    Newsroom.init();

    Link.homeHistory();
    Link.homeService();

    FromOurNews = new LoadFromOurNews({id: nameSpace, src: "/fromournewsroom/from-our-newsroom/"})
}

const pageEnter =()=>{
    console.log(`enter: ${nameSpace}`)

    // gsap.delayedCall( .5, BillboardText.play) // ------------------------------------------- 텍스트 모션 시작

    setTimeout(() =>{
        StaggerMotion.st();
        ShopNow.st();
        Footer.st();

        HomeST();
        AboutST();
        Service.st()
    
        ScrollTrigger.refresh(true)
    }, 500);

    nameSpace === "history" ? ourstoryIndi.classList.remove('is-hide') : ourstoryIndi.classList.add('is-hide');

    load();
}

const pageTransitionComplete =()=>{
    // ScrollTrigger.refresh(true)

    /* 포커싱 이동이 있다면... */
    if(nameSpace === "history"){
        if(!focusInPage) return
        goToFocus( document.querySelectorAll('.ourstory_cms-item')[focusInPage] , 1 )
        focusInPage = null;
    }
    else if(nameSpace === "service"){
        if(!focusInPage) return;
        goToFocus( focusInPage , 1 )
        focusInPage = null;
    }
}

//===============================================================================================================================
/*===== Barbar ======================*/
//===============================================================================================================================

const barbaInit =()=> {

    barba.init({
        prevent: data => data.el.classList.contains('stop-barba'),  //특정 클래스가 있을 경우 barba 중지
        // debug: true,
        timeout: 5000,

        transitions: [
            {
                name: "default-transition",
                once({next}){
                    nameSpace = next.namespace;
                    console.log(`barbr once: ${nameSpace} enter`);
                },
                
                beforeLeave:({current}) => pageBeforeLeave(),

                /* Leave Animation */
                leave(data) {
                    console.log(`leave: ${nameSpace}`)
                    return gsap.to( data.current.container, {opacity: 0, duration: 1, ease: ease.standard} )
                },
                beforeEnter({current, next}){
                    if(current.container) current.container.remove();
                    pageBeforeEnter();
                },

                // /* Enter Animation */
                enter(data){   
                    pageEnter();                
                    gsap.set( data.next.container, { opacity: 0 } );
                    // gsap.fromTo( data.next.container, {opacity: 0}, {opacity: 1, duration: 1, ease: ease.standard , onComplete: pageTransitionComplete} )
                },


            }
        ]
    });

}



//===============================================================================================================================
/*===== 링크 이동  ======================*/
//===============================================================================================================================
let focusInPage;        // 포커스 이동을 위해

const Link = (function(exports){
    const mnArr = document.querySelectorAll('.nav_link');               // 원뎁스 메뉴들 a 태그들
    const smnArr = document.querySelectorAll('.nav_smn-link')           // 투뎁스 메뉴들 a 태그들

    let sectionHistory
        
    const navi =()=>{
        mnArr.forEach( (mn,i)=>{
            mn.addEventListener('click', e => {  // ----------------------------------------------------------- mn 페이지 이동
                // if( e.currentTarget.dataset.num === "3" ) return
                focusInPage = null
                e.preventDefault() 
            });
        });

        smnArr.forEach( (smn,i) =>{
            smn.addEventListener('click', e => {    // -------------------------------------------------------- smn 페이지 이동
                // // if( e.currentTarget.dataset.target === "3" ) return
                e.preventDefault();
                focusInPage = e.currentTarget.dataset.focus;

                if(document.querySelector(focusInPage) ){ // --------------------------------------------------- 포커싱 이동
                    goToFocus(focusInPage, 1); 
                };

                // /* 투뎁스 숨기려면 */
                // // if(nowPageName != 'service'){
                // //     isSmnEnter = false;
                // //     smnHide();
                // // };
            });
        });
    };

    const homeHistory=()=>{
        sectionHistory = document.querySelector('.section-history');
        if(!sectionHistory) return;

        gsap.utils.toArray(".history-slider_link").forEach((link, i)=>{  // ------------------------------------------------------------------ 홈 : 어바웃 히스토리로 연결
            link.addEventListener('click', e =>{  
                e.preventDefault();
                const mn = e.currentTarget.parentNode;
                focusInPage = mn.dataset.num
                console.log( `history index: ${ mn.dataset.num }` );
            });
        })
    }

    const homeService=()=>{
        if(!document.querySelector('.home-service_img')) return;

        document.querySelectorAll('.home-service_img').forEach( el =>{
            el.addEventListener('click', e => {  // ------------------------------------------------------------- service > 포키싱 이동
                e.preventDefault();
                // console.log(e.currentTarget.tagName.toLowerCase())
                const url = document.querySelector('.nav_list > .nav_item:nth-child(3) a').href
                focusInPage = e.currentTarget.dataset.focus;
            });
        });

        document.querySelector('.home-service_list').addEventListener('click', e =>{
            if(!e.target.classList.contains('home-service_item')) return;            
            if(smoother){
                gsap.to(smoother, {
                    scrollTop: smoother.offset('.home-service_img-wrap', "center center"),
                    duration: .7,
                    ease: ease.standard
                })
            }
        });
    
    }


    exports.navi = navi;
    exports.homeHistory = homeHistory;
    exports.homeService = homeService;
    return exports;
})({});



//===============================================================================================================================
/*===== 포커싱 이동  ======================*/
//===============================================================================================================================
const  goToFocus =(id, time)=>{
    console.log( `focusInPage: ${id}`);

    gsap.killTweensOf( forScrollVariable_Reset );
    nav.isNavShowHideBlock(true); 
    document.querySelector(".section-nav").classList.add('is-blured')    
    const opts ={
        duration: time, ease: ease.material,
        onUpdate:()=> nav.isNavShowHideBlock(true) ,
        onComplete: ()=> gsap.delayedCall( .5 , forScrollVariable_Reset )
    }

    if(smoother){
        gsap.to(smoother, { scrollTop: smoother.offset(id, "top top"), ...opts });
    } else {
        gsap.to(window, { scrollTo: id, ...opts });
    }
}


