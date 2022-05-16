// import BezierEasing from "./class/BezierEasing.js";
// import { TextSplitWordsShow, TextSlitLinesMasking } from './class/TextMotion.js';
import { 
    ease, 
    scrollIntoView ,
    // smoother
} from "./utils.js";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger );


//===============================================================================================================================
/*=====  Service   ======================*/
//===============================================================================================================================
const Service = (function(exports){
    let serviceList; 
    let mockups;
    
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
    }

    const init =()=>{
        serviceList = document.querySelector('.service_list-grid')
        if(!serviceList) return;
        mockups = document.querySelectorAll('.service_list_mockup');

        document.querySelectorAll('.btn-shopnow').forEach( (ele, i)=> gsap.set( ele, { x: -40, autoAlpha: 0 }) );
        // scrollTrigger_mockup();
        // scrollTrigger_btn();
    };

    exports.st = st;
    exports.init = init;

    return exports;
})({});


export { Service }