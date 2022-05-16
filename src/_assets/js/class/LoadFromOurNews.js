class LoadFromOurNews {
    constructor(opts){

        this.id = opts.id;
        this.homeArr = []
        this.historyArr = []
        this.impactArr = []

        this.fetchPage( "/fromournewsroom/from-our-newsroom/" );
    }

    fetchPage(src){
        (async()=>{
            const res = await fetch(src);
            const contentType = res.headers.get('content-type');
            if (contentType?.includes('application/json')){
                const json = await res.json();
            } else {
                const html = await res.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');

                console.log( doc )
                // ------ items ---------- //
                this.homeArr = doc.querySelectorAll('#home .news_item-link')
                this.historyArr = doc.querySelectorAll('#history .news_item-link')
                this.impactArr = doc.querySelectorAll('#impact .news_item-link');

                console.log( this.homeArr )

                this.replaceLink();
            }
        })()
    };

    replaceLink(){
        if(this.id === "newsroom") return

        if(this.id === "home")           this.arr = this.homeArr
        else if(this.id === "history")   this.arr = this.historyArr
        else if(this.id === "impact")    this.arr = this.impactArr

        document.querySelectorAll('.section-news a').forEach((link, i)=>{
            link.href = this.arr[i].href;
            link.querySelector(".news_item-img").style.backgroundImage = this.arr[i].querySelector(".news_item-img").style.backgroundImage;
            link.querySelector(".h3-mu24").innerHTML = this.arr[i].querySelector(".h3-mu24").innerHTML
            link.querySelector(".news_item-date").innerHTML = this.arr[i].querySelector(".news_item-date").innerHTML

        })

    }   

};

export default LoadFromOurNews;