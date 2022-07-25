
import BezierEasing from "../class/BezierEasing";
import { getRelativePosition, ease } from "./common";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


//===============================================================================================================================
/*===== Navi ======================*/
//===============================================================================================================================
const Navi = (function(exports){
    const navList = document.querySelector('.nav_list')                 // 원뎁스 메뉴 래퍼
    const navSmn = document.querySelector('.nav_smn');                  // 투뎁스 메뉴 래퍼

    const mnArr = document.querySelectorAll('.nav_link');               // 원뎁스 메뉴들 a 태그들
    const smnArr = document.querySelectorAll('.nav_smn-link')           // 투뎁스 메뉴들 a 태그들

    let hoverName;
    let hoverElem;
    let isEnter = false;     // 원뎁스 영역에 마우스 들어오면...
    let isSmnEnter = false;  // 투뎁스 영역에 마우스 들어오면..
    
    let delayedCall

    /* 투뎁스 메뉴 오버 - 형제요소들 투명도 조절 */
    const smnActive = (num) =>{
        gsap.killTweensOf(check);
        
        smnArr.forEach( (smn, i)=>{
            if( num === -1){
                smn.classList.remove('is-disactive')
            } else {
                if( i !== num ) smn.classList.add('is-disactive')
                else            smn.classList.remove('is-disactive')
            }
        });
    }

    /* 투뎁스 숨기기 */
    const smnHide =()=>{
        gsap.killTweensOf( navSmn )
        gsap.to( navSmn, 0.2, { 
            autoAlpha: 0, ease: ease.standard,
            onComplete: ()=> {
                // navSmn.classList.add('is-hide') 
            }
        })
    }
    
    /* 투뎁스 > 원뎁스의 위치로 이동 */
    const smnTargetX = (elem) =>{
        const _x = getRelativePosition( navList, elem ).x;
        const _elemWidth = gsap.getProperty( elem, 'width')
        const _navSmnWidth = gsap.getProperty( navSmn, 'width')

        let targetX = _x + _elemWidth / 2 - _navSmnWidth / 2;
        if( _navSmnWidth + targetX > gsap.getProperty( '.nav_list-wrap', 'width')){
            targetX = gsap.getProperty( '.nav_list-wrap', 'width') - _navSmnWidth
        }

        return targetX;
    }

    /* 원뎁스 오버하면 실행 */
    const mnActive =(num) =>{
        
        gsap.killTweensOf(check);

        hoverElem = mnArr[num];
        hoverName = hoverElem.dataset.name;
        // console.log(hoverNum, hoverElem)

        mnArr.forEach( (mn,i)=>{
            if( i === num ) mn.classList.add('is-active')
            else            mn.classList.remove('is-active')
        });

        if( num === 0){
            gsap.to( navSmn, {duration: 0.2, ease: ease.standard, autoAlpha:0, onComplete: ()=> navSmn.classList.add('is-hide') })
        } else {

            smnArr.forEach((smn, i) =>{
                (smn.dataset.target === hoverName) ? smn.classList.remove('is-hide') : smn.classList.add('is-hide')
            });

            if( navSmn.classList.contains('is-hide') || gsap.getProperty(navSmn, "opacity") != 1 ){ //navSmn.classList.contains('is-hide')
                gsap.killTweensOf( navSmn )
                navSmn.classList.remove('is-hide');
                gsap.set( navSmn, {x: smnTargetX(hoverElem)});
                
                gsap.to( navSmn, { y:0, autoAlpha: 1, duration: 0.3, ease: ease.standard})
            } else {
                gsap.to( navSmn, {x: smnTargetX(hoverElem), duration: 0.3, ease: ease.standard })
            }

            smnActive(-1);
        }

        // console.log(isEnter, isSmnEnter, num)
    };

    const isEnterFalse =()=> isEnter = false

    const check =() =>{ 
        if( !isEnter && !isSmnEnter ){
            smnHide()
            mnArr.forEach( mn => mn.classList.remove('is-active') )
            gsap.set( navSmn, {y: -30, delay: 0.2 })
        }
        if(!isSmnEnter) smnActive(-1)
    };

    
    // delayedCall = gsap.delayedCall( 0.1, check )

    const init =() =>{

        navList.addEventListener('mouseenter', e => { isEnter = true; gsap.delayedCall(0.1, check); })
        navList.addEventListener('mouseleave', e => {  isEnter = false; gsap.delayedCall(0.1, check ) })
        navSmn.addEventListener('mouseenter', e => { isSmnEnter = true; gsap.delayedCall(0.1, check); })
        navSmn.addEventListener('mouseleave', e => { isSmnEnter = false; gsap.delayedCall(0.1, check); })

        mnArr.forEach( (mn,i)=>{
            mn.addEventListener('mouseover', e => {
                isEnter = true; 
                mnActive(i)
            });
        });

        smnArr.forEach( (smn,i) =>{
            smn.addEventListener('mouseover', e => {isSmnEnter = true; smnActive(i)} );
        });

        gsap.set( navSmn, {y: -30 })
    };

    /* 원뎁스  활성화 색 강제 부여하기 */
    const naviActive=(name)=>{ 
        navList.querySelectorAll('.nav_item').forEach((item,i)=>{
            name === item.querySelector('.nav_link').dataset.name ? item.classList.add('is-active') : item.classList.remove('is-active')
            // if( i === n )   item.classList.add('is-active')
            // else            item.classList.remove('is-active')
        })
    }



    exports.naviActive = naviActive;
    exports.init = init;
    return exports;
})({});


//===============================================================================================================================
/*===== Scroll  ======================*/
//===============================================================================================================================
let prevPageY;
let scrollDirection;
let isNavShowHideBlock = false;     // 네비 숨기는 기능 막기 
let isFooterInvisible = false;      // 풋터 등장시 네비게이션 보이게 하기

const nav = {
    scrollDirection:(value) => scrollDirection = value,
    isNavShowHideBlock:(value) => isNavShowHideBlock = value,
    isFooterInvisible:(value) => isFooterInvisible = value,
}

const forScrollVariable_Reset =()=>{
    prevPageY = window.pageYOffset;
    nav.scrollDirection(undefined)
    nav.isNavShowHideBlock(false)
    nav.isFooterInvisible(false)
}

const navShowHide=()=>{
    if(isNavShowHideBlock) return

    if(prevPageY > window.pageYOffset )      scrollDirection = 'up'
    else if(prevPageY < window.pageYOffset ) scrollDirection = 'down'
    prevPageY = window.pageYOffset;
    // console.log( `scrollDirection = ${scrollDirection}` )

    if(isFooterInvisible){
        if(document.querySelector('.section-nav').classList.contains('is-scrolldown')){
            document.querySelector('.section-nav').classList.remove('is-scrolldown')
        };

    } else {
    
        if(window.pageYOffset < gsap.getProperty('.section-billboard', 'height') - 100){
            document.querySelector('.section-nav').classList.remove('is-scrolldown')
            if(document.querySelector(".section-nav").classList.contains('is-blured')){
                document.querySelector(".section-nav").classList.remove('is-blured')
            }
        } else {
            if(scrollDirection === "down" && !document.querySelector('.section-nav').classList.contains('is-scrolldown')){
                document.querySelector('.section-nav').classList.add('is-scrolldown')
            } 
            else if(scrollDirection === "up" && document.querySelector('.section-nav').classList.contains('is-scrolldown')){
                document.querySelector('.section-nav').classList.remove('is-scrolldown') 
            }
            if(!document.querySelector(".section-nav").classList.contains('is-blured')){
                document.querySelector(".section-nav").classList.add('is-blured')
            }
        };

    }
}


// const scroll ={
//     direction: undefined,
//     isNavShowHideBlock: false,      // 네비 숨기는 기능 막기 
//     isFooterInvisible: false,      // 풋터 등장시 네비게이션 보이게 하기 위해

//     get getShowHideBlock(){ return this.isNavShowHideBlock }
//     set profile(value) {this.name = value }
// }

//===============================================================================================================================
/*=====  Footer ======================*/
//===============================================================================================================================
const Footer = (function(exports){
    const st =()=>{
        ScrollTrigger.create({
            // markers: true, id:"footer",
            trigger: ".section-footer",
            onEnter: ()=> {
                isFooterInvisible = true;
                navShowHide();
            },
            onLeaveBack:()=> {
                isFooterInvisible = false;
                navShowHide();
            },
        })
    };
    exports.st = st;
    return exports;
})({})


//===============================================================================================================================
/*===== Mobile : 네비게이션  ======================*/
//===============================================================================================================================
const Mobile_Navi = (function(exports){
    const btMenu = document.querySelector('.m_ham');
    const navWrap = document.querySelector('.m_nav-wrap');

    let delayedCall;
    let pageY;

    const naviOpen =()=>{
        /*
            현재 페이지 스크롤 범위 저장
            .page-wrap top 값 변경
            body fixed 로 변경
        */
        pageY = window.pageYOffset;
        document.querySelector('.page-wrap').style.top = `-${pageY}px`;
        document.body.classList.add('fixed');

        navWrap.classList.add('is-active');
        gsap.killTweensOf(naviInVisible);
        navWrap.style.visibility = 'visible';

        gsap.killTweensOf('.m_ham > svg.line > rect')
        gsap.to( '.m_ham > svg.line:nth-child(1) > rect', .5, { rotation: 45, x:4, y:-4, fill: 'rgb(0,0,0)', ease: ease.standard });
        gsap.to( '.m_ham > svg.line:nth-child(2) > rect' , .5, { rotation: -45, x:2.5, y:6, fill: 'rgb(0,0,0)', ease: ease.standard });
    }

    const naviClose =(isTop)=>{
        /*
            body fixed 삭제
            .page-wrap top 복구
            페이지 스크롤 원위치
         */
        document.body.classList.remove('fixed');
        document.querySelector('.page-wrap').style.top = `-${0}px`;
    
        isTop ? window.scrollTo(0, 0) : window.scrollTo(0, pageY);
        
        navWrap.classList.remove('is-active');
        gsap.delayedCall( 0.8, naviInVisible );

        gsap.killTweensOf('.m_ham > svg.line > rect')
        gsap.to( '.m_ham > svg.line:nth-child(1) > rect', .4, { rotation: 0, x:0, y:0, fill: 'rgb(255,255,255)', ease: ease.material, delay:0.1 });
        gsap.to( '.m_ham > svg.line:nth-child(2) > rect' , .4, { rotation: 0, x:0, y:0, fill: 'rgb(255,255,255)', ease: ease.material, delay:0.1 });
    }

    const naviInVisible=()=> navWrap.style.visibility = 'hidden'

    const addEvent=()=>{
        btMenu.addEventListener('click', e=>{
            
            !document.body.classList.contains('fixed') ? naviOpen(): naviClose()
        });
        
    }

    const naviActive=(nameSpace)=>{ 
        document.querySelectorAll('.m_nav-link').forEach((item,i)=>{
            (item.dataset.name === nameSpace) ? item.classList.add('is-active') : item.classList.remove('is-active')
        })

        if( nameSpace === "history" || nameSpace === "impact"){
            document.querySelector('.m_nav-link[data-name=about]').classList.add('is-active');
        } else {
            document.querySelector('.m_nav-link[data-name=about]').classList.remove('is-active');
        }
        
    }

    const init =()=>{
        addEvent();
        naviInVisible();
    }

    exports.naviActive = naviActive;
    exports.naviOpen = naviOpen;
    exports.naviClose = naviClose;
    exports.init = init;
    return exports;
})({});



export { 
    Navi, Footer ,
    nav, forScrollVariable_Reset, navShowHide,

    Mobile_Navi,
};
