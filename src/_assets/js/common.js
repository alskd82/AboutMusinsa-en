import BezierEasing from "./class/BezierEasing.js";
import { TextSplitWordsShow, TextSlitLinesMasking } from './class/TextMotion.js';

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);


//===============================================================================================================================
/*===== 공통 변수  ======================*/
//===============================================================================================================================

const ease = {
    standard: BezierEasing(.33, .45, 0, 1),
    exit : BezierEasing(.3, 0, .7, .4),
    material: BezierEasing(.4, 0, .2, 1)
}

const scrollIntoView = {
    duration: 1.5, 
    autoAlpha: 1, 
    ease: 'Quart.easeOut', 
    x:0, y:0
}


//===============================================================================================================================
/*===== url 쿼리 받기  ======================*/
//===============================================================================================================================
function get_query(){ 
    var url = document.location.href; 
    var qs = url.substring(url.indexOf('?') + 1).split('&'); 
    for(var i = 0, result = {}; i < qs.length; i++){ 
        qs[i] = qs[i].split('='); 
        result[qs[i][0]] = decodeURIComponent(qs[i][1]); 
    } 
    return result; 
}

/*
https://hianna.tistory.com/465
const urlParams = new URLSearchParams( window.location.search);
urlParams.getAll('p')           // 배열로 받기
urlParams.get('p')              // ?p=ABC // 특정 파라미터값 추출 
urlParams.has('p')              // 파라미터가 있는지 여부 
urlParams.append('lang', 'ko')  // 파라미터 추가(append())
urlParams.set('lang', 'cn');    // 파라미터 변경(set())
urlParams.delete('lang');       //파라미터 삭제

새로고침 없이 url 변경 https://mine-it-record.tistory.com/439
history.pushState(null, null, `?p=${urlParams.get('p', cmsNum)}`)
*/


//===============================================================================================================================
/*===== debounce & throttle ======================*/
//===============================================================================================================================
function $( $selector, $context ) {
    const context = $context || document;
    return ( $selector.indexOf('#') > -1 ) ? context.getElementById( $selector.replace('#','') ) : context.querySelector( $selector );
}

function debounce(threshold, fn, immediate) {
    var slice = [].slice;
    var timeout;
    if (threshold == null) threshold = 0.1;
    timeout = null;
    threshold *= 1000;
    return function () {
        var args, delayed, obj;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        obj = this;
        delayed = function () {
            if (!immediate) fn.apply(obj, args);
            return (timeout = null);
        };
        if (timeout) clearTimeout(timeout);
        else if (immediate) fn.apply(obj, args);
        return (timeout = setTimeout(delayed, threshold));
    };
};

function throttle( fn, delay ) {
    var timer;
    if (delay === 0) return fn;
    timer = false;
    return function() {
        if (timer) return;
        timer = true;
        if (delay !== -1) setTimeout((function(){return timer = false;}), delay);
        return fn.apply(null, arguments);
    };
};


//===============================================================================================================================
/* standardElem 기준 targetElem의 좌표 */
//===============================================================================================================================
function getRelativePosition(standardElem, targetElem){ // https://lpla.tistory.com/157 //
    const x = targetElem.getBoundingClientRect().left - standardElem.getBoundingClientRect().left;
    const y = targetElem.getBoundingClientRect().top - standardElem.getBoundingClientRect().top;
    return {x, y}
}




//===============================================================================================================================
/*=====  빌보드 영역 텍스트 모션 ======================*/
//===============================================================================================================================
const BillboardText = (function(exports){
    let title;
    let opts;

    const init =(nameSpace)=> {
        if(!document.querySelector(".h1-billboard_title")) return
        title = new TextSplitWordsShow()
        if(nameSpace === "home"){
            opts = {
                words : new SplitText( '.h1-billboard_title', { type: "words" }).words,
                splitIntersection: [[0] , [1,2,3,4], [5,6,7,8]],
                duration: 1, ease: 'Quart.easeOut',
                staggerTime: .1, gapTime: -.3,
                x:0, y: 60,
            }
            for(let key in opts) title[key] = opts[key];
        } else if(nameSpace === "service") {
            opts = {
                words : new SplitText( '.h1-billboard_title', { type: "words" }).words,
                splitIntersection: [[0] , [1,2,3] , [4,5,6,7]],
                duration: 1, ease: 'Quart.easeOut',
                staggerTime: .1, gapTime: -.3,
                x:0, y: 60,
            }
            for(let key in opts) title[key] = opts[key];
        } else {
            opts = {
                words : new SplitText( '.h1-billboard_title', { type: "words" }).words,
                splitIntersection: [[0] , [1]],
                duration: 1, ease: 'Quart.easeOut',
                staggerTime: .1, gapTime: -.3,
                x:0, y: 60,
            }
            for(let key in opts) title[key] = opts[key];
        }

        title.init();
        
        
        // title.play();
    }

    const play=()=>{
        if(!document.querySelector(".h1-billboard_title")) return
        document.querySelector(".h1-billboard_title").classList.add('is-active')
        title.play();
    }

    exports.play = play;
    exports.init = init;
    return exports;
})({});


//===============================================================================================================================
/*=====  Stagger ======================*/
//===============================================================================================================================

const StaggerMotion = (function(exports){
    let stagger;

    const st =()=> {
        gsap.utils.toArray('[data-stagger]').forEach((ele, i)=>{    
            ScrollTrigger.create({
                // markers: true, id: `stagger${i}`,
                trigger: ele,
                start: "top 80%",
                onEnter: (self)=>{
                    gsap.set( ele, {autoAlpha: 1})
                    stagger[i].play()
                },
                once: true,
            });
        });

        gsap.utils.toArray('[data-stagger-y]').forEach((ele, i)=>{  
            ScrollTrigger.create({
                // markers: true, id: `y${i}`,
                trigger: ele,
                start: "top 80%",
                onEnter:(self)=> {
                    gsap.to( ele, {...scrollIntoView} )
                    self.kill();
                },
                // once: true,
            })
        });

        gsap.utils.toArray('[data-stagger-alpha]').forEach((ele, i)=>{ 
            ScrollTrigger.create({
                // markers: true, id: `alpha${i}`,
                trigger: ele,
                start: "top 80%",
                onEnter:(self)=> {
                    gsap.to( ele, {...scrollIntoView} )
                    self.kill();
                },
                // once: true,
            })
        });

        ScrollTrigger.batch('[data-stagger-batch]', {
            // markers: true,
            interval: 0, // time window (in seconds) for batching to occur. 
            batchMax: 3,   // maximum batch size (targets). Can be function-based for dynamic values
            onEnter: batch => {
                gsap.to(batch, {
                    ...scrollIntoView,
                    stagger: { each: 0.15, grid: [1, 3] }, 
                    overwrite: true
                }     
            )},
            
            onEnterBack: batch => gsap.set(batch, {autoAlpha: 1, y: 0, overwrite: true}),
            start: "top 90%",
            // end: "top top",
            preventOverlaps: true
        });
        
    }

    const newsroom =()=>{
        const sectionNews = document.querySelector('.section-news');
        if(!sectionNews) return

        gsap.to('.news_item', {
            ...scrollIntoView,
            stagger: 0.2,
            scrollTrigger:{
                // markers: true, id: 'news',
                trigger: sectionNews.children[0],
                start: "top 75%",
                toggleClass: "is-active"
            }
        });
    }

    const init =()=>{
        stagger = []
        gsap.utils.toArray('[data-stagger]').forEach((ele, i)=>{    
            stagger.push( 
                new TextSlitLinesMasking({
                    splitText: new SplitText( ele, { 
                        type: "lines,words,chars", 
                        // linesClass: "split-line", // over-flow:hidden 을 적용하려면 클래스로 추가하기
                    }),
                    charsStagger: 0.01,
                    y: 60,
                    autoAlpha: true,
                    duration: 1,
                    ease: ease.standard,
                })
            );
        });

        // gsap.utils.toArray('[data-stagger-p]').forEach((ele, i)=> gsap.set( ele, { y: 80, autoAlpha: 0}) )

        // FromOurNewsroom //
        newsroom();

    }

    exports.st = st;
    exports.init = init;

    return exports;
})({});


//===============================================================================================================================
/*=====  ShopNow ======================*/
//===============================================================================================================================
const ShopNow = (function(exports){
    let sectionShopNow;
    let wrapper;
    let img;
    let ani;

    const mouseFollow =()=>{
        let area = document.querySelector('.section-shopnow .container-wide')
        let arrow = document.querySelector('.img-arrow-wrap');
        let isEnter = false;
        let isMoveStart = false;
        let arrowPos;
        
        area.addEventListener('mouseenter', e=>{
            isEnter = true;
            isMoveStart = true;

            arrowPos = { 
                x: arrow.getBoundingClientRect().x  + gsap.getProperty(arrow, "width") / 2, 
                y: arrow.getBoundingClientRect().y + gsap.getProperty(arrow, "height") / 2
            }
            gsap.killTweensOf( arrow )
            gsap.to( ".img-arrow-bg" , { scale: 1, duration: 1.5, ease: 'Elastic.easeOut', delay:0.15 })
        })

        area.addEventListener('mousemove', e=>{
            if(!isEnter) return
            // if(!isMoveStart){
            //     arrowPos = { 
            //         x: arrow.getBoundingClientRect().x  + gsap.getProperty(arrow, "width") / 2, 
            //         y: arrow.getBoundingClientRect().y + gsap.getProperty(arrow, "height") / 2
            //     }
            //     gsap.killTweensOf( arrow )
            //     gsap.to( ".img-arrow-bg" , { scale: 1, duration: 1.5, ease: 'Elastic.easeOut', delay:0.15 })
            //     isMoveStart = true;
            // }

            gsap.to( arrow , {
                x: -arrowPos.x + e.clientX,
                y: -arrowPos.y + e.clientY,
                duration: 1.5,
                // ease: 'Quad.easeOut'
            })
        })
        
        area.addEventListener('mouseleave', e=>{
            isEnter = false;
            isMoveStart = false;
            gsap.killTweensOf( arrow )
            gsap.to( arrow , { x: 0, y: 0, duration: .75, ease: 'Quart.easeOut' })
            gsap.to( ".img-arrow-bg" , { scale: 0, duration: 1, ease: 'Quart.easeInOut' })
        })

        window.addEventListener('scroll', e=>{
            
            if(isMoveStart){
                isMoveStart = false
                gsap.killTweensOf( arrow )
                gsap.to( arrow , { x: 0, y: 0, duration: .75, ease: 'Quart.easeOut' })
                gsap.to( ".img-arrow-bg" , { scale: 0, duration: 1, ease: 'Quart.easeInOut' })
            }
        })

        
    }

    const st =()=>{
        if(!sectionShopNow) return;

        ScrollTrigger.create({
            // markers: true, id: "shownow",
            animation: ani,
            trigger: wrapper,
            start: `top bottom`, 
            end: `end ${window.innerHeight - gsap.getProperty(wrapper, 'height') - gsap.getProperty('footer', 'height')}`,
            scrub: true,
        });
    }

    const init=()=>{
        sectionShopNow = document.querySelector('.section-shopnow');
        if(!sectionShopNow) return;
        
        wrapper = document.querySelector('.shopnow_img-wrap');
        img = document.querySelector('.shopnow_img');

        // console.log( gsap.getProperty(wrapper, 'height') , gsap.getProperty(img, 'height') )
        ani = gsap.fromTo( img, { 
            y: -gsap.getProperty(img, 'height') * .75,// + gsap.getProperty(wrapper, 'height') 
        }, {
            duration: 1,
            y: -350
            
        });
        // mouseFollow();
    };

    exports.st = st
    exports.init = init
    return exports;
})({});


//===============================================================================================================================
/*===== 스무스 스크롤  ======================*/
//===============================================================================================================================
let smoother;
const createSmoother=(isTop)=>{
    /* 삭제 후 다시 설치 방법 */
    if(smoother) smoother.kill();
    smoother = ScrollSmoother.create({
        wrapper: `[data-smooth="wrapper"]`,
        content: `[data-smooth="content"]`,
        normalizeScroll: true, effects: true,
    });

    /* 컨텐츠만 다시 바꿔치기 */
    // if(smoother) smoother.content(`[data-smooth="content"]`);
    // else {
    //     smoother = ScrollSmoother.create({
    //         wrapper: `[data-smooth="wrapper"]`,
    //         content: `[data-smooth="content"]`,
    //         normalizeScroll: true, effects: true,
    //     });
    // };
    isTop && setTimeout(() => smoother ? smoother.scrollTo(0) : window.scrollTo( 0, 0 ) , 0)
};



export { 
    ease, scrollIntoView,
    get_query,
    debounce, throttle,
    getRelativePosition,

    BillboardText,
    StaggerMotion,
    ShopNow ,
    smoother, createSmoother
}

