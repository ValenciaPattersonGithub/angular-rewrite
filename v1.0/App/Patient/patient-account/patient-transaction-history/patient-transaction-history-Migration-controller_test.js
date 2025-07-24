describe('patient-transation-history-migration-controller->', function () {
  var scope,
    ctrl,
    mockAccountSummaryFactory,
    mockAccountServiceTransactionFactory,
    mockPatientInvoiceFactory,
    mockReferenceDataService,
    mockModalFactory,
    mockPatientDocumentsFactory,
    mockToastrFactory,
    mockPatientServices,
    mockClaimsService,
    mockModalDataFactory,
    modalFactoryDeferred,
    q,
    mockDocCtrlsWindow,
    mockPatSecurityService,
    mockPaymentTypesService,
    detail,
    mockLocation,
    mockWindow,
    mockAccountDebitTransactionFactory,
    tabLauncher,
    transaction,
    mockAccountCreditTransactionFactory,
    mockPatientAccountFilterBarFactory,
    timeout,
    mockTransactionHistoryExportService,
    mockCloseClaimOptionsService,
    mockTransactionHistoryService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(module('Soar.Schedule'));
  beforeEach(inject(function ($rootScope, $controller, $q, $injector) {
    scope = $rootScope.$new();
    timeout = $injector.get('$timeout');
    scope.$parent = $rootScope.$new();
    scope.patient = {
      Data: {
        PersonAccount: {
          AccountId: 98,
          PersonAccountMember: {
            AccountMemberId: 99,
            AccountId: 98,
          },
        },
        IsPatient: true,
      },
    };
    scope.$parent.currentPatientId = 0;
    scope.accountMembersOptionsTemp = [{ accountMemberId: 99, personId: 100 }];
    scope.filterObject = {
      members: [100],
      dateRange: {
        start: null,
        end: null,
      },
      Teeth: [],
      transactionTypes: null,
      Statuses: null,
      providers: null,
      locations: null,
      IncludePaidTransactions: true,
      IncludeUnpaidTransactions: true,
      IncludeUnappliedTransactions: true,
      IncludeAppliedTransactions: true,
    };
    q = $q;
    sessionStorage.setItem('userLocation', JSON.stringify({ id: 3 }));
    sessionStorage.setItem(
      'patAuthContext',
      JSON.stringify({ userInfo: { userId: 321 } })
    );
    sessionStorage.setItem(
      'userPractice',
      JSON.stringify({ name: 'Practice Makes Perfect' })
    );

    var mockTxHistoryReturn = [
      {
        ObjectType: 'ServiceTransaction',
        TransactionTypeId: 1,
        Claims: [{ Status: 3 }],
        EncounterId: 12,
        TotalEstInsurance: 12,
        ObjectId: 33,
        TotalAdjEstimate: 14,
      },
      {
        ObjectType: 'CreditTransaction',
        TransactionTypeId: 3,
        UnassignedAmount: 30,
        ObjectId: 2,
        AssociatedServiceTransactionIds: [33],
      },
      {
        ObjectType: 'CreditTransaction',
        TransactionTypeId: 4,
        UnassignedAmount: 70,
        objectId: 3,
      },
      { ObjectType: 'CreditTransaction', TransactionTypeId: 2 },
      { ObjectType: 'CreditTransaction', TransactionTypeId: 6 },
      { ObjectType: 'DebitTransaction', TransactionTypeId: 5 },
      {
        ObjectType: 'PersonAccountNote',
        Type: 'Account Note',
        Claims: [{ Status: 7 }],
      },
    ];

    tabLauncher = {
      launchNewTab: jasmine.createSpy().and.returnValue({}),
    };

    mockLocation = {
      url: jasmine.createSpy('$location.url'),
      path: jasmine.createSpy('$location.path'),
      search: jasmine.createSpy('$location.search').and.returnValue({}),
    };

    mockAccountSummaryFactory = {
      getTransactionHistory: jasmine
        .createSpy('mockAccountSummaryFactory.getTransactionHistory')
        .and.returnValue({
          then: function (callback) {
            callback(mockTxHistoryReturn);
          },
        }),
      viewOrEditAcctPaymentOrNegAdjustmentModal: jasmine
        .createSpy(
          'mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal'
        )
        .and.returnValue({
          then: function () {},
        }),
      deleteInsurancePayment: jasmine.createSpy(
        'mockAccountSummaryFactory.deleteInsurancePayment'
      ),
      deleteAcctPaymentOrNegAdjustment: jasmine.createSpy(
        'mockAccountSummaryFactory.deleteAcctPaymentOrNegAdjustment'
      ),
    };

    mockAccountServiceTransactionFactory = {
      viewOrEditServiceTransaction: jasmine.createSpy(
        'mockAccountServiceTransactionFactory.viewOrEditServiceTransaction'
      ),
      deleteServiceTransaction: jasmine.createSpy(
        'mockAccountServiceTransactionFactory.deleteServiceTransaction'
      ),
    };

    mockAccountDebitTransactionFactory = {
      deleteDebit: jasmine.createSpy(
        'mockAccountDebitTransactionFactory.deleteDebit'
      ),
      viewOrEditDebit: jasmine.createSpy(
        'mockAccountDebitTransactionFactory.viewOrEditDebit'
      ),
    };

    mockPatSecurityService = {
      IsAuthorizedByAbbreviationAtLocation: jasmine
        .createSpy('')
        .and.returnValue(true),
      IsAuthorizedByAbbreviation: jasmine.createSpy('').and.returnValue(true),
      generateMessage: jasmine.createSpy(
        'mockPatSecurityService.generateMessage'
      ),
    };

    mockPaymentTypesService = {
      getAllPaymentTypesMinimal: jasmine.createSpy().and.callFake(function () {
        return { then: jasmine.createSpy() };
      }),
    };

    mockCloseClaimOptionsService = {
      allowEstimateOption: jasmine.createSpy().and.returnValue(true),
      open: jasmine.createSpy().and.returnValue(true),
    };

    mockTransactionHistoryService = {
      requestTransactionHistory: jasmine.createSpy().and.returnValue({
        subscribe: jasmine.createSpy(),
      }),
    };

    mockReferenceDataService = {
      getData: jasmine
        .createSpy('mockReferenceDataService.get')
        .and.callFake(function (entity) {
          switch (entity) {
            case 'locations':
              return $q.resolve([
                { LocationId: 3, Timezone: 'Central Standard Time' },
              ]);
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
        locations: 'locations',
        users: 'users',
      },
    };

    mockPatientInvoiceFactory = {
      ConfirmInvoiceOptions: jasmine.createSpy(
        'PatientInvoiceFactory.ConfirmInvoiceOptions'
      ),
      ViewEncounterInvoice: jasmine
        .createSpy('PatientInvoiceFactory.ViewEncounterInvoice')
        .and.returnValue({
          then: function (callback) {
            callback({});
          },
        }),
      CreateCurrentInvoice: jasmine.createSpy(
        'PatientInvoiceFactory.CreateCurrentInvoice'
      ),
    };

    mockPatientDocumentsFactory = {
      DeleteDocument: jasmine
        .createSpy('PatientDocumentsFactory.DeleteDocument')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
      GetDocumentAccess: jasmine
        .createSpy('PatientDocumentsFactory.GetDocumentAccess')
        .and.returnValue({ hasDocumentsEditAccess: false }),
      DisplayDocument: jasmine.createSpy(
        'PatientDocumentsFactory.DisplayDocument'
      ),
    };

    mockModalFactory = {
      ConfirmModal: jasmine
        .createSpy('ModalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
      ConfirmModalWithLink: jasmine
        .createSpy('ModalFactory.ConfirmModalWithLink')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
      TransactionModal: jasmine
        .createSpy('modalFactory.TransactionModal')
        .and.callFake(function () {
          modalFactoryDeferred = q.defer();
          modalFactoryDeferred.resolve('some value in return');
          return { result: modalFactoryDeferred.promise };
        }),
    };

    mockToastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };

    mockPatientServices = {
      PatientBenefitPlan: {
        getBenefitPlansRecordsByAccountId: jasmine
          .createSpy(
            'patientServices.PatientBenefitPlan.getBenefitPlansRecordsByAccountId'
          )
          .and.returnValue({
            $promise: $q.resolve({}),
          }),
      },
      Account: {
        getByPersonId: jasmine
          .createSpy('patientServices.Account.getByPersonId')
          .and.returnValue(),
      },
      Claim: {
        CreateClaimFromServiceTransactions: jasmine
          .createSpy('patientServices.Claim.CreateClaimFromServiceTransactions')
          .and.returnValue(true),
      },
      CreditTransactions: {
        getTransactionHistoryPaymentInformation: jasmine
          .createSpy(
            'patientServices.CreditTransactions.getTransactionHistoryPaymentDeleteInfo'
          )
          .and.returnValue({
            $promise: {
              then: function (callback) {
                callback({ Value: {} });
              },
            },
          }),
      },
      ServiceTransactions: {
        getServiceTransactionsByIds: jasmine
          .createSpy(
            'patientServices.ServiceTransactions.getServiceTransactionsByIds'
          )
          .and.returnValue(),
      },
    };

    mockClaimsService = {
      getClaimById: jasmine
        .createSpy('claimsService.getClaimById')
        .and.returnValue({
          $promise: {
            then: function () {},
          },
        }),
    };

    mockModalDataFactory = {
      GetTransactionModalData: jasmine
        .createSpy('modalDataFactory.GetTransactionModalData')
        .and.returnValue({
          then: jasmine.createSpy('modalFactory.TransactionModal'),
        }),
    };

    mockDocCtrlsWindow = {
      content: jasmine.createSpy('DocCtrlsContent').and.returnValue(),
      setOptions: jasmine.createSpy('DocCtrlsSetOptions').and.returnValue(),
      open: jasmine.createSpy('DocCtrlsOpen').and.returnValue(),
      close: jasmine.createSpy('DocCtrlsClose').and.returnValue(),
    };

    mockWindow = {
      navigator: {},
      encodeURIComponent: jasmine
        .createSpy('encodeURIComponent')
        .and.returnValue(),
      print: jasmine.createSpy('print').and.returnValue(),
      scroll: jasmine.createSpy('scroll').and.returnValue(),
    };

    tabLauncher = {
      launchNewTab: jasmine.createSpy('tabLauncher.launchNewTab'),
    };

    mockAccountCreditTransactionFactory = {
      viewEob: jasmine.createSpy(),
      printReceipt: jasmine.createSpy(),
      getCreditTransaction: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    mockPatientAccountFilterBarFactory = {
      setFilterBarStatus: jasmine.createSpy(),
    };

    mockTransactionHistoryExportService = {
      newTransactionHistoryArray: jasmine
        .createSpy(
          'mockTransactionHistoryExportService.newTransactionHistoryArray'
        )
        .and.returnValue([]),
      newTransactionHistory: jasmine
        .createSpy('mockTransactionHistoryExportService.newTransactionHistory')
        .and.returnValue({}),
      convertTransactionHistoryArrayToCsv: jasmine
        .createSpy('convertTransactionHistoryArrayToCsv')
        .and.returnValue(),
    };

    ctrl = $controller('TransactionHistoryMigrationController', {
      $scope: scope,
      $routeParams: { patientId: 100 },
      AccountSummaryFactory: mockAccountSummaryFactory,
      AccountServiceTransactionFactory: mockAccountServiceTransactionFactory,
      PatientInvoiceFactory: mockPatientInvoiceFactory,
      referenceDataService: mockReferenceDataService,
      ModalFactory: mockModalFactory,
      toastrFactory: mockToastrFactory,
      PatientServices: mockPatientServices,
      ClaimsService: mockClaimsService,
      ModalDataFactory: mockModalDataFactory,
      PatientDocumentsFactory: mockPatientDocumentsFactory,
      $window: mockWindow,
      $location: mockLocation,
      patSecurityService: mockPatSecurityService,
      NewPaymentTypesService: mockPaymentTypesService,
      AccountDebitTransactionFactory: mockAccountDebitTransactionFactory,
      tabLauncher: tabLauncher,
      AccountCreditTransactionFactory: mockAccountCreditTransactionFactory,
      PatientAccountFilterBarFactory: mockPatientAccountFilterBarFactory,
      TransactionHistoryExportService: mockTransactionHistoryExportService,
      CloseClaimOptionsService: mockCloseClaimOptionsService,
      SoarTransactionHistoryHttpService: mockTransactionHistoryService,
    });

    scope.docCtrls = mockDocCtrlsWindow;

    scope.$apply();
  }));

  describe('initial values -> ', function () {
    it('controller should exist and have run through setup logic', function () {
      expect(ctrl).not.toBeNull();
      //sets up Rows
      expect(
        mockAccountSummaryFactory.getTransactionHistory
      ).toHaveBeenCalled();
      expect(scope.rows.length).toBe(7);
      expect(ctrl.allRows.length).toBe(7);
      //calls to get other page load data
      expect(scope.dataForBalanceDetailRow.allProviders).toEqual([]);
      expect(scope.dataForBalanceDetailRow.currentPatient).toEqual({
        AccountId: 98,
        AccountMemberId: 99,
      });
      expect(scope.dataForBalanceDetailRow.Location).toEqual({
        LocationId: 3,
        Timezone: 'Central Standard Time',
      });
      expect(scope.dataForBalanceDetailRow.paymentTypes).toEqual([]);
      //selectAccountMembers
      expect(scope.selectedAccountMembers).toEqual([99]);
      expect(scope.keepCreateClaimViewOpen).toBe(false);
      expect(scope.sortObject.Date).toBe(2);
      expect(ctrl.lazyLoadingActive).toBe(false);
      expect(ctrl.currentPage).toBe(1);
      expect(scope.fixedHeader).toBe(false);
      expect(scope.sortingApplied).toBe(false);
      expect(scope.keepCreateClaimViewOpen).toBe(false);
    });
  });

  describe('ctrl.getHistory function -> ', function () {
    it('should call accountSummaryFactory.getTransactionHistory with page 1', function () {
      spyOn(ctrl, 'filterGrid');
      ctrl.getHistory();

      expect(
        mockAccountSummaryFactory.getTransactionHistory
      ).toHaveBeenCalled();
      expect(ctrl.allRows.length).toBe(7);
    });

    it('should disable the spinner when only paging', function () {
      spyOn(ctrl, 'filterGrid');
      ctrl.getHistory();

      expect(
        mockAccountSummaryFactory.getTransactionHistory
      ).toHaveBeenCalled();
      expect(ctrl.allRows.length).toBe(7);
    });
  });

  describe('ctrl.prepFilter ->', function () {
    it('should update ctrl filter object', function () {
      spyOn(ctrl, 'populatePatientPlans');
      var date = new Date();
      scope.filterObject = {
        transactionTypes: [1, 2, 3],
        locations: [100, 200],
        members: [400, 500],
        dateRange: { start: date, end: date },
        providers: [700, 800],
        IncludePaidTransactions: true,
        IncludeUnpaidTransactions: true,
        IncludeUnappliedTransactions: true,
        IncludeAppliedTransactions: true,
        Teeth: ['10', '20', '45', '59'],
      };
      scope.accountMembersOptionsTemp = [
        { personId: 400, accountMemberId: 800 },
        { personId: 500, accountMemberId: 900 },
      ];
      ctrl.prepFilter();
      expect(ctrl.filterObject.FromDate).toEqual(date.toDateString());
      expect(ctrl.filterObject.ToDate).toEqual(date.toDateString());
      expect(ctrl.filterObject.TransactionTypes).toEqual([1, 2, 3]);
      expect(ctrl.filterObject.LocationIds).toEqual([100, 200]);
      expect(ctrl.filterObject.PersonIds).toEqual([400, 500]);
      expect(ctrl.filterObject.ProviderIds).toEqual([700, 800]);
      expect(ctrl.filterObject.IncludePaidTransactions).toEqual(true);
      expect(ctrl.filterObject.IncludeUnpaidTransactions).toEqual(true);
      expect(ctrl.filterObject.IncludeUnappliedTransactions).toEqual(true);
      expect(ctrl.filterObject.IncludeAppliedTransactions).toEqual(true);
      expect(scope.selectedAccountMembers).toEqual([800, 900]);
      expect(ctrl.filterObject.Teeth).toEqual(['10', '20', '45', '59']);
      expect(ctrl.populatePatientPlans).toHaveBeenCalled();
    });
    it('should update ctrl filter object with all values', function () {
      spyOn(ctrl, 'populatePatientPlans');
      scope.filterObject = {
        transactionTypes: null,
        locations: null,
        members: '0',
        dateRange: { start: null, end: null },
        providers: null,
        IncludePaidTransactions: false,
        IncludeUnpaidTransactions: false,
        IncludeUnappliedTransactions: false,
        IncludeAppliedTransactions: false,
        Teeth: ['1', '2', '5', '9'],
      };
      scope.accountMembersOptionsTemp = [
        { personId: 400, accountMemberId: 800 },
        { personId: 500, accountMemberId: 900 },
      ];
      ctrl.prepFilter();
      expect(ctrl.filterObject.FromDate).toBeNull();
      expect(ctrl.filterObject.ToDate).toBeNull();
      expect(ctrl.filterObject.TransactionTypes).toBeNull();
      expect(ctrl.filterObject.LocationIds).toBeNull();
      expect(ctrl.filterObject.ProviderIds).toBeNull();
      expect(ctrl.filterObject.PersonIds).toBeNull();
      expect(scope.selectedAccountMembers).toEqual([800, 900]);
      expect(ctrl.filterObject.IncludePaidTransactions).toEqual(false);
      expect(ctrl.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(ctrl.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(ctrl.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(ctrl.filterObject.Teeth).toEqual(['1', '2', '5', '9']);
      expect(ctrl.populatePatientPlans).toHaveBeenCalled();
    });
    it('should update ctrl filter object with all values and set teeth to null', function () {
      spyOn(ctrl, 'populatePatientPlans');
      scope.filterObject = {
        transactionTypes: null,
        locations: null,
        members: '0',
        dateRange: { start: null, end: null },
        providers: null,
        IncludePaidTransactions: false,
        IncludeUnpaidTransactions: false,
        IncludeUnappliedTransactions: false,
        IncludeAppliedTransactions: false,
        Teeth: [],
      };
      scope.accountMembersOptionsTemp = [
        { personId: 400, accountMemberId: 800 },
        { personId: 500, accountMemberId: 900 },
      ];
      ctrl.prepFilter();
      expect(ctrl.filterObject.FromDate).toBeNull();
      expect(ctrl.filterObject.ToDate).toBeNull();
      expect(ctrl.filterObject.TransactionTypes).toBeNull();
      expect(ctrl.filterObject.LocationIds).toBeNull();
      expect(ctrl.filterObject.ProviderIds).toBeNull();
      expect(ctrl.filterObject.PersonIds).toBeNull();
      expect(scope.selectedAccountMembers).toEqual([800, 900]);
      expect(ctrl.filterObject.IncludePaidTransactions).toEqual(false);
      expect(ctrl.filterObject.IncludeUnpaidTransactions).toEqual(false);
      expect(ctrl.filterObject.IncludeUnappliedTransactions).toEqual(false);
      expect(ctrl.filterObject.IncludeAppliedTransactions).toEqual(false);
      expect(ctrl.filterObject.Teeth).toEqual(null);
      expect(ctrl.populatePatientPlans).toHaveBeenCalled();
    });
  });

  describe('scope.refreshTransactionHistoryPageData ->', function () {
    it('Create claim view should be closed if open', function () {
      var spy1 = spyOn(ctrl, 'getHistory');
      var spy2 = spyOn(scope, 'closeCreateClaimView');
      scope.showCreateClaimView = true;
      scope.refreshTransactionHistoryPageData();
      expect(ctrl.currentPage).toBe(1);
      expect(spy1).toHaveBeenCalled();
      expect(spy2).toHaveBeenCalledWith(true);
      expect(scope.doRefresh).toBe(true);
    });
    it('Should not close create claim view if not open', function () {
      var spy1 = spyOn(ctrl, 'getHistory');
      var spy2 = spyOn(scope, 'closeCreateClaimView');
      scope.showCreateClaimView = false;
      scope.refreshTransactionHistoryPageData();
      expect(ctrl.currentPage).toBe(1);
      expect(spy1).toHaveBeenCalled();
      expect(spy2).not.toHaveBeenCalledWith(true);
      expect(scope.doRefresh).toBe(true);
    });
  });

  describe('ctrl.getPaymentTypes ->', function () {
    it('should call getAllPaymentTypesMinimal', function () {
      ctrl.getPaymentTypes();
      expect(
        mockPaymentTypesService.getAllPaymentTypesMinimal
      ).toHaveBeenCalled();
    });
  });

  describe('paymentTypesGetSuccess -> ', function () {
    it('should set paymentType lists', function () {
      var val = {
        Value: [
          { PaymentTypeCategory: 1, Name: 'ActAcc', IsActive: true },
          { PaymentTypeCategory: 1, Name: 'InActAcc', IsActive: false },
          { PaymentTypeCategory: 2, Name: 'ActIns', IsActive: true },
          { PaymentTypeCategory: 2, Name: 'InActIns', IsActive: false },
        ],
      };
      ctrl.paymentTypesGetSuccess(val);
      expect(ctrl.allAccountPaymentTypes).toEqual([
        { PaymentTypeCategory: 1, Name: 'ActAcc', IsActive: true },
        { PaymentTypeCategory: 1, Name: 'InActAcc', IsActive: false },
      ]);
      expect(ctrl.activeAccountPaymentTypes).toEqual([
        { PaymentTypeCategory: 1, Name: 'ActAcc', IsActive: true },
      ]);
      expect(ctrl.insurancePaymentTypes).toEqual([
        { PaymentTypeCategory: 2, Name: 'ActIns', IsActive: true },
        { PaymentTypeCategory: 2, Name: 'InActIns', IsActive: false },
      ]);
    });
    it('should set empty paymentType lists if empty list given', function () {
      var val = { Value: [] };
      ctrl.paymentTypesGetSuccess(val);
      expect(ctrl.allAccountPaymentTypes).toEqual([]);
      expect(ctrl.activeAccountPaymentTypes).toEqual([]);
      expect(ctrl.insurancePaymentTypes).toEqual([]);
    });
  });

  describe('paymentTypesGetFailure -> ', function () {
    it('should throw toastr error', function () {
      ctrl.paymentTypesGetFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.showEditAndDeleteCondition -> ', function () {
    it('should return true when ObjectType is Document', function () {
      var res = scope.showEditAndDeleteCondition({ ObjectType: 'Document' });
      expect(res).toBe(true);
    });
    it('should return true when TransactionTypeId is 6', function () {
      var res = scope.showEditAndDeleteCondition({ TransactionTypeId: 6 });
      expect(res).toBe(true);
    });
  });

  describe('scope.disableEditForMenu  -> ', function () {
    it('should return 1 when claim in process', function () {
      var res = scope.disableEditForMenu({
        InProcess: true,
        Claims: [{ Status: 9 }],
      });
      expect(res).toBe(1);
    });
    it('should return 3 when authorized and type 5', function () {
      var res = scope.disableEditForMenu({
        IsAuthorized: true,
        TransactionTypeId: 5,
      });
      expect(res).toBe(3);
    });
    it('should return 3 when authorized and type not 5', function () {
      var res = scope.disableEditForMenu({
        IsAuthorized: true,
        TransactionTypeId: 6,
      });
      expect(res).toBe(2);
    });
    it('should return 4 when not authorized and deposited', function () {
      var res = scope.disableEditForMenu({
        IsAuthorized: false,
        IsDeposited: true,
      });
      expect(res).toBe(4);
    });
    it('should return 5 when not authorized and not deposited and Type is 3 and cannot edit at all locations', function () {
      //This is now handled at the time of click
    });
    it('should return 0 when none of the other cases are met', function () {
      var res = scope.disableEditForMenu({});
      expect(res).toBe(0);
    });
  });

  describe('scope.showCreateCustomInvoice -> ', function () {
    it('should filter out rows that are not valid for invoice', function () {
      scope.isCreateCustomInvoice = false;
      scope.showCreateCustomInvoice();
      expect(scope.currentDisplay).toBe('Custom Invoice');
      expect(scope.isCreateCustomInvoice).toBe(true);
      expect(
        mockPatientAccountFilterBarFactory.setFilterBarStatus
      ).toHaveBeenCalledWith(true);
    });
  });

  describe('scope.cancelCreateCustomInvoice -> ', function () {
    it('should restore original list', function () {
      scope.isCreateCustomInvoice = false;
      scope.showCreateCustomInvoice();
      expect(scope.selectedCount).toBe(0);
      scope.cancelCreateCustomInvoice();
      expect(scope.currentDisplay).toBe('');
      expect(scope.rows.length).toBe(7);
      expect(scope.isCreateCustomInvoice).toBe(false);
      expect(
        mockPatientAccountFilterBarFactory.setFilterBarStatus
      ).toHaveBeenCalledWith(false);
    });
  });

  describe('scope.createCustomInvoice -> ', function () {
    it('should filter out rows that are not valid for invoice and create modal object', function () {
      scope.showCreateCustomInvoice();
      scope.rows[0].selected = true;
      scope.rows[1].selected = true;
      scope.rows[2].selected = true;
      scope.rows[3].selected = true;
      scope.rows[4].selected = true;
      scope.rows[5].selected = true;
      scope.createCustomInvoice();
      scope.$apply();
      expect(
        mockPatientInvoiceFactory.ConfirmInvoiceOptions
      ).toHaveBeenCalled();
      expect(
        mockPatientInvoiceFactory.ConfirmInvoiceOptions.calls.mostRecent()
          .args[0].InvoiceOptions.InvoiceDetails.length
      ).toBe(8);
    });
  });

  describe('ctrl.populatePatientPlans ->', function () {
    beforeEach(function () {
      spyOn(ctrl, 'setSelectedPlan');
    });
    it('Should set plansTrimmed variable correctly', function () {
      var plan1 = {
        PatientId: 1,
        IsDeleted: false,
        Priority: 0,
        BenefitPlanId: 10,
        PatientBenefitPlanId: 20,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan1' } },
      };
      var plan2 = {
        PatientId: 1,
        IsDeleted: false,
        Priority: 1,
        BenefitPlanId: 11,
        PatientBenefitPlanId: 21,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan2' } },
      };
      var plan3 = {
        PatientId: 1,
        IsDeleted: false,
        Priority: 2,
        BenefitPlanId: 12,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan3' } },
      };
      ctrl.allPatientPlans = [
        { PatientBenefitPlanDto: plan1 },
        { PatientBenefitPlanDto: plan2 },
        { PatientBenefitPlanDto: plan3 },
      ];
      scope.filterObject.members = [1];
      ctrl.populatePatientPlans();
      expect(scope.plansTrimmed.length).toBe(3);
      expect(scope.plansTrimmed[0].Priority).toBe(0);
      expect(scope.plansTrimmed[0].Name).toBe('Plan1 (Primary)');
      expect(scope.plansTrimmed[0].PatientBenefitPlanId).toBe(20);
      expect(scope.plansTrimmed[1].Priority).toBe(1);
      expect(scope.plansTrimmed[1].Name).toBe('Plan2 (Secondary)');
      expect(scope.plansTrimmed[1].PatientBenefitPlanId).toBe(21);
      expect(scope.plansTrimmed[2].Priority).toBe(2);
      expect(scope.plansTrimmed[2].Name).toBe('Plan3 (3rd)');
      expect(scope.plansTrimmed[2].PatientBenefitPlanId).toBe(22);
      expect(scope.selectedPlanId).toBe(undefined);
      expect(ctrl.setSelectedPlan).toHaveBeenCalled();
    });
    it('Should set plan if patient has only one plan', function () {
      var plan1 = {
        PatientId: 1,
        IsDeleted: false,
        Priority: 0,
        BenefitPlanId: 10,
        PatientBenefitPlanId: 20,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan1' } },
      };
      var plan2 = {
        PatientId: 2,
        IsDeleted: false,
        Priority: 1,
        BenefitPlanId: 11,
        PatientBenefitPlanId: 21,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan2' } },
      };
      var plan3 = {
        PatientId: 3,
        IsDeleted: false,
        Priority: 2,
        BenefitPlanId: 12,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan3' } },
      };
      ctrl.allPatientPlans = [
        { PatientBenefitPlanDto: plan1 },
        { PatientBenefitPlanDto: plan2 },
        { PatientBenefitPlanDto: plan3 },
      ];
      scope.filterObject.members = [2];
      ctrl.populatePatientPlans();
      expect(scope.plansTrimmed.length).toBe(1);
      expect(scope.plansTrimmed[0].Priority).toBe(1);
      expect(scope.plansTrimmed[0].Name).toBe('Plan2 (Secondary)');
      expect(scope.plansTrimmed[0].PatientBenefitPlanId).toBe(21);
      expect(ctrl.setSelectedPlan).toHaveBeenCalled();
    });
    it('No plans should be available if no plans on account apply to patient', function () {
      var plan1 = {
        PatientId: 1,
        IsDeleted: false,
        Priority: 0,
        BenefitPlanId: 10,
        PatientBenefitPlanId: 20,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan1' } },
      };
      var plan2 = {
        PatientId: 2,
        IsDeleted: false,
        Priority: 1,
        BenefitPlanId: 11,
        PatientBenefitPlanId: 21,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan2' } },
      };
      var plan3 = {
        PatientId: 3,
        IsDeleted: false,
        Priority: 2,
        BenefitPlanId: 12,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan3' } },
      };
      ctrl.allPatientPlans = [
        { PatientBenefitPlanDto: plan1 },
        { PatientBenefitPlanDto: plan2 },
        { PatientBenefitPlanDto: plan3 },
      ];
      scope.filterObject.members = [4];
      ctrl.populatePatientPlans();
      expect(scope.plansTrimmed.length).toBe(0);
      expect(scope.selectedPlanId).toBe(undefined);
      expect(ctrl.setSelectedPlan).toHaveBeenCalled();
    });
    it('Should set plansTrimmed with list of plans with patient id in filterObject list', function () {
      var plan1 = {
        PatientId: 1,
        IsDeleted: false,
        Priority: 0,
        BenefitPlanId: 10,
        PatientBenefitPlanId: 20,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan1' } },
      };
      var plan2 = {
        PatientId: 2,
        IsDeleted: false,
        Priority: 1,
        BenefitPlanId: 11,
        PatientBenefitPlanId: 21,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan2' } },
      };
      var plan3 = {
        PatientId: 3,
        IsDeleted: false,
        Priority: 2,
        BenefitPlanId: 12,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan3' } },
      };
      ctrl.allPatientPlans = [
        { PatientBenefitPlanDto: plan1 },
        { PatientBenefitPlanDto: plan2 },
        { PatientBenefitPlanDto: plan3 },
      ];
      scope.filterObject.members = [1, 2];
      ctrl.populatePatientPlans();
      expect(scope.plansTrimmed.length).toBe(2);
      expect(scope.plansTrimmed[0].Priority).toBe(0);
      expect(scope.plansTrimmed[0].Name).toBe('Plan1 (Primary)');
      expect(scope.plansTrimmed[0].PatientBenefitPlanId).toBe(20);
      expect(scope.plansTrimmed[1].Priority).toBe(1);
      expect(scope.plansTrimmed[1].Name).toBe('Plan2 (Secondary)');
      expect(scope.plansTrimmed[1].PatientBenefitPlanId).toBe(21);
      expect(scope.selectedPlanId).toBe(undefined);
      expect(ctrl.setSelectedPlan).toHaveBeenCalled();
    });
    it('Should add all plans if all patients are selected', function () {
      var plan1 = {
        PatientId: 1,
        IsDeleted: false,
        Priority: 0,
        BenefitPlanId: 10,
        PatientBenefitPlanId: 20,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan1' } },
      };
      var plan2 = {
        PatientId: 2,
        IsDeleted: false,
        Priority: 1,
        BenefitPlanId: 11,
        PatientBenefitPlanId: 21,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan2' } },
      };
      var plan3 = {
        PatientId: 3,
        IsDeleted: false,
        Priority: 2,
        BenefitPlanId: 12,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan3' } },
      };
      ctrl.allPatientPlans = [
        { PatientBenefitPlanDto: plan1 },
        { PatientBenefitPlanDto: plan2 },
        { PatientBenefitPlanDto: plan3 },
      ];
      scope.filterObject.members = '0';
      ctrl.populatePatientPlans();
      expect(scope.plansTrimmed.length).toBe(3);
      expect(scope.plansTrimmed[0].Priority).toBe(0);
      expect(scope.plansTrimmed[0].Name).toBe('Plan1 (Primary)');
      expect(scope.plansTrimmed[0].PatientBenefitPlanId).toBe(20);
      expect(scope.plansTrimmed[1].Priority).toBe(1);
      expect(scope.plansTrimmed[1].Name).toBe('Plan2 (Secondary)');
      expect(scope.plansTrimmed[1].PatientBenefitPlanId).toBe(21);
      expect(scope.plansTrimmed[2].Priority).toBe(2);
      expect(scope.plansTrimmed[2].Name).toBe('Plan3 (3rd)');
      expect(scope.plansTrimmed[2].PatientBenefitPlanId).toBe(22);
      expect(scope.selectedPlanId).toBe(undefined);
      expect(ctrl.setSelectedPlan).toHaveBeenCalled();
    });
  });

  describe('setSelectedPlan ->', function () {
    it('should set selectedPlanId to only plan if only one plan', function () {
      scope.plansTrimmed = [{ PatientBenefitPlanId: '1' }];
      ctrl.setSelectedPlan();
      timeout.flush();
      expect(scope.selectedPlanId).toBe('1');
    });
    it('should set selectedPlanId to empty string if multiple plans', function () {
      scope.plansTrimmed = [
        { PatientBenefitPlanId: '1' },
        { PatientBenefitPlanId: '2' },
      ];
      ctrl.setSelectedPlan();
      timeout.flush();
      expect(scope.selectedPlanId).toBe('');
    });
  });

  describe('scope.openCreateClaimView  -> ', function () {
    beforeEach(function () {
      ctrl.allRows = [
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Claims: [],
          EncounterId: 12,
          TotalEstInsurance: 12,
          ObjectId: 33,
          TotalAdjEstimate: 14,
          IsDeleted: false,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Claims: [],
          EncounterId: 12,
          TotalEstInsurance: 12,
          ObjectId: 34,
          TotalAdjEstimate: 14,
          IsDeleted: true,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Claims: [{ Status: 3 }],
          EncounterId: 12,
          TotalEstInsurance: 12,
          ObjectId: 35,
          TotalAdjEstimate: 14,
          IsDeleted: false,
          hasOpenClaim: true,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Claims: [],
          EncounterId: 12,
          TotalEstInsurance: 12,
          ObjectId: 36,
          TotalAdjEstimate: 14,
          IsDeleted: false,
        },
      ];
    });
    it('should format grid for checkbox if plan selected', function () {
      scope.showCreateClaimView = false;
      scope.showInvoiceButtons = true;
      scope.selectedPlanId = 1;
      scope.openCreateClaimView();
      expect(scope.currentDisplay).toBe('Create Claim');
      expect(scope.showCreateClaimView).toBe(true);
      expect(scope.showInvoiceButtons).toBe(false);
      expect(scope.isSelectionView).toBe(true);
      expect(
        mockPatientAccountFilterBarFactory.setFilterBarStatus
      ).toHaveBeenCalledWith(true);
    });
    it('should not format grid for checkbox if plan is not selected', function () {
      scope.showCreateClaimView = true;
      scope.showInvoiceButtons = true;
      scope.isSelectionView = false;
      scope.isCheckAll = true;
      scope.openCreateClaimView();
      expect(scope.currentDisplay).toBe('Create Claim');
      expect(scope.showCreateClaimView).toBe(true);
      expect(scope.showInvoiceButtons).toBe(false);
      expect(scope.isSelectionView).toBe(true);
      expect(
        mockPatientAccountFilterBarFactory.setFilterBarStatus
      ).toHaveBeenCalledWith(true);
    });
  });

  describe('scope.closeCreateClaimView  -> ', function () {
    it('should not filter grid if given true input', function () {
      spyOn(scope, 'resetSorting');
      spyOn(ctrl, 'setSelectedPlan');
      scope.showCreateClaimView = true;
      ctrl.filterGrid();
      scope.closeCreateClaimView(true);
      expect(scope.selectedCount).toBe(0);
      expect(scope.currentDisplay).toBe('');
      expect(scope.showCreateClaimView).toBe(false);
      expect(scope.showInvoiceButtons).toBe(true);
      expect(scope.isSelectionView).toBe(false);
      expect(scope.keepCreateClaimViewOpen).toBe(false);
      expect(scope.resetSorting).toHaveBeenCalled();
      expect(
        mockPatientAccountFilterBarFactory.setFilterBarStatus
      ).toHaveBeenCalledWith(false);
      expect(ctrl.setSelectedPlan).toHaveBeenCalled();
    });
    it('should filter grid if given false input', function () {
      spyOn(scope, 'resetSorting');
      spyOn(ctrl, 'setSelectedPlan');
      scope.showCreateClaimView = true;
      ctrl.filterGrid();
      scope.closeCreateClaimView(false);
      expect(scope.showCreateClaimView).toBe(false);
      expect(scope.showInvoiceButtons).toBe(true);
      expect(scope.isSelectionView).toBe(false);
      expect(scope.rows.length).toBe(7);
      expect(scope.keepCreateClaimViewOpen).toBe(false);
      expect(scope.resetSorting).toHaveBeenCalled();
      expect(
        mockPatientAccountFilterBarFactory.setFilterBarStatus
      ).toHaveBeenCalledWith(false);
      expect(ctrl.setSelectedPlan).toHaveBeenCalled();
    });
  });

  describe('ctrl.completeCreateClaim ->', function () {
    it('Call to get service transactions should be made if selected services', function () {
      var spy1 = spyOn(ctrl, 'getServicesSuccess');
      var spy2 = spyOn(ctrl, 'getServicesFailure');
      scope.selectedPlanId = 1;
      scope.rows = [
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2016-04-25T12:00:00Z',
          ObjectId: 33,
          ServiceManuallySelected: true,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2015-03-25T12:00:00Z',
          ObjectId: 34,
          ServiceManuallySelected: false,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2017-06-25T12:00:00Z',
          ObjectId: 35,
          ServiceManuallySelected: true,
        },
      ];
      scope.completeCreateClaim();
      expect(
        mockPatientServices.ServiceTransactions.getServiceTransactionsByIds
      ).toHaveBeenCalledWith([33, 35], spy1, spy2);
    });
    it('Call to get service transactions should not be made if no selected services', function () {
      scope.rows = [
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2016-04-25T12:00:00Z',
          ObjectId: 33,
          ServiceManuallySelected: false,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2015-03-25T12:00:00Z',
          ObjectId: 34,
          ServiceManuallySelected: false,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2017-06-25T12:00:00Z',
          ObjectId: 35,
          ServiceManuallySelected: false,
        },
      ];
      scope.selectedPlanId = 1;
      scope.completeCreateClaim();
      expect(
        mockPatientServices.ServiceTransactions.getServiceTransactionsByIds
      ).not.toHaveBeenCalled();
    });
    it('Call to get service transactions should not be made if selected plan is null', function () {
      scope.rows = [
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2016-04-25T12:00:00Z',
          ObjectId: 33,
          ServiceManuallySelected: true,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2015-03-25T12:00:00Z',
          ObjectId: 34,
          ServiceManuallySelected: false,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Date: '2017-06-25T12:00:00Z',
          ObjectId: 35,
          ServiceManuallySelected: true,
        },
      ];
      scope.selectedPlanId = null;
      scope.completeCreateClaim();
      expect(
        mockPatientServices.ServiceTransactions.getServiceTransactionsByIds
      ).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.getServicesSuccess ->', function () {
    beforeEach(function () {
      ctrl.allPatientPlans = [
        {
          PatientBenefitPlanDto: {
            PatientId: 1,
            IsDeleted: false,
            Priority: 0,
            BenefitPlanId: 10,
            PatientBenefitPlanId: 20,
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan1' } },
          },
        },
        {
          PatientBenefitPlanDto: {
            PatientId: 2,
            IsDeleted: false,
            Priority: 1,
            BenefitPlanId: 11,
            PatientBenefitPlanId: 21,
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { Name: 'Plan2' } },
          },
        },
      ];
    });
    it('Call to ctrl.calculateEstimatatedInsuranceOption should be made if selected services and plan found matching scope.selectedPlanId ', function () {
      spyOn(ctrl, 'calculateEstimatatedInsuranceOption').and.returnValue({
        then: jasmine.createSpy().and.returnValue(true),
      });
      scope.selectedPlanId = 21;
      var params = {
        patientBenefitPlanId: scope.selectedPlanId,
        calculateEstimatatedInsurance: true,
        applyPredAuthNumber: false,
      };
      var res = {
        Value: [
          {
            ServiceTransactionId: 'ServiceTransaction',
            TransactionTypeId: 1,
            DateEntered: '2016-04-25T12:00:00Z',
          },
          {
            ServiceTransactionId: 'ServiceTransaction',
            TransactionTypeId: 1,
            DateEntered: '2017-06-25T12:00:00Z',
          },
        ],
      };
      ctrl.getServicesSuccess(res);
      expect(ctrl.calculateEstimatatedInsuranceOption).toHaveBeenCalled();
    });

    it('Call to ctrl.calculateEstimatatedInsuranceOption should be not made if selected services and plan not found matching scope.selectedPlanId ', function () {
      spyOn(ctrl, 'calculateEstimatatedInsuranceOption').and.returnValue({
        then: jasmine.createSpy().and.returnValue(true),
      });
      scope.selectedPlanId = 19;
      var params = {
        patientBenefitPlanId: scope.selectedPlanId,
        calculateEstimatatedInsurance: true,
        applyPredAuthNumber: false,
      };
      var res = {
        Value: [
          {
            ServiceTransactionId: 'ServiceTransaction',
            TransactionTypeId: 1,
            DateEntered: '2016-04-25T12:00:00Z',
          },
          {
            ServiceTransactionId: 'ServiceTransaction',
            TransactionTypeId: 1,
            DateEntered: '2017-06-25T12:00:00Z',
          },
        ],
      };
      ctrl.getServicesSuccess(res);
      expect(ctrl.calculateEstimatatedInsuranceOption).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.getServicesFailure ->', function () {
    it('Call error toaster message', function () {
      ctrl.getServicesFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.viewInvoice -> ', function () {
    it('should call patientInvoiceFactory', function () {
      scope.viewInvoice({ EncounterId: 1, PatientName: 'John Doe' });
      expect(
        mockPatientInvoiceFactory.ViewEncounterInvoice
      ).toHaveBeenCalledWith(1, 'John Doe', 98);
      expect(mockModalFactory.ConfirmModalWithLink).not.toHaveBeenCalled();
      expect(
        mockPatientInvoiceFactory.CreateCurrentInvoice
      ).not.toHaveBeenCalled();
    });
    it('should ask user to create a custom invoice when no invoice', function () {
      mockPatientInvoiceFactory.ViewEncounterInvoice = jasmine
        .createSpy('PatientInvoiceFactory.ViewEncounterInvoice')
        .and.returnValue({
          then: function (callback) {
            callback({ NoInvoceEncounter: true });
          },
        });
      scope.viewInvoice({ EncounterId: 1, PatientName: 'John Doe' });
      expect(
        mockPatientInvoiceFactory.ViewEncounterInvoice
      ).toHaveBeenCalledWith(1, 'John Doe', 98);
      expect(mockModalFactory.ConfirmModalWithLink).toHaveBeenCalledWith(
        'Attention',
        _.escape(
          '<a>Original Invoice is unavailable. Please use Current Invoice. (Click Here)</a>'
        ),
        'Cancel'
      );
      expect(mockPatientInvoiceFactory.CreateCurrentInvoice).toHaveBeenCalled();
    });
  });

  describe('ctrl.checkForAdjustment ->', function () {
    it('Adjustment prompt should be called', function () {
      var servs = [
        { ServiceTransactionId: 1, AdjustedEstimate: 10 },
        { ServiceTransactionId: 2, AdjustedEstimate: 20 },
        { ServiceTransactionId: 3, AdjustedEstimate: 30 },
      ];
      var claim = {
        ServiceTransactionToClaimPaymentDtos: servs,
        PatientId: 999,
        PatientName: 'Rob',
        ClaimId: 777,
      };
      var plan1 = {
        PatientId: 1,
        Priority: 2,
        PatientBenefitPlanId: 20,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: { ApplyAdjustments: 1, FeesIns: 2 },
        },
      };
      var plan2 = {
        PatientId: 1,
        Priority: 0,
        PatientBenefitPlanId: 21,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: { ApplyAdjustments: 1, FeesIns: 2 },
        },
      };
      var plan3 = {
        PatientId: 1,
        Priority: 1,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: { ApplyAdjustments: 1, FeesIns: 2 },
        },
      };
      ctrl.allPatientPlans = [
        { PatientBenefitPlanDto: plan1 },
        { PatientBenefitPlanDto: plan2 },
        { PatientBenefitPlanDto: plan3 },
      ];
      var patientPlan = { PatientBenefitPlanDto: plan3 };
      scope.selectedPlanId = 22;
      var spy1 = spyOn(ctrl, 'openAdjustmentPrompt');
      var spy2 = spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.checkForAdjustment(claim);
      expect(spy1).toHaveBeenCalledWith(claim, patientPlan);
      expect(spy2).not.toHaveBeenCalled();
    });
    it('Adjustment prompt should not be called if ApplyAdjustments does not equal 1', function () {
      var servs = [
        { ServiceTransactionId: 1, AdjustedEstimate: 10 },
        { ServiceTransactionId: 2, AdjustedEstimate: 20 },
        { ServiceTransactionId: 3, AdjustedEstimate: 30 },
      ];
      var claim = {
        ServiceTransactionToClaimPaymentDtos: servs,
        PatientId: 999,
        PatientName: 'Rob',
        ClaimId: 777,
      };
      var plan = {
        PatientId: 1,
        Priority: 1,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: { ApplyAdjustments: null, FeesIns: 2 },
        },
      };
      ctrl.allPatientPlans = [{ PatientBenefitPlanDto: plan }];
      scope.selectedPlanId = 22;
      var spy1 = spyOn(ctrl, 'openAdjustmentPrompt');
      var spy2 = spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.checkForAdjustment(claim);
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
    it('Adjustment prompt should not be called if FeeIns does not equal 2', function () {
      var servs = [
        { ServiceTransactionId: 1, AdjustedEstimate: 10 },
        { ServiceTransactionId: 2, AdjustedEstimate: 20 },
        { ServiceTransactionId: 3, AdjustedEstimate: 30 },
      ];
      var claim = {
        ServiceTransactionToClaimPaymentDtos: servs,
        PatientId: 999,
        PatientName: 'Rob',
        ClaimId: 777,
      };
      var plan = {
        PatientId: 1,
        Priority: 1,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: { ApplyAdjustments: 1, FeesIns: null },
        },
      };
      ctrl.allPatientPlans = [{ PatientBenefitPlanDto: plan }];
      scope.selectedPlanId = 22;
      var spy1 = spyOn(ctrl, 'openAdjustmentPrompt');
      var spy2 = spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.checkForAdjustment(claim);
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
    it('Adjustment prompt should not be called sum of estimated adjustment is 0', function () {
      var servs = [
        { ServiceTransactionId: 1, AdjustedEstimate: 0 },
        { ServiceTransactionId: 2, AdjustedEstimate: 0 },
        { ServiceTransactionId: 3, AdjustedEstimate: 0 },
      ];
      var claim = {
        ServiceTransactionToClaimPaymentDtos: servs,
        PatientId: 999,
        PatientName: 'Rob',
        ClaimId: 777,
      };
      var plan = {
        PatientId: 1,
        Priority: 1,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: { ApplyAdjustments: 1, FeesIns: 2 },
        },
      };
      ctrl.allPatientPlans = [{ PatientBenefitPlanDto: plan }];
      scope.selectedPlanId = 22;
      var spy1 = spyOn(ctrl, 'openAdjustmentPrompt');
      var spy2 = spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.checkForAdjustment(claim);
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
    it('Adjustment prompt should not be called if no secondary plan', function () {
      var servs = [
        { ServiceTransactionId: 1, AdjustedEstimate: 10 },
        { ServiceTransactionId: 2, AdjustedEstimate: 20 },
        { ServiceTransactionId: 3, AdjustedEstimate: 30 },
      ];
      var claim = {
        ServiceTransactionToClaimPaymentDtos: servs,
        PatientId: 999,
        PatientName: 'Rob',
        ClaimId: 777,
      };
      var plan = {
        PatientId: 1,
        Priority: 0,
        PatientBenefitPlanId: 22,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: { ApplyAdjustments: 1, FeesIns: 2 },
        },
      };
      ctrl.allPatientPlans = [{ PatientBenefitPlanDto: plan }];
      scope.selectedPlanId = 22;
      var spy1 = spyOn(ctrl, 'openAdjustmentPrompt');
      var spy2 = spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.checkForAdjustment(claim);
      expect(spy1).not.toHaveBeenCalled();
      expect(spy2).toHaveBeenCalled();
    });
  });

  describe('ctrl.completeCreateClaimFailure ->', function () {
    it('Error toaster message should be called', function () {
      ctrl.completeCreateClaimFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('ctrl.openAdjustmentPrompt ->', function () {
    beforeEach(function () {
      mockModalFactory.ConfirmModal = jasmine
        .createSpy('ModalFactory.ConfirmModal')
        .and.returnValue({
          then: function () {},
        });
    });
    it('Confirm modal should be called', function () {
      var title = 'Fee Schedule Present';
      var message =
        "The patient's benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?";
      var button1Text = 'Yes';
      var button2Text = 'No';
      ctrl.openAdjustmentPrompt();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalledWith(
        title,
        message,
        button1Text,
        button2Text
      );
    });
  });

  describe('ctrl.openAdjustmentModal ->', function () {
    it('Confirm modal should be called', function () {
      var servs = [
        { ServiceTransactionId: 1, AdjustedEstimate: 10 },
        { ServiceTransactionId: 2, AdjustedEstimate: 20 },
        { ServiceTransactionId: 3, AdjustedEstimate: 30 },
      ];
      var claim = {
        ServiceTransactionToClaimPaymentDtos: servs,
        PatientId: 999,
        PatientName: 'Rob',
        ClaimId: 777,
      };
      var value = { AccountId: 98 };
      var result = { Value: value };
      var plan = { PatientBenefitPlanDto: { BenefitPlanId: 666 } };
      var patientData = { patientId: 999, patientName: 'Rob' };
      var serviceTransactionData = {
        serviceTransactions: [1, 2, 3],
        isForCloseClaim: true,
        unPaidAmout: 60,
      };
      ctrl.providers = [];
      var dataForModal = {
        PatientAccountDetails: value,
        DefaultSelectedIndex: 1,
        AllProviders: [],
        BenefitPlanId: 666,
        claimAmount: 0,
        isFeeScheduleAdjustment: true,
        claimId: 777,
        serviceTransactionData: serviceTransactionData,
        patientData: patientData,
      };
      mockPatientServices.Account.getByPersonId = jasmine
        .createSpy('PatientServices.Account.getByPersonId')
        .and.returnValue(result);
      ctrl.openAdjustmentPrompt(claim, plan);
      scope.$apply();
      expect(mockModalDataFactory.GetTransactionModalData).toHaveBeenCalledWith(
        dataForModal,
        999
      );
    });
  });

  describe('ctrl.getPriorityName ->', function () {
    it('should return Primary name', function () {
      var priority = ctrl.getPriorityName(0);
      expect(priority).toBe('Primary');
    });
    it('should return Secondary name', function () {
      var priority = ctrl.getPriorityName(1);
      expect(priority).toBe('Secondary');
    });
    it('should return 3rd name', function () {
      var priority = ctrl.getPriorityName(2);
      expect(priority).toBe('3rd');
    });
    it('should return 4th name', function () {
      var priority = ctrl.getPriorityName(3);
      expect(priority).toBe('4th');
    });
    it('should return 5th name', function () {
      var priority = ctrl.getPriorityName(4);
      expect(priority).toBe('5th');
    });
    it('should return 6th name', function () {
      var priority = ctrl.getPriorityName(5);
      expect(priority).toBe('6th');
    });
    it('should return unkown name', function () {
      var priority = ctrl.getPriorityName(9);
      expect(priority).toBe('unknown');
    });
  });

  describe('scope.viewCarrierResponse ->', function () {
    it('should not open carrier response if row is undefined', function () {
      var row = undefined;
      scope.viewCarrierResponse(row);
      expect(mockLocation.path).not.toHaveBeenCalled();
    });
    it('should not open carrier response if person id is null', function () {
      var row = { Claims: [{ ClaimId: 2 }], PersonId: null };
      scope.viewCarrierResponse(row);
      expect(mockLocation.path).not.toHaveBeenCalled();
    });
    it('should not open carrier response if no claims', function () {
      var row = { Claims: [], PersonId: 50 };
      scope.viewCarrierResponse(row);
      expect(mockLocation.path).not.toHaveBeenCalled();
    });
    it('should open carrier response if person id and claim id given', function () {
      var row = { Claims: [{ ClaimId: 2 }], PersonId: 50 };
      scope.viewCarrierResponse(row);
      expect(mockLocation.path).toHaveBeenCalledWith(
        'BusinessCenter/Insurance/Claims/CarrierResponse/2/Patient/50'
      );
    });
  });

  describe('ctrl.filterGrid ->', function () {
    beforeEach(function () {
      ctrl.allRows = [
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Claims: [],
          EncounterId: 12,
          TotalEstInsurance: 12,
          ObjectId: 33,
          TotalAdjEstimate: 14,
          IsDeleted: false,
          hasOpenClaim: false,
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Claims: [],
          EncounterId: 12,
          TotalEstInsurance: 12,
          ObjectId: 34,
          TotalAdjEstimate: 14,
          IsDeleted: true,
          hasOpenClaim: false,
        },
        {
          ObjectType: 'CreditTransaction',
          TransactionTypeId: 3,
          UnassignedAmount: 30,
          ObjectId: 2,
          AssociatedServiceTransactionIds: [33],
        },
        {
          ObjectType: 'CreditTransaction',
          TransactionTypeId: 4,
          UnassignedAmount: 70,
          objectId: 3,
        },
        { ObjectType: 'CreditTransaction', TransactionTypeId: 2 },
        { ObjectType: 'CreditTransaction', TransactionTypeId: 6 },
        { ObjectType: 'DebitTransaction', TransactionTypeId: 5 },
        {
          ObjectType: 'PersonAccountNote',
          Type: 'Account Note',
          Claims: [{ Status: 7 }],
        },
        {
          ObjectType: 'ServiceTransaction',
          TransactionTypeId: 1,
          Claims: [{ Status: 3 }],
          EncounterId: 12,
          TotalEstInsurance: 12,
          ObjectId: 37,
          TotalAdjEstimate: 14,
          hasOpenClaim: true,
        },
      ];
    });
    it('Should call the refresh method', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.filterGrid();

      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });

    it('Should set the correct filter properties for create claims view', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      scope.showCreateClaimView = true;
      scope.isCreateCustomInvoice = false;
      ctrl.filterGrid();

      expect(scope.filterObject.transactionTypes.length).toBe(1);
      expect(scope.filterObject.Statuses.length).toBe(1);
      expect(scope.filterObject.IncludeServicesWithOpenClaims).toBe(false);
      expect(scope.filterObject.IncludeAccountNotes).toBe(false);
      expect(scope.filterObject.IncludeDocuments).toBe(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toBe(true);
      expect(scope.filterObject.IncludePaidTransactions).toBe(true);
      expect(scope.keepCreateClaimViewOpen).toBe(true);
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });

    it('Should set the correct filter properties for custom invoice view', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      scope.showCreateClaimView = false;
      scope.isCreateCustomInvoice = true;
      ctrl.filterGrid();

      expect(scope.filterObject.transactionTypes.length).toBe(6);
      expect(scope.filterObject.Statuses.length).toBe(1);
      expect(scope.filterObject.IncludeServicesWithOpenClaims).toBe(true);
      expect(scope.filterObject.IncludeAccountNotes).toBe(false);
      expect(scope.filterObject.IncludeDocuments).toBe(false);
      expect(scope.filterObject.IncludeUnpaidTransactions).toBe(true);
      expect(scope.filterObject.IncludePaidTransactions).toBe(true);
      expect(scope.filterObject.IncludeAppliedTransactions).toBe(true);
      expect(scope.filterObject.IncludeUnpaidTransactions).toBe(true);
      expect(scope.keepCreateClaimViewOpen).toBe(false);
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });

    it('Should set the filters back to original when leaving other views', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.originalFilters = [{ Filter1: 'test' }];
      scope.showCreateClaimView = false;
      scope.isCreateCustomInvoice = false;
      ctrl.filterGrid();

      expect(scope.filterObject).toBe(ctrl.originalFilters);
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });
  });

  describe('scope.deleteRowItem -> ', function () {
    it('should present Delete Document confirmation modal when ObjectType is Document', function () {
      scope.deleteRowItem({ ObjectType: 'Document', ObjectIdLong: 123 });
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
      expect(mockModalFactory.ConfirmModal.calls.argsFor(0)).toContain(
        'Delete Document'
      );
    });
    it('should delete document when ObjectType is Document', function () {
      scope.deleteRowItem({ ObjectType: 'Document', ObjectIdLong: 123 });
      expect(mockPatientDocumentsFactory.DeleteDocument).toHaveBeenCalledWith(
        jasmine.objectContaining({ DocumentId: 123 })
      );
    });
    it('should refresh page data when document is deleted', function () {
      scope.deleteRowItem({ ObjectType: 'Document', ObjectIdLong: 123 });
      expect(
        mockAccountSummaryFactory.getTransactionHistory
      ).toHaveBeenCalled();
    });
    it('should call accountServiceTransaction.deleteServiceTransaction when ObjectType is ServiceTransaction', function () {
      scope.deleteRowItem({
        ObjectType: 'ServiceTransaction',
        ObjectId: 1,
        LocationId: 2,
        personId: 3,
      });
      expect(
        mockAccountServiceTransactionFactory.deleteServiceTransaction
      ).toHaveBeenCalled();
    });
    it('should delete insurance payment when transactiontype is insurance payment', function () {
      spyOn(ctrl, 'deleteInsurancePayment');
      scope.deleteRowItem({
        TransactionTypeId: 3,
        ObjectType: 'CreditTransaction',
      });
      expect(ctrl.deleteInsurancePayment).toHaveBeenCalled();
    });
    it('should call accountDebitTransaction.deleteDebit when ObjectType is DebitTransaction', function () {
      scope.deleteRowItem({
        ObjectType: 'DebitTransaction',
        ObjectId: 1,
        TransactionTypeId: 5,
      });
      expect(
        mockAccountDebitTransactionFactory.deleteDebit
      ).toHaveBeenCalledWith(1, 5, scope.refreshTransactionHistoryPageData);
    });
  });

  describe('scope.displayDocument -> ', function () {
    it('should display document using Description as Document.Name', function () {
      scope.displayDocument({ Description: 'MyDoc' });
      expect(mockPatientDocumentsFactory.DisplayDocument).toHaveBeenCalledWith(
        jasmine.objectContaining({ Name: 'MyDoc' })
      );
    });
  });

  describe('scope.editRowItem -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'viewOrEditAcctPaymentOrNegAdjustmentModal');
    });
    it('should get document access authorizations when ObjectType is Document', function () {
      scope.editRowItem({ ObjectType: 'Document' });
      expect(mockPatientDocumentsFactory.GetDocumentAccess).toHaveBeenCalled();
    });
    it('should open document properties modal when user is authorized to edit documents', function () {
      mockPatientDocumentsFactory.GetDocumentAccess = jasmine
        .createSpy('PatientDocumentsFactory.GetDocumentAccess')
        .and.returnValue({ hasDocumentsEditAccess: true });
      scope.editRowItem({
        ObjectType: 'Document',
        ObjectIdLong: 123,
        PatientName: 'Fred Flintstone',
      });
      expect(mockDocCtrlsWindow.content).toHaveBeenCalled();
      expect(mockDocCtrlsWindow.content.calls.argsFor(0)[0]).toContain(
        'document-id="123" formatted-patient-name="Fred Flintstone"'
      );
      expect(mockDocCtrlsWindow.setOptions).toHaveBeenCalledWith(
        jasmine.objectContaining({ title: 'View Document Properties' })
      );
      expect(mockDocCtrlsWindow.open).toHaveBeenCalled();
    });
    it('should call accountServiceTransactionFactory.viewOrEditServiceTransaction when type is service transaction', function () {
      scope.editRowItem({
        TransactionTypeId: 1,
        EncounterId: 1,
        ObjectId: 2,
        LocationId: 3,
        PersonId: 4,
      });
      expect(
        mockAccountServiceTransactionFactory.viewOrEditServiceTransaction
      ).toHaveBeenCalledWith(
        1,
        2,
        3,
        4,
        true,
        scope.refreshTransactionHistoryPageData,
        undefined
      );
    });
    it('should do nothing when not a document or service', function () {
      scope.editRowItem({});
      expect(mockDocCtrlsWindow.open).not.toHaveBeenCalled();
      expect(
        mockAccountServiceTransactionFactory.viewOrEditServiceTransaction
      ).not.toHaveBeenCalled();
    });
    it('should NOT call bulkInsuranceEditModal when TransactionTypeId != 3', function () {
      var transaction = {
        ObjectId: 1,
        TransactionTypeId: 2,
        $$bulkCreditTransactionCount: 2,
        $$bulkCreditTransactionAllLocationAccess: true,
      };
      spyOn(ctrl, 'bulkInsuranceEditModal');
      scope.editRowItem(transaction);

      expect(
        mockPatientServices.CreditTransactions
          .getTransactionHistoryPaymentInformation
      ).not.toHaveBeenCalled();
      expect(ctrl.bulkInsuranceEditModal).not.toHaveBeenCalled();
    });
    it('should call bulkInsuranceEditModal when TransactionTypeId is 3', function () {
      var transaction = {
        ObjectId: 1,
        TransactionTypeId: 3,
        $$bulkCreditTransactionCount: 2,
        $$bulkCreditTransactionAllLocationAccess: true,
      };
      spyOn(ctrl, 'bulkInsuranceEditModal');
      scope.editRowItem(transaction);

      expect(
        mockPatientServices.CreditTransactions
          .getTransactionHistoryPaymentInformation
      ).toHaveBeenCalled();
    });
    it('should call ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal  when TransactionTypeId is 2', function () {
      var transaction = { ObjectId: 1, TransactionTypeId: 2 };
      scope.editRowItem(transaction, true);

      expect(ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal).toHaveBeenCalled();
    });
    it('should call ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal when TransactionTypeId is 4', function () {
      var transaction = { ObjectId: 1, TransactionTypeId: 4 };
      scope.editRowItem(transaction, true);

      expect(ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal).toHaveBeenCalled();
    });
    it('should call accountDebitTransactionFactory.viewOrEditDebit when TransactionTypeId is 5 (positive adjustment)', function () {
      scope.editRowItem({
        TransactionTypeId: 5,
        EncounterId: 1,
        ObjectId: 2,
        LocationId: 3,
        PersonId: 4,
      });
      expect(
        mockAccountDebitTransactionFactory.viewOrEditDebit
      ).toHaveBeenCalledWith(
        2,
        4,
        true,
        scope.refreshTransactionHistoryPageData
      );
    });
    it('should NOT call ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal when TransactionTypeId is 1', function () {
      // Service tansaction
      var transaction = { ObjectId: 1, TransactionTypeId: 1 };
      scope.editRowItem(transaction, true);

      expect(
        ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal
      ).not.toHaveBeenCalled();
    });
    it('should NOT call ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal when TransactionTypeId is 3', function () {
      // Insurance payment
      transaction = { ObjectId: 1, TransactionTypeId: 3 };
      scope.editRowItem(transaction);
      expect(
        ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal
      ).not.toHaveBeenCalled();
    });
    it('should NOT call ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal when TransactionTypeId is not valid', function () {
      // Random credit transaction
      transaction = { ObjectId: 1, TransactionTypeId: 15 };
      scope.editRowItem(transaction);
      expect(
        ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal
      ).not.toHaveBeenCalled();
    });
  });

  describe('scope.viewRowItem -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'viewOrEditAcctPaymentOrNegAdjustmentModal');
      detail = {
        LocationId: 1,
        Date: '03-29-2019',
        AccountMemberId: 99,
        ObjectType: 'CreditTransaction',
        $$patientInfo: {
          PersonAccount: {
            AccountId: '234234-23432-23423-234',
          },
        },
      };
    });
    it('should call accountServiceTransactionFactory.viewOrEditServiceTransaction if a ServiceTransaction', function () {
      scope.viewRowItem({
        TransactionTypeId: 1,
        EncounterId: 1,
        ObjectId: 2,
        LocationId: 3,
        PersonId: 4,
      });
      expect(
        mockAccountServiceTransactionFactory.viewOrEditServiceTransaction
      ).toHaveBeenCalledWith(
        1,
        2,
        3,
        4,
        false,
        scope.refreshTransactionHistoryPageData
      );
    });
    it('should call accountDebitTransactionFactory.viewOrEditDebit when TransactionTypeId is 5 (DebitTransaction)', function () {
      scope.viewRowItem({ TransactionTypeId: 5, ObjectId: 2, PersonId: 4 });
      expect(
        mockAccountDebitTransactionFactory.viewOrEditDebit
      ).toHaveBeenCalledWith(
        2,
        4,
        false,
        scope.refreshTransactionHistoryPageData
      );
    });
    it('should call accountDebitTransactionFactory.viewOrEditDebit when TransactionTypeId is 6 (FinanceCharge)', function () {
      scope.viewRowItem({ TransactionTypeId: 6, ObjectId: 2, PersonId: 4 });
      expect(
        mockAccountDebitTransactionFactory.viewOrEditDebit
      ).toHaveBeenCalledWith(
        2,
        4,
        false,
        scope.refreshTransactionHistoryPageData
      );
    });
    it('should do nothing when not a credit or service', function () {
      scope.viewRowItem({});
      expect(
        mockAccountServiceTransactionFactory.viewOrEditServiceTransaction
      ).not.toHaveBeenCalled();
    });

    it('should call mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal (TransactionTypeId 2)', function () {
      // Account Payment
      detail.TransactionTypeId = 2;
      scope.viewRowItem(detail, false);

      expect(detail.$$route).not.toBeDefined();
      expect(ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal).toHaveBeenCalled();
    });
    it('should call mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal (TransactionTypeId 3)', function () {
      // Insurance Payment
      detail.TransactionTypeId = 3;
      scope.viewRowItem(detail, false);

      expect(detail.$$route).toBeDefined();
      expect(ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal).toHaveBeenCalled();
    });
    it('should call mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal (TransactionTypeId 4)', function () {
      // Negative Adjustment
      detail.TransactionTypeId = 4;
      scope.viewRowItem(detail, false);

      expect(detail.$$route).not.toBeDefined();
      expect(ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal).toHaveBeenCalled();
    });
  });

  describe('soar:document-properties-edited -> ', function () {
    it('should close document properties window', function () {
      scope.$emit('soar:document-properties-edited', {});
      expect(mockDocCtrlsWindow.close).toHaveBeenCalled();
    });
    it('should refresh page data', function () {
      scope.$emit('soar:document-properties-edited', {});
      expect(
        mockAccountSummaryFactory.getTransactionHistory
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.exportScreenAfterGettingAllHistory when browser does not support msSaveOrOpenBlob -> ', function () {
    var csv, fileName;
    var transactionHistories = [];
    beforeEach(function () {
      spyOn(
        ctrl,
        'convertGridRowsToTransactionHistoryArray'
      ).and.callFake(() => {});
      scope.rows = [
        {
          Date: '2019-03-29T15:45:18.381',
          PatientName: 'Fred',
          ProviderUserName: 'Barney',
          LocationName: 'Bedrock',
          Type: 'Account Payment',
          Tooth: '12',
          Area: 'UA',
          Amount: -35.97,
          IsSplitPayment: true,
          Balance: 86.23,
          Allowedamount: 0.0,
          TotalAdjEstimate: 0.0,
        },
      ];
      transactionHistories = [];
      scope.filterBarProperties = {};
      csv =
        'Date,Patient,Provider,Location,Type,Description,Tooth,Area,Est. Ins.,Amount,Deposited,Split,Allowed Amount,Ins Adj,Balance\r\n03/29/2019,"Fred","Barney","Bedrock",Account Payment,"undefined",,,,"-$35.97",,Yes,"$0.00","$0.00","$86.23"\r\n';
      fileName =
        'Transaction History ' + moment().tz('America/Chicago').format('YYYY-MM-DD') + '.csv';

      mockTransactionHistoryExportService.convertTransactionHistoryArrayToCsv = jasmine
        .createSpy('convertTransactionHistoryArrayToCsv')
        .and.returnValue(csv);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
      var mockElement = {
        setAttribute: jasmine.createSpy('element.setAttribute'),
        style: { display: '' },
        click: jasmine.createSpy('element.click'),
      };
      spyOn(document, 'createElement').and.returnValue(mockElement);
    });

    it('should pass active location timezone identifier to export service', function () {
      ctrl.location.Timezone = 'Pacific Standard Time';
      ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      scope.$apply();
      expect(
        mockTransactionHistoryExportService.convertTransactionHistoryArrayToCsv.calls.argsFor(
          0
        )[1]
      ).toBe('America/Los_Angeles');
    });

    it('should pass false for hideRunningBalance to export service when sortingApplied and hideRunningBalance are false', function () {
      ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      scope.$apply();
      expect(
        mockTransactionHistoryExportService.convertTransactionHistoryArrayToCsv.calls.argsFor(
          0
        )[2]
      ).toBe(false);
    });

    it('should pass true for hideRunningBalance to export service when sortingApplied is true', function () {
      scope.sortingApplied = true;
      ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      scope.$apply();
      expect(
        mockTransactionHistoryExportService.convertTransactionHistoryArrayToCsv.calls.argsFor(
          0
        )[2]
      ).toBe(true);
    });

    it('should pass true for hideRunningBalance to export service when hideRunningBalance is true', function () {
      scope.filterBarProperties.hideRunningBalance = true;
      ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      scope.$apply();
      expect(
        mockTransactionHistoryExportService.convertTransactionHistoryArrayToCsv.calls.argsFor(
          0
        )[2]
      ).toBe(true);
    });

    it('should call convertGridRowsToTransactionHistoryArray with transactionHistories', function () {
      scope.filterBarProperties.hideRunningBalance = true;
      ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      scope.$apply();
      expect(
        mockTransactionHistoryExportService.convertTransactionHistoryArrayToCsv.calls.argsFor(
          0
        )[2]
      ).toBe(true);
    });
  });

  describe('ctrl.exportScreenAfterGettingAllHistory when browser supports msSaveOrOpenBlob -> ', function () {
    var csv, fileName;
    var mockMsSaveOrOpenBlob, blob;
    var transactionHistories = [];
    beforeEach(function () {
      spyOn(
        ctrl,
        'convertGridRowsToTransactionHistoryArray'
      ).and.callFake(() => {});
      scope.rows = [
        {
          Date: '2019-03-29T15:45:18.381',
          PatientName: 'Fred',
          ProviderUserName: 'Barney',
          LocationName: 'Bedrock',
          Type: 'Account Payment',
          Tooth: '12',
          Area: 'UA',
          Amount: -35.97,
          IsSplitPayment: true,
          Balance: 86.23,
          Allowedamount: 0.0,
          TotalAdjEstimate: 0.0,
        },
      ];
      transactionHistories = [];
      scope.filterBarProperties = {};
      csv =
        'Date,Patient,Provider,Location,Type,Description,Tooth,Area,Est. Ins.,Amount,Deposited,Split,Allowed Amount,Ins Adj,Balance\r\n03/29/2019,"Fred","Barney","Bedrock",Account Payment,"undefined",,,,"-$35.97",,Yes,"$0.00","$0.00","$86.23"\r\n';
      fileName =
        'Transaction History ' + moment().tz('America/Chicago').format('YYYY-MM-DD') + '.csv';

      mockTransactionHistoryExportService.convertTransactionHistoryArrayToCsv = jasmine
        .createSpy('convertTransactionHistoryArrayToCsv')
        .and.returnValue(csv);
      mockWindow.navigator.msSaveOrOpenBlob = function () {};
      mockMsSaveOrOpenBlob = spyOn(mockWindow.navigator, 'msSaveOrOpenBlob');
      blob = new Blob([csv]);
    });

    it('should download csv via msSaveOrOpenBlob when browser supports msSaveOrOpenBlob', function () {
      ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      scope.$apply();
      expect(mockWindow.navigator.msSaveOrOpenBlob).toBeTruthy();
      expect(mockMsSaveOrOpenBlob).toHaveBeenCalled();
      expect(mockMsSaveOrOpenBlob.calls.argsFor(0)[0]).toEqual(
        jasmine.objectContaining({
          type: 'text/csv;charset=utf-8;',
          size: blob.size,
        })
      );
      expect(mockMsSaveOrOpenBlob.calls.argsFor(0)[1]).toEqual(fileName);
    });

    it('should match not file name when timezone differs and browser supports msSaveOrOpenBlob', function () {
      let timezoneFile = 'Transaction History ' + moment().tz('Asia/Tokyo').add(1, 'days').format('YYYY-MM-DD') + '.csv';
      ctrl.exportScreenAfterGettingAllHistory(transactionHistories);
      scope.$apply();

       expect(mockWindow.navigator.msSaveOrOpenBlob).toBeTruthy();
       expect(mockMsSaveOrOpenBlob).toHaveBeenCalled();

       expect(mockMsSaveOrOpenBlob.calls.argsFor(0)[1]).toEqual(fileName);
       expect(mockMsSaveOrOpenBlob.calls.argsFor(0)[1]).not.toEqual(timezoneFile);
     });
   });

   describe('ctrl.deleteInsurancePayment -> ', function () {
     beforeEach(function () {
       detail = {
         Claims: [{ ClaimId: 999 }],
         IsAuthorized: true,
         ObjectId: 1,
         PaymentTypeId: 1,
         TransactionTypeId: 2,
         LocationId: 1,
         Date: '03-29-2019',
         AccountMemberId: 99,
         $$patientInfo: {
           PersonAccount: {
             AccountId: '234234-23432-23423-234',
           },
         },
       };
     });

     it('should call AccountSummaryFactory.deleteInsurancePayment', function () {
       ctrl.insurancePaymentTypes = [{ PaymentTypeId: 1, CurrencyTypeId: 3 }];
       ctrl.deleteInsurancePayment(detail);
       expect(
         mockAccountSummaryFactory.deleteInsurancePayment
       ).toHaveBeenCalled();
     });
   });

   describe('scope.viewCompleteEncounter --> ', function () {
     it('should open account summary in new tab when TransactionTypeId = 1 (service)', function () {
       scope.viewCompleteEncounter({
         PersonId: 23,
         ObjectId: 15,
         EncounterId: 25,
         TransactionTypeId: 1,
       });
       expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
         _.escape(
           '#/Patient/23/Summary?tab=Account Summary&open=new&encounterId=25'
         )
       );
     });
     it('should open account summary in new tab when TransactionTypeId = 5 (positive adjustment)', function () {
       scope.viewCompleteEncounter({
         PersonId: 23,
         ObjectId: 15,
         TransactionTypeId: 5,
       });
       expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
         _.escape(
           '#/Patient/23/Summary?tab=Account Summary&open=new&encounterId=15'
         )
       );
     });
     it('should open account summary in new tab when TransactionTypeId = 6 (finance charge)', function () {
       scope.viewCompleteEncounter({
         PersonId: 23,
         ObjectId: 15,
         TransactionTypeId: 6,
       });
       expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
         _.escape(
           '#/Patient/23/Summary?tab=Account Summary&open=new&encounterId=15'
         )
       );
     });
     it('should not open account summary when TransactionTypeId is not 1 or 5 or 6', function () {
       var x;
       for (x = 1; x < 10; x++) {
         if (x !== 1 && x !== 5 && x !== 6 && x !== 4 && x !== 2) {
           scope.viewCompleteEncounter({
             PersonId: 23,
             ObjectId: 15,
             TransactionTypeId: x,
           });
           expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
         }
       }
     });
     it('should not open account summary when rowItem is undefined', function () {
       var rowItem;
       scope.viewCompleteEncounter(rowItem);
       expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
     });
     it('should not open account summary when PersonId is undefined', function () {
       scope.viewCompleteEncounter({ ObjectId: 15, TransactionTypeId: 5 });
       expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
     });
     it('should not open account summary when ObjectId is undefined', function () {
       scope.viewCompleteEncounter({ PersonId: 23, TransactionTypeId: 5 });
       expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
     });
     it('should not open account summary when TransactionTypeId is undefined', function () {
       scope.viewCompleteEncounter({ PersonId: 23, ObjectId: 15 });
       expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
     });
   });

   describe('scope.viewEra -> ', function () {
     it('should call credit transaction factory viewEob function', function () {
       var row = {
         EraTransactionSetHeaderId: 4,
         ObjectIdLong: 7,
         PersonId: null,
         Claims: [{ ClaimId: 300, PatientId: 100 }],
       };
       scope.viewEra(row);
       expect(mockAccountCreditTransactionFactory.viewEob).toHaveBeenCalledWith(
         4,
         300,
         100
       );
     });
     it('should not call credit transaction factory viewEob function if row is undefined', function () {
       scope.viewEra(undefined);
       expect(
         mockAccountCreditTransactionFactory.viewEob
       ).not.toHaveBeenCalled();
     });
     it('should not call credit transaction factory viewEob function if row is null', function () {
       scope.viewEra(null);
       expect(
         mockAccountCreditTransactionFactory.viewEob
       ).not.toHaveBeenCalled();
     });
     it('should not call credit transaction factory viewEob function if row claims list is empty', function () {
       var row = {
         EraTransactionSetHeaderId: 4,
         ObjectIdLong: 7,
         PersonId: null,
         Claims: [],
       };
       scope.viewEra(row);
       expect(
         mockAccountCreditTransactionFactory.viewEob
       ).not.toHaveBeenCalled();
     });
   });

   describe('scope.printReceipt ->', function () {
     it('should call credit transaction factory printReceipt function', function () {
       ctrl.locations = [{ LocationId: 1, Name: 'LocationA' }];
       var transaction = {
         ObjectId: 30,
         IsLocationPaymentGatewayEnabled: true,
         Balance: 20,
         Amount: 50,
         Description: 'test',
         Date: '02/28/19',
         PatientName: 'Styles, Harry',
         LocationId: 1,
       };
       scope.patient.Data = {
         ResponsiblePersonId: 1,
         PatientId: 2,
         PersonAccount: { AccountId: 10 },
       };
       var transactionToPrint = {
         ObjectId: 30,
         CreditTransactionId: 30,
         Location: { LocationId: 1, Name: 'LocationA' },
         IsLocationPaymentGatewayEnabled: false,
         Balance: 20,
         Amount: 50,
         TransactionType: 'Account Payment',
         Description: 'test',
         Date: '02/28/19',
         DateEntered: '02/28/19',
         PatientName: 'Styles, Harry',
         LocationId: 1,
       };
       scope.printReceipt(transaction);
       scope.$apply();
       expect(
         mockAccountCreditTransactionFactory.printReceipt
       ).toHaveBeenCalledWith(transactionToPrint, scope.patient.Data);
     });
   });

   describe('ctrl.getTabNameFromParam -> ', function () {
     it('should set the tab name to empty', function () {
       var tabName = ctrl.getTabNameFromParam();

       expect(tabName).toBe('');
     });
   });

   describe('ctrl.editInsurancePayment -> ', function () {
     //editServiceTransaction
     it('should call tabLauncher when TransactionTypeId 3 and payment is part of bulk', function () {
       var transaction = {
         TransactionTypeId: 3,
         $$bulkCreditTransactionCount: 2,
         $$bulkCreditTransactionAllLocationAccess: true,
       };
       ctrl.editInsurancePayment(transaction);

       expect(tabLauncher.launchNewTab).toHaveBeenCalled();
     });
     it('should call tabLauncher when payment is NOT part of bulk', function () {
       var transaction = {
         TransactionTypeId: 3,
         $$bulkCreditTransactionCount: 1,
         $$bulkCreditTransactionAllLocationAccess: true,
       };
       ctrl.editInsurancePayment(transaction);

       expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
     });
     it('should call tabLauncher when TransactionTypeId is NOT 3', function () {
       var transaction = {
         TransactionTypeId: 2,
         $$bulkCreditTransactionCount: 1,
         $$bulkCreditTransactionAllLocationAccess: true,
       };
       ctrl.editInsurancePayment(transaction);

       expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
     });
   });

   describe('ctrl.bulkInsuranceEditModal -> ', function () {
     //editServiceTransaction
     it('should call bulkInsuranceEditModal when TransactionTypeId 3 and payment is part of bulk', function () {
       var transaction = {
         TransactionTypeId: 3,
         $$bulkCreditTransactionCount: 2,
         $$bulkCreditTransactionAllLocationAccess: true,
       };
       ctrl.bulkInsuranceEditModal(transaction);

       expect(mockModalFactory.ConfirmModal).toHaveBeenCalled();
     });
   });

   describe('$scope.deleteAcctPaymentOrNegAdjustmentModal -> ', function () {
     beforeEach(function () {
       scope.patient.Data.PersonAccount.AccountId = 1;
       ctrl.location.IsPaymentGatewayEnabled = 5;
     });
     it('should throw error when not authorized', function () {
       spyOn(ctrl, 'notifyNotAuthorized');
       var ct = { TransactionTypeId: 2 };
       mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
         .createSpy('')
         .and.returnValue(false);
       scope.deleteAcctPaymentOrNegAdjustmentModal(ct);
       scope.$apply();
       expect(ct.$$accountId).toBe(undefined);
       expect(ct.$$ispaymentGatewayEnabled).toBe(undefined);
       expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
       expect(
         mockAccountSummaryFactory.deleteAcctPaymentOrNegAdjustment
       ).not.toHaveBeenCalled();
     });
     it('should throw error when not authorized', function () {
       spyOn(ctrl, 'notifyNotAuthorized');
       var ct = { TransactionTypeId: 4 };
       mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
         .createSpy('')
         .and.returnValue(false);
       scope.deleteAcctPaymentOrNegAdjustmentModal(ct);
       scope.$apply();
       expect(ct.$$accountId).toBe(undefined);
       expect(ct.$$ispaymentGatewayEnabled).toBe(undefined);
       expect(ctrl.notifyNotAuthorized).toHaveBeenCalled();
       expect(
         mockAccountSummaryFactory.deleteAcctPaymentOrNegAdjustment
       ).not.toHaveBeenCalled();
     });
     it('should not throw error when authorized & TransactionTypeId 2', function () {
       spyOn(ctrl, 'notifyNotAuthorized');
       var ct = { TransactionTypeId: 2 };
       mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
         .createSpy('')
         .and.returnValue(true);
       scope.deleteAcctPaymentOrNegAdjustmentModal(ct);
       scope.$apply();
       expect(ct.$$accountId).toBe(1);
       expect(ct.$$ispaymentGatewayEnabled).toBe(5);
       expect(ctrl.notifyNotAuthorized).not.toHaveBeenCalled();
       expect(
         mockAccountSummaryFactory.deleteAcctPaymentOrNegAdjustment
       ).toHaveBeenCalled();
     });
     it('should not throw error when authorized & TransactionTypeId 4', function () {
       spyOn(ctrl, 'notifyNotAuthorized');
       var ct = { TransactionTypeId: 4 };
       mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
         .createSpy('')
         .and.returnValue(true);
       scope.deleteAcctPaymentOrNegAdjustmentModal(ct);
       scope.$apply();
       expect(ct.$$accountId).toBe(1);
       expect(ct.$$ispaymentGatewayEnabled).toBe(5);
       expect(ctrl.notifyNotAuthorized).not.toHaveBeenCalled();
       expect(
         mockAccountSummaryFactory.deleteAcctPaymentOrNegAdjustment
       ).toHaveBeenCalled();
     });
   });

   describe('ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal -> ', function () {
     beforeEach(function () {
       detail = {
         TransactionTypeId: 2,
         ObjectId: 1,
         LocationId: 1,
         Date: '03-29-2019',
         ObjectType: 'CreditTransaction',
         AccountMemberId: 99,
         PaymentTypeId: 1,
         $$patientInfo: {
           PersonAccount: {
             AccountId: '234234-23432-23423-234',
           },
         },
       };
       ctrl.allAccountPaymentTypes = [
         { PaymentTypeId: 1, Name: 'ActAcc', IsActive: true },
         { PaymentTypeId: 3, Name: 'InActAcc2', IsActive: false },
         { PaymentTypeId: 2, Name: 'ActAcc3', IsActive: true },
         { PaymentTypeId: 4, Name: 'InActAcc4', IsActive: false },
       ];
     });
     it('should call the accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal function with editMode true', function () {
       //Edit mode
       ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal(detail, true);

       expect(detail.$$editMode).toBe(true);
       expect(
         mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal
       ).toHaveBeenCalled();
     });
     it('should call the accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal function with editMode false', function () {
       //View only
       ctrl.viewOrEditAcctPaymentOrNegAdjustmentModal(detail, false);

       expect(
         mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal
       ).toHaveBeenCalled();
       expect(detail.$$editMode).toBe(false);
     });
   });

   describe('scope.changePaymentOrAdjustment -> ', function () {
     beforeEach(function () {
       detail = {
         TransactionTypeId: 2,
         ObjectId: 1,
         LocationId: 1,
         Date: '03-29-2019',
         ObjectType: 'CreditTransaction',
         AccountMemberId: 99,
         $$patientInfo: {
           PersonAccount: {
             AccountId: '234234-23432-23423-234',
           },
         },
       };
       scope.alreadyApplyingAdjustment = false;
       scope.patient.Data.PersonAccount.AccountId = '234234-23432-23423-234';
     });
     it('should throw error when not authorized', function () {
       spyOn(ctrl, 'checkPermissions').and.returnValue(false);
       scope.changePaymentOrAdjustment(detail);

       expect(mockToastrFactory.error).toHaveBeenCalled();
       expect(
         mockAccountCreditTransactionFactory.getCreditTransaction
       ).not.toHaveBeenCalled();
     });
     it('should call the mockAccountCreditTransactionFactory.getFullCreditTransaction function with CreditTransactionId and AccountId when authorized', function () {
       spyOn(ctrl, 'checkPermissions').and.returnValue(true);
       scope.changePaymentOrAdjustment(detail);

       expect(
         mockAccountCreditTransactionFactory.getCreditTransaction
       ).toHaveBeenCalled();
     });
   });

   describe('ctrl.openModal -> ', function () {
     beforeEach(function () {
       detail = {
         TransactionTypeId: 2,
         ObjectId: 1,
         LocationId: 1,
         CreditTransactionDetails: {
           CreditTransactionDetailId: 1,
           EncounterId: 10,
           AppliedToDetbitTransactionId: 99,
         },
         Date: '03-29-2019',
         ObjectType: 'CreditTransaction',
         AccountMemberId: 99,
         $$patientInfo: {
           PersonAccount: {
             AccountId: '234234-23432-23423-234',
           },
         },
         providersList: {
           Value: {},
         },
       };
     });
     it('should call the mockAccountCreditTransactionFactory.getFullCreditTransaction function with CreditTransactionId and AccountId when authorized', function () {
       spyOn(scope, 'refreshTransactionHistoryPageData');
       ctrl.openModal(detail);

       expect(mockModalFactory.TransactionModal).toHaveBeenCalled();
       expect(ctrl.dataForModal).toBe(detail);
       expect(ctrl.dataForModal.AllProviders).toBe(detail.providersList.Value);
     });
   });

   describe('scope.sortColumn -> ', function () {
     beforeEach(function () {
       scope.showCreateClaimView = false;
       scope.isCreateCustomInvoice = false;
     });
     it('should set the sortObject with the correct field and order when default', function () {
       // Filter default (Date: desc)
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       scope.sortObject['Date'] = 1;
       scope.sortColumn('Date');

       expect(scope.sortObject['Date']).not.toBe(undefined);
       expect(scope.sortObject['Date']).toBe(2);
       expect(scope.sortingApplied).toBe(false);
       expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
     });
     // Filter changing to unsorted column (Date -> Patient)
     it('should set the sortObject with the correct field and order when new column is sorted', function () {
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       scope.sortColumn('Patient');

       expect(scope.sortObject['Patient']).not.toBe(undefined);
       expect(scope.sortObject['Date']).toBe(undefined);
       expect(scope.sortObject['Patient']).toBe(1);
       expect(scope.keepCreateClaimViewOpen).toBe(false);
       expect(scope.sortingApplied).toBe(true);
       expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
     });

     it('should set the sortObject with the correct field and order when column is resorted', function () {
       // Filter changing to already sorted column (Location: asc -> Location: desc)
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       scope.sortObject['Location'] = 1;
       scope.sortColumn('Location');

       expect(scope.sortObject['Location']).not.toBe(undefined);
       expect(scope.sortObject['Patient']).toBe(undefined);
       expect(scope.sortObject['Location']).toBe(2);
       expect(scope.sortingApplied).toBe(true);
       expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
     });

     it('should NOT sort if in CreateClaim view', function () {
       // Filter changing to already sorted column (Location: asc -> Location: desc)
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       scope.showCreateClaimView = true;
       scope.sortObject['Location'] = 1;
       scope.sortColumn('Location');

       expect(scope.sortObject['Location']).not.toBe(undefined);
       expect(scope.sortObject['Patient']).toBe(undefined);
       expect(scope.sortObject['Location']).toBe(1);
       expect(scope.keepCreateClaimViewOpen).toBe(false);
       expect(scope.sortingApplied).toBe(false);
       expect(scope.refreshSummaryPageDataForGrid).not.toHaveBeenCalled();
     });

     it('should NOT sort if in CreateCustomInvoice view', function () {
       // Filter changing to already sorted column (Location: asc -> Location: desc)
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       scope.isCreateCustomInvoice = true;
       scope.sortObject['Location'] = 1;
       scope.sortColumn('Location');

       expect(scope.sortObject['Location']).not.toBe(undefined);
       expect(scope.sortObject['Patient']).toBe(undefined);
       expect(scope.sortObject['Location']).toBe(1);
       expect(scope.keepCreateClaimViewOpen).toBe(false);
       expect(scope.sortingApplied).toBe(false);
       expect(scope.refreshSummaryPageDataForGrid).not.toHaveBeenCalled();
     });
   });

   describe('scope.resetSorting -> ', function () {
     it('should reset the sortObject to the default date desc when reset is clicked', function () {
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       scope.showCreateClaimView = true;
       scope.sortObject['Patient'] = 1;
       scope.resetSorting();

       expect(scope.sortObject['Patient']).toBe(undefined);
       expect(scope.sortObject['Date']).not.toBe(undefined);
       expect(scope.sortObject['Date']).toBe(2);
       expect(scope.keepCreateClaimViewOpen).toBe(false);
       expect(scope.sortingApplied).toBe(false);
       expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
     });
   });

   describe('ctrl.fixHeader -> ', function () {
     // window.pageYOffset greater than 580
     it('should add the fixedHeader class to the header row', function () {
       var element = document.createElement('div');
       element.setAttribute('class', 'history-header');
       element.setAttribute('id', 'gridHeader');
       document.body.appendChild(element);
       window.pageYOffset = 581;
       ctrl.fixHeader();

       expect(element.getAttribute('class')).toContain('fixedgridHeader');
     });

     // window.pageYOffset less than 580;
     it('should NOT add the fixedHeader class to the header row', function () {
       var element = document.createElement('div');
       element.setAttribute('class', 'history-header');
       element.setAttribute('id', 'gridHeader');
       document.body.appendChild(element);
       window.pageYOffset = 579;
       ctrl.fixHeader();

       expect(element.getAttribute('class')).not.toContain('fixedgridHeader');
     });
   });

   describe('ctrl.calculateEstimatatedInsuranceOption -> ', function () {
     var row = {};
     var plan = {
       PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
     };
     beforeEach(function () {
       plan = plan = plan = {
         PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
       };
       row = {
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
     it('should call mockCloseClaimOptionsService.allowEstimateOption', function () {
       ctrl.calculateEstimatatedInsuranceOption(plan, row);
       expect(
         mockCloseClaimOptionsService.allowEstimateOption
       ).toHaveBeenCalled();
     });
   });

   describe('ctrl.lazyLoad function -> ', function () {
     it('should call the scope.refreshSummaryPageDataForGrid function when the window is scrolled to the bottom', function () {
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       spyOn(ctrl, 'isPageScrolledToBottom').and.returnValue(true);
       scope.pagingInProgress = false;
       ctrl.lazyLoad();

       expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
       expect(ctrl.currentPage).toBe(2);
     });

     it('should call the scope.refreshSummaryPageDataForGrid function when the window is NOT scrolled to the bottom', function () {
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       spyOn(ctrl, 'isPageScrolledToBottom').and.returnValue(false);
       scope.pagingInProgress = false;
       ctrl.lazyLoad();

       expect(scope.refreshSummaryPageDataForGrid).not.toHaveBeenCalled();
       expect(ctrl.currentPage).toBe(1);
     });

     it('should call the scope.refreshSummaryPageDataForGrid function when the window is scrolled to the bottom but paging is in process', function () {
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       spyOn(ctrl, 'isPageScrolledToBottom').and.returnValue(false);
       scope.pagingInProgress = true;
       ctrl.lazyLoad();

       expect(scope.refreshSummaryPageDataForGrid).not.toHaveBeenCalled();
       expect(ctrl.currentPage).toBe(1);
     });

     it('should NOT load more results when page is not scrolled to bottom', function () {
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       spyOn(ctrl, 'isPageScrolledToBottom').and.returnValue(false);
       scope.pagingInProgress = false;
       ctrl.lazyLoad();

       expect(ctrl.currentPage).toBe(1);
       expect(scope.refreshSummaryPageDataForGrid).not.toHaveBeenCalled();
     });

    // it('should NOT load more results when paging is already in process', function () {
    // 	spyOn(scope, 'refreshSummaryPageDataForGrid');
    // 	scope.pagingInProgress = true;
    // 	ctrl.lazyLoad();

    // 	expect(ctrl.currentPage).toBe(1);
    // 	expect(scope.refreshSummaryPageDataForGrid).not.toHaveBeenCalled();
    // });

    // it('should load more results when paging is NOT already in process', function () {
    // 	spyOn(scope, 'refreshSummaryPageDataForGrid');
    // 	scope.pagingInProgress = false;
    // 	ctrl.lazyLoad();

    // 	expect(ctrl.currentPage).toBe(2);
    // 	expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    // });
   });

   describe('scope.showMoreResults function -> ', function () {
     it('should call the scope.showMoreResults function button is clicked', function () {
       spyOn(scope, 'refreshSummaryPageDataForGrid');
       scope.showMoreResults();

       expect(ctrl.currentPage).toBe(2);
       expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
     });
   });

   describe('scope.scrollToTop function -> ', function () {
     it('should return the scroll top to 0 on click', function () {
       window.document.body.style.height = '9000px';
       window.document.body.scrollTop = 1000;
       scope.scrollToTop();

       expect(window.document.body.scrollTop).toBe(0);
     });
   });

   describe('ctrl.removeBackToTop -> ', function () {
     // window.pageYOffset greater than 580
     it('should add the showBackToTop class to the header row', function () {
       var element = document.createElement('div');
       element.setAttribute('class', 'backToTop');
       document.body.appendChild(element);
       window.pageYOffset = 581;
       ctrl.removeBackToTop();

       expect(element.getAttribute('class')).toContain('showBackToTop');
     });

     // window.pageYOffset less than 580;
     it('should NOT add the showBackToTop class to the header row', function () {
       var element = document.createElement('div');
       element.setAttribute('class', 'backToTop');
       document.body.appendChild(element);
       window.pageYOffset = 579;
       ctrl.removeBackToTop();

       expect(element.getAttribute('class')).not.toContain('showBackToTop');
     });
   });

   describe('$scope.selectedCountChange -> ', function () {
     it('should add one to the selected count', function () {
       scope.rows[0].selected = true;
       scope.selectedCountChange();

       expect(scope.selectedCount).toBe(1);
     });

     it('should remain 0 if no rows are selected', function () {
       scope.selectedCountChange();

       expect(scope.selectedCount).toBe(0);
     });
   });

   describe('ctrl.printScreenAfterGettingAllHistory -> ', function () {
     beforeEach(function () {
       ctrl.providers = [{ UserId: 321, UserCode: 'ABC123' }];
       ctrl.location.Timezone = 'Central Standard Time';
       scope.patient = { id: 456, Data: { PatientCode: 'FliFr1' } };
       scope.accountMembersOptionsTemp = [
         {
           name: 'Fred Flintstone',
           isResponsiblePerson: true,
           id: 456,
           personId: 1,
           patientDetailedName: 'Frederick the Great',
         },
         {
           name: 'Wilma Flintstone',
           isResponsiblePerson: false,
           id: 654,
           personId: 2,
           patientDetailedName: 'Wilma the Magnificent',
         },
       ];
       scope.filterObject.members[0] = '0';
       scope.filterObject.dateRange = { start: null, end: null };
     });
     it('should set printedDate', function () {
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.printedDate).not.toBeNull();
     });
     it('should set currentUserCode', function () {
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.currentUserCode).toEqual('ABC123');
     });
     it('should set practiceName', function () {
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.practiceName).toEqual('Practice Makes Perfect');
     });
     it('should set responsiblePartyInfo', function () {
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.responsiblePartyInfo).toEqual('Fred Flintstone - FliFr1');
     });
     it('should set all filter properties to All when no filter applied', function () {
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterLocations).toEqual('All');
       expect(scope.FilterDateRange).toEqual(null);
       expect(scope.FilterTooth).toEqual('All');
       expect(scope.FilterTransactionTypes).toEqual('All');
       expect(scope.FilterProviders).toEqual('All');
       expect(scope.FilterStatus).toEqual('All');
       expect(scope.FilterAccountMembers).toEqual('All');
     });
     it('should set FilterLocations when locations filter applied', function () {
       scope.filterObject.locations = [1];
       ctrl.locations = [{ LocationId: 1, NameLine1: 'Great Location' }];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterLocations).toEqual('Great Location');
     });
     it('should set FilterAccountMembers when account member filter applied', function () {
       scope.filterObject.members = [1];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterAccountMembers).toEqual('Frederick the Great');
     });
     it('should set printingDateRangeFrom when start date filter applied', function () {
       scope.filterObject.dateRange = { start: '2019-08-10T10:00Z' };
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.printingDateRangeFrom).toEqual('08/10/2019');
     });
     it('should set printingDateRangeTo when end date filter applied', function () {
       scope.filterObject.dateRange = { end: '2019-08-10T10:00Z' };
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.printingDateRangeTo).toEqual('08/10/2019');
     });
     it('should set printingDateRangeFrom when start date filter is not applied', function () {
       scope.rows = [{ Date: '2019-03-29T15:45:18.381' }];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.printingDateRangeFrom).toEqual('03/29/2019');
     });
     it('should set printingDateRangeTo when end date filter is not applied', function () {
       scope.rows = [{ Date: '2019-03-29T15:45:18.381' }];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.printingDateRangeTo).toEqual('03/29/2019');
     });
     it('should set FilterDateRange when start and end date filters are applied', function () {
       scope.filterObject.dateRange = {
         start: '2019-08-08T10:00Z',
         end: '2019-08-10T10:00Z',
       };
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterDateRange).toEqual('From 08/08/2019 - To 08/10/2019');
     });
     it('should set FilterDateRange when start filter is applied', function () {
       scope.rows = [{ Date: '2019-03-29T15:45:18.381' }];
       scope.filterObject.dateRange = { start: '2018-08-08T10:00Z' };
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterDateRange).toEqual('From 08/08/2018 - To 03/29/2019');
     });
     it('should set FilterDateRange when end filter is applied', function () {
       scope.rows = [{ Date: '2019-03-29T10:00Z' }];
       scope.filterObject.dateRange = { end: '2019-08-08T10:00Z' };
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterDateRange).toEqual('From 03/29/2019 - To 08/08/2019');
     });
     it('should set FilterTooth when tooth filter is applied', function () {
       scope.filterObject.Teeth = [5, 3, 'UA', 2];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterTooth).toEqual('UA, 2, 3, 5');
     });
     it('should set FilterTransactionTypes when transaction types filter is applied', function () {
       scope.filterObject.transactionTypes = [4, 1];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterTransactionTypes).toEqual('Services, - Adjustments');
     });
     it('should set FilterProviders when providers filter is applied', function () {
       scope.filterObject.providers = [432];
       ctrl.providers = [{ UserId: 432, FirstName: 'Boss', LastName: 'Baby' }];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterProviders).toEqual('Boss Baby');
     });
     it('should set FilterDistributionTypes based on filterObject', function () {
       scope.filterObject = {
         transactionTypes: null,
         locations: null,
         members: '0',
         dateRange: { start: null, end: null },
         providers: null,
         IncludePaidTransactions: true,
         IncludeUnpaidTransactions: false,
         IncludeUnappliedTransactions: true,
         IncludeAppliedTransactions: false,
         Teeth: [],
       };
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterDistributionTypes).toEqual(
         'Paid Transactions, Unapplied Transactions'
       );
     });
     it('should set FilterDistributionTypes to All if all four types are set to true', function () {
       scope.filterObject = {
         transactionTypes: null,
         locations: null,
         members: '0',
         dateRange: { start: null, end: null },
         providers: null,
         IncludePaidTransactions: true,
         IncludeUnpaidTransactions: true,
         IncludeUnappliedTransactions: true,
         IncludeAppliedTransactions: true,
         Teeth: [],
       };
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterDistributionTypes).toEqual('All');
     });
     it('should set FilterStatus based on filterObject.Statuses', function () {
       scope.filterObject.Statuses = [1, 2];
       ctrl.printScreenAfterGettingAllHistory();
       scope.$apply();
       expect(scope.FilterStatus).toEqual('Active, Deleted');
     });
   });

   describe('scope.printFilter ->', function () {
     let requestArgs;
     beforeEach(function () {
       spyOn(ctrl, 'prepFilter').and.callFake(() => {});
       scope.patient = {
         Data: {
           PatientId: '123456',
           PersonAccount: { AccountId: '123456789' },
         },
       };
       scope.sortObject = { Date: 2 };
       scope.responsiblePartyInfo = '234567';
       scope.currentUserCode = 'USTV';

       ctrl.filterObject = {
         FromDate: null,
         ToDate: null,
         PersonIds: [100],
         TransactionTypes: null,
         LocationIds: null,
         ProviderIds: null,
         Teeth: null,
         IncludePaidTransactions: true,
         IncludeUnpaidTransactions: true,
         IncludeUnappliedTransactions: true,
         IncludeAppliedTransactions: true,
       };

       requestArgs = {
         AccountId: scope.patient.Data.PersonAccount.AccountId,
         FilterCriteria: ctrl.filterObject,
         SortCriteria: scope.sortObject,
         PageCount: 0,
         CurrentPage: 0,
       };
     });

     it('should call ctrl.prepFilter', function () {
       scope.exportFilter();
       expect(ctrl.prepFilter).toHaveBeenCalled();
     });

     it('should call transactionHistoryService.requestTransactionHistor with args', function () {
       scope.exportFilter();
       expect(
         mockTransactionHistoryService.requestTransactionHistory
       ).toHaveBeenCalledWith(requestArgs);
     });
   });

   describe('ctrl.exportFilter ->', function () {
     beforeEach(function () {
       spyOn(ctrl, 'prepFilter').and.callFake(() => {});
     });

     it('should call ctrl.prepFilter', function () {
       scope.exportFilter();
       expect(ctrl.prepFilter).toHaveBeenCalled();
     });
   });

   describe('ctrl.convertGridRowsToTransactionHistoryArray ->', function () {
     let transactionHistories = [];
     beforeEach(function () {
       transactionHistories = [
         {
           ObjectType: 'ServiceTransaction',
           TransactionTypeId: 1,
           Date: '2016-04-25T12:00:00Z',
           ObjectId: 33,
           ServiceManuallySelected: true,
         },
         {
           ObjectType: 'ServiceTransaction',
           TransactionTypeId: 1,
           Date: '2015-03-25T12:00:00Z',
           ObjectId: 34,
           ServiceManuallySelected: false,
         },
         {
           ObjectType: 'ServiceTransaction',
           TransactionTypeId: 1,
           Date: '2017-06-25T12:00:00Z',
           ObjectId: 35,
           ServiceManuallySelected: true,
         },
       ];
     });

     it('should return historyArray parsed from transactionHistories', function () {
       let historyArray = ctrl.convertGridRowsToTransactionHistoryArray(
         transactionHistories
       );
       expect(historyArray.length).toEqual(3);
     });
   });
 });
