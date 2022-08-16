/*!
 * kgc_brand - Common Script
 * description Site Common
 */

// Configuration require
require.config({
    baseUrl: '/assets/js',
    waitSeconds:0,
    paths: {
        jquery: 'vendor/jquery-3.5.1.min',
        easing: 'vendor/jquery.easing-1.4.1.min',
        gsap: 'vendor/gsap-3.6.0.min',
        niceSelect: 'vendor/jquery.nice-select-1.1.0.min',
        nanoScroll: 'vendor/jquery.nanoscroller-0.7.2.min'
    },
    shim: {
        easing: {deps:['jquery']},
        transit: {deps:['jquery']},
        isotope: {deps:['jquery']},
        niceSelect: {exports:'niceSelect'},
        nanoScroll: {exports:'nanoScroll'},
    }
});

// Resize platform division class added
(function() {
    $(window).on('resize.rwd', function() {
        $('html').removeClass('desktop laptop tablet mobile');
        var $html=$('html'), w=$(window).width();
        if( w < 768 ) $html.addClass('mobile');
        else if( w < 1024 ) $html.addClass('tablet');
        else if( w < 1281 ) $html.addClass('laptop');
        else $html.addClass('desktop');
    }).trigger('resize.rwd');
})();

// Allows the caller to delay jQuery's ready event
$.holdReady(true);

// Define global configuration & variable
window.kgcbrand = { title:'KGC Brand', breakpoints:{mobile:768, desktop:1280},
    // Execute page lending
    init: function() {
        this._.initBrakpointAndPortrait();

        // Exception ready holding, bind native event
        if( document.readyState === 'complete' || document.readyState === 'loaded' || document.readyState === 'interactive' ) {
            this.ready();

        } else {
            $(document).on('DOMContentLoaded', function() {
                this.ready();
            }.bind(this));
        }
    },

    ready: function() {
        this._.preload( function() {
            this._.init();
        }.bind(this));
    },

    _: {
        init: function() {
            this.bindGlobalEvents();
            this.header();
            this.footer();
            this.property();
        },

        initBrakpointAndPortrait: function() {
            var isPortrait, $html=$('html');
            var isMobile = window.innerWidth < kgcbrand.breakpoints.mobile;

            window.breakpoint = { isMobile:isMobile, isDesktop:!isMobile, name:isMobile?'mobile':'desktop' };
            $(window).data('breakpoint', window.breakpoint);
            $(window).on('resize.orientation orientationchange.orientation', function() {
                if( !!!('ontouchstart' in window) ) return;

                $html.removeClass('landscape portrait')
                if( window.innerWidth < window.innerHeight ) $html.addClass('portrait');
                else $html.addClass('landscape');
            }).trigger('resize.orientation');
        },

        bindGlobalEvents: function() {
            $(window).on('common:preventScroll', function( e, flag ) {
                kgcbrand._.preventPageScroll(flag);
            })
        },

        header: function() {
            // Redirection error page
            setTimeout( function() {
                $('.exception_wrap a:eq(1)').attr('href',$('h1.brand a').attr('href'));
            }, 0 );
            
            require(['kgcbrand/header'], function( Header ) {
                new Header( $('header') );
            });
        },

        footer: function() {
            require(['niceSelect'], function( niceSelect ) {
                $('select.render-as--nice-select').niceSelect();

                var $familysite = $('#footer').find('.familysite');
                $familysite.on('change', 'select', function() {
                    var link = $(this).val();
                    if( link && link != '' ) {
                        $familysite.find('.select option:selected').removeAttr('selected');
                        $familysite.find('.select option:first-child').attr('selected', 'selected');
                        $familysite.find('.select').val('');
                        window.open(link);
                    }
                });
            });
        },

        property: function() {
            $("body").addClass(lang);

            var $header = $('header');

            $('*').each( function( i, el ) {
                if( !!$(el).data('trn-key') ) $(el).addClass('trn');
            });

            // for test url (0315)
            //if($("body").hasClass('translate') === false) return;

            var property = $.extend( {}, window.COMMON_PROPERTY, window.PROPERTIES );

            $('body').translate( {lang:lang, property:property} );
            $header.addClass('translated');
        },

        preload: function( callback ) {
            require( ['common/tabMenu','common/subTab','common/parallax', 'common/brand-scroll', 'common/detect', 'vendor/modernizr-3.6.0.min','vendor/mobile-detect-1.4.4.min', 'vendor/plyr.polyfilled', 'vendor/polyfill'], function( TabMenu, SubTab, Animation, BrandScroll ) {
                $('.kv_tab').each( function( i, subTab ) { new SubTab( $(subTab) ); });
                $('.tab_menu').each( function( i, tab ) { new TabMenu( $(tab) ); });
                $('.tab_menu_box').each( function( i, tab ) { new TabMenu( $(tab) ); });
                new Animation();
                new BrandScroll();

                kgcbrand._.setComponentsDefaults();
                $.holdReady(false);
                callback();
            });
        },

        setComponentsDefaults: function() {
            $(document).on('modalfirstopen modallastclose', function( evt ) {
                kgcbrand._.preventPageScroll( evt.type === 'modalfirstopen' );
            });

            $(document).on('modalshown', function( evt ) {
                // $(evt.target).buildCommonUI();
            });
        },

        // When modal opens, Block page scrolling
        preventPageScroll: function( flag ) {
            var $root = $('html');
            if( flag ) {
                $root.css( {top:-$(window).scrollTop()} );

            } else {
                $root.css( {top:''} );
                var top = parseInt($root.css('top'),10) || 0;
                $('html, body').scrollTop(-top);
            }

            // Gnb & modal, don't let the focus be on the body, toggle aria-hidden
            kgcbrand.preventedScroll = flag;
            $root.toggleClass('preventScroll', flag);
            $(document).triggerHandler('preventscroll', flag);
        }
    }
}

// Exception ready holding, bind DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    define('jquery', function() {
        return window.$;
    });

    require(['kgcbrand/common','translate/common.translate'], function() {
        kgcbrand.init();
    });
});

// Language conversion, message.properties
$.fn.translate = function( option ) {
    var that = this;
    var opts = $.extend( {css:'trn',lang:'en'}, {css:'trn',lang:'cn'}, option||{} );
    if( opts.css.lastIndexOf('.',0) !== 0 ) opts.css = '.'+opts.css;

    this.lang = function( l ) {
      if( l ) {
        opts.lang = l;
        this.translate(opts);
      }

      return opts.lang;
    };

    this.get = function(index) {
      var res = index;
      try { res = opts.property[index][opts.lang];
      } catch( err ) { return index; }
      
      if( res ) return res;
      else return index;
    };

    this.g = this.get;
    this.find(opts.css).each( function(i) {
      var $this = $(this);
      var trn_key = $this.attr('data-trn-key');
      if( !trn_key ) {
        trn_key = $this.html();
        $this.attr('data-trn-key',trn_key);
      }
        
      $this.html( that.get(trn_key) );
    });

    return this;
};

// Tagging Code Tracking
function eventTrack(name) {
    if( name !== undefined ) {
        var isMobile = !!('ontouchstart' in window);
        var eventName = isMobile ? 'm_'+name : name;
        gtag('event', eventName);
    }
}