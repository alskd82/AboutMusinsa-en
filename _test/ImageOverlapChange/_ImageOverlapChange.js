class ImageOverlapChange {
    constructor(opts={}){
        if(opts.imgSrc === undefined && opts.bgUrl === undefined) return
        this.opts = { ... opts}
        this.imgs = []
        if(opts.imgSrc){
            opts.imgSrc.forEach( (src, i) => { 
                this.imgs[i] = new Image();
                this.imgs[i].src = src; //  `url(${src})`)
            });
        } else if(opts.bgUrl){
            opts.bgUrl.forEach( (url, i) => { 
                this.imgs[i] = new Image();
                this.imgs[i].src = url.match(/\((.*?)\)/)[1];
            });
        };

        this.overlap = false || opts.overlap
        if(this.overlap) this.overlapRatio = opts.overlapRatio || "50%";
        this.hideImgOpacity = (opts.hideImgOpacity === 0) ? 0 : opts.hideImgOpacity || 1;
        this.showImgOpacity = (opts.showImgOpacity === 0) ? 0 : opts.showImgOpacity || 1;

        this.type = opts.type || "x";

        this.duration = opts.duration || .75;
        this.ease = opts.ease || 'Cubic.easeInOut';

        this.nowNum = 0
        this.totalNum = opts.imgSrc.length; 

        this.$imgContainer = document.querySelector(opts.imgContainer);
        this.$imgMask = document.querySelector(opts.imgMask);
        this.$imgMask.children[0].style.backgroundImage = `url(${this.imgs[0].src})`;

        this.$old;
        this.$new;
        this.$right;
        this.$left;
        this.isBlock = false;

        if(opts.draggable){ this.initForDrag() }
        if(opts.mouseWheel){ this.initWeel()}
    }

    play(addNum){
        if(this.isBlock) return
        this.isBlock = true;
        //setTimeout( ()=>{this.isBlock = false} , (this.duration*0.9) * 1000 );

        if(this.$right) this.removeElement( this.$right )
        if(this.$left) this.removeElement( this.$left )

        if(addNum > 0){
            this.$new = this.createWrap("right", addNum); 
            this.transition(this.$old, this.$new,'right');
        } else if (addNum < 0){
            this.$new = this.createWrap("left", addNum)
            this.transition(this.$old, this.$new,'left');
        };
        this.nowNum = this.changeNum(addNum);
    }

    changeNum(addNum){
        let num = (this.nowNum + addNum) % this.totalNum;
        if(num === -1) num = this.totalNum - 1;
        return num;
    }

    createWrap(direction, addNum){
        this.$old = this.$imgContainer.children[0]; //this.$imgContainer.children[this.$imgContainer.children.length - 1];
        let _$new = this.$old.cloneNode(true);

        _$new.children[0].style.backgroundImage = `url(${this.imgs[this.changeNum(addNum)].src})`;
        this.$imgContainer.appendChild( _$new );
        if(direction === 'right'){
            if(this.type === 'x'){
                gsap.to( _$new, 0, {x: "100%", opacity: this.showImgOpacity});
                if(this.opts.overlap) gsap.to( _$new.children[0], 0, {x: `-${this.overlapRatio}`});
            } else {
                gsap.to( _$new, 0, {y: "100%", opacity: this.showImgOpacity});
                if(this.opts.overlap) gsap.to( _$new.children[0], 0, {y: `-${this.overlapRatio}`});
            }
        } else {
            if(this.type === 'x'){
                gsap.to( _$new, 0, {x: "-100%"})
                if(this.opts.overlap) gsap.to( _$new.children[0], 0, {x: `${this.overlapRatio}`});
            } else {
                gsap.to( _$new, 0, {y: "-100%"})
                if(this.opts.overlap) gsap.to( _$new.children[0], 0, {y: `${this.overlapRatio}`});
            }
        }
        return _$new
    }

    transition($old, $new, direction, duration, ease){
        let _targetPos;
        let _targetOverlap;
        let _cy;

        let _duration = duration || this.duration;
        let _ease = ease || this.ease;
        
        gsap.to( $new, _duration, {x: "0%", y:"0%", opacity: 1, ease: _ease});
        if(this.opts.overlap) gsap.to( $new.children[0], _duration, {x: "0%", y: "0%", ease: _ease}); 
        if(direction === 'right'){
            _targetPos = "-100%"
            _targetOverlap = this.overlapRatio
        } else {
            _targetPos ="100%"
            _targetOverlap = `-${this.overlapRatio}`
        }
        if(this.type === 'x'){
            gsap.to( $old, _duration, {x: _targetPos, opacity: this.hideImgOpacity,  ease: _ease, onComplete:()=>{ this.transitionComplete($old) }});
            if(this.opts.overlap) gsap.to( $old.children[0], _duration, {x: _targetOverlap, ease: _ease});
        } else {
            gsap.to( $old, _duration, {y: _targetPos, opacity: this.hideImgOpacity,  ease: _ease, onComplete:()=>{ this.transitionComplete($old) }});
            if(this.opts.overlap) gsap.to( $old.children[0], _duration, {y: _targetOverlap, ease: _ease});
        }
    }

    transitionComplete(ele){
        if(this._draggable){
            this._draggable[0].kill();
            this.initForDrag() // setTimeout( this.initForDrag.bind(this), 100 ) 
        }
        this.isBlock = false
        this.removeElement(ele) 
    }

    removeElement($ele){ $ele.parentNode.removeChild( $ele) }
    
    /* ////////////////////////////////// */
    /* ====  DRAG ======================= */

    initForDrag(){
        this.$left = this.$right = undefined;
        this.goToDirection = undefined;
        if(this.overlap) this.dragRatio = parseInt( this.overlapRatio ) / 100;
        this.dragOffset = undefined;
        this._draggable = undefined;
        this.createDraggble( this.$imgContainer.children[this.$imgContainer.children.length-1]  )
    }

    createDraggble($target){
        //if(this._draggable === undefined) return
        this._draggable = Draggable.create($target, { 
            type: this.type,
            cursor: this.opts.dragCursor || 'auto',
            activeCursor: this.opts.dragActiveCursor ||'auto',
            // bounds: this.$imgContainer ,
            onDragStart: this.ondragstart.bind(this),
            onDrag: this.ondrag.bind(this),
            onDragEnd: this.ondragend.bind(this),
        })
    }

    oldImgPos = (offset) => offset * -this.dragRatio; // (goToDirection === 'right') ? offset * -dragRatio : offset * -dragRatio;
    rightImgPos = (offset) =>{
        let firstPos;
        if(this.type === "x") firstPos = gsap.getProperty( this.$right, 'width')
        else                  firstPos = gsap.getProperty( this.$right, 'height')
        return (firstPos + offset) * -this.dragRatio;
    }
    leftImgPos = (offset) =>{
        let firstPos;
        if(this.type === "x") firstPos = gsap.getProperty( this.$right, 'width')
        else                  firstPos = gsap.getProperty( this.$right, 'height')
        return (firstPos - offset) * this.dragRatio;
    }

    ondragstart(){
        if(this.$right === undefined) this.$right = this.createWrap('right', 1)
        if(this.$left === undefined) this.$left = this.createWrap('left', -1)
    }

    ondrag(){
        if(this._draggable[0].getDirection("start") === "left" || this._draggable[0].getDirection("start") === "up")  this.goToDirection = "right"
        else this.goToDirection = "left"

        this.dragOffset = (this.type === "x") ? gsap.getProperty(this._draggable[0].target, 'x') : gsap.getProperty(this._draggable[0].target, 'y');

        let _property;
        let _xy;
        if(this.type === "x"){
            _property = 'width';
            _xy = "x"
        } else {
            _property = 'height'
            _xy = "y"
        }                 

        let oldOpacity = Math.abs( gsap.utils.mapRange( 0, gsap.getProperty(this.$old, _property) , 1 , this.hideImgOpacity, Math.abs(gsap.getProperty(this.$old, _xy)) ))
        let rightOpacity = Math.abs( gsap.utils.mapRange( gsap.getProperty(this.$right, _property), 0 , this.showImgOpacity , 1, gsap.getProperty(this.$right, _xy)) )
        let leftOpacity = Math.abs( gsap.utils.mapRange( -gsap.getProperty(this.$left, _property), 0 , this.showImgOpacity , 1, gsap.getProperty(this.$left, _xy)) )
        gsap.to( this.$old, 0, {opacity: oldOpacity})
        
        if(this.type === "x"){ 
            gsap.to( this.$old.children[0], 0, {x: this.oldImgPos( this.dragOffset ) })
            gsap.to( this.$right, 0, {x: gsap.getProperty(this.$right, _property) + this.dragOffset, opacity: rightOpacity })
            gsap.to( this.$left, 0, {x: -gsap.getProperty(this.$left, _property) + this.dragOffset , opacity: leftOpacity })        
        
            if(this.opts.overlap){
                gsap.to( this.$right.children[0], 0, {x: this.rightImgPos( this.dragOffset ) })
                gsap.to( this.$left.children[0], 0, {x: this.leftImgPos( this.dragOffset ) })
            }
        }
        else {
            gsap.to( this.$old.children[0], 0, {y: this.oldImgPos( this.dragOffset ) })
            gsap.to( this.$right, 0, {y: gsap.getProperty(this.$right, _property) + this.dragOffset, opacity: rightOpacity })
            gsap.to( this.$left, 0, {y: -gsap.getProperty(this.$left, _property) + this.dragOffset , opacity: leftOpacity })        
        
            if(this.opts.overlap){
                gsap.to( this.$right.children[0], 0, {y: this.rightImgPos( this.dragOffset ) })
                gsap.to( this.$left.children[0], 0, {y: this.leftImgPos( this.dragOffset ) })
            }
        }
    }

    ondragend(){
        this._draggable[0].disable();
        let _changeStandard; // 넘어가는 기준 설정
        if(this.type === 'x') _changeStandard = gsap.getProperty(this.$imgContainer.children[0], "width") / 2
        else _changeStandard = gsap.getProperty(this.$imgContainer.children[0], "height") / 2

        if(Math.abs(this.dragOffset) > _changeStandard ){
            if(this.dragOffset < 0){
                this.transition(this.$old, this.$right, "right", 0.5, "Quint.easeOut");
                gsap.delayedCall(0.5 , this.ondragChangeComplete.bind(this),[this.$left] )
                this.nowNum = this.changeNum(1);
            } else {
                this.transition(this.$old, this.$left, "left", 0.5, "Quint.easeOut");
                gsap.delayedCall(0.5 , this.ondragChangeComplete.bind(this),[this.$right] )
                this.nowNum = this.changeNum(-1);
            }
        } else {
            this.ondragReset()
            gsap.delayedCall(0.5, ()=>{ this._draggable[0].enable(); })
        }
    }

    ondragChangeComplete(ele){
        this.removeElement(ele)
        this._draggable[0].kill();
        this._draggable[0].target = this.$imgContainer.children[0]
        this.initForDrag()
    }

    ondragReset(){
        if(this.type === 'x'){
            gsap.to( this.$old, .5, {ease: 'Quint.easeOut', x: '0%', opacity: 1})
            gsap.to( this.$right, .5, {ease: 'Quint.easeOut', x: '100%', opacity: this.showImgOpacity})
            gsap.to( this.$left, .5, {ease: 'Quint.easeOut', x: '-100%', opacity: this.showImgOpacity})
            if(this.overlap){
                gsap.to( this.$old.children[0], .5, {ease: 'Quint.easeOut', x: '0%'})
                gsap.to( this.$right.children[0], .5, {ease: 'Quint.easeOut', x: `-${this.overlapRatio}`})
                gsap.to( this.$left.children[0], .5, {ease: 'Quint.easeOut', x: `${this.overlapRatio}`})
            }
        }
        else {
            gsap.to( this.$old, .5, {ease: 'Quint.easeOut', y: '0%', opacity: 1})
            gsap.to( this.$right, .5, {ease: 'Quint.easeOut', y: '100%', opacity: this.showImgOpacity})
            gsap.to( this.$left, .5, {ease: 'Quint.easeOut', y: '-100%', opacity: this.showImgOpacity})
            if(this.overlap){
                gsap.to( this.$old.children[0], .5, {ease: 'Quint.easeOut', y: '0%'})
                gsap.to( this.$right.children[0], .5, {ease: 'Quint.easeOut', y: `-${this.overlapRatio}`})
                gsap.to( this.$left.children[0], .5, {ease: 'Quint.easeOut', y: `${this.overlapRatio}`})
            }
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
            if( e.deltaY < 0) this.play(1)
            else if( e.deltaY > 0) this.play(-1)
        }

        this.$imgContainer.addEventListener('wheel', throttle ( onWheel , this.duration*1000 )  );
    }
}

/*

*/

let imgSrc = [
    "https://pbs.twimg.com/media/ExUElF7VcAMx7jx.jpg",
    "https://img.huffingtonpost.com/asset/5cb04c561f0000c6007f1a5f.jpeg?ops=scalefit_630_noupscale",
    "https://file2.nocutnews.co.kr/newsroom/image/2021/03/25/202103251659468108_0.jpg",
    "https://pds.joins.com/news/component/htmlphoto_mmdata/202103/30/0d115e5d-a4fe-4ff8-9689-6b77a730d19d.jpg",
]

const imgChange = new ImageOverlapChange({
    type: "y",          // 방향설정
    overlap: true,     // 겹쳐서 이동할 것인지
    overlapRatio: "75%", // 몇 퍼센트로 겹칠 것인지
    hideImgOpacity: .25, // 사라질 이미지 오퍼시티
    showImgOpacity: 1, // 나타날 이미지 오퍼시티
    imgSrc: imgSrc,      // 이미지 경로
    imgContainer: ".img-container", 
    imgMask: ".img-wrap",
    duration: .75,
    ease: BezierEasing(0.4, 0, 0.2, 1),
    draggable: true,
    dragCursor: "grab",
    dragActiveCursor: "grabbing",
    mouseWheel: true,

})


$(".btn-next").addEventListener('click', ()=>{
    imgChange.play(1) // 한단계씩 이동
})

$(".btn-prev").addEventListener('click', ()=>{
    imgChange.play(-1) // 한단계씩 이동
})

$(".btn-isdrag").addEventListener('click',(e)=>{
    console.log( e.currentTarget.innerText )
    if(e.currentTarget.innerText === "drag disable"){
        imgChange.dragDisable(); // 드래그 비활성화
        e.currentTarget.innerText = "drag enable";
    } else {
        imgChange.dragEnable(); // 드래그 활성화
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