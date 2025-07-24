describe('Controller: DeleteInsurancePaymentController', function () {
  var ctrl,
    scope,
    toastrFactory,
    listHelper,
    routeParams,
    saveStates,
    patSecurityService,
    modalFactoryDeferred,
    deleteInsurancePaymentFactory,
    patientServices,
    modalFactory,
    mockLocation,
    q,
    userSettingsDataService,
    timeout,
    closeClaimOptionsService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $q,
    $routeParams
  ) {
    scope = $rootScope.$new();
    scope.onEdit = jasmine.createSpy().and.returnValue('');
    q = $q;
    routeParams = $routeParams;

    //mock for deleteInsurancePaymentFactory
    deleteInsurancePaymentFactory = {
      deleteInsurancePayment: jasmine.createSpy().and.returnValue({
        then: function () {},
      }),
    };

    //mock for toaster functionality
    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    //mock for listHelper service
    listHelper = {
      findItemByFieldValue: jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({
          BenefitPlanId: '00000000-0000-0000-0000-000000000000',
          PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
        }),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
    };

    //mock for location
    mockLocation = {
      path: jasmine.createSpy(),
    };

    closeClaimOptionsService = {
      open: jasmine.createSpy(),
      allowEstimateOption: jasmine.createSpy().and.returnValue(false),
    };

    //mock of ModalFactory
    modalFactory = {
      Modal: jasmine.createSpy().and.callFake(function () {
        modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
      ConfirmModal: jasmine
        .createSpy('modalFactory.ConfirmModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
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
    };

    //mock for patientServices
    patientServices = {
      Tax: {
        get: jasmine
          .createSpy('')
          .and.returnValue({ $promise: 'tax calculation promise' }),
      },
      Claim: {
        getClaimsByInsuarncePaymentId: jasmine
          .createSpy('patientServices.Claim.getClaimsByInsuarncePaymentId')
          .and.returnValue({ $promise: {} }),
      },
      CreditTransactions: {
        getCreditTransactionByIdForAccount: jasmine
          .createSpy(
            'patientServices.CreditTransactions.getCreditTransactionByIdForAccount'
          )
          .and.returnValue({ $promise: {} }),
      },
      PatientBenefitPlan: {
        get: jasmine
          .createSpy('patientServices.PatientBenefitPlan.get')
          .and.returnValue({ $promise: {} }),
      },
    };

    //mock for patSecurityService
    patSecurityService = {
      IsAuthorizedByAbbreviation: jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true),
      generateMessage: jasmine
        .createSpy('patSecurityService.generateMessage')
        .and.returnValue(''),
    };
    timeout = $injector.get('$timeout');

    ctrl = $controller('DeleteInsurancePaymentController', {
      $scope: scope,
      ListHelper: listHelper,
      SaveStates: saveStates,
      $location: mockLocation,
      toastrFactory: toastrFactory,
      patSecurityService: patSecurityService,
      PatientServices: patientServices,
      ModalFactory: modalFactory,
      DeleteInsurancePaymentFactory: deleteInsurancePaymentFactory,
      userSettingsDataService: {
        isNewNavigationEnabled: function () {
          return false;
        },
      },
      CloseClaimOptionsService: closeClaimOptionsService,
    });
  }));

  //controller
  describe('DeleteInsurancePaymentController ->', function () {
    it('should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should check processingLastClaim set to false', function () {
      expect(scope.isProcessingLastClaim).toBe(false);
    });
  });

  describe('showNextAndProcess ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'calculateEstimatedInsuranceOption').and.returnValue({
        then: jasmine.createSpy().and.returnValue(true),
      });
    });
    it('should set isProcessingLastClaim to true', function () {
      ctrl.claimIndexToProcess = 0;
      ctrl.insurancePaymentClaims = [
        {
          AccountId: 'c58f0d73-902c-e611-a598-005056bd4a30',
          AccountMemberId: 'c68f0d73-902c-e611-a598-005056bd4a30',
          ApplyInsurancePaymentBackToPatientBenifit: true,
          BenefitPlanId: '00000000-0000-0000-0000-000000000000',
          CarrierId: '00000000-0000-0000-0000-000000000000',
          CarrierName: null,
          ClaimEntityId: '00000000-0000-0000-0000-000000000000',
          ClaimId: '36ddbc49-932c-e611-a598-005056bd4a30',
          DataTag: null,
          DateModified: '0001-01-01T00:00:00',
          DisplayDate: '6/7/2016',
          LocationId: 3,
          MaxServiceDate: '2016-06-07T00:00:00',
          MinServiceDate: '2016-06-07T00:00:00',
          PaidInsuranceEstimate: 45,
          PatientId: 'c48f0d73-902c-e611-a598-005056bd4a30',
          PatientName: 'Patient One',
          PrimaryClaim: 'Primary Claim',
        },
      ];
      spyOn(ctrl, 'setupNextClaimForUI');
      scope.showNextAndProcess();
      expect(scope.isProcessingLastClaim).toBe(true);
    });

    it('should call factory-> deleteInsurancePayment method', function () {
      ctrl.claimIndexToProcess = 1;
      ctrl.insurancePaymentClaims = [
        {
          AccountId: 'c58f0d73-902c-e611-a598-005056bd4a30',
          AccountMemberId: 'c68f0d73-902c-e611-a598-005056bd4a30',
          ApplyInsurancePaymentBackToPatientBenifit: true,
          BenefitPlanId: '00000000-0000-0000-0000-000000000000',
          CarrierId: '00000000-0000-0000-0000-000000000000',
          CarrierName: null,
          ClaimEntityId: '00000000-0000-0000-0000-000000000000',
          ClaimId: '36ddbc49-932c-e611-a598-005056bd4a30',
          DataTag: null,
          DateModified: '0001-01-01T00:00:00',
          DisplayDate: '6/7/2016',
          LocationId: 3,
          MaxServiceDate: '2022-06-07T00:00:00',
          MinServiceDate: '2022-06-07T00:00:00',
          PaidInsuranceEstimate: 45,
          PatientId: 'c48f0d73-902c-e611-a598-005056bd4a30',
          PatientName: 'Patient One',
          PrimaryClaim: 'Primary Claim',
        },
      ];
      scope.claimToProcess = ctrl.insurancePaymentClaims[0];
      ctrl.patientBenefitPlans = [
        {
          BenefitPlanId: '00000000-0000-0000-0000-000000000000',
          PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
        },
      ];
      scope.showNextAndProcess();
      jasmine
        .createSpy('deleteInsurancePaymentFactory.deleteInsurancePayment')
        .and.returnValue({
          $promise: {
            then: function () {
              expect(
                deleteInsurancePaymentFactory.deleteInsurancePayment
              ).toHaveBeenCalled();
            },
          },
        });
    });

    it('should call ctrl.calculateEstimatedInsuranceOption method when recreating a claim', function () {
      ctrl.claimIndexToProcess = 1;
      ctrl.insurancePaymentClaims = [
        {
          AccountId: 'c58f0d73-902c-e611-a598-005056bd4a30',
          AccountMemberId: 'c68f0d73-902c-e611-a598-005056bd4a30',
          ApplyInsurancePaymentBackToPatientBenifit: true,
          BenefitPlanId: '00000000-0000-0000-0000-000000000000',
          CarrierId: '00000000-0000-0000-0000-000000000000',
          CarrierName: null,
          ClaimEntityId: '00000000-0000-0000-0000-000000000000',
          ClaimId: '36ddbc49-932c-e611-a598-005056bd4a30',
          DataTag: null,
          DateModified: '0001-01-01T00:00:00',
          DisplayDate: '6/7/2016',
          LocationId: 3,
          MaxServiceDate: '2016-06-07T00:00:00',
          MinServiceDate: '2016-06-07T00:00:00',
          PaidInsuranceEstimate: 45,
          PatientId: 'c48f0d73-902c-e611-a598-005056bd4a30',
          PatientName: 'Patient One',
          PrimaryClaim: 'Primary Claim',
          RecreateClaim: true,
        },
      ];
      scope.claimToProcess = ctrl.insurancePaymentClaims[0];
      ctrl.patientBenefitPlans = [
        {
          BenefitPlanId: '00000000-0000-0000-0000-000000000000',
          PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
        },
      ];
      scope.showNextAndProcess();
      expect(ctrl.calculateEstimatedInsuranceOption).toHaveBeenCalled();
    });

    it('should call ctrl.calculateEstimatedInsuranceOption if if scope.claimToProcess.BenefitPlanId has match in PatientBenefitPlans for this patient and claim.Status is not 8 ', function () {
      ctrl.claimIndexToProcess = 1;
      ctrl.insurancePaymentClaims = [
        {
          BenefitPlanId: '12345',
          CarrierId: '00000000-0000-0000-0000-000000000000',
          ClaimId: '36ddbc49-932c-e611-a598-005056bd4a30',
          RecreateClaim: true,
          Status: '7',
        },
      ];
      scope.claimToProcess = ctrl.insurancePaymentClaims[0];
      ctrl.patientBenefitPlans = [
        {
          BenefitPlanId: '12345',
          PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
        },
      ];
      scope.showNextAndProcess();
      expect(ctrl.calculateEstimatedInsuranceOption).toHaveBeenCalled();
    });

    it('should not call ctrl.calculateEstimatedInsuranceOption if scope.claimToProcess.BenefitPlanId does not match any PatientBenefitPlans for this patient and claim.Status is not 8', function () {
      ctrl.claimIndexToProcess = 1;
      ctrl.insurancePaymentClaims = [
        {
          BenefitPlanId: '12345',
          CarrierId: '00000000-0000-0000-0000-000000000000',
          ClaimId: '36ddbc49-932c-e611-a598-005056bd4a30',
          RecreateClaim: true,
          Status: '7',
        },
      ];
      scope.claimToProcess = ctrl.insurancePaymentClaims[0];
      ctrl.patientBenefitPlans = [
        {
          BenefitPlanId: '123456',
          PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
        },
      ];
      scope.showNextAndProcess();
      expect(ctrl.calculateEstimatedInsuranceOption).not.toHaveBeenCalled();
    });
  });

  describe('setupNextClaimForUI  ->', function () {
    it('should set current processing claim in to scope variable', function () {
      ctrl.claimIndexToProcess = 0;
      ctrl.insurancePaymentClaims = [
        {
          AccountId: 'c58f0d73-902c-e611-a598-005056bd4a30',
          AccountMemberId: 'c68f0d73-902c-e611-a598-005056bd4a30',
          ApplyInsurancePaymentBackToPatientBenifit: true,
          CarrierId: '00000000-0000-0000-0000-000000000000',
          CarrierName: null,
          ClaimEntityId: '00000000-0000-0000-0000-000000000000',
          ClaimId: '36ddbc49-932c-e611-a598-005056bd4a30',
          DataTag: null,
          DateModified: '0001-01-01T00:00:00',
          DisplayDate: '6/7/2016',
          LocationId: 3,
          MaxServiceDate: '2016-06-07T00:00:00',
          MinServiceDate: '2016-06-07T00:00:00',
          PaidInsuranceEstimate: 45,
          PatientId: 'c48f0d73-902c-e611-a598-005056bd4a30',
          PatientName: 'Patient One',
          PrimaryClaim: 'Primary Claim',
        },
      ];
      spyOn(ctrl, 'getPaidInsuranceEstimate').and.returnValue(50);
      ctrl.setupNextClaimForUI();
      expect(ctrl.claimIndexToProcess).toBe(1);
    });
  });

  describe('getPaidInsuranceEstimate ->', function () {
    it('should return paid insurance estimate', function () {
      var claim = {
        ServiceTransactionToClaimPaymentDtos: [
          {
            AccountMemberId: 'c68f0d73-902c-e611-a598-005056bd4a30',
            Balance: 225,
            Charges: 400,
            ClaimId: '36ddbc49-932c-e611-a598-005056bd4a30',
            DataTag: null,
            DateEntered: '2016-06-07T09:35:38.581',
            DateModified: '0001-01-01T00:00:00',
            Description:
              'D0120: periodic oral evaluation - established patient (D0120)',
            EncounterId: '742cb631-932c-e611-a598-005056bd4a30',
            InsuranceEstimate: 65,
            OriginalInsuranceEstimate: 175,
            PaidInsuranceEstimate: 110,
            PatientName: 'Patient One',
            ProviderName: 'Radha  S',
            ProviderUserId: '0e39c1c7-902c-e611-a598-005056bd4a30',
            ServiceTransactionId: '752cb631-932c-e611-a598-005056bd4a30',
            ServiceTransactionToClaimId: '00000000-0000-0000-0000-000000000000',
            UserModified: '00000000-0000-0000-0000-000000000000',
          },
        ],
      };
      ctrl.currentPaymentTransaction = {
        AccountId: 'c58f0d73-902c-e611-a598-005056bd4a30',
        AdjustmentTypeId: null,
        Amount: -100,
        CreditTransactionDetails: [
          {
            AccountMemberId: 'c68f0d73-902c-e611-a598-005056bd4a30',
            AllAccountMembersSelected: false,
            Amount: -100,
            AppliedToDebitTransactionId: null,
            AppliedToServiceTransationId:
              '752cb631-932c-e611-a598-005056bd4a30',
            CreditTransactionDetailId: 'f0a5ba0a-3631-e611-960d-005056bd6508',
            CreditTransactionId: 'efa5ba0a-3631-e611-960d-005056bd6508',
          },
        ],
      };
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(
          ctrl.currentPaymentTransaction.CreditTransactionDetails[0]
        );
      var result = ctrl.getPaidInsuranceEstimate(claim);
      expect(result).toBe('$100.00');
    });
  });

  describe('deleteInsurancePaymentSuccess ->', function () {
    it('should redirect to previous location when insurance payment deleted successfully', function () {
      var response = {};
      scope.PreviousLocationRoute = 'AccountSummary';
      ctrl.deleteInsurancePaymentSuccess(response);
      expect(toastrFactory.success).toHaveBeenCalled();
    });
  });

  describe('deleteInsurancePaymentFailure ->', function () {
    it('should give error toastr message on failure of delete insurance payment', function () {
      var response = {};
      ctrl.deleteInsurancePaymentFailure(response);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('createBreadCrumb ->', function () {
    it('should navigates to Account summary page', function () {
      routeParams.PrevLocation = 'Account Summary';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Account Summary');
    });

    it('should navigates to Transaction History page', function () {
      routeParams.PrevLocation = 'Transaction History';
      ctrl.createBreadCrumb();
      expect(scope.PreviousLocationName).toEqual('Transaction History');
    });
  });

  describe('cancelModal ->', function () {
    it('should call confirm modal when isCancel flag is set to 1', function () {
      var isCancel = 1;
      spyOn(ctrl, 'GotoPreviousPage');
      scope.cancelModal(isCancel);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
      expect(ctrl.GotoPreviousPage).not.toHaveBeenCalled();
    });

    it('should navigate to previous page if isCancel is not set', function () {
      var isCancel = 2;
      spyOn(ctrl, 'GotoPreviousPage');
      scope.cancelModal(isCancel);
      expect(modalFactory.ConfirmModal).not.toHaveBeenCalled();
      expect(ctrl.GotoPreviousPage).toHaveBeenCalled();
    });
  });

  describe('GotoPreviousPage ->', function () {
    it('should navigate to previous location', function () {
      ctrl.GotoPreviousPage();
      expect(mockLocation.path).toHaveBeenCalled();
    });
  });

  describe('pageDataCallSetup ->', function () {
    var res;
    beforeEach(function () {
      spyOn(scope, 'showNextAndProcess');
      res = [
        { Value: { TransactionId: 'c68f0d73-902c-e611-a598-005056bd4a30' } },
        { Value: { BenefitPlanId: '00000000-0000-0000-0000-000000000000' } },
        { Value: { ClaimId: '005056bd-4a30-a598-902c-c68f0d73' } },
      ];
      q.all = jasmine.createSpy('q.all').and.callFake(function () {
        return {
          then: function (callback) {
            callback(res);
          },
        };
      });
    });
    it('should create request call setup to get initial data required to delete the insurance payment', function () {
      var result = ctrl.pageDataCallSetup();
      expect(q.all).toHaveBeenCalled();
      expect(result).not.toBe(null);
    });

    it('should set value of ctrl.currentPaymentTransaction', function () {
      ctrl.pageDataCallSetup();
      expect(ctrl.currentPaymentTransaction).toBe(res[0].Value);
    });

    it('should display error tostr message when failed to retrive payment data', function () {
      res[0].Value = undefined;
      ctrl.pageDataCallSetup();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should set value of ctrl.patientBenefitPlans', function () {
      ctrl.pageDataCallSetup();
      expect(ctrl.patientBenefitPlans).toBe(res[1].Value);
    });

    it('should display error tostr message when failed to retrieve patient benefit plan data', function () {
      res[1].Value = undefined;
      ctrl.pageDataCallSetup();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should set value of ctrl.insurancePaymentClaims', function () {
      ctrl.pageDataCallSetup();
      expect(ctrl.originalInsurancePaymentClaims).toBe(res[2].Value);
      expect(ctrl.insurancePaymentClaims.TransactionId).toBe(
        ctrl.originalInsurancePaymentClaims.TransactionId
      );
    });

    it('should display error tostr message when failed to retrive claim data', function () {
      res[2].Value = undefined;
      ctrl.pageDataCallSetup();
      expect(toastrFactory.error).toHaveBeenCalled();
    });

    it('should call scope.showNextAndProcess method', function () {
      ctrl.pageDataCallSetup();
      expect(scope.showNextAndProcess).toHaveBeenCalled();
    });
  });

  describe('ctrl.calculateEstimatatedInsuranceOption -> ', function () {
    var services = {};
    var plan = {
      PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
    };
    beforeEach(function () {
      plan =
        plan =
        plan =
          {
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
          };
      services = {
        PersonId: '1234',
        Items: [
          {
            Date: '2021-09-12T19:00:16',
            Description:
              'D2140: amalgam - one surface, primary or permanent (D2140)',
            EncounterId: '04df8d69-96ca-41a8-82ac-ff0fbc6f803e',
          },
          {
            Date: '2022-09-12T19:00:16',
            Description: 'D3140: ',
            EncounterId: '05cf8d69-96ca-41a8-82ac-ff0fbc6f803e',
          },
        ],
      };
    });

    // option only available if at least one of the services is from the prior benefit year (determined by the Plan renewal date)
    it('should call closeClaimOptionsService.allowEstimateOption', function () {
      ctrl.calculateEstimatedInsuranceOption(plan, services);
      expect(closeClaimOptionsService.allowEstimateOption).toHaveBeenCalled();
    });
  });

  describe('ctrl.setCanApplyInsurancePaymentBackToPatientBenefit -> ', function () {
    var renewalMonth = 1;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    beforeEach(function () {
      // Calculate the start date for the current benefit plan year 
      var startDateOfBenefitPlanYear = new Date(currentYear, renewalMonth - 1, 1);  
      ctrl.insurancePaymentClaims = [
        {
          BenefitPlanId: 1,
          ServiceTransactionToClaimPaymentDtos: [
            { DateServiceCompleted: new Date(currentYear, 2, 1) },
            { DateServiceCompleted: new Date(currentYear, 2, 1) },
          ],
        },
      ];
  
      ctrl.patientBenefitPlans = [
        {
          BenefitPlanId: renewalMonth,
          PolicyHolderBenefitPlanDto: {
            BenefitPlanDto: { RenewalMonth: renewalMonth },
          },
        },
      ];
    });
    
    it('should set canApplyInsurancePaymentBackToPatientBenefit to true when all service.DateServiceCompleted dates are within the current benefit plan year', function () {
      ctrl.patientBenefitPlans[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.RenewalMonth = 1;
      ctrl.insurancePaymentClaims[0].ServiceTransactionToClaimPaymentDtos.forEach(function (service) {
        service.DateServiceCompleted = new Date(currentYear, 2, 1);
      });
      ctrl.setCanApplyInsurancePaymentBackToPatientBenefit();
      expect(scope.canApplyInsurancePaymentBackToPatientBenefit).toBe(true);
    });

    it('should set canApplyInsurancePaymentBackToPatientBenefit to false when any service transaction is older than the current benefit plan year', function () {
      ctrl.patientBenefitPlans[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.RenewalMonth = 1;
      ctrl.insurancePaymentClaims[0].ServiceTransactionToClaimPaymentDtos[0].DateServiceCompleted = new Date(currentYear - 1, 2, 1);
      ctrl.setCanApplyInsurancePaymentBackToPatientBenefit();
      expect(scope.canApplyInsurancePaymentBackToPatientBenefit).toBe(false);
    });

    it('should set canApplyInsurancePaymentBackToPatientBenefit to true for plans with RenewalMonth = 0', function () {
      ctrl.patientBenefitPlans[0].PolicyHolderBenefitPlanDto.BenefitPlanDto.RenewalMonth = 0;
      ctrl.insurancePaymentClaims[0].ServiceTransactionToClaimPaymentDtos[0].DateServiceCompleted = new Date(currentYear - 1, 2, 1);
      ctrl.setCanApplyInsurancePaymentBackToPatientBenefit();
      expect(scope.canApplyInsurancePaymentBackToPatientBenefit).toBe(true);
    });
  });
});
