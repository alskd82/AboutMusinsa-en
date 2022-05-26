import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { SplitText } from "gsap/SplitText";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
gsap.registerPlugin(
    ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText,
    Draggable, InertiaPlugin,
);

import BezierEasing from "./class/BezierEasing.js";
import { TextSplitWordsShow, TextSlitLinesMasking } from './class/TextMotion.js';
import DraggableSlider from "./class/DraggableSlider"



//===============================================================================================================================
/*===== 공통 변수  ======================*/
//===============================================================================================================================

const ease = {
    standard: BezierEasing(.33, .45, 0, 1),
    exit : BezierEasing(.3, 0, .7, .4),
    material: BezierEasing(.4, 0, .2, 1)
}

const scrollIntoView = {
    duration: 1.8, 
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
// function $( $selector, $context ) {
//     const context = $context || document;
//     return ( $selector.indexOf('#') > -1 ) ? context.getElementById( $selector.replace('#','') ) : context.querySelector( $selector );
// }

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


//===============================================================================================================================
/*=====  빌보드 영역 텍스트 모션 ======================*/
//===============================================================================================================================
const BillboardText = (function(exports){
    let title;
    let opts;

    const init =(nameSpace)=> {
        let h1 = document.querySelector(".h1-billboard_title");
        if(!h1) h1 = document.querySelector(".m_h1-billboard_title")
        if(!h1) return

        title = new TextSplitWordsShow()
        if(nameSpace === "home"){
            opts = {
                words : new SplitText( h1, { type: "words" }).words,
                splitIntersection: [[0] , [1,2,3], [4,5], [6,7]],
                duration: .75, ease: 'Quart.easeOut',
                staggerTime: .1, gapTime: -.3,
                x:0, y: 60,
            }
            for(let key in opts) title[key] = opts[key];
        } else {
            opts = {
                words : new SplitText( h1, { type: "words" }).words,
                splitIntersection: [[0] , [1]],
                duration: .75, ease: 'Quart.easeOut',
                staggerTime: .1, gapTime: -.3,
                x:0, y: 60,
            }
            for(let key in opts) title[key] = opts[key];
        }

        title.init();
        // title.play();
    }

    const play=()=>{
        let h1 = document.querySelector(".h1-billboard_title");
        if(!h1) h1 = document.querySelector(".m_h1-billboard_title")
        if(!h1) return

        h1.classList.add('is-active')
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
                start: !isMobile ? "top 80%": "top 92%",
                onEnter: (self)=>{
                    gsap.set( ele, {autoAlpha: 1})
                    stagger[i].play("lines")
                },
                once: true,
            });
        });

        gsap.utils.toArray('[data-stagger-y]').forEach((ele, i)=>{  
            ScrollTrigger.create({
                // markers: true, id: `y${i}`,
                trigger: ele,
                start: !isMobile ? "top 80%": "top 92%",
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
                start: !isMobile ? "top 80%": "top 92%",
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
            start: !isMobile ? "top 90%": "top 95%",
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
                        // linesClass: "is-overflow-hidden", // over-flow:hidden 을 적용하려면 클래스로 추가하기
                    }),
                    // charsStagger: 0.01,
                    wordStagger: 0,
                    lineDelay: 0.15,
                    y: 60,
                    autoAlpha: true,
                    duration: 1.5,
                    ease: 'Quart.easeOut',
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
/*=====  From Our Newsroom  ======================*/
//===============================================================================================================================

class LoadFromOurNews {
    constructor(opts){

        this.id = opts.id;
        this.isDesktop = opts.isDesktop === undefined ? true: opts.isDesktop;
        this.homeArr = []
        this.historyArr = []
        this.impactArr = []

        this.src = opts.src;

        this.fetchPage( this.src );
    }

    fetchPage(src){
        (async()=>{
            const res = await fetch(src);
            const contentType = res.headers.get('content-type');
            if (contentType?.includes('application/json')){
                const json = await res.json();
            } else {
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                // console.log( doc )
                // ------ items ---------- //
                this.homeArr = doc.querySelectorAll('#home .news_item-link')
                this.historyArr = doc.querySelectorAll('#history .news_item-link')
                this.impactArr = doc.querySelectorAll('#impact .news_item-link');

                // console.log( this.homeArr )

                this.replaceLink();
            }
        })()
    };

    replaceLink(){
        if(this.id === "newsroom") return

        if(this.id === "home")           this.arr = this.homeArr
        else if(this.id === "history")   this.arr = this.historyArr
        else if(this.id === "impact")    this.arr = this.impactArr

        let aArr, img, h3, date;
        if(this.isDesktop){
            aArr = document.querySelectorAll('.section-news a');
            img = ".news_item-img";
            h3 = ".h3-mu24"
            date = ".news_item-date"
        } else {
            aArr = document.querySelectorAll('.m_section-news a');
            img = ".news_item-img";
            h3 = ".h3-mu20"
            date = ".mu14-150"
        }

        aArr.forEach((link, i)=>{
            link.href = this.arr[i].href;
            link.querySelector(img).style.backgroundImage = this.arr[i].querySelector(".news_item-img").style.backgroundImage;
            link.querySelector(h3).innerHTML = this.arr[i].querySelector(".h3-mu24").innerHTML
            link.querySelector(date).innerHTML = this.arr[i].querySelector(".news_item-date").innerHTML

        })

    }   

};


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
        
        let arrowDefaultX, arrowDefaultY;
        let targetX, targetY;
        let mouseX, mouseY;
        let cacularMouseX, cacularMouseY;
        let areaY;
        let rAF;

        const followCursor =()=>{
            targetX+= (cacularMouseX-targetX) * 0.1;
            targetY+= (cacularMouseY-targetY) * 0.1;
            gsap.set( arrow, { x: targetX, y: targetY });

            rAF = window.requestAnimationFrame( followCursor );
        };

        const arrowDefaultPos =()=>{
            arrowDefaultX = getRelativePosition(area , arrow).x
            arrowDefaultY = getRelativePosition(area , arrow).y
        }
        arrowDefaultPos();
        window.addEventListener( 'resize', e=> arrowDefaultPos() )

        area.addEventListener('mouseenter', e=>{
            rAF = window.requestAnimationFrame( followCursor )
            gsap.killTweensOf( ".img-arrow-bg" )
            gsap.to( ".img-arrow-bg" , { scale: 1, duration: 1.2, ease: 'Elastic.easeOut', delay:0})
        })

        area.addEventListener('mousemove', e=>{
            mouseX = e.pageX;
            mouseY = e.pageY;
            areaY = window.pageYOffset + area.getBoundingClientRect().top;

            cacularMouseX = mouseX - arrowDefaultX - (gsap.getProperty(arrow, 'width')/2);
            cacularMouseY = mouseY - areaY - arrowDefaultY - (gsap.getProperty(arrow, 'height')/2);

            targetX = gsap.getProperty(arrow, 'x');
            targetY = gsap.getProperty(arrow, 'y');
        })
        
        area.addEventListener('mouseleave', e=>{
            window.cancelAnimationFrame(rAF)

            gsap.killTweensOf( arrow )
            gsap.killTweensOf( ".img-arrow-bg" )
            gsap.to( arrow , { x: 0, y: 0, duration: .6, ease: 'Quart.easeOut' })
            gsap.to( ".img-arrow-bg" , { scale: 0, duration: .6, ease: 'Quart.easeInOut' })
        });
        
    }

    const st =()=>{

        if(!isMobile){
            ani = gsap.fromTo( img, { 
                y: -gsap.getProperty(img, 'height')  * .75,// + gsap.getProperty(wrapper, 'height') 
            }, { duration: 1, y: -180 });
        } else {
            ani = gsap.fromTo( img, { y: -gsap.getProperty('.m_shopnow_img-wrap', 'height')*0.75 }, { duration: 1, y: 0 });
        }
        ScrollTrigger.create({
            // markers: true, id: "shownow",
            animation: ani,
            trigger: wrapper,
            start: `top bottom`, 
            end: `end ${100*vh - gsap.getProperty(wrapper, 'height') - gsap.getProperty('footer', 'height')}`,
            scrub: true,
        });
    }

    const init=()=>{
        sectionShopNow = document.querySelector('.section-shopnow');
        if(!sectionShopNow) sectionShopNow = document.querySelector('.m_section-shopnow');
        if(!sectionShopNow) return;
        
        wrapper = !isMobile ? document.querySelector('.shopnow_img-wrap') : document.querySelector('.m_shopnow_img-wrap')
        img = !isMobile ? document.querySelector('.shopnow_img') : document.querySelector('.m_shopnow_img');

        if(!isMobile) mouseFollow();
    };

    exports.st = st
    exports.init = init
    return exports;
})({});


//===============================================================================================================================
/*=====  Mobile : From Our Newsroom => Draggable  ======================*/
//===============================================================================================================================
const FromOurNews_Mobile = (function(exports){
    let list;

    const init=()=>{
        list = document.querySelector('.m_section-news .m_news-slider_list');
        if(!list) return;

        const w = gsap.getProperty( '.news_item-img', 'width') + gsap.getProperty( '.news_item-img', 'margin-right');
        const limit = -w * list.children.length + window.innerWidth - 60
        const snap = []
        document.querySelectorAll('.m_news-slider_item').forEach( (item, i)=> {
            if( i===0) snap.push( 0 ) 
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
            selector: list,
            totalNum: list.children.length,
            axis:"x",
            snap: snap,
            min: limit,
            max: 0,
            slideItemSize: w
        })
    }

    exports.init = init;
    return exports;
})({})



export { 
    ease, scrollIntoView,
    get_query,
    debounce, throttle,
    getRelativePosition,

    smoother, createSmoother,

    BillboardText,
    StaggerMotion,
    ShopNow ,
    LoadFromOurNews,
    FromOurNews_Mobile,
}

