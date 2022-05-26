
define('home/app', function(require, exports, module) {
    'use strict';

    var gsap = require('gsap').gsap,
        lottie = require('vendor/lottie-5.6.5.min'),
        Plyr = require('vendor/plyr.polyfilled'),
        ScrollTo = require('vendor/ScrollToPlugin-3.4.2.min'),
        ScrollTrigger = require('vendor/ScrollTrigger-3.4.2.min').ScrollTrigger,
        Swiper = require('vendor/swiper-5.2.1.min'),
        CustomEase = require('vendor/gsap/CustomEase.min').CustomEase,
        Flip = require('vendor/gsap/Flip.min').Flip,
        swipe = require('vendor/jquery.touchSwipe.min'),
        Home = function( $wrap ) {

            var wellnessInit = false;

            function loaded() {
                window.__USE_LOCOSCROLL__ = true;
                window.__USE_LOCOSCROLL_MOBILE__ = true;

                initScroll();
                startMotionIntro();
                initHomeSlider();
                sliderVideoResize();
                addEvents();
                brand();
                wellnessBook();
                product();
                eventList();
                sns();
            }

            function initScroll() {
                gsap.registerPlugin(ScrollTrigger);
                ScrollTrigger.config( {limitCallbacks:true} );

                if( window.__USE_LOCOSCROLL__ ) {
                    window.__LOCOSCROLL__.scrollTo( 0, 0, {duration:0} );
                    window.__LOCOSCROLL__.on('scroll', ScrollTrigger.update);

                    ScrollTrigger.scrollerProxy(window.__SCROLL_CONTAINER__, {
                        scrollTop: function(value) {
                            return arguments.length ? window.__LOCOSCROLL__.scrollTo(value,0,0) : window.__LOCOSCROLL__.scroll.instance.scroll.y;
                        },
                        getBoundingClientRect: function() {
                            return {top: 0, left: 0, width: window.innerWidth, height: window.innerHeight};
                        },
                        pinType: function() {
                            return document.querySelector(window.__SCROLL_CONTAINER__).style.transform ? 'transform' : 'fixed';
                        }
                    });

                    ScrollTrigger.addEventListener('refresh', function() {
                        window.__LOCOSCROLL__.update()
                    });

                    window.__LOCOSCROLL__.on('scroll', function() {
                        onScroll();
                    })

                    ScrollTrigger.refresh();

                }
            }

            function onScroll() {
                if (wellnessInit) return;
                if($('.wellness-thumb').length > 0) {
                    var wellnessT = $('.wellness-thumb').offset().top;
                    if (wellnessT < 500) wellnessPC();
                }

            }


            function startMotionIntro() {
                var customEase = CustomEase.create("custom", "M0,0 C0.29,0 0.333,-0.001 0.404,0.084 0.473,0.167 0.466,0.362 0.498,0.502 0.518,0.592 0.537,0.806 0.6,0.9 0.675,1.011 0.704,1 1,1 ");
                // customEase = Quint.easeInOut;
                var $homeIntro = $('.home-intro');
                var $logo1 = $('.logo1', $homeIntro);
                var $logo2 = $('.logo2', $homeIntro);
                var $curtain = $('.curtain', $homeIntro);
                var introBgBack = $('.home-intro-bg--back', $homeIntro);
                var bgDimmed = $('.bg-dimmed', $homeIntro)
                var introBgOver = $('.home-intro-bg--over', $homeIntro);

                var tl = gsap.timeline({
                    onComplete: onComplete,
                })
                    .to('body', {autoAlpha:1, duration:.25})
                    .from($('.char', $logo1), {y:400, duration:1, ease:Quint.easeOut, stagger: .2}, 0)
                    .from($('.char', $logo2), {y:400, duration:1, ease:Quint.easeOut, stagger: .2}, 0)
                    .to($('.curtain-col', $curtain), {height:'0%', duration:1.5, ease:customEase, onComplete:function(){
                        $curtain.remove();
                    }}, 1.5)
                    .fromTo(bgDimmed, {autoAlpha:0}, {autoAlpha:1, duration:2}, 3)
                    .to($('.bg-inner', introBgOver), {scale:1 , duration:2, ease:customEase, onStart:function(){
                        var state = Flip.getState($('.bg-inner', introBgOver));
                        $('.bg-inner', introBgOver).addClass('compact');
                        Flip.from(state, {duration: 2, ease: customEase});
                    }}, 3)
                    // .to(introBgOver, {top: paddingTop, left:padding, right:padding, bottom:padding , duration:2, ease:customEase}, 3)
                    .fromTo(introBgBack, {width:'100%'}, {width:'0%', duration:2, ease:customEase}, 3)

                function onComplete() {
                    if ( $('body').hasClass('start') ) return;
                    $('body').addClass('start');
                    introBgOver.remove();
                    setTimeout(function(){
                        $(window).trigger('resize');
                        if ( window.__USE_LOCOSCROLL__ ) window.__LOCOSCROLL__.update();

                    }, 100);



                    gsap.to($homeIntro, {autoAlpha:0, duration:.4, onComplete:function(){

                    }});
                    // $homeIntro.remove();

                    startHomeSlide();

                    window.__LOCOSCROLL__.on('scroll', function(){
                        var $scrollBar = $('.home-main-slider .scrolldown');
                        var $scrollWrapper = $('.scroll-wrapper');
                        var agent = navigator.userAgent.toLowerCase();
                        var objPos = $scrollWrapper[0].getBoundingClientRect();
                        var objPosY = objPos['top'];
                        var wWidth = $(window).width();
                        $(window).resize(function(){
                            wWidth = $(window).width();
                        })

                        if(wWidth > 1022){
                            if( agent.indexOf('trident') != -1 ){
                                if(objPosY < -180){
                                    $scrollBar.fadeOut(500);
                                }else{
                                    $scrollBar.fadeIn(500);
                                }
                            }else{
                                if(objPosY < -180){
                                    $scrollBar.fadeOut(500);
                                }else{
                                    $scrollBar.fadeIn(500);
                                }
                            }
                        }else{
                            $scrollBar.hide();
                        }

                    })

                }


                if (location.hash =='#debug') onComplete();

            }

            function addEvents() {
                $('.home-section-header[data-motion="true"]').each(function(){
                    var tl = gsap.timeline({
                        scrollTrigger: {
                            scroller: window.__SCROLL_CONTAINER__,
                            trigger: this,
                            start: 'top 80%',
                            end: 'bottom bottom',
                        }
                    })
                        .fromTo($(' > *', this), {autoAlpha:0, y:'50px'}, {autoAlpha:1, y:'0px', duration:2, ease:Quint.easeOut, stagger:.2});
                });
                $('.home-section-content[data-motion="true"]').each(function(){


                    if ($(this).hasClass('from-li-bottom')) {
                        $('li > *', this).each(function(index){
                            var tl = gsap.timeline({
                                scrollTrigger: {
                                    scroller: window.__SCROLL_CONTAINER__,
                                    trigger: this,
                                    start: 'top 80%',
                                    end: 'bottom bottom',
                                }
                            })
                            tl.fromTo(this, {autoAlpha:0, y:'20vh'}, {autoAlpha:1, y:'0vh', duration:2, ease:Quint.easeOut, stagger:.2})
                        })
                    }
                    if ($(this).hasClass('from-right')) {
                        var tl = gsap.timeline({
                            scrollTrigger: {
                                scroller: window.__SCROLL_CONTAINER__,
                                trigger: this,
                                start: 'top 80%',
                                end: 'bottom bottom',
                            }
                        })
                        tl.fromTo(this, {autoAlpha:0, x:'40vw'}, {autoAlpha:1, x:'0vw', duration:2, ease:Quint.easeOut})
                    }
                })
            }


            //slide
            var currentSlideItem ;
            var prevSlideItem;
            var $mainSlider, $slides, $slideNav;

            function initHomeSlider() {
                $('.slide-nav a').on('click', function(e){
                    e.preventDefault();
                    var target = $(this).attr('href')
                    showSlide($(target));
                })
            }

            function startHomeSlide() {
                $mainSlider = $('.home-main-slider');
                $slides = $('.slides', $mainSlider);
                $slideNav = $('.slide-nav', $mainSlider);
                currentSlideItem = $('.slide-item:eq(0)', $slides);
                showHomeSlide(true);
                gsap.fromTo($slideNav, {autoAlpha:0}, {autoAlpha:1, duration:1});
            }

            function showHomeSlide(isFirst) {

                if (prevSlideItem) prevSlideItem.addClass('prev').siblings().removeClass('prev');
                currentSlideItem.addClass('current').siblings().removeClass('current');
                var slideId = currentSlideItem.attr('id');
                var delay = (isFirst) ? 0 : .8;

                gsap.killTweensOf('.home-main-slider .slide-nav .bar')
                gsap.set('.home-main-slider .slide-nav .bar', {width:'0%'})
                gsap.killTweensOf('.home-main-slider .slide-item-outer')
                gsap.killTweensOf('.home-main-slider .slide-item-outer .slide-item-inner')
                gsap.killTweensOf('.home-main-slider .slide-content .slide-title .sentence span')
                gsap.killTweensOf('.home-main-slider .slide-content .btn-cta')

                var tl = gsap.timeline()


                // tl.to($('.slide-content', currentSlideItem), {autoAlpha:1, duration:1.4}, 0)
                tl.fromTo($('.slide-content .slide-title .sentence span', currentSlideItem), {autoAlpha:0, y:'100%'}, {autoAlpha:1, y:'0%', duration:1.4, ease:Quint.easeOut, stagger:.2}, delay)
                    .fromTo($('.slide-content .btn-cta', currentSlideItem), {autoAlpha:0, y:'30px'}, {autoAlpha:1, y:'0px', duration:1.4, ease:Quint.easeOut}, delay + .6)

                if ( isFirst ) {

                } else {
                    if ( prevSlideItem ) {
                        tl.fromTo($('.slide-item-outer .slide-item-inner', prevSlideItem), {x:'0%'}, {x:'0%', duration:1, ease:Quint.easeInOut}, 0)
                    }
                    tl.fromTo($('.slide-item-outer', currentSlideItem), {width:'0%'},{width:'100%', duration:1, ease:Quint.easeInOut}, 0)
                    tl.fromTo($('.slide-item-outer .slide-item-inner', currentSlideItem), {x:'0%'}, {x:'0%', duration:1, ease:Quint.easeInOut}, 0)
                    tl.fromTo($('.slide-bg', currentSlideItem), {scale:2}, {scale:1, duration:1, ease:Quint.easeInOut}, 0)

                }
                var currentSlideNav = $('.slide-nav-item[href="#' + slideId + '"]', $mainSlider)
                $('.slide-nav li', $mainSlider).removeClass('active');
                currentSlideNav.closest('li').addClass('active');

                var bar = $('.bar', currentSlideNav);
                var duration = parseInt(currentSlideItem.attr('data-duration'));
                duration = (duration && duration > 0) ? duration : 5;
                gsap.fromTo(bar, {width:'0%'}, {width:'100%', duration:duration, ease:Linear.easeNone, onComplete:showNextSlide});

                var video = $('video', currentSlideItem);
                video.each(function(){
                    this.currentTime = 0;
                    this.play();
                });
            }


            function showSlide(slide) {
                prevSlideItem = currentSlideItem;
                currentSlideItem = slide;
                if ( !currentSlideItem[0] ) {
                    currentSlideItem = $('.slide-item:eq(0)', $slides);
                }

                showHomeSlide(false);
            }

            function showNextSlide() {

                var slide = currentSlideItem.next();
                if ( !slide[0] ) {
                    slide = $('.slide-item:eq(0)', $slides);
                }

                showSlide(slide);
            }

            function sliderVideoResize() {
                $('.home-main-slider .slide-bg').each(function(index) {
                    var width = $(this).width();
                    var height = $(this).height();
                    var video = $('video', this);
                    var videoWidth = video.attr('width');
                    var videoHeight = video.attr('height');
                    var scaleX = width / videoWidth;
                    var scaleY = height / videoHeight;
                    var scale = Math.max(scaleX, scaleY);
                    video.css('width', videoWidth * scale);
                    video.css('height', videoHeight * scale);
                });
            }

            $(window).on('resize', function(){
                requestAnimationFrame(sliderVideoResize);
            });

            function brand() {
                var isTrans = false;
                var TOTAL_BRAND_COUNT = $('.home-section-brand .image-c .brand').length;
                $('.home-section-brand .swiper-slide').clone().appendTo('.home-section-brand .swiper-wrapper');
                $('.home-section-brand .swiper-slide').clone().appendTo('.home-section-brand .swiper-wrapper');
                $('.home-section-brand .swiper-slide').each(function(index, slide){
                    $(slide).attr('data-index', index);
                })
                var swipeOn = ($('html').hasClass('no-mobile')) ? 'slideChangeTransitionStart' : 'slideChangeTransitionEnd';
                var onFunc = {
                    slideNextTransitionStart: function() {
                        $('.home-section-brand .brand-images').attr('data-dir', 'next');

                    },
                    slidePrevTransitionStart: function() {
                        $('.home-section-brand .brand-images').attr('data-dir', 'prev');
                    },

                };
                onFunc[swipeOn] = function() {
                    var currentSwiperSlide = $('.home-section-brand .swiper-slide.swiper-slide-active');
                    var logoItem = $('.logo-item', currentSwiperSlide);
                    var brandIndex = $('a', logoItem).attr('data-brand');
                    showBrand(brandIndex);
                }

                var swiper = new Swiper('.logos .swiper-container', {
                    slidesPerView: 'auto',
                    spaceBetween: 34,
                    loop: true,
                    centeredSlides: true,
                    slideToClickedSlide: true,
                    preventClicks:true,
                    touchRatio: .5,
                    speed: 300,
                    breakpoints: {
                        768: {
                            spaceBetween: 34,
                        },
                        1024: {
                            spaceBetween: 60,
                        },
                        1281: {
                            spaceBetween: 60,
                        },
                    },
                    on: onFunc
                });

                var currentBrandIndex = Math.round(Math.random() * TOTAL_BRAND_COUNT);
                currentBrandIndex = Math.min(TOTAL_BRAND_COUNT, Math.max(1, currentBrandIndex));
                var firstSlideTo = (currentBrandIndex > TOTAL_BRAND_COUNT) ? currentBrandIndex : currentBrandIndex + TOTAL_BRAND_COUNT;

                swiper.slideToLoop(firstSlideTo);
                setTimeout(function(){
                    swiper.update();
                    swiper.slideToLoop(firstSlideTo - 1);
                    showBrand(currentBrandIndex);
                }, 400)

                $('.home-section-brand .logos a').on('click', function(e) {
                    e.preventDefault();
                    // var swiperSlide = $(this).closest('.swiper-slide');
                    // var index = parseInt(swiperSlide.attr('data-index'));
                    // swiper.slideToLoop(index);
                });

                function showBrand(brandIndex) {
                    currentBrandIndex = brandIndex;
                    gsap.set('.home-section-brand .brand', {zIndex:1});

                    $('.home-section-brand .image').each(function(index){
                        var image = this;
                        var prevBrand = $('.brand.active', image);
                        var currentBrand = $('.brand' + currentBrandIndex, image);

                        gsap.set(prevBrand, {zIndex:2});
                        gsap.set(currentBrand, {zIndex:3});
                        prevBrand.removeClass('active');
                        currentBrand.addClass('active');


                        gsap.fromTo(currentBrand, {width:'0%'}, {width:'100%', duration:1, ease:Quint.easeInOut, overwrite: true, delay:index * 0, onComplete:function(){
                            // gsap.set(prevBrand, {zIndex:1});
                        }});

                        gsap.fromTo($('.img', currentBrand), {backgroundSize:'140% 140%'}, {backgroundSize:'100% 100%', duration:1, ease:Quint.easeInOut, overwrite: true, delay:index * 0})

                    });

                    var bgColor = $('.home-section-brand .image-c .brand' + currentBrandIndex).attr('data-bg');
                    var brandLink = $('.home-section-brand .image-c .brand' + currentBrandIndex).attr('data-link');
                    gsap.to('.home-section-brand', {backgroundColor:bgColor, duration:1})
                    $('.brand-link').attr('href', brandLink);

                }

                $(".home-section-brand .brand-images").swipe( {
                    //Generic swipe handler for all directions
                    swipe:function(event, direction, distance, duration, fingerCount, fingerData) {
                        if ( direction == 'left' ) {
                            swiper.slideNext(300);
                        }

                        if ( direction == 'right') {
                            swiper.slidePrev(300);
                        }
                    }
                });
            }

            function wellnessBook() {
                gsap.timeline({
                    scrollTrigger: {
                        scroller: window.__SCROLL_CONTAINER__,
                        trigger: '.home-section-wellnessbook',
                        start: 'top top',
                        end: 'bottom bottom',
                        pin: '.home-section-wellnessbook .col-left',
                        pinSpacing: false,
                    }
                });

                gsap.timeline({
                    scrollTrigger: {
                        scroller: window.__SCROLL_CONTAINER__,
                        trigger: '.wellnessbook-header-mobile',
                        start: 'top 70%',
                        end: 'bottom bottom'
                    }
                })
                    .fromTo('.wellnessbook-header-mobile .wellnessbook-header-mobile-bg', {width:'0%'}, {width:'100%', duration:1.4, ease:Quint.easeInOut}, 0)
                    .fromTo('.wellnessbook-header-mobile .home-section-header > *', {autoAlpha:0, y:'50px'}, {autoAlpha:1, y:'0px', duration:2, ease:Quint.easeOut, stagger:.2}, .4)
                    .fromTo('.wellnessbook-header-mobile .wellness-thumb-mobile', {autoAlpha:0, y:'30%'}, {autoAlpha:1, y:'0%', duration:2, ease:Quint.easeOut, stagger:.2, onComplete:function() {
                        wellnessMobile();
                    }}, .8)

                //slide - mobile
                function wellnessMobile() {
                    var wellnessCurrentSlideItem, wellnessCurrentBG;
                    var prevWellnessSlideItem, prevWellnessSlideBG;
                    var $wellnessSlider, $wellnessSlides, $wellnessBGs;

                    function initWellnessSlideMob() {
                        showWellnessSlideMob(true);

                        $('.wellness-mobile .wellness-thumb-mobile a').eq(0).addClass('current').removeClass('first');
                        $('.wellness-mobile .wellness-thumb-mobile a').last().addClass('prev');
                        $('.wellness-mobile .data-bg-mobile').eq(0).addClass('current').removeClass('first');
                        $('.wellness-mobile .data-bg-mobile').last().addClass('prev');

                        $('.wellness-slide-nav-mobile a').on('click', function(e){
                            e.preventDefault();
                            var target = $(this).attr('href')
                            setWellnessSlideMob($(target));
                        })
                    }

                    function setWellnessSlideMob(slide) {
                        prevWellnessSlideItem = wellnessCurrentSlideItem;
                        wellnessCurrentSlideItem = slide;
                        if ( !wellnessCurrentSlideItem[0] ) {
                            wellnessCurrentSlideItem = $('.wellness-mobile .wellness-thumb-mobile a:eq(0)', $wellnessSlides);
                            wellnessCurrentBG = $('.data-bg-mobile:eq(0)');
                        }

                        showWellnessSlideMob(false);
                    }

                    function showWellnessSlideMob(isFirst) {
                        if ( isFirst ) {
                            wellnessCurrentSlideItem = $('.wellness-mobile .wellness-thumb-mobile a:eq(0)', $wellnessSlides);
                            wellnessCurrentBG = $('.wellness-mobile .data-bg-mobile:eq(0)', $wellnessBGs);
                        }

                        if (wellnessCurrentSlideItem.hasClass('current')) return;

                        var slideId = wellnessCurrentSlideItem.attr('id');
                        wellnessCurrentBG = $('.wellness-mobile .data-bg-mobile.'+slideId);

                        if (prevWellnessSlideItem) {
                            prevWellnessSlideBG = $('.wellness-mobile .data-bg-mobile.'+prevWellnessSlideItem.attr('id'));
                            prevWellnessSlideItem.addClass('prev').siblings().removeClass('prev');
                            prevWellnessSlideBG.addClass('prev').siblings().removeClass('prev');
                        }
                        wellnessCurrentSlideItem.addClass('current').siblings().removeClass('current');
                        wellnessCurrentBG.addClass('current').siblings().removeClass('current');

                        gsap.killTweensOf('.wellness-mobile .wellness-slide-nav-mobile .bar')
                        gsap.set('.wellness-mobile .wellness-slide-nav-mobile .bar', {width:'0%'})
                        gsap.killTweensOf('.wellness-mobile wellness-thumb-mobile a')
                        gsap.killTweensOf('.wellness-mobile .left-background .data-bg-mobile')

                        var tl = gsap.timeline()

                        if ( isFirst ) {

                        } else {
                            tl.fromTo($(wellnessCurrentSlideItem), {width:'0%'},{width:'100%', duration:1, ease:Quint.easeInOut}, 0);
                            tl.fromTo(wellnessCurrentBG, {width:'0%'},{width:'100%', duration:1, ease:Quint.easeInOut}, 0);
                        }
                        var currentSlideNav = $('.wellness-mobile .wellness-slide-nav-item[href="#' + slideId + '"]', $wellnessSlider);
                        $('.wellness-mobile .wellness-slide-nav-mobile li', $wellnessSlider).removeClass('active');
                        currentSlideNav.closest('li').addClass('active');

                        var bar = $(currentSlideNav).find('.bar');
                        gsap.fromTo(bar, {width:'0%'}, {width:'100%', duration:5, ease:Linear.easeNone, onComplete:showNextWellnessSlideMob});
                    }

                    function showNextWellnessSlideMob() {
                        var slide = wellnessCurrentSlideItem.next();
                        if ( !slide[0] ) {
                            slide = $('.wellness-mobile .wellness-thumb-mobile a:eq(0)', $wellnessSlides);
                        }

                        setWellnessSlideMob(slide);
                    }

                    initWellnessSlideMob();
                }
            }

            //slide - pc
            function wellnessPC() {
                var wellnessCurrentSlideItem, wellnessCurrentBG;
                var prevWellnessSlideItem, prevWellnessSlideBG;
                var $wellnessSlider, $wellnessSlides, $wellnessBGs;
                wellnessInit = true;

                function initWellnessSlide() {
                    showWellnessSlide(true);
                    $('.wellness-pc .wellness-slide-item').eq(0).addClass('current').removeClass('first');
                    $('.wellness-pc .wellness-slide-item').last().addClass('prev');
                    $('.wellness-pc .data-bg').eq(0).addClass('current').removeClass('first');
                    $('.wellness-pc .data-bg').last().addClass('prev');
                    $('.wellness-slide-nav a').on('click', function(e){
                        e.preventDefault();
                        var target = $(this).attr('href')
                        setWellnessSlide($(target));
                    })
                }

                function setWellnessSlide(slide) {
                    prevWellnessSlideItem = wellnessCurrentSlideItem;
                    wellnessCurrentSlideItem = slide;
                    if ( !wellnessCurrentSlideItem[0] ) {
                        wellnessCurrentSlideItem = $('.wellness-pc .wellness-slide-item:eq(0)', $wellnessSlides);
                        wellnessCurrentBG = $('.wellness-pc .data-bg:eq(0)');
                    }

                    showWellnessSlide(false);
                }

                function showWellnessSlide(isFirst) {
                    if ( isFirst ) {
                        wellnessCurrentSlideItem = $('.wellness-pc .wellness-slide-item:eq(0)', $wellnessSlides);
                        wellnessCurrentBG = $('.wellness-pc .data-bg:eq(0)', $wellnessBGs);
                    }

                    if (wellnessCurrentSlideItem.hasClass('current')) return;


                    var slideId = wellnessCurrentSlideItem.attr('id');
                    wellnessCurrentBG = $('.wellness-pc .data-bg.'+slideId);

                    if (prevWellnessSlideItem) {
                        prevWellnessSlideBG = $('.data-bg.'+prevWellnessSlideItem.attr('id'));
                        prevWellnessSlideItem.addClass('prev').siblings().removeClass('prev');
                        prevWellnessSlideBG.addClass('prev').siblings().removeClass('prev');
                    }
                    wellnessCurrentSlideItem.addClass('current').siblings().removeClass('current');
                    wellnessCurrentBG.addClass('current').siblings().removeClass('current');

                    gsap.killTweensOf('.wellness-pc .wellness-slide-nav .bar')
                    gsap.set('.wellness-pc .wellness-slide-nav .bar', {width:'0%'})
                    gsap.killTweensOf('.wellness-pc .wellness-thumb')
                    gsap.killTweensOf('.wellness-pc .left-background .data-bg')

                    var tl = gsap.timeline()

                    if ( isFirst ) {

                    } else {
                        tl.fromTo(wellnessCurrentSlideItem.find('.wellness-thumb'), {width:'0%'},{width:'100%', duration:1, ease:Quint.easeInOut}, 0);
                        tl.fromTo(wellnessCurrentBG, {width:'0%'},{width:'100%', duration:1, ease:Quint.easeInOut}, 0);
                    }
                    var currentSlideNav = $('.wellness-pc .wellness-slide-nav-item[href="#' + slideId + '"]', $wellnessSlider);
                    $('.wellness-pc .wellness-slide-nav li', $wellnessSlider).removeClass('active');
                    currentSlideNav.closest('li').addClass('active');

                    var bar = $('.bar', currentSlideNav);
                    gsap.fromTo(bar, {width:'0%'}, {width:'100%', duration:5, ease:Linear.easeNone, onComplete:showNextWellnessSlide});
                }

                function showNextWellnessSlide() {
                    var slide = wellnessCurrentSlideItem.next();
                    if ( !slide[0] ) {
                        slide = $('.wellness-pc .wellness-slide-item:eq(0)', $wellnessSlides);
                    }

                    setWellnessSlide(slide);
                }

                initWellnessSlide();
            }

            function product() {
                $(".product-list .price .num").each(function() {
                    var $this   = $(this),
                        val     = $this.text();
                    val = val.replace(/,/gi, "").split("").reverse().join("").replace(/(\d{3})(?=\d)/gi, "$1,").split("").reverse().join("");
                    $this.text(val);
                });
                (function(){
                    var swiper = new Swiper('.product-list .swiper-container', {
                        slidesPerView: 'auto',
                        spaceBetween: 18,
                        freeMode: true,
                        breakpoints: {
                            768: {
                                spaceBetween: 20,
                            },
                            1024: {
                                spaceBetween: 30,
                            },
                            1281: {
                                spaceBetween: 40,
                            },
                        },
                    });
                })();
            }

            function eventList() {
                function masonry() {

                    if ($('.home-section-event').length > 0) {
                        var top = $('.home-section-event .home-section-header').offset().top - $('.home-section-event .home-section-content').offset().top

                        if (window.innerWidth <= 767) top = -50;
                        $('.event-list ul li').each(function (index, item) {
                            var posX = (index % 2 == 0) ? '0%' : '50%';
                            var posY = (index % 2 == 1 && index < 2) ? top : 0;
                            var upperItem = $(item).prev().prev();
                            if (upperItem && upperItem[0]) {
                                posY += upperItem.position().top + upperItem.outerHeight();
                            }
                            $(item).css({
                                'position': 'absolute',
                                'left': posX,
                                'top': posY + 'px',
                            })
                        })

                        var lastItem = $('.event-list li:last-child');
                        var lastPrevItem = lastItem.prev();
                        var height = lastItem.position().top + lastItem.outerHeight();
                        if (lastPrevItem && lastPrevItem[0]) {
                            height = Math.max(height, lastPrevItem.position().top + lastPrevItem.outerHeight())
                        }
                        $('.event-list ul').height(height);
                    }
                }

                $(function(){
                    masonry();
                    $(window).on('resize', function(){
                        requestAnimationFrame(masonry);
                    })
                });
            }

            function sns() {
                var swiper = new Swiper('.sns-list .swiper-container', {
                    slidesPerView: 'auto',
                    spaceBetween: 18,
                    freeMode: true,
                    breakpoints: {
                        768: {
                            spaceBetween: 20,
                        },
                        1024: {
                            spaceBetween: 30,
                        },
                        1281: {
                            spaceBetween: 60,
                        },
                    },
                });
            }


            return { loaded: loaded }
        }


    module.exports = Home;
});
