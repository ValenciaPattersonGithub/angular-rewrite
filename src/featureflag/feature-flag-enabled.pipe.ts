import { Pipe, PipeTransform } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FeatureFlag, FeatureFlagService } from './featureflag.service';
import { map } from 'rxjs/operators';

/**
 * Pipe to check if a feature flag is enabled. Returns an observable of a boolean, which is true if the feature flag is enabled.
 * 
 * Use alongside the async pipe in Angular templates.
 * 
 * Note: If the feature flag argument is `null` or `undefined`, it is assumed to be not enabled.
 * 
 * @example
 * ```html
 * <div *ngIf="myFeatureFlag | featureFlagEnabled | async">This is only shown if the feature flag is enabled</div>
 * ```
 */
@Pipe({
  name: 'featureFlagEnabled'
})
export class FeatureFlagEnabledPipe implements PipeTransform {

  constructor(private featureFlagService: FeatureFlagService) { }

  transform(value: FeatureFlag<boolean> | null | undefined): Observable<boolean> {
    if (!value || !('key' in value)) {
      return of(false);
    }
    return this.featureFlagService.getOnce$(value)
      .pipe(
        map((flagValue) => flagValue === true)
      );
  }
}
