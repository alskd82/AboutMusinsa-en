import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin );


import {ease , scrollIntoView, getRelativePosition  } from "./common"

//===============================================================================================================================
/*=====  About > History  ======================*/
//===============================================================================================================================
const OurStroy = (function(exports){
    let sectionOurstory;
    let ourstoryIndi = document.querySelector(".ourstory-indi");
    let gageArr = document.querySelectorAll('.ourstory-indi_item_gage');

    const addEvent =()=>{
        document.querySelector('.ourstory-indi_list').addEventListener('click', e =>{
            if( !e.target.classList.contains('ourstory-indi_item') ) return;
            // console.log(e.target.dataset.year)
            const targetEle = document.querySelector(`.ourstory_cms[data-year="${e.target.dataset.year}"]`);

            const targetY =()=>{
                let targetY = getRelativePosition(document.body, targetEle).y;
                let firstChildH = gsap.getProperty( targetEle.querySelector('.ourstory_cms-item'), "height" )
                
                if( targetY - window.innerHeight/2 + firstChildH/2 < targetY){
                    return targetY - window.innerHeight/2 + firstChildH/2
                } else {
                    return targetY
                }
            }
            gsap.to(window, {
                duration: .75,  ease: ease.material,
                scrollTo: targetY // targetEle
            });
        })
    }

    /* gage progress */
    const gage =()=> {
        // gsap.set( gageArr, {clipPath: `polygon(0 0, 0 0, 0 100%, 0 100%)`});

        /* Year 걸치기 */
        document.querySelectorAll('.ourstory_cms-item').forEach( (ele,i)=>{
            const header = document.querySelectorAll('.ourstory_cms-header')[i]
            const headerH = gsap.getProperty(header, 'height');
            ScrollTrigger.batch(ele, {
                // markers: true, id:"year",
                start: `top top`,
                end: `bottom ${headerH + 120 + 120}`, // 헤더크기 + 상하 패딩  
                pin: header,
            })
        })

        /* 연도별 인디케이터 */
        document.querySelectorAll('.ourstory_cms').forEach( (ele, i)=>{
            ScrollTrigger.create({
                // markers: true, id: "gage",
                trigger: ele, 
                start: `120 ${window.innerHeight - 120}`,
                end: `bottom ${window.innerHeight - 120}`,
                preventOverlaps: true,
                fastScrollEnd: true,
                onUpdate: self => {
                    const progress = parseFloat( self.progress.toFixed(2) ) * 100;
                    // console.log("progress:", progress )
                    gsap.to( gageArr[i], {clipPath: `polygon(0 0, ${progress}% 0, ${progress}% 100%, 0 100%)`,  duration: .1})
                }
            });
        })
    }

    /* 인디케이터 */
    const indiShowHide =(str)=>{
        if(str === "show" && !ourstoryIndi.classList.contains('is-active')){
            ourstoryIndi.classList.add('is-active');
        } else if(str === "hide" && ourstoryIndi.classList.contains('is-active')){
            ourstoryIndi.classList.remove('is-active');
        }
        // ourstoryIndi.classList.contains('is-active') ? ourstoryIndi.classList.remove('is-active') : ourstoryIndi.classList.add('is-active')
    }

    const st=()=>{
        if(!sectionOurstory) return;
        /* indi 등장 사라짐 */
        ScrollTrigger.create({
            // markers: true, id:"indi_show",
            trigger: sectionOurstory, start: "top 70%", end: "bottom 70%",
            onEnter:() => {indiShowHide("show")}, 
            onLeaveBack:() => indiShowHide("hide"),
            onLeave:() => indiShowHide("hide"),
            onEnterBack:() => indiShowHide("show"), 
        });

        gage()
    }

    const init =()=>{
        sectionOurstory = document.querySelector(".section-ourstory");
        if(!sectionOurstory) return;

        

        gsap.set( gageArr, {clipPath: `polygon(0 0, 0 0, 0 100%, 0 100%)`});

    }

    exports.st = st;
    exports.gage = gage;

    exports.addEvent = addEvent;
    exports.init = init;
    return exports;
})({})

//===============================================================================================================================
/*=====  About > Impact - Image ======================*/
//===============================================================================================================================
const ImpactImage = (function(exports){
    let impactImgWrap;

    const st =()=> {
        impactImgWrap = document.querySelectorAll('.impact-img_wrap');
        if(!impactImgWrap) return

        impactImgWrap.forEach((imgWrap,i)=>{

            gsap.to( imgWrap,{
                // ...scrollIntoView,
                clipPath: `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)`,
                duration: .8,
                ease: BezierEasing(0.6,0,0.1,1),
                scrollTrigger:{
                    // markers: true, id: "img",
                    trigger: imgWrap,
                    start: `top 70%`,
                    onEnter:()=> {
                        console.log("ImpactImage enter")
                        gsap.to(imgWrap.children[0], 1.2, {scale: 1, ease: BezierEasing(0.5,0,0,1)} );
                        
                    },
                    once: true,
                }
            })
        });
        
    }

    const init =()=>{
        impactImgWrap = document.querySelectorAll('.impact-img_wrap');
        if(!impactImgWrap) return

        impactImgWrap.forEach((imgWrap,i)=>{
            // gsap.set(imgWrap.children[0], {y: 120, autoAlpha: 0})
            let path = `polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)`
            if( (i+1)%2 != 0 ) path = `polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)`

            gsap.set(imgWrap, { clipPath: path })
            gsap.set(imgWrap.children[0], { scale: 1.5 })
        });

    }

    exports.st = st;
    exports.init = init;
    return exports;
})({})


const AboutInit =()=>{
    OurStroy.init();
    ImpactImage.init();
}
const AboutST =()=>{
    OurStroy.st();
    ImpactImage.st();
}


export { 
    OurStroy,

    AboutInit,  
    AboutST,
}