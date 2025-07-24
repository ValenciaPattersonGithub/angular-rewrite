import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  waitForAsync,
  tick,
  fakeAsync,
} from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { configureTestSuite } from 'src/configure-test-suite';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import moment from 'moment-timezone';
import { Location } from 'src/business-center/practice-settings/location';

import {
  SearchPipe,
  Search1Pipe,
  BoldTextIfContainsPipe,
} from 'src/@shared/pipes';
import { LocationSearchComponent } from './location-search.component';

describe('LocationSearchComponent', () => {
  let component: LocationSearchComponent;
  let fixture: ComponentFixture<LocationSearchComponent>;
  let locationData;

  //region mock
  let mockStates;
  let mockLocation: Location[];
  let mockPatSecurityService;
  let mockToastrFactory;
  let mockGetLocationServices;
  let staticData;
  let mockService;
  let mockModalFactory;
  let mockLocalizeService;
  let mocklocation;
  let routeParams;
  // mock the window object
  let mockWindow;

  //end region

  configureTestSuite(() => {
    mockStates = {
      Value: [
        {
          Abbreviation: 'AL',
          DataTag: 'AAAAAAACeSs=',
          DateModified: '0001-01-01T00:00:00',
          Name: 'Alabama',
          StateId: 1,
          UserModified: '00000000-0000-0000-0000-000000000000',
        },
        {
          Abbreviation: 'AK',
          DataTag: 'AAAAAAACeSw=',
          DateModified: '0001-01 - 01T00: 00: 00',
          Name: 'Alaska',
          StateId: 2,
          UserModified: '00000000-0000-0000-0000-000000000000',
        },
        {
          Abbreviation: 'AZ',
          DataTag: 'AAAAAAACeSw=',
          DateModified: '0001-01 - 01T00: 00: 00',
          Name: 'Arizona',
          StateId: 3,
          UserModified: '00000000-0000-0000-0000-000000000000',
        },
      ],
    };

    mockLocation = [
      {
        LocationId: 1,
        NameLine1: 'Test',
        NameLine2: 'Location',
        NameAbbreviation: null,
        Website: null,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: 'AZ',
        ZipCode: '30092',
        Email: 'stmt@test.com',
        PrimaryPhone: null,
        SecondaryPhone: null,
        Fax: null,
        TaxId: null,
        TypeTwoNpi: null,
        TaxonomyId: null,
        Timezone: 'Central Standard Time',
        LicenseNumber: null,
        ProviderTaxRate: null,
        SalesAndUseTaxRate: null,
        Rooms: [],
        AdditionalIdentifiers: [],
        DefaultFinanceCharge: null,
        DeactivationTimeUtc: null,
        AccountsOverDue: null,
        MinimumFinanceCharge: null,
        MerchantId: null,
        RemitAddressSource: 0,
        RemitOtherLocationId: null,
        RemitToNameLine1: null,
        RemitToNameLine2: null,
        RemitToAddressLine1: null,
        RemitToAddressLine2: null,
        RemitToCity: null,
        RemitToState: null,
        RemitToZipCode: null,
        RemitToPrimaryPhone: null,
        DisplayCardsOnEstatement: false,
      },
      {
        LocationId: 2,
        NameLine1: 'Miniphilisipe',
        NameLine2: 'Alaksa',
        NameAbbreviation: null,
        Website: null,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: '30092',
        Email: 'stmt@test.com',
        PrimaryPhone: null,
        SecondaryPhone: null,
        Fax: null,
        TaxId: null,
        TypeTwoNpi: null,
        TaxonomyId: null,
        Timezone: 'Central Standard Time',
        LicenseNumber: null,
        ProviderTaxRate: null,
        SalesAndUseTaxRate: null,
        Rooms: [],
        AdditionalIdentifiers: [],
        DefaultFinanceCharge: null,
        DeactivationTimeUtc: null,
        AccountsOverDue: null,
        MinimumFinanceCharge: null,
        MerchantId: null,
        RemitAddressSource: 0,
        RemitOtherLocationId: null,
        RemitToNameLine1: null,
        RemitToNameLine2: null,
        RemitToAddressLine1: null,
        RemitToAddressLine2: null,
        RemitToCity: null,
        RemitToState: null,
        RemitToZipCode: null,
        RemitToPrimaryPhone: null,
        DisplayCardsOnEstatement: false,
      },
      {
        LocationId: 3,
        NameLine1: 'Test',
        NameLine2: 'Aqrsm',
        NameAbbreviation: null,
        Website: null,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: '30092',
        Email: 'stmt@test.com',
        PrimaryPhone: null,
        SecondaryPhone: null,
        Fax: null,
        TaxId: null,
        TypeTwoNpi: null,
        TaxonomyId: null,
        Timezone: 'Central Standard Time',
        LicenseNumber: null,
        ProviderTaxRate: null,
        SalesAndUseTaxRate: null,
        Rooms: [],
        AdditionalIdentifiers: [],
        DefaultFinanceCharge: null,
        DeactivationTimeUtc: null,
        AccountsOverDue: null,
        MinimumFinanceCharge: null,
        MerchantId: null,
        RemitAddressSource: 0,
        RemitOtherLocationId: null,
        RemitToNameLine1: null,
        RemitToNameLine2: null,
        RemitToAddressLine1: null,
        RemitToAddressLine2: null,
        RemitToCity: null,
        RemitToState: null,
        RemitToZipCode: null,
        RemitToPrimaryPhone: null,
        DisplayCardsOnEstatement: false,
      },
      {
        LocationId: 4,
        NameLine1: 'Miniphilisipe',
        NameLine2: 'Alaksa',
        NameAbbreviation: null,
        Website: null,
        AddressLine1: null,
        AddressLine2: null,
        City: null,
        State: null,
        ZipCode: '30092',
        Email: 'stmt@test.com',
        PrimaryPhone: null,
        SecondaryPhone: null,
        Fax: null,
        TaxId: null,
        TypeTwoNpi: null,
        TaxonomyId: null,
        Timezone: 'Central Standard Time',
        LicenseNumber: null,
        ProviderTaxRate: null,
        SalesAndUseTaxRate: 0.02,
        Rooms: [],
        AdditionalIdentifiers: [],
        DefaultFinanceCharge: null,
        DeactivationTimeUtc: null,
        AccountsOverDue: null,
        MinimumFinanceCharge: null,
        MerchantId: null,
        RemitAddressSource: 0,
        RemitOtherLocationId: null,
        RemitToNameLine1: null,
        RemitToNameLine2: null,
        RemitToAddressLine1: null,
        RemitToAddressLine2: null,
        RemitToCity: null,
        RemitToState: null,
        RemitToZipCode: null,
        RemitToPrimaryPhone: null,
        DisplayCardsOnEstatement: false,
      },
    ];

    mockPatSecurityService = {
      generateMessage: jasmine.createSpy().and.returnValue(''),
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    mockGetLocationServices = {
      get: jasmine.createSpy().and.callFake(array => {
        return {
          $promise: {
            then(res) { },
          },
        };
      }),
    };

    staticData = {
      States: jasmine
        .createSpy('staticData.States')
        .and.returnValue({ then: mockStates }),
    };

    mockService = {
      IsAuthorizedByAbbreviation: (authtype: string) => { },
      getServiceStatus: () =>
        new Promise((resolve, reject) => {
          // the resolve / reject functions control the fate of the promise
        }),
      esCancelEvent: new BehaviorSubject<{}>(undefined),
      isEnabled: () => new Promise((resolve, reject) => { }),
      States: () =>
        new Promise((resolve, reject) => {
          // the resolve / reject functions control the fate of the promise
        }),
      getCurrentLocation: jasmine
        .createSpy()
        .and.returnValue({ practiceId: 'test' }),
      getLocations: jasmine
        .createSpy('LocationServices.get')
        .and.returnValue({ $promise: { Value: [{ LocationId: 3 }] } }),
    };

    mockModalFactory = {
      CancelModal: jasmine
        .createSpy('ModalFactory.CancelModal')
        .and.returnValue({ then: () => { } }),
    };

    mockLocalizeService = {
      getLocalizedString: () => 'translated text',
    };

    mocklocation = {
      path: jasmine.createSpy().and.returnValue('/'),
    };

    locationData = {
      changeLocationId: function (message: number) { },
    };

    routeParams = {
      locationId: 1,
    };

    // mock the window object
    mockWindow = { location: { hash: '' } };

    TestBed.configureTestingModule({
      declarations: [
        LocationSearchComponent,
        SearchPipe,
        Search1Pipe,
        BoldTextIfContainsPipe,
      ],
      // TranslateModule import required for components that use ngx-translate in the view or componenet code
      imports: [TranslateModule.forRoot(), FormsModule],
      providers: [
        { provide: '$routeParams', useValue: routeParams },
        { provide: '$location', useValue: mocklocation },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'LocationServices', useValue: mockGetLocationServices },
        { provide: 'StaticData', useValue: mockService },
        { provide: 'LocationDataService', useValue: locationData },
        { provide: 'Window', useValue: mockWindow },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LocationSearchComponent],
      schemas: [],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component).toBeTruthy();
      expect(component.selectedLocationId).toEqual(routeParams.locationId);
      expect(component.loading).toEqual(true);
      expect(component.filter).toEqual('');
      expect(component.stateList).toEqual([]);
      expect(component.hasChanges).toEqual(false);
      expect(component.selectedLocation).toEqual(undefined);
    });
  });

  describe('ngOnChanges ->', () => {
    it('should call watchSelectedLocationChange method if selection location changes', () => {
      spyOn(component, 'watchSelectedLocationChange');

      const changes = new SimpleChange(null, mockLocation[0], true);
      const nv = changes.currentValue;
      const ov = changes.previousValue;

      component.ngOnChanges({ selectedLocation: changes });
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.selectedLocation).toEqual(nv);
        expect(component.watchSelectedLocationChange).toHaveBeenCalledWith(
          nv,
          ov
        );
      });
    });

    it('should call locationsGetSuccess method if locations changes', () => {
      spyOn(component, 'locationsGetSuccess');

      const changes = new SimpleChange(null, mockLocation, true);
      const locations = changes.currentValue;
      component.ngOnChanges({ locations: changes });

      expect(component.locations).toEqual(locations);
      expect(component.locations[0]).toEqual(locations[0]);
      expect(component.locationsGetSuccess).toHaveBeenCalled();
    });

    it('should do nothing if hasChanges change', () => {
      const changes = new SimpleChange(null, true, true);

      component.ngOnChanges({ hasChanges: changes });
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.hasChanges).toEqual(true);
      });
    });
  });

  describe('locationsGetSuccess', () => {
    beforeEach(() => {
      spyOn(component, 'getStateList');

      component.locations = mockLocation;
      component.locationsGetSuccess();
    });

    it('should set selectedLocation if selectedLocationId is not null after successfully getting all the locations', () => {
      component.selectedLocationId = 1;

      expect(component.loading).toEqual(false);
      expect(component.getStateList).toHaveBeenCalled();
      expect(component.selectedLocation).toEqual(mockLocation[0]);
    });

    it('should set selectedLocation to the first index location if selectedLocationId is null after successfully getting all the locations', () => {
      component.selectedLocationId = null;

      expect(component.loading).toEqual(false);
      expect(component.getStateList).toHaveBeenCalled();
      expect(component.selectedLocation).toEqual(mockLocation[0]);
    });
  });;

  describe('getTitle ->', () => {
    it('should return name of the location', () => {
      mockLocation.forEach(location => {
        const locationTitle = component.getTitle(location);
        const title = location.NameLine2
          ? location.NameLine1 + ' ' + location.NameLine2
          : location.NameLine1;

        expect(locationTitle).toBe(title);
      });
    });
  });

  describe('authViewAccess -> ', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the view amfa', () => {
      component.authViewAccess();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalledWith('soar-biz-bizloc-view');
      expect(component.hasViewAccess).toEqual(true);
    });
  });

  describe('confirmCancel ->', () => {
    it('should cancel location change', () => {
      spyOn(locationData, 'changeLocationId');
      spyOn(component, 'changeLocationUrl');
      spyOn(component.selectedLocationChange, 'emit');
      component.confirmCancel(mockLocation[0]);

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.selectedLocation).toEqual(mockLocation[0]);
        expect(component.selectedLocationChange.emit).toHaveBeenCalledWith(
          component.selectedLocation
        );
        expect(locationData.changeLocationId).toHaveBeenCalledWith(
          component.selectedLocationId
        );
        expect(component.changeLocationUrl).toHaveBeenCalledWith(
          mockLocation[0].LocationId
        );
      });
    });
  });

  describe('getStateList -> ', () => {
    it('should set stateList and call setStateName method', () => {
      spyOn(component, 'setStateName');
      component.getStateList();
      fixture.detectChanges();
      fixture.whenStable().then(mockStates => {
        expect(staticData.States).toHaveBeenCalled();
        expect(component.stateList).toEqual(mockStates.Value);
        expect(component.setStateName).toHaveBeenCalled();
      });
    });
  });

  describe('selectLocation ->', () => {
    it('should call confirmCancel method', () => {
      spyOn(component, 'confirmCancel');
      component.hasChanges = false;
      component.selectLocation(mockLocation[0]);

      fixture.detectChanges();

      fixture.whenStable().then(res => {
        expect(component.confirmCancel).toHaveBeenCalledWith(mockLocation[0]);
      });
    });

    it('should call CancelModal', () => {
      spyOn(component, 'confirmCancel');
      component.hasChanges = true;
      component.selectLocation(mockLocation[0]);

      fixture.whenStable().then(res => {
        expect(mockModalFactory.CancelModal).toHaveBeenCalled();
        expect(component.confirmCancel).toHaveBeenCalledWith(mockLocation[0]);
      });
    });
  });

  describe('locationOnChange ->', () => {
    it('should call setStateName method', () => {
      spyOn(component, 'setStateName');
      component.locationOnChange(mockLocation[0], mockLocation[1]);

      expect(component.setStateName);
    });

    it('should do noting if new value is not present', () => {
      component.locationOnChange(null, mockLocation[0]);
    });
  });

  describe('checkLocationStatus', () => {
    it('should return false when item is falsy', () => {
      const result = component.checkLocationStatus(undefined);
      expect(result).toBe(false);
      const result2 = component.checkLocationStatus(null);
      expect(result2).toBe(false);
    });

    it('should set  IsPendingInactive to false when DeactivationTimeUtc is in the past', () => {
      const item = {
        DeactivationTimeUtc: moment().subtract(1, 'days'),
        IsPendingInactive: false,
      };
      const result = component.checkLocationStatus(item);
      expect(result).toBe(true);
      expect(item.IsPendingInactive).toBe(false);
    });

    it('should set IsPendingInactive to true when DeactivationTimeUtc is in the future', () => {
      const item = {
        DeactivationTimeUtc: moment().add(1, 'days'),
        IsPendingInactive: false,
      };
      const result = component.checkLocationStatus(item);
      expect(result).toBe(true);
      expect(item.IsPendingInactive).toBe(true);
    });

    it('should return false when DeactivationTimeUtc is not defined', () => {
      const item = {};
      const result = component.checkLocationStatus(item);
      expect(result).toBe(false);
    });
  });

  describe('watchSelectedLocationChange -> ', () => {
    it('should changeLocationURL to -1 if new location is added', fakeAsync(() => {
      spyOn(component, 'changeLocationUrl');

      component.locations = mockLocation;
      component.selectedLocation = mockLocation[1];
      const nv = mockLocation[0];
      nv.LocationId = null;
      const ov = mockLocation[1];
      component.watchSelectedLocationChange(nv, ov);
      tick(500);

      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.changeLocationUrl).toHaveBeenCalledWith(-1);
      });
    }));

    it('should go to default location if user cancels out of add location ', () => {
      spyOn(component, 'changeLocationUrl');

      component.locations = mockLocation;
      component.selectedLocation = mockLocation[1];
      const nv = mockLocation[1];
      const ov = mockLocation[0];
      ov.LocationId = null;
      component.watchSelectedLocationChange(nv, ov);

      expect(component.changeLocationUrl).toHaveBeenCalledWith(nv.LocationId);
    });

    it('should go to new selected location', () => {
      spyOn(component, 'changeLocationUrl');

      component.locations = mockLocation;
      component.selectedLocation = mockLocation[1];
      const nv = mockLocation[1];
      const ov = null;
      component.watchSelectedLocationChange(nv, ov);

      expect(component.changeLocationUrl).toHaveBeenCalledWith(nv.LocationId);
    });
  });

  describe('setStateName ->', () => {
    it('should set state name in every location', () => {
      component.locations = mockLocation;
      component.setStateName();
      fixture.detectChanges();

      component.locations.forEach(location => {
        expect(location.StateName).not.toBeNull();
      });
    });
  });

  describe('authAccess -> ', () => {
    it('should set view acess to true', () => {
      component.authAccess();

      expect(component.hasViewAccess).toEqual(true);
    });

    it('should navigate back and show toastr message if user does not have view access', () => {
      component.hasViewAccess = false;
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      component.authAccess();
      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(mockToastrFactory.error).toHaveBeenCalledWith(
          mockPatSecurityService.generateMessage('soar-biz-bizloc-view'),
          'Not Authorized'
        );
        expect(mocklocation.path).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('filter variable ->', async () => {
    it('should change when user enters text in input field', () => {
      component.locations = mockLocation;
      expect(component.filter).toEqual('');
      const inputElement = fixture.debugElement.query(
        By.css('#locationFilter')
      );

      inputElement.nativeElement.value = 'te';

      fixture.detectChanges();

      fixture.whenStable().then(() => {
        expect(component.filter).toEqual('te');
      });
    });
  });
});
