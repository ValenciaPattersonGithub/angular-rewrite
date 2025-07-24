import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AddEvent, GridModule } from '@progress/kendo-angular-grid';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { process, SortDescriptor, State } from "@progress/kendo-data-query";
import { ConfirmationModalOverlayRef } from 'src/@shared/components/confirmation-modal/confirmation-modal.overlayref';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { NoResultsComponent } from 'src/@shared/components/noResult/no-results/no-results.component';
import { OrderByPipe } from 'src/@shared/pipes';
import { AppKendoUIModule } from 'src/app-kendo-ui/app-kendo-ui.module';
import { configureTestSuite } from 'src/configure-test-suite';
import { LocationsIdentifiersComponent } from './locations-identifiers.component';
import { LocationIdentifierService } from 'src/@shared/providers/location-identifier.service';
import { MasterLocationIdentifier } from '../../location-identifier';
import { HttpClientTestingModule } from '@angular/common/http/testing';

//region mocks
let localize;

let locationIdentifierList = {
  Value: [
    { DataTag: 'AAAAAAALtDw=', DateDeleted: null, DateModified: null, Description: 'Test', MasterLocationIdentifierId: '16ca7326-0ae7-4f0f-be7d-16428b431c3b', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
    { DataTag: 'AAAAAAAL/o4=', DateDeleted: null, DateModified: null, Description: 'Test QA', MasterLocationIdentifierId: 'f5c40f16-ed83-4616-aaf5-8600d46d83c8', Qualifier: 4, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
    { DataTag: 'AAAAAAAL/pI="', DateDeleted: null, DateModified: null, Description: 'Test QA 1', MasterLocationIdentifierId: '1697c792-8780-4f1d-b5bd-739d46c4b492', Qualifier: 1, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
    { DataTag: 'AAAAAAAMAQM=', DateDeleted: null, DateModified: null, Description: 'Test QA 2', MasterLocationIdentifierId: '96307e38-a65d-410b-a333-9509bebf5064', Qualifier: 3, UserModified: 'a162c864-8f50-4e84-8942-7194bc8070cf' },
  ]
};

const retValue = { $promise: { then: jasmine.createSpy() } };

let mockLocationIdentifierService = {
  locationIdentifier: () => {
    return {
      then: (success, error) => {
        success({ Value: mockLocation }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }
    }
  },
  get: () => {
    return {
      then: (success, error) => {
        success({ Value: mockLocation }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }
    }
  },
  delete: () => {
    return {
      then: (res, error) => {
        res({ Value: tempMockLoation }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }
    }
  },
  save: () => {
    return {
      then: (res, error) => {
        res({ Value: mockLocation }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }
    }
  },
  update: (masterLocationIdentifier: MasterLocationIdentifier) => {
    return {
      then: (res, error) => {
        res({ Value: masterLocationIdentifier }),
          error({
            data: {
              InvalidProperties: [{
                PropertyName: "Description",
                ValidationMessage: "Not Allowed"
              }]
            }
          })
      }
    }
  }
};

let mockLocalizeService = {
  getLocalizedString: () => 'translated text'
};

let mockToastrFactory = {
  success: jasmine.createSpy('toastrFactory.success'),
  error: jasmine.createSpy('toastrFactory.error')
};

let mockPatSecurityService = {
  IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true)
};

let mockMasterLocationIdentifierQualifiers = [
  { Value: 0, Text: 'None' },
  { Value: 1, Text: '0B   State License Number' },
  { Value: 3, Text: 'G2   Provider Commercial Number' },
  { Value: 4, Text: 'LU   Location Number' },
  { Value: 5, Text: 'ZZ   Provider Taxonomy' }
];

let event: AddEvent;

const mockState: State = {
  skip: 0,
  sort: [],
  filter: {
    logic: "and",
    filters: [{
      field: "Description",
      operator: "contains",
      value: ""
    },
    {
      field: "Qualifier",
      operator: "eq",
      value: ""
    },],
  }
};

const mockSort: SortDescriptor[] = [
  {
    field: "Description",
    dir: "asc",
  },
  {
    field: "Qualifier",
    dir: "asc",
  },
];

const mockFilters = [{
  field: "Description",
  operator: "contains",
  value: ""
}];

const mockConfirmationModalService = {
  open: jasmine.createSpy().and.returnValue({
    events: {
      pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
    },
    subscribe: jasmine.createSpy(),
    closed: jasmine.createSpy(),
  }),
};

// confirmationModal objects
const mockConfirmationModalSubscription = {
  subscribe: jasmine.createSpy(),
  unsubscribe: jasmine.createSpy(),
  _subscriptions: jasmine.createSpy(),
  _parentOrParents: jasmine.createSpy(),
  closed: jasmine.createSpy(),
};

const mockDialogRef = {
  events: {
    pipe: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy().and.returnValue({ type: 'confirm' }) }),
  },
  subscribe: jasmine.createSpy(),
  unsubscribe: jasmine.createSpy(),
  _subscriptions: jasmine.createSpy(),
  _parentOrParents: jasmine.createSpy(),
  closed: jasmine.createSpy(),
};

const mockLocation = [{
  LocationId: 1,
  NameLine1: 'Test',
  NameLine2: 'Location',
  NameAbbreviation: null,
  Website: null,
  AddressLine1: null,
  AddressLine2: null,
  City: null,
  State: null,
  ZipCode: '30092',
  Email: "stmt@test.com",
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
  DisplayCardsOnEstatement: false
}, {
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
  Email: "stmt@test.com",
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
  DisplayCardsOnEstatement: false
}, {
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
  Email: "stmt@test.com",
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
  DisplayCardsOnEstatement: false
}, {
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
  Email: "stmt@test.com",
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
  DisplayCardsOnEstatement: false
}];

const tempMockLoation = [{
  LocationId: 111,
  NameLine1: 'Test',
  NameLine2: 'Location',
  NameAbbreviation: null,
  Website: null,
  AddressLine1: null,
  AddressLine2: null,
  City: null,
  State: null,
  ZipCode: '30092',
  Email: "stmt@test.com",
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
  DisplayCardsOnEstatement: false
}];

let mockLocationPath = {
  path: () => ''
};

//end region

describe('LocationsIdentifiersComponent', () => {
  let component: LocationsIdentifiersComponent;
  let fixture: ComponentFixture<LocationsIdentifiersComponent>;
  let toastrFactory;

  const mockService = {
    // define called methods
  };

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        AppKendoUIModule,
        GridModule,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: '$location', useValue: mockLocationPath },
        { provide: ConfirmationModalOverlayRef, useValue: mockService },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
        { provide: LocationIdentifierService, useValue: mockLocationIdentifierService }
      ],
      declarations: [LocationsIdentifiersComponent, OrderByPipe, NoResultsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LocationsIdentifiersComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationsIdentifiersComponent);
    component = fixture.componentInstance;
    localize = TestBed.get('localize');
    toastrFactory = TestBed.get('toastrFactory');
    component.state = mockState;
    component.sort = mockSort;
    component.state.filter.filters = mockFilters;
    component.locationIdentifiers = locationIdentifierList.Value;
    component.gridData = process(locationIdentifierList.Value, component.state);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call a location identifier method', () => {
      component.getLocationIdentifiers = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getLocationIdentifiers).toHaveBeenCalled();
    });

    it('should call the page navigation method ', () => {
      component.getPageNavigation = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getPageNavigation).toHaveBeenCalled();
    });

    it('should call the auth access method ', () => {
      component.authAccess = jasmine.createSpy();
      component.ngOnInit();
      expect(component.authAccess).toHaveBeenCalled();
    });
  });

  describe('initialize controller ->', () => {
    it('should exist', () => {
      expect(component).not.toBeNull();
    });
  });

  describe('should show a toastr notification in case of no view access -> ', () => {
    it('should trigger the toastr error', () => {
      component.authAccess();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('authViewAccess ->', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the view ', () => {
      component.authViewAccess();
      expect(component.hasViewAccess).toEqual(true);
    });
  });

  describe('authCreateAccess ->', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the create ', () => {
      component.authCreateAccess();
      expect(component.hasCreateAccess).toEqual(true);
    });
  });

  describe('authEditAccess ->', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the edit ', () => {
      component.authEditAccess();
      expect(component.hasEditAccess).toEqual(true);
    });
  });

  describe('authDeleteAccess ->', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the delete ', () => {
      component.authDeleteAccess();
      expect(component.hasDeleteAccess).toEqual(true);
    });
  });

  describe('authorization success when hasViewAccess is true ->', () => {
    it('should set acess', () => {
      spyOn(component, 'authViewAccess');
      spyOn(component, 'authCreateAccess');
      spyOn(component, 'authDeleteAccess');
      spyOn(component, 'authEditAccess');
      component.authAccess();
      expect(component.authViewAccess).toHaveBeenCalled();
      expect(component.authCreateAccess).toHaveBeenCalled();
      expect(component.authDeleteAccess).toHaveBeenCalled();
      expect(component.authEditAccess).toHaveBeenCalled();
    });
  });

  describe('should call the get location identifier method -> ', () => {
    it('should get the boolean value', () => {
      component.getLocationIdentifiers();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.locationIdentifiersGetSuccess(locationIdentifierList[0])).toHaveBeenCalled();
      });
    });
  });

  describe('getLocationIdentifiers failure ->', () => {
    it('should display toast error', () => {
      component.locationIdentifiersGetFailure();

      expect(component.locationIdentifiers).toEqual([]);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('saveLocation identifier method ->', () => {
    it('should call the method', () => {
      const spy = component.saveLocationIdentifier = jasmine.createSpy();
      component.saveLocationIdentifier();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('saveLocationIdentifiers success ->', () => {
    it('should populate response', () => {
      const spy = component.getLocationIdentifiers = jasmine.createSpy();
      component.savePostSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('saveLocationIdentifiers failure ->', () => {
    it('should display toast error', () => {
      component.savePostFailure();

      expect(component.loading).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('updateLocationIdentifiers ->', () => {
    it('should update rowIndex', () => {
      component.updateLocationIdentifier(1);
      expect(component.rowIndex).toBe(1);
    });
  });

  describe('updateLocationIdentifiers success ->', () => {
    it('should call toastr success', () => {
      const spy = component.getLocationIdentifiers = jasmine.createSpy();
      component.updatePostSuccess();
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('updateLocationIdentifiers failure ->', () => {
    it('should display toast error', () => {
      component.updatePostFailure(locationIdentifierList.Value[0]);

      expect(component.loading).toBe(false);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('locationIdentifierWithLocationsSuccess method ->', () => {
    it('should not delete if locations are attached', () => {
      const data = {
        Value: [locationIdentifierList.Value[0]]
      };
      component.locationIdentifierWithLocationsSuccess(data, locationIdentifierList.Value[0]);

      expect(component.locationsWithLocationIdentifier).toEqual(data.Value);
      expect(component.checkingForLocations).toEqual(false);
      expect(component.cannotDeleteLocationIdentifierName).toEqual(locationIdentifierList.Value[0].Description);
      expect(component.deletingLocationIdentifier).toEqual(false);
      expect(component.locationIdentifierToDelete).toEqual({});
      expect(component.locationsWithLocationIdentifier).toEqual(data.Value);
    });

    it('should call confirm delete method if there are no locations attached', () => {
      const spy = component.confirmDelete = jasmine.createSpy();
      const data = {
        Value: []
      };
      component.locationIdentifierWithLocationsSuccess(data, locationIdentifierList.Value[0]);

      expect(component.checkingForLocations).toEqual(false);
      expect(component.locationsWithLocationIdentifier).toEqual(data.Value);
      expect(spy).toHaveBeenCalledWith(locationIdentifierList.Value[0]);
    });
  });

  describe('locationIdentifierWithLocations failure ->', () => {
    it('should display toast error', () => {
      component.locationIdentifierWithLocationsFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('confirm delete ->', () => {
    it('should display confirm delete', () => {
      spyOn(component, 'openDeleteConfirmationModal');
      component.confirmDelete(locationIdentifierList.Value[0]);

      expect(component.confirmingDelete).toEqual(true);
      expect(component.openDeleteConfirmationModal).toHaveBeenCalledWith(locationIdentifierList.Value[0]);
    });
  });

  describe('deleteLocationIdentifier Success ->', () => {
    it('should display toast success', () => {
      component.deleteLocationIdentifierSuccess();

      expect(toastrFactory.success).toHaveBeenCalled();
      expect(component.deletingLocationIdentifier).toBe(false);
      expect(component.locationIdentifierToDelete).toEqual({});
    });
  });

  describe('deleteLocationIdentifier failure ->', () => {
    it('should display toast failure', () => {
      spyOn(localize, 'getLocalizedString').and.returnValue('Failed to delete the location additional identifier. Try again.');
      component.deleteLocationIdentifierFailure();

      expect(toastrFactory.error).toHaveBeenCalled();
      expect(component.deletingLocationIdentifier).toBe(false);
      expect(component.locationIdentifierToDelete).toEqual({});
    });
  });

  describe('editHandler method->', () => {
    const mockEventObj = {
      rowIndex: 0,
      dataItem: locationIdentifierList.Value[0],
      sender: {
        closeRow: () => { },
        editRow: () => { }
      }
    };

    it('should make the row editable', () => {
      spyOn(component, 'closeEditor');

      component.editHandler(mockEventObj);

      expect(component.closeEditor).toHaveBeenCalledWith(mockEventObj.sender);
      expect(component.formGroup).toBeDefined();
      expect(component.editedRowIndex).toBe(mockEventObj.rowIndex);
    });
  });

  describe('sortChange method -> ', () => {
    it('should sort the grid data', () => {
      spyOn(component, 'getLocationIdentifiers');
      component.sortChange(mockSort);

      expect(component.sort).toEqual(mockSort);
      expect(component.getLocationIdentifiers).toHaveBeenCalled();
    });
  });

  describe('getQualifier method ->', () => {
    it('should return masterLocationIdentifierQualifier', () => {
      const id = locationIdentifierList.Value[0].Qualifier;
      const qualifier = component.getQualifier(id);

      expect(qualifier).toEqual(mockMasterLocationIdentifierQualifiers[2]);

    });
  });

  describe('openUpdateConfirmationModal method -> ', () => {
    it('should open confirmation modal', () => {
      const spy = spyOn(localize, 'getLocalizedString');
      spy.and.returnValue('Changes will take effect for all locations. Continue?');
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);

      component.openUpdateConfirmationModal(null);

      const data = component.confirmationModalData;
      const ref = mockConfirmationModalService.open({ data });

      expect(component.confirmationModalData.message).toEqual('Changes will take effect for all locations. Continue?');
      expect(component.confirmationRef).toEqual(ref);
      expect(mockConfirmationModalService.open).toHaveBeenCalledWith({ data });
    });
  });


  describe('cancelHandler method->', () => {
    const mockEventObj = {
      sender: {
        closeRow: () => { },
        editRow: () => { }
      },
      rowIndex: 0
    };
    it('should make the row cancel', () => {
      spyOn(component, 'closeEditor');
      component.cancelHandler(mockEventObj);
      expect(component.closeEditor).toHaveBeenCalledWith(mockEventObj.sender, mockEventObj.rowIndex);
    });
  });

  describe('Cancel Handler method ->', () => {
    it('should call the method', () => {
      const spy = component.cancelHandler = jasmine.createSpy();
      component.cancelHandler(event);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Save Handler method ->', () => {
    it('should call the method', () => {
      const spy = component.saveHandler = jasmine.createSpy();
      component.saveHandler({ sender: '', formGroup: '', isNew: false, rowIndex: '' });
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('Save Handler method ->', () => {
    it('should call the openUpdateConfirmationModal method', () => {
      const mockEventObj = {
        sender: {
          closeRow: () => { },
          editRow: () => { }
        },
        rowIndex: 0,
        isNew: false,
        formGroup: undefined
      };
      const spy = component.openUpdateConfirmationModal = jasmine.createSpy();
      component.openUpdateConfirmationModal(null);
      component.saveHandler(mockEventObj);
      expect(spy).toHaveBeenCalled();

    });
  });

  describe('Save Handler method ->', () => {
    it('should call the saveLocationIdentifier method', () => {
      spyOn(component, "saveLocationIdentifier");
      const mockEventObj = {
        sender: {
          closeRow: () => { },
          editRow: () => { }
        },
        rowIndex: 0,
        isNew: true,
        formGroup: undefined
      };
      component.saveHandler(mockEventObj);
      expect(component.saveLocationIdentifier).toHaveBeenCalled();
    });
  });

  describe('validate Delete method ->', () => {
    it('should call the method locationIdentifier', () => {
      const spy = component.validateDelete = jasmine.createSpy();
      mockLocationIdentifierService.locationIdentifier = jasmine.createSpy().and.returnValue({
        then: (success, failure) => { success(""), failure({}) }
      }),
        component.validateDelete({ dataItem: locationIdentifierList.Value[0] })
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('validate Delete method ->', () => {
    it('should call the method', () => {
      const spy = component.validateDelete = jasmine.createSpy();
      component.validateDelete({});
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('validate Delete method success ->', () => {
    let locationIdentifier = { Description: '' };
    let res = { Value: [] }
    it('locationIdentifierWithLocationsSuccess method should call', () => {
      const spy = component.locationIdentifierWithLocationsSuccess = jasmine.createSpy();
      component.locationIdentifierWithLocationsSuccess(res, locationIdentifier);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('locationIdentifierWithLocationsSuccess method ->', () => {
    it('should call delete location itentifier', () => {
      component.hasDeleteAccess = true;
      const spy = component.openDeleteConfirmationModal = jasmine.createSpy();
      mockLocationIdentifierService.locationIdentifier = jasmine.createSpy().and.returnValue({
        then: (success, failure) => { failure({}), success("") }
      }),
        component.removeHandler({ dataItem: locationIdentifierList.Value[0] })
      expect(spy).toHaveBeenCalled();
    });
  });
  describe('locationIdentifierWithLocationsSuccess method ->', () => {
    it('should call locationIdentifier will not be deleted', () => {
      const spy = component.confirmDelete = jasmine.createSpy();
      const data = { 'Value': 'test' }
      component.locationIdentifierWithLocationsSuccess(data, locationIdentifierList.Value[0]);
      expect(component.deletingLocationIdentifier).toBe(false);
    });
  });
  describe('getLocationIdentifiers success ->', () => {
    it('should display toast error', () => {
      const data = locationIdentifierList
      component.sort = mockSort;
      component.locationIdentifiersGetSuccess(data);

      expect(component.locationIdentifiers).not.toEqual(null);
    });
  });
  describe('saveLocation identifier method ->', () => {
    it('should call the method', () => {
      const spy = component.savePostSuccess = jasmine.createSpy();
      mockLocationIdentifierService.save = jasmine.createSpy().and.returnValue({
        then: (success, failure) => { failure({}), success("") }
      }),
        component.saveLocationIdentifier();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('openDeleteConfirmationModal  method -> ', () => {
    it('should open confirmation modal', () => {
      const spy = spyOn(localize, 'getLocalizedString');
      spy.and.returnValue('Delete');
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue(mockDialogRef);

      component.openDeleteConfirmationModal(null);

      const data = component.confirmationModalData;
      const ref = mockConfirmationModalService.open({ data });

      expect(component.confirmationRef).toEqual(ref);
      expect(mockConfirmationModalService.open).toHaveBeenCalledWith({ data });
    });
  });
});