describe('Controller: SwiftPickCodeCrudController', function () {
  var ctrl, scope, modalInstance, toastrFactory, localize, timeout, element;
  var data,
    boundObjectFactory,
    serviceCodeCrudService,
    serviceCode,
    searchFactory;
  var deferred, q;
  var serviceCodesService,
    modalFactory,
    mockServiceCodeResult,
    mockServiceReturnWrapper,
    mockServiceReturnWrapperNoServiceCodes;
  var modalFactoryDeferred, referenceDataService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      referenceDataService = {
        get: jasmine.createSpy().and.callFake(function () {
          return [];
        }),
        setFeesByLocation: jasmine.createSpy().and.callFake(function () {
          return {
            ServiceCodeId: '6cd3c9c0-2a52-49be-9b0e-5ce1ad854334',
            CdtCodeId: '09e2bdfe-dce2-4c2e-8481-34508a5aa242',
            CdtCodeName: 'D9970',
            Code: 'myServic',
            Description: 'myServic desc is bigger than everybody else',
            ServiceTypeId: '00000000-0000-0000-0000-000000000000',
            ServiceTypeDescription: null,
            DisplayAs: 'mySrvc',
            Fee: 34,
            TaxableServiceTypeId: 0,
            AffectedAreaId: 0,
            UsuallyPerformedByProviderTypeId: null,
            UseCodeForRangeOfTeeth: false,
            IsActive: false,
            IsEligibleForDiscount: false,
            Notes: null,
            SubmitOnInsurance: false,
            IsSwiftPickCode: false,
            SwiftPickServiceCodes: null,
            DrawTypeId: null,
          };
        }),
        entityNames: {
          serviceTypes: 'serviceTypes',
          serviceCodes: 'serviceCodes',
        },
      };
      $provide.value('referenceDataService', referenceDataService);
    })
  );
  beforeEach(inject(function ($rootScope, $controller, $injector, $q) {
    scope = $rootScope.$new();
    q = $q;

    //mock for modalFactory
    modalFactory = {
      CancelModal: jasmine
        .createSpy('modalFactory.CancelModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      Modal: jasmine.createSpy('modalFactory.Modal').and.callFake(function () {
        modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };

    mockServiceCodeResult = [
      {
        ServiceCodeId: '6cd3c9c0-2a52-49be-9b0e-5ce1ad854334',
        CdtCodeId: '09e2bdfe-dce2-4c2e-8481-34508a5aa242',
        CdtCodeName: 'D9970',
        Code: 'myServic',
        Description: 'myServic desc is bigger than everybody else',
        ServiceTypeId: '00000000-0000-0000-0000-000000000000',
        ServiceTypeDescription: null,
        DisplayAs: 'mySrvc',
        Fee: 34,
        TaxableServiceTypeId: 0,
        AffectedAreaId: 0,
        UsuallyPerformedByProviderTypeId: null,
        UseCodeForRangeOfTeeth: false,
        IsActive: false,
        IsEligibleForDiscount: false,
        Notes: null,
        SubmitOnInsurance: false,
        IsSwiftPickCode: false,
        SwiftPickServiceCodes: null,
        DrawTypeId: null,
      },
    ];
    mockServiceReturnWrapperNoServiceCodes = {
      Value: null,
      Count: 0,
    };
    mockServiceReturnWrapper = {
      Value: mockServiceCodeResult,
      Count: 3,
    };

    //mock for serviceCodesService service
    serviceCodesService = {
      search: jasmine
        .createSpy('serviceCodesService.search')
        .and.returnValue(mockServiceReturnWrapper),
    };

    //mock for modal
    modalInstance = {
      open: jasmine.createSpy('modalInstance.open').and.callFake(function () {
        deferred = q.defer();
        deferred.resolve('some value in return');
        return { result: deferred.promise };
      }),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    //serviceCode object
    serviceCode = {
      ServiceCodeId: 1,
      CdtCodeId: 1,
      Code: 'myCode',
      Description: 'myDescription',
      ServiceTypeId: 1,
      DisplayAs: 'customName',
      Fee: '10.6',
      TaxableServiceTypeId: 0,
      AffectedAreaId: 0,
      UsuallyPerformedByProviderTypeId: '',
      UseCodeForRangeOfTeeth: false,
      IsActive: true,
      IsEligibleForDiscount: false,
      Notes: 'myNotes',
      SubmitOnInsurance: true,
      SwiftPickServiceCodes: [
        {
          Fee: 10,
        },
        {
          Fee: 20,
        },
      ],
    };
    // mock for boundObjectFactory
    boundObjectFactory = {
      Create: jasmine.createSpy().and.returnValue({
        AfterDeleteSuccess: null,
        AfterSaveError: null,
        AfterSaveSuccess: null,
        Data: {},
        Deleting: false,
        IdField: 'ServiceCodeId',
        Loading: true,
        Name: 'ServiceCode',
        Saving: false,
        Valid: true,
        Load: jasmine.any(Function),
        Save: jasmine.createSpy().and.returnValue(''),
        Validate: jasmine.createSpy().and.returnValue(''),
        CheckDuplicate: jasmine.createSpy().and.returnValue(''),
      }),
    };

    //mock for serviceCodeCrudService
    serviceCodeCrudService = {
      Dtos: {
        ServiceCode: jasmine.createSpy().and.returnValue({
          IdField: 'ServiceCodeId',
          ObjectName: 'ServiceCode',
          Operations: {
            Create: jasmine.any(Function),
            Retrieve: jasmine.any(Function),
            Update: jasmine.any(Function),
            delete: jasmine.any(Function),
            get: jasmine.any(Function),
            query: jasmine.any(Function),
            remove: jasmine.any(Function),
            save: jasmine.any(Function),
          },
          IsValid: jasmine.any(Function),
        }),
      },
    };

    //mock for searchFactory
    searchFactory = {
      CreateSearch: jasmine.createSpy().and.returnValue(''),
      GetDefaultSearchParameters: jasmine.createSpy().and.returnValue(''),
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    ctrl = $controller('SwiftPickCodeCrudController', {
      $scope: scope,
      toastrFactory: toastrFactory,
      BoundObjectFactory: boundObjectFactory,
      ServiceCodeCrudService: serviceCodeCrudService,
      ServiceCode: serviceCode,
      $uibModalInstance: modalInstance,
      $uibModal: modalInstance,
      SearchFactory: searchFactory,
      localize: localize,
      ServiceCodesService: serviceCodesService,
      ModalFactory: modalFactory,
    });

    timeout = $injector.get('$timeout');
    data = {
      value: jasmine.createSpy().and.returnValue(1),
      text: jasmine.createSpy().and.returnValue('a'),
    };
    element = {
      data: jasmine.createSpy().and.returnValue(data),
      focus: jasmine.createSpy(),
      prop: jasmine.createSpy(),
    };
    spyOn(angular, 'element').and.returnValue(element);
    spyOn(timeout, 'cancel');
  }));

  //controller
  it('ServiceCodeCrudController:should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  //toastrFactory
  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  //removeServiceCode
  it('removeServiceCode should remove the selected service code from grid', function () {
    scope.serviceCode = {
      Data: {
        SwiftPickServiceCodes: [
          { Code: 0, Value: 'service0' },
          { Code: 1, Value: 'service1' },
          { Code: 2, Value: 'service2' },
        ],
        IsActive: true,
      },
    };
    scope.editMode = false;
    var selectedService = { Code: 1, Value: 'service1' };
    scope.removeServiceCode(selectedService);
    expect(scope.serviceCode.Data.SwiftPickServiceCodes.length).toEqual(2);
  });

  // saveSwiftPickCode
  it('saveSwiftPickCode should validate and check for duplicate when ServiceCodeId is set', function () {
    scope.serviceCode.Data.ServiceCodeId = 1;
    scope.saveSwiftPickCode();
    expect(scope.serviceCode.Validate).toHaveBeenCalled();
    expect(scope.serviceCode.CheckDuplicate).toHaveBeenCalled();
  });

  it('saveSwiftPickCode should validate and check for duplicate when ServiceCodeId is null', function () {
    scope.serviceCode.Data.ServiceCodeId = null;
    scope.saveSwiftPickCode();
    expect(scope.serviceCode.Validate).toHaveBeenCalled();
    expect(scope.serviceCode.CheckDuplicate).toHaveBeenCalled();
  });

  //saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess
  it('saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess should set uniqueSwiftPickCodeServerMessage and set focus on code input box when service code is not unique', function () {
    var successResponse = {};
    scope.serviceCode.IsDuplicate = true;
    scope.uniqueSwiftPickCodeServerMessage = null;
    scope.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess(successResponse);
    expect(scope.uniqueSwiftPickCodeServerMessage).not.toBe(null);
    expect(angular.element('#inpSwiftPickCode').focus).not.toHaveBeenCalled();
    timeout.flush(1);
    expect(angular.element('#inpSwiftPickCode').focus).toHaveBeenCalled();
  });

  it('saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess should save service code when valid and swift code is unique', function () {
    var successResponse = {};
    scope.serviceCode.IsDuplicate = false;
    scope.serviceCode.Data.SwiftPickServiceCodes = [{ value: 1 }];
    scope.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess(successResponse);
    expect(scope.serviceCode.Save).toHaveBeenCalled();
  });

  it('saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess should not save service code when invalid and swift code is unique', function () {
    var successResponse = {};
    scope.serviceCode.IsDuplicate = false;
    scope.serviceCode.Data.SwiftPickServiceCodes = [];
    scope.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess(successResponse);
    expect(scope.serviceCode.Save).not.toHaveBeenCalled();
  });

  it('saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess should save service code as active when valid, swift code is unique and displayActiveStatusConfirmation is set to true', function () {
    var successResponse = {};
    scope.serviceCode.IsDuplicate = false;
    scope.serviceCode.Data.SwiftPickServiceCodes = [{ value: 1 }];
    scope.displayActiveStatusConfirmation = true;
    scope.serviceCode.Data.IsActive = false;
    scope.saveSwiftPickCodeCheckUniqueServiceCodeGetSuccess(successResponse);
    expect(scope.serviceCode.Data.IsActive).toBe(true);
    expect(scope.serviceCode.Save).toHaveBeenCalled();
  });

  //AfterSaveSuccess
  it('AfterSaveSuccess should close the modal when success', function () {
    scope.serviceCode.AfterSaveSuccess();
    expect(modalInstance.close).toHaveBeenCalled();
  });

  //cancelChanges
  it('cancelChanges should cancel and close modal', function () {
    scope.cancelChanges();
    expect(modalInstance.dismiss).toHaveBeenCalled();
  });

  //checkUniqueServiceCode
  it('checkUniqueServiceCode should verify unique service code from server with valid scope.serviceCode.Data.ServiceCodeId', function () {
    scope.checkUniqueServiceCode();
    expect(scope.serviceCode.CheckDuplicate).toHaveBeenCalled();
  });

  it('checkUniqueServiceCode should verify unique service code from server with null scope.serviceCode.Data.ServiceCodeId', function () {
    scope.serviceCode.Data.ServiceCodeId = null;
    scope.checkUniqueServiceCode();
    expect(scope.serviceCode.CheckDuplicate).toHaveBeenCalled();
  });

  //checkUniqueServiceCodeGetSuccess
  it('checkUniqueServiceCodeGetSuccess- Success callback handler to notify user about duplicate service code', function () {
    scope.serviceCode = { IsDuplicate: false };

    scope.checkUniqueServiceCodeGetSuccess();
    expect(scope.uniqueSwiftPickCodeServerMessage).toBeUndefined();
  });

  it('checkUniqueServiceCodeGetSuccess- Success callback handler to notify user after verifying unique service code', function () {
    scope.serviceCode = { IsDuplicate: true };
    scope.checkUniqueServiceCodeGetSuccess();

    expect(scope.uniqueSwiftPickCodeServerMessage).not.toBe(null);
  });

  //checkUniqueServiceCodeGetFailure
  it('checkUniqueServiceCodeGetFailure- Error callback handler to notify user after it failed to verify unique service code', function () {
    scope.checkUniqueServiceCodeGetFailure();
    expect(scope.serviceCode.IsDuplicate).toEqual(true);
    expect(scope.uniqueSwiftPickCodeServerMessage).not.toBe(null);
  });

  //serviceCodeOnChange
  it('serviceCodeOnChange should reset duplicate flag on service-code value change', function () {
    scope.serviceCodeOnChange();
    expect(scope.serviceCode.IsDuplicate).toEqual(false);
  });

  //cancelStatusConfirmation
  it('cancelStatusConfirmation should reset the IsActive and displayActiveStatusConfirmation properties to false', function () {
    scope.cancelStatusConfirmation();
    timeout.flush(300);
    expect(scope.displayActiveStatusConfirmation).toEqual(false);
    expect(scope.serviceCode.Data.IsActive).toEqual(true);
  });

  //okStatusConfirmation
  it('okStatusConfirmation should reset the displayActiveStatusConfirmation property to false', function () {
    scope.okStatusConfirmation();
    timeout.flush(300);
    expect(scope.displayActiveStatusConfirmation).toEqual(false);
    expect(scope.serviceCode.Data.IsActive).toEqual(false);
  });

  //swiftPickCodeIsActiveOnChange
  it('swiftPickCodeIsActiveOnChange should make displayActiveStatusConfirmation false when IsActiveStatusBuffer flag is true', function () {
    scope.serviceCode.Data.IsActive = true;
    scope.displayActiveStatusConfirmation = false;

    scope.swiftPickCodeIsActiveOnChange();
    timeout.flush(300);
    expect(scope.displayActiveStatusConfirmation).toBe(false);
  });

  it('swiftPickCodeIsActiveOnChange should make displayActiveStatusConfirmation true when IsActiveStatusBuffer flag is false', function () {
    scope.serviceCode.Data.IsActive = false;
    scope.displayActiveStatusConfirmation = false;

    scope.swiftPickCodeIsActiveOnChange();
    timeout.flush(300);
    expect(scope.displayActiveStatusConfirmation).toBe(true);
  });

  //watch statement over service code data
  it('serviceCode.Data watch statement should set dataHasChanged to true for any changes made to service code data, when dataHasChanged is initially set to false', function () {
    scope.dataHasChanged = false;
    scope.serviceCode.Data.Code = 'a';
    scope.$apply();
    expect(scope.dataHasChanged).toBe(true);
  });

  it('serviceCode.Data watch statement should not modify dataHasChanged, when dataHasChanged is set to true', function () {
    scope.dataHasChanged = true;
    scope.serviceCode.Data.Code = 'a';
    scope.$apply();
    expect(scope.dataHasChanged).toBe(true);
  });

  describe('cancelOnClick  function ->', function () {
    it('cancelOnClick  should handle cancel button action for the modal when data is not changed', function () {
      scope.dataHasChanged = false;
      scope.cancelOnClick();
    });

    it('cancelOnClick  should handle cancel button action for the modal when data is changed', function () {
      scope.dataHasChanged = true;
      scope.cancelOnClick();
    });
  });

  describe('watcher searchTerm ->', function () {
    beforeEach(function () {
      // Watch the input
      scope.$watch('searchTerm', function (nv, ov) {
        if (nv && nv.length > 0 && nv != ov) {
          if (scope.searchTimeout) {
            timeout.cancel(scope.searchTimeout);
          }
          scope.searchTimeout = timeout(function () {
            scope.activateSearch(nv);
          }, 500);
        } else if (ov && ov.length > 0 && nv != ov) {
          if (scope.searchTimeout) {
            timeout.cancel(scope.searchTimeout);
          }
          scope.searchTimeout = timeout(function () {
            scope.activateSearch(nv);
          }, 500);
        }
      });

      spyOn(scope, 'activateSearch');
    });

    it('should call activateSearch function when searchTerm value is new and valid and searchTimeout is not defined', function () {
      scope.searchTerm = 'abc';
      scope.$apply();
      scope.searchTerm = 'abc1';
      scope.$apply();
      timeout.flush(500);
      expect(scope.activateSearch).toHaveBeenCalledWith(scope.searchTerm);
    });

    it('should call timeout.cancel function when searchTerm value is new and valid and searchTimeout is defined', function () {
      scope.searchTimeout = true;
      scope.searchTerm = 'abc';
      scope.$apply();
      scope.searchTerm = 'abc1';
      scope.$apply();
      timeout.flush(500);
      expect(timeout.cancel).toHaveBeenCalledWith(true);
    });

    it('should call activateSearch function when searchTerm value is new and valid and searchTimeout is not defined', function () {
      scope.searchTerm = 'abc';
      scope.$apply();
      scope.searchTerm = '';
      scope.$apply();
      timeout.flush(500);
      expect(scope.activateSearch).toHaveBeenCalledWith(scope.searchTerm);
    });

    it('should call timeout.cancel function when searchTerm value is new and valid and searchTimeout is defined', function () {
      scope.searchTimeout = true;
      scope.searchTerm = 'abc';
      scope.$apply();
      scope.searchTerm = '';
      scope.$apply();
      timeout.flush(500);
      expect(timeout.cancel).toHaveBeenCalledWith(true);
    });
  });

  describe('search function ->', function () {
    it('should return  without searching if search is in progress', function () {
      spyOn(scope, 'search');
      scope.searchIsQueryingServer = true;
      scope.search();
      expect(serviceCodesService.search).not.toHaveBeenCalled();
    });

    it('should return  without searching if searchResults equal resultCount', function () {
      spyOn(scope, 'search');
      scope.searchResults = mockServiceCodeResult;
      scope.resultCount = 3;
      scope.search();
      expect(serviceCodesService.search).not.toHaveBeenCalled();
    });

    it('should return without searching if searchString is empty', function () {
      spyOn(scope, 'search');
      scope.searchString = '';
      scope.search();
      expect(serviceCodesService.search).not.toHaveBeenCalled();
    });

    it('should return without searching if scope.searchResults.length == scope.resultCount', function () {
      scope.searchString = 'searchMe';
      scope.searchResults = [{ res: 1 }];
      scope.resultCount = 1;

      scope.search();
      expect(serviceCodesService.search).not.toHaveBeenCalled();
    });

    it('should set searchParams if search conditions are valid', function () {
      scope.searchIsQueryingServer = false;
      scope.searchString = 'mockSearch';
      scope.searchResults = [];
      scope.resultCount = 0;

      scope.search();
      expect(serviceCodesService.search).toHaveBeenCalled();
    });

    it('should call serviceCodesService search if valid search ', function () {
      scope.searchString = 'Anything I want';
      scope.search();
      expect(serviceCodesService.search).toHaveBeenCalled();
      scope.$apply();
      expect(scope.searchIsQueryingServer).toBe(true);
    });
  });

  describe('searchGetOnSuccess function ->', function () {
    it('should set searchResults', function () {
      scope.searchGetOnSuccess(mockServiceReturnWrapper);
      scope.$apply();
      expect(scope.resultCount).toBe(mockServiceReturnWrapper.Count);
      expect(scope.searchIsQueryingServer).toBe(false);
    });

    it('should set resultCount if gets results', function () {
      expect(scope.resultCount).toBe(0);
      scope.searchGetOnSuccess(mockServiceReturnWrapper);
      scope.$apply();
      expect(scope.searchIsQueryingServer).toBe(false);
      expect(scope.resultCount).toBe(3);
    });

    it('should set noSearchResults to false if gets results', function () {
      scope.searchGetOnSuccess(mockServiceReturnWrapper);
      scope.$apply();
      expect(scope.noSearchResults).toBe(false);
    });

    it('should set noSearchResults to true if resultCount eqauls 0', function () {
      scope.searchGetOnSuccess(mockServiceReturnWrapperNoServiceCodes);
      scope.$apply();
      expect(scope.noSearchResults).toBe(false);
    });
  });

  describe('searchGetOnError function ->', function () {
    it('should set scope variables ', function () {
      scope.searchGetOnError();
      expect(scope.searchIsQueryingServer).toBe(false);
      expect(scope.resultCount).toBe(0);
      expect(scope.searchResults).toEqual([]);
      expect(scope.noSearchResults).toBe(true);
    });

    it('should should call toastr error ', function () {
      scope.searchGetOnError();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('activateSearch function ->', function () {
    it('should not do search if user is not authorized for search ', function () {
      scope.hasAuthenticated = false;
      scope.hasSearchAccess = false;
      spyOn(scope, 'search');
      expect(scope.search).not.toHaveBeenCalled();
    });

    it('should set scope variables and call search if user is authorized for search ', function () {
      spyOn(scope, 'search');
      scope.searchTerm = 'mockTerm';
      scope.activateSearch(scope.searchTerm);
      expect(scope.searchString).toEqual(scope.searchTerm);
      expect(scope.limit).toBe(15);
      expect(scope.limitResults).toBe(true);
      expect(scope.resultCount).toBe(0);
      expect(scope.searchResults).toEqual([]);
      expect(scope.search).toHaveBeenCalled();
    });

    it('should set noSearchResults to false if searchTerm is equal to searchString ', function () {
      var searchTerm = 'mockTerm';
      scope.searchString = 'mockTerm';
      scope.activateSearch(searchTerm);
      expect(scope.searchString).toEqual(searchTerm);
      expect(scope.noSearchResults).toBe(false);
    });
  });

  describe('selectResult function ->', function () {
    it('should set scope variables when selectedServices as an array ', function () {
      scope.serviceCode = {
        Data: {
          SwiftPickServiceCodes: [
            { Code: 0, Value: 'service0' },
            { Code: 1, Value: 'service1' },
            { Code: 2, Value: 'service2' },
          ],
        },
      };
      var selectedServices = [
        { Code: 3, Value: 'service3' },
        { Code: 4, Value: 'service4' },
      ];

      scope.selectResult(selectedServices);
      expect(scope.serviceCode.Data.SwiftPickServiceCodes.length).toEqual(5);
    });

    it('should set scope variables when selectedServices as object ', function () {
      scope.serviceCode = {
        Data: {
          SwiftPickServiceCodes: [
            { Code: 0, Value: 'service0' },
            { Code: 1, Value: 'service1' },
            { Code: 2, Value: 'service2' },
          ],
        },
      };
      var selectedServices = { Code: 3, Value: 'service3' };

      scope.selectResult(selectedServices);
      expect(scope.serviceCode.Data.SwiftPickServiceCodes.length).toEqual(4);
    });
  });

  describe('showServiceCodePicker function ->', function () {
    //select service codes from list
    it('showServiceCodePicker should open modal for adding service codes for swift code', function () {
      // Add workflow happens in a modal.
      scope.showServiceCodesPicker();
      expect(modalFactory.Modal).toHaveBeenCalledWith({
        templateUrl:
          'App/BusinessCenter/service-code/service-codes-picker-modal/service-codes-picker-modal.html',
        keyboard: false,
        size: 'lg',
        windowClass: 'center-modal',
        backdrop: 'static',
        controller: 'ServiceCodesPickerModalController',
        amfa: 'soar-biz-bsvccd-spcasc',
        resolve: {},
      });
    });
  });
});
