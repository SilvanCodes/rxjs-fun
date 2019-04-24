"use strict";

var _rxjs = require("rxjs");

var _operators = require("rxjs/operators");

var _queueMap = require("./queueMap");

// displays behavior with early completed inner observables
(0, _rxjs.interval)(2000).pipe((0, _operators.take)(5), (0, _queueMap.queueMap)(function (v) {
  return (0, _rxjs.timer)(1000).pipe((0, _operators.mapTo)(v));
}, 2)).subscribe(console.log); // requires 2 emissions, completes with source

(0, _rxjs.interval)(1000).pipe((0, _operators.take)(5), (0, _queueMap.queueMap)(function (v) {
  return (0, _rxjs.interval)(1000).pipe((0, _operators.mapTo)(v + 10));
}, 2, false)).subscribe(console.log);