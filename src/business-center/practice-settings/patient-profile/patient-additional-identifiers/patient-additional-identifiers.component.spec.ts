import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogContainerService, DialogService } from '@progress/kendo-angular-dialog';
import { GridModule } from '@progress/kendo-angular-grid';
import { AppKendoGridComponent } from 'src/@shared/components/app-kendo-grid/app-kendo-grid.component';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import { PatientAdditionalIdentifiersComponent } from './patient-additional-identifiers.component';
import { SoarResponse } from 'src/@core/models/core/soar-response';
import { PatientAdditionalIdentifiers } from './patient-additional-identifier';
import { PatientAdditionalIdentifierService } from './patient-additional-identifier.service';
import { Observable } from 'rxjs';

let mockLocation;
let mockInjector;
let getDateObject;
let mockRouteParams;
let getPatAddIdentListResponse: SoarResponse<Array<PatientAdditionalIdentifiers>>;
let saveUpdatePatAddIdentListResponse: SoarResponse<PatientAdditionalIdentifiers>;
let mockPatientIdentifiers;
let mockDataItem;
let mocktempEvent;
//mockEventObject Used any type because AddEvent/EditEvent is too big to mock, sender method inside AddEvent/EditEvent contains more than 200 properties
let mockEventObject: any;
let mockLocalizeService;
let mockColumns: { field: string, title: string, width: string, hasValidations: boolean, validation: { message: string, maxLength: string } }[];
let mockConfirmationModalService;
// confirmationModal objects
let mockConfirmationModalSubscription;
let mockPatSecurityService;
let mockToastrFactory;
let mockReferenceService;
let mockAuthZ;
let mockPatientAdditionalIdentifierService;


describe('PatientAdditionalIdentifiersComponent', () => {
  let component: PatientAdditionalIdentifiersComponent;
  let fixture: ComponentFixture<PatientAdditionalIdentifiersComponent>;
  beforeEach(async () => {
    mockLocation = {
      path: () => '',
    };

    mockInjector = {
      get: jasmine.createSpy().and.returnValue({
        publish: jasmine.createSpy()
      })
    };

    getDateObject = (dateString: string) => {
      return new Date(dateString);
    }

    mockRouteParams = {};

    getPatAddIdentListResponse = {
      ExtendedStatusCode: 0,
      InvalidProperties: null,
      Value: [
        {
          DataTag: "AAAAAAAg6W8=",
          DateModified: getDateObject("2022-11-14T16:20:37.4412041"),
          Description: "Description_xwbnaslcia",
          IsSpecifiedList: true,
          IsSpecifiedListName: "Specified List",
          IsUsed: true,
          ListValues: [
            {
              DataTag: "AAAAAAAg6XB=",
              DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
              IsUsed: false,
              MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
              MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
              Order: 1,
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              Value: "Description2",
            },
            {
              DataTag: "AAAAAAAg6ZC=",
              DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
              IsUsed: false,
              MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
              MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
              Order: 2,
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              Value: "Description3",
            },
          ],
          MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        },
        {
          DataTag: "AAAAAAAg6W9=",
          DateModified: getDateObject("2022-12-23T16:15:40.3249394"),
          Description: "Description2",
          IsSpecifiedList: true,
          IsSpecifiedListName: "Specified List",
          IsUsed: false,
          ListValues: [
            {
              DataTag: "AAAAAAAg6XB=",
              DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
              IsUsed: false,
              MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
              MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
              Order: 1,
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              Value: "Description2",
            },
            {
              DataTag: "AAAAAAAg6ZC=",
              DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
              IsUsed: false,
              MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
              MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
              Order: 2,
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              Value: "Description3",
            },
          ],
          MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        }]
    }

    saveUpdatePatAddIdentListResponse = {
      ExtendedStatusCode: 0,
      InvalidProperties: null,
      Value:
      {
        DataTag: "AAAAAAAg6W9=",
        DateModified: getDateObject("2022-12-23T16:15:40.3249394"),
        Description: "Description2",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: false,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }
    }

    mockPatientIdentifiers = [
      {
        DataTag: "AAAAAAAg6W8=",
        DateModified: getDateObject("2022-11-14T16:20:37.4412041"),
        Description: "Description_xwbnaslcia",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: true,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      },
      {
        DataTag: "AAAAAAAg6W9=",
        DateModified: getDateObject("2022-12-23T16:15:40.3249394"),
        Description: "Description2",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: false,
        ListValues: [
          {
            DataTag: "AAAAAAAg6XB=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 1,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description2",
          },
          {
            DataTag: "AAAAAAAg6ZC=",
            DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
            IsUsed: false,
            MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
            MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
            Order: 2,
            UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
            Value: "Description3",
          },
        ],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      }
    ];

    mockDataItem = {
      DataTag: "AAAAAAAg6XA=",
      DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
      IsUsed: false,
      MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
      MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b0",
      Order: 2,
      UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
      Value: "Description_xwbnaslcia",
    };

    mocktempEvent = {
      action: "delete",
      dataItem: {
        DataTag: "AAAAAAAg6W8=",
        DateDeleted: null,
        DateModified: "2022-12-23T16:15:40.3249393",
        Description: "Description_xwbnaslcia",
        IsSpecifiedList: true,
        IsSpecifiedListName: "Specified List",
        IsUsed: false,
        ListValues: [{
          DataTag: "AAAAAAAg6XA=",
          DateDeleted: null,
          DateModified: "2022-12-23T16:15:40.3249393",
          IsUsed: false,
          MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
          MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
          Order: 1,
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
          Value: "Description_xwbnaslcia",
        }],
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
      },
      rowIndex: 0
    };

    //mockEventObject Used any type because AddEvent/EditEvent is too big to mock, sender method inside AddEvent/EditEvent contains more than 200 properties
    mockEventObject = {
      action: 'add',
      dataItem: mockDataItem,
      rowIndex: 0,
      isNew: true,
      sender: {
        closeRow: () => { },
        editRow: () => { },
        addRow: () => { }
      },
    };

    mockLocalizeService = {
      getLocalizedString: (text) => 'translated text'
    };

    mockColumns = [
      {
        field: "Description",
        title: mockLocalizeService.getLocalizedString("Patient Additional Identifier"),
        width: '700',
        hasValidations: false,
        validation: null
      },
      {
        field: "IsSpecifiedListName",
        title: " ",
        width: '150',
        hasValidations: false,
        validation: null
      }

    ];

    mockConfirmationModalService = {
      open: jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "confirm",
              subscribe: (success) => {
                success({ type: "confirm" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy(),
      }),
    };
    // confirmationModal objects
    mockConfirmationModalSubscription = {
      subscribe: jasmine.createSpy(),
      unsubscribe: jasmine.createSpy(),
      _subscriptions: jasmine.createSpy(),
      _parentOrParents: jasmine.createSpy(),
      close: jasmine.createSpy(),
    };

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error')
    };

    mockReferenceService = {
      get: () => new Promise((resolve, reject) => {

      }),
      entityNames: {},
      forceEntityExecution: jasmine.createSpy().and.returnValue([]),

    };

    mockAuthZ = {
      generateTitleMessage: () => { return 'Not Allowed' }
    };

    mockPatientAdditionalIdentifierService = {
      save: jasmine.createSpy(),
      update: jasmine.createSpy(),
      get: jasmine.createSpy(),
      getPatientAdditionalIdentifiers: jasmine.createSpy(),
      delete: jasmine.createSpy(),
      additionalIdentifiersWithPatients: jasmine.createSpy(),
    }

    await TestBed.configureTestingModule({
      declarations: [PatientAdditionalIdentifiersComponent, AppKendoGridComponent],
      imports: [TranslateModule.forRoot(), GridModule],
      providers: [DialogService, DialogContainerService, ChangeDetectorRef,
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'referenceDataService', useValue: mockReferenceService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'AuthZService', useValue: mockAuthZ },
        { provide: '$location', useValue: mockLocation },
        { provide: '$routeParams', useValue: mockRouteParams },
        { provide: '$injector', useValue: mockInjector },
        { provide: PatientAdditionalIdentifierService, useValue: mockPatientAdditionalIdentifierService },
        { provide: ConfirmationModalService, useValue: mockConfirmationModalService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAdditionalIdentifiersComponent);
    component = fixture.componentInstance;
    component.patientAdditionalIdentifiers = mockPatientIdentifiers;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call all methods under ngOnInit', () => {
      spyOn(component, 'getPageNavigation');
      spyOn(component, 'initKendoColumns');
      spyOn(component, 'getPatientAdditionalIdentifiers');
      spyOn(component, 'updatePatientAdditionalIdentifiers');
      component.ngOnInit();
      expect(component.initKendoColumns).toHaveBeenCalled();
      expect(component.getPageNavigation).toHaveBeenCalled();
      expect(component.loading).toBe(true);
      expect(component.getPatientAdditionalIdentifiers).toHaveBeenCalled();
      expect(component.updatePatientAdditionalIdentifiers).toHaveBeenCalled();
    });
  });

  describe('authViewAccess -> ', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the view amfa', () => {
      const viewAccess = component.authViewAccess();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-aipat-view');
      expect(viewAccess).toEqual(true);
    });
  });

  describe('authCreateAccess -> ', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the create amfa', () => {
      const viewAccess = component.authCreateAccess();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-aipat-manage');
      expect(viewAccess).toEqual(true);
    });
  });

  describe('authDeleteAccess -> ', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the delete amfa', () => {
      const viewAccess = component.authDeleteAccess();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-aipat-manage');
      expect(viewAccess).toEqual(true);
    });
  });

  describe('authEditAccess -> ', () => {
    it('should call patSecurityService.IsAuthorizedByAbbreviation with the edit amfa', () => {
      const viewAccess = component.authEditAccess();
      expect(mockPatSecurityService.IsAuthorizedByAbbreviation).toHaveBeenCalledWith('soar-biz-aipat-manage');
      expect(viewAccess).toEqual(true);
    });
  });

  describe('authorization success ->', function () {
    it('should set acess', function () {
      component.authAccess();
      expect(component.hasViewAccess).toBe(true);
      expect(component.hasCreateAccess).toBe(true);
      expect(component.hasDeleteAccess).toBe(true);
      expect(component.hasEditAccess).toBe(true);
    });
  });

  describe('getPatientAdditionalIdentifiers ->', () => {
    it('should call patientAdditionalIdGetSuccess', () => {
      spyOn(component, 'updatePatientAdditionalIdentifiers');
      component.patientAdditionalIdGetSuccess({ Value: mockPatientIdentifiers });
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.updatePatientAdditionalIdentifiers).toHaveBeenCalled();
        expect(component.loading).toBe(false);
      });
    });

    it('should call patientAdditionalIdGetFailure', () => {
      component.patientAdditionalIdGetFailure();
      expect(component.loading).toBe(false);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('should call the getPatientAdditionalIdentifiers method -> ', function () {
    it('should get the boolean value', () => {
      component.getPatientAdditionalIdentifiers();
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        expect(component.patientAdditionalIdGetSuccess(getPatAddIdentListResponse)).toHaveBeenCalled();
        expect(component.loading).toBe(false);
      });
    });
  });

  describe('updatePatientAdditionalIdentifiers ->', () => {
    it('should check updateIsSpecifiedList & updateDeleteRightsViewModel on updateEditRightsViewModel', () => {
      spyOn(component, 'updateDeleteRightsViewModel');
      spyOn(component, 'updateEditRightsViewModel');
      spyOn(component, 'updateIsSpecifiedList');
      component.patientAdditionalIdentifiers = mockPatientIdentifiers;
      component.updatePatientAdditionalIdentifiers();
      expect(component.updateIsSpecifiedList).toHaveBeenCalled();
      expect(component.updateDeleteRightsViewModel).toHaveBeenCalled();
      expect(component.updateEditRightsViewModel).toHaveBeenCalled();
    });

    it('should set disableDelete is true for unautherized login', () => {
      component.hasDeleteAccess = false;
      component.patientAdditionalIdentifiers = mockPatientIdentifiers;
      component.updatePatientAdditionalIdentifiers();
      expect(component.patientAdditionalIdentifiers[0]["disableDelete"]).toBe(true);
      expect(component.patientAdditionalIdentifiers[1]["disableDelete"]).toBe(true);
    });

    it('should set disableDelete is false for autherized login', () => {
      component.hasDeleteAccess = true;
      component.patientAdditionalIdentifiers = mockPatientIdentifiers;
      component.updatePatientAdditionalIdentifiers();
      expect(component.patientAdditionalIdentifiers[0]["disableDelete"]).toBe(true);
      // NG15CLEANUP IsUsed is false so this is never set.
      expect(component.patientAdditionalIdentifiers[1]["disableDelete"]).toBeUndefined();
    });

    it('should set disableEdit is true for unautherized login', () => {
      component.hasEditAccess = false;
      component.patientAdditionalIdentifiers = mockPatientIdentifiers;
      component.updatePatientAdditionalIdentifiers();
      expect(component.patientAdditionalIdentifiers[0]["disableEdit"]).toBe(true);
      expect(component.patientAdditionalIdentifiers[1]["disableEdit"]).toBe(true);
      expect(component.patientAdditionalIdentifiers[0]["editTooltipMessage"]).toEqual("Not Allowed");
      expect(component.patientAdditionalIdentifiers[1]["editTooltipMessage"]).toEqual("Not Allowed");
    });

    it('should set disableEdit is false for autherized login', () => {
      component.hasEditAccess = true;
      component.patientAdditionalIdentifiers = mockPatientIdentifiers;
      component.updatePatientAdditionalIdentifiers();
      // NG15CLEANUP Never set if hasEditAccess is true.
      expect(component.patientAdditionalIdentifiers[0]["disableEdit"]).toBeUndefined();
      expect(component.patientAdditionalIdentifiers[1]["disableEdit"]).toBeUndefined();
    });
  });

  describe('authAccess ->', () => {
    it('should display toast error msg and redirect to home page if not unAuthorized', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(false);
      component.authAccess();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('should set authAccess for CRUD operations', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy().and.returnValue(true);
      component.authAccess();
      expect(component.hasCreateAccess).toBe(true);
      expect(component.hasEditAccess).toBe(true);
      expect(component.hasDeleteAccess).toBe(true);
    });
  });

  describe("initKendoColumns method -> ", () => {
    it('should initialize kendo columns', () => {
      component.initKendoColumns();
      expect(component.columns).toEqual(mockColumns);
    });
  });

  describe('broadcastChannel ->', () => {
    it('should call broadcastChannel method', () => {
      component.broadcastChannel('additionalIdentifiers', { mode: 'add', data: mockPatientIdentifiers });
      expect(mockInjector.get).toHaveBeenCalled();
    });
  });

  describe('deletePatientAdditionalIdentifiers ->', () => {
    it('should open dialog confirmation on delete button click', () => {
      let event = mocktempEvent
      spyOn(component, 'openDeleteConfirmationModal');
      component.deletePatientAdditionalIdentifiers(event);
      expect(component.openDeleteConfirmationModal).toHaveBeenCalled()
    });
  });

  describe('openDeleteConfirmationModal ->', () => {
    it('should open openDeleteConfirmationModal', () => {
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      component.openDeleteConfirmationModal(mockPatientIdentifiers[0]);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      component.openDeleteConfirmationModal(mockPatientIdentifiers[0]);
    });
  });

  describe('editPatientAdditionalIdentifiers ->', () => {
    it('should be Edit Addtional Identifiers In Pop-up funcationality', () => {
      spyOn(component, 'getExistingListItemsName')
      component.closeDialog = false;
      component.isEditIdentifierMode = true;
      component.ifIdentifierUpdated = false;
      let tempEvent = mocktempEvent;
      component.editPatientAdditionalIdentifiers(tempEvent)
      //expect(component.patientAdditionalIdentifier).toBe(tempEvent.dataItem)
      expect(component.getExistingListItemsName).toHaveBeenCalled()
    });
  });

  describe("addNewPatientAdditionalIdentifiers -> ", () => {
    it('should be add new patient additional identifiers', () => {
      spyOn(component, 'getExistingListItemsName')
      component.closeDialog = false;
      component.ifIdentifierUpdated = false;
      component.isEditIdentifierMode = false
      component.addNewPatientAdditionalIdentifiers();
      expect(component.getExistingListItemsName).toHaveBeenCalled();
    });
  });

  describe('removeListItem ->', () => {
    it('should open removeListItem', () => {
      spyOn(component, 'removeIdentifierListItem')
      component.hasDeleteAccess = true
      let tempEvent = mocktempEvent
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      component.removeListItem(tempEvent);
    });
  });

  describe("enterKeyEvent -> ", () => {
    it('should be click enter button and call enterKeyEvent', () => {
      const val = component.enterKeyEvent();
      expect(val).toEqual(false);
    });
  });


  describe("disableSaveIdentifierButton -> ", () => {
    it('should return true if ifIdentifierUpdated is false and length of patientAdditionalIdentifier?.Description is 0', () => {
      component.patientAdditionalIdentifier.Description = ''
      const val = component.disableSaveIdentifierButton();
      expect(val).toEqual(true);
    });

    it('should return false if ifIdentifierUpdated is true and length of patientAdditionalIdentifier?.Description is greater than 0', () => {
      component.ifIdentifierUpdated = true;
      component.patientAdditionalIdentifier.Description = 'test';
      const val = component.disableSaveIdentifierButton();
      expect(val).toEqual(false);
    });
  });

  describe('saveIdentifier method ->', () => {
    it('should call the method', () => {
      spyOn(component, 'saveIdentifierSuccess')
      mockPatientAdditionalIdentifierService.save = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<Array<PatientAdditionalIdentifiers>>>());
      component.saveIdentifier();
      expect(mockPatientAdditionalIdentifierService.save).toHaveBeenCalled();
    });
  });

  describe('saveIdentifie success ->', () => {
    it('should populate response', () => {
      spyOn(component, 'getPatientAdditionalIdentifiers')
      component.saveIdentifierSuccess(saveUpdatePatAddIdentListResponse.Value);
      expect(mockToastrFactory.success).toHaveBeenCalled();
      expect(component.closeDialog).toBe(true)
      expect(component.getPatientAdditionalIdentifiers).toHaveBeenCalled();
    });
  });


  describe('confirmCancelIdentifierChanges ->', () => {
    it('should open confirmCancelIdentifierChanges', () => {
      component.ifIdentifierUpdated = true
      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: () => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      component.confirmCancelIdentifierChanges();
    });

    it('should call confirmCancelIdentifierChanges if ifIdentifierUpdated is false', () => {
      spyOn(component, 'cancelIdentifierChanges');
      component.ifIdentifierUpdated = false;
      component.confirmCancelIdentifierChanges();
      expect(component.cancelIdentifierChanges).toHaveBeenCalled();
    });
  });

  //TODO This is being pending from the time of Migration.
  describe("addListItem -> ", () => {
    it('should call closeEditor method', () => {
      spyOn(component, 'closeEditor');
      const event = mockEventObject;
      component.showReOrderListButtons = true
      component.identifierListItemValuesValidation = ''
      component.addListItem(event);
    });
  });

  describe('changeAnswerType method ->', () => {
    it('should call onUpdateIdentifier', () => {
      spyOn(component, 'onUpdateIdentifier')
      component.changeAnswerType(mockPatientIdentifiers[0]);
      expect(component.onUpdateIdentifier).toHaveBeenCalled();
    });
  });

  describe('cancelIdentifierChanges  method ->', () => {
    it('should call getPatientAdditionalIdentifiers and set closeDialog true', () => {
      spyOn(component, 'getPatientAdditionalIdentifiers')
      component.closeDialog = true
      component.cancelIdentifierChanges();
      expect(component.getPatientAdditionalIdentifiers).toHaveBeenCalled();
    });

    it('should be set ifIdentifierUpdated and getPatientAdditionalIdentifiers', () => {
      spyOn(component, 'getPatientAdditionalIdentifiers')
      component.ifIdentifierUpdated = true
      const data = component.confirmationModalData;
      component.saveIdentifiersConfirmationRef = mockConfirmationModalService.open({ data });
      component.cancelIdentifierChanges();
      expect(component.getPatientAdditionalIdentifiers).toHaveBeenCalled();
    });


  });

  describe('updateIdentifierSuccess ->', () => {
    it('should show success toast message', () => {
      component.updateIdentifierSuccess(mockPatientIdentifiers, saveUpdatePatAddIdentListResponse.Value);
      expect(mockToastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('updateIdentifierFailure ->', () => {
    it('should show success toast message', () => {
      let errorObj = {
        data: {
          InvalidProperties: [{
            PropertyName: "patientAdditionalIdentifier",
            ValidationMessage: "Not Allowed"
          }]
        }
      };
      component.updateIdentifierFailure(errorObj);
      component.closeDialog = true;
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('getValueFieldValidation ->', () => {
    it('should set identifierListItemValuesValidation value to "Value is required."', () => {
      const value = ''
      component.getValueFieldValidation(value);
      expect(component.identifierListItemValuesValidation).toBe('translated text')
    });

    it('should be Value initilize value .', () => {
      const value = 'test'
      component.getValueFieldValidation(value);
      expect(component.identifierListItemValuesValidation).toBe('')
    });

    it('should be Value must be 1 to 24 characters.', () => {
      const value = '12345678901112131415161718192021223'
      component.getValueFieldValidation(value);
      expect(component.identifierListItemValuesValidation).toBe('translated text')
    });
  });

  describe('openPopUpModal ->', () => {
    it('should open openPopUpModal', () => {

      component.confirmationModalSubscription = Object.assign(mockConfirmationModalSubscription);
      mockConfirmationModalService.open = jasmine.createSpy().and.returnValue({
        events: {
          pipe: (event) => {
            return {
              type: "close",
              subscribe: (success) => {
                success({ type: "close" })
              },
              filter: (f) => { return f }
            }
          }
        },
        close: jasmine.createSpy()
      });
      component.openPopUpModal();
    });
  });

  describe('opneSaveConfirmPopUp ->', () => {
    it('should check isEditIdentifierMode is false and ifIdentifierisDuplicated, listValueIsEmpty is false', () => {
      spyOn(component, 'saveUpdateIdentifier');
      component.isEditIdentifierMode = false;
      component.ifIdentifierisDuplicated = false;
      component.listValueIsEmpty = false;
      component.opneSaveConfirmPopUp();
      expect(component.saveUpdateIdentifier).toHaveBeenCalled();
    });

    it('should check isEditIdentifierMode is true', () => {
      spyOn(component, 'openPopUpModal');
      component.isEditIdentifierMode = true;
      component.opneSaveConfirmPopUp();
      expect(component.openPopUpModal).toHaveBeenCalled();
    });

    it('should check ifIdentifierisDuplicated is true', () => {
      spyOn(component, 'openPopUpModal');
      component.AdditionalIdentifierName = ['Description2']
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0]
      component.ifIdentifierisDuplicated = true;
      component.isEditIdentifierMode = true;
      component.opneSaveConfirmPopUp();
      expect(component.openPopUpModal).toHaveBeenCalled();

    });

    it('should check listValueIsEmpty is true', () => {
      spyOn(component, 'openPopUpModal');
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0]
      component.patientAdditionalIdentifier.ListValues.length = 0
      component.listValueIsEmpty = true;
      component.opneSaveConfirmPopUp();
      expect(component.openPopUpModal).toHaveBeenCalled();
    });
  });


  describe('updateIdentifier ->', () => {
    it('should call updateIdentifierSuccess', () => {
      spyOn(component, 'updateIdentifierSuccess');
      mockPatientAdditionalIdentifierService.update = jasmine.createSpy().and.returnValue(new Observable<SoarResponse<Array<PatientAdditionalIdentifiers>>>());
      component.updateIdentifier();
      expect(mockPatientAdditionalIdentifierService.update).toHaveBeenCalled();
    });
  });

  describe('onUpdateIdentifier ->', () => {
    it('should be isEditIdentifierMode is true and call disableSaveIdentifierButton method.', () => {
      spyOn(component, 'disableSaveIdentifierButton');
      component.isEditIdentifierMode = true;
      component.onUpdateIdentifier();
      expect(component.disableSaveIdentifierButton).toHaveBeenCalled();
    });

    it('should be patientAdditionalIdentifier.Description and previousPatientAdditionalIdentifierValue.Description not equal.', () => {
      spyOn(component, 'disableSaveIdentifierButton');
      component.isEditIdentifierMode = true;
      component.patientAdditionalIdentifier.Description = 'test';
      component.previousPatientAdditionalIdentifierValue.Description = '';
      component.onUpdateIdentifier();
      expect(component.ifIdentifierUpdated).toBe(true);
    });

    it('should be isEditIdentifierMode is true and call disableSaveIdentifierButton method.', () => {
      spyOn(component, 'disableSaveIdentifierButton');
      component.isEditIdentifierMode = false;
      component.onUpdateIdentifier();
      expect(component.ifIdentifierUpdated).toBe(true);
    });
  });

  describe('getExistingListItemsName ->', () => {
    it('should call getExistingListItemsName', () => {
      component.patientAdditionalIdentifier.ListValues = [];
      component.patientAdditionalIdentifiers = [];
      component.getExistingListItemsName();
      expect(component.existingListItems).toEqual([]);
      expect(component.AdditionalIdentifierName).toEqual([]);
    });
  });


  describe('onUpdateIdentifier ->', () => {
    it('should be isEditIdentifierMode is true and call disableSaveIdentifierButton method.', () => {
      spyOn(component, 'disableSaveIdentifierButton');
      component.isEditIdentifierMode = true;
      component.onUpdateIdentifier();
      expect(component.disableSaveIdentifierButton).toHaveBeenCalled();
    });
  });

  describe('saveUpdateIdentifier  method ->', () => {
    it('should check identifier update is true or false', () => {
      spyOn(component, 'updateIdentifier');
      spyOn(component, 'saveIdentifier');
      component.ifIdentifierUpdated = false;
      component.saveUpdateIdentifier();
      expect(component.saveIdentifier).toHaveBeenCalled();
      expect(component.updateIdentifier).not.toHaveBeenCalled();
    });

    it('should check isEditIdentifierMode is false and ifIdentifierisDuplicated, listValueIsEmpty is true', () => {
      spyOn(component, 'updateIdentifier');
      component.isEditIdentifierMode = true;
      component.ifIdentifierisDuplicated = false;
      component.listValueIsEmpty = false;
      component.saveUpdateIdentifier();
      expect(component.updateIdentifier).toHaveBeenCalled();
    });
  });


  describe('editListItem ->', () => {
    it('should call closeEditor', () => {
      spyOn(component, 'closeEditor');
      const eventObj = mockEventObject;
      eventObj.dataItem = {
        DataTag: "AAAAAAAg6XA=",
        DateDeleted: null,
        DateModified: "2022-12-23T16:15:40.3249393",
        IsUsed: false,
        MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
        MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
        Order: 1,
        UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
        Value: "Description_xwbnaslcia",
      },
        component.editListItem(eventObj);
      component.showReOrderListButtons = true;
      component.identifierListItemValuesValidation = '';
      component.previousIdentifiersListItemValue = eventObj.dataItem.Value;
      component.previousMasterPatientIdentifierListItemsId = eventObj.dataItem.MasterPatientIdentifierListItemsId;
      expect(component.closeEditor).toHaveBeenCalledWith(eventObj.sender);
      expect(component.editedRowIndex).toBe(eventObj.rowIndex);
      expect(component.listItemformGroup).toBeDefined();
    });
  });

  describe('sortSpecifiedList ->', () => {
    it('should sort patientAdditionalIdentifier array', () => {
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0];
      component.sortSpecifiedList();
      expect(component.patientAdditionalIdentifier.ListValues).toEqual(mockPatientIdentifiers[0].ListValues);
    });
  });

  describe('closeEditor method ->', () => {
    it('should close grid editor', () => {
      const grid: any = {
        closeRow: () => { },
      };
      component.closeEditor(grid, 0);
      expect(component.editedRowIndex).toBe(undefined);
      expect(component.listItemformGroup).toBe(undefined);
    });
  });

  describe('updateDeleteRightsViewModel ->', () => {
    it('should set delete message', () => {
      const patientAdditionalIdentifiers = component.updateDeleteRightsViewModel(mockPatientIdentifiers[0]);
      expect(mockPatientIdentifiers[0]).toEqual(patientAdditionalIdentifiers);
    });
  });

  describe('cancelListItem ->', () => {
    it('should set showReOrderListButtons false', () => {
      const event = mockEventObject;
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0];
      component.previousIdentifiersListItemValue = event.dataItem.Value;
      component.cancelListItem(event);
      component.patientAdditionalIdentifier.ListValues.forEach((item) => {
        expect(item.MasterPatientIdentifierId).toEqual(event.dataItem.MasterPatientIdentifierId)
      });
    });
  });

  describe('moveUpListItem ->', () => {
    it('should be dataItem.Order langth > 1 ', () => {
      spyOn(component, 'sortSpecifiedList')
      const dataItem = mockDataItem
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0]
      component.moveUpListItem(dataItem);
      expect(component.ifIdentifierUpdated).toBe(true);
      expect(component.sortSpecifiedList).toHaveBeenCalled();
    });

    it('should be dataItem.Order langth < 1', () => {
      spyOn(component, 'sortSpecifiedList')
      const event = mockDataItem
      event.Order = 0
      component.moveUpListItem(event);
      expect(component.sortSpecifiedList).toHaveBeenCalled();
    });
  });

  describe('moveDownListItem ->', () => {
    it('should sort the list items', () => {
      spyOn(component, 'sortSpecifiedList');

      const mockDatapatientAdditionalIdentifier = [
        {
          DataTag: "AAAAAAAg6W8=",
          DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
          Description: "Description_xwbnaslcia",
          IsSpecifiedList: true,
          IsSpecifiedListName: "Specified List",
          IsUsed: true,
          ListValues: [
            {
              DataTag: "AAAAAAAg6XB=",
              DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
              IsUsed: false,
              MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
              MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b0",
              Order: 1,
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              Value: "Description2",
            },
            {
              DataTag: "AAAAAAAg6ZC=",
              DateModified: getDateObject("2022-12-23T16:15:40.3249393"),
              IsUsed: false,
              MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
              MasterPatientIdentifierListItemsId: "76ebe2d2-5218-438e-8e12-5611790e1b02",
              Order: 2,
              UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf",
              Value: "Description3",
            },
          ],
          MasterPatientIdentifierId: "bc0deb98-e761-45e1-9b68-dfcddacee5a3",
          UserModified: "a162c864-8f50-4e84-8942-7194bc8070cf"
        },
      ];
      const dataItem = mockDatapatientAdditionalIdentifier[0].ListValues[0];
      component.patientAdditionalIdentifier = mockDatapatientAdditionalIdentifier[0];
      component.moveDownListItem(dataItem);
      expect(component.ifIdentifierUpdated).toBe(true);
      expect(component.sortSpecifiedList).toHaveBeenCalled();
    });

    it('should be dataItem.Order langth < 1', () => {
      spyOn(component, 'sortSpecifiedList');
      const dataItem = mockDataItem;
      dataItem.Order = 0
      component.moveUpListItem(dataItem);
      expect(component.sortSpecifiedList).toHaveBeenCalled();
    });
  });

  describe('saveListItem ->', () => {
    it('should call getExistingListItemsName and set ifIdentifierUpdated true', () => {
      spyOn(component, 'getExistingListItemsName');
      spyOn(component, 'sortSpecifiedList');
      const event = mockEventObject;
      component.identifierListItemValuesValidation = '';
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0];
      component.saveListItem(event);
      expect(component.ifIdentifierUpdated).toBe(true);
      expect(component.showReOrderListButtons).toBe(false);
      expect(component.sortSpecifiedList).toHaveBeenCalled();
      expect(component.getExistingListItemsName).toHaveBeenCalled();
    });

    it('should save updated item', () => {
      spyOn(component, 'getExistingListItemsName');
      const event = mockEventObject;
      event.isNew = false;
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0];
      component.saveListItem(event);
      expect(component.ifIdentifierUpdated).toBe(true);
      expect(component.getExistingListItemsName).toHaveBeenCalled();
    });
  });

  describe('removeIdentifierListItem ->', () => {
    it('should call getExistingListItemsName', () => {
      spyOn(component, 'getExistingListItemsName');
      let event = mockDataItem;
      const data = component.confirmationModalData;
      component.confirmationRef = mockConfirmationModalService.open({ data });
      component.patientAdditionalIdentifier = mockPatientIdentifiers[0];
      component.removeIdentifierListItem(event);
      expect(component.getExistingListItemsName).toHaveBeenCalled();
    });
  });
});
