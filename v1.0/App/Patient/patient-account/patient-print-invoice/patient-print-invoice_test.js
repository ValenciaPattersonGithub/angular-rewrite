describe('PatientPrintInvoiceController ->', function () {
  var scope, routeParams, mockInvoice, ctrl;

  mockInvoice = {
    Details: [{ TransactionDescription: 'desc', TransactionDate: '' }],
  };

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    localStorage.setItem('invoice_' + 2, JSON.stringify(mockInvoice));
    routeParams = { invoiceId: 2 };

    ctrl = $controller('PatientPrintInvoiceController', {
      $scope: scope,
      $routeParams: routeParams,
    });
  }));

  describe('convertToothRangeToAbbrev -> ', function () {
    beforeEach(function () {
      scope.invoiceDto.Details[0].TransactionDescription = 'desc';
    });

    it('should display quadrant abbreviation if Th contains only a quadrant', function () {
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th 1-8';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th UR'
      );
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th K-O';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th LL'
      );
    });

    it('should display arch abbreviation if Th contains only an arch', function () {
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th 1-16';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th UA'
      );
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th K-T';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th LA'
      );
    });

    it('should display full mouth abbreviation if Th contains all teeth', function () {
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th 1-32';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th FM'
      );
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th A-T';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th FM'
      );
    });

    it('should not convert if Th is not a valid range', function () {
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th 1-9';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th 1-9'
      );
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th K-J';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th K-J'
      );
    });

    it('should not convert if Th has no ranges', function () {
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th 2,6,K';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th 2,6,K'
      );
    });

    it('should not convert if Th has a range but also other teeth', function () {
      scope.invoiceDto.Details[0].TransactionDescription = 'desc Th 9-16, J';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc Th 9-16, J'
      );
    });

    it('should not try to convert the incorrect string', function () {
      scope.invoiceDto.Details[0].TransactionDescription =
        'The end of the world as we know it. desc Th 25-32';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'The end of the world as we know it. desc Th LR'
      );
    });

    it('should not try to convert the incorrect string', function () {
      scope.invoiceDto.Details[0].TransactionDescription =
        'The end of the world as we know it.';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'The end of the world as we know it.'
      );
    });

    it('should not update the string if there is no Th', function () {
      scope.invoiceDto.Details[0].TransactionDescription =
        'desc contains no tooth';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'desc contains no tooth'
      );
    });

    it('should handle falsy property', function () {
      scope.invoiceDto.Details[0].TransactionDescription = '';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toBe('');
      scope.invoiceDto.Details[0].TransactionDescription = null;
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toBe(null);
      delete scope.invoiceDto.Details[0].TransactionDescription;
      ctrl.convertToothRangeToAbbrev();
      expect(
        scope.invoiceDto.Details[0].TransactionDescription
      ).toBeUndefined();
    });

    it('should handle descriptions that contain text after the Th', function () {
      scope.invoiceDto.Details[0].TransactionDescription =
        'D0120: periodic oral evaluation - established patient (D0120), Th 3, D';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'D0120: periodic oral evaluation - established patient (D0120), Th 3, D'
      );
      scope.invoiceDto.Details[0].TransactionDescription =
        'D2160: 3 (D2160), Th 4, MOB5';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'D2160: 3 (D2160), Th 4, MOB5'
      );
      // this one shouldn't ever happen, so it is okay that 1-8 is not converted
      scope.invoiceDto.Details[0].TransactionDescription =
        'D2160: 3 (D2160), Th 1-8, MOB5';
      ctrl.convertToothRangeToAbbrev();
      expect(scope.invoiceDto.Details[0].TransactionDescription).toEqual(
        'D2160: 3 (D2160), Th 1-8, MOB5'
      );
    });
  });
});
