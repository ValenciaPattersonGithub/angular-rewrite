describe('Controller: UnappliedMenuController', function () {
  var ctrl,
    scope,
    listHelper,
    toastrFactory,
    patSecurityService,
    controller,
    rootScope;
  var q,
    data,
    element,
    modalFactory,
    modalDataFactory,
    modalFactoryDeferred,
    modalOptions,
    mockReferenceDataService,
    mockAccountCreditTransactionFactory,
    filter;

  // function to create instance for the controller
  function createController() {
    ctrl = controller('UnappliedMenuController', {
      $scope: scope,
      $rootScope: rootScope,
      patSecurityService: patSecurityService,
      toastrFactory: toastrFactory,
      ModalFactory: modalFactory,
      ModalDataFactory: modalDataFactory,
      ListHelper: listHelper,
      referenceDataService: mockReferenceDataService,
      AccountCreditTransactionFactory: mockAccountCreditTransactionFactory,
      $filter: filter,
    });
  }

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    rootScope = $rootScope;
    scope.refreshData = jasmine.createSpy('scope.refreshData');
    controller = $controller;
    q = $q;
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
        .and.returnValue({ id: 1 }),
      findIndexByFieldValue: jasmine
        .createSpy('listHelper.findIndexByFieldValue')
        .and.returnValue(0),
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

    mockReferenceDataService = {
      getData: jasmine
        .createSpy('mockReferenceDataService.get')
        .and.callFake(function (entity) {
          switch (entity) {
            case 'users':
              return $q.resolve([
                {
                  UserId: 'dd20b506-6a87-e711-bf16-204747fa7c7e',
                  FirstName: 'Adam',
                  MiddleName: null,
                  LastName: 'Adams',
                  PreferredName: null,
                },
              ]);
          }
        }),
      entityNames: {
        users: 'users',
      },
    };

    mockAccountCreditTransactionFactory = {
      getCreditTransaction: jasmine.createSpy().and.returnValue({
        then: function (callback) {
          callback({
            Value: {
              CreditTransactionId: 10,
              CreditTransactionDetails: [{ UnassignedAmount: 10 }],
            },
          });
        },
      }),
    };

    filter = jasmine.createSpy('filter').and.returnValue(function (date) {
      return date;
    });

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
    scope.$parent.patient = {
      Data: {
        PersonAccount: {
          PersonAccountMember: { AccountId: 1, AccountMemberId: 11 },
        },
      },
    };

    //create controller
    createController();

    scope.$apply();
  }));

  //controller
  describe('initial values -> ', function () {
    it('controller should exist and have run through setup logic', function () {
      expect(ctrl).not.toBeNull();
      expect(scope.soarAuthAddAccountPaymentKey).toBe('soar-acct-aapmt-add');
      expect(scope.soarAuthAddCreditAdjustmentKey).toBe('soar-acct-cdtadj-add');
      expect(scope.showUnappliedDetail).toBe(false);
    });
  });

  //authorization
  describe('Access check', function () {
    describe('authAddAccountPaymentAccess function->', function () {
      it('should check if user has access to add account payment by calling patSecurityService service', function () {
        scope.authAddAccountPaymentAccess();

        expect(
          patSecurityService.IsAuthorizedByAbbreviation
        ).toHaveBeenCalled();
      });
    });

    describe('authAddCreditTransactionAccess function->', function () {
      it('should check if user has access to add credit transaction by calling patSecurityService service', function () {
        scope.authAddCreditTransactionAccess();

        expect(
          patSecurityService.IsAuthorizedByAbbreviation
        ).toHaveBeenCalled();
      });
    });

    describe('notifyNotAuthorized function->', function () {
      it('should throw error message when called', function () {
        ctrl.notifyNotAuthorized();

        expect(toastrFactory.error).toHaveBeenCalled();
      });
    });
  });

  //openAdjustmentModal
  describe('openAdjustmentModal function ->', function () {
    beforeEach(function () {
      ctrl.patientAccountDetails = {
        AccountID: 1,
        AccountMemberId: 11,
      };
      ctrl.providers = [
        {
          UserId: 'dd20b506-6a87-e711-bf16-204747fa7c7e',
          FirstName: 'Adam',
          MiddleName: null,
          LastName: 'Adams',
          PreferredName: null,
        },
      ];
    });

    it('should call accountCreditTransactionFactory.GetCreditTransaction if object id is present and there is only one transaction', function () {
      scope.unappliedTransactions = [{ ObjectId: 10 }];
      var spy = spyOn(ctrl, 'setupModalData');
      scope.openAdjustmentModal();

      expect(
        mockAccountCreditTransactionFactory.getCreditTransaction
      ).toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call accountCreditTransactionFactory.GetCreditTransaction if multiple transaction are passed', function () {
      scope.unappliedTransactions = [{ ObjectId: 10 }, { ObjectId: 20 }];
      var spy = spyOn(ctrl, 'setupModalData');
      scope.openAdjustmentModal();

      expect(
        mockAccountCreditTransactionFactory.getCreditTransaction
      ).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call accountCreditTransactionFactory.GetCreditTransaction if unapplied transactions is undefined', function () {
      var spy = spyOn(ctrl, 'setupModalData');
      scope.openAdjustmentModal();

      expect(
        mockAccountCreditTransactionFactory.getCreditTransaction
      ).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call accountCreditTransactionFactory.GetCreditTransaction if object id is not present and there is only one transaction', function () {
      scope.unappliedTransactions = [{ CreditTransactionId: 10 }];
      var spy = spyOn(ctrl, 'setupModalData');
      scope.openAdjustmentModal();

      expect(
        mockAccountCreditTransactionFactory.getCreditTransaction
      ).not.toHaveBeenCalled();
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('setupModalData function ->', function () {
    beforeEach(function () {
      ctrl.patientAccountDetails = {
        AccountID: 1,
        AccountMemberId: 11,
      };
      ctrl.providers = [
        {
          UserId: 'dd20b506-6a87-e711-bf16-204747fa7c7e',
          FirstName: 'Adam',
          MiddleName: null,
          LastName: 'Adams',
          PreferredName: null,
        },
      ];
      scope.unappliedTransactions = [];
    });

    it('should call modalDataFactory.GetTransactionModalData to process data required for applying credit adjustment if alreadyApplyingAdjustment is false', function () {
      scope.alreadyApplyingAdjustment = false;
      ctrl.setupModalData(scope.unappliedTransactions);
      scope.$apply();
      expect(modalDataFactory.GetTransactionModalData).toHaveBeenCalled();
      expect(scope.alreadyApplyingAdjustment).toBe(true);
    });

    it('should not call modalDataFactory.GetTransactionModalData to process data required for applying credit adjustment if alreadyApplyingAdjustment is true', function () {
      scope.alreadyApplyingAdjustment = true;
      ctrl.setupModalData(scope.unappliedTransactions);
      scope.$apply();
      expect(modalDataFactory.GetTransactionModalData).not.toHaveBeenCalled();
    });

    it('should not call modalDataFactory.GetTransactionModalData to process data required for applying credit adjustment if user is not authorized for it', function () {
      spyOn(scope, 'authAddCreditTransactionAccess').and.returnValue(false);
      scope.alreadyApplyingAdjustment = false;
      ctrl.setupModalData(scope.unappliedTransactions);
      scope.$apply();
      expect(modalDataFactory.GetTransactionModalData).not.toHaveBeenCalled();
    });

    it('should not call modalDataFactory.GetTransactionModalData to process data required for applying payment adjustment if user is not authorized for it', function () {
      spyOn(scope, 'authAddAccountPaymentAccess').and.returnValue(false);
      scope.alreadyApplyingAdjustment = false;
      ctrl.setupModalData(scope.unappliedTransactions);
      scope.$apply();
      expect(modalDataFactory.GetTransactionModalData).not.toHaveBeenCalled();
    });
  });

  //openAdjustmentModalResultOk
  describe('openAdjustmentModalResultOk function ->', function () {
    it('should set alreadyApplyingAdjustment flag to false and call refreshData function to reload data', function () {
      scope.alreadyApplyingAdjustment = true;
      ctrl.openAdjustmentModalResultOk();

      expect(rootScope.paymentApplied).toEqual(false);
      expect(scope.alreadyApplyingAdjustment).toEqual(false);
      expect(scope.refreshData).toHaveBeenCalled();
    });
  });

  //openAdjustmentModalResultCancel
  describe('openAdjustmentModalResultCancel function ->', function () {
    it('should set alreadyApplyingAdjustment flag to false', function () {
      scope.alreadyApplyingAdjustment = true;
      ctrl.openAdjustmentModalResultCancel();

      expect(scope.alreadyApplyingAdjustment).toEqual(false);
    });

    it('should call refreshData function to reload data when rootScope.paymentApplied is true', function () {
      scope.alreadyApplyingAdjustment = true;
      rootScope.paymentApplied = true;
      ctrl.openAdjustmentModalResultCancel();

      expect(scope.alreadyApplyingAdjustment).toEqual(false);
      expect(scope.refreshData).toHaveBeenCalled();
    });
  });

  // openModal
  describe('openModal function -->', function () {
    it('should call modalFactory.TransactionModal service method', function () {
      var transactionModalData = { providersList: { Value: 1 } };

      ctrl.openModal(transactionModalData);

      expect(modalFactory.TransactionModal).toHaveBeenCalled();
    });
  });

  describe('getTotalUnappliedAmount ->', function () {
    it('should return sum of unassigned amounts in transaction list', function () {
      scope.unappliedTransactions = [
        { UnassignedAmount: 20 },
        { UnassignedAmount: 30 },
        { UnassignedAmount: 40 },
      ];
      var sum = scope.getTotalUnappliedAmount();
      expect(sum).toBe(90);
    });
  });

  describe('getTotalUnappliedAmount ->', function () {
    beforeEach(function () {
      scope.unappliedTransactions = [
        { UnassignedAmount: 20, TransactionTypeId: 2 },
        { UnassignedAmount: 30, TransactionTypeId: 2 },
        { UnassignedAmount: 30, TransactionTypeId: 4 },
        { UnassignedAmount: 30, TransactionTypeId: 2 },
        { UnassignedAmount: 40, TransactionTypeId: 5 },
      ];
      spyOn(scope, 'openAdjustmentModal');
    });

    it('should filter list of unapplied for Payments and Negative Adjustments and call $scope.openAdjustmentModal with first if any', function () {
      scope.$emit('showUnappliedModalPayment', null);
      expect(scope.openAdjustmentModal).toHaveBeenCalledWith(
        scope.unappliedTransactions[0]
      );
    });

    it('should filter list of unapplied for Payments and Negative Adjustments and not call $scope.openAdjustmentModal if none', function () {
      scope.unappliedTransactions = [
        { UnassignedAmount: 40, TransactionTypeId: 5 },
      ];
      scope.$emit('showUnappliedModalPayment', null);
      expect(scope.openAdjustmentModal).not.toHaveBeenCalled();
    });
  });
});
