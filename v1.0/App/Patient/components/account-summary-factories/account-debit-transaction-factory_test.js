describe('account-debit-transaction-factory->', function () {
  var accountDebitTransactionFactory,
    q,
    modalFactory,
    toastrFactory,
    patSecurityService,
    patientServices,
    deleteSuccess,
    transactionCrudModalOptions,
    adjustmentTypesService,
    referenceDataService,
    timeZoneFactory;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientServices = {
        AccountSummary: {
          getTransactionHistoryDebitDeleteInfo: jasmine
            .createSpy(
              'patientServices.AccountSummary.getTransactionHistoryDebitDeleteInfo'
            )
            .and.returnValue({ $promise: {} }),
        },
        DebitTransaction: {
          markDeleted: jasmine
            .createSpy('patientServices.DebitTransaction.markDeleted')
            .and.returnValue({
              $promise: {
                then: function (callback, failureCallback) {
                  if (deleteSuccess) callback();
                  else failureCallback();
                },
              },
            }),
          getDebitTransactionById: jasmine
            .createSpy(
              'patientServices.DebitTransaction.getDebitTransactionById'
            )
            .and.returnValue({
              $promise: {},
            }),
        },
        Patients: {
          get: jasmine
            .createSpy('patientServices.Patients.get')
            .and.returnValue({ $promise: {} }),
        },
      };
      $provide.value('PatientServices', patientServices);
    })
  );

  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      modalFactory = {
        ConfirmModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.returnValue({
            then: function (callback) {
              callback();
            },
          }),
        Modal: jasmine
          .createSpy('modalFactory.Modal')
          .and.callFake(function (options) {
            transactionCrudModalOptions = options;
            return {
              result: {
                then: function (callback) {
                  callback({ recreate: true });
                },
              },
            };
          }),
      };
      $provide.value('ModalFactory', modalFactory);

      toastrFactory = {
        error: jasmine.createSpy('toastrFactory.error'),
        success: jasmine.createSpy('toastrFactory.success'),
      };
      $provide.value('toastrFactory', toastrFactory);

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

      var localize = {
        getLocalizedString: jasmine
          .createSpy('localize.getLocalizedString')
          .and.callFake(function (text, params) {
            if (params) {
              for (var i = 0; i < params.length; i++) {
                text = text.replace('{' + i + '}', params[i]);
              }
            }
            return text;
          }),
      };
      $provide.value('localize', localize);

      adjustmentTypesService = {
        get: jasmine.createSpy('adjustmentTypesService.get').and.returnValue({
            then: jasmine.createSpy().and.returnValue({
              Value: [{ AdjustmentTypeId: 1 }],
            })
        }),
      };
      $provide.value('NewAdjustmentTypesService', adjustmentTypesService);

      referenceDataService = {
        getData: jasmine.createSpy('referenceDataService.getData'),
        entityNames: { users: 'users', locations: 'locations' },
      };
      $provide.value('referenceDataService', referenceDataService);

      timeZoneFactory = {
        ConvertDateToMomentTZ: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateToMomentTZ')
          .and.callFake(function (date) {
            return moment(date);
          }),
        ConvertDateTZString: jasmine
          .createSpy('mockTimeZoneFactory.ConvertDateTZString')
          .and.callFake(function (date) {
            return date;
          }),
      };
      $provide.value('TimeZoneFactory', timeZoneFactory);
    })
  );

  beforeEach(inject(function ($injector) {
    accountDebitTransactionFactory = $injector.get(
      'AccountDebitTransactionFactory'
    );
    q = $injector.get('$q');
  }));

  describe('factory initialization', function () {
    it('should have defined methods', function () {
      expect(accountDebitTransactionFactory.deleteDebit).toBeDefined();
    });
  });

  describe('factory.viewOrEditDebit -> ', function () {
    var debitTransactionId = 1;
    var personId = 2;
    var isEdit;
    var success = jasmine.createSpy('success');
    var enteredByUserId = 3;
    var debitLocationId = 5;
    var res;
    beforeEach(function () {
      isEdit = false;
      res = [
        {
          Value: {
            EnteredByUserId: enteredByUserId,
            LocationId: debitLocationId,
            DateEntered: '',
          },
        },
        { Value: [] },
        { Value: { FirstName: 'Bob', LastName: 'Smith' } },
        [
          {
            UserId: enteredByUserId,
            FirstName: 'Adam',
            MiddleName: null,
            LastName: 'Adams',
            PreferredName: null,
          },
        ],
        [
          {
            LocationId: debitLocationId,
            Timezone: 'Central Standard Time',
            NameLine1: 'South Branch',
          },
        ],
      ];
      q.all = jasmine.createSpy().and.returnValue({
        then: function (callback) {
          callback(res);
        },
      });
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(true);
    });
    it('should throw error when not authorized to view', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('should throw error when not authorized to edit', function () {
      isEdit = true;
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('should call modalFactory.Modal for view when isEdit is false and authorized for view', function () {
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
      expect(
        transactionCrudModalOptions.resolve.DataForModal().EditMode
      ).toEqual(false);
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Patient.FirstName
      ).toEqual('Bob');
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .EnteredByName
      ).toEqual('Adam Adams');
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .LocationNameLine1
      ).toEqual('South Branch');
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .PatientDetailedName
      ).toEqual('Bob Smith');
    });
    it('should call modalFactory.Modal for edit when isEdit is true and authorized for edit', function () {
      isEdit = true;
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
      expect(
        transactionCrudModalOptions.resolve.DataForModal().EditMode
      ).toEqual(true);
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Patient.FirstName
      ).toEqual('Bob');
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .EnteredByName
      ).toEqual('Adam Adams');
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .LocationNameLine1
      ).toEqual('South Branch');
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .PatientDetailedName
      ).toEqual('Bob Smith');
    });
    it('should display success toastr when update is successful', function () {
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(success).toHaveBeenCalled();
      expect(toastrFactory.success).toHaveBeenCalledWith(
        'Positive Adjustment updated successfully',
        'Success'
      );
    });
    it('should format DateEntered for UTC when DateEntered is not formatted for UTC', function () {
      isEdit = true;
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .DateEntered
      ).toEqual('Z');
    });
    it('should not format DateEntered for UTC when DateEntered is formatted for UTC', function () {
      res[0].Value.DateEntered = '2019-07-18T20:46:30Z';
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
      expect(
        transactionCrudModalOptions.resolve.DataForModal().Transaction
          .DateEntered
      ).toEqual('2019-07-18T20:46:30Z');
    });
    it('should call adjustmentTypesService.get with active=false', function () {
      accountDebitTransactionFactory.viewOrEditDebit(
        debitTransactionId,
        personId,
        isEdit,
        success
      );
      expect(modalFactory.Modal).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
      expect(adjustmentTypesService.get).toHaveBeenCalledWith({
        active: false,
      });
    });
  });

  describe('factory.deleteDebit ->', function () {
    var res;
    var debitTransactionId = 1;
    var debitDescription = 'Random Charge';
    var success = jasmine.createSpy('success');
    beforeEach(function () {
      res = { Value: {} };
      patientServices.AccountSummary.getTransactionHistoryDebitDeleteInfo = jasmine
        .createSpy(
          'patientServices.AccountSummary.getTransactionHistoryDebitDeleteInfo'
        )
        .and.returnValue({
          $promise: {
            then: function (callback) {
              callback(res);
            },
          },
        });
      deleteSuccess = true;
    });
    it('should throw toastr when not authorized', function () {
      patSecurityService.IsAuthorizedByAbbreviation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      accountDebitTransactionFactory.deleteDebit(
        debitTransactionId,
        5,
        success
      );
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('should throw toastr when delete fails', function () {
      deleteSuccess = false;
      res.Value.DebitDescription = debitDescription;
      accountDebitTransactionFactory.deleteDebit(
        debitTransactionId,
        5,
        success
      );
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('should throw confirm message when positive adjustment is associated with payment', function () {
      res.Value.IsPaymentApplied = true;
      res.Value.DebitDescription = debitDescription;
      accountDebitTransactionFactory.deleteDebit(
        debitTransactionId,
        5,
        success
      );
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Delete Positive Adjustment',
        'This positive adjustment has a payment or negative adjustment applied to it. Deleting it will result in an unapplied amount.\r\n\r\nAre you sure you want to delete this ' +
          debitDescription +
          ' positive adjustment?',
        'Yes',
        'No'
      );
      expect(success).toHaveBeenCalled();
    });
    it('should show confirm message when positive adjustment is not associated with a payment', function () {
      res.Value.DebitDescription = debitDescription;
      accountDebitTransactionFactory.deleteDebit(
        debitTransactionId,
        5,
        success
      );
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Delete Positive Adjustment',
        'Are you sure you want to delete this ' +
          debitDescription +
          ' positive adjustment?',
        'Yes',
        'No'
      );
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should show confirm message when positive adjustment is Vendor Payment Refund', function () {
      res.Value.DebitDescription = 'Vendor Payment Refund';
      accountDebitTransactionFactory.deleteDebit(
        debitTransactionId,
        5,
        success
      );
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Delete Positive Adjustment',
        'Are you sure you want to delete this Vendor Payment Refund' +
        ' positive adjustment?\r\n\r\nThis account payment refund originated from a third party. Deleting this payment refund in Fuse will not reverse the refund that was issued by the vendor to the patient.',
        'Yes',
        'No'
      );
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should throw confirm message when finance charge is associated with payment', function () {
      res.Value.IsPaymentApplied = true;
      res.Value.DebitDescription = 'Finance Charge';
      accountDebitTransactionFactory.deleteDebit(
        debitTransactionId,
        6,
        success
      );
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Delete Finance Charge',
        'This Finance Charge has a payment or negative adjustment applied to it. Deleting it will result in an unapplied amount.\r\n\r\nAre you sure you want to delete this Finance Charge?',
        'Yes',
        'No'
      );
      expect(success).toHaveBeenCalled();
    });
    it('should show confirm message when finance charge is not associated with a payment', function () {
      res.Value.DebitDescription = 'Finance Charge';
      accountDebitTransactionFactory.deleteDebit(
        debitTransactionId,
        6,
        success
      );
      expect(modalFactory.ConfirmModal).toHaveBeenCalledWith(
        'Delete Finance Charge',
        'Are you sure you want to delete this Finance Charge?',
        'Yes',
        'No'
      );
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
  });
});
