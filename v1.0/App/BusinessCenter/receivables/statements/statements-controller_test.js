describe('statements ->', function () {
  var scope,
    ctrl,
    locationServices,
    deferred,
    q,
    batchStatementService,
    tabLauncher,
    patientServices,
    modalFactory,
    modalFactoryDeferred,
    toastrFactory,
    toastrFactoryDeferred,
    referenceDataService,
    mocklocalize,
    featureFlagService,
    fuseFlag,
    mockRetryMessage;

  beforeEach(module('Soar.BusinessCenter'));
  beforeEach(module('Soar.Patient'));
  beforeEach(inject(function ($rootScope, $controller, $q) {
    scope = $rootScope.$new();
    q = $q;
    deferred = q.defer();

    mockRetryMessage = 'test';

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
    };

    toastrFactory = {
      error: jasmine.createSpy('toastrFactory.error').and.callFake(function () {
        toastrFactoryDeferred = q.defer();
        toastrFactoryDeferred.resolve(1);
        return {
          result: toastrFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };

    //localize = {
    //    getLocalizedString: jasmine.createSpy().and.returnValue('some value')
    //};

    referenceDataService = {
      entityNames: {
        practiceSettings: 'practiceSettings',
      },
    };
    locationServices = {
      get: jasmine
        .createSpy('LocationServices.get')
        .and.returnValue({ $promise: deferred.promise }),
      getLocationEstatementEnrollmentStatus: jasmine.createSpy(
        'LocationServices.getLocationEstatementEnrollmentStatus'
      ),
    };
    mocklocalize = {
      getLocalizedString: function (str) {
        return str;
      },
    };
    tabLauncher = {
      launchNewTab: jasmine.createSpy('tabLauncher.launchNewTab'),
    };

    batchStatementService = {
      Service: {
        queueSubmission: jasmine
          .createSpy('batchStatementService.Service.queueSubmission')
          .and.returnValue({ $promise: deferred.promise }),
        create: jasmine
          .createSpy('batchStatementService.Service.create')
          .and.returnValue({ $promise: deferred.promise }),
        update: jasmine
          .createSpy('batchStatementService.Service.ustatpdate')
          .and.returnValue({ $promise: deferred.promise }),
        fetchFilterPreferences: jasmine
          .createSpy('batchStatementService.Service.fetchFilterPreferences')
          .and.returnValue({ $promise: deferred.promise }),
        saveNewBatch: jasmine
          .createSpy('batchStatementService.Service.saveNewBatch')
          .and.returnValue({ $promise: deferred.promise }),
        fetchSingleAccountStatementData: jasmine
          .createSpy('batchStatementService.Service.fetchSingleAccountStatementData')
          .and.returnValue({ $promise: deferred.promise }),
        getBatchGrid: jasmine
          .createSpy('batchStatementService.Service.getBatchGrid')
          .and.returnValue({ $promise: deferred.promise }),
        updateIsSelectedOnBatchForEntireBatch: jasmine
          .createSpy('batchStatementService.Service.updateIsSelectedOnBatchForEntireBatch'),
      },
      GetSingleStatementPdfFromSettings: jasmine
        .createSpy('batchStatementService.GetSingleStatementPdfFromSettings')
        .and.returnValue({ then: function () {} }),
    };

    patientServices = {
      AccountStatements: {
        GetAccountStatementMessages: jasmine
          .createSpy(
            'patientServices.AccountStatements.GetAccountStatementMessages'
          )
          .and.returnValue({ $promise: deferred.promise }),
      },
    };
    
    featureFlagService = {
      getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };
            
    fuseFlag = {
      EnableNewStatementsExperience: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    sessionStorage.setItem('userLocation', JSON.stringify({ id: 3 }));

    ctrl = $controller('StatementsController', {
      $scope: scope,
      LocationServices: locationServices,
      BatchStatementService: batchStatementService,
      tabLauncher: tabLauncher,
      PatientServices: patientServices,
      ModalFactory: modalFactory,
      referenceDataService: referenceDataService,
      localize: mocklocalize,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag,
    });
  }));

  describe('new statements experience -> ', function() {
    it('StatementsController : Should hide/show NSE button', function() {
      // Make sure initial state is false/hidden
      expect(scope.showNewStatementsExperience).toEqual(false);
    });
  });

  describe('initial values ->', function () {
    it('StatementsController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
      expect(scope.limitofCHCBatch).toEqual(2500);
    });
  });

  describe('ctrl.createFilterObject -> ', function () {
    it('Should return object sent to filter api', function () {
      scope.locations = {
        selectedLocations: [{ LocationId: 1 }, { LocationId: 2 }],
      };
      var currentDate = moment();
      var msgText = 'The Message Text';
      scope.selectedMainFilterType = 'CUSTOM';
      scope.selectedDisplayAccountsFromLetter = 'Y';
      scope.selectedDisplayAccountsToLetter = 'Z';
      scope.balanceGreaterThan = '5.00';
      scope.selectedAccountsFilterType = 1;
      scope.includeCreditBalance = false;
      scope.detailDateType = 'CUSTOM';
      scope.dueDateDateType = 'CUSTOM';
      scope.organizeByType = 'DATE';
      scope.detailCustomDateValue = currentDate;
      scope.dueDateCustomDateValue = currentDate;
      scope.isFinanceChargeOn = true;
      scope.messageTextValue = msgText;
      scope.selectedStatementMessageId30 = 1;
      scope.selectedStatementMessageId60 = 2;
      scope.selectedStatementMessageId90 = 3;
      scope.selectedStatementMessageId90Plus = 4;
      var expected = {
        FilterCriteria: {
          LocationIds: [1, 2],
          NamesBetweenStartLetter: 'Y',
          NamesBetweenEndLetter: 'Z',
          DaysSinceLastStatement: 0,
          MainFilterType: 4,
          BalanceGreaterThan: '5.00',
          AccountsFilterType: 1,
          IncludeAccountsWithCreditBalance: false,
        },
        SortCriteria: {},
        FilterPreferences: {
          AlphabetRangeFirst: 'Y',
          AlphabetRangeLast: 'Z',
          BalanceGreaterThan: '5.00',
          LastStatementAge: 0,
          MainFilterType: 4,
          AccountsFilterType: 1,
          IncludeNegativeBalance: false,
          IsDetailByDate: true,
          DetailFromDate: currentDate,
          IsDueByDate: true,
          DueByDate: currentDate,
          IsFinanceChargeOn: true,
          IsOrganizedByDate: true,
          Message: msgText,
          StatementMessageId30: 1,
          StatementMessageId60: 2,
          StatementMessageId90: 3,
          StatementMessageId90Plus: 4,
        },
        savePreferences: true,
      };
      var filter = ctrl.createFilterObject();
      expect(filter).toEqual(expected);
    });
  });

  describe('ctrl.getAccountStatementMessages -> ', function () {
    it('should call patientServices.AccountStatements.GetAccountStatementMessages', function () {
      ctrl.getAccountStatementMessages();
      expect(
        patientServices.AccountStatements.GetAccountStatementMessages
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.getFilterPreferencesSuccess -> ', function () {
    it('should set scope values based on preferences passed in', function () {
      var res = {
        Value: {
          AlphabetRangeFirst: 'S',
          AlphabetRangeLast: 'T',
          BalanceGreaterThan: '10.00',
          LastStatementAge: '30',
          MainFilterType: 5,
          IncludeInsurancePending: true,
          AccountsFilterType: 2,
          IsDueByDate: true,
          IsFinanceChargeOn: true,
          IsOrganizedByDate: true,
          StatementMessageId30: 1,
          StatementMessageId60: 2,
          StatementMessageId90: 3,
          StatementMessageId90Plus: 4,
        },
      };

      var expectedScope = {
        selectedDisplayAccountsFromLetter: res.Value.AlphabetRangeFirst,
        selectedDisplayAccountsToLetter: res.Value.AlphabetRangeLast,
        balanceGreaterThan: res.Value.BalanceGreaterThan,
        numberOfDaysNoStatements: res.Value.LastStatementAge,
        selectedMainFilterType: 'NOSTATEMENTSIN',
        numberOfDaysNoStatementsEnabled: true,
        selectedAccountsFilterType: 2,
        includeCreditBalance: res.Value.IncludeNegativeBalance,
        dueDateDateType: 'CUSTOM',
        isFinanceChargeOn: res.Value.IsFinanceChargeOn,
        organizeByType: 'DATE',
        selectedStatementMessageId30: 1,
        selectedStatementMessageId60: 2,
        selectedStatementMessageId90: 3,
        selectedStatementMessageId90Plus: 4,
      };
      ctrl.getFilterPreferencesSuccess(res);
      expect(scope.selectedDisplayAccountsFromLetter).toEqual(
        expectedScope.selectedDisplayAccountsFromLetter
      );
      expect(scope.selectedDisplayAccountsToLetter).toEqual(
        expectedScope.selectedDisplayAccountsToLetter
      );
      expect(scope.numberOfDaysNoStatements).toEqual(
        expectedScope.numberOfDaysNoStatements
      );
      expect(scope.balanceGreaterThan).toEqual(
        expectedScope.balanceGreaterThan
      );
      expect(scope.selectedMainFilterType).toEqual(
        expectedScope.selectedMainFilterType
      );
      expect(scope.numberOfDaysNoStatementsEnabled).toEqual(
        expectedScope.numberOfDaysNoStatementsEnabled
      );
      expect(scope.selectedAccountsFilterType).toEqual(
        expectedScope.selectedAccountsFilterType
      );
      expect(scope.includeCreditBalance).toEqual(
        expectedScope.includeCreditBalance
      );
      expect(scope.dueDateDateType).toEqual(expectedScope.dueDateDateType);
      expect(scope.isFinanceChargeOn).toEqual(expectedScope.isFinanceChargeOn);
      expect(scope.organizedByType).toEqual(expectedScope.organizedByType);
      expect(scope.selectedStatementMessageId30).toEqual(
        expectedScope.selectedStatementMessageId30
      );
      expect(scope.selectedStatementMessageId60).toEqual(
        expectedScope.selectedStatementMessageId60
      );
      expect(scope.selectedStatementMessageId90).toEqual(
        expectedScope.selectedStatementMessageId90
      );
      expect(scope.selectedStatementMessageId90Plus).toEqual(
        expectedScope.selectedStatementMessageId90Plus
      );
    });
  });

  describe('ctrl.getFilterPreferencesSuccess -> ', function () {
    it('should set scope values to default values when preference value is null', function () {
      var prefs = {
        Value: null,
      };
      ctrl.getFilterPreferencesSuccess(prefs);
      expect(scope.selectedDisplayAccountsFromLetter).toEqual('A');
      expect(scope.selectedDisplayAccountsToLetter).toEqual('F');
      expect(scope.selectedMainFilterType).toEqual('ALL');
      expect(scope.numberOfDaysNoStatementsEnabled).toEqual(false);
      expect(scope.balanceGreaterThan).toEqual(5.0);
      expect(scope.customLetterRangeEnabled).toEqual(false);
      expect(scope.balanceGreaterThanPrevValue).toEqual(5.0);
      expect(scope.selectedAccountsFilterType).toEqual(1);
      expect(scope.includeCreditBalance).toEqual(false);
      expect(scope.detailDateType).toEqual('CUSTOM');
      expect(scope.dueDateDateType).toEqual('CUSTOM');
      expect(scope.isFinanceChargeOn).toEqual(true);
      expect(scope.selectedStatementMessageId30).toEqual(null);
      expect(scope.selectedStatementMessageId60).toEqual(null);
      expect(scope.selectedStatementMessageId90).toEqual(null);
      expect(scope.selectedStatementMessageId90Plus).toEqual(null);
    });
  });

  describe('scope.create -> ', function () {
    it('Should call service to queue Submission when IsEStatementV3Enabled is true in PracticeSetting', function () {
      scope.batchData = {
        Rows: [
          { Value: 1, ApplyFinanceCharge: false, FinanceCharge: 1.25 },
          { Value: 2, ApplyFinanceCharge: true, FinanceCharge: 1.25 },
        ],
        BatchStatement: {},
      };
      scope.isViewingASavedBatch = true;
      scope.create(true);
      expect(batchStatementService.Service.queueSubmission.calls.count()).toBe(
        1
      );
    });
  });

  describe('scope.create -> ', function () {
    it('When submission method is print should call service to create the batch with correct submission method', function () {
      scope.batchData = {
        Rows: [
          { Value: 1, ApplyFinanceCharge: false, FinanceCharge: 1.25 },
          { Value: 2, ApplyFinanceCharge: true, FinanceCharge: 1.25 },
        ],
        BatchStatement: { NumberOfStatements: 2 },
        TotalCount: 2,
      };
      scope.batchData.SelectAll = false;
      scope.create(true, 'print');
      expect(batchStatementService.Service.create.calls.count()).toBe(0);
    });
  });

  describe('scope.create -> ', function () {
    it('When submission method is electronic should call service to create the batch with correct submission method', function () {
      scope.batchData = {
        Rows: [
          { Value: 1, ApplyFinanceCharge: false, FinanceCharge: 1.25 },
          { Value: 2, ApplyFinanceCharge: true, FinanceCharge: 1.25 },
        ],
        BatchStatement: { NumberOfStatements: 2 },
        TotalCount: 2,
      };
      scope.batchData.SelectAll = false;

      scope.create(true, 'electronic');
      expect(batchStatementService.Service.create.calls.count()).toBe(0);
    });
  });

  describe('scope.create -> ', function () {
    it('Should call service to update batch when isViewingASavedBatch', function () {
      scope.batchData = {
        Rows: [
          { Value: 1, ApplyFinanceCharge: false, FinanceCharge: 1.25 },
          { Value: 2, ApplyFinanceCharge: true, FinanceCharge: 1.25 },
        ],
        BatchStatement: {},
      };
      scope.isViewingASavedBatch = true;
      scope.create(true);
      expect(batchStatementService.Service.create.calls.count()).toBe(0);
    });
  });

  describe('scope.getSingleSavedBatchSuccess -> ', function () {
    it('Should set IsSelectedOnBatch and accountInfoMessage appropriately', function () {
      var response = {
        Value: {
          BatchStatement: {
            IsForSingleAccount: false,
            IsProcessed: true,
            AlphabetRangeFirst: 'S',
            AlphabetRangeLast: 'T',
            BalanceGreaterThan: '10.00',
            LastStatementAge: '30',
            MainFilterType: 5,
            IncludeInsurancePending: true,
            IncludeFullInsuranceCoverage: true,
            IncludeNegativeBalance: false,
            IsDueByDate: true,
            IsFinanceChargeOn: true,
            IsOrganizedByDate: true,
            Status: 3,
          },
          Rows: [
            {
              Value: 1,
              ApplyFinanceCharge: false,
              FinanceCharge: null,
              StatementHistory: 1,
            },
            {
              Value: 2,
              ApplyFinanceCharge: true,
              FinanceCharge: 1.25,
              StatementHistory: 2,
            },
          ],
          FilterPreferences: {
            IsDetailByDate: true,
          },
        },
      };
      ctrl.getSingleSavedBatchSuccess(response);
      expect(scope.batchData.Rows[0].StatementHistory).toEqual(1);
      expect(scope.batchData.Rows[0].SinceLastStatementSelected).toEqual(false);
      expect(scope.batchData.Rows[0].IsSelectedOnBatch).toEqual(false);
      expect(scope.batchData.Rows[0].accountInfoMessage).toEqual(
        'Account no longer meets criteria'
      );
      expect(scope.batchData.Rows[1].StatementHistory).toEqual(2);
      expect(scope.batchData.Rows[1].SinceLastStatementSelected).toEqual(false);
      expect(scope.batchData.Rows[1].IsSelectedOnBatch).toEqual(true);
      expect(scope.batchData.Rows[1].accountInfoMessage).toEqual(
        'This account now meets the statement criteria'
      );
    });
  });

  describe('ctrl.getBatchData -> ', function () {
    it('Should call service method fetchSingleAccountStatementData when isSingleAccount', function () {
      scope.isSingleAccount = true;
      scope.accountId = '123456789';
      ctrl.getBatchData();
      expect(
        batchStatementService.Service.fetchSingleAccountStatementData.calls.count()
      ).toBe(1);
    });
  });

  describe('ctrl.getBatchData -> ', function () {
    it('Should call service method saveNewBatch', function () {
      scope.isSingleAccount = false;
      ctrl.getBatchData();
      expect(batchStatementService.Service.saveNewBatch.calls.count()).toBe(1);
    });
  });

  describe('scope.loadBatchData -> ', function () {
    it('Should call service method getBatchGrid', function () {
      scope.batchData = {};
      scope.loadBatchData();
      expect(batchStatementService.Service.getBatchGrid.calls.count()).toBe(1);
    });
  });

  describe('scope.getFaultedAccounts -> ', function () {
    it('Should return only faulty Accounts', function () {
      scope.showOnlyFaultedAccount = true;
      scope.getFaultedAccounts();
      expect(batchStatementService.Service.getBatchGrid.calls.count()).toBe(1);
    });

    it('Should have been called with corrected batch data', function () {
      scope.showOnlyFaultedAccount = true;
      scope.batchData = {
        CurrentPage: 0,
        PageCount: 20, 
        ApplySelectDeselectAll: false,
        ShowOnlyFaultedAccounts: true
      };
      scope.getFaultedAccounts();

      expect(batchStatementService.Service.getBatchGrid.calls.count()).toBe(1);
      expect(scope.currentPage).toBe(0);
      expect(scope.batchData.ShowOnlyFaultedAccounts).toBe(true);
    });

    it('Should not call loadBatchData', function () {
      scope.loadBatchData = jasmine.createSpy('loadBatchData');
      scope.showOnlyFaultedAccount = false;
      scope.getFaultedAccounts();

      expect(scope.loadBatchData).not.toHaveBeenCalled();
      expect(scope.allDataDisplayed).toBe(false);
    });
  });
  describe('ctrl.setStatementSettings  -> ', function () {
    it('Should not add new row in scope.batchData.rows when row already loaded', function () {
      var row = { IsSelectedOnBatch: true, AccountId: 1 };
      scope.batchData = {
        FilterPreferences: { IsDetailByDate: true },
        Rows: [row],
      };
      scope.showOnlyFaultedAccount = false;
      scope.checkAllAccounts = false;
      ctrl.setStatementSettings(row);
      expect(scope.batchData.Rows.length).toBe(1);
      expect(scope.batchData.Rows[0].AccountId).toBe(row.AccountId);
    });
    it('Should add new row in scope.batchData.rows', function () {
      var row = { IsSelectedOnBatch: true, AccountId: 1 };
      var row2 = { IsSelectedOnBatch: true, AccountId: 2 };
      scope.batchData = {
        FilterPreferences: { IsDetailByDate: true },
        Rows: [row],
      };
      scope.showOnlyFaultedAccount = false;
      scope.checkAllAccounts = false;
      ctrl.setStatementSettings(row2);
      expect(scope.batchData.Rows.length).toBe(2);
      expect(scope.batchData.Rows[1].AccountId).toBe(row2.AccountId);
    });
  });

  describe('ctrl.toggleSelected -> ', function () {
    it('Should update the DB when we toggle a row in the batch', function () {
      scope.updateAccountStatementIsSelectedOnBatch = jasmine.createSpy('updateAccountStatementIsSelectedOnBatch');
      const row = { IsSelectedOnBatch: false, ValidationMessages: [] };
      scope.toggleSelected(row, true);
      expect(scope.updateAccountStatementIsSelectedOnBatch).toHaveBeenCalled();
    });
    it('Should not update the DB when we toggle a row in the batch', function () {
      scope.updateAccountStatementIsSelectedOnBatch = jasmine.createSpy('updateAccountStatementIsSelectedOnBatch');
      const row = { IsSelectedOnBatch: false, ValidationMessages: [] };
      scope.toggleSelected(row, false);
      expect(scope.updateAccountStatementIsSelectedOnBatch).not.toHaveBeenCalled();
    });
  });

  describe('ctrl.toggleAll -> ', function () {
    it('Should set all row selected status to match scope.batchData.SelectAll', function () {
      scope.updateIsSelectedOnBatchForEntireBatch = jasmine.createSpy('updateIsSelectedOnBatchForEntireBatch');
      scope.batchData = {
        SelectAll: true,
        Rows: [{ IsSelectedOnBatch: false }, { IsSelectedOnBatch: false }],
        BatchStatement: { BatchStatementId: 'bogus' },
      };
      scope.toggleAll();
      angular.forEach(scope.batchData.Rows, function (row) {
        expect(row.IsSelectedOnBatch).toEqual(true);
      });
      expect(scope.updateIsSelectedOnBatchForEntireBatch).toHaveBeenCalled();
    });
    it('Should set all row selected status to match scope.selectall', function () {
      scope.updateIsSelectedOnBatchForEntireBatch = jasmine.createSpy('updateIsSelectedOnBatchForEntireBatch');
      scope.batchData = {
        SelectAll: false,
        Rows: [{ IsSelectedOnBatch: true }, { IsSelectedOnBatch: false }],
        BatchStatement: { BatchStatementId: 'bogus' },
      };
      scope.toggleAll();

      angular.forEach(scope.batchData.Rows, function (row) {
        expect(row.IsSelectedOnBatch).toEqual(false);
      });
      expect(scope.updateIsSelectedOnBatchForEntireBatch).toHaveBeenCalled();
    });
    it('Should not set all row selected status to match scope.selectall when show alert accounts is checked', function () {
      scope.showOnlyFaultedAccount = true;
      scope.batchData = {
        SelectAll: true,
        Rows: [{ IsSelectedOnBatch: false, ValidationMessages: [] }, { IsSelectedOnBatch: false, ValidationMessages: ['some alert'] }],
        BatchStatement: { BatchStatementId: 'bogus' },
      };
      scope.toggleAll();

      angular.forEach(scope.batchData.Rows, function (row) {
        if (row.ValidationMessages.length) {
          expect(row.IsSelectedOnBatch).toEqual(true);
        } else {
          expect(row.IsSelectedOnBatch).toEqual(false);
        }
      });
      expect(batchStatementService.Service.updateIsSelectedOnBatchForEntireBatch).toHaveBeenCalledWith(Object({ batchStatementId: 'bogus', isSelected: true, onlyUpdateStatementsWithAlerts: true }), ctrl.isSelectedOnBatchSuccess, ctrl.isSelectedOnBatchFailure);
    });
  });

  describe('ctrl.updatePdf -> ', function () {
    it('Should set Due Date to null if DueUponReceipt', function () {
      var row = {
        DueUponReceipt: true,
        DueDate: 'Date',
        showPdf: true,
      };
      scope.batchData = {
        BatchStatement: {
          IsProcessed: false,
        },
      };
      scope.updatePdf(row);
      expect(row.DueDate).toEqual(null);
      expect(
        batchStatementService.GetSingleStatementPdfFromSettings.calls.count()
      ).toBe(1);
    });

    it('Should set Due Date if DueUponReceipt', function () {
      var dueDate = moment();
      var row = {
        DueUponReceipt: false,
        DueDate: dueDate,
      };
      scope.updatePdf(row);
      expect(row.DueDate).not.toEqual(null);
      expect(
        batchStatementService.GetSingleStatementPdfFromSettings.calls.count()
      ).toBe(0);
    });

    it('Should call ConfirmModal when account does not receive finance charges but one is manually added', function () {
      var row = {
        AccountReceivesFinanceCharges: false,
        ApplyFinanceCharge: true,
        OriginalApplyFinanceCharge: false,
      };
      scope.updatePdf(row);
      expect(modalFactory.ConfirmModal).toHaveBeenCalled();
    });
  });

  describe('ctrl.togglePdf -> ', function () {
    it('Should call for pdf if showPdf is true', function () {
      var row = {
        showPdf: true,
      };
      scope.batchData = {
        BatchStatement: {
          IsProcessed: false,
        },
      };
      scope.updatePdf(row);
      expect(
        batchStatementService.GetSingleStatementPdfFromSettings.calls.count()
      ).toBe(1);
    });

    it('Should not call for pdf if showPdf is true', function () {
      var row = {
        showPdf: false,
      };
      scope.updatePdf(row);
      expect(
        batchStatementService.GetSingleStatementPdfFromSettings.calls.count()
      ).toBe(0);
    });
  });

  describe('$scope.viewReport -> ', function () {
    it('should call tablauncher when user has access', function () {
      scope.viewReport({ UserHasAccess: true, BatchStatementReports: {} });
      expect(tabLauncher.launchNewTab).toHaveBeenCalled();
    });
    it('should not call tablauncher when user does not have access', function () {
      scope.viewReport({ BatchStatementReports: {} });
      expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
    });
  });
  describe('ctrl.getSingleSavedBatchCallSetup -> ', function () {
    it('Should set batchStatementService.Service.getBatchGrid in Services object when practiceSettings has IsEStatementV3Enabled as true', function () {
      scope.showNotProcessedSavedBatches = false;
      scope.batchStatementId = 'fake';
      var services = ctrl.getSingleSavedBatchCallSetup(true);
      expect(services[0].Call).toEqual(
        batchStatementService.Service.getBatchGrid
      );
      expect(services[0].Params.BatchStatement.BatchStatementId).toEqual(
        'fake'
      );
    });
  });
  describe('$scope.retryBatchModal -> ', function () {
    it('Should set message for Partial Failure when Status is 5 and one location is failed with Location Status 3.', function () {
      mockRetryMessage =
        'Your attempt to process the statement batch partially failed. The portion for Test (10) was not sent successfully.  Would you like to make another attempt to send the failed portion?';
      scope.showNotProcessedSavedBatches = false;
      var row = {
        Status: 5,
        SubmissionMethod: 'Electronic',
        AccountStatementForLocations: [
          {
            LocationId: 1,
            LocationStatus: 3,
            NumberOfStatementsPerLocation: 10,
          },
        ],
      };
      scope.locations = {
        masterLocations: [
          {
            LocationId: 1,
            NameLine1: 'Test',
            NameAbbreviation: 'Test',
            LocationStatus: 'Active',
          },
        ],
      };
      scope.retryBatchModal(row);
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Statement Processing',
        mockRetryMessage,
        'Yes',
        'No'
      );
    });
    it('Should set message for Partial Failure when Status is 5 and one location is failed with Location Status 4.', function () {
      mockRetryMessage =
        'Your attempt to process the statement batch partially failed. The portion for Test (10) was not sent successfully.  Would you like to make another attempt to send the failed portion?';
      scope.showNotProcessedSavedBatches = false;
      var row = {
        Status: 5,
        SubmissionMethod: 'Electronic',
        AccountStatementForLocations: [
          {
            LocationId: 1,
            LocationStatus: 4,
            NumberOfStatementsPerLocation: 10,
          },
        ],
      };
      scope.locations = {
        masterLocations: [
          {
            LocationId: 1,
            NameLine1: 'Test',
            NameAbbreviation: 'Test',
            LocationStatus: 'Active',
          },
        ],
      };
      scope.retryBatchModal(row);
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Statement Processing',
        mockRetryMessage,
        'Yes',
        'No'
      );
    });
    it('Should set message for Partial Failure when Status is 5 and one location is failed with Location Status 6.', function () {
      mockRetryMessage =
        'Your attempt to process the statement batch partially failed. The portion for Test (10) was not sent successfully.  Would you like to make another attempt to send the failed portion?';
      scope.showNotProcessedSavedBatches = false;
      var row = {
        Status: 5,
        SubmissionMethod: 'Electronic',
        AccountStatementForLocations: [
          {
            LocationId: 1,
            LocationStatus: 6,
            NumberOfStatementsPerLocation: 10,
          },
        ],
      };
      scope.locations = {
        masterLocations: [
          {
            LocationId: 1,
            NameLine1: 'Test',
            NameAbbreviation: 'Test',
            LocationStatus: 'Active',
          },
        ],
      };
      scope.retryBatchModal(row);
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Statement Processing',
        mockRetryMessage,
        'Yes',
        'No'
      );
    });
    it('Should set message for Partial Failure when Status is 5 and more than 1 locations are failed with location status 3,4 and 6.', function () {
      mockRetryMessage =
        'Your attempt to process the statement batch partially failed. The portions for Apollo (10), Navetor (5), Test (7) were not sent successfully.  Would you like to make another attempt to send the failed portions?';
      scope.showNotProcessedSavedBatches = false;
      var row = {
        Status: 5,
        SubmissionMethod: 'Electronic',
        AccountStatementForLocations: [
          {
            LocationId: 1,
            LocationStatus: 3,
            NumberOfStatementsPerLocation: 10,
          },
          {
            LocationId: 2,
            LocationStatus: 4,
            NumberOfStatementsPerLocation: 5,
          },
          {
            LocationId: 3,
            LocationStatus: 6,
            NumberOfStatementsPerLocation: 7,
          },
        ],
      };
      scope.locations = {
        masterLocations: [
          {
            LocationId: 1,
            NameLine1: 'Apollo',
            NameAbbreviation: 'Apollo',
            LocationStatus: 'Active',
          },
          {
            LocationId: 2,
            NameLine1: 'Navetor',
            NameAbbreviation: 'Navetor',
            LocationStatus: 'Active',
          },
          {
            LocationId: 3,
            NameLine1: 'Test',
            NameAbbreviation: 'Test',
            LocationStatus: 'Active',
          },
        ],
      };
      scope.retryBatchModal(row);
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Statement Processing',
        mockRetryMessage,
        'Yes',
        'No'
      );
    });
  });

  describe('ctrl.allSelectedLocationsHaveEstatementsEnrolled', function () {
    beforeEach(function () {
      locationServices.getLocationEstatementEnrollmentStatus.calls.reset();
      locationServices.getLocationEstatementEnrollmentStatus.and.callFake(
        function (value) {
          return value.locationId <= 2
            ? { $promise: Promise.resolve({ Result: true }) }
            : { $promise: Promise.resolve({ Result: false }) };
        }
      );
    });

    it('Should return true if all locations have eStatements enrolled', function (done) {
      var statements = [
        { LocationId: 1, IsSelectedOnBatch: true },
        { LocationId: 1, IsSelectedOnBatch: true },
        { LocationId: 2, IsSelectedOnBatch: true },
        { LocationId: 3, IsSelectedOnBatch: false }, // disabled
      ];
      ctrl
        .allSelectedLocationsHaveEstatementsEnrolled(statements)
        .then(function (result) {
          expect(result).toBe(true);
          // check that the request is made for each location only once
          expect(
            locationServices.getLocationEstatementEnrollmentStatus
          ).toHaveBeenCalledTimes(2);
          done();
        });
    });

    it('Should return false if all locations do not have eStatements enrolled', function (done) {
      var statements = [
        { LocationId: 1, IsSelectedOnBatch: true },
        { LocationId: 1, IsSelectedOnBatch: true },
        { LocationId: 2, IsSelectedOnBatch: false },
        { LocationId: 3, IsSelectedOnBatch: true }, // disabled
      ];
      ctrl
        .allSelectedLocationsHaveEstatementsEnrolled(statements)
        .then(function (result) {
          expect(result).toBe(false);
          // check that the request is made for each location only once
          expect(
            locationServices.getLocationEstatementEnrollmentStatus
          ).toHaveBeenCalledTimes(2);
          done();
        });
    });
  });

  describe('scope.alertBatchFailure', function() {
    it ('should set the flags correctly', function() {
      scope.alertBatchFailure();

      expect(scope.isViewingASavedBatch).toBe(false);
      expect(scope.savedBatchIsProcessed).toBe(false);
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith('Statement Submission Failure', 
        'This statement batch cannot be processed because one or more of the statements has missing information.  Please check the alerts, make corrections or remove statements with alerts and try again.',
        'OK');
    });
  });

  describe('ctrl.getSelectedStatementsWithAlertsCountSuccess', function () {

    beforeEach(function () {
      scope.alertBatchFailure = jasmine.createSpy('alertBatchFailure');
      scope.sendNow = jasmine.createSpy('sendNow');
      scope.create = jasmine.createSpy('create');
    });

    it('should alert a batch failure when count > 0', function () {
      var res = { Value: 1 };
      ctrl.getSelectedStatementsWithAlertsCountSuccess(res);
      expect(scope.alertBatchFailure).toHaveBeenCalled();
      expect(scope.sendNow).not.toHaveBeenCalled();
      expect(scope.create).not.toHaveBeenCalled();
    });

    it('should alert a batch failure when not available for processing', function () {
      var res = { Value: 0 };
      scope.isAvailableforProcessing = false;
      ctrl.getSelectedStatementsWithAlertsCountSuccess(res);
      expect(scope.alertBatchFailure).toHaveBeenCalled();
      expect(scope.sendNow).not.toHaveBeenCalled();
      expect(scope.create).not.toHaveBeenCalled();
    });

    it('should call #scope.sendNow', function () {
      var res = { Value: 0 };
      scope.isAvailableforProcessing = true;
      scope.isEstatementsEnabled = true;
      ctrl.getSelectedStatementsWithAlertsCountSuccess(res);
      expect(scope.alertBatchFailure).not.toHaveBeenCalled();
      expect(scope.sendNow).toHaveBeenCalled();
      expect(scope.create).not.toHaveBeenCalled();
    });

    it('should call $scope.create', function () {
      var res = { Value: 0 };
      scope.isAvailableforProcessing = true;
      scope.isEstatementsEnabled = false;
      ctrl.getSelectedStatementsWithAlertsCountSuccess(res);
      expect(scope.alertBatchFailure).not.toHaveBeenCalled();
      expect(scope.sendNow).not.toHaveBeenCalled();
      expect(scope.create).toHaveBeenCalled();
    });

  });

});
