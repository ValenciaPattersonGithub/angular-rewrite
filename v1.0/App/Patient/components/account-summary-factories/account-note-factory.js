'use strict';

angular.module('Soar.Patient').factory('AccountNoteFactory', [
  '$q',
  '$filter',
  'ModalFactory',
  'PatientServices',
  'referenceDataService',
  'TimeZoneFactory',
  '$uibModal',
  'toastrFactory',
  'localize',
  'tabLauncher',
  '$sce',
  'RealTimeEligibilityFactory',
  'patSecurityService',
  'locationService',
  function (
    $q,
    $filter,
    modalFactory,
    patientServices,
    referenceDataService,
    timeZoneFactory,
    $uibModal,
    toastrFactory,
    localize,
    tabLauncher,
    $sce,
    realTimeEligibilityFactory,
    patSecurityService,
    locationService
  ) {
    var factory = this;
    var soarAuthNoteViewKey = 'soar-per-acnote-view';
    var soarAuthNoteAddKey = 'soar-per-acnote-add';
    var soarAuthNoteEditKey = 'soar-per-acnote-edit';
    var soarAuthNoteDeleteKey = 'soar-per-acnote-delete';
    var soarAuthClaimViewKey = 'soar-ins-iclaim-view';
    var soarAuthAcctAstmtView = 'soar-acct-astmt-view';
    var soarAuthEraViewKey = 'soar-acct-aipmt-view';
    var soarAuthRteViewKey = 'soar-ins-rte-view';

    factory.openClaimNoteModal = function (
      claim,
      personId,
      locationId,
      refresh
    ) {
      modalFactory
        .Modal({
          templateUrl:
            'App/BusinessCenter/insurance/claims/claims-management/claim-notes-modal/claim-notes-modal.html',
          backdrop: 'static',
          keyboard: false,
          size: 'lg',
          windowClass: 'warning-modal-center',
          controller: 'ClaimNotesModalController',
          amfa: soarAuthClaimViewKey,
          resolve: {
            claimSubmissionResultsDto: function () {
              claim.PatientId = personId;
              claim.LocationId = locationId;
              claim.StatusName = $filter('statusDefinition')(claim.Status);
              return claim;
            },
          },
        })
        .result.then(refresh);
    };

    factory.getAccountNote = function (noteId) {
      if (!patSecurityService.IsAuthorizedByAbbreviation(soarAuthNoteViewKey)) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthNoteViewKey),
          'Not Authorized'
        );
        return;
      }
      var defer = $q.defer();
      var promise = defer.promise;
      patientServices.AccountNote.getByAccountNoteId(
        { personAccountNoteId: noteId },
        function (res) {
          promise = $.extend(promise, {
            values: res.Value,
          });
          defer.resolve(res);
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('An error has occurred while {0}', [
              'loading account note',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
      return promise;
    };

    factory.createAccountNote = function (accountNote, refresh) {
      if (!patSecurityService.IsAuthorizedByAbbreviation(soarAuthNoteAddKey)) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthNoteAddKey),
          'Not Authorized'
        );
        return;
      }
      patientServices.AccountNote.create(accountNote).$promise.then(
        function () {
          refresh();
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('An error has occurred while {0}', [
              'saving account note',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };

    factory.editAccountNote = function (accountNote, refresh) {
      if (!patSecurityService.IsAuthorizedByAbbreviation(soarAuthNoteEditKey)) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthNoteEditKey),
          'Not Authorized'
        );
        return;
      }
      patientServices.AccountNote.update(accountNote).$promise.then(
        function () {
          refresh();
        },
        function () {
          toastrFactory.error(
            localize.getLocalizedString('An error has occurred while {0}', [
              'saving account note',
            ]),
            localize.getLocalizedString('Server Error')
          );
        }
      );
    };

    factory.deleteAccountNote = function (noteType, objectId, refresh) {
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthNoteDeleteKey)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthNoteDeleteKey),
          'Not Authorized'
        );
        return;
      }
      if (noteType === 2) {
        return;
      }

      var message = localize.getLocalizedString(
        'Are you sure you want to delete this Account Note?'
      );
      var title = localize.getLocalizedString('Delete Account Note');
      var button2Text = localize.getLocalizedString('No');
      var button1Text = localize.getLocalizedString('Yes');
      modalFactory
        .ConfirmModal(title, message, button1Text, button2Text)
        .then(function () {
          patientServices.AccountNote.deleteAccountNote(
            { personAccountNoteId: objectId },
            function () {
              toastrFactory.success(
                localize.getLocalizedString('Deleted {0}.', ['successful']),
                localize.getLocalizedString('Success')
              );
              refresh();
              return;
            },
            function () {
              toastrFactory.error(
                localize.getLocalizedString('An error has occurred while {0}', [
                  'deleting account note',
                ]),
                localize.getLocalizedString('Server Error')
              );
              return;
            }
          );
        });
    };

    factory.viewEob = function (eraId, noteId, personId) {
      if (!patSecurityService.IsAuthorizedByAbbreviation(soarAuthEraViewKey)) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthEraViewKey),
          'Not Authorized'
        );
        return;
      }
      var promises = [
        patientServices.Patients.get({ Id: personId }).$promise,
        patientServices.AccountNote.getEraClaimByAccountNoteId({
          personAccountNoteId: noteId,
        }).$promise,
      ];
      $q.all(promises).then(function (res) {
        var url =
          '#/BusinessCenter/Insurance/ERA/' +
          eraId +
          '/Claim/' +
          res[1].Value.ClaimCommonId +
          '?carrier=' +
          '' +
          '&patient=' +
          res[0].Value.PatientCode;

        tabLauncher.launchNewTab(url);
      });
    };

    factory.viewStatement = function (accountStatementId) {
      if (
        !patSecurityService.IsAuthorizedByAbbreviation(soarAuthAcctAstmtView)
      ) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthAcctAstmtView),
          'Not Authorized'
        );
        return;
      }
      patientServices.AccountStatementSettings.GetAccountStatementPdf(
        '_soarapi_/accounts/accountstatement/' +
          accountStatementId +
          '/GetAccountStatementPdf'
      ).then(
        function (res) {
          var file = new Blob([res.data], {
            type: 'application/pdf',
          });
          if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(
              file,
              accountStatementId + '.pdf'
            );
          } else {
            var fileUrl = URL.createObjectURL(file);
            var pdfContent = $sce.trustAsResourceUrl(fileUrl);
          }
          window.open(pdfContent.toString());
        },
        function (error) {
          if (error) {
            toastrFactory.error(
              localize.getLocalizedString(
                error.status === 400
                  ? 'Pdf template form is not available for generating PDF form'
                  : error.data.InvalidProperties[0].ValidationMessage
              ),
              localize.getLocalizedString('Error')
            );
          }
        }
      );
    };

    factory.viewRte = function (noteId) {
      if (!patSecurityService.IsAuthorizedByAbbreviation(soarAuthRteViewKey)) {
        toastrFactory.error(
          patSecurityService.generateMessage(soarAuthRteViewKey),
          'Not Authorized'
        );
        return;
      }
      factory.getAccountNote(noteId).then(function (res) {
        patientServices.Patients.get({ Id: res.Value.PersonId }).$promise.then(
          function (patient) {
            var enterpriseId = locationService.getCurrentLocationEnterpriseId();
            realTimeEligibilityFactory.getRTE(
              enterpriseId,
              res.Value.PersonId,
              res.Value.RealTimeEligibilityId,
              patient.Value.PatientCode
            );
          }
        );
      });
    };

    return {
      openClaimNoteModal: factory.openClaimNoteModal,
      getAccountNote: factory.getAccountNote,
      createAccountNote: factory.createAccountNote,
      editAccountNote: factory.editAccountNote,
      deleteAccountNote: factory.deleteAccountNote,
      viewEob: factory.viewEob,
      viewStatement: factory.viewStatement,
      viewRte: factory.viewRte,
    };
  },
]);
