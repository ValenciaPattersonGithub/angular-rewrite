import { Injectable } from "@angular/core";
import { ICacheProvider } from "./i-cache-provider";
import { Observable, of } from "rxjs";

/**
 * Cache provider that does not cache anything.
 */
@Injectable({
    providedIn: 'root'
})
export class NoCacheProvider implements ICacheProvider {
    clear$(): Observable<void> {
        return of<void>(undefined);
    }

    get$<T>(_key: string): Observable<T | null> {
        return of<T | null>(null);
    }

    set$<T>(_key: string, _value: T, _cacheTimeInMS: number | undefined = undefined): Observable<void> {
        return of<void>(undefined);
    }

    invalidate$(_key: string): Observable<void> {
        return of<void>(undefined);
    }
}
