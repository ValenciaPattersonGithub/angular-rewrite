describe('deposit-payments-modal-controller ->', function () {
  var scope,
    filter,
    timeout,
    toastrFactory,
    depositPaymentsGridFactory,
    depositService,
    q,
    deferred,
    ctrl,
    window,
    location,
    routeParams,
    modalFactory,
    tabLauncher,
    localize,
    timeZoneFactory,
    locationService,
    listHelper;

  var mockCreditTransactions = [
    {
      AccountId: '2316a9ca-19d1-4735-88dd-e576cbf0cc18',
      AccountName: 'Alonzo, Seth',
      Amount: 10,
      CreditTransactionId: '45ec7521-95dd-4d82-b230-d33c41a10ff0',
      DateEntered: '2017-06-19T09:56:55.191',
      PaymentTypeDescription: 'Cash',
      PaymentTypeId: '58e1faff-30d7-4d75-b17f-559ba3805de8',
      BulkCreditTransactionId: null,
      IsBulkPayment: false,
      Note: 'test',
    },
    {
      AccountId: '2316a9ca-19d1-4735-88dd-e576cbf0cc18',
      AccountName: 'Alonzo, Stellar',
      Amount: 10,
      CreditTransactionId: '45ec7521-95dd-4d82-b230-d33c41a10ff0',
      DateEntered: '2017-06-19T09:56:55.191',
      PaymentTypeDescription: 'Cash',
      PaymentTypeId: '58e1faff-30d7-4d75-b17f-559ba3805de8',
      BulkCreditTransactionId: '58e1faff-30d7-4d75-b17f-559ba3805de8',
      IsBulkPayment: true,
      Note: 'test',
    },
  ];

  var mockBankAccounts = [
    { Key: 1, Value: 'Bank A' },
    { Key: 2, Value: 'Bank B' },
  ];

  var mockData = {
    totalCount: 5,
    dto: {
      TotalAmount: 100.0,
      BankAccounts: mockBankAccounts,
      FilterCriteria: {
        DateEnteredFrom: null,
        DateEnteredTo: null,
      },
      Rows: mockCreditTransactions,
    },
  };

  var mockDepositDto = {
    LocationId: 0,
    BankAccountId: 1,
    DepositDate: new Date(),
    TotalAmount: 10,
    CreditTransactions: mockCreditTransactions,
    BulkCreditTransactions: [],
    PrintSlip: true,
  };

  // #region Setup

  beforeEach(module('common.factories'));
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      timeout = jasmine.createSpy();
      $provide.value('$timeout', timeout);
    })
  );

  beforeEach(inject(function (
    $rootScope,
    $filter,
    $q,
    $controller,
    $routeParams,
    $window
  ) {
    scope = $rootScope.$new();
    filter = $filter;
    q = $q;
    deferred = q.defer();
    routeParams = $routeParams;
    routeParams.locationId = 1;
    window = $window;

    localStorage.setItem('createDepositLocation_1', 1);
    localStorage.setItem('editDeposit_1', null);

    location = {
      path: jasmine.createSpy().and.returnValue('Create'),
    };

    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    modalFactory = {
      CancelModal: jasmine
        .createSpy()
        .and.returnValue({ then: jasmine.createSpy() }),
    };

    depositService = {
      create: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
      edit: jasmine.createSpy().and.returnValue({ $promise: deferred.promise }),
    };

    tabLauncher = {
      launchNewTab: jasmine.createSpy(),
    };

    depositPaymentsGridFactory = {
      getOptions: jasmine.createSpy().and.callFake(function () {
        return {
          updateOnInit: true,
          query: {},
          pageSize: 0,
          actions: {},
          successAction: jasmine.createSpy(),
          updateFilter: jasmine.createSpy(),
          failAction: jasmine.createSpy(),
          additionalFilters: [],
          columnDefinition: [
            {},
            {},
            {
              filterFrom: null,
              filterTo: null,
              DateEnteredFrom: null,
              DateEnteredTo: null,
            },
          ],
          refresh: jasmine.createSpy(),
        };
      }),
    };

    timeZoneFactory = {
      ConvertDateToSave: jasmine.createSpy().and.returnValue(new Date()),
      GetTimeZoneAbbr: jasmine.createSpy().and.returnValue(''),
    };

    locationService = {
      getCurrentPracticeLocations: jasmine.createSpy().and.returnValue({
        then: function () {
          return [{ id: 'locationId', timezone: 'locationtimezone' }];
        },
      }),
    };

    listHelper = {
      findItemByFieldValue: jasmine.createSpy().and.returnValue(null),
    };

    ctrl = $controller('DepositPaymentsModalController', {
      $scope: scope,
      $filter: filter,
      $timeout: timeout,
      $location: location,
      toastrFactory: toastrFactory,
      DepositPaymentsGridFactory: depositPaymentsGridFactory,
      DepositService: depositService,
      $routeParams: routeParams,
      ModalFactory: modalFactory,
      tabLauncher: tabLauncher,
      localize: localize,
      TimeZoneFactory: timeZoneFactory,
      locationService: locationService,
      listHelper: listHelper,
    });
  }));

  // #endregion

  // #region Tests

  describe('initial values ->', function () {
    it('DepositPaymentsModalController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });

    it('depositPaymentsGridFactory : should call depositPaymentGridFactory.getOptions', function () {
      expect(depositPaymentsGridFactory.getOptions).toHaveBeenCalled();
      expect(depositPaymentsGridFactory.getOptions.calls.count()).toEqual(1);
      expect(depositPaymentsGridFactory).not.toBeNull();
    });
  });

  describe('paymentsGridOptions ->', function () {
    it('paymentsGridOptions: should contain data', function () {
      scope.creditTransactions = [];
      scope.depositDtos = [];

      scope.paymentsGridOptions.successAction(mockData);
      expect(scope.paymentsGridOptions).not.toBeNull();
      expect(scope.bankAccounts).toEqual(mockData.dto.BankAccounts);
      expect(scope.disableDeposit).toBeTruthy();
    });

    it('scope.selectPayment: should select payment row', function () {
      scope.transactions = mockCreditTransactions;

      scope.selectPayment(scope.transactions[0]);
      expect(scope.depositDto.CreditTransactions.length).toEqual(1);
      expect(scope.selectedPayments.CreditTransactions.length).toEqual(1);
      expect(scope.depositDto.TotalAmount).toEqual(10);
      expect(scope.paymentGridTotal).toBe(10.0);
    });
  });

  describe('ctrl.refreshModal ->', function () {
    it('ctrl.refreshModal : should refresh modal', function () {
      ctrl.refreshModal();
      expect(scope.paymentsGridOptions.refresh).toHaveBeenCalled();
    });
  });

  describe('scope.addSelectedPayment ->', function () {
    it('scope.addSelectedPayment: should add selected payment to deposit summary', function () {
      scope.depositDto = mockDepositDto;
      scope.bankAccounts = mockBankAccounts;
      scope.depositSummary = {
        TotalAmount: 0,
        Rows: [],
      };
      scope.currentBank.selected = mockBankAccounts[0];

      scope.addSelectedPayment();

      expect(scope.depositSummary.Rows.length).toEqual(1);
      expect(scope.disableDeposit).toBeFalsy();
      expect(scope.depositDtos.length).toEqual(1);
      expect(scope.paymentGridTotal).toBe(0);
      expect(scope.paymentsGridOptions.updateFilter).toHaveBeenCalled();
      expect(scope.paymentsGridOptions.refresh).toHaveBeenCalled();
    });
  });

  describe('scope.deposit ->', function () {
    it('scope.deposit : should call create deposit', function () {
      scope.deposit();
      expect(depositService.create).toHaveBeenCalled();
    });
    it('scope.deposit : should call edit deposit', function () {
      scope.pageMode = 'Edit';
      ctrl.editDeposit = {
        DepositId: 1,
      };
      scope.deposit();
      expect(depositService.edit).toHaveBeenCalled();
    });
  });

  describe('ctrl.depositSuccess ->', function () {
    it('ctrl.depositSuccess: should filter deposit for printing', function () {
      var result = {
        Value: [mockDepositDto],
      };
      ctrl.depositSuccess(result);
      expect(ctrl.depositsForPrinting.length).toEqual(1);
    });
  });

  describe('scope.cancel ->', function () {
    it('should change path if no pending deposit', function () {
      scope.depositDtos = [];
      scope.cancel();
      expect(modalFactory.CancelModal).not.toHaveBeenCalled();
      expect(window.location.href).toContain(
        '/BusinessCenter/Receivables/Deposits'
      );
    });
    it('should call modalFactory.CancelModal if has pending deposit', function () {
      scope.depositDtos = ['test'];
      scope.cancel();

      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });

  describe('scope.changePath ->', function () {
    it('should change path to Deposits if no pending deposit', function () {
      var breadcrumb = {
        Name: 'Deposits',
        Path: '#/BusinessCenter/Receivables/Deposits',
      };
      scope.depositDtos = [];
      scope.changePath(breadcrumb);
      expect(modalFactory.CancelModal).not.toHaveBeenCalled();

      expect(window.location.href).toContain(
        '/BusinessCenter/Receivables/Deposits'
      );
    });
    it('should change path to Receivables if no pending deposit', function () {
      var breadcrumb = {
        Name: 'Receivables',
        Path: '#/BusinessCenter/Receivables/TotalReceivables',
      };
      scope.depositDtos = [];
      scope.changePath(breadcrumb);
      expect(modalFactory.CancelModal).not.toHaveBeenCalled();

      expect(window.location.href).toContain(
        '/BusinessCenter/Receivables/TotalReceivables'
      );
    });
    it('should call modalFactory.CancelModal if has pending deposit', function () {
      var breadcrumb = {
        Name: 'Deposits',
        Path: '#/BusinessCenter/Receivables/Deposits',
      };
      scope.depositDtos = ['test'];
      scope.changePath(breadcrumb);

      expect(modalFactory.CancelModal).toHaveBeenCalled();
    });
  });
});
