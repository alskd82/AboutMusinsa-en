
// import BezierEasing from "./class/BezierEasing.js";
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

    let hoverNum;
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
        hoverNum = hoverElem.dataset.num;
        // console.log(hoverNum, hoverElem)

        mnArr.forEach( (mn,i)=>{
            if( i === num ) mn.classList.add('is-active')
            else            mn.classList.remove('is-active')
        });

        if( num === 0){
            gsap.to( navSmn, {duration: 0.2, ease: ease.standard, autoAlpha:0, onComplete: ()=> navSmn.classList.add('is-hide') })
        } else {

            smnArr.forEach((smn, i) =>{
                (smn.dataset.target === hoverNum) ? smn.classList.remove('is-hide') : smn.classList.add('is-hide')
            });

            if( navSmn.classList.contains('is-hide') || gsap.getProperty(navSmn, "opacity") != 1 ){ //navSmn.classList.contains('is-hide')
                gsap.killTweensOf( navSmn )
                navSmn.classList.remove('is-hide');
                gsap.set( navSmn, {x: smnTargetX(hoverElem)});
                
                gsap.fromTo( navSmn, {y: -15, autoAlpha: 0 }, { y:0, autoAlpha: 1, duration: 0.3, ease: ease.standard, delay: .2})
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
    };

    /* 원뎁스  활성화 색 강제 부여하기 */
    const naviActive=(n)=>{ 
        navList.querySelectorAll('.nav_item').forEach((item,i)=>{
            if( i === n )   item.classList.add('is-active')
            else            item.classList.remove('is-active')
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




export { 
    Navi, Footer ,
    nav, forScrollVariable_Reset, navShowHide,
};
