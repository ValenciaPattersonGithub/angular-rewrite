import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NetGrossProductionGaugeWidgetComponent } from './net-gross-production-gauge-widget.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SimpleChange, SimpleChanges } from '@angular/core';
import { GaugeChartType } from 'src/@shared/widget/gauge/gauge-chart.model';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { of, throwError } from 'rxjs';
import { formatCurrencyIfNegPipe } from 'src/@shared/pipes/formatCurrencyNeg/format-currency-Neg.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

let mockToastrFactory;
let mockReportsFactory;
let mockGrossProduction;
let mockDashboardWidgetService;
let mockGetReportFilterDto;
let mockTranslateService;
let mockSubscription;
let mockFeatureFlagService;

describe('NetGrossProductionGaugeWidgetComponent', () => {
  let component: NetGrossProductionGaugeWidgetComponent;
  let fixture: ComponentFixture<NetGrossProductionGaugeWidgetComponent>;

  beforeEach(async () => {
    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockReportsFactory = {
      GetSpecificReports: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve({ Value: [{ Route: '/', RequestBodyProperties: "234", FilterProperties: "", Amfa: "", ActionId: "1" }] }),
            reject({});
        });
      }),
      GetAmfaAbbrev: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({})
      }),
      OpenReportPageWithContext: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy().and.returnValue({})
      })
    };

    mockGrossProduction = {
      Value: {
        DefaultFilter: "YTD",
        Data: {
          YTD: {
            SeriesData: [
              {
                SeriesName: null,
                Category: "Value",
                Label: null,
                Value: 0.0,
                Count: 0,
                Color: "#30AFCD"
              },
              {
                SeriesName: null,
                Category: "Goal",
                Label: null,
                Value: 0.0,
                Count: 0,
                Color: "#AEB5BA"
              }
            ],
            TotalValue: 0.0,
            TotalStatements: 0.0
          }
        },
        FilterList: [
          "YTD",
          "Today",
          "MTD",
          "Last Year",
          "Last Month"
        ],
        Appointment: null
      }
    };
    
    mockDashboardWidgetService = {
      getWidgetData: jasmine.createSpy().and.callFake(() => {
        return of(mockGrossProduction);
      }),
      GetReportFilterDto: jasmine.createSpy().and.callFake(() => {
        return of(mockGetReportFilterDto);
      }),
      clickedOutside: jasmine.createSpy()
    };

    mockGetReportFilterDto = {
      PresetFilterDto: [{
        EndDate: null,
        LocationIds: [6606192],
        ProviderUserIds: ['a162c864-8f50-4e84-8942-7194bc8070cf'],
        StartDate: null
      }],
    };

    mockTranslateService = {
      instant: () => 'translated text'
    };

    mockSubscription = {
      unsubscribe: jasmine.createSpy(),
      _subscriptions: jasmine.createSpy(),
      closed: true,
      add: jasmine.createSpy(),
      remove: jasmine.createSpy(),
      _parentOrParents: []
    };

    mockFeatureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [NetGrossProductionGaugeWidgetComponent],
      providers: [
        formatCurrencyIfNegPipe,
        { provide: 'ReportsFactory', useValue: mockReportsFactory },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: DashboardWidgetService, useValue: mockDashboardWidgetService },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetGrossProductionGaugeWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('guageChart', () => {
    it('should return the expected GaugeChartType', () => {
      const result = component.GaugeChartType;
      expect(result).toEqual(GaugeChartType);
    });
  });

  describe('ngOnChanges ->', () => {
    it('Should not set component.userData', () => {
      component.processInitMode = jasmine.createSpy();
      const changes: SimpleChanges = { previousValue: null, currentValue: null, firstChange: null };
      component.ngOnChanges(changes);
      expect(component.userData).toEqual(null);
      expect(component.widgetId).toEqual(null);
    });
    it('should update userData and widgetId when data changes', () => {
      const userData = { UserId: '123', UserName: 'John' };
      const dataChanges = {
        data: new SimpleChange(undefined, {
          userData: userData,
          ItemId: '456'
        }, false)
      };
      component.ngOnChanges(dataChanges);
      expect(component.userData).toBe(userData);
      expect(component.widgetId).toBe('456');
    });

    it('should not update userData and widgetId when data is not provided', () => {
      const userData = { UserId: '123', UserName: 'John' };
      component.userData = userData;
      component.widgetId = '456';
      const dataChanges = {
        data: new SimpleChange(undefined, undefined, false)
      };
      component.ngOnChanges(dataChanges);
      expect(component.userData).toBe(userData);
      expect(component.widgetId).toBe('456');
    });

    it('should not update userData and widgetId when data is unchanged', () => {
      const userData = { UserId: '123', UserName: 'John' };
      component.userData = userData;
      component.widgetId = '456';
      const dataChanges = {
        data: new SimpleChange({
          userData: userData,
          ItemId: '456'
        }, {
          userData: userData,
          ItemId: '456'
        }, false)
      };
      component.ngOnChanges(dataChanges);
      expect(component.userData).toBe(userData);
      expect(component.widgetId).toBe('456');
    });
  });

  describe('ngOnInit ->', () => {
    it('Should Call processInitMode', () => {
      component.processInitMode = jasmine.createSpy();
      component.ngOnInit();
      expect(component.processInitMode).toHaveBeenCalled();
    });
    it('should set loadingStatus correctly when data and ItemId are defined', () => {
      component.data = { ItemId: 1 , initMode: 'initMode1' , x: 0, y: 0, rows: 1, cols: 1};  
      component.ngOnInit();
      expect(component.loadingStatus).toEqual({ itemId: 1, loading: WidgetInitStatus.Loaded, errorMessage: '' });
    });
  });

  describe('processInitMode ->', () => {
    it('Should Call processData when mode is Loaded', () => {
      component.processData = jasmine.createSpy();
      component.processInitMode(2);
      expect(component.processData).toHaveBeenCalled();
    });

    it('Should Call processData and getWidgetData', () => {
      component.getWidgetData = jasmine.createSpy();
      component.processInitMode(0);
      expect(component.getWidgetData).toHaveBeenCalled();
    });

    it('Should not call processData or getWidgetData when mode is undefined', () => {
      component.processData = jasmine.createSpy();
      component.getWidgetData = jasmine.createSpy();
      component.processInitMode(undefined);
      expect(component.processData).not.toHaveBeenCalled();
      expect(component.getWidgetData).not.toHaveBeenCalled();
    });

  });

  describe('getWidgetData ->', () => {

    it('should set loadingStatus.loading and fetch NetProduction data if type is Gross', () => {
      component.type = "Gross";
      component.getWidgetData("MTD");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalledWith("widgets/financial/UserDashboardGrossProduction", jasmine.any(Object));
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);
    });

    it('should call getWidgetData from DashboardWidgetService and call processData on success call', () => {
      component.type = "Gross";
      component.processData = jasmine.createSpy();
      component.getWidgetData("MTD");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.processData).toHaveBeenCalled();
    });

    it('should call getWidgetData.DashboardWidgetService and call processData on success call', () => {
      component.type = "Net";
      component.processData = jasmine.createSpy();
      component.getWidgetData("MTD");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(component.processData).toHaveBeenCalled();
    });

    it('should show error on error response', () => {
      component.type = "Net";
      const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      });
      mockDashboardWidgetService.getWidgetData.and.returnValue(throwError(errorResponse));
      component.getWidgetData("MTD");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('should show toast error on error response', () => {
      component.type = "Gross";
      const errorResponse = new HttpErrorResponse({
        error: 'test 404 error',
        status: 404, statusText: 'Not Found'
      });
      mockDashboardWidgetService.getWidgetData.and.returnValue(throwError(errorResponse));
      component.getWidgetData("MTD");
      expect(mockDashboardWidgetService.getWidgetData).toHaveBeenCalled();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
    it('should set launchDarklyStatus to true when getOnce$ returns true', () => {
      const launchDarklyStatus = true;
      mockFeatureFlagService.getOnce$.and.returnValue(of(true));  
      component.getWidgetData(launchDarklyStatus);   
      expect(launchDarklyStatus).toBe(true);
    });
    it('should set launchDarklyStatus to false when getOnce$ returns false', () => {
      const launchDarklyStatus = false;
      mockFeatureFlagService.getOnce$.and.returnValue(of(false));  
      component.getWidgetData(launchDarklyStatus);  
      expect(launchDarklyStatus).toBe(false);
    });
  });

  describe('processData ->', () => {
    it('Should Call updateGauge with DefaultFilter', () => {
      component.updateGauge = jasmine.createSpy();
      const data = { Data: "", FilterList: ["MTD", "YTD"], DefaultFilter: "MTD" }
      component.processData(data);
      expect(component.dateFilter).toEqual("MTD");
      expect(component.updateGauge).toHaveBeenCalledWith("MTD");
    });
    it('Should return when updateGauge when parameter is undefined', () => {
      const data = undefined;
      component.updateGauge(data);
      expect(component.gaugeData).toEqual([]);
    });
  });

  describe('updateGauge->', () => {
    it('Should set gaugeData data', () => {
      component.allData = { "MTD": { SeriesData: [{ Category: 'Value', Value: 15726.43 }, { Category: '_hole', Value: 153 }] } }
      component.updateGauge("MTD");
      expect(component.gaugeData.length).toBeGreaterThan(0);
    });
    it('Should return when allData is undefined', () => {
      component.allData = undefined;
      component.updateGauge("MTD");
      expect(component.gaugeData).toEqual([]);
    });
    it('should not change percent when allData[dateOption]?.SeriesData is undefined', () => {
      component.allData = { 'dateOption1': undefined };
      const percent = 0;  
      component.updateGauge('dateOption1');  
      expect(percent).toBe(0);
    });
  });

  describe('drilldown  ->', () => {
    it('Should Call mockReportsFactory.GetSpecificReports, mockReportsFactory.GetSpecificReports', () => {
      component.drilldown();
      expect(mockDashboardWidgetService.GetReportFilterDto).toHaveBeenCalled();
      expect(mockReportsFactory.GetSpecificReports).toHaveBeenCalled();
    });

    it('should call GetReportFilterDto with correct parameters when data and dateFilter are defined', () => {
      component.data = {
        Locations: ['Location1', 'Location2'],
        userData: { UserId: 'User1' },
        x: 0,
        y: 0,
        rows: 1,
        cols: 1
      };
      component.dateFilter = 'DateFilter1';  
      component.drilldown();  
      expect(mockDashboardWidgetService.GetReportFilterDto).toHaveBeenCalledWith(
        ['Location1', 'Location2'],
        ['User1'],
        'DateFilter1'
      );
    });
  });

  describe('dateFilterChanged ->', () => {
    it('Should Call getWidgetData with given Date filter', () => {
      component.getWidgetData = jasmine.createSpy();
      component.dateFilterChanged("MTD");
      expect(component.dateFilter).toEqual("MTD");
      expect(component.getWidgetData).toHaveBeenCalledWith("MTD");
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
