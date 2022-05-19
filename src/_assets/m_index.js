import barba from '@barba/core';
import imagesLoaded from "imagesloaded"

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(
    ScrollTrigger, ScrollToPlugin, ScrollSmoother, SplitText, 
    Draggable, InertiaPlugin,
);

import BezierEasing from "./js/class/BezierEasing.js";
import { scrollIntoView, ease, BillboardText, StaggerMotion, ShopNow } from "./js/common";
import LoadFromOurNews from "./js/class/LoadFromOurNews.js"
import { HomeInit, HomeST } from "./js/page_home"

// import ImageOverlapChange from "./js/class/ImageOverlapChange"

import path_graph from "./global_graph_mo.json";
import Swiper from 'swiper';


let nameSpace;              //namesapce = "home"| "history" | "imapact" | "service"
let FromOurNews             // 각 화면에 보여줄 뉴스룸 콘텐츠

//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded' , e=>{
    console.log("DOMContentLoaded");
    if( !document.querySelector("[data-barba]") ) return;

    barbaInit();

    Link.navi();
    Navi.init();

    pageBeforeLeave();
    pageBeforeEnter();
    pageEnter();

    ScrollTrigger.config({ 
        limitCallbacks: true,
        ignoreMobileResize: true
    })
})


//===============================================================================================================================
/*===== 로드  ======================*/
//===============================================================================================================================
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
        imageLoad('.m_section-billboard' , { complete: gsap.delayedCall(.2,loadingComplete) })
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

    document.querySelector('.loading').classList.remove('before-load');
    document.querySelector('div.m_billboard_img') && (function(){
        gsap.fromTo( 'div.m_billboard_img', {scale: 1 } ,{scale: 1.15 ,ease: BezierEasing(0.6,0,0.1,1), duration: 2.0, delay: 0.2})
    })()

    gsap.delayedCall( 1, function(){ // ------------------------------------------------------------ 텍스트 모션 시작
        BillboardText.play()
        setTimeout(() => document.querySelector(".m_arrow-bottom").classList.add('is-active'), 1000);
    }) 
    
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
    if(nameSpace) console.log(`beforeLeave: ${nameSpace}`);

    // Navi.naviClose(true);
    Navi.naviClose();

    document.body.classList.remove("is-blue");
    document.querySelector('.loading').classList.add('before-load');   
}

const pageBeforeEnter =()=>{
    nameSpace = document.querySelector(`[data-barba="container"]`).dataset.barbaNamespace;
    console.log(`beforeEnter: ${nameSpace}`);

    if(nameSpace === "home")             Navi.naviActive(0)
    else if(nameSpace === "history")     Navi.naviActive(1)
    else if(nameSpace === "impact")      Navi.naviActive(1)
    else if(nameSpace === "service")     Navi.naviActive(2)
    else if(nameSpace === "newsroom")    Navi.naviActive(3)

    ScrollTrigger.getAll().forEach((st,i)=> st.kill() );
    setTimeout(() => { window.scrollTo(0,0) }, 150);

    BillboardText.init(nameSpace);
    StaggerMotion.init();
    ShopNow.init();

    HomeInit();

    Link.homeHistory();
    Link.homeService();
    FromOurNews = new LoadFromOurNews({id: nameSpace, isDesktop: false })
}

const pageEnter =()=>{
    console.log(`enter: ${nameSpace}`)

    setTimeout(() =>{
        StaggerMotion.st();
        ShopNow.st();

        HomeST();
    
        ScrollTrigger.refresh(true)
    }, 500);

    load()

    const arrow = document.querySelector(".m_arrow-bottom");
    arrow && document.querySelector(".m_arrow-bottom").addEventListener('click', e=>{
        gsap.to( window, {scrollTo: window.innerHeight, ease: ease.material, duration: 0.8 })
    })
}
const pageTransitionComplete =()=>{
    /* 포커싱 이동이 있다면... */
    if(nameSpace === "history"){
        if(!focusInPage) return
        console.log(focusInPage)
        // goToFocus( document.querySelectorAll('.ourstory_cms-item')[focusInPage] , 1 )
        focusInPage = null;
    }
    else if(nameSpace === "service"){
        if(!focusInPage) return;
        console.log(focusInPage)
        // goToFocus( focusInPage , 1 )
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
                    return gsap.to( data.current.container, {opacity: 0, duration: 0.6, ease: ease.standard} )
                },
                beforeEnter({current, next}){
                    if(current.container) current.container.remove();
                    pageBeforeEnter();
                },

                // /* Enter Animation */
                enter(data){   
                    pageEnter();                
                    // gsap.set( data.next.container, { opacity: 0 } );
                    gsap.fromTo( data.next.container, {opacity: 0}, {opacity: 1, duration: 1, delay:.15, ease: ease.standard , onComplete: pageTransitionComplete} )
                },


            }
        ]
    });

}


//===============================================================================================================================
/*===== 네비게이션  ======================*/
//===============================================================================================================================
const Navi = (function(exports){
    const btMenu = document.querySelector('.m_ham');
    const navWrap = document.querySelector('.m_nav-wrap');
    let pageY;

    const naviOpen =()=>{
        pageY = window.pageYOffset;
        document.querySelector('.page-wrap').style.top = `-${pageY}px`;
        document.body.classList.add('fixed');

        navWrap.classList.add('is-active')
    }

    const naviClose =(isTop)=>{
        document.body.classList.remove('fixed');
        document.querySelector('.page-wrap').style.top = `-${0}px`;
    
        isTop ? window.scrollTo(0, 0) : window.scrollTo(0, pageY);
        
        navWrap.classList.remove('is-active')
    }

    const addEvent=()=>{
        btMenu.addEventListener('click', e=>{
            // gsap.set( navWrap, { height: window.innerHeight });
            !document.body.classList.contains('fixed') ? naviOpen(): naviClose()
        });
        
    }

    const naviActive=(n)=>{ 
        document.querySelectorAll('.m_nav-link').forEach((item,i)=>{
            if( i === n )   item.classList.add('is-active')
            else            item.classList.remove('is-active')
        })
        if( n === 1 && nameSpace === "history"){
            document.querySelectorAll('.m_nav-link_smn')[0].classList.add('is-active');
            document.querySelectorAll('.m_nav-link_smn')[1].classList.remove('is-active');
        } else if( n === 1 && nameSpace === "impact") {
            document.querySelectorAll('.m_nav-link_smn')[0].classList.remove('is-active');
            document.querySelectorAll('.m_nav-link_smn')[1].classList.add('is-active');
        } else{ 
            document.querySelectorAll('.m_nav-link_smn')[0].classList.remove('is-active');
            document.querySelectorAll('.m_nav-link_smn')[1].classList.remove('is-active');
        }; 
        
    }

    const init =()=>{
        addEvent();
    }

    exports.naviActive = naviActive;
    exports.naviOpen = naviOpen;
    exports.naviClose = naviClose;
    exports.init = init;
    return exports;
})({});



//===============================================================================================================================
/*===== 링크 이동  ======================*/
//===============================================================================================================================
let focusInPage;        // 포커스 이동을 위해

const Link = (function(exports){
    const mnArr = document.querySelectorAll('.m_nav-link');               // 원뎁스 메뉴들 a 태그들
    const smnArr = document.querySelectorAll('.m_nav-link_smn')           // 투뎁스 메뉴들 a 태그들

    let sectionHistory
        
    const navi =()=>{
        mnArr.forEach( (mn,i)=>{
            mn.addEventListener('click', e => {  // ----------------------------------------------------------- mn 페이지 이동
                // // if( e.currentTarget.dataset.num === "3" ) return
                focusInPage = null;
                Navi.naviClose();
                e.preventDefault(); 
            });
        });

        smnArr.forEach( (smn,i) =>{
            smn.addEventListener('click', e => {    // -------------------------------------------------------- smn 페이지 이동
                e.preventDefault();
                Navi.naviClose();
                // focusInPage = e.currentTarget.dataset.focus;
                // if(document.querySelector(focusInPage) ){ // --------------------------------------------------- 포커싱 이동
                //     goToFocus(focusInPage, 1); 
                // };
            });
        });
    };

    const homeHistory=()=>{
        sectionHistory = document.querySelector('.m_section-history');
        if(!sectionHistory) return;

        gsap.utils.toArray(".m_history-slider_link").forEach((link, i)=>{  // ------------------------------------------------------------------ 홈 : 어바웃 히스토리로 연결
            link.addEventListener('click', e =>{  
                e.preventDefault();
                // const mn = e.currentTarget.parentNode;
                // focusInPage = mn.dataset.num
                // console.log( `history index: ${ mn.dataset.num }` );
            });
        })
    }

    const homeService=()=>{
        if(!document.querySelector('.m_home-service_img')) return;

        document.querySelectorAll('.m_home-service_img').forEach( el =>{
            el.addEventListener('click', e => {  // ------------------------------------------------------------- service > 포키싱 이동
                e.preventDefault();
                // console.log(e.currentTarget.tagName.toLowerCase())
                // const url = document.querySelector('.nav_list > .nav_item:nth-child(3) a').href
                focusInPage = e.currentTarget.dataset.focus;
            });
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
const goToFocus =(id, time)=>{
    console.log( `focusInPage: ${id}`);

    // gsap.killTweensOf( forScrollVariable_Reset );
    // nav.isNavShowHideBlock(true); 
    // document.querySelector(".section-nav").classList.add('is-blured')    
    // const opts ={
    //     duration: time, ease: ease.material,
    //     onUpdate:()=> nav.isNavShowHideBlock(true) ,
    //     onComplete: ()=> gsap.delayedCall( .5 , forScrollVariable_Reset )
    // }

    // if(smoother){
    //     gsap.to(smoother, { scrollTop: smoother.offset(id, "top top"), ...opts });
    // } else {
    //     gsap.to(window, { scrollTo: id, ...opts });
    // }
}
