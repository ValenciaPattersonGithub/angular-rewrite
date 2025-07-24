describe('patient-close-claim-controller tests -> ', function () {
  var ctrl,
    modalScope,
    q,
    item,
    mInstance,
    location,
    routeParams,
    localize,
    commonServices,
    claimService,
    claimServiceDeferred,
    toastrFactory,
    compile,
    patientServices,
    modalFactoryMock,
    modalFactoryDeferred,
    uriServiceMock,
    patientInsurancePaymentFactoryMock,
    $routeParamsMock,
    documentServiceMock,
    documentsLoadingServiceMock;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      //mock modal factory
      modalFactoryMock = {
        Modal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.callFake(function () {
            modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
          }),
        LoadingModal: jasmine.createSpy(),
      };
      $provide.value('ModalFactory', modalFactoryMock);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $routeParams,
    $compile
  ) {
    modalScope = $rootScope.$new();
    q = $q;
    compile = $compile;
    routeParams = $routeParams;

    modalScope.dataForCrudOperation = {
      BreadCrumbs: [{ path: '', name: '' }],
    };

    //mock commonServices
    commonServices = {
      Insurance: {
        Claim: {
          getJ430DClaimById: jasmine.createSpy(),
          updateJ430DClaim: jasmine.createSpy(),
        },
      },
    };

    //mock claimService
    claimService = {
      get: jasmine.createSpy(),
      getClaimById: jasmine.createSpy().and.callFake(function () {
        claimServiceDeferred = q.defer();
        claimServiceDeferred.resolve(1);
        return {
          result: claimServiceDeferred.promise,
          then: function () {},
        };
      }),
      updateInsEst: jasmine.createSpy(),
      updateClaimEntity: jasmine.createSpy(),
    };

    // mock patientServices
    patientServices = {
      Predetermination: {
        Close: jasmine.createSpy(),
      },
    };

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
        return val;
      }),
    };

    //mock for location
    location = {
      path: jasmine.createSpy('$location.path'),
    };

    //mock uri services
    uriServiceMock = {
      getWebApiUri: jasmine.createSpy('uriService.getWebApiUri'),
    };

    //mock patient Insurance Payment Factory
    patientInsurancePaymentFactoryMock = {
      getClaimServices: jasmine
        .createSpy('patientInsurancePaymentFactoryMock.getClaimServices')
        .and.callFake(function (object) {
          return [];
        }),
    };

    //mock document service
    documentServiceMock = {
      getByDocumentId: jasmine.createSpy('documentService.getByDocumentId'),
    };

    //mock $routeParams
    $routeParamsMock = {};

    documentsLoadingServiceMock = {
      executeDownload: jasmine.createSpy(
        'documentsLoadingService.executeDownload'
      ),
    };

    item = {
      Claims: [],
    };

    ctrl = $controller('PatientCloseClaimController', {
      $scope: modalScope,
      $location: location,
      toastrFactory: toastrFactory,
      item: item,
      $uibModalInstance: mInstance,
      localize: localize,
      CommonServices: commonServices,
      ClaimsService: claimService,
      PatientServices: patientServices,
      uriService: uriServiceMock,
      PatientInsurancePaymentFactory: patientInsurancePaymentFactoryMock,
      $routeParams: $routeParamsMock,
      DocumentsLoadingService: documentsLoadingServiceMock,
      DocumentService: documentServiceMock,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });
});
