import { interval, timer } from 'rxjs';
import { take, mapTo } from 'rxjs/operators';
import { queueMap } from './queueMap';

interval(2000).pipe(
  take(5),
  queueMap(v => timer(1000).pipe(mapTo(v)), 2, false),
).subscribe(console.log);

/* interval(1000).pipe(
  take(5),
  queueMap(v => interval(1000).pipe(mapTo(v + 10)), 2),
).subscribe(console.log); */