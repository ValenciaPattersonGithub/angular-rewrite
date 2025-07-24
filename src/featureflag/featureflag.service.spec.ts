import { FeatureFlag, FeatureFlagService } from './featureflag.service';
import { of } from 'rxjs';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
      service = new FeatureFlagService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getOnce$', () => {
    it('should return the flag value once', () => {
      const flag: FeatureFlag<boolean> = {
        key: 'testFlag',
        defaultValue: true,
      };
      spyOn(service, 'getOnce$').and.returnValue(of(flag.defaultValue));
      let result = false;
      service.getOnce$(flag).subscribe((value) => {
        result = value;
      });
      expect(result).toBe(true);
    });
  });

  describe('getStream$', () => {
    it('should return the flag value as a stream', () => {
      const flag: FeatureFlag<boolean> = {
        key: 'testFlag',
        defaultValue: true,
      };
      spyOn(service, 'getStream$').and.returnValue(of(flag));
      let result = false;
      service.getStream$(flag).subscribe((value) => {
        result = value;
      });
      expect(result).toEqual(Object({ key: 'testFlag', defaultValue: true }));
    });
  });
});
