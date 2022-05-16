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



let t = new TextSplitWordsShow({
    // words : new SplitText( title, { type: "words" }).words,
    splitIntersection: [[0] , [1,2,3], [4], [5,6,7]],
    duration: .8,
    ease: 'Quart.easeOut',
    staggerTime: .1,
    gapTime: -.4,
    x: 0,
    y: 60,
})

/* 
    옵션 값 바뀌기 가능.
    바꾸면 init() 함수 호출.
*/
const title = document.querySelector('.title');
title.innerHTML = "I am a boy. You are a girl."

const tOpts = {
    words : new SplitText( title, { type: "words" }).words,
    duration: 1,
    ease: 'Quint.easeOut',
    staggerTime: .1,
    gapTime: -.4,
    x: 30,
    y: 0,
};
for(var key in tOpts) t[key] = tOpts[key]


// t.words = new SplitText( title, { type: "words" }).words;
// t.splitIntersection = [[0] , [1,2,3], [4], [5,6,7]]
t.init(); // 셋팅
 // 재생

setTimeout(()=> {
    t.play();
}, 2000)

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
        gsap.set( this.lines, {x: this.x, y: this.y, autoAlpha: this.autoAlpha ? 0 : 1})

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

// console.log(document.querySelector('.sentence').innerHTML)
let m = new TextSlitLinesMasking({
    splitText: new SplitText(document.querySelector('.sentence'), { 
        type: "lines,words,chars", 
        linesClass: "split-line", // over-flow:hidden 클래스 적용
    }),
    charsStagger: 0.02,
    wordStagger: 0.1,
    lineDelay: 1,
    y: 80,
    // autoAlpha: true,
})
/*  
    m.play('lines');
    라인별 등장.
    wordStagger: 수치를 0으로 하면 한줄 통째로 등장.
                    수치 입력하면 한 줄에서 단어별로 등장.
    lineDelay: 라인별 등장 딜레이
*/

/*
    m.play();
    한글자씩 등장...charsStagger 수치 활용
*/

/* 
    옵션 값 바뀌기 가능.
*/
const mOpts = {
    duration: 1,
    ease: 'Quint.easeOut',
    staggerTime: .1,
    lineDelay: 0,       // 라인 순차 애니메이션 때, 라인별 딜레이
    gapTime: -.4,
    x: 30,
    y: 100,
};
for(var key in mOpts) m[key] = mOpts[key]
m.play('lines');



//===============================================================================================================================
/*=====  간략 함수 버전 ======================*/
//===============================================================================================================================

const quotes = document.querySelectorAll(".character");

function setupSplits() {
    quotes.forEach(quote => {
        // Reset if needed
        if(quote.anim) {
            quote.anim.progress(1).kill();
            quote.split.revert();
        }

        quote.split = new SplitText(quote, { 
            type: "lines,words,chars",
            linesClass: "split-line" // over-flow:hidden 클래스 적용
        });

        /* Set up the anim */
        quote.anim = gsap.from(quote.split.chars, {
            // scrollTrigger: {
            //     trigger: quote,
            //     toggleActions: "restart pause resume reverse",
            //     start: "top 50%",
            // },
            duration: 0.6, 
            ease: "circ.out", 
            y: 80, 
            stagger: 0.02,
        });

    });
}

setupSplits();