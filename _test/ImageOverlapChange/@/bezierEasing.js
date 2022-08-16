// BezierEasing function type :: https://jsfiddle.net/0x51ew2L/ //
/*--------------Library code----------------*/
/**
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 – MIT License
 *
 * Credits: is based on Firefox's nsSMILKeySpline.cpp
 * Usage:
 * var spline = BezierEasing(0.25, 0.1, 0.25, 1.0)
 * spline(x) => returns the easing value | x must be in [0, 1] range
 *
 * 
  // === BezierEasing 활용 === //
  // BezierEasing type    :: BezierEasing.css.easeInOut , BezierEasing(0.83, 0, 0.17, 1)
  // easing type          :: Easing.QuintInOut 
 */

(function (definition) {
  if (typeof exports === "object") {
      module.exports = definition();
  } else if (typeof define === 'function' && define.amd) {
      define([], definition);
      } else {
      window.BezierEasing = definition();
  }
}(function(){
  var global = this;
  // These values are established by empiricism with tests (tradeoff: performance VS precision)
  var NEWTON_ITERATIONS = 4;
  var NEWTON_MIN_SLOPE = 0.001;
  var SUBDIVISION_PRECISION = 0.0000001;
  var SUBDIVISION_MAX_ITERATIONS = 10;

  var kSplineTableSize = 11;
  var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

  var float32ArraySupported = 'Float32Array' in global;

  function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; };
  function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; };
  function C (aA1)      { return 3.0 * aA1; };

  // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
  function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2)*aT + B(aA1, aA2))*aT + C(aA1))*aT; };

  // Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
  function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2)*aT*aT + 2.0 * B(aA1, aA2) * aT + C(aA1); };

  function binarySubdivide (aX, aA, aB) {
      var currentX, currentT, i = 0;
      do {
          currentT = aA + (aB - aA) / 2.0;
          currentX = calcBezier(currentT, mX1, mX2) - aX;
          if (currentX > 0.0) {
              aB = currentT;
          } else {
              aA = currentT;
          }
      } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
      return currentT;
  };

  function BezierEasing (mX1, mY1, mX2, mY2) {
      // Validate arguments
      if (arguments.length !== 4) {
          throw new Error("BezierEasing requires 4 arguments.");
      };
      for (var i=0; i<4; ++i) {
          if (typeof arguments[i] !== "number" || isNaN(arguments[i]) || !isFinite(arguments[i])) {
              throw new Error("BezierEasing arguments should be integers.");
          };
      };
      if (mX1 < 0 || mX1 > 1 || mX2 < 0 || mX2 > 1) {
          throw new Error("BezierEasing x values must be in [0, 1] range.");
      };
      var mSampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
      function newtonRaphsonIterate (aX, aGuessT) {
          for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
              var currentSlope = getSlope(aGuessT, mX1, mX2);
              if (currentSlope === 0.0) return aGuessT;
              var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
              aGuessT -= currentX / currentSlope;
          };
          return aGuessT;
          };
          function calcSampleValues () {
              for (var i = 0; i < kSplineTableSize; ++i) {
                  mSampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
          };
      };

      function getTForX (aX) {
          var intervalStart = 0.0;
          var currentSample = 1;
          var lastSample = kSplineTableSize - 1;
          for (; currentSample != lastSample && mSampleValues[currentSample] <= aX; ++currentSample) {
              intervalStart += kSampleStepSize;
          };
          --currentSample;
          // Interpolate to provide an initial guess for t
          var dist = (aX - mSampleValues[currentSample]) / (mSampleValues[currentSample+1] - mSampleValues[currentSample]);
          var guessForT = intervalStart + dist * kSampleStepSize;
          var initialSlope = getSlope(guessForT, mX1, mX2);
          if (initialSlope >= NEWTON_MIN_SLOPE)   return newtonRaphsonIterate(aX, guessForT);
          else if (initialSlope === 0.0)          return guessForT;
          else                                    return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize);
      };

      var _precomputed = false;
      function precompute() {
          _precomputed = true;
          if (mX1 != mY1 || mX2 != mY2) calcSampleValues();
      };

      var f = function (aX) {
          if (!_precomputed) precompute();
          if (mX1 === mY1 && mX2 === mY2) return aX; // linear
          // Because JavaScript number are imprecise, we should guarantee the extremes are right.
          if (aX === 0) return 0;
          if (aX === 1) return 1;
          return calcBezier(getTForX(aX), mY1, mY2);
      };

      f.getControlPoints = function() { return [{ x: mX1, y: mY1 }, { x: mX2, y: mY2 }]; };
      var args = [mX1, mY1, mX2, mY2];
      var str = "BezierEasing("+args+")";
      f.toString = function () { return str; };
      var css = "cubic-bezier("+args+")";
      f.toCSS = function () { return css; };
      return f;
  }
  // CSS mapping
  BezierEasing.css = {
      "ease":         BezierEasing(0.25, 0.1, 0.25, 1.0),
      "linear":       BezierEasing(0.00, 0.0, 1.00, 1.0),
      "easeIn":       BezierEasing(0.42, 0.0, 1.00, 1.0),
      "easeOut":      BezierEasing(0.00, 0.0, 0.58, 1.0),
      "easeInOut":    BezierEasing(0.42, 0.0, 0.58, 1.0),

      "easeInSine":   BezierEasing(0.12, 0, 0.39, 0), "easeOutSine": BezierEasing(0.61, 1, 0.88, 1), "easeInOutSine": BezierEasing(0.37, 0, 0.63, 1),
      "easeInQuad":   BezierEasing(0.11, 0, 0.5, 0), "easeOutQuad": BezierEasing(0.5, 1, 0.89, 1), "easeInOutQuad": BezierEasing(0.45, 0, 0.55, 1),
      "easeInCubic":   BezierEasing(0.32, 0, 0.67, 0), "easeOutCubic": BezierEasing(0.33, 1, 0.68, 1), "easeInOutCubic": BezierEasing(0.65, 0, 0.35, 1),
      "easeInQuart":   BezierEasing(0.5, 0, 0.75, 0), "easeOutQuart": BezierEasing(0.25, 1, 0.5, 1), "easeInOutQuart": BezierEasing(0.76, 0, 0.24, 1),
      "easeInQuint":   BezierEasing(0.64, 0, 0.78, 0), "easeOutQuint": BezierEasing(0.22, 1, 0.36, 1), "easeInOutQuint": BezierEasing(0.83, 0, 0.17, 1),
      "easeInExpo":   BezierEasing(0.7, 0, 0.84, 0), "easeOutExpo": BezierEasing(0.16, 1, 0.3, 1), "easeInOutExpo": BezierEasing(0.87, 0, 0.13, 1),
      "easeInCirc":   BezierEasing(0.55, 0, 1, 0.45), "easeOutCirc": BezierEasing(0, 0.55, 0.45, 1), "easeInOutCirc": BezierEasing(0.85, 0, 0.15, 1),
      "easeInBack":   BezierEasing(0.36, 0, 0.66, -0.56), "easeOutBack": BezierEasing(0.34, 1.56, 0.64, 1), "easeInOutBack": BezierEasing(0.68, -0.6, 0.32, 1.6),
      "easeInElastic": function(n){
          let c4 = (2 * Math.PI) / 3;
          return n === 0 ? 0 : n === 1 ? 1 : -Math.pow(2, 10 * n - 10) * Math.sin((n * 10 - 10.75) * c4);
      },
      "easeOutElastic": function(n){
          let c4 = (2 * Math.PI) / 3;
          return n === 0 ? 0 : n === 1 ? 1 : Math.pow(2, -10 * n) * Math.sin((n * 10 - 0.75) * c4) + 1;
      },
      "easeOutInElastic": function(n){
          let c5 = (2 * Math.PI) / 4.5;
          return n === 0 ? 0 : n === 1 ? 1 : n < 0.5
          ? -(Math.pow(2, 20 * n - 10) * Math.sin((20 * n - 11.125) * c5)) / 2
          : (Math.pow(2, -20 * n + 10) * Math.sin((20 * n - 11.125) * c5)) / 2 + 1;
      },
      "easeInBounce" : function(n){ return 1 - BezierEasing.css.easeOutBounce(1 - n); },
      "easeOutBounce" : function(n){
          let n1 = 7.5625;
          let d1 = 2.75;
          if (n < 1 / d1)         return n1 * n * n;
          else if (n < 2 / d1)    return n1 * (n -= 1.5 / d1) * n + 0.75;
          else if (n < 2.5 / d1)  return n1 * (n -= 2.25 / d1) * n + 0.9375;
          else                    return n1 * (n -= 2.625 / d1) * n + 0.984375;
      },
      "easeInOutBounce" : function(n){ return n < 0.5 ? (1 - BezierEasing.css.easeOutBounce(1 - 2 * n)) / 2 : (1 + BezierEasing.css.easeOutBounce(2 * n - 1)) / 2; },
  }
  return BezierEasing;
}));