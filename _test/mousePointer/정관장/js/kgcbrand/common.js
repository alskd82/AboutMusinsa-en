// window.__USE_LOCOSCROLL__ = true;
// window.__USE_LOCOSCROLL_MOBILE__ = false;
window.__USE_LOCOSCROLL__ = $('.scroll-wrapper').length > 0;
if( window.__USE_LOCOSCROLL_MOBILE__ === undefined ) {
    window.__USE_LOCOSCROLL_MOBILE__ = true;
}

function __IS_DESKTOP__() {
    return window.innerWidth >= 1024;
}

function __UPDATE_ROOT_CSS_VAL__() {
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    document.documentElement.style.setProperty('--app-width', vw+'px');
    document.documentElement.style.setProperty('--app-height', vh+'px');
}

function __IS_IE__() {
    var agent = navigator.userAgent.toLowerCase();
    return (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf('msie') != -1);
}

if( __IS_IE__() ) $('html').addClass('is-ie');
else $('html').addClass('is-not-ie');

$(function() {
    __UPDATE_ROOT_CSS_VAL__();

    $(window).on('resize', function() {
        requestAnimationFrame(__UPDATE_ROOT_CSS_VAL__);
    });
});

/*!
 * module kgcbrand.common.brand-scroll
 * description locomotive-scroll
*/
define('common/brand-scroll', function(require, exports, module) {
    'use strict';

    var gsap = require('gsap').gsap,
    LocomotiveScroll = require('vendor/locomotive-scroll-4.0.6.min'),
        circle = require('vendor/circle-progress'),

    BrandScroll = function() {
        var prevScrollTop = 0;
        var scrollTop = 0;
        var scrollDirCheck = 0;
        var $header = $('#header');
        var $headerMaster = $('#header .header-master');

        window.__SCROLL_CONTAINER__ = window.__USE_LOCOSCROLL__ ? '.scroll-wrapper' : window;
        window.__LOCOSCROLL__ = null;
        window.__ONSCROLL_CBS__ = [];

        if( $('.scroll-wrapper').length > 0 ) {
            window.__LOCOSCROLL__ = new LocomotiveScroll({
                el: document.querySelector(window.__SCROLL_CONTAINER__),
                smooth: true,
                tablet: { smooth: window.__USE_LOCOSCROLL_MOBILE__ },
                smartphone: { smooth: window.__USE_LOCOSCROLL_MOBILE__ }
            });

            window.__LOCOSCROLL__.on('scroll', function() {
                prevScrollTop = scrollTop;
                scrollTop = window.__LOCOSCROLL__.scroll.instance.scroll.y;
                onScroll();
            });

        } else {
            $(window).on('scroll', function() {
                prevScrollTop = scrollTop;
                scrollTop = $(window).scrollTop();
                requestAnimationFrame( onScroll );
            });
        }

        onScroll();

        function onScroll() {
            scrollDirCheck += prevScrollTop < scrollTop ? 1 : -1;

            if( scrollTop > $headerMaster.height()*.5 ) {
                if( Math.abs(scrollDirCheck) > 5 ) {
                    if( scrollDirCheck > 0 ) {
                        if($header.hasClass('nav-open') || $("#header .utils .search").hasClass('active') ){
                            return scrollDirCheck = 0;
                        }

                        $header.addClass('hide');
                    }else{
                        if(scrollTop !== 0 && $header.hasClass("transparent")){
                            $header.removeClass("transparent")
                        }

                        $header.removeClass('hide');
                    }
                    scrollDirCheck = 0;
                }

            } else {
                $header.removeClass('hide');
                return scrollDirCheck = 0;
            }

            if(scrollTop <100 && $header.hasClass("setTransparent")){
                $header.addClass("transparent")
            }

            $(window.__ONSCROLL_CBS__).each( function(index, func) {
                func(scrollTop);
            });


            // 탑버튼
            topBtn();
        }

        // 탑버튼 스크립트로 페이지 삽입
        var $top_btn_tag = '<div id="btn_top"><div class="circle_progress"><a href="javascript:;" class="btn_top_txt"><img src="'+resourceDomain+'/img/common/ico_top_btn.svg" alt="top_button"></a></div></div>';
        if( $('#wrap').length ) {
            $('#wrap').append($top_btn_tag);

        } else if( $('.wrapper').length ) {
            $('.wrapper').append($top_btn_tag);
        }

        $('#btn_top').on('click', function(){
            if( window.__USE_LOCOSCROLL__ ) {
                window.__LOCOSCROLL__.scrollTo(0,0);
            }else {
                $('html,body').stop().animate({
                    scrollTop: 0
                }, 600);
            }
        });

        function topBtn(){
            var $btnTop = $('#btn_top');
            var $btnTopCircle = $btnTop.find('.circle_progress');
            var $footer = $('#footer');
            var marginBottom = 0;
            var footerTop = $(document).height() - $(window).height() - $footer.outerHeight();
            var gotoTopY = 0;

            $btnTopCircle.addClass('on fixed');
            progress();
            //progressCircle(0, 0);

            function progress() {
                var windowScrollTop = scrollTop;
                var docHeight = $(document).height();
                var windowHeight = $(window).height();
                var progress = (windowScrollTop / (docHeight - windowHeight - $footer.height())) * 100;

                if ($(window).width() < 1024) {
                    $btnTop.addClass('btn_top_m');
                    progressCircle(Math.round(progress) / 100, 50);
                    marginBottom = 18;
                    gotoTopY = parseInt(scrollTop) - footerTop + marginBottom;
                }else{
                    $btnTop.removeClass('btn_top_m');
                    progressCircle(Math.round(progress) / 100, 58);
                    if(progress >= 20){
                        $btnTop.fadeIn(300);
                    }else{
                        $btnTop.fadeOut(300);
                    }
                    marginBottom = 30;
                    gotoTopY = parseInt(scrollTop) - footerTop + marginBottom;
                }

                // 페이지 스크롤이 짧을 때
                if ($(document).height() - $(window).height() - $footer.outerHeight() < 0) {
                    $btnTop.hide();
                    return;
                }

                // footer 노출되는 위치에 따라 
                var b = 0;
                if( scrollTop < footerTop ){
                    b = marginBottom;
                    if( $btnTop.hasClass('btn_top_m') ){
                        $btnTop.removeClass('active');
                    }
                } else {
                    b = gotoTopY;
                    if( $btnTop.hasClass('btn_top_m') ){
                        $btnTop.addClass('active');
                    }
                }
                $btnTopCircle.css( {bottom:b} );
            }

            function progressCircle(_val, _size) {
                $btnTopCircle.circleProgress({
                    animation: false,
                    value: _val,
                    size: _size,
                    startAngle: -Math.PI / 4 * 2,
                    thickness: 2,
                    emptyFill: 'rgba(0, 0, 0, 0)',
                    fill: {color: '#bbbbbb'}
                });
            }

        }

    }

    module.exports = BrandScroll;
});

/*!
 * module kgcbrand.common.detect
 * description 디바이스 체크 모듈
*/
define('common/detect', function() {
    "use strict";

    var TABLET_MAX_WIDTH = 1024;
    var TABLET_MIN_WIDTH = 768;
    var Detect = new function() {
        this.ua = navigator.userAgent;
        this.isTouch = !!('ontouchstart' in window);
        this.isIOS = navigator.userAgent.match(/iPhone|iPad|iPod/i);
        this.isAndroid = !!navigator.userAgent.match(/Android/i);
        this.isMobile = !!(navigator.userAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || navigator.userAgent.match(/LG|SAMSUNG|Samsung/) != null);
        this.isTablet = TABLET_MIN_WIDTH <= window.innerWidth && window.innerWidth < TABLET_MAX_WIDTH;
        this.isDesktop = !this.isMobile && !this.isTablet && TABLET_MAX_WIDTH <= window.innerWidth;
        this.isIE = this.ua.indexOf('MSIE ') > 0 || !!this.ua.match(/Trident.*rv\:11\./);
    }

    return Detect;
});

/*!
 * module kgcbrand.common.parallax
 * description 등장 모션 모듈
*/
define('common/parallax', function(require, exports, module) {
    "use strict";
    var Animation = function() {
        var scrollTop = 0;
        var windowHeight = $(window).innerHeight();
        var $animationArea = $('.animation');
        var $pagingAnimation = $('.page_section.animation');
        var $btnCenter = $('.btn_center.animation');
        var $banner = $('.banner');
        var $bannerBg = $('.banner_bg');
        var $keyVisualImage = $('.kv_img');

        function init() {
            subRendingMotion();

            $(window).on('scroll.animation', scrollHandler);
            $(window).trigger('scroll.animation');
        }

        function subRendingMotion() {
            if( !!!$keyVisualImage.length ) return;

            $keyVisualImage.addClass('on');
            //gsap.fromTo( $('.sub_kv'), 0.7, {y:60, opacity:0}, {y:0, opacity:1, delay:0.2, ease:[0.77,0,0.175,1]} );
            // gsap.fromTo( $('.tab_menu li'), 0.5, {y:60, opacity:0}, {y:0, opacity:1, delay:1, stagger:0.08} )
        }

        function scrollHandler() {
            scrollTop = $(window).scrollTop();

            animation();
            parallax();
            parallaxBg();
        }

        function animation() {
            $animationArea.each( function() {
                if($(this).hasClass('on')) return;

                var offsetAmount = $(this).hasClass('fast') && $('html').hasClass('mobile') ? 1.2 : 0.95;

                var offsetY =  $(this).offset().top - scrollTop;
                if( offsetY < windowHeight*offsetAmount ) {
                    $(this).addClass('on');
                }
            });

            // 페이징, 버튼 좀더 빠르게 올라오게 처리
            if($pagingAnimation.length > 0){
                $pagingAnimation.each( function() {
                    var offsetY =  $(this).offset().top - scrollTop;
                    if( offsetY < windowHeight*1.2) {
                        $(this).addClass('on');
                    }
                });
            }
            if($btnCenter.length > 0){
                $btnCenter.each( function() {
                    var offsetY =  $(this).offset().top - scrollTop;
                    if( offsetY < windowHeight*1.2) {
                        $(this).addClass('on');
                    }
                });
            }
        }

        function parallax() {
            if( !!!$banner.length ) return;

            var parallaxT = $banner.offset().top - scrollTop;
            var parallaxH = $banner.height();
            if( windowHeight * 0.9 > parallaxT ) {
                gsap.to($('.banner img'), 1.75, {marginTop:(parallaxT - parallaxH) * 0.07, ease:Power4.easeOut});
            }
        }

        function parallaxBg() {
            if( !!!$bannerBg.length ) return;

            var parallaxBgT = $bannerBg.offset().top - scrollTop;
            var parallaxBgH = $bannerBg.height();
            if( windowHeight * 0.9 > parallaxBgT ) {
                gsap.to($('.banner_bg .img_wrap'), 0.4, {marginTop:(parallaxBgT - parallaxBgH) * 0.125, ease:Cubic.easeOut});
            }
        }

        init();
    }

    return Animation;
});

/*!
 * module kgcbrand.common.TabMenu
 * description 탭 메뉴 모듈
*/
define('common/tabMenu', function(require, exports, module) {
    "use strict";

    var gsap = require('gsap').gsap,
    Detect = require('common/detect'),
    TabMenu = function( tabMenu ) {
        if( typeof tabMenu === 'undefined' ) return;

        var hashIdx = 0;
        var windowHeight = $(window).innerHeight();
        var $header = $('#header');
        var $tabMenu = $(tabMenu);
        var $tabMenuLi = $tabMenu.find('> ul li');
        var isDepth1 = $tabMenu.hasClass('tab_menu');
        var $tabContent = $tabMenu.closest('.contents').find('.tab_content');
        if( !isDepth1 ) $tabContent = $tabMenu.closest('.section_wrap').find('.tab_box_content');
        var $keyVisualImages = $tabContent.find('.kv_img');
        var tabMenuHeight = $tabMenu.find('>ul').height()+33;   // tabMenu padding-top
        var offsetTop = 0, isMobile = $('html').hasClass('mobile');

        function init() {
            // mobile - scrollbar hide
            if( Detect.isMobile ) {
                $tabMenu.addClass('mobile');

                if($tabMenu.hasClass('tab_menu_box')) depth4fix();
            }

            $tabMenuLi.find('a').on('click', function() {
                if($(this).attr('href').indexOf('magicalwalk') >= 0) return;

                hashIdx = $(this).parent('li').index();
                $keyVisualImages.removeClass('on');
                $tabContent.eq(hashIdx).find('.kv_img').addClass('on');
                activeTab(hashIdx);

                if( isDepth1 ) {
                    // $('html,body').stop().animate( {scrollTop:0, duration:300} );
                    if( isMobile ) offsetTop = $tabMenu.closest('.kv_tab').position().top - tabMenuHeight;
                    // else offsetTop = $tabContent.eq(hashIdx).offset().top - tabMenuHeight;
                    else offsetTop = $header.height();

                    if( $(window).scrollTop() >= offsetTop ) {
                        $header.addClass('lock');

                        $('html,body').stop().animate( {scrollTop:offsetTop, duration:300}, function() {
                            setTimeout( function() {
                                // $tabMenu.closest('.kv_tab').addClass('fix');
                                $header.removeClass('lock');
                            }, 100 );
                        });
                    }

                    $('#gnb').data('tabClicked',true);
                    setTimeout( function() {
                        $('#gnb').data('tabClicked',false);
                    }, 10 );

                    // Button link change, language conversion
                    setTimeout( function() {
                        var lang = location.pathname.indexOf('/en') > -1 ? 'en' : 'kr';
                        var href = location.pathname + location.hash;
                        href = lang == 'en' ? href.replace('/en','') : '/en'+href;
                        $header.find('.lang a').attr('href',href);
                    }, 0 );

                    // Remove playing video from content
                    if( $tabContent.find('video').length > 0 ) {
                        $tabContent.find('video')[0].pause();
                    }

                    // Stop Youtube video from content
                    if( $tabContent.find('#video_player').length > 0 ) {
                        player.stopVideo();
                    }
                }
            });

            loadCheckHash();
        }

        function depth4fix(){
            if(!Detect.isMobile) return;
            // 1. 모바일에서 화면 너비보다 탭메뉴 너비가 긴경우
            // 2-1. 국문인 경우
            // 메뉴명 2글자인 메뉴 : 60px
            // 메뉴명 3글자인 메뉴 : 90px
            // 메뉴명 4-5글자인 메뉴 : 100px
            // 메뉴명 6글자 이상인 메뉴 : 120px
            // 2-2. 영문인 경우
            // 메뉴 너비 고정 X
            var targetBox = $tabMenu.find('ul')
            var realN = 0;
            var compareN = 0;
            var tabs = $tabMenu.find('ul li');
            for(var i = 0 ; i < tabs.length; i++){
                realN += tabs.eq(i).outerWidth(true);
            }

            compareN = window.getComputedStyle(targetBox[0])['padding-left'];
            compareN = compareN.replace('px','');
            compareN *= 2;

            var lang = location.pathname.indexOf('en') > -1 ? 'en' : 'kr';
            if(lang !== 'kr') return;

            if((targetBox.innerWidth() > 0) && (realN > targetBox.innerWidth() - compareN)){
                var elem = $('.tab_menu_box a');
                for(var i = 0; i < elem.length; i++){
                    var temp = elem.eq(i).find('span');
                    var targetLi = elem.eq(i).closest('li');

                    switch(temp.text().length){
                        case 2:
                            targetLi.css({'min-width':60+'px'});
                            break;
                        case 3:
                            targetLi.css({'min-width':90+'px'});
                            break;
                        case 4:
                            targetLi.css({'min-width':100+'px'});
                            break;
                        case 5:
                            targetLi.css({'min-width':100+'px'});
                            break;
                        default: // 6글자 이상
                            targetLi.css({'min-width':120+'px'});
                            break;
                    }
                }
            }
        }

        function activeTab( _idx ) {
            $tabMenuLi.removeClass('on');
            $tabMenuLi.eq(_idx).addClass('on');
            $tabContent.removeClass('on');
            $tabContent.find('.animation').removeClass('on');
            $tabContent.eq(_idx).addClass('on');

            if( $tabContent.hasClass('on') ) {
                $tabContent.find('.animation').each( function() {
                    var offsetTabY = $(this).offset().top - $(window).scrollTop();
                    if( windowHeight * 0.95 > offsetTabY ) {
                        $(this).addClass('on');
                    }
                });
            }

            if($tabContent.eq(_idx).find('.tab_menu_box').length > 0) depth4fix();
            centerTab( $tabMenu );
        }

        function centerTab( _tab ) {
            var scrollX = _tab.find('ul').scrollLeft(),
            currentBtn = _tab.find('ul>li.on'),
            currentX = currentBtn.offset().left,
            currentW = currentBtn.width(),
            posx = scrollX+currentX,
            halfW = ($(window).width()-currentW)/2 + 13;

            gsap.to( _tab.find('ul'), 0.7, {scrollLeft:posx-halfW, ease:Expo.easeOut} );
        }

        function loadCheckHash() {
            if( !isDepth1 ) return;

            if( location.hash.length > 0 && $tabMenu.length > 0 ) {
                $('.tab_menu li a').each( function() {
                    if( location.hash === $(this).attr('href') ) {
                        hashIdx = $(this).parent().index();
                    }
                });

                activeTab(hashIdx);

            } else {
                activeTab(0);
            }
        }

        init();
    }

    return TabMenu;
});

/*!
 * module kgcbrand.common.SubTab
 * description 서브 탭 메뉴 모듈
*/
define('common/subTab', function(require, exports, module) {
    "use strict";

    var SubTab = function( subTab ) {
        if( typeof subTab === 'undefined' ) return;

        var $tabMenu = subTab.find('.tab_menu ul');
        var offsetTop = subTab.offset().top - subTab.find('.tab_menu ul').height();
        var ableFixed = false;

        function init() {
            var $tabMenus = $tabMenu.find('li a');
            $tabMenus.on('click.subTab',clickTabMenus);
            $tabMenus.trigger('click.subTab');

            $(window).on('scroll.subTab', subTabScroll);
            $(window).trigger('scroll.subTab');
        }

        function clickTabMenus() {
            ableFixed = false;

            setTimeout( function() {
                subTab.parent().find('.tab_content').each( function( i, el ) {
                    if( $(el).hasClass('on') && $tabMenu.height() + $(el).height() > window.innerHeight ) {
                        ableFixed = true;
                    }
                });
            }, 0 );
        }

        function subTabScroll() {
            var isFixed = ableFixed && $(window).scrollTop() >= offsetTop;
            subTab[isFixed?'addClass':'removeClass']('fix');
        }


        init();
    }

    return SubTab;
});

/*!
 * module kgcbrand.common.NanoScroll
 * description 탭 메뉴 모듈
*/
define('common/nanoScroll', function(require, exports, module) {
    "use strict";

    var nanoScroll = require('nanoScroll'),
        Detect = require('common/detect'),
        NanoScroll = function(  ) {
        //if( typeof target === 'undefined' ) return;

        var g_$selBox = $('.gu_selectbox'),
            g_$selBtn = $('.gu_sort_name a'),
            g_$selBtnsList = $('.custom_scroll_content a'),
            g_$selBoxList = $('.custom_scroll_content > div');

        function init() {
            $('.gu_custom_scroll').nanoScroller();
            addEvents();
            calcHeight();
        }

        function addEvents() {
            // selectbox on/off
            g_$selBtn.on('click', function(e) {
                e.stopPropagation();

                g_$selBox.removeClass('on');
                $(this).parent().next('.gu_selectbox').addClass('on');

                $('body').on('click touchstart', function(){

                    if (!$(event.target).closest('.gu_selectbox').length) {
                        g_$selBox.removeClass('on');
                        $('body').off('click touchstart');
                    }
                })
            });



            // active selectbox
            g_$selBtnsList.on('click', function() {

                var m_$selActiveName = $(this).parents('.gu_selectbox').prev('.gu_sort_name').find('a');
                g_$selBox.removeClass('on');
                $(this).siblings().removeClass('on');
                $(this).addClass('on');

                if(g_$selBox.find('.custom_scroll_content div').length === 0){
                    m_$selActiveName.html($(this).html());
                }
            });



        }

        /* 높이 계산 */
        function calcHeight() {
            g_$selBox.each(function() {
                var m_aLen = $(this).find(g_$selBtnsList).length,
                    m_divLen = $(this).find(g_$selBoxList).length,
                    m_aH = $(this).find(g_$selBtnsList).innerHeight(),
                    m_divH = $(this).find(g_$selBoxList).innerHeight(),
                    m_selectH_a = (m_aH*m_aLen),
                    m_selectH_div = (m_divH*m_divLen);

                if (m_aLen > 0) {
                    if(g_$selBox.find('.custom_scroll_content div').length !== 0){
                        $(this).height((m_selectH_div));
                    }else{
                        $(this).height(m_selectH_a);
                    }
                }
            });
        }

        init();
    }

    return NanoScroll;
});

/*!
 * module kgcbrand.common.MousePointer
 * description 마우스 포인터 모듈
*/
define('common/mousePointer', function(require, exports, module) {
    "use strict";

    var gsap = require('gsap').gsap,
    Detect = require('common/detect'),
    Swiper = require('vendor/swiper-5.4.5.min'),
    MousePointer = function( swiperContainer, opts ) {
        if( typeof swiperContainer === 'undefined' ) return;
        if( $('html').hasClass('mobile') || $('html').hasClass('tablet') ) return;

        var $swiperContainer = $(swiperContainer);
        var $cursor = createCursor('#cursor');
        var $arrowLeft = $cursor.find('.arrow-left');
        var $arrowRight = $cursor.find('.arrow-right');
        var mouseX=0, mouseY=0, currentX=0, currentY=0;
        var cursorW=58, cursorH=26;
        if( !Detect.isIE && location.href.indexOf('people-view') > 0 ) {
            cursorW=0, cursorH=0;
        }
        var cursorScale=0, dragActive=false;

        function createCursor( el ) {
            if( $(el).length > 0 ) return $(el);

            var $innerCursor = $('<div/>').addClass('cursor-inner');
            var $cursor = $('<div/>').attr('id',el.replace('#',''));
            $cursor.append( $innerCursor );
            var $arrowL = $('<div/>').addClass('cursor-arrow arrow-left');
            $arrowL.append( $('<div/>').addClass('arrow-inner') );
            $innerCursor.append( $arrowL );
            var $arrowC = $('<div/>').addClass('cursor-centre');
            $innerCursor.append( $arrowC );
            var $arrowR = $('<div/>').addClass('cursor-arrow arrow-right');
            $arrowR.append( $('<div/>').addClass('arrow-inner') );
            $innerCursor.append( $arrowR );
            $('body').append( $cursor );
            return $cursor;
        }

        $(window).on('mouseenter mousemove', function( evt ) {
            mouseX = evt.clientX;
            mouseY = evt.clientY;

            if( Detect.isIE ) {
                gsap.to( $cursor, {x:mouseX-(cursorW*0.5), y:mouseY-(cursorH*0.5), ease:Power1.easeOut, overwrite:1, duration:0.76} );
            }
        });

        $swiperContainer.on('mouseenter', function() {
            gsap.to( $cursor, {autoAlpha:1, duration:0.3, onComplete:function() {
                dragActive = true;
            }});
        });

        $swiperContainer.on('mouseup', function() {
            $cursor.removeClass('grab');
        });

        $swiperContainer.on('mouseleave', function() {
            gsap.to( $cursor, {autoAlpha:0, duration:0.3, onComplete:function() {
                dragActive = false;
            }});
        });

        var swiper = new Swiper(swiperContainer, opts||{});
        swiper.on('touchStart', function() {
            if( !Detect.isIE ) $cursor.addClass('grab');
        });

        swiper.on('touchMove', function( evt ) {
            mouseX = evt.clientX;
            mouseY = evt.clientY;
        });

        swiper.on('touchEnd', function() {
            if( !Detect.isIE ) $cursor.removeClass('grab');
        });

        if( !Detect.isIE ) {
            animate();
        }

        function animate() {
            // if( !dragActive ) return;

            var x = mouseX-(cursorW*0.5) - currentX;
            var y = mouseY-(cursorH*0.5) - currentY;
            currentX += x / 10;
            currentY += y / 10;
            var s = 1 - Math.abs(x/1000);
            if( s < 0.6 ) s = 0.6;
            $cursor.css( {transform:'translate3d(-50%,-50%,0) translate3d('+currentX+'px,'+currentY+'px,0) scaleY('+s+')'} );
            var leftX = ( x > 0 ) ? 0 : x;
            $arrowLeft.css( {transform:'translate3d('+leftX/6+'px,'+y*1/10+'px,0)'} );
            var rightX = ( x < 0 ) ? 0 : x;
            $arrowRight.css( {transform:'translate3d('+rightX/6+'px,'+y*1/10+'px,0)'} );

            requestAnimationFrame(animate);
        }

        // product & exception career
        if( swiperContainer === '#magicMallProductList' && $('#productMagicMall').length > 0 ) {
            loop();
        }

        function loop() {
            var alpha = 1 + swiper.translate/200;
            gsap.set('#productMagicMall .product-desc', {alpha:alpha});
            requestAnimationFrame(loop);
        }
    }

    return MousePointer;
});

/*!
 * module kgcbrand.common.boardTab
 * description 게시판 탭 메뉴 모듈
*/
define('common/boardTab', function(require, exports, module) {
    "use strict";

    var BoardTab = function( boardTab ) {
        if( typeof boardTab === 'undefined' ) return;

        var $tabMenu = $(boardTab);
        var $masonryLayout = $('.masonry-layout');

        if( $masonryLayout.length > 0 ) {
            require(['vendor/imagesloaded-4.1.3.min', 'vendor/isotope'], function() {
                $masonryLayout.each( function() {
                    var _this = $(this);
                    // 이미지 로드가 다 된 후.. masonry 실행.
                    if( _this.find('img').length > 0 ) {
                        _this.imagesLoaded( function() {
                            masonryLayoutActive(_this);
                        });

                    // 이미지가 없을 경우.. masonry 바로 실행.
                    } else {
                        masonryLayoutActive(_this);
                    }
                });

                function masonryLayoutActive(elm) {
                    elm.isotope({
                        itemSelector: 'li',
                        percentPosition: true,
                        transitionDuration: 0,   // 애니매이션 효과 없음.
                        masonry: {
                            columnWidth: 'li'
                        }
                    });

                }
            });
        }

        var $tabMenus = $tabMenu.find('>li.sort_item');
        $tabMenus.on('click', function() {
            // 버튼 활성화 표시
            $(this).addClass('active').siblings('li.sort_item').removeClass('active');
            // 활성화된 패널 표시
            var idx = $(this).index();
            $('.sort_list_panel').eq(idx).show().siblings('.sort_list_panel').hide();

            // MasonryLayout이 있을경우 실행.
            if( $masonryLayout.length > 0 ) {
                $masonryLayout.isotope('reloadItems').isotope({
                    sortBy: 'original-order',
                    transitionDuration: 0
                });
            }
        });
    }

    return BoardTab;
});