import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PendingClaimsHalfDonutWidgetComponent } from './pending-claims-half-donut-widget.component';
import { Observable, Subscription, of, throwError } from 'rxjs';
import { DashboardWidgetService } from '../../services/dashboard-widget.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SimpleHalfDonutChart } from 'src/@shared/widget/simple-half-donut/simple-half-donut';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';

const mockData = {
  ItemId: 14,
  ItemType: "widget",
  Title: "Pending Claims",
  Template: "pending-claims-half-donut-widget.html",
  Position: [
    2,
    0
  ],
  Size: {
    Width: 2,
    Height: 2
  },
  BatchLoadId: 0,
  IsHidden: false,
  ActionId: 2715,
  RouteUrl: "widgets/financial/DashboardPendingClaims",
  userData: {
    UserId: "a162c864-8f50-4e84-8942-7194bc8070cf",
    FirstName: "Support",
    MiddleName: null,
    LastName: "Admin",
    PreferredName: "Support Test Admin",
    SuffixName: null,
    DateOfBirth: null,
    UserName: "pa38638@fusepatterson.com",
    UserCode: "ADMSU1",
    ImageFile: null,
    EmployeeStartDate: null,
    EmployeeEndDate: null,
    Address: {
      AddressLine1: "54321",
      AddressLine2: "09876",
      City: "Dcba",
      State: "AL",
      ZipCode: "54321"
    },
    DepartmentId: null,
    JobTitle: null,
    RxUserType: 0,
    TaxId: null,
    FederalLicense: null,
    DeaNumber: null,
    NpiTypeOne: null,
    PrimaryTaxonomyId: null,
    SecondaryTaxonomyId: null,
    DentiCalPin: null,
    StateLicense: null,
    AnesthesiaId: null,
    IsActive: true,
    StatusChangeNote: null,
    ProfessionalDesignation: "",
    Locations: [
      {
        UserProviderSetupLocationId: "ae4e3c5e-e02e-4f64-8c95-027cad0479bc",
        UserId: "a162c864-8f50-4e84-8942-7194bc8070cf",
        LocationId: 6510094,
        Location: null,
        ProviderTypeId: 1,
        ProviderOnClaimsRelationship: 1,
        ProviderOnClaimsId: null,
        Color: null,
        ProviderQualifierType: 2,
        ObjectState: null,
        FailedMessage: null,
        IsActive: true,
        PracticeId: 38638,
        DateModified: "2023-10-13T09:52:58.1825991",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DataTag: "AAAAAAAuTXo="
      },
      {
        UserProviderSetupLocationId: "a3a637f8-2e00-4cf3-a1a9-1e198fae0108",
        UserId: "a162c864-8f50-4e84-8942-7194bc8070cf",
        LocationId: 5402716,
        Location: null,
        ProviderTypeId: 1,
        ProviderOnClaimsRelationship: 1,
        ProviderOnClaimsId: null,
        Color: null,
        ProviderQualifierType: 2,
        ObjectState: null,
        FailedMessage: null,
        IsActive: true,
        PracticeId: 38638,
        DateModified: "2023-03-09T15:50:26.9893239",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DataTag: "AAAAAAAh+uo="
      },
      {
        UserProviderSetupLocationId: "247cb996-7551-4084-9c43-39f7b66f6f03",
        UserId: "a162c864-8f50-4e84-8942-7194bc8070cf",
        LocationId: 6497004,
        Location: null,
        ProviderTypeId: 2,
        ProviderOnClaimsRelationship: 1,
        ProviderOnClaimsId: null,
        Color: null,
        ProviderQualifierType: 2,
        ObjectState: null,
        FailedMessage: null,
        IsActive: true,
        PracticeId: 38638,
        DateModified: "2023-09-07T12:04:29.6665685",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DataTag: "AAAAAAAtftE="
      },
      {
        UserProviderSetupLocationId: "a8f39ce9-6efd-4eee-b0a1-d57e791b8110",
        UserId: "a162c864-8f50-4e84-8942-7194bc8070cf",
        LocationId: 5053276,
        Location: null,
        ProviderTypeId: 1,
        ProviderOnClaimsRelationship: 1,
        ProviderOnClaimsId: null,
        Color: "#22b14c",
        ProviderQualifierType: 2,
        ObjectState: null,
        FailedMessage: null,
        IsActive: true,
        PracticeId: 38638,
        DateModified: "2023-03-09T15:50:26.9893239",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        DataTag: "AAAAAAAh+uw="
      }
    ],
    Roles: [
      {
        RoleId: 190786,
        PracticeId: null,
        RoleName: "Practice Admin/Exec. Dentist",
        RoleDesc: "Practice Administrator or Executive Dentist for Fuse Practices",
        ApplicationId: 0,
        DataTag: "AAAAACdWc5g="
      }
    ],
    ShowCardServiceDisabledMessage: false,
    PracticeId: 38638,
    DateModified: "2023-10-13T09:52:56.0485677",
    UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
    DataTag: "AAAAAAAuTXY="
  },
  initMode: 1,
  Locations: [
    5053276
  ],
  rows: 2,
  cols: 2,
  y: 2,
  x: 0,
  initData: {
    Data: {
      "Date Range":{
        SeriesData: [
          {
            SeriesName: null,
            Category: "0-30 days",
            Label: "0",
            Value: 0,
            Count: 0,
            Color: null
          },
          {
            SeriesName: null,
            Category: "31-60 days",
            Label: "62",
            Value: 61.88,
            Count: 1,
            Color: null
          },
          {
            SeriesName: null,
            Category: "61-90 days",
            Label: "0",
            Value: 0,
            Count: 0,
            Color: null
          },
          {
            SeriesName: null,
            Category: "> 90 days",
            Label: "0",
            Value: 0,
            Count: 0,
            Color: null
          }
          
        ]
      }
    }
  }
}

class mockDashboardWidgetService {
  getWidgetData(): Observable<SimpleHalfDonutChart> {
    return of({
      Appointment: '',
      Date: {},
      DefaultFilter: 'Date Range',
      FilterList: []
    });
  }
}

const mockFeatureFlagService = {
  getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
      of(true)),
};

let mockLocalizeService;
let mockLocationService;
let rootScope;
let mockGetWidgetData;
let mockToastrFactory;

describe('PendingClaimsHalfDonutWidgetComponent', () => {
  let component: PendingClaimsHalfDonutWidgetComponent;
  let fixture: ComponentFixture<PendingClaimsHalfDonutWidgetComponent>;
  let dashboardWidgetService: DashboardWidgetService;

  beforeEach(async () => {
    mockLocationService = {
      getActiveLocations: jasmine.createSpy().and.returnValue(
        [
        ]
      ),
      getCurrentLocation: jasmine.createSpy().and.returnValue({
        id: '0'
      })
    };

    rootScope = {
      $on: jasmine.createSpy().and.returnValue(mockLocationService.getCurrentLocation)
    }

    mockGetWidgetData = {
      "Count": null,
      "ExtendedStatusCode": null,
      "InvalidProperties": null,
      "Value":
      {
        "DefaultFilter": "Date Range",
        "Data": {
          "Date Range": {
            "SeriesData": [
              {
                "SeriesName": null,
                "Category": "0-30 days",
                "Label": "0",
                "Value": 0,
                "Count": 0,
                "Color": null
              },
            ],
            "TotalValue": 0,
            "TotalStatements": 0
          }
        },
        "FilterList": [
          "MTD",
          "YTD",
          "Last Month",
          "Last Year"
        ],
        "Appointment": null

      }
    }

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    await TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [PendingClaimsHalfDonutWidgetComponent],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'locationService', useValue: mockLocationService },
        { provide: DashboardWidgetService, useClass: mockDashboardWidgetService },
        { provide: '$rootScope', useValue: rootScope },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        TranslateService
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PendingClaimsHalfDonutWidgetComponent);
    component = fixture.componentInstance;
    dashboardWidgetService = TestBed.inject(DashboardWidgetService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('Should called on ngOnInit', () => {
      component.data = mockData;
      component.processInitMode = jasmine.createSpy();
      component.ngOnInit();
      expect(component.processInitMode).toHaveBeenCalled()
    });
  });

  describe('processInitMode ->', () => {
    it('Should Call processData when mode is Loaded', () => {
      component.data = mockData;
      component.addLegendTitle = jasmine.createSpy();
      fixture.detectChanges()
      component.processInitMode(2);
      expect(component.addLegendTitle).toHaveBeenCalled();
    });

    it('Should Call loadData method', () => {
      component.loadData = jasmine.createSpy();
      component.processInitMode(0);
      expect(component.loadData).toHaveBeenCalled();
    });
  });

  describe('addLegendTitle ->', () => {
    it('Should add object on pendingClaimsData', () => {
      component.addLegendTitle();
      expect(component.pendingClaimsData.length).toBeGreaterThan(0)
    });
  });

  describe('loadData ->', () => {
    it('should fetch data from the service and handle success', () => {
      component.pendingClaimsData = [];
      spyOn(dashboardWidgetService, 'getWidgetData').and.returnValue(of(mockGetWidgetData));
      component.loadData();

      expect(component.pendingClaimsData).toEqual(mockGetWidgetData?.Value?.Data['Date Range']?.SeriesData);
      expect(mockToastrFactory.error).not.toHaveBeenCalled();
    });

    it('should handle error when fetching data from the service', () => {
      spyOn(dashboardWidgetService, 'getWidgetData').and.returnValue(throwError('Error'));
      component.loadData();
      expect(dashboardWidgetService.getWidgetData).toHaveBeenCalled();
    });

    it('should load data when url is "/BusinessCenter/PracticeAtAGlance"', () => {
      //not able to test window.location.href
    });
  });

  describe('getLocationsForFilter function ->', () => {
    beforeEach(function () {
      component.locationOptions = [{ value: 1 }, { value: 2 }];
    });

    it('should return array with single location when selectedLocation.LocationId is not 0', () => {
      component.selectedLocation.LocationId = 1;
      const response = component.getLocationsForFilter();
      expect(response).toEqual([1]);
    });

    it('should return selectedLocation.LocationId 0', () => {
      component.selectedLocation.LocationId = 0;
      const response = component.getLocationsForFilter();
      expect(response).toEqual([1, 2]);
    });
  });

  describe('ngOnDestroy ->', () => {
    it('should unsubscribe from all subscriptions', () => {
      const subscription1 = new Subscription();
      const subscription2 = new Subscription();
      spyOn(subscription1, 'unsubscribe');
      spyOn(subscription2, 'unsubscribe');
      component.subscriptions = [subscription1, subscription2];
      component.ngOnDestroy();
      expect(subscription1.unsubscribe).toHaveBeenCalled();
      expect(subscription2.unsubscribe).toHaveBeenCalled();
    });
  });
});
