import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(
    ScrollTrigger
);

import { Pointer, lerp, map } from "./common";
import Aladino from '../class/Aladino/index'


async function fetchData(){
    const res = await fetch('/partners/brands/');
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html'); 
    return doc
} 


const Partners = (function(exports){

    let brandsName = [];
    let brandsImg = [];
    let activeNum = 0;

    let pointer;
    let aladino, material, carpet;

    let oldSpeed = [0, 0];
    let defaultX, limitXmin, tx;

    let isStart = false

    const getData=()=> { return {brandsName, brandsImg}}

    async function fetchPage(){
        // if( brandsName.length === 0 ){ 
            
            brandsName = []
            brandsImg = []
            const doc = await fetchData()

            doc.querySelectorAll('.brand_name').forEach( (item,i) => brandsName.push(item.innerHTML) );
            doc.querySelectorAll('.brand_img').forEach( (item,i) => {
                // const img = new Image()
                // img.src = item.src
                // img.onload=()=>
                brandsImg.push(item.src) 
            });   

            
        // }
    }

    //====================================================================================
    /*===== 브랜드명 추가하기 .partner_item ======================*/
    //====================================================================================
    const createBrand =()=>{
        document.querySelector('.partner_brandname:nth-child(1) > h3').innerHTML = brandsName[0];
        brandsName.forEach( (name, i)=>{
            if(i === 0)return
            document.querySelector('.partner_list').innerHTML += 
                `<li data-num="${i}" class="partner_item"><div class="partner_brandname"><h3 class="h3-mu48">${name}</h3></div></li>`
        })
        headerChange(true)
    }

    //====================================================================================
    /*===== Brand 부모바꾸기 ======================*/
    //====================================================================================
    const headerChange =(isChange)=>{
        if(!document.querySelector('.section-partner_header')) return
        if(isChange){
            document.querySelector('.page-wrap').appendChild(document.querySelector('.section-partner_header'))
        } else {
            document.querySelector('.section-partner_header').remove()
        }
    }

    //====================================================================================
    /*===== addEvent ======================*/
    //====================================================================================
    const addEvent=()=> document.querySelector('.partner_list').addEventListener('mouseover', overHandler)

    const overHandler=(e)=>{
        const elem = e.target;
        if(elem.classList.contains('partner_list')) return
        activeNum = elem.dataset.num * 1;

        /* 오버한 브랜드만 이미지 보이기 */
        activeBrandName();
        const img = new Image()
        img.src = brandsImg[activeNum]
        img.onload =()=>{
            // if( img.naturalWidth < img.naturalHeight ){
            //     console.log('is-row')
            //     carpet.dom = document.querySelector('.brand_img-wrap.is-row')
            //     carpet.resize()
            // } else {
            //     console.log('is-column')
            // }
            const classname = ( img.naturalWidth < img.naturalHeight ) ? '.brand_img-wrap.is-row' : '.brand_img-wrap.is-column'
            carpet.dom = document.querySelector(classname)
            carpet.resize()
            carpet.uniforms.image = aladino.texture( brandsImg[activeNum] )
        }
        // carpet.uniforms.image = aladino.texture( brandsImg[activeNum] )

        // let tl = gsap.timeline()
        // .to( aladino.canvas, { autoAlpha: 0, duration: .1, ease: ease.standard })
        // .add(()=>{
        //     carpet.uniforms.image = aladino.texture( getData().brandsImg[activeNum] )
        // })
        // .to( aladino.canvas, { autoAlpha:1, duration: 1, ease: ease.standard })
    }

    const activeBrandName =()=> {
        document.querySelectorAll(`.partner_item`).forEach((el, i)=>{
            el.dataset.num * 1 === activeNum ? el.classList.add('is-active') : el.classList.remove('is-active')
        })
    }

    /*======================================================== */
    /* ----- Aladino -----------*/
    
    const preloadImg=( callback )=>{
        let raf;
        let loadedNum = 0;

        const update=()=>{
            if( loadedNum > getData().brandsImg.length ){
                cancelAnimationFrame(raf)
                carpet.uniforms.image = aladino.texture( getData().brandsImg[activeNum] )
                document.querySelector('.page-wrap').addEventListener('mouseover', firstPlay );

                callback()
                // loadingComplete(); // -------------------------------------------------------- 이미지 미리 불러오고 로딩 완료시키기
                return
            }
            carpet.uniforms.image = aladino.texture( brandsImg[loadedNum] )
            loadedNum++;
            raf = requestAnimationFrame(update)
            console.log('lookbook preload')
        }
        update();
    }

    const aladinoSetting =()=>{
        pointer = new Pointer();

        aladino = new Aladino({
            canvas: document.querySelector('#LookBook'),
            density: 20,
            autoScroll: false,
            post: {
                /* 효과 적용 */
                fragment: /* glsl */ `
                    precision highp float;
                    
                    uniform float time;
                    uniform float speed;
                    uniform vec2 viewport;
                    uniform sampler2D image;
        
                    float parabola(float x, float k) {
                        return pow(4.0*x*(1.0-x), k);
                    }
        
                    float random(vec2 co) {
                        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
                    }
        
                    void main() {
                        vec2 uv = gl_FragCoord.xy / viewport;
                        float spe = speed * 300.0;
                        float p = parabola(uv.x, 1.4);
                        float r = texture2D(image, uv + vec2(0.00 * spe, 0.0) * p).r;
                        float g = texture2D(image, uv + vec2(0.01 * spe, 0.0) * p).g;
                        float b = texture2D(image, uv + vec2(0.02 * spe, 0.0) * p).b;
        
                        gl_FragColor = vec4(r, g, b, 1.0);
        
                        float n = random(uv + mod(time, 3.0));  // noise 느낌 적용
                        float nn = 1.0;                         // 노출(밝기) 효과
                        gl_FragColor.rgb *= nn - (n * 0.1);
                    }
                `,
                uniforms: {
                    speed: 0, // fragment 안에 사용되는 변수 //
                },
            },
        });
        
        material = aladino.material({
            vertex: /* glsl */ `
                attribute vec2 position;
                attribute vec2 uv;

                uniform mat4 projection;
                uniform float time;
                uniform vec2 speed;

                // uniform float speed;
                // uniform float speed2;

                varying vec2 vUv;

                float parabola( float x, float k ) {
                    return pow( 4.0*x*(1.0-x), k );
                }

                void main() {
                    vUv = uv;

                    vec4 pos = vec4(position, 0.0, 1.0);

                    vec2 spee = speed * 0.03;
                    pos.x += parabola(uv.y, 1.0) * spee.x;
                    pos.y -= parabola(uv.x, 1.0) * spee.y;

                    // float spee = speed * 2.0;
                    // pos.x += parabola(uv.y, 1.0) * spee;
                    // vec4 pp = projection * vec4(position, 0.0, 1.0);
                    // float yy = ((pp / pp.w).x + 1.0) / 2.0;
                    // pos.z = parabola(clamp(yy, 0.0, 1.0), 2.4) * speed2 * 160.0;
                    // pos.z = clamp(pos.z, -6.0, 6.0);
                    
                    gl_Position = projection * pos;
                }
            `,
            fragment: /* glsl */ `
                precision highp float;

                uniform vec2 size;
                uniform vec2 sizeImage;
                uniform sampler2D image;
                uniform vec2 speed;

                varying vec2 vUv;

                vec4 coverTexture(sampler2D tex, vec2 imgSize, vec2 ouv) {
                    vec2 s = size;
                    vec2 i = imgSize;

                    float rs = s.x / s.y;
                    float ri = i.x / i.y;
                    vec2 new = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
                    vec2 offset = (rs < ri ? vec2((new.x - s.x) / 2.0, 0.0) : vec2(0.0, (new.y - s.y) / 2.0)) / new;
                    vec2 uv = ouv * s / new + offset;
                
                    return texture2D(tex, uv);
                }

                void main() {
                    // vec2 s = vUv;
                    // s -= .5;
                    // s *= 0.7;
                    // s -= (speed * 0.03);
                    // s += .5;
                    // // gl_FragColor = coverTexture(image, sizeImage, s);
                    gl_FragColor = coverTexture(image, sizeImage, vUv);
                }
            `,
            // uniforms: {
            //     speed: 0,
            //     speed2: 0,
            // },
        });
        
        carpet = aladino.carpet( document.querySelector( '.brand_img-wrap.is-row' )  , {
            material,
            uniforms: {
                image: aladino.texture( brandsImg[0] ),
                speed: [0, 0]
            },
        });
        
        gsap.set( aladino.canvas, { zIndex: -1, autoAlpha: 1})  // 캔버스 맨 밑으로 이동
        canvasShow(true)
        // document.body.appendChild(aladino.canvas);              // 캔버스 추가
    }

    const firstPlay =(e)=> {
        if(isStart) return;
        isStart = true;
        update();
        document.querySelector('.page-wrap').removeEventListener('mouseover', firstPlay );
    }

    const update =()=>{
        if(!document.querySelector('.partner_list')) return

        console.log('update')
        requestAnimationFrame(update)

        // carpet.position[0] = lerp( carpet.position[0], pointer.coords[0] - carpet.bounds.width / 2, 0.2 );
        // carpet.position[1] = lerp( carpet.position[1], pointer.coords[1] - carpet.bounds.height / 2, 0.2 );

        /* 위치 이동 */
        defaultX = document.querySelector('.brand_img-wrap.is-row').getBoundingClientRect().left;
        limitXmin = document.querySelector('.partner_list').getBoundingClientRect().left - 200;
        tx = pointer.coords[0] - defaultX;
        if(pointer.coords[0] < limitXmin) tx = limitXmin - defaultX
        if(pointer.coords[0] > defaultX) tx = 0

        carpet.position[0] = lerp( carpet.position[0], tx, 0.2);
        // carpet.position[1] = pointer.coords[1] - carpet.bounds.height;

        /* 왜곡 */
        carpet.uniforms.speed[0] = lerp( carpet.uniforms.speed[0], (carpet.position[0] - oldSpeed[0]) * 0.1, 0.7 );
        carpet.uniforms.speed[1] = lerp( carpet.uniforms.speed[1], (carpet.position[1] - oldSpeed[1]) * 0.1, 0.7 );
        oldSpeed[0] = carpet.position[0];
        oldSpeed[1] = carpet.position[1];

        /* RGB 효과 */
        aladino.post.uniforms.speed = lerp( aladino.post.uniforms.speed, carpet.uniforms.speed[0] * 0.001,  0.1 );
        // carpet.uniforms.image = aladino.texture( getData().brandsImg[activeNum] )
    };

    const canvasShow =(isShow)=>{
        if(!aladino) return
        const parentElem = aladino.canvas.parentElement
        isShow ? parentElem.classList.remove('is-hide') : parentElem.classList.add('is-hide')
        // aladino.canvas.style.display = isShow ? 'block' : 'none'
        // gsap.set( aladino.canvas, { zIndex: -1, autoAlpha: 1})
    }

    const init =()=>{
        if(!document.querySelector('.partner_list')) return
        isStart = false;
        addEvent();
        activeBrandName()
    }

    
    
    exports = {
        getData,
        fetchPage,
        createBrand,
        headerChange,
        aladinoSetting,
        preloadImg,
        canvasShow,

        init,
    }

    return exports;
})({});
// ( async()=>{
//     await Partners.fetchPage()
//     Partners.createBrand()
// })()

const Partners_Mobile =(function(exports){
    let brandsName = [];
    let brandsImg = [];

    const getData=()=> { return {brandsName, brandsImg}}

    const fetchPage = async()=>{
        brandsName = []
        brandsImg = []
        const doc = await fetchData()

        doc.querySelectorAll('.brand_name').forEach( (item,i) => brandsName.push(item.innerHTML) );
        doc.querySelectorAll('.brand_img').forEach( (item,i) => {
            // const img = new Image()
            // img.src = item.src
            // img.onload=()=>
            brandsImg.push(item.src) 
        });  
    }

    const createBrand =()=>{
        document.querySelector('#BrandName > h3').innerHTML = brandsName[0];
        document.querySelector('#BrandImg').style.backgroundImage = `url(${brandsImg[0]})`;
        brandsName.forEach( (name, i)=>{
            if(i === 0)return
            if( i < 4 ){
            document.querySelector('.m_partner_list').innerHTML += 
                `<li class="m_partner_item"> 
                    <div class="m_brandname">  <h3 class="h3-mu20 is-white">${brandsName[i]}</h3>  </div> 
                    <div class="m_brandimg" style="background-image:url(${brandsImg[i]})">  </div> 
                </li>`
            } else {
                document.querySelector('.m_partner_list').innerHTML += 
                `<li class="m_partner_item" data-stagger-batch="true"> 
                    <div class="m_brandname">  <h3 class="h3-mu20 is-white">${brandsName[i]}</h3>  </div> 
                    <div class="m_brandimg" data-src="${brandsImg[i]}">  </div> 
                </li>`
            }
        })

        lazyLoad()
    }

    const lazyLoad =()=>{
        document.querySelectorAll('.m_brandimg').forEach((img, i) => {
            if( i < 4) return;

            const src = img.dataset.src;
            const loadImage =()=>{
                const newImg = new Image()
                newImg.src = src
                newImg.onload =()=> {
                    newImg.onload = null;
                    img.style.backgroundImage = `url(${src})`
                    st && st.kill();
                }
            }

            const st = ScrollTrigger.create({
                // markers: true,
                id: 'brand',
                trigger: img,
                start: `-${window.innerHeight}% center`,
                onEnter: loadImage,
                onEnterBack: loadImage,
            })

        });
    }

    exports ={
        getData,
        fetchPage,
        createBrand
    }


    return exports
})({})


export {
    Partners, Partners_Mobile
};




