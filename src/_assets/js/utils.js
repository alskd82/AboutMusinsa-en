import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother);


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

// function debounce( fn, wait, immediate ){
//     var slice = [].slice;
//     var timeout;
//     if (wait == null) wait = 100;
//     timeout = null;
//     return function(){
//         var args, delayed, obj;
//         args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
//         obj = this;
//         delayed = function() {
//             if (!immediate) fn.apply(obj, args); 
//             return timeout = null;
//     };
//     if (timeout) clearTimeout(timeout);
//     else if (immediate) fn.apply(obj, args);
//     return timeout = setTimeout(delayed, wait);
//     };
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






export {
    ease, scrollIntoView,
    get_query,
    debounce, throttle,
    getRelativePosition,
}

