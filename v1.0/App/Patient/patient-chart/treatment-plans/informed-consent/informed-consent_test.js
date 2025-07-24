describe('InformedConsentController ->', function () {
  var scope, localize, treatmentPlansFactory, listHelper, staticData;
  var modalFactory,
    modalInstance,
    ctrl,
    informedConsentMessageService,
    informedConsentFactory,
    fileService;

  //#region mocks
  var informedConsentMessageMock = {
    Value: { Text: 'Informed Consent Message' },
  };

  var treatmentPlanServicesMock = [
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 1,
        TreatmentPlanGroupNumber: 1,
        ServiceTransactionId: 1,
      },
      ServiceTransaction: {
        ServiceTransactionId: 1,
        ServiceTransactionStatusId: 1,
      },
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 2,
        TreatmentPlanGroupNumber: 1,
        ServiceTransactionId: 2,
      },
      ServiceTransaction: {
        ServiceTransactionId: 2,
        ServiceTransactionStatusId: 1,
      },
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 3,
        TreatmentPlanGroupNumber: 2,
        ServiceTransactionId: 3,
      },
      ServiceTransaction: {
        ServiceTransactionId: 3,
        ServiceTransactionStatusId: 6,
      },
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 4,
        TreatmentPlanGroupNumber: 3,
        ServiceTransactionId: 4,
      },
      ServiceTransaction: {
        ServiceTransactionId: 4,
        ServiceTransactionStatusId: 1,
      },
    },
    {
      TreatmentPlanServiceHeader: {
        TreatmentPlanServiceId: 5,
        TreatmentPlanGroupNumber: 1,
        ServiceTransactionId: 5,
      },
      ServiceTransaction: {
        ServiceTransactionId: 5,
        ServiceTransactionStatusId: 7,
      },
    },
  ];

  var treatmentPlanMock = {
    TreatmentPlanHeader: {
      TreatmentPlanId: 22,
      TreatmentPlanName: 'The Best Option',
    },
    TreatmentPlanServices: treatmentPlanServicesMock,
  };

  var patientMock = {
    PatientCode: 'JUMAY',
    FirstName: 'Judy',
    LastName: 'Mayo',
    MiddleName: 'A',
    PreferredName: 'Slinky',
  };

  var informedConsentMock = {
    PatientCode: null,
    TreatmentPlanId: null,
    TreatmentPlanName: null,
    ProviderComments: '',
    Notes: '',
    Message: '',
    SignatureFileAllocationId: null,
    PatientSignatureFileAllocationId: null,
    WitnessSignatureFileAllocationId: null,
    Services: [],
  };

  var informedConsentServiceMock = {
    ServiceTransactionId: null,
  };

  //#endregion

  //#region before each

  beforeEach(
    module('Soar.Patient', function ($provide) {
      // fileService
      fileService = {
        allocateFile: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(),
        }),
      };
      $provide.value('fileService', fileService);

      listHelper = {
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(null),
      };

      staticData = {
        ServiceTransactionStatuses: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
      };

      localize = {
        getLocalizedString: jasmine.createSpy().and.callFake(function (val) {
          return val;
        }),
      };
      $provide.value('localize', localize);

      treatmentPlansFactory = {};
      $provide.value('TreatmentPlansFactory', treatmentPlansFactory);

      informedConsentFactory = {
        access: jasmine.createSpy().and.returnValue({}),
        InformedConsentDto: jasmine
          .createSpy()
          .and.returnValue(informedConsentMock),
        InformedConsentServiceDto: jasmine
          .createSpy()
          .and.returnValue(informedConsentServiceMock),
        save: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue({}),
        }),
        printUnsigned: jasmine.createSpy().and.returnValue({}),
      };
      $provide.value('InformedConsentFactory', informedConsentFactory);

      informedConsentMessageService = {
        getInformedConsentMessage: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy().and.returnValue(informedConsentMessageMock),
        }),
      };
      $provide.value(
        'InformedConsentMessageService',
        informedConsentMessageService
      );

      modalInstance = {
        close: jasmine.createSpy('modalInstance.close').and.returnValue({}),
        dismiss: jasmine.createSpy('modalInstance.dismiss'),
        result: {
          then: jasmine.createSpy('modalInstance.result.then'),
        },
      };
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    ctrl = $controller('InformedConsentController', {
      $scope: scope,
      ModalFactory: modalFactory,
      $uibModalInstance: modalInstance,
      informedConsentCallback: {},
      patient: patientMock,
      treatmentPlan: treatmentPlanMock,
      ListHelper: listHelper,
      StaticData: staticData,
    });
  }));

  //#endregion

  //#region tests

  describe('init function -> ', function () {
    it('should call initializeComputedColumns', function () {
      spyOn(ctrl, 'initializeComputedColumns');
      ctrl.init();
      expect(ctrl.initializeComputedColumns).toHaveBeenCalled();
    });
  });

  describe('initializeComputedColumns function -> ', function () {
    it('should set computed columns for each treatment plan service', function () {
      ctrl.initializeComputedColumns();
      angular.forEach(
        scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          expect(tps.$$StageSelected).toBe(true);
          expect(tps.$$Status).toEqual(tps.ServiceTransaction.ScheduledStatus);
        }
      );
    });

    it('should set $$AddToConsent and $$SelectDisabled) based on whether serviceTransaction status is proposed or accepted', function () {
      ctrl.initializeComputedColumns();
      angular.forEach(
        scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          if (
            tps.ServiceTransaction.ServiceTransactionStatusId === 1 ||
            tps.ServiceTransaction.ServiceTransactionStatusId === 7
          ) {
            expect(tps.ServiceTransaction.$$AddToConsent).toBe(true);
            expect(tps.$$SelectDisabled).toBe(false);
          } else {
            expect(tps.ServiceTransaction.$$AddToConsent).toBe(false);
            expect(tps.$$SelectDisabled).toBe(true);
          }
        }
      );
    });
  });

  describe('generateInformedConsent function -> ', function () {
    beforeEach(function () {
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
    });

    it('should initialize informedConsentMessagge if user has create access', function () {
      scope.authAccess.Create = true;
      scope.generateInformedConsent();
      expect(scope.informedConsent.PatientCode).toEqual(
        patientMock.PatientCode
      );
      expect(scope.informedConsent.TreatmentPlanId).toEqual(
        treatmentPlanMock.TreatmentPlanHeader.TreatmentPlanId
      );
      expect(scope.informedConsent.TreatmentPlanName).toEqual(
        treatmentPlanMock.TreatmentPlanHeader.TreatmentPlanName
      );
    });

    it('should call addServicesToInformedConsent  if user has create access', function () {
      scope.authAccess.Create = true;
      spyOn(ctrl, 'addServicesToInformedConsent');
      scope.generateInformedConsent();
      expect(ctrl.addServicesToInformedConsent).toHaveBeenCalled();
    });

    it('should call getInformedConsentMessage if user has create access', function () {
      scope.authAccess.Create = true;
      spyOn(ctrl, 'getInformedConsentMessage');
      scope.generateInformedConsent();
      expect(ctrl.getInformedConsentMessage).toHaveBeenCalled();
    });

    it('should not call addServicesToInformedConsent or getInformedConsentMessage if user does not have create access', function () {
      scope.authAccess.Create = false;
      spyOn(ctrl, 'addServicesToInformedConsent');
      spyOn(ctrl, 'getInformedConsentMessage');
      scope.generateInformedConsent();
      expect(ctrl.addServicesToInformedConsent).not.toHaveBeenCalled();
      expect(ctrl.getInformedConsentMessage).not.toHaveBeenCalled();
    });
  });

  describe('addServicesToInformedConsent function -> ', function () {
    it('should add ServiceTransactions from treatmentPlan to informedConsentServiceDto if $$AddToConsent = true', function () {
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
      angular.forEach(
        scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          tps.ServiceTransaction.$$AddToConsent = true;
        }
      );
      ctrl.addServicesToInformedConsent();
      expect(scope.informedConsent.Services.length).toEqual(
        scope.treatmentPlan.TreatmentPlanServices.length
      );
    });

    it('should not add ServiceTransactions from treatmentPlan to informedConsentServiceDto if $$AddToConsent = false', function () {
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
      angular.forEach(
        scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          tps.ServiceTransaction.$$AddToConsent = false;
        }
      );
      ctrl.addServicesToInformedConsent();
      expect(scope.informedConsent.Services.length).toEqual(0);
    });
  });

  describe('getInformedConsentMessage function -> ', function () {
    it('should call informedConsentMessageService.getInformedConsentMessage', function () {
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
      ctrl.getInformedConsentMessage();
      expect(
        informedConsentMessageService.getInformedConsentMessage
      ).toHaveBeenCalled();
    });
  });

  describe('createInformedConsent function -> ', function () {
    it('should call informedConsentFactory.save if user has create access', function () {
      scope.authAccess.Create = true;
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
      scope.createInformedConsent();
      expect(informedConsentFactory.save).toHaveBeenCalled();
    });

    it('should not call informedConsentFactory.save if user does not have create access', function () {
      scope.authAccess.Create = false;
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
      scope.createInformedConsent();
      expect(informedConsentFactory.save).not.toHaveBeenCalled();
    });
  });

  describe('closeModal function -> ', function () {
    it('should close the modal window', function () {
      scope.closeModal();
      expect(modalInstance.close).toHaveBeenCalled();
    });
  });

  describe('checkSelected function -> ', function () {
    beforeEach(function () {
      // preset $$AddToConsent to false for all eligible services
      angular.forEach(
        scope.treatmentPlan.TreatmentPlanServices,
        function (tps) {
          if (
            tps.ServiceTransaction.ServiceTransactionStatusId === 1 ||
            tps.ServiceTransaction.ServiceTransactionStatusId === 7
          ) {
            tps.ServiceTransaction.$$AddToConsent = false;
          }
        }
      );
    });

    it('should set noneSelected to true if no services are selected', function () {
      scope.checkSelected();
      expect(scope.noneSelected).toBe(true);
    });

    it('should set noneSelected to false if at least one service selected', function () {
      scope.treatmentPlan.TreatmentPlanServices[0].ServiceTransaction.$$AddToConsent = true;
      scope.checkSelected();
      expect(scope.noneSelected).toBe(false);
    });
  });

  describe('selectAllForStage function -> ', function () {
    beforeEach(function () {
      // preset $$AddToConsent to false for all eligible services
      angular.forEach(scope.treatmentPlanServices, function (tps) {
        if (
          tps.ServiceTransaction.ServiceTransactionStatusId === 1 ||
          tps.ServiceTransaction.ServiceTransactionStatusId === 7
        ) {
          tps.ServiceTransaction.$$AddToConsent = false;
        }
      });
    });

    it('should set $$AddToConsent to flag value for all services in stage', function () {
      var stage = 1;
      var flag = true;
      scope.selectAllForStage(stage, flag);
      angular.forEach(scope.treatmentPlanServices, function (tps) {
        if (
          (tps.ServiceTransaction.ServiceTransactionStatusId === 1 ||
            tps.ServiceTransaction.ServiceTransactionStatusId === 7) &&
          tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber == stage
        ) {
          expect(tps.ServiceTransaction.$$AddToConsent).toBe(true);
        }
        if (
          (tps.ServiceTransaction.ServiceTransactionStatusId === 1 ||
            tps.ServiceTransaction.ServiceTransactionStatusId === 7) &&
          tps.TreatmentPlanServiceHeader.TreatmentPlanGroupNumber !== stage
        ) {
          expect(tps.ServiceTransaction.$$AddToConsent).toBe(false);
        }
      });
    });

    it('should not set $$AddToConsent to flag value for all services not in stage', function () {});
  });

  describe('getPatientInfo function -> ', function () {
    it('should set patientName based on patient and best practices', function () {
      ctrl.getPatientInfo();
      expect(scope.patientName).toEqual('Judy (Slinky) A. Mayo');
    });
  });

  describe('addStatusNameToService function -> ', function () {
    it('should set treatmentPlan.TreatmentPlanService.ServiceTransaction.$$ServiceTransactionStatusName', function () {
      var tps = { ServiceTransaction: {} };
      var status = { Name: 'Status' };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(status);
      ctrl.addStatusNameToService(tps);
      expect(tps.ServiceTransaction.$$ServiceTransactionStatusName).toEqual(
        status.Name
      );
    });
  });

  describe('getServiceTransactionStatuses function -> ', function () {
    it('should call  staticData.ServiceTransactionStatuses', function () {
      ctrl.getServiceTransactionStatuses();
      expect(staticData.ServiceTransactionStatuses).toHaveBeenCalled();
    });
  });

  describe('printUnsignedInformedConsent function -> ', function () {
    it('should informedConsentFactory.printUnsigned with informedConsent and patient', function () {
      scope.authAccess.View = true;
      scope.printUnsignedInformedConsent();
      expect(informedConsentFactory.printUnsigned).toHaveBeenCalledWith(
        scope.informedConsent,
        scope.patient
      );
    });
  });

  describe('watch informedConsent.SignatureFileAllocationId when PatientSignatureFileAllocationId is null -->', function () {
    beforeEach(function () {
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
      scope.hasSignatures = false;
    });

    it('should PatientSignatureFileAllocationId to nv ', function () {
      scope.informedConsent.SignatureFileAllocationId = null;
      scope.$apply();
      scope.informedConsent.SignatureFileAllocationId = '456';
      scope.$apply();
      expect(scope.informedConsent.PatientSignatureFileAllocationId).toBe(
        '456'
      );
    });

    it('should SignatureFileAllocationId to null', function () {
      scope.informedConsent.SignatureFileAllocationId = null;
      scope.$apply();
      scope.informedConsent.SignatureFileAllocationId = '456';
      scope.$apply();
      expect(scope.informedConsent.SignatureFileAllocationId).toBe(null);
    });
  });

  describe('watch informedConsent.SignatureFileAllocationId when PatientSignatureFileAllocationId is not null -->', function () {
    beforeEach(function () {
      scope.informedConsent = informedConsentFactory.InformedConsentDto();
      scope.informedConsent.SignatureFileAllocationId = '123';
      scope.hasSignatures = false;
    });

    it('should WitnessSignatureFileAllocationId to nv ', function () {
      scope.informedConsent.SignatureFileAllocationId = null;
      scope.$apply();
      scope.informedConsent.SignatureFileAllocationId = '456';
      scope.$apply();
      expect(scope.informedConsent.WitnessSignatureFileAllocationId).toBe(
        '456'
      );
    });

    it('should hasSignatures to true', function () {
      scope.informedConsent.SignatureFileAllocationId = null;
      scope.$apply();
      scope.informedConsent.SignatureFileAllocationId = '456';
      scope.$apply();
      expect(scope.hasSignatures).toBe(true);
    });
  });

  //#endregion
});
