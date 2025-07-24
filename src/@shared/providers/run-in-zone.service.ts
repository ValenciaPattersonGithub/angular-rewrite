import { Observable, OperatorFunction } from 'rxjs';
import { NgZone } from '@angular/core';
 
/**
 * Custom OperatorFunction that makes sure that all lifecycle hooks of an Observable
 * are running in the NgZone.
 */
export function runInZone<T>(zone: NgZone): OperatorFunction<T, T> {
  return (source) => {
    return new Observable(observer => {
      const onNext = (value: T) => zone.run(() => observer.next(value));
      const onError = (e: any) => zone.run(() => observer.error(e));
      const onComplete = () => zone.run(() => observer.complete());
      return source.subscribe(onNext, onError, onComplete);
    });
  };
}
