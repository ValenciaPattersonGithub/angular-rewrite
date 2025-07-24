import { NO_ERRORS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService, DialogsModule } from '@progress/kendo-angular-dialog';
import { configureTestSuite } from 'src/configure-test-suite';
import { ServiceCodesPickerModalComponent } from '../service-codes-picker-modal/service-codes-picker-modal.component';
import { SwiftpickCodeCrudComponent } from './swiftpick-code-crud.component';
import { ServiceCodesService } from 'src/@shared/providers/service-codes.service';
import { ServiceSwiftCodeService } from '../service-swift-code-service/service-swift-code.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { OrderByPipe } from 'src/@shared/pipes';
import { formatCurrencyIfNegPipe } from 'src/@shared/pipes/formatCurrencyNeg/format-currency-Neg.pipe';

let mockReferenceService;
let mockLocalizeService;
//serviceCode object
let mockServiceCode;
let mockModalFactory;
let mockCacheFactory;
let mockToastrFactory;
let mockServiceCodeResult;
let mockServiceReturnWrapperNoServiceCodes;
let mockServiceReturnWrapper;
let mockPatSecurityService;
//mock for serviceCodesService service
let mockServiceCodesService;
let mockStandardService;


describe('SwiftpickCodeCrudComponent', () => {
  let component: SwiftpickCodeCrudComponent;
  let fixture: ComponentFixture<SwiftpickCodeCrudComponent>;
  let dialogservice: DialogService;

  configureTestSuite(() => {
    mockReferenceService = {
      setFeesByLocation: (objData) => {
        return objData;
      },
      get: jasmine.createSpy().and.callFake(() => {
        return [{ LocationId: 5 }, { LocationId: 6 }, { LocationId: 7 }];
      }),
      entityNames: {
        locations: 'locations'
      }
    }

    mockLocalizeService = {
      getLocalizedString: () => 'translated text'
    }

    //serviceCode object
    mockServiceCode = {
      Data: { Code: '', Description: '', DisplayAs: '', IsActive: true, IsSwiftPickCode: true, ServiceCodeId: null, ServiceTypeDescription: 'Swift Code', SwiftPickServiceCodes: [] },
      ServiceCodeId: 1,
      CdtCodeId: 1,
      Code: 'myCode',
      Description: 'myDescription',
      ServiceTypeId: 1,
      DisplayAs: 'customName',
      Fee: 10.6,
      TaxableServiceTypeId: 0,
      AffectedAreaId: 0,
      UsuallyPerformedByProviderTypeId: '',
      UseCodeForRangeOfTeeth: false,
      IsActive: true,
      IsEligibleForDiscount: false,
      Notes: 'myNotes',
      SubmitOnInsurance: true,
      SwiftPickServiceCodes: [
        { "ServiceCodeId": "ServiceCode1", Fee: 10 },
        { "ServiceCodeId": "ServiceCode2", Fee: 20 }
      ],
      LocationSpecificInfo: []
    };

    mockModalFactory = {
      CancelModal: jasmine
        .createSpy('ModalFactory.CancelModal')
        .and.returnValue({ then: (res) => { res(true) } }),
      ConfirmModal: jasmine.createSpy('ModalFactory.ConfirmModal').and.returnValue({ then: () => { } })
    }

    mockCacheFactory = {
      GetCache: jasmine.createSpy('ServiceCodesService').and.returnValue({ then: () => { } }),
      ClearCache: jasmine.createSpy('').and.returnValue({ then: () => { } })
    }

    mockToastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy()
    };

    mockServiceCodeResult = [{ "ServiceCodeId": "6cd3c9c0-2a52-49be-9b0e-5ce1ad854334", "CdtCodeId": "09e2bdfe-dce2-4c2e-8481-34508a5aa242", "CdtCodeName": "D9970", "Code": "myServic", "Description": "myServic desc is bigger than everybody else", "ServiceTypeId": "00000000-0000-0000-0000-000000000000", "ServiceTypeDescription": null, "DisplayAs": "mySrvc", "Fee": 34, "TaxableServiceTypeId": 0, "AffectedAreaId": 0, "UsuallyPerformedByProviderTypeId": null, "UseCodeForRangeOfTeeth": false, "IsActive": false, "IsEligibleForDiscount": false, "Notes": null, "SubmitOnInsurance": false, "IsSwiftPickCode": false, "SwiftPickServiceCodes": null, "DrawTypeId": null }];

    mockServiceReturnWrapperNoServiceCodes = {
      Value: null,
      Count: 0
    };

    mockServiceReturnWrapper = {
      Value: mockServiceCodeResult,
      Count: 3
    };

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(true),
      generateMessage: jasmine.createSpy('patSecurityService.generateMessage')
    };

    //mock for serviceCodesService service
    mockServiceCodesService = {
      search: jasmine.createSpy().and.callFake(() => {
        return new Promise((resolve, reject) => {
          resolve({ Value: '' }),
            reject({});
        })
      })
    }

    mockStandardService = {
      validate: jasmine.createSpy().and.returnValue({
        then: (res, error) => {
          res(true),
            error({})
        }
      }),
      checkDuplicate: jasmine.createSpy().and.returnValue({
        then: (res, error) => {
          res({ Value: true }),
            error({})
        }
      }),
      save: jasmine.createSpy().and.returnValue({
        then: (res, error) => {
          res(mockServiceCode),
            error({})
        }
      })
    };

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        FormsModule,
        DialogsModule
      ],
      providers: [
        { provide: 'referenceDataService', useValue: mockReferenceService },
        { provide: 'localize', useValue: mockLocalizeService },
        { provide: 'PatCacheFactory', useValue: mockCacheFactory },
        { provide: ServiceCodesService, useValue: mockServiceCodesService },
        { provide: 'toastrFactory', useValue: mockToastrFactory },
        { provide: 'ModalFactory', useValue: mockModalFactory },
        { provide: 'patSecurityService', useValue: mockPatSecurityService },
        { provide: ServiceSwiftCodeService, useValue: mockStandardService }
      ],
      declarations: [SwiftpickCodeCrudComponent, ServiceCodesPickerModalComponent, OrderByPipe, formatCurrencyIfNegPipe],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SwiftpickCodeCrudComponent, ServiceCodesPickerModalComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwiftpickCodeCrudComponent);
    component = fixture.componentInstance;
    dialogservice = TestBed.inject(DialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit ->', () => {
    it('should call a setSwiftpickFees method', () => {
      component.setSwiftpickFees = jasmine.createSpy();
      component.ngOnInit();
      expect(component.setSwiftpickFees).toHaveBeenCalled();
    });

    it('should set a property serviceCode.Data to some value', () => {
      spyOn(component, 'authAccess');
      component.serviceCode.Data = mockServiceCode.Data;
      component.ngOnInit();
      expect(component.serviceCode.Data).not.toBe(null);
      expect(component.serviceCode.Name).toBe(mockLocalizeService.getLocalizedString());
      expect(component.serviceCodeInitial).not.toBe(null)
      expect(component.authAccess).toHaveBeenCalled();
    });

    it('should set a name property ', () => {
      component.serviceCode.Data.IsSwiftPickCode = true;
      component.ngOnInit();
      expect(component.serviceCode.Name).toBe(mockLocalizeService.getLocalizedString())
    });

    it('should set a name property ', () => {
      component.serviceCode.Data.IsSwiftPickCode = false;
      component.ngOnInit();
      expect(component.serviceCode.Name).toBe(mockLocalizeService.getLocalizedString())
    });

    it('should copy serviceCode.Data', () => {
      component.serviceCode.Data = mockServiceCode.Data;
      component.ngOnInit();
      expect(component.serviceCodeInitial).toEqual(mockServiceCode.Data)
    });
  });

  describe('setSwiftpickFees ->', () => {
    it('should call a setSwiftpickFees method', () => {
      component.serviceCode.Data.SwiftPickServiceCodes = mockServiceCode.SwiftPickServiceCodes;
      component.setSwiftpickFees(mockServiceCode);
      expect(component.serviceCode).not.toBe(null);
      expect(component.serviceCode.Data.SwiftPickServiceCodes).not.toBe([]);
    });

    it('should not do anything if serviceCode is null', () => {
      const res = component.setSwiftpickFees(null);
      expect(res).toBeUndefined();
      expect(component.serviceCode.Data.SwiftPickServiceCodes).toBeDefined();
    });
  });

  describe('openDialog ->', () => {
    it('should open a dialog', () => {
      spyOn(dialogservice, 'open').and.callThrough();
      component.openDialog();
      expect(dialogservice.open).toHaveBeenCalled();
    });

    it('should set dataHasChanged to false when editMode is true', () => {
      component.editMode = true;
      component.openDialog();
      expect(component.dataHasChanged).toBe(false);
    });
  });

  // NG15CLEANUP These have no expectations and test no functionality.
  describe('close -> ', () => {
    it('should close the dialog', () => {
      component.close();
    });

    it('should close the dialog when selectedServiceCodes is not null', () => {
      component.close('123');
    });
  });

  describe('cancelOnClick -> ', () => {
    it('should close the modal', () => {
      mockModalFactory.CancelModal().then(() => { })
      component.dataHasChanged = true;
      component.cancelOnClick();
      fixture.detectChanges();
      expect(mockModalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('saveSwiftPickCode -> ', () => {
    it('saveSwiftPickCode should validate and check for duplicate when ServiceCodeId is set', () => {
      component.serviceCode.Data = mockServiceCode.Data;
      component.saveSwiftPickCode();
      expect(component.serviceCode.Valid).toBe(true);
    });

    it('saveSwiftPickCode should validate and check for duplicate when ServiceCodeId is null', () => {
      spyOn(component, 'saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess');
      component.serviceCode.Data.ServiceCodeId = null;
      component.saveSwiftPickCode();
      expect(mockStandardService.validate).toHaveBeenCalledWith(mockServiceCode.Data);
      expect(component.serviceCode.Valid).toBe(true);
    });
  });

  describe('saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess ->', () => {
    it('should not save service code when invalid and swift code is unique', () => {
      component.serviceCode.IsDuplicate = false;
      component.serviceCode = mockServiceCode;
      component.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
      expect(component.serviceCode.Data.IsActive).toEqual(true);
    });

    it('should set isAtleastOneServiceCode to true', () => {
      component.serviceCode.Data.SwiftPickServiceCodes = mockServiceCode.SwiftPickServiceCodes;
      component.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
    });

    it('should set conditions when valid and isAtleastOneServiceCode is true', () => {
      component.serviceCode.Data.SwiftPickServiceCodes = mockServiceCode.SwiftPickServiceCodes;
      component.serviceCode.Valid = true;
      component.serviceCode.Data.Fee = 1.00;
      component.displayActiveStatusConfirmation = true;
      component.serviceCode.Data.LocationSpecificInfo = [{ 'ServiceCodeId': '123' }];
      component.serviceCode.Data.TaxableServiceTypeId = 123;
      component.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
      expect(component.serviceCode.Data.Fee).toEqual(10.6);
      expect(component.serviceCode.Data.IsActive).toBe(true);
      expect(component.serviceCode.Data.LocationSpecificInfo).not.toBe(null);
      expect(component.serviceCode.Data.TaxableServiceTypeId).toBe(0);
    });

    // NG15CLEANUP Need to first open the dialog.
    it('should set uniqueSwiftPickCodeServerMessage and set focus on code input box when service code is not unique', async () => {
      component.openDialog();
      fixture.detectChanges();
      var el = fixture.nativeElement.querySelector('input');
      spyOn(el, 'focus').and.callThrough();
      component.serviceCode.IsDuplicate = true;
      component.uniqueSwiftPickCodeServerMessage = '';
      component.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess();
      expect(component.uniqueSwiftPickCodeServerMessage).not.toBe('');
      fixture.detectChanges();
      await fixture.whenStable().then(() => {
        // NG15CLEANUP Both of these couldn't have been true at the same time...
        // expect(el.focus).not.toHaveBeenCalled();
        expect(el.focus).toHaveBeenCalled();
      });
    });
  });

  describe('checkUniqueServiceCode ->', () => {
    it('should verify unique service code from server with valid scope.serviceCode.Data.ServiceCodeId', () => {
      component.serviceCode.Data.Code = '1';
      spyOn(component, 'checkUniqueServiceCodeGetSuccess');
      component.checkUniqueServiceCode();
      expect(component.serviceCode.IsDuplicate).toBe(true);
      expect(component.checkUniqueServiceCodeGetSuccess).toHaveBeenCalled();
    });
  });

  describe('checkUniqueServiceCodeGetSuccess ->', () => {
    it('Success callback handler to notify user about duplicate service code', () => {
      component.serviceCode.IsDuplicate = false;
      component.checkUniqueServiceCodeGetSuccess();
      expect(component.uniqueSwiftPickCodeServerMessage).toBe('');
    });

    it('Success callback handler to notify user after verifying unique service code', () => {
      component.serviceCode.IsDuplicate = true;
      component.checkUniqueServiceCodeGetSuccess();
      expect(component.uniqueSwiftPickCodeServerMessage).not.toBe('');
    });
  });

  describe('checkUniqueServiceCodeGetFailure ->', () => {
    it('Error callback handler to notify user after it failed to verify unique service code', () => {
      component.checkUniqueServiceCodeGetFailure();
      expect(component.serviceCode.IsDuplicate).toEqual(true);
      expect(component.uniqueSwiftPickCodeServerMessage).not.toBe('');
    });
  });

  describe('serviceCodeOnChange ->', () => {
    it('serviceCodeOnChange should reset duplicate flag on service-code value change', () => {
      component.serviceCodeOnChange();
      expect(component.serviceCode.IsDuplicate).toEqual(false);
    });
  });

  describe('cancelStatusConfirmation ->', () => {
    it('cancelStatusConfirmation should reset the IsActive and displayActiveStatusConfirmation properties to false', () => {
      component.cancelStatusConfirmation();
      expect(component.displayActiveStatusConfirmation).toEqual(false);
      expect(component.serviceCode.Data.IsActive).toEqual(true);
    });
  });

  describe('okStatusConfirmation ->', () => {
    it('okStatusConfirmation should reset the displayActiveStatusConfirmation property to false', () => {
      component.okStatusConfirmation();
      expect(component.displayActiveStatusConfirmation).toEqual(false);
      expect(component.serviceCode.Data.IsActive).toEqual(false);
    });
  });

  describe('swiftPickCodeIsActiveOnChange ->', () => {
    it('should make displayActiveStatusConfirmation false when IsActiveStatusBuffer flag is true', () => {
      let event = {
        "target": {
          "checked": true
        }
      };
      component.serviceCode.Data.IsActive = true;
      component.displayActiveStatusConfirmation = false;
      component.swiftPickCodeIsActiveOnChange(event);
      expect(component.displayActiveStatusConfirmation).toBe(false);
    });

    it('swiftPickCodeIsActiveOnChange should make displayActiveStatusConfirmation true when IsActiveStatusBuffer flag is false', () => {
      let event = {
        "target": {
          "checked": false
        }
      };
      component.serviceCode.Data.IsActive = false;
      component.displayActiveStatusConfirmation = false;
      component.swiftPickCodeIsActiveOnChange(event);
      expect(component.displayActiveStatusConfirmation).toBe(true);
    });
  });

  describe('watch statement over service code data ->', () => {
    it('serviceCode.Data watch statement should set dataHasChanged to true for any changes made to service code data, when dataHasChanged is initially set to false', () => {
      component.ngOnChanges({
        data: new SimpleChange(null, mockServiceCode.Data, true)
      });
      fixture.detectChanges();
      component.dataHasChanged = false;
      expect(component.serviceCode.Data).toEqual(mockServiceCode.Data);
    })

    it('serviceCode.Data watch statement should not modify dataHasChanged, when dataHasChanged is set to true', () => {
      component.dataHasChanged = true;
      component.ngOnChanges({
        data: new SimpleChange(null, mockServiceCode.Data, true)
      });
      fixture.detectChanges();
      expect(component.serviceCode.Data).not.toBe(mockServiceCode.Data);
    });
  });

  describe('cancelOnClick  function ->', () => {

    it('cancelOnClick  should handle cancel button action for the modal when data is not changed', () => {
      component.dataHasChanged = false;
      component.cancelOnClick();
    });

    it('cancelOnClick  should handle cancel button action for the modal when data is changed', () => {
      component.dataHasChanged = true;
      component.cancelOnClick();
    });
  });

  describe('search function ->', () => {
    it('should return  without searching if search is in progress', () => {
      const spy = component.search = jasmine.createSpy();
      component.searchIsQueryingServer = true;
      component.search(null);
      expect(mockServiceCodesService.search).not.toHaveBeenCalled();
    });

    it('should return without searching if searchResults equal resultCount', () => {
      const spy = component.search = jasmine.createSpy();
      component.searchResults = mockServiceCodeResult;
      component.resultCount = 3;
      component.search('D');
      expect(mockServiceCodesService.search).not.toHaveBeenCalled();
      expect(component.noSearchResults).toBe(false);
    });

    it('should return without searching if searchString is empty', () => {
      const spy = component.search = jasmine.createSpy();
      component.searchString = '';
      component.search('D');
      expect(mockServiceCodesService.search).not.toHaveBeenCalled();
    });

    it('should return without searching if scope.searchResults.length == scope.resultCount', () => {
      component.searchString = 'searchMe';
      component.searchResults = [{ res: 1 }];
      component.resultCount = 1;
      component.search('');
      expect(mockServiceCodesService.search).not.toHaveBeenCalled();
      expect(component.noSearchResults).toBe(false);
    });

    it('should set searchParams if search conditions are valid', () => {
      component.searchIsQueryingServer = false;
      component.searchString = 'mockSearch';
      component.searchResults = [];
      component.resultCount = 0;
      component.search('D0');
      expect(mockServiceCodesService.search).toHaveBeenCalled();
    });

    it('should call serviceCodesService search if valid search ', () => {
      component.searchString = 'Anything I want';
      component.search('D0');
      expect(mockServiceCodesService.search).toHaveBeenCalled();
      expect(component.searchIsQueryingServer).toBe(true);
      expect(component.noSearchResults).toBe(false);
    });
  });

  describe('searchGetOnSuccess function ->', () => {
    it('should set searchResults', () => {
      component.searchGetOnSuccess(mockServiceReturnWrapper);
      expect(component.resultCount).toBe(mockServiceReturnWrapper.Count);
      expect(component.searchIsQueryingServer).toBe(false);
    });

    it('should set resultCount if gets results', () => {
      expect(component.resultCount).toBe(0);
      component.searchGetOnSuccess(mockServiceReturnWrapper);
      expect(component.searchIsQueryingServer).toBe(false);
      expect(component.resultCount).toBe(3);
    });

    it('should set noSearchResults to false if gets results', () => {
      component.searchGetOnSuccess(mockServiceReturnWrapper);
      expect(component.noSearchResults).toBe(false);
    });

    it('should set noSearchResults to true if resultCount eqauls 0', () => {
      component.searchGetOnSuccess(mockServiceReturnWrapperNoServiceCodes);
      expect(component.noSearchResults).toBe(false);
    });

    it('should set resultCount to 0 if searchString length > 0', () => {
      component.searchString = 'abc';
      component.searchGetOnSuccess(mockServiceReturnWrapperNoServiceCodes);
      expect(component.resultCount).toBe(0);
      expect(component.noSearchResults).toBe(true);
    });

    it('should set noresults to false if searchstring is null', () => {
      component.searchString = '';
      component.searchGetOnSuccess(mockServiceReturnWrapperNoServiceCodes);
      expect(component.noSearchResults).toBe(false);
    });
  });

  describe('searchGetOnError function ->', () => {
    it('should set scope variables ', () => {
      component.searchGetOnError();
      expect(component.searchIsQueryingServer).toBe(false);
      expect(component.resultCount).toBe(0);
      expect(component.searchResults).toEqual([]);
      expect(component.noSearchResults).toBe(true);
    });

    it('should should call toastr error ', () => {
      component.searchGetOnError();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('activateSearch function ->', () => {
    it('should not do search if user is not authorized for search ', () => {
      const spy = component.search = jasmine.createSpy();
      component.searchString = null;
      component.activateSearch('d01');
      expect(spy).toHaveBeenCalled();
    });

    it('should set scope variables and call search if user is authorized for search ', () => {
      const spy = component.search = jasmine.createSpy();
      component.searchTerm = 'mockTerm';
      component.activateSearch(component.searchTerm);
      expect(component.searchString).toEqual(component.searchTerm);
      expect(component.limit).toBe(15);
      expect(component.limitResults).toBe(true);
      expect(component.resultCount).toBe(0);
      expect(component.searchResults).toEqual([]);
      expect(component.search).toHaveBeenCalled();
    });

    it('should set noSearchResults to false if searchTerm is equal to searchString ', () => {
      var searchTerm = 'mockTerm';
      component.searchString = 'mockTerm';
      component.activateSearch(searchTerm);
      expect(component.searchString).toEqual(searchTerm);
      expect(component.noSearchResults).toBe(false);
    });
  });

  describe('selectResult function ->', () => {
    beforeEach(() => component.searchResults = [{ Code: 0, Value: "service0" }, { Code: 1, Value: "service1" }, { Code: 2, Value: "service2" }, { Code: 3, Value: "service3" }, { Code: 4, Value: "service4" }]);

    it('should set scope variables when selectedServices as an array ', () => {
      component.serviceCode.Data = { SwiftPickServiceCodes: [{ Code: '0', Description: "service0" }, { Code: '1', Description: "service1" }, { Code: '2', Description: "service2" }] };
      let selectedServices = [{ Code: 3, Value: "service3" }, { Code: 4, Value: "service4" }];
      component.selectResult(selectedServices);
      expect(component.serviceCode.Data.SwiftPickServiceCodes.length).toEqual(5);
    });

    it('should set scope variables when selectedServices as object ', () => {
      component.serviceCode.Data = { SwiftPickServiceCodes: [{ Code: '0', Description: "service0" }, { Code: '1', Description: "service1" }, { Code: '2', Description: "service2" }] };
      var selectedServices = { Code: 3, Value: "service3" };
      component.selectResult(selectedServices.Code);
      expect(component.serviceCode.Data.SwiftPickServiceCodes.length).toEqual(4);
    });
  });

  describe('sumFilter function ->', () => {
    it('SwiftPickServiceCodesTotal total should be 3.00', () => {
      const values = [{ '$$locationFee': 1.00 }, { '$$locationFee': 2.00 }]
      component.sumFilter(values);
      expect(component.SwiftPickServiceCodesTotal).toEqual(3.00);
    });
  });

  describe('getServiceObj function ->', () => {
    it('SwiftPickServiceCodesTotal total should be 3.00', () => {
      const mockSearchResults = [{ 'Code': 'D0123', 'Name': '0123' }, { 'Code': 'D0124', 'Name': '0124' }];
      component.searchResults = mockSearchResults;
      component.getServiceObj('D0123');
      expect(component.serviceObj).toBe(mockSearchResults[0]);
    });
  });

  describe('authAccess function ->', () => {
    it('should call notifyNotAuthorized when user is not authorized for view', () => {
      const spy = mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine.createSpy('patSecurityService.IsAuthorizedByAbbreviation').and.returnValue(false);
      component.authAccess();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('inputKeyDown function ->', () => {
    it('should preventDefault', () => {
      const event = { 'keyCode': 13, originalEvent: { preventDefault: () => { } } }
      component.inputKeyDown(event);
    });
  });

  describe('afterSaveSuccess function ->', () => {
    it('should call AfterSaveSuccess', () => {
      component.afterSaveSuccess(mockServiceCode.Data);
      expect(component.serviceCode.Data).not.toBe(null);
      expect(component.serviceCode.OriginalData).not.toBe(null);
      expect(component.serviceCode.Saving).toBe(false);
      expect(mockToastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('removeServiceCode function ->', () => {
    it('should call removeServiceCode', () => {
      component.sumFilter = jasmine.createSpy();
      component.removeServiceCode(mockServiceCode);
      expect(component.sumFilter).toHaveBeenCalled();
    });

    it('should set swiftPickCodeCrud to [] when all conditions are true', () => {
      component.removeServiceCode = jasmine.createSpy();
      component.serviceCode.Data.IsActive = true;
      component.editMode = true;
      component.serviceCode.Data.SwiftPickServiceCodes = mockServiceCodeResult;
      component.removeServiceCode(mockServiceCodeResult);
      expect(component.serviceCode.Data.SwiftPickServiceCodes).toBeDefined();
    });

    it('should set swiftPickCodeCrud to [] when all conditions are true', () => {
      component.removeServiceCode = jasmine.createSpy();
      component.serviceCode.Data.SwiftPickServiceCodes = mockServiceCodeResult;
      component.serviceCode.Data.IsActive = false;
      component.removeServiceCode(mockServiceCodeResult);
      expect(component.removeServiceCode).toBeDefined();
    });
  });
});
