import barba from '@barba/core';
import imagesLoaded from "imagesloaded"

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(
    ScrollTrigger, ScrollToPlugin, SplitText, 
);

import BezierEasing from "./js/class/BezierEasing.js";
import { 
    scrollIntoView, ease, 
    BillboardText, StaggerMotion, ShopNow, LoadFromOurNews,
    FromOurNews_Mobile,
} from "./js/common";

import {Mobile_Navi} from "./js/nav"
import { HomeInit, HomeST } from "./js/page_home"
import { Service } from "./js/page_service"
import Newsroom from "./js/page_newsroom"


let nameSpace;              // namesapce = "home"| "history" | "imapact" | "service"
let FromOurNews             // HOME & History & Impact 화면에 보여줄 뉴스룸 콘텐츠

//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded' , e=>{
    console.log("DOMContentLoaded");
    if( !document.querySelector("[data-barba]") ) return;

    barbaInit();

    Link.navi();
    Mobile_Navi.init();
    footerDocument.init();

    pageBeforeLeave();
    pageBeforeEnter();
    pageEnter();

    ScrollTrigger.config({ 
        limitCallbacks: true,
        ignoreMobileResize: true
    });

})


//===============================================================================================================================
/*===== 로드  ======================*/
//===============================================================================================================================


const load =()=>{
    /* body 에 .load-before 가 있으면 빌보드영역만 로드, 아니면 전체 이미지 로드 */
    // document.body.classList.contains('load-before') ? sourceLoad('.section-billboard') : sourceLoad('.body-black');
    
    /* 빌보드 영역만 먼저 로드하고 끝나면 화면 보이게 => 이후 전체이미지 로드 */
    if(nameSpace === "home"){
        
        const canvas = document.querySelector('.m_section-billboard canvas');
        const video = document.querySelector('.m_section-billboard video');
        const ctx = canvas.getContext("2d");

        const drawCanvas=()=>{
            // if( !e.classList.contains("is-active") ) return
            canvas.width = video.videoWidth
            canvas.height = video.videoHeight
            ctx.drawImage(video, 0, 0, canvas.width , canvas.height );
            window.requestAnimationFrame(drawCanvas);
        }
        
        const play =()=>{
            loadingComplete();
            (function(){
                var promise = video.play();
                    if (promise !== undefined) {
                    promise.then(_ => {
                        // 자동재생 환경 //
                        drawCanvas();
                        video.play();
                        document.querySelector('.canvas-video').classList.add('is-active');
                    }).catch(error => {
                        // 자동재생 중지 환경 //
                    });
                }
            })()
            
        }

        imageLoad('.m_section-billboard' , { complete: gsap.delayedCall(.2, play) })
        imageLoad('.body-black');
        
        // const vid = document.querySelector('video')
        // const poster = new Image();
        // poster.src = vid.getAttribute('poster');
        // poster.onload =()=>{
        //     gsap.delayedCall(.2, loadingComplete )
        //     gsap.delayedCall( .8, ()=> vid.play() )
        // }

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

    gsap.fromTo( "[data-barba='container']", {opacity: 0}, {opacity: 1, duration: 1, delay:.15, ease: ease.standard } )
    focusInPage && (() => gsap.delayedCall( .8, pageTransitionComplete))()
    
    if(document.body.classList.contains('before-load')){
        document.body.classList.remove('before-load');
        document.body.classList.add('loaded');
        setTimeout(() =>  document.body.classList.remove('loaded') , 3000);
    } 

    document.querySelector('.loading').classList.remove('before-load');
    document.querySelector('div.billboard_img') && (function(){
        gsap.fromTo( 'div.billboard_img', {scale: 1.3  } ,{scale: 1 ,ease: BezierEasing(0.6,0,0.1,1), duration: 2.0, delay: 0})
    })()

    if(nameSpace != 'newsroom'){
        gsap.delayedCall( .85, function(){ // ------------------------------------------------------------ 텍스트 모션 시작
            BillboardText.play()
            setTimeout(() => document.querySelector(".m_arrow-bottom").classList.add('is-active'), 1000);
        }) 
    }
    
    // ScrollTrigger.refresh(true)
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
    });
};



//===============================================================================================================================
/*===== 페이지 이동 시 발생  ======================*/
//===============================================================================================================================
const pageBeforeLeave =()=>{
    if(nameSpace) console.log(`beforeLeave: ${nameSpace}`);

    ScrollTrigger.getAll().forEach((st,i)=> st.kill() );
    document.body.classList.remove("is-blue");
    document.querySelector('.loading').classList.add('before-load');   
}

const pageBeforeEnter =()=>{
    nameSpace = document.querySelector(`[data-barba="container"]`).dataset.barbaNamespace;
    // console.log(`beforeEnter: ${nameSpace}`);

    if(nameSpace === "home")             Mobile_Navi.naviActive(0, nameSpace)
    else if(nameSpace === "history")     Mobile_Navi.naviActive(1, nameSpace)
    else if(nameSpace === "impact")      Mobile_Navi.naviActive(1, nameSpace)
    else if(nameSpace === "service")     Mobile_Navi.naviActive(2, nameSpace)
    else if(nameSpace === "newsroom")    Mobile_Navi.naviActive(3, nameSpace)
    
    // setTimeout(() => smoother ? smoother.scrollTo(0) : window.scrollTo( 0, 0 ) , 0);
    setTimeout(() => window.scrollTo( 0, 0 ) , 400);

    BillboardText.init(nameSpace);
    StaggerMotion.init();
    ShopNow.init();
    FromOurNews_Mobile.init();

    HomeInit();
    if(nameSpace === "service") {
        Service.addEvent(); // lazynight 앱스트어-플레이스토어 분기를 위해
        Service.globalTitle(); // WHERE THE [] 로띠 모션 
    }

    Newsroom.init();

    Link.homeHistory();
    Link.homeService();

    if(nameSpace != 'home'){
        FromOurNews = new LoadFromOurNews({id: nameSpace, isDesktop: false, src: "/fromournewsroom/from-our-newsroom/" })
    };
}

const pageEnter =()=>{
    console.log(`enter: ${nameSpace}`)    

    gsap.delayedCall( 0.5, ()=>{
        StaggerMotion.st();
        ShopNow.st();

        HomeST();
        // ScrollTrigger.refresh(true)
    })
    footerDocument.addEvent();
    
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
        goToFocus( document.querySelectorAll('.m_ourstory_cms-item')[focusInPage] , 1 )
        focusInPage = null;
    }
    else if(nameSpace === "service"){
        if(!focusInPage) return;
        console.log(focusInPage)
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
                
                beforeLeave: ({current}) => pageBeforeLeave(),

                /* Leave Animation */
                leave(data) {
                    console.log(`leave: ${nameSpace}`)

                    const _time = focusInPage ? .5 : 0.2;
                    return gsap.to( data.current.container, { opacity: 0, duration: _time, ease: ease.standard });
                },
                beforeEnter({current, next}){
                    if(current.container) current.container.remove();
                    pageBeforeEnter();
                },

                // /* Enter Animation */
                enter(data){   
                    gsap.set( data.next.container, { opacity: 0 } );  
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
    const mnArr = document.querySelectorAll('.m_nav-link');               // 원뎁스 메뉴들 a 태그들
    const smnArr = document.querySelectorAll('.m_nav-link_smn')           // 투뎁스 메뉴들 a 태그들

    let sectionHistory
        
    const navi =()=>{
        mnArr.forEach( (mn,i)=>{
            mn.addEventListener('click', e => {  // ----------------------------------------------------------- mn 페이지 이동
                // // if( e.currentTarget.dataset.num === "3" ) return
                focusInPage = null;
                Mobile_Navi.naviClose();
                e.preventDefault(); 
            });
        });

        smnArr.forEach( (smn,i) =>{
            smn.addEventListener('click', e => {    // -------------------------------------------------------- smn 페이지 이동
                e.preventDefault();
                Mobile_Navi.naviClose();
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
                document.body.classList.remove("is-blue");

                const mn = e.currentTarget.parentNode;
                focusInPage = mn.dataset.num
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

                document.body.classList.remove('is-blue')
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
    gsap.to(window, { scrollTo: id, duration: time, ease: ease.material});
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
        ScrollTrigger.getById('shownow').disable(false)  
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
