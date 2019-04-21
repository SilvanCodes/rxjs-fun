import { of } from 'rxjs';
import { expand, take } from 'rxjs/operators';

const allInts = amount => of(1).pipe(
  expand(val => of(val + 1)),
  take(amount)
);

allInts(10).subscribe(console.log);
