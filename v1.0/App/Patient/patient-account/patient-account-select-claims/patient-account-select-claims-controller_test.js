describe('patient-account-select-claims', function () {
  var ctrl,
    scope,
    q,
    location,
    patientInsurancePaymentFactory,
    patientServices,
    modalFactory,
    localize,
    toastrFactory,
    routeParams,
    boundObjectFactory,
    compile,
    currentPatient,
    modalFactoryDeferred,
    mockBusinessCenterServices;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $routeParams,
    $compile
  ) {
    scope = $rootScope.$new();
    q = $q;
    compile = $compile;
    routeParams = $routeParams;

    // Mock for location
    location = {
      path: jasmine.createSpy(),
    };

    // mock patient insurance payment factory
    patientInsurancePaymentFactory = {
      access: jasmine
        .createSpy()
        .and.returnValue({ InsurancePaymentView: false }),
      removeSelectedClaims: jasmine.createSpy(),
      addSelectedClaims: jasmine.createSpy(),
      getClaimServices: jasmine.createSpy(),
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

    mockBusinessCenterServices = {
      Carrier: {
        get: jasmine.createSpy('BusinessCenterServicesCarrier.get'),
      },
    };

    // mock current patient
    currentPatient = {
      Value: [
        {
          ContactId: '1',
          PhoneNumber: '1111111111',
          ObjectState: 'Successful',
          Type: 'Home',
          invalidPhoneNumber: false,
          invalidType: false,
        },
        {
          ContactId: '2',
          PhoneNumber: '2222222222',
          ObjectState: 'Successful',
          Type: 'Home',
          invalidPhoneNumber: false,
          invalidType: false,
        },
        {
          ContactId: '3',
          PhoneNumber: '3333333333',
          ObjectState: 'Successful',
          Type: 'Home',
          invalidPhoneNumber: false,
          invalidType: false,
        },
      ],
    };

    // mock the patient services
    patientServices = {
      Claim: { getClaimsByAccount: jasmine.createSpy() },
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock of ModalFactory
    modalFactory = {
      LoadingModal: jasmine
        .createSpy('modalFactory.LoadingModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    ctrl = $controller('PatientAccountSelectClaimsController', {
      $scope: scope,
      $location: location,
      toastrFactory: toastrFactory,
      ModalFactory: modalFactory,
      localize: localize,
      PatientInsurancePaymentFactory: patientInsurancePaymentFactory,
      BoundObjectFactory: boundObjectFactory,
      currentPatient: currentPatient,
      PatientServices: patientServices,
      userSettingsDataService: {
        isNewNavigationEnabled: function () {
          return false;
        },
      },
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('ctrl.createBreadCrumb -> ', function () {
    it('scope.PreviousLocationName should equal Account Summary', function () {
      routeParams.PrevLocation = 'account summary';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Account Summary');
    });
    it('scope.PreviousLocationName should equal Transaction History', function () {
      routeParams.PrevLocation = 'transaction history';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Transaction History');
    });
    it('scope.PreviousLocationName should equal Patient Overview', function () {
      routeParams.PrevLocation = 'patientoverview';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Patient Overview');
    });
  });

  describe('scope.applyPaymentToClaims -> ', function () {
    it('no claims selected message should be set to true', function () {
      scope.selectedClaimIds = [];
      scope.applyPaymentToClaims();
      expect(scope.noClaimsSelectedMsg).toEqual(true);
    });
  });

  describe('scope.applyPaymentToClaims -> ', function () {
    it('should call removeSelectedClaims, call addSelectedClaims twice, call location.path', function () {
      scope.allClaims = [{ ClaimId: '1' }, { ClaimId: '2' }, { ClaimId: '3' }];
      scope.selectedClaimIds = ['1', '2'];
      scope.applyPaymentToClaims();
      expect(
        patientInsurancePaymentFactory.removeSelectedClaims
      ).toHaveBeenCalled();
      expect(
        patientInsurancePaymentFactory.addSelectedClaims.calls.count()
      ).toEqual(2);
      expect(location.path).toHaveBeenCalled();
    });
  });

  describe('scope.backToPreviousLocation -> ', function () {
    it('should call location.path', function () {
      scope.backToPreviousLocation();
      expect(location.path).toHaveBeenCalled();
    });
  });

  describe('ctrl.getAllClaimsSuccess -> ', function () {
    it('should set the value of allClaims to the response.Value.  methods should be called', function () {
      var response = {
        Value: [
          {
            ClaimId: '1',
            ServiceTransactionToClaimPaymentDtos: [],
          },
        ],
      };
      scope.allClaims = {};
      ctrl.setGridData = jasmine.createSpy();
      ctrl.selectClaimIfOnlyOne = jasmine.createSpy();
      ctrl.getAllClaimsSuccess(response);
      expect(scope.allClaims).toEqual(response.Value);
    });
  });

  describe('ctrl.getAllClaimsFailure -> ', function () {
    it('toastrFactory.error should be called', function () {
      ctrl.getAllClaimsFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.claimChecked -> ', function () {
    var event;
    beforeEach(function () {
      event = {
        target: {
          attributes: {
            getNamedItem: jasmine.createSpy().and.returnValue({}),
          },
        },
      };
    });
    it('should set no claims message to false', function () {
      expect(scope.noClaimsSelectedMsg).toBe(false);
    });
    it('length of array should equal 1', function () {
      scope.selectedClaimIds = [];
      scope.claimChecked(event);
      expect(scope.selectedClaimIds.length).toBe(1);
    });
    it('length of array should equal 2', function () {
      scope.selectedClaimIds = ['1'];
      scope.claimChecked(event);
      expect(scope.selectedClaimIds.length).toBe(2);
    });
  });

  describe('ctrl.selectClaimIfOnlyOne -> ', function () {
    it('should add claim id to array', function () {
      scope.filteredClaims = [{ ClaimId: '1' }];
      ctrl.selectClaimIfOnlyOne();
      expect(scope.selectedClaimIds.length).toBe(1);
    });
  });

  describe('ctrl.callClaimsSetup -> ', function () {
    it('should return call to set up claims', function () {
      var returnResult = ctrl.callClaimsSetup();
      expect(returnResult).not.toEqual(null);
    });
  });

  describe('ctrl.init -> ', function () {
    it('should call ctrl.createBreadCrumb and modalFactory.LoadingModal', function () {
      ctrl.createBreadCrumb = jasmine.createSpy();
      ctrl.init();
      expect(scope.noClaimsFoundMsg).toBe(false);
      expect(ctrl.createBreadCrumb).toHaveBeenCalled();
      expect(modalFactory.LoadingModal).toHaveBeenCalled();
    });
  });
});
