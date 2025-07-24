import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InsuranceClaimsHalfDonutWidgetComponent } from './insurance-claims-half-donut-widget.component';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, Subscription, of, throwError } from 'rxjs';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { SimpleHalfDonutChart } from 'src/@shared/widget/simple-half-donut/simple-half-donut';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';

const mockData = {
  ItemId: 19,
  ItemType: "widget",
  Title: "Insurance Claims",
  Template: "insurance-claims-half-donut-widget.html",
  Position: [
      0,
      6
  ],
  Size: {
      Width: 2,
      Height: 2
  },
  BatchLoadId: 0,
  IsHidden: false,
  ActionId: 2719,
  RouteUrl: null,
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
  initMode: 0,
  Locations: [
      5053276
  ],
  rows: 2,
  cols: 2,
  y: 0,
  x: 6,
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

const mockFeatureFlagService = {
  getOnce$: jasmine.createSpy('FeatureFlagService.getOnce$').and.returnValue(
      of(true)),
};

const mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

const mockGetWidgetData = {
  Count: null,
  ExtendedStatusCode: null,
  InvalidProperties: null,
  Value: {
    DefaultFilter: "YTD",
    Data: {
      YTD: {
        SeriesData: [
          {
            SeriesName: null,
            Category: "Unsubmitted",
            Label: null,
            Value: 0,
            Count: 0,
            Color: null
          },
        ],
        TotalValue: 0,
        TotalStatements: 0
      }
    },
    FilterList: [
      "MTD",
      "YTD",
      "Last Month",
      "Last Year"
    ],
    Appointment: null
  }
}

class mockDashboardWidgetService {
  getWidgetData = (): Observable<SimpleHalfDonutChart> => {
    return of(mockGetWidgetData.Value);
  }
  clickedOutside = () => {};
}

describe('InsuranceClaimsHalfDonutWidgetComponent', () => {
  let component: InsuranceClaimsHalfDonutWidgetComponent;
  let fixture: ComponentFixture<InsuranceClaimsHalfDonutWidgetComponent>;
  let service: DashboardWidgetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InsuranceClaimsHalfDonutWidgetComponent],
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        { provide: DashboardWidgetService, useClass: mockDashboardWidgetService },
        { provide: 'SoarConfig', useValue: {} },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService },
        TranslateService      
      ],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InsuranceClaimsHalfDonutWidgetComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(DashboardWidgetService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('processInitMode ->', () => {
    it('Should Call processData when mode is Loaded', () => {
      component.data = mockData;
      component.processData = jasmine.createSpy();
      component.processInitMode(2);
      expect(component.processData).toHaveBeenCalled();
    });

    it('Should Call loadData method', () => {
      component.data = mockData;
      component.loadData = jasmine.createSpy();
      component.processInitMode(0);
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);
      expect(component.loadData).toHaveBeenCalled();
    });
  });

  describe('dateFilterChanged ->', () => {
    it('Should Call getWidgetData with given Date filter', () => {
      component.loadData = jasmine.createSpy();
      component.dateFilterChanged("MTD");
      expect(component.dateOption).toEqual("MTD");
      expect(component.loadData).toHaveBeenCalledWith();
    });
  });

  describe('processData ->', () => {
    it('Should Call on DefaultFilter', () => {
      const data = { Data: "", FilterList: ["MTD", "YTD"], DefaultFilter: "MTD" }
      component.processData(data);
      expect(component.dateFilter).toEqual("MTD");
    });
  });

  describe('loadData ->', () => {
    it('Should Call loadData getWidgetData', () => {
      component.data = mockData;
      spyOn(service, 'getWidgetData').and.returnValue(of(mockGetWidgetData));
      component.processData = jasmine.createSpy();

      component.loadData();
      
      expect(component.processData).toHaveBeenCalledWith(mockGetWidgetData.Value);      
      expect(service.getWidgetData).toHaveBeenCalled();      
    });

    it('should handle error when fetching data from the service', () => {
      spyOn(service, 'getWidgetData').and.returnValue(throwError('Error'));

      component.loadData();

      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.error);
      expect(mockToastrFactory.error).toHaveBeenCalledWith('WidgetLoadingError', 'Failed to load data.');
    });
  });

  describe('ngOnInit ->', () => {
    it('Should called on ngOnInit', () => {
      component.processInitMode = jasmine.createSpy();
      component.data = mockData;

      component.ngOnInit();

      expect(component.processInitMode).toHaveBeenCalledWith(mockData.initMode);
    });
  });

  describe('clickOutside ->', () => {
    it('should call clickOutside method from dashboard widget service when click outside of dropdown', () => {
        const mockDropDownListComponent = {
            isOpen: true
        }

        spyOn(service,'clickedOutside');

        component.clickedOutside(mockDropDownListComponent as DropDownListComponent);
        expect(service.clickedOutside).toHaveBeenCalledWith(mockDropDownListComponent);
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
