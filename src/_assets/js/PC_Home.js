import path_graph from "../global_graph_pc.json";

import BezierEasing from "./class/BezierEasing.js";
import { TextSplitWordsShow, TextSlitLinesMasking } from './class/TextMotion.js';
import { getRelativePosition, ease, scrollIntoView } from "./utils";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText);

// import {smoother} from "../index.js"

//===============================================================================================================================
/*=====  Home : Growth ======================*/
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
        sectionGrowth = document.querySelector('.section-growth');
        if(!sectionGrowth) return;
        
        lottieArea = document.querySelector('.growth_lottie-area');
        graph = lottie_Fn(lottieArea);
    };

    exports.st = st;
    exports.init = init;
    return exports;
})({});


//===============================================================================================================================
/*=====  Home : Count ======================*/
//===============================================================================================================================
const HomeCount = (function(exports){
    let sectionCount;
    let textmasking =[]
    let number = []
    let odo = []

    const odometer=()=>{
        number = [];
        odo = [];
        document.querySelectorAll(".count_txt-num.is-num").forEach((num,i)=>{
            number.push( parseInt(num.innerHTML) )
            num.innerHTML = "";
            odo.push( new Odometer({ el: num }))
        });
    }

    const textMasking =()=> {
        textmasking =[]
        document.querySelectorAll('.count_txt-desc').forEach((desc, i)=>{
            textmasking.push(
                new TextSlitLinesMasking({
                    splitText: new SplitText(desc, { type: "lines,words,chars", linesClass: "is-overflow-hidden" }),
                    y: 60,
                })
            );
        });

    }

    const st=()=>{
        if(!sectionCount) return;

        ScrollTrigger.create({
            // markers: true, id: "count",
            trigger: ".count_wrap",
            start: `top 70%`,
            onEnter:()=>{
                textmasking.forEach(txt => txt.play("lines"))
                gsap.to( sectionCount.querySelector('.system20-r'),{ duration: 1, ease: "Quart.easeInOut", autoAlpha: 1 })
                gsap.to( ".count_txt-num:not(.is-num)",{ duration: 1, ease: "Quart.easeInOut", autoAlpha: 1 })

                gsap.to( ".count_txt-num.is-num",{ duration: .5, ease: "Quart.easeInOut", autoAlpha: 1 })
                document.querySelectorAll(".count_txt-num.is-num").forEach((num,i)=> num.innerHTML = number[i] );

            },
            once: true,
        })
    }

    const init =()=>{
        sectionCount = document.querySelector('.section-count');
        if(!sectionCount) return;

        gsap.set( ".count_txt-num", {autoAlpha: 0} )
        gsap.set( sectionCount.querySelector('.system20-r'),{autoAlpha: 0})

        textMasking();
        odometer();
    }

    exports.st = st;
    exports.init = init;
    return exports;
})({});


//===============================================================================================================================
/*=====  Home : History ======================*/
//===============================================================================================================================
const HomeHistory = (function(exports){
    let sectionHistory;
    let list;
    let items;
    let links;
    let scrollTween;
    let itemsWidth; // 연혁 하나당 넓이

    let itemTitles = []

    const addEvent=()=>{
        itemTitles = [];
        links.forEach((link, i)=>{
            itemTitles.push(
                new TextSlitLinesMasking({
                    splitText: new SplitText( link.querySelector('.history_slider-title'), { 
                        type: "lines,words,chars", linesClass: "is-overflow-hidden" 
                    }),
                    duration: .4,
                    delay: .3,
                    ease: 'Quart.easeOut',
                    staggerTime: .1,
                    lineDelay: 0,       // 라인 순차 애니메이션 때, 라인별 딜레이
                    gapTime: 0,
                    x: 0, y: 80,
                }) 
            );

            link.addEventListener('mouseover', e =>{
                const parent = e.currentTarget.parentNode;
                itemTitles[parent.dataset.num].reset();
                itemTitles[parent.dataset.num].play("lines")
            });

            // link.addEventListener('mouseout', e =>{
            //     const parent = e.currentTarget.parentNode;
            // });

        })
        
    }

    const showCMSItems =()=> {
        gsap.utils.toArray('.history-slider_item').forEach((item,i)=>{
            // if( i < 3) return
            // gsap.set(item.children[0], { x: 80, autoAlpha: 0 })
            gsap.to( item.children[0], {
                ...scrollIntoView,
                scrollTrigger: {
                    // markers: true, id:"a",
                    trigger: item,
                    containerAnimation: scrollTween,
                    start: `left 90%`,
                    // onEnter: (self)=> self.kill(),
                }
            })
        })
    }

    const st=()=>{
        if(!sectionHistory) return;

        /* 가로로 이동하는 트리거 */
        scrollTween = gsap.to( list, { //items 로 설정하면 xPercent: -100 * (items.length-1) 로 제작
            // xPercent: -100 * (items.length-1),
            x: -(itemsWidth*items.length) + 1120, //+ 1360,
            ease: "none",
            scrollTrigger: {
                // markers: true, id: "history-pin",
                trigger: sectionHistory, //".history-slider_list",
                start: `${getRelativePosition(sectionHistory, list).y + gsap.getProperty(list, 'height')/2 - gsap.getProperty( sectionHistory.querySelector('[data-stagger-y]') , 'y') } center`,
                end: `+=${(items.length) * gsap.getProperty('.history-slider_item', 'width')}`,
                pin: true,
                scrub: .1,
            }
        });

        // console.log(gsap.getProperty( sectionHistory.querySelector('[data-stagger-y]') , 'y') )
        
        showCMSItems()  // cms items 각각 등장 트리거
    }

    const init =()=>{
        sectionHistory = document.querySelector('.section-history');
        if(!sectionHistory) return;
        list =  sectionHistory.querySelector('.history-slider_list');
        items = gsap.utils.toArray(".history-slider_item");
        items.forEach((item, i)=> item.dataset.num = i );
        links = gsap.utils.toArray(".history-slider_link");

        itemsWidth = gsap.getProperty(".history-slider_item", 'width') + gsap.getProperty(".history-slider_item", 'margin-right');
        gsap.set(list,{ width: itemsWidth * items.length});


        gsap.utils.toArray('.history-slider_item').forEach((item,i)=>{ // cms items 각각 등장 위해
            if( i < 2) return
            gsap.set(item.children[0], { x: 120, autoAlpha: 0 })
        })
        
        // showCMSItems()  // cms items 각각 등장 트리거
        
        addEvent();
    };

    exports.st = st;
    exports.init = init;
    return exports
})({})

//===============================================================================================================================
/*=====  Home Service ======================*/
//===============================================================================================================================
const HomeService = (function(exports){
    let sectionService;
    let zIndexLevel;

    const selectMn=(n)=>{
        sectionService.querySelectorAll('.home-service_item').forEach((el) =>{
            if( el.dataset.num === n )  el.classList.add('is-active')
            else                        el.classList.remove('is-active')
        });

        sectionService.querySelectorAll('.home-service_img').forEach((ele) =>{
            if( ele.dataset.num === n ){
                // gsap.fromTo( ele , {zIndex: zIndexLevel++, width: '0%'}, {width: '100%', ease: ease.standard})
                gsap.fromTo( ele, { 
                    clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)", // "path('M0 -100, L0 1300, L1600 1300, L0 1300 Z')",
                    zIndex: zIndexLevel++
                }, {
                    duration: .5, ease: ease.standard,
                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", //"path('M0 -100, L0 1300, L1600 1300, L1600 0 Z')",
                })
            }
        });  
    }

    const addEvent=()=>{
        sectionService.querySelector('.home-service_list').addEventListener('click', e =>{
            if(!e.target.classList.contains('home-service_item')) return;
            selectMn(e.target.dataset.num);

            // if(smoother){
            //     gsap.to(smoother, {
            //         scrollTop: smoother.offset('.home-service_img-wrap', "center center"),
            //         duration: .7,
            //         ease: ease.standard
            //     })
            // }
        });
    };


    const st =()=>{
        if(!sectionService) return;

        ScrollTrigger.create({
            // markers: true, id: 'color',
            trigger: sectionService,
            start: `top 50%`, 
            end: `${gsap.getProperty(sectionService, 'height') - 120} center`,
            onEnter: () => document.body.classList.add('is-blue'),
            onLeave: () => document.body.classList.remove('is-blue'),
            onEnterBack: () => document.body.classList.add('is-blue'),
            onLeaveBack: () => document.body.classList.remove('is-blue'),
        });

        gsap.to('.home-service_wrap',{
            ...scrollIntoView,
            scrollTrigger:{
                // markers: true, id: 'service',
                trigger: sectionService.children[0],
                start: 'top 80%',
                onEnter: (self)=> self.kill(),
            }
        });
    }

    const init =()=>{
        sectionService = document.querySelector('.section-service');
        if(!sectionService) return;

        zIndexLevel = 1;
        addEvent();
        selectMn("0");

        gsap.set('.home-service_wrap', {y: 150, autoAlpha: 0})
        
    };

    exports.st = st;
    exports.init = init;
    return exports;
})({});


const HomeInit =()=>{
    HomeGrowth.init();
    HomeCount.init();
    HomeHistory.init(); HomeHistory.st();
    HomeService.init();
}

const HomeST =()=>{
    HomeGrowth.st();
    HomeCount.st();
    // HomeHistory.st();
    HomeService.st();
}

export {
    HomeInit,
    HomeST,
}