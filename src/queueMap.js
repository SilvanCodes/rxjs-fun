import { Observable } from 'rxjs';

const queueMap = (innerObservable, minInnerEmissions = 1, exhaustQueue = true, completeAfterMinEmissions = false) => (source) => {
  return new Observable(observer => {
    const queue = [];
    let activeInnerSubscription;
    let emissionCount = 0;
    let sourceCompleted;

    const subFunc = {
      next(innerValue) {
        // emits inner observable to outer stream
        observer.next(innerValue);
        emissionCount += 1;

        // checks if innerObservable has satisfied minEmmissionCount
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
      error(err) { observer.error(err); },
      complete() {
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
      next(outerValue) {
        // fill queue
        queue.push(outerValue);

        if (!activeInnerSubscription || activeInnerSubscription.closed) {
          // initialize or reactivate by subscribing to first in queue
          activeInnerSubscription = innerObservable(queue.shift()).subscribe(subFunc);
        }
      },
      // pass errors through
      error(err) { observer.error(err); },
      complete() {
        // remember source as completed
        sourceCompleted = true;
      }
    });
  });
};

export { queueMap };