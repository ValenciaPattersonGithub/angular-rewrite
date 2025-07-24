describe('payer-report-controller->', function () {
  var scope,
    ctrl,
    mockLocation,
    mockToastrFactory,
    mockPatSecurityService,
    payerReportsService;
  var mockLocalize, mockAmfaInfo;
  var mockPayerReportList = [
    {
      Date: '2019-01-07T00:00:00',
      sProcessed: true,
      PayerReportId: 15,
      PlatformPayerReportId: 'ba8a0e27-c0ed-43e9-b9cf-530b37b4f270',
      PracticeId: 12,
      ReportName: ' DCB973BS DAILY EDI DOCUMENTS RECEIVED TODAY',
      TaxId: '529027219',
      UserModified: '46036023-d22b-4b0e-a0f6-c0120e19b7e0',
    },
    {
      Date: '2020-01-30T00:00:00',
      DateModified: '2020-03-02T07:41:17.8078339',
      PayerReportId: 8,
      PlatformPayerReportId: 'af7be858-6052-4fd5-b0fa-47e8c3560be5',
      PracticeId: 26899,
      ReportName: null,
      TaxId: '444444444',
      UserModified: '46036023-d22b-4b0e-a0f6-c0120e19b7e0',
    },
    {
      Date: '2020-01-30T00:00:00',
      DateModified: '2020-04-27T12:30:04.666681',
      PayerReportId: 9,
      PlatformPayerReportId: '8de396e0-d5b4-4b17-bb91-4d3a8a8f6c8b',
      PracticeId: 26899,
      ReportName: 'CP-O-RTD-P',
      TaxId: '666666666',
      UserModified: '46036023-d22b-4b0e-a0f6-c0120e19b7e0',
    },
  ];

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      payerReportsService = {
        GetPayerReports: jasmine.createSpy().and.returnValue({
          Value: {
            CurrentPage: 0,
            FilterCriteria: { IsProcessed: false },
            PageCount: 5,
            Rows: mockPayerReportList,
          },
        }),
        AssignReportProcessedStatus: jasmine.createSpy(),
      };
      $provide.value('PayerReportsService', payerReportsService);
    })
  );
  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    mockLocation = {
      url: jasmine.createSpy('documentService.get'),
      path: jasmine.createSpy('$location.path'),
    };

    mockLocalize = {
      getLocalizedString: jasmine.createSpy('localize.getLocalizedString'),
    };

    mockToastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    mockPatSecurityService = {
      IsAuthorizedByAbbreviation: jasmine.createSpy('').and.returnValue(true),
    };
    mockAmfaInfo = {
      'soar-ins-iclaim-view': { ActionId: 3 },
    };
    ctrl = $controller('PayerReportsController', {
      $scope: scope,
      ToastrFactory: mockToastrFactory,
      Localize: mockLocalize,
      payerReportsService: payerReportsService,
      $location: mockLocation,
      patSecurityService: mockPatSecurityService,
      AmfaInfo: mockAmfaInfo,
    });
  }));

  describe('initial values -> ', function () {
    it('controller should exist', function () {
      expect(ctrl).not.toBeNull();
    });
  });

  describe('getReports method -> ', function () {
    var res;
    beforeEach(function () {
      scope.currentPage = 0;
      scope.pageCount = 20;
      scope.allDataDisplayed = false;
      ctrl.sortCriteria = { Date: 1 };
      ctrl.sortOrder = 1;
      scope.filterByIsProcessed = false;

      res = {
        Value: {
          CurrentPage: 0,
          FilterCriteria: { IsProcessed: false },
          PageCount: 5,
          Rows: mockPayerReportList,
        },
      };
      payerReportsService.GetPayerReports = function (data, success) {
        success(res);
      };
    });

    it('should set ReportName to Label when null', function () {
      scope.getReports(true);
      expect(scope.reports[0].ReportName).toEqual(
        ' DCB973BS DAILY EDI DOCUMENTS RECEIVED TODAY'
      );
      expect(scope.reports[1].ReportName).toEqual('LABEL');
      expect(scope.reports[2].ReportName).toEqual('CP-O-RTD-P');
    });
  });
});
