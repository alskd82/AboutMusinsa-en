import Loadmore  from "./class/Loadmore.js";

import {ease} from "./utils";
import {gsap} from "gsap";

import { smoother, createSmoother } from "./PC_Common.js";

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
        newsroomCMS = document.querySelector('#CMS')
        if(!newsroomCMS) return;

        loadmore = new Loadmore({ nextBtn: '.bt_loadmore', cms: "#CMS", customScroll: { fn: createSmoother } })
        addEvent();
    }

    
    exports.init = init;
    return exports;
})({});



export default Newsroom