describe('reports-landing-controller ->', function () {
  var ctrl,
    scope,
    localize,
    location,
    reportsFactory,
    modalFactory,
    patSecurityService,
    toastrFactory,
    reportCategories,
    featureService,
    reportsService,
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

  it('should check that toastrFactory is not null', function () {
    expect(toastrFactory).not.toBe(null);
  });

  it('should check that toastrFactory is not undefined', function () {
    expect(toastrFactory).not.toBeUndefined();
  });
    
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      reportsFactory = {
        DeleteCustomReport: jasmine.createSpy().and.callFake(function () {
          var deleteCustomReport = q.defer();
          deleteCustomReport.resolve(1);
          return {
            result: deleteCustomReport.promise,
            then: function () {},
          };
        }),

        SetRequestBodyProperties: jasmine.createSpy().and.callFake(function () {
          var setRequestBodyProperties = q.defer();
          setRequestBodyProperties.resolve(1);
          return {
            result: setRequestBodyProperties.promise,
            then: function () {},
          };
        }),

        AddViewedReportActivityEvent: jasmine
          .createSpy()
          .and.callFake(function () {
            var addViewedReportActivityEvent = q.defer();
            addViewedReportActivityEvent.resolve(1);
            return {
              result: addViewedReportActivityEvent.promise,
              then: function () {},
            };
          }),

        GetListOfAvailableReports: jasmine
          .createSpy()
          .and.callFake(function () {
            var getListOfAvailableReports = q.defer();
            getListOfAvailableReports.resolve(1);
            return {
              result: getListOfAvailableReports.promise,
              then: function () {},
            };
          }),

        GetAmfaAbbrev: jasmine.createSpy().and.callFake(function () {
          var getAmfaAbbrev = q.defer();
          getAmfaAbbrev.resolve(1);
          return {
            result: getAmfaAbbrev.promise,
            then: function () {},
          };
        }),

        SetAmfa: jasmine.createSpy().and.callFake(function () {
          var setAmfa = q.defer();
          setAmfa.resolve(1);
          return {
            result: setAmfa.promise,
            then: function () {},
          };
        }),

        SetReportPath: jasmine.createSpy().and.callFake(function () {
          var setReportPath = q.defer();
          setReportPath.resolve(1);
          return {
            result: setReportPath.promise,
            then: function () {},
          };
        }),

        SetReportId: jasmine.createSpy().and.callFake(function () {
          var setReportId = q.defer();
          setReportId.resolve(1);
          return {
            result: setReportId.promise,
            then: function () {},
          };
        }),

        SetFuseReportTitle: jasmine.createSpy().and.callFake(function () {
          var setFuseReportTitle = q.defer();
          setFuseReportTitle.resolve(1);
          return {
            result: setFuseReportTitle.promise,
            then: function () {},
          };
        }),

        SetReportCategoryId: jasmine.createSpy().and.callFake(function () {
          var setReportCategoryId = q.defer();
          setReportCategoryId.resolve(1);
          return {
            result: setReportCategoryId.promise,
            then: function () {},
          };
        }),

        SetNavigationFrom: jasmine.createSpy().and.callFake(function () {
          var navigationFrom = q.defer();
          navigationFrom.resolve(1);
          return {
            result: navigationFrom.promise,
            then: function () {},
          };
        }),
      };

      featureService = {
        isEnabled: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

      reportsService = {
        AddUserFavoriteReport: jasmine.createSpy().and.returnValue({
          then: jasmine.createSpy(),
        }),
      };

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

      reportCategories = [
        { ReportCategory: 'All Reports', ReportCategoryValue: 0 },
        { ReportCategory: 'Activity Log Reports', ReportCategoryValue: 9 },
        { ReportCategory: 'Clinical Reports', ReportCategoryValue: 7 },
        { ReportCategory: 'Financial Reports', ReportCategoryValue: 6 },
        { ReportCategory: 'Insurance Reports', ReportCategoryValue: 1 },
        { ReportCategory: 'Patient Reports', ReportCategoryValue: 2 },
        { ReportCategory: 'Provider Reports', ReportCategoryValue: 3 },
        { ReportCategory: 'Referral Reports', ReportCategoryValue: 8 },
        { ReportCategory: 'Schedule Reports', ReportCategoryValue: 4 },
        { ReportCategory: 'Service Reports', ReportCategoryValue: 5 },
      ];
    })
  );

  beforeEach(inject(function ($rootScope, $controller, $q, $filter) {
    q = $q;
    filter = $filter;

    modalFactory = {
      ConfirmModal: jasmine.createSpy().and.callFake(function () {
        var modalFactoryDeferred = q.defer();
        modalFactoryDeferred.resolve(1);
        return {
          result: modalFactoryDeferred.promise,
          then: function () {},
        };
      }),
    };

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

      scope = $rootScope.$new();

      featureFlagService = {
          getOnce$: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
      };

      fuseFlag = {
          ReportPatientsByBenefitPlan: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() }),
          ReportServiceCodeByServiceTypeProductivity: jasmine.createSpy().and.returnValue({ subscribe: jasmine.createSpy() })
      };

    ctrl = $controller('ReportsLandingController', {
      $filter: $filter,
      $scope: scope,
      localize: localize,
      $location: location,
      ReportsFactory: reportsFactory,
      ModalFactory: modalFactory,
      patSecurityService: patSecurityService,
      toastrFactory: toastrFactory,
      ReportCategories: reportCategories,
      FeatureService: featureService,
      ReportsService: reportsService,
      FeatureFlagService: featureFlagService,
      FuseFlag: fuseFlag
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
      expect(scope.breadcrumbs[0].name).toEqual('Business Center');
      expect(scope.breadcrumbs[0].path).toEqual(
        '/BusinessCenter/PracticeSettings/'
      );
      expect(scope.breadcrumbs[0].title).toEqual('Practice Settings');
      expect(scope.breadcrumbs[1].name).toEqual('Reports');
      expect(scope.breadcrumbs[1].path).toEqual('/BusinessCenter/Reports/');
      expect(scope.breadcrumbs[1].title).toEqual('Reports');
      expect(scope.reportTypes[0].ReportCategory).toEqual(
        'Select/Deselect All'
      );
      expect(scope.reportTypes[0].ReportCategoryValue).toEqual(0);
      expect(scope.reportTypes[3].ReportCategory).toEqual('Financial');
      expect(scope.reportTypes[3].ReportCategoryValue).toEqual(6);
      expect(scope.reportTypes[6].ReportCategory).toEqual('Provider Goals');
      expect(scope.reportTypes[6].ReportCategoryValue).toEqual(12);
    });

    it('should have injected services ', function () {
      expect(localize).not.toBeNull();
      expect(location).not.toBeNull();
      expect(reportsFactory).not.toBeNull();
      expect(modalFactory).not.toBeNull();
      expect(window).not.toBeNull();
      expect(patSecurityService).not.toBeNull();
      expect(toastrFactory).not.toBeNull();
      expect(reportCategories).not.toBeNull();
    });
  });

  describe('scope.generateReport function -> ', function () {    
    it('scope.generateReport should be called with report', function () {
      spyOn(window, 'open');
      var report = {
        ActionId: 2942,
        Category: 5,
        Description:
          'This report displays the applied adjustments by type per location for a specific date range.',
        Id: 60,
        IsCustomReport: false,
        Name: 'Adjustments by Type',
        Route: 'reports/AdjustmentsByType',
        $$AmfaAbbrev: 'soar-report-fin-adjbyt',
        RequestBodyProperties: [
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
        ],
      }; 
      scope.generateReport(report);
      expect(reportsFactory.SetAmfa).toHaveBeenCalledWith(report.$$AmfaAbbrev);
      expect(reportsFactory.SetReportId).toHaveBeenCalledWith(report.Id);
      expect(reportsFactory.SetFuseReportTitle).toHaveBeenCalledWith(report.Name);
      expect(reportsFactory.SetNavigationFrom).toHaveBeenCalledWith(false);
      expect(reportsFactory.AddViewedReportActivityEvent).toHaveBeenCalledWith(
        report.Id,
        report.IsCustomReport
      );
    });
  });

  describe('ctrl.alphabetizeReportList function -> ', function () {
    it('ctrl.alphabetizeReportList should be called', function () {
      var reports = [
        { Name: 'Pending Claims', Category: 0 },
        { Name: 'Patients by Benefit Plan', Category: 1 },
        { Name: 'Gross Performance by Provider - Detailed', Category: 2 },
        { Name: 'Scheduled Appointments', Category: 3 },
        { Name: 'Service History', Category: 4 },
        { Name: 'Day Sheet', Category: 5 },
        { Name: 'Proposed Treatement', Category: 6 },
        { Name: 'Reffered Patients', Category: 7 },
        { Name: 'Activity Log', Category: 8 },
      ];
      var result = ctrl.alphabetizeReportList(reports);
      expect(result[0].Name).toBe('Activity Log');
      expect(result[1].Name).toBe('Proposed Treatement');
      expect(result[2].Name).toBe('Day Sheet');
      expect(result[3].Name).toBe('Pending Claims');
      expect(result[4].Name).toBe('Patients by Benefit Plan');
      expect(result[5].Name).toBe('Gross Performance by Provider - Detailed');
      expect(result[6].Name).toBe('Reffered Patients');
      expect(result[7].Name).toBe('Scheduled Appointments');
      expect(result[8].Name).toBe('Service History');
    });
  });

  describe('scope.deleteCustomReportConfirm function -> ', function () {
    it('scope.deleteCustomReportConfirm should be called', function () {
      var report = {
        ActionId: 2942,
        Category: 5,
        Description:
          'This report displays the applied adjustments by type per location for a specific date range.',
        Id: 60,
        IsCustomReport: false,
        Name: 'Adjustments by Type',
        Route: 'reports/AdjustmentsByType',
        $$AmfaAbbrev: 'soar-report-fin-adjbyt',
        RequestBodyProperties: [
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
        ],
      };
      var message = localize.getLocalizedString(
        'Are you sure you want to delete this report?'
      );
      var title = localize.getLocalizedString('Delete custom report');
      var button2Text = localize.getLocalizedString('No');
      var button1Text = localize.getLocalizedString('Yes');
      scope.deleteCustomReportConfirm(report);
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        title,
        message,
        button1Text,
        button2Text
      );
    });
  });

  describe('scope.toggleSelect function -> ', function () {
    it('scope.toggleSelect should be called with All with Selected is equals to True', function () {
      scope.reports = [];
      scope.filteredReports = [];
      var item = {
        ReportCategory: 'All',
        ReportCategoryValue: 0,
        Selected: true,
      };
      scope.toggleSelect(item);
      expect(scope.userSearch).toBe('');
      expect(scope.categories).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9,12]);
      expect(scope.reportTypes[1].Selected).toBe(true);
    });

    it('scope.toggleSelect should be called with All with Selected is equals to False', function () {
      scope.reports = [];
      scope.filteredReports = [];
      var item = {
        ReportCategory: 'All',
        ReportCategoryValue: 0,
        Selected: false,
      };
      scope.toggleSelect(item);
      expect(scope.categories).toEqual([]);
      expect(scope.reportTypes[1].Selected).toBe(false);
      expect(scope.filteredReports).toEqual([]);
      expect(scope.reports).toEqual([]);
    });

    it('scope.toggleSelect should be called with other Categoty Selected', function () {
      scope.reports = [];
      scope.filteredReports = [];
      var item = {
        ReportCategory: 'Activity',
        ReportCategoryValue: 9,
        Selected: true,
      };

      scope.categories = [];
      scope.originalReports = [
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 24,
          IsCustomReport: false,
          Name: 'Activity Log',
        },
        {
          Category: 6,
          CategoryName: 'Clinical Reports',
          Description:
            'This report shows detailed information on patient treatment plans updated or created during the selected date range.',
          Id: 34,
          IsCustomReport: false,
        },
      ];
      scope.toggleSelect(item);
      expect(scope.categories[0]).toEqual(9);
      expect(scope.filteredReports[0].CategoryName).toEqual('Activity Reports');
      expect(scope.reports[0].CategoryName).toEqual('Activity Reports');
    });

    it('scope.toggleSelect should be called with other Categoty UnSelected', function () {
      scope.reports = [];
      scope.filteredReports = [];
      var item = {
        ReportCategory: 'Activity',
        ReportCategoryValue: 9,
        Selected: true,
      };

      scope.categories = [7, 9];
      scope.originalReports = [
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 24,
          IsCustomReport: false,
          Name: 'Activity Log',
        },
        {
          Category: 6,
          CategoryName: 'Clinical Reports',
          Description:
            'This report shows detailed information on patient treatment plans updated or created during the selected date range.',
          Id: 34,
          IsCustomReport: false,
        },
      ];
      scope.toggleSelect(item);
      expect(scope.categories[0]).toEqual(7);
      expect(scope.filteredReports[0].CategoryName).toEqual('Clinical Reports');
      expect(scope.reports[0].CategoryName).toEqual('Clinical Reports');
    });

    it('scope.toggleSelect should be called with other Categoty Selected with Custom Reports', function () {
      scope.reports = [];
      scope.filteredReports = [];
      var item = {
        ReportCategory: 'Activity',
        ReportCategoryValue: 9,
        Selected: true,
      };

      scope.categories = [7];
      scope.originalReports = [
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 24,
          IsCustomReport: false,
          Name: 'Activity Log',
        },
        {
          Category: 6,
          CategoryName: 'Clinical Reports',
          Description:
            'This report shows detailed information on patient treatment plans updated or created during the selected date range.',
          Id: 34,
          IsCustomReport: false,
        },
        {
          Category: 5,
          CategoryName: 'Financial Reports',
          Description:
            'This report shows a list of all deleted account transactions for the selected date range.',
          Id: 32,
          IsCustomReport: true,
          Name: 'Deleted Transactions',
        },
      ];
      scope.toggleSelect(item);
      expect(scope.categories).toEqual([7, 9]);
      expect(scope.filteredReports[0].CategoryName).toEqual('Clinical Reports');
      expect(scope.reports[0].CategoryName).toEqual('Activity Reports');
    });
  });

  // Need more re-search on regex failure
  // describe('scope.onSearch function -> ', function() {
  //   it('scope.onSearch should be called with searchText', function() {
  //     var searchText = 'Activit';
  //     scope.originalReports = [
  //       {
  //         Category: 8,
  //         CategoryName: 'Activity Reports',
  //         Description: 'This report lists all activity for the selected date range.',
  //         Id: 24,
  //         IsCustomReport: false,
  //         Name: 'Activity Log'
  //     },
  //     {
  //       Category: 6,
  //       CategoryName: 'Clinical Reports',
  //       Description: 'This report shows detailed information on patient treatment plans updated or created during the selected date range.',
  //       Id: 34,
  //       IsCustomReport: false
  //     },
  //     {
  //       Category: 5,
  //       CategoryName: 'Financial Reports',
  //       Description: 'This report shows a list of all deleted account transactions for the selected date range.',
  //       Id: 32,
  //       IsCustomReport: true,
  //       Name: 'Deleted Transactions'}];
  //     scope.onSearch(searchText);
  //     expect(scope.reports.length).toBe(1);
  //   });
  // });

  describe('scope.toggleFavorite -> ', function () {
    it('scope.toggleFavorite should be called with false', function () {
      scope.reports = [];
      var report = { Id: 105, IsCustomReport: false, IsFavoriteReport: false };
      scope.originalReports = [
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 24,
          IsCustomReport: false,
          IsFavoriteReport: true,
          Name: 'Activity Log',
        },
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 105,
          IsCustomReport: false,
          IsFavoriteReport: false,
          Name: 'Activity Log Beta',
        },
      ];
      scope.toggleFavorite(report);
      expect(scope.reports.length).toBe(2);
      expect(scope.reports[0].IsFavoriteReport).toBe(true);
    });

    it('scope.toggleFavorite should be called with true', function () {
      scope.reports = [];
      var report = { Id: 105, IsCustomReport: false, IsFavoriteReport: true };
      scope.originalReports = [
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 24,
          IsCustomReport: false,
          IsFavoriteReport: true,
          Name: 'Activity Log',
        },
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 105,
          IsCustomReport: false,
          IsFavoriteReport: true,
          Name: 'Activity Log Beta',
        },
      ];
      scope.toggleFavorite(report);
      expect(scope.reports.length).toBe(2);
      expect(scope.reports[0].IsFavoriteReport).toBe(true);
    });
  });

  describe('scope.filterReports -> ', function () {
    it('scope.filterReports should be called with favourite filter and selected equals true', function () {
      scope.reports = [];
      var item = { ReportCategoryValue: 11, Selected: true };
      scope.categories = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      scope.originalReports = [
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 24,
          IsCustomReport: false,
          IsFavoriteReport: true,
          Name: 'Activity Log',
        },
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 105,
          IsCustomReport: false,
          IsFavoriteReport: false,
          Name: 'Activity Log Beta',
        },
      ];
      scope.filterReports(item);
      expect(scope.reports.length).toBe(1);
      expect(scope.reports[0].IsFavoriteReport).toBe(true);
    });

    it('scope.filterReports should be called with custom filter and selected equals true', function () {
      scope.reports = [];
      var item = { ReportCategoryValue: 10, Selected: true };
      scope.originalReports = [
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 24,
          IsCustomReport: true,
          IsFavoriteReport: true,
          Name: 'Activity Log',
        },
        {
          Category: 8,
          CategoryName: 'Activity Reports',
          Description:
            'This report lists all activity for the selected date range.',
          Id: 105,
          IsCustomReport: false,
          IsFavoriteReport: true,
          Name: 'Activity Log Beta',
        },
      ];
      scope.filterReports(item);
      expect(scope.reports.length).toBe(1);
      expect(scope.reports[0].IsCustomReport).toBe(true);
    });
  });
});
