describe('patient-summary-beta-Migration-controller->', function () {
  var scope,
    ctrl,
    rootScope,
    filter,
    mockLocation,
    mockLocalize,
    mockPatientServices,
    mockPatientAccountSummary,
    actualOptions,
    deferred;
  var mockToastrFactory,
    mockStaticData,
    mockListHelper,
    mockLocationServices,
    mockModalFactory,
    mockPaymentTypesService;
  var mockModalDataFactory,
    mockPatSecurityService,
    mockWindow,
    mockWindowResult,
    mockAccountSummaryFactory,
    mockAccountServiceTransactionFactory,
    mockAccountDebitTransactionFactory;
  var mockPatientInvoiceFactory,
    q,
    mockCommonServices,
    sce,
    mockDeleteInsurancePaymentFactory,
    mockReferenceDataService;
  var mockAccountSummaryDeleteFactory,
    mockClaimsService,
    timeout,
    mockUibModal,
    mockTimeZoneFactory,
    routeParams,
    patientSummaryFactory,
    mockAccountNoteFactory,
    mockAccountCreditTransactionFactory;
  var mockCloseClaimOptionsService;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(module('Soar.Schedule'));
  beforeEach(inject(function ($rootScope, $controller, $q, $timeout) {
    scope = $rootScope.$new();
    scope.$parent = $rootScope.$new();
    rootScope = $rootScope.$new();
    timeout = $timeout;
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
    scope.filterObject = {
      members: [100],
      dateRange: {
        start: null,
        end: null,
      },
      teethNumbers: [],
      transactionTypes: null,
      providers: null,
      locations: null,
      IncludePaidTransactions: true,
      IncludeUnpaidTransactions: true,
      IncludeUnappliedTransactions: true,
      IncludeAppliedTransactions: true,
    };
    scope.$parent.currentPatientId = 0;
    scope.accountMembersOptionsTemp = [{ accountMemberId: 99, personId: 100 }];
    sessionStorage.setItem('userLocation', JSON.stringify({ id: 3 }));

    mockLocation = {
      url: jasmine.createSpy('$location.url'),
      path: jasmine.createSpy('$location.path'),
      search: jasmine.createSpy('$location.search').and.returnValue({}),
    };

    routeParams = {
      patientId: 'q234q-3giqu-4qjk2-5lk12',
      accountId: '12313',
      encounterId: '122',
      route: 'Checkout',
      location: 1,
      overrideLocation: false,
    };

    mockLocalize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (text, params) {
          if (params) {
            for (var i = 0; i < params.length; i++) {
              text = text.replace('{' + i + '}', params[i]);
            }
          }
          return text;
        }),
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
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

    filter = jasmine.createSpy('filter').and.returnValue(function (date) {
      return date;
    });

    var mockMainReturn = {
      Value: {
        Rows: [
          { ObjectType: 'EncounterBo' },
          {
            ObjectType: 'CreditTransaction',
            UnassignedAmount: 30,
            ObjectId: 2,
          },
          {
            ObjectType: 'CreditTransaction',
            UnassignedAmount: 70,
            objectId: 3,
          },
          { ObjectType: 'DebitTransaction' },
          { ObjectType: 'PersonAccountNote' },
        ],
        UnappliedCreditTransactions: [
          {
            TransactionTypeId: 2,
            CreditTransactionId: 2,
            CreditTransactionDetails: [{ Amount: 10 }, { Amount: 20 }],
          },
          {
            TransactionTypeId: 4,
            CreditTransactionId: 3,
            CreditTransactionDetails: [{ Amount: 30 }, { Amount: 40 }],
          },
        ],
      },
    };

    var mockPendingReturn = [{ ObjectType: 'EncounterBo', PersonId: 100 }];
    mockAccountSummaryFactory = {
      getAccountSummaryMain: jasmine
        .createSpy('mockAccountSummaryFactory.getAccountSummaryMain')
        .and.returnValue($q.resolve(mockMainReturn)),
      getPendingEncounters: jasmine
        .createSpy('mockAccountSummaryFactory.getPendingEncounters')
        .and.returnValue($q.resolve(mockPendingReturn)),
      getEncounterDetails: jasmine
        .createSpy('mockAccountSummaryFactory.getEncounterDetails')
        .and.returnValue($q.resolve()),
      viewOrEditAcctPaymentOrNegAdjustmentModal: jasmine.createSpy(
        'mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal'
      ),
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

    mockAccountSummaryDeleteFactory = {
      deleteAccountSummaryRowDetail: jasmine
        .createSpy(
          'mockAccountSummaryDeleteFactory.deleteAccountSummaryRowDetail'
        )
        .and.returnValue({
          then: function () {},
        }),
    };
    mockReferenceDataService = {
      getData: jasmine
        .createSpy('mockReferenceDataService.getData')
        .and.returnValue(
          $q.resolve([{ LocationId: 3, Timezone: 'Central Standard Time' }])
        ),
      entityNames: {
        locations: 'locations',
      },
    };

    mockPaymentTypesService = {
      getAllPaymentTypesMinimal: jasmine.createSpy().and.callFake(function () {
        return { then: jasmine.createSpy() };
      })
    };

    var mockPlansReturn = {
      Value: [{ PlanId: 200 }],
    };
    mockPatientServices = {
      PatientBenefitPlan: {
        getPatientBenefitPlansByAccountId: jasmine
          .createSpy(
            'mockPatientServices.PatientBenefitPlan.getPatientBenefitPlansByAccountId'
          )
          .and.returnValue({
            $promise: {
              then: function (callback) {
                callback(mockPlansReturn);
              },
            },
          }),
      },
      Encounter: {
        getAllEncountersByEncounterId: jasmine
          .createSpy(
            'mockPatientServices.Encounter.getAllEncountersByEncounterId'
          )
          .and.returnValue({ $promise: {} }),
      },
      Patients: {
        get: jasmine
          .createSpy('mockPatientServices.Patients.get')
          .and.returnValue({ $promise: {} }),
      },
      Claim: {
        getClaimsByServiceTransaction: jasmine
          .createSpy(
            'mockPatientServices.Claim.getClaimsByServiceTransactionId'
          )
          .and.returnValue({ $promise: {} }),
        Create: jasmine.createSpy('mockPatientServices.Claim.Create'),
      },
      DebitTransaction: {
        getDebitTransactionById: jasmine
          .createSpy(
            'mockPatientServices.DebitTransaction.getDebitTransactionById'
          )
          .and.returnValue({ $promise: {} }),
      },
      CreditTransactions: {
        markAccountPaymentAsDeleted: jasmine.createSpy(
          'mockPatientServices.CreditTransactions.markAccountPaymentAsDeleted'
        ),
        markNegativeAdjustmentAsDeleted: jasmine.createSpy(
          'mockPatientServices.CreditTransactions.markNegativeAdjustmentAsDeleted'
        ),
        getCreditTransactionByIdForAccount: jasmine
          .createSpy(
            'mockPatientServices.CreditTransactions.getCreditTransactionByIdForAccount'
          )
          .and.returnValue({ $promise: {} }),
      },
      Account: {
        getAllAccountMembersByAccountId: jasmine
          .createSpy(
            'mockPatientServices.Account.getAllAccountMembersByAccountId'
          )
          .and.returnValue({ $promise: {} }),
      },
      AccountNote: {
        deleteAccountNote: jasmine.createSpy(
          'mockPatientServices.AccountNote.deleteAccountNote'
        ),
      },
    };
    mockWindowResult = {
      document: {
        write: jasmine.createSpy('window.open.document.write'),
        close: jasmine.createSpy('window.open.document.close'),
      },
    };
    mockWindow = {
      open: jasmine.createSpy('window.open').and.returnValue(mockWindowResult),
    };
    mockCommonServices = {
      Insurance: {
        ClaimPdf: jasmine
          .createSpy('mockCommonServices.Insurance.ClaimPdf')
          .and.returnValue({
            then: function (callback) {
              callback({ data: {} });
            },
          }),
      },
    };

    sce = {
      trustAsResourceUrl: jasmine.createSpy('sce.trustAsResourceUrl'),
    };

    mockModalFactory = {
      Modal: jasmine
        .createSpy('mockModalFactory.Modal')
        .and.callFake(function (options) {
          actualOptions = options;
          return {
            result: {
              then: function (callback) {
                callback();
              },
            },
          };
        }),
      ConfirmModal: jasmine
        .createSpy('mockModalFactory.ConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
      TransactionModal: jasmine.createSpy('mockModalFactory.TransactionModal'),
      LoadingModal: jasmine
        .createSpy('mockModalFactory.LoadingModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
      CreateClaimsModal: jasmine
        .createSpy('mockModalFactory.CreateClaimsModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
      PaymentVoidConfirmModal: jasmine
        .createSpy('mockModalFactory.PaymentVoidConfirmModal')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
    };

    mockDeleteInsurancePaymentFactory = {
      deleteInsurancePayment: jasmine
        .createSpy('mockDeleteInsurancePaymentFactory.deleteInsurancePayment')
        .and.returnValue({
          then: function () {},
        }),
    };

    mockModalDataFactory = {
      GetTransactionModalData: jasmine
        .createSpy('mockModalDataFactory.GetTransactionModalData')
        .and.returnValue({
          then: function (callback) {
            callback();
          },
        }),
    };

    mockPatientInvoiceFactory = {
      ViewEncounterInvoice: jasmine
        .createSpy('mockPatientInvoiceFactory.ViewEncounterInvoice')
        .and.returnValue({
          then: jasmine.createSpy(
            'mockPatientInvoiceFactory.ViewEncounterInvoice'
          ),
        }),
      CreateRefactorInvoices: jasmine
        .createSpy('mockPatientInvoiceFactory.CreateRefactorInvoices')
        .and.returnValue({
          then: jasmine.createSpy(
            'mockPatientInvoiceFactory.CreateRefactorInvoices'
          ),
        }),
      CreateCurrentInvoice: jasmine.createSpy().and.returnValue({
        then: jasmine.createSpy(),
      }),
    };

    mockClaimsService = {
      getClaimById: jasmine
        .createSpy('mockClaimsService.getClaimById')
        .and.returnValue(function (obj, callback) {
          callback();
        }),
    };

    patientSummaryFactory = {
      changeCheckoutEncounterLocation: jasmine.createSpy(),
      canCheckoutAllEncounters: jasmine.createSpy(),
    };

    // mockUibModal = {
    //     open: jasmine.createSpy('mockUibModal.open')
    // };

    //mock for modal
    mockUibModal = {
      open: jasmine
        .createSpy('modalInstance.open')
        .and.callFake(function (options) {
          actualOptions = options;
          deferred = $q.defer();
          deferred.resolve('some value in return');
          return { result: deferred.promise };
        }),
      close: jasmine.createSpy('modalInstance.close'),
      dismiss: jasmine.createSpy('modalInstance.dismiss'),
      result: {
        then: jasmine.createSpy('modalInstance.result.then'),
      },
    };

    mockTimeZoneFactory = {
      ConvertDateToMomentTZ: jasmine
        .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
        .and.callFake(function (date) {
          return moment(date);
        }),
      ConvertDateTZString: jasmine
        .createSpy('mockTimeZoneFactory.ConvertDateTZString')
        .and.callFake(function (date) {
          return date;
        }),
    };

    var mockCheckVoid = {
      Value: false,
    };

    mockAccountNoteFactory = {
      viewEob: jasmine.createSpy(),
      deleteAccountNote: jasmine.createSpy(),
      openClaimNoteModal: jasmine.createSpy(),
      getAccountNote: jasmine
        .createSpy('accountNoteFactory.getAccountNote')
        .and.returnValue({
          then: function (callback) {
            callback({
              Value: {
                Description: 'Test Description',
              },
            });
          },
        }),
    };

    mockAccountCreditTransactionFactory = {
      viewEob: jasmine.createSpy(),
    };

    mockCloseClaimOptionsService = {
      open: jasmine.createSpy(),
      allowEstimateOption: jasmine.createSpy().and.returnValue(false),
    };

    ctrl = $controller('patientSummaryBetaMigrationController', {
      $scope: scope,
      $rootScope: rootScope,
      $filter: filter,
      $location: mockLocation,
      localize: mockLocalize,
      PatientServices: mockPatientServices,
      patientAccountSummary: mockPatientAccountSummary,
      toastrFactory: mockToastrFactory,
      staticData: mockStaticData,
      listHelper: mockListHelper,
      locationServices: mockLocationServices,
      ModalFactory: mockModalFactory,
      NewPaymentTypesService: mockPaymentTypesService,
      ModalDataFactory: mockModalDataFactory,
      patSecurityService: mockPatSecurityService,
      $window: mockWindow,
      AccountSummaryFactory: mockAccountSummaryFactory,
      AccountServiceTransactionFactory: mockAccountServiceTransactionFactory,
      PatientInvoiceFactory: mockPatientInvoiceFactory,
      CommonServices: mockCommonServices,
      $sce: sce,
      DeleteInsurancePaymentFactory: mockDeleteInsurancePaymentFactory,
      referenceDataService: mockReferenceDataService,
      AccountSummaryDeleteFactory: mockAccountSummaryDeleteFactory,
      ClaimsService: mockClaimsService,
      $uibModal: mockUibModal,
      actualOptions: actualOptions,
      TimeZoneFactory: mockTimeZoneFactory,
      PatientSummaryFactory: patientSummaryFactory,
      $routeParams: routeParams,
      AccountNoteFactory: mockAccountNoteFactory,
      AccountDebitTransactionFactory: mockAccountDebitTransactionFactory,
      AccountCreditTransactionFactory: mockAccountCreditTransactionFactory,
      $timeout: timeout,
      CloseClaimOptionsService: mockCloseClaimOptionsService,
    });
    scope.$apply();
  }));

  describe('initial values -> ', function () {
    it('controller should exist and have run through setup logic', function () {
      expect(ctrl).not.toBeNull();
      //sets up Rows
      expect(scope.Rows.length).toBe(5);
      expect(scope.Rows[4].AccountId).toBe(98);
      //sets up Pending Encounters
      expect(scope.PendingEncounters.length).toBe(1);
      expect(scope.PendingEncounters[0].showDetail).toBe(true);
      //sets up unapplied amounts
      expect(scope.unappliedTransactions.length).toBe(2);
      //calls to get the details of the single pending encounter
      expect(mockAccountSummaryFactory.getEncounterDetails).toHaveBeenCalled();
      //calls to get other page load data
      expect(
        mockPaymentTypesService.getAllPaymentTypesMinimal
      ).toHaveBeenCalled();
      expect(ctrl.plans.length).toBe(1);
      //sets up dataforbalancedetailrow
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
      expect(ctrl.filterObject.PersonIds).toEqual([100]);
      expect(scope.noDeleteAccessTooltipMessage).toBe(
        'You do not have permission to Delete encounters at the service location.'
      );
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

  describe('notifyNotAuthorized -> ', function () {
    it('should throw toastr error', function () {
      ctrl.notifyNotAuthorized();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });
  });

  describe('scope.togglePopover -> ', function () {
    beforeEach(function () {
      scope.isPopoverOpen = false;
    });
    it('should set isPopoverOpen to true', function () {
      scope.togglePopover();
      expect(scope.isPopoverOpen).toBe(true);
    });
  });
  describe('scope.openClaimNotes -> ', function () {
    beforeEach(function () {
      scope.isPopoverOpen = true;
    });
    it('should set isPopoverOpen to false', function () {
      scope.openClaimNotes({ ClaimId: '1234' }, { Amount: 235 });
      expect(scope.isPopoverOpen).toBe(false);
    });
  });

  describe('scope.getRowDetails -> ', function () {
    beforeEach(function () {
      scope.isPopoverOpen = true;
    });
    it('should set isPopoverOpen to false', function () {
      scope.getRowDetails({ ClaimId: '1234' }, null);
      timeout.flush(0);
      expect(scope.isPopoverOpen).toBe(false);
    });
  });

  describe('scope.previewPdf -> ', function () {
    beforeEach(function () {
      scope.isPopoverOpen = true;
    });
    it('should call to get the pdf and add it to a new window', function () {
      scope.previewPdf({ claimId: 1 });
      expect(mockCommonServices.Insurance.ClaimPdf).toHaveBeenCalled();
      expect(mockWindowResult.document.write.calls.count()).toBe(2);
      expect(mockWindowResult.document.close).toHaveBeenCalled();
    });

    it('should set isPopoverOpen to false', function (done) {
      expect(scope.isPopoverOpen).toBe(true);
      scope.previewPdf({ claimId: 1 });
      mockCommonServices.Insurance.ClaimPdf().then(result => {
        expect(scope.isPopoverOpen).toBe(false);
        done();
      });
    });
  });

  describe('ctrl.refreshEncounterDetails -> ', function () {
    it('should call the account summary factory', function () {
      ctrl.encounterToRefresh = {};
      ctrl.plans = [];
      scope.patient.Data.PersonAccount.AccountId = 5;
      ctrl.refreshEncounterDetails();
      scope.$apply();
      expect(
        mockAccountSummaryFactory.getEncounterDetails
      ).toHaveBeenCalledWith(ctrl.encounterToRefresh, 5, ctrl.plans);
    });
  });

  describe('scope.openClaimNotes -> ', function () {
    it('should call the modal factory', function () {
      var item = {};
      var claim = { Status: 1, LocationId: 3 };
      scope.patient.Data.PatientId = 5;
      scope.openClaimNotes(claim, item);
      expect(mockAccountNoteFactory.openClaimNoteModal).toHaveBeenCalledWith(
        claim,
        5,
        3,
        ctrl.refreshEncounterDetails
      );
      expect(ctrl.encounterToRefresh).toBe(item);
    });
  });

  describe('$scope.deleteInsurancePayment -> ', function () {
    it('should call AccountSummaryFactory.deleteInsurancePayment', function () {
      ctrl.insurancePaymentTypes = [{ PaymentTypeId: 1, CurrencyTypeId: 3 }];
      var detail = {
        Claims: [{ ClaimId: 999 }],
        IsAuthorized: true,
        PaymentTypeId: 1,
        ObjectId: 1,
      };
      scope.deleteInsurancePayment(detail);
      expect(
        mockAccountSummaryFactory.deleteInsurancePayment
      ).toHaveBeenCalled();
    });
  });

  describe('scope.applyAdjustment-> ', function () {
    it('should notify not authorized when not authorized', function () {
      (mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(false)),
        scope.applyAdjustment();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should call ctrl.openPaymentAdjustmentModal when authorized', function () {
      spyOn(ctrl, 'openPaymentAdjustmentModal');
      scope.applyAdjustment();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
      expect(ctrl.openPaymentAdjustmentModal).toHaveBeenCalled();
    });
  });

  describe('scope.applyPayment-> ', function () {
    it('should notify not authorized when not authorized', function () {
      (mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(false)),
        scope.applyPayment();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should call ctrl.openPaymentAdjustmentModal when authorized', function () {
      spyOn(ctrl, 'openPaymentAdjustmentModal');
      scope.applyPayment();
      expect(
        mockPatSecurityService.IsAuthorizedByAbbreviation
      ).toHaveBeenCalled();
      expect(ctrl.openPaymentAdjustmentModal).toHaveBeenCalled();
    });
  });

  describe('ctrl.openPaymentAdjustmentModal -> ', function () {
    it('should not retrieve details when not missing and call build and open modal', function () {
      spyOn(ctrl, 'buildAndOpenModal');
      mockAccountSummaryFactory.getEncounterDetails.calls.reset();
      ctrl.openPaymentAdjustmentModal({ retrieved: true });
      scope.$apply();
      expect(
        mockAccountSummaryFactory.getEncounterDetails
      ).not.toHaveBeenCalled();
      expect(ctrl.buildAndOpenModal).toHaveBeenCalled();
    });
    it('should retrieve details when missing and call build and open modal', function () {
      spyOn(ctrl, 'buildAndOpenModal');
      mockAccountSummaryFactory.getEncounterDetails.calls.reset();
      ctrl.openPaymentAdjustmentModal({});
      scope.$apply();
      expect(mockAccountSummaryFactory.getEncounterDetails).toHaveBeenCalled();
      expect(ctrl.buildAndOpenModal).toHaveBeenCalled();
    });
  });

  describe('ctrl.buildAndOpenModal -> ', function () {
    it('should set ctrl.dataForModal and call GetTransactionModalData', function () {
      var date = new Date();
      ctrl.buildAndOpenModal(
        {
          AccountMemberId: 99,
          serviceTransactions: [{ Date: date, ObjectId: 1 }],
        },
        2
      );
      scope.$apply();
      expect(ctrl.dataForModal).toEqual({
        PatientAccountDetails: {
          AccountId: 98,
          AccountMemberId: 99,
        },
        DefaultSelectedIndex: 2,
        DefaultSelectedAccountMember: 99,
        TransactionList: [
          {
            Date: date,
            DateEntered: moment(date),
            ObjectId: 1,
            ServiceTransactionId: 1,
          },
        ],
        AllProviders: [],
      });
      expect(mockModalDataFactory.GetTransactionModalData).toHaveBeenCalled();
    });
  });

  describe('ctrl.openAdjustmentModal -> ', function () {
    it('should call modalFactory.TransactionModal', function () {
      ctrl.openAdjustmentModal();
      expect(mockModalFactory.TransactionModal).toHaveBeenCalled();
    });
  });

  describe('ctrl.modalResultOk -> ', function () {
    it('should reset field, refresh grid', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.applyingAdjustmentOrPayment = true;
      ctrl.modalResultOk();
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
      expect(ctrl.applyingAdjustmentOrPayment).toBe(false);
    });
  });

  describe('ctrl.modalResultCancel -> ', function () {
    it('should reset field', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.applyingAdjustmentOrPayment = true;
      ctrl.modalResultCancel();
      expect(scope.refreshSummaryPageDataForGrid).not.toHaveBeenCalled();
      expect(ctrl.applyingAdjustmentOrPayment).toBe(false);
    });
  });

  describe('scope.viewInvoice  -> ', function () {
    it('should call patient invoice factory', function () {
      scope.viewInvoice({});
      expect(mockPatientInvoiceFactory.ViewEncounterInvoice).toHaveBeenCalled();
    });
  });

  describe('scope.editAccountSummaryRowDetail -> ', function () {
    it('should call editServiceTransaction if object is a service transaction', function () {
      var item = {};
      item.accountSummaryRow = { ObjectType: 'EncounterBo' };
      item.accountSummaryRowDetail = {
        ObjectType: 'ServiceTransaction',
        TransactionTypeId: 1,
      };
      scope.editAccountSummaryRowDetail(item);
      expect(
        mockAccountServiceTransactionFactory.viewOrEditServiceTransaction
      ).toHaveBeenCalled();
    });
    it('should call accountDebitTransactionFactory.viewOrEditDebit when object is a debit transaction', function () {
      var item = {};
      item.accountSummaryRow = { ObjectType: 'DebitTransaction', PersonId: 4 };
      item.accountSummaryRowDetail = {
        ObjectType: 'DebitTransaction',
        TransactionTypeId: 5,
        ObjectId: 2,
      };
      scope.editAccountSummaryRowDetail(item);
      expect(
        mockAccountDebitTransactionFactory.viewOrEditDebit
      ).toHaveBeenCalledWith(2, 4, true, scope.refreshSummaryPageDataForGrid);
    });
  });

  describe('scope.deleteAccountSummaryRowDetail -> ', function () {
    it('should call accountSummaryDeleteFactory.deleteAccountSummaryRowDetail when not a service', function () {
      scope.deleteAccountSummaryRowDetail({}, {});
      scope.$apply();
      expect(
        mockAccountSummaryDeleteFactory.deleteAccountSummaryRowDetail
      ).toHaveBeenCalled();
    });

    it('should call mockAccountServiceTransactionFactory.deleteServiceTransaction when deleting a service', function () {
      scope.deleteAccountSummaryRowDetail(
        {},
        { ObjectType: 'ServiceTransaction' }
      );
      scope.$apply();
      expect(
        mockAccountServiceTransactionFactory.deleteServiceTransaction
      ).toHaveBeenCalled();
    });
    it('should call mockAccountDebitTransactionFactory.deleteDebit when ObjectType is DebitTransaction', function () {
      scope.deleteAccountSummaryRowDetail(
        { ObjectType: 'DebitTransaction' },
        { ObjectType: 'DebitTransaction', ObjectId: 3, TransactionTypeId: 5 }
      );
      scope.$apply();
      expect(
        mockAccountDebitTransactionFactory.deleteDebit
      ).toHaveBeenCalledWith(3, 5, scope.refreshSummaryPageDataForGrid);
    });
  });

  describe('scope.addNewEncounter -> ', function () {
    it('should throw error when not authorized', function () {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(false);
      scope.addNewEncounter();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });

    it('should redirect if patient is patient', function () {
      scope.addNewEncounter(1, 2);
      expect(mockLocation.url).toHaveBeenCalledWith(
        '/Patient/1/Account/2/EncountersCart/AccountSummary'
      );
    });

    it('should confirm and redirect if patient is patient', function () {
      scope.patient.Data.IsPatient = false;
      scope.addNewEncounter(2, 3);
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Not a Patient',
        "This person is not a patient. Proceeding will change this person's status to a patient. Do you wish to continue?",
        'Yes',
        'No'
      );
      expect(mockLocation.url).toHaveBeenCalled();
    });

    it('should redirect ', function () {
      scope.patient.Data.IsPatient = false;
      scope.addNewEncounter(2, 3);
      expect(mockLocation.url).toHaveBeenCalledWith(
        '/Patient/2/Account/3/EncountersCart/AccountSummary'
      );
    });
  });

  describe('scope.editEncounter -> ', function () {
    beforeEach(function () {
      ctrl.setRouteParams = jasmine.createSpy();
    });

    it('should throw error when not authorized', function () {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(false);
      scope.editEncounter();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });

    it('should redirect if authorized', function () {
      scope.patientId = 100;
      scope.editEncounter({ EncounterId: 1 });
      expect(ctrl.setRouteParams).toHaveBeenCalled();
      expect(
        patientSummaryFactory.changeCheckoutEncounterLocation
      ).toHaveBeenCalled();
    });

    it('should redirect correctly', function () {
      scope.patientId = 100;
      var encounter = { EncounterId: 1 };
      scope.editEncounter(encounter);
      expect(ctrl.setRouteParams).toHaveBeenCalledWith(
        encounter,
        'EncountersCart/AccountSummary'
      );
    });
  });

  describe('scope.checkoutPendingEncounter -> ', function () {
    it('should throw error when not authorized', function () {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(false);
      scope.checkoutPendingEncounter();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should redirect if authorized', function () {
      scope.patientId = 100;
      scope.checkoutPendingEncounter({ ObjectId: 1 });
      expect(
        patientSummaryFactory.changeCheckoutEncounterLocation
      ).toHaveBeenCalled();
    });
    it('should call ctrl.setRouteParams with Checkout/AccountSummary if authorized', function () {
      scope.patientId = 100;
      spyOn(ctrl, 'setRouteParams');
      scope.checkoutPendingEncounter({ ObjectId: 1 });
      expect(ctrl.setRouteParams).toHaveBeenCalledWith(
        { ObjectId: 1 },
        'Checkout/AccountSummary'
      );
    });
  });

  describe('scope.checkoutAllPendingEncounters -> ', function () {
    it('should throw error when not authorized', function () {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(false);
      scope.checkoutAllPendingEncounters();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(mockLocation.path).toHaveBeenCalled();
    });
    it('should redirect if authorized', function () {
      scope.checkoutAllIsAllowed = true;
      spyOn(ctrl, 'setRouteParams').and.returnValue(routeParams);
      scope.patientId = 100;
      scope.checkoutAllPendingEncounters();
      expect(
        patientSummaryFactory.changeCheckoutEncounterLocation
      ).toHaveBeenCalledWith(routeParams);
    });
    it('should call setRouteParams with Checkout/AccountSummary', function () {
      mockPatSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('')
        .and.returnValue(true);
      spyOn(ctrl, 'setRouteParams');
      scope.checkoutAllIsAllowed = true;
      scope.checkoutAllPendingEncounters();
      expect(ctrl.setRouteParams).toHaveBeenCalledWith(
        { $$locationId: undefined, ObjectId: null },
        'Checkout/AccountSummary'
      );
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

  describe('scope.createClaim -> ', function () {
    let row = {};
    beforeEach(function () {
      row = {
        AccountMemberId: '99',
        Items: [],
        PatientBenefitPlanDto: { PatientBenefitPlanId: '102' },
      };
      spyOn(ctrl, 'calculateEstimatatedInsuranceOption').and.returnValue({
        then: jasmine.createSpy().and.returnValue(true),
      });
      scope.accountMembersOptionsTemp = [
        { accountMemberId: '99', personId: '100' },
      ];
    });
    it('should call ctrl.calculateEstimatatedInsuranceOption if only one plan', function () {
      ctrl.plans = {
        100: [
          {
            PatientBenefitPlan: '100',
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
          },
        ],
      };
      scope.createClaim(row);
      expect(ctrl.calculateEstimatatedInsuranceOption).toHaveBeenCalled();
    });

    it('should call ctrl.calculateEstimatatedInsuranceOption with items that are ServiceTransactions', function () {
      row.Items = [
        { ObjectType: 'AccountNote' },
        {
          ObjectType: 'ServiceTransaction',
          Date: '2021-09-15 22:26:18.2250000',
        },
        { ObjectType: 'CreditTransaction' },
      ];
      ctrl.plans = {
        100: [
          {
            PatientBenefitPlan: '100',
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
          },
        ],
      };
      var plans = ctrl.plans['100'];
      scope.createClaim(row);
      expect(
        ctrl.calculateEstimatatedInsuranceOption
      ).toHaveBeenCalledWith(plans[0], [row.Items[1]]);
    });

    it('should call modalFactory CreateClaimsModal if more than one plan', function () {
      ctrl.plans = {
        100: [
          {
            PatientBenefitPlan: '100',
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
          },
          {
            PatientBenefitPlan: '101',
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
          },
        ],
      };
      scope.createClaim(row);
      expect(mockModalFactory.CreateClaimsModal).toHaveBeenCalled();
    });

    it('should not call ctrl.calculateEstimatatedInsuranceOption if more than one plan and no match', function (done) {
      mockModalFactory.CreateClaimsModal().then(() => {
        return '102';
      });
      ctrl.plans = {
        100: [
          {
            PatientBenefitPlanId: '100',
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
          },
          {
            PatientBenefitPlanId: '101',
            PolicyHolderBenefitPlanDto: { BenefitPlanDto: { RenewalMonth: 6 } },
          },
        ],
      };
      scope.createClaim(row);
      expect(ctrl.calculateEstimatatedInsuranceOption).not.toHaveBeenCalled();
      done();
    });
  });

  describe('ctrl.createClaimSuccess -> ', function () {
    it('should throw toastr and refresh grid', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.createClaimSuccess();
      expect(mockToastrFactory.success).toHaveBeenCalled();
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });
  });

  describe('ctrl.createClaimFailure -> ', function () {
    it('should throw toastr and refresh grid', function () {
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.createClaimFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });
  });

  describe('ctrl.checkAdjustment -> ', function () {
    var res = {};
    beforeEach(function () {
      res = {
        Value: {
          0: { ClaimId: 1 },
        },
      };
      ctrl.selectedPlan = {
        Priority: 1,
        PolicyHolderBenefitPlanDto: {
          BenefitPlanDto: {
            FeesIns: 2,
            ApplyAdjustments: 1,
          },
        },
      };
      mockClaimsService.getClaimById = jasmine
        .createSpy('mockClaimsService.getClaimById')
        .and.callFake(function (obj, callback) {
          callback({
            Value: {
              ClaimId: 10,
              BenefitPlanId: 20,
              PatientId: 40,
              PatientName: 'John Doe',
              ServiceTransactionToClaimPaymentDtos: [
                {
                  ServiceTransactionId: 30,
                  AdjustedEstimate: 12,
                },
              ],
            },
          });
        });
    });
    it('should show confirm modal if needs adjustment', function () {
      ctrl.checkAdjustment(res);
      scope.$apply();
      expect(mockClaimsService.getClaimById).toHaveBeenCalled();
      expect(mockModalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Fee Schedule Present',
        "The patient's benefit plan requires a fee schedule adjustment. Would you like to complete the adjustment now?",
        'Yes',
        'No'
      );
      expect(mockModalDataFactory.GetTransactionModalData).toHaveBeenCalled();
      expect(mockModalFactory.TransactionModal).toHaveBeenCalled();
      expect(ctrl.dataForModal).toEqual({
        PatientAccountDetails: {
          AccountId: 98,
        },
        DefaultSelectedIndex: 1,
        AllProviders: [{ LocationId: 3, Timezone: 'Central Standard Time' }],
        BenefitPlanId: 20,
        claimAmount: 0,
        isFeeScheduleAdjustment: true,
        claimId: 10,
        serviceTransactionData: {
          serviceTransactions: [30],
          isForCloseClaim: true,
          unPaidAmout: 12,
        },
        patientData: {
          patientId: 40,
          patientName: 'John Doe',
        },
      });
    });
    it('should refresh grid if no adjustment needed', function () {
      mockClaimsService.getClaimById = jasmine
        .createSpy('mockClaimsService.getClaimById')
        .and.callFake(function (obj, callback) {
          callback({
            Value: {
              ServiceTransactionToClaimPaymentDtos: [
                {
                  AdjustedEstimate: 0,
                },
              ],
            },
          });
        });
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.checkAdjustment(res);
      scope.$apply();
      expect(mockClaimsService.getClaimById).toHaveBeenCalled();
      expect(mockModalFactory.ConfirmModal).not.toHaveBeenCalled();
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });
    it('should refresh grid if not valid for adjustment', function () {
      mockClaimsService.getClaimById = jasmine
        .createSpy('mockClaimsService.getClaimById')
        .and.callFake(function (obj, callback) {
          callback({
            Value: {
              ServiceTransactionToClaimPaymentDtos: [
                {
                  AdjustedEstimate: 0,
                },
              ],
            },
          });
        });
      spyOn(scope, 'refreshSummaryPageDataForGrid');
      ctrl.selectedPlan.Priority = 0;
      ctrl.checkAdjustment(res);
      scope.$apply();
      expect(mockClaimsService.getClaimById).not.toHaveBeenCalled();
      expect(mockModalFactory.ConfirmModal).not.toHaveBeenCalled();
      expect(scope.refreshSummaryPageDataForGrid).toHaveBeenCalled();
    });
  });

  describe('scope.viewAccountNote -> ', function () {
    it('should set mode and call showModalAccountNote', function () {
      spyOn(ctrl, 'showModalAccountNote');
      scope.viewAccountNote();
      expect(scope.mode).toEqual('view');
      expect(ctrl.showModalAccountNote).toHaveBeenCalled();
    });
  });

  describe('scope.editAccountNote -> ', function () {
    it('should set mode and call showModalAccountNote', function () {
      spyOn(ctrl, 'showModalAccountNote');
      scope.editAccountNote();
      expect(scope.mode).toEqual('edit');
      expect(ctrl.showModalAccountNote).toHaveBeenCalled();
    });
  });

  describe('ctrl.showModalAccountNote -> ', function () {
    it('should call patient services account get all account members', function () {
      var note = { ObjectIdLong: 6 };
      spyOn(ctrl, 'getPersonAccountMembers');
      ctrl.showModalAccountNote(note);
      expect(mockAccountNoteFactory.getAccountNote).toHaveBeenCalledWith(6);
      expect(scope.personAccountNote.Description).toBe('Test Description');
      expect(ctrl.getPersonAccountMembers).toHaveBeenCalled();
    });
  });

  describe('ctrl.getPersonAccountMembers -> ', function () {
    it('should call patient services account get all account members', function () {
      scope.personAccountNote = { AccountId: 5 };
      ctrl.getPersonAccountMembers();
      expect(
        mockPatientServices.Account.getAllAccountMembersByAccountId
      ).toHaveBeenCalledWith(
        { accountId: 5 },
        ctrl.personAccountMemberSuccess,
        ctrl.personAccountMemberFailure
      );
    });
  });

  describe('ctrl.personAccountMemberSuccess -> ', function () {
    it('should do nothing if not type is not user entered and mode is edit', function () {
      scope.mode = 'edit';
      scope.personAccountNote = { NoteType: 2 };
      var accountmembers = {
        Value: {},
      };
      ctrl.personAccountMemberSuccess(accountmembers);
      scope.$apply();
      expect(mockUibModal.open).not.toHaveBeenCalled();
    });
    it('should set fields and open modal', function () {
      scope.personAccountNote = { NoteType: 1, PatientId: 6 };
      var accountmembers = {
        Value: { AccountId: 4 },
      };
      ctrl.personAccountMemberSuccess(accountmembers);
      scope.$apply();
      expect(scope.locations).toEqual([
        { LocationId: 3, Timezone: 'Central Standard Time' },
      ]);
      expect(scope.accountMembers).toEqual(accountmembers.Value);
      expect(scope.selectedPatientId).toEqual(6);
      expect(mockUibModal.open).toHaveBeenCalled();
    });
  });

  describe('ctrl.personAccountMemberFailure -> ', function () {
    it('should throw toastr', function () {
      ctrl.personAccountMemberFailure();
      expect(mockToastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('scope.deleteAccountNote -> ', function () {
    it('should call to delete note', function () {
      scope.deleteAccountNote({ Id: 5, NoteType: 1 });
      expect(mockAccountNoteFactory.deleteAccountNote).toHaveBeenCalledWith(
        1,
        5,
        scope.refreshSummaryPageDataForGrid
      );
    });
  });

  describe('createCurrentInvoice function', function () {
    it('patientInvoiceFactory.CreateCurrentInvoice to be called', function () {
      scope.createCurrentInvoice([], 'patient1');
      expect(mockPatientInvoiceFactory.CreateCurrentInvoice).toHaveBeenCalled();
    });
  });

  describe('viewEob', function () {
    it('should call account note factory viewEob function if not an insurance payment', function () {
      var item = {
        item: { EraTransactionSetHeaderId: 4, ObjectIdLong: 7, PersonId: 100 },
      };
      scope.viewEob(item);
      expect(mockAccountNoteFactory.viewEob).toHaveBeenCalledWith(4, 7, 100);
    });
    it('should call credit transaction factory viewEob function if an insurance payment', function () {
      var item = {
        row: { PersonId: 100 },
        item: {
          EraTransactionSetHeaderId: 4,
          ObjectIdLong: 7,
          PersonId: null,
          TransactionTypeId: 3,
          Claims: [{ ClaimId: 300 }],
        },
      };
      scope.viewEob(item);
      expect(mockAccountCreditTransactionFactory.viewEob).toHaveBeenCalledWith(
        4,
        300,
        100
      );
    });
    it('should not call viewEob function if item is undefined', function () {
      scope.viewEob(undefined);
      expect(mockAccountNoteFactory.viewEob).not.toHaveBeenCalled();
      expect(
        mockAccountCreditTransactionFactory.viewEob
      ).not.toHaveBeenCalled();
    });
    it('should not call viewEob function if item is null', function () {
      scope.viewEob(null);
      expect(mockAccountNoteFactory.viewEob).not.toHaveBeenCalled();
      expect(
        mockAccountCreditTransactionFactory.viewEob
      ).not.toHaveBeenCalled();
    });
    it('should not call viewEob function if item claims list is empty', function () {
      var item = {
        item: {
          EraTransactionSetHeaderId: 4,
          ObjectIdLong: 7,
          PersonId: null,
          TransactionTypeId: 3,
          Claims: [],
        },
      };
      scope.viewEob(item);
      expect(mockAccountNoteFactory.viewEob).not.toHaveBeenCalled();
      expect(
        mockAccountCreditTransactionFactory.viewEob
      ).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.setRouteParams ->', function () {
    it('should set the route params when checkoutAllPendingEncounters is called', function () {
      scope.checkoutAllIsAllowed = true;
      spyOn(ctrl, 'setRouteParams').and.returnValue(routeParams);
      scope.checkoutAllPendingEncounters();

      expect(ctrl.setRouteParams).toHaveBeenCalled();
      expect(
        patientSummaryFactory.changeCheckoutEncounterLocation
      ).toHaveBeenCalledWith(routeParams);
    });

    it('should set the route params when editEncounter is called', function () {
      spyOn(ctrl, 'setRouteParams').and.returnValue(routeParams);
      scope.editEncounter();

      expect(ctrl.setRouteParams).toHaveBeenCalled();
      expect(
        patientSummaryFactory.changeCheckoutEncounterLocation
      ).toHaveBeenCalledWith(routeParams);
    });

    it('should set the route params when checkoutPendingEncounter is called', function () {
      spyOn(ctrl, 'setRouteParams').and.returnValue(routeParams);
      scope.checkoutPendingEncounter();

      expect(ctrl.setRouteParams).toHaveBeenCalled();
      expect(
        patientSummaryFactory.changeCheckoutEncounterLocation
      ).toHaveBeenCalledWith(routeParams);
    });
  });

  describe('scope.editAcctPaymentOrNegAdjustmentModal', function () {
    it('should call the accountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal function', function () {
      var detail = {
        TransactionTypeId: 2,
        LocationId: 1,
        Date: '03-29-2019',
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

      scope.editAcctPaymentOrNegAdjustmentModal(detail);

      expect(
        mockAccountSummaryFactory.viewOrEditAcctPaymentOrNegAdjustmentModal
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.showUnappliedModalListener -> ', function () {
    beforeEach(function () {
      spyOn(scope, '$broadcast');
    });

    it('should handle emit event for showUnappliedModal', function () {
      scope.$emit('showUnappliedModal');
      expect(scope.$broadcast).toHaveBeenCalledWith(
        'showUnappliedModalPayment'
      );
    });
  });

  describe('ctrl.getPendingEncounters -> ', function () {
    var rows = [];
    beforeEach(function () {
      rows = [{ PersonId: '1234' }, { PersonId: '1234' }, { PersonId: '1235' }];
      scope.patient = { Data: { PersonAccount: { AccountId: '1122' } } };
      mockAccountSummaryFactory.getPendingEncounters = jasmine
        .createSpy('mockAccountSummaryFactory.getPendingEncounters')
        .and.returnValue({
          then: function (callback) {
            callback(rows);
          },
        });
      ctrl.filterObject.PersonId = '1234';
      spyOn(scope, 'getRowDetails');
    });

    it('should call canCheckoutAllEncounters', function () {
      ctrl.getPendingEncounters();
      expect(
        patientSummaryFactory.canCheckoutAllEncounters
      ).toHaveBeenCalledWith(rows);
    });

    it('should filter rows by filterObject.PersonIds if ctrl.filterObject.PersonIds is not null to load PendingEncounters', function () {
      ctrl.filterObject.PersonIds = ['1234'];
      ctrl.getPendingEncounters();
      expect(scope.PendingEncounters).toEqual([
        { PersonId: '1234' },
        { PersonId: '1234' },
      ]);
    });

    it('should load all rows to PendingEncounters for account if ctrl.filterObject.PersonIds is null', function () {
      ctrl.filterObject.PersonIds = null;
      ctrl.getPendingEncounters();
      expect(scope.PendingEncounters).toEqual([
        { PersonId: '1234' },
        { PersonId: '1234' },
        { PersonId: '1235' },
      ]);
    });

    it('should call scope.getRowDetails if PendingEncounters length is 1', function () {
      rows = [{ PersonId: '1234' }];
      ctrl.filterObject.PersonIds = null;
      ctrl.getPendingEncounters();
      expect(scope.getRowDetails).toHaveBeenCalled();
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
});
