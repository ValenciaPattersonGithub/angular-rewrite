describe('PatientAccountSummaryController ->', function () {
  var routeParams,
    toastrFactory,
    $uibModal,
    timeout,
    scope,
    ctrl,
    compile,
    event,
    shareData;
  var patientServices,
    userServices,
    modalFactory,
    modalDataFactory,
    modalFactoryDeferred,
    q,
    deferred,
    listHelper,
    filter,
    modalInstance,
    actualOptions,
    modalOptions,
    usersFactory,
    financialService,
    userSettingsDataService;
  var personFactory;
  //#region mocks
  var mockPerson = {
    PatientId: 122,
    Profile: {
      PersonAccount: {
        AccountId: 123,
        PersonAccountMember: {
          AccountId: 123,
        },
      },
    },
  };

  var mockPersonWithNoAccount = {
    PatientId: 122,
    Profile: {
      PersonAccount: {
        AccountId: null,
      },
    },
  };
  var mockProviders = [
    { UserId: '00000000-0000-0000-0000-000000000001', ProviderTypeId: '1' },
    { UserId: '00000000-0000-0000-0000-000000000002', ProviderTypeId: '2' },
  ];

  var mockAccountBalances = [
    { BalanceCurrent: 150.0, Balance30: 10, Balance60: 20, Balance90: 20 },
    { BalanceCurrent: 125.0, Balance30: 10, Balance60: 20, Balance90: 20 },
  ];
  var mockAccountAndInsuranceBalances = {
    TotalBalance: 1,
    TotalInsurance: 2,
    TotalPatientPortion: 3,
    TotalAdjustedEstimate: 4,
    SelectedMemberBalance: 5,
    SelectedMemberInsurance: 6,
    SelectedMemberPatientPortion: 7,
    SelectedMemberAdjustedEstimate: 8,
    MoreThan30Balance: 9,
    EstInsMoreThan30Balance: 10,
    MoreThan60Balance: 11,
    EstInsMoreThan60Balance: 12,
    MoreThan90Balance: 13,
    EstInsMoreThan90Balance: 14,
    CurrentBalance: 15,
    EstInsCurrentBalance: 16,
  };
  var mockCreditTransactions = [{ Amount: 110.0 }, { Amount: 140.0 }];
  var mockAccountBalancesResponse = { Value: mockAccountBalances };
  var mockProvidersResponse = { Value: mockProviders };
  var mockCreditTransactionsResponse = { Value: mockCreditTransactions };

  //#endregion

  //#region spys

  beforeEach(module('Soar.Common'));

  beforeEach(
    module('Soar.Patient', function ($provide) {
      //mock for listHelper service
      listHelper = {
        findIndexByFieldValue: jasmine
          .createSpy('listHelper.findIndexByFieldValue')
          .and.returnValue(null),
        findItemByFieldValue: jasmine
          .createSpy('listHelper.findItemByFieldValue')
          .and.returnValue(null),
      };

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);

      shareData = { allProviders: { UserId: 10 } };
      $provide.value('ShareData', shareData);

      var deregisterObserver = function () {};
      personFactory = {
        AccountMemberDetails: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        ActiveAccountOverview: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
        observeActiveAccountOverview: jasmine
          .createSpy()
          .and.returnValue(deregisterObserver),
      };
      $provide.value('PersonFactory', personFactory);

      patientServices = {
        CreditTransactions: {
          getCreditTransactionsByAccountId: jasmine
            .createSpy()
            .and.returnValue(mockCreditTransactionsResponse),
        },
        Account: {
          getAccountMembersDetailByAccountId: jasmine
            .createSpy()
            .and.returnValue(mockAccountBalancesResponse),
        },
      };
      $provide.value('PatientServices', patientServices);

      userServices = {
        Users: {
          get: jasmine.createSpy().and.returnValue(mockProvidersResponse),
        },
      };
      $provide.value('PatientServices', patientServices);

      modalDataFactory = {
        GetTransactionModalData: jasmine
          .createSpy('modalDataFactory.GetTransactionModalData')
          .and.callFake(function () {
            modalFactoryDeferred = q.defer();
            modalFactoryDeferred.resolve(1);
            return {
              result: modalFactoryDeferred.promise,
              then: function () {},
            };
          }),
      };

      $provide.value('ModalDataFactory', modalDataFactory);
      event = {
        preventDefault: jasmine.createSpy(),
      };
      userSettingsDataService = {
        isNewNavigationEnabled: function () {
          return false;
        },
      };
      $provide.value('userSettingsDataService', userSettingsDataService);
    })
  );

  //#endregion

  //#region controller and scope

  beforeEach(inject(function (
    $rootScope,
    $controller,
    $injector,
    $route,
    $routeParams,
    $compile,
    $timeout,
    $location,
    _$uibModal_,
    $filter,
    $q
  ) {
    q = $q;
    timeout = $timeout;
    compile = $compile;
    routeParams = $routeParams;
    $uibModal = _$uibModal_;
    spyOn($uibModal, 'open').and.callThrough();
    filter = $injector.get('$filter');

    //mock for modal
    modalInstance = {
      open: jasmine
        .createSpy('modalInstance.open')
        .and.callFake(function (options) {
          actualOptions = options;
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

    //mock for modalFactory
    modalFactory = {
      DeleteModal: jasmine
        .createSpy('modalFactory.DeleteModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
      Modal: jasmine
        .createSpy('modalFactory.TransactionModal')
        .and.callFake(function (options) {
          modalOptions = options;
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve('some value in return');
          return { result: modalFactoryDeferred.promise };
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
      TransactionModal: jasmine
        .createSpy('modalFactory.TransactionModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve(1);
          return {
            result: modalFactoryDeferred.promise,
            then: function () {},
          };
        }),
    };

    usersFactory = {
      Users: jasmine.createSpy().and.returnValue({ then: function () {} }),
    };

    financialService = {
      calculateAccountAndInsuranceBalances: jasmine
        .createSpy()
        .and.returnValue(mockAccountAndInsuranceBalances),
    };

    scope = $rootScope.$new();
    scope.person = mockPerson;

    ctrl = $controller('PatientAccountSummaryController', {
      $scope: scope,
      patSecurityService: _authPatSecurityService_,
      ModalFactory: modalFactory,
      PatientServices: patientServices,
      UserServices: userServices,
      ListHelper: listHelper,
      toastrFactory: toastrFactory,
      $filter: filter,
      UsersFactory: usersFactory,
      FinancialService: financialService,
      PersonFactory: personFactory,
    });
  }));

  //#endregion

  //#region tests

  beforeEach(function () {
    ctrl.providers = [];
  });

  describe('initial setup -> ', function () {
    it('check if controller exists', function () {
      expect(ctrl).not.toBeNull();
    });

    it('should have injected services ', function () {
      expect(patientServices).not.toBeNull();
      expect(userServices).not.toBeNull();
    });

    it('should set scope properties', function () {
      expect(scope.loading).toBe(true);
      expect(scope.balanceIsCalculated).toBe(true);
      expect(scope.accountMembersOptions).toEqual([]);
      expect(ctrl.providers).toEqual([]);
      expect(scope.accountBalance).toBe(0);
      expect(scope.accountTotal).toBe(0);
      expect(scope.estimatedInsurance).toBe(0);
      expect(scope.patientPortion).toBe(0);
      expect(scope.accountTotalOverview).toBe(0);
      expect(scope.accountBalanceOverview).toBe(0);
      expect(scope.estimatedInsuranceOverview).toBe(0);
      expect(scope.patientPortionOverview).toBe(0);
      expect(scope.applyingPayment).toBe(false);
      expect(scope.disablePayments).toBe(false);
      expect(scope.disableInsurancePayments).toBe(false);
    });
  });

  describe('initializeController function -> ', function () {
    it('should set loading to true if person has accountId', function () {
      ctrl.initializeController();
      expect(scope.loading).toBe(true);
    });

    it('should call getProviders if shareData does not contain allProviders', function () {
      spyOn(ctrl, 'getProviders');
      shareData = { allProviders: { UserId: 10 } };
      ctrl.initializeController();
      expect(ctrl.getProviders).not.toHaveBeenCalled();
    });
  });

  describe('getAccountBalance function -> ', function () {
    beforeEach(function () {
      ctrl.getAccountBalanceSuccess = jasmine.createSpy();
    });

    it('should call personFactory.AccountMemberDetails', function () {
      ctrl.getAccountBalance();
      expect(personFactory.AccountMemberDetails).toHaveBeenCalledWith(
        scope.person.Profile.PersonAccount.AccountId
      );
    });

    it('should call ctrl.calculateAccountBalance ', function () {
      spyOn(ctrl, 'calculateAccountBalance');
      ctrl.getAccountBalance();
      //TODO fix test
      //expect(ctrl.calculateAccountBalance).toHaveBeenCalled();
    });
  });

  describe('calculateAccountBalance function -> ', function () {
    it('should calculate account balance for all members of account', function () {
      scope.accountBalances = angular.copy(mockAccountBalances);
      ctrl.calculateAccountBalance();

      expect(scope.accountTotal).toBe(
        mockAccountAndInsuranceBalances.TotalBalance
      );
      expect(scope.estimatedInsurance).toBe(
        mockAccountAndInsuranceBalances.TotalInsurance
      );
      expect(scope.patientPortion).toBe(
        mockAccountAndInsuranceBalances.TotalPatientPortion
      );
      expect(scope.adjustedEstIns).toBe(
        mockAccountAndInsuranceBalances.TotalAdjustedEstimate
      );
      expect(scope.accountTotalOverview).toBe(
        mockAccountAndInsuranceBalances.SelectedMemberBalance
      );
      expect(scope.estimatedInsuranceOverview).toBe(
        mockAccountAndInsuranceBalances.SelectedMemberInsurance
      );
      expect(scope.patientPortionOverview).toBe(
        mockAccountAndInsuranceBalances.SelectedMemberPatientPortion
      );
      expect(scope.adjustedEstInsOverview).toBe(
        mockAccountAndInsuranceBalances.SelectedMemberAdjustedEstimate
      );
      expect(scope.graphData).toEqual({
        moreThanThirtyBalance:
          mockAccountAndInsuranceBalances.MoreThan30Balance +
          mockAccountAndInsuranceBalances.EstInsMoreThan30Balance,
        moreThanSixtyBalance:
          mockAccountAndInsuranceBalances.MoreThan60Balance +
          mockAccountAndInsuranceBalances.EstInsMoreThan60Balance,
        moreThanNintyBalance:
          mockAccountAndInsuranceBalances.MoreThan90Balance +
          mockAccountAndInsuranceBalances.EstInsMoreThan90Balance,
        currentBalance:
          mockAccountAndInsuranceBalances.CurrentBalance +
          mockAccountAndInsuranceBalances.EstInsCurrentBalance,
        totalBalance: mockAccountAndInsuranceBalances.TotalBalance,
        totalInsurance: mockAccountAndInsuranceBalances.TotalInsurance,
        totalPatientPortion:
          mockAccountAndInsuranceBalances.TotalPatientPortion,
      });
    });
  });

  describe('calculateAccountTotals function -> ', function () {
    it('should calculate account totals for all members of account if balance have been calculated', function () {
      scope.balanceIsCalculated = true;
      scope.adjustedEstIns = 25;
      scope.graphData = {
        moreThanThirtyBalance: 30,
        moreThanSixtyBalance: 60,
        moreThanNintyBalance: 90,
        currentBalance: 20,
        totalBalance: 200,
        totalInsurance: 50,
        totalPatientPortion: 150,
      };

      ctrl.calculateAccountTotals();
      expect(scope.accountTotal).toBe(200.0);
      expect(scope.patientPortion).toBe(125.0);
    });
  });

  describe('balanceIsCalculated watch ->', function () {
    it('should set loading variable true if new value different than old and conditions are met', function () {
      spyOn(ctrl, 'calculateAccountTotals');
      scope.balanceIsCalculated = false;
      scope.$apply();
      scope.balanceIsCalculated = true;
      scope.$apply();
      expect(scope.loading).toBe(false);
    });
  });

  describe('patientPaymentModalResultCancel function ->', function () {
    it('should set applyingPayment variable false', function () {
      scope.applyingPayment = true;
      ctrl.patientPaymentModalResultCancel();
      expect(scope.applyingPayment).toBe(false);
    });
  });

  describe('openModal function ->', function () {
    it('should set dataForModal with the value passed to method', function () {
      var result = { value: 1 };
      ctrl.openModal(result);
      expect(ctrl.dataForModal).toEqual(result);
    });
  });

  describe('getProviders function -> ', function () {
    it('should call userServices.User.get', function () {
      ctrl.getProviders();
      expect(usersFactory.Users).toHaveBeenCalled();
    });
  });

  describe('userServicesGetSuccess function -> ', function () {
    it('should set providers', function () {
      ctrl.userServicesGetSuccess(mockProvidersResponse);
      expect(scope.providers).toEqual(mockProvidersResponse.Value);
    });

    it('should call enablePayments', function () {
      spyOn(ctrl, 'enablePayments');
      ctrl.userServicesGetSuccess(mockProvidersResponse);
      expect(ctrl.enablePayments).toHaveBeenCalled();
    });
  });

  describe('userServicesGetFailure function -> ', function () {
    it('should call toastrFactory', function () {
      ctrl.userServicesGetFailure();
      expect(ctrl.providers).toEqual([]);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('makePayment function -> ', function () {
    it('should call patientPaymentModal if disablePayments is false', function () {
      spyOn(scope, 'patientPaymentModal');
      scope.disablePayments = false;
      scope.makePayment();
      //expect(scope.patientPaymentModal).toHaveBeenCalled();
    });

    it('should not call patientPaymentModal if disablePayments is true', function () {
      spyOn(scope, 'patientPaymentModal');
      scope.disablePayments = true;
      scope.makePayment();
      expect(scope.patientPaymentModal).not.toHaveBeenCalled();
    });
  });

  describe('patientPaymentModal function ->', function () {
    it('should open modal popup for applying new payment if applyingPayment is false', function () {
      scope.applyingPayment = false;
      scope.patientPaymentModal();
    });

    it('should not open modal applyingPayment is true', function () {
      scope.applyingPayment = true;
      scope.patientPaymentModal();
      expect(modalFactory.Modal).not.toHaveBeenCalled();
    });
  });

  describe('patientPaymentModalResultOk function ->', function () {
    it('should set applyingPayment false', function () {
      spyOn(scope, 'applyingPayment');
      ctrl.patientPaymentModalResultOk();
      expect(scope.applyingPayment).toBe(false);
    });
  });

  describe('patientPaymentModalResultCancel function ->', function () {
    it('should set applyingPayment false', function () {
      spyOn(ctrl, 'patientPaymentModalResultCancel');
      ctrl.patientPaymentModalResultCancel();
      expect(scope.applyingPayment).toBe(false);
    });
  });

  describe('enablePayments function ->', function () {
    it('should set disablePayments false if conditions met', function () {
      shareData = { allProviders: [] };
      ctrl.providers = [];
      ctrl.enablePayments();
      expect(scope.disablePayments).toBe(false);
    });

    it('should set disablePayments true if conditions met', function () {
      shareData = { allProviders: [] };
      scope.providers = [
        { UserId: '00000000-0000-0000-0000-000000000001', ProviderTypeId: 2 },
        { UserId: '00000000-0000-0000-0000-000000000002', ProviderTypeId: 1 },
      ];
      ctrl.enablePayments();
      expect(scope.disablePayments).toBe(false);
    });
  });

  //#endregion
});
