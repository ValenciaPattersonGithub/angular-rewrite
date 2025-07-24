import { of } from 'rxjs';
import { FeatureFlagEnabledPipe } from './feature-flag-enabled.pipe';
import { FeatureFlag, FeatureFlagService } from './featureflag.service';

describe('FeatureFlagEnabledPipe', () => {
  let featureFlagService: jasmine.SpyObj<FeatureFlagService>;

  beforeEach(() => {
    featureFlagService = jasmine.createSpyObj('FeatureFlagService', ['getOnce$']);
  });

  it('create an instance', () => {
    const pipe = new FeatureFlagEnabledPipe(featureFlagService);
    expect(pipe).toBeTruthy();
  });

  it('should return true if the feature flag is enabled', (done) => {
    const pipe = new FeatureFlagEnabledPipe(featureFlagService);
    featureFlagService.getOnce$.and.returnValue(of(true));

    pipe.transform({ key: 'myFlag', defaultValue: false }).subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('should return false if the feature flag is disabled', (done) => {
    const pipe = new FeatureFlagEnabledPipe(featureFlagService);
    featureFlagService.getOnce$.and.returnValue(of(false));

    pipe.transform({ key: 'myFlag', defaultValue: false }).subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });

  it('should return false if the feature flag is undefined', (done) => {
    const pipe = new FeatureFlagEnabledPipe(featureFlagService);

    pipe.transform(undefined).subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });

  it('should return false if the feature flag is null', (done) => {
    const pipe = new FeatureFlagEnabledPipe(featureFlagService);

    pipe.transform(null).subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });

  it('should return false if the object does not have a key property', (done) => {
    const pipe = new FeatureFlagEnabledPipe(featureFlagService);

    pipe.transform({} as FeatureFlag<boolean>).subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });

  it('should return false if the feature flag is not true', (done) => {
    const pipe = new FeatureFlagEnabledPipe(featureFlagService);
    featureFlagService.getOnce$.and.returnValue(of(0));

    pipe.transform({ key: 'myFlag', defaultValue: false }).subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });
});
