import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { WidgetbarComponent } from './bar-chart-widget.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DashboardWidgetService } from '../services/dashboard-widget.service'; import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { configureTestSuite } from 'src/configure-test-suite';
import { ReferralManagementHttpService } from 'src/@core/http-services/referral-management-http.service';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

const mockreferenceDataService = {};
const mockLocationServices = {};
const mocksoarConfigService = {};
const mockpenidngclaimsService = {};
let mockPracticeService;
let mockFeatureFlagService;
let mockreportsFactory;

describe('WidgetbarComponent', () => {
    let component: WidgetbarComponent;
    let fixture: ComponentFixture<WidgetbarComponent>;
    //let DashboardWidgetService: DashboardWidgetService;
    mockPracticeService = {
        getCurrentPractice: jasmine.createSpy().and.returnValue({ id: '1' }),
    };
    mockFeatureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
    };
    mockreportsFactory = {
        AddPrintedReportActivityEvent: jasmine.createSpy().and.returnValue({}),
        GetReportArray: jasmine.createSpy('[12]'),
        OpenReportPage: jasmine.createSpy(),
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
    const mockTranslateService = {
        instant: () => 'translated text'
    };
    const mockReferralManagementHttpService = {
        getSources: jasmine.createSpy().and.returnValue({
          then: function (callback) {
              callback({ Value: '' });
          }
        })
      };
    configureTestSuite(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            declarations: [WidgetbarComponent],

            providers: [DashboardWidgetService, HttpClient,
                { provide: 'locationService', useValue: mockLocationServices },
                { provide: 'referenceDataService', useValue: mockreferenceDataService },
                { provide: 'SoarConfig', useValue: mocksoarConfigService },
                { provide: 'practiceService', useValue: mockPracticeService },
                { provide: 'ReferralManagementHttpService', useValue: mockReferralManagementHttpService },
                { provide: 'ReferralSourcesService', useValue: {} },
                { provide: FeatureFlagService, useValue: mockFeatureFlagService },
                { provide: "ReportsFactory", useValue: mockreportsFactory },
                { provide: TranslateService, useValue: mockTranslateService }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
    });


    beforeEach(() => {
        fixture = TestBed.createComponent(WidgetbarComponent);
        component = fixture.componentInstance;
        component.callMethods = false;
        component.widgetData = {
            ActionId: 2715,
            BatchLoadId: 0,
            IsHidden: false,
            ItemId: 26,
            ItemType: "widget",
            Locations: [1],
            Position: null,
            Size: { Width: 2, Height: 2 },
            Template: "Unsubmitted-claims.component.html",
            Title: "Unsubmitted Claims",
            Category: 'unSubmitted'
        };
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('setWidgetWidth method ->', () => {
        it('setWidgetWidth should be called with widgetSpacing ubsubmitted', () => {
            component.setWidgetWidth();
            expect(component.widgetSpacing).toEqual(.20);
        });
        it('setBarAreaList should be called with widgetGap ubsubmitted', () => {
            component.setWidgetWidth();
            expect(component.widgetGap).toEqual(2);
        });
        it('setWidgetWidth should be called with widgetSpacing pendingClaims', () => {
            component.widgetData.ItemId = 14;
            component.setWidgetWidth();
            expect(component.widgetSpacing).toEqual(.20);
        });
        it('setBarAreaList should be called with widgetGap pendingClaims', () => {
            component.widgetData.ItemId = 14;
            component.setWidgetWidth();
            expect(component.widgetGap).toEqual(.10);
        });
    });

    describe('drildown method ->', () => {
        it('drildown should be called with ubsubmitted', () => {
            const dataEvent = { dataItem: component.widgetData };
            component.drildown(dataEvent);
            expect(dataEvent.dataItem.Category).toEqual('unSubmitted');
        });
        it('drildown should be called with alerts', () => {
            const dataEvent = { dataItem: component.widgetData };
            dataEvent.dataItem.Category = 'alerts';
            component.drildown(dataEvent);
            expect(dataEvent.dataItem.Category).toEqual('alerts');
        });
        it('drildown should be called with unsubmitted', () => {
            const dataEvent = { dataItem: component.widgetData };
            component.drildown(dataEvent);
            expect(dataEvent.dataItem.ItemId).toEqual(26);
        });
        it('drildown should be called with pending Claims', () => {
            const dataEvent = { dataItem: component.widgetData };
            dataEvent.dataItem.ItemId = 14;
            component.drildown(dataEvent);
            expect(dataEvent.dataItem.ItemId).toEqual(14);
        });
    });

});

