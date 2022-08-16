// import BezierEasing from "./class/BezierEasing.js";
// import { TextSplitWordsShow, TextSlitLinesMasking } from './class/TextMotion.js';
import path_global_title from "../../lottie_path/global_title.json"

import { 
    ease, 
    scrollIntoView ,
} from "./common";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger );


//===============================================================================================================================
/*=====  Service   ======================*/
//===============================================================================================================================
const Service = (function(exports){
    let serviceList; 
    let mockups;
    let title_blank;
    
    const scrollTrigger_mockup =()=> {
        document.querySelectorAll('.service_list-grid').forEach( (ele, i)=>{        
            ScrollTrigger.batch(ele, {
                // markers: true, id: "mockup",
                start: `top top`,
                end: `bottom ${762 + 120 + 120}`, // 목업크기 + 상하마진 
                pin: mockups[i],
            })
        })
    };

    const scrollTrigger_btn =()=> {
        document.querySelectorAll('.btn-shopnow').forEach( (ele, i)=>{
            gsap.set( ele, { x: -40, autoAlpha: 0 })
            gsap.to( ele,{
                ...scrollIntoView,
                delay: 0.5,
                scrollTrigger:{
                    // markers: true, id: "btn",
                    trigger: ele, 
                    start: `top 80%`,
                    once: true,
                }
            });

        })
    };

    const st =()=>{
        scrollTrigger_mockup()
        scrollTrigger_btn()
    };

    /* 레이지나잇 앱스트어-플레이스토어 링크 분기 */
    const addEvent =()=>{
        /* iOS - AOS 구분 */
        let appDownLink;
        const varUA = navigator.userAgent.toLowerCase();
        console.log(varUA)
        if ( varUA.indexOf('android') > -1) {  //안드로이드
            // appDownLink = 'https://play.google.com/store/apps/details?id=kr.lazynight.android'
            appDownLink = document.querySelector('#Lazynight a').dataset.aos
        } else if ( varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 ||varUA.indexOf("ipod") > -1 ) { //IOS
            // appDownLink = 'https://apps.apple.com/kr/app/%EB%A0%88%EC%9D%B4%EC%A7%80%EB%82%98%EC%9E%87-%EC%97%AC%EC%84%B1-%ED%8C%A8%EC%85%98-%EC%98%A8%EB%9D%BC%EC%9D%B8-%ED%94%8C%EB%9E%AB%ED%8F%BC/id1617753012'
            appDownLink = document.querySelector('#Lazynight a').dataset.ios
        } else if(varUA.indexOf('mac') != -1){ // 맥
            // appDownLink = 'https://apps.apple.com/kr/app/%EB%A0%88%EC%9D%B4%EC%A7%80%EB%82%98%EC%9E%87-%EC%97%AC%EC%84%B1-%ED%8C%A8%EC%85%98-%EC%98%A8%EB%9D%BC%EC%9D%B8-%ED%94%8C%EB%9E%AB%ED%8F%BC/id1617753012'
            appDownLink = document.querySelector('#Lazynight a').dataset.ios
        } else {
            // appDownLink = 'https://play.google.com/store/apps/details?id=kr.lazynight.android'
            appDownLink = document.querySelector('#Lazynight a').dataset.aos
        }

        document.querySelector('#Lazynight a').setAttribute('href' , appDownLink);
    }

    /* global [ ] lottie motion */
    const globalTitle =()=>{
        const target = document.querySelector('.blank-motion');
        const title = document.querySelector('#Musinsa .h3-lottie');

        title_blank = lottie.loadAnimation({
            container: target,
            loop: true, autoplay: false,
            animationData: path_global_title
        });

        let rafId; 
        const titlePlay =()=>{
            if( gsap.getProperty(title, 'opacity') > 0.5 ){
                window.cancelAnimationFrame( rafId );
                title_blank.play()
            } else {
                rafId = window.requestAnimationFrame( titlePlay )
            }
        }
        rafId = window.requestAnimationFrame( titlePlay )
    }

    const init =()=>{
        serviceList = document.querySelector('.service_list-grid')
        if(!serviceList) return;
        mockups = document.querySelectorAll('.service_list_mockup');

        document.querySelectorAll('.btn-shopnow').forEach( (ele, i)=> gsap.set( ele, { x: -40, autoAlpha: 0 }) );
        // scrollTrigger_mockup();
        // scrollTrigger_btn();

        addEvent()

    };

    exports.st = st;
    exports.init = init;
    exports.addEvent = addEvent; // 모바일 버전을 위해 따로 exports 해줌
    exports.globalTitle = globalTitle; // 글로벌 blank 로띠 모션 실행을 위해

    return exports;
})({});


export { Service }