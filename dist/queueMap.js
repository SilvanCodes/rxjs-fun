"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queueMap = void 0;

var _rxjs = require("rxjs");

var queueMap = function queueMap(innerObservable) {
  var minInnerEmissions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var exhaustQueue = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var completeAfterMinEmissions = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  return function (source) {
    return new _rxjs.Observable(function (observer) {
      var queue = [];
      var activeInnerSubscription;
      var emissionCount = 0;
      var sourceCompleted;
      var subFunc = {
        next: function next(innerValue) {
          // emits inner observable to outer stream
          observer.next(innerValue);
          emissionCount += 1; // checks if innerObservable has satisfied minEmmissionCount

          if (queue[0] && emissionCount >= minInnerEmissions) {
            // switch to next observable in queue
            emissionCount = 0;
            activeInnerSubscription.unsubscribe();
            activeInnerSubscription = innerObservable(queue.shift()).subscribe(subFunc);
          } else if (emissionCount >= minInnerEmissions && completeAfterMinEmissions && sourceCompleted) {
            // complete observer if configured to do so
            activeInnerSubscription.unsubscribe();
            observer.complete();
          } else if (sourceCompleted && !exhaustQueue) {
            // complete observer if configured to do so
            activeInnerSubscription.unsubscribe();
            observer.complete();
          }
        },
        // pass errors through
        error: function error(err) {
          observer.error(err);
        },
        complete: function complete() {
          // on completion, check if more in queue
          if (queue[0]) {
            // switch to next observable in queue
            emissionCount = 0;
            activeInnerSubscription = innerObservable(queue.shift()).subscribe(subFunc);
          } else if (sourceCompleted) {
            // complete observer if source completed
            observer.complete();
          }
        }
      };
      return source.subscribe({
        next: function next(outerValue) {
          // fill queue
          queue.push(outerValue);

          if (!activeInnerSubscription || activeInnerSubscription.closed) {
            // initialize or reactivate by subscribing to first in queue
            activeInnerSubscription = innerObservable(queue.shift()).subscribe(subFunc);
          }
        },
        // pass errors through
        error: function error(err) {
          observer.error(err);
        },
        complete: function complete() {
          // remember source as completed
          sourceCompleted = true;
        }
      });
    });
  };
};

exports.queueMap = queueMap;