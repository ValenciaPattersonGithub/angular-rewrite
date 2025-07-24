import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReceivablesHalfDonutWidgetComponent } from './receivables-half-donut-widget.component';
import { Observable, of, throwError } from 'rxjs';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { TranslateModule } from '@ngx-translate/core';
import { SimpleHalfDonutChart } from 'src/@shared/widget/simple-half-donut/simple-half-donut';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

let widgetInitStatus;
let mockLocationService;
let mockRootScope;
let mockGetWidgetData;
let mockToastrFactory;
let mockFeatureFlagService;
let mockSubscription;

class mockDashboardWidgetService {
  getWidgetData(): Observable<SimpleHalfDonutChart> {
    return of({
      Appointment: '',
      FilterList: []
    });
  }
}

describe('ReceivablesHalfDonutWidgetComponent', () => {
  let component: ReceivablesHalfDonutWidgetComponent;
  let fixture: ComponentFixture<ReceivablesHalfDonutWidgetComponent>;
  let dashboardWidgetService: DashboardWidgetService;

  beforeEach(async () => {
    widgetInitStatus = {
      ToLoad: 0,
      Loading: 1,
      Loaded: 2,
      error: 3
    };

    mockLocationService = {
      getActiveLocations: jasmine.createSpy().and.returnValue(
        [
        ]
      ),
      getCurrentLocation: jasmine.createSpy().and.returnValue({
        id: '0'
      })
    };

    mockRootScope = {
      $on: jasmine.createSpy().and.returnValue(mockLocationService.getCurrentLocation)
    }

    mockGetWidgetData = {
      "ExtendedStatusCode": null,
      "Count": null,
      "InvalidProperties": null,
      "Value": {
        "SeriesData": [
          {
            "SeriesName": "Receivables",
            "Category": "0-30 days",
            "Label": null,
            "Value": 20.00,
            "Count": 0,
            "Color": null
          },
          {
            "SeriesName": "Receivables",
            "Category": "31-60 days",
            "Label": null,
            "Value": 359.99,
            "Count": 0,
            "Color": null
          },
          {
            "SeriesName": "Receivables",
            "Category": "61-90 days",
            "Label": null,
            "Value": 4.32,
            "Count": 0,
            "Color": null
          },
          {
            "SeriesName": "Receivables",
            "Category": "> 90 days",
            "Label": null,
            "Value": 144690.17,
            "Count": 0,
            "Color": null
          },
          {
            "SeriesName": "_hole_",
            "Category": "Total Insurance",
            "Label": null,
            "Value": 145074.48,
            "Count": 0,
            "Color": null
          }
        ],
        "TotalValue": 0.0,
        "TotalStatements": 0.0
      }
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockFeatureFlagService = {
      getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
        of({
          Value: []
        })),
    };

    mockSubscription = {
      unsubscribe: jasmine.createSpy(),
      _subscriptions: jasmine.createSpy(),
      closed: true,
      add: jasmine.createSpy(),
      remove: jasmine.createSpy(),
      _parentOrParents: []
    };
    
    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ReceivablesHalfDonutWidgetComponent],
      providers: [
        { provide: 'locationService', useValue: mockLocationService },
        { provide: DashboardWidgetService, useClass: mockDashboardWidgetService },
        { provide: '$rootScope', useValue: mockRootScope },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'WidgetInitStatus', useValue: widgetInitStatus },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceivablesHalfDonutWidgetComponent);
    component = fixture.componentInstance;
    dashboardWidgetService = TestBed.inject(DashboardWidgetService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('Should called on ngOnInit', () => {
      spyOn(component, 'processInitMode');
      component.ngOnInit();
      expect(component.isReceivables).toBeTruthy();
      expect(component.processInitMode).toHaveBeenCalled();
      expect(component.selectedDisplayType).toBe('0');
      expect(component.selectedType).toBe('0')
    });
  });

  describe('processInitMode ->', () => {
    it('should assign receivablesData when mode is Loaded', () => {
      spyOn(component, 'loadData');
      component.processInitMode(WidgetInitStatus.Loaded);
      expect(component.loadData).not.toHaveBeenCalled();
    });

    it('should call loadData when mode is ToLoad', () => {
      spyOn(component, 'loadData');
      component.processInitMode(WidgetInitStatus.ToLoad);
      expect(component.loadData).toHaveBeenCalled();
    });

    it('should call loadData when mode is ToLoad', () => {
      spyOn(component.loadingComplete, 'emit');
      component.processInitMode(WidgetInitStatus.Loading);
      expect(component.loadingStatus.loading).toBe(WidgetInitStatus.Loading);
      expect(component.loadingComplete.emit).toHaveBeenCalledWith(component.loadingStatus);
    });
  });

  describe('loadData ->', () => {
    it('should fetch data from the service and handle success', () => {
      component.receivablesData = [];
      spyOn(dashboardWidgetService, 'getWidgetData').and.returnValue(of(mockGetWidgetData));
      component.loadData(component.selectedType);
      expect(component.receivablesData).toEqual(mockGetWidgetData?.Value?.SeriesData);
      expect(mockToastrFactory.error).not.toHaveBeenCalled();
    });

    it('should show success when empty response', () => {
      component.receivablesData = [];
      spyOn(dashboardWidgetService, 'getWidgetData').and.returnValue(of([]));
      component.loadData(component.selectedType);
      expect(component.receivablesData).toEqual([]);
      expect(mockToastrFactory.error).not.toHaveBeenCalled();
    });

    it('should handle error when fetching data from the service', () => {
      spyOn(dashboardWidgetService, 'getWidgetData').and.returnValue(throwError('Error'));
      component.loadData(component.selectedType);
      expect(dashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.error);
    });
    it('should load data when url is "/BusinessCenter/PracticeAtAGlance"', () => {
      //not able to test this due to window.location.href
    });
  });

  describe('filterChanged ->', () => {
    it('should call loadData when component is not loading', () => {
      const spy = spyOn(component, 'loadData');
      component.filterChanged('0');
      expect(component.selectedType).toEqual('0');
      expect(spy).toHaveBeenCalledWith('0');
    });
  });

  describe('ngOnDestroy ->', () => {
    it('should unsubscribe subscriptions on destroy', () => {
      component.subscriptions.push(mockSubscription);
      component.ngOnDestroy();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    })
  });
});
