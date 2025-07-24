import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OpenERAsWidgetComponent } from './open-eras-widget.component';
import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { DashboardWidgetService } from '../services/dashboard-widget.service';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { configureTestSuite } from 'src/configure-test-suite';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('OpenERAsWidgetComponent', () => {
  let component: OpenERAsWidgetComponent;
  let fixture: ComponentFixture<OpenERAsWidgetComponent>;
  let mockLocationServices = {
    getLocationEraEnrollmentStatus: jasmine.createSpy('LocationServices.getLocationEraEnrollmentStatus').and.returnValue({Result: true})
  };
  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenERAsWidgetComponent ],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [DashboardWidgetService, HttpClient,
        { provide: 'locationService', useValue: {} },
        { provide: 'referenceDataService', useValue: {} },
        { provide: 'LocationServices', useValue: mockLocationServices },
        { provide: 'SoarConfig', useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });
});

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenERAsWidgetComponent);
    component = fixture.componentInstance;
    component.callMethods = false;
    component.userLocation = {id: 1 };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });


  describe('createFilterDto', () => {
    it('should Call', () => {
      component.createFilterDto(null, [1], null, null, null);
    });
  });
});
