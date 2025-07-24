import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BankAccountsComponent } from './bank-accounts.component';
import {
  DialogContainerService,
  DialogRef,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, TemplateRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BankAccountService } from './bank-account.service';
import { SortDescriptor } from '@progress/kendo-data-query';
import { NgTemplateOutlet } from '@angular/common';
import { ConfirmationModalService } from 'src/@shared/components/confirmation-modal/confirmation-modal.service';
import moment from 'moment';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { locationList } from './bank-account';
import { LocationTimeService } from 'src/practices/common/providers';

describe('BankAccountsComponent', () => {
  let component: BankAccountsComponent;
  let fixture: ComponentFixture<BankAccountsComponent>;
  let dialogservice: DialogService;
  let dialogRef: DialogRef;
  let templateElement: TemplateRef<NgTemplateOutlet>;
  const mockLocation = {
    path: () => '',
  };

  const mockCancelConformationModal = {
    header: 'header',
    message: 'message',
    confirm: 'confirm',
    cancel: 'cancel',
    height: 233,
    width: 233,
  };
  const mockToastrFactory = {
    success: jasmine.createSpy('toastrFactory.success'),
    error: jasmine.createSpy('toastrFactory.error'),
  };
  const mockPatSecurityService = {
    IsAuthorizedByAbbreviation: jasmine
      .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
      .and.returnValue(true),
    generateMessage: jasmine.createSpy('patSecurityService.generateMessage'),
  };

  const mockBankAccocuntLocationIds = ['1', '2'];
  const bankAccount = {
    nameLine1: 'nameLine1',
    inactiveDate: 'inactiveDate',
    locationId: 'locationId',
    text: 'text',
    value: 3434,
  };

  const mockBankAccocuntIds = [234234, 23423, 234234, 23423];

  const mockEvent = {
    target: { checked: true },
  };
  const mockSoarConfig = {};

  const mocklocationsList: Array<locationList> = [
    {
      nameLine1: 'Test location 1',
      locationId: '1',
      inactiveDate: '',
      sortOrder: 1,
      text: 'Test location 1',
      value: 1,
      subcategory: 'Active',
      deactivationTimeUtc: '2023-01-20T00:00:00+00:00',
    },
    {
      nameLine1: 'Test location 2',
      locationId: '2',
      inactiveDate: '20/04/2022',
      sortOrder: 2,
      text: 'Test location 2',
      value: 1,
      subcategory: 'Inactive',
      deactivationTimeUtc: '2023-01-20T00:00:00+00:00',
    },
  ];
  const mockSort: SortDescriptor[] = [
    {
      field: 'Name',
      dir: 'asc',
    },
  ];
  const mockBankAccounts = [
    {
      Name: '123456789',
      BankAccountId: 2,
      BankLocations: [5402716],
      Locations: 'Alaska Dental Tests',
      Institution: 'abcd',
      Description: 'Active-\nabcdefghijklmnopqrstuvwxyz',
      RoutingNumber: '111111111',
      AccountNumber: '1122334455',
      DataTag: 'AAAAAAAevRc=',
      IsActive: true,
    },
    {
      Name: 'qwerty',
      BankAccountId: 5,
      BankLocations: [5365740, 5378673],
      Locations: 'Dental Test2, Aston Villa',
      Institution: 'Institution',
      Description: 'Description',
      RoutingNumber: '211212112',
      AccountNumber: '1234567898765',
      DataTag: 'AAAAAAAevRo=',
      IsActive: true,
    },
  ];
  const mockresponse = {
    ExtendedStatusCode: null,
    Value: {
      PageCount: 50,
      CurrentPage: 0,
      FilterCriteria: {
        InActive: false,
      },
      SortCriteria: {
        Name: 0,
        Locations: 0,
        Institution: 0,
        Description: 0,
        AccountNumber: 0,
        RoutingNumber: 0,
      },
      TotalCount: 3,
      Rows: [
        {
          Name: '123456789',
          BankAccountId: 2,
          BankLocations: [5402716],
          Locations: 'Alaska Dental Tests',
          Institution: 'abcd',
          Description: 'Active-\nabcdefghijklmnopqrstuvwxyz',
          RoutingNumber: '111111111',
          AccountNumber: '1122334455',
          DataTag: 'AAAAAAAevRc=',
          IsActive: true,
        },
        {
          Name: 'qwerty',
          BankAccountId: 5,
          BankLocations: [5365740, 5378673],
          Locations: 'Dental Test2, Aston Villa',
          Institution: 'Institution',
          Description: 'Description',
          RoutingNumber: '211212112',
          AccountNumber: '1234567898765',
          DataTag: 'AAAAAAAevRo=',
          IsActive: true,
        },
      ],
    },
    Count: null,
    InvalidProperties: null,
  };
  const mockBankAccountService = {
    getBankAccounts: a => of({ data: mockresponse }),
  };
  const mockHttpService = {
    put: a => of({ data: mockresponse }),
    post: a => of({ data: mockresponse }),
  };

  const mockDialogRef = {
    close: () => of({}),
    open: dialogResult => {},
    content: {
      instance: {
        title: '',
      },
    },
  };
  const mockLocalizeService = {
    getLocalizedString: () => 'translated text',
  };
  const mockAuthZ = {
    generateTitleMessage: () => {
      return 'Not Allowed';
    },
  };

  const mockGetLocationServices = {
    get: jasmine.createSpy().and.callFake(array => {
      return {
        $promise: {
          then(res) {},
        },
      };
    }),
  };

  const mocklocationTimeService = {
    getTimeZoneAbbr: jasmine.createSpy().and.returnValue('CDT'),
    convertDateTZ: jasmine.createSpy()
  }

  const mockConfirmationModalService = {
    open: jasmine.createSpy().and.returnValue({
      events: {
        pipe: jasmine
          .createSpy()
          .and.returnValue({ subscribe: jasmine.createSpy() }),
      },
      subscribe: jasmine.createSpy(),
      closed: jasmine.createSpy(),
    }),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BankAccountsComponent],
      imports: [TranslateModule.forRoot(), ReactiveFormsModule, FormsModule],
      providers: [
        HttpClientModule,
        FormBuilder,
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: '$location', useValue: mockLocation },
        { provide: 'AuthZService', useValue: mockAuthZ },
        { provide: LocationTimeService, useValue: mocklocationTimeService },
        { provide: 'LocationServices', useValue: mockGetLocationServices },
        { provide: 'SoarConfig', useValue: mockSoarConfig },
        { provide: HttpClient, useValue: mockHttpService },
        { provide: BankAccountService, useValue: mockBankAccountService },
        DialogService,
        DialogContainerService,
        {
          provide: ConfirmationModalService,
          useValue: mockConfirmationModalService,
        },
        { provide: DialogRef, useValue: mockDialogRef },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAccountsComponent);
    component = fixture.componentInstance;
    dialogservice = TestBed.inject(DialogService);
    dialogRef = TestBed.inject(DialogRef);
    spyOn(dialogservice, 'open').and.returnValue({
      content: templateElement,
      result: of({ primary: true }),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  describe('ngOnInit -->', () => {
    it('should call all methods under ngOnInit', () => {
      spyOn(component, 'getPageNavigation');
      spyOn(component, 'authAccess');
      spyOn(component, 'initKendoColumns');
      spyOn(component, 'getBankAccounts');
      component.ngOnInit();
      expect(component.authAccess).toHaveBeenCalled();
      expect(component.getPageNavigation).toHaveBeenCalled();
      expect(component.initKendoColumns).toHaveBeenCalled();
      expect(component.getBankAccounts).toHaveBeenCalled();
    });

    it('should call the page navigation method ', () => {
      component.getPageNavigation = jasmine.createSpy();
      component.ngOnInit();
      expect(component.getPageNavigation).toHaveBeenCalled();
    });
  });

  describe('authAccess -->', () => {
    it('should display toast error msg and redirect to home page if not unAuthorized', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy()
        .and.returnValue(false);
      component.authAccess();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
    it('should set authAccess for CRUD operations', () => {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy()
        .and.returnValue(true);
      component.authAccess();
      expect(component.hasViewAccess).toBe(true);
      expect(component.hasCreateAccess).toBe(true);
      expect(component.hasEditAccess).toBe(true);
    });
  });
  it('should Call getBankAccounts method', () => {
    component.getBankAccounts(component.request);
    expect(component.loading).toEqual(false);
    expect(component.bankAccounts).not.toBeUndefined();
  });

  describe('sortChange method -> ', () => {
    it('should sort the grid data', () => {
      component.bankAccounts = mockBankAccounts;
      component.sortChange(mockSort);
      expect(component.sort).toEqual(mockSort);
    });

    describe('onCheckChanged  method ->', () => {
      it('should call the method', () => {
        spyOn(component, 'getBankAccounts');
        component.onCheckChanged(mockEvent);
        expect(component.request.FilterCriteria.InActive).toEqual(true);
        expect(component.getBankAccounts).toHaveBeenCalled();
      });
    });

    describe('updateGroupTypesAccessRights  method ->', () => {
      it('should call the method updateEditRightsViewModel', () => {
        spyOn(component, 'updateEditRightsViewModel');
        component.bankAccounts = mockBankAccounts;
        component.updateGroupTypesAccessRights();
        expect(component.updateEditRightsViewModel).toHaveBeenCalled();
      });
    });

    describe('updateEditRightsViewModel method ->', () => {
      it('should call the method updateEditRightsViewModel', () => {
        spyOn(mockAuthZ, 'generateTitleMessage');
        const bankAcc = mockBankAccounts[0];
        component.hasEditAccess = false;
        component.updateEditRightsViewModel(bankAcc);
        expect(mockAuthZ.generateTitleMessage).toHaveBeenCalled();
      });
    });
  });
  it('should Call openDialog method', () => {
    dialogservice.open = jasmine.createSpy().and.returnValue(mockDialogRef);
    component.openDialog();
    expect(dialogservice.open).toHaveBeenCalled();
  });
  describe('Bank accocunt Add/Edit Pop-up -> ', () => {
    it('on edit bank accout pop-up shoud open', () => {
      const event = { dataItem: { BankLocations: mockBankAccocuntIds } };
      component.openDialog = jasmine.createSpy();
      component.editHandler(event);
      expect(component.openDialog).toHaveBeenCalled();
    });

    it('on edit bank accout pop-up shoud open', () => {
      const event = { dataItem: { BankLocations: mockBankAccocuntIds } };
      component.locationsList = mocklocationsList;
      component.openDialog = jasmine.createSpy();
      component.editHandler(event);
      expect(component.openDialog).toHaveBeenCalled();
    });

    it('on Add bank accout pop-up shoud open', () => {
      const event = { dataItem: { BankLocations: mockBankAccocuntIds } };
      component.openDialog = jasmine.createSpy();
      component.addHandler(event);
      expect(component.openDialog).toHaveBeenCalled();
    });

    it('on call saveSuccess', () => {
      component.getBankAccounts = jasmine.createSpy();
      component.closeModal = jasmine.createSpy();
      component.saveSuccess();
      expect(component.getBankAccounts).toHaveBeenCalled();
      expect(component.closeModal).toHaveBeenCalled();
      expect(mockToastrFactory.success).toHaveBeenCalled();
    });

    it('on call editSuccess', () => {
      component.getBankAccounts = jasmine.createSpy();
      component.closeModal = jasmine.createSpy();
      component.editSuccess();
      expect(mockToastrFactory.success).toHaveBeenCalled();
      expect(component.getBankAccounts).toHaveBeenCalled();
      expect(component.closeModal).toHaveBeenCalled();
    });

    it('on call saveEditFailure', () => {
      const result = {
        error: {
          InvalidProperties: [
            {
              PropertyName: 'location',
              ValidationMessage: 'this field is required',
            },
          ],
        },
      };
      component.saveEditFailure(result);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('on call saveEditFailure', () => {
      const result = {
        error: { InvalidProperties: [], Message: 'this field is required' },
      };
      component.saveEditFailure(result);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('on call saveEditFailure', () => {
      const result = { error: { InvalidProperties: [] } };
      component.saveEditFailure(result);
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });

    it('on call getLocation', () => {
      component.getLocation();
      expect(mockGetLocationServices.get).toHaveBeenCalled();
    });

    it('on call GetLocationSuccess', () => {
      component.groupLocations = jasmine.createSpy();
      component.GetLocationSuccess('');
      expect(component.groupLocations).toHaveBeenCalled();
    });

    it('on call groupLocations,locationsList should not undefied', () => {
      component.groupLocations(mocklocationsList);
      expect(component.locationsList).not.toBeUndefined();
    });

    it('on call groupLocations, setLocationsforForm should call', () => {
      component.setLocationsforForm = jasmine.createSpy();
      component.groupLocations(mocklocationsList);
      expect(component.setLocationsforForm).toHaveBeenCalled();
    });

    it('on call setLocationsforForm, bankAccountLoctionsIdsPendingToLoad should call', () => {
      component.bankAccountLoctionsIdsPendingToLoad =
        mockBankAccocuntLocationIds;
      component.selectedLocationsList = [];
      component.locationsList = mocklocationsList;
      component.setLocationsforForm();
      expect(component.selectedLocationsList).not.toBeUndefined();
    });

    it('on call groupLocations, sortByColumn should call', () => {
      component.sortByColumn = jasmine.createSpy();
      component.groupLocations(mocklocationsList);
      expect(component.sortByColumn).toHaveBeenCalled();
    });

    it('on call GetLocationFailed, mockToastrFactory error should call', () => {
      const result = {
        error: {
          InvalidProperties: [
            {
              PropertyName: 'location',
              ValidationMessage: 'this field is required',
            },
          ],
        },
      };
      component.GetLocationFailed(result);
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(component.loadingLocations).toEqual(false);
    });

    it('on call getSelectedList, ifBankAccountUpdated should true', () => {
      component.getSelectedList(mocklocationsList);
      expect(component.ifBankAccountUpdated).toEqual(true);
      expect(component.selectedLocationsList).toEqual(mocklocationsList);
    });

    it('on call removeSelectedLocations, ifBankAccountUpdated should false', () => {
      component.removeSelectedLocations('event', 0);
      component.selectedLocationsList = mocklocationsList;
      expect(component.ifBankAccountUpdated).toEqual(true);
      expect(component.selectedLocationsList.length).toEqual(2);
    });

    it('on call removeSelectedLocations, isActive should false', () => {
      component.setActive(false);
      expect(component.isActive).toEqual(false);
      expect(component.ifBankAccountUpdated).toEqual(true);
    });

    it('on call onChangeForm, ifBankAccountUpdated should true', () => {
      const event = {
        event: { target: { value: 33 } },
      };
      component.onChangeForm(event, 'accountNumber');
      expect(component.ifBankAccountUpdated).toEqual(true);
    });

    it('on call confirmCancelBankAccountChanges, cancelBankAccountChanges have been called', () => {
      component.ifBankAccountUpdated = false;
      component.cancelBankAccountChanges = jasmine.createSpy();
      component.confirmCancelBankAccountChanges();
      expect(component.cancelBankAccountChanges).toHaveBeenCalled();
    });

    it('on call confirmCancelBankAccountChanges,ifBankAccountUpdated should false', () => {
      component.cancelBankAccountChanges();
      expect(component.ifBankAccountUpdated).toEqual(false);
    });

    it('on call createBankAccountAPI,Http Post should Call', () => {
      mockHttpService.post = jasmine.createSpy();
      component.createBankAccountAPI(mockBankAccounts[0]);
      expect(mockHttpService.post).toHaveBeenCalled();
    });

    it('on call createBankAccountAPI,Http Post should Call', () => {
      mockHttpService.put = jasmine.createSpy();
      component.updateBankAccountAPI(mockBankAccounts[0]);
      expect(mockHttpService.put).toHaveBeenCalled();
    });

    it('on call Update,Http put should Call', () => {
      component.updateBankAccountAPI = jasmine.createSpy();
      component.bankAccountForm = new FormGroup({
        name: new FormControl(),
        institution: new FormControl(),
        description: new FormControl(),
        accountNumber: new FormControl(),
        routingNumber: new FormControl(),
      });
      component.isEditBank = true;
      component.bankAccountForm.patchValue({
        name: 'Test Name 1',
        institution: 'Test institution 1',
        description: 'Test description 1',
        accountNumber: 'Test accountNumber 1',
        routingNumber: 234324,
      });
      component.selectedLocationsList = mocklocationsList;

      component.save();
      expect(component.updateBankAccountAPI).toHaveBeenCalled();
    });

    it('on call save,Http Post should Call', () => {
      component.createBankAccountAPI = jasmine.createSpy();
      component.bankAccountForm = new FormGroup({
        name: new FormControl(),
        institution: new FormControl(),
        description: new FormControl(),
        accountNumber: new FormControl(),
        routingNumber: new FormControl(),
      });
      component.isEditBank = false;
      component.bankAccountForm.patchValue({
        name: 'Test Name 1',
        institution: 'Test institution 1',
        description: 'Test description 1',
        accountNumber: 'Test accountNumber 1',
        routingNumber: 234324,
      });
      component.selectedLocationsList = mocklocationsList;

      component.save();
      expect(component.createBankAccountAPI).toHaveBeenCalled();
    });
  });
});
