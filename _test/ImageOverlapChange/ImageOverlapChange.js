// function $( $selector, $context ) {
//     const context = $context || document;
//     return ( $selector.indexOf('#') > -1 ) ? context.getElementById( $selector.replace('#','') ) : context.querySelector( $selector );
// }

// function debounce( fn, wait, immediate ){
//     var slice = [].slice;
//     var timeout;
//     if (wait == null) wait = 100;
//     timeout = null;
//     return function(){
//         var args, delayed, obj;
//         args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
//         obj = this;
//         delayed = function() {
//             if (!immediate) fn.apply(obj, args); 
//             return timeout = null;
//     };
//     if (timeout) clearTimeout(timeout);
//     else if (immediate) fn.apply(obj, args);
//     return timeout = setTimeout(delayed, wait);
//     };
// }

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
            mouseWheel: false, // 마우스 기능 
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

        if(opts.draggable){ this.initForDrag() }
        if(opts.mouseWheel){ this.initWeel() }

    }
    completeImageLoad( resolve ) {
        this.imgs = resolve;
        this.$wrapper.children[0].style.backgroundImage = `url(${this.imgs[0].src})`;
        console.log('complete all image load');
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
    }

    removeSlide( slide ){ 
        slide.parentNode.removeChild(slide); 
        if(slide === this.$prev)        this.$prev = undefined
        else if(slide === this.$next)   this.$next = undefined
        else if(slide === this.$now)    this.$now = undefined
    }

    /* ////////////////////////////////// */
    /* ====  DRAG ======================= */
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

            inertia: true
        })
    }

    ondragstart(){
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
        this.dragDisable();
        if(Math.abs(this.dragRatio) >= 50){
            this.dragEndTransition( .5, "Quint.easeOut")
            console.log( )
        } else {
            this.ondragReset();
        }        
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
        this.dragEnable()
    }

    ondragReset(){
        gsap.to( this.$now, .5, {ease: 'Quint.easeOut', x: 0, y: 0, opacity: 1, onComplete: this.dragEnable.bind(this)})
        gsap.to( this.$prev, .5, {ease: 'Quint.easeOut', [`${this.axis}Percent`]: -100, opacity: this.showSlideOpacity})
        gsap.to( this.$next, .5, {ease: 'Quint.easeOut', [`${this.axis}Percent`]: 100, opacity: this.showSlideOpacity})

        if(this.overlap){
            gsap.to( this.$now.children[0], .5, {ease: 'Quint.easeOut', xPercent: 0, yPercent: 0})
            gsap.to( this.$prev.children[0], .5, {ease: 'Quint.easeOut', [`${this.axis}Percent`]: this.showOverlapRatio})
            gsap.to( this.$next.children[0], .5, {ease: 'Quint.easeOut', [`${this.axis}Percent`]: -this.showOverlapRatio})
        }
    }
    
    dragEnable(){ this._draggable[0].enable(); }
    dragDisable(){ this._draggable[0].disable(); }


    /* ////////////////////////////////// */
    /* ====  WHEEL ======================= */
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

/*

*/

/* 이미지 경로 정보를 이용할 때  */
let imgSrc = [
    "https://pbs.twimg.com/media/ExUElF7VcAMx7jx.jpg",
    "https://img.huffingtonpost.com/asset/5cb04c561f0000c6007f1a5f.jpeg?ops=scalefit_630_noupscale",
    "https://file2.nocutnews.co.kr/newsroom/image/2021/03/25/202103251659468108_0.jpg",
    "https://pds.joins.com/news/component/htmlphoto_mmdata/202103/30/0d115e5d-a4fe-4ff8-9689-6b77a730d19d.jpg",
]

/* 백그라운드 이미지 정보를 이용할 때 */
let bgUrl = [
    "url(https://pbs.twimg.com/media/ExUElF7VcAMx7jx.jpg)",
    "url(https://img.huffingtonpost.com/asset/5cb04c561f0000c6007f1a5f.jpeg?ops=scalefit_630_noupscale)",
    "url(https://file2.nocutnews.co.kr/newsroom/image/2021/03/25/202103251659468108_0.jpg)",
    "url(https://pds.joins.com/news/component/htmlphoto_mmdata/202103/30/0d115e5d-a4fe-4ff8-9689-6b77a730d19d.jpg)",
]

const slider = new ImageOverlapChange({
    container: ".img-container",
    wrapper: ".img-wrap",
    imgSrc: imgSrc,
    axis: 'x',
    // bgUrl: bgUrl,
    hideSlideOpacity: .25, // 사라질 슬라이더 오퍼시티 0 ~ 1
    showSlideOpacity: 1, // 나타날 슬라이더 오퍼시티 0 ~ 1
    overlap: true,         
    hideOverlapRatio: .75,   // 사라질 슬라이더 오버랩 정도 0 ~ 1
    showOverlapRatio: .75,   // 나타날 슬라이더 오버랩 정도 0 ~ 1
    ease: BezierEasing(0.4,0,0.2,1),

    draggable: true,
    dragCursor: "grab",
    dragActiveCursor: "grabbing",
    mouseWheel: true,
    
})


document.querySelector(".btn-next").addEventListener('click', ()=>{
    slider.next() // 한단계씩 이동
})

document.querySelector(".btn-prev").addEventListener('click', ()=>{
    slider.prev() // 한단계씩 이동
})

document.querySelector(".btn-isdrag").addEventListener('click',(e)=>{
    console.log( e.currentTarget.innerText )
    if(e.currentTarget.innerText === "drag disable"){
        slider.dragDisable(); // 드래그 비활성화
        e.currentTarget.innerText = "drag enable";
    } else {
        slider.dragEnable(); // 드래그 활성화
        e.currentTarget.innerText = "drag disable";
    }
})


// // function isMobile(){ return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); }
// // const START = isMobile() ? 'touchstart' : 'mousedown';

// // $(".img-container").addEventListener( START, touchStart )


// // function touchStart(e){
// //     let offset = {}
// //     if(e.type === "touchstart"){
// //         let _e = e.currentTarget.getBoundingClientRect();
// //         offset = {x:e.touches[0].clientX - _e.left, y:  e.touches[0].clientY - _e.top } 
// //     } else {
// //         offset = {x:e.offsetX, y: e.offsetY }
// //     }
// //     // console.log( offset )
// //     // console.log( gsap.getProperty( e.currentTarget , "width") )
// //     console.log( gsap.getProperty( e.currentTarget , "x") )
// // }