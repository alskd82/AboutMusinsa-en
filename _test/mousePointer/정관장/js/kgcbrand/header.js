/*!
 * module kgcbrand.Header
 * description Common Header
 */

define('kgcbrand/header', function( require, exports, module ) {
    'use strict';

    var gsap = require('gsap').gsap,
        Slick = require('vendor/slick.min'),
        Header = function( $wrap ) {
            var $header = $('#header');
            var $depth2 = $('.product-menu li a');
            var langSelector = $('.lang-selector', $header);
            var $dimmed = $('.dimmed', $header);
            var $nav = $('#nav');

            var transparentHeaderTimeout;
            var transparentHeader = [
                "/cheongkwanjang/master-brands.do",
                "/en/cheongkwanjang/master-brands.do",
                "/cn/cheongkwanjang/master-brands.do",
                "/cheongkwanjang/korean-redginseng-brands.do",
                "/en/cheongkwanjang/korean-redginseng-brands.do",
                "/cn/cheongkwanjang/korean-redginseng-brands.do",
                "/cheongkwanjang/history.do",
                "/en/cheongkwanjang/history.do",
                "/cn/cheongkwanjang/history.do",
                "/wellness-book/list.do",
                "/cheongkwanjang/history.do"
            ]

            function init() {
                //투명 GNB
                if(transparentHeader.includes(window.location.pathname) ) {
                    document.getElementById("header").classList.add("transparent")
                    document.getElementById("header").classList.add("setTransparent")
                    if(document.getElementById("main"))document.getElementById("main").style.paddingTop = 0
                }
                //** 투명 GNB

                //brand 2depth
                if(document.querySelector(".brandName") ) {
                    var currentBrand = document.querySelector(".brandName").innerText
                    document.querySelector(".brandName").style.display = "none"
                    document.querySelector(".header-sub .current").innerText = currentBrand
                }
                //** brand 2depth
                
                window.addEventListener("" +
                    "",function(e){
                    console.log(e);
                })

                $('.current', langSelector).on('click', function(e) {
                    e.preventDefault();
                    langSelector.addClass('open');
                });

                $(window).on('click', function(e) {
                    if( !$(e.target).closest('.langs')[0] ) {
                        langSelector.removeClass('open');
                        e.stopPropagation();
                    }
                });

                brandSubTitle();
                brand2depth();

                window.__ONSCROLL_CBS__.push( function(scrollTop) {
                    langSelector.removeClass('open');
                });

                //desktop
                $('.gnb a.depth1', $nav, $nav.find('.header-master')).on('mouseenter mouseover focus', function() {
                    if( __IS_DESKTOP__() ) {
                        gnbDepth1Active(this);
                        var $submenu = $(this).next('.submenu');

                        if( $submenu.length > 0) {
                            if( $submenu.hasClass('open') == false ) {
                                var openedSubmenuHeight = 0;
                                if( $submenu.hasClass('open') == false ) {
                                    gsap.set($('.submenu.open', $nav), {zIndex:1})
                                    openedSubmenuHeight = $('.submenu.open .submenu-box', $nav).outerHeight();
                                    gsap.killTweensOf($('.submenu.open .submenu-box', $nav));
                                    gsap.to($('.submenu.open .submenu-box', $nav), {height:0, duration:.25, ease:Quart.easeOut});
                                    gsap.killTweensOf($('.submenu.open', $nav));
                                    gsap.to($('.submenu.open', $nav), {autoAlpha:0, height:'0vh', duration:.25, delay:.6});
                                    $('.submenu.open', $nav).removeClass('open');
                                }

                                gsap.set($submenu, {zIndex: 2});
                                gsap.killTweensOf($dimmed);
                                gsap.to($dimmed, {autoAlpha:1, duration:.4})
                                var submenuHeight = $('.submenu-box .submenu-box-inner', $submenu).outerHeight();

                                gsap.killTweensOf($('.submenu-box', $submenu));
                                gsap.fromTo($('.submenu-box', $submenu), {height:openedSubmenuHeight}, {height:submenuHeight, duration:.8, ease:Quart.easeOut, delay:.0, onComplete:function() {
                                        $('.submenu-box', $submenu).css('height', 'auto');
                                    }});

                                gsap.killTweensOf($('.submenu-box-inner > ul > li', $submenu));
                                gsap.fromTo($('.submenu-box-inner > ul > li', $submenu), {autoAlpha:0, y:'20px'}, {autoAlpha:1, y:'0px', ease:Quart.easeOut, duration:1.4, delay:.4, stagger:.1});
                                gsap.killTweensOf($submenu);
                                gsap.to($submenu, {autoAlpha:1, height:'100vh', duration:0});
                                $submenu.addClass('open');
                            }

                        } else {
                            hideOpenedSubmenu();
                        }
                    }
                });

                $depth2.on('mouseenter mouseover focus', function(){
                    var self = $(this);
                    var $parentLi = self.closest('li');

                    if(!$parentLi.hasClass('active')) $('.product-menu li.active').addClass('hide');
                });

                $depth2.on('mouseleave', function(){
                    $('.product-menu li.active').removeClass('hide');
                });

                $('#header').on('mouseleave', function() {
                    if( __IS_DESKTOP__() ) {

                        hideSubmenu();
                    }
                });

                $('.submenu-box-inner').on('mouseleave', function() {
                    if( __IS_DESKTOP__() ) {
                        hideSubmenu();
                    }
                });

                //투명 GNB
                $('#header').on('mouseenter mouseover focus', function() {
                    if( __IS_DESKTOP__() && $('#header').hasClass('transparent') ) {
                        $("#header").addClass("transparentActive")
                    }
                });

                $('#header').on('mouseleave mouseout', function() {
                    if( __IS_DESKTOP__() && $('#header').hasClass('transparent') ) {

                        $("#header").removeClass("transparentActive")
                    }
                });
                //** 투명 GNB

                //mobile
                $('.btn-toggle-menu', $header).on('click', function(e) {
                    e.preventDefault();
                    $header.toggleClass('nav-open');
                    $("#header .dimmed").toggleClass('mobile');
                    if( $header.hasClass('nav-open') ) {
                        //투명 GNB
                        $(".header-master").removeClass("transparentBG")
                        //**투명 GNB
                    } else {
                        hideOpenedSubmenuMobile();
                        $('.gnb a.depth1', $nav).closest('li').removeClass('open');
                    }
                });

                $('.gnb a.depth1', $nav).on('click', function() {
                    if( __IS_DESKTOP__() == false ) {
                        var $submenu = $(this).next('.submenu');

                        if( $(this).closest('li').hasClass('open') ) {
                            hideOpenedSubmenuMobile();

                        } else {
                            hideOpenedSubmenuMobile();
                            gnbDepth1Active(this);

                            if( $submenu[0] ) {
                                var submenuHeight = $('.submenu-box-inner', $submenu).outerHeight();
                                gsap.killTweensOf($submenu);
                                gsap.to($submenu, {autoAlpha:1, duration:.2});
                                gsap.killTweensOf($('.submenu-box', $submenu));
                                gsap.to($('.submenu-box', $submenu), {height:submenuHeight, duration:.5, eae:Quart.easeOut, onComplete:function() {
                                        $('.submenu-box', $submenu).css('height', 'auto');
                                    }});
                            }
                        }
                    }
                });

                // gnb 검색 추천어 슬라이드
                if (searchSlideLen > 0) {
                    $searchSlide.slick({
                        dots: false,
                        arrows: false,
                        vertical: true,
                        speed: 1000,
                        autoplay: false,
                        autoplaySpeed: 500,
                        cssEase: 'ease-in-out',
                        centerMode:true,
                        slidesToShow: 5,
                        slidesToScroll: 1,
                        infinite: true,
                        pauseOnFocus: false,
                        verticalSwiping: true
                    }).on("mousewheel", function (event) {
                        event.preventDefault();
                        if (event.deltaX > 0 || event.deltaY < 0) {
                            $(this).slick('slickNext');
                        } else if (event.deltaX < 0 || event.deltaY > 0) {
                            $(this).slick('slickPrev');
                        }
                    });
                }
            }

            function brandSubTitle() {
                if ($('.brand-header-logo').length > 0) $('.breadcrumbs .current').text($('.brand-header-logo').text());
                if ($('.product_sub_title').length > 0) $('.breadcrumbs .current').text($('.product_sub_title').text());
                if (location.pathname.includes('product')) $('.product-menu li').eq(1).addClass('active').siblings().removeClass('active');
                else if (location.pathname.includes('brand-communication')) $('.product-menu li').eq(2).addClass('active').siblings().removeClass('active');
                else if (location.pathname.includes('event')) $('.product-menu li').eq(3).addClass('active').siblings().removeClass('active');
            }

            function brand2depth() {
                if(window.location.search.includes("depth2gnb")){
                    $('#header .header-sub').attr('style','display:flex !important')
                }

                if ($('.header-sub').css('display') === 'flex') {
                    var code = new URLSearchParams(window.location.search).get('code_id');

                    $.ajax({
                        url		 : rootDomain + '/news-event/eventsCnt-ajax.do',
                        method	 : "get",
                        dataType : "json",
                        cache	 : false,
                        data	 : {
                            code_id : code
                        },
                        success	 : function(resp) {
                            if (resp.result === false) $('.menu-event').remove();
                            else $('.menu-event').show();
                        }
                    });

	                if(lang != 'ko') {
		                $.ajax({
			                url: rootDomain + '/news-event/newsCnt-ajax.do',
			                method: "get",
			                dataType: "json",
			                cache: false,
			                data: {
				                code_id: code
			                },
			                success: function (resp) {
				                if (resp.result === false) $('.menu-brand-communication').remove();
				                else $('.menu-brand-communication').show();
			                }
		                });
	                }
                }
            }

            function gnbDepth1Active(target) {
                $('.gnb a.depth1', $nav).closest('li').removeClass('open');
                $(target).closest('li').addClass('open');
                gsap.killTweensOf($('.gnb a.depth1', $nav));
                gsap.to($('.gnb a.depth1', $nav), {alpha:.4, duration:.4});
                gsap.to(target, {alpha:1, duration:.4});
            }

            function hideSubmenu() {
                $('.gnb a.depth1', $nav).closest('li').removeClass('open');
                gsap.killTweensOf($('.gnb a.depth1', $nav));
                gsap.to($('.gnb a.depth1', $nav), {alpha: 1, duration: .2});
                hideOpenedSubmenu();
            }

            function hideOpenedSubmenu() {
                gsap.killTweensOf($('.submenu.open .submenu-box', $nav));
                gsap.to($('.submenu.open .submenu-box', $nav), {height:0, duration:.4, ease:Quart.easeOut});
                gsap.killTweensOf($('.submenu.open', $nav));
                gsap.to($('.submenu.open', $nav), {autoAlpha:0, height:'0vh', duration:.1, delay:.6});
                $('.submenu.open', $nav).removeClass('open');
                gsap.killTweensOf($dimmed);
                gsap.to($dimmed, {autoAlpha:0, duration:.5, delay:.2});
            }

            function hideOpenedSubmenuMobile() {
                gsap.killTweensOf($('.gnb a.depth1', $nav));
                gsap.to($('.gnb a.depth1', $nav), {alpha:1, duration:.4});

                $('.gnb > li.open', $nav).each( function() {
                    $(this).removeClass('open');

                    var $submenu = $('.submenu', this);
                    if( $submenu[0] ) {
                        gsap.killTweensOf($submenu);
                        gsap.to($submenu, {autoAlpha:0, duration:.4});
                        gsap.killTweensOf($('.submenu-box', $submenu));
                        gsap.to($('.submenu-box', $submenu), {height:0, duration:.4, eae:Quart.easeOut, onComplete:function() {
                            }});
                    }
                });
            }


            // -------------- 헤더 검색 --------------
            // 헤더 공통
            var $search = $('#header .search');
            var $searchPanel = $('.search-panel');
            var $searchDimmed = $('#header .search-dimmed');
            var $gnb = $('#nav .gnb');
            var $searchSlide = $('.slide_search');
            var $searchmenu = $('#header .search_form');
            var searchSlideLen = $('.slide_search a').length;

            function closeSearchPanel(){
                $search.removeClass('active');
                gsap.to($searchDimmed, {autoAlpha:0, duration:.5, delay:.2});
                $searchPanel.find('.inner').css({opacity : 0});
                $searchPanel.stop().slideUp(700);
                    //stop().slideUp(700);
                $gnb.off('mouseenter');
                $header.off('mouseleave');
                // $gnb.css({'pointer-events':'auto'});
                if (searchSlideLen > 0) {
                    $searchSlide.slick('slickSetOption', 'autoplay', false).slick('slickPause');
                }
            }


            // 헤더 검색 버튼 클릭시..
            $search.click(function(){
                var active = $(this).hasClass('active');
                if(active){
                    // 검색 패널 닫기
                    closeSearchPanel();

                    if($("#header").hasClass('transparent')){

                        $(".header-master").css('transition','transform 500ms cubic-bezier(0.455, 0.03, 0.515, 0.955), background-color  300ms cubic-bezier(0.455, 0.03, 0.515, 0.955) 600ms')
                        clearTimeout(transparentHeaderTimeout)
                        transparentHeaderTimeout = setTimeout(function(){
                            $(".header-master").css('transition','transform 500ms cubic-bezier(0.455, 0.03, 0.515, 0.955), background-color  0ms')
                        },1000)
                    }
                }else{
                    // 검색 패널 열기, 검색 추천어 슬라이드
                    searchSlide();

                    $(this).addClass('active');
                    gsap.to($searchDimmed, {autoAlpha:1, duration:.4});
                    // $searchPanel.stop().slideDown();
                    $searchPanel.stop().slideDown(700, function(){
                        $(this).find('.inner').css({opacity : 1});
                    });
                    console.log();
                    $gnb.on('mouseenter', function(){ closeSearchPanel(); });   // 검색 패널 활성화 된 상태에서.. 마우스가  네비 메뉴로 이동시...검색 패널 닫기

                    // 검색 패널과 서브메뉴 겹쳐보이는 현상 없앰.
                    hideSubmenu();
                    hideOpenedSubmenu();
                    hideOpenedSubmenuMobile();
                    $('.gnb a.depth1', $nav).closest('li').removeClass('open');
                    $header.removeClass('nav-open');
                }

                //투명 GNB
                $("#header .header-master").toggleClass('transparentBG')
                $gnb.on('mouseenter', function(){ $("#header .header-master").removeClass('transparentBG') });
                //**투명 GNB
            });

            // 모바일 버튼 눌렀을때 검색 패널 숨기기
            $('#header .btn-toggle-menu').click(function(e){
                $searchPanel.hide();
                closeSearchPanel();
            });

            // 헤더 검색 키워드 버튼
            $('.keyword-list>li').click(function(){
                var keyword = $(this).text().trim();
                $('.keyword-list .input_box input').val(keyword);
                $('form[name=search_form]').submit();
            });

            function searchSlide() {
                if (searchSlideLen > 0) {
                    $searchSlide.slick('slickSetOption', 'autoplay', true).slick('slickPlay');
                }

                setTimeout(function(){
                    $searchmenu.find('input').focus();
                }, 1000);

                var keyword = '';

                // 연관 검색어
                $('.slide_search a').on('click', function(e) {
                    e.preventDefault();
                    keyword = $(this).text();
                    $searchmenu.find('input').val(keyword);
                    $('form[name="searchForm"]').submit();
                })
            }

            //딤드 클릭시 검색창 닫기
            $('#header>.search-dimmed').click(function(){
                closeSearchPanel()

                if($("#header").hasClass("transparent")){
                    clearTimeout(transparentHeaderTimeout)
                    transparentHeaderTimeout = setTimeout(function(){$(".header-master").removeClass("transparentBG")},600)
                }
            })
            //**딤드 클릭시 검색창 닫기

            // -------------- 헤더 검색[END] --------------


            // -------------- 헤더 2뎁스 메뉴 hover 효과 --------------
            var $hoverEffItems = $(".hover-effect>li");
            $hoverEffItems.hover(function(){
                // $(this).addClass('active').siblings('li').removeClass('active');
                $(this).removeClass('active').siblings('li').addClass('active');
            }, function(){
                $hoverEffItems.removeClass('active');
            });

            // hover 효과 2
            var $hoverEffItems2 = $(".hover-effect2>li>a");
            $hoverEffItems2.hover(function(){
                // $(this).addClass('active').siblings('li').removeClass('active');
                $hoverEffItems2.addClass('active');
                $(this).removeClass('active');
            }, function(){
                $hoverEffItems2.removeClass('active');
            });
            // -------------- 헤더 2뎁스 메뉴 hover 효과[END] --------------


            // -------------- 풋터 family-site --------------
            $(".family-site-btn").click(function(){
                $(this).parents(".family-site").toggleClass("active");
                $('.family-site-panel').stop().slideToggle(300);
            });
            // -------------- 풋터 family-site[END] --------------


            init();
        }


    module.exports = Header;
});
