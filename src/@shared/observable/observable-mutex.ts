import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/operators';

export class Mutex {
  private locked = false;
  private queue: Subject<void>[] = [];

  private lock(): Observable<void> {
    return new Observable<void>((observer) => {
      if (!this.locked) {
        this.locked = true;
        observer.next();
        observer.complete();
      } else {
        const subject = new Subject<void>();
        this.queue.push(subject);
        subject.subscribe(observer);
      }
    });
  }

  private unlock(): void {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next?.next();
      next?.complete();
    } else {
      this.locked = false;
    }
  }

  runExclusive<T>(callback: () => Observable<T>): Observable<T> {
    return new Observable<T>((observer) => {
      this.lock().pipe(take(1)).subscribe({
        next: () => {
          callback().subscribe({
            next: (value) => observer.next(value),
            error: (err) => observer.error(err),
            complete: () => {
              this.unlock();
              observer.complete();
            },
          });
        },
      });
    });
  }
}
