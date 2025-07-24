describe('PatientPrintReceiptController ->', function () {
  var scope, routeParams, ctrl;
  var patientServices, financialService, q, toastrFactory, fakeBalances;
  var mockAccountMembersDetailByAccountIdResult,
    mockPatientResult,
    mockReceipt,
    mockFinancialResponse,
    mockFinancialService;
  mockAccountMembersDetailByAccountIdResult = {
    Value: [{ ResponsiblePersonId: '345678912' }],
  };
  mockPatientResult = {};
  mockFinancialResponse = {};
  var responsiblePersonResult = { Value: { FirstName: 'Bob' } };
  fakeBalances = {
    TotalBalance: 100,
    TotalInsurance: 125,
    TotalAdjustedEstimate: 50,
    TotalPatientPortion: 60,
  };

  beforeEach(
    module('Soar.Patient', function ($provide) {
      mockFinancialService = {
        calculateAccountAndInsuranceBalances: jasmine
          .createSpy('financialService.calculateAccountAndInsuranceBalances')
          .and.callFake(function () {
            return fakeBalances;
          }),
      };
      $provide.value('FinancialService', mockFinancialService);
      patientServices = {
        Patients: {
          get: jasmine.createSpy().and.returnValue({
            $promise: {
              then: (success, failure) => success(responsiblePersonResult),
            },
          }),
        },
        Account: {
          getAccountMembersDetailByAccountId: jasmine
            .createSpy()
            .and.returnValue({
              $promise: {
                then: (success, failure) =>
                  success(mockAccountMembersDetailByAccountIdResult),
              },
            }),
        },
      };
      $provide.value('PatientServices', patientServices);

      toastrFactory = {};
      toastrFactory.error = jasmine.createSpy();
      toastrFactory.success = jasmine.createSpy();
      $provide.value('toastrFactory', toastrFactory);
      mockReceipt = { AccountId: '234567891' };
    })
  );

  beforeEach(inject(function ($rootScope, $controller) {
    scope = $rootScope.$new();
    localStorage.setItem(
      'acctPaymentReceipt_' + '123456789',
      JSON.stringify(mockReceipt)
    );
    routeParams = { creditTransactionId: '123456789' };

    ctrl = $controller('PatientPrintReceiptController', {
      $scope: scope,
      $routeParams: routeParams,
      FinancialService: mockFinancialService,
    });
  }));

  describe('ctrl.onInit -> ', function () {
    beforeEach(function () {
      spyOn(ctrl, 'getResponsiblePerson').and.callFake(function () {});
    });

    it('should call patientServices.Account.getAccountMembersDetailByAccountId', function () {
      ctrl.$onInit();
      expect(
        patientServices.Account.getAccountMembersDetailByAccountId
      ).toHaveBeenCalledWith({ accountId: mockReceipt.AccountId });
    });

    it('should call FinancialService.calculateAccountAndInsuranceBalances with res.Value and AccountId', function (done) {
      ctrl.$onInit();
      done();
      expect(
        mockFinancialService.calculateAccountAndInsuranceBalances
      ).toHaveBeenCalledWith(
        mockAccountMembersDetailByAccountIdResult.Value,
        ctrl.accountInfo.AccountId
      );
    });

    it('should call ctrl.getResponsiblePerson with res.Value and AccountId', function (done) {
      ctrl.$onInit();
      done();
      expect(ctrl.getResponsiblePerson).toHaveBeenCalled();
    });
  });

  describe(' ctrl.getResponsiblePerson -> ', function () {
    beforeEach(function () {
      ctrl.accountMembersDetailByAccount = [
        { ResponsiblePersonId: '345678912' },
      ];
    });

    it('should call patientServices.Account.getAccountMembersDetailByAccountId', function () {
      ctrl.getResponsiblePerson();
      expect(patientServices.Patients.get).toHaveBeenCalledWith({
        Id: ctrl.accountMembersDetailByAccount[0].ResponsiblePersonId,
      });
    });

    it('should set scope.receiptDto.ResponsiblePerson on success', function (done) {
      ctrl.getResponsiblePerson();
      done();
      expect(scope.receiptDto.ResponsiblePerson).toEqual(
        responsiblePersonResult.Value
      );
    });

    it('should throw toastr if not successful', function (done) {
      patientServices.Patients.get = jasmine.createSpy().and.returnValue({
        $promise: { then: (success, failure) => failure() },
      });
      ctrl.getResponsiblePerson();
      done();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
  });
});
