describe('patient-summary-refactor-controller->', function () {
  var accountSummaryDeleteFactory,
    patientValidationFactory,
    modalFactory,
    toastrFactory,
    patSecurityService,
    closeClaimService,
    patientServices;
  var deleteSuccess = true;
  beforeEach(
    module('Soar.Patient', function ($provide) {
      patientValidationFactory = {
        userLocationAuthorization: jasmine
          .createSpy('patientValidationFactory.userLocationAuthorization')
          .and.returnValue({
            then: function (callback) {
              callback({
                authorization: {
                  UserIsAuthorizedToAtLeastOnePatientLocation: true,
                },
              });
            },
          }),
        LaunchUserLocationErrorModal: jasmine.createSpy(
          'patientValidationFactory.userLocationAuthorization'
        ),
      };
      $provide.value('PatientValidationFactory', patientValidationFactory);
      patientServices = {
        Claim: {
          recreateMultipleClaims: jasmine
            .createSpy('patientServices.Claim.recrateMultipleClaims')
            .and.callFake(function (input, success) {
              success();
            }),
        },
        ServiceTransactions: {
          markDeleted: jasmine
            .createSpy('patientServices.ServiceTransactions.markDeleted')
            .and.returnValue({
              $promise: {
                then: function (callback) {
                  callback();
                },
              },
            }),
        },
        Encounter: {
          deleteEncounter: jasmine.createSpy(
            'patientServices.Encounter.deleteEncounter'
          ),
        },
      };
      $provide.value('PatientServices', patientServices);
    })
  );
  beforeEach(
    module('Soar.BusinessCenter', function ($provide) {
      modalFactory = {
        Modal: jasmine.createSpy('modalFactory.Modal').and.returnValue({
          result: {
            then: function (callback) {
              callback({ recreate: true });
            },
          },
        }),
        ConfirmCancelModal: jasmine
          .createSpy('modalFactory.ConfirmCancelModal')
          .and.returnValue({
            then: function (callback) {
              callback();
            },
          }),
        LoadingModal: jasmine
          .createSpy('modalFactory.ConfirmModal')
          .and.callFake(function (callback) {
            var param = callback();
            var call = deleteSuccess ? param[0].OnSuccess : param[0].OnError;
            call();
          }),
      };
      $provide.value('ModalFactory', modalFactory);

      toastrFactory = {
        success: jasmine.createSpy('toastrFactory.success'),
        error: jasmine.createSpy('toastrFactory.error'),
      };
      $provide.value('toastrFactory', toastrFactory);

      patSecurityService = {
        IsAuthorizedByAbbreviationAtLocation: jasmine
          .createSpy('patSecurityService.IsAuthorizedByAbbreviationAtLocation')
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

      closeClaimService = {
        updateMultiple: jasmine
          .createSpy('closeClaimService.updateMultiple')
          .and.callFake(function (input, success) {
            success();
          }),
      };
      $provide.value('CloseClaimService', closeClaimService);
    })
  );

  beforeEach(inject(function ($injector) {
    accountSummaryDeleteFactory = $injector.get('AccountSummaryDeleteFactory');
  }));

  describe('initial values -> ', function () {
    it('factory should exist and have methods available', function () {
      expect(accountSummaryDeleteFactory).not.toBe(undefined);
      expect(
        accountSummaryDeleteFactory.deleteAccountSummaryRowDetail
      ).not.toBe(undefined);
    });
  });

  describe('deleteAccountSummaryRowDetail - encounter delete ->', function () {
    var row;
    var success;
    var locationId;
    beforeEach(function () {
      row = {
        ObjectType: 'EncounterBo',
        patientName: 'John Doe',
        Type: 'Debit Transaction',
        EncounterServiceLocationIds: [1],
      };
      success = jasmine.createSpy('success');
      deleteSuccess = true;
      locationId = 1;
    });
    it('should throw toastr when not authorized', function () {
      patSecurityService.IsAuthorizedByAbbreviationAtLocation = jasmine
        .createSpy('patSecurityService.IsAuthorizedByAbbreviation')
        .and.returnValue(false);
      accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
        row,
        null,
        success,
        locationId
      );
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('should throw toastr when delete fails', function () {
      deleteSuccess = false;
      accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
        row,
        null,
        success,
        locationId
      );
      expect(success).not.toHaveBeenCalled();
      expect(toastrFactory.error).toHaveBeenCalled();
    });
    it('should show confirm message and delete from service location on single location encounter', function () {
      accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
        row,
        null,
        success,
        locationId
      );
      expect(modalFactory.ConfirmCancelModal).toHaveBeenCalledWith(
        'Keep Proposed Services?',
        "Do you wish to keep the pending services from this encounter? If you choose to keep the services, they will return to 'Proposed' in the chart ledger and clinical timeline.",
        null,
        'Cancel',
        'No',
        'Yes',
        'keepProposedServices'
      );
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should show confirm message and delete from service location on multi location encounter', function () {
      row.EncounterServiceLocationIds = [1, 3];
      accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
        row,
        null,
        success,
        locationId
      );
      expect(modalFactory.ConfirmCancelModal).toHaveBeenCalledWith(
        'Keep Proposed Services?',
        "Do you wish to keep the pending services from this encounter? If you choose to keep the services, they will return to 'Proposed' in the chart ledger and clinical timeline.",
        null,
        'Cancel',
        'No',
        'Yes',
        'keepProposedServices'
      );
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should show confirm message and delete from location different from service location on single location encounter', function () {
      row.EncounterServiceLocationIds = [2];
      accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
        row,
        null,
        success,
        locationId
      );
      expect(modalFactory.ConfirmCancelModal).toHaveBeenCalledWith(
        'Keep Proposed Services?',
        "You are logged into a different location than is assigned to the pending encounter. Do you wish to keep the pending services from this encounter? If you choose to keep the services, they will return to 'Proposed' in the chart ledger and clinical timeline, and will remain associated with their current location.",
        null,
        'Cancel',
        'No',
        'Yes',
        'keepProposedServices'
      );
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
    it('should show confirm message and delete from location different from service location on multi location encounter', function () {
      row.EncounterServiceLocationIds = [2, 3];
      accountSummaryDeleteFactory.deleteAccountSummaryRowDetail(
        row,
        null,
        success,
        locationId
      );
      expect(modalFactory.ConfirmCancelModal).toHaveBeenCalledWith(
        'Keep Proposed Services?',
        "You are logged into a different location than is assigned to the pending encounter. Do you wish to keep the pending services from this encounter? If you choose to keep the services, they will return to 'Proposed' in the chart ledger and clinical timeline, and will remain associated with their current location.",
        null,
        'Cancel',
        'No',
        'Yes',
        'keepProposedServices'
      );
      expect(toastrFactory.success).toHaveBeenCalled();
      expect(success).toHaveBeenCalled();
    });
  });
});
