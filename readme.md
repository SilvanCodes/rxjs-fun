# RxJS Fun

Some custom operators of mine.

## queueMap
Similar to concatMap.
Every emission of the outer stream adds to the queue.
You can specify after how many emissions the active inner observable should make way for the next in the queue.
Completion of inner observable automatically switches to next in queue.

Possible configuration is:
- minimalEmissions of inner observable (default: 1)
- exhaust queue after source completed (default: true)
- complete last inner observable after minimal emissions after source completed (default: true)