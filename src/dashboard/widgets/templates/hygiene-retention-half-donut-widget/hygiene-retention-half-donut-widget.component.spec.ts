import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HygieneRetentionHalfDonutWidgetComponent } from './hygiene-retention-half-donut-widget.component';
import { TranslateModule } from '@ngx-translate/core';
import { GridsterItem } from 'angular-gridster2';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import cloneDeep from 'lodash/cloneDeep';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

let mockData: GridsterItem;
let mockHygieneRetentionData;
let mockDashboardWidgetService;
let mockLocalizeService;
let mockToastrFactory;
let mockWindow;
let mockSubscription;

describe('HygieneRetentionHalfDonutWidgetComponent', () => {
  let component: HygieneRetentionHalfDonutWidgetComponent;
  let fixture: ComponentFixture<HygieneRetentionHalfDonutWidgetComponent>;

  beforeEach(async () => {
    mockData = {
      ActionId: 2706,
      BatchLoadId: 0,
      IsHidden: false,
      ItemId: 9,
      ItemType: "widget",
      Locations: [1690299],
      RouteUrl: null,
      Size: { Width: 2, Height: 2 },
      Template: "hygiene-retention-half-donut.html",
      Title: "Hygiene Retention",
      cols: 2,
      initMode: 0,
      rows: 2,
      userData: { UserId: '745fdf52-1b79-4d26-a4ae-13b3ff214fc4', FirstName: 'Hygienist', MiddleName: null, LastName: 'Amfa', PreferredName: null },
      x: 0,
      y: 0
    }

    mockHygieneRetentionData = {
      DefaultFilter: "All",
      Data: {
        All: {
          SeriesData: [
            {
              SeriesName: "HygieneRetention",
              Category: "Unscheduled",
              Label: null,
              Value: 3200.0,
              Count: 0,
              Color: null
            },
            {
              SeriesName: "HygieneRetention",
              Category: "Scheduled",
              Label: null,
              Value: 1049.0,
              Count: 0,
              Color: null
            }
          ],
          TotalValue: 0.0,
          TotalStatements: 0.0
        }
      },
      FilterList: [],
      Appointment: null
    }

    mockDashboardWidgetService = {
      getWidgetData: jasmine.createSpy().and.callFake(() => {
        return of(mockHygieneRetentionData);
      }),
    };


    mockLocalizeService = {
      getLocalizedString: () => 'translated text'
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockWindow = {
      location: {
        href: "/BusinessCenter/PracticeAtAGlance"
      }
    }

    mockSubscription = {
      unsubscribe: jasmine.createSpy(),
      _subscriptions: jasmine.createSpy(),
      closed: true,
      add: jasmine.createSpy(),
      remove: jasmine.createSpy(),
      _parentOrParents: []
    };

    await TestBed.configureTestingModule({
      declarations: [HygieneRetentionHalfDonutWidgetComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: DashboardWidgetService, useValue: mockDashboardWidgetService },
        { provide: Window, useValue: mockWindow },
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HygieneRetentionHalfDonutWidgetComponent);
    component = fixture.componentInstance;
    component.data = mockData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit -->', () => {
    it('should call processInitMode method on ngOnInit', () => {
      component.processInitMode = jasmine.createSpy();
      component.ngOnInit();

      expect(component.processInitMode).toHaveBeenCalledWith(mockData.initMode);
    })

    it('should set data for loadingStatus', () => {
      mockData.initMode = 2;
      component.ngOnInit();

      expect(component.loadingStatus.itemId).toEqual(mockData.ItemId);
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);
      expect(component.loadingStatus.errorMessage).toEqual('');
    })
  })

  describe('processInitMode -->', () => {
    it('should call processData with initData when WidgetInitStatus is loaded', () => {
      component.processData = jasmine.createSpy();
      const tempMockData = cloneDeep(mockData);
      tempMockData.initMode = WidgetInitStatus.Loaded;
      component.processInitMode(tempMockData.initMode);

      expect(component.processData).toHaveBeenCalledWith(tempMockData.initData);
    })

    it('should call getWidgetData when WidgetInitStatus is ToLoad', () => {
      component.getWidgetData = jasmine.createSpy();
      const tempMockData = cloneDeep(mockData);
      tempMockData.initMode = WidgetInitStatus.ToLoad;
      component.processInitMode(tempMockData.initMode);

      expect(component.getWidgetData).toHaveBeenCalled();
    })
  })

  describe('getWidgetData -->', () => {
    it('should set loadingStatus.loading  and call getWidgetData from DashboardWidgetService', () => {
      component.getWidgetData();

      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);
    })

    it('should call GetUserDashboardHygieneRetention from DashboardWidgetService and call processData on success call', () => {
      component.processData = jasmine.createSpy();
      component.getWidgetData();

      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.processData).toHaveBeenCalled();
    })

    it('should show toast error on error response', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      });
      mockDashboardWidgetService.getWidgetData.and.returnValue(throwError(errorResponse));
      component.getWidgetData();

      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    })
  })

  describe('ngOnDestroy -->', () => {
    it('should close subscription on destroy', () => {
      component.subscription = Object.assign(mockSubscription);
      component.ngOnDestroy();

      expect(component.subscription.closed).toBe(true);
    })
  })
});
