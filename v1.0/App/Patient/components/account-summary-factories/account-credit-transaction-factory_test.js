describe('account-credit-transaction-factory ->', function () {
  var accountCreditTransactionFactory,
    q,
    mockClaimsService,
    tabLauncher,
    patSecurityService,
    mockToastrFactory,
    patientServices,
    mockLocalize,
    financialService;

  beforeEach(
    module('Soar.Patient', function ($provide) {
      mockToastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error'),
      };
      $provide.value('ToastrFactory', mockToastrFactory);

      tabLauncher = {
        launchNewTab: jasmine.createSpy(),
      };
      $provide.value('tabLauncher', tabLauncher);

      patientServices = {
        Patients: {
          get: jasmine
            .createSpy('patientServices.Patients.get')
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: { PatientCode: 'DOEJO1' },
                  });
                },
              },
            }),
          getWithoutAccount: jasmine
            .createSpy('patientServices.Patients.getWithoutAccount')
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: { PatientCode: 'DOEJO1' },
                  });
                },
              },
            }),
        },
        CreditTransactions: {
          getCreditTransactionByIdForAccount: jasmine
            .createSpy(
              'patientServices.CreditTransactions.getCreditTransactionByIdForAccount'
            )
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: { Amount: 20, Balance: 30, Description: 'test' },
                  });
                },
              },
            }),
        },
        Account: {
          getAccountMembersDetailByAccountId: jasmine
            .createSpy(
              'patientServices.Account.getAccountMembersDetailByAccountId'
            )
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback({
                    Value: { AccountId: 100 },
                  });
                },
              },
            }),
        },
      };
      $provide.value('PatientServices', patientServices);

      mockClaimsService = {
        getClaimEntityByClaimId: jasmine
          .createSpy('claimsService.getClaimEntityByClaimId')
          .and.returnValue({
            $promise: {
              then: function (callback) {
                callback({
                  Value: { ClaimCommonId: '400' },
                });
              },
            },
          }),
      };
      $provide.value('ClaimsService', mockClaimsService);

      patSecurityService = {
        IsAuthorizedByAbbreviation: jasmine
          .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
          .and.returnValue(true),
        logout: jasmine.createSpy('patSecurityService.logout'),
        generateMessage: jasmine.createSpy(
          'patSecurityService.generateMessage'
        ),
      };
      $provide.value('patSecurityService', patSecurityService);

      mockLocalize = {
        getLocalizedString: jasmine.createSpy(),
      };
      $provide.value('localize', mockLocalize);

      financialService = {
        calculateAccountAndInsuranceBalances: jasmine
          .createSpy('financialService.calculateAccountAndInsuranceBalances')
          .and.returnValue({
            Value: { TotalInsurance: 10 },
          }),
      };
      $provide.value('FinancialService', financialService);
    })
  );

  beforeEach(inject(function ($injector) {
    accountCreditTransactionFactory = $injector.get(
      'AccountCreditTransactionFactory'
    );
    q = $injector.get('$q');
  }));

  describe('factory.getCreditTransaction -> ', function () {
    it('should throw toastr when not authorized', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      accountCreditTransactionFactory.getCreditTransaction(4, 10);
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).not.toHaveBeenCalled();
      expect(patSecurityService.generateMessage).toHaveBeenCalled();
    });
    it('should call the API to get credit transaction data', function () {
      accountCreditTransactionFactory.getCreditTransaction(4, 10);
      expect(
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount
      ).toHaveBeenCalled();
    });
  });

  describe('factory.viewEob', function () {
    var res;
    beforeEach(function () {
      res = [
        { Value: { PatientCode: 'DOEJO1' } },
        { Value: { ClaimCommonId: '400' } },
      ];
      q.all = jasmine.createSpy('q.all').and.callFake(function () {
        return {
          then: function (callback) {
            callback(res);
          },
        };
      });
    });
    it('should throw toastr when not authorized', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      accountCreditTransactionFactory.viewEob(1, 2, 100);
      expect(q.all).not.toHaveBeenCalled();
      expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
      expect(patSecurityService.generateMessage).toHaveBeenCalled();
    });
    it('should call tabLauncher', function () {
      accountCreditTransactionFactory.viewEob(1, 2, 100);
      expect(q.all).toHaveBeenCalledWith([
        patientServices.Patients.get({ Id: 100 }).$promise,
        mockClaimsService.getClaimEntityByClaimId({ claimId: 2 }).$promise,
      ]);
      expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
        '#/BusinessCenter/Insurance/ERA/1/Claim/400?carrier=&patient=DOEJO1'
      );
    });
  });

  describe('factory.printReceipt', function () {
    var res;
    beforeEach(function () {
      res = [
        { Value: { PatientCode: 'DOEJO1' } },
        { Value: { Amount: 400, CreditTransactionDetails: {} } },
        { Value: { AccountId: 10 } },
      ];
      q.all = jasmine.createSpy('q.all').and.callFake(function () {
        return {
          then: function (callback) {
            callback(res);
          },
        };
      });
    });
    it('should throw toastr when not authorized', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      var transaction = {
        CreditTransactionId: 30,
        Location: {},
        IsLocationPaymentGatewayEnabled: true,
        Balance: 20,
        Amount: 50,
        TransactionType: 'Account Payment',
        Description: 'test',
        DateEntered: '02/28/19',
        PatientName: 'Styles, Harry',
      };
      var patientData = {
        ResponsiblePersonId: 1,
        PatientId: 2,
        PersonAccount: { AccountId: 10 },
      };
      accountCreditTransactionFactory.printReceipt(transaction, patientData);
      expect(q.all).not.toHaveBeenCalled();
      expect(tabLauncher.launchNewTab).not.toHaveBeenCalled();
      expect(patSecurityService.generateMessage).toHaveBeenCalled();
      expect(
        financialService.calculateAccountAndInsuranceBalances
      ).not.toHaveBeenCalled();
    });
    it('should call tabLauncher and other services to generate receipt', function () {
      var transaction = {
        CreditTransactionId: 30,
        Location: {},
        IsLocationPaymentGatewayEnabled: true,
        Balance: 20,
        Amount: 50,
        TransactionType: 'Account Payment',
        Description: 'test',
        DateEntered: '02/28/19',
        PatientName: 'Styles, Harry',
      };
      var patientData = {
        ResponsiblePersonId: 1,
        PatientId: 2,
        PersonAccount: { AccountId: 10 },
      };
      accountCreditTransactionFactory.printReceipt(transaction, patientData);
      expect(q.all).toHaveBeenCalledWith([
        patientServices.Patients.getWithoutAccount({ Id: 1 }).$promise,
        patientServices.CreditTransactions.getCreditTransactionByIdForAccount({
          accountId: 10,
          creditTransactionId: 30,
        }).$promise,
        patientServices.Account.getAccountMembersDetailByAccountId({
          accountId: 10,
        }).$promise,
      ]);
      expect(tabLauncher.launchNewTab).toHaveBeenCalledWith(
        '#/Patient/30/Account/PrintReceipt/'
      );
      expect(patSecurityService.generateMessage).not.toHaveBeenCalled();
      expect(
        financialService.calculateAccountAndInsuranceBalances
      ).toHaveBeenCalledWith(res[2].Value, 2);
    });
  });
});
