import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OpenClinicalNotesWidgetComponent } from './open-clinical-notes-widget.component';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardWidgetService, WidgetInitStatus } from '../../services/dashboard-widget.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OpenClinicalNotesWidgetModel } from './open-clinical-notes-widget-model';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { Observable, of, throwError } from 'rxjs';
import { Location } from 'src/business-center/practice-settings/location';
import { NO_ERRORS_SCHEMA, SimpleChange, SimpleChanges } from '@angular/core';
import { FeatureFlagService } from 'src/featureflag/featureflag.service';
import { DropDownListComponent } from '@progress/kendo-angular-dropdowns';
import * as moment from 'moment';
import { OpenClinicalNotes } from '../../services/dashboard-widget';
// Create a mock service for dashboardWidgetService
class mockDashboardWidgetService {
  getWidgetData(): Observable<OpenClinicalNotesWidgetModel> {
    return of({
      PatientName: 'John Doe',
      NoteTitle: 'Sample Note1',
      TimeLeft: '23 hours 2 mins'
    },
      {
        PatientName: 'Sam Doe',
        NoteTitle: 'Sample Note2',
        TimeLeft: '21 hours 15 mins'
      });
  }
  emptyGuId = "00000000-0000-0000-0000-000000000000";
  clickedOutside = jasmine.createSpy('clickedOutside');
}
let mockSoarConfig;
let dashboardWidgetServices: DashboardWidgetService;
describe('OpenClinicalNotesWidgetComponent', () => {
  let component: OpenClinicalNotesWidgetComponent;
  let fixture: ComponentFixture<OpenClinicalNotesWidgetComponent>;
  let mockLocationService;
  let mockResponse: OpenClinicalNotesWidgetModel[];
  let userContextSpy = '{"Result": { "User": { "UserId": "test" }}}'
  let dashboardWidgetService: DashboardWidgetService;
  let responseData: SoarResponse<OpenClinicalNotesWidgetModel[]>;
  let mockToastrFactory;
  let mockData;
  let mockSubscription;
  let mockTabLauncher;

  beforeEach(async () => {
    mockSoarConfig = {};
    dashboardWidgetServices = new DashboardWidgetService(mockSoarConfig, null);

    mockLocationService = {
      getActiveLocations: jasmine.createSpy().and.returnValue(
        [
        ]
      ),
      getCurrentLocation: jasmine.createSpy().and.returnValue({
        id: 0
      })
    };
    mockResponse = [
      {
        PatientName: 'John Doe',
        NoteTitle: 'Sample Note1',
        TimeLeft: '23 hours 2 mins'
      },
      {
        PatientName: 'Sam Doe',
        NoteTitle: 'Sample Note2',
        TimeLeft: '21 hours 15 mins'
      }
    ];
    userContextSpy = '{"Result": { "User": { "UserId": "test" }}}'


    responseData = {
      Value: mockResponse
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockData = {
      initData: []
    };

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

    mockTabLauncher = {
      launchNewTab: jasmine.createSpy()
    };

    await TestBed.configureTestingModule({
      declarations: [OpenClinicalNotesWidgetComponent],
      imports: [TranslateModule.forRoot(), HttpClientTestingModule],
      providers: [
        { provide: 'tabLauncher', useValue: mockTabLauncher },
        { provide: 'locationService', useValue: mockLocationService },
        { provide: DashboardWidgetService, useClass: mockDashboardWidgetService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: FeatureFlagService, useValue: mockFeatureFlagService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenClinicalNotesWidgetComponent);
    component = fixture.componentInstance;
    dashboardWidgetService = TestBed.inject(DashboardWidgetService); // Inject the mock service
    sessionStorage.setItem('userContext', userContextSpy);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('initial values ', () => {
    it('component should exist', () => {
      expect(component).not.toBeNull();
    });

    it('should set the initial values correctly', () => {
      expect(component.openClinicalNotes).toEqual([]);
      expect(component.userContext).toBeDefined();
      expect(component.selectedProvider.ProviderId).toEqual(component.currentUserId);
      expect(component.selectedLocation).toEqual({ LocationId: 0 });
      expect(component.locationOptions).toEqual([{ NameLine1: 'All Locations', LocationId: 0 }]);
      expect(component.locationIdsForProviderDropdown).toEqual([]);
      expect(dashboardWidgetServices.emptyGuId).toEqual('00000000-0000-0000-0000-000000000000');
    });

    it('should have injected services ', () => {
      expect(mockDashboardWidgetService).not.toBeNull();
    });
  });

  describe('ngOnChanges', () => {
    it('should update selectedLocation and selectedProvider and call getDataFromServer when data changes', () => {
      const previousData = { x: 0, y: 0, rows: 1, cols: 1, Locations: [{ name: 'test1', id: 111 },
      { name: 'test2', id: 'id2' }], userData: { UserId: '0000' } };
      const newData = { x: 0, y: 0, rows: 1, cols: 1, Locations: [{ name: 'test3', id: 222 },
      { name: 'test4', id: 223 }], userData: { UserId: '1111' } };
      component.data = previousData;
  
      spyOn(component, 'getDataFromServer');
  
      component.ngOnChanges({
        data: new SimpleChange(previousData, newData, false)
      });
  
      expect(component.selectedProvider.ProviderId).toBe(newData.userData.UserId);
      expect(component.getDataFromServer).toHaveBeenCalled();
    });

    it('should not set component.userData', () => {
      component.processInitMode = jasmine.createSpy();
      const changes: SimpleChanges = { previousValue: null, currentValue: null, firstChange: null };
      component.ngOnChanges(changes);
      expect(component.selectedProvider.ProviderId).toEqual('test');
      expect(component.selectedLocation.LocationId).toEqual(0);
    });

    it('should not update selectedLocation and selectedProvider or call getDataFromServer when data does not change', () => {
      const data = { x: 0, y: 0, rows: 1, cols: 1, Locations: [{ name: 'test1', id: 111 },
      { name: 'test2', id: 'id2' }], userData: { UserId: '0000' } };
      component.data = data;
      const initialSelectedLocation = component.selectedLocation.LocationId;
      const initialSelectedProvider = component.selectedProvider.ProviderId;
      spyOn(component, 'getDataFromServer');
      component.ngOnChanges({
        data: new SimpleChange(data, data, false)
      });    
      expect(component.selectedLocation.LocationId).toBe(initialSelectedLocation);
      expect(component.selectedProvider.ProviderId).toBe(initialSelectedProvider);
      expect(component.getDataFromServer).not.toHaveBeenCalled();
    });
  });

  describe('ngOnInit function ->', () => {
    it('should set selectedProvider.ProviderId to current logged in user', () => {
      component.currentUserId = userContextSpy;
      component.selectedProvider.ProviderId = 'original';
      component.ngOnInit();
      expect(component.selectedProvider.ProviderId).toBe('test');
    });

    it('should set selectedLocation.LocationId to current logged in location', () => {
      component.selectedLocation.LocationId = 1
      component.ngOnInit();
      expect(component.selectedLocation.LocationId).toBe(0);
    });

    it('should call getUserLocations', () => {
      component.selectedProvider.ProviderId = 'original'
      component.getUserLocations = jasmine.createSpy();

      component.ngOnInit();

      expect(component.getUserLocations).toHaveBeenCalled();
    });
  });

  describe('processInitMode function ->', () => {

    it('processInitMode should be called for initMode 0', () => {
      component.selectedProvider.ProviderId = 'original'
      const initMode = 0;
      spyOn(component, 'getDataFromServer');
      component.processInitMode(initMode);
      expect(component.getDataFromServer).toHaveBeenCalled()
    });

    it('processInitMode should be called for initMode 1', () => {
      const initMode = 1;
      component.processInitMode(initMode);
      expect(component.openClinicalNotes).toEqual(mockData.initData);
    });

    it('processInitMode should be called for initMode 2', () => {
      const initMode = 2;
      component.processInitMode(initMode);
      expect(component.openClinicalNotes).toEqual(mockData.initData);
    });
  });

  describe('assignedProviderChanged function ->', () => {
    it('should update selectedProvider and call getDataFromServer', () => {

      const assignedProvider = { ProviderId: 'provider1' };

      spyOn(component, 'getDataFromServer');

      component.assignedProviderChanged(assignedProvider);

      expect(component.selectedProvider.ProviderId).toBe(assignedProvider.ProviderId);
      expect(component.getDataFromServer).toHaveBeenCalled();
    });

    it('should update selectedProvider as all providers when invalid provider is passed and call getDataFromServer', () => {

      component.currentUserId = 'test';
      spyOn(component, 'getDataFromServer');

      component.assignedProviderChanged(null);

      expect(component.selectedProvider.ProviderId).toBe('00000000-0000-0000-0000-000000000000');
      expect(component.getDataFromServer).toHaveBeenCalled();
    });
  })

  describe('onLocationSelectedChange function ->', () => {
    it('should update locationIdsForProviderDropdown with all locationOptions when selected value is "0"', () => {

      const valueZero = 0;
      const tempLocations: Location[] = [{ NameLine1: 'All locations', LocationId: 0 }, { NameLine1: 'Location 1', LocationId: 1 }, { NameLine1: 'Location 2', LocationId: 2 }];

      component.selectedLocation = { LocationId: 0 };
      component.locationOptions = tempLocations;

      component.onLocationSelectedChange(valueZero);
      expect(component.locationIdsForProviderDropdown).toEqual(tempLocations.map(location => location.LocationId));
    });

    it('should update selectedLocation and locationIdsForProviderDropdown based on the selected value', () => {

      const value = 1;

      const tempLocations: Location[] = [{ NameLine1: 'Alaska', LocationId: 1 }];

      component.locationOptions = tempLocations;
      component.selectedLocation = { LocationId: 1 };
      component.selectedProvider.ProviderId = 'provider1';
      component.currentUserId = 'provider2';
      component.locationOptions = tempLocations;

      component.onLocationSelectedChange(value);

      expect(component.selectedLocation.LocationId).toBe(value);
      expect(component.locationIdsForProviderDropdown).toEqual([value]);
    });
  });

  describe('getUserLocations function ->', () => {
    beforeEach(function () {
    });
    //locationOptions == 0 - calls mockLocationService.getActiveLocations
    it('should not call mockLocationService.getActiveLocations when component.locationOptions length is greater than 0', () => {
      component.locationOptions = [];
      mockLocationService.getActiveLocations = jasmine.createSpy().and.returnValue(null);
      component.getUserLocations();
      expect(component.locationIdsForProviderDropdown.length).toBe(0);
    });


    //locationOptions != 0
    it('should call mockLocationService.getActiveLocations when component.locationOptions length is 0', () => {
      component.getUserLocations();
      expect(mockLocationService.getActiveLocations).toHaveBeenCalled();
    });

    //- activeLocations not set
    it('should not call component.groupLocations when activeLocations is null', () => {
      component.locationOptions = [];
      mockLocationService.getActiveLocations = jasmine.createSpy().and.returnValue(null);
      component.groupLocations = jasmine.createSpy();

      component.getUserLocations();
      expect(component.groupLocations).not.toHaveBeenCalled();
    });

    //- activeLocations set
    //---- calls component.groupLocations
    it('should call component.groupLocations when activeLocations is not null', () => {
      component.locationOptions = [];
      mockLocationService.getActiveLocations = jasmine.createSpy().and.returnValue([
        { name: 'test1', id: 'id1' },
        { name: 'test2', id: 'id2' }
      ]);
      component.groupLocations = jasmine.createSpy().and.callFake(function (locations) { return locations; });

      component.getUserLocations();
      expect(component.groupLocations).toHaveBeenCalled();
    });


    //---- sets locationIdsForProviderDropdown        

    it('should set component.locationIdsForProviderDropdown', () => {
      component.locationOptions = [];
      component.locationIdsForProviderDropdown = [];
      mockLocationService.getActiveLocations = jasmine.createSpy().and.returnValue([
        { name: 'test1', id: 1 },
        { name: 'test2', id: 2 }
      ]);
      component.groupLocations = jasmine.createSpy().and.callFake(function (locations) { return locations; });

      component.getUserLocations();
      expect(component.locationIdsForProviderDropdown).toEqual([1, 2]);
    });
    
    it('should sort locations with the same state by name or deactivation time', () => {
      const activeLocation1 = { NameLine1: 'A', DeactivationTimeUtc: null };
      const activeLocation2 = { NameLine1: 'B', DeactivationTimeUtc: null };
      const pendingInactiveLocation1 = { NameLine1: 'A', DeactivationTimeUtc: moment().add(2, 'days').toISOString() };
      const pendingInactiveLocation2 = { NameLine1: 'A', DeactivationTimeUtc: moment().add(1, 'days').toISOString() };
      const inactiveLocation1 = { NameLine1: 'A', DeactivationTimeUtc: moment().subtract(1, 'days').toISOString() };
      const inactiveLocation2 = { NameLine1: 'A', DeactivationTimeUtc: moment().subtract(2, 'days').toISOString() };
      const locations = [activeLocation1, activeLocation2, pendingInactiveLocation1, pendingInactiveLocation2, inactiveLocation1, inactiveLocation2];
  
      const result = component.groupLocations(locations);
  
      expect(result).toEqual([
        { ...activeLocation1, StateName: OpenClinicalNotes.Active, SortOrder: 1 },
        { ...activeLocation2, StateName: OpenClinicalNotes.Active, SortOrder: 1 },
        { ...pendingInactiveLocation2, StateName: OpenClinicalNotes.PendingInactive, SortOrder: 2 },
        { ...pendingInactiveLocation1, StateName: OpenClinicalNotes.PendingInactive, SortOrder: 2 },
        { ...inactiveLocation1, StateName: OpenClinicalNotes.Inactive, SortOrder: 3 },
        { ...inactiveLocation2, StateName: OpenClinicalNotes.Inactive, SortOrder: 3 },
      ]);
    });

    it('should group locations correctly', () => {
      const locations: Location[] = [
        { NameLine1: 'Location 1', DeactivationTimeUtc: null },
        { NameLine1: 'Location 2', DeactivationTimeUtc: moment().subtract(1, 'day').toDate() },
        { NameLine1: 'Location 3', DeactivationTimeUtc: moment().add(1, 'day').toDate() }
      ];
      const result = component.groupLocations(locations);
      expect(result.length).toBe(3);
      expect(result[0].SortOrder).toBe(1);
      expect(result[1].SortOrder).toBe(2);
      expect(result[2].SortOrder).toBe(3);
    });
  
    it('should handle locations with null DeactivationTimeUtc', () => {
      const locations: Location[] = [
        { NameLine1: 'Location 1', DeactivationTimeUtc: null },
        { NameLine1: 'Location 2', DeactivationTimeUtc: null }
      ];
      const result = component.groupLocations(locations);
      expect(result.length).toBe(2);
    });
  
    it('should group locations correctly and sort them', () => {
      const locations: Location[] = [
        { NameLine1: 'C Location', DeactivationTimeUtc: null },
        { NameLine1: 'B Location', DeactivationTimeUtc: moment().subtract(1, 'day').toDate() },
        { NameLine1: 'A Location', DeactivationTimeUtc: moment().add(1, 'day').toDate() }
      ];
      const result = component.groupLocations(locations);
      expect(result.length).toBe(3);
      expect(result[0].NameLine1).toBe('C Location');
      expect(result[1].NameLine1).toBe('A Location');
      expect(result[2].NameLine1).toBe('B Location');
    });
  });
  

  describe('getLocationsForFilter function ->', () => {
    beforeEach(function () {
      component.locationOptions = [{ LocationId: 1 }, { LocationId: 2 }];
    });

    it('should return array with single location when selectedLocation.LocationId is not 0', () => {
      component.selectedLocation.LocationId = 1;

      const response = component.getLocationsForFilter();
      expect(response).toEqual([1]);
    });

    it('should call widgetFactory.GetOpenClinicalNotes', () => {
      component.selectedLocation.LocationId = 0;

      const response = component.getLocationsForFilter();
      expect(response).toEqual([1, 2]);
    });
  });
  describe('getDataFromServer function ->', () => {
    it('should call component.getLocationsForFilter', () => {
      component.getLocationsForFilter = jasmine.createSpy();
      component.getDataFromServer();
      expect(component.getLocationsForFilter).toHaveBeenCalled();
    });

    it('should fetch data from the service and handle success', () => {
      component.selectedProvider.ProviderId = 'your-provider';
      component.openClinicalNotes = [];

      spyOn(dashboardWidgetService, 'getWidgetData').and.returnValue(of(responseData));
      component.getDataFromServer();

      expect(dashboardWidgetService.getWidgetData).toHaveBeenCalledWith(
        'widgets/performance/OpenClinicalNotes',
        jasmine.objectContaining({
          LocationIds: jasmine.any(Array),
          ProviderIds: ['your-provider']
        })
      );

      expect(component.openClinicalNotes).toEqual(responseData.Value);
      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.Loaded);

      expect(mockToastrFactory.error).not.toHaveBeenCalled();
    });

    it('should handle error when fetching data from the service', () => {
      spyOn(dashboardWidgetService, 'getWidgetData').and.returnValue(throwError('Error'));

      component.getDataFromServer();
      expect(dashboardWidgetService.getWidgetData).toHaveBeenCalled();

      expect(component.loadingStatus.loading).toEqual(WidgetInitStatus.error);
      expect(mockToastrFactory.error).toHaveBeenCalledWith(
        jasmine.any(String),
        jasmine.any(String)
      );
    });
  });

  describe('openPatientTab', () => {
    it('should call tabLauncher.launchNewTab with the correct URL', () => {
      const patientId = '123';
      const expectedUrl = `#/Patient/${encodeURIComponent(patientId)}/Clinical/?tab=1&activeSubTab=3&currentPatientId=${encodeURIComponent(patientId)}`;
  
      mockTabLauncher.launchNewTab = jasmine.createSpy();
  
      component.openPatientTab(patientId);
  
      expect(mockTabLauncher.launchNewTab).toHaveBeenCalledWith(expectedUrl);
    });
  });

  describe('clickOutside ->', () => {
    it('should call clickOutside method from dashboard widget service when click outside of dropdown', () => {
        const mockDropDownListComponent = {
            isOpen: true
        }
        component.clickedOutside(mockDropDownListComponent as DropDownListComponent);
        expect(dashboardWidgetService.clickedOutside).toHaveBeenCalledWith(mockDropDownListComponent);
    });
  });

  describe('ngOnDestroy ->', () => {
    it('should unsubscribe subscriptions on destroy', () => {
      component.subscriptions.push(mockSubscription);
      component.ngOnDestroy();
      expect(mockSubscription.unsubscribe).toHaveBeenCalled();
    })
  });
})
