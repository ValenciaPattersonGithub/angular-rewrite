describe('InformedConsentAgreementController ->', function () {
  var scope, ctrl, localize, informedConsentFactory, routeParams, usersFactory;
  var referenceDataService, fileService, locationService;
  //#region mocks
  var userValue = { Value: { ProviderId: '123456', UserCode: 'DODO2' } };

  var currentLocation = {
    name: '45 Hickory Industrial Ct.',
    id: '4',
  };

  var fileAllocationIdMock = '999';
  var patientIdMock = '222';

  var serviceTransactionsMock = [
    {
      ServiceTransaction: {
        ServiceTransactionId: 1,
        ServiceTransactionStatusId: 1,
      },
    },
    {
      ServiceTransaction: {
        ServiceTransactionId: 2,
        ServiceTransactionStatusId: 1,
      },
    },
    {
      ServiceTransaction: {
        ServiceTransactionId: 3,
        ServiceTransactionStatusId: 6,
      },
    },
    {
      ServiceTransaction: {
        ServiceTransactionId: 4,
        ServiceTransactionStatusId: 1,
      },
    },
  ];

  var mockInformedConsentAgreement = {
    ParentId: '039d23a3-f19b-4e23-897e-1b4f0a24d4d5',
    PatientName: 'Judy Blueyes',
    PatientCode: 'BLUJU1',
    TreatmentPlanId: null,
    TreatmentPlanName: 'Best Option',
    ProviderComments: 'What a deal!',
    Notes: 'All this for only 14.95',
    Message:
      'I understand the recommended treatment for my conditions, the risks of such treatment, any alternatives, and their risks, as well as the consequences of doing nothing. All fees have been explained. All my questions have been answered and I have not been given any guarantees.',
    FileAllocationId: '55e55e447e',
    Services: serviceTransactionsMock,
  };

  //#endregion

  //#region before each

  beforeEach(
    module('Soar.Patient', function ($provide) {
      localStorage.removeItem = jasmine.createSpy().and.callFake(function () {
        //store = {};
      });

      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

      informedConsentFactory = {
        access: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('InformedConsentFactory', informedConsentFactory);

      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);

      usersFactory = {
        access: jasmine.createSpy().and.returnValue({
          View: true,
          Create: true,
        }),
        Users: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
        User: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(userValue),
        }),
      };
      $provide.value('UsersFactory', usersFactory);

      locationService = {
        getCurrentLocation: jasmine
          .createSpy()
          .and.returnValue(currentLocation),
      };
      $provide.value('locationService', locationService);

      fileService = {};
      $provide.value('fileService', fileService);
    })
  );

  var $q;

  beforeEach(inject(function ($rootScope, $controller, _$q_) {
    $q = _$q_;
    // $location mock
    var mocklocation = {
      path: jasmine.createSpy(),
    };

    referenceDataService.getData.and.callFake(function () {
      return $q.resolve([{ LocationId: '4' }]);
    });

    sessionStorage.setItem(
      'userContext',
      JSON.stringify({ Result: { User: { UserId: '123456' } } })
    );

    localStorage.setItem(
      'document_' + fileAllocationIdMock,
      JSON.stringify(mockInformedConsentAgreement)
    );
    routeParams = {
      patientId: patientIdMock,
      fileAllocationId: fileAllocationIdMock,
    };

    scope = $rootScope.$new();
    ctrl = $controller('InformedConsentAgreementController', {
      $scope: scope,
      $location: mocklocation,
      $routeParams: routeParams,
    });
    scope.authAccess.View = true;
  }));

  //#endregion

  //#region tests

  describe('$onInit function -> ', function () {
    it('should call initializeComputedColumns', function () {
      spyOn(ctrl, 'printDisplay');
      ctrl.$onInit();
      expect(ctrl.printDisplay).toHaveBeenCalled();
    });

    it('should call initializeComputedColumns', function () {
      spyOn(ctrl, 'loadDocumentFromStorage');
      ctrl.$onInit();
      expect(ctrl.loadDocumentFromStorage).toHaveBeenCalled();
    });

    it('should call getCurrentUser', function () {
      spyOn(ctrl, 'getCurrentUser');
      ctrl.$onInit();
      expect(ctrl.getCurrentUser).toHaveBeenCalled();
    });

    it('should call getCurrentLocation', function () {
      spyOn(ctrl, 'getCurrentLocation');
      ctrl.$onInit();
      expect(ctrl.getCurrentLocation).toHaveBeenCalled();
    });

    it('should set patientInfo.PatientId', function () {
      ctrl.$onInit();
      expect(scope.patientInfo.PatientId).toEqual('222');
    });
  });

  describe('loadDocumentFromStorage function -> ', function () {
    it('should load informedConsentAgreement from localStorage using localStorageIdentifier', function () {
      ctrl.loadDocumentFromStorage();
      expect(scope.informedConsentAgreement).toEqual(
        mockInformedConsentAgreement
      );
    });

    it('should call localStorage.removeItem', function () {
      ctrl.loadDocumentFromStorage();
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        'document_' + routeParams.fileAllocationId
      );
    });
  });

  describe('getCurrentUser function -> ', function () {
    it('should call usersFactory.User', function () {
      ctrl.getCurrentUser();
      expect(usersFactory.User).toHaveBeenCalled();
    });
  });

  describe('getCurrentLocation function -> ', function () {
    it('should call usersFactory.User', function () {
      ctrl.getCurrentLocation();
      scope.$apply();
      expect(locationService.getCurrentLocation).toHaveBeenCalled();
      expect(referenceDataService.getData).toHaveBeenCalledWith(
        referenceDataService.entityNames.locations
      );
      expect(scope.location).toEqual({ LocationId: '4' });
    });
  });
});
