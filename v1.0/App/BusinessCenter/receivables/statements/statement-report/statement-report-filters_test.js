describe('statement-report-filters tests -> ', function () {
  var scope, parentScope, filter, localize;
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $filter) {
    var loc = {
      getLocalizedString: jasmine
        .createSpy('localize.getLocalizedString')
        .and.callFake(function (input) {
          return input;
        }),
    };
    scope = $rootScope.$new();
    parentScope = $rootScope.$new();
    scope.$parent = parentScope;
    filter = $filter;
    localize = loc;
  }));

  describe('statementReportAlertCityStateZip -> ', function () {
    it('should return correctly formatted city state', function () {
      var alert = {
        StandarizedCity: '123 St',
        StandarizedState: 'HI',
        StandarizedPostalCode: '00000',
        StandarizedPostalCode4: '0000',
      };
      var result = filter('statementReportAlertCityStateZip')(alert);
      expect(result).toEqual('123 St, HI 00000-0000');
    });

    it('should return correctly formatted city state when missing city', function () {
      var era = {
        StandarizedState: 'HI',
        StandarizedPostalCode: '00000',
        StandarizedPostalCode4: '0000',
      };
      var result = filter('statementReportAlertCityStateZip')(era);
      expect(result).toEqual('HI 00000-0000');
    });

    it('should return correctly formatted city state when missing state', function () {
      var era = {
        StandarizedCity: '123 St',
        StandarizedPostalCode: '00000',
        StandarizedPostalCode4: '0000',
      };
      var result = filter('statementReportAlertCityStateZip')(era);
      expect(result).toEqual('123 St, 00000-0000');
    });

    it('should return correctly formatted city state when missing zip', function () {
      var era = {
        StandarizedCity: '123 St',
        StandarizedState: 'HI',
        StandarizedPostalCode4: '0000',
      };
      var result = filter('statementReportAlertCityStateZip')(era);
      expect(result).toEqual('123 St, HI 0000');
    });
    it('should return correctly formatted city state when missing extra zip', function () {
      var era = {
        StandarizedCity: '123 St',
        StandarizedState: 'HI',
        StandarizedPostalCode: '00000',
      };
      var result = filter('statementReportAlertCityStateZip')(era);
      expect(result).toEqual('123 St, HI 00000');
    });
  });

  describe('statementReportAlertType -> ', function () {
    it('should return correctly formatted string', function () {
      var result = filter('statementReportAlertType')(1);
      expect(result).toEqual('Suppressed Non-Standard Address');
    });
    it('should return unknown when invalid', function () {
      var result = filter('statementReportAlertType')();
      expect(result).toEqual('Unknown');
    });
  });

  describe('statementReportAlertType -> ', function () {
    it('should return correctly formatted string', function () {
      var result = filter('statementReportProcessed')(1);
      expect(result).toEqual('Suppressed');
    });
    it('should return unknown when invalid', function () {
      var result = filter('statementReportProcessed')();
      expect(result).toEqual('Unknown');
    });
  });
});
