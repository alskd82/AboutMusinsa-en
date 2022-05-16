import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
gsap.registerPlugin( SplitText );

//===============================================================================================================================
/*=====  단어별로 타이밍 맞춰 등장하기  ======================*/
//===============================================================================================================================
class TextSplitWordsShow {
    constructor( opts ){
        // if(opts.splitIntersection === undefined) return;
        const defaults = {
            duration: 1,
            ease: 'Quart.easeOut', 
            staggerTime: .1,
            gapTime: -.5,
            words: [], // new SplitText( title, { type: "words" }).words
            splitIntersection: [], 
            x: 0,
            y: 60
        }
        
        this.opts = {...defaults, ...opts};
        this.duration = this.opts.duration;
        this.ease = this.opts.ease;
        this.staggerTime = this.opts.staggerTime;
        this.gapTime = this.opts.gapTime;   // 직전에 등장하는 array 의 끝나는 시간 기준 얼마나 갭을 둘 것인가
        this.words = this.opts.words;       // new SplitText( title, { type: "words" }).words
        this.splitIntersection =  this.opts.splitIntersection; // splitText 의 분기 점을 배열로 넣기
        this.x = this.opts.x
        this.y = this.opts.y

        if(this.words.length > 0) this.init();

    }

    init(){
        this.splitArray = [];

        this.splitIntersection.forEach( (word,i) => {
            this.splitArray[i] = []
            word.forEach(( w, j)=>{
                this.splitArray[i].push( this.words[w] )
            })
        });

        this.splitArray.forEach( arr => gsap.set( arr, { autoAlpha: 0, x: this.x, y: this.y }) )
    }

    play(){
        let tl= gsap.timeline();
        this.splitArray.forEach( (a, i) => {
            let gap = (i === 0) ? "0" : (this.gapTime < 0) ? `-=${Math.abs(this.gapTime)}` : `+=${Math.abs(this.gapTime)}`
            
            tl.to(a, {
                duration: this.duration, 
                autoAlpha: 1, 
                x:0, y: 0, 
                stagger: this.staggerTime, 
                ease: this.ease
            }, gap);
        })
    }
}

//===============================================================================================================================
/*===== 텍스트 마스킹 애니메이션 ======================*/
//===============================================================================================================================
class TextSlitLinesMasking {
    constructor( opts ){
        const defaults = {
            duration: 1,
            ease: 'Quart.easeOut', 
            x: 0, y: 100,
            staggerTime: .1,    // 순차 재생 타이밍
            lineDelay: 1,       // 라인 순차 애니메이션 때, 라인별 딜레이
            autoAlpha: false,
        };
        this.opts = {...defaults, ...opts};
        this.duration = this.opts.duration;
        this.ease = this.opts.ease;
        this.x = this.opts.x;
        this.y = this.opts.y;
        this.splitText = this.opts.splitText;
        this.charsStagger = this.opts.charsStagger;
        this.wordStagger = this.opts.wordStagger;   // play('lines') 일 때, 단어별 순차 재생
        this.lineDelay = this.opts.lineDelay        // play('lines') 일 때, 라이별 실행 딜레이
        this.autoAlpha = this.opts.autoAlpha;       // 마스킹이 아닌 오퍼시티로 애니메이션 넣기 위해

        this.init();
    }

    init(){
        if(!this.splitText) return;
        gsap.set( this.splitText.chars, { x: this.x, y: this.y, autoAlpha: this.autoAlpha ? 0 : 1 });

        this.lines = []
        this.splitText.lines.forEach( (line, i)=>{
            this.lines[i] = []
            for(let j=0; j<line.children.length; j++){
                // console.log( j)
                this.lines[i].push(line.children[j])
            }
        } )
        this.reset()
    }

    reset(){
        gsap.killTweensOf( this.lines )
        gsap.set( this.lines, {x: this.x, y: this.y, autoAlpha: this.autoAlpha ? 0 : 1})
        // gsap.set( this.lines, {x: this.x, y: this.y, autoAlpha: this.autoAlpha ? 0 : 1, overflow: 'hidden'})
    }

    play( type ){
        if( type === 'lines'){
            gsap.set( this.splitText.chars, { x: 0, y: 0, autoAlpha: 1 });

            this.lines.forEach( (line, i) =>{
                gsap.to( line ,{
                    x: 0, y: 0,
                    ease: this.ease,
                    duration: this.duration,
                    stagger: this.wordStagger,
                    delay: this.lineDelay * i,
                    autoAlpha: 1,
                    onComplete:() => this.complete()
                })
            })

        } else {
            gsap.set( this.lines, {x: 0, y: 0, autoAlpha: 1})
            gsap.to( this.splitText.chars, { 
                x: 0, y: 0,
                ease: this.ease,
                duration: this.duration,
                stagger: this.charsStagger,
                autoAlpha: 1,
                onComplete:() => this.complete()
            });
        }
    }

    complete(){
        // console.log('complete')
    }

}

export {
    TextSplitWordsShow,
    TextSlitLinesMasking
}