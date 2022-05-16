import barba from '@barba/core';
import imagesLoaded from "imagesloaded"

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother, SplitText);

import BezierEasing from "./js/class/BezierEasing.js";
import { scrollIntoView, ease } from "./js/utils.js";


//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded' , e=>{
    Navi.init()
})


//===============================================================================================================================
/*===== 로드  ======================*/
//===============================================================================================================================



//===============================================================================================================================
/*===== 페이지 이동 시 발생  ======================*/
//===============================================================================================================================



//===============================================================================================================================
/*===== 네비게이션  ======================*/
//===============================================================================================================================
const Navi = (function(exports){
    const btMenu = document.querySelector('.m_ham');
    const navWrap = document.querySelector('.m_nav-wrap');

    const addEvent=()=>{
        btMenu.addEventListener('click', e=>{
            navWrap.classList.contains('is-active') ? navWrap.classList.remove('is-active') : navWrap.classList.add('is-active')
        });
        
    }

    const init =()=>{
        addEvent();
    }

    exports.init = init;
    return exports;
})({});

