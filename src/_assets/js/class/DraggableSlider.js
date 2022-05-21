import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin );


class DraggableSlider {
    constructor( opts ){
        if(opts.selector === undefined) return;

        const defaults ={
            duration: .5,
            ease: 'Quint.easeOut',
            activeSlideNum: 0,
            axis: 'x',
            overDragScale: 0.65,
            min:0,
            max:window.innerWidth,
            velocity: 200,
            totalNum: 0,
            slideItemSize: window.innerWidth,
        };
        this.opts = {...defaults, ...opts};

        this.activeSlideNum = 0;
        this.totalNum = this.opts.totalNum;
        this.snap = this.opts.snap;

        this.createSlider();
    }

    createSlider(){
        const $ = this;
        Draggable.create( this.opts.selector , {
            type: $.opts.axis,

            onDrag: function(e){
                // let max = (this.vars.type === "x") ? this.maxX: this.maxY
                // let min = (this.vars.type === "x") ? this.minX: this.minY
                
                if( gsap.getProperty(this.target, this.vars.type ) > $.opts.max){
                    let opt = (this.vars.type === "x") 
                    ? { x: ($.opts.max - gsap.getProperty(this.target, "x")) * $.opts.overDragScale }
                    : { y: ($.opts.max - gsap.getProperty(this.target, "y")) * $.opts.overDragScale }
                    gsap.set(this.target.parentNode, { ...opt } )
                }
                if( gsap.getProperty(this.target, this.vars.type ) < $.opts.min){
                    let opt = (this.vars.type === "x") 
                    ? { x: ($.opts.min - gsap.getProperty(this.target, "x")) * $.opts.overDragScale }
                    : { y: ($.opts.min - gsap.getProperty(this.target, "y")) * $.opts.overDragScale }
                    gsap.set(this.target.parentNode, { ...opt } )
                }
            },

            onDragEnd: function(e){
                
                if( Math.abs( InertiaPlugin.getVelocity( this.target, this.vars.type)) > $.opts.velocity){
                    $.changeSlideNum(this.startX, this.endX)
                } else {
                    if( Math.abs(this.startX - this.endX) > $.opts.slideItemSize / 2){
                        $.changeSlideNum( this.startX, this.endX )
                    }
                };
                gsap.to(this.target, { 
                    duration: $.opts.duration,
                    ease: $.opts.ease, 
                    x: ()=> ($.snap[$.activeSlideNum] < $.opts.min) ? $.opts.min : $.snap[$.activeSlideNum]
                })

                
                /* overshoot 원상복귀 */
                if( gsap.getProperty(this.target.parentNode, this.vars.type) != 0){
                    const opt = (this.vars.type === "x") ? {x:0} : {y:0};
                    gsap.to(this.target.parentNode, .5, { 
                        duration: $.opts.duration,
                        ease: $.opts.ease, 
                        ...opt 
                    })
                }
                /* ------------------ */
            }
            


        });
    }

    changeSlideNum(start, end){
        if( end < start ) {     // go
            this.activeSlideNum  = (this.activeSlideNum + 1 >= this.opts.totalNum) ? this.opts.totalNum-1 : this.activeSlideNum + 1
        } 
        else if( end > start ){ // back
            this.activeSlideNum  = this.activeSlideNum - 1 < 0 ? 0 : this.activeSlideNum - 1
        }
    }
}

export default DraggableSlider