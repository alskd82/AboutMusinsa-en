
function throttle ( fn, delay ) {
    var timer;
    if (delay === 0) return fn;
    timer = false;
    return function() {
        if (timer) return;
        timer = true;
        if (delay !== -1) setTimeout((function(){return timer = false;}), delay);
        return fn.apply(null, arguments);
    };
};


import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
gsap.registerPlugin(Draggable, InertiaPlugin);

//===============================================================================================================================
/*=====  ScrollSmoother ======================*/
//===============================================================================================================================

class ImageLoader {
    constructor( images, callback ) {
        if( images === undefined ) return;

        this.arr = [];
        images.forEach( src => this.arr.push(this.loadImage(src)) );

        const p = Promise.all(this.arr);
        p.then( image => callback(image) );
        p.catch( err => console.log(err) );
    }

    loadImage( url ) {
        return new Promise( (resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(new Error(`Could not load image ${url}`));
            image.src = url;
        });
    }
}

//===============================================================================================================================
/*=====  ScrollSmoother ======================*/
//===============================================================================================================================

class ImageOverlapChange {
    constructor( opts ){
        if(opts.imgSrc === undefined && opts.bgUrl === undefined) return;

        const defaults ={
            duration: .75,
            ease: 'Cubic.easeInOut',
            hideSlideOpacity: 1, // 사라질 이미지 오퍼시티
            showSlideOpacity: 1, // 나타날 이미지 오퍼시티 
            imgSrc: [],
            overlap: false,
            hideOverlapRatio: .5, // 사라질 이미지 겹쳐질 정도
            showOverlapRatio: .5, // 나타날 이미지 겹쳐질 정도 
            axis: 'x',

            draggable: false, // 드래그 기능
            velocity: 200,

            mouseWheel: false, // 마우스 기능 

            intervalTime: false,

            debug: false,
        }

        this.opts = {...defaults, ...opts};
        this.duration = this.opts.duration;
        this.ease = this.opts.ease;
        this.hideSlideOpacity = this.opts.hideSlideOpacity;
        this.showSlideOpacity = this.opts.showSlideOpacity;
        this.overlap = this.opts.overlap;
        this.hideOverlapRatio = this.opts.hideOverlapRatio * 100
        this.showOverlapRatio = this.opts.showOverlapRatio * 100
        this.axis = this.opts.axis;
        this.slidesLength = (this.opts.imgSrc != undefined) ? this.opts.imgSrc.length : this.opts.bgUrl.length;         
        
        this.$container = document.querySelector( opts.container );
        this.$wrapper = document.querySelector( opts.wrapper );
        this.$prev;
        this.$next;
        this.$now;;

        this.block = false;
        this.activeIndex = 0;

        this.imgs = []
        if(opts.bgUrl){
            opts.bgUrl.forEach((url, i) => { this.opts.imgSrc[i] = url.match(/\((.*?)\)/)[1]; });
        }
        new ImageLoader( this.opts.imgSrc, this.completeImageLoad.bind(this) );

        if(opts.draggable){ this.initForDrag() } // 드래그 기능 활성화
        if(opts.mouseWheel){ this.initWeel() }   // 마우스 기능 활성화

    }
    completeImageLoad( resolve ) {
        this.imgs = resolve;
        this.$wrapper.children[0].style.backgroundImage = `url(${this.imgs[0].src})`;

        if(this.opts.debug){
            console.log('complete ImageOverlap image load')
            console.log( this.opts.imgSrc )
        };
    }

    changeSlide( index, direction ){
        if(this.block) return;
        this.block = true;

        // this.changeActiveNum( addNum )
        this.activeIndex = index % this.slidesLength;
        if( this.activeIndex === -1 ) this.activeIndex = this.slidesLength - 1;

        if(this.$prev != undefined) this.removeSlide(this.$prev)
        if(this.$next != undefined) this.removeSlide(this.$next)
        
        this.direction = (direction === 'go') ? 1 : -1;
        this.$prev = this.$container.children[this.$container.children.length-1];
        this.$now = this.$prev.cloneNode(true);
        this.$now.children[0].style.backgroundImage = `url(${this.imgs[this.activeIndex].src})`;
        this.$container.appendChild( this.$now );
        
        const dir = this.direction;
        gsap.set( this.$now, { [`${this.axis}Percent`]: 100*dir, opacity: this.showSlideOpacity } );
        gsap.to( this.$now, this.duration, {xPercent:0, yPercent:0, opacity:1, ease:this.ease} );
        gsap.to( this.$prev, this.duration, {
            [`${this.axis}Percent`]:100*-dir, 
            opacity:this.hideSlideOpacity, 
            ease:this.ease,
            onComplete: this.changeSlideComplete.bind(this)
        } );

        if( this.overlap ){
            gsap.set( this.$now.children[0], {[`${this.axis}Percent`]:this.showOverlapRatio*-dir});
            gsap.to( this.$now.children[0], this.duration, {xPercent:0, yPercent:0, ease:this.ease} );
            gsap.to( this.$prev.children[0], this.duration, {[`${this.axis}Percent`]:this.hideOverlapRatio*dir, ease:this.ease} );
        }

    }

    indexAddNum(addNum){
        let num = (this.activeIndex + addNum) % this.slidesLength;
        if(num === -1) num = this.slidesLength - 1;
        return num;
    }
    
    prev(){ this.changeSlide(this.activeIndex-1, 'back'); }
    next(){ this.changeSlide(this.activeIndex+1, 'go'); }

    changeSlideComplete(){
        this.block = false
        this.removeSlide(this.$prev)
        if( this.opts.draggable ){
            this._draggable[0].kill();
            this.createDraggble(this.$now)
        }

        // if( this.opts.intervalTime ){
        //     gsap.delayedCall(this.opts.intervalTime , this.next.bind(this) )
        // }
        this.delayedCall()

        this.transitionFinish()
    }

    removeSlide( slide ){ 
        slide.parentNode.removeChild(slide); 
        if(slide === this.$prev)        this.$prev = undefined
        else if(slide === this.$next)   this.$next = undefined
        else if(slide === this.$now)    this.$now = undefined
    }

    delayedCall(){
        this.killDelayedCall();
        this.interval = this.opts.intervalTime ? gsap.delayedCall( this.opts.intervalTime, this.next.bind(this) ) : undefined
    }
    killDelayedCall() {
        if(this.opts.intervalTime && this.interval) this.interval.kill();
    }

    transitionFinish(){
        this.delayedCall();

        if(this.opts.debug){
            console.log("ImageOverlap move complete | activeIndex: " + this.activeIndex )
        }
    }

    //===============================================================================================================================
    /*=====  DRAG ======================*/
    //===============================================================================================================================
    initForDrag(){
        this.$prev = this.$next = undefined;
        this.dagProperty = (this.axis === "x") ? 'width': 'height'
        this.dragOffset = undefined;
        this.dragRatio;
        this._draggable = undefined;

        this.createDraggble( this.$container.children[this.$container.children.length-1] )
    }

    createDraggble($target){
        //if(this._draggable === undefined) return
        this.$now = $target
        
        this._draggable = Draggable.create($target, { 
            type: this.axis,
            cursor: this.opts.dragCursor || 'auto',
            activeCursor: this.opts.dragActiveCursor ||'auto',
            // bounds: this.$container ,
            onDragStart: this.ondragstart.bind(this),
            onDrag: this.ondrag.bind(this),
            onDragEnd: this.ondragend.bind(this),

            inertia: false
        })
    }

    ondragstart(){
        this.opts.debug ? console.log("ImageOverlap activeIndex: " + this.activeIndex) : null

        if(this.$next === undefined){
            this.$next = this._draggable[0].target.cloneNode(true)
            gsap.set( this.$next, {[`${this.axis}Percent`]: 100, opacity: this.showSlideOpacity} )
            this.$next.children[0].style.backgroundImage = `url(${this.imgs[this.indexAddNum(1)].src})`; 
            this.$container.appendChild( this.$next ) 
        }
        if(this.$prev === undefined){
            this.$prev = this._draggable[0].target.cloneNode(true)
            gsap.set( this.$prev, {[`${this.axis}Percent`]: -100, opacity: this.showSlideOpacity} )
            this.$prev.children[0].style.backgroundImage = `url(${this.imgs[this.indexAddNum(-1)].src})`; 
            this.$container.appendChild( this.$prev )
        }
        if(this.overlap){
            gsap.set( this.$next.children[0], {[`${this.axis}Percent`]: this.showOverlapRatio*-1} )
            gsap.set( this.$prev.children[0], {[`${this.axis}Percent`]: this.showOverlapRatio*1} )
        }

        this.killDelayedCall()
    }

    ondrag(){
        this.dragOffset = gsap.getProperty(this._draggable[0].target, `${this.axis}`)
        this.dragRatio = gsap.utils.mapRange(
            -gsap.getProperty(this.$now, this.dagProperty), gsap.getProperty(this.$now, this.dagProperty), 
            -100, 100, 
            this.dragOffset 
        ); 

        gsap.to( this.$now, 0, { opacity: gsap.utils.mapRange(0, 100, 1 , this.hideSlideOpacity, Math.abs(this.dragRatio)) })
        gsap.to( this.$next, 0, { 
            [`${this.axis}Percent`]: gsap.utils.mapRange(0, -100, 100, 0, this.dragRatio),
            opacity: gsap.utils.mapRange(0, 100, this.showSlideOpacity, 1, Math.abs(this.dragRatio)) 
        });
        gsap.to( this.$prev, 0, { 
            [`${this.axis}Percent`]: gsap.utils.mapRange(0, 100, -100, 0, this.dragRatio),
            opacity: gsap.utils.mapRange(0, 100, this.showSlideOpacity, 1, Math.abs(this.dragRatio)) 
        });

        if(this.overlap){
            gsap.to( this.$now.children[0], 0, { 
                [`${this.axis}Percent`]: gsap.utils.mapRange(-100, 100, 100*this.opts.hideOverlapRatio, -100*this.opts.hideOverlapRatio ,this.dragRatio)
            })
            gsap.to( this.$next.children[0], 0, { 
                [`${this.axis}Percent`]: gsap.utils.mapRange(0, -100, -100*this.opts.showOverlapRatio, 0, this.dragRatio)
            })
            gsap.to( this.$prev.children[0], 0, { 
                [`${this.axis}Percent`]: gsap.utils.mapRange(0, 100, 100*this.opts.showOverlapRatio, 0, this.dragRatio)
            })
        }

        
    }

    ondragend(){
        this.opts.debug ? console.log( "ImageOverlap velocity: " + Math.abs( InertiaPlugin.getVelocity( this.$now, this.axis) ) ) : null
    
        if(Math.abs(this.dragRatio) >= 50){
            this.dragEndTransition( .5, this.opts.dragEndEase)
        } else {
            if( Math.abs( InertiaPlugin.getVelocity( this.$now, this.axis) ) > this.opts.velocity ){
                this.dragEndTransition( .5, this.opts.dragEndEase)
            } else {
                this.ondragReset();
            }
            
        }   
        this.dragDisable();     
    }

    dragEndTransition(duration, ease){
        let _duration = duration || this.duration;
        let _ease = ease || this.ease;
        let showEl;
        let deleteEl;
        let dir;

        if(this.dragRatio < 0 ){  // "go"
            showEl = this.$next;
            deleteEl = this.$prev;
            dir = -1;
            this.activeIndex = this.indexAddNum(1)
            
        } else {                  // "back"
            showEl = this.$prev;
            deleteEl = this.$next;
            dir = 1;
            this.activeIndex = this.indexAddNum(-1)
        }

        gsap.to( showEl, _duration, {
            xPercent: 0, yPercent: 0, opacity: 1, ease: _ease, 
            onComplete: this.ondragChangeComplete.bind(this), 
            onCompleteParams:[deleteEl] 
        });
        gsap.to( this.$now, _duration, { 
            [`${this.axis}`]: gsap.getProperty(this.$now, this.dagProperty) * dir, 
            opacity: this.hideSlideOpacity, ease: _ease
        });

        if(this.overlap){
            gsap.to( showEl.children[0], _duration, {xPercent: 0, yPercent: 0, ease: _ease});
            gsap.to( this.$now.children[0], _duration, { [`${this.axis}Percent`]: -dir*this.hideOverlapRatio, ease: _ease});
        }

    }

    ondragChangeComplete(ele){
        this.removeSlide(this.$now)
        this.removeSlide(ele)
        this._draggable[0].kill();
        this._draggable[0].target = this.$container.children[0]
        this.initForDrag();
        this.dragEnable();
    }

    ondragReset(){
        gsap.to( this.$now, .5, {ease: this.opts.dragEndEase, x: 0, y: 0, opacity: 1, onComplete: this.dragEnable.bind(this)})
        gsap.to( this.$prev, .5, {ease: this.opts.dragEndEase, [`${this.axis}Percent`]: -100, opacity: this.showSlideOpacity})
        gsap.to( this.$next, .5, {ease: this.opts.dragEndEase, [`${this.axis}Percent`]: 100, opacity: this.showSlideOpacity})

        if(this.overlap){
            gsap.to( this.$now.children[0], .5, {ease: this.opts.dragEndEase, xPercent: 0, yPercent: 0})
            gsap.to( this.$prev.children[0], .5, {ease: this.opts.dragEndEase, [`${this.axis}Percent`]: this.showOverlapRatio})
            gsap.to( this.$next.children[0], .5, {ease: this.opts.dragEndEase, [`${this.axis}Percent`]: -this.showOverlapRatio})
        }
    }
    
    dragEnable(){ this._draggable[0].enable(); this.transitionFinish(); }
    dragDisable(){ this._draggable[0].disable(); }


    //===============================================================================================================================
    /*=====  WHEEL======================*/
    //===============================================================================================================================
    initWeel(){
        const onWheel=(e)=>{ 
            e.preventDefault();
            e.stopPropagation();
            if( e.deltaY < 0)       this.prev()
            else if( e.deltaY > 0)  this.next()
        }

        this.$container.addEventListener('wheel', throttle ( onWheel , this.duration*1000 )  );
    }
}

export default ImageOverlapChange



// const historyCMS = document.querySelector('#sliderHistoryCMS')
// const historyYear = document.querySelector('#sliderYear');
// const historyTitle = document.querySelector('#sliderTitle');
// const historyPageNum = document.querySelector('#sliderPageNum span')

// let historyCMS_IMAGE = []
// let historyCMS_Year = []
// let historyCMS_Title = []
// historyCMS.querySelectorAll(`.history-slider_img-wrap`).forEach( (el,i) =>{
//     historyCMS_IMAGE.push( el.src );
//     historyCMS_Year.push( historyCMS.querySelector(`.history-slider_item:nth-child(${i+1}) .mu24-150`).innerHTML );
//     historyCMS_Title.push( historyCMS.querySelector(`.history-slider_item:nth-child(${i+1}) .history_swiper-title`).innerHTML );
// });

// historyYear.innerHTML = historyCMS_Year[0]
// historyTitle.innerHTML = historyCMS_Title[0]

// const slider = new ImageOverlapChange({
//     container: ".history-slider_img-container",
//     wrapper: ".history-slider_img-wrap",
//     imgSrc: historyCMS_IMAGE,
//     axis: 'x',
//     hideSlideOpacity: .25, // 사라질 슬라이더 오퍼시티 0 ~ 1
//     showSlideOpacity: 1,   // 나타날 슬라이더 오퍼시티 0 ~ 1
//     overlap: true, 
//     hideOverlapRatio: .75,   // 사라질 슬라이더 오버랩 정도 0 ~ 1
//     showOverlapRatio: .75,   // 나타날 슬라이더 오버랩 정도 0 ~ 1
//     duration: .5,
//     ease: BezierEasing(0.4,0,0.2,1),

//     // draggable: false,
//     // dragCursor: "grab",
//     // dragActiveCursor: "grabbing",
//     // dragEndEase: "Quint.easeOut",
//     // velocity: 200,
//     // mouseWheel: false,

//     // intervalTime: 3, // second
//     debug: false,
// })




// document.querySelector('#historySliderBtR').addEventListener('click', e =>{
//     slider.next()
//     changeText(slider.activeIndex)
// })
// document.querySelector('#historySliderBtL').addEventListener('click', e =>{
//     slider.prev()
//     changeText(slider.activeIndex)
// })

// function changeText(n){
//     const tl = gsap.timeline({})
//     tl.to( historyTitle , { opacity: 0 , duration: .1, onComplete: () =>{
//         historyTitle.innerHTML = historyCMS_Title[n]
//     }} )
//     tl.to( historyTitle , { opacity: 1 , duration: .4, delay: .2} )

//     historyYear.innerHTML = historyCMS_Year[n]
//     historyPageNum.innerHTML = n + 1
// }

// // slider.delayedCall()
