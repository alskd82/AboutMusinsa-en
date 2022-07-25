import barba from '@barba/core';
import imagesLoaded from "imagesloaded"

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother, SplitText);

import BezierEasing from "./class/BezierEasing";

import { 
    scrollIntoView, ease, 
    BillboardText, StaggerMotion, ShopNow, LoadFromOurNews,
    smoother, createSmoother 
} from "./page/common";

import { Navi, Footer , forScrollVariable_Reset, navShowHide, nav } from "./page/nav";
import { HomeInit, HomeST } from "./page/page_home"
import { OurStroy, AboutInit, AboutST } from "./page/page_about.js"
import { Service } from "./page/page_service.js";
import { Partners } from "./page/page_partners"
import Newsroom from "./page/page_newsroom"

let nameSpace;              //namesapce = "home"| "history" | "imapact" | "service" | "partners" | "newsroom"
let ourstoryIndi;           // ourstory 하단 인디게이터
let FromOurNews             // HOME & History & Impact 화면에 보여줄 뉴스룸 콘텐츠

//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded', e=>{
    console.log( 'DOMContentLoaded' );
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

})


//===============================================================================================================================
/*===== 로드  ======================*/
//===============================================================================================================================

const loadDimAnimation=( isClipPath , callback )=>{ // 페이지 트랜지션 //
    if(isClipPath){
        gsap.set( '.load-dim', { transformOrigin: `right center`})
        gsap.fromTo( '.load-dim', {
            scaleX: 1
        },{
            scaleX: 0,
            duration: 0.8,
            ease: BezierEasing(0.6,0,0.1,1),
            onComplete:()=> {if(callback) callback()}
        })
    } else {
        gsap.fromTo( '.load-dim', {
            autoAlpha: 1
        },{
            autoAlpha: 0,
            duration: 0.7, 
            ease: 'Cubic.easeInOut',
            onComplete:()=> {if(callback) callback()}
        })
    }
}

const load =()=>{
    /* body 에 .load-before 가 있으면 빌보드영역만 로드, 아니면 전체 이미지 로드 */
    // document.body.classList.contains('load-before') ? sourceLoad('.section-billboard') : sourceLoad('.body-black');
    /* 빌보드 영역만 먼저 로드하고 끝나면 화면 보이게 => 이후 전체이미지 로드 */
    if(nameSpace === "home"){ // HOME
        const poster = new Image();
        poster.src = document.querySelector('video').getAttribute('poster');
        poster.onload =()=>{
            gsap.delayedCall(.4 ,function(){
                loadingComplete();
                document.querySelector('video').play();
                imageLoad('.body-black');
            }) 
        }
    } else if(nameSpace === "newsroom") {   // Newsroom
        loadingComplete()
        imageLoad('.body-black');
    } else if(nameSpace === "partners"){    // Partners

        ( async()=>{
            await Partners.fetchPage()
            await Partners.createBrand()
            
            Partners.aladinoSetting()
            Partners.preloadImg( loadingComplete )
            // loadingComplete()
        //     // imageLoad('.body-black');
        })()
    
    } else {                                // History | Impact | Servce
        imageLoad('.section-billboard' , { 
            complete: gsap.delayedCall(.4, function(){
                loadingComplete()
                imageLoad('.body-black');
            }) 
        });
    } 

    // loadingComplete()
    if(nameSpace != 'partners') Partners.headerChange(false)
}

const loadingComplete =()=> {
    console.log( "loadingComplete" );
    
    if(document.body.classList.contains('before-load')){ // --------- 첫 접속 : 네비게이션 등장
        document.body.classList.remove('before-load');
        document.body.classList.add('loaded');
        setTimeout(() =>  document.body.classList.remove('loaded') , 3000);

        const href = location.href;   // ---------------------------------------------------- href 에 # 이 있으면 포커싱 ( Barba 가 아닌 페이지에서 왔을 때 )
        if(href.indexOf('#') != -1){
            setTimeout(() => {
                goToFocus( href.substring( href .indexOf('#') ) , 1 )     
            }, 850);
        }

        (nameSpace === "newsroom" || nameSpace === "partners" ) ? loadDimAnimation(false) : loadDimAnimation(true)
    } 
    else {
        (nameSpace === "newsroom" || nameSpace === "partners" ) ? loadDimAnimation(false) : loadDimAnimation(true, pageTransitionComplete)
        // pageTransitionComplete : 포커싱 이동을 해야하는지 여부 판단 
    }

    document.querySelector('.loading').classList.remove('before-load');
    document.querySelector('div.billboard_img') && (function(){
        gsap.fromTo( 'div.billboard_img', {scale: 1.3 } ,{scale: 1 ,ease: BezierEasing(0.6,0,0.1,1), duration: 2.5, delay: 0.3})
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
    document.querySelector('.section-nav').classList.remove('is-blured');
    
    forScrollVariable_Reset();       // 네비게이션 잠금 해제, 풋터 안보이는 상태임을 암시 

    document.querySelector('.loading').classList.add('before-load');
}

const pageBeforeEnter =()=>{
    nameSpace = document.querySelector(`[data-barba="container"]`).dataset.barbaNamespace;
    console.log(`beforeEnter: ${nameSpace}`)

    nameSpace === "history" | nameSpace === "impact" ? Navi.naviActive("about") : Navi.naviActive(nameSpace); // 현재 페이지 네비 강제활성화
    // if(nameSpace === "home")             Navi.naviActive(nameSpace)
    // else if(nameSpace === "history")     Navi.naviActive(1)
    // else if(nameSpace === "impact")      Navi.naviActive(1)
    // else if(nameSpace === "service")     Navi.naviActive(2)
    // else if(nameSpace === "partners")    Navi.naviActive(3)
    // else if(nameSpace === "newsroom")    Navi.naviActive(4)

    ScrollTrigger.getAll().forEach((st,i)=> st.kill() );
    
    createSmoother(true);

    BillboardText.init(nameSpace);
    // // StaggerMotion.init(); /* 웹폰트 불러오기 전에 셋팅하면 원치않는 줄바꿈 현상이 있음  -> pageEnter 에 넣었음 */
    ShopNow.init();
    
    HomeInit();
    AboutInit();
    Service.init(); 
    if( nameSpace === "service" ) Service.globalTitle(); // 로띠 실행

    Partners.init();

    Newsroom.init();

    Link.homeHistory();
    Link.homeService();

    if(nameSpace != "home"){
        FromOurNews = new LoadFromOurNews({id: nameSpace, src: "/fromournewsroom/from-our-newsroom/"})
    }

}

const pageEnter =()=>{
    console.log(`enter: ${nameSpace}`)
    // gsap.delayedCall( .5, BillboardText.play) // ------------------------------------------- 텍스트 모션 시작

    nameSpace === "history" ? ourstoryIndi.classList.remove('is-hide') : ourstoryIndi.classList.add('is-hide');

    if(nameSpace != "partners") Partners.canvasShow(false)

    gsap.delayedCall(0.5, ()=>{
        StaggerMotion.init(); /* 웹폰트 불러오기 전에 셋팅하면 원치않는 줄바꿈 현상이 있음 -> pageEnter 에 넣었음 */
        StaggerMotion.st();
        
        ShopNow.st();
        Footer.st();

        HomeST();
        AboutST();
        Service.st();
        ScrollTrigger.refresh(true)
    })

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

                once: ({next}) => nameSpace = next.namespace,
                beforeLeave:({current}) => pageBeforeLeave(),

                /* Leave Animation */ // ------------------------------------------------------------------- 페이지 딤
                leave(data) {
                    console.log(`leave: ${nameSpace}`)
                    gsap.set( '.load-dim', {scale:1, autoAlpha: 0 })
                    return gsap.to( '.load-dim', {autoAlpha: 1, duration: .7, ease: ease.standard} ) 
                },
                beforeEnter({current, next}){
                    if(current.container) current.container.remove();
                    pageBeforeEnter();
                },

                /* Enter Animation */
                enter(data){   
                    pageEnter();
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
                focusInPage = null;
                if(!e.currentTarget.classList.contains('stop-barba')) e.preventDefault() 
            });
        });

        smnArr.forEach( (smn,i) =>{
            
            // if( smn.getAttribute('data-focus') ) {  // -------------------------------------------------------- smn URL 추가하기( 뉴스룸 상세페이지에만 추가할 것 )
            //     smn.setAttribute('href', smn.getAttribute('href')+smn.getAttribute('data-focus'))
            // };

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

        gsap.utils.toArray(".history-slider_link").forEach((link, i)=>{  // ------------------------------------- 홈 : 어바웃 히스토리로 연결
            link.addEventListener('click', e =>{  
                e.preventDefault();
                const mn = e.currentTarget.parentNode;
                focusInPage = mn.dataset.num
                console.log( `history index: ${ mn.dataset.num }` );
            });
        })
    }

    const homeService=()=>{
        if(!document.querySelector('.section-history')) return;

        /*
        document.querySelectorAll('.home-service_link').forEach( el =>{
            el.addEventListener('click', e => {  // ------------------------------------------------------------- service > 포키싱 이동
                e.preventDefault();
                // console.log(e.currentTarget.tagName.toLowerCase())
                const url = document.querySelector('.nav_list > .nav_item:nth-child(3) a').href
                focusInPage = e.currentTarget.dataset.focus;
            });
        });
        */
        document.querySelectorAll('.home-service_img-wrap > a').forEach( el =>{
            el.addEventListener('click', e => { 
                e.preventDefault();
                // console.log(e.currentTarget.tagName.toLowerCase())
                focusInPage = e.currentTarget.dataset.focus;
            });
        });

        /*
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
        */
    
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
    document.querySelector(".section-nav").classList.add('is-blured');    
    const opts ={
        duration: time, ease: ease.material,
        onUpdate:()=> nav.isNavShowHideBlock(true) ,
        onComplete: ()=> gsap.delayedCall( .5 , forScrollVariable_Reset )
    }

    /*
    if(smoother) gsap.to(smoother, { scrollTop: smoother.offset(id, "top top"), ...opts });
    else         gsap.to(window, { scrollTo: id, ...opts });
    */
    /* smoother.offset 을 쓰면 도큐멘트 사이즈보다 더 올라가는 현상이 있음 */
    gsap.to(window, { scrollTo: {y: id, offsetY: 100}, ...opts });
}

