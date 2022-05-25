import path_graph from "../lottie_path/global_graph_pc.json";
import path_graph_m from "../lottie_path/global_graph_mo.json";

import BezierEasing from "./class/BezierEasing.js";
import { TextSplitWordsShow, TextSlitLinesMasking } from './class/TextMotion.js';
import { getRelativePosition, ease, scrollIntoView } from "./common";
import DraggableSlider from "./class/DraggableSlider"

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin(ScrollTrigger, SplitText, );


//===============================================================================================================================
/*=====  Home : Growth ======================*/
//===============================================================================================================================
const HomeGrowth = (function(exports){
    let sectionGrowth; 
    let lottieArea
    let graph;
    let isDesktop;

    const lottie_Fn=(ele)=>{
        return lottie.loadAnimation({ 
            container: ele,  loop: false,  autoplay: false, 
            animationData: isDesktop ? path_graph: path_graph_m,
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
        if(!sectionGrowth) sectionGrowth = document.querySelector('.m_section-growth');
        if(!sectionGrowth) return;

        isDesktop = sectionGrowth === document.querySelector('.section-growth') ? true : false
        lottieArea = isDesktop ? document.querySelector('.growth_lottie-area') : document.querySelector('.m_growth_lottie-area')
        
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
    let odo = [];
    let isDesktop;

    const odometer=()=>{
        number = [];
        odo = [];
        const _countNumTxt = isDesktop ? '.count_txt-num.is-num' : '.m_count_txt-num.is-num';

        document.querySelectorAll( _countNumTxt ).forEach((num,i)=>{
            number.push( parseInt(num.innerHTML) )
            num.innerHTML = "";
            odo.push( new Odometer({ el: num }))
        });
    }

    const textMasking =()=> {
        textmasking =[]

        const _countDescArr = isDesktop ? '.count_txt-desc' : '.m_count_txt-desc';
        document.querySelectorAll( _countDescArr ).forEach((desc, i)=>{
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
        const _trigger = isDesktop ? ".count_wrap" : ".m_count_wrap";
        const _sysTxt = isDesktop ? sectionCount.querySelector('.system20-r') : sectionCount.querySelector('.m_system14-r');
        const _notNum = isDesktop ? ".count_txt-num:not(.is-num)" : ".m_count_txt-num:not(.is-num)";
        const _num = isDesktop ?  ".count_txt-num.is-num":  ".m_count_txt-num.is-num"
        const _numArr = isDesktop ? document.querySelectorAll(".count_txt-num.is-num") : document.querySelectorAll(".m_count_txt-num.is-num")


        ScrollTrigger.create({
            // markers: true, id: "count",
            trigger: _trigger,
            start: `top 70%`,
            onEnter:()=>{
                textmasking.forEach(txt => txt.play("lines"))
                gsap.to( _sysTxt ,{ duration: 1, ease: "Quart.easeInOut", autoAlpha: 1, delay:.2 })
                gsap.to( _notNum ,{ duration: 1, ease: "Quart.easeInOut", autoAlpha: 1 })

                gsap.to( _num,{ duration: .5, ease: "Quart.easeInOut", autoAlpha: 1 })
                _numArr.forEach((num,i)=> num.innerHTML = number[i] );

            },
            once: true,
        })
    }

    const init =()=>{
        sectionCount = document.querySelector('.section-count');
        if(!sectionCount) sectionCount = document.querySelector('.m_section-count');
        if(!sectionCount) return;

        isDesktop = (sectionCount === document.querySelector('.section-count')) ? true : false;

        const _countTxt = isDesktop ? ".count_txt-num" : ".m_count_txt-num"
        const _sysTxt = isDesktop ? '.system20-r' : '.m_system14-r'
        gsap.set( _countTxt, {autoAlpha: 0} );
        gsap.set( sectionCount.querySelector( _sysTxt ),{autoAlpha: 0})

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
                    splitText: new SplitText( link.parentNode.querySelector('.cms-history_richtext p'), { 
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
                const parent = e.currentTarget.parentNode.parentNode;
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
        links = gsap.utils.toArray(".history-slider_img-wrap");

        itemsWidth = gsap.getProperty(".history-slider_item", 'width') + gsap.getProperty(".history-slider_item", 'margin-right');
        gsap.set(list,{ width: itemsWidth * items.length});


        gsap.utils.toArray('.history-slider_item').forEach((item,i)=>{ // cms items 각각 등장 위해
            if( i < 2) return
            gsap.set(item.children[0], { x: 120, autoAlpha: 0 })
        })
        
        // showCMSItems()  // cms items 각각 등장 트리거  
        // addEvent(); // 타이틀을 ritch text 로 바꾸면서 사용 못하게 됨.
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
    let isDesktop;
    let overNum;

    const selectMn=(n)=>{
        sectionService.querySelectorAll('.home-service_item').forEach((el) =>{
            if( el.dataset.num === n )  el.classList.add('is-active')
            else                        el.classList.remove('is-active')
        });

        sectionService.querySelectorAll('.home-service_img').forEach((ele) =>{
            if( ele.dataset.num === n ){
                overNum = n;
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
        /*
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
        */
        sectionService.querySelector('.home-service_list').addEventListener('mouseover', e =>{
            if(!e.target.classList.contains('home-service_item')) return;
            if(e.target.dataset.num === overNum) return
            selectMn(e.target.dataset.num);
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

        if(!document.querySelector('.home-service_wrap')) return
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
        if(!sectionService) sectionService = document.querySelector('.m_section-service');
        if(!sectionService) return;

        isDesktop = sectionService === document.querySelector('.section-service') ? true : false;

        if(isDesktop){
            zIndexLevel = 1;
            addEvent();
            selectMn("0");
            gsap.set('.home-service_wrap', {y: 150, autoAlpha: 0})
        }
        
    };

    exports.st = st;
    exports.init = init;
    return exports;
})({});


//===============================================================================================================================
/*=====  Home : History - Mobile => Draggable ======================*/
//===============================================================================================================================
const HomeHistory_Mobile = (function(exports){
    let sectionHistory;

    const init=()=>{
        sectionHistory = document.querySelector('.m_section-history');
        if(!sectionHistory) return;

        sectionHistory.querySelectorAll(".m_history-slider_item").forEach( (ele,i)=> ele.dataset.num = i )
        
        const totalNum = document.querySelectorAll('.m_history-slider_item').length
        const w = gsap.getProperty('.m_news-slider_item', 'width') + gsap.getProperty('.m_news-slider_item', 'margin-right');
        
        const snap = [];
        document.querySelectorAll('.m_history-slider_item').forEach( (item, i)=> {
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
            selector: ".m_history-slider_list",
            totalNum: document.querySelectorAll('.m_history-slider_item').length,
            snap: snap,
            min: -w * totalNum + window.innerWidth - 40,
            max: 0,
            slideItemSize: w
        });        
    }

    exports.init = init;
    return exports;
})({})


const HomeInit =()=>{
    HomeGrowth.init();
    HomeCount.init();
    HomeHistory.init(); HomeHistory.st();
    HomeService.init();

    HomeHistory_Mobile.init()
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