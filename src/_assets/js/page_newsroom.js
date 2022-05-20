import Loadmore  from "./class/Loadmore.js";


import {gsap} from "gsap";
import { ease, smoother, createSmoother } from "./common.js";

//===============================================================================================================================
/*=====  Newsroom ======================*/
//===============================================================================================================================
const Newsroom = (function(exports){
    let newsroomCMS;
    let loadmore;
    
    const addEvent=()=>{
        document.querySelector('.bt_loadmore').addEventListener('click', e =>{
            e.preventDefault();
        })
    }

    const init =()=>{
        newsroomCMS = document.querySelector('#CMS');
        if(!newsroomCMS) return;

        if(!isMobile){
            loadmore = new Loadmore({ nextBtn: '.bt_loadmore', cms: "#CMS", customScroll: { fn: createSmoother } })
        } else {
            loadmore = new Loadmore({ nextBtn: '.bt_loadmore', cms: "#CMS", customScroll: { fn: null } })
        }

        addEvent();
    }

    
    exports.init = init;
    return exports;
})({});



export default Newsroom