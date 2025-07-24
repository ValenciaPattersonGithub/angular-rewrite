describe('PatientAccountLatestStatementController ->', function () {
  var ctrl,
    scope,
    sce,
    patientServices,
    toastrFactory,
    localize,
    mockCurrentPatient;

  beforeEach(module('Soar.Common'));
  beforeEach(module('common.factories'));
  beforeEach(module('Soar.Patient'));
  beforeEach(module('Soar.BusinessCenter'));

  beforeEach(inject(function ($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    sce = $injector.get('$sce');

    scope.person = {
      PersonAccount: {
        AccountId: '54DA8622-8399-4C96-9978-2880963EB0D5',
      },
    };

    mockCurrentPatient = {
      AccountId: '54DA8622-8399-4C96-9978-2880963EB0D5',
      Value: {
        PersonAccount: {
          AccountId: '54DA8622-8399-4C96-9978-2880963EB0D5',
        },
      },
    };

    // mock for patient services
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

    //mock for toastrFactory
    toastrFactory = {
      success: jasmine.createSpy('toastrFactory.success'),
      error: jasmine.createSpy('toastrFactory.error'),
    };

    //mock for localize
    localize = {
      getLocalizedString: jasmine.createSpy().and.returnValue(''),
    };

    ctrl = $controller('PatientAccountLatestStatementController', {
      $scope: scope,
      $sce: sce,
      PatientServices: patientServices,
      toastrFactory: toastrFactory,
      localize: localize,
    });

    spyOn(window, 'open').and.returnValue('');
  }));

  describe('ctrl.getStatementData ->', function () {
    it('should call GetAccountStatementByAccountId', function () {
      spyOn(
        patientServices.AccountStatements,
        'GetAccountStatementByAccountId'
      );
      ctrl.getStatementData();
      expect(
        patientServices.AccountStatements.GetAccountStatementByAccountId
      ).toHaveBeenCalled();
    });
  });

  describe('ctrl.getAccountStatementSuccess ->', function () {
    it('string', function () {
      var data = {
        Value: [
          {
            CreatedDate: '01/01/2015',
            DueDate: null,
            Message: '',
            FinanceCharge: 2,
            TotalCharges: 20,
            EstimatedInsurance: 14,
            SubmissionMethod: 2,
            IsSelectedOnBatch: true,
            AccountStatementData:
              '{ "DisplayPatientBalance" : 0,  "DisplayPatientPortion" : 0 }',
          },
          {
            CreatedDate: '07/01/2015',
            DueDate: '01/01/2015',
            Message: 'Test Message',
            FinanceCharge: 0,
            TotalCharges: 20,
            EstimatedInsurance: 14,
            SubmissionMethod: 2,
            IsSelectedOnBatch: true,
            AccountStatementData:
              '{ "DisplayPatientBalance" : 20,  "DisplayPatientPortion" : 0 }',
          },
        ],
      };
      ctrl.getAccountStatementSuccess(data);
      expect(scope.accountStatementDto).not.toBeNull();
      expect(scope.statementDate).toEqual('07/01/2015');
      expect(scope.accountStatementDto.TotalCharges).toEqual(20);
      expect(ctrl.accountStatementDtoForPdf).toEqual(scope.accountStatementDto);
    });
  });

  describe('ctrl.getAccountStatementFailure  ->', function () {
    it('should throw toastr error', function () {
      ctrl.getAccountStatementFailure();
      expect(scope.isAtLeastOneStatement).toBe(false);
    });
  });

  describe('ctrl.accountStatementPdfSuccess ->', function () {
    it('should have pdfContent', function () {
      var res = {
        data: '\x45\x6e\x63\x6f',
      };
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
});
