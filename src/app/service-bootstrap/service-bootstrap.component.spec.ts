import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { configureTestSuite } from 'src/configure-test-suite';

import { ServiceBootstrapComponent } from './service-bootstrap.component';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

describe('ServiceBootstrapComponent', () => {
  let component: ServiceBootstrapComponent;
  let fixture: ComponentFixture<ServiceBootstrapComponent>;
  let mockFeatureFlagService;

  configureTestSuite(() => {
    mockFeatureFlagService = {
      close: jasmine.createSpy()
    }

    TestBed.configureTestingModule({
      declarations: [ServiceBootstrapComponent],
      providers: [
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceBootstrapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnDestroy', () => {
    component.ngOnDestroy();
    expect(mockFeatureFlagService.close).toHaveBeenCalled();
  });

});
