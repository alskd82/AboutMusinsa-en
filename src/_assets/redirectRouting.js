if(window.navigator.userAgent.match(/MSIE|Internet Explorer|Trident/i)) window.location = "microsoft-edge:" + window.location.href;

let isMobile = false;
let mobileInfo = new Array('Android', 'iPhone', 'iPod', 'BlackBerry', 'Windows CE', 'SAMSUNG', 'LG', 'MOT', 'SonyEricsson','windows phone os 7');
for (let info in mobileInfo){
    if (navigator.userAgent.match(mobileInfo[info]) != null){
        isMobile = true;
        break;
    }
}

const redirection=( opts={nowDesktop: true, dev: true} )=>{
    if(opts.nowDesktop){ 
        if(isMobile){ // 모바일 버전으로 리디렉션 //
            if(window.location.href.indexOf('/history') != -1)          window.location = opts.dev ? "/m/m_01_history.html" : "/en/m/about/history/";
            else if(window.location.href.indexOf('/impact') != -1)      window.location = opts.dev ? "/m/m_02_impact.html" : "/en/m/about/impact/";
            else if(window.location.href.indexOf('/service') != -1)     window.location = opts.dev ? "/m/m_03_service.html" : "/en/m/service/";
            else if(window.location.href.indexOf('/newsroom') != -1)    window.location = opts.dev ? "/m/m_04_newsroom.html" : "/en/m/newsroom/";
            else {
                window.location = opts.dev ? "/m/m.html" : "/en/m/";
            }
        }
    }
    else {
        if(!isMobile){ // 피씨 버전으로 리디렉션 //
            if(window.location.href.indexOf('/history') != -1)          window.location = opts.dev ? "01_history.html" : "/en/m/about/history/";
            else if(window.location.href.indexOf('/impact') != -1)      window.location = opts.dev ? "02_impact.html" : "/en/m/about/impact/";
            else if(window.location.href.indexOf('/service') != -1)     window.location = opts.dev ? "03_service.html" : "/en/m/service/";
            else if(window.location.href.indexOf('/newsroom') != -1)    window.location = opts.dev ? "04_newsroom.html" : "/en/m/newsroom/";
            else {
                window.location = opts.dev ? "/m/m.html" : "/en/m/";
            }
        }
    }
}

let vh = window.innerHeight * 0.01;
document.querySelector(":root").style.setProperty("--vh", `${vh}px`);