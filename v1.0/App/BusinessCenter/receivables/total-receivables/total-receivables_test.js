describe('total-receivables ->', function () {
  var scope,
    filter,
    sce,
    location,
    toastrFactory,
    listHelper,
    receivablesServiceMock,
    receivablesTabServiceMock,
    featureServiceMock,
    receivablesGridFactory,
    gridPrintFactory,
    patientServices,
    locationServices,
    timezoneFactory,
    localize,
    q,
    deferred,
    ctrl;

  // #region Setup

  var mockCurrentPatient = {
    AccountId: '54DA8622-8399-4C96-9978-2880963EB0D5',
    Value: {
      PersonAccount: {
        AccountId: '54DA8622-8399-4C96-9978-2880963EB0D5',
      },
    },
  };

  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function (
    $rootScope,
    $filter,
    $sce,
    $controller,
    $q,
    $window,
    $location
  ) {
    scope = $rootScope.$new();
    sce = $sce;
    filter = $filter;

    location = $location;
    location.$$absUrl =
      'https://localhost:35312/v1.0/index.html#/BusinessCenter/Receivables';

    q = $q;
    deferred = q.defer();

    toastrFactory = {
      success: jasmine.createSpy(),
      error: jasmine.createSpy(),
    };
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    patientServices = {
      Patient: mockCurrentPatient,
      AccountStatements: {
        GetAccountStatementByAccountId: function () {},
      },
      AccountStatementSettings: {
        GetAccountStatementPdf: jasmine
          .createSpy('AccountStatementSettings.GetAccountStatementPdf')
          .and.callFake(function () {
            return {
              then: function () {
                return '';
              },
            };
          }),
      },
    };

    locationServices = {
      getPermittedLocations: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    receivablesServiceMock = {
      getTotalBalance: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
      getTotalBalanceByLocation: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
      getGridTotals: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    receivablesTabServiceMock = {
      getData: jasmine
        .createSpy()
        .and.returnValue({ $promise: deferred.promise }),
    };

    featureServiceMock = {
      isEnabled: jasmine.createSpy().and.returnValue(q.when()),
    };

    receivablesGridFactory = {
      getOptions: jasmine.createSpy().and.callFake(function () {
        return {
          updateOnInit: true,
          query: {},
          pageSize: 20,
          actions: {},
          successAction: jasmine.createSpy(),
          updateFilter: jasmine.createSpy(),
          failAction: jasmine.createSpy(),
          additionalFilters: [],
          columnDefinition: [],
          refresh: jasmine.createSpy(),
        };
      }),
    };

    gridPrintFactory = {
      CreateOptions: jasmine.createSpy().and.callFake(function () {
        return {
          query: {},
          filterCriteria: [],
          sortCriteria: [],
          columnDefinition: [],
          locations: [],
          headerCaption: '',
          getPrintHtml: jasmine.createSpy(),
        };
      }),
    };

    timezoneFactory = {
      GetTimeZoneAbbr: jasmine.createSpy(),
    };

    ctrl = $controller('TotalReceivablesController', {
      $scope: scope,
      $filter: filter,
      $sce: sce,     
      $location: location,
      localize: localize,
      ListHelper: listHelper,
      ReceivablesService: receivablesServiceMock,
      toastrFactory: toastrFactory,
      ReceivablesTabService: receivablesTabServiceMock,
      ReceivablesGridFactory: receivablesGridFactory,
      PatientServices: patientServices,
      LocationServices: locationServices,
      GridPrintFactory: gridPrintFactory,
      TimeZoneFactory: timezoneFactory,
      FeatureService: featureServiceMock,
      userSettingsDataService: {
        isNewNavigationEnabled: function () {
          return false;
        },
      },
    });
  }));

  // #endregion

  // #region Tests

  describe('initial values ->', function () {
    it('ReceivablesController : should check if controller exists', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl).not.toBeUndefined();
    });

    it('locationServices.getPermittedLocations: should have been called', function () {
      ctrl.getLocations();
      expect(locationServices.getPermittedLocations).toHaveBeenCalled();
    });

    it('ctrl.factories : should not be null and undefined', function () {
      expect(receivablesGridFactory.getOptions).toHaveBeenCalled();
      expect(receivablesGridFactory.getOptions.calls.count()).toEqual(6);

      expect(ctrl.factories.allAccountsFactory).not.toBeNull();
      expect(ctrl.factories.balanceCurrentFactory).not.toBeNull();
      expect(ctrl.factories.balance30Factory).not.toBeNull();
      expect(ctrl.factories.balance60Factory).not.toBeNull();
      expect(ctrl.factories.balance90Factory).not.toBeNull();
      expect(ctrl.factories.inCollectionsFactory).not.toBeNull();
    });

    it('receivablesAllAccountsGridOptions: should not be null and undefined', function () {
      var data = {
        totalCount: 5,
        dto: {
          TotalBalance: 100.0,
        },
      };
      scope.receivablesAllAccountsGridOptions.successAction(data);
      expect(scope.receivablesTab.allAccountsCount).toBe(5);
      expect(scope.receivablesTab.allAccountsBalance).toBe(100.0);

      expect(scope.receivablesAllAccountsGridOptions).not.toBeNull();
      expect(
        scope.receivablesAllAccountsGridOptions.actions.navToLastStatement
      ).toEqual(scope.navToLastStatement);
      expect(
        scope.receivablesAllAccountsGridOptions.actions.navToPatientProfile
      ).toEqual(scope.navToPatientProfile);
    });

    it('receivablesBalanceCurrentGridOptions: should not be null and undefined', function () {
      var data = {
        totalCount: 1,
        dto: {
          TotalBalance: 20.0,
        },
      };
      scope.receivablesBalanceCurrentGridOptions.successAction(data);
      expect(scope.receivablesTab.balanceCurrentCount).toBe(1);
      expect(scope.receivablesTab.balanceCurrent).toBe(20.0);

      expect(scope.receivablesBalanceCurrentGridOptions).not.toBeNull();
      expect(
        scope.receivablesBalanceCurrentGridOptions.actions.navToLastStatement
      ).toEqual(scope.navToLastStatement);
      expect(
        scope.receivablesBalanceCurrentGridOptions.actions.navToPatientProfile
      ).toEqual(scope.navToPatientProfile);
    });

    it('receivablesBalance30GridOptions: should not be null and undefined', function () {
      var data = {
        totalCount: 1,
        dto: {
          TotalBalance: 20.0,
        },
      };
      scope.receivablesBalance30GridOptions.successAction(data);
      expect(scope.receivablesTab.balance30Count).toBe(1);
      expect(scope.receivablesTab.balance30).toBe(20.0);

      expect(scope.receivablesBalance30GridOptions).not.toBeNull();
      expect(
        scope.receivablesBalance30GridOptions.actions.navToLastStatement
      ).toEqual(scope.navToLastStatement);
      expect(
        scope.receivablesBalance30GridOptions.actions.navToPatientProfile
      ).toEqual(scope.navToPatientProfile);
    });

    it('receivablesBalance60GridOptions: should not be null and undefined', function () {
      var data = {
        totalCount: 1,
        dto: {
          TotalBalance: 20.0,
        },
      };
      scope.receivablesBalance60GridOptions.successAction(data);
      expect(scope.receivablesTab.balance60Count).toBe(1);
      expect(scope.receivablesTab.balance60).toBe(20.0);

      expect(scope.receivablesBalance60GridOptions).not.toBeNull();
      expect(
        scope.receivablesBalance60GridOptions.actions.navToLastStatement
      ).toEqual(scope.navToLastStatement);
      expect(
        scope.receivablesBalance60GridOptions.actions.navToPatientProfile
      ).toEqual(scope.navToPatientProfile);
    });

    it('receivablesBalance90GridOptions: should not be null and undefined', function () {
      var data = {
        totalCount: 1,
        dto: {
          TotalBalance: 20.0,
        },
      };
      scope.receivablesBalance90GridOptions.successAction(data);
      expect(scope.receivablesTab.balance90Count).toBe(1);
      expect(scope.receivablesTab.balance90).toBe(20.0);

      expect(scope.receivablesBalance90GridOptions).not.toBeNull();
      expect(
        scope.receivablesBalance90GridOptions.actions.navToLastStatement
      ).toEqual(scope.navToLastStatement);
      expect(
        scope.receivablesBalance90GridOptions.actions.navToPatientProfile
      ).toEqual(scope.navToPatientProfile);
    });

    it('receivablesInCollectionsGridOptions: should not be null and undefined', function () {
      var data = {
        totalCount: 1,
        dto: {
          TotalBalance: 20.0,
        },
      };
      scope.receivablesInCollectionsGridOptions.successAction(data);
      expect(scope.receivablesTab.inCollectionsCount).toBe(1);
      expect(scope.receivablesTab.inCollections).toBe(20.0);

      expect(scope.receivablesInCollectionsGridOptions).not.toBeNull();
      expect(
        scope.receivablesInCollectionsGridOptions.actions.navToLastStatement
      ).toEqual(scope.navToLastStatement);
      expect(
        scope.receivablesInCollectionsGridOptions.actions.navToPatientProfile
      ).toEqual(scope.navToPatientProfile);
    });

    it('$scope.currentTab: should be all Accounts', function () {
      expect(scope.currentTab).toBe('allAccounts');
    });
  });

  describe('ctrl.getLocationsSuccess ->', function () {
    it('should set scope.locations', function () {
      ctrl.userLocation = { id: 1, NameLine1: 'Location 1' };
      var result = {};
      result.Value = [
        { LocationId: 1, NameLine1: 'Location 1' },
        { LocationId: 2, NameLine1: 'Location 2' },
      ];

      ctrl.getLocationSuccess(result);

      expect(scope.locations.masterLocations.length).toEqual(3);
      expect(scope.locations.selectedLocations.length).toEqual(1);
    });
  });

  describe('$scope.updateContents ->', function () {
    it('should refresh values', function () {
      scope.locations.masterLocations = [
        { LocationId: 1, NameLine1: 'Location 1', Selected: true },
      ];

      scope.filteredByLocation = false;
      scope.currentTab = 'allAccounts';
      scope.updateContents();

      expect(receivablesServiceMock.getTotalBalance).toHaveBeenCalled();

      expect(
        scope.receivablesAllAccountsGridOptions.updateFilter
      ).toHaveBeenCalled();
      expect(
        scope.receivablesAllAccountsGridOptions.refresh
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalanceCurrentGridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance30GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance60GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance90GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesInCollectionsGridOptions.updateFilter
      ).toHaveBeenCalled();
    });
  });

  describe('$scope.navToPatientProfile function ->', function () {
    it('should set path to navigate to patient profile', function () {
      var personId = 123;
      
      scope.navToPatientProfile(personId);
      expect(location.$$absUrl).toBe(
        'https://localhost:35312/v1.0/index.html#/BusinessCenter/Receivables'
      );

      expect(_tabLauncher_.launchNewTab).toHaveBeenCalled();
    });
  });

  describe('ctrl.accountStatementPdfSuccess ->', function () {
    it('should have pdfContent', function () {
      var res = {
        data: '\x45\x6e\x63\x6f',
      };
      spyOn(window, 'open');
      ctrl.accountStatementPdfSuccess(res);
      expect(scope.pdfContent).toBeDefined();
    });
  });

  describe('ctrl.accountStatementPdfFailure function ->', function () {
    it('should handle error callback when account statement pdf service fails to return data', function () {
      var error = {
        data: {
          InvalidProperties: [{ ValidationMessage: 'Error' }],
        },
      };
      ctrl.accountStatementPdfFailure(error);
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });

  describe('$scope.activateTab function ->', function () {
    it('should activate All Accounts tab', function () {
      var event = {
        currentTarget: {
          id: 'allAccounts',
        },
      };
      scope.filteredByLocation = false;
      scope.activateTab(event);

      expect(
        scope.receivablesAllAccountsGridOptions.refresh
      ).toHaveBeenCalled();
      expect(scope.currentTab).toEqual(event.currentTarget.id);
    });
  });

  describe('$scope.applyFilters ->', function () {
    it('should apply Accounts with No Pending Insurance to the grids', function () {
      scope.currentTab = 'allAccounts';
      scope.filteredByLocation = false;

      var filters = [{ Name: 'Accounts with No Pending Insurance' }];
      scope.applyFilters(filters);

      expect(
        scope.receivablesAllAccountsGridOptions.updateFilter
      ).toHaveBeenCalled();
      expect(
        scope.receivablesAllAccountsGridOptions.refresh
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalanceCurrentGridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance30GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance60GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance90GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesInCollectionsGridOptions.updateFilter
      ).toHaveBeenCalled();
    });
  });

  describe('$scope.resetFilters ->', function () {
    it('should reset all additional filters to the grid', function () {
      scope.currentTab = 'allAccounts';
      scope.filteredByLocation = false;
      scope.resetFilters();

      expect(
        scope.receivablesAllAccountsGridOptions.updateFilter
      ).toHaveBeenCalled();
      expect(
        scope.receivablesAllAccountsGridOptions.refresh
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalanceCurrentGridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance30GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance60GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesBalance90GridOptions.updateFilter
      ).toHaveBeenCalled();

      expect(
        scope.receivablesInCollectionsGridOptions.updateFilter
      ).toHaveBeenCalled();
    });
  });

  // Print Grid
  describe('printGrid function ->', function () {
    beforeEach(function () {
      var html1 = '<div id="gridTotals"></div>';
      angular.element(document.body).append(html1);
      var html2 = '<div id="tabTiles"></div>';
      angular.element(document.body).append(html2);
    });
    it('should print All Accounts', function () {
      scope.receivablesAllAccountsDto = {
        FilterCriteria: [],
        SortCriteria: [],
      };
      scope.masterLocationsSelected = [];
      scope.currentTab = 'allAccounts';

      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.allAccountsPrint.headerCaption).toEqual(
        'Receivables All Accounts'
      );
    });
    it('should print 0-30 Days', function () {
      scope.receivablesBalanceCurrentDto = {
        FilterCriteria: [],
        SortCriteria: [],
      };
      scope.masterLocationsSelected = [];
      scope.currentTab = 'balanceCurrent';

      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.balanceCurrentPrint.headerCaption).toEqual(
        'Receivables 0-30 Days'
      );
    });
    it('should print 31-60 Days', function () {
      scope.receivablesBalance30Dto = {
        FilterCriteria: [],
        SortCriteria: [],
      };
      scope.masterLocationsSelected = [];
      scope.currentTab = 'balance30';

      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.balance30Print.headerCaption).toEqual(
        'Receivables 31-60 Days'
      );
    });
    it('should print 61-90 Days', function () {
      scope.receivablesBalance60Dto = {
        FilterCriteria: [],
        SortCriteria: [],
      };
      scope.masterLocationsSelected = [];
      scope.currentTab = 'balance60';

      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.balance60Print.headerCaption).toEqual(
        'Receivables 61-90 Days'
      );
    });
    it('should print 90+ Days', function () {
      scope.receivablesBalance90Dto = {
        FilterCriteria: [],
        SortCriteria: [],
      };
      scope.masterLocationsSelected = [];
      scope.currentTab = 'balance90';

      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.balance90Print.headerCaption).toEqual('Receivables 90+ Days');
    });
    it('should print In Collections', function () {
      scope.receivablesInCollectionsDto = {
        FilterCriteria: [],
        SortCriteria: [],
      };
      scope.masterLocationsSelected = [];
      scope.currentTab = 'inCollections';

      scope.printGrid();
      expect(gridPrintFactory.CreateOptions).toHaveBeenCalled();
      expect(ctrl.inCollectionsPrint.headerCaption).toEqual(
        'Receivables In Collections'
      );
    });
  });
  // #endregion
});
