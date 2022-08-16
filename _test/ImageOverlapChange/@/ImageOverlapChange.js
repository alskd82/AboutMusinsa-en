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
        this.isBlock = false;

    }

    play(addNum){
        if(this.isBlock) return
        this.isBlock = true;
        setTimeout( ()=>{this.isBlock = false} , (this.duration*0.9) * 1000 )
        this.changeNum(addNum);
        if(addNum > 0){
            this.createWrap("right"); 
            this.transition(this.$old, this.$new,'right');
        } else if (addNum < 0){
            this.createWrap("left")
            this.transition(this.$old, this.$new,'left');
        }
    }

    changeNum(addNum){
        this.nowNum = (this.nowNum + addNum) % this.totalNum;
        if(this.nowNum === -1) this.nowNum = this.totalNum - 1;
    }

    createWrap(direction){
        this.$old = this.$imgContainer.children[this.$imgContainer.children.length - 1];
        this.$new = this.$old.cloneNode(true);
        this.$new.children[0].style.backgroundImage = `url(${this.imgs[this.nowNum].src})`;
        this.$imgContainer.appendChild( this.$new );
        if(direction === 'right'){
            if(this.type === 'x'){
                gsap.to( this.$new, 0, {x: "100%", opacity: this.showImgOpacity});
                if(this.opts.overlap) gsap.to( this.$new.children[0], 0, {x: `-${this.overlapRatio}`});
            } else {
                gsap.to( this.$new, 0, {y: "100%", opacity: this.showImgOpacity});
                if(this.opts.overlap) gsap.to( this.$new.children[0], 0, {y: `-${this.overlapRatio}`});
            }
        } else {
            if(this.type === 'x'){
                gsap.to( this.$new, 0, {x: "-100%"})
                if(this.opts.overlap) gsap.to( this.$new.children[0], 0, {x: `${this.overlapRatio}`});
            } else {
                gsap.to( this.$new, 0, {y: "-100%"})
                if(this.opts.overlap) gsap.to( this.$new.children[0], 0, {y: `${this.overlapRatio}`});
            }
        };        
    }

    transition($old, $new, direction){
        let _targetPos;
        let _targetOverlap;
        let _cy;
        
        gsap.to( $new, this.duration, {x: "0%", y:"0%", opacity: 1, ease: this.ease});
        if(this.opts.overlap) gsap.to( $new.children[0], this.duration, {x: "0%", y: "0%", ease: this.ease});
        if(direction === 'right'){
            _targetPos = "-100%"
            _targetOverlap = this.overlapRatio
        } else {
            _targetPos ="100%"
            _targetOverlap = `-${this.overlapRatio}`
        }
        if(this.type === 'x'){
            gsap.to( $old, this.duration, {x: _targetPos, opacity: this.hideImgOpacity,  ease: this.ease, onComplete:()=>{ $old.parentNode.removeChild($old) }});
            if(this.opts.overlap) gsap.to( $old.children[0], this.duration, {x: _targetOverlap, ease: this.ease});
        } else {
            gsap.to( $old, this.duration, {y: _targetPos, opacity: this.hideImgOpacity,  ease: this.ease, onComplete:()=>{ $old.parentNode.removeChild($old) }});
            if(this.opts.overlap) gsap.to( $old.children[0], this.duration, {y: _targetOverlap, ease: this.ease});
        }
        
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
    ease: BezierEasing(0.4, 0, 0.2, 1)
})


$(".btn-next").addEventListener('click', ()=>{
    imgChange.play(1) // 한단계씩 이동
})

$(".btn-prev").addEventListener('click', ()=>{
    imgChange.play(-1) // 한단계씩 이동
})


let draggable = Draggable.create( $(".img-wrap"),{
    type: 'y',
    // bounds: $(".img-container"),
    onMove:()=>{
        console.log( gsap.getProperty( $(".img-wrap"), 'y' ) )
    }
})



// function isMobile(){ return /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent); }

// const START = isMobile() ? 'touchstart' : 'mousedown';

// $(".img-container").addEventListener( START, touchStart )


// function touchStart(e){
//     console.log(e.type)
//     let offset = {}
//     if(e.type === "touchstart"){
//         let _e = e.currentTarget.getBoundingClientRect();
//         offset = {x:e.touches[0].clientX - _e.left, y:  e.touches[0].clientY - _e.top } 
//     } else {
//         offset = {x:e.offsetX, y: e.offsetY }
//     }
//     console.log( offset )
// }