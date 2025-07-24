import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, of, fromEvent } from 'rxjs';
import { LDClient, LDOptions, LDContext } from 'launchdarkly-js-client-sdk';
import { initialize } from 'launchdarkly-js-client-sdk';
import { switchMap } from 'rxjs/operators';

/**
 * Define a feaure flag key, its data type, and its default value.
 * Valid types for LaunchDarkly are: boolean, string, number, object (from json)
 */
export class FeatureFlag<T> {
  readonly key: string;
  readonly defaultValue: T;
}

/**
 * Service to interact with LaunchDarkly feature flags.
 */
@Injectable()
export class FeatureFlagService {
  private _ldClient: LDClient;
  private _initialized$ = new ReplaySubject<void>(1);

  constructor() { }

  /**
   * Return the current value of a feature flag once (when available).
   * 
   * No unsubscribe needed.
   * 
   * @param flag Feature flag to check
   * @returns Observable of the current value of the feature flag
   */
  getOnce$<T>(flag: FeatureFlag<T>): Observable<T> {
    return this.initialized$
      .pipe(
        switchMap(() => of(this._ldClient.variation(flag.key, flag.defaultValue)))
      );
  }

  /**
   * Return a stream of value changes for the specified flag, starting
   * with the current value.  
   * 
   * You must either pass this directly to an async pipe, or you must handle unsubscribing!
   * 
   * @param flag Feature flag to check
   * @returns Observable of the current value of the feature flag
   */
  getStream$<T>(flag: FeatureFlag<T>): Observable<any> {
    return this.initialized$
      .pipe(
        switchMap(() => fromEvent(this._ldClient, `change:${flag.key}`))
      );
  }

  /**
   * Fires once when initialized (ReplaySubject behavior)
   * 
   * @returns Observable that fires once when the LaunchDarkly client is fully initialized
   */
  get initialized$(): Observable<void> { return this._initialized$; }

  /**
   * Call this to formally close the launch darkly client.
   * 
   * Calling this on tab close will help ensure that telemetry is flushed.
   */
  close(): void {
    this._ldClient.close();
  }

  /**
   * Initialize the LaunchDarkly client.
   * Returned promise fires once fully initialized with flags loaded.
   * 
   * @param apiKey The LaunchDarkly API key
   * @param context The LaunchDarkly context
   * @param options The LaunchDarkly options
   */
  async initialize(apiKey: string, context: LDContext, options: LDOptions): Promise<void> {
    this._ldClient = initialize(apiKey, context, options);

    this._ldClient.on('error', (error) => {
      throw new Error('LaunchDarkly: ' + error);
    });

    await this._ldClient.waitUntilReady();

    this._initialized$.next();
  }
}
