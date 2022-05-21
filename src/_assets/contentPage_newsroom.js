import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);


import { 
    createSmoother,
    getRelativePosition
} from "./js/common";
import { Navi, Footer, navShowHide, Mobile_Navi } from "./js/nav"
import DraggableSlider from "./js/class/DraggableSlider"


//===============================================================================================================================
/*===== 페이지 첫 실행  ======================*/
//===============================================================================================================================

document.addEventListener('DOMContentLoaded', e =>{
    console.log("DOMContentLoaded");
    
    /* PC */
    if(!isMobile){
        createSmoother(true);

        Navi.init();
        Navi.naviActive(3);
        Footer.st();

        navShowHide();
        window.addEventListener('scroll', e => navShowHide() );

        ScrollTrigger.config({ 
            limitCallbacks: true,
            ignoreMobileResize: true
        })
        // ScrollTrigger.addEventListener("refresh", e=> console.log("ScrollTrigger refresh") )
    }

    /* Mobile */
    else {
        Mobile_Navi.init()
        Mobile_Navi.naviActive(3);
        AnotherArticle()
    }


});



const AnotherArticle =()=>{
    let CMS = document.querySelector('.cms_another-articles');
    if(!CMS) return;
    
    const totalNum = document.querySelectorAll('.another-articles_item').length
    const w = gsap.getProperty('.another-articles_item', 'width') + gsap.getProperty('.another-articles_item', 'margin-right');
    
    const snap = [];
    document.querySelectorAll('.another-articles_item').forEach( (item, i)=> {
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
        selector: ".another-articles_list",
        totalNum: totalNum,
        snap: snap,
        min: -w * totalNum + window.innerWidth - 60,
        max: 0,
        slideItemSize: w
    });      
    
    
}
