import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ScheduleUtilizationGaugeWidgetComponent } from './schedule-utilization-gauge-widget.component';
import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { GaugeChart, GaugeFiltersTypes } from 'src/@shared/widget/gauge/gauge-chart.model';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonFormatterService } from 'src/@shared/filters/common-formatter.service';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { WidgetCommon } from '../../services/dashboard-widget';

let mockScheduleUtilizationData;
let mockDashboardWidgetService;
let mockCommonFormatterService;
let mockSubscription;

describe('ScheduleUtilizationGaugeWidgetComponent', () => {
  let component: ScheduleUtilizationGaugeWidgetComponent;
  let fixture: ComponentFixture<ScheduleUtilizationGaugeWidgetComponent>;

  beforeEach(async () => {
    mockScheduleUtilizationData = {
      ExtendedStatusCode: null,
      Value: {
        DefaultFilter: "MTD",
        Data: {
          MTD: {
            SeriesData: [
              {
                SeriesName: "ScheduleUtilization",
                Category: "TotalMinutesBooked",
                Label: null,
                Value: 0.0,
                Count: 0,
                Color: null
              },
              {
                SeriesName: "ScheduleUtilization",
                Category: "TotalMinutesAvailable",
                Label: null,
                Value: 0.0,
                Count: 0,
                Color: null
              }
            ],
            TotalValue: 0.0,
            TotalStatements: 0.0
          }
        },
        FilterList: [
          "MTD",
          "Today",
          "YTD",
          "Date Range"
        ],
        Appointment: null
      },
      Count: null,
      InvalidProperties: null
    }

    mockDashboardWidgetService = {
      getWidgetData: jasmine.createSpy().and.callFake(() => {
        return of(mockScheduleUtilizationData);
      }),
      clickedOutside: jasmine.createSpy()
    };

    mockCommonFormatterService = {
      commonDateFormat: "MM/DD/YYYY"
    }

    const mockFeatureFlagService = {
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
      declarations: [ScheduleUtilizationGaugeWidgetComponent],
      providers: [
        { provide: DashboardWidgetService, useValue: mockDashboardWidgetService },
        FormBuilder,
        { provide: CommonFormatterService, useValue: mockCommonFormatterService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleUtilizationGaugeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges ->', () => {
    it('should not set component.userData', () => {
      component.processInitMode = jasmine.createSpy();
      const changes: SimpleChanges = { previousValue: null, currentValue: null, firstChange: null };
      component.ngOnChanges(changes);
      expect(component.userData).toEqual(null);
      expect(component.widgetId).toEqual(null);
    });

    it('should update userData and widgetId when data changes', () => {
      const userData = { UserId: '111', UserName: 'Nick' };
      const dataChanges = {
        data: new SimpleChange(undefined, {
          userData: userData,
          ItemId: '222'
        }, false)
      };
      component.ngOnChanges(dataChanges);
      expect(component.userData).toBe(userData);
      expect(component.widgetId).toBe('222');
    });

    it('should not update userData and widgetId when data is not provided', () => {
      const userData = { UserId: '111', UserName: 'Nick' };
      component.userData = userData;
      component.widgetId = '222';
      const dataChanges = {
        data: new SimpleChange(undefined, undefined, false)
      };
      component.ngOnChanges(dataChanges);
      expect(component.userData).toBe(userData);
      expect(component.widgetId).toBe('222');
    });

    it('should not update userData and widgetId when data is unchanged', () => {
      const userData = { UserId: '111', UserName: 'Nick' };
      component.userData = userData;
      component.widgetId = '222';
      const dataChanges = {
        data: new SimpleChange({
          userData: userData,
          ItemId: '222'
        }, {
          userData: userData,
          ItemId: '222'
        }, false)
      };
      component.ngOnChanges(dataChanges);
      expect(component.userData).toBe(userData);
      expect(component.widgetId).toBe('222');
    });
  });

  describe('ngOnInit ->', () => {
    it('should called on ngOnInit', () => {
      spyOn(component, 'processInitMode');
      component.ngOnInit();
      expect(component.processInitMode).toHaveBeenCalled();
    });
  });

  describe('processInitMode ->', () => {
    it('should assign receivablesData when mode is Loaded', () => {
      component.processData = jasmine.createSpy();
      component.processInitMode(WidgetInitStatus.Loaded);
      expect(component.processData).toHaveBeenCalled();
    });

    it('should call loadData when mode is ToLoad', () => {
      component.getWidgetData = jasmine.createSpy();
      component.processInitMode(WidgetInitStatus.ToLoad);
      expect(component.getWidgetData).toHaveBeenCalledWith(null);
    });
  });

  describe('getWidgetData ->', () => {
    it('should set loadingStatus.loading  and call getWidgetData from DashboardWidgetService', () => {
      component.getWidgetData("filterType");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);
    });

    it('should call GetUserDashboardHygieneRetention from DashboardWidgetService and call processData on success call', () => {
      component.processData = jasmine.createSpy();
      component.getWidgetData("filterType");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.processData).toHaveBeenCalled();
    });

    it('should show toast error on error response', () => {
      const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      });
      mockDashboardWidgetService.getWidgetData.and.returnValue(throwError(errorResponse));
      component.getWidgetData("filterType");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.error);
    });
  });

  describe('processData ->', () => {
    it('should process data correctly', () => {
      const mockData: GaugeChart = {
        Data: mockScheduleUtilizationData.Value.Data,
        FilterList: ["MTD", "Today", "YTD", "Date Range"],
        DefaultFilter: 'defaultFilter'
      };
      spyOn(component, 'updateGauge');
      component.processData(mockData);
      expect(component.allData).toBe(mockData.Data);
      expect(component.dataFilterOptions).toEqual([{ text: 'MTD', value: 'MTD' }, { text: 'Today', value: 'Today' },
      { text: 'YTD', value: 'YTD' }, { text: 'Date Range', value: 'Date Range' }
      ]);
      expect(component.scheduleUtilizationForm.controls.currentSelectedDataFilter.value).toBe(mockData.DefaultFilter);
      expect(component.updateGauge).toHaveBeenCalledWith(mockData.DefaultFilter);
    });
  });

  describe('updateGauge ->', () => {
    it('should exit early if allData is falsy', () => {
      component.allData = [];
      const filterType = '';
      component.updateGauge(filterType);
      expect(component.gaugeData).toEqual([]);
    });

    it('should compute the correct gauge values', () => {
      component.allData = {
        someFilter: {
          SeriesData: [
            { Category: 'TotalMinutesBooked', Value: 50 },
            { Category: 'TotalMinutesAvailable', Value: 50 }
          ]
        }
      };
      component.updateGauge('someFilter');
      expect(component.gaugeData).toEqual([
        { Category: 'TotalMinutesBooked', Value: 50 },
        { Category: 'TotalMinutesAvailable', Value: 50 },
        { SeriesName: WidgetCommon._hole_, Category: 'Booked', Value: 50 }
      ]);
    });
  });

  describe('onDataFilterChange ->', () => {
    it('should set showPopOver to true if filter is DateRange', () => {
      const filterType = GaugeFiltersTypes.DateRange;
      component.onDataFilterChange(filterType);
      expect(component.showPopOver).toBe(true);
    });

    it('should call getWidgetData with the passed filter if filter is not DateRange', () => {
      const spy = spyOn(component, 'getWidgetData');
      const filterType = 'SomeOtherFilterType';
      component.onDataFilterChange(filterType);
      expect(spy).toHaveBeenCalledWith(filterType);
    });

    it('should set showPopOver to false if filter is not DateRange', () => {
      const filterType = 'SomeOtherFilterType';
      component.onDataFilterChange(filterType);
      expect(component.showPopOver).toBe(false);
    });
  });

  describe('onDateFilterChange ->', () => {
    it('should update schedUtilFromDate and schedUtilToDate with passed parameters', () => {
      const mockDateOption = { startDate: new Date('2022-01-01'), endDate: new Date('2022-01-31') };
      component.showPopOver = true;
      component.onDateFilterChange(mockDateOption);
      expect(component.showPopOver).toBe(false);
      expect(component.schedUtilFromDate).toEqual(mockDateOption.startDate);
      expect(component.schedUtilToDate).toEqual(mockDateOption.endDate);
    });

    it('should call getWidgetData when startDate and endDate are provided', () => {
      const spy = spyOn(component, 'getWidgetData');
      component.onDateFilterChange({ startDate: new Date('2022-01-01'), endDate: new Date('2022-01-31') });
      expect(spy).toHaveBeenCalledWith(GaugeFiltersTypes.DateRange);
    });

    it('should not call getWidgetData when startDate or endDate is missing', () => {
      const spy = spyOn(component, 'getWidgetData');
      component.onDateFilterChange({ startDate: null, endDate: new Date('2022-01-31') });
      expect(spy).not.toHaveBeenCalled();
      component.onDateFilterChange({ startDate: new Date('2022-01-01'), endDate: null });
      expect(spy).not.toHaveBeenCalled();
    });

    it('should set placeHolderForDateRangePicker to DateRange', () => {
      const mockDateOption = { startDate: null, endDate: null };
      component.onDateFilterChange(mockDateOption);
      expect(component.showPopOver).toBe(false);
      expect(component.schedUtilFromDate).toEqual(mockDateOption.startDate);
      expect(component.schedUtilToDate).toEqual(mockDateOption.endDate);
      expect(component.placeHolderForDateRangePicker).toBe(GaugeFiltersTypes.DateRange);
    });
  });

  describe('onApplyFilter ->', () => {
    it('should update schedUtilFromDate and schedUtilToDate with passed parameters', () => {
      const mockDateOption = { startDate: new Date('2022-01-01'), endDate: new Date('2022-01-31') };
      component.showPopOver = true;
      component.onApplyFilter(mockDateOption);
      expect(component.showPopOver).toBe(false);
      expect(component.schedUtilFromDate).toEqual(mockDateOption.startDate);
      expect(component.schedUtilToDate).toEqual(mockDateOption.endDate);
    });

    it('should call getWidgetData when startDate and endDate are provided', () => {
      const spy = spyOn(component, 'getWidgetData');
      component.onApplyFilter({ startDate: new Date('2022-01-01'), endDate: new Date('2022-01-31') });
      expect(spy).toHaveBeenCalledWith(GaugeFiltersTypes.DateRange);
    });

    it('should not call getWidgetData when startDate or endDate is missing', () => {
      const spy = spyOn(component, 'getWidgetData');
      component.onApplyFilter({ startDate: null, endDate: new Date('2022-01-31') });
      expect(spy).not.toHaveBeenCalled();
      component.onApplyFilter({ startDate: new Date('2022-01-01'), endDate: null });
      expect(spy).not.toHaveBeenCalled();
    });

    it('should set placeHolderForDateRangePicker to DateRange', () => {
      const mockDateOption = { startDate: null, endDate: null };
      component.onApplyFilter(mockDateOption);
      expect(component.showPopOver).toBe(false);
      expect(component.schedUtilFromDate).toEqual(mockDateOption.startDate);
      expect(component.schedUtilToDate).toEqual(mockDateOption.endDate);
      expect(component.placeHolderForDateRangePicker).toBe(GaugeFiltersTypes.DateRange);
    });
  });

  describe('onSelectItem ->', () => {
    it('should Open date-range pop-up, when selecting Date Range Option', () => {
      component.onSelectItem({ text: 'Date Range', value: 'Date Range' });
      expect(component.showPopOver).toEqual(true);
    });

    it('should not Open date-range pop-up, when selecting Other option', () => {
      component.onSelectItem({ text: 'YTD', value: 'YTD' });
      expect(component.showPopOver).toEqual(false);
    });

    it('should not Open date-range pop-up, when selecting null option', () => {
      component.onSelectItem({ text: '', value: '' });
      expect(component.showPopOver).toEqual(false);
    });
  });

  describe('getCustomPlaceHolder ->', () => {
    it('should return same placeholder for all filter except Date Range', () => {
      const res = component.getCustomPlaceHolder('YTD');
      expect(res).toEqual('YTD');
    });
    it('should return custom date range placeholder for Date Range', () => {
      component.placeHolderForDateRangePicker = 'custom date range';
      const res = component.getCustomPlaceHolder('Date Range');
      expect(res).toEqual('custom date range');
    });
  });

  describe('clickOutside ->', () => {
    it('should call clickOutside method from dashboard widget service when click outside of dropdown', () => {
        const mockDropDownListComponent = {
            isOpen: true
        }
        component.clickedOutside(mockDropDownListComponent as DropDownListComponent);
        expect(mockDashboardWidgetService.clickedOutside).toHaveBeenCalledWith(mockDropDownListComponent);
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
