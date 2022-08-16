function $( $selector, $context ) {
    const context = $context || document;
    return ( $selector.indexOf('#') > -1 ) ? context.getElementById( $selector.replace('#','') ) : context.querySelector( $selector );
}

function debounce( fn, wait, immediate ){
    var slice = [].slice;
    var timeout;
    if (wait == null) wait = 100;
    timeout = null;
    return function(){
        var args, delayed, obj;
        args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        obj = this;
        delayed = function() {
            if (!immediate) fn.apply(obj, args); 
            return timeout = null;
    };
    if (timeout) clearTimeout(timeout);
    else if (immediate) fn.apply(obj, args);
    return timeout = setTimeout(delayed, wait);
    };
}

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