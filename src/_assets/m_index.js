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
import { scrollIntoView, ease } from "./js/common";
// import ImageOverlapChange from "./js/class/ImageOverlapChange"

import path_graph from "./global_graph_mo.json";

import Swiper from 'swiper';

//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded' , e=>{
    Navi.init();

    HomeGrowth.init()
    HomeGrowth.st()

    homeHistory.init()
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
    let pageY;

    const addEvent=()=>{
btMenu.addEventListener('click', e=>{
    // gsap.set( navWrap, { height: window.innerHeight });
    navWrap.classList.contains('is-active') ? navWrap.classList.remove('is-active') : navWrap.classList.add('is-active');

    if(!document.body.classList.contains('fixed')){
        pageY = window.pageYOffset;
        document.querySelector('.page-wrap').style.top = `-${pageY}px`;
        document.body.classList.add('fixed');
        
    } else {
        document.body.classList.remove('fixed');
        document.querySelector('.page-wrap').style.top = `-${0}px`;
        window.scrollTo(0, pageY);
    }
    
});
        
    }

    const init =()=>{
        addEvent();
    }

    exports.init = init;
    return exports;
})({});



//===============================================================================================================================
/*===== HOME : Growth  ======================*/
//===============================================================================================================================

const HomeGrowth = (function(exports){
    let sectionGrowth; 
    let lottieArea
    let graph;

    const lottie_Fn=(ele)=>{
        return lottie.loadAnimation({ 
            container: ele,  loop: false,  autoplay: false, 
            animationData: path_graph,
        })
    };

    const st =()=> {
        if(!sectionGrowth) return;

        ScrollTrigger.create({
            // markers: true, id: "graph",
            trigger: lottieArea,
            start: "50% 80%",
            onEnter: ()=> graph.play(),
        });
    }

    const init =()=>{
        sectionGrowth = document.querySelector('.m_section-growth');
        if(!sectionGrowth) return;
        
        lottieArea = document.querySelector('.m_growth_lottie-area');
        graph = lottie_Fn(lottieArea);
    };

    exports.st = st;
    exports.init = init;
    return exports;
})({});

//===============================================================================================================================
/*===== HOME : History  ======================*/
//===============================================================================================================================
const homeHistory = (function(exports){
    let sectionHistory;
    let swiper;

    const init=()=>{
        sectionHistory = document.querySelector('.m_section-history');
        if(!sectionHistory) return;
        // swiper = new Swiper('.swiper', { 
        //     spaceBetween: 0 ,
        //     observer: true,
        //     observeParents: true,
        //     slidesPerView : 'auto',
        // });

        document.querySelectorAll('.m_history-slider_link').forEach(ele =>{
            ele.addEventListener('click', e=> e.preventDefault())
            
        })
        sectionHistory.querySelectorAll(".m_history-slider_item").forEach((ele,i)=>{
            ele.dataset.num = i;
        })

        const snapX = []
        document.querySelectorAll('.swiper-slide').forEach( (slide,i) =>{
            let _x = (gsap.getProperty(slide, 'width')+8) * -i;
            if(_x )
            snapX.push( (gsap.getProperty(slide, 'width')+8) * -i )
        })

        Draggable.create(".m_section-history .swiper-wrapper", {
            type:"x",
            edgeResistance: 0.65,
            bounds: {
                minX: -gsap.getProperty('.swiper-slide', 'width') * (document.querySelectorAll('.swiper-slide').length) - 40,
                maxX: 0
            },
            snap: snapX,
            inertia: true,
            onDragEnd: function() {
                
                let xx = InertiaPlugin.getVelocity( ".m_section-history .swiper-wrapper", 'x')
                console.log("drag ended" , xx);
            }
        });

    }

    exports.init = init;
    return exports;
})({})


//===============================================================================================================================
/*===== HOME :   ======================*/
//===============================================================================================================================