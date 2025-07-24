describe('report-page-controller ->', function () {
  var ctrl,
    scope,
    localize,
    location,
    routeParams,
    reportsFactory,
    toastrFactory,
    patSecurityService,
    window,
    timeout,
    reportIds,
    initialData,
    q,
    filter,
    compile,
    compileProvider,
    deferred,
    featureFlagService,
    fuseFlag;

  toastrFactory = {
    success: jasmine.createSpy(),
    error: jasmine.createSpy(),
  };

  routeParams = {
    ReportName: 'AdjustmentsByType',
  };

  window = {
    print: jasmine.createSpy(),
  };

  var requestBodyProperties = [
    {
      Name: 'LocationIds',
      DisplayAs: 'Location',
      DataType: 'Location[]',
      DisplayOrder: 1,
      IsRequired: true,
    },
    {
      Name: 'ProviderUserIds',
      DisplayAs: 'Providers',
      DataType: 'ProviderUserId[]',
      DisplayOrder: 2,
      IsRequired: true,
    },
    {
      Name: 'StartDate',
      DisplayAs: 'Start Date',
      DataType: 'Date',
      DisplayOrder: 3,
      IsRequired: true,
    },
    {
      Name: 'EndDate',
      DisplayAs: 'End Date',
      DataType: 'Date',
      DisplayOrder: 4,
      IsRequired: true,
    },
    {
      Name: 'NegativeAdjustmentTypeIds',
      DisplayAs: 'Negative Adjustment Types',
      DataType: 'NegativeAdjustmentTypeId[]',
      DisplayOrder: 5,
      IsRequired: true,
    },
    {
      Name: 'PositiveAdjustmentTypeIds',
      DisplayAs: 'Positive Adjustment Types',
      DataType: 'PositiveAdjustmentTypeId[]',
      DisplayOrder: 6,
      IsRequired: true,
    },
    {
      Name: 'ImpactionTypes',
      DisplayAs: 'Impaction Types',
      DataType: 'ImpactionType[]',
      DisplayOrder: 7,
      IsRequired: true,
    },
    {
      Name: 'ViewTransactionsBy',
      DisplayAs: 'View Transactions By',
      DataType: 'ViewTransactionsBy',
      DisplayOrder: 8,
      IsRequired: true,
    },
    {
      Name: 'PatientGroupTypeIds',
      DisplayAs: 'Patient Group Types',
      DataType: 'PatientGroupTypeId[]',
      DisplayOrder: 9,
      IsRequired: false,
    },
  ];

  var reportId = 60;

  var presetFilter = {
    PresetFilterDto: {
      EndDate: '2019-01-30T18:30:00.000Z',
      LocationIds: [1],
      StartDate: '2018-12-31T18:30:00.000Z',
      PatientStatus: [1, 2, 3],
      ProviderTypes: ['Hygienist'],
      NegativeAdjustmentTypeIds: [],
      PositiveAdjustmentTypeIds: ['00000000-0000-0000-0000-000000000000'],
    },
  };

  var reportAmfa = 'soar-report-fin-adjbyt';

  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      reportsFactory = {
        GetReportPath: jasmine
          .createSpy()
          .and.returnValue('/BusinessCenter/Reports/AdjustmentsByType'),

        GetRequestBodyProperties: jasmine
          .createSpy()
          .and.returnValue(requestBodyProperties),

        GetReportId: jasmine.createSpy().and.returnValue(reportId),

        GetReportContext: jasmine.createSpy().and.returnValue(presetFilter),

        ClearReportContext: jasmine.createSpy().and.callFake(function () {
          var clearReportContext = q.defer();
          clearReportContext.resolve(true);
          return {
            result: clearReportContext.promise,
            then: function () {},
          };
        }),

        AddPrintedReportActivityEvent: jasmine
          .createSpy()
          .and.callFake(function () {
            var addPrintedReportActivityEvent = q.defer();
            addPrintedReportActivityEvent.resolve(1);
            return {
              result: addPrintedReportActivityEvent.promise,
              then: function () {},
            };
          }),

        GetAmfa: jasmine.createSpy().and.returnValue(reportAmfa),

        GetNavigationFrom: jasmine.createSpy().and.returnValue(false),

        GenerateReport: jasmine.createSpy().and.callFake(function () {
          var generateReport = q.defer();
          generateReport.resolve(1);
          return {
            result: generateReport.promise,
            then: function () {},
          };
        }),
      };

      timeout = jasmine.createSpy();

      patSecurityService = {
        IsAuthorizedByAbbreviation: jasmine
          .createSpy()
          .and.callFake(function () {
            var isAuthorizedByAbbreviation = q.defer();
            isAuthorizedByAbbreviation.resolve(true);
            return {
              result: isAuthorizedByAbbreviation.promise,
              then: function () {},
            };
          }),

        IsAuthorizedByAbbreviationAtLocation: jasmine
          .createSpy()
          .and.callFake(function () {
            var isAuthorizedByAbbreviationAtLocation = q.defer();
            isAuthorizedByAbbreviationAtLocation.resolve(true);
            return {
              result: isAuthorizedByAbbreviationAtLocation.promise,
              then: function () {},
            };
          }),
      };

      reportIds = {
        ActivityLogReportId: 24,
        AdjustmentsByProviderReportId: 22,
        AdjustmentsByTypeReportId: 60,
        AppointmentTimeElapsedReportId: 46,
        AppointmentsReportId: 41,
        CarrierProductivityAnalysisDetailedReportId: 35,
        CarrierProductivityAnalysisReportId: 33,
        CarriersReportId: 9,
        CollectionsAtCheckoutReportId: 42,
        CollectionsByServiceDateReportId: 47,
        DailyProductionCollectionSummaryReportId: 53,
        DaySheetReportId: 19,
        DeletedTransactionsReportId: 32,
        EncountersByFeeScheduleReportId: 48,
        FeeExceptionsReportId: 26,
        FeeScheduleAnalysisByCarrier: 37,
        FeeScheduleMasterReportId: 11,
        MedicalHistoryFormAnswersReportId: 59,
        NetCollectionByProviderReportId: 23,
        NetProductionByProviderReportId: 21,
        NewPatientsByComprehensiveExamReportId: 16,
        NewPatientsSeenReportId: 49,
        PatientAnalysisReportId: 58,
        PatientAnalysisBetaReportId: 66,
        PatientsByAdditionalIdentifiersReportId: 13,
        PatientsByBenfitPlansReportId: 6,
        PatientsByDiscountReportId: 3,
        PatientsByFeeScheduleReportId: 7,
        PatientsByFlagsReportId: 52,
        PatientsByLastServiceDateReportId: 57,
        PatientsByMedicalHistoryAlertsReportId: 55,
        PatientsByPatientGroupsReportId: 51,
        PatientsSeenReportId: 14,
        PatientsWithPendingEncountersReportId: 8,
        PatientsWithRemainingBenefitsReportId: 40,
        PaymentReconciliationReportId: 50,
        PendingClaimsReportId: 36,
        PerformanceByProviderDetailsReportId: 18,
        PerformanceByProviderSummaryReportId: 1,
        PeriodReconciliationReportId: 45,
        ProductionExceptionsReportId: 30,
        ProjectedNetProductionReportId: 56,
        ProposedTreatmentReportId: 61,
        ProviderServiceHistoryReportId: 29,
        ReceivablesByProviderReportId: 54,
        ReferralSourcesProductivityDetailedReportId: 39,
        ReferralSourcesProductivitySummaryReportId: 43,
        ReferredPatientsReportId: 15,
        ServiceCodeFeesByFeeScheduleReportId: 25,
        ServiceCodeFeesByLocationReportId: 12,
        ServiceCodeProductivityByProviderReportId: 20,
        ServiceCodeByServiceTypeProductivityReportId: 17,
        ServiceHistoryReportId: 27,
        ServiceTransactionsWithDiscountsReportId: 44,
        ServiceTypeProductivityReportId: 31,
        TreatmentPlanPerformanceReportId: 34,
        TreatmentPlanProviderReconciliationReportId: 38,
        UnassignedUnappliedCreditsReportId: 28,
        CreditDistributionHistoryReportId: 64,
        PotentialDuplicatePatientsReportId: 65,
        ReferralSourcesProductivityDetailedBetaReportId: 113,
        PaymentReconciliationBetaReportId: 114,
        ReceivablesByAccountBetaId: 115,
        PaymentLocationReconciliationBetaReportId:116,
        ProjectedNetProductionBetaReportId: 102,
        ReferredPatientsBetaReportId: 120,
        AppointmentsBetaReportId: 122,
        CreditDistributionHistoryBetaReportId: 123,
        ProposedTreatmentBetaReportId: 124,
        ServiceCodeByServiceTypeProductivityBetaReportId: 127,
        AccountWithOffsettingProviderBalancesBetaReportId: 128,
        ServiceCodeProductivityByProviderBetaReportId: 129,
      };

      initialData = {
        ReferralTypes: {
          Value: [
            { Id: 1, Name: 'Other', Order: 1 },
            { Id: 2, Name: 'Person', Order: 2 },
          ],
        },
      };
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $injector, $q, $filter) {
    q = $q;
    filter = $filter;
    timeout = $injector.get('$timeout');

    localize = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (val) {
          return val;
        }),
    };

    //mock for location
    location = {
      path: jasmine.createSpy('location.path'),
      $$path: {
        substr: jasmine.createSpy(),
        indexOf: jasmine.createSpy(),
      },
    };

    featureFlagService = {
        getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    fuseFlag = {
        ReportReceivablesByProvider: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
    };

    scope = $rootScope.$new();
    ctrl = $controller('ReportPageController', {
      $scope: scope,
      localize: localize,
      $location: location,
      $routeParams: routeParams,
      ReportsFactory: reportsFactory,
      toastrFactory: toastrFactory,
      patSecurityService: patSecurityService,
      $timeout: timeout,
      $window: window,
      ReportIds: reportIds,
      InitialData: initialData,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
      expect(ctrl.reportPath).toEqual(
        '/BusinessCenter/Reports/AdjustmentsByType'
      );
      expect(scope.requestBodyProperties[0].Name).toEqual('LocationIds');
      expect(scope.requestBodyProperties[8].Name).toEqual(
        'PatientGroupTypeIds'
      );
      expect(scope.reportId).toEqual(60);
      expect(scope.reportAmfa).toEqual('soar-report-fin-adjbyt');
      expect(scope.reportIds).not.toEqual([]);
      expect(scope.getAllRows).toBe(true);
    });

    it('should have injected services ', function () {
      expect(localize).not.toBeNull();
      expect(location).not.toBeNull();
      expect(routeParams).not.toBeNull();
      expect(reportsFactory).not.toBeNull();
      expect(toastrFactory).not.toBeNull();
      expect(patSecurityService).not.toBeNull();
      expect(window).not.toBeNull();
      expect(reportIds).not.toBeNull();
    });
  });

  describe('ctrl.buildBreadCrumbs -> ', function () {
    it('ctrl.buildBreadCrumbs should be called with path', function () {
      ctrl.reportPath = '/BusinessCenter/Reports/AdjustmentsByType';
      ctrl.buildBreadCrumbs(ctrl.reportPath);
      expect(scope.breadcrumbs[0]).toEqual({
        name: ' Business Center',
        path: '/BusinessCenter/',
      });
      expect(scope.breadcrumbs[1]).toEqual({
        name: ' Reports',
        path: '/BusinessCenter/Reports/',
      });
      expect(scope.breadcrumbs[2]).toEqual({
        name: ' Adjustments By Type',
        path: '/BusinessCenter/Reports/AdjustmentsByType/',
      });
    });
  });

  describe('ctrl.deriveTemplateNameFromRoute -> ', function () {
    it('ctrl.deriveTemplateNameFromRoute should be called', function () {
      var result = ctrl.deriveTemplateNameFromRoute();
      expect(result).toEqual('adjustments-by-type.html');
    });
  });

  describe('ctrl.checkIfShowFilterMessage -> ', function () {
    it('ctrl.checkIfShowFilterMessage should be called with reportId 61', function () {
      scope.reportId = 61;
      ctrl.checkIfShowFilterMessage();
      expect(scope.showFilterMessage).toBe(true);
    });

    it('ctrl.checkIfShowFilterMessage should be called with reportId 64', function () {
      scope.reportId = 64;
      ctrl.checkIfShowFilterMessage();
      expect(scope.showFilterMessage).toBe(true);
    });

    it('ctrl.checkIfShowFilterMessage should be called with reportId 4', function () {
      scope.reportId = 4;
      ctrl.checkIfShowFilterMessage();
      expect(scope.showFilterMessage).toBe(false);
    });

    it('ctrl.checkIfShowFilterMessage should be called with reportId 5', function () {
      scope.reportId = 5;
      ctrl.checkIfShowFilterMessage();
      expect(scope.showFilterMessage).toBe(false);
    });

    it('ctrl.checkIfShowFilterMessage should be called with reportId 10', function () {
      scope.reportId = 10;
      ctrl.checkIfShowFilterMessage();
      expect(scope.showFilterMessage).toBe(false);
    });

    it('ctrl.checkIfShowFilterMessage should be called with reportId 2', function () {
      scope.reportId = 2;
      ctrl.checkIfShowFilterMessage();
      expect(scope.showFilterMessage).toBe(false);
    });

    it('ctrl.checkIfShowFilterMessage should be called with reportId 2000', function () {
      scope.reportId = 2000;
      ctrl.checkIfShowFilterMessage();
      expect(scope.showFilterMessage).toBe(false);
    });
  });

  describe('scope.hideDiv -> ', function () {
    it('scope.hideDiv should be called with scope.hideMenu is equals false', function () {
      scope.hideMenu = false;
      var showDefault = false;
      scope.hideDiv(showDefault);
      expect(scope.hideMenu).toBe(true);
      timeout.flush(0);
      expect(scope.slideOutText).toBe('Show Filters');
      expect(scope.columnWidth).toBe('col-md-12');
    });

    it('scope.hideDiv should be called with scope.hideMenu is equals true', function () {
      scope.hideMenu = true;
      var showDefault = false;
      scope.hideDiv(showDefault);
      expect(scope.hideMenu).toBe(false);
      timeout.flush(0);
      expect(scope.slideOutText).toBe('Hide Filters');
      expect(scope.columnWidth).toBe('col-md-9');
    });

    it('scope.hideDiv should be called with showDefault is equals true', function () {
      var showDefault = true;
      scope.hideDiv(showDefault);
      expect(scope.hideMenu).toBe(false);
      timeout.flush(0);
      expect(scope.slideOutText).toBe('Hide Filters');
      expect(scope.columnWidth).toBe('col-md-9');
    });
  });

  describe('ctrl.setDateRangeTitle -> ', function () {
    it('ctrl.setDateRangeTitle should be called with valid StartDate and EndDate', function () {
      var currentDate = new Date();
      var firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      scope.dateFilterList = [
        {
          EndDate: currentDate,
          EndDateName: 'EndDate',
          FilterDtoEndDate: currentDate,
          FilterDtoStartDate: firstDayOfMonth,
          FilterId: 'DateRange',
          FilterString: '02/01/2019 - 02/22/2019',
          Name: 'Date Range',
          ReportCategory: 5,
          ReportId: 60,
          Reset: false,
          StartDate: firstDayOfMonth,
          StartDateName: 'StartDate',
          TitleDateRangeString: 'From 02/01/2019 - To 02/22/2019',
          UseOptions: false,
        },
      ];
      ctrl.setDateRangeTitle();
      expect(scope.dateRangeTitle[0]).toEqual(
        'From 02/01/2019 - To 02/22/2019'
      );
    });

    it('ctrl.setDateRangeTitle should be called with without StartDate', function () {
      var currentDate = new Date();
      var firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      scope.dateFilterList = [
        {
          EndDate: currentDate,
          EndDateName: 'EndDate',
          FilterDtoEndDate: currentDate,
          FilterDtoStartDate: firstDayOfMonth,
          FilterId: 'DateRange',
          FilterString: '02/01/2019 - 02/22/2019',
          Name: 'Date Range',
          ReportCategory: 5,
          ReportId: 60,
          Reset: false,
          StartDateName: 'StartDate',
          TitleDateRangeString: 'From 02/01/2019 - To 02/22/2019',
          UseOptions: false,
        },
      ];
      ctrl.setDateRangeTitle();
      expect(scope.dateRangeTitle).toEqual([]);
      expect(scope.showFilterMessage).toEqual(true);
    });

    it('ctrl.setDateRangeTitle should be called without EndDate', function () {
      var currentDate = new Date();
      var firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );
      scope.dateFilterList = [
        {
          EndDateName: 'EndDate',
          FilterDtoEndDate: currentDate,
          FilterDtoStartDate: firstDayOfMonth,
          FilterId: 'DateRange',
          FilterString: '02/01/2019 - 02/22/2019',
          Name: 'Date Range',
          ReportCategory: 5,
          ReportId: 60,
          Reset: false,
          StartDate: firstDayOfMonth,
          StartDateName: 'StartDate',
          TitleDateRangeString: 'From 02/01/2019 - To 02/22/2019',
          UseOptions: false,
        },
      ];
      ctrl.setDateRangeTitle();
      expect(scope.dateRangeTitle).toEqual([]);
      expect(scope.showFilterMessage).toEqual(true);
    });
  });

  describe('ctrl.setFilterString -> ', function () {
    it('ctrl.setFilterString should be called', function () {
      scope.filterModels = {
        LocationIds: {
          ActualFilterString: '',
          DefaultAll: false,
          DefaultFilterCount: 1,
          FilterDto: [1],
          FilterFilterModel: null,
          FilterId: 'locations',
          FilterString: '@123 (EST), Default Practice - MB (CST)',
          Name: 'Locations',
          Reset: false,
          data: [
            {
              Checked: true,
              Field: 'Locations',
              Id: 1,
              Key: true,
              LocationStatus: 'Active',
              Value: 'Default Practice - MB (CST)',
              isVisible: true,
            },
            {
              Checked: false,
              Field: 'Locations',
              Id: 163,
              Key: true,
              LocationStatus: 'Active',
              Value: 'Jangaon (HAST)',
              isVisible: false,
            },
          ],
        },
        ProviderUserIds: {
          ActualFilterString: '',
          DefaultFilterCount: 11,
          FilterDto: [
            '00000000-0000-0000-0000-000000000000',
            '34de62b5-b6b6-e811-bfd7-4c34889071c5',
            'adb31dad-b6b6-e811-bfd7-4c34889071c5',
            '0ae49696-b6b6-e811-bfd7-4c34889071c5',
            '37de62b5-b6b6-e811-bfd7-4c34889071c5',
            'b71b4bbc-b6b6-e811-bfd7-4c34889071c5',
            'b0b31dad-b6b6-e811-bfd7-4c34889071c5',
            'b41b4bbc-b6b6-e811-bfd7-4c34889071c5',
            '3ade62b5-b6b6-e811-bfd7-4c34889071c5',
            'ba1b4bbc-b6b6-e811-bfd7-4c34889071c5',
            'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
          ],
          FilterFilterModel: {
            ActualFilterString: 'All',
            DefaultFilterCount: 5,
            FilterDto: [undefined, undefined, undefined, undefined, undefined],
            FilterFilterModel: null,
            FilterId: 'providerTypes',
            FilterString: 'All',
            Name: 'Provider Types',
            Reset: true,
          },
          FilterId: 'providers',
          FilterString: 'All',
          Name: 'Providers',
          Reset: false,
        },
      };

      ctrl.setFilterString(scope.filterModels);
      expect(scope.filterData.LocationIds.ActualFilterString).toBe(
        '@123 (EST), Default Practice - MB (CST)'
      );
      expect(
        scope.filterData.ProviderUserIds.FilterFilterModel.ActualFilterString
      ).toBe('All');
    });
  });

  describe('ctrl.setPagingOnFilterDto -> ', function () {
    it('ctrl.setPagingOnFilterDto should be called with scope.getAllRows equals true', function () {
      scope.reportId = 24;
      scope.getAllRows = true;
      var filterDto = {};
      ctrl.setPagingOnFilterDto(filterDto);
      expect(filterDto.PageCount).toBe(0);
      expect(filterDto.CurrentPage).toBe(0);
    });

    it('ctrl.setPagingOnFilterDto should be called with scope.getAllRows equals false', function () {
      scope.reportId = 24;
      scope.getAllRows = false;
      scope.pageCount = 30;
      scope.currentPage = 10;
      var filterDto = {};
      ctrl.setPagingOnFilterDto(filterDto);
      expect(filterDto.PageCount).toBe(30);
      expect(filterDto.CurrentPage).toBe(10);
    });
  });

  describe('scope.getReport -> ', function () {
    it('scope.getReport should be called ', function () {
      var resetPaging = true;
      var callback = undefined;
      ctrl.generateReport = true;
      scope.reportId = 60;
      scope.requestBodyProperties = true;
      ctrl.filterDto = {
        EndDate: 'Fri Feb 22 2019 00:00:00 GMT+0530 (India Standard Time)',
        ImpactionTypes: [0, 3, 2, 1],
        LocationIds: [1],
        ReportView: 1,
        NegativeAdjustmentTypeIds: [
          '00000000-0000-0000-0000-000000000000',
          'b4fd9078-1f7f-4b38-a476-7270acb6f659',
          '3b493c4d-8b3e-4c15-8331-416ab29d46d2',
          'a96fd2d5-71af-4465-a47c-9b60dde0959e',
          '9da47354-3743-4796-a7b0-f9fff3921d0d',
        ],
        PatientGroupTypeIds: [
          '00000000-0000-0000-0000-000000000000',
          '00000000-0000-0000-0000-000000000001',
          '739345e0-1465-4bf4-bb3a-3bd38479297e',
          'da2070e6-42af-4fd0-8f43-ebd1027ba582',
          '5956bceb-5c03-4f7a-a0b2-3d05d24c8818',
          '03426903-c842-4d8d-9912-dc98c658d71c',
          '8071b37b-587a-4dbb-a3f8-d26903e67305',
          '5eb700c2-0108-4e1f-8a14-cfa5b29b227d',
          'bcc69156-f321-4254-b84c-d7d0590b69e2',
        ],
        PositiveAdjustmentTypeIds: [
          '00000000-0000-0000-0000-000000000000',
          '1c517ead-6357-46e5-94d9-729a2e1e673c',
          '5849d06b-184c-452f-9d3e-28e3ea87f874',
          '9c7bb053-cc01-4b44-9905-2db2a9646408',
        ],
        ProviderUserIds: [
          '00000000-0000-0000-0000-000000000000',
          '34de62b5-b6b6-e811-bfd7-4c34889071c5',
          'adb31dad-b6b6-e811-bfd7-4c34889071c5',
          '0ae49696-b6b6-e811-bfd7-4c34889071c5',
          '37de62b5-b6b6-e811-bfd7-4c34889071c5',
          'b71b4bbc-b6b6-e811-bfd7-4c34889071c5',
          'b0b31dad-b6b6-e811-bfd7-4c34889071c5',
          'b41b4bbc-b6b6-e811-bfd7-4c34889071c5',
          '3ade62b5-b6b6-e811-bfd7-4c34889071c5',
          'ba1b4bbc-b6b6-e811-bfd7-4c34889071c5',
          'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
        ],
        StartDate: 'Fri Feb 01 2019 00:00:00 GMT+0530 (India Standard Time)',
        ViewTransactionsBy: 0,
      };
      scope.getReport(resetPaging, callback);
      expect(scope.currentPage).toBe(0);
      expect(scope.getAllRows).toBe(true);
      expect(scope.allDataDisplayed).toBe(false);
      expect(reportsFactory.GenerateReport).toHaveBeenCalledWith(
        scope.requestBodyProperties ? ctrl.filterDto : null,
        routeParams.ReportName
      );
    });
  });

  describe('ctrl.getFilterData -> ', function () {
    it('ctrl.getFilterData should be called', function () {
      scope.data = { ReportTitle: 'Analysis' };
      scope.filterModels = {
        LocationIds: {
          ActualFilterString: 'Default Practice - MB (CST)',
          DefaultAll: false,
          DefaultFilterCount: 1,
          FilterDto: [1],
          FilterFilterModel: null,
          FilterId: 'locations',
          FilterString: 'Default Practice - MB (CST)',
          Name: 'Locations',
          Reset: false,
        },
        StartDate: {
          ActualFilterString: '02/01/2019 - 02/22/2019',
          EndDate: 'Fri Feb 22 2019 17:50:40 GMT+0530 (India Standard Time)',
          EndDateName: 'EndDate',
          FilterDtoEndDate:
            'Fri Feb 22 2019 00:00:00 GMT+0530 (India Standard Time)',
          FilterDtoStartDate:
            'Fri Feb 01 2019 00:00:00 GMT+0530 (India Standard Time)',
          FilterId: 'DateRange',
          FilterString: '02/01/2019 - 02/22/2019',
          Name: 'Date Range',
          ReportCategory: 5,
          ReportId: 60,
          Reset: false,
          StartDate: 'Fri Feb 01 2019 00:00:00 GMT+0530 (India Standard Time)',
          StartDateName: 'StartDate',
          TitleDateRangeString: 'From 02/01/2019 - To 02/22/2019',
          UseOptions: false,
        },
        ReferralSourceIds: {
          ActualFilterString: 'All',
          FilterString: 'All',
          Name: 'Referral Sources',
          ReferralPatientIdName: 'ReferringPatientIds',
          ReferralSourceIdName: 'ReferralSourceIds',
          ReferringPatientIdFilterDto: ['00000000-0000-0000-0000-000000000000'],
          ReferringSourceIdFilterDto: ['00000000-0000-0000-0000-000000000000'],
          selectedAll: true,
          selectedPatients: [],
          selectedReferralSources: [],
          selectedReferralType: '',
          totalSelected: 1,
        },
      };
      ctrl.filterDto = {
        LocationIds: [],
        ReferringPatientIds: ['00000000-0000-0000-0000-000000000000']
      };
      ctrl.getFilterData();
      expect(ctrl.filterDto.LocationIds[0]).toEqual(1);
      expect(ctrl.filterDto.StartDate).toEqual(
        'Fri Feb 01 2019 00:00:00 GMT+0530 (India Standard Time)'
      );
      expect(ctrl.filterDto.EndDate).toEqual(
        'Fri Feb 22 2019 00:00:00 GMT+0530 (India Standard Time)'
      );
      expect(ctrl.filterDto.ReferringPatientIds[0]).toEqual(
        '00000000-0000-0000-0000-000000000000'
      );
    });
  });

  describe('ctrl.emptyFilterDto -> ', function () {
    it('ctrl.emptyFilterDto should be called', function () {
      ctrl.filterDto = {
        LocationIds: [1, 2, 3],
        PatientName: 'Jagadeesh',
      };
      ctrl.emptyFilterDto();
      expect(ctrl.filterDto.LocationIds).toEqual([]);
      expect(ctrl.filterDto.PatientName).toEqual('');
    });
  });

  describe('scope.printAllDataComplete -> ', function () {
    it('scope.printAllDataComplete should be called', function () {
      scope.hideMenu = false;
      scope.printAllDataComplete();
      expect(scope.hideMenu).toEqual(true);
      timeout.flush(0);
      expect(scope.slideOutText).toEqual('Show Filters');
      expect(scope.columnWidth).toEqual('col-md-12');
      timeout.flush(0);
      expect(window.print).toHaveBeenCalled();
    });
  });

  describe('scope.afterFilterInit -> ', function () {
    it('scope.afterFilterInit should be called', function () {
      scope.filterModels = {
        LocationIds: {
          DefaultAll: false,
          DefaultFilterCount: 1,
          FilterDto: [1],
          FilterFilterModel: null,
          FilterId: 'locations',
          FilterString: 'Default Practice - MB (CST)',
          Name: 'Locations',
          Reset: false,
          data: [
            {
              Field: 'Locations',
              Value: 'All',
              Key: true,
              LocationStatus: 'All Status',
              Checked: false,
              isVisible: true,
            },
            {
              Field: 'Locations',
              Value: '@123 (EST)',
              Key: true,
              Checked: false,
              LocationStatus: 'Active',
              isVisible: true,
            },
            {
              Field: 'Locations',
              Value: '123 (HST)',
              Key: true,
              Checked: false,
              LocationStatus: 'Active',
              isVisible: true,
            },
            {
              Field: 'Locations',
              Value: '123abc (HAST)',
              Key: true,
              Checked: false,
              LocationStatus: 'Active',
              isVisible: true,
            },
            {
              Field: 'Locations',
              Value: 'Default Practice - MB (CST)',
              Key: true,
              Checked: true,
              LocationStatus: 'Active',
              isVisible: true,
            },
            {
              Field: 'Locations',
              Value: 'Jangaon (HAST)',
              Key: true,
              Checked: false,
              LocationStatus: 'Active',
              isVisible: false,
            },
            {
              Field: 'Locations',
              Value: '#abc (HAST)',
              Key: true,
              Checked: false,
              LocationStatus: 'Inactive',
              isVisible: false,
            },
          ],
        },
        StartDate: {
          EndDate: 'Wed Feb 27 2019 12:35:13 GMT+0530 (India Standard Time)',
          EndDateName: 'EndDate',
          FilterDtoEndDate:
            'Wed Feb 27 2019 00:00:00 GMT+0530 (India Standard Time)',
          FilterDtoStartDate:
            'Fri Feb 01 2019 00:00:00 GMT+0530 (India Standard Time)',
          FilterId: 'DateRange',
          FilterString: '02/01/2019 - 02/27/2019',
          Name: 'Date Range',
          ReportCategory: 5,
          ReportId: 21,
          Reset: false,
          StartDate: 'Fri Feb 01 2019 00:00:00 GMT+0530 (India Standard Time)',
          StartDateName: 'StartDate',
          TitleDateRangeString: 'From 02/01/2019 - To 02/27/2019',
          UseOptions: false,
        },
        PatientStatus: [1, 2, 3],
        ProviderUserIds: {
          DefaultFilterCount: 11,
          FilterDto: [
            '00000000-0000-0000-0000-000000000000',
            '34de62b5-b6b6-e811-bfd7-4c34889071c5',
            'adb31dad-b6b6-e811-bfd7-4c34889071c5',
            '0ae49696-b6b6-e811-bfd7-4c34889071c5',
            '37de62b5-b6b6-e811-bfd7-4c34889071c5',
            'b71b4bbc-b6b6-e811-bfd7-4c34889071c5',
            'b0b31dad-b6b6-e811-bfd7-4c34889071c5',
            'b41b4bbc-b6b6-e811-bfd7-4c34889071c5',
            '3ade62b5-b6b6-e811-bfd7-4c34889071c5',
            'ba1b4bbc-b6b6-e811-bfd7-4c34889071c5',
            'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
          ],
          FilterFilterModel: {
            DefaultFilterCount: 5,
            FilterDto: [undefined, undefined, undefined, undefined, undefined],
            FilterFilterModel: null,
            FilterId: 'providerTypes',
            FilterString: 'All',
            Name: 'Provider Types',
            Reset: true,
            data: [
              {
                Field: 'ProviderType',
                Value: 'All',
                Key: true,
                Checked: true,
                FilterValue: 0,
                isVisible: true,
              },
              {
                Field: 'ProviderType',
                Value: 'Assistant',
                Key: true,
                Checked: true,
                FilterValue: 3,
                isVisible: true,
              },
              {
                Field: 'ProviderType',
                Value: 'Dentist',
                Key: true,
                Checked: true,
                FilterValue: 1,
                isVisible: true,
              },
              {
                Field: 'ProviderType',
                Value: 'Hygienist',
                Key: true,
                Checked: true,
                FilterValue: 2,
                isVisible: true,
              },
              {
                Field: 'ProviderType',
                Value: 'Other',
                Key: true,
                Checked: true,
                FilterValue: 5,
                isVisible: true,
              },
            ],
          },
          FilterId: 'providers',
          FilterString: 'All',
          Name: 'Providers',
          data: [
            {
              Field: 'Providers',
              Value: 'All',
              Key: true,
              Checked: true,
              Id: '00000000-0000-0000-0000-000000000000',
              IsActive: true,
              isVisible: true,
              SortOrder: 1,
            },
            {
              Field: 'Providers',
              Value: 'Brown, Ruby - BRORU1',
              Key: true,
              Checked: true,
              Id: '34de62b5-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: true,
              SortOrder: 2,
            },
            {
              Field: 'Providers',
              Value: 'Dickson, Khloe - DICKH1',
              Key: true,
              Checked: true,
              Id: 'adb31dad-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: true,
              SortOrder: 3,
            },
            {
              Field: 'Providers',
              Value: 'Flores, Cody - FLOCO1',
              Key: true,
              Checked: true,
              Id: '0ae49696-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: true,
              SortOrder: 4,
            },
            {
              Field: 'Providers',
              Value: 'Franklin, Molly - FRAMO1',
              Key: true,
              Checked: true,
              Id: '37de62b5-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: true,
              SortOrder: 5,
            },
            {
              Field: 'Providers',
              Value: 'Gordon, April - GORAP1',
              Key: true,
              Checked: true,
              Id: 'b71b4bbc-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: false,
              SortOrder: 6,
            },
            {
              Field: 'Providers',
              Value: 'Hughes, Selena - HUGSE1',
              Key: true,
              Checked: true,
              Id: 'b0b31dad-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: false,
              SortOrder: 7,
            },
            {
              Field: 'Providers',
              Value: 'Kirkland, Malaysia - KIRMA1',
              Key: true,
              Checked: true,
              Id: 'b41b4bbc-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: false,
              SortOrder: 8,
            },
            {
              Field: 'Providers',
              Value: 'Maldonado, Phillip - MALPH1',
              Key: true,
              Checked: true,
              Id: '3ade62b5-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: false,
              SortOrder: 9,
            },
            {
              Field: 'Providers',
              Value: 'Pope, Nia - POPNI1',
              Key: true,
              Checked: true,
              Id: 'ba1b4bbc-b6b6-e811-bfd7-4c34889071c5',
              IsActive: true,
              isVisible: false,
              SortOrder: 10,
            },
            {
              Field: 'Providers',
              Value: 'Swift, Mary Beth - SWIMA1',
              Key: true,
              Checked: true,
              Id: 'd0be7456-e01b-e811-b7c1-a4db3021bfa0',
              IsActive: true,
              isVisible: false,
              SortOrder: 11,
            },
          ],
        },
        NegativeAdjustmentTypeIds: {
          DefaultFilterCount: 5,
          FilterDto: [
            '00000000-0000-0000-0000-000000000000',
            'b4fd9078-1f7f-4b38-a476-7270acb6f659',
            '3b493c4d-8b3e-4c15-8331-416ab29d46d2',
            'a96fd2d5-71af-4465-a47c-9b60dde0959e',
            '9da47354-3743-4796-a7b0-f9fff3921d0d',
          ],
          FilterFilterModel: null,
          FilterId: 'negativeAdjustmentTypes',
          FilterString: 'All',
          Name: 'Negative Adjustment Types',
          Reset: false,
          data: [
            {
              Field: 'NegativeAdjustmentTypes',
              Value: 'All',
              Key: true,
              Checked: true,
              isVisible: true,
              Id: '00000000-0000-0000-0000-000000000000',
            },
            {
              Field: 'NegativeAdjustmentTypes',
              Value: 'Adj Negative',
              Key: true,
              Checked: true,
              Id: 'b4fd9078-1f7f-4b38-a476-7270acb6f659',
              isVisible: true,
            },
            {
              Field: 'NegativeAdjustmentTypes',
              Value: 'Coll Negative',
              Key: true,
              Checked: true,
              Id: '3b493c4d-8b3e-4c15-8331-416ab29d46d2',
              isVisible: true,
            },
            {
              Field: 'NegativeAdjustmentTypes',
              Value: 'Collection Negative',
              Key: true,
              Checked: true,
              Id: 'a96fd2d5-71af-4465-a47c-9b60dde0959e',
              isVisible: true,
            },
            {
              Field: 'NegativeAdjustmentTypes',
              Value: 'Prod Negative',
              Key: true,
              Checked: true,
              Id: '9da47354-3743-4796-a7b0-f9fff3921d0d',
              isVisible: true,
            },
          ],
        },
        PositiveAdjustmentTypeIds: {
          DefaultFilterCount: 4,
          FilterDto: [
            '00000000-0000-0000-0000-000000000000',
            '1c517ead-6357-46e5-94d9-729a2e1e673c',
            '5849d06b-184c-452f-9d3e-28e3ea87f874',
            '9c7bb053-cc01-4b44-9905-2db2a9646408',
          ],
          FilterFilterModel: null,
          FilterId: 'positiveAdjustmentTypes',
          FilterString: 'All',
          Name: 'Positive Adjustment Types',
          Reset: false,
          data: [
            {
              Field: 'PositiveAdjustmentTypes',
              Value: 'All',
              Key: true,
              Checked: true,
              isVisible: true,
            },
            {
              Checked: true,
              Field: 'PositiveAdjustmentTypes',
              FilterValue: null,
              Id: '1c517ead-6357-46e5-94d9-729a2e1e673c',
              Key: true,
              Value: 'Collection Positive',
              isVisible: true,
            },
            {
              Checked: true,
              Field: 'PositiveAdjustmentTypes',
              FilterValue: null,
              Id: '5849d06b-184c-452f-9d3e-28e3ea87f874',
              Key: true,
              Value: 'Finance Charge',
              isVisible: true,
            },
            {
              Checked: true,
              Field: 'PositiveAdjustmentTypes',
              FilterValue: null,
              Id: '9c7bb053-cc01-4b44-9905-2db2a9646408',
              Key: true,
              Value: 'Prod Positive',
              isVisible: true,
            },
          ],
        },
      };
      scope.pageReady = true;
      scope.afterFilterInit();
      expect(scope.filterModels.LocationIds.FilterDto).toEqual([1]);
      expect(scope.filterModels.PatientStatus.FilterDto[0]).toEqual(1);
      expect(scope.filterModels.PatientStatus.FilterDto[1]).toEqual(2);
      expect(scope.filterModels.PatientStatus.FilterDto[2]).toEqual(3);
      expect(scope.filterModels.ProviderUserIds.FilterDto).toEqual([]);
      expect(scope.filterModels.ProviderUserIds.FilterString).toEqual('All');
      expect(
        scope.filterModels.ProviderUserIds.FilterFilterModel.FilterDto
      ).toEqual([2]);
      expect(
        scope.filterModels.ProviderUserIds.FilterFilterModel.FilterString
      ).toEqual('Hygienist');
      expect(scope.filterModels.PositiveAdjustmentTypeIds.FilterString).toEqual(
        'All'
      );
      expect(scope.filterModels.NegativeAdjustmentTypeIds.FilterString).toEqual(
        'No filters applied'
      );
      expect(reportsFactory.ClearReportContext).toHaveBeenCalled();
    });
  });
});
