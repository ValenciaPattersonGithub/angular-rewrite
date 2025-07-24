describe('predetermination-authorization', function () {
  var ctrl,
    scope,
    q,
    location,
    localize,
    claimService,
    toastrFactory,
    modalFactoryMock,
    modalFactoryDeferred,
    $routeParamsMock,
    documentServiceMock,
    documentsLoadingServiceMock,
    claimServiceDeferred;

  beforeEach(module('Soar.Common'));
  beforeEach(module('Soar.Schedule'));
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

  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    q = $q;

    scope.dataForCrudOperation = {
      BreadCrumbs: [{ path: '', name: '' }],
    };

    //mock claimService
    claimService = {
      get: jasmine.createSpy(),
      updateClaimEntityDocumentId: jasmine.createSpy(),
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
      updateCarrierResponse: jasmine.createSpy(
        'claimsService.updateCarrierResponse'
      ),
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

    ctrl = $controller('PredeterminationAuthorizationController', {
      $scope: scope,
      $location: location,
      toastrFactory: toastrFactory,
      localize: localize,
      ClaimsService: claimService,
      $routeParams: $routeParamsMock,
      DocumentsLoadingService: documentsLoadingServiceMock,
      DocumentService: documentServiceMock,
    });
  }));

  // describe('initial values -> ',
  //  function () {
  //      it('controller should exist',
  //          function () {
  //              expect(ctrl).not.toBeNull();
  //          });
  //  });

  // describe('ctrl.updateBreadCrumbs', function() {
  //     it('should set second breadcrumb name to \'View Carrier Response\' when response has been received', function() {
  //         scope.claim = {
  //           IsReceived: true
  //         };
  //         ctrl.updateBreadCrumbs();
  //         expect(scope.dataForCrudOperation.BreadCrumbs[0].name).toEqual("Claims & Predeterminations");
  //         expect(scope.dataForCrudOperation.BreadCrumbs[0].path).toEqual("BusinessCenter/Insurance/Claims");
  //         expect(scope.dataForCrudOperation.BreadCrumbs[1].name).toEqual("View Carrier Response");
  //     });

  //     it('should set second breadcrumb name to \'Enter Carrier Response\' when response has been received', function () {
  //         scope.claim = {
  //             IsReceived: false
  //         };
  //         ctrl.updateBreadCrumbs();
  //         expect(scope.dataForCrudOperation.BreadCrumbs[0].name).toEqual("Claims & Predeterminations");
  //         expect(scope.dataForCrudOperation.BreadCrumbs[0].path).toEqual("BusinessCenter/Insurance/Claims");
  //         expect(scope.dataForCrudOperation.BreadCrumbs[1].name).toEqual("Enter Carrier Response");
  //     });
  // });

  // describe('ctrl.getClaimSuccess ->', function () {
  //     beforeEach(function () {
  //         claimService.getClaimEntityByClaimId =
  //             jasmine.createSpy()
  //             .and.callFake(function() {
  //                 claimServiceDeferred = q.defer();
  //                 claimServiceDeferred.resolve(1);
  //                 return {
  //                     result: claimServiceDeferred.promise,
  //                     then: function() {}
  //                 };
  //             });
  //     });
  //     it('should call patientInsurancePaymentFactory.getClaimServices and claimService.getClaimEntityByClaimId', function () {
  //         ctrl.getClaimSuccess({ Value: { CarrierResponseDetail: { PatientLastName: 'Steve' } } });
  //     });
  // });

  // describe('ctrl.getPredeterminationMetadata ->', function () {
  //     it('should call documentService.getByDocumentId if the predetermination has a document uploaded', function () {
  //         scope.claim = {
  //             DocumentId: 1
  //         };
  //         ctrl.getPredeterminationMetadata();
  //         expect(documentServiceMock.getByDocumentId).toHaveBeenCalled();
  //     });
  // });

  // describe('ctrl.getPredeterminationMetadataSuccess ->', function () {
  //     it('should set $scope.preDMetadata.', function () {
  //         var res = {
  //             Value: {
  //                 Item: 1,
  //                 Item2: 2
  //             }
  //         };
  //         ctrl.getPredeterminationMetadataSuccess(res);
  //         expect(scope.preDMetadata).toEqual(res.Value);
  //     });
  // });

  // describe('scope.cancelCarrierResponse ->', function () {
  //     it('should call $location.path.', function () {
  //         scope.dataForCrudOperation = {
  //             BreadCrumbs: [
  //                 {
  //                     path: "1"
  //                 }
  //             ]
  //         };
  //         scope.cancelCarrierResponse();
  //         expect(location.path).toHaveBeenCalled();
  //     });
  // });

  // describe('ctrl.failure ->', function () {
  //     it('should call toastrFactory.error.', function () {
  //         ctrl.failure("message")();
  //         expect(toastrFactory.error).toHaveBeenCalled();
  //     });
  // });

  // describe('$scope.viewPredeterminationDocument ->', function () {
  //     beforeEach(function() {
  //         scope.preDMetadata = {
  //             FileAllocationId: 1
  //         };
  //     });
  //     it('should call documentsLoadingService.executeDownload', function () {

  //         scope.viewPredeterminationDocument();
  //         expect(documentsLoadingServiceMock.executeDownload).toHaveBeenCalled();
  //     });
  // });

  // describe('$scope.saveCarrierResponse ->', function () {
  //     it('should call claimsService.updateCarrierResponse', function () {
  //         scope.claim = {};
  //         scope.saveCarrierResponse();
  //         expect(claimService.updateCarrierResponse).toHaveBeenCalled();
  //     });
  // });

  // describe('$scope.saveCarrierResponseSuccess ->', function () {
  //     it('should call toastrFactory.success and start close claim process', function () {
  //         scope.pdaChkBox = true;
  //         spyOn(ctrl, "closeClaim");
  //         ctrl.saveCarrierResponseSuccess();
  //         expect(toastrFactory.success).toHaveBeenCalled();
  //         expect(ctrl.closeClaim).toHaveBeenCalled();
  //     });
  //     it('should call toastrFactory.success and not start close claim process', function () {
  //         scope.pdaChkBox = false;
  //         spyOn(ctrl, "closeClaim");
  //         ctrl.saveCarrierResponseSuccess();
  //         expect(toastrFactory.success).toHaveBeenCalled();
  //         expect(ctrl.closeClaim).not.toHaveBeenCalled();
  //     });

  // });

  // describe('scope.onUpLoadCancel method', function () {

  //     beforeEach(function () {
  //         scope.docCtrls = {
  //             close: jasmine.createSpy()
  //         };
  //     });

  //     it('should call docCtrls.close()', function () {
  //         scope.onUpLoadCancel();
  //         expect(scope.docCtrls.close).toHaveBeenCalled();
  //     });
  // });

  // describe('scope.onUpLoadSuccess method', function () {
  //     var doc = {};
  //     beforeEach(function () {
  //         scope.docCtrls = {
  //             close: jasmine.createSpy()
  //         };
  //         doc = {DocumentId:1234};
  //         scope.claim = {IsReceived: false, DocumentId: null};
  //     });

  //     it('should call docCtrls.close()', function () {
  //         scope.onUpLoadSuccess(doc);
  //         expect(scope.docCtrls.close).toHaveBeenCalled();
  //     });
  // });
});
