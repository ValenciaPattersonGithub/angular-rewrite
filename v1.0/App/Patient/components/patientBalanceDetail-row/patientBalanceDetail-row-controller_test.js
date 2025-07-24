describe('PatientBalanceDetailRowController ->', function () {
  var ctrl,
    scope,
    listHelper,
    localize,
    timeout,
    toastrFactory,
    patientServices,
    patSecurityService,
    financialService,
    controller,
    rootScope;
  var q,
    filter,
    data,
    element,
    modalFactory,
    modalDataFactory,
    modalFactoryDeferred,
    modalOptions,
    userServices,
    location,
    usersFactory,
    deferred,
    referenceDataService;

  var mockBalances = {
    SelectedMemberBalance: 1,
    SelectedMemberInsurance: 2,
    SelectedMemberPatientPortion: 3,
    TotalBalance: 4,
    TotalInsurance: 5,
    TotalPatientPortion: 6,
    SelectedMemberAdjustedEstimate: 7,
    TotalAdjustedEstimate: 8,
  };

  // function to create instance for the controller
  function createController() {
    ctrl = controller('PatientBalanceDetailRowController', {
      $scope: scope,
      ListHelper: listHelper,
      localize: localize,
      ModalFactory: modalFactory,
      ModalDataFactory: modalDataFactory,
      $filter: filter,
      toastrFactory: toastrFactory,
      PatientServices: patientServices,
      patSecurityService: patSecurityService,
      UserServices: userServices,
      $location: location,
      UsersFactory: usersFactory,
      FinancialService: financialService,
      userSettingsDataService: {
        isNewNavigationEnabled: function () {
          return false;
        },
      },
    });
  }

  beforeEach(
    module('Soar.Patient', function ($provide) {
      referenceDataService = {
        getData: jasmine.createSpy(),
        entityNames: {
          locations: 'locations',
        },
      };

      $provide.value('referenceDataService', referenceDataService);
      $provide.value('PatientDocumentsFactory', {});
    })
  );

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $q, $filter, $injector) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    scope.refreshTransactionHistory = jasmine.createSpy(
      'scope.refreshTransactionHistory'
    );
    scope.refreshSummaryPage = jasmine.createSpy('scope.refreshSummaryPage');
    controller = $controller;
    q = $q;
    filter = $filter;
    localize = $injector.get('localize');
    timeout = $injector.get('$timeout');
    //mock for amfa authorization
    patSecurityService = {
      logout: jasmine.createSpy(),
      IsAuthorizedByAbbreviation: jasmine.createSpy().and.returnValue(true),
      generateMessage: jasmine.createSpy().and.returnValue('This operation'),
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
        .and.returnValue(0),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
    };
    //mock for patientServices
    patientServices = {
      Account: {
        getByPersonId: jasmine.createSpy().and.returnValue(''),
        getAccountMembersDetailByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
        getAllAccountMembersByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      CreditTransactions: {
        getCreditTransactionsByAccountId: jasmine
          .createSpy()
          .and.returnValue(''),
      },
      Patients: {
        get: jasmine
          .createSpy()
          .and.returnValue({ $promise: { then: function () {} } }),
      },
    };
    //mock of ModalFactory
    modalFactory = {
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
      Modal: jasmine
        .createSpy('modalFactory.Modal')
        .and.callFake(function (options) {
          modalOptions = options;
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve('some value in return');
          return { result: modalFactoryDeferred.promise };
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
      TransactionModal: jasmine
        .createSpy('modalFactory.TransactionModal')
        .and.callFake(function (options) {
          modalOptions = options;
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve('some value in return');
          return { result: modalFactoryDeferred.promise };
        }),
    };

    //modalDataFactory mock
    modalDataFactory = {
      GetTransactionModalData: jasmine
        .createSpy('modalDataFactory.GetTransactionModalData')
        .and.returnValue({
          then: jasmine.createSpy(
            'modalDataFactory.GetTransactionModalData.then'
          ),
        }),
    };

    var urlParams = { tab: 'Summary' };
    location = {
      path: jasmine.createSpy(),
      search: jasmine.createSpy().and.returnValue(urlParams),
    };

    //mock for userServices
    userServices = { Users: { get: jasmine.createSpy() } };

    usersFactory = {
      Users: jasmine.createSpy('usersFactory.Users').and.callFake(function () {
        deferred = $q.defer();
        deferred.resolve(1);
        return {
          result: deferred.promise,
          then: function () {},
        };
      }),
    };

    data = {
      value: jasmine.createSpy().and.returnValue(1),
      text: jasmine.createSpy().and.returnValue('a'),
      select: jasmine.createSpy(),
      focus: jasmine.createSpy(),
    };
    element = {
      data: jasmine.createSpy().and.returnValue(data),
    };
    spyOn(angular, 'element').and.returnValue(element);

    scope.data = { currentPatient: { AccountId: 1 } };
    scope.resetData = jasmine.createSpy('scope.resetData');

    financialService = {
      calculateAccountAndInsuranceBalances: jasmine
        .createSpy()
        .and.returnValue(mockBalances),
      CheckForPatientBenefitPlan: jasmine
        .createSpy()
        .and.returnValue({ then: function () {} }),
      CalculateAccountAgingGraphData: jasmine.createSpy(),
    };

    //create controller
    createController();
  }));

  //controller
  it('PatientBalanceDetailRowController : should check if controller exists', function () {
    expect(ctrl).not.toBeNull();
  });

  //authorization
  describe('Access check', function () {
    describe('authAddAccountPaymentAccess function->', function () {
      it('should check if user has access to add account payment by calling patSecurityService service', function () {
        ctrl.authAddAccountPaymentAccess();

        expect(
          patSecurityService.IsAuthorizedByAbbreviation
        ).toHaveBeenCalled();
      });
    });

    describe('authAddCreditTransactionAccess function->', function () {
      it('should check if user has access to add credit transaction by calling patSecurityService service', function () {
        ctrl.authAddCreditTransactionAccess();

        expect(
          patSecurityService.IsAuthorizedByAbbreviation
        ).toHaveBeenCalled();
      });
    });

    describe('authAccess function->', function () {
      it('should check if user has access to add credit transaction by calling authAddCreditTransactionAccess()', function () {
        ctrl.authAccess();

        expect(
          patSecurityService.IsAuthorizedByAbbreviation
        ).toHaveBeenCalled();
      });

      it('should set hasAmfaAuthAccess to true when authAddCreditTransactionAccess() return true', function () {
        spyOn(ctrl, 'authAddCreditTransactionAccess').and.returnValue(true);
        ctrl.authAccess();

        expect(ctrl.authAddCreditTransactionAccess).toHaveBeenCalled();
        expect(scope.hasAmfaAuthAccess).toEqual(true);
      });

      it('should do nothing when authAddCreditTransactionAccess() return false', function () {
        spyOn(ctrl, 'authAddCreditTransactionAccess').and.returnValue(false);
        ctrl.authAccess();

        expect(ctrl.authAddCreditTransactionAccess).toHaveBeenCalled();
        expect(scope.hasAmfaAuthAccess).toEqual(false);
      });
    });

    describe('notifyNotAuthorized function->', function () {
      it('should throw error message when called', function () {
        ctrl.notifyNotAuthorized();

        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });
  });

  //getAllAccountMembersSuccess
  describe('getAllAccountMembersSuccess function ->', function () {
    it('should set allAccountMembersBalance to successResponse.Value when successResponse.Value is not null', function () {
      var successResponse = { Value: {} };

      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(ctrl.allAccountMembersBalance).toBe(successResponse.Value);
    });

    it('should call toastrFactory.error when successResponse.Value is null', function () {
      var successResponse = { Value: null };

      ctrl.getAllAccountMembersSuccess(successResponse);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  //getAllAccountMembersFailure
  describe('getAllAccountMembersFailure function ->', function () {
    it('should call error service', function () {
      ctrl.getAllAccountMembersFailure();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  //updateBalanceDetailRow
  describe('updateBalanceDetailRow function ->', function () {
    it('should call patientServices.Account.getAccountMembersDetailByAccountId to get details of all account members using account id', function () {
      ctrl.updateBalanceDetailRow();
      expect(
        patientServices.Account.getAccountMembersDetailByAccountId
      ).toHaveBeenCalled();
    });

    it('should call patientServices.Account.getAccountMembersDetailByAccountId and should not call function to update summary page grid data when refreshSummaryPage is not of type function', function () {
      scope.refreshSummaryPage = false;

      ctrl.updateBalanceDetailRow(true);
      expect(
        patientServices.Account.getAccountMembersDetailByAccountId
      ).toHaveBeenCalled();
      expect(scope.refreshSummaryPage).toBe(false);
    });

    it('should call patientServices.Account.getAccountMembersDetailByAccountId and should not call function to update transaction history page grid data when refreshTransactionHistory is not of type function', function () {
      scope.refreshTransactionHistory = false;

      ctrl.updateBalanceDetailRow(true);
      expect(
        patientServices.Account.getAccountMembersDetailByAccountId
      ).toHaveBeenCalled();
      expect(scope.refreshTransactionHistory).toBe(false);
    });
  });

  //openPatientPaymentModal
  describe('openPatientPaymentModal function ->', function () {
    it('should call modalDataFactory.GetTransactionModalData to process data required for applying payment if alreadyApplyingPayment is false', function () {
      scope.alreadyApplyingPayment = false;
      scope.openPatientPaymentModal();

      expect(modalDataFactory.GetTransactionModalData).toHaveBeenCalled();
      expect(rootScope.transactionToSearchEncounter).toBe(null);
    });

    it('should not call modalDataFactory.GetTransactionModalData to process data required for applying payment if alreadyApplyingPayment is true', function () {
      scope.alreadyApplyingPayment = true;
      scope.openPatientPaymentModal();

      expect(modalDataFactory.GetTransactionModalData).not.toHaveBeenCalled();
    });

    it('should call modalDataFactory.GetTransactionModalData to process data required for applying payment if user is not authorized for it', function () {
      spyOn(ctrl, 'authAddAccountPaymentAccess').and.returnValue(false);
      scope.alreadyApplyingPayment = false;
      scope.openPatientPaymentModal();

      expect(modalDataFactory.GetTransactionModalData).not.toHaveBeenCalled();
    });
  });

  //calculateBalance
  describe('calculateBalance function ->', function () {
    it('should calculate balance for all account-members and for selected account member', function () {
      scope.selectedPatientId = 1;
      ctrl.allAccountMembersBalance = [
        {
          BalanceCurrent: 100,
          EstimatedInsuranceCurrent: 100,
          PersonId: 1,
          accountMemberId: 1,
          Balance30: 10,
          Balance60: 20,
          Balance90: 20,
          EstimatedInsurance30: 0,
          EstimatedInsurance60: 0,
          EstimatedInsurance90: 0,
          TotalAdjustedEstimate: 0,
        },
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({
          BalanceCurrent: 100,
          BalanceInsurance: 100,
          PersonId: 1,
          accountMemberId: 1,
        });
      ctrl.calculateBalance();
      expect(scope.selectedMemberBalance).toBe(
        mockBalances.SelectedMemberBalance
      );
      expect(scope.totalBalance).toBe(mockBalances.TotalBalance);
    });

    it('should do nothing when allAccountMembersBalance is null', function () {
      scope.selectedPatientId = 1;
      ctrl.allAccountMembersBalance = null;
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue({
          BalanceCurrent: 100,
          PersonId: 1,
          accountMemberId: 1,
        });
      ctrl.calculateBalance();
      expect(scope.selectedMemberBalance).toEqual(0);
      expect(scope.totalBalance).toEqual(0);
    });

    it('should calculate balance for all accountmembers and for selected account member and should set balance for selected accountmember to 0 when account member data is not found in allAccountMembersBalance', function () {
      scope.selectedPatientId = 10;
      ctrl.allAccountMembersBalance = [
        {
          BalanceCurrent: 100,
          PersonId: 1,
          accountMemberId: 1,
          Balance30: 10,
          Balance60: 20,
          Balance90: 20,
          EstimatedInsuranceCurrent: 0,
          EstimatedInsurance30: 0,
          EstimatedInsurance60: 0,
          EstimatedInsurance90: 0,
          TotalAdjustedEstimate: 0,
        },
        {
          BalanceCurrent: 50,
          PersonId: 2,
          accountMemberId: 2,
          Balance30: 10,
          Balance60: 20,
          Balance90: 20,
          EstimatedInsuranceCurrent: 0,
          EstimatedInsurance30: 0,
          EstimatedInsurance60: 0,
          EstimatedInsurance90: 0,
          TotalAdjustedEstimate: 0,
        },
        {
          BalanceCurrent: 50,
          PersonId: 3,
          accountMemberId: 5,
          Balance30: 10,
          Balance60: 20,
          Balance90: 20,
          EstimatedInsuranceCurrent: 0,
          EstimatedInsurance30: 0,
          EstimatedInsurance60: 0,
          EstimatedInsurance90: 0,
          TotalAdjustedEstimate: 0,
        },
      ];
      listHelper.findItemByFieldValue = jasmine
        .createSpy('listHelper.findItemByFieldValue')
        .and.returnValue(null);
      ctrl.calculateBalance();
      expect(scope.selectedMemberBalance).toBe(
        mockBalances.SelectedMemberBalance
      );
      expect(scope.totalBalance).toBe(mockBalances.TotalBalance);
    });
  });

  //loadBalanceSummary
  //describe('loadBalanceSummary function ->', function () {
  //    it('should initialize graphData for filtered account-members', function () {
  //        scope.allAccountMembersBalance = [{ BalanceCurrent: 100, BalanceInsurance: 100, PersonId: 1, accountMemberId: 1, Balance30: 10, Balance60: 20, Balance90: 20 }, { BalanceCurrent: 100, BalanceInsurance: 100, PersonId: 2, accountMemberId: 2, Balance30: 10, Balance60: 20, Balance90: 20 }];
  //        scope.filteredAccountMembers = [1];
  //        listHelper.findItemByFieldValue = jasmine.createSpy('listHelper.findItemByFieldValue').and.returnValue({ BalanceCurrent: 100, BalanceInsurance: 100, PersonId: 1, accountMemberId: 1, Balance30: 10, Balance60: 20, Balance90: 20 });
  //        ctrl.loadBalanceSummary();
  //        expect(scope.graphData.totalPatientPortion).toBe(50);
  //        expect(scope.graphData .totalBalance).toBe(150);
  //    });

  //});

  //describe('watcher filteredAccountMembers ->', function () {
  //    it('should call loadBalanceSummary function to load updated balance distribution summary data if filtered account members are updated from filter or drop down', function () {
  //        scope.allAccountMembersBalance = [{ BalanceCurrent: 100, BalanceInsurance: 100, PersonId: 1, accountMemberId: 1, Balance30: 10, Balance60: 20, Balance90: 20 }, { BalanceCurrent: 100, BalanceInsurance: 100, PersonId: 2, accountMemberId: 2, Balance30: 10, Balance60: 20, Balance90: 20 }];
  //        scope.filteredAccountMembers = [1];
  //        scope.$apply();
  //        scope.filteredAccountMembers = [1,2];
  //        spyOn(ctrl, 'loadBalanceSummary');
  //        scope.$apply();
  //        expect(ctrl.loadBalanceSummary).toHaveBeenCalled();
  //        expect(scope.calculatingBalance).toBe(false);
  //    });
  //});

  describe('watcher getLatestDetails ->', function () {
    it('should call getAllAccountMembersDetail function to calculate balance for selected user if new payment is applied successfully', function () {
      scope.getLatestDetails = false;
      scope.$apply();
      scope.getLatestDetails = true;
      spyOn(ctrl, 'updateBalanceDetailRow');
      scope.$apply();
      expect(ctrl.updateBalanceDetailRow).toHaveBeenCalled();
    });

    it('should not call getAllAccountMembersDetail function to calculate balance for selected user if new payment is not applied successfully', function () {
      scope.getLatestDetails = false;
      scope.$apply();
      scope.getLatestDetails = false;
      spyOn(ctrl, 'updateBalanceDetailRow');
      scope.$apply();
      expect(ctrl.updateBalanceDetailRow).not.toHaveBeenCalled();
    });
  });

  //resetDataToAll
  describe('resetDataToAll function ->', function () {
    it('should set accountMember DD to All Account Member option and refresh the data accordingly', function () {
      scope.resetDataToAll();
      expect(scope.resetData).toHaveBeenCalled();
    });
  });

  //openAdjustmentModal
  describe('openAdjustmentModal function ->', function () {
    it('should call modalDataFactory.GetTransactionModalData to process data required for applying payment adjustment if alreadyApplyingAdjustment is false', function () {
      scope.alreadyApplyingAdjustment = false;
      scope.openAdjustmentModal();

      expect(modalDataFactory.GetTransactionModalData).toHaveBeenCalled();
      expect(rootScope.transactionToSearchEncounter).toBe(null);
    });

    it('should not call modalDataFactory.GetTransactionModalData to process data required for applying payment adjustment if alreadyApplyingAdjustment is true', function () {
      scope.alreadyApplyingAdjustment = true;
      scope.openAdjustmentModal();

      expect(modalDataFactory.GetTransactionModalData).not.toHaveBeenCalled();
    });

    it('should not call modalDataFactory.GetTransactionModalData to process data required for applying payment adjustment if user is not authorized for it', function () {
      spyOn(ctrl, 'authAddCreditTransactionAccess').and.returnValue(false);
      scope.alreadyApplyingAdjustment = false;
      scope.openAdjustmentModal();

      expect(modalDataFactory.GetTransactionModalData).not.toHaveBeenCalled();
    });
  });

  //openAdjustmentModalResultOk
  describe('openAdjustmentModalResultOk function ->', function () {
    it('should set alreadyApplyingAdjustment flag to false when it is true', function () {
      scope.alreadyApplyingAdjustment = true;
      var res = { showUnappliedModal: false };
      ctrl.openAdjustmentModalResultOk(res);
      expect(scope.alreadyApplyingAdjustment).toEqual(false);
    });

    it('should set alreadyApplyingPayment flag to false when alreadyApplyingAdjustment is null', function () {
      scope.alreadyApplyingAdjustment = null;
      var res = { showUnappliedModal: false };
      ctrl.openAdjustmentModalResultOk(res);
      expect(scope.alreadyApplyingPayment).toEqual(false);
    });
  });

  //openAdjustmentModalResultCancel
  describe('openAdjustmentModalResultCancel function ->', function () {
    it('should set alreadyApplyingAdjustment flag to false when it is true', function () {
      scope.alreadyApplyingAdjustment = true;
      ctrl.openAdjustmentModalResultCancel();
      expect(scope.alreadyApplyingAdjustment).toEqual(false);
    });

    it('should set alreadyApplyingAdjustment flag to false when alreadyApplyingAdjustment is null', function () {
      scope.alreadyApplyingAdjustment = null;
      ctrl.openAdjustmentModalResultCancel();
      expect(scope.alreadyApplyingPayment).toEqual(false);
    });
  });

  // openModal
  describe('openModal function -->', function () {
    it('should call modalFactory.TransactionModal service method', function () {
      var transactionModalData = {};

      ctrl.openModal(transactionModalData);

      expect(modalFactory.TransactionModal).toHaveBeenCalled();
    });
  });

  describe('scope.applyPatientInsurancePayment ->', function () {
    it('', function () {
      ctrl.getTabNameFromParam = jasmine
        .createSpy()
        .and.returnValue('Account Summary');
      scope.applyPatientInsurancePayment();
      expect(ctrl.getTabNameFromParam).toHaveBeenCalled();
    });
  });

  //getTabNameFromParam
  describe('getTabNameFromParam function ->', function () {
    it('getTabNameFromParam calls location.search', function () {
      var result = ctrl.getTabNameFromParam();

      expect(location.search).toHaveBeenCalled();
      expect(result).toBe('Summary');
    });
  });
});
